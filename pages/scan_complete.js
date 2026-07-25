import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import ReviewPrompt, { canShowReview, markReviewShown } from '../components/ReviewPrompt';

export default function ScanComplete() {
    const router = useRouter();
    const { tier } = useUser();

    // 응모 완료 = 만족 순간 → 인앱 리뷰 유도 (90일 캡 · 트리거당 1회)
    // ?review=1 로 진입하면 캡 무시하고 강제 노출 (디자인 확인용 프리뷰)
    const [showReview, setShowReview] = useState(false);
    useEffect(() => {
        const preview = router.query.review === '1';
        if (!preview && !canShowReview('scan_complete')) return;
        const t = setTimeout(() => {
            if (!preview) markReviewShown('scan_complete');
            setShowReview(true);
        }, preview ? 300 : 1500);
        return () => clearTimeout(t);
    }, [router.query.review]);

    const earned = parseInt(router.query.earned || '0', 10);
    const base = parseInt(router.query.base || '0', 10);
    const adPoints = parseInt(router.query.ad || '0', 10);
    const setsCount = parseInt(router.query.sets || '5', 10);
    const round = router.query.round || '1159';

    const accentColor = tier === 'PRO' ? '#D4AF37' : '#3182F6';

    return (
        <div className="font-sans text-t-primary antialiased min-h-screen"
             style={{ background: `linear-gradient(180deg, ${accentColor}14 0%, #0a0a0a 35%, #0a0a0a 100%)` }}>
            <Head><title>CWG - 응모 완료</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto px-6 pt-14 pb-8">

                {/* Check icon */}
                <div className="flex flex-col items-center mt-6 mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full opacity-50 blur-3xl"
                             style={{ background: accentColor, transform: 'scale(1.4)' }} />
                        <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                             style={{
                                 background: `linear-gradient(135deg, ${accentColor}40 0%, ${accentColor}10 100%)`,
                                 border: `2px solid ${accentColor}60`,
                                 animation: 'trophyPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                             }}>
                            <span className="material-symbols-outlined text-[80px]"
                                  style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                            </span>
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <div className="text-center mb-6">
                    <h2 className="text-[22px] font-extrabold tracking-tight mb-1.5">모든 세트 응모 완료!</h2>
                    <p className="text-[12px] text-t-muted font-medium">
                        {setsCount}세트가 경품 추첨에 등록되었습니다
                    </p>
                </div>

                {/* Points hero */}
                <div className="rounded-3xl p-5 mb-3 border relative overflow-hidden"
                     style={{
                         background: `linear-gradient(160deg, ${accentColor}22 0%, transparent 70%), #141414`,
                         borderColor: `${accentColor}50`,
                     }}>
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-25 pointer-events-none"
                         style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }} />
                    <div className="relative z-10 flex flex-col items-center">
                        <p className="text-[11px] font-bold text-t-muted mb-1">총 적립 포인트</p>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-[44px] font-extrabold leading-none tracking-tight"
                                  style={{ color: accentColor }}>+{earned}</span>
                            <span className="text-[18px] font-extrabold" style={{ color: accentColor }}>P</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-t-muted bg-white/5 px-2 py-1 rounded-full">기본 {base}P</span>
                            {adPoints > 0 && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                                      style={{ background: `${accentColor}1f`, color: accentColor }}>
                                    광고 +{adPoints}P
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Entry info */}
                <div className="rounded-2xl bg-card-gray border border-themed p-4 mb-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-t-muted mb-3">응모 내역</div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] text-t-muted font-medium">응모 세트</div>
                                <div className="text-[13px] font-extrabold text-t-primary">{setsCount}세트 (제{round}회 로또6/45)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] text-t-muted font-medium">경품 추첨일</div>
                                <div className="text-[13px] font-extrabold text-t-primary">2026-03-10 (수)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tip */}
                <div className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-2.5"
                     style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}30` }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                    <span className="text-[11px] font-semibold leading-snug" style={{ color: accentColor }}>
                        다음 회차에도 스캔하고 매주 추첨에 응모하세요
                    </span>
                </div>

                {/* CTAs */}
                <div className="mt-auto space-y-2">
                    <button onClick={() => router.push('/')}
                            className="w-full py-4 rounded-xl font-extrabold text-base active:scale-95 transition-all"
                            style={{ background: accentColor, color: '#000' }}>
                        홈으로
                    </button>
                    <button onClick={() => router.push('/scan_result')}
                            className="w-full py-3 rounded-xl bg-white/5 text-t-primary font-bold text-[13px] active:scale-95 transition-all border border-themed">
                        계속 스캔하기
                    </button>
                </div>

                <ReviewPrompt open={showReview} onClose={() => setShowReview(false)} />

                <style jsx>{`
                    @keyframes trophyPop {
                        0% { transform: scale(0.4); opacity: 0; }
                        60% { transform: scale(1.08); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
}
