import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MOCK_COUPONS = [
    {
        id: 'CP-001',
        title: '스타벅스 아메리카노 1잔',
        brand: 'Starbucks',
        code: 'SBUX-2026-GFT-7K9M',
        expiry: '2026-04-10',
        icon: 'local_cafe',
        wonDate: '2026-03-10',
        ticketNumber: '7763-2190-8842',
    },
    {
        id: 'CP-002',
        title: 'CU 편의점 3,000원 할인',
        brand: 'CU',
        code: 'CUGI-2026-EVT-3RX2',
        expiry: '2026-05-31',
        icon: 'store',
        wonDate: '2026-03-08',
        ticketNumber: '1155-6677-3300',
    },
];

export default function PrizeExchange() {
    const router = useRouter();
    const [expandedCoupon, setExpandedCoupon] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    const handleCopyCode = (code) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(code);
        }
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>FULIF - 내 당첨내역</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl pb-24">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-themed pt-12 pb-4 px-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary hover:text-t-primary transition-colors">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight m-0 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[22px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        내 당첨내역
                    </h1>
                </div>

                <div className="flex flex-col px-6 pt-8 pb-12 gap-6">

                    {/* Summary */}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-card-gray rounded-2xl p-4 border border-themed flex flex-col items-center gap-1">
                            <span className="text-2xl font-extrabold text-[#14b8a6]">{MOCK_COUPONS.length}</span>
                            <span className="text-[11px] font-bold text-t-muted">총 당첨</span>
                        </div>
                        <div className="flex-1 bg-card-gray rounded-2xl p-4 border border-themed flex flex-col items-center gap-1">
                            <span className="text-2xl font-extrabold text-t-primary">{MOCK_COUPONS.filter(c => new Date(c.expiry) >= new Date()).length}</span>
                            <span className="text-[11px] font-bold text-t-muted">사용 가능</span>
                        </div>
                        <div className="flex-1 bg-card-gray rounded-2xl p-4 border border-themed flex flex-col items-center gap-1">
                            <span className="text-2xl font-extrabold text-t-dim">0</span>
                            <span className="text-[11px] font-bold text-t-muted">사용 완료</span>
                        </div>
                    </div>

                    {/* Coupon List */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-[18px] text-t-muted font-light">local_activity</span>
                        <h2 className="text-[13px] font-bold text-t-muted uppercase tracking-widest">내 쿠폰</h2>
                    </div>

                    {MOCK_COUPONS.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-card-gray rounded-3xl border border-themed">
                            <span className="material-symbols-outlined text-[48px] font-light text-t-dim mb-3">card_giftcard</span>
                            <span className="text-t-secondary font-semibold text-sm">당첨 내역이 없어요</span>
                            <span className="text-t-dim font-medium text-xs mt-1">스캔한 꽝 복권으로 추첨에 참여해보세요</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {MOCK_COUPONS.map((coupon) => {
                                const isExpanded = expandedCoupon === coupon.id;
                                const wasCopied = copiedCode === coupon.code;
                                return (
                                    <div key={coupon.id} className="bg-card-gray rounded-3xl border border-themed-light overflow-hidden transition-all">
                                        <button
                                            onClick={() => setExpandedCoupon(isExpanded ? null : coupon.id)}
                                            className="w-full flex items-center gap-4 p-5 text-left active:bg-card-hover transition-colors"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-[#14b8a6]/15 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-[22px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>{coupon.icon}</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                <span className="text-[15px] font-bold text-t-primary truncate">{coupon.title}</span>
                                                <span className="text-[11px] font-medium text-t-muted">{coupon.brand} · 유효기간: {coupon.expiry}</span>
                                            </div>
                                            <span className={`material-symbols-outlined text-[20px] text-t-dim transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                        </button>

                                        {isExpanded && (
                                            <div className="flex flex-col gap-4 px-5 pb-5 border-t border-themed">
                                                {/* 당첨 정보 */}
                                                <div className="flex flex-col gap-1 pt-4">
                                                    <div className="flex justify-between text-[12px]">
                                                        <span className="text-t-muted font-medium">당첨일</span>
                                                        <span className="text-t-primary font-semibold">{coupon.wonDate}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[12px]">
                                                        <span className="text-t-muted font-medium">복권 번호</span>
                                                        <span className="text-t-primary font-semibold tracking-wider">{coupon.ticketNumber}</span>
                                                    </div>
                                                </div>

                                                {/* 쿠폰 코드 */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[11px] font-bold text-t-muted uppercase tracking-widest">쿠폰 코드</span>
                                                    <div className="flex items-center gap-2 bg-input-bg border border-themed-light rounded-xl px-4 py-3">
                                                        <span className="flex-1 text-[15px] font-bold text-t-primary tracking-widest font-mono">{coupon.code}</span>
                                                        <button onClick={() => handleCopyCode(coupon.code)} className="shrink-0 active:scale-90 transition-transform">
                                                            <span className={`material-symbols-outlined text-[20px] transition-colors ${wasCopied ? 'text-[#14b8a6]' : 'text-t-secondary hover:text-t-primary'}`} style={wasCopied ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                                                {wasCopied ? 'check_circle' : 'content_copy'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                    {wasCopied && <span className="text-[12px] font-semibold text-[#14b8a6] px-1">클립보드에 복사되었습니다</span>}
                                                </div>

                                                {/* 바코드 */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[11px] font-bold text-t-muted uppercase tracking-widest">바코드</span>
                                                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2">
                                                        <svg width="100%" height="72" viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg">
                                                            {coupon.code.split('').map((char, i) => {
                                                                const seed = char.charCodeAt(0) + i;
                                                                const x = 4 + i * (280 / coupon.code.length);
                                                                const w = seed % 2 === 0 ? 2 : 1;
                                                                const h = 48 + (seed % 3) * 8;
                                                                return <rect key={i} x={x} y={(72 - h) / 2} width={w} height={h} fill="#111" />;
                                                            })}
                                                            {Array.from({ length: 60 }).map((_, i) => {
                                                                const seed = (i * 37 + 13) % 97;
                                                                return <rect key={`d-${i}`} x={4 + i * 4.5} y={(72 - (44 + (seed % 4) * 7)) / 2} width={seed % 3 === 0 ? 2 : 1} height={44 + (seed % 4) * 7} fill="#111" opacity="0.6" />;
                                                            })}
                                                        </svg>
                                                        <span className="text-[11px] font-bold text-black/50 tracking-[0.2em] font-mono">{coupon.code}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                                                    <span className="material-symbols-outlined text-[16px] text-amber-400 mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                                                    <span className="text-[12px] font-medium text-amber-400/90 leading-relaxed">
                                                        매장에서 바코드를 제시하거나 코드를 입력해 사용하세요. 유효기간 내에만 사용할 수 있습니다.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
