import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* 핵심 기능 안내 */
const FEATURES = [
    { img: '/픽생성.png', title: '번호 생성', desc: 'FULIF가 매주 추천하는 10세트와\n나만의 전략 번호를 만들어요' },
    { img: '/스캔.png', title: '낙첨복권 스캔', desc: '낙첨 복권을 스캔하면 포인트 적립,\n경품 추첨에도 응모할 수 있어요' },
    { img: '/럭키이벤트.png', title: '경품추첨', desc: '지난 회차 낙첨 복권으로\n매주 다양한 경품에 도전해요' },
    { img: '/콘텐츠.png', title: 'AI 콘텐츠', desc: '럭키 스코어·넘버 센스로\n낙첨의 아쉬움까지 분석해요' },
];

const FAQS = [
    {
        q: '복권 스캔은 어떻게 하나요?',
        a: '앱 하단 스캔·경품 탭을 눌러 카메라를 실행하세요. 복권을 프레임 안에 맞추면 자동으로 번호가 인식됩니다. 인식이 어려우면 직접 입력을 이용하세요.',
    },
    {
        q: '스캔 시 포인트가 얼마나 적립되나요?',
        a: '무료 회원은 기본 50P(광고 시청 시 +25P), PRO 구독 시 최대 100P가 적립됩니다. 직접 입력은 50% 감소 적용됩니다.',
    },
    {
        q: 'FULIF 번호는 무엇인가요?',
        a: 'FULIF 알고리즘이 매주 자동 생성하는 10세트의 추천 번호입니다. 이전 당첨 이력과 통계를 분석해 만들어지며, PRO 구독 시 무제한 열람할 수 있어요.',
    },
    {
        q: '경품추첨은 어떻게 응모하나요?',
        a: '지난 회차 낙첨 복권을 등록하면 자동으로 응모됩니다. 매주 토요일 21:00부터 화요일 20:00까지 등록하면, 화요일 20:30에 추첨해요.',
    },
    {
        q: 'PRO 구독 혜택은 무엇인가요?',
        a: '매주 낙첨번호 20세트 등록, FULIF 번호 10세트 제공, AI 콘텐츠 이용, 오늘의 광고보기 20회, 챔피언십 이용이 가능합니다. 월 8,000원이며 언제든 해지할 수 있어요.',
    },
    {
        q: '포인트는 현금으로 바꿀 수 있나요?',
        a: '아니요. 포인트는 구독권 교환, 번호 열람 등 앱 내에서만 사용되며 현금 환전은 되지 않습니다. 마지막 획득일로부터 12개월 후 소멸됩니다.',
    },
];

export default function Guide() {
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>FULIF - 가이드 / 도움말</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-16">

                {/* Header */}
                <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-4 flex items-center gap-2">
                    <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[17px] font-bold tracking-tight">가이드 / 도움말</h1>
                </div>

                {/* 튜토리얼 다시 보기 */}
                <button
                    onClick={() => router.push('/tutorial_intro')}
                    className="pressable mx-6 mt-3 rounded-[20px] p-5 flex items-center gap-4 text-left"
                    style={{ background: 'linear-gradient(120deg, #2D71E8 0%, #1B64DA 100%)' }}
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[26px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[16px] font-bold text-white">튜토리얼 다시 보기</span>
                        <span className="text-[13px] font-medium text-white/85 mt-0.5">앱 핵심 기능을 처음부터 살펴봐요</span>
                    </div>
                    <span className="material-symbols-outlined text-[22px] text-white/70">chevron_right</span>
                </button>

                {/* 핵심 기능 안내 */}
                <div className="mx-6 mt-6">
                    <h2 className="text-[17px] font-bold text-t-primary mb-3">핵심 기능</h2>
                    <div className="flex flex-col gap-3">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="bg-card-gray rounded-[20px] p-4 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-btn-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <img src={f.img} alt="" className="w-11 h-11 object-contain" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[16px] font-bold text-t-primary">{f.title}</span>
                                    <span className="text-[13px] font-medium text-t-muted leading-snug mt-0.5 whitespace-pre-line">{f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 자주 묻는 질문 */}
                <div className="mx-6 mt-8">
                    <h2 className="text-[17px] font-bold text-t-primary mb-3">자주 묻는 질문</h2>
                    <div className="bg-card-gray rounded-[20px] px-5 py-1">
                        {FAQS.map((faq, idx) => (
                            <div key={idx} className={idx < FAQS.length - 1 ? 'border-b border-themed' : ''}>
                                <button
                                    className="w-full py-4 flex items-center justify-between gap-3 text-left"
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                >
                                    <span className="text-[15px] font-semibold text-t-primary leading-snug">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-[20px] text-t-dim flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                {openFaq === idx && (
                                    <p className="text-t-secondary text-[14px] font-medium leading-relaxed pb-4 whitespace-pre-line">{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 고객센터 */}
                <div className="mx-6 mt-6">
                    <button
                        onClick={() => router.push('/help')}
                        className="pressable w-full bg-card-gray rounded-[20px] p-4 flex items-center gap-3"
                    >
                        <span className="w-11 h-11 rounded-full bg-btn-secondary flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[22px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                        </span>
                        <div className="flex flex-col flex-1 text-left">
                            <span className="text-[15px] font-bold text-t-primary">더 궁금한 점이 있나요?</span>
                            <span className="text-[13px] font-medium text-t-muted mt-0.5">고객센터로 문의해 주세요</span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-t-dim">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
