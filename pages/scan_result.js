import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

function FlagBadge({ code, bg }) {
    return (
        <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
            <rect width="22" height="16" rx="2" fill={bg} />
            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{code}</text>
        </svg>
    );
}

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-t-primary';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const INITIAL_NUMBERS = [7, 14, 22, 31, 38, 43];

export default function ScanResult() {
    const router = useRouter();
    const { tier, scanBasePoints, adBoostPoints, hasAds } = useUser();

    const [step, setStep] = useState('confirm');
    const [numbers, setNumbers] = useState(INITIAL_NUMBERS);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editVal, setEditVal] = useState('');
    const [adWatched, setAdWatched] = useState(false);

    const earnedPoints = adWatched ? scanBasePoints + adBoostPoints : scanBasePoints;
    const showAdOption = hasAds && !adWatched;

    const handleNumberEdit = (idx) => { setEditingIdx(idx); setEditVal(String(numbers[idx])); };
    const handleNumberCommit = (idx) => {
        const val = parseInt(editVal, 10);
        if (!isNaN(val) && val >= 1 && val <= 45) {
            const newNums = [...numbers];
            newNums[idx] = val;
            setNumbers(newNums.sort((a, b) => a - b));
        }
        setEditingIdx(null);
    };

    if (step === 'reward') {
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 스캔 완료</title></Head>
                <div className="relative flex min-h-screen w-full flex-col items-center max-w-[430px] mx-auto shadow-2xl px-6 pb-32 pt-12">

                    <div className="w-24 h-24 rounded-full bg-[#14b8a6]/15 flex items-center justify-center mb-6 mt-8">
                        <span className="material-symbols-outlined text-[48px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-center">낙첨 확인 완료!</h1>
                    <p className="text-t-muted text-sm font-medium mb-8 text-center">포인트가 적립되었습니다</p>

                    {/* Points */}
                    <div className="w-full bg-card-gray rounded-3xl p-8 flex flex-col items-center gap-2 border border-themed mb-4">
                        <div className="text-t-muted text-sm font-semibold">적립 포인트</div>
                        <div className="text-5xl font-extrabold text-[#14b8a6] tracking-tight">+{earnedPoints}P</div>
                        {adWatched && <div className="text-xs text-t-muted font-medium">기본 {scanBasePoints}P + 광고 보너스 {adBoostPoints}P</div>}
                        {tier === 'STANDARD' && <div className="text-xs text-[#14b8a6] font-semibold mt-1">STANDARD 1.5배 적립 적용</div>}
                        {tier === 'PRO' && !adWatched && <div className="text-xs text-[#D4AF37] font-semibold mt-1">PRO 2.0배 적립 적용</div>}
                        {tier === 'PRO' && adWatched && <div className="text-xs text-[#D4AF37] font-semibold mt-1">PRO 광고 부스트 4.0배 적용</div>}
                    </div>

                    {/* Numbers */}
                    <div className="w-full bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                        <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-4">확인된 번호 · 제1159회</div>
                        <div className="flex gap-2 justify-center">
                            {numbers.map((num, idx) => (
                                <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold ${LOTTO_BALL_COLOR(num)}`}>{num}</div>
                            ))}
                        </div>
                    </div>

                    {/* Ad Option (FREE/PRO only) */}
                    {showAdOption && (
                        <div className="w-full bg-card-gray rounded-3xl p-5 border border-themed mb-4">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="material-symbols-outlined text-[20px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                                <div>
                                    <div className="text-[15px] font-bold text-t-primary">광고 보기로 +{adBoostPoints}P 추가 적립</div>
                                    <div className="text-xs text-t-muted font-medium mt-0.5">
                                        {tier === 'PRO' ? '30초 광고 시청 후 4.0배 부스트 적용' : '30초 광고 시청 후 추가 포인트'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setAdWatched(true)} className="w-full py-3 rounded-xl bg-[#14b8a6]/20 text-[#14b8a6] font-bold text-sm border border-[#14b8a6]/30 active:scale-95 transition-all">
                                광고 보기 (+{adBoostPoints}P)
                            </button>
                        </div>
                    )}

                    {adWatched && (
                        <div className="w-full flex items-center gap-2 bg-[#14b8a6]/10 rounded-2xl p-4 border border-[#14b8a6]/20 mb-4">
                            <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="text-sm font-semibold text-[#14b8a6]">광고 보너스 +{adBoostPoints}P 적립 완료!</span>
                        </div>
                    )}

                    {/* STANDARD: no ads message */}
                    {tier === 'STANDARD' && (
                        <div className="w-full flex items-center gap-2 bg-card-hover rounded-2xl p-4 border border-themed mb-4">
                            <span className="material-symbols-outlined text-[18px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                            <span className="text-xs font-semibold text-t-secondary">STANDARD 구독: 광고 없이 자동으로 1.5배 적립</span>
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent">
                        <button onClick={() => router.push('/')} className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all mb-3">홈으로</button>
                        <button onClick={() => router.back()} className="w-full py-3 rounded-xl bg-transparent text-t-muted font-semibold text-sm active:scale-95 transition-all">계속 스캔하기</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 스캔 결과 확인</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-32">

                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">스캔 결과 확인</h1>
                </div>

                <div className="mx-6 mb-5 flex items-center gap-2 bg-[#14b8a6]/10 rounded-2xl p-4 border border-[#14b8a6]/20">
                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <span className="text-xs font-semibold text-[#14b8a6]">OCR로 인식된 번호입니다. 번호를 눌러 수정할 수 있습니다.</span>
                </div>

                {/* Game Info */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FlagBadge code="KR" bg="#003DA5" />
                        <span className="text-sm font-bold text-t-primary">한국 로또 6/45</span>
                        <span className="ml-auto text-xs font-semibold text-t-muted bg-btn-secondary px-2 py-1 rounded-full">제1159회</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-t-muted font-medium">
                        <span>구매일</span><span className="text-t-primary font-semibold">2026-02-27</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-t-muted font-medium mt-2">
                        <span>티켓 상태</span><span className="text-[#14b8a6] font-semibold">낙첨 확인됨</span>
                    </div>
                </div>

                {/* Numbers (editable) */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-4">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-4">인식된 번호 (탭하여 수정)</div>
                    <div className="flex gap-2 justify-center flex-wrap">
                        {numbers.map((num, idx) => (
                            <div key={idx}>
                                {editingIdx === idx ? (
                                    <input type="number" min="1" max="45" value={editVal} autoFocus
                                        onChange={e => setEditVal(e.target.value)}
                                        onBlur={() => handleNumberCommit(idx)}
                                        onKeyDown={e => e.key === 'Enter' && handleNumberCommit(idx)}
                                        className="w-12 h-12 rounded-full bg-white text-black text-sm font-extrabold text-center outline-none border-2 border-[#14b8a6]"
                                    />
                                ) : (
                                    <button onClick={() => handleNumberEdit(idx)} className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold ${LOTTO_BALL_COLOR(num)} active:scale-90 transition-transform`}>{num}</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Point Preview */}
                <div className="mx-6 bg-card-gray rounded-3xl p-5 border border-themed mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[24px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                        <div>
                            <div className="text-[13px] font-bold text-t-primary">적립 예정 포인트</div>
                            <div className="text-xs text-t-muted font-medium">
                                {tier === 'FREE' && '기본 50P (광고 시 +25P 추가)'}
                                {tier === 'STANDARD' && 'STANDARD 1.5배 자동 적용'}
                                {tier === 'PRO' && 'PRO 2.0배 (광고 시 4.0배 부스트)'}
                            </div>
                        </div>
                    </div>
                    <div className={`text-[22px] font-extrabold ${tier === 'PRO' ? 'text-[#D4AF37]' : 'text-[#14b8a6]'}`}>+{scanBasePoints}P</div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <button onClick={() => setStep('reward')} className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all">
                        낙첨 확인 및 포인트 적립
                    </button>
                </div>
            </div>
        </div>
    );
}
