import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import PlanPicker, { PLAN_FEATURES } from '../components/PlanPicker';

export default function Subscription() {
    const router = useRouter();
    const { tier, subscriptionExpiry } = useUser();
    const nextBillingDate = subscriptionExpiry || '2026-03-25';

    /* 이미 PRO 구독 중 → 관리 안내 */
    if (tier === 'PRO') {
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>FULIF - 구독</title></Head>
                <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-24">
                    <div className="pt-12 pb-4 px-4 flex items-center gap-2">
                        <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                        </button>
                        <h1 className="text-[17px] font-bold tracking-tight">구독</h1>
                    </div>

                    <div className="px-6">
                        <div className="bg-card-gray rounded-[24px] p-6 ring-2 ring-accent flex flex-col items-center text-center">
                            <img src="/sub/badge.png" alt="" className="w-[52px] h-[52px] object-contain" />
                            <div className="text-[22px] font-bold text-t-primary mt-3">이미 PRO 구독 중이에요</div>
                            <p className="text-[14px] text-t-muted font-medium mt-1">다음 결제일 {nextBillingDate}</p>
                        </div>

                        <div className="bg-card-gray rounded-[20px] p-5 mt-3 flex flex-col gap-3">
                            {PLAN_FEATURES.PRO.map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    <span className="text-[14px] font-medium text-t-secondary">{f}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => router.push('/my_subscription')}
                            className="pressable w-full mt-4 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px]"
                        >
                            구독 관리하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* FREE → 플랜 피커 */
    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>FULIF - 구독</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-16">
                <div className="pt-12 pb-2 px-4 flex items-center gap-2">
                    <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                </div>
                <PlanPicker tier={tier} nextBillingDate={nextBillingDate} />
            </div>
        </div>
    );
}
