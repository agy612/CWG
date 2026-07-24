import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { SPONSOR_LOGOS, pickByIndex } from './components/ads/dummyAds';
import BannerAd from './components/ads/BannerAd';

/**
 * number_push — 번호생성 푸시알림 전용 랜딩 (기능제안서 ① · 대표님 요청).
 *
 * 기존: 푸시알림 클릭 → 번호생성 탭으로 이동 (광고 노출 없음)
 * 제안: 푸시알림 클릭 → 생성된 번호와 광고가 함께 있는 "전용 페이지"로 이동
 *
 * 구성 원칙: 번호생성 탭의 이번 주 10세트 + "단일 스폰서" 광고 하나만.
 *   여러 광고를 섞지 않고 한 기업이 이 페이지 전체를 후원하는 형식
 *   (상단 스폰서 배지와 하단 광고 카드가 같은 브랜드 — 회차별로 로테이션).
 *   단일 스폰서가 페이지 전체를 후원하는 형식이라 등급(구독 여부)과 무관하게 노출한다.
 */

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* 이번 주 추천 10세트 (번호생성 탭과 동일 데이터 — API 연동 시 교체) */
const WEEKLY_PICKS = [
    { set: 1, nums: [7, 14, 22, 31, 38, 43], tag: '추천' },
    { set: 2, nums: [3, 11, 19, 27, 35, 44], tag: null },
    { set: 3, nums: [5, 12, 21, 29, 37, 42], tag: null },
    { set: 4, nums: [2, 9, 18, 26, 34, 41], tag: null },
    { set: 5, nums: [6, 13, 20, 28, 36, 45], tag: null },
    { set: 6, nums: [1, 8, 17, 25, 33, 40], tag: null },
    { set: 7, nums: [4, 10, 16, 24, 32, 39], tag: null },
    { set: 8, nums: [2, 11, 23, 30, 38, 44], tag: null },
    { set: 9, nums: [7, 15, 19, 27, 36, 43], tag: null },
    { set: 10, nums: [3, 13, 22, 31, 40, 45], tag: null },
];

const FREE_PREVIEW_COUNT = 2; // 무료 회원에게 도착하는 세트 수 (10세트 중)

export default function NumberPush() {
    const router = useRouter();
    const { picksUnlocked, picksUnlockCost, points } = useUser();
    const [myNumbers, setMyNumbers] = useState([]);
    const [unlocked, setUnlocked] = useState(false);

    const round = router.query.round || '1228';
    const roundNum = parseInt(round, 10) || 0;
    // 스폰서 로고 (띠배너와 동일 소재) — 회차 기준 로테이션
    const sponsorLogo = pickByIndex(SPONSOR_LOGOS, roundNum);

    // 구독자(STANDARD/PRO)는 10세트 전부. 무료(FREE/GUEST)는 2세트만 도착 + 잠김(200P 열람).
    const isSubscriber = picksUnlocked;
    const unlockCost = picksUnlockCost || 200;
    const visiblePicks = isSubscriber ? WEEKLY_PICKS : WEEKLY_PICKS.slice(0, FREE_PREVIEW_COUNT);
    const showLock = !isSubscriber && !unlocked;

    useEffect(() => {
        try { setMyNumbers(JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]')); } catch {}
    }, []);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 이번 주 번호 도착</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-12">

                {/* Header */}
                <div className="pt-12 pb-2 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="text-[12px] font-bold text-t-muted">이번 주 번호 생성</span>
                    </div>
                    <button onClick={() => router.push('/')} aria-label="닫기" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                        <span className="material-symbols-outlined text-[22px] text-t-secondary">close</span>
                    </button>
                </div>

                {/* Hero */}
                <div className="px-6 mb-4">
                    <h1 className="text-[24px] font-extrabold tracking-tight leading-snug">
                        {isSubscriber
                            ? <>이번 주 Fulif픽<br />10세트가 도착했어요</>
                            : <>이번 주 Fulif픽<br />{FREE_PREVIEW_COUNT}세트가 도착했어요</>}
                    </h1>
                    <p className="text-t-muted text-[13px] font-medium mt-2">
                        로또6/45 제{round}회 · 추첨 토요일 저녁 8시 45분
                    </p>
                </div>

                {/* 스폰서 라인 — 띠배너와 동일한 실제 로고 + 응원 문구 (등급 무관 노출) */}
                <div className="px-6 mb-3">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-card-gray border border-themed">
                        <img src={sponsorLogo.src} alt="" draggable={false}
                             className="h-4 w-auto object-contain select-none" style={{ maxWidth: 64 }} />
                        <span className="text-[11px] font-semibold text-t-muted">이번 주 행운을 응원합니다</span>
                    </div>
                </div>

                {/* 배너 광고 (홈과 동일한 미디엄 배너, 회차 기준 로테이션) — 이 페이지는 단일 스폰서로 등급 무관 노출 */}
                <BannerAd size="medium" index={roundNum} className="mb-5" />

                {/* 이번 주 추천 세트 (구독자 10세트 / 무료 2세트) */}
                <div className="px-6 flex flex-col gap-2">
                    {visiblePicks.map((pick) => (
                        <div key={pick.set} className="bg-card-gray rounded-2xl px-4 py-3 border border-themed flex items-center gap-2">
                            <span className="text-t-faint text-xs font-bold w-6 text-center flex-shrink-0">{pick.set}</span>
                            {showLock ? (
                                <div className="flex items-center justify-center gap-2 flex-1">
                                    <span className="material-symbols-outlined text-[18px] text-t-dim">lock</span>
                                    <span className="text-t-muted text-base font-bold tracking-[0.15em] opacity-80 select-none">?? · ?? · ?? · ?? · ?? · ??</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 flex-1 justify-center">
                                    {pick.nums.map((num, j) => (
                                        <div key={j} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold ${LOTTO_BALL_COLOR(num)}`}>
                                            {String(num).padStart(2, '0')}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {pick.tag && !showLock ? (
                                <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full flex-shrink-0">{pick.tag}</span>
                            ) : (
                                <span className="w-6 flex-shrink-0" />
                            )}
                        </div>
                    ))}

                    {/* 무료 회원 안내 — 200P 열람 / 구독 유도 */}
                    {!isSubscriber && (
                        <div className="mt-3 bg-card-gray rounded-2xl border border-themed p-5 flex flex-col items-center text-center">
                            {!unlocked ? (
                                <>
                                    <span className="material-symbols-outlined text-[26px] text-[#14b8a6] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                                    <p className="text-[14px] font-extrabold text-t-primary">
                                        무료 회원은 이번 주 {FREE_PREVIEW_COUNT}세트만 받아요
                                    </p>
                                    <p className="text-[12px] font-medium text-t-muted mt-1.5 leading-relaxed">
                                        받은 {FREE_PREVIEW_COUNT}세트는 <span className="text-t-primary font-bold">{unlockCost}P</span>로 열람할 수 있어요
                                    </p>
                                    <div className="text-t-dim text-[11px] font-medium mt-1">보유 포인트: {points.toLocaleString()}P</div>
                                    <button
                                        disabled={points < unlockCost}
                                        onClick={() => { if (points >= unlockCost) setUnlocked(true); }}
                                        className="w-full mt-4 py-3.5 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all disabled:opacity-30"
                                    >
                                        {points >= unlockCost ? `${unlockCost}P로 ${FREE_PREVIEW_COUNT}세트 열람하기` : `포인트 부족 (${unlockCost - points}P 더 필요)`}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[26px] text-[#D4AF37] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                                    <p className="text-[14px] font-extrabold text-t-primary">나머지 8세트가 궁금하다면?</p>
                                </>
                            )}
                            <div className="w-full mt-4 pt-4 border-t border-themed flex flex-col items-center">
                                <p className="text-[13px] font-bold text-t-primary">
                                    구독하면 <span className="text-[#14b8a6]">매주 10세트 전부</span> 받아요
                                </p>
                                <button
                                    onClick={() => router.push('/subscription')}
                                    className="mt-3 text-[13px] font-extrabold text-[#14b8a6] active:scale-95 transition-all"
                                >
                                    구독하고 매주 10세트 받기 &gt;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 내가 만든 번호 (있을 때만 11번부터 이어서) */}
                    {myNumbers.map((item, i) => (
                        <div key={`my${i}`} className="bg-card-gray rounded-2xl px-4 py-3 border border-[#14b8a6]/30 flex items-center gap-2">
                            <span className="text-[#14b8a6] text-xs font-bold w-6 text-center flex-shrink-0">{11 + i}</span>
                            <div className="flex items-center gap-1.5 flex-1 justify-center">
                                {item.numbers.map((num, j) => (
                                    <div key={j} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold ${LOTTO_BALL_COLOR(num)}`}>
                                        {String(num).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-[#14b8a6] bg-[#14b8a6]/15 px-2 py-0.5 rounded-full flex-shrink-0">{item.preset}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
