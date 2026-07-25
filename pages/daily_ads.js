import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import InterstitialAd from './components/ads/InterstitialAd';

/**
 * 오늘의 광고 보기 — 광고 길이 1초당 1P 차등 적립 (15초 광고 = 15P).
 * 하루 한도: 무료 회원 10편 · 구독(Standard/PRO) 회원 20편. 매일 자정(기기 시간) 초기화.
 * 저장: cwg_daily_ads = { date, count, earned }
 */

const KEY = 'cwg_daily_ads';
const FREE_LIMIT = 10;
const PAID_LIMIT = 20;

/* 광고별 재생 길이(초) — 1초 = 1P. 실서비스에서는 광고 네트워크가 내려주는 값 */
const AD_DURATIONS = [15, 10, 20, 12, 18, 8, 25, 15, 10, 30, 14, 16, 22, 9, 17, 11, 19, 13, 24, 15];
const durationFor = (i) => AD_DURATIONS[i % AD_DURATIONS.length];

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(KEY));
        if (saved && saved.date === todayStr()) return saved;
    } catch { /* 손상 시 초기화 */ }
    return { date: todayStr(), count: 0, earned: 0 };
}

export default function DailyAds() {
    const router = useRouter();
    const { subscriptionPlan } = useUser();
    const [state, setState] = useState({ date: '', count: 0, earned: 0 });
    const [mounted, setMounted] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [showReward, setShowReward] = useState(false);

    const dailyLimit = subscriptionPlan ? PAID_LIMIT : FREE_LIMIT;

    useEffect(() => {
        setState(loadState());
        setMounted(true);
    }, []);

    const persist = (next) => {
        setState(next);
        localStorage.setItem(KEY, JSON.stringify(next));
    };

    const count = mounted ? state.count : 0;
    const earned = mounted ? state.earned : 0;
    const done = count >= dailyLimit;
    const remaining = Math.max(0, dailyLimit - count);

    const nextReward = durationFor(count);                       // 다음 광고 적립액
    const lastEarned = count > 0 ? durationFor(count - 1) : 0;   // 방금 본 광고 적립액
    const maxToday = Array.from({ length: dailyLimit }, (_, i) => durationFor(i)).reduce((a, b) => a + b, 0);

    /* 광고 카운트다운 완료 시 적립 — 광고 길이(초)만큼 포인트 지급 */
    const handleAdReward = () => {
        const cur = loadState();
        if (cur.count >= dailyLimit) return;
        persist({ ...cur, count: cur.count + 1, earned: cur.earned + durationFor(cur.count) });
    };

    const handleAdClose = () => {
        setShowAd(false);
        setShowReward(true);
    };

    /* 임시(디자인 확인용) — 시청 기록 초기화 */
    const resetAds = () => {
        localStorage.removeItem(KEY);
        setState({ date: todayStr(), count: 0, earned: 0 });
        setShowReward(false);
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 오늘의 광고 보기</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-32">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight flex-1">오늘의 광고 보기</h1>
                    {/* 임시 — 디자인 확인용 초기화 버튼 */}
                    <button
                        onClick={resetAds}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-themed text-t-muted active:scale-90 transition-transform"
                    >
                        <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                        <span className="text-[11px] font-bold">초기화</span>
                    </button>
                </div>

                {/* Hero — 풀리 + 오늘의 적립 */}
                <div className="mx-6 bg-card-gray rounded-3xl border border-themed mb-4 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 pointer-events-none"
                         style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />
                    <div className="relative p-6 pr-32">
                        <div className="text-t-muted text-[12px] font-bold mb-1.5">
                            {done ? '오늘 준비된 광고를 다 봤어요!' : '지금 광고 한 편 보면'}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-[40px] font-extrabold tracking-tight leading-none text-t-primary">
                                {done ? `+${earned}P` : `+${nextReward}P`}
                            </span>
                            <span className="text-[18px] font-extrabold text-t-secondary">{done ? '적립 완료' : '바로 적립'}</span>
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft border border-accent">
                            <span className="material-symbols-outlined text-[13px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                            <span className="text-[11px] font-extrabold text-accent">
                                {done ? `내일 또 ${dailyLimit}편이 준비돼요` : `오늘 ${count}편 시청 · +${earned}P 받았어요`}
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-2 pointer-events-none"
                         style={{ filter: 'drop-shadow(0 6px 20px rgba(74,222,128,0.45))' }}>
                        <Image src="/character.png" alt="풀리" width={118} height={118} unoptimized priority />
                    </div>
                </div>

                {/* 오늘의 시청 현황 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-extrabold text-t-primary">오늘의 시청 현황</span>
                        <span className="text-[11px] font-bold text-t-muted">{count}/{dailyLimit}편</span>
                    </div>
                    <div className="text-[10px] font-semibold text-t-dim mb-4">
                        매일 자정에 초기화 · {subscriptionPlan ? `구독 회원은 하루 ${PAID_LIMIT}편까지` : `무료 회원은 하루 ${FREE_LIMIT}편까지`}
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-background overflow-hidden border border-themed mb-4">
                        <div className="h-full rounded-full bg-accent transition-all duration-500"
                             style={{ width: `${(count / dailyLimit) * 100}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-0.5 rounded-2xl py-3 bg-background border border-themed">
                            <span className="text-[15px] font-extrabold text-accent leading-none">+{earned}P</span>
                            <span className="text-[10px] font-bold text-t-dim mt-1">오늘 적립</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 rounded-2xl py-3 bg-background border border-themed">
                            <span className="text-[15px] font-extrabold text-t-primary leading-none">{remaining}편</span>
                            <span className="text-[10px] font-bold text-t-dim mt-1">남은 광고</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 rounded-2xl py-3 bg-[#D4AF37]/8 border border-[#D4AF37]/30">
                            <span className="text-[15px] font-extrabold text-[#D4AF37] leading-none">{maxToday}P</span>
                            <span className="text-[10px] font-bold text-t-dim mt-1">오늘 최대</span>
                        </div>
                    </div>

                    {!subscriptionPlan && (
                        <button
                            onClick={() => router.push('/subscription')}
                            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/25 active:scale-[0.98] transition-all"
                        >
                            <span className="material-symbols-outlined text-[14px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                            <span className="text-[11px] font-bold text-[#D4AF37]">구독하면 하루 {PAID_LIMIT}편까지 볼 수 있어요</span>
                        </button>
                    )}
                </div>

                {/* 이용 안내 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                    <div className="text-sm font-extrabold text-t-primary mb-3">이렇게 적립돼요</div>
                    <div className="flex flex-col gap-2.5">
                        {[
                            { icon: 'smart_display', text: '광고를 끝까지 보면 포인트가 바로 적립돼요' },
                            { icon: 'timer', text: '광고 길이에 따라 적립 포인트가 조금씩 달라요 (1초당 1P)' },
                            { icon: 'schedule', text: `매일 자정(00:00)에 새로 채워져요 · 무료 ${FREE_LIMIT}편, 구독 회원 ${PAID_LIMIT}편` },
                            { icon: 'info', text: '광고를 도중에 닫으면 포인트가 적립되지 않아요' },
                        ].map((r, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-[16px] text-accent mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                                <span className="text-[12px] font-medium text-t-muted leading-relaxed flex-1">{r.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 pb-8 bg-gradient-to-t from-background via-background to-transparent">
                    <button
                        onClick={() => setShowAd(true)}
                        disabled={!mounted || done}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all ${
                            done
                                ? 'bg-btn-secondary text-t-dim'
                                : 'bg-accent text-accent-fg active:scale-95'
                        }`}
                    >
                        {done
                            ? '오늘 시청 완료 ✓ 내일 또 만나요'
                            : `${count + 1}번째 광고 보고 +${nextReward}P 받기`}
                    </button>
                </div>

                {/* 적립 완료 시트 */}
                {showReward && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowReward(false)} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-8 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-[11px] font-bold text-t-muted mb-3 tracking-widest uppercase">
                                    오늘 {count}번째 광고 시청 완료
                                </div>
                                <Image src="/character.png" alt="풀리" width={90} height={90} unoptimized
                                    style={{ filter: 'drop-shadow(0 6px 20px rgba(74,222,128,0.4))' }} />
                                <div className="text-[24px] font-extrabold text-accent mt-2 mb-1">+{lastEarned}P</div>
                                <div className="text-[13px] text-t-muted font-medium mb-5">
                                    {done
                                        ? <span className="text-[#D4AF37] font-bold">오늘 {dailyLimit}편 모두 시청! 총 +{earned}P를 받았어요 🎉</span>
                                        : <>포인트가 적립되었어요 · 오늘 총 <span className="text-t-primary font-bold">+{earned}P</span></>}
                                </div>
                                {!done && (
                                    <button
                                        onClick={() => { setShowReward(false); setShowAd(true); }}
                                        className="w-full py-4 rounded-xl bg-accent-soft text-accent font-extrabold text-sm border border-accent active:scale-95 transition-all mb-2"
                                    >
                                        이어서 한 편 더 보기 (+{nextReward}P)
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowReward(false)}
                                    className={`w-full rounded-xl font-extrabold text-sm active:scale-95 transition-all ${
                                        done
                                            ? 'py-4 bg-accent text-accent-fg'
                                            : 'py-3 bg-transparent text-t-dim font-semibold text-[13px]'
                                    }`}
                                >
                                    {done ? '확인' : '오늘은 여기까지'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 보상형 전면광고 — 카운트다운 = 광고 길이(초) */}
                <InterstitialAd
                    open={showAd}
                    countdownSec={nextReward}
                    index={count}
                    onReward={handleAdReward}
                    onClose={handleAdClose}
                />
            </div>
        </div>
    );
}
