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
        hasAds: false,
        badgeColor: 'bg-zinc-700 text-zinc-300',
        badgeLabel: 'GUEST',
    },
    FREE: {
        tier: 'FREE',
        points: 650,
        scansThisMonth: 12,
        maxScansPerMonth: 30,
        subscriptionPlan: null,
        subscriptionExpiry: null,
        scanBasePoints: 50,
        adBoostPoints: 25,
        picksUnlocked: false,
        picksUnlockCost: 200,
        championshipCostFirst: 100,
        championshipCostAdditional: 100,
        championshipFreeToday: false,
        hasAds: true,
        badgeColor: 'bg-zinc-700 text-zinc-300',
        badgeLabel: 'FREE',
    },
    STANDARD: {
        tier: 'STANDARD',
        points: 1250,
        scansThisMonth: 18,
        maxScansPerMonth: 30,
        subscriptionPlan: 'STANDARD',
        subscriptionExpiry: '2026-03-15',
        scanBasePoints: 75,
        adBoostPoints: 0,
        picksUnlocked: true,
        picksUnlockCost: null,
        championshipCostFirst: 100,
        championshipCostAdditional: 100,
        championshipFreeToday: false,
        hasAds: false,
        badgeColor: 'bg-white/20 text-white',
        badgeLabel: 'STANDARD',
    },
    PRO: {
        tier: 'PRO',
        points: 1500,
        scansThisMonth: 25,
        maxScansPerMonth: 30,
        subscriptionPlan: 'PRO',
        subscriptionExpiry: '2026-03-15',
        scanBasePoints: 100,
        adBoostPoints: 100,
        picksUnlocked: true,
        picksUnlockCost: null,
        championshipCostFirst: 0,
        championshipCostAdditional: 50,
        championshipFreeToday: true,
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
