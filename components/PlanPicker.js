import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';

export const PLAN_FEATURES = {
    STANDARD: [
        '럭키스코어로 가중치 부여 가능',
        '경품추첨 가중치 1.5배 부여',
        '스캔포인트 1.5배 적립',
        '낙첨복권 주 10개 등록',
    ],
    PRO: [
        '럭키스코어로 가중치 부여 가능',
        '경품추첨 가중치 2.0배 부여',
        '스캔포인트 2.0배 적립',
        '낙첨복권 주 20개 등록',
        '나만의 추가 번호 생성 가능',
    ],
};

export const PRICE = {
    STANDARD: { monthly: 5000, yearly: 48000 },
    PRO:      { monthly: 8000, yearly: 76800 },
};
export const won = (n) => '₩' + n.toLocaleString('ko-KR');

const GOLD         = 'var(--color-gold)';
const GOLD_FG      = 'var(--color-gold-fg)';
const GOLD_SOFT    = 'var(--color-gold-soft)';
const GOLD_BORDER  = 'var(--color-gold-border)';
const GOLD_CARD_BG = 'var(--color-gold-card-bg)';

const BENEFITS = [
    '럭키스코어로 경품추첨 가중치 부여',
    '스캔포인트 추가 적립',
    '낙첨복권 주간 등록 한도 증가',
    '나만의 추가 번호 생성 (PRO 전용)',
];

/**
 * 플랜 피커 — /subscription 와 /my_subscription 의 '현재 구독' 탭에서 공용.
 * props:
 *  - tier: 'FREE' | 'STANDARD' | 'PRO'
 *  - nextBillingDate: string
 *  - embedded: bool (탭 안에서 쓸 때 외곽 헤더/패딩 생략)
 *  - onManageClick: () => void  (STANDARD 배너의 '구독 관리' 링크 동작)
 */
export default function PlanPicker({ tier, nextBillingDate, embedded = false, onManageClick }) {
    const router = useRouter();
    const isStandardUser = tier === 'STANDARD';
    const initialPlan = isStandardUser ? 'PRO' : 'PRO';

    const [selectedPlan, setSelectedPlan] = useState(initialPlan);
    const [billing, setBilling]           = useState('monthly');
    const [step, setStep]                 = useState('select'); // 'select' | 'confirm' | 'complete'

    const proPrice    = PRICE.PRO[billing];
    const stdPrice    = PRICE.STANDARD[billing];
    const proPerMonth = billing === 'yearly' ? Math.round(proPrice / 12) : proPrice;
    const stdPerMonth = billing === 'yearly' ? Math.round(stdPrice / 12) : stdPrice;

    const priceLabel = useMemo(() => {
        const p = PRICE[selectedPlan];
        if (billing === 'monthly') return `${won(p.monthly)}/월`;
        const perMonth = Math.round(p.yearly / 12);
        return `${won(p.yearly)}/년 (월 ${won(perMonth)})`;
    }, [selectedPlan, billing]);

    /* 완료 화면 — 인라인(탭) 또는 풀스크린 모두 동일하게 카드로 */
    if (step === 'complete') {
        const planName = selectedPlan === 'PRO' ? 'PRO' : 'Standard';
        const features = PLAN_FEATURES[selectedPlan];
        return (
            <div className={embedded ? 'px-6 pt-6' : 'px-6 pt-12 pb-32'}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 mt-2" style={{ background: GOLD_SOFT }}>
                        <span className="material-symbols-outlined text-[56px]" style={{ fontVariationSettings: "'FILL' 1", color: GOLD }}>workspace_premium</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-2">구독 완료!</h1>
                    <p className="text-t-muted text-sm font-medium mb-6">{planName} 회원이 되셨어요!</p>
                </div>
                <div className="w-full bg-card-gray rounded-3xl p-6 flex flex-col gap-3 border border-themed mb-4">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1", color: GOLD }}>check_circle</span>
                            <span className="text-sm font-medium text-btn-secondary-text">{f}</span>
                        </div>
                    ))}
                </div>
                <p className="text-t-dim text-xs font-medium text-center mb-6">다음 결제일: {nextBillingDate}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStep('select')}
                        className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm border border-themed active:scale-95 transition-all"
                    >
                        계속 보기
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all"
                    >
                        홈으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={embedded ? '' : 'pb-16'}>
            {/* Heading */}
            <div className="px-6 mb-8 mt-2">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                    {isStandardUser ? <>PRO로<br/>업그레이드하기</> : <>업그레이드하고<br/>더 많은 혜택을 누리세요</>}
                </h1>
                <p className="text-t-muted text-sm font-medium">언제든 해지 가능하며 잔여 포인트는 유지됩니다.</p>
            </div>

            {isStandardUser && (
                <div className="mx-6 mb-6 p-3 rounded-xl bg-card-gray border border-themed-light flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-t-primary">현재 Standard 구독 중</div>
                        <div className="text-[11px] text-t-muted font-medium mt-0.5">
                            PRO로 업그레이드하거나 {onManageClick
                                ? <button onClick={onManageClick} className="underline underline-offset-2 text-t-secondary">구독 관리</button>
                                : <button onClick={() => router.push('/my_subscription')} className="underline underline-offset-2 text-t-secondary">구독 관리</button>
                            }로 이동
                        </div>
                    </div>
                </div>
            )}

            {/* Benefits */}
            <div className="px-6 mb-8 flex flex-col gap-3">
                {BENEFITS.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="size-5 rounded-full bg-bg-inverse/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-t-primary text-[12px] font-bold">check</span>
                        </div>
                        <span className="text-[15px] font-medium text-btn-secondary-text">{benefit}</span>
                    </div>
                ))}
            </div>

            {/* Billing toggle */}
            <div className="px-6 mb-4">
                <div className="flex bg-card-gray rounded-2xl p-1 border border-themed">
                    <button
                        onClick={() => setBilling('monthly')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            billing === 'monthly' ? 'bg-bg-inverse text-t-inverse shadow-sm' : 'text-t-muted'
                        }`}
                    >
                        월간
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                            billing === 'yearly' ? 'bg-bg-inverse text-t-inverse shadow-sm' : 'text-t-muted'
                        }`}
                    >
                        연간
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            billing === 'yearly' ? 'bg-[#14b8a6] text-black' : 'bg-[#14b8a6]/15 text-[#14b8a6]'
                        }`}>
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plan cards: Standard → PRO */}
            <div className="px-6 flex flex-col gap-4">

                {/* Standard */}
                <div
                    onClick={() => { if (!isStandardUser) setSelectedPlan('STANDARD'); }}
                    className={`relative flex flex-col p-6 rounded-3xl transition-all duration-300 ${
                        isStandardUser
                            ? 'bg-card-gray border border-themed opacity-50 cursor-not-allowed'
                            : selectedPlan === 'STANDARD'
                                ? 'bg-card-gray border border-bg-inverse shadow-[0_0_20px_var(--color-glow)] ring-1 ring-bg-inverse cursor-pointer'
                                : 'bg-card-gray border border-themed opacity-60 hover:opacity-100 cursor-pointer'
                    }`}
                >
                    {isStandardUser && (
                        <div className="absolute -top-3 left-6 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest bg-bg-inverse text-t-inverse shadow-lg">
                            구독 중
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <span className="text-t-primary font-extrabold text-2xl tracking-tight mb-1">Standard</span>
                            {billing === 'monthly' ? (
                                <span className="text-t-primary text-lg font-bold">{won(stdPrice)} <span className="text-t-muted text-sm font-medium">/월</span></span>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="text-t-primary text-lg font-bold">{won(stdPrice)} <span className="text-t-muted text-sm font-medium">/년</span></span>
                                    <span className="text-t-muted text-xs font-medium mt-0.5">월 {won(stdPerMonth)} · <span className="text-[#14b8a6] font-bold">₩12,000 절약</span></span>
                                </div>
                            )}
                        </div>
                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'STANDARD' ? 'border-bg-inverse bg-transparent' : 'border-t-faint'}`}>
                            {selectedPlan === 'STANDARD' && <div className="size-3 bg-bg-inverse rounded-full" />}
                        </div>
                    </div>
                    <ul className="text-xs font-semibold text-t-secondary bg-bg-inverse/[0.04] rounded-xl p-3 border border-themed flex flex-col gap-1.5">
                        {PLAN_FEATURES.STANDARD.map((f, i) => (
                            <li key={i}>• {f}</li>
                        ))}
                    </ul>
                </div>

                {/* PRO */}
                <div
                    onClick={() => setSelectedPlan('PRO')}
                    className={`relative flex flex-col p-6 rounded-3xl cursor-pointer transition-all duration-300 ${
                        selectedPlan === 'PRO' ? 'bg-surface' : 'bg-card-gray border border-themed opacity-60 hover:opacity-100'
                    }`}
                    style={selectedPlan === 'PRO' ? {
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: GOLD,
                        boxShadow: `0 0 30px ${GOLD_SOFT}`,
                    } : undefined}
                >
                    <div className="absolute inset-0 metallic-grain rounded-3xl" />
                    <div className="absolute -top-3 right-6 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg" style={{ background: GOLD, color: GOLD_FG }}>
                        가장 인기
                    </div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <span className="font-extrabold text-2xl tracking-tight mb-1" style={{ color: GOLD }}>PRO</span>
                            {billing === 'monthly' ? (
                                <span className="text-t-primary text-lg font-bold">{won(proPrice)} <span className="text-t-muted text-sm font-medium">/월</span></span>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="text-t-primary text-lg font-bold">{won(proPrice)} <span className="text-t-muted text-sm font-medium">/년</span></span>
                                    <span className="text-t-muted text-xs font-medium mt-0.5">월 {won(proPerMonth)} · <span className="text-[#14b8a6] font-bold">₩19,200 절약</span></span>
                                </div>
                            )}
                        </div>
                        <div
                            className="size-6 rounded-full border-2 flex items-center justify-center transition-colors"
                            style={selectedPlan === 'PRO' ? { borderColor: GOLD } : undefined}
                        >
                            {selectedPlan === 'PRO' && <div className="size-3 rounded-full" style={{ background: GOLD }} />}
                        </div>
                    </div>
                    <ul className="relative z-10 text-xs font-semibold text-t-secondary bg-bg-inverse/[0.04] rounded-xl p-3 border border-themed flex flex-col gap-1.5">
                        {PLAN_FEATURES.PRO.map((f, i) => (
                            <li key={i}>• {f}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CTA card */}
            <div className="px-6 mt-6">
                <div className="bg-card-gray rounded-3xl p-5 border border-themed-light">
                    <div className="flex items-baseline justify-between mb-3 px-1">
                        <span className="text-sm font-bold" style={selectedPlan === 'PRO' ? { color: GOLD } : undefined}>
                            {selectedPlan === 'PRO' ? 'PRO' : 'Standard'}
                        </span>
                        <span className="text-xs text-t-muted font-medium">{priceLabel}</span>
                    </div>
                    <button
                        onClick={() => setStep('confirm')}
                        className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all active:scale-95 shadow-lg ${
                            selectedPlan !== 'PRO' ? 'bg-bg-inverse text-t-inverse' : ''
                        }`}
                        style={selectedPlan === 'PRO'
                            ? { background: GOLD, color: GOLD_FG, boxShadow: `0 10px 24px ${GOLD_SOFT}` }
                            : undefined}
                    >
                        {selectedPlan} 선택하기
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-5 text-[11px] text-t-muted font-medium">
                    <button className="active:opacity-60 transition-opacity">이용약관</button>
                    <span className="text-t-faint">·</span>
                    <button className="active:opacity-60 transition-opacity">개인정보처리방침</button>
                </div>
            </div>

            {/* Confirm sheet */}
            {step === 'confirm' && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('select')} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <h3 className="text-lg font-extrabold text-center mb-1" style={selectedPlan === 'PRO' ? { color: GOLD } : { color: 'var(--color-text)' }}>
                            {selectedPlan === 'PRO' ? 'PRO' : 'Standard'} 구독 · {billing === 'monthly' ? '월간' : '연간'}
                        </h3>
                        <p className="text-t-muted text-sm font-medium text-center mb-1">{priceLabel}</p>
                        <div className="flex flex-col gap-1 mb-6 mt-4">
                            {[
                                '첫 결제부터 즉시 적용',
                                `다음 결제일: ${nextBillingDate}`,
                                billing === 'yearly' ? '20% 할인 적용' : '언제든 해지 가능',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-t-muted">
                                    <span className="material-symbols-outlined text-[12px] text-t-dim">circle</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('select')} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                            <button
                                onClick={() => setStep('complete')}
                                className="flex-1 py-4 rounded-xl font-extrabold text-sm active:scale-95 transition-all"
                                style={selectedPlan === 'PRO'
                                    ? { background: GOLD, color: GOLD_FG }
                                    : { background: 'var(--color-bg-inverse)', color: 'var(--color-text-inverse)' }}
                            >
                                결제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
