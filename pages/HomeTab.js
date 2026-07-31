import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
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
    if (count >= 4) return { label: `${count}개 적중`, cls: 'bg-positive-soft text-positive' };
    if (count >= 2) return { label: `${count}개 적중`, cls: 'bg-amber-500/15 text-amber-500' };
    return { label: count === 0 ? '미적중' : `${count}개 적중`, cls: 'bg-btn-secondary text-t-muted' };
};

/* 내가 생성한 번호의 결과 현황 — source: '번호생성' | '챔피언십' — replace with API later */
const MY_LUCKY_RESULTS = [
    {
        id: 1, lottery: '로또 6/45', round: 1159, date: '2026-02-28', source: '번호생성',
        numbers: [7, 14, 22, 31, 38, 43],
        hitCount: null, hitNumbers: [], pending: true,
    },
    {
        id: 2, lottery: '로또 6/45', round: 1158, date: '2026-02-21', source: '챔피언십',
        numbers: [3, 11, 23, 29, 37, 44],
        hitCount: 3, hitNumbers: [3, 23, 37], pending: false,
    },
];

/* 최근 스캔 내역 — method: 'scan'(카메라 스캔) | 'manual'(수동입력) — replace with API later */
const RECENT_SCANS = [
    { lottery: '로또 6/45', draw: 1231, sets: 5, date: '2026-06-12', points: 50, method: 'scan' },
    { lottery: '로또 6/45', draw: 1230, sets: 3, date: '2026-06-05', points: 75, method: 'scan' },
    { lottery: '로또 6/45', draw: 1229, sets: 1, date: '2026-05-29', points: 30, method: 'manual' },
];

/* 이번 회차 통계 — replace with API later */
const DRAW_STATS = {
    hot: [27, 28, 16],
    cold: [2, 7, 18],
    totalScans: 42350,
};

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

/* FULIF 랭킹 — 그라데이션 배경 + 흰 텍스트 카드 (replace with API later) */
const FULIF_RANKING = [
    {
        key: 'lastweek', img: '/home/rank1.png',
        badge: '지난주 결과 현황',
        grad: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
        headline: '총 1,284명 일치',
        sub: '1등 2명 · 2등 9명 · 3등 31명',
        footer: '제1227회 · 2026-07-18 추첨',
    },
    {
        key: 'total', img: '/home/rank2.png',
        badge: 'FULIF 결과 통계',
        grad: 'linear-gradient(135deg, #4593FC 0%, #2D71E8 100%)',
        headline: '누적 18,940명 일치',
        sub: '1등 7명 · 2등 41명 · 3등 326명',
        footer: '전체 기간 누적',
    },
    {
        key: 'top3', img: '/home/rank3.png',
        badge: '번호 생성 결과 TOP3',
        grad: 'linear-gradient(135deg, #2D71E8 0%, #14304C 100%)',
        top3: [
            { round: 1226, rank: '3등', user: 'f***' },
            { round: 1231, rank: '5등', user: 'D***' },
            { round: 1228, rank: '5등', user: 'f***' },
        ],
        footer: '역대 최고 기록',
    },
    {
        key: 'week', img: '/home/rank4.png',
        badge: '이번 주 참여 현황',
        grad: 'linear-gradient(135deg, #5EA0FF 0%, #3182F6 100%)',
        headline: '생성된 번호 12,480개',
        sub: '스캔 세트 8,932개',
        footer: '제1228회 진행 중',
    },
];

/* TOP3 순위 배지 색 */
const RANK_BADGE = [
    { bg: '#FFF3D6', fg: '#D69500' },
    { bg: '#EEF1F4', fg: '#8B95A1' },
    { bg: '#F9EBDD', fg: '#C77B3C' },
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
    // 터치에선 숨기고 마우스 호버 시에만 노출 (쏘카식 — 모바일은 스와이프가 기본)
    const btn = 'absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface/90 border border-themed backdrop-blur-sm flex items-center justify-center text-t-secondary active:scale-90 transition-all opacity-0';
    return (
        <>
            <button
                onClick={() => c.goto(Math.max(0, c.idx - 1))}
                aria-label="이전 카드"
                className={`${btn} left-3 ${c.idx === 0 ? 'pointer-events-none' : 'group-hover:opacity-100'}`}
            >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
                onClick={() => c.goto(Math.min(length - 1, c.idx + 1))}
                aria-label="다음 카드"
                className={`${btn} right-3 ${c.idx >= length - 1 ? 'pointer-events-none' : 'group-hover:opacity-100'}`}
            >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
        </>
    );
}

/* Inline SVG flag badges (replaces emoji flags) */
function FlagBadge({ code }) {
    const palette = { KR: '#003DA5', JP: '#BC002D', EU: '#003399' };
    const bg = palette[code] || '#444';
    return (
        <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
            <rect width="22" height="16" fill={bg} />
            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Pretendard,Inter,sans-serif">{code}</text>
        </svg>
    );
}

export default function HomeTab({ setActiveTab }) {
    const router = useRouter();
    const { tier, picksUnlocked, badgeLabel, badgeColor } = useUser();

    const isGuest = tier === 'GUEST';

    // 이번주 Fulif픽 / Fulif 랭킹 캐러셀 (배너형 + 점 인디케이터)
    const ranking = useCarousel(FULIF_RANKING.length);

    return (
        <div className="flex flex-col w-full h-full pb-8">

            {/* ── 출석 유도 팝업 (오늘 미출석 시 하루 1회) ────── */}
            {!isGuest && <AttendancePopup />}

            {/* ── Header ─────────────────────────────────────── */}
            <header className="flex items-center justify-between px-6 pt-6 pb-4">
                <button
                    onClick={() => router.push('/lottery_selection')}
                    className="pressable inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-full bg-card-gray"
                    style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}
                >
                    <FlagBadge code="KR" />
                    <span className="text-[15px] font-bold tracking-tight">로또6/45</span>
                    <span className="material-symbols-outlined text-[18px] text-t-muted">expand_more</span>
                </button>
                <button
                    onClick={() => router.push('/notifications')}
                    aria-label="알림"
                    className="pressable relative inline-flex items-center gap-1 pl-2.5 pr-3 py-2 rounded-full bg-card-gray text-t-secondary"
                    style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}
                >
                    <span className="material-symbols-outlined text-[18px]">notifications</span>
                    <span className="text-[13px] font-bold">알림</span>
                    {/* 안 읽은 알림 표시 (쏘카/토스식 빨간 점) */}
                    <span className="absolute top-1.5 left-6 w-2 h-2 rounded-full bg-[#F04452] ring-2 ring-[var(--color-card)]" />
                </button>
            </header>

            {/* ── Guest CTA ──────────────────────────────────── */}
            {isGuest && (
                <section className="mx-6 mb-2 bg-card-gray rounded-[24px] p-6">
                    <h1 className="text-[26px] leading-snug font-bold tracking-tight">낙첨 티켓을 스캔하고<br/>포인트를 적립하세요</h1>
                    <p className="text-t-muted text-[14px] font-medium mt-2">FULIF 픽과 럭키이벤트로 나만의 번호를 만들어보세요</p>
                    <button
                        onClick={() => router.push('/signup')}
                        className="pressable mt-6 w-full py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px]"
                    >
                        무료로 시작하기 (+100P 보너스)
                    </button>
                </section>
            )}

            {/* ── 빠른 이동: 낙첨복권 스캔 / 경품추첨 ────────────── */}
            {!isGuest && (
                <div className="px-6 grid grid-cols-2 gap-3">
                    <button
                        id="tut-scan-btn"
                        onClick={() => { sessionStorage.setItem('cwg_open_scan', '1'); setActiveTab('scan'); }}
                        className="pressable relative overflow-hidden bg-card-gray rounded-[20px] p-4 pb-16 text-left"
                    >
                        <div className="text-[17px] font-bold text-t-primary">낙첨복권 스캔</div>
                        <div className="text-[13px] text-t-muted font-medium mt-1">스캔하고 경품 응모</div>
                        <img src="/icons/qr.png" alt="" className="absolute -right-1 -bottom-1 w-20 h-20 object-contain pointer-events-none" />
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className="pressable relative overflow-hidden bg-card-gray rounded-[20px] p-4 pb-16 text-left"
                    >
                        <div className="text-[17px] font-bold text-t-primary">경품추첨</div>
                        <div className="text-[13px] text-t-muted font-medium mt-1">응모 현황 보기</div>
                        <img src="/icons/gift.png" alt="" className="absolute -right-1 -bottom-1 w-20 h-20 object-contain pointer-events-none" />
                    </button>
                </div>
            )}

            {/* ── 퀵메뉴 — 쏘카식 4×2 그리드 ─────────────────── */}
            {!isGuest && (
                <section className="mt-3 px-6">
                    <div className="bg-card-gray rounded-[20px] p-4 grid grid-cols-4 gap-y-5 gap-x-2">
                        {[
                            { img: '/menu/attendance.png', label: '출석체크', onClick: () => router.push('/attendance') },
                            { img: '/menu/invite.png', label: '친구초대', onClick: () => router.push('/invite') },
                            { img: '/menu/daily_ads.png', label: '광고 보기', onClick: () => router.push('/daily_ads') },
                            { img: '/menu/coupon.png', label: '쿠폰함', onClick: () => router.push('/coupon_wallet') },
                            { img: '/menu/scan_history.png', label: '스캔 내역', onClick: () => router.push('/point_history') },
                            { img: '/menu/number_sense.png', label: '넘버 센스', onClick: () => router.push('/number_sense') },
                            { img: '/menu/lucky_score.png', label: '럭키 스코어', onClick: () => setActiveTab && setActiveTab('contents') },
                            { img: '/menu/pulli.png', label: 'AI 풀리', onClick: () => router.push('/chat') },
                        ].map(m => (
                            <button
                                key={m.label}
                                onClick={m.onClick}
                                className="pressable flex flex-col items-center gap-1.5"
                            >
                                <img src={m.img} alt="" className="w-11 h-11 object-contain" />
                                <span className="text-[12px] font-semibold text-t-secondary whitespace-nowrap">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* ── 포인트 안내 미니 배너 ─────────────────────── */}
            {!isGuest && (
                <section className="mt-3 px-6">
                    <button
                        onClick={() => router.push('/point_guide')}
                        className="pressable block w-full text-left"
                    >
                        <div className="relative overflow-hidden rounded-[20px]" style={{ height: 92 }}>
                            <img src="/point_guide_banner.png" alt="" className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none" />
                            {/* 좌측 흰색 그라데이션 오버레이 (글자 가독성) */}
                            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.82) 36%, rgba(255,255,255,0) 66%)' }} />
                            <div className="relative z-10 h-full px-5 flex flex-col justify-center">
                                <div className="text-[16px] font-bold whitespace-nowrap" style={{ color: '#14304C' }}>포인트 안내</div>
                                <div className="text-[13px] font-medium mt-1 whitespace-nowrap" style={{ color: '#5A7794' }}>쌓는 법부터 쓰는 법까지</div>
                            </div>
                        </div>
                    </button>
                </section>
            )}

            {/* ── FULIF 살펴보기 — 쏘카 "오직 쏘카에서만" 스타일 이미지 카드 3장 ── */}
            {!isGuest && (
                <section className="mt-8 px-6">
                    <h2 className="text-[19px] font-bold text-t-primary mb-3">FULIF 살펴보기</h2>
                    <div className="grid grid-cols-3 gap-2.5">
                        {[
                            { key: 'picks', title: <>이번주<br/>FULIF픽</>, sub: '자체 특허 필터링', img: '/home/card_picks.png', onClick: () => setActiveTab && setActiveTab('picks') },
                            { key: 'results', title: <>번호 생성<br/>결과 현황</>, sub: '적중 확인', img: '/home/card_results.png', onClick: () => setActiveTab && setActiveTab('picks') },
                            { key: 'scan', title: <>최근<br/>스캔 내역</>, sub: '번호 등록 기록', img: '/home/card_scan.png', onClick: () => router.push('/point_history') },
                        ].map(c => (
                            <button
                                key={c.key}
                                onClick={c.onClick}
                                className="pressable rounded-[18px] text-left relative overflow-hidden flex flex-col"
                                style={{ aspectRatio: '3 / 4', backgroundColor: '#1E2A24' }}
                            >
                                {/* 배경 이미지 (유저 제공) */}
                                <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                {/* 상단 가독성 그라데이션 */}
                                <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(20,30,25,0.75) 0%, rgba(20,30,25,0) 100%)' }} />
                                <div className="relative z-10 p-3.5">
                                    <h3 className="text-[14px] font-bold text-white leading-snug">{c.title}</h3>
                                    <p className="text-[11px] font-medium text-white/75 mt-0.5">{c.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* ── 이번 회차 통계: 핫·콜드 넘버 + 누적 스캔 ────── */}
            <section className="mt-9 px-6">
                <h2 className="text-[19px] font-bold text-t-primary mb-3">이번 회차 통계</h2>

                {/* 쏘카식 2타일: 핫 넘버 / 콜드 넘버 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card-gray rounded-[20px] p-4">
                        <div className="flex items-center gap-2">
                            <img src="/icons/hot.png" alt="" className="w-10 h-10 object-contain" />
                            <div>
                                <div className="text-[15px] font-bold text-[#F2740D]">핫 넘버</div>
                                <div className="text-[12px] font-medium text-t-muted mt-0.5">가장 많이 나왔어요</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-3.5">
                            {DRAW_STATS.hot.map((n) => (
                                <span key={n} className="h-11 rounded-xl bg-[#FFF1E7] text-[#F2740D] text-[17px] font-bold flex items-center justify-center">
                                    {n}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-card-gray rounded-[20px] p-4">
                        <div className="flex items-center gap-2">
                            <img src="/icons/cold.png" alt="" className="w-10 h-10 object-contain" />
                            <div>
                                <div className="text-[15px] font-bold text-accent">콜드 넘버</div>
                                <div className="text-[12px] font-medium text-t-muted mt-0.5">가장 적게 나왔어요</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-3.5">
                            {DRAW_STATS.cold.map((n) => (
                                <span key={n} className="h-11 rounded-xl bg-accent-soft text-accent text-[17px] font-bold flex items-center justify-center">
                                    {n}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 누적 스캔 와이드 카드 */}
                <div className="bg-card-gray rounded-[20px] px-5 py-4 mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src="/icons/scan-stat.png" alt="" className="w-12 h-12 object-contain" />
                        <span className="text-[15px] font-bold text-t-secondary">누적 스캔</span>
                    </div>
                    <span className="text-[22px] font-bold text-accent tracking-tight">{DRAW_STATS.totalScans.toLocaleString()}건</span>
                </div>
            </section>

            {/* ── FULIF 랭킹 — 쏘카식 가로 스크롤 스탯 카드 ────── */}
            <section className="mt-9">
                <div className="mb-3 px-6">
                    <h2 className="text-[19px] font-bold text-t-primary">FULIF 랭킹</h2>
                </div>

                <div className="px-6 relative">
                    <div
                        ref={ranking.ref}
                        {...ranking.dragProps}
                        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {FULIF_RANKING.map((card) => (
                            <div
                                key={card.key}
                                className="snap-center flex-shrink-0 w-full rounded-[20px] relative overflow-hidden"
                                style={{ aspectRatio: '16 / 9', backgroundColor: '#E9EEF4' }}
                            >
                                {/* 배경 이미지 (유저 제공) */}
                                <img src={card.img} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                                {/* 좌측 가독성 그라데이션 */}
                                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.92) 30%, rgba(255,255,255,0.55) 52%, rgba(255,255,255,0) 72%)' }} />

                                <div className="relative z-10 h-full p-5 flex flex-col justify-center" style={{ maxWidth: '62%' }}>
                                    <span className="inline-block self-start px-2 py-1 rounded-lg text-[12px] font-bold text-white" style={{ background: card.grad }}>
                                        {card.badge}
                                    </span>

                                    {card.headline && (
                                        <p className="text-[22px] font-bold tracking-tight mt-2.5" style={{ color: '#14304C' }}>{card.headline}</p>
                                    )}
                                    {card.sub && (
                                        <p className="text-[13px] font-medium mt-1" style={{ color: '#4E5968' }}>{card.sub}</p>
                                    )}

                                    {/* TOP3 리스트 */}
                                    {card.top3 && (
                                        <div className="flex flex-col gap-1.5 mt-2">
                                            {card.top3.map((t, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-extrabold flex-shrink-0" style={{ backgroundColor: RANK_BADGE[i].bg, color: RANK_BADGE[i].fg }}>{i + 1}</span>
                                                    <div className="flex items-baseline gap-1 min-w-0">
                                                        <span className="text-[13px] font-bold" style={{ color: '#14304C' }}>제{t.round}회</span>
                                                        <span className="text-[13px] font-bold text-accent">{t.rank}</span>
                                                        <span className="text-[12px] font-medium" style={{ color: '#8B95A1' }}>{t.user}님</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {card.footer && (
                                        <p className="text-[12px] font-medium mt-2" style={{ color: '#8B95A1' }}>{card.footer}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 페이지 카운터 (광고배너식) */}
                    <span className="absolute right-9 bottom-3 z-20 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/90 text-[11px] font-semibold tabular-nums">
                        {ranking.idx + 1} / {FULIF_RANKING.length}
                    </span>
                </div>
            </section>

        </div>
    );
}
