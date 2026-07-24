import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import BannerCarousel from './components/ads/BannerCarousel';
import AttendancePopup from '../components/AttendancePopup';

/* 로또 번호공 색상 (럭키이벤트 히스토리와 동일) */
const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* 적중 배지 */
const HIT_BADGE = (count, pending) => {
    if (pending) return { label: '추첨 대기', cls: 'bg-btn-secondary text-t-muted' };
    if (count >= 4) return { label: `${count}개 적중`, cls: 'bg-[#14b8a6]/15 text-[#14b8a6]' };
    if (count >= 2) return { label: `${count}개 적중`, cls: 'bg-amber-500/15 text-amber-400' };
    return { label: count === 0 ? '미적중' : `${count}개 적중`, cls: 'bg-btn-secondary text-t-muted' };
};

/* 내가 럭키이벤트에서 생성한 번호의 적중현황 — replace with API later */
const MY_LUCKY_RESULTS = [
    {
        id: 1, lottery: '로또 6/45', round: 1159, date: '2026-02-28', preset: '트렌드',
        numbers: [7, 14, 22, 31, 38, 43],
        hitCount: null, hitNumbers: [], pending: true,
    },
    {
        id: 2, lottery: '로또 6/45', round: 1158, date: '2026-02-21', preset: '균형',
        numbers: [3, 11, 23, 29, 37, 44],
        hitCount: 3, hitNumbers: [3, 23, 37], pending: false,
    },
];

const RECENT_SCANS = [
    { lottery: '로또 6/45', draw: 1158, points: 50 },
    { lottery: '로또 6/45', draw: 1157, points: 75 },
];

/* 이번주 Fulif픽 10세트 (번호생성 탭과 동일) */
const FULIF_PICKS = [
    { set: 1, nums: [7, 14, 22, 31, 38, 43], tag: '추천', confidence: 92 },
    { set: 2, nums: [3, 11, 19, 27, 35, 44], tag: null, confidence: 87 },
    { set: 3, nums: [5, 12, 21, 29, 37, 42], tag: null, confidence: 85 },
    { set: 4, nums: [2, 9, 18, 26, 34, 41], tag: null, confidence: 83 },
    { set: 5, nums: [6, 13, 20, 28, 36, 45], tag: null, confidence: 81 },
    { set: 6, nums: [1, 8, 17, 25, 33, 40], tag: null, confidence: 79 },
    { set: 7, nums: [4, 10, 16, 24, 32, 39], tag: null, confidence: 77 },
    { set: 8, nums: [2, 11, 23, 30, 38, 44], tag: null, confidence: 75 },
    { set: 9, nums: [7, 15, 19, 27, 36, 43], tag: null, confidence: 73 },
    { set: 10, nums: [3, 13, 22, 31, 40, 45], tag: null, confidence: 71 },
];

/* Fulif 랭킹 캐러셀 카드 데이터 — replace with API later */
const FULIF_RANKING = [
    {
        key: 'lastweek',
        title: '지난주 적중현황',
        sub: '제1227회',
        ranks: [
            { rank: '1등', count: 2 },
            { rank: '2등', count: 9 },
            { rank: '3등', count: 31 },
        ],
        footer: { label: '총 적중', value: '1,284명' },
    },
    {
        key: 'total',
        title: 'Fulif 적중 통계',
        sub: '전체 누적',
        ranks: [
            { rank: '1등', count: 7 },
            { rank: '2등', count: 41 },
            { rank: '3등', count: 326 },
        ],
        footer: { label: '누적 적중', value: '18,940명' },
    },
    {
        key: 'top',
        title: '번호 생성 적중 Top',
        sub: '역대 최고 기록',
        highlight: { rank: '1등', prize: '2,134,000,000원' },
    },
    {
        key: 'week',
        title: '이번 주 참여 현황',
        sub: '제1228회 진행 중',
        stats: [
            { label: '앱 내 생성된 번호', value: '12,480', unit: '세트' },
            { label: '스캔된 세트', value: '8,932', unit: '세트' },
        ],
    },
];

/* 스냅 캐러셀 공용 훅 (점 인디케이터 동기화 + 마우스 드래그) */
function useCarousel(length) {
    const ref = useRef(null);
    const [idx, setIdx] = useState(0);
    const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onScroll = () => {
            const first = el.children[0];
            if (!first) return;
            const step = first.offsetWidth + 12; // 카드 폭 + gap-3
            setIdx(Math.max(0, Math.min(Math.round(el.scrollLeft / step), length - 1)));
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [length]);
    const goto = (i) => {
        const el = ref.current;
        const first = el && el.children[0];
        if (first) el.scrollTo({ left: i * (first.offsetWidth + 12), behavior: 'smooth' });
    };
    const endDrag = () => {
        const el = ref.current;
        if (!el || !drag.current.down) return;
        drag.current.down = false;
        el.style.scrollSnapType = ''; // 스냅 복원 후 가장 가까운 카드로
        const first = el.children[0];
        if (first) {
            const step = first.offsetWidth + 12;
            goto(Math.max(0, Math.min(Math.round(el.scrollLeft / step), length - 1)));
        }
    };
    const dragProps = {
        onMouseDown: (e) => {
            const el = ref.current;
            if (!el) return;
            drag.current = { down: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft };
            el.style.scrollSnapType = 'none'; // 드래그 중에는 스냅이 스크롤을 되돌리므로 해제
        },
        onMouseMove: (e) => {
            const el = ref.current;
            if (!el || !drag.current.down) return;
            const dx = e.clientX - drag.current.startX;
            if (Math.abs(dx) > 5) drag.current.moved = true;
            el.scrollLeft = drag.current.startLeft - dx;
        },
        onMouseUp: endDrag,
        onMouseLeave: endDrag,
        onClickCapture: (e) => {
            // 드래그 직후 카드 클릭으로 오인되는 것 방지
            if (drag.current.moved) {
                e.preventDefault();
                e.stopPropagation();
                drag.current.moved = false;
            }
        },
        onDragStart: (e) => e.preventDefault(),
    };
    return { ref, idx, goto, dragProps };
}

/* 캐러셀 좌우 화살표 (마우스 내비게이션) */
function CarouselArrows({ c, length }) {
    const btn = 'absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface/85 border border-themed backdrop-blur-sm flex items-center justify-center text-t-secondary active:scale-90 transition-all';
    return (
        <>
            <button
                onClick={() => c.goto(Math.max(0, c.idx - 1))}
                aria-label="이전 카드"
                className={`${btn} left-3 ${c.idx === 0 ? 'opacity-0 pointer-events-none' : ''}`}
            >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
                onClick={() => c.goto(Math.min(length - 1, c.idx + 1))}
                aria-label="다음 카드"
                className={`${btn} right-3 ${c.idx >= length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
        </>
    );
}

/* Fulif 랭킹 캐러셀 카드 — 미니멀 타이포 스타일 */
function RankingCard({ card }) {
    return (
        <div className="snap-start flex-shrink-0 w-[88%] bg-card-gray rounded-2xl border border-themed p-5 flex flex-col min-h-[160px]">
            <div className="flex items-baseline justify-between">
                <h3 className="text-[13px] font-bold text-t-muted">{card.title}</h3>
                <span className="text-[11px] font-medium text-t-dim">{card.sub}</span>
            </div>

            {card.ranks && (
                <>
                    <div className="grid grid-cols-3 mt-5">
                        {card.ranks.map((r, i) => (
                            <div key={r.rank} className="flex flex-col items-center">
                                <span className={`text-[26px] font-bold tracking-tight leading-none ${i === 0 ? 'text-[#D4AF37]' : 'text-t-primary'}`}>
                                    {r.count}
                                </span>
                                <span className="text-[11px] font-semibold text-t-dim mt-1.5">{r.rank}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-baseline justify-between mt-auto pt-3.5 border-t border-themed">
                        <span className="text-[12px] font-medium text-t-muted">{card.footer.label}</span>
                        <span className="text-[15px] font-bold text-t-primary">{card.footer.value}</span>
                    </div>
                </>
            )}

            {card.highlight && (
                <div className="flex flex-col my-auto">
                    <span className="text-[32px] font-bold tracking-tight leading-none">
                        <span className="text-[#D4AF37]">{card.highlight.rank}</span>
                        <span className="text-t-primary"> 적중</span>
                    </span>
                    <span className="text-[13px] font-medium text-t-muted mt-2.5">당첨금 {card.highlight.prize}</span>
                </div>
            )}

            {card.stats && (
                <div className="grid grid-cols-2 my-auto">
                    {card.stats.map((s) => (
                        <div key={s.label} className="flex flex-col">
                            <span className="text-[24px] font-bold tracking-tight leading-none text-t-primary">
                                {s.value}<span className="text-[13px] font-semibold text-t-muted ml-0.5">{s.unit}</span>
                            </span>
                            <span className="text-[11px] font-semibold text-t-dim mt-1.5">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

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

    // 이번주 Fulif픽 / Fulif 랭킹 캐러셀 (배너형 + 점 인디케이터)
    const fulif = useCarousel(FULIF_PICKS.length);
    const ranking = useCarousel(FULIF_RANKING.length);

    // 출석체크 상태 칩 (오늘 출석 전이면 원탭 진입 유도)
    return (
        <div className="flex flex-col w-full h-full pb-8">

            {/* ── 출석 유도 팝업 (오늘 미출석 시 하루 1회) ────── */}
            {!isGuest && <AttendancePopup />}

            {/* ── Header ─────────────────────────────────────── */}
            <header className="flex items-center justify-between px-6 pt-6 pb-2">
                <button
                    onClick={() => router.push('/lottery_selection')}
                    className="flex items-center gap-2 active:opacity-60 transition-opacity"
                >
                    <FlagBadge code="KR" />
                    <span className="text-[15px] font-medium tracking-tight">로또6/45</span>
                    <span className="material-symbols-outlined text-[18px] text-t-muted">expand_more</span>
                </button>
                <button
                    onClick={() => router.push('/notifications')}
                    aria-label="알림"
                    className="w-10 h-10 flex items-center justify-center rounded-full text-t-secondary hover:text-t-primary active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                </button>
            </header>

            {/* ── Guest CTA ──────────────────────────────────── */}
            {isGuest ? (
                <section className="px-6 py-8">
                    <h1 className="text-3xl font-bold tracking-tight">낙첨 티켓을 스캔하고<br/>포인트를 적립하세요</h1>
                    <p className="text-t-muted text-sm font-medium mt-2">CWG 픽과 럭키이벤트로 나만의 번호를 만들어보세요</p>
                    <button
                        onClick={() => router.push('/signup')}
                        className="mt-6 w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                    >
                        무료로 시작하기 (+100P 보너스)
                    </button>
                </section>
            ) : (
                /* ── Points Card ────────────────────────────── */
                <div id="tut-points" className="relative">
                    <button
                        onClick={() => router.push('/point_history')}
                        className="w-full text-left px-6 py-8 active:opacity-70 transition-opacity"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="material-symbols-outlined text-[15px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                            <span className="text-[13px] text-t-muted font-semibold">마이 포인트</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight mb-5">{points.toLocaleString()} P</h1>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[13px] text-t-muted">
                                <span>이번 주 스캔: {scansThisMonth}/{maxScansPerMonth}회</span>
                                <span className="text-xs text-t-dim">{maxScansPerMonth - scansThisMonth}회 남음</span>
                            </div>
                            <div className="h-[2px] w-full bg-btn-secondary rounded-full">
                                <div className="h-full bg-t-primary rounded-full transition-all" style={{ width: `${scanPct}%` }} />
                            </div>
                        </div>
                    </button>

                    {/* 포인트 적립/사용 안내 */}
                    <button
                        onClick={() => router.push('/point_guide')}
                        aria-label="포인트 안내"
                        className="absolute top-8 right-6 inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray border border-themed text-t-muted active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[14px]">help</span>
                        <span className="text-[11px] font-bold">포인트 안내</span>
                    </button>
                </div>
            )}

            {/* ── 빠른 이동: 낙첨복권 스캔 / 경품추첨 ────────────── */}
            {!isGuest && (
                <div className="px-6 grid grid-cols-2 gap-3">
                    <button
                        id="tut-scan-btn"
                        onClick={() => { sessionStorage.setItem('cwg_open_scan', '1'); setActiveTab('scan'); }}
                        className="flex flex-col items-start gap-3 bg-card-gray rounded-2xl border border-themed p-4 active:scale-[0.98] transition-transform text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#14b8a6]/15 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                        </div>
                        <div>
                            <div className="text-[14px] font-extrabold text-t-primary">낙첨복권 스캔</div>
                            <div className="text-[11px] text-t-muted font-medium mt-0.5">스캔하고 경품 응모</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className="flex flex-col items-start gap-3 bg-card-gray rounded-2xl border border-themed p-4 active:scale-[0.98] transition-transform text-left"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                        </div>
                        <div>
                            <div className="text-[14px] font-extrabold text-t-primary">경품추첨</div>
                            <div className="text-[11px] text-t-muted font-medium mt-0.5">응모 현황 보기</div>
                        </div>
                    </button>
                </div>
            )}

            {/* ── Ad: Banner carousel #1 after points ───────── */}
            <div className="mt-2 mb-2">
                <BannerCarousel size="medium" count={3} startIndex={0} />
            </div>

            {/* ── 이번주 Fulif픽 (캐러셀) ─────────────────────── */}
            {!isGuest && (
                <section id="tut-cwg-pick" className="mt-2">
                    <div className="flex items-end justify-between mb-3 px-6">
                        <div>
                            <h2 className="text-[16px] font-extrabold text-t-primary">이번주 Fulif픽</h2>
                            <p className="text-t-dim text-xs font-medium mt-0.5">로또6/45 제1228회</p>
                        </div>
                        <button
                            onClick={() => setActiveTab && setActiveTab('picks')}
                            className="text-[13px] font-medium text-t-primary hover:opacity-70 transition-opacity"
                        >
                            전체 보기
                        </button>
                    </div>

                    <div className="px-6 relative">
                        <div
                            ref={fulif.ref}
                            {...fulif.dragProps}
                            className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {FULIF_PICKS.map((pick) => (
                                <button
                                    key={pick.set}
                                    onClick={() => setActiveTab && setActiveTab('picks')}
                                    className="snap-start flex-shrink-0 w-[88%] bg-card-gray rounded-2xl py-7 px-4 border border-themed active:opacity-70 transition-opacity"
                                >
                                    <div className="flex gap-2 justify-center">
                                        {pick.nums.map((num, i) => (
                                            <div key={i} className={`size-11 rounded-full flex items-center justify-center text-[15px] font-extrabold ${LOTTO_BALL_COLOR(num)}`}>
                                                {String(num).padStart(2, '0')}
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <CarouselArrows c={fulif} length={FULIF_PICKS.length} />
                    </div>

                    {/* 점 인디케이터 */}
                    <div className="flex justify-center gap-1.5 mt-3.5">
                        {FULIF_PICKS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => fulif.goto(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === fulif.idx ? 'w-5 bg-t-primary' : 'w-1.5 bg-btn-secondary'}`}
                                aria-label={`Fulif픽 ${i + 1}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Fulif 랭킹 (캐러셀) ─────────────────────────── */}
            <section className="mt-8">
                <div className="mb-3 px-6">
                    <h2 className="text-[16px] font-extrabold text-t-primary">Fulif 랭킹</h2>
                    <p className="text-t-dim text-xs font-medium mt-0.5">Fulif 이용자들의 적중 · 참여 현황</p>
                </div>

                <div className="px-6 relative">
                    <div
                        ref={ranking.ref}
                        {...ranking.dragProps}
                        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {FULIF_RANKING.map((card) => (
                            <RankingCard key={card.key} card={card} />
                        ))}
                    </div>
                    <CarouselArrows c={ranking} length={FULIF_RANKING.length} />
                </div>

                {/* 점 인디케이터 */}
                <div className="flex justify-center gap-1.5 mt-3.5">
                    {FULIF_RANKING.map((card, i) => (
                        <button
                            key={card.key}
                            onClick={() => ranking.goto(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === ranking.idx ? 'w-5 bg-t-primary' : 'w-1.5 bg-btn-secondary'}`}
                            aria-label={card.title}
                        />
                    ))}
                </div>
            </section>

            {/* ── Ad: Banner carousel #2 ── */}
            <div className="mt-8">
                <BannerCarousel size="large" count={3} startIndex={3} />
            </div>

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
                                <span className="text-[14px] font-medium text-t-secondary">
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
                                <p className="text-t-secondary text-sm leading-snug max-w-[180px]">픽 무제한 + 포인트 1.5배 ~ 2배 적립</p>
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
