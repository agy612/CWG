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

const HISTORY = [
    {
        id: 1,
        round: 1159,
        date: '2026-02-28',
        preset: '트렌드',
        numbers: [7, 14, 22, 31, 38, 43],
        hitCount: null,
        hitNumbers: [],
        pending: true,
        cost: 100,
    },
    {
        id: 2,
        round: 1158,
        date: '2026-02-21',
        preset: '균형',
        numbers: [3, 11, 23, 29, 37, 44],
        hitCount: 3,
        hitNumbers: [3, 23, 37],
        pending: false,
        cost: 100,
    },
    {
        id: 3,
        round: 1157,
        date: '2026-02-14',
        preset: '수학',
        numbers: [2, 13, 17, 25, 33, 41],
        hitCount: 1,
        hitNumbers: [17],
        pending: false,
        cost: 100,
    },
    {
        id: 4,
        round: 1156,
        date: '2026-02-07',
        preset: '내번호',
        numbers: [7, 14, 21, 28, 35, 42],
        hitCount: 0,
        hitNumbers: [],
        pending: false,
        cost: 100,
    },
    {
        id: 5,
        round: 1155,
        date: '2026-01-31',
        preset: '역발상',
        numbers: [1, 6, 18, 30, 40, 45],
        hitCount: 2,
        hitNumbers: [6, 40],
        pending: false,
        cost: 100,
    },
];

const HIT_COLOR = (count) => {
    if (count === null) return 'text-t-muted';
    if (count >= 4) return 'text-[#14b8a6]';
    if (count >= 2) return 'text-amber-400';
    return 'text-t-muted';
};

const HIT_BADGE = (count) => {
    if (count === null) return { label: '추첨 대기', cls: 'bg-btn-secondary text-t-muted' };
    if (count >= 4) return { label: `${count}개 일치`, cls: 'bg-[#14b8a6]/15 text-[#14b8a6]' };
    if (count >= 2) return { label: `${count}개 일치`, cls: 'bg-amber-500/15 text-amber-400' };
    return { label: count === 0 ? '미일치' : `${count}개 일치`, cls: 'bg-btn-secondary text-t-muted' };
};

export default function ChampionshipHistory() {
    const router = useRouter();
    const [expanded, setExpanded] = useState(null);

    const totalGenerated = HISTORY.length;
    const resolved = HISTORY.filter(h => !h.pending);
    const avgHits = resolved.length > 0
        ? (resolved.reduce((s, h) => s + h.hitCount, 0) / resolved.length).toFixed(1)
        : '—';
    const bestHit = resolved.length > 0
        ? Math.max(...resolved.map(h => h.hitCount))
        : '—';

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 챔피언십 히스토리</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">생성 히스토리</h1>
                </div>

                {/* Stats Summary */}
                <div className="mx-6 mb-6 bg-card-gray rounded-3xl p-6 border border-themed">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-4">나의 통계</div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-2xl font-extrabold text-t-primary">{totalGenerated}</div>
                            <div className="text-[10px] font-bold text-t-dim uppercase tracking-wider">총 생성</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-2xl font-extrabold text-[#14b8a6]">{avgHits}</div>
                            <div className="text-[10px] font-bold text-t-dim uppercase tracking-wider">평균 일치</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="text-2xl font-extrabold text-amber-400">{bestHit}</div>
                            <div className="text-[10px] font-bold text-t-dim uppercase tracking-wider">최고 일치</div>
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div className="px-6 flex flex-col gap-3">
                    {HISTORY.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <span className="material-symbols-outlined text-[48px] text-t-faint">history</span>
                            <p className="text-t-dim text-sm font-semibold text-center">아직 생성한 번호가 없습니다.<br/>챔피언십 탭에서 번호를 생성해보세요!</p>
                            <button
                                onClick={() => router.back()}
                                className="mt-2 px-6 py-3 bg-bg-inverse text-t-inverse font-bold rounded-full text-sm active:scale-95 transition-all"
                            >
                                번호 생성하러 가기
                            </button>
                        </div>
                    ) : (
                        HISTORY.map(item => {
                            const badge = HIT_BADGE(item.hitCount);
                            const isExpanded = expanded === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-card-gray rounded-2xl border border-themed overflow-hidden"
                                >
                                    <button
                                        className="w-full p-5 flex flex-col gap-3 active:bg-card-hover transition-colors text-left"
                                        onClick={() => setExpanded(isExpanded ? null : item.id)}
                                    >
                                        {/* Top Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-t-primary">제{item.round}회</span>
                                                <span className="text-xs font-semibold text-t-dim bg-btn-secondary px-2 py-0.5 rounded-full">{item.preset}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                                                <span className={`material-symbols-outlined text-[18px] text-t-dim transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>

                                        {/* Numbers */}
                                        <div className="flex gap-2">
                                            {item.numbers.map((num, idx) => {
                                                const isHit = item.hitNumbers.includes(num);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold transition-opacity ${
                                                            LOTTO_BALL_COLOR(num)
                                                        } ${!item.pending && !isHit ? 'opacity-30' : 'opacity-100'}`}
                                                    >
                                                        {num}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Date & Cost */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-t-dim font-medium">{item.date}</span>
                                            <span className="text-[11px] text-t-dim font-medium">-{item.cost}P</span>
                                        </div>
                                    </button>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-themed">
                                            <div className="pt-4 flex flex-col gap-3">
                                                {item.pending ? (
                                                    <div className="flex items-center gap-2 text-t-muted text-xs font-semibold">
                                                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                                                        추첨일 이후 자동으로 결과가 반영됩니다
                                                    </div>
                                                ) : item.hitCount > 0 ? (
                                                    <div>
                                                        <div className="text-xs font-bold text-t-muted mb-2">일치한 번호</div>
                                                        <div className="flex gap-2">
                                                            {item.hitNumbers.map((num, idx) => (
                                                                <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold ${LOTTO_BALL_COLOR(num)}`}>
                                                                    {num}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-semibold text-t-dim">이번 회차에서 일치한 번호가 없습니다</div>
                                                )}
                                                <button
                                                    onClick={() => router.push('/championship_result?reuse=true')}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-t-secondary hover:text-t-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                                                    이 전략으로 다시 생성
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
