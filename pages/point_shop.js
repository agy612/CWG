import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

const ITEMS = [
    { id: 'sub_standard', type: 'SUBSCRIPTION', tier: 'STANDARD', name: 'Standard 구독 1개월', price: 5000, originalPrice: null, features: ['CWG 픽 무제한 열람', '스캔 포인트 1.5배', '광고 제거'] },
    { id: 'sub_pro', type: 'SUBSCRIPTION', tier: 'PRO', name: 'Pro 구독 1개월', price: 8000, originalPrice: null, features: ['CWG 픽 무제한 열람', '스캔 포인트 2.0배', '챔피언십 1일 1회 무료'], gold: true },
    { id: 'ticket_10', type: 'TICKET', name: '10회 묶음', count: 10, price: 800, originalPrice: 1000, discount: 20, recommended: true },
    { id: 'ticket_5', type: 'TICKET', name: '5회 묶음', count: 5, price: 450, originalPrice: 500, discount: 10 },
    { id: 'ticket_1', type: 'TICKET', name: '1회 티켓', count: 1, price: 100, originalPrice: null },
];

export default function PointShop() {
    const router = useRouter();
    const { tier, points } = useUser();
    const [selectedItem, setSelectedItem] = useState(null);
    const [step, setStep] = useState('shop'); // 'shop' | 'confirm' | 'complete' | 'insufficient'

    // Tier-based filtering
    const visibleSubs = ITEMS.filter(i => {
        if (i.type !== 'SUBSCRIPTION') return false;
        if (tier === 'PRO') return false;           // PRO: 구독권 숨김
        if (tier === 'STANDARD') return i.tier === 'PRO'; // STANDARD: Pro만 보이기
        return true;                                // FREE: 전체
    });
    const tickets = ITEMS.filter(i => i.type === 'TICKET');

    const handleBuy = (item) => {
        setSelectedItem(item);
        if (points < item.price) {
            setStep('insufficient');
        } else {
            setStep('confirm');
        }
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
                        {selectedItem.type === 'SUBSCRIPTION' && (
                            <div className="flex justify-between text-sm mt-1 pt-3 border-t border-themed">
                                <span className="text-t-muted font-medium">구독 기간</span>
                                <span className="text-t-primary font-bold">2026-02-28 ~ 2026-03-28</span>
                            </div>
                        )}
                        {selectedItem.type === 'TICKET' && (
                            <div className="flex justify-between text-sm mt-1 pt-3 border-t border-themed">
                                <span className="text-t-muted font-medium">지급된 티켓</span>
                                <span className="text-[#14b8a6] font-bold">+{selectedItem.count}회</span>
                            </div>
                        )}
                    </div>
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                        <button onClick={() => router.push('/')} className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all mb-3">홈으로</button>
                        <button onClick={() => { setStep('shop'); setSelectedItem(null); }} className="w-full py-3 text-t-muted text-sm font-semibold active:opacity-60">계속 쇼핑하기</button>
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
                    {visibleSubs.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-[13px] font-bold text-t-muted uppercase tracking-widest pl-1">구독권 구매</h2>

                            {visibleSubs.map(item => (
                                <div
                                    key={item.id}
                                    className={`rounded-3xl p-6 border flex flex-col gap-4 relative overflow-hidden group transition-colors ${
                                        item.gold
                                            ? 'bg-gradient-to-br from-[#1A1813] to-[#2A2410] border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                                            : 'bg-card-gray border border-themed hover:border-themed-medium'
                                    }`}
                                >
                                    {item.gold && <div className="absolute inset-0 metallic-grain" />}
                                    <div className="flex justify-between items-start z-10">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-lg font-bold ${item.gold ? 'text-[#D4AF37]' : 'text-t-primary'}`}>{item.name}</span>
                                            <span className={`text-xs font-semibold line-through ${item.gold ? 'text-[#D4AF37]/50' : 'text-t-muted'}`}>₩{(item.price).toLocaleString()} 상당</span>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-sm font-extrabold flex items-center gap-1 shadow-lg ${item.gold ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA8222] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-bg-inverse text-t-inverse'}`}>
                                            {item.price.toLocaleString()} P
                                        </div>
                                    </div>
                                    <ul className={`text-[13px] font-medium flex flex-col gap-2 z-10 ${item.gold ? 'text-[#D4AF37]/80' : 'text-t-secondary'}`}>
                                        {item.features.map((f, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className={`material-symbols-outlined text-[14px] ${item.gold ? 'text-[#D4AF37]' : 'text-t-primary'}`}>check</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleBuy(item)}
                                        className={`w-full mt-2 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all z-10 ${
                                            points < item.price
                                                ? 'bg-btn-secondary text-t-muted cursor-not-allowed'
                                                : item.gold
                                                    ? 'bg-black text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10'
                                                    : 'bg-btn-secondary text-t-primary hover:bg-card-hover'
                                        }`}
                                    >
                                        {points < item.price ? `포인트 부족 (${(item.price - points).toLocaleString()}P 더 필요)` : '구매하기'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tickets Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-[13px] font-bold text-t-muted uppercase tracking-widest pl-1">챔피언십 티켓 구매</h2>

                        {/* 10x Ticket */}
                        <div className="bg-card-gray rounded-3xl p-5 border border-[#14b8a6]/30 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 bg-[#14b8a6] text-black text-[10px] font-extrabold px-3 py-1 rounded-br-xl uppercase tracking-widest z-10 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                가장 경제적
                            </div>
                            <div className="flex flex-col gap-1 mt-4 z-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold">10회 묶음</span>
                                    <span className="bg-[#14b8a6]/20 text-[#14b8a6] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#14b8a6]/20">20% 할인</span>
                                </div>
                                <span className="text-xs font-semibold text-t-muted line-through">1,000 P</span>
                            </div>
                            <button
                                onClick={() => handleBuy(ITEMS.find(i => i.id === 'ticket_10'))}
                                className={`px-4 py-2.5 rounded-xl text-[14px] font-extrabold active:scale-95 transition-transform z-10 ${
                                    points < 800 ? 'bg-btn-secondary text-t-muted' : 'bg-bg-inverse text-t-inverse'
                                }`}
                            >
                                800 P
                            </button>
                        </div>

                        {/* 5x Ticket */}
                        <div className="bg-card-gray rounded-3xl p-5 border border-themed flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-bold">5회 묶음</span>
                                    <span className="text-t-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-t-dim">10% 할인</span>
                                </div>
                                <span className="text-xs font-semibold text-t-muted line-through">500 P</span>
                            </div>
                            <button
                                onClick={() => handleBuy(ITEMS.find(i => i.id === 'ticket_5'))}
                                className={`px-4 py-2.5 rounded-xl text-[14px] font-extrabold active:scale-95 transition-transform ${
                                    points < 450 ? 'bg-btn-secondary text-t-muted' : 'bg-btn-secondary text-t-primary hover:bg-card-hover'
                                }`}
                            >
                                450 P
                            </button>
                        </div>

                        {/* 1x Ticket */}
                        <div className="bg-card-gray rounded-3xl p-5 border border-themed flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-bold">1회 티켓</span>
                            </div>
                            <button
                                onClick={() => handleBuy(ITEMS.find(i => i.id === 'ticket_1'))}
                                className={`px-4 py-2.5 rounded-xl text-[14px] font-extrabold active:scale-95 transition-transform ${
                                    points < 100 ? 'bg-btn-secondary text-t-muted' : 'bg-btn-secondary text-t-primary hover:bg-card-hover'
                                }`}
                            >
                                100 P
                            </button>
                        </div>
                    </div>

                </div>

                {/* Recent History */}
                <div className="mt-4 px-6 mb-12 flex flex-col items-center">
                    <div className="bg-surface w-full rounded-2xl p-4 flex justify-between items-center border border-themed">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-t-primary">챔피언십 10회 묶음 구매</span>
                            <span className="text-[11px] font-medium text-t-muted">2026-02-25</span>
                        </div>
                        <span className="text-[#FF453A] font-bold text-sm">-800 P</span>
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
                        <p className="text-t-muted text-sm text-center mb-5">{selectedItem.price.toLocaleString()}P를 사용합니다</p>
                        <div className="bg-surface rounded-2xl p-4 flex flex-col gap-2 mb-6 border border-themed">
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
                        <div className="bg-surface rounded-2xl p-4 flex flex-col gap-2 mb-6 border border-themed">
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
