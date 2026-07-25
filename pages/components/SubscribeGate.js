import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

/**
 * SubscribeGate — 구독 전용 콘텐츠(넘버 센스 · 럭키 스코어 · 풀리) 접근 시
 * 무료·게스트에게 노출하는 공통 구독 유도 화면. 토스/쏘카 라이트 스타일.
 *
 * props:
 *  - character: 캐릭터 이미지 경로
 *  - glow: 캐릭터 뒤 광원 색 (rgba)
 *  - title: 히어로 타이틀 (JSX)
 *  - desc: 서브 설명 (JSX/string)
 *  - benefits: [{ icon, desc }]
 *  - onBack: 뒤로가기 핸들러 (없으면 router.back)
 */
export default function SubscribeGate({ character = '/char_coach.png', glow = 'rgba(49,130,246,0.35)', title, desc, benefits = [], onBack }) {
    const router = useRouter();
    const back = onBack || (() => router.back());

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen flex flex-col">
            <div className="relative flex flex-col w-full max-w-[430px] mx-auto flex-1">
                {/* Header */}
                <div className="pt-12 pb-3 px-5 flex items-center gap-3 bg-background z-10">
                    <button onClick={back} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[26px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <span className="ml-auto text-[10px] font-extrabold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2.5 py-1 rounded-full">구독 전용</span>
                </div>

                {/* 본문 — 구독 유도 */}
                <div className="flex-1 flex flex-col items-center text-center px-8 pt-6 pb-8">
                    <div style={{ filter: `drop-shadow(0 10px 30px ${glow})` }}>
                        <Image src={character} alt="" width={150} height={150} unoptimized priority />
                    </div>
                    <h2 className="text-[22px] font-extrabold tracking-tight mt-5 leading-snug">{title}</h2>
                    <p className="text-[13px] text-t-muted font-medium mt-3 leading-relaxed">{desc}</p>

                    {/* 혜택 */}
                    <div className="w-full mt-7 flex flex-col gap-2.5">
                        {benefits.map((b) => (
                            <div key={b.desc} className="flex items-center gap-3 p-3.5 rounded-2xl border bg-card-gray border-themed">
                                <span className="material-symbols-outlined text-[20px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                                <span className="text-[13px] font-semibold text-t-secondary flex-1 text-left">{b.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-8 pt-2">
                    <button
                        onClick={() => router.push('/subscription')}
                        className="w-full py-4 rounded-xl bg-accent text-accent-fg font-extrabold text-base active:scale-95 transition-all"
                    >
                        PRO 구독하고 이용하기
                    </button>
                </div>
            </div>
        </div>
    );
}
