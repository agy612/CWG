import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import LogoStripAd from './components/ads/LogoStripAd';
import InterstitialAd from './components/ads/InterstitialAd';
import { CHOICE_ADS } from './components/ads/dummyAds';

function FlagBadge({ code, bg }) {
    return (
        <svg width="18" height="13" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
            <rect width="22" height="16" rx="2" fill={bg} />
            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{code}</text>
        </svg>
    );
}

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const SCANNED_SETS_INITIAL = [
    { id: 1, numbers: [7, 14, 22, 31, 38, 43] },
    { id: 2, numbers: [3, 11, 19, 27, 35, 41] },
    { id: 3, numbers: [5, 12, 18, 24, 33, 42] },
    { id: 4, numbers: [9, 16, 21, 28, 37, 45] },
    { id: 5, numbers: [1, 8, 15, 26, 34, 40] },
];

const AD_CATEGORIES = ['전체', ...new Set(CHOICE_ADS.map(a => a.category))];
const MAX_AD_POINTS = Math.max(...CHOICE_ADS.map(a => a.points));

export default function ScanResult() {
    const router = useRouter();
    const { tier, scanBasePoints, hasAds } = useUser();

    const [sets, setSets] = useState(SCANNED_SETS_INITIAL);
    const [editing, setEditing] = useState(null); // { setIdx, numIdx }
    const [editVal, setEditVal] = useState('');

    // Per-set ad reward state: { [setIdx]: { tierIdx, points, duration } }
    const [setRewards, setSetRewards] = useState({});

    // Ad picker sheet & interstitial state
    const [pickerSetIdx, setPickerSetIdx] = useState(null);
    const [adCategory, setAdCategory] = useState('전체');
    const [activeAd, setActiveAd] = useState(null); // 선택한 광고 (CHOICE_ADS 항목 + idx)
    const [activeAdSetIdx, setActiveAdSetIdx] = useState(null);
    const [showInterstitial, setShowInterstitial] = useState(false);

    const navigatedRef = useRef(false);

    const watchedCount = Object.keys(setRewards).length;
    const totalAdPoints = Object.values(setRewards).reduce((sum, r) => sum + r.points, 0);
    const totalEarned = scanBasePoints + totalAdPoints;

    const accentColor = tier === 'PRO' ? '#D4AF37' : '#14b8a6';
    const accentBgClass = tier === 'PRO' ? 'bg-[#D4AF37]/15' : 'bg-[#14b8a6]/15';

    const startEdit = (setIdx, numIdx) => {
        setEditing({ setIdx, numIdx });
        setEditVal(String(sets[setIdx].numbers[numIdx]));
    };
    const commitEdit = () => {
        if (!editing) return;
        const val = parseInt(editVal, 10);
        if (!isNaN(val) && val >= 1 && val <= 45) {
            const next = sets.map((s, i) => {
                if (i !== editing.setIdx) return s;
                const nums = [...s.numbers];
                nums[editing.numIdx] = val;
                return { ...s, numbers: nums.sort((a, b) => a - b) };
            });
            setSets(next);
        }
        setEditing(null);
    };

    const openAdPicker = (setIdx) => { setPickerSetIdx(setIdx); setAdCategory('전체'); };
    const closeAdPicker = () => setPickerSetIdx(null);

    const pickAd = (ad, idx) => {
        if (pickerSetIdx === null) return;
        setActiveAdSetIdx(pickerSetIdx);
        setActiveAd({ ...ad, idx });
        setPickerSetIdx(null);
        setShowInterstitial(true);
    };

    const handleAdReward = () => {
        if (activeAdSetIdx === null || !activeAd) return;
        setSetRewards(prev => ({
            ...prev,
            [activeAdSetIdx]: { adId: activeAd.id, points: activeAd.points, duration: activeAd.duration },
        }));
    };
    const handleAdClose = () => {
        setShowInterstitial(false);
        setActiveAdSetIdx(null);
        setActiveAd(null);
    };

    const filteredAds = adCategory === '전체' ? CHOICE_ADS : CHOICE_ADS.filter(a => a.category === adCategory);

    // Navigate to completion page after all sets watched & interstitial closed
    useEffect(() => {
        if (Object.keys(setRewards).length === sets.length && !showInterstitial && !navigatedRef.current) {
            navigatedRef.current = true;
            const t = setTimeout(() => {
                router.push({
                    pathname: '/scan_complete',
                    query: {
                        earned: totalEarned,
                        base: scanBasePoints,
                        ad: totalAdPoints,
                        sets: sets.length,
                        round: 1159,
                    },
                });
            }, 250);
            return () => clearTimeout(t);
        }
    }, [setRewards, showInterstitial, sets.length, totalEarned, scanBasePoints, totalAdPoints, router]);

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 스캔 완료</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-36">

                {/* Header — no back button */}
                <div className="pt-12 pb-3 px-6 flex items-center justify-center">
                    <h1 className="text-base font-extrabold tracking-tight">낙첨 확인 완료</h1>
                </div>

                {/* ── COMPACT SUMMARY ── */}
                <div className="mx-6 mt-2 mb-3 rounded-2xl px-4 py-3.5 border relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}1a 0%, transparent 70%), #141414`,
                        borderColor: `${accentColor}40`,
                    }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full ${accentBgClass} flex items-center justify-center flex-shrink-0`}>
                                <span className="material-symbols-outlined text-[20px]" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>check</span>
                            </div>
                            <div className="min-w-0">
                                <div className="text-[12px] font-extrabold text-t-primary leading-tight">포인트 적립 완료</div>
                                <div className="text-[10px] text-t-muted font-medium mt-0.5">
                                    기본 {scanBasePoints}P
                                    {totalAdPoints > 0 && (
                                        <> · <span style={{ color: accentColor }}>광고 +{totalAdPoints}P</span></>
                                    )}
                                    {hasAds && <> · 응모 {watchedCount}/5</>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-0.5 flex-shrink-0" key={totalEarned}>
                            <span className="text-[28px] font-extrabold leading-none tracking-tight"
                                style={{ color: accentColor, animation: 'pointPop 0.4s ease' }}>
                                +{totalEarned}
                            </span>
                            <span className="text-[13px] font-extrabold" style={{ color: accentColor }}>P</span>
                        </div>
                    </div>
                </div>

                {/* ── GAME INFO BANNER (shared across all 5 sets) ── */}
                <div className="mx-6 mb-3 bg-card-gray rounded-2xl px-4 py-2.5 border border-themed">
                    <div className="flex items-center gap-2 flex-wrap">
                        <FlagBadge code="KR" bg="#003DA5" />
                        <span className="text-[12px] font-bold text-t-primary">로또6/45</span>
                        <span className="text-[10px] font-bold text-t-muted bg-white/8 px-1.5 py-0.5 rounded-full">제1159회</span>
                        <span className="text-white/15">·</span>
                        <span className="text-[10px] text-t-muted font-medium">2026-02-27</span>
                        <span className="ml-auto text-[10px] text-[#14b8a6] font-semibold">낙첨 확인됨</span>
                    </div>
                </div>

                {tier !== 'FREE' && (
                    <div className="mx-6 mb-3 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-themed">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        <span className="text-[11px] font-semibold" style={{ color: accentColor }}>
                            {tier} 구독: 광고 없이 자동 {tier === 'PRO' ? '2.0' : '1.5'}배 적립
                        </span>
                    </div>
                )}

                {/* ── 5 SET CARDS ── */}
                <div className="px-6 space-y-2.5">
                    {sets.map((s, setIdx) => {
                        const reward = setRewards[setIdx];
                        const watched = !!reward;
                        return (
                            <div key={s.id}
                                 className="bg-card-gray rounded-2xl border transition-all"
                                 style={{
                                     borderColor: watched ? `${accentColor}40` : 'rgba(255,255,255,0.08)',
                                     background: watched ? `linear-gradient(135deg, ${accentColor}10 0%, transparent 80%), #141414` : undefined,
                                 }}>
                                {/* Set header */}
                                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-t-muted bg-white/8 px-2 py-0.5 rounded-full">
                                            세트 {setIdx + 1}
                                        </span>
                                        <span className="text-[10px] text-t-faint font-bold">낙첨</span>
                                    </div>
                                    {watched && (
                                        <div className="flex items-center gap-1 text-[10px] font-extrabold" style={{ color: accentColor }}>
                                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            <span>+{reward.points}P</span>
                                        </div>
                                    )}
                                </div>

                                {/* Numbers row — editable */}
                                <div className="px-4 pb-3">
                                    <div className="flex gap-1.5 justify-center flex-wrap">
                                        {s.numbers.map((num, numIdx) => {
                                            const isEditing = editing && editing.setIdx === setIdx && editing.numIdx === numIdx;
                                            return (
                                                <div key={numIdx}>
                                                    {isEditing ? (
                                                        <input type="number" min="1" max="45" value={editVal} autoFocus
                                                            onChange={e => setEditVal(e.target.value)}
                                                            onBlur={commitEdit}
                                                            onKeyDown={e => e.key === 'Enter' && commitEdit()}
                                                            className="w-9 h-9 rounded-full bg-white text-black text-[12px] font-extrabold text-center outline-none border-2 border-[#14b8a6]"
                                                        />
                                                    ) : (
                                                        <button onClick={() => startEdit(setIdx, numIdx)}
                                                                className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_BALL_COLOR(num)} active:scale-90 transition-transform`}>
                                                            {num}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Per-set CTA / Watched state */}
                                {watched ? (
                                    <div className="mx-3 mb-3 rounded-xl px-3 py-2.5 flex items-center gap-2"
                                         style={{ background: `${accentColor}14`, border: `1px solid ${accentColor}30` }}>
                                        <span className="material-symbols-outlined text-[16px]"
                                              style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-extrabold" style={{ color: accentColor }}>경품추첨등록 완료</div>
                                            <div className="text-[9px] text-t-muted font-medium mt-0.5">{reward.duration}초 광고 시청 · +{reward.points}P 적립</div>
                                        </div>
                                    </div>
                                ) : hasAds ? (
                                    <button onClick={() => openAdPicker(setIdx)}
                                            className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-xl px-3 py-3 flex items-center justify-between gap-2 active:scale-[0.98] transition-all"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(20,184,166,0.04) 100%)',
                                                border: '1px solid rgba(20,184,166,0.4)',
                                            }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-[#14b8a6]/20 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[12px] font-extrabold text-t-primary leading-tight">광고 보고 경품 응모하기</div>
                                                <div className="text-[9px] text-t-muted font-medium mt-0.5">15초 시청 · +{MAX_AD_POINTS}P 추가 적립</div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-[18px] text-[#14b8a6]">chevron_right</span>
                                    </button>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                {/* Sponsor strip */}
                <div className="mb-24 mt-4">
                    <LogoStripAd />
                </div>

                {/* Bottom CTA */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                    <button onClick={() => router.push('/')} className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all mb-2">홈으로</button>
                    <button onClick={() => router.push('/scan_result')} className="w-full py-2.5 rounded-xl bg-transparent text-t-muted font-semibold text-[13px] active:scale-95 transition-all">계속 스캔하기</button>
                </div>

                {/* Ad picker bottom sheet */}
                {pickerSetIdx !== null && (
                    <div className="fixed inset-0 z-[900] flex items-end justify-center max-w-[430px] mx-auto" onClick={closeAdPicker}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <div className="relative w-full bg-[#141414] rounded-t-3xl border-t border-x border-themed p-6 pb-8 animate-slideUp"
                             onClick={e => e.stopPropagation()}>
                            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between mb-1">
                                <div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-t-muted mb-1">세트 {pickerSetIdx + 1}</div>
                                    <div className="text-[17px] font-extrabold text-t-primary leading-tight">광고 선택</div>
                                </div>
                                <button onClick={closeAdPicker} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center active:scale-90 transition-transform">
                                    <span className="material-symbols-outlined text-[18px] text-t-muted">close</span>
                                </button>
                            </div>
                            <p className="text-[11px] text-t-muted font-medium mb-3">보고 싶은 브랜드 광고를 고르세요 — 15초 시청 · +15P 적립</p>

                            {/* 카테고리 칩 */}
                            <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                                {AD_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setAdCategory(cat)}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                                            adCategory === cat
                                                ? 'bg-bg-inverse text-t-inverse border-transparent'
                                                : 'bg-white/5 text-t-muted border-themed'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* 광고 그리드 (10개, 스크롤) */}
                            <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pr-0.5" style={{ maxHeight: '46vh' }}>
                                {filteredAds.map((ad) => {
                                    const idx = CHOICE_ADS.indexOf(ad);
                                    return (
                                        <button
                                            key={ad.id}
                                            onClick={() => pickAd(ad, idx)}
                                            className="relative rounded-2xl overflow-hidden border border-white/10 active:scale-95 transition-all text-left"
                                            style={{ aspectRatio: '16 / 10', background: 'linear-gradient(160deg, #ffffff 0%, #edf0f4 100%)' }}
                                        >
                                            {/* 데모 광고 소재 (로고 이미지) */}
                                            <div className="absolute inset-0 flex items-center justify-center p-6 pb-8">
                                                <img src={ad.img} alt="" draggable={false}
                                                     className="max-w-[72%] max-h-[46%] object-contain select-none" />
                                            </div>
                                            {/* 카테고리 + 시간 */}
                                            <span className="absolute top-1.5 left-2 z-20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-black/60 text-white/90">{ad.category}</span>
                                            <span className="absolute top-1.5 right-1.5 z-20 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-black/45 text-white tracking-tight">{ad.duration}s</span>
                                            {/* 브랜드 — 좌하단에 살짝 */}
                                            <span className="absolute left-2.5 bottom-2 z-10 text-[10px] font-semibold text-black/40 truncate max-w-[80%]">{ad.brand}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                                <span className="material-symbols-outlined text-[16px] text-t-muted">info</span>
                                <span className="text-[10px] text-t-muted font-medium leading-snug">광고 시청 시 경품 응모가 함께 등록됩니다</span>
                            </div>
                        </div>
                    </div>
                )}

                <InterstitialAd
                    open={showInterstitial}
                    onReward={handleAdReward}
                    onClose={handleAdClose}
                    index={activeAd?.idx ?? 0}
                    countdownSec={0}
                />

                <style jsx>{`
                    @keyframes pointPop {
                        0% { transform: scale(0.85); opacity: 0.5; }
                        60% { transform: scale(1.06); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    :global(.animate-slideUp) {
                        animation: slideUp 0.25s ease-out;
                    }
                `}</style>
            </div>
        </div>
    );
}
