import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

const PLAN_FEATURES = {
    STANDARD: ['CWG 픽 무제한 열람', '스캔 포인트 1.5배 적립', '앱 내 광고 자동 제거'],
    PRO: ['CWG 픽 무제한 열람', '스캔 포인트 2.0배 적립', '광고 선택 시청 (4.0배 부스트)', '챔피언십 1일 1회 무료'],
};

export default function Subscription() {
    const router = useRouter();
    const { tier, subscriptionExpiry } = useUser();
    const [selectedPlan, setSelectedPlan] = useState('PRO');
    const [step, setStep] = useState('select'); // 'select' | 'confirm' | 'complete' | 'cancel_confirm'

    const isSubscribed = tier === 'STANDARD' || tier === 'PRO';
    const nextBillingDate = subscriptionExpiry || '2026-03-25';

    /* ── 구독 완료 화면 ─────────────────────────────── */
    if (step === 'complete') {
        const planName = selectedPlan === 'PRO' ? 'PRO' : 'Standard';
        const features = PLAN_FEATURES[selectedPlan];
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 구독 완료</title></Head>
                <div className="relative flex min-h-screen w-full flex-col items-center max-w-[430px] mx-auto shadow-2xl px-6 pb-32 pt-12">
                    <div className="w-24 h-24 rounded-full bg-[#14b8a6]/15 flex items-center justify-center mb-6 mt-8">
                        <span className="material-symbols-outlined text-[56px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-center">구독 완료!</h1>
                    <p className="text-t-muted text-sm font-medium mb-8 text-center">{planName} 회원이 되셨어요!</p>
                    <div className="w-full bg-card-gray rounded-3xl p-6 flex flex-col gap-3 border border-themed mb-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <span className="text-sm font-medium text-btn-secondary-text">{f}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-t-dim text-xs font-medium">다음 결제일: {nextBillingDate}</p>
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                        <button onClick={() => router.push('/')} className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all">홈으로</button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── STANDARD / PRO 관리 화면 ───────────────────── */
    if (isSubscribed) {
        const isPro = tier === 'PRO';
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 구독 관리</title></Head>
                <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-32">
                    <div className="pt-12 pb-6 px-6 flex items-center gap-3">
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-extrabold tracking-tight">구독 관리</h1>
                    </div>

                    {/* 현재 구독 카드 */}
                    <div className={`mx-6 mb-6 p-6 rounded-3xl border ${isPro ? 'bg-surface border-[#D4AF37]/30' : 'bg-card-gray border-themed-light'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`material-symbols-outlined text-[28px] ${isPro ? 'text-[#D4AF37]' : 'text-t-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            <div>
                                <div className={`text-xl font-extrabold ${isPro ? 'text-[#D4AF37]' : 'text-t-primary'}`}>{isPro ? 'PRO' : 'Standard'} 구독 중</div>
                                <div className="text-xs text-t-muted font-medium mt-0.5">다음 결제일: {nextBillingDate}</div>
                            </div>
                        </div>
                        {isPro && (
                            <div className="text-xs font-semibold text-[#D4AF37]/70 bg-[#D4AF37]/5 rounded-xl px-3 py-2 border border-[#D4AF37]/10">
                                최고 등급입니다. 모든 혜택을 누리고 있어요.
                            </div>
                        )}
                    </div>

                    {/* Standard → PRO 업그레이드 */}
                    {!isPro && (
                        <button
                            onClick={() => { setSelectedPlan('PRO'); setStep('confirm'); }}
                            className="mx-6 mb-4 flex items-center justify-between p-5 bg-gradient-to-r from-surface to-card-gray rounded-2xl border border-[#D4AF37]/30 active:opacity-80 transition-opacity"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[22px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>upgrade</span>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-[#D4AF37]">PRO로 업그레이드</div>
                                    <div className="text-xs text-t-muted font-medium mt-0.5">챔피언십 1일 1회 무료 + 2.0배 포인트</div>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[20px] text-t-muted">chevron_right</span>
                        </button>
                    )}

                    {/* 구독 해지 */}
                    <button
                        onClick={() => setStep('cancel_confirm')}
                        className="mx-6 flex items-center justify-between p-5 bg-card-gray rounded-2xl border border-themed active:opacity-80 transition-opacity"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[22px] text-t-muted">cancel</span>
                            <span className="text-sm font-semibold text-t-secondary">구독 해지</span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-t-dim">chevron_right</span>
                    </button>

                    <p className="mx-6 mt-4 text-xs text-t-dim font-medium text-center">
                        해지 즉시 혜택이 종료됩니다. 적립 포인트는 유지됩니다.
                    </p>

                    {/* PRO 업그레이드 확인 */}
                    {step === 'confirm' && (
                        <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('select')} />
                            <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                                <h3 className="text-lg font-extrabold text-[#D4AF37] text-center mb-1">PRO 업그레이드</h3>
                                <p className="text-t-muted text-sm font-medium text-center mb-6">₩8,000/월 · 언제든 해지 가능</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep('select')} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                                    <button onClick={() => setStep('complete')} className="flex-1 py-4 rounded-xl bg-[#D4AF37] text-black font-extrabold text-sm active:scale-95 transition-all">결제하기</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 해지 확인 */}
                    {step === 'cancel_confirm' && (
                        <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('select')} />
                            <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                                <h3 className="text-lg font-extrabold text-t-primary text-center mb-2">구독 해지</h3>
                                <p className="text-t-muted text-sm font-medium text-center mb-4">정말 구독을 해지하시겠어요?</p>
                                <div className="flex flex-col gap-1.5 mb-6">
                                    {['해지 즉시 혜택 종료', '적립 포인트는 유지', '언제든 재가입 가능'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-t-muted">
                                            <span className="material-symbols-outlined text-[14px] text-t-dim">remove</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep('select')} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                                    <button onClick={() => router.push('/')} className="flex-1 py-4 rounded-xl bg-red-900/30 text-red-400 font-extrabold text-sm active:scale-95 transition-all border border-red-900/20">해지하기</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── FREE → 플랜 선택 화면 ──────────────────────── */
    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - Subscription</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-32">

                {/* Header */}
                <div className="pt-12 pb-6 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                </div>

                <div className="px-6 mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">업그레이드하고<br/>더 많은 혜택을 누리세요</h1>
                    <p className="text-t-muted text-sm font-medium">언제든 해지 가능하며 잔여 포인트는 유지됩니다.</p>
                </div>

                {/* Benefits List */}
                <div className="px-6 mb-10 flex flex-col gap-3">
                    {['CWG 픽 무제한 열람', '스캔 포인트 최대 2배 적립', '챔피언십 티켓 최대 1일 1회 무료', '프리미엄 배지 부여'].map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="size-5 rounded-full bg-card-hover flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-t-primary text-[12px] font-bold">check</span>
                            </div>
                            <span className="text-[15px] font-medium text-btn-secondary-text">{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* Plan Cards */}
                <div className="px-6 flex flex-col gap-4">

                    {/* PRO Card */}
                    <div
                        onClick={() => setSelectedPlan('PRO')}
                        className={`relative flex flex-col p-6 rounded-3xl cursor-pointer transition-all duration-300 ${
                            selectedPlan === 'PRO'
                                ? 'bg-surface border border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]'
                                : 'bg-card-gray border border-themed opacity-50 hover:opacity-100'
                        }`}
                    >
                        <div className="absolute inset-0 metallic-grain rounded-3xl" />
                        <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                            가장 인기
                        </div>
                        <div className="relative z-10 flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <span className="text-[#D4AF37] font-extrabold text-2xl tracking-tight mb-1">PRO</span>
                                <span className="text-t-primary text-lg font-bold">₩8,000 <span className="text-t-muted text-sm font-medium">/월</span></span>
                            </div>
                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'PRO' ? 'border-[#D4AF37] bg-transparent' : 'border-t-faint'}`}>
                                {selectedPlan === 'PRO' && <div className="size-3 bg-[#D4AF37] rounded-full" />}
                            </div>
                        </div>
                        <div className="relative z-10 text-xs font-semibold text-t-secondary bg-surface/40 rounded-xl p-3 border border-themed">
                            • 스캔 포인트 2.0배 적립<br/>
                            • 챔피언십 1일 1회 무료<br/>
                            • 광고 선택적 시청 (4.0배 부스트)
                        </div>
                    </div>

                    {/* Standard Card */}
                    <div
                        onClick={() => setSelectedPlan('STANDARD')}
                        className={`relative flex flex-col p-6 rounded-3xl cursor-pointer transition-all duration-300 ${
                            selectedPlan === 'STANDARD'
                                ? 'bg-card-gray border border-bg-inverse shadow-[0_0_20px_var(--color-shadow)] ring-1 ring-bg-inverse'
                                : 'bg-card-gray border border-themed opacity-50 hover:opacity-100'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <span className="text-t-primary font-extrabold text-2xl tracking-tight mb-1">Standard</span>
                                <span className="text-t-primary text-lg font-bold">₩5,000 <span className="text-t-muted text-sm font-medium">/월</span></span>
                            </div>
                            <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'STANDARD' ? 'border-bg-inverse bg-transparent' : 'border-t-faint'}`}>
                                {selectedPlan === 'STANDARD' && <div className="size-3 bg-bg-inverse rounded-full" />}
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-t-secondary bg-surface/40 rounded-xl p-3 border border-themed">
                            • 스캔 포인트 1.5배 적립<br/>
                            • 앱 내 모든 광고 자동 제거
                        </div>
                    </div>

                </div>

                {/* Sticky Action Panel */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <button
                        onClick={() => setStep('confirm')}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 ${
                            selectedPlan === 'PRO' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-bg-inverse text-t-inverse shadow-lg shadow-[var(--color-shadow)]'
                        }`}
                    >
                        {selectedPlan} 선택하기
                    </button>
                </div>

                {/* 구매 확인 다이얼로그 */}
                {step === 'confirm' && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('select')} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                            <h3 className={`text-lg font-extrabold text-center mb-1 ${selectedPlan === 'PRO' ? 'text-[#D4AF37]' : 'text-t-primary'}`}>
                                {selectedPlan === 'PRO' ? 'PRO' : 'Standard'} 구독
                            </h3>
                            <p className="text-t-muted text-sm font-medium text-center mb-1">
                                {selectedPlan === 'PRO' ? '₩8,000' : '₩5,000'}/월
                            </p>
                            <div className="flex flex-col gap-1 mb-6 mt-4">
                                {['첫 달부터 즉시 적용', `다음 결제일: ${nextBillingDate}`, '언제든 해지 가능'].map((item, i) => (
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
                                    className={`flex-1 py-4 rounded-xl font-extrabold text-sm active:scale-95 transition-all ${selectedPlan === 'PRO' ? 'bg-[#D4AF37] text-black' : 'bg-bg-inverse text-t-inverse'}`}
                                >
                                    결제하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
