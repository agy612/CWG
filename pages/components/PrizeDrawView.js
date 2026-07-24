import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../../contexts/UserContext';
import TabHeader from './TabHeader';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const SUB_WEIGHT = { GUEST: 1.0, FREE: 1.0, STANDARD: 1.5, PRO: 2.0 };

const LUCKY_WEIGHT_FROM_SCORE = (score) => {
    if (score >= 90) return 2.0;
    if (score >= 70) return 1.5;
    if (score >= 50) return 1.2;
    return 1.0;
};

const LUCKY_WEIGHT_COLOR = (mult) => {
    if (mult >= 2.0) return 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30';
    if (mult >= 1.5) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    if (mult >= 1.2) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30';
};

const RANK_BADGE = (rank) => {
    if (rank === 1) return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30';
    if (rank === 2) return 'bg-zinc-300/15 text-zinc-200 border-zinc-300/30';
    if (rank === 3) return 'bg-orange-700/20 text-orange-300 border-orange-700/40';
    return 'bg-white/5 text-t-secondary border-themed';
};

const CURRENT_DRAW = {
    drawNo: 15,
    lottery: '로또6/45',
    targetRound: 1158,
    targetDate: '2026-02-22',
    registerFrom: '2026-02-22 21:00',
    registerTo: '2026-02-25 20:00',
    drawDate: '2026-02-25 20:30',
};

const PRIZES = [
    { rank: 1, count: 1,    name: 'iPhone 16 Pro 256GB' },
    { rank: 2, count: 5,    name: '30만 포인트' },
    { rank: 3, count: 50,   name: '10만 포인트' },
    { rank: 4, count: 200,  name: '3만 포인트' },
    { rank: 5, count: 1000, name: '5천 포인트' },
];

const MY_TICKETS = [
    { id: 1, round: 1158, scanDate: '2026-02-26 19:32', nums: [3, 11, 19, 27, 35, 44], luckyScore: 87 },
    { id: 2, round: 1158, scanDate: '2026-02-25 12:10', nums: [7, 14, 22, 31, 38, 43], luckyScore: 92 },
    { id: 3, round: 1158, scanDate: '2026-02-24 08:45', nums: [5, 12, 21, 29, 37, 42], luckyScore: 65 },
    { id: 4, round: 1158, scanDate: '2026-02-23 21:18', nums: [2,  9, 18, 26, 34, 41], luckyScore: 71 },
];

const PAST_DRAWS = [
    {
        drawNo: 14, drawDate: '2026-02-23', targetRound: 1157,
        myResult: 'WON1', myPrize: 'iPhone 16 Pro 256GB',
        myEntries: 4, mySubTier: 'STANDARD', mySubWeight: 1.5, myLuckyScore: 92, myLuckyWeight: 2.0,
        prizes: PRIZES,
    },
    {
        drawNo: 13, drawDate: '2026-02-16', targetRound: 1156,
        myResult: 'WON3', myPrize: '메가커피 아메리카노 1잔',
        myEntries: 5, mySubTier: 'STANDARD', mySubWeight: 1.5, myLuckyScore: 88, myLuckyWeight: 1.5,
        prizes: [
            { rank: 1, count: 1,    name: 'iPhone 16 Pro 256GB' },
            { rank: 2, count: 5,    name: '30만 포인트' },
            { rank: 3, count: 50,   name: '메가커피 아메리카노 1잔' },
            { rank: 4, count: 200,  name: '3만 포인트' },
            { rank: 5, count: 1000, name: '5천 포인트' },
        ],
    },
    {
        drawNo: 12, drawDate: '2026-02-09', targetRound: 1155,
        myResult: 'MISS', myPrize: null,
        myEntries: 2, mySubTier: 'FREE', mySubWeight: 1.0, myLuckyScore: 45, myLuckyWeight: 1.0,
        prizes: PRIZES,
    },
    {
        drawNo: 11, drawDate: '2026-02-02', targetRound: 1154,
        myResult: 'WON5', myPrize: '5천 포인트',
        myEntries: 4, mySubTier: 'FREE', mySubWeight: 1.0, myLuckyScore: 71, myLuckyWeight: 1.5,
        prizes: PRIZES,
    },
];

function fmtDate(s) { return s.replace(/-/g, '.'); }

/**
 * PrizeDrawView — 경품추첨 화면 본문.
 *
 * embedded=false (기본, /prize_draw 라우트): 자체 sticky 헤더(뒤로가기 + 제목)를 렌더.
 * embedded=true (스캔·경품 탭 내부): 상위 래퍼가 세그먼트 토글을 제공하므로
 *   뒤로가기/제목 헤더는 생략하고 안내(info) 버튼만 우측에 노출.
 */
export default function PrizeDrawView({ embedded = false, onScan }) {
    const router = useRouter();
    const { tier } = useUser();
    const [tab, setTab] = useState('ACTIVE'); // 'ACTIVE' | 'DONE'
    const [expanded, setExpanded] = useState({});
    const [showInfo, setShowInfo] = useState(false);
    const toggle = (drawNo) => setExpanded(e => ({ ...e, [drawNo]: !e[drawNo] }));

    const subWeight = SUB_WEIGHT[tier] ?? 1.0;
    const myMaxLuckyScore = Math.max(...MY_TICKETS.map(t => t.luckyScore));
    const luckyWeight = LUCKY_WEIGHT_FROM_SCORE(myMaxLuckyScore);
    const finalWeight = +(subWeight * luckyWeight).toFixed(2);

    const InfoButton = (
        <button
            onClick={() => setShowInfo(true)}
            aria-label="응모 안내"
            className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray border border-themed text-t-muted hover:text-t-primary active:scale-95 transition-all"
        >
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span className="text-[11px] font-bold whitespace-nowrap">응모 안내</span>
        </button>
    );

    return (
        <div className={embedded ? (onScan ? 'pb-40' : '') : 'pb-24'}>
            {!embedded && <Head><title>경품추첨</title></Head>}

            {/* Header */}
            {embedded ? (
                <TabHeader
                    title="경품추첨"
                    subtitle="낙첨복권으로 경품 응모 · 로또6/45 제1158회"
                    action={InfoButton}
                />
            ) : (
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[24px] text-t-secondary hover:text-t-primary transition-colors">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-extrabold tracking-tight m-0">경품추첨</h1>
                    </div>
                    {InfoButton}
                </div>
            )}

            {/* Segment toggle (진행중 / 완료) — same pattern as ScanTab */}
            <div className="mx-6 mt-3 grid grid-cols-2 gap-1 p-1 bg-card-gray rounded-2xl border border-themed">
                {[
                    { key: 'ACTIVE', label: '진행중', icon: 'pending_actions' },
                    { key: 'DONE',   label: '완료',   icon: 'task_alt' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            tab === t.key ? 'bg-bg-inverse text-t-inverse' : 'text-t-muted hover:text-t-primary'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: tab === t.key ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'ACTIVE' ? (
                <>
                    {/* Round + target lottery banner — same pattern as ScanTab manual */}
                    <div className="mx-6 mt-4 bg-card-gray rounded-2xl px-4 py-2.5 border border-themed">
                        <div className="flex items-center gap-2 flex-wrap">
                            <svg width="18" height="13" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
                                <rect width="22" height="16" rx="2" fill="#003DA5" />
                                <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">KR</text>
                            </svg>
                            <span className="text-[12px] font-bold text-t-primary">{CURRENT_DRAW.lottery}</span>
                            <span className="text-[10px] font-bold text-t-muted bg-white/8 px-1.5 py-0.5 rounded-full">제{CURRENT_DRAW.targetRound}회</span>
                            <span className="text-white/15">·</span>
                            <span className="text-[10px] text-t-muted font-medium">{fmtDate(CURRENT_DRAW.targetDate)}</span>
                        </div>
                    </div>

                    {/* Schedule */}
                    <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-t-muted text-[13px] font-semibold">낙첨 등록 기간</span>
                            <span className="text-t-primary text-[13px] font-bold">{fmtDate(CURRENT_DRAW.registerFrom)} ~ {fmtDate(CURRENT_DRAW.registerTo)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-t-muted text-[13px] font-semibold">경품 추첨일시</span>
                            <span className="text-t-primary text-[13px] font-bold">{fmtDate(CURRENT_DRAW.drawDate)}</span>
                        </div>
                        <div className="pt-3 border-t border-themed/60 text-[11px] text-t-dim font-medium leading-relaxed">
                            매주 <span className="text-t-secondary font-semibold">토요일 21:00 ~ 화요일 20:00</span> 그 주 낙첨된 복권을 등록하고,{' '}
                            <span className="text-t-secondary font-semibold">화요일 20:30</span>에 경품을 추첨해요
                        </div>
                    </section>

                    {/* My status — compact: ticket count + weight breakdown merged */}
                    <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5">
                        <div className="flex items-baseline justify-between mb-3">
                            <span className="text-t-muted text-[11px] font-bold uppercase tracking-widest">내 응모 현황</span>
                            <span className="text-t-primary text-[14px] font-extrabold">
                                응모권 {MY_TICKETS.length}장 · 가중치 <span className={finalWeight >= 2 ? 'text-[#D4AF37]' : 'text-[#14b8a6]'}>×{finalWeight}</span>
                            </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[12px]">
                                <span className="text-t-muted">구독 등급 · {tier}</span>
                                <span className="text-t-secondary font-bold">×{subWeight.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                                <span className="text-t-muted">럭키스코어 · {myMaxLuckyScore}점</span>
                                <span className="text-t-secondary font-bold">×{luckyWeight.toFixed(1)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Prizes 1~5 — no dividers */}
                    <section className="mx-6 mt-5">
                        <div className="flex items-baseline justify-between mb-2 px-1">
                            <h2 className="text-t-muted text-[11px] font-bold uppercase tracking-widest">이번 회차 경품</h2>
                            <span className="text-t-dim text-[11px] font-medium">1~5등</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {PRIZES.map(p => (
                                <div key={p.rank} className="bg-card-gray rounded-2xl border border-themed flex items-center gap-3 px-4 py-3">
                                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${RANK_BADGE(p.rank)}`}>
                                        <span className="text-[13px] font-extrabold">{p.rank}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="text-t-primary text-[14px] font-bold leading-tight">{p.name}</div>
                                        <div className="text-t-dim text-[11px] font-medium mt-0.5">{p.count.toLocaleString()}명</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </>
            ) : (
                /* === DONE === */
                <section className="mx-6 mt-4">
                    <div className="flex flex-col gap-3">
                        {PAST_DRAWS.map(d => {
                            const finalW = +(d.mySubWeight * d.myLuckyWeight).toFixed(2);
                            return (
                                <div key={d.drawNo} className="bg-card-gray rounded-2xl p-5 border border-themed flex flex-col gap-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-t-primary text-[15px] font-extrabold">제{d.drawNo}회</span>
                                        <span className="text-t-dim text-[11px] font-medium">{fmtDate(d.drawDate)} 추첨</span>
                                    </div>

                                    {/* Target lottery banner */}
                                    <div className="bg-background rounded-xl px-3 py-2 border border-themed flex items-center gap-2">
                                        <svg width="16" height="12" viewBox="0 0 22 16" style={{ borderRadius: 2, flexShrink: 0 }}>
                                            <rect width="22" height="16" rx="2" fill="#003DA5" />
                                            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">KR</text>
                                        </svg>
                                        <span className="text-[12px] font-bold text-t-primary">로또6/45</span>
                                        <span className="text-[10px] font-bold text-t-muted bg-white/8 px-1.5 py-0.5 rounded-full">제{d.targetRound}회</span>
                                    </div>

                                    {/* Result button */}
                                    <button
                                        onClick={() => router.push(`/prize_result?drawNo=${d.drawNo}`)}
                                        className="border border-themed rounded-xl px-4 py-3 flex items-center justify-between hover:bg-card-hover transition-colors active:scale-[0.98]"
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="text-[13px] text-t-primary font-extrabold">결과 확인하기</span>
                                            <span className="text-[11px] text-t-dim font-medium mt-0.5">추첨영상과 함께 번호를 확인하세요</span>
                                        </div>
                                        <span className="material-symbols-outlined text-[28px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                    </button>

                                    {/* Expandable: Prizes + My Entry */}
                                    <div className="border-t border-themed/60 pt-1">
                                        <button
                                            onClick={() => toggle(d.drawNo)}
                                            className="w-full flex items-center justify-between py-2 group"
                                        >
                                            <span className="text-t-secondary text-[12px] font-bold">경품 및 내 응모 상세</span>
                                            <span
                                                className="material-symbols-outlined text-[20px] text-t-dim group-hover:text-t-primary transition-all"
                                                style={{ transform: expanded[d.drawNo] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            >
                                                expand_more
                                            </span>
                                        </button>

                                        {expanded[d.drawNo] && (
                                            <div className="mt-2 flex flex-col gap-4">
                                                {/* Prize list */}
                                                <div>
                                                    <div className="text-t-muted text-[11px] font-bold uppercase tracking-widest mb-2">경품</div>
                                                    <div className="flex flex-col gap-1.5">
                                                        {d.prizes.map(p => (
                                                            <div key={p.rank} className="flex items-center justify-between text-[12px]">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] font-extrabold ${RANK_BADGE(p.rank)}`}>{p.rank}</span>
                                                                    <span className="text-t-secondary font-medium">{p.name}</span>
                                                                </div>
                                                                <span className="text-t-dim font-medium">{p.count.toLocaleString()}명</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* My entry detail */}
                                                <div className="border-t border-themed/40 pt-3">
                                                    <div className="flex items-baseline justify-between mb-2">
                                                        <span className="text-t-muted text-[11px] font-bold uppercase tracking-widest">내 응모</span>
                                                        <span className="text-t-primary text-[13px] font-extrabold">
                                                            응모권 {d.myEntries}장 · 가중치 <span className={finalW >= 2 ? 'text-[#D4AF37]' : 'text-[#14b8a6]'}>×{finalW}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between text-[12px]">
                                                            <span className="text-t-muted">구독 등급 · {d.mySubTier}</span>
                                                            <span className="text-t-secondary font-bold">×{d.mySubWeight.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[12px]">
                                                            <span className="text-t-muted">럭키스코어 · {d.myLuckyScore}점</span>
                                                            <span className="text-t-secondary font-bold">×{d.myLuckyWeight.toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 낙첨복권 스캔 — 화면 하단에 떠 있는 패널 (열람 패널과 동일 형태) */}
            {onScan && (
                <div className="fixed bottom-[80px] left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <div className="bg-overlay-heavy backdrop-blur-xl p-6 rounded-3xl w-full flex flex-col items-center border border-themed-light shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <p className="text-t-secondary text-[13px] font-semibold mb-4 text-center leading-relaxed">
                            이번 주 낙첨된 복권, 그냥 버리지 마세요!<br/>
                            등록하고 광고를 보면 경품 추첨에 응모할 수 있어요
                        </p>
                        <button
                            onClick={onScan}
                            className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                            낙첨복권 스캔하기
                        </button>
                    </div>
                </div>
            )}

            {/* Info / 안내 modal */}
            {showInfo && (
                <div className="fixed inset-0 z-[900] flex items-end justify-center max-w-[430px] mx-auto" onClick={() => setShowInfo(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full bg-[#141414] rounded-t-3xl border-t border-x border-themed p-6 pb-8" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[22px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                                <h3 className="text-[17px] font-extrabold text-t-primary">경품추첨 안내</h3>
                            </div>
                            <button onClick={() => setShowInfo(false)} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center active:scale-90 transition-transform">
                                <span className="material-symbols-outlined text-[18px] text-t-muted">close</span>
                            </button>
                        </div>

                        <ul className="space-y-3">
                            {[
                                {
                                    icon: 'receipt_long',
                                    title: '직접 입력 응모권 당첨 시',
                                    desc: '직접 입력은 모바일 복권 구매를 전제로 합니다. 당첨 확정 전, 모바일 복권 구매 내역(스크린샷 등) 증빙을 요청드릴 수 있습니다.',
                                },
                                {
                                    icon: 'scale',
                                    title: '당첨 확률 가중치',
                                    desc: '구독 등급 가중치 × 럭키스코어 가중치로 산정되며, 응모권 1장당 가중치 만큼의 추첨 확률이 부여됩니다.',
                                },
                                {
                                    icon: 'casino',
                                    title: '추첨 방식',
                                    desc: '등록 기간 종료 후 자동 추첨이 진행되며, 가중치가 높을수록 당첨 확률이 올라갑니다. 당첨 시 알림으로 안내드립니다.',
                                },
                            ].map((t, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[18px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-extrabold text-t-primary leading-tight">{t.title}</div>
                                        <div className="text-[11px] text-t-muted font-medium leading-snug mt-0.5">{t.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setShowInfo(false)}
                            className="mt-5 w-full py-3 rounded-xl bg-white/8 text-t-primary font-bold text-[13px] active:scale-95 transition-all"
                        >
                            확인했어요
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
