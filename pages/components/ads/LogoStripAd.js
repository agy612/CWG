import React, { useEffect, useRef } from 'react';
import { SPONSOR_LOGOS } from './dummyAds';

/**
 * LogoStripAd — minimal white-themed strip of rotating sponsor logos.
 * Just logos sliding horizontally on a clean light background.
 */
export default function LogoStripAd({ className = '', noMargin = false }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        let raf;
        let pos = 0;
        const speed = 0.4; // px per frame
        const tick = () => {
            pos += speed;
            if (pos >= el.scrollWidth / 2) pos = 0;
            el.scrollLeft = pos;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    // Duplicate logos for seamless infinite loop
    const logos = [...SPONSOR_LOGOS, ...SPONSOR_LOGOS];
    const marginX = noMargin ? '' : 'mx-6';

    return (
        <div className={`${marginX} ${className}`}>
            <div className="relative overflow-hidden">
                {/* AD label */}
                <span className="absolute top-1.5 right-2 z-20 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded text-t-dim bg-btn-secondary">
                    AD
                </span>
                {/* Scroll strip */}
                <div ref={scrollRef} className="flex items-center gap-7 overflow-hidden py-3.5 px-5" style={{ scrollBehavior: 'auto' }}>
                    {logos.map((logo, idx) => (
                        <LogoChip key={`${logo.id}-${idx}`} logo={logo} />
                    ))}
                </div>
                {/* Edge fades to background (테마 배경색 따라감) */}
                <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
                     style={{ background: 'linear-gradient(to right, var(--color-bg), transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
                     style={{ background: 'linear-gradient(to left, var(--color-bg), transparent)' }} />
            </div>
        </div>
    );
}

function LogoChip({ logo }) {
    return (
        <div className="flex-shrink-0 flex items-center justify-center h-5">
            <img
                src={logo.src}
                alt=""
                draggable={false}
                className="h-5 w-auto object-contain select-none"
                style={{ maxWidth: 78 }}
            />
        </div>
    );
}
