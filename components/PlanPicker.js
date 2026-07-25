import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';

/* 구독은 PRO 단일 플랜 */
export const PLAN_FEATURES = {
    PRO: [
        '매주 낙첨번호 20세트까지 등록',
        '매주 FULIF 번호 10세트 제공',
        'AI 콘텐츠 이용 가능',
        '오늘의 광고보기 20회로 한도 증가',
        '챔피언십 이용 가능',
    ],
};

/* 월 6,700원 수준 · 연 결제 시 8만원 */
export const PRICE = {
    PRO: { monthly: 8000, yearly: 80000 },
    // 하위 호환 (일부 페이지가 참조) — PRO와 동일 취급
    STANDARD: { monthly: 8000, yearly: 80000 },
};
export const won = (n) => '₩' + n.toLocaleString('ko-KR');

/**
 * 플랜 피커 — /subscription 및 /my_subscription '현재 구독' 탭 공용.
 * PRO 단일 플랜, 토스/쏘카 라이트 스타일.
 */
export default function PlanPicker({ tier, nextBillingDate, embedded = false }) {
    const router = useRouter();

    const [billing, setBilling] = useState('monthly');
    const [step, setStep]       = useState('select'); // 'select' | 'confirm' | 'complete'

    const price    = PRICE.PRO[billing];
    const perMonth = billing === 'yearly' ? Math.round(price / 12) : price;
    const yearSave = PRICE.PRO.monthly * 12 - PRICE.PRO.yearly;
    const yearPct  = Math.round((yearSave / (PRICE.PRO.monthly * 12)) * 100);

    const priceLabel = useMemo(() => {
        if (billing === 'monthly') return `${won(price)} / 월`;
        return `${won(price)} / 년 · 월 ${won(perMonth)}`;
    }, [billing, price, perMonth]);

    /* 완료 화면 */
    if (step === 'complete') {
        return (
            <div className={embedded ? 'px-6 pt-6' : 'px-6 pt-12 pb-32'}>
                <div className="flex flex-col items-center text-center">
                    <img src="/sub/badge.png" alt="" className="w-24 h-24 object-contain mb-5 mt-2" />
                    <h1 className="text-[24px] font-bold tracking-tight mb-2">PRO 구독 완료!</h1>
                    <p className="text-t-muted text-[14px] font-medium mb-6">이제 모든 혜택을 누릴 수 있어요</p>
                </div>
                <div className="w-full bg-card-gray rounded-[20px] p-5 flex flex-col gap-3 mb-4">
                    {PLAN_FEATURES.PRO.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="text-[14px] font-medium text-t-secondary">{f}</span>
                        </div>
                    ))}
                </div>
                <p className="text-t-dim text-[12px] font-medium text-center mb-6">다음 결제일 {nextBillingDate}</p>
                <div className="flex gap-2">
                    <button onClick={() => setStep('select')} className="pressable flex-1 py-4 rounded-2xl bg-btn-secondary text-t-secondary font-bold text-[15px]">계속 보기</button>
                    <button onClick={() => router.push('/')} className="pressable flex-1 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]">홈으로</button>
                </div>
            </div>
        );
    }

    return (
        <div className={embedded ? '' : 'pb-16'}>
            {/* Heading */}
            <div className="px-6 mb-6 mt-2">
                <h1 className="text-[26px] font-bold tracking-tight leading-snug">PRO로 업그레이드하고<br/>더 많은 혜택을 누리세요</h1>
                <p className="text-t-muted text-[14px] font-medium mt-2">언제든 해지 가능하며 잔여 포인트는 유지돼요</p>
            </div>

            {/* Billing toggle */}
            <div className="px-6 mb-4">
                <div className="flex bg-card-gray rounded-2xl p-1">
                    <button
                        onClick={() => setBilling('monthly')}
                        className={`flex-1 py-3 rounded-xl text-[14px] font-bold transition-colors ${billing === 'monthly' ? 'bg-accent text-accent-fg' : 'text-t-muted'}`}
                    >
                        월간
                    </button>
                    <button
                        onClick={() => setBilling('yearly')}
                        className={`flex-1 py-3 rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-1.5 ${billing === 'yearly' ? 'bg-accent text-accent-fg' : 'text-t-muted'}`}
                    >
                        연간
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${billing === 'yearly' ? 'bg-white/25 text-white' : 'bg-accent-soft text-accent'}`}>-{yearPct}%</span>
                    </button>
                </div>
            </div>

            {/* PRO 플랜 카드 — 흰 카드 + 파란 악센트 */}
            <div className="px-6">
                <div className="bg-card-gray rounded-[24px] p-6 ring-2 ring-accent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src="/sub/badge.png" alt="" className="w-7 h-7 object-contain" />
                            <span className="text-[22px] font-bold text-t-primary tracking-tight">FULIF PRO</span>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-accent-soft text-accent">가장 인기</span>
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-[32px] font-bold text-t-primary tracking-tight">{won(perMonth)}</span>
                        <span className="text-[15px] font-semibold text-t-muted">/ 월</span>
                    </div>
                    {billing === 'yearly' && (
                        <p className="text-[13px] font-medium text-t-secondary mt-1">연 {won(price)} 결제 · <span className="text-accent font-bold">연 {won(yearSave)} 절약</span></p>
                    )}

                    <div className="h-px my-5" style={{ backgroundColor: 'var(--color-border)' }} />

                    <div className="flex flex-col gap-3">
                        {PLAN_FEATURES.PRO.map((f, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[18px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <span className="text-[14px] font-medium text-t-secondary">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="px-6 mt-5">
                <button
                    onClick={() => setStep('confirm')}
                    className="pressable w-full py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px]"
                >
                    PRO 시작하기 · {priceLabel}
                </button>
                <div className="flex items-center justify-center gap-3 mt-4 text-[12px] text-t-muted font-medium">
                    <button className="active:opacity-60 transition-opacity">이용약관</button>
                    <span className="text-t-faint">·</span>
                    <button className="active:opacity-60 transition-opacity">개인정보처리방침</button>
                </div>
            </div>

            {/* Confirm sheet */}
            {step === 'confirm' && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('select')} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl p-6 pb-10 shadow-2xl">
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-5" />
                        <h3 className="text-[18px] font-bold text-t-primary mb-1">PRO 구독 · {billing === 'monthly' ? '월간' : '연간'}</h3>
                        <p className="text-t-muted text-[14px] font-medium mb-5">{priceLabel}</p>
                        <div className="flex flex-col gap-2 mb-6">
                            {[
                                '첫 결제부터 즉시 적용',
                                `다음 결제일 ${nextBillingDate}`,
                                billing === 'yearly' ? '연간 20% 할인 적용' : '언제든 해지 가능',
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-[13px] text-t-muted font-medium">
                                    <span className="material-symbols-outlined text-[16px] text-accent">check</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('select')} className="pressable flex-1 py-4 rounded-2xl bg-btn-secondary text-t-secondary font-bold text-[15px]">취소</button>
                            <button onClick={() => setStep('complete')} className="pressable flex-1 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]">결제하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
