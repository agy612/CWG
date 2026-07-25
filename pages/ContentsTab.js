import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import BannerCarousel from './components/ads/BannerCarousel';
import TabHeader from './components/TabHeader';
import SubscribeGate from './components/SubscribeGate';

/* ─── 공통 ───────────────────────────────────────────────── */
const LOTTO_COLOR = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* ─── 아쉬움 지수 알고리즘 ────────────────────────────────── */
function calcRegretIndex(myNums, winNums) {
    const nearMisses = myNums.filter(n => winNums.some(w => Math.abs(w - n) === 1));
    const nearScore  = Math.min(40, nearMisses.length * 10);
    const mySum      = myNums.reduce((a, b) => a + b, 0);
    const winSum     = winNums.reduce((a, b) => a + b, 0);
    const sumScore   = Math.max(0, 25 - Math.floor(Math.abs(mySum - winSum) / 2));
    const hits       = myNums.filter(n => winNums.includes(n));
    const sorted     = [...hits].sort((a, b) => a - b);
    let consecutive  = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) { consecutive++; break; }
    }
    const conScore = consecutive > 0 ? 20 : 0;
    const hitScore = Math.min(15, hits.length * 3);
    return {
        total: Math.min(100, nearScore + sumScore + conScore + hitScore),
        nearMisses, nearScore, sumScore, conScore, hitScore, hits, mySum, winSum,
    };
}

/* ─── 가중치 ─────────────────────────────────────────────── */
function getWeight(score) {
    if (score >= 90) return { short: '×2.0', mult: '2.0', color: '#FFD700', bg: 'rgba(255,215,0,0.16)' };
    if (score >= 70) return { short: '×1.5', mult: '1.5', color: '#fb923c', bg: 'rgba(251,146,60,0.16)'  };
    if (score >= 50) return { short: '×1.2', mult: '1.2', color: '#a78bfa', bg: 'rgba(167,139,250,0.16)' };
    return             { short: '×1.0', mult: '1.0', color: '#888',    bg: 'rgba(136,136,136,0.1)'   };
}

function getNudgeTheme(weight) {
    switch (weight.mult) {
        case '2.0': return {
            bg:       'linear-gradient(135deg, #1a1200 0%, #2a1e00 50%, #1a1600 100%)',
            border:   'rgba(255,215,0,0.3)',
            glow:     '#FFD700',
            title:    '#fde68a',
            muted:    'rgba(253,230,138,0.6)',
            bar:      'linear-gradient(90deg, #b45309, #fbbf24)',
            barBg:    'rgba(255,255,255,0.08)',
        };
        case '1.5': return {
            bg:       'linear-gradient(135deg, #1a0a00 0%, #2a1200 50%, #1a0800 100%)',
            border:   'rgba(251,146,60,0.3)',
            glow:     '#fb923c',
            title:    '#fdba74',
            muted:    'rgba(253,186,116,0.6)',
            bar:      'linear-gradient(90deg, #c2410c, #fb923c)',
            barBg:    'rgba(255,255,255,0.08)',
        };
        case '1.0': return {
            bg:       'linear-gradient(135deg, #111 0%, #1c1c1c 50%, #111 100%)',
            border:   'rgba(136,136,136,0.2)',
            glow:     '#888',
            title:    '#aaaaaa',
            muted:    'rgba(170,170,170,0.55)',
            bar:      'linear-gradient(90deg, #555, #888)',
            barBg:    'rgba(255,255,255,0.06)',
        };
        default: return {  // 1.2 - purple
            bg:       'linear-gradient(135deg, #1a0533 0%, #2d1b4e 50%, #1a1a40 100%)',
            border:   'rgba(167,139,250,0.3)',
            glow:     '#a78bfa',
            title:    '#c4a7ff',
            muted:    'rgba(196,167,255,0.6)',
            bar:      'linear-gradient(90deg, #7c3aed, #ec4899)',
            barBg:    'rgba(255,255,255,0.08)',
        };
    }
}

function regretLabel(score) {
    if (score >= 86) return '아슬아슬';
    if (score >= 71) return '매우 아쉬움';
    if (score >= 51) return '꽤 아쉬웠어요';
    if (score >= 31) return '조금 아쉬워요';
    return '아직 멀었어요';
}

/* ─── 회차별 데이터 ────────────────────────────────────────
   각 회차가 서로 다른 가중치 등급(×1.0 / ×1.2 / ×1.5 / ×2.0)에 해당하도록 설계
   실제 서비스에서는 localStorage 스캔 이력에서 가져옴       */
const RAW_DRAWS = [
    {
        // ×1.2 (~64점): 근접 아쉬움 + 합계 일치, 연속 없음
        drawNo: 1159, label: '이번 주',
        winNums: [12, 18, 27, 33, 38, 42],
        tickets: [
            { id: 1, myNums: [11, 19, 27, 33, 39, 42] },
            { id: 2, myNums: [4,  13, 22, 28, 35, 43] },
            { id: 3, myNums: [7,  15, 24, 30, 37, 41] },
        ],
    },
    {
        // ×1.0 (~31점): 근접 아쉬움 1개, 합계 멀리
        drawNo: 1158, label: '4/7',
        winNums: [5, 14, 21, 33, 38, 42],
        tickets: [
            { id: 4, myNums: [3,  12, 22, 29, 35, 44] },
            { id: 5, myNums: [2,   7, 16, 28, 40, 45] },
        ],
    },
    {
        // ×1.5 (~85점): 연속 적중 + 4개 근접 아쉬움
        drawNo: 1157, label: '3/31',
        winNums: [10, 11, 20, 25, 35, 40],
        tickets: [
            { id: 6, myNums: [9, 10, 11, 24, 36, 39] },
            { id: 7, myNums: [8, 12, 19, 26, 34, 41] },
        ],
    },
    {
        // ×2.0 (~93점): 3연속 적중 + 모두 근접 + 합계 거의 동일
        drawNo: 1156, label: '3/24',
        winNums: [8, 9, 10, 20, 30, 40],
        tickets: [
            { id: 8, myNums: [8, 9, 10, 19, 29, 39] },
        ],
    },
];

const ALL_DRAWS = RAW_DRAWS.map(d => ({
    ...d,
    tickets: d.tickets
        .map(t => ({ ...t, regret: calcRegretIndex(t.myNums, d.winNums) }))
        .sort((a, b) => b.regret.total - a.regret.total),
})).map(d => ({ ...d, topScore: d.tickets[0]?.regret.total ?? 0 }));

/* ContentsTab 히스토리 */
const CONTENTS_HISTORY = [
    { id: 1, type: 'number_sense', date: '2026-04-21', score: 88, level: 3, combo: 5, nums: [7, 14, 22, 31, 38, 43] },
    { id: 2, type: 'lucky_score',  date: '2026-04-21', drawNo: 1159, topScore: ALL_DRAWS[0].topScore, ticketCount: ALL_DRAWS[0].tickets.length },
    { id: 3, type: 'number_sense', date: '2026-04-19', score: 91, level: 4, combo: 7, nums: [3, 17, 25, 32, 38, 44] },
    { id: 4, type: 'lucky_score',  date: '2026-04-14', drawNo: 1158, topScore: ALL_DRAWS[1].topScore, ticketCount: ALL_DRAWS[1].tickets.length },
    { id: 5, type: 'number_sense', date: '2026-04-17', score: 75, level: 2, combo: 3, nums: [5, 18, 24, 35, 39, 42] },
    { id: 6, type: 'lucky_score',  date: '2026-04-07', drawNo: 1157, topScore: ALL_DRAWS[2].topScore, ticketCount: ALL_DRAWS[2].tickets.length },
];

/* ─── 광고 슬롯 (deprecated — no longer used) ─────────────── */

/* ─── 가중치 안내 팝업 ────────────────────────────────────── */
function WeightPopup({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto"
            onClick={onClose}>
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
            <div className="relative rounded-t-3xl p-6 pb-10 bg-card-gray"
                onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-6" />
                <p className="text-[17px] font-extrabold text-t-primary mb-1">럭키 스코어 포인트 안내</p>
                <p className="text-[12px] text-t-muted mb-6 leading-relaxed">
                    아쉬움 점수가 높을수록<br/>럭키 스코어 포인트를 더 받아요.
                </p>
                <div className="flex flex-col gap-3">
                    {[
                        { range: '90점 이상', short: '×2.0', desc: '아슬아슬 · 당첨 직전', color: '#FFD700' },
                        { range: '70~90점',  short: '×1.5', desc: '매우 아쉬운 번호',     color: '#fb923c' },
                        { range: '50~70점',  short: '×1.2', desc: '꽤 아쉬운 번호',       color: '#a78bfa' },
                        { range: '50점 미만', short: '×1.0', desc: '기본 포인트',          color: '#888'    },
                    ].map(g => (
                        <div key={g.range} className="flex items-center gap-3 p-3 rounded-2xl"
                            style={{ background: `${g.color}10`, border: `1px solid ${g.color}20` }}>
                            <div className="w-14 py-2 rounded-xl text-center text-[14px] font-extrabold flex-shrink-0"
                                style={{ background: `${g.color}18`, color: g.color }}>
                                {g.short}
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-t-primary">{g.range}</p>
                                <p className="text-[11px] text-t-muted">{g.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose}
                    className="mt-6 w-full py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[14px] active:scale-95 transition-all">
                    확인
                </button>
            </div>
        </div>
    );
}

/* ─── 콘텐츠 카드 공통 (쏘카식: 좌상단 텍스트 + 우하단 캐릭터) ─── */
function ContentCard({ id, badge, badgeBg, badgeFg, title, desc, cta, onClick, char, soft, locked }) {
    return (
        <div id={id} className="pressable mx-6 rounded-[24px] overflow-hidden bg-card-gray cursor-pointer" onClick={onClick}>
            <div className="relative p-5 pr-32" style={{ minHeight: 148 }}>
                <div className="flex items-center gap-1.5">
                    <span
                        className="inline-block px-2.5 py-1 rounded-lg text-[12px] font-bold"
                        style={{ backgroundColor: badgeBg, color: badgeFg }}
                    >
                        {badge}
                    </span>
                    {locked && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-extrabold text-[#D4AF37] bg-[#D4AF37]/12">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                            구독 전용
                        </span>
                    )}
                </div>
                <h3 className="text-[19px] font-bold text-t-primary mt-3">{title}</h3>
                <p className="text-[13px] text-t-muted font-medium leading-relaxed mt-1">{desc}</p>
                <span className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-full bg-accent text-accent-fg text-[13px] font-bold">
                    {locked ? '알아보기' : cta}
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </span>
                {/* 우측 소프트 배경 + 캐릭터 */}
                <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center" style={{ background: soft }}>
                    <img src={char} alt="" className="w-28 h-28 object-contain pointer-events-none" style={{ filter: 'drop-shadow(0 6px 16px rgba(25,31,40,0.12))' }} />
                </div>
            </div>
        </div>
    );
}

/* ─── 카드 1 · 넘버 센스 (구독 전용) ──────────────────────── */
function NumberSenseCard({ onStart }) {
    const { tier } = useUser();
    const locked = !(tier === 'STANDARD' || tier === 'PRO');
    return (
        <ContentCard
            id="tut-number-sense"
            badge="넘버 센스" badgeBg="#E8F3FF" badgeFg="#3182F6"
            title="넘버 센스" desc={<>번호를 기억하고 번호판에서<br/>직접 찾아 감각을 키워요</>}
            cta="시작하기" onClick={onStart} locked={locked}
            char="/char_memo.png"
            soft="linear-gradient(135deg, #EAF3FF 0%, #DCEBFF 100%)"
        />
    );
}

/* ─── 카드 2 · 럭키 스코어 (구독 전용) ────────────────────── */
function LuckyScoreCard({ onDetail }) {
    const { tier } = useUser();
    const locked = !(tier === 'STANDARD' || tier === 'PRO');
    return (
        <ContentCard
            id="tut-lucky-score"
            badge="럭키 스코어" badgeBg="#F1ECFF" badgeFg="#7C5CFC"
            title="럭키 스코어" desc={<>낙첨 티켓의 아쉬움을 분석해<br/>포인트를 받아요</>}
            cta="자세히" onClick={onDetail} locked={locked}
            char="/char_detective.png"
            soft="linear-gradient(135deg, #F1ECFF 0%, #E8E0FF 100%)"
        />
    );
}

/* ─── 럭키 스코어 상세 페이지 ────────────────────────────── */
function LuckyScoreDetail({ onBack }) {
    const [drawIdx,    setDrawIdx]    = useState(0);
    const [ticketIdx,  setTicketIdx]  = useState(0);
    const [showWeight, setShowWeight] = useState(false);
    const [showChart,  setShowChart]  = useState(false);
    const [showDrawPicker, setShowDrawPicker] = useState(false);
    const scrollRef = useRef(null);
    const { tier } = useUser();

    /* 럭키 스코어 = 구독 전용 콘텐츠 — 무료·게스트는 구독 유도 화면 */
    const isSubscriber = tier === 'STANDARD' || tier === 'PRO';
    if (!isSubscriber) {
        return (
            <SubscribeGate
                character="/char_detective.png"
                glow="rgba(49,130,246,0.35)"
                title={<>낙첨의 아쉬움을 점수로<br /><span className="text-accent">럭키 스코어</span></>}
                desc={<>놓친 번호의 아쉬움을 분석해 점수로 바꾸고<br />포인트까지 받는 PRO 전용 콘텐츠예요.</>}
                benefits={[
                    { icon: 'insights', desc: '낙첨 티켓 아쉬움 지수 분석' },
                    { icon: 'toll', desc: '럭키 스코어에 따라 포인트 적립' },
                    { icon: 'trending_up', desc: '주차별 럭키 스코어 추세 확인' },
                ]}
                onBack={onBack}
            />
        );
    }

    const draw       = ALL_DRAWS[drawIdx];
    const ticket     = draw.tickets[ticketIdx];
    const regret     = ticket.regret;
    const bestTicket = draw.tickets.reduce((a, b) => a.regret.total >= b.regret.total ? a : b);
    const topRegret  = bestTicket.regret;
    const weight     = getWeight(topRegret.total);

    const selectDraw = (idx) => {
        setDrawIdx(idx);
        setTicketIdx(0);
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">

            {/* 헤더 */}
            <header className="flex items-center gap-2 px-4 pt-12 pb-3 sticky top-0 bg-background/90 backdrop-blur-xl z-20">
                <button onClick={onBack} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <h1 className="text-[17px] font-bold tracking-tight">럭키 스코어</h1>
                <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => setShowChart(true)} aria-label="추세"
                        className="pressable inline-flex items-center gap-1 pl-2.5 pr-3 py-2 rounded-full bg-card-gray text-t-secondary"
                        style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}>
                        <span className="material-symbols-outlined text-[16px]">show_chart</span>
                        <span className="text-[13px] font-bold">추세</span>
                    </button>
                    <button onClick={() => setShowWeight(true)} aria-label="안내"
                        className="pressable inline-flex items-center gap-1 pl-2.5 pr-3 py-2 rounded-full bg-card-gray text-t-secondary"
                        style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}>
                        <span className="material-symbols-outlined text-[16px]">help</span>
                        <span className="text-[13px] font-bold">안내</span>
                    </button>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto pb-12">

                {/* ── 회차 선택 버튼 ── */}
                <div className="px-5 pt-5 pb-4">
                    <button onClick={() => setShowDrawPicker(true)}
                        className="pressable relative flex items-center justify-center w-full px-4 py-3 rounded-full bg-card-gray">
                        <span className="text-[15px] font-bold text-t-primary">
                            제{draw.drawNo}회{draw.label ? ` · ${draw.label}` : ''}
                        </span>
                        <span className="material-symbols-outlined text-[18px] text-t-muted absolute right-4">expand_more</span>
                    </button>
                </div>

                <div className="flex flex-col px-5 gap-5">

                    {/* ① 럭키스코어 (히어로 + 아쉬움 지수 상세 통합) */}
                    <div className="rounded-[24px] overflow-hidden bg-card-gray">
                        {/* 히어로 */}
                        {(() => {
                            const luckyPoints = topRegret.total >= 90 ? 100 : topRegret.total >= 70 ? 50 : topRegret.total >= 50 ? 30 : 10;
                            return (
                                <div className="relative overflow-hidden p-6">
                                    <div className="absolute -right-6 -top-8 w-36 h-36 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(49,130,246,0.16), transparent 70%)' }} />
                                    <img src="/char_detective.png" alt="" className="absolute right-1 bottom-0 w-28 h-28 object-contain pointer-events-none" style={{ filter: 'drop-shadow(0 6px 16px rgba(49,130,246,0.25))' }} />
                                    <div className="relative z-10 pr-24">
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-accent-soft text-accent">이번주 럭키스코어</span>
                                            <span className="text-[12px] font-bold text-t-muted">{regretLabel(regret.total)}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-3">
                                            <span className="text-[48px] font-bold tracking-tight leading-none text-accent">{topRegret.total}</span>
                                            <span className="text-[20px] font-bold text-t-muted">/ 100점</span>
                                        </div>
                                        <p className="text-[15px] font-bold text-t-primary mt-2.5">포인트 <span className="text-accent">{luckyPoints}P</span>를 받았어요</p>
                                        <div className="h-2 rounded-full overflow-hidden mt-4 bg-btn-secondary" style={{ maxWidth: 220 }}>
                                            <div className="h-full rounded-full" style={{ width: `${topRegret.total}%`, background: 'linear-gradient(90deg, #5EA0FF, #3182F6)' }} />
                                        </div>
                                        <p className="text-[12px] font-medium text-t-muted mt-2">아쉬움이 클수록 럭키스코어가 높아져요</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 점수 상세 */}
                        <div className="p-5 flex flex-col gap-5 border-t border-themed">
                            <p className="text-[13px] font-bold text-t-muted">점수 상세</p>
                            <div className="grid grid-cols-4">
                                {[
                                    { label: '±1 아쉬움', score: regret.nearScore, max: 40, color: '#3182F6' },
                                    { label: '합계 근접', score: regret.sumScore,  max: 25, color: '#4593FC' },
                                    { label: '연속번호',  score: regret.conScore,  max: 20, color: '#5EA0FF' },
                                    { label: '직접 적중', score: regret.hitScore,  max: 15, color: '#1B64DA' },
                                ].map(({ label, score, max, color }, i) => (
                                    <div key={label} className={`flex flex-col gap-1.5 ${i < 3 ? 'border-r border-themed pr-3' : 'pl-3'} ${i > 0 && i < 3 ? 'pl-3' : ''}`}>
                                        <span className="text-[20px] font-bold text-t-primary leading-none">{score}</span>
                                        <div className="h-1 bg-btn-secondary rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(score / max) * 100}%`, backgroundColor: color }} />
                                        </div>
                                        <span className="text-[10px] text-t-muted font-medium leading-tight mt-0.5">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 번호 비교 */}
                        <div className="p-5 flex flex-col gap-4 border-t border-themed">
                            <div className="flex flex-col gap-2">
                                <p className="text-[13px] text-t-muted font-bold">내 번호</p>
                                <div className="flex gap-2 flex-wrap">
                                    {ticket.myNums.map(n => {
                                        const isHit  = draw.winNums.includes(n);
                                        const isNear = draw.winNums.some(w => Math.abs(w - n) === 1);
                                        return (
                                            <div key={n} className="flex flex-col items-center gap-1">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold
                                                    ${isHit  ? LOTTO_COLOR(n)
                                                    : isNear ? 'bg-accent-soft text-accent ring-1 ring-accent/40'
                                                             : 'bg-btn-secondary text-t-muted'}`}>
                                                    {String(n).padStart(2, '0')}
                                                </div>
                                                {isHit  && <span className="text-[9px] text-[#0BA678] font-bold">적중</span>}
                                                {isNear && !isHit && <span className="text-[9px] text-accent font-bold">±1</span>}
                                                {!isHit && !isNear && <span className="text-[9px] text-transparent select-none">·</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                            <div className="flex flex-col gap-2">
                                <p className="text-[11px] text-t-muted font-semibold uppercase tracking-wider">제{draw.drawNo}회 당첨 번호</p>
                                <div className="flex gap-2 flex-wrap">
                                    {draw.winNums.map(n => (
                                        <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                            {String(n).padStart(2, '0')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {regret.nearMisses.length > 0 && (
                                <div className="rounded-2xl p-3.5 flex items-start gap-2 bg-accent-soft">
                                    <span className="material-symbols-outlined text-[16px] mt-0.5 text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                    <p className="text-[12px] leading-relaxed text-accent">
                                        <span className="font-bold">{regret.nearMisses.join(', ')}</span>번이 당첨 번호와 ±1 차이였어요!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ③ 같은 회차 다른 티켓 */}
                    {draw.tickets.length > 1 && (
                        <div>
                            <p className="text-[15px] font-bold text-t-primary mb-2.5">제{draw.drawNo}회 등록 티켓 · {draw.tickets.length}장</p>
                            <div className="flex flex-col gap-2">
                                {draw.tickets.map((t, i) => {
                                    const sel = i === ticketIdx;
                                    return (
                                        <button key={t.id} onClick={() => setTicketIdx(i)}
                                            className={`pressable flex items-center gap-3 p-4 rounded-2xl text-left w-full bg-card-gray ${sel ? 'ring-2 ring-accent' : ''}`}>
                                            {/* 점수 배지 */}
                                            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ backgroundColor: sel ? 'var(--color-accent-soft)' : 'var(--color-btn-secondary)' }}>
                                                <span className="text-[16px] font-bold leading-none" style={{ color: sel ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>{t.regret.total}</span>
                                                <span className="text-[9px] font-semibold mt-0.5" style={{ color: sel ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>점</span>
                                            </div>
                                            {/* 번호 */}
                                            <div className="flex gap-1.5 flex-1 flex-wrap">
                                                {t.myNums.map(n => (
                                                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold ${LOTTO_COLOR(n)}`} style={{ opacity: sel ? 1 : 0.55 }}>{n}</div>
                                                ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/* 회차 선택 바텀시트 */}
            {showDrawPicker && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto"
                    onClick={() => setShowDrawPicker(false)}>
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
                    <div className="relative rounded-t-3xl bg-card-gray" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mt-4 mb-2" />
                        <p className="text-[17px] font-bold text-t-primary px-6 pb-3">회차 선택</p>
                        <div className="overflow-y-auto pb-10" style={{ maxHeight: '55vh' }}>
                            {ALL_DRAWS.map((d, i) => {
                                const isActive = i === drawIdx;
                                return (
                                    <button key={d.drawNo}
                                        onClick={() => { selectDraw(i); setShowDrawPicker(false); }}
                                        className="w-full flex items-center justify-between px-6 py-3.5 active:bg-card-hover transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[20px]" style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-faint)' }}>{isActive ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                            <span className={`text-[15px] font-bold ${isActive ? 'text-t-primary' : 'text-t-muted'}`}>
                                                제{d.drawNo}회{d.label ? ` · ${d.label}` : ''}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>{d.topScore}점</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 가중치 팝업 */}
            {showWeight && <WeightPopup onClose={() => setShowWeight(false)} />}

            {/* 아쉬움 추세 팝업 */}
            {showChart && (() => {
                const curIdx = ALL_DRAWS.findIndex(x => x.drawNo === draw.drawNo);
                const draws  = ALL_DRAWS.slice(curIdx, curIdx + 10).reverse(); // 오래된 순 → 현재가 맨 오른쪽
                const scores = draws.map(d => d.topScore);
                const maxS   = Math.max(...scores);
                const minS   = Math.max(0, Math.min(...scores) - 15);
                const range  = maxS - minS || 1;
                const svgW   = 320;
                const svgH   = 90;
                const padX   = 20;
                const padY   = 14;

                const pts = draws.map((d, i) => ({
                    x: padX + (draws.length === 1 ? (svgW - padX * 2) / 2 : (i / (draws.length - 1)) * (svgW - padX * 2)),
                    y: padY + (1 - (d.topScore - minS) / range) * (svgH - padY * 2),
                    d,
                }));

                const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                const fillPath = pts.length > 1
                    ? `${linePath} L${pts[pts.length - 1].x},${svgH} L${pts[0].x},${svgH} Z`
                    : '';

                return (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto"
                        onClick={() => setShowChart(false)}>
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
                        <div className="relative rounded-t-3xl pb-10 bg-card-gray"
                            onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mt-4 mb-5" />
                            <div className="flex items-baseline justify-between px-6 mb-1">
                                <p className="text-[17px] font-extrabold text-t-primary">아쉬움 추세</p>
                                <p className="text-[11px] text-t-faint">최근 {draws.length}회차</p>
                            </div>

                            <div className="px-4 py-4">
                                <div className="relative mx-auto" style={{ width: svgW, height: svgH + 48 }}>
                                    <svg width={svgW} height={svgH} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                                        <defs>
                                            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4593FC" stopOpacity="0.28" />
                                                <stop offset="100%" stopColor="#4593FC" stopOpacity="0.02" />
                                            </linearGradient>
                                            <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#1B64DA" />
                                                <stop offset="100%" stopColor="#5EA0FF" />
                                            </linearGradient>
                                        </defs>
                                        {fillPath && <path d={fillPath} fill="url(#trendFill)" />}
                                        {pts.length > 1 && (
                                            <path d={linePath} fill="none" stroke="url(#trendLine)"
                                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        )}
                                        {pts.map((p) => {
                                            const isActive = p.d.drawNo === draw.drawNo;
                                            const w = getWeight(p.d.topScore);
                                            return (
                                                <g key={p.d.drawNo}>
                                                    {isActive && (
                                                        <line x1={p.x} y1={0} x2={p.x} y2={svgH}
                                                            stroke={w.color} strokeWidth="1"
                                                            strokeDasharray="3,3" strokeOpacity="0.35" />
                                                    )}
                                                    {isActive && (
                                                        <circle cx={p.x} cy={p.y} r={10}
                                                            fill={w.color} fillOpacity="0.12" />
                                                    )}
                                                    <circle cx={p.x} cy={p.y}
                                                        r={isActive ? 5.5 : 3.5}
                                                        fill={isActive ? w.color : "#3182F6"}
                                                        stroke={isActive ? 'none' : '#111'}
                                                        strokeWidth="1.5" />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {pts.map((p) => {
                                        const isActive = p.d.drawNo === draw.drawNo;
                                        const w = getWeight(p.d.topScore);
                                        return (
                                            <div key={p.d.drawNo} style={{
                                                position: 'absolute',
                                                left: p.x - 18,
                                                top: 0,
                                                width: 36,
                                                height: svgH + 48,
                                                pointerEvents: 'none',
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    top: Math.max(0, p.y - 18),
                                                    left: 0, right: 0, textAlign: 'center',
                                                    fontSize: 11, fontWeight: 800,
                                                    color: isActive ? w.color : 'rgba(255,255,255,0.35)',
                                                }}>
                                                    {p.d.topScore}
                                                </span>
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: 6, left: 0, right: 0, textAlign: 'center',
                                                    fontSize: 10, fontWeight: 600,
                                                    color: isActive ? w.color : 'rgba(255,255,255,0.28)',
                                                }}>
                                                    {p.d.drawNo}회
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

/* ─── 히스토리 뷰 ────────────────────────────────────────── */
function HistoryView({ onBack }) {
    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-8">
            <header className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-themed relative">
                <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <p className="text-[16px] font-extrabold absolute left-1/2 -translate-x-1/2">콘텐츠 히스토리</p>
            </header>
            <div className="flex flex-col gap-3 px-6 pt-5">
                {CONTENTS_HISTORY.map(item => {
                    if (item.type === 'number_sense') return (
                        <div key={item.id} className="rounded-2xl overflow-hidden border border-indigo-500/25 bg-card-gray">
                            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0f0f2e] via-[#1e1b4b] to-[#0f0f2e]">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[16px] text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-white">넘버 센스</p>
                                    <p className="text-[10px] text-white/40 font-medium">{item.score}점 · 레벨 {item.level} · ×{item.combo} 콤보</p>
                                </div>
                                <span className="text-[10px] text-white/30 flex-shrink-0">{item.date}</span>
                            </div>
                            <div className="flex gap-1.5 px-4 py-3">
                                {item.nums.map(n => (
                                    <div key={n} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                        {String(n).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                    const w = getWeight(item.topScore);
                    return (
                        <div key={item.id} className="rounded-2xl overflow-hidden border bg-card-gray" style={{ borderColor: `${w.color}22` }}>
                            <div className="flex items-center gap-3 px-4 py-3"
                                style={{ background: 'linear-gradient(90deg, #1a0e00, #211500, #1c0a06)' }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${w.color}18` }}>
                                    <span className="material-symbols-outlined text-[16px]"
                                        style={{ color: w.color, fontVariationSettings: "'FILL' 1" }}>stars</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-white">제{item.drawNo}회차 럭키 스코어</p>
                                    <p className="text-[10px] text-white/40 font-medium">최고 {item.topScore}점 · 포인트 {w.short} · 스캔 {item.ticketCount}장</p>
                                </div>
                                <span className="text-[10px] text-white/30 flex-shrink-0">{item.date}</span>
                            </div>
                            <div className="px-4 py-3 flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <div className="h-full rounded-full"
                                        style={{ width: `${item.topScore}%`, background: `linear-gradient(90deg, ${w.color}60, ${w.color})` }} />
                                </div>
                                <span className="text-[11px] font-extrabold" style={{ color: w.color }}>{item.topScore}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── 카드 3 · 풀리 챗봇 (AI 로또 코치 · 구독 전용) ────────── */
function FuliChatCard() {
    const router = useRouter();
    const { tier } = useUser();
    const isSubscriber = tier === 'STANDARD' || tier === 'PRO';
    const [unread, setUnread] = useState(false);

    useEffect(() => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const opened = localStorage.getItem('cwg_chat_lastopen') === todayStr;
        setUnread(!opened);
    }, []);

    return (
        <div className="pressable mx-6 rounded-[24px] overflow-hidden bg-card-gray cursor-pointer" onClick={() => router.push('/chat')}>
            <div className="relative p-5 pr-32" style={{ minHeight: 168 }}>
                <div className="flex items-center gap-1.5">
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[12px] font-bold" style={{ backgroundColor: '#E7F8F1', color: '#0BA678' }}>AI 로또 코치</span>
                    {!isSubscriber && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-extrabold text-[#D4AF37] bg-[#D4AF37]/12">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                            구독 전용
                        </span>
                    )}
                    {isSubscriber && unread && <span className="w-2 h-2 rounded-full bg-[#F04452]" />}
                </div>
                <h3 className="text-[19px] font-bold text-t-primary mt-3">AI 챗봇 풀리</h3>
                <p className="text-[13px] text-t-muted font-medium leading-relaxed mt-1">별자리·운세로 이번 주<br/>챔피언십 전략을 추천받아요</p>
                <span className="inline-flex items-center gap-1 mt-4 px-4 py-2 rounded-full bg-accent text-accent-fg text-[13px] font-bold">
                    {isSubscriber ? '대화하기' : '알아보기'}
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </span>
                {/* 우측 코치 캐릭터 */}
                <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #E7F8F1 0%, #D8F3E6 100%)' }}>
                    <img src="/char_coach.png" alt="" className="w-28 h-28 object-contain pointer-events-none" style={{ filter: 'drop-shadow(0 6px 16px rgba(25,31,40,0.12))' }} />
                </div>
            </div>
        </div>
    );
}

/* ─── 메인 컴포넌트 ─────────────────────────────────────── */
export default function ContentsTab({ onViewChange }) {
    const router = useRouter();
    const [view, setView] = useState('main');

    const changeView = (v) => {
        setView(v);
        onViewChange?.(v);
    };

    if (view === 'history')      return <HistoryView      onBack={() => changeView('main')} />;
    if (view === 'lucky_detail') return <LuckyScoreDetail onBack={() => changeView('main')} />;

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-8">
            <TabHeader title="AI 콘텐츠" subtitle="AI가 분석하는 럭키 스코어와 넘버 센스" />

            {/* 히어로 배너 — 영상 배경색(#FAFBFD)에 맞춘 카드 + 영상 캐릭터 */}
            <div className="relative mx-6 mb-5 rounded-[24px] overflow-hidden" style={{ height: 128, backgroundColor: '#FAFBFD' }}>
                <div className="absolute left-6 top-0 bottom-0 flex flex-col justify-center" style={{ right: 120 }}>
                    <h2 className="text-[21px] font-bold text-t-primary leading-snug tracking-tight">당신의 운이 쌓이고 있어요</h2>
                    <p className="text-[13px] font-medium text-t-muted mt-1.5">낙첨의 아쉬움까지 분석해 드려요</p>
                </div>
                <video
                    src="/coach.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute right-2 bottom-1 w-32 h-32 object-contain pointer-events-none"
                />
            </div>

            {/* Ad: Banner carousel #1 above NumberSense (FoodieDelivery first) */}
            <div className="mb-4">
                <BannerCarousel size="medium" count={3} startIndex={2} />
            </div>

            <div className="flex flex-col gap-4">
                <FuliChatCard />
                <LuckyScoreCard  onDetail={() => changeView('lucky_detail')} />
                <NumberSenseCard onStart={() => router.push('/number_sense')} />
            </div>
        </div>
    );
}
