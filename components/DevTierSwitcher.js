import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

const TIERS = ['GUEST', 'FREE', 'STANDARD', 'PRO'];

const TIER_STYLE = {
    GUEST:    { bg: 'bg-zinc-700',         text: 'text-zinc-200',  dot: 'bg-zinc-400' },
    FREE:     { bg: 'bg-zinc-600',         text: 'text-t-primary', dot: 'bg-zinc-300' },
    STANDARD: { bg: 'bg-white/20',         text: 'text-t-primary', dot: 'bg-white'    },
    PRO:      { bg: 'bg-[#D4AF37]/80',     text: 'text-black',     dot: 'bg-yellow-900' },
};

export default function DevTierSwitcher() {
    const router = useRouter();
    const { tier, switchTier, points, scansThisMonth, maxScansPerMonth } = useUser();
    const [open, setOpen] = useState(false);

    const resetFlow = () => {
        localStorage.removeItem('user_registered');
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('lottery_selected');
        setOpen(false);
        router.replace('/login');
    };

    const style = TIER_STYLE[tier];

    return (
        <div className="fixed top-4 right-3 z-[9999] flex flex-col items-end gap-2">
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow-lg border border-themed-light transition-all active:scale-95 ${style.bg} ${style.text}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {tier}
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {open ? 'expand_less' : 'tune'}
                </span>
            </button>

            {/* Panel */}
            {open && (
                <div className="bg-[#111] border border-themed-light rounded-2xl p-4 shadow-2xl min-w-[180px]">
                    <div className="text-[10px] font-bold text-t-muted uppercase tracking-widest mb-3">
                        Dev · 티어 전환
                    </div>

                    {/* Tier Buttons */}
                    <div className="flex flex-col gap-1.5 mb-3">
                        {TIERS.map(t => {
                            const s = TIER_STYLE[t];
                            return (
                                <button
                                    key={t}
                                    onClick={() => { switchTier(t); setOpen(false); }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                        tier === t
                                            ? `${s.bg} ${s.text} shadow-md`
                                            : 'bg-btn-secondary text-t-secondary hover:bg-card-hover'
                                    }`}
                                >
                                    {tier === t && (
                                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    )}
                                    {t}
                                </button>
                            );
                        })}
                    </div>

                    {/* Current State Info */}
                    <div className="border-t border-themed pt-3 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-t-dim font-medium">포인트</span>
                            <span className="text-t-primary font-bold">{points.toLocaleString()}P</span>
                        </div>
                        {maxScansPerMonth > 0 && (
                            <div className="flex justify-between text-[10px]">
                            <span className="text-t-dim font-medium">스캔</span>
                                <span className="text-t-primary font-bold">{scansThisMonth}/{maxScansPerMonth}</span>
                            </div>
                        )}
                    </div>

                    {/* Reset Flow Button */}
                    <button
                        onClick={resetFlow}
                        className="mt-3 w-full py-2 rounded-xl bg-red-900/40 text-red-400 text-[10px] font-bold border border-red-900/40 active:scale-95 transition-all hover:bg-red-900/60"
                    >
                        ↺ 온보딩 리셋 (처음부터)
                    </button>

                    {/* Dev Pages */}
                    <div className="mt-3 border-t border-themed pt-3 flex flex-col gap-1.5">
                        <div className="text-[10px] font-bold text-t-dim uppercase tracking-widest mb-1">Dev Pages</div>
                        {[
                            { label: '스캔 에러 상태', route: '/scan_error', icon: 'photo_camera' },
                            { label: '프로모션 팝업', route: '/promo_preview', icon: 'redeem' },
                            { label: '출석 팝업', route: '/?popup=attendance', icon: 'event_available' },
                            { label: '리뷰 유도 팝업', route: '/scan_complete?review=1', icon: 'reviews' },
                            { label: '푸시 랜딩 (번호 도착)', route: '/number_push', icon: 'notifications_active' },
                        ].map(({ label, route, icon }) => (
                            <button
                                key={route}
                                onClick={() => {
                                    // 같은 URL 재진입 시에도 팝업이 다시 뜨도록 쿼리 라우트엔 nonce를 붙인다
                                    const target = route.includes('?') ? `${route}&t=${Date.now()}` : route;
                                    router.push(target);
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-btn-secondary text-btn-secondary-text text-[10px] font-bold hover:bg-card-hover transition-colors active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[13px] text-t-muted">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
