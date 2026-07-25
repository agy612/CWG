import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const slides = [
    {
        icon: 'qr_code_scanner',
        title: '낙첨 복권을 스캔하세요',
        desc: '낙첨된 복권도 가치가 있어요. 스캔하면 포인트로 돌려받아요!',
        button: '다음 →'
    },
    {
        icon: 'data_usage',
        title: 'CWG 픽을 받아보세요',
        desc: '수집된 데이터를 분석해서 매주 새로운 추천 번호를 제공해드려요.',
        button: '다음 →'
    },
    {
        icon: 'emoji_events',
        title: '나만의 번호를 만들어보세요',
        desc: '럭키이벤트에서 20개 필터를 조절해서 자신만의 번호를 뽑아보세요!',
        button: '시작하기'
    }
];

export default function Onboarding() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slide = slides[currentSlide];
    const isLast = currentSlide === slides.length - 1;

    const goToSignup = () => {
        localStorage.setItem('onboarding_completed', 'true');
        router.push('/');
    };

    const nextSlide = () => {
        if (!isLast) {
            setCurrentSlide(curr => curr + 1);
        } else {
            goToSignup();
        }
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased overflow-x-hidden min-h-screen">
            <Head>
                <title>CWG - Onboarding</title>
            </Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                {/* Top bar */}
                <div className="flex justify-end p-6">
                    <button onClick={goToSignup} className="text-t-muted text-sm font-semibold hover:text-t-primary transition-colors">
                        건너뛰기
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col px-6 justify-center pb-20">

                    {/* Abstract SVG Illustration box */}
                    <div className="w-full aspect-square max-h-[300px] mb-12 relative flex items-center justify-center">
                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-accent-soft blur-[60px] rounded-full" />
                        <div className="relative z-10 size-32 bg-gradient-to-tr from-zinc-800 to-zinc-700 rounded-full border border-themed-light flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-[64px] text-t-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>
                                {slide.icon}
                            </span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight mb-4">{slide.title}</h2>
                    <p className="text-t-secondary text-[15px] leading-relaxed font-medium">
                        {slide.desc}
                    </p>
                </div>

                {/* Bottom Navigation */}
                <div className="p-6 flex flex-col gap-8 pb-12">
                    {/* Dots */}
                    <div className="flex gap-2 justify-center">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-bg-inverse' : 'w-2 bg-btn-secondary'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        className={`w-full py-4 rounded-xl font-bold text-base active:scale-95 transition-all ${isLast
                                ? 'bg-accent text-accent-fg shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                : 'bg-card-gray text-t-primary border border-themed-light hover:bg-btn-secondary'
                            }`}
                    >
                        {slide.button}
                    </button>
                </div>

            </div>
        </div >
    );
}
