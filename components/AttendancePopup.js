import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

/**
 * AttendancePopup — 앱(홈) 첫 진입 시 출석 유도 팝업.
 *
 * 출석 페이지와 동일한 주간 도장판 모델:
 * 도장판은 매주 일요일 00시 초기화, 이번 주 출석 일수 = 도장 수.
 * 보상표(N번째 도장) 1·2번째 5P → 3·4번째 10P → 5·6번째 15P → 7번째(개근) 30P(광고 2배).
 *
 * 노출 조건: 오늘 미출석 && 오늘 아직 팝업 안 봄 (하루 1회)
 * 강제 표시(디자인 확인용): /?popup=attendance — 노출 이력 기록 안 함
 * 저장: cwg_attendance_popup = 'YYYY-MM-DD' (마지막 노출일)
 */

const SHOWN_KEY = 'cwg_attendance_popup';
const CYCLE_REWARDS = [5, 5, 10, 10, 15, 15, 30]; // attendance.js와 동일

const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function AttendancePopup() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [info, setInfo] = useState(null); // { todayStr, streak, todayDay }

    useEffect(() => {
        if (!router.isReady) return;
        const today = new Date();
        const dateStr = toDateStr(today);
        const force = router.query.popup === 'attendance';

        let days = [];
        try { days = JSON.parse(localStorage.getItem('cwg_attendance') || '{}').days || []; } catch {}
        const daySet = new Set(days);
        const checkedToday = daySet.has(dateStr);

        // 이번 주(일~토) 도장 수 — 일요일 00시 초기화. 오늘 출석하면 weekCount + 1 번째 도장
        const sunday = new Date(today);
        sunday.setDate(sunday.getDate() - sunday.getDay());
        let weekCount = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            if (daySet.has(toDateStr(d))) weekCount += 1;
        }

        setInfo({ todayStr: dateStr, todayDay: checkedToday ? weekCount : weekCount + 1, doneInCycle: weekCount });

        if (force) { setVisible(true); return; }
        if (checkedToday) return;
        if (localStorage.getItem(SHOWN_KEY) === dateStr) return;

        localStorage.setItem(SHOWN_KEY, dateStr);
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
    }, [router.isReady, router.asPath]); // asPath 의존 — 데모 재진입(nonce 쿼리 변경) 시에도 다시 뜨게

    if (!visible || !info) return null;

    const { todayDay, doneInCycle } = info;
    const todayPoints = CYCLE_REWARDS[Math.max(0, todayDay - 1)];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setVisible(false)} />
            <div className="relative w-full max-w-[340px] bg-card-gray rounded-[28px] border border-themed-light shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">

                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#4ade80]/15 blur-[60px] rounded-full -translate-y-1/2 pointer-events-none" />

                {/* Close */}
                <button onClick={() => setVisible(false)}
                        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-t-muted hover:text-t-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                {/* 캐릭터 + 인사 */}
                <div className="relative flex flex-col items-center pt-7 px-6">
                    <div style={{ filter: 'drop-shadow(0 8px 24px rgba(74,222,128,0.45))' }}>
                        <Image src="/character.png" alt="풀리" width={112} height={112} unoptimized priority />
                    </div>
                    <h2 className="text-[20px] font-extrabold text-t-primary mt-3">
                        이번 주 <span className="text-[#14b8a6]">{todayDay}번째 도장</span>을 찍어요!
                    </h2>
                    <p className="text-t-muted text-[13px] font-medium mt-1 text-center">
                        출석하면 <span className="text-[#14b8a6] font-bold">+{todayPoints}P</span> · 광고 보면 <span className="text-[#D4AF37] font-bold">한 번 더!</span>
                    </p>
                </div>

                {/* 7일 사이클 트랙 */}
                <div className="mx-5 mt-5 rounded-2xl bg-background border border-themed p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-extrabold text-t-primary">이번 주 도장판</span>
                        <span className="text-[12px] font-bold text-[#14b8a6]">{doneInCycle}/7 완료</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {CYCLE_REWARDS.map((pts, i) => {
                            const day = i + 1;
                            const done = day <= doneInCycle;
                            const isToday = day === todayDay;
                            const isLast = day === 7;
                            return (
                                <div key={day} className="flex flex-col items-center gap-1">
                                    <span className={`text-[9px] font-bold ${isToday ? 'text-[#14b8a6]' : 'text-t-dim'}`}>{day}</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                                        done
                                            ? 'bg-[#14b8a6] border-[#14b8a6]'
                                            : isToday
                                                ? 'bg-[#14b8a6]/10 border-[#14b8a6] border-dashed animate-pulse'
                                                : 'bg-card-gray border-themed'
                                    }`}>
                                        {done ? (
                                            <span className="material-symbols-outlined text-[15px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                        ) : isLast ? (
                                            <span className="material-symbols-outlined text-[14px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                                        ) : (
                                            <span className={`text-[9px] font-extrabold ${isToday ? 'text-[#14b8a6]' : 'text-t-dim'}`}>{pts}</span>
                                        )}
                                    </div>
                                    <span className={`text-[8px] font-bold ${isLast ? 'text-[#D4AF37]' : done ? 'text-[#14b8a6]' : 'text-t-dim'}`}>
                                        {pts}P
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 하단 안내줄 */}
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-t-dim flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-t-dim">restart_alt</span>
                            매주 일요일 00시 초기화
                        </span>
                        <span className="text-[10px] font-bold text-[#D4AF37]">
                            매일 광고 보면 그날 포인트 2배
                        </span>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex gap-3 px-5 py-5">
                    <button
                        onClick={() => { setVisible(false); router.push('/attendance'); }}
                        className="flex-1 py-3.5 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all"
                    >
                        {todayDay}번째 도장 찍고 +{todayPoints}P 받기
                    </button>
                    <button
                        onClick={() => setVisible(false)}
                        className="w-20 py-3.5 rounded-xl bg-btn-secondary text-t-secondary font-semibold text-sm active:scale-95 transition-all border border-themed"
                    >
                        나중에
                    </button>
                </div>
            </div>
        </div>
    );
}
