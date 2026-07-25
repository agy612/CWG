import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import InterstitialAd from './components/ads/InterstitialAd';

/**
 * 풀리(Fuli) — 나만의 로또 챗봇 프로토타입 (기획서 1단계).
 *
 * AI 연동 없이 룰·문구 조합으로 대화 흐름과 재미를 검증하는 단계.
 *  - S1 데일리 브리핑(선톡): 회차 D-day + 출석 행운 숫자 + 내 번호 현황 인용
 *  - S3 대화형 번호 만들기: 메시지에서 숫자 추출 → 번호 6개 생성 → [내 번호에 저장]
 *  - S4 꿈해몽: 내장 사전 매칭 → 번호 조합 제안
 *  - S6 FAQ: 포인트/구독/스캔/추첨시간 정형 답변
 *  - 번호 습관 상담: cwg_my_numbers 통계를 문구 조합으로 (2단계에서 AI 코멘트로 교체)
 *
 * 과금(2차 기획): 풀리는 구독 전용 콘텐츠 기능.
 *   - 무료·게스트: 사용 불가 → 구독 유도 화면
 *   - STANDARD: 하루 3회 / PRO: 하루 5회 (티어별 chatDailyLimit)
 *   - 소진 시 광고 1편당 대화 1회 충전 (보상형 InterstitialAd 재사용)
 * 사용량: AI형 응답(생성/꿈/습관/자유)만 차감. FAQ·인사말은 무제한.
 * 저장: cwg_chat_quota = { date, used, bonus } / cwg_chat_lastopen = 'YYYY-MM-DD'
 */

const QUOTA_KEY = 'cwg_chat_quota';
const AD_BONUS = 1; // 광고 1편당 대화 1회 충전

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* 꿈해몽 사전 — 꿈의 상징을 풀이하고 어울리는 챔피언십 전략(필터)을 제안 */
const DREAM_DICT = {
    '돼지': { story: '돼지는 전통적으로 재물운의 상징이에요!', filter: '트렌드' },
    '물': { story: '맑은 물은 재물이 흘러들어온다는 뜻으로 풀이돼요.', filter: '균형' },
    '불': { story: '불꿈은 하는 일이 번창한다는 길몽으로 봐요.', filter: '트렌드' },
    '조상': { story: '조상님이 나오는 꿈은 도움을 주신다는 의미래요.', filter: '내번호' },
    '똥': { story: '지저분하지만... 똥꿈은 최고의 재물운 꿈이에요!', filter: '트렌드' },
    '대통령': { story: '귀인을 만나는 꿈 — 큰 행운의 신호로 풀이돼요.', filter: '역발상' },
    '뱀': { story: '뱀꿈은 재물과 지혜를 상징해요.', filter: '수학' },
    '용': { story: '용꿈은 꿈 중의 꿈! 대박의 상징이죠.', filter: '트렌드' },
    '돈': { story: '꿈에서 돈을 받았다면 좋은 기운이 들어온 거예요.', filter: '균형' },
};

/* 필터(전략) 한 줄 설명 — 추천 시 근거로 인용 */
const PRESET_TIP = {
    '트렌드': '최근 자주 나온 핫넘버의 흐름을 타는 전략이에요.',
    '역발상': '남들이 잘 안 보는 콜드넘버를 노리는 전략이에요.',
    '균형': '홀짝·고저를 고르게 맞추는 안정적인 전략이에요.',
    '수학': '합계·소수·AC값 같은 수치를 파고드는 전략이에요.',
    '내번호': '내 럭키 번호를 중심으로 구성하는 전략이에요.',
};

/* 필터(전략) 추천 카드 표시 메타 — 아이콘/색상 */
const PRESET_META = {
    '트렌드': { icon: 'local_fire_department', color: '#F97B22', soft: 'rgba(249,123,34,0.12)' },
    '역발상': { icon: 'ac_unit', color: '#3182F6', soft: 'rgba(49,130,246,0.12)' },
    '균형': { icon: 'balance', color: '#12B886', soft: 'rgba(18,184,134,0.12)' },
    '수학': { icon: 'calculate', color: '#7048E8', soft: 'rgba(112,72,232,0.12)' },
    '내번호': { icon: 'filter_vintage', color: '#E8590C', soft: 'rgba(232,89,12,0.12)' },
};

/* 오늘의 운세 카드 — 그날 기운에 맞는 전략(필터)을 함께 제안 */
const FORTUNE = [
    { luck: '재물운', emoji: '💰', line: '좋은 기운이 들어오는 날이에요. 흐름을 믿고 따라가 보세요.', filter: '트렌드' },
    { luck: '도전운', emoji: '🔥', line: '과감하게 밀어붙일 때 좋은 결과가 따라오는 날이에요.', filter: '트렌드' },
    { luck: '역전운', emoji: '🌀', line: '남들과 다른 선택이 통하는 날이에요.', filter: '역발상' },
    { luck: '안정운', emoji: '🍀', line: '무리하지 않는 균형이 행운을 불러오는 날이에요.', filter: '균형' },
    { luck: '집중운', emoji: '🎯', line: '차분하게 계산하면 좋은 흐름이 오는 날이에요.', filter: '수학' },
    { luck: '인연운', emoji: '💫', line: '마음이 가는 선택을 믿어도 좋은 날이에요.', filter: '내번호' },
];

/* FAQ 정형 답변 (LLM 불필요 — CS 절감) */
const FAQ = [
    { keys: ['포인트', '만료'], a: '포인트는 적립일로부터 1년간 유효해요. 마이 탭 > 포인트 내역에서 만료 예정을 확인하실 수 있어요.' },
    { keys: ['구독', '해지'], a: 'PRO 구독은 마이 탭 > 구독 관리에서 변경·해지하실 수 있어요. 매주 FULIF 번호 10세트와 AI 콘텐츠, 챔피언십까지 모두 이용하실 수 있어요!' },
    { keys: ['스캔', '방법'], a: '낙첨 티켓을 스캔·경품 탭에서 촬영하시면 포인트가 적립되고 경품 추첨에 자동 응모돼요.' },
    { keys: ['추첨', '몇시'], a: '로또 추첨은 매주 토요일 저녁 8시 45분이에요. 잊지 않으시도록 제가 토요일에 알려드릴게요!' },
    { keys: ['출석'], a: '홈 화면의 출석 칩을 누르시면 매일 5P와 오늘의 행운 숫자를 받으실 수 있어요. 7일 연속이면 보상 2배 찬스예요!' },
];

/* 별자리 → 챔피언십 필터(전략) 추천 매핑 */
const ZODIAC = [
    { key: '물병', name: '물병자리', emoji: '♒', from: [1, 20], to: [2, 18], preset: '역발상', trait: '남다른 시선을 가진 당신', reason: '흐름을 거스르는 역발상 전략이 잘 어울려요.' },
    { key: '물고기', name: '물고기자리', emoji: '♓', from: [2, 19], to: [3, 20], preset: '내번호', trait: '직관이 뛰어난 당신', reason: '마음이 가는 나만의 번호 중심 전략을 추천드려요.' },
    { key: '양', name: '양자리', emoji: '♈', from: [3, 21], to: [4, 19], preset: '트렌드', trait: '열정 넘치는 당신', reason: '뜨겁게 떠오르는 핫넘버를 좇는 트렌드 전략이 어울려요.' },
    { key: '황소', name: '황소자리', emoji: '♉', from: [4, 20], to: [5, 20], preset: '균형', trait: '안정을 중시하는 당신', reason: '치우침 없는 균형 전략이 딱 맞아요.' },
    { key: '쌍둥이', name: '쌍둥이자리', emoji: '♊', from: [5, 21], to: [6, 21], preset: '역발상', trait: '재치 있고 변화를 즐기는 당신', reason: '틀을 깨는 역발상 전략을 추천드려요.' },
    { key: '게', name: '게자리', emoji: '♋', from: [6, 22], to: [7, 22], preset: '내번호', trait: '감성이 풍부한 당신', reason: '의미를 담은 나만의 번호 전략이 잘 어울려요.' },
    { key: '사자', name: '사자자리', emoji: '♌', from: [7, 23], to: [8, 22], preset: '트렌드', trait: '주목받는 걸 즐기는 당신', reason: '화려한 핫넘버 트렌드 전략이 어울려요.' },
    { key: '처녀', name: '처녀자리', emoji: '♍', from: [8, 23], to: [9, 22], preset: '수학', trait: '꼼꼼하게 분석하는 당신', reason: '수치를 파고드는 수학 전략이 딱 맞아요.' },
    { key: '천칭', name: '천칭자리', emoji: '♎', from: [9, 23], to: [10, 22], preset: '균형', trait: '조화를 사랑하는 당신', reason: '홀짝·고저 균형을 맞추는 균형 전략을 추천드려요.' },
    { key: '전갈', name: '전갈자리', emoji: '♏', from: [10, 23], to: [11, 22], preset: '역발상', trait: '통찰력이 깊은 당신', reason: '남들이 놓친 콜드넘버를 파고드는 역발상 전략이 어울려요.' },
    { key: '사수', name: '사수자리', emoji: '♐', from: [11, 23], to: [12, 24], preset: '트렌드', trait: '모험을 즐기는 당신', reason: '흐름을 타고 나아가는 트렌드 전략을 추천드려요.' },
    { key: '염소', name: '염소자리', emoji: '♑', from: [12, 25], to: [1, 19], preset: '수학', trait: '신중하고 계획적인 당신', reason: '확률을 계산하는 수학 전략이 딱 맞아요.' },
];

/* 생년월일(YYYY-MM-DD) → 별자리 */
function zodiacFromBirth(birth) {
    if (!birth || birth.length < 10) return null;
    const m = Number(birth.slice(5, 7)), d = Number(birth.slice(8, 10));
    if (!m || !d) return null;
    return ZODIAC.find(z => {
        const [fm, fd] = z.from, [tm, td] = z.to;
        const afterStart = m > fm || (m === fm && d >= fd);
        const beforeEnd = m < tm || (m === tm && d <= td);
        return fm <= tm ? (afterStart && beforeEnd) : (afterStart || beforeEnd);
    }) || null;
}

/* 메시지에 별자리 이름이 있으면 매칭 */
function zodiacByName(text) {
    return ZODIAC.find(z => text.includes(z.key + '자리') || text.includes(z.name)) || null;
}

/* 대표 질문 칩 (고정 4개) — 풀리의 핵심 기능을 한눈에 */
const CHIPS = [
    '별자리 필터 추천받기',
    '오늘의 운세 봐줘',
    '내 번호 습관 봐줘',
    '꿈 해몽 해줘',
];

/* 토요일 추첨까지 D-day */
function drawDday(now) {
    const day = now.getDay();
    const diff = (6 - day + 7) % 7;
    if (diff === 0) return now.getHours() < 21 ? 0 : 7;
    return diff;
}

/* 내 번호 습관 통계 → 문구 조합 (2단계에서 이 결과를 AI 코멘트로 교체) */
function habitComment(myNumbers) {
    const all = myNumbers.flatMap(m => m.numbers);
    if (all.length === 0) return null;
    const odd = all.filter(n => n % 2 === 1).length;
    const low = all.filter(n => n <= 22).length;
    const oddPct = Math.round((odd / all.length) * 100);
    const lowPct = Math.round((low / all.length) * 100);
    const ranges = [0, 0, 0, 0, 0];
    all.forEach(n => ranges[Math.min(4, Math.floor((n - 1) / 9))]++);
    const favIdx = ranges.indexOf(Math.max(...ranges));
    const favLabel = ['1~9', '10~18', '19~27', '28~36', '37~45'][favIdx];
    const favPct = Math.round((ranges[favIdx] / all.length) * 100);
    const oddLine = oddPct >= 65 ? '홀수를 확실히 좋아하시네요' : oddPct <= 35 ? '짝수파시군요!' : '홀짝 밸런스가 좋아요';
    return `지금까지 만든 ${myNumbers.length}세트를 살펴봤어요.\n${favLabel} 구간을 ${favPct}%로 가장 자주 고르시고, ${oddLine} (홀수 ${oddPct}%). 고저 비율은 저(1~22) ${lowPct}%예요.`;
}

let msgId = 0;
const mid = () => `m${++msgId}`;

export default function Chat() {
    const router = useRouter();
    const { tier, chatDailyLimit } = useUser();
    const baseLimit = chatDailyLimit || 0;
    const isSubscriber = baseLimit > 0; // STANDARD/PRO만 풀리 사용 가능
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [quota, setQuota] = useState({ date: '', used: 0, bonus: 0 });
    const [showAd, setShowAd] = useState(false);
    const scrollRef = useRef(null);

    const today = useMemo(() => new Date(), []);
    const todayStr = toDateStr(today);
    const chips = CHIPS;
    const limit = baseLimit + (quota.bonus || 0);
    const remaining = Math.max(0, limit - quota.used);

    /* 진입: 쿼터 로드 + 선톡(데일리 브리핑) */
    useEffect(() => {
        let q;
        try { q = JSON.parse(localStorage.getItem(QUOTA_KEY) || 'null'); } catch {}
        if (!q || q.date !== todayStr) q = { date: todayStr, used: 0, bonus: 0 };
        setQuota(q);
        localStorage.setItem(QUOTA_KEY, JSON.stringify(q));
        localStorage.setItem('cwg_chat_lastopen', todayStr);

        // 선톡 재료: D-day + 챔피언십 생성 세트 수 (개인 데이터 훅 원칙)
        const dday = drawDday(today);
        let myCount = 0;
        try {
            myCount = JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]').length;
        } catch {}

        const ddayLine = dday === 0 ? '오늘 저녁 8시 45분 추첨이에요! 🎉' : `추첨까지 D-${dday}이에요.`;
        let hook;
        if (myCount > 0) hook = `이번 주 챔피언십 ${myCount}세트를 만드셨네요. 오늘의 운세로 다음 전략을 골라볼까요?`;
        else hook = '오늘의 운세나 별자리로 이번 주 챔피언십 전략을 골라드릴까요?';

        setMessages([
            { id: mid(), role: 'bot', text: `안녕하세요, 로또 코치 풀리예요! 👋\n${ddayLine} ${hook}` },
        ]);
        setMounted(true);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, typing]);

    const spendQuota = () => {
        setQuota(prev => {
            const next = { ...prev, used: prev.used + 1 };
            localStorage.setItem(QUOTA_KEY, JSON.stringify(next));
            return next;
        });
    };

    const chargeQuota = () => {
        setQuota(prev => {
            const next = { ...prev, bonus: (prev.bonus || 0) + AD_BONUS };
            localStorage.setItem(QUOTA_KEY, JSON.stringify(next));
            return next;
        });
    };

    /* 메시지 내 별자리명 → 없으면 프로필 생년월일로 별자리 판별 */
    const getZodiac = (t) => {
        const named = zodiacByName(t);
        if (named) return named;
        try {
            const birth = JSON.parse(localStorage.getItem('fulif_profile') || '{}').birth;
            return zodiacFromBirth(birth);
        } catch { return null; }
    };

    /* 필터(전략) 추천 → 카드로 렌더 (풀리는 번호를 직접 만들지 않고 전략만 제안) */
    const recFilter = (preset) => ({ rec: { preset } });

    /* 추천 필터로 챔피언십(번호 추가 생성) 진입 — 실제 번호는 사용자가 직접 생성 */
    const goChampionship = (preset) => {
        try { localStorage.setItem('cwg_recommend_preset', preset); } catch {}
        router.push('/?tab=picks&gen=1');
    };

    /* ── 룰 기반 응답 엔진 (풀리 = 전략 코치: 별자리·운세·습관 → 필터 제안) ── */
    const buildReply = (text) => {
        const t = text.trim();

        // FAQ (무제한 — 차감 없음)
        const faqHit = FAQ.find(f => f.keys.some(k => t.includes(k)));
        if (faqHit) return { paid: false, msgs: [{ id: mid(), role: 'bot', text: faqHit.a }] };

        // 별자리 기반 챔피언십 필터(전략) 추천 — 풀리의 핵심 기능
        if (/별자리|필터 추천|전략 추천|전략 골라|무슨 필터|어떤 필터/.test(t) || zodiacByName(t)) {
            const z = getZodiac(t);
            if (!z) {
                return {
                    paid: false,
                    msgs: [{
                        id: mid(), role: 'bot',
                        text: '별자리로 이번 주 챔피언십 전략을 추천해드릴게요! ✨\n생년월일을 등록해 주시면 별자리를 알아서 찾아드리고, 지금 바로 알려주셔도 돼요. (예: "저 사자자리예요")',
                        action: { type: 'link', route: '/profile_edit', label: '생년월일 등록하러 가기' },
                    }],
                };
            }
            return {
                paid: true,
                msgs: [{
                    id: mid(), role: 'bot',
                    text: `${z.emoji} ${z.name}, ${z.trait}이시군요!\n이번 주 챔피언십은 "${z.preset}" 필터를 추천드려요. ${z.reason}`,
                    ...recFilter(z.preset),
                }],
            };
        }

        // 오늘의 운세 — 그날 기운에 맞는 전략(필터) 제안
        if (/운세|운\s*봐|오늘.*운|점\s*봐|사주/.test(t)) {
            const z = getZodiac(t);
            const f = FORTUNE[(today.getDate() + (z ? z.name.length : 0)) % FORTUNE.length];
            const who = z ? `${z.emoji} ${z.name}, 오늘은 ` : '오늘은 ';
            return {
                paid: true,
                msgs: [{
                    id: mid(), role: 'bot',
                    text: `${who}"${f.luck}"이 좋은 날이에요! ${f.emoji}\n${f.line}\n그래서 이번 주 챔피언십은 "${f.filter}" 필터가 잘 어울려요.`,
                    ...recFilter(f.filter),
                }],
            };
        }

        // 꿈해몽 — 꿈의 상징을 풀이하고 어울리는 전략(필터) 제안
        const dreamKey = Object.keys(DREAM_DICT).find(k => t.includes(k));
        if (t.includes('꿈') && !dreamKey) {
            return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '오, 무슨 꿈이었어요? 돼지, 물, 불, 조상님, 뱀, 용... 나온 게 있으면 말씀해 주세요!' }] };
        }
        if (dreamKey) {
            const d = DREAM_DICT[dreamKey];
            return {
                paid: true,
                msgs: [{
                    id: mid(), role: 'bot',
                    text: `${d.story}\n이런 기운엔 이번 주 챔피언십 "${d.filter}" 필터가 잘 어울려요.`,
                    ...recFilter(d.filter),
                }],
            };
        }

        // 내 번호 습관 분석 → 어울리는 전략(필터) 제안
        let myNumbers = [];
        try { myNumbers = JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]'); } catch {}

        if (/습관|분석|어때|봐줘|봐주/.test(t)) {
            const comment = habitComment(myNumbers);
            if (!comment) return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '아직 분석할 번호가 없어요. 챔피언십에서 몇 세트 만들어 두시면 습관을 짚어 드릴게요!', action: { type: 'preset', preset: '균형', label: '챔피언십 하러 가기' } }] };
            const oddPct = (() => { const all = myNumbers.flatMap(m => m.numbers); return Math.round(all.filter(n => n % 2 === 1).length / all.length * 100); })();
            const rec = oddPct >= 65 || oddPct <= 35 ? '균형' : '수학';
            return {
                paid: true,
                msgs: [{
                    id: mid(), role: 'bot',
                    text: `${comment}\n치우친 습관을 보완하려면 "${rec}" 필터가 도움이 돼요.`,
                    ...recFilter(rec),
                }],
            };
        }

        if (/보여줘|내 번호/.test(t)) {
            if (myNumbers.length === 0) return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '아직 챔피언십에서 만들어 둔 번호가 없어요. 전략을 골라 시작해 보실래요?', action: { type: 'preset', preset: '균형', label: '챔피언십 하러 가기' } }] };
            const last = myNumbers[myNumbers.length - 1];
            return { paid: false, msgs: [{ id: mid(), role: 'bot', text: `지금까지 챔피언십에서 ${myNumbers.length}세트를 만드셨어요. 가장 최근에 만드신 번호예요:`, balls: last.numbers }] };
        }

        if (/복기|결과|정리|지난/.test(t)) {
            return {
                paid: true,
                msgs: [{ id: mid(), role: 'bot', text: '지난 1158회엔 3개 일치까지 가셨었어요. 한 끗 차이라 아쉬움 지수 87점! 😢\n낙첨 티켓이 있다면 스캔하고 포인트라도 챙기세요.', action: { type: 'link', route: '/?tab=scan', label: '스캔하러 가기' } }],
            };
        }

        // 번호를 만들어 달라는 요청 → 직접 번호를 드리지 않고 전략(필터) 추천으로 안내
        if (/만들|생성|뽑|골라|추천.*번호|번호.*추천|번호/.test(t)) {
            const z = getZodiac(t);
            const preset = z ? z.preset : '균형';
            return {
                paid: true,
                msgs: [{
                    id: mid(), role: 'bot',
                    text: `번호는 제가 직접 정해 드릴 순 없지만 😊, 챔피언십에서 직접 만드실 수 있어요!\n${z ? `${z.name}이신 당신께는 ` : '지금은 '}"${preset}" 필터를 추천드려요. ${PRESET_TIP[preset]}`,
                    ...recFilter(preset),
                }],
            };
        }

        // 자유 대화 폴백
        return {
            paid: true,
            msgs: [{ id: mid(), role: 'bot', text: '음, 그 얘기는 제가 아직 서툴러요 😅 대신 이런 건 잘해요 — "오늘 운세 봐줘", "내 번호 습관 봐줘", "별자리 필터 추천해줘" 같은 것들이요!' }],
        };
    };

    const send = (text) => {
        const t = (text ?? input).trim();
        if (!t || typing) return;
        setInput('');
        setMessages(prev => [...prev, { id: mid(), role: 'user', text: t }]);
        setTyping(true);

        setTimeout(() => {
            const reply = buildReply(t);
            // 한도 확인: AI형 응답만 차감
            if (reply.paid && remaining <= 0) {
                setMessages(prev => [...prev, {
                    id: mid(), role: 'bot',
                    text: `오늘 대화 ${limit}회를 모두 사용했어요.\n광고 한 편 보시면 ${AD_BONUS}회를 더 드릴게요! (내일이 되면 다시 ${baseLimit}회로 충전돼요)`,
                    action: { type: 'ad' },
                }]);
                setTyping(false);
                return;
            }
            if (reply.paid) spendQuota();
            setMessages(prev => [...prev, ...reply.msgs]);
            setTyping(false);
        }, 700);
    };

    /* ── 무료·게스트: 구독 전용 안내 화면 ── */
    if (mounted && !isSubscriber) {
        return (
            <div className="bg-background font-sans text-t-primary antialiased h-screen flex flex-col">
                <Head><title>CWG - 풀리</title></Head>
                <div className="relative flex flex-col w-full max-w-[430px] mx-auto h-full">
                    {/* Header */}
                    <div className="pt-12 pb-3 px-5 flex items-center gap-3 border-b border-themed bg-background z-10">
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[26px] font-light text-t-secondary">arrow_back</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-accent-soft border border-accent flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Image src="/char_coach.png" alt="풀리" width={38} height={38} unoptimized priority />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[15px] font-extrabold leading-tight">풀리</div>
                            <div className="text-[11px] text-t-muted font-medium">나만의 로또 AI 코치</div>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-1 rounded-full">구독 전용</span>
                    </div>

                    {/* 본문 — 구독 유도 */}
                    <div className="flex-1 overflow-y-auto flex flex-col items-center text-center px-8 pt-10 pb-8">
                        <div style={{ filter: 'drop-shadow(0 10px 30px rgba(74,222,128,0.4))' }}>
                            <Image src="/char_coach.png" alt="풀리" width={140} height={140} unoptimized priority />
                        </div>
                        <h2 className="text-[22px] font-extrabold tracking-tight mt-4 leading-snug">
                            토요일이 기다려지는<br /><span className="text-accent">내 로또 단짝, 풀리</span>
                        </h2>
                        <p className="text-[13px] text-t-muted font-medium mt-3 leading-relaxed">
                            별자리·운세·내 번호 습관을 읽어주는 AI 코치와<br />이번 주 챔피언십 전략을 함께 골라요.
                        </p>

                        {/* PRO 제공 혜택 */}
                        <div className="w-full mt-7 flex flex-col gap-2.5">
                            {[
                                { icon: 'auto_awesome', desc: '별자리 기반 챔피언십 전략 추천' },
                                { icon: 'nightlight', desc: '오늘의 운세 · 꿈해몽 코칭' },
                                { icon: 'insights', desc: '내 번호 습관 심층 분석' },
                            ].map(p => (
                                <div key={p.icon} className="flex items-center gap-3 p-3.5 rounded-2xl border bg-card-gray border-themed">
                                    <span className="material-symbols-outlined text-[20px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                                    <span className="text-[13px] font-semibold text-t-secondary flex-1 text-left">{p.desc}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="material-symbols-outlined text-[16px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>smart_display</span>
                                <span className="text-[12px] text-t-muted font-medium text-left">횟수를 다 쓰면 광고 1편당 대화 1회를 더 받아요</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-8 pt-2">
                        <button
                            onClick={() => router.push('/subscription')}
                            className="w-full py-4 rounded-xl bg-accent text-accent-fg font-extrabold text-base active:scale-95 transition-all"
                        >
                            구독하고 풀리와 대화하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background font-sans text-t-primary antialiased h-screen flex flex-col">
            <Head><title>CWG - 풀리</title></Head>
            <div className="relative flex flex-col w-full max-w-[430px] mx-auto h-full">

                {/* Header */}
                <div className="pt-12 pb-3 px-5 flex items-center gap-3 border-b border-themed bg-background z-10">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[26px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-accent-soft border border-accent flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image src="/char_coach.png" alt="풀리" width={38} height={38} unoptimized priority />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-extrabold leading-tight">풀리</div>
                        <div className="text-[11px] text-t-muted font-medium">AI 로또 코치</div>
                    </div>
                    <div className="text-[10.5px] font-bold text-t-muted bg-card-gray border border-themed px-2.5 py-1 rounded-full">
                        오늘 {mounted ? `${Math.min(quota.used, limit)}/${limit}` : '-'}회
                    </div>
                </div>

                {/* 책임 고지 */}
                <div className="px-5 py-1.5 text-center text-[10px] text-t-dim font-medium bg-card-gray/50 border-b border-themed">
                    재미로 즐기는 대화예요 · 당첨을 보장하지 않아요
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                    {messages.map(m => {
                        const isUser = m.role === 'user';
                        return (
                            <div key={m.id} className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                                {!isUser && (
                                    <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <Image src="/char_coach.png" alt="풀리" width={30} height={30} unoptimized />
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line ${
                                        isUser
                                            ? 'bg-accent text-accent-fg rounded-2xl rounded-br-md'
                                            : 'bg-card text-t-primary rounded-2xl rounded-bl-md'
                                    }`} style={isUser ? undefined : { boxShadow: '0 2px 10px var(--color-shadow)' }}>
                                        {m.text}
                                        {m.balls && (
                                            <div className="flex gap-1.5 mt-2.5">
                                                {m.balls.map((n, i) => (
                                                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold ${LOTTO_BALL_COLOR(n)}`}>
                                                        {String(n).padStart(2, '0')}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {m.action?.type === 'link' && (
                                            <button
                                                onClick={() => router.push(m.action.route)}
                                                className="mt-2.5 px-3.5 py-2 rounded-lg text-[12px] font-extrabold text-accent border border-accent bg-accent-soft active:scale-95 transition-all"
                                            >
                                                {m.action.label} →
                                            </button>
                                        )}
                                        {m.action?.type === 'preset' && (
                                            <button
                                                onClick={() => goChampionship(m.action.preset)}
                                                className="mt-2.5 px-3.5 py-2 rounded-lg text-[12px] font-extrabold text-accent-fg bg-accent active:scale-95 transition-all inline-flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                                                {m.action.label}
                                            </button>
                                        )}
                                        {m.action?.type === 'ad' && (
                                            <button
                                                onClick={() => setShowAd(true)}
                                                className="mt-2.5 px-3.5 py-2 rounded-lg text-[12px] font-extrabold text-[#D4AF37] border border-[#D4AF37]/40 bg-[#D4AF37]/10 active:scale-95 transition-all"
                                            >
                                                광고 보고 +{AD_BONUS}회 충전
                                            </button>
                                        )}
                                    </div>

                                    {/* 전략(필터) 추천 카드 — 풀리는 번호가 아닌 전략을 제안 */}
                                    {m.rec && PRESET_META[m.rec.preset] && (
                                        <div className="mt-2 w-full rounded-2xl bg-card p-3.5" style={{ boxShadow: '0 2px 10px var(--color-shadow)' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: PRESET_META[m.rec.preset].soft }}>
                                                    <span className="material-symbols-outlined text-[24px]" style={{ color: PRESET_META[m.rec.preset].color, fontVariationSettings: "'FILL' 1" }}>{PRESET_META[m.rec.preset].icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10.5px] font-bold text-t-muted">이번 주 추천 전략</p>
                                                    <p className="text-[16px] font-extrabold text-t-primary leading-tight">{m.rec.preset} 필터</p>
                                                </div>
                                            </div>
                                            <p className="text-[12px] text-t-secondary font-medium mt-2.5 leading-relaxed">{PRESET_TIP[m.rec.preset]}</p>
                                            <button
                                                onClick={() => goChampionship(m.rec.preset)}
                                                className="mt-3 w-full py-3 rounded-xl bg-accent text-accent-fg text-[13.5px] font-extrabold active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-0.5"
                                            >
                                                이 전략으로 챔피언십 시작
                                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {typing && (
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center overflow-hidden flex-shrink-0">
                                <Image src="/char_coach.png" alt="풀리" width={30} height={30} unoptimized />
                            </div>
                            <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3.5" style={{ boxShadow: '0 2px 10px var(--color-shadow)' }}>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-t-dim animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 질문 칩 + 입력창 */}
                <div className="border-t border-themed bg-background px-4 pt-2.5 pb-6">
                    <div className="flex gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                        {chips.map(c => (
                            <button
                                key={c}
                                onClick={() => send(c)}
                                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-bold text-accent border border-accent bg-accent/5 active:scale-95 transition-all"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') send(); }}
                            placeholder="풀리에게 말해보세요"
                            maxLength={500}
                            className="flex-1 bg-card-gray border border-themed rounded-full px-4 py-3 text-[13.5px] text-t-primary placeholder:text-t-dim outline-none focus:border-accent/50"
                        />
                        <button
                            onClick={() => send()}
                            disabled={!input.trim() || typing}
                            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                input.trim() && !typing ? 'bg-accent text-accent-fg active:scale-90' : 'bg-btn-secondary text-t-dim'
                            }`}
                            aria-label="보내기"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                        </button>
                    </div>
                </div>

                {/* 보상형 광고 — 대화 횟수 충전 */}
                <InterstitialAd
                    open={showAd}
                    countdownSec={5}
                    index={2}
                    onReward={chargeQuota}
                    onClose={() => {
                        setShowAd(false);
                        setMessages(prev => [...prev, { id: mid(), role: 'bot', text: `충전 완료! 대화 ${AD_BONUS}회가 추가됐어요. 어디까지 얘기했죠? 😄` }]);
                    }}
                />
            </div>
        </div>
    );
}
