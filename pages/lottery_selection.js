import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

const lotteries = [
    {
        id: 'KR_LOTTO_645',
        countryCode: 'KR',
        countryBg: '#003DA5',
        name: '로또6/45',
        schedule: '매주 토요일 오후 8시 35분 추첨',
        format: '1~45 중 6개 선택',
        prizeDraw: '매주 경품추첨',
        regStart: '토 21:00',
        regEnd: '화 20:00',
        prizeDrawTime: '화 20:30',
        tzLabel: '한국(KST)',
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
        prizeDraw: '매주 경품추첨',
        regStart: '목 19:00',
        regEnd: '일 20:00',
        prizeDrawTime: '일 20:30',
        tzLabel: '일본(JST)',
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
        prizeDraw: '매주 경품추첨',
        regStart: '금 22:00',
        regEnd: '일 13:00',
        prizeDrawTime: '일 13:30',
        tzLabel: '프랑스(CET)',
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
        prizeDraw: '매주 경품추첨',
        regStart: '금 23:00',
        regEnd: '일 14:00',
        prizeDrawTime: '일 14:30',
        tzLabel: '헬싱키(EET)',
        color: 'from-amber-600/20 to-amber-900/10',
        borderActive: 'border-amber-500/50',
        demoUnverified: true,  // 데모: 위치 확인 실패 케이스
    },
];

/* 지역(국가) 표시용 — 인증 확인 화면에서 사용 */
const REGION = {
    KR: { flag: '🇰🇷', name: '대한민국', bg: '#003DA5' },
    JP: { flag: '🇯🇵', name: '일본',     bg: '#BC002D' },
    EU: { flag: '🇪🇺', name: '유럽',     bg: '#003399' },
};

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
    const [confirming, setConfirming] = useState(false);

    const selectedLotto = lotteries.find(l => l.id === selected);

    // 1단계: 로또 선택 완료 → 위치 확인 화면으로
    const goToVerify = () => {
        if (!selected) return;
        setConfirming(true);
    };

    // 2단계: 위치 확인 → 지역/로또 저장 후 홈으로
    const confirmRegion = () => {
        localStorage.setItem('lottery_selected', selected);
        if (selectedLotto) localStorage.setItem('region', selectedLotto.countryCode);
        router.replace('/');
    };

    /* ── 위치 확인 화면 (실제 인증 연동 전 목업) ── */
    if (confirming && selectedLotto) {
        const region = REGION[selectedLotto.countryCode];
        const unverified = selectedLotto.demoUnverified;  // 데모: 위치 확인 실패 케이스
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 지역 확인</title></Head>
                <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                    {/* 뒤로가기 */}
                    <div className="flex items-center gap-3 px-4 pt-12 pb-4">
                        <button onClick={() => setConfirming(false)}
                            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                        </button>
                    </div>

                    {/* 본문 */}
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <div className="relative mb-6">
                            <div className="text-[72px] leading-none" style={{ opacity: unverified ? 0.4 : 1, filter: unverified ? 'grayscale(0.6)' : 'none' }}>{region.flag}</div>
                            {unverified && (
                                <div className="absolute -bottom-1 -right-2 w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center border-[3px] border-[var(--color-bg)]">
                                    <span className="material-symbols-outlined text-[18px] text-black" style={{ fontVariationSettings: "'FILL' 1" }}>location_off</span>
                                </div>
                            )}
                        </div>

                        {unverified ? (
                            <>
                                <h1 className="text-[26px] font-extrabold tracking-tight leading-snug mb-3">
                                    현재 위치가<br />{region.name}으로 확인되지 않았어요
                                </h1>
                                <p className="text-t-muted text-[15px] font-medium leading-relaxed">
                                    {selectedLotto.name}은(는) {region.name} 지역에서만<br />이용할 수 있어요. 위치 인증이 필요해요.
                                </p>
                                <div className="mt-6 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2">
                                    <span className="material-symbols-outlined text-[16px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                    <span className="text-[12px] font-bold text-amber-400">위치 확인 실패</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-[26px] font-extrabold tracking-tight leading-snug mb-3">
                                    현재 위치가<br />{region.name}으로 확인됐어요
                                </h1>
                                <p className="text-t-muted text-[15px] font-medium leading-relaxed">
                                    {selectedLotto.name}을(를) 이용할 수 있어요.<br />이 지역으로 시작할까요?
                                </p>
                                <div className="mt-6 inline-flex items-center gap-1.5 bg-card-gray border border-themed-light rounded-full px-4 py-2">
                                    <span className="material-symbols-outlined text-[16px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    <span className="text-[12px] font-bold text-t-muted">위치 자동 확인됨</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 하단 버튼 */}
                    <div className="px-6 pb-12 pt-8 flex flex-col gap-3">
                        {unverified ? (
                            <>
                                <button onClick={confirmRegion}
                                    className="w-full py-4 rounded-xl bg-amber-500 text-black font-extrabold text-base active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
                                    위치 인증하기
                                </button>
                                <button onClick={() => setConfirming(false)}
                                    className="w-full py-4 rounded-xl bg-card-gray text-t-primary font-bold text-base active:scale-95 transition-all border border-themed-light">
                                    다른 지역 선택
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={confirmRegion}
                                    className="w-full py-4 rounded-xl bg-accent text-accent-fg font-extrabold text-base active:scale-95 transition-all">
                                    이 지역으로 시작
                                </button>
                                <button onClick={() => setConfirming(false)}
                                    className="w-full py-4 rounded-xl bg-card-gray text-t-primary font-bold text-base active:scale-95 transition-all border border-themed-light">
                                    다른 지역 선택
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background font-sans text-t-primary antialiased overflow-x-hidden min-h-screen">
            <Head><title>CWG - 로또 선택</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                {/* Header */}
                <div className="flex flex-col items-center mt-16 mb-10 px-6">
                    <div className="mb-6" style={{ filter: 'drop-shadow(0 8px 28px rgba(79,70,229,0.4))' }}>
                        <Image src="/A1.png" alt="FULIF" width={72} height={72} priority unoptimized />
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
                                        ? `bg-gradient-to-br ${lotto.color} border ${lotto.borderActive} shadow-[0_0_20px_rgba(255,255,255,0.05)]`
                                        : 'bg-card-gray border border-themed hover:bg-card-hover'
                                }`}
                            >
                                {/* Prize + Check */}
                                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                    {isSelected && (
                                        <div className="size-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            <span className="material-symbols-outlined text-black text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 bg-accent-soft border border-accent rounded-full px-2.5 py-1">
                                        <span className="material-symbols-outlined text-[13px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                                        <span className="text-[11px] font-extrabold text-accent whitespace-nowrap">{lotto.prizeDraw}</span>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="flex items-center gap-2 mb-4 pr-24">
                                    <FlagBadge code={lotto.countryCode} bg={lotto.countryBg} />
                                    <span className="text-[17px] font-bold tracking-tight text-t-primary leading-tight">{lotto.name}</span>
                                </div>

                                {/* Details */}
                                <div className="flex flex-col gap-1.5">
                                    {/* 번호 구조 */}
                                    <div className="flex items-center gap-2 text-t-secondary">
                                        <span className="material-symbols-outlined text-[14px]">format_list_numbered</span>
                                        <span className="text-[12px] font-medium">{lotto.format}</span>
                                    </div>
                                    {/* 낙첨티켓 등록 기간 */}
                                    <div className="flex items-center gap-2 text-t-secondary">
                                        <span className="material-symbols-outlined text-[14px]">event_available</span>
                                        <span className="text-[12px] font-medium">낙첨 등록 {lotto.regStart} ~ {lotto.regEnd}</span>
                                    </div>
                                    {/* 경품추첨 */}
                                    <div className="flex items-center gap-2 text-accent">
                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                                        <span className="text-[12px] font-semibold">경품추첨 매주 {lotto.prizeDrawTime}</span>
                                    </div>
                                    {/* 시간대 안내 */}
                                    <span className="text-[10px] text-t-faint font-medium mt-0.5 pl-[22px]">* 모든 시각 {lotto.tzLabel} 현지 기준</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Confirm Button — fixed bottom */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                    <button
                        onClick={goToVerify}
                        disabled={!selected}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 ${
                            selected
                                ? 'bg-accent text-accent-fg shadow-[0_0_20px_rgba(255,255,255,0.15)]'
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
