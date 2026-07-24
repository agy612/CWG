import React from 'react';
import { BANNER_ADS, pickByIndex } from './dummyAds';

/**
 * BannerAd — three sizes:
 *   size="small"  : 320×80 (compact)
 *   size="medium" : full-width × 100~120 (default)
 *   size="mrec"   : full-width × 250 (medium rectangle)
 *   size="large"  : full-width × 200 (full-bleed banner)
 *
 * Pass `index` to pick a deterministic ad from the rotation.
 */
export default function BannerAd({ size = 'medium', index = 0, className = '', noMargin = false }) {
    const ad = pickByIndex(BANNER_ADS, index);

    const heights = {
        small:  72,
        medium: 100,
        mrec:   250,
        large:  200,
    };
    const height = heights[size] || 100;
    const marginX = noMargin ? '' : 'mx-6';

    if (size === 'mrec' || size === 'large') {
        return (
            <div className={`${marginX} ${className}`}>
                <div className="relative rounded-2xl overflow-hidden" style={{ height, background: ad.bg }}>
                    <AdLabel />
                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70" style={{ color: ad.accent }}>
                                {ad.brand}
                            </div>
                            <div className="text-white font-extrabold leading-tight mt-2" style={{ fontSize: size === 'mrec' ? 24 : 22 }}>
                                {ad.title}
                            </div>
                            <div className="text-white/70 text-[12px] font-medium mt-1.5">
                                {ad.sub}
                            </div>
                        </div>
                        <button className="self-start px-5 py-2.5 rounded-full text-[12px] font-extrabold active:scale-95 transition-all"
                                style={{ background: ad.accent, color: '#000' }}>
                            {ad.cta} →
                        </button>
                    </div>
                    <DecorativeOrb accent={ad.accent} />
                </div>
            </div>
        );
    }

    // small / medium horizontal
    return (
        <div className={`${marginX} ${className}`}>
            <div className="relative rounded-2xl overflow-hidden flex items-center" style={{ height, background: ad.bg }}>
                <AdLabel />
                <div className="relative z-10 flex items-center justify-between w-full px-5 gap-3">
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-0.5" style={{ color: ad.accent }}>
                            {ad.brand}
                        </div>
                        <div className="text-white font-extrabold leading-tight truncate" style={{ fontSize: size === 'small' ? 13 : 15 }}>
                            {ad.title}
                        </div>
                        {size !== 'small' && (
                            <div className="text-white/70 text-[11px] font-medium mt-0.5 truncate">
                                {ad.sub}
                            </div>
                        )}
                    </div>
                    <button className="flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] font-extrabold active:scale-95 transition-all"
                            style={{ background: ad.accent, color: '#000' }}>
                        {ad.cta}
                    </button>
                </div>
                <DecorativeOrb accent={ad.accent} />
            </div>
        </div>
    );
}

function AdLabel() {
    return (
        <div className="absolute top-1.5 right-2 z-20 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white/80">
            AD
        </div>
    );
}

function DecorativeOrb({ accent }) {
    return (
        <>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                 style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />
            <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                 style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />
        </>
    );
}
