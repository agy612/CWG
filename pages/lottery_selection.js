import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const lotteries = [
    {
        id: 'KR_LOTTO_645',
        countryCode: 'KR',
        countryBg: '#003DA5',
        name: '동행복권 로또 6/45',
        schedule: '매주 토요일 오후 8시 35분 추첨',
        format: '1~45 중 6개 선택',
        prize: '25억원 추정',
        color: 'from-blue-600/20 to-blue-900/10',
        borderActive: 'border-blue-500/50',
    },
    {
        id: 'JP_LOTO6_643',
        countryCode: 'JP',
        countryBg: '#BC002D',
        name: 'ロト6 (로또6)',
        schedule: '매주 월요일/목요일 오후 7시 추첨',
        format: '1~43 중 6개 선택',
        prize: '¥200,000,000 추정',
        color: 'from-red-600/20 to-red-900/10',
        borderActive: 'border-red-500/50',
    },
    {
        id: 'EU_EUROMILLIONS_550',
        countryCode: 'EU',
        countryBg: '#003399',
        name: 'EuroMillions',
        schedule: '매주 화/금 오후 9시 추첨 (CET)',
        format: '1~50 중 5개 + 1~12 중 2개',
        prize: '€130,000,000 추정',
        color: 'from-indigo-600/20 to-indigo-900/10',
        borderActive: 'border-indigo-500/50',
    },
    {
        id: 'EU_EUROJACKPOT_550',
        countryCode: 'EU',
        countryBg: '#003399',
        name: 'Eurojackpot',
        schedule: '매주 화/금 오후 9시 추첨 (CET)',
        format: '1~50 중 5개 + 1~12 중 2개',
        prize: '€90,000,000 추정',
        color: 'from-amber-600/20 to-amber-900/10',
        borderActive: 'border-amber-500/50',
    },
];

function FlagBadge({ code, bg }) {
    return (
        <svg width="28" height="20" viewBox="0 0 28 20" style={{ borderRadius: 4, flexShrink: 0 }}>
            <rect width="28" height="20" rx="3" fill={bg} />
            <text x="14" y="14" textAnchor="middle" fontSize="8" fontWeight="800"
                fill="#fff" fontFamily="Inter,sans-serif" letterSpacing="0.5">
                {code}
            </text>
        </svg>
    );
}

export default function LotterySelection() {
    const router = useRouter();
    const [selected, setSelected] = useState(null);

    const handleConfirm = () => {
        if (!selected) return;
        if (typeof window !== 'undefined') {
            localStorage.setItem('lottery_selected', selected);
            const completed = localStorage.getItem('onboarding_completed');
            if (completed) {
                router.push('/');
            } else {
                router.push('/onboarding');
            }
        }
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased overflow-x-hidden min-h-screen">
            <Head><title>CWG - 로또 선택</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                {/* Header */}
                <div className="flex flex-col items-center mt-16 mb-10 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-card-gray to-surface flex items-center justify-center mb-6 shadow-2xl border border-themed-light">
                        <span className="material-symbols-outlined text-t-primary text-[32px]">filter_vintage</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-center">어떤 로또를<br />이용하시나요?</h1>
                </div>

                {/* Lottery Cards */}
                <div className="flex flex-col px-6 gap-4 pb-40">
                    {lotteries.map((lotto) => {
                        const isSelected = selected === lotto.id;
                        return (
                            <div
                                key={lotto.id}
                                onClick={() => setSelected(lotto.id)}
                                className={`relative flex flex-col p-6 rounded-3xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                                    isSelected
                                        ? `bg-gradient-to-br ${lotto.color} border ${lotto.borderActive} shadow-[0_0_20px_var(--color-glow)]`
                                        : 'bg-card-gray border border-themed hover:bg-card-hover'
                                }`}
                            >
                                {/* Prize + Check */}
                                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                    {isSelected && (
                                        <div className="size-6 rounded-full bg-bg-inverse flex items-center justify-center shadow-lg">
                                            <span className="material-symbols-outlined text-t-inverse text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                        </div>
                                    )}
                                    <span className="text-t-primary font-extrabold tracking-tight text-sm">{lotto.prize}</span>
                                </div>

                                {/* Name */}
                                <div className="flex items-center gap-2 mb-4 pr-24">
                                    <FlagBadge code={lotto.countryCode} bg={lotto.countryBg} />
                                    <span className="text-[17px] font-bold tracking-tight text-t-primary leading-tight">{lotto.name}</span>
                                </div>

                                {/* Details */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-t-secondary">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        <span className="text-[12px] font-medium">{lotto.schedule}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-t-secondary">
                                        <span className="material-symbols-outlined text-[14px]">format_list_numbered</span>
                                        <span className="text-[12px] font-medium">{lotto.format}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Confirm Button — fixed bottom */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                    <button
                        onClick={handleConfirm}
                        disabled={!selected}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 ${
                            selected
                                ? 'bg-bg-inverse text-t-inverse shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                                : 'bg-btn-secondary text-t-muted cursor-not-allowed'
                        }`}
                    >
                        {selected ? '선택 완료' : '로또를 선택해주세요'}
                    </button>
                </div>
            </div>
        </div>
    );
}
