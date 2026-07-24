import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import InterstitialAd from './components/ads/InterstitialAd';
import ReviewPrompt, { canShowReview, markReviewShown } from '../components/ReviewPrompt';

/**
 * 출석체크 — 주간 도장판 데일리 체크인 (2차 기획 ④ 개편).
 *
 * 도장판은 매주 일요일 00시에 초기화. "이번 주에 출석한 일수"가 도장 수이며,
 * 하루 빠져도 리셋되지 않고 그 주에 찍은 도장 순서대로 보상이 올라간다.
 * - 보상표(N번째 도장): 1·2번째 5P → 3·4번째 10P → 5·6번째 15P → 7번째 30P
 * - 보상은 포인트만. 출석 후 그날 보상형 동영상 광고 1개를 보면 같은 포인트를 1회 더 받는다(2배, 하루 1회)
 * - 초기화 규칙: 매주 일요일 00:00(기기 시간)에 도장판 리셋. 7번째 도장 = 한 주 개근
 * - 저장: cwg_attendance = { days: ['YYYY-MM-DD'], rewards: { date: { points, day, doubled } } }
 * - 7번째 도장(개근) = 만족 순간 → 인앱 리뷰 유도 트리거
 */

const KEY = 'cwg_attendance';
const CYCLE_REWARDS = [5, 5, 10, 10, 15, 15, 30]; // 이번 주 1~7번째 도장 (개근 시 총 90P)
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{"days":[],"rewards":{}}'); }
    catch { return { days: [], rewards: {} }; }
}

/* 오늘(또는 오늘 미출석이면 어제)부터 거꾸로 이어지는 연속 출석일 */
function calcStreak(daySet, today) {
    let streak = 0;
    const cursor = new Date(today);
    if (!daySet.has(toDateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (daySet.has(toDateStr(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

export default function Attendance() {
    const router = useRouter();
    const [state, setState] = useState({ days: [], rewards: {} });
    const [mounted, setMounted] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [showDoublePrompt, setShowDoublePrompt] = useState(false); // 보상 수령 후 "광고 보고 한 번 더" 제안
    const doublePromptShownRef = useRef(false); // 세션 내 1회만 제안 (광고 중도 이탈 시 반복 방지)
    const [showAd, setShowAd] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const today = useMemo(() => new Date(), []);
    const todayStr = toDateStr(today);

    useEffect(() => {
        setState(loadState());
        setMounted(true);
    }, []);

    const daySet = useMemo(() => new Set(state.days), [state.days]);
    const checkedToday = daySet.has(todayStr);
    const streak = mounted ? calcStreak(daySet, today) : 0; // 통산 연속(재미 요소) — 보상과 무관
    const todayReward = state.rewards[todayStr];

    /* 이번 주(일~토) 도장 수 — 일요일 00시 초기화 */
    const weekCount = useMemo(() => {
        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() - sunday.getDay());
        let c = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            if (daySet.has(toDateStr(d))) c += 1;
        }
        return c;
    }, [daySet, today]);

    /* 오늘 찍는(찍은) 도장이 이번 주 몇 번째인지 */
    const todayDay = checkedToday ? weekCount : weekCount + 1;
    /* 이번 주에 이미 찍은 도장 수 */
    const doneInCycle = weekCount;

    const persist = (next) => {
        setState(next);
        localStorage.setItem(KEY, JSON.stringify(next));
    };

    const checkIn = () => {
        if (checkedToday) return;
        const day = weekCount + 1;
        const next = {
            days: [...state.days, todayStr],
            rewards: { ...state.rewards, [todayStr]: { points: CYCLE_REWARDS[day - 1], day, doubled: false } },
        };
        persist(next);
        setShowReward(true);
        // 7일차 완주 = 만족 순간 → 리뷰 유도 (보상 시트 닫은 뒤 노출)
        if (day === 7 && canShowReview('attendance_streak')) {
            markReviewShown('attendance_streak');
            setTimeout(() => setShowReview(true), 400);
        }
    };

    /* 보상 시트 닫기 — 아직 2배 안 받았으면 광고 제안을 이어서 노출 (1회) */
    const closeReward = () => {
        setShowReward(false);
        if (todayReward && !todayReward.doubled && !doublePromptShownRef.current) {
            doublePromptShownRef.current = true;
            setShowDoublePrompt(true);
        }
    };

    const doubleReward = () => {
        const r = state.rewards[todayStr];
        if (!r || r.doubled) return;
        persist({
            ...state,
            rewards: { ...state.rewards, [todayStr]: { ...r, points: r.points * 2, doubled: true } },
        });
    };

    /* 임시(디자인 확인용) — 출석 기록 초기화 */
    const resetAttendance = () => {
        localStorage.removeItem('cwg_attendance');
        localStorage.removeItem('cwg_attendance_popup');
        setState({ days: [], rewards: {} });
        doublePromptShownRef.current = false;
        setShowReward(false);
        setShowDoublePrompt(false);
    };

    /* 이번 달 캘린더 셀 */
    const calendar = useMemo(() => {
        const y = today.getFullYear(), m = today.getMonth();
        const first = new Date(y, m, 1);
        const last = new Date(y, m + 1, 0);
        const cells = Array(first.getDay()).fill(null);
        for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(y, m, d));
        return cells;
    }, [today]);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 출석체크</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-32">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight flex-1">출석체크</h1>
                    {/* 임시 — 디자인 확인용 초기화 버튼 */}
                    <button
                        onClick={resetAttendance}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-themed text-t-muted active:scale-90 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                        <span className="text-[11px] font-bold">초기화</span>
                    </button>
                </div>

                {/* Hero — 캐릭터 + 오늘의 일차 */}
                <div className="mx-6 bg-card-gray rounded-3xl border border-themed mb-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 pointer-events-none"
                         style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />
                    <div className="relative p-6 pr-32">
                        <div className="text-t-muted text-[12px] font-bold mb-1.5">
                            {checkedToday ? '오늘 출석 완료! 이번 주' : '오늘 출석하면 이번 주'}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[40px] font-extrabold tracking-tight leading-none text-t-primary">{todayDay}번째</span>
                            <span className="text-[18px] font-extrabold text-t-secondary">도장</span>
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14b8a6]/12 border border-[#14b8a6]/25">
                            <span className="material-symbols-outlined text-[13px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                            <span className="text-[11px] font-extrabold text-[#14b8a6]">
                                {checkedToday && todayReward
                                    ? `+${todayReward.points}P 받았어요`
                                    : `+${CYCLE_REWARDS[todayDay - 1]}P · 광고 보면 한 번 더`}
                            </span>
                        </div>
                        {streak >= 7 && (
                            <div className="mt-2 text-[11px] font-bold text-[#D4AF37]">
                                🔥 통산 연속 {streak}일 출석 중
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 right-2 pointer-events-none"
                         style={{ filter: 'drop-shadow(0 6px 20px rgba(74,222,128,0.45))' }}>
                        <Image src="/character.png" alt="풀리" width={118} height={118} unoptimized priority />
                    </div>
                </div>

                {/* 7일 보상 트랙 — 1일차~7일차 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-extrabold text-t-primary">이번 주 도장판</span>
                        <span className="text-[11px] font-bold text-t-muted">{doneInCycle}/7 완료</span>
                    </div>
                    <div className="text-[10px] font-semibold text-t-dim mb-4">매주 일요일 00시에 초기화 · 하루 빠져도 이어서 찍어요</div>
                    <div className="grid grid-cols-4 gap-2">
                        {CYCLE_REWARDS.map((pts, i) => {
                            const day = i + 1;
                            const done = day <= doneInCycle;
                            const isTodaySlot = !checkedToday && day === todayDay;
                            const isLast = day === 7;
                            return (
                                <div key={day}
                                     className={`relative flex flex-col items-center gap-1 rounded-2xl py-3 border transition-all ${
                                         done
                                             ? 'bg-[#14b8a6]/12 border-[#14b8a6]/30'
                                             : isTodaySlot
                                                 ? 'bg-background border-[#14b8a6] border-dashed'
                                                 : 'bg-background border-themed'
                                     } ${isLast ? 'col-span-1' : ''}`}>
                                    {isTodaySlot && (
                                        <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-[#14b8a6] text-[8px] font-extrabold text-white">오늘</span>
                                    )}
                                    <span className={`text-[10px] font-bold ${done ? 'text-[#14b8a6]' : isTodaySlot ? 'text-t-primary' : 'text-t-dim'}`}>
                                        {day}번째
                                    </span>
                                    {done ? (
                                        <span className="material-symbols-outlined text-[20px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    ) : (
                                        <span className={`material-symbols-outlined text-[20px] ${isLast ? 'text-[#D4AF37]' : isTodaySlot ? 'text-[#14b8a6]' : 'text-t-dim'}`}
                                              style={{ fontVariationSettings: "'FILL' 1" }}>
                                            {isLast ? 'redeem' : 'toll'}
                                        </span>
                                    )}
                                    <span className={`text-[11px] font-extrabold ${isLast ? 'text-[#D4AF37]' : done ? 'text-[#14b8a6]' : 'text-t-muted'}`}>
                                        {pts}P
                                    </span>
                                    {isLast && <span className="text-[8px] font-bold text-[#D4AF37]">개근</span>}
                                </div>
                            );
                        })}
                        {/* 개근 합계 칸 */}
                        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl py-3 border border-[#D4AF37]/30 bg-[#D4AF37]/8">
                            <span className="text-[10px] font-bold text-[#D4AF37]">개근 시</span>
                            <span className="text-[15px] font-extrabold text-[#D4AF37] leading-none">90P</span>
                            <span className="text-[8px] font-bold text-t-dim">광고 시 최대 180P</span>
                        </div>
                    </div>
                </div>

                {/* 규칙 안내 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                    <div className="text-sm font-extrabold text-t-primary mb-3">출석 규칙</div>
                    <div className="flex flex-col gap-2.5">
                        {[
                            { icon: 'schedule', text: '매일 자정(00:00)에 새 출석이 열려요 · 하루 1회' },
                            { icon: 'restart_alt', text: '도장판은 매주 일요일 00시에 초기화돼요' },
                            { icon: 'favorite', text: '하루 빠져도 괜찮아요 — 이번 주에 출석한 일수만큼 도장이 쌓여요' },
                            { icon: 'smart_display', text: '출석 후 동영상 광고 1개를 보면 그날 포인트를 한 번 더 받아요 (하루 1회)' },
                        ].map((r, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-[16px] text-[#14b8a6] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                                <span className="text-[12px] font-medium text-t-muted leading-relaxed flex-1">{r.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 출석 기록 캘린더 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                    <div className="text-sm font-extrabold text-t-primary mb-4">
                        {today.getFullYear()}년 {today.getMonth() + 1}월 출석 기록
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 text-center">
                        {WEEKDAYS.map((w, i) => (
                            <div key={w} className={`text-[11px] font-bold pb-1 ${i === 0 ? 'text-[#FF6B6B]' : 'text-t-dim'}`}>{w}</div>
                        ))}
                        {calendar.map((d, i) => {
                            if (!d) return <div key={`e${i}`} />;
                            const ds = toDateStr(d);
                            const checked = daySet.has(ds);
                            const isToday = ds === todayStr;
                            const isFuture = d > today;
                            return (
                                <div key={ds} className="flex items-center justify-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold relative ${
                                        checked
                                            ? 'bg-[#14b8a6]/15 text-[#14b8a6]'
                                            : isToday
                                                ? 'border border-themed-light text-t-primary'
                                                : isFuture ? 'text-t-faint' : 'text-t-muted'
                                    }`}>
                                        {checked ? (
                                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        ) : (
                                            d.getDate()
                                        )}
                                        {isToday && !checked && (
                                            <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#14b8a6]" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Check-in CTA */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 pb-8 bg-gradient-to-t from-background via-background to-transparent">
                    <button
                        onClick={checkIn}
                        disabled={!mounted || checkedToday}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all ${
                            checkedToday
                                ? 'bg-btn-secondary text-t-dim'
                                : 'bg-bg-inverse text-t-inverse active:scale-95'
                        }`}
                    >
                        {checkedToday
                            ? '오늘 출석 완료 ✓'
                            : `${todayDay}번째 도장 찍고 +${CYCLE_REWARDS[todayDay - 1]}P 받기`}
                    </button>
                </div>

                {/* ① 출석 보상 시트 — 포인트 수령 확인 */}
                {showReward && todayReward && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => closeReward()} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-8 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-[11px] font-bold text-t-muted mb-4 tracking-widest uppercase">
                                    이번 주 {todayReward.day}번째 출석 완료
                                </div>
                                <div className="w-16 h-16 rounded-full bg-[#14b8a6]/15 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[30px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                                </div>
                                <div className="text-[24px] font-extrabold text-[#14b8a6] mb-1">+{todayReward.points}P</div>
                                <div className="text-[13px] text-t-muted font-medium mb-5">
                                    {todayReward.doubled
                                        ? <span className="text-[#D4AF37] font-bold">광고 시청 완료 — 오늘 포인트를 2배로 받았어요!</span>
                                        : '포인트가 적립되었어요'}
                                </div>
                                <button
                                    onClick={() => closeReward()}
                                    className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ② 광고 2배 제안 — 보상 수령 확인 후 별도로 노출 */}
                {showDoublePrompt && todayReward && !todayReward.doubled && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowDoublePrompt(false)} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-8 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[30px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_display</span>
                                </div>
                                <div className="text-[17px] font-extrabold text-t-primary mb-1.5">
                                    오늘 출석 포인트, 한 번 더 받을 수 있어요!
                                </div>
                                <div className="text-[13px] text-t-muted font-medium mb-6">
                                    동영상 광고 1개를 보면 <span className="text-[#D4AF37] font-extrabold">+{todayReward.points}P</span>를 추가로 드려요
                                </div>
                                <button
                                    onClick={() => { setShowDoublePrompt(false); setShowAd(true); }}
                                    className="w-full py-4 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] font-extrabold text-sm border border-[#D4AF37]/30 active:scale-95 transition-all mb-2"
                                >
                                    광고 보고 +{todayReward.points}P 더 받기
                                </button>
                                <button
                                    onClick={() => setShowDoublePrompt(false)}
                                    className="w-full py-3 rounded-xl bg-transparent text-t-dim font-semibold text-[13px] active:scale-95 transition-all"
                                >
                                    괜찮아요
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 보상형 전면광고 (매일 1회 포인트 2배 — 유저 선택형이라 캡 제외) */}
                <InterstitialAd
                    open={showAd}
                    countdownSec={5}
                    index={1}
                    onReward={doubleReward}
                    onClose={() => { setShowAd(false); setShowReward(true); }}
                />

                <ReviewPrompt open={showReview} onClose={() => setShowReview(false)} />
            </div>
        </div>
    );
}
