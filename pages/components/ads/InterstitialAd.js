import React, { useEffect, useState } from 'react';
import { INTERSTITIAL_ADS, pickByIndex } from './dummyAds';

/**
 * InterstitialAd — full-screen modal ad with countdown.
 *
 * Props:
 *   open           — boolean, mount controlled by parent
 *   onClose        — fired when user closes (after countdown)
 *   onReward       — fired ONCE when countdown completes (for reward-style ads)
 *   countdownSec   — seconds before close (X) button enables (default 5)
 *   index          — ad index (default 0)
 */
export default function InterstitialAd({ open, onClose, onReward, countdownSec = 5, index = 0 }) {
    const [remaining, setRemaining] = useState(countdownSec);
    const [rewarded, setRewarded] = useState(false);

    useEffect(() => {
        if (!open) {
            setRemaining(countdownSec);
            setRewarded(false);
            return;
        }
        if (remaining <= 0) {
            if (!rewarded) {
                setRewarded(true);
                onReward?.();
            }
            return;
        }
        const t = setTimeout(() => setRemaining(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [open, remaining, rewarded, countdownSec, onReward]);

    if (!open) return null;

    const ad = pickByIndex(INTERSTITIAL_ADS, index);
    const canClose = remaining <= 0;

    return (
        <div className="fixed inset-0 z-[1000] flex items-stretch justify-center max-w-[430px] mx-auto">
            {/* Backdrop blocks underlying UI */}
            <div className="absolute inset-0 bg-black" />

            <div className="relative w-full h-full flex flex-col" style={{ background: ad.bg }}>
                {/* Top bar — AD label + close/countdown */}
                <div className="flex items-center justify-between px-5 pt-12 pb-3 z-30">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold tracking-widest px-2 py-1 rounded bg-white/15 text-white/90">광고</span>
                        <span className="text-[10px] font-semibold text-white/50">{ad.brand}</span>
                    </div>
                    <button
                        onClick={canClose ? onClose : undefined}
                        disabled={!canClose}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${canClose ? 'bg-white/15 active:scale-90' : 'bg-white/5'}`}
                    >
                        {canClose ? (
                            <span className="material-symbols-outlined text-[22px] text-white">close</span>
                        ) : (
                            <span className="text-[14px] font-extrabold text-white/80">{remaining}</span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">
                    {/* Decorative glow */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20 pointer-events-none"
                         style={{ background: `radial-gradient(circle, ${ad.accent}, transparent 70%)` }} />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="text-[10px] font-extrabold tracking-[0.3em] mb-4 px-3 py-1.5 rounded-full"
                             style={{ background: `${ad.accent}22`, color: ad.accent, border: `1px solid ${ad.accent}40` }}>
                            {ad.badge}
                        </div>

                        <div className="text-white/80 text-[18px] font-semibold mb-2">{ad.title}</div>
                        <div className="text-[64px] leading-none font-extrabold mb-5 tracking-tight" style={{ color: ad.accent }}>
                            {ad.highlight}
                        </div>
                        <div className="text-white/60 text-[14px] font-medium mb-12 max-w-[280px] leading-relaxed">
                            {ad.sub}
                        </div>

                        {/* Mock product mockup */}
                        <div className="relative w-48 h-48 mb-10">
                            <div className="absolute inset-0 rounded-[36px] backdrop-blur-xl"
                                 style={{ background: `${ad.accent}15`, border: `1px solid ${ad.accent}40` }} />
                            <div className="absolute inset-4 rounded-[28px] flex items-center justify-center"
                                 style={{ background: `linear-gradient(135deg, ${ad.accent}30, transparent)` }}>
                                <span className="text-[80px] font-extrabold opacity-40" style={{ color: ad.accent }}>
                                    {ad.brand[0]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-6 pb-10 z-30">
                    <button
                        className="w-full py-5 rounded-2xl font-extrabold text-base active:scale-95 transition-all shadow-2xl"
                        style={{ background: ad.accent, color: '#000' }}
                    >
                        {ad.cta} →
                    </button>
                    {!canClose && (
                        <p className="text-center text-white/40 text-[11px] font-medium mt-3">
                            {remaining}초 후 광고를 닫을 수 있습니다
                        </p>
                    )}
                    {canClose && rewarded && (
                        <p className="text-center text-[11px] font-bold mt-3" style={{ color: ad.accent }}>
                            ✓ 보상 적립 완료 — 닫기를 눌러주세요
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
