import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import PlanPicker from '../components/PlanPicker';

const GOLD         = 'var(--color-gold)';
const GOLD_FG      = 'var(--color-gold-fg)';
const GOLD_BORDER  = 'var(--color-gold-border)';
const GOLD_CARD_BG = 'var(--color-gold-card-bg)';

export default function Subscription() {
    const router = useRouter();
    const { tier, subscriptionExpiry } = useUser();
    const nextBillingDate = subscriptionExpiry || '2026-03-25';

    /* PRO는 추가 살 게 없음 → 관리 페이지로 안내 */
    if (tier === 'PRO') {
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 구독</title></Head>
                <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">
                    <div className="pt-12 pb-6 px-6 flex items-center gap-3">
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                        </button>
                        <h1 className="text-lg font-extrabold tracking-tight">구독</h1>
                    </div>

                    <div
                        className="mx-6 p-6 rounded-3xl border flex flex-col items-center text-center gap-4"
                        style={{ background: GOLD_CARD_BG, borderColor: GOLD_BORDER }}
                    >
                        <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1", color: GOLD }}>workspace_premium</span>
                        <div className="text-2xl font-extrabold" style={{ color: GOLD }}>이미 PRO 구독 중</div>
                        <p className="text-sm text-t-muted font-medium">최고 등급입니다. 다음 결제일은 {nextBillingDate}.</p>
                        <button
                            onClick={() => router.push('/my_subscription')}
                            className="w-full mt-2 py-4 rounded-xl font-extrabold text-base active:scale-95 transition-all"
                            style={{ background: GOLD, color: GOLD_FG }}
                        >
                            구독 관리하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* FREE / STANDARD → 플랜 피커 */
    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - Subscription</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-16">
                <div className="pt-12 pb-2 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                </div>
                <PlanPicker tier={tier} nextBillingDate={nextBillingDate} />
            </div>
        </div>
    );
}
