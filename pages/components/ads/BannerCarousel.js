import React, { useEffect, useRef, useState } from 'react';
import { BANNER_ADS, pickByIndex } from './dummyAds';

/**
 * BannerCarousel — horizontally swipeable banner ads with dot indicators.
 *
 * Props:
 *   size       — 'medium' | 'large' | 'mrec' (passed to each banner)
 *   count      — number of ads in carousel (default 3)
 *   startIndex — first ad index in BANNER_ADS rotation (default 0)
 */
export default function BannerCarousel({ size = 'medium', count = 3, startIndex = 0 }) {
    const scrollRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);

    const ads = Array.from({ length: count }, (_, i) => pickByIndex(BANNER_ADS, startIndex + i));

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => {
            const w = el.clientWidth;
            const idx = Math.round(el.scrollLeft / w);
            setActiveIdx(Math.max(0, Math.min(idx, count - 1)));
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [count]);

    const heights = { small: 72, medium: 100, mrec: 250, large: 200 };
    const height = heights[size] || 100;

    const goto = (i) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    };

    return (
        <div className="mx-6">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-1.5 px-1.5"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
                <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
                {ads.map((ad, i) => (
                    <div key={ad.id + '-' + i} className="snap-center flex-shrink-0 w-full">
                        {size === 'mrec' || size === 'large' ? (
                            <BannerLarge ad={ad} height={height} size={size} />
                        ) : (
                            <BannerSmall ad={ad} height={height} size={size} />
                        )}
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            {count > 1 && (
                <div className="flex justify-center gap-1.5 mt-2.5">
                    {ads.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goto(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === activeIdx ? 'w-5 bg-white/70' : 'w-1.5 bg-white/20'
                            }`}
                            aria-label={`Banner ${i + 1}`}
                        />
                    ))}
                </div>
            )}
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

function BannerLarge({ ad, height, size }) {
    return (
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
    );
}

function BannerSmall({ ad, height, size }) {
    return (
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
    );
}
