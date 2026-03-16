import React from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../contexts/UserContext';
import WinnerCarousel from '../home/WinnerCarousel';
import { getHomeCardData } from '../../utils/winner';

/* Rank badge colors: gold / silver / bronze */
const RANK_STYLE = [
    'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/40',
    'text-t-secondary bg-t-secondary/10 border border-t-secondary/40',
    'text-[#CD7F32] bg-[#CD7F32]/10 border border-[#CD7F32]/40',
];

const TYPE_LABEL = { CHAMPIONSHIP: '챔피언십', PICK: 'CWG픽' };

/* Sample data — replace with API later */
const WINNING_PICKS = [
    {
        id: 42, type: 'CHAMPIONSHIP', draw: 1158,
        myNums: [5, 14, 22, 28, 37, 43],
        winNums: [5, 7, 14, 24, 37, 41],
        matched: [5, 14, 37], prize: '3등',
    },
    {
        id: 7, type: 'PICK', draw: 1157,
        myNums: [3, 12, 18, 27, 35, 42],
        winNums: [3, 11, 18, 27, 34, 42],
        matched: [3, 18, 27, 42], prize: '4등',
    },
];

const RECENT_SCANS = [
    { lottery: '로또 6/45', draw: 1158, points: 50 },
    { lottery: '로또 6/45', draw: 1157, points: 75 },
];

/* Inline SVG flag badges (replaces emoji flags) */
function FlagBadge({ code }) {
    const palette = { KR: '#003DA5', JP: '#BC002D', EU: '#003399' };
    const bg = palette[code] || '#444';
    return (
        <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
            <rect width="22" height="16" fill={bg} />
            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{code}</text>
        </svg>
    );
}

export default function HomeTab({ setActiveTab }) {
    const router = useRouter();
    const { tier, points, scansThisMonth, maxScansPerMonth, picksUnlocked, badgeLabel, badgeColor } = useUser();

    const isGuest = tier === 'GUEST';
    const scanPct = maxScansPerMonth > 0 ? Math.round((scansThisMonth / maxScansPerMonth) * 100) : 0;

    return (
        <div className="flex flex-col w-full h-full pb-8">

            {/* ── Header ─────────────────────────────────────── */}
            <header className="flex items-center justify-between px-6 pt-6 pb-2">
                <button
                    onClick={() => router.push('/lottery_selection')}
                    className="flex items-center gap-2 active:opacity-60 transition-opacity"
                >
                    <FlagBadge code="KR" />
                    <span className="text-[15px] font-medium tracking-tight">한국 로또 6/45</span>
                    <span className="material-symbols-outlined text-[18px] text-t-muted">expand_more</span>
                </button>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${badgeColor}`}>{badgeLabel}</span>
            </header>

            {/* ── Guest CTA ──────────────────────────────────── */}
            {isGuest ? (
                <section className="px-6 py-8">
                    <h1 className="text-3xl font-bold tracking-tight">낙첨 티켓을 스캔하고<br/>포인트를 적립하세요</h1>
                    <p className="text-t-muted text-sm font-medium mt-2">CWG 픽과 챔피언십으로 나만의 번호를 만들어보세요</p>
                    <button
                        onClick={() => router.push('/signup')}
                        className="mt-6 w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                    >
                        무료로 시작하기 (+100P 보너스)
                    </button>
                </section>
            ) : (
                /* ── Points Card ────────────────────────────── */
                <button
                    onClick={() => router.push('/point_history')}
                    className="text-left px-6 py-8 active:opacity-70 transition-opacity"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badgeLabel}</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mb-5">{points.toLocaleString()} P</h1>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-[13px] text-t-muted">
                            <span>이번 달 스캔: {scansThisMonth}/{maxScansPerMonth}회</span>
                            <span className="text-xs text-t-dim">{maxScansPerMonth - scansThisMonth}회 남음</span>
                        </div>
                        <div className="h-[2px] w-full bg-btn-secondary rounded-full">
                            <div className="h-full bg-t-primary rounded-full transition-all" style={{ width: `${scanPct}%` }} />
                        </div>
                    </div>
                </button>
            )}

            {/* ── Winning Picks Ranking ───────────────────────── */}
            {!isGuest && (
                <section className="px-6 mt-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-t-muted uppercase tracking-wider">내 당첨 픽 랭킹</h2>
                        <button
                            onClick={() => router.push('/championship_history')}
                            className="text-[13px] font-medium text-t-primary hover:opacity-70 transition-opacity"
                        >
                            전체 보기
                        </button>
                    </div>

                    {WINNING_PICKS.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center gap-3 py-10 bg-card-gray rounded-2xl border border-themed">
                            <span className="material-symbols-outlined text-[40px] text-t-faint">gps_fixed</span>
                            <p className="text-t-muted text-[13px] font-medium text-center">
                                아직 당첨 픽이 없어요<br/>픽을 받고 당첨을 기다려보세요!
                            </p>
                            <button
                                onClick={() => setActiveTab && setActiveTab('picks')}
                                className="mt-1 text-[13px] font-semibold text-[#14b8a6] hover:opacity-70 transition-opacity"
                            >
                                픽생성 보러가기 &gt;
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {WINNING_PICKS.slice(0, 3).map((pick, idx) => (
                                <button
                                    key={pick.id}
                                    onClick={() => router.push('/championship_history')}
                                    className="w-full text-left bg-card-gray rounded-2xl p-5 flex flex-col gap-3 border border-themed active:opacity-70 transition-opacity"
                                >
                                    {/* Title row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`size-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-extrabold ${RANK_STYLE[idx]}`}>
                                                {idx + 1}
                                            </div>
                                            <span className="text-[14px] font-bold">{TYPE_LABEL[pick.type]} #{pick.id}</span>
                                            <span className="text-[11px] text-t-muted">제{pick.draw}회</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-0.5 rounded-full">{pick.prize}</span>
                                    </div>

                                    {/* My numbers */}
                                    <div className="flex gap-1.5">
                                        {pick.myNums.map((num, i) => (
                                            <div
                                                key={i}
                                                className={`size-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                                    pick.matched.includes(num)
                                                        ? 'bg-[#14b8a6]/20 text-[#14b8a6]'
                                                        : 'bg-card-gray text-t-muted'
                                                }`}
                                            >
                                                {String(num).padStart(2, '0')}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Match info */}
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[12px] font-semibold text-btn-secondary-text">{pick.matched.length}개 적중 · {pick.prize}</span>
                                        <span className="text-[11px] text-t-dim">당첨번호: {pick.winNums.join(' · ')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ── CWG Picks Preview ──────────────────────────── */}
            <section className="mt-8 px-6">
                <div className="bg-card-gray rounded-2xl p-6 flex flex-col gap-5">
                    <div>
                        <h3 className="text-[15px] font-semibold text-btn-secondary-text mb-1">이번 주 CWG 픽</h3>
                        <p className="text-t-dim text-xs font-medium mb-4">제1159회 · 2026-03-01 추첨</p>
                        <div className="flex gap-2">
                            {picksUnlocked ? (
                                [7, 14, 28, 33, 39, 42].map(num => (
                                    <div key={num} className="size-10 rounded-lg bg-[#14b8a6]/20 flex items-center justify-center text-sm font-bold text-[#14b8a6]">
                                        {String(num).padStart(2, '0')}
                                    </div>
                                ))
                            ) : (
                                <>
                                    {[7, 14, 28].map(num => (
                                        <div key={num} className="size-10 rounded-lg bg-card-gray flex items-center justify-center text-sm font-bold text-t-primary">
                                            {String(num).padStart(2, '0')}
                                        </div>
                                    ))}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="size-10 rounded-lg bg-card-gray flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[16px] text-t-dim">lock</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveTab && setActiveTab('picks')}
                        className="w-full py-4 bg-bg-inverse text-t-inverse font-bold rounded-xl text-sm active:scale-95 transition-transform"
                    >
                        {picksUnlocked ? '전체 픽 보기 (10세트)' : '픽 열람하기'}
                    </button>
                </div>
            </section>

            {/* ── Championship Banner ────────────────────────── */}
            <section className="mt-6 px-6">
                <div className="bg-card-gray rounded-3xl p-8 flex items-center justify-between relative overflow-hidden border border-themed">
                    <div className="flex flex-col gap-2 relative z-10 max-w-[160px]">
                        <h4 className="text-t-primary font-extrabold text-xl leading-tight">나만의 번호<br/>생성하기</h4>
                        <p className="text-t-muted text-[12px] font-semibold">
                            {tier === 'PRO' ? '오늘 1회 무료' : '100P / 생성'}
                        </p>
                        <button
                            onClick={() => setActiveTab && setActiveTab('championship')}
                            className="mt-3 px-6 py-2.5 bg-bg-inverse text-t-inverse font-bold rounded-full text-xs self-start active:scale-95 transition-all"
                        >
                            챔피언십 &rarr;
                        </button>
                    </div>
                    <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                        <div className="lotto-ball" />
                    </div>
                </div>
            </section>

            {/* ── This Draw Stats ────────────────────────────── */}
            <section className="mt-10 px-6">
                <h3 className="text-sm font-semibold text-t-muted uppercase tracking-wider mb-6">이번 회차 통계</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-t-muted uppercase tracking-widest mb-1">총 스캔 수</span>
                        <p className="text-4xl font-bold text-t-primary tracking-tight">42,350</p>
                    </div>
                    <div className="flex gap-12">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-t-muted uppercase tracking-widest mb-1">Hot</span>
                            <p className="text-xl font-bold text-t-primary tracking-tight">7, 14, 28</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-t-muted uppercase tracking-widest mb-1">Cold</span>
                            <p className="text-xl font-bold text-t-primary tracking-tight">3, 19, 42</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Winner Carousel Section ────────────────────── */}
            {!isGuest && (
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-4 px-6">
                        <h2 className="text-sm font-semibold text-t-muted uppercase tracking-wider">CWG 랭킹</h2>
                    </div>
                    <WinnerCarousel data={getHomeCardData()} />
                </section>
            )}

            {/* ── Recent Scan History ────────────────────────── */}
            {!isGuest && (
                <section className="mt-10 px-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-t-muted uppercase tracking-wider">최근 스캔 내역</h3>
                        <button
                            onClick={() => router.push('/point_history')}
                            className="text-[13px] font-medium text-t-primary hover:opacity-70 transition-opacity"
                        >
                            더보기
                        </button>
                    </div>
                    <div>
                        {RECENT_SCANS.map((scan, idx) => (
                            <div key={idx} className="flex items-center justify-between py-3 border-b border-themed last:border-0">
                                <span className="text-[14px] font-medium text-btn-secondary-text">
                                    {scan.lottery} #{scan.draw}
                                </span>
                                <span className="text-[14px] font-bold text-[#14b8a6]">+{scan.points}P</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Upgrade Banner (FREE only) ─────────────────── */}
            {tier === 'FREE' && (
                <div className="mt-10 px-6">
                    <div className="relative rounded-2xl p-7 overflow-hidden bg-surface border border-themed">
                        <div className="absolute inset-0 metallic-grain" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-t-muted uppercase tracking-widest">Premium Plan</span>
                                    <h4 className="text-t-primary font-bold text-xl tracking-tight">구독하고 더 많이 버세요</h4>
                                </div>
                                <span className="material-symbols-outlined text-t-faint text-3xl">token</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-btn-secondary-text text-sm leading-snug max-w-[180px]">픽 무제한 + 포인트 1.5배 ~ 2배 적립</p>
                                <button
                                    onClick={() => router.push('/subscription')}
                                    className="px-5 py-3 bg-bg-inverse text-t-inverse font-bold rounded-full text-xs active:scale-95 transition-all"
                                >
                                    업그레이드
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
