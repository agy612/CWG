import React, { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Splash — full-screen brand intro shown once per session.
 * Auto-dismisses after `duration` ms, then fades out.
 */
export default function Splash({ duration = 1800, onDone }) {
    const [stage, setStage] = useState('show'); // 'show' | 'fade' | 'done'

    useEffect(() => {
        const t1 = setTimeout(() => setStage('fade'), duration);
        const t2 = setTimeout(() => {
            setStage('done');
            onDone?.();
        }, duration + 400);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [duration, onDone]);

    if (stage === 'done') return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center max-w-[430px] mx-auto transition-opacity duration-[400ms] ease-out"
            style={{
                opacity: stage === 'fade' ? 0 : 1,
                background: 'radial-gradient(ellipse at center, #0a1f24 0%, #050b0e 70%, #000 100%)',
            }}
        >
            {/* Animated glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-1/2 left-1/2 w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 splash-glow"
                    style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 60%)' }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 splash-glow-slow"
                    style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)' }}
                />
            </div>

            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center splash-rise">
                {/* Character */}
                <div style={{ filter: 'drop-shadow(0 12px 40px rgba(74,222,128,0.5))' }}>
                    <Image src="/character.png" alt="CWG" width={160} height={160} unoptimized priority />
                </div>

                {/* Wordmark */}
                <div className="mt-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            auto_awesome
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.4em] text-[#14b8a6] uppercase">CWG AI</span>
                    </div>
                    <h1 className="text-[36px] font-extrabold text-white tracking-tight leading-none">
                        Catch Win Game
                    </h1>
                    <p className="mt-3 text-[12px] text-white/40 font-medium tracking-[0.2em] uppercase">
                        당신의 운이 시작됩니다
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes splash-glow-pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.3; }
                    50%      { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
                }
                @keyframes splash-glow-slow {
                    0%, 100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.12; }
                    50%      { transform: translate(-50%, -50%) scale(1.05); opacity: 0.2; }
                }
                @keyframes splash-rise {
                    0%   { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .splash-glow      { animation: splash-glow-pulse 2.4s ease-in-out infinite; }
                .splash-glow-slow { animation: splash-glow-slow  3.6s ease-in-out infinite; }
                .splash-rise      { animation: splash-rise       0.7s ease-out both; }
            `}</style>
        </div>
    );
}
