import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { PLAN_FEATURES } from '../components/PlanPicker';

/* 구독 페이지(PlanPicker)와 동일한 플랜 구성 — 포인트 가격, 1년권 10% 할인 */
const SUBS = [
    { id: 'sub_standard', tier: 'STANDARD', label: 'Standard', prices: { 1: 5000, 12: 54000 } },
    { id: 'sub_pro', tier: 'PRO', label: 'PRO', prices: { 1: 8000, 12: 86400 }, gold: true, badge: '가장 인기' },
];
const MONTH_OPTIONS = [1, 12];
const monthLabel = (m) => (m === 12 ? '1년' : `${m}개월`);

export default function PointShop() {
    const router = useRouter();
    const { tier, points } = useUser();
    const [selectedItem, setSelectedItem] = useState(null);
    const [step, setStep] = useState('shop'); // 'shop' | 'confirm' | 'complete' | 'insufficient'
    const [months, setMonths] = useState({ sub_standard: 1, sub_pro: 1 }); // 카드별 선택 기간

    // Tier-based filtering
    const visibleSubs = SUBS.filter(i => {
        if (tier === 'PRO') return false;           // PRO: 구독권 숨김
        if (tier === 'STANDARD') return i.tier === 'PRO'; // STANDARD: Pro만 보이기
        return true;                                // FREE: 전체
    });

    const handleBuy = (item) => {
        const m = months[item.id] || 1;
        const purchase = { ...item, months: m, price: item.prices[m], name: `${item.label} 구독권 ${monthLabel(m)}` };
        setSelectedItem(purchase);
        setStep(points < purchase.price ? 'insufficient' : 'confirm');
    };

    /* ── 구매 완료 화면 ─────────────────────────────── */
    if (step === 'complete' && selectedItem) {
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 구매 완료</title></Head>
                <div className="relative flex min-h-screen w-full flex-col items-center max-w-[430px] mx-auto bg-background shadow-2xl px-6 pb-32 pt-12">
                    <div className="w-24 h-24 rounded-full bg-[#14b8a6]/15 flex items-center justify-center mb-6 mt-8">
                        <span className="material-symbols-outlined text-[56px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-center">구매 완료!</h1>
                    <p className="text-t-muted text-sm font-medium mb-8 text-center">{selectedItem.name}을 구매했어요!</p>
                    <div className="w-full bg-card-gray rounded-3xl p-6 flex flex-col gap-3 border border-themed mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-t-muted font-medium">사용한 포인트</span>
                            <span className="text-[#FF453A] font-bold">-{selectedItem.price.toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-t-muted font-medium">남은 포인트</span>
                            <span className="text-t-primary font-bold">{(points - selectedItem.price).toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1 pt-3 border-t border-themed">
                            <span className="text-t-muted font-medium">지급 위치</span>
                            <span className="text-t-primary font-bold">보유 구독권</span>
                        </div>
                    </div>
                    <p className="text-t-dim text-xs font-medium text-center mb-6">마이 &gt; 구독 관리 &gt; 보유 구독권에서 확인할 수 있어요</p>
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                        <button onClick={() => router.push('/')} className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all mb-3">홈으로</button>
                        <button onClick={() => router.push('/my_subscription')} className="w-full py-3 text-t-muted text-sm font-semibold active:opacity-60">내 구독 관리</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - Point Shop</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl pb-24">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-themed pt-12 pb-4 px-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight m-0">포인트샵</h1>
                </div>

                {/* Balance */}
                <div className="flex flex-col items-center justify-center py-10 px-6 border-b border-themed bg-gradient-to-b from-card-gray/50 to-transparent">
                    <span className="text-t-muted text-sm font-semibold mb-2">내 포인트</span>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                        <span className="text-4xl font-extrabold tracking-tight">{points.toLocaleString()} <span className="text-2xl text-t-muted font-bold">P</span></span>
                    </div>
                </div>

                <div className="flex flex-col px-6 pt-8 pb-4 gap-8">

                    {/* Subscriptions Section */}
                    {visibleSubs.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            <div className="pl-1">
                                <h2 className="text-[13px] font-bold text-t-muted uppercase tracking-widest">구독권 구매</h2>
                                <p className="text-[12px] font-medium text-t-dim mt-1.5">
                                    구매한 구독권은 마이 &gt; 구독 관리 &gt; 보유 구독권에서 확인할 수 있어요
                                    {tier === 'STANDARD' && ' · 현재 Standard 이용 중'}
                                </p>
                            </div>

                            {visibleSubs.map(item => {
                                const m = months[item.id] || 1;
                                const price = item.prices[m];
                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-3xl p-6 border flex flex-col gap-4 relative overflow-hidden group transition-colors ${
                                            item.gold
                                                ? 'bg-gradient-to-br from-[#1A1813] to-[#2A2410] border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                                                : 'bg-card-gray border border-themed hover:border-themed-light'
                                        }`}
                                    >
                                        {item.gold && <div className="absolute inset-0 metallic-grain" />}
                                        {item.badge && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-black text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-widest z-10">
                                                {item.badge}
                                            </div>
                                        )}

                                        {/* 등급 */}
                                        <div className="flex flex-col z-10">
                                            <span className={`text-[11px] font-bold uppercase tracking-widest ${item.gold ? 'text-[#D4AF37]/60' : 'text-t-muted'}`}>구독권</span>
                                            <span className={`text-2xl font-extrabold tracking-tight mt-0.5 ${item.gold ? 'text-[#D4AF37]' : 'text-t-primary'}`}>{item.label}</span>
                                        </div>

                                        {/* 기간 선택 */}
                                        <div className="flex gap-2 z-10">
                                            {MONTH_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setMonths(prev => ({ ...prev, [item.id]: opt }))}
                                                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                        m === opt
                                                            ? item.gold
                                                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-black shadow-lg'
                                                                : 'bg-bg-inverse text-t-inverse shadow-sm'
                                                            : 'bg-btn-secondary text-t-muted'
                                                    }`}
                                                >
                                                    {monthLabel(opt)}
                                                    {opt === 12 && (
                                                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                                            m === opt ? 'bg-black/20' : 'bg-[#14b8a6]/15 text-[#14b8a6]'
                                                        }`}>
                                                            -10%
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <ul className={`text-[13px] font-medium flex flex-col gap-2 z-10 ${item.gold ? 'text-[#D4AF37]/80' : 'text-t-secondary'}`}>
                                            {PLAN_FEATURES[item.tier].map((f, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className={`material-symbols-outlined text-[14px] ${item.gold ? 'text-[#D4AF37]' : 'text-t-primary'}`}>check</span>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* 가격 */}
                                        <div className="flex items-baseline justify-between z-10 pt-3 border-t border-themed">
                                            <span className={`text-[12px] font-medium ${item.gold ? 'text-[#D4AF37]/60' : 'text-t-muted'}`}>{item.label} {monthLabel(m)}</span>
                                            <span className={`text-xl font-extrabold tracking-tight ${item.gold ? 'text-[#D4AF37]' : 'text-t-primary'}`}>{price.toLocaleString()} P</span>
                                        </div>

                                        <button
                                            onClick={() => handleBuy(item)}
                                            className={`w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-all z-10 ${
                                                item.gold
                                                    ? 'bg-black text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10'
                                                    : 'bg-btn-secondary text-t-primary hover:bg-card-hover'
                                            }`}
                                        >
                                            구매하기
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* PRO 구독 중: 구매할 상품 없음 */
                        <div className="flex flex-col items-center text-center py-10">
                            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-[34px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            </div>
                            <h2 className="text-lg font-extrabold text-t-primary mb-1.5">이미 Pro 구독 중이에요</h2>
                            <p className="text-[13px] font-medium text-t-muted leading-relaxed mb-6">최고 등급의 모든 혜택을 이용하고 계세요.<br />모은 포인트는 구독 갱신에 사용할 수 있어요.</p>
                            <button
                                onClick={() => router.push('/my_subscription')}
                                className="px-6 py-3 rounded-xl bg-btn-secondary text-t-primary font-bold text-sm active:scale-95 transition-all border border-themed"
                            >
                                내 구독 관리
                            </button>
                        </div>
                    )}

                </div>

                {/* Recent History */}
                <div className="mt-4 px-6 mb-12 flex flex-col items-center">
                    <div className="bg-zinc-900 w-full rounded-2xl p-4 flex justify-between items-center border border-themed">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-t-primary">Standard 구독 1개월 구매</span>
                            <span className="text-[11px] font-medium text-t-muted">2026-01-28</span>
                        </div>
                        <span className="text-[#FF453A] font-bold text-sm">-5,000 P</span>
                    </div>
                    <button
                        onClick={() => router.push('/point_history')}
                        className="text-t-muted text-[12px] font-semibold mt-4 hover:text-t-primary transition-colors"
                    >
                        전체 내역 보기 &gt;
                    </button>
                </div>

            </div>

            {/* 구매 확인 다이얼로그 */}
            {step === 'confirm' && selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('shop')} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <h3 className="text-lg font-extrabold text-t-primary text-center mb-1">{selectedItem.name} 구매</h3>
                        <p className="text-t-muted text-sm text-center mb-5">{selectedItem.price.toLocaleString()}P를 사용하며, 구매 후 보유 구독권으로 지급돼요</p>
                        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-2 mb-6 border border-themed">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-t-muted">현재 포인트</span>
                                <span className="text-t-primary font-bold">{points.toLocaleString()}P</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-t-muted">차감 후</span>
                                <span className="text-t-primary font-bold">{(points - selectedItem.price).toLocaleString()}P</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('shop')} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                            <button onClick={() => setStep('complete')} className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all">구매하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 포인트 부족 다이얼로그 */}
            {step === 'insufficient' && selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setStep('shop')} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <span className="material-symbols-outlined text-[40px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-t-primary text-center mb-2">포인트가 부족해요</h3>
                        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-2 mb-6 border border-themed">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-t-muted">필요 포인트</span>
                                <span className="text-t-primary font-bold">{selectedItem.price.toLocaleString()}P</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-t-muted">현재 포인트</span>
                                <span className="text-t-primary font-bold">{points.toLocaleString()}P</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium pt-2 border-t border-themed">
                                <span className="text-t-muted">부족 포인트</span>
                                <span className="text-red-400 font-bold">{(selectedItem.price - points).toLocaleString()}P</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep('shop')} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">닫기</button>
                            <button onClick={() => router.push('/')} className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all">스캔하러 가기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
