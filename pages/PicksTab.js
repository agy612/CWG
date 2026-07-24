import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import LogoStripAd from './components/ads/LogoStripAd';
import BannerAd from './components/ads/BannerAd';
import TabHeader from './components/TabHeader';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

// Sample unlocked picks (shown to STANDARD/PRO)
const PICKS = [
    { set: 1, nums: [7, 14, 22, 31, 38, 43], tag: '추천', confidence: 92 },
    { set: 2, nums: [3, 11, 19, 27, 35, 44], tag: null, confidence: 87 },
    { set: 3, nums: [5, 12, 21, 29, 37, 42], tag: null, confidence: 85 },
    { set: 4, nums: [2, 9, 18, 26, 34, 41], tag: null, confidence: 83 },
    { set: 5, nums: [6, 13, 20, 28, 36, 45], tag: null, confidence: 81 },
    { set: 6, nums: [1, 8, 17, 25, 33, 40], tag: null, confidence: 79 },
    { set: 7, nums: [4, 10, 16, 24, 32, 39], tag: null, confidence: 77 },
    { set: 8, nums: [2, 11, 23, 30, 38, 44], tag: null, confidence: 75 },
    { set: 9, nums: [7, 15, 19, 27, 36, 43], tag: null, confidence: 73 },
    { set: 10, nums: [3, 13, 22, 31, 40, 45], tag: null, confidence: 71 },
];

export default function PicksTab({ embedded = false, onAddGenerate }) {
    const router = useRouter();
    const { tier, points, picksUnlocked, picksUnlockCost } = useUser();

    const isGuest = tier === 'GUEST';
    const [confirming, setConfirming] = useState(false);
    const [localUnlocked, setLocalUnlocked] = useState(false);

    const isUnlocked = picksUnlocked || localUnlocked;

    const handleUnlockConfirm = () => {
        setLocalUnlocked(true);
        setConfirming(false);
        window.dispatchEvent(new CustomEvent('cwg-picks-unlocked'));
    };

    return (
        <div className={`flex flex-col w-full bg-background text-t-primary ${embedded ? '' : 'min-h-screen pb-36'}`}>

            {/* 독립 모드 전용 헤더/지난주 카드 — 임베드(번호생성 탭) 시엔 부모가 제공 */}
            {!embedded && (
                <>
                    <TabHeader title="번호생성" subtitle="fulif 이번 주 번호 · 로또6/45 · 제1159회" />

                    {/* Last Week Prize Card */}
                    <div className="mx-6 bg-card-gray rounded-3xl p-8 flex flex-col gap-2 relative overflow-hidden border border-themed">
                        <div className="absolute right-0 top-0 w-32 h-32 opacity-20 pointer-events-none flex gap-1 transform rotate-12">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-full w-2 bg-gradient-to-t from-transparent via-[#14b8a6] to-transparent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                        </div>
                        <div className="text-t-muted text-[13px] font-semibold z-10">로또6/45 제1158회 · 2026-02-22 (토)</div>
                        <div className="mt-1 text-t-secondary text-[13px] font-semibold z-10">1등 당첨금</div>
                        <div className="text-[40px] font-extrabold tracking-tight text-t-primary z-10 leading-none">26억 4천만원</div>
                        <div className="mt-2 text-t-dim text-[13px] font-medium z-10">(8명 / 3.3억)</div>
                    </div>
                </>
            )}

            {/* Ad: Sponsor strip (번호생성 중간 광고 — 양쪽 모드 모두 표시) */}
            <div className={embedded ? 'mt-1' : 'mt-5'}>
                <LogoStripAd />
            </div>

            {/* Picks Section */}
            <div className="px-6 flex flex-col gap-3 mt-6">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold text-t-muted uppercase tracking-wider">{embedded ? 'Fulif 추천 번호 (10세트)' : '생성된 번호 (10세트)'}</h3>
                    {isUnlocked && (
                        <span className="text-xs font-semibold text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-1 rounded">무제한 열람</span>
                    )}
                </div>

                {PICKS.map((pick) => (
                    <React.Fragment key={pick.set}>
                        <div className="bg-card-gray rounded-2xl p-4 border border-themed relative">
                            {/* Set number */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-t-faint text-xs font-bold w-4 text-center">
                                {pick.set}
                            </div>

                            {isUnlocked ? (
                                <div className="flex items-center justify-center gap-1.5 pl-4">
                                    {pick.nums.map((num, idx) => (
                                        <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold ${LOTTO_BALL_COLOR(num)}`}>
                                            {num}
                                        </div>
                                    ))}
                                    {pick.tag && (
                                        <span className="ml-2 text-[10px] font-extrabold text-[#14b8a6] bg-[#14b8a6]/15 px-2 py-0.5 rounded-full">{pick.tag}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 pl-4">
                                    <span className="material-symbols-outlined text-[18px] text-t-dim">lock</span>
                                    <span className="text-t-muted text-base font-bold tracking-[0.15em] opacity-80 select-none">
                                        ?? - ?? - ?? - ?? - ?? - ??
                                    </span>
                                </div>
                            )}

                            {/* Confidence bar for unlocked */}
                            {isUnlocked && (
                                <div className="mt-3 flex items-center gap-2 px-0.5">
                                    <div className="flex-1 h-0.5 bg-btn-secondary rounded-full">
                                        <div className="h-full bg-[#14b8a6]/40 rounded-full" style={{ width: `${pick.confidence}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-t-dim">{pick.confidence}%</span>
                                </div>
                            )}
                        </div>

                        {/* 5번 세트 다음 미니 광고 배너 */}
                        {pick.set === 5 && (
                            <BannerAd size="small" noMargin index={2} className="my-1" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* 떠 있는 패널 — 열람 전: 열람 CTA / 열람 후(임베드): 번호 추가 생성 CTA.
                독립 모드는 기존대로 미열람 시에만 표시. */}
            {(embedded || !isUnlocked) && (
                <div className="fixed bottom-[80px] left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <div id="tut-picks-panel" className="bg-overlay-heavy backdrop-blur-xl p-6 rounded-3xl w-full flex flex-col items-center border border-themed-light shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        {!isUnlocked ? (
                            isGuest ? (
                                <>
                                    <p className="text-t-secondary text-[13px] font-semibold mb-5 text-center">로그인 후 번호를 열람할 수 있습니다</p>
                                    <button
                                        onClick={() => router.push('/signup')}
                                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-bold text-base active:scale-95 transition-all"
                                    >
                                        무료로 시작하기
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-4 text-t-secondary text-[13px] font-semibold mb-5">
                                        <span>• {picksUnlockCost}P로 1회 열람</span>
                                        <span>• 구독하면 무제한</span>
                                    </div>
                                    <div className="text-t-dim text-xs font-medium mb-4">보유 포인트: {points.toLocaleString()}P</div>
                                    <button
                                        disabled={points < picksUnlockCost}
                                        onClick={() => {
                                            if (points < picksUnlockCost) return;
                                            if (localStorage.getItem('tutorial_in_progress')) {
                                                handleUnlockConfirm();
                                            } else {
                                                setConfirming(true);
                                            }
                                        }}
                                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-bold text-base active:scale-95 transition-all disabled:opacity-30 mb-3"
                                    >
                                        {points >= picksUnlockCost ? `${picksUnlockCost}P로 열람하기` : `포인트 부족 (${picksUnlockCost - points}P 더 필요)`}
                                    </button>
                                    <button
                                        onClick={() => router.push('/subscription')}
                                        className="text-t-muted text-[13px] font-semibold hover:text-t-primary transition-colors"
                                    >
                                        구독 알아보기 &gt;
                                    </button>
                                </>
                            )
                        ) : (
                            /* 열람 완료 → 번호 추가 생성으로 이동 (임베드 전용) */
                            <>
                                <div className="flex items-center gap-1.5 mb-2.5">
                                    <span className="text-[10px] font-extrabold text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full tracking-wide">PRO</span>
                                    <span className="text-t-secondary text-[12px] font-semibold">나만의 전략으로 번호 직접 설계</span>
                                </div>
                                <button
                                    id="tut-generator"
                                    onClick={() => onAddGenerate && onAddGenerate()}
                                    className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                    번호 추가 생성하기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}



            {/* Unlocked state — analysis note */}
            {isUnlocked && (
                <div className="mx-6 mt-6 flex items-center gap-2 bg-[#14b8a6]/10 rounded-2xl p-4 border border-[#14b8a6]/20">
                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <span className="text-xs font-semibold text-[#14b8a6]">추첨 후 번호 일치 결과가 자동으로 확인됩니다</span>
                </div>
            )}

            {/* Confirm unlock dialog */}
            {confirming && (
                <div className="fixed inset-0 z-[600] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setConfirming(false)} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <div className="flex flex-col items-center gap-1 mb-6">
                            <span className="material-symbols-outlined text-[36px] text-[#14b8a6] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                            <h3 className="text-lg font-extrabold text-t-primary">번호 열람 확인</h3>
                            <p className="text-t-muted text-sm font-medium text-center">
                                {picksUnlockCost}P를 사용해서 이번 주 CWG 번호<br/>10세트를 열람합니다
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirming(false)}
                                className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleUnlockConfirm}
                                className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all"
                            >
                                {picksUnlockCost}P 사용하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
