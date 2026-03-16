/**
 * Mermaid 다이어그램 포함 Markdown → PDF 변환 v5
 * - 강제 페이지 넘김 제거 → 자연 흐름
 * - 페이지 공백 분석 → 다이어그램 자동 축소
 * - 2-pass 렌더링: 1차 레이아웃 분석 → 2차 최적화 후 PDF 출력
 */

const fs = require('fs');
const path = require('path');

const mdToPdfModules = path.join(
  process.env.APPDATA || '', 'npm', 'node_modules', 'md-to-pdf', 'node_modules'
);
const { marked } = require(path.join(mdToPdfModules, 'marked'));
const puppeteer = require(path.join(mdToPdfModules, 'puppeteer'));

// 명령줄 인자: node generate-pdf.js INPUT.md OUTPUT.pdf
const args = process.argv.slice(2);
const INPUT_FILE = args[0] ? path.join(__dirname, args[0]) : path.join(__dirname, '11_특허_연계_개발_자료_PDF.md');
const OUTPUT_FILE = args[1] ? path.join(__dirname, args[1]) : path.join(__dirname, '11_특허_연계_개발_자료_v4.pdf');
const MERMAID_JS = path.join(__dirname, 'mermaid.min.js');

// A4 with 10mm top/bottom margins: 297 - 20 = 277mm ≈ 1047px at 96dpi
const PAGE_HEIGHT_PX = 1047;
const MAX_DIAGRAM_PX = 850; // 다이어그램 최대 높이 (페이지의 ~81%)
const WHITESPACE_THRESHOLD = 0.25; // 25% 이상 공백이면 조정 대상

async function main() {
  console.log('[1/7] Markdown 읽기...');
  let md = fs.readFileSync(INPUT_FILE, 'utf8').replace(/^---[\s\S]*?---\n*/m, '');

  console.log('[2/7] HTML 변환...');
  const htmlBody = marked.parse(md);

  let idx = 0;
  const htmlMermaid = htmlBody.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => {
      const d = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      idx++;
      return `<div class="dw" id="dw-${idx}"><pre class="mermaid" data-i="${idx}">${d}</pre></div>`;
    }
  );
  console.log(`    다이어그램 ${idx}개`);

  console.log('[3/7] HTML 생성...');
  const html = buildHtml(htmlMermaid);

  console.log('[4/7] Puppeteer 시작...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('[5/7] Mermaid 렌더링...');
  await page.addScriptTag({ path: MERMAID_JS });
  await page.evaluate(() => {
    window.mermaid.initialize({
      startOnLoad: false, theme: 'default',
      themeVariables: { fontSize: '10px', fontFamily: 'Malgun Gothic, sans-serif' },
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis', padding: 6, nodeSpacing: 25, rankSpacing: 25 },
      securityLevel: 'loose'
    });
  });
  await page.evaluate(async () => { await window.mermaid.run({ querySelector: 'pre.mermaid' }); });

  try {
    await page.waitForFunction(() => {
      const d = document.querySelectorAll('pre.mermaid');
      return d.length > 0 && Array.from(d).every(e => e.querySelector('svg'));
    }, { timeout: 30000 });
    console.log('    렌더링 완료');
  } catch { console.warn('    렌더링 부분 완료'); }

  await sleep(2000);

  // Pass 1: 기본 축소 (MAX_DIAGRAM_PX 초과 다이어그램)
  console.log('[6/7] 다이어그램 최적화...');
  const initialScale = await page.evaluate((maxH) => {
    const res = [];
    document.querySelectorAll('.dw').forEach((w, i) => {
      const svg = w.querySelector('svg');
      if (!svg) return;
      const h = svg.getBoundingClientRect().height;
      if (h > maxH) {
        svg.removeAttribute('width'); svg.removeAttribute('height');
        svg.style.maxHeight = maxH + 'px';
        svg.style.maxWidth = '100%';
        svg.style.width = 'auto'; svg.style.height = 'auto';
        res.push({ i: i + 1, from: Math.round(h), to: maxH });
      } else {
        res.push({ i: i + 1, h: Math.round(h) });
      }
    });
    return res;
  }, MAX_DIAGRAM_PX);

  initialScale.forEach(r => {
    if (r.from) console.log(`    #${r.i}: ${r.from}→${r.to}px`);
    else console.log(`    #${r.i}: ${r.h}px`);
  });

  await sleep(1000);

  // Pass 2: 페이지별 공백 분석 및 최적화
  const pageAnalysis = await page.evaluate((pageH, threshold) => {
    // 모든 diagram-wrap의 위치 수집
    const wraps = Array.from(document.querySelectorAll('.dw'));
    const elements = wraps.map((w, i) => {
      const rect = w.getBoundingClientRect();
      const svg = w.querySelector('svg');
      const svgH = svg ? svg.getBoundingClientRect().height : 0;
      return {
        id: i + 1,
        top: rect.top,
        height: rect.height,
        svgHeight: Math.round(svgH),
        page: Math.floor(rect.top / pageH) + 1,
        posInPage: rect.top % pageH,
        spaceLeft: pageH - (rect.top % pageH)
      };
    });

    // body 전체 높이로 총 페이지 수 계산
    const totalHeight = document.body.scrollHeight;
    const totalPages = Math.ceil(totalHeight / pageH);

    // 각 페이지의 마지막 콘텐츠 위치 파악 (공백 분석)
    const allBlocks = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,table,.dw,blockquote,ul,ol,hr'));
    const pageInfo = [];
    for (let p = 0; p < totalPages; p++) {
      const pageStart = p * pageH;
      const pageEnd = (p + 1) * pageH;
      let lastBottom = pageStart;

      allBlocks.forEach(el => {
        const r = el.getBoundingClientRect();
        const elBottom = r.top + r.height;
        if (r.top >= pageStart && r.top < pageEnd) {
          if (elBottom > lastBottom) lastBottom = Math.min(elBottom, pageEnd);
        }
      });

      const usedHeight = lastBottom - pageStart;
      const whitespace = pageH - usedHeight;
      const ratio = whitespace / pageH;

      pageInfo.push({
        page: p + 1,
        used: Math.round(usedHeight),
        whitespace: Math.round(whitespace),
        ratio: ratio.toFixed(2)
      });
    }

    // 공백이 큰 페이지 후 다이어그램이 오는 경우 찾기
    const adjustments = [];
    for (let p = 0; p < pageInfo.length; p++) {
      if (parseFloat(pageInfo[p].ratio) > threshold) {
        // 이 페이지 다음에 오는 다이어그램 찾기
        const nextPageStart = (p + 1) * pageH;
        const diagram = elements.find(e =>
          e.top >= nextPageStart && e.top < nextPageStart + pageH
        );
        if (diagram) {
          const availSpace = pageInfo[p].whitespace;
          if (diagram.svgHeight > 0 && availSpace > 150) {
            // 이전 페이지 남은 공간에 맞게 축소
            adjustments.push({
              diagramId: diagram.id,
              currentH: diagram.svgHeight,
              targetH: Math.min(availSpace - 40, diagram.svgHeight), // 40px 여유
              page: p + 1,
              whitespace: pageInfo[p].whitespace
            });
          }
        }
      }
    }

    return { totalPages, pageInfo, elements, adjustments };
  }, PAGE_HEIGHT_PX, WHITESPACE_THRESHOLD);

  console.log(`\n    총 ${pageAnalysis.totalPages} 페이지`);
  console.log('    페이지별 공백:');
  pageAnalysis.pageInfo.forEach(p => {
    const bar = p.ratio > WHITESPACE_THRESHOLD ? ' ← 조정 대상' : '';
    console.log(`      P${String(p.page).padStart(2)}: 사용 ${p.used}px, 공백 ${p.whitespace}px (${(p.ratio * 100).toFixed(0)}%)${bar}`);
  });

  // 조정 적용
  if (pageAnalysis.adjustments.length > 0) {
    console.log('\n    공백 최적화 조정:');
    for (const adj of pageAnalysis.adjustments) {
      console.log(`      P${adj.page} 공백 ${adj.whitespace}px → 다이어그램 #${adj.diagramId} (${adj.currentH}px → ${adj.targetH}px)`);
    }

    await page.evaluate((adjustments) => {
      adjustments.forEach(adj => {
        const wrap = document.getElementById('dw-' + adj.diagramId);
        if (!wrap) return;
        const svg = wrap.querySelector('svg');
        if (!svg) return;

        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.maxHeight = adj.targetH + 'px';
        svg.style.maxWidth = '100%';
        svg.style.width = 'auto';
        svg.style.height = 'auto';
      });
    }, pageAnalysis.adjustments);

    await sleep(1000);

    // 조정 후 재분석
    const postCheck = await page.evaluate((pageH) => {
      const totalHeight = document.body.scrollHeight;
      const totalPages = Math.ceil(totalHeight / pageH);
      return totalPages;
    }, PAGE_HEIGHT_PX);

    console.log(`    조정 후: ${postCheck} 페이지 (${pageAnalysis.totalPages - postCheck}페이지 감소)`);
  } else {
    console.log('\n    추가 조정 불필요');
  }

  console.log('\n[7/7] PDF 생성...');
  await page.pdf({
    path: OUTPUT_FILE,
    format: 'A4',
    margin: { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
    printBackground: true,
    preferCSSPageSize: false
  });

  await browser.close();

  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`완료! → ${OUTPUT_FILE}`);
  console.log(`크기: ${(stats.size / 1024).toFixed(1)} KB`);
}

function buildHtml(body) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>11. 특허 연계 개발 자료</title>
<style>
* { box-sizing: border-box; }

body {
  font-family: 'Malgun Gothic', 'Segoe UI', sans-serif;
  font-size: 10.5px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  padding: 10px;
}

h1 { font-size: 18px; border-bottom: 2px solid #2c3e50; padding-bottom: 6px; margin: 12px 0 6px 0; }
h2 { font-size: 14px; border-bottom: 2px solid #3498db; padding-bottom: 4px; margin: 14px 0 5px 0; color: #2c3e50; }
h3 { font-size: 12px; color: #34495e; margin: 8px 0 3px 0; }
h4 { font-size: 10.5px; color: #555; margin: 6px 0 2px 0; }

blockquote { border-left: 3px solid #e74c3c; background: #fdf2f2; padding: 5px 10px; margin: 5px 0; font-size: 9px; }

table { border-collapse: collapse; width: 100%; margin: 5px 0; font-size: 9px; page-break-inside: avoid; }
th, td { border: 1px solid #ddd; padding: 3px 5px; text-align: left; }
th { background: #2c3e50; color: white; font-weight: 500; }
tr:nth-child(even) { background: #f8f9fa; }

code { background: #f4f4f4; padding: 0px 2px; border-radius: 2px; font-size: 8.5px; }
pre:not(.mermaid) { background: #f8f9fa; padding: 5px; border-radius: 3px; font-size: 8.5px; page-break-inside: avoid; }

hr { border: none; border-top: 1px solid #ddd; margin: 8px 0; }

/* 다이어그램 */
.dw {
  page-break-inside: avoid;
  margin: 3px 0;
}
pre.mermaid {
  text-align: center;
  margin: 0 auto;
  padding: 5px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0;
  width: 100%;
}
pre.mermaid svg { max-width: 100% !important; height: auto !important; }

ul, ol { padding-left: 16px; margin: 3px 0; }
li { margin: 1px 0; font-size: 10px; }
strong { color: #2c3e50; }
li input[type="checkbox"] { margin-right: 3px; }

/* 페이지 넘김: 제목이 다음 내용과 분리되지 않도록 */
h2, h3, h4 { page-break-after: avoid; }
</style>
</head>
<body>${body}</body>
</html>`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => { console.error('오류:', err.message); process.exit(1); });
