import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* 번호 생성 이력 — win: 당첨번호(없으면 추첨 대기) */
const NUMBER_GEN = [
    { id: 'g1', round: 1234, date: '2026-07-24', numbers: [4, 9, 20, 24, 30, 34], win: null },
    { id: 'g2', round: 1234, date: '2026-07-24', numbers: [3, 26, 36, 38, 40, 44], win: null },
    { id: 'g3', round: 1234, date: '2026-07-24', numbers: [11, 13, 30, 34, 35, 36], win: null },
    { id: 'g4', round: 1233, date: '2026-07-17', numbers: [1, 11, 13, 20, 36, 38], win: [2, 7, 20, 25, 37, 40] },
    { id: 'g5', round: 1233, date: '2026-07-17', numbers: [1, 10, 16, 19, 38, 41], win: [2, 7, 20, 25, 37, 40] },
    { id: 'g6', round: 1233, date: '2026-07-17', numbers: [17, 29, 30, 35, 36, 40], win: [2, 7, 20, 25, 37, 40] },
];

/* 챔피언십 — 번호 1개 일치당 획득 점수 (구간별 차등) */
const NUMBER_POINTS = (num) => {
    if (num <= 15) return 10;
    if (num <= 30) return 15;
    return 20;
};

/* 챔피언십 이력 (커스텀 전략 · 참가비) */
const CHAMPIONSHIP = [
    { id: 'c1', round: 1234, date: '2026-07-20', numbers: [8, 9, 13, 18, 28, 34], win: null, cost: 100 },
    { id: 'c2', round: 1233, date: '2026-07-17', numbers: [4, 12, 23, 29, 37, 44], win: [2, 7, 20, 25, 37, 40], cost: 100 },
    { id: 'c3', round: 1233, date: '2026-07-17', numbers: [1, 20, 25, 27, 33, 45], win: [2, 7, 20, 25, 37, 40], cost: 100 },
    { id: 'c4', round: 1232, date: '2026-07-10', numbers: [3, 14, 22, 31, 38, 43], win: [3, 11, 22, 30, 38, 44], cost: 100 },
];

/* 내 챔피언십 요약 */
const MY_CHAMP = { score: 60, rank: 5, totalUsers: 1284, weeks: 2 };

/* 상위권 랭킹 1~10 (포인트) */
const LEADERBOARD = [
    { rank: 1, nick: '로또마스터', score: 240 },
    { rank: 2, nick: '네잎클로버', score: 215 },
    { rank: 3, nick: '행운의여신', score: 190 },
    { rank: 4, nick: 'lucky7', score: 145 },
    { rank: 5, nick: '나', score: 60, me: true },
    { rank: 6, nick: '초록별', score: 55 },
    { rank: 7, nick: '당첨기원', score: 50 },
    { rank: 8, nick: 'clover_kim', score: 45 },
    { rank: 9, nick: '숫자요정', score: 40 },
    { rank: 10, nick: '복권왕', score: 35 },
];

const RANK_MEDAL = [
    { bg: '#FFF3D6', fg: '#D69500' },
    { bg: '#EEF1F4', fg: '#8B95A1' },
    { bg: '#F9EBDD', fg: '#C77B3C' },
];

const hitCount = (nums, win) => (win ? nums.filter(n => win.includes(n)).length : null);
const roundScore = (nums, win) => (win ? nums.filter(n => win.includes(n)).reduce((s, n) => s + NUMBER_POINTS(n), 0) : null);

/* 일치 배지 (라이트) */
const HIT_BADGE = (count, pending) => {
    if (pending || count === null) return { label: '추첨 대기', cls: 'bg-btn-secondary text-t-muted' };
    if (count >= 4) return { label: `${count}개 일치`, cls: 'bg-positive-soft text-positive' };
    if (count >= 2) return { label: `${count}개 일치`, style: { backgroundColor: '#FFF3D6', color: '#D69500' } };
    if (count === 1) return { label: '1개 일치', cls: 'bg-btn-secondary text-t-secondary' };
    return { label: '미일치', style: { backgroundColor: '#FDECEC', color: '#F04452' } };
};

/* 번호공 (일치 시 파란 링) */
function Ball({ num, matched, dim, size = 'md' }) {
    const cls = size === 'sm' ? 'size-9 text-[12px]' : 'size-10 text-[13px]';
    return (
        <div
            className={`${cls} rounded-full flex items-center justify-center font-extrabold ${LOTTO_BALL_COLOR(num)} ${dim ? 'opacity-30' : ''} ${matched ? 'ring-[2.5px] ring-accent ring-offset-1 ring-offset-[var(--color-card)]' : ''}`}
        >
            {num}
        </div>
    );
}

export default function GenerationHistory() {
    const router = useRouter();
    const [tab, setTab] = useState('GEN'); // 'GEN' | 'CHAMP'
    const [expanded, setExpanded] = useState(null);
    const [showRanking, setShowRanking] = useState(false);

    const toggle = (id) => setExpanded(e => (e === id ? null : id));

    /* 펼침 상세: 내 번호 + 당첨 번호 */
    const Detail = ({ item, showPoints }) => {
        if (!item.win) {
            return (
                <div className="pt-3.5 flex items-center gap-2 text-t-muted text-[13px] font-medium">
                    <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                    추첨일 이후 자동으로 결과가 반영돼요
                </div>
            );
        }
        const hits = item.numbers.filter(n => item.win.includes(n));
        const total = hits.reduce((s, n) => s + NUMBER_POINTS(n), 0);
        return (
            <div className="pt-3.5 flex flex-col gap-3.5">
                <div>
                    <div className="text-[12px] font-bold text-t-muted mb-2">내 번호</div>
                    <div className="flex gap-2 flex-wrap">
                        {item.numbers.map((n, i) => <Ball key={i} num={n} matched={item.win.includes(n)} dim={!item.win.includes(n)} />)}
                    </div>
                </div>
                <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <div>
                    <div className="text-[12px] font-bold text-t-muted mb-2">당첨 번호</div>
                    <div className="flex gap-2 flex-wrap">
                        {item.win.map((n, i) => <Ball key={i} num={n} matched={item.numbers.includes(n)} />)}
                    </div>
                </div>
                {/* 챔피언십: 번호별 획득 점수 */}
                {showPoints && (
                    <div className="rounded-[14px] p-3.5" style={{ backgroundColor: 'var(--color-btn-secondary)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-bold text-t-muted">번호별 획득 점수</span>
                            <span className="text-[14px] font-bold text-accent">+{total}점</span>
                        </div>
                        {hits.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {hits.map((n, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full bg-accent-soft text-accent">
                                        {n}번 +{NUMBER_POINTS(n)}점
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-[12px] font-medium text-t-dim">이번 회차 일치한 번호가 없어요</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>생성 이력</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-16">

                {/* Header */}
                <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-4 flex items-center gap-2">
                    <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[17px] font-bold tracking-tight">생성 이력</h1>
                    <button
                        onClick={() => setShowRanking(true)}
                        className="pressable ml-auto inline-flex items-center gap-1 pl-2.5 pr-3 py-2 rounded-full bg-card-gray text-t-secondary"
                        style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">leaderboard</span>
                        <span className="text-[13px] font-bold">랭킹</span>
                    </button>
                </div>

                {/* 세그먼트 토글 */}
                <div className="px-6 pt-1 pb-3">
                    <div className="flex bg-card-gray rounded-2xl p-1">
                        {[{ k: 'GEN', l: '번호 생성' }, { k: 'CHAMP', l: '챔피언십' }].map(t => {
                            const on = tab === t.k;
                            return (
                                <button
                                    key={t.k}
                                    onClick={() => { setTab(t.k); setExpanded(null); }}
                                    className={`flex-1 py-3 rounded-xl text-[15px] font-bold transition-colors ${on ? 'bg-background text-t-primary' : 'text-t-muted'}`}
                                    style={on ? { boxShadow: '0 2px 6px var(--color-shadow)' } : undefined}
                                >
                                    {t.l}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ===== 번호 생성 (챔피언십과 동일한 카드 UI · 점수 없음) ===== */}
                {tab === 'GEN' && (
                    <div className="px-6 flex flex-col gap-3">
                        {NUMBER_GEN.map(item => {
                            const cnt = hitCount(item.numbers, item.win);
                            const badge = HIT_BADGE(cnt, !item.win);
                            const open = expanded === item.id;
                            return (
                                <div key={item.id} className="bg-card-gray rounded-[20px] overflow-hidden">
                                    <button onClick={() => item.win && toggle(item.id)} className="w-full p-5 flex flex-col gap-3 text-left">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[16px] font-bold text-t-primary">제{item.round}회</span>
                                                <span className="text-[11px] font-bold text-t-secondary bg-btn-secondary px-2 py-0.5 rounded-full">번호생성</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge.cls || ''}`} style={badge.style}>{badge.label}</span>
                                                {item.win && (
                                                    <span className={`material-symbols-outlined text-[20px] text-t-dim transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {item.numbers.map((n, i) => (
                                                <Ball key={i} num={n} matched={!!item.win && item.win.includes(n)} dim={!!item.win && !item.win.includes(n)} />
                                            ))}
                                        </div>
                                        <span className="text-[13px] text-t-muted font-medium">{item.date}</span>
                                    </button>
                                    {open && <div className="px-5 pb-5 border-t border-themed"><Detail item={item} /></div>}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ===== 챔피언십 ===== */}
                {tab === 'CHAMP' && (
                    <div className="px-6 flex flex-col gap-5">
                        {/* 내 점수 · 순위 (쏘카식 블루 그라데이션 히어로) */}
                        <div className="relative overflow-hidden rounded-[24px] p-5" style={{ background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)' }}>
                            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-semibold text-white/75">내 챔피언십 점수</span>
                                    <span className="text-[34px] font-bold text-white tracking-tight leading-none mt-1">{MY_CHAMP.score}<span className="text-[20px] font-bold ml-0.5">점</span></span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[13px] font-semibold text-white/75">시즌 순위</span>
                                    <span className="text-[34px] font-bold text-white tracking-tight leading-none mt-1">{MY_CHAMP.rank}<span className="text-[20px] font-bold ml-0.5">위</span></span>
                                    <span className="text-[12px] font-medium text-white/70 mt-1">{MY_CHAMP.totalUsers.toLocaleString()}명 중</span>
                                </div>
                            </div>
                        </div>

                        {/* 회차별 챔피언십 기록 */}
                        <div className="flex flex-col gap-3">
                            {CHAMPIONSHIP.map(item => {
                                const cnt = hitCount(item.numbers, item.win);
                                const score = roundScore(item.numbers, item.win);
                                const badge = HIT_BADGE(cnt, !item.win);
                                const open = expanded === item.id;
                                return (
                                    <div key={item.id} className="bg-card-gray rounded-[20px] overflow-hidden">
                                        <button onClick={() => item.win && toggle(item.id)} className="w-full p-5 flex flex-col gap-3 text-left">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-[16px] font-bold text-t-primary">제{item.round}회</span>
                                                    <span className="text-[11px] font-bold text-t-secondary bg-btn-secondary px-2 py-0.5 rounded-full">커스텀</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {score !== null && (
                                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent">+{score}점</span>
                                                    )}
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge.cls || ''}`} style={badge.style}>{badge.label}</span>
                                                    {item.win && (
                                                        <span className={`material-symbols-outlined text-[20px] text-t-dim transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {item.numbers.map((n, i) => (
                                                    <Ball key={i} num={n} matched={!!item.win && item.win.includes(n)} dim={!!item.win && !item.win.includes(n)} />
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] text-t-muted font-medium">{item.date}</span>
                                                <span className="text-[13px] text-t-muted font-semibold">-{item.cost}P</span>
                                            </div>
                                        </button>
                                        {open && <div className="px-5 pb-5 border-t border-themed"><Detail item={item} showPoints /></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 챔피언십 랭킹 팝업 (1~10등 + 내 등수) */}
                {showRanking && (
                    <div className="fixed inset-0 z-[900] flex items-end justify-center max-w-[430px] mx-auto" onClick={() => setShowRanking(false)}>
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
                        <div className="relative w-full bg-card-gray rounded-t-3xl p-6 pb-8 max-h-[82vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-4" />
                            <div className="flex items-baseline justify-between mb-4">
                                <h3 className="text-[18px] font-bold text-t-primary">챔피언십 랭킹</h3>
                                <span className="text-[13px] font-medium text-t-muted">2026 시즌 · TOP 10</span>
                            </div>

                            <div className="flex flex-col">
                                {LEADERBOARD.map((u, i) => {
                                    const medal = RANK_MEDAL[u.rank - 1];
                                    return (
                                        <div key={u.rank} className={`flex items-center gap-3 py-3 ${i < LEADERBOARD.length - 1 ? 'border-b border-themed' : ''}`}>
                                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-extrabold flex-shrink-0" style={medal ? { backgroundColor: medal.bg, color: medal.fg } : { backgroundColor: 'var(--color-btn-secondary)', color: 'var(--color-text-secondary)' }}>
                                                {u.rank}
                                            </span>
                                            <span className={`text-[15px] font-bold flex-1 min-w-0 truncate ${u.me ? 'text-accent' : 'text-t-primary'}`}>
                                                {u.nick}{u.me && ' (나)'}
                                            </span>
                                            <span className={`text-[15px] font-bold flex-shrink-0 ${u.me ? 'text-accent' : 'text-t-secondary'}`}>{u.score}점</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 내 등수 */}
                            <div className="mt-4 rounded-[16px] p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--color-accent-soft)' }}>
                                <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[14px] font-extrabold text-accent-fg flex-shrink-0">{MY_CHAMP.rank}</span>
                                <div className="flex flex-col flex-1">
                                    <span className="text-[12px] font-medium text-t-muted">내 등수</span>
                                    <span className="text-[15px] font-bold text-t-primary">전체 {MY_CHAMP.totalUsers.toLocaleString()}명 중 {MY_CHAMP.rank}위</span>
                                </div>
                                <span className="text-[16px] font-bold text-accent">{MY_CHAMP.score}점</span>
                            </div>

                            <button onClick={() => setShowRanking(false)} className="pressable mt-5 w-full py-3.5 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]">확인</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
