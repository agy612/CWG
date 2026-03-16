import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

const TUTORIAL_STEPS = [
    {
        id: 1,
        title: '낙첨 티켓 스캔',
        subtitle: '스캔하고 포인트 받기',
        desc: '카메라로 낙첨 티켓을 스캔하거나 직접 번호를 입력하여 포인트를 적립하세요.',
        screenshot: '/images/tutorial/scan.png',
        highlights: [
            '티어별 50P~100P 획득',
            '광고 시청으로 추가 보너스',
            '월 최대 30회까지 스캔 가능'
        ],
        icon: 'photo_camera'
    },
    {
        id: 2,
        title: 'CWG 픽 확인',
        subtitle: '데이터 분석 기반 추천 번호',
        desc: '데이터 분석 기반 추천 번호 10세트를 확인하고 활용하세요.',
        screenshot: '/images/tutorial/picks.png',
        highlights: [
            '신뢰도별 정렬된 10개 세트',
            '포인트로 1회 열람 가능',
            '구독 시 무제한 이용'
        ],
        icon: 'psychology'
    },
    {
        id: 3,
        title: '챔피언십 생성',
        subtitle: '나만의 전략으로 번호 만들기',
        desc: '35가지 필터를 조합하여 나만의 전략으로 번호를 생성할 수 있습니다.',
        screenshot: '/images/tutorial/championship.png',
        highlights: [
            '핫/콜드 넘버 필터',
            '홀짝·구간 분산 조정',
            '프리셋 저장 및 재사용'
        ],
        icon: 'military_tech'
    },
    {
        id: 4,
        title: '포인트 활용',
        subtitle: '모으고 사용하기',
        desc: '스캔, 광고 시청 등으로 포인트를 모아 다양하게 활용하세요.',
        screenshot: '/images/tutorial/points.png',
        highlights: [
            '픽 열람 및 챔피언십 생성',
            '포인트샵 쿠폰 구매',
            '구독 시 적립률 최대 2배'
        ],
        icon: 'toll'
    }
];

export default function Tutorial() {
    const router = useRouter();
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < TUTORIAL_STEPS.length - 1) {
            swiperInstance?.slideNext();
        } else {
            router.back();
        }
    };

    const handleSkip = () => {
        router.back();
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 사용 가이드</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl">

                {/* Header */}
                <div className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto pt-12 pb-4 px-6 flex items-center justify-between bg-background/95 backdrop-blur-sm z-50">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">close</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">사용 가이드</h1>
                    <button onClick={handleSkip} className="text-sm font-semibold text-t-secondary hover:text-t-primary transition-colors">
                        건너뛰기
                    </button>
                </div>

                {/* Main Content - Swiper */}
                <div className="flex-1 pt-24 pb-32">
                    <Swiper
                        modules={[Pagination]}
                        spaceBetween={0}
                        slidesPerView={1}
                        pagination={{
                            clickable: true,
                            bulletActiveClass: 'swiper-pagination-bullet-active',
                            bulletClass: 'swiper-pagination-bullet'
                        }}
                        onSwiper={setSwiperInstance}
                        onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                        className="h-full tutorial-swiper"
                    >
                        {TUTORIAL_STEPS.map((step) => (
                            <SwiperSlide key={step.id}>
                                <div className="flex flex-col items-center px-6 h-full">
                                    {/* Icon Badge */}
                                    <div className="mb-6 w-16 h-16 rounded-2xl bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center">
                                        <span
                                            className="material-symbols-outlined text-[32px] text-[#14b8a6]"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            {step.icon}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl font-extrabold text-t-primary text-center mb-1">
                                        {step.title}
                                    </h2>
                                    <p className="text-[#14b8a6] text-sm font-semibold text-center mb-3">
                                        {step.subtitle}
                                    </p>

                                    {/* Description */}
                                    <p className="text-t-secondary text-sm font-medium text-center mb-8 leading-relaxed max-w-[280px]">
                                        {step.desc}
                                    </p>

                                    {/* Screenshot - 모바일 세로 비율 (9:16) */}
                                    <div
                                        className="w-full max-w-[280px] mb-6 rounded-3xl overflow-hidden border border-themed-light bg-card-gray flex items-center justify-center relative shadow-2xl"
                                        style={{ aspectRatio: '9 / 16' }}
                                    >
                                        <img
                                            src={step.screenshot}
                                            alt={`${step.title} 스크린샷`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                        {/* Placeholder */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-card-gray to-card-gray" style={{ display: 'none' }}>
                                            <span className="material-symbols-outlined text-[48px] text-t-faint">
                                                {step.icon}
                                            </span>
                                            <span className="text-t-muted text-xs font-semibold">스크린샷 준비중</span>
                                        </div>
                                    </div>

                                    {/* Highlights */}
                                    <div className="w-full max-w-[300px] flex flex-col gap-2">
                                        {step.highlights.map((highlight, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-surface rounded-xl px-4 py-2.5 border border-themed">
                                                <span
                                                    className="material-symbols-outlined text-[16px] text-[#14b8a6] flex-shrink-0"
                                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                                >
                                                    check_circle
                                                </span>
                                                <span className="text-xs text-t-secondary font-medium leading-relaxed">
                                                    {highlight}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Bottom Button */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
                    <button
                        onClick={handleNext}
                        className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-base active:scale-95 transition-all shadow-lg"
                    >
                        {currentIndex < TUTORIAL_STEPS.length - 1 ? '다음' : '시작하기'}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .tutorial-swiper {
                    width: 100%;
                    height: 100%;
                }

                .tutorial-swiper .swiper-pagination {
                    bottom: 110px !important;
                }

                .tutorial-swiper .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.3);
                    opacity: 1;
                    margin: 0 4px !important;
                    transition: all 0.3s ease;
                }

                .tutorial-swiper .swiper-pagination-bullet-active {
                    width: 24px;
                    border-radius: 4px;
                    background: #fff;
                }
            `}</style>
        </div>
    );
}
