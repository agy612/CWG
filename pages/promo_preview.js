import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const PROMOS = [
    {
        id: 'POINT',
        label: '포인트 지급',
        icon: 'monetization_on',
        color: '#14b8a6',
        title: '신규 가입 환영 이벤트!',
        desc: '지금 바로 받아가세요!',
        benefits: ['500 포인트 즉시 지급', '챔피언십 3회 무료'],
        btnLabel: '받기',
        claimMsg: '500P가 지급되었습니다',
    },
    {
        id: 'COUPON',
        label: '쿠폰 지급',
        icon: 'confirmation_number',
        color: '#14b8a6',
        title: '챔피언십 무료 체험!',
        desc: '쿠폰함에서 바로 확인하세요',
        benefits: ['챔피언십 3회 무료 쿠폰'],
        couponCode: 'CHAMP2026',
        btnLabel: '쿠폰 받기',
        claimMsg: '쿠폰함에 등록되었습니다',
    },
    {
        id: 'TICKET',
        label: '무료 티켓',
        icon: 'local_activity',
        color: '#14b8a6',
        title: '첫 스캔 기념!',
        desc: '챔피언십 탭에서 확인하세요',
        benefits: ['챔피언십 3회 무료 티켓'],
        btnLabel: '받기',
        claimMsg: '챔피언십 탭에서 확인하세요',
    },
    {
        id: 'SUBSCRIPTION_DISCOUNT',
        label: '구독 할인',
        icon: 'workspace_premium',
        color: '#D4AF37',
        title: '첫 구독 특별 할인!',
        desc: '지금 구독하면 첫 달 50% 할인',
        benefits: ['Standard 첫 달 50% 할인  ₩5,000 → ₩2,500', 'Pro 첫 달 50% 할인  ₩8,000 → ₩4,000'],
        btnLabel: '할인 받기',
        claimMsg: '구독 화면으로 이동합니다',
    },
];

function PromoPopup({ promo, onClose }) {
    const [claimed, setClaimed] = useState(false);

    const handleClaim = () => {
        setClaimed(true);
        setTimeout(onClose, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 max-w-[430px] mx-auto">
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-[340px] bg-card-gray rounded-[28px] border border-themed-light shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">

                {/* Glow */}
                <div
                    className="absolute top-0 right-0 w-48 h-48 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
                    style={{ backgroundColor: `${promo.color}20` }}
                />

                {/* Header */}
                <div className="flex justify-between items-center px-5 pt-5 pb-4 border-b border-themed">
                    <span className="text-t-primary text-sm font-extrabold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: promo.color, fontVariationSettings: "'FILL' 1" }}>redeem</span>
                        특별 프로모션!
                    </span>
                    <button onClick={onClose}>
                        <span className="material-symbols-outlined text-[22px] text-t-muted hover:text-t-primary transition-colors">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center px-6 py-6 gap-4">
                    <div className="size-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${promo.color}20` }}>
                        <span className="material-symbols-outlined text-[32px]" style={{ color: promo.color, fontVariationSettings: "'FILL' 1" }}>{promo.icon}</span>
                    </div>

                    <h2 className="text-xl font-extrabold text-t-primary text-center">{promo.title}</h2>

                    <div className="w-full flex flex-col gap-2">
                        {promo.benefits.map((b, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded-xl px-4 py-3 border"
                                style={{ backgroundColor: `${promo.color}15`, borderColor: `${promo.color}40` }}
                            >
                                <span className="material-symbols-outlined text-[14px]" style={{ color: promo.color, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                <span className="text-sm font-semibold" style={{ color: promo.color }}>{b}</span>
                            </div>
                        ))}
                    </div>

                    {promo.couponCode && !claimed && (
                        <div className="w-full bg-btn-secondary rounded-xl px-4 py-3 border border-themed-light flex items-center justify-between">
                            <span className="text-t-muted text-xs font-semibold">쿠폰코드</span>
                            <span className="font-mono font-extrabold text-t-primary text-sm tracking-widest">{promo.couponCode}</span>
                        </div>
                    )}

                    <p className="text-t-muted text-sm text-center">{promo.desc}</p>

                    {claimed ? (
                        <div
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border"
                            style={{ backgroundColor: `${promo.color}15`, borderColor: `${promo.color}40` }}
                        >
                            <span className="material-symbols-outlined text-[20px]" style={{ color: promo.color, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="font-bold text-sm" style={{ color: promo.color }}>{promo.claimMsg}</span>
                        </div>
                    ) : (
                        <div className="w-full flex gap-3">
                            <button
                                onClick={handleClaim}
                                className="flex-1 py-3 rounded-xl bg-bg-inverse text-t-inverse font-bold text-sm active:scale-95 transition-all"
                            >
                                {promo.btnLabel}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl bg-btn-secondary text-t-secondary font-semibold text-sm active:scale-95 transition-all border border-themed"
                            >
                                나중에
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="w-full flex items-center justify-center py-3 border-t border-themed text-t-dim text-xs font-medium">
                    오늘 하루 보지 않기
                </div>
            </div>
        </div>
    );
}

export default function PromoPreview() {
    const router = useRouter();
    const [activePromo, setActivePromo] = useState(null);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG Dev - 프로모션 팝업</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-4 px-6 flex items-center gap-4 border-b border-themed">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-extrabold">프로모션 팝업</h1>
                        <p className="text-t-dim text-xs font-medium">Dev Preview · 4가지 유형</p>
                    </div>
                </div>

                {/* Promo Type Cards */}
                <div className="flex flex-col px-6 pt-6 pb-16 gap-3">
                    {PROMOS.map(promo => (
                        <button
                            key={promo.id}
                            onClick={() => setActivePromo(promo)}
                            className="w-full bg-card-gray rounded-2xl p-5 border border-themed flex items-center gap-4 active:opacity-70 transition-opacity text-left"
                        >
                            <div
                                className="size-12 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${promo.color}20` }}
                            >
                                <span
                                    className="material-symbols-outlined text-[24px]"
                                    style={{ color: promo.color, fontVariationSettings: "'FILL' 1" }}
                                >
                                    {promo.icon}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-t-primary">{promo.label}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-btn-secondary text-t-muted font-mono">{promo.id}</span>
                                </div>
                                <span className="text-xs text-t-muted font-medium">{promo.title}</span>
                            </div>
                            <span className="material-symbols-outlined text-[20px] text-t-dim flex-shrink-0">chevron_right</span>
                        </button>
                    ))}
                </div>
            </div>

            {activePromo && (
                <PromoPopup
                    key={activePromo.id}
                    promo={activePromo}
                    onClose={() => setActivePromo(null)}
                />
            )}
        </div>
    );
}
