import React, { useState } from 'react';
import { BANNER_ADS, pickByIndex } from './dummyAds';

/**
 * StickyBottomAd — anchored above BottomNav (fixed positioning).
 * Always visible on tabs that show BottomNav.
 */
export default function StickyBottomAd({ index = 0, bottomOffset = 80 }) {
    const [closed, setClosed] = useState(false);
    if (closed) return null;

    const ad = pickByIndex(BANNER_ADS, index);

    return (
        <div
            className="fixed left-0 right-0 max-w-[430px] mx-auto z-30 px-3 pointer-events-none"
            style={{ bottom: bottomOffset }}
        >
            <div
                className="relative rounded-2xl overflow-hidden flex items-center pointer-events-auto shadow-2xl"
                style={{ height: 84, background: ad.bg }}
            >
                <div className="absolute top-1.5 left-2 z-20 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white/80">
                    AD
                </div>

                <div className="relative z-10 flex items-center justify-between w-full px-4 gap-3">
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-0.5"
                             style={{ color: ad.accent }}>
                            {ad.brand}
                        </div>
                        <div className="text-white font-extrabold text-[13px] leading-tight truncate">
                            {ad.title}
                        </div>
                        <div className="text-white/70 text-[10px] font-medium mt-0.5 truncate">
                            {ad.sub}
                        </div>
                    </div>
                    <button className="flex-shrink-0 px-3.5 py-2 rounded-full text-[10px] font-extrabold active:scale-95 transition-all"
                            style={{ background: ad.accent, color: '#000' }}>
                        {ad.cta}
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setClosed(true); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center z-30"
                >
                    <span className="material-symbols-outlined text-[12px] text-white/80">close</span>
                </button>

                {/* Decorative orb */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                     style={{ background: `radial-gradient(circle, ${ad.accent}, transparent)` }} />
            </div>
        </div>
    );
}
