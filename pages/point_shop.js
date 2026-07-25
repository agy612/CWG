import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { PLAN_FEATURES } from '../components/PlanPicker';

/* 구독은 PRO 단일 — 포인트로 교환, 1년권 8만원 */
const SUB = { id: 'sub_pro', tier: 'PRO', label: 'PRO', prices: { 1: 8000, 12: 80000 } };
const MONTH_OPTIONS = [1, 12];
const monthLabel = (m) => (m === 12 ? '1년' : `${m}개월`);
const yearPct = Math.round((1 - SUB.prices[12] / (SUB.prices[1] * 12)) * 100);

export default function PointShop() {
    const router = useRouter();
    const { tier, points } = useUser();
    const [selectedItem, setSelectedItem] = useState(null);
    const [step, setStep] = useState('shop'); // 'shop' | 'confirm' | 'complete' | 'insufficient'
    const [month, setMonth] = useState(1);

    const isPro = tier === 'PRO';
    const price = SUB.prices[month];

    const handleBuy = () => {
        const purchase = { ...SUB, months: month, price, name: `PRO 구독권 ${monthLabel(month)}` };
        setSelectedItem(purchase);
        setStep(points < purchase.price ? 'insufficient' : 'confirm');
    };

    /* ── 구매 완료 화면 ─────────────────────────────── */
    if (step === 'complete' && selectedItem) {
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>FULIF - 교환 완료</title></Head>
                <div className="relative flex min-h-screen w-full flex-col items-center max-w-[430px] mx-auto pb-32 pt-12 px-6">
                    <img src="/sub/badge.png" alt="" className="w-24 h-24 object-contain mb-6 mt-8" />
                    <h1 className="text-[24px] font-bold tracking-tight mb-2 text-center">교환 완료!</h1>
                    <p className="text-t-muted text-[14px] font-medium mb-8 text-center">{selectedItem.name}을 받았어요</p>
                    <div className="w-full bg-card-gray rounded-[20px] p-5 flex flex-col gap-3 mb-6">
                        <div className="flex justify-between text-[14px]">
                            <span className="text-t-muted font-medium">사용한 포인트</span>
                            <span className="text-[#F04452] font-bold">-{selectedItem.price.toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between text-[14px]">
                            <span className="text-t-muted font-medium">남은 포인트</span>
                            <span className="text-t-primary font-bold">{(points - selectedItem.price).toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between text-[14px] pt-3 border-t border-themed">
                            <span className="text-t-muted font-medium">지급 위치</span>
                            <span className="text-t-primary font-bold">보유 구독권</span>
                        </div>
                    </div>
                    <p className="text-t-dim text-[12px] font-medium text-center mb-6">마이 &gt; 구독 관리 &gt; 보유 구독권에서 확인할 수 있어요</p>
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent">
                        <button onClick={() => router.push('/')} className="pressable w-full py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px] mb-2">홈으로</button>
                        <button onClick={() => router.push('/my_subscription')} className="w-full py-3 text-t-muted text-[14px] font-semibold active:opacity-60">내 구독 관리</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>FULIF - 포인트 교환</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-24">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-4 px-4 flex items-center gap-2">
                    <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[17px] font-bold tracking-tight m-0">포인트 교환</h1>
                    <button
                        onClick={() => router.push('/point_history')}
                        className="pressable ml-auto inline-flex items-center gap-1 pl-2.5 pr-3 py-2 rounded-full bg-card-gray text-t-secondary"
                        style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}
                    >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        <span className="text-[13px] font-bold">내역</span>
                    </button>
                </div>

                {/* Balance */}
                <div className="px-6 pt-2 pb-5">
                    <div className="bg-card-gray rounded-[20px] p-5">
                        <span className="text-t-muted text-[14px] font-semibold">보유 포인트</span>
                        <div className="text-[36px] leading-none font-bold tracking-tight mt-1.5">{points.toLocaleString()}<span className="text-[24px] font-bold ml-0.5">P</span></div>
                    </div>
                </div>

                {isPro ? (
                    /* PRO 구독 중: 교환할 상품 없음 */
                    <div className="flex flex-col items-center text-center px-6 py-10">
                        <img src="/sub/badge.png" alt="" className="w-16 h-16 object-contain mb-4" />
                        <h2 className="text-[18px] font-bold text-t-primary mb-1.5">이미 PRO 구독 중이에요</h2>
                        <p className="text-[13px] font-medium text-t-muted leading-relaxed mb-6">모든 혜택을 이용하고 계세요.<br />모은 포인트는 구독 갱신에 사용할 수 있어요.</p>
                        <button onClick={() => router.push('/my_subscription')} className="pressable px-6 py-3 rounded-2xl bg-btn-secondary text-t-primary font-bold text-[14px]">내 구독 관리</button>
                    </div>
                ) : (
                    <div className="px-6">
                        <div className="mb-3">
                            <h2 className="text-[17px] font-bold text-t-primary">구독권 교환</h2>
                            <p className="text-[13px] font-medium text-t-muted mt-1">교환한 구독권은 마이 &gt; 구독 관리에서 사용할 수 있어요</p>
                        </div>

                        {/* PRO 구독권 카드 — 흰 카드 + 파란 악센트 */}
                        <div className="bg-card-gray rounded-[24px] p-6 ring-2 ring-accent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img src="/sub/badge.png" alt="" className="w-7 h-7 object-contain" />
                                    <span className="text-[22px] font-bold text-t-primary tracking-tight">FULIF PRO</span>
                                </div>
                                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-accent-soft text-accent">가장 인기</span>
                            </div>

                            {/* 기간 선택 */}
                            <div className="flex gap-2 mt-5">
                                {MONTH_OPTIONS.map(opt => {
                                    const on = month === opt;
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => setMonth(opt)}
                                            className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-colors flex items-center justify-center gap-1.5 ${on ? 'bg-accent text-accent-fg' : 'bg-btn-secondary text-t-muted'}`}
                                        >
                                            {monthLabel(opt)}
                                            {opt === 12 && (
                                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${on ? "bg-white/25 text-white" : "bg-accent-soft text-accent"}`}>-17%</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="h-px my-5" style={{ backgroundColor: 'var(--color-border)' }} />

                            <ul className="flex flex-col gap-2.5">
                                {PLAN_FEATURES.PRO.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2.5">
                                        <span className="material-symbols-outlined text-[18px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span className="text-[14px] font-medium text-t-secondary">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-baseline justify-between mt-5 pt-4 border-t border-themed">
                                <span className="text-[13px] font-medium text-t-muted">PRO {monthLabel(month)}</span>
                                <span className="text-[22px] font-bold text-accent tracking-tight">{price.toLocaleString()} P</span>
                            </div>
                        </div>

                        <button onClick={handleBuy} className="pressable w-full mt-4 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px]">
                            {price.toLocaleString()}P로 교환하기
                        </button>
                    </div>
                )}

            </div>

            {/* 구매 확인 시트 */}
            {step === 'confirm' && selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('shop')} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl p-6 pb-10 shadow-2xl">
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-5" />
                        <h3 className="text-[18px] font-bold text-t-primary mb-1">{selectedItem.name} 교환</h3>
                        <p className="text-t-muted text-[14px] font-medium mb-5">{selectedItem.price.toLocaleString()}P를 사용하며, 보유 구독권으로 지급돼요</p>
                        <div className="bg-input-bg rounded-2xl p-4 flex flex-col gap-2 mb-6">
                            <div className="flex justify-between text-[13px] font-medium">
                                <span className="text-t-muted">현재 포인트</span>
                                <span className="text-t-primary font-bold">{points.toLocaleString()}P</span>
                            </div>
                            <div className="flex justify-between text-[13px] font-medium">
                                <span className="text-t-muted">차감 후</span>
                                <span className="text-t-primary font-bold">{(points - selectedItem.price).toLocaleString()}P</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('shop')} className="pressable flex-1 py-4 rounded-2xl bg-btn-secondary text-t-secondary font-bold text-[15px]">취소</button>
                            <button onClick={() => setStep('complete')} className="pressable flex-1 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]">교환하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 포인트 부족 시트 */}
            {step === 'insufficient' && selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('shop')} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl p-6 pb-10 shadow-2xl">
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-5" />
                        <div className="flex justify-center mb-4">
                            <span className="material-symbols-outlined text-[40px] text-[#F5A623]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                        </div>
                        <h3 className="text-[18px] font-bold text-t-primary text-center mb-4">포인트가 부족해요</h3>
                        <div className="bg-input-bg rounded-2xl p-4 flex flex-col gap-2 mb-6">
                            <div className="flex justify-between text-[13px] font-medium">
                                <span className="text-t-muted">필요 포인트</span>
                                <span className="text-t-primary font-bold">{selectedItem.price.toLocaleString()}P</span>
                            </div>
                            <div className="flex justify-between text-[13px] font-medium">
                                <span className="text-t-muted">현재 포인트</span>
                                <span className="text-t-primary font-bold">{points.toLocaleString()}P</span>
                            </div>
                            <div className="flex justify-between text-[13px] font-medium pt-2 border-t border-themed">
                                <span className="text-t-muted">부족 포인트</span>
                                <span className="text-[#F04452] font-bold">{(selectedItem.price - points).toLocaleString()}P</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('shop')} className="pressable flex-1 py-4 rounded-2xl bg-btn-secondary text-t-secondary font-bold text-[15px]">닫기</button>
                            <button onClick={() => router.push('/')} className="pressable flex-1 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]">스캔하러 가기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
