import React, { createContext, useContext, useState } from 'react';

const TIER_CONFIGS = {
    GUEST: {
        tier: 'GUEST',
        points: 0,
        scansThisMonth: 0,
        maxScansPerMonth: 0,
        subscriptionPlan: null,
        subscriptionExpiry: null,
        scanBasePoints: 0,
        adBoostPoints: 0,
        picksUnlocked: false,
        picksUnlockCost: null,
        championshipCostFirst: null,
        championshipCostAdditional: null,
        championshipFreeToday: false,
        chatDailyLimit: 0, // 풀리 챗봇: 구독 전용 (무료·게스트 사용 불가)
        hasAds: false,
        badgeColor: 'bg-zinc-700 text-zinc-300',
        badgeLabel: 'GUEST',
    },
    FREE: {
        tier: 'FREE',
        points: 650,
        scansThisMonth: 4,
        maxScansPerMonth: 10,
        subscriptionPlan: null,
        subscriptionExpiry: null,
        scanBasePoints: 50,
        adBoostPoints: 25,
        picksUnlocked: false,
        picksUnlockCost: 200,
        championshipCostFirst: 100,
        championshipCostAdditional: 100,
        championshipFreeToday: false,
        chatDailyLimit: 0, // 풀리 챗봇: 구독 전용 (무료 사용 불가)
        hasAds: true,
        badgeColor: 'bg-zinc-700 text-zinc-300',
        badgeLabel: 'FREE',
    },
    STANDARD: {
        tier: 'STANDARD',
        points: 1250,
        scansThisMonth: 8,
        maxScansPerMonth: 20,
        subscriptionPlan: 'STANDARD',
        subscriptionExpiry: '2026-03-15',
        scanBasePoints: 75,
        adBoostPoints: 0,
        picksUnlocked: true,
        picksUnlockCost: null,
        championshipCostFirst: 100,
        championshipCostAdditional: 100,
        championshipFreeToday: false,
        chatDailyLimit: 3, // 풀리 챗봇: 하루 3회 (+광고 1편당 1회 충전)
        hasAds: false,
        badgeColor: 'bg-white/20 text-white',
        badgeLabel: 'STANDARD',
    },
    PRO: {
        tier: 'PRO',
        points: 1500,
        scansThisMonth: 12,
        maxScansPerMonth: 20,
        subscriptionPlan: 'PRO',
        subscriptionExpiry: '2026-03-15',
        scanBasePoints: 100,
        adBoostPoints: 100,
        picksUnlocked: true,
        picksUnlockCost: null,
        championshipCostFirst: 0,
        championshipCostAdditional: 50,
        championshipFreeToday: true,
        chatDailyLimit: 5, // 풀리 챗봇: 하루 5회 (+광고 1편당 1회 충전)
        hasAds: false,
        badgeColor: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30',
        badgeLabel: 'PRO',
    },
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [tier, setTier] = useState('FREE');
    const config = TIER_CONFIGS[tier];

    const switchTier = (newTier) => setTier(newTier);

    return (
        <UserContext.Provider value={{ ...config, switchTier, TIER_CONFIGS }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

export { TIER_CONFIGS };
