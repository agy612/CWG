import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

/* ─── 샘플 데이터 (실제 스캔 결과 시뮬) ────────────────── */
const MY_NUMS  = [7, 14, 23, 31, 38, 43];
const WIN_NUMS = [8, 14, 24, 31, 37, 43];
const DRAW_NO  = 1159;

/* ─── 아쉬움 지수 알고리즘 ──────────────────────────────── */
function calcRegretIndex(myNums, winNums) {
    // ① ±1 차이 번호 (각 10점, 최대 40)
    const nearMisses = myNums.filter(n => winNums.some(w => Math.abs(w - n) === 1));
    const nearScore  = Math.min(40, nearMisses.length * 10);

    // ② 번호 합계 근접도 (최대 25)
    const mySum   = myNums.reduce((a, b) => a + b, 0);
    const winSum  = winNums.reduce((a, b) => a + b, 0);
    const sumDiff = Math.abs(mySum - winSum);
    const sumScore = Math.max(0, 25 - Math.floor(sumDiff / 2));

    // ③ 연속번호 일치 (연속 2개 이상 적중 시 +20)
    const hits = myNums.filter(n => winNums.includes(n));
    const sorted = [...hits].sort((a, b) => a - b);
    let consecutive = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) { consecutive++; break; }
    }
    const conScore = consecutive > 0 ? 20 : 0;

    // ④ 기본 적중 보너스 (각 3점)
    const hitScore = Math.min(15, hits.length * 3);

    return {
        total: Math.min(100, nearScore + sumScore + conScore + hitScore),
        nearMisses,
        nearScore,
        sumScore,
        conScore,
        hitScore,
        hits,
        mySum,
        winSum,
    };
}

/* ─── AI Re-Draw 번호 생성 ──────────────────────────────── */
function generateReDrawNums(myNums, winNums) {
    const result = [];
    // 적중 번호는 유지
    const hits = myNums.filter(n => winNums.includes(n));
    result.push(...hits);
    // 아쉬운 번호(±1)는 1씩 보정
    const nearMisses = myNums.filter(n => winNums.some(w => Math.abs(w - n) === 1));
    nearMisses.forEach(n => {
        const closer = winNums.find(w => Math.abs(w - n) === 1);
        const shifted = n + (closer - n > 0 ? 1 : -1);
        if (!result.includes(shifted) && shifted >= 1 && shifted <= 45) result.push(shifted);
    });
    // 나머지 슬롯: Hot 번호 위주 보충
    const HOT = [7, 14, 17, 22, 27, 34, 38, 42];
    HOT.forEach(n => { if (result.length < 6 && !result.includes(n)) result.push(n); });
    while (result.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!result.includes(n)) result.push(n);
    }
    return result.slice(0, 6).sort((a, b) => a - b);
}

/* ─── 컬러 헬퍼 ─────────────────────────────────────────── */
const LOTTO_COLOR = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* ─── 별점 ──────────────────────────────────────────────── */
function StarRow({ score }) {
    const filled = Math.round(score / 20);
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-[20px] ${i < filled ? 'text-yellow-400' : 'text-white/15'}`}
                    style={{ fontVariationSettings: i < filled ? "'FILL' 1" : "'FILL' 0" }}>star</span>
            ))}
        </div>
    );
}

/* ─── 히스토리 데이터 (데모) ─────────────────────────────── */
const SCANNER_HISTORY = [
    { id: 1, date: '4/21', drawNo: 1159, regretScore: 92, myNums: [7,14,23,31,38,43],  winNums: [8,14,24,31,37,43],  reDrawNums: [11,19,27,33,39,42] },
    { id: 2, date: '4/14', drawNo: 1158, regretScore: 74, myNums: [3,12,22,29,35,44],  winNums: [5,14,21,33,38,42],  reDrawNums: [7,15,24,30,38,44]  },
    { id: 3, date: '4/7',  drawNo: 1157, regretScore: 61, myNums: [8,16,24,32,38,45],  winNums: [9,17,24,31,37,43],  reDrawNums: [4,13,22,28,35,43]  },
    { id: 4, date: '3/31', drawNo: 1156, regretScore: 83, myNums: [6,15,23,31,36,42],  winNums: [7,14,22,32,37,43],  reDrawNums: [9,18,26,33,39,44]  },
];

const LOTTO_COLOR_SCANNER = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* ─── 메인 ──────────────────────────────────────────────── */
export default function AiScannerPage() {
    const router = useRouter();
    const { tier, points, scansThisMonth, maxScansPerMonth } = useUser();
    const isGuest = tier === 'GUEST';
    const scansLeft = maxScansPerMonth - scansThisMonth;
    const REDRAW_COST = 100;
    const canRedraw = points >= REDRAW_COST;
    const isLimitReached = scansLeft <= 0;

    const [step, setStep]           = useState('history'); // history | scan | analyzing | redrawing | result
    const [torchOn, setTorchOn]     = useState(false);
    const [analyzeIdx, setAnalyzeIdx] = useState(0);
    const [redrawIdx, setRedrawIdx] = useState(0);
    const [regret, setRegret]       = useState(null);
    const [reDrawNums, setReDrawNums] = useState([]);
    const [pointsClaimed, setPointsClaimed] = useState(false);
    const [selectedItem, setSelectedItem]   = useState(null);

    /* 재추첨 로딩 시퀀스 */
    useEffect(() => {
        if (step !== 'redrawing' || !selectedItem) return;
        const steps = ['낙첨 패턴 분석 중...', '±1 아쉬움 번호 계산 중...', 'Hot 번호 데이터 로딩 중...', '번호 보정 중...'];
        setRedrawIdx(0);
        const timers = steps.map((_, i) => setTimeout(() => setRedrawIdx(i), i * 650));
        const done = setTimeout(() => {
            setRegret(calcRegretIndex(selectedItem.myNums, selectedItem.winNums));
            setReDrawNums(selectedItem.reDrawNums);
            setStep('result');
        }, steps.length * 650 + 300);
        return () => { timers.forEach(clearTimeout); clearTimeout(done); };
    }, [step, selectedItem]);

    /* 분석 시퀀스 */
    useEffect(() => {
        if (step !== 'analyzing') return;
        const steps = [
            '복권 번호 인식 중...',
            '당첨 번호 불러오는 중...',
            '±1 아쉬움 번호 계산 중...',
            '합계 근접도 분석 중...',
            '연속번호 패턴 확인 중...',
            'AI Re-Draw 생성 중...',
        ];
        steps.forEach((_, i) => setTimeout(() => setAnalyzeIdx(i), i * 550));
        setTimeout(() => {
            setRegret(calcRegretIndex(MY_NUMS, WIN_NUMS));
            setReDrawNums(generateReDrawNums(MY_NUMS, WIN_NUMS));
            setStep('result');
        }, steps.length * 550 + 400);
    }, [step]);

    /* ══════════════════════════════════════════════════════
       GUEST / 한도 초과 가드
    ══════════════════════════════════════════════════════ */
    if (isGuest) return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary items-center justify-center px-6">
            <div className="w-20 h-20 rounded-full bg-card-gray flex items-center justify-center mb-6 border border-themed">
                <span className="material-symbols-outlined text-[40px] text-t-dim font-light">photo_camera</span>
            </div>
            <h2 className="text-2xl font-extrabold text-center mb-2">로그인이 필요합니다</h2>
            <p className="text-t-muted text-sm font-medium text-center mb-8">낙첨 티켓을 스캔하고 포인트를 적립하려면<br/>먼저 가입해주세요</p>
            <button onClick={() => router.push('/signup')}
                className="w-full max-w-[280px] py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all">
                무료로 시작하기
            </button>
        </div>
    );

    if (isLimitReached) return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary items-center justify-center px-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <span className="material-symbols-outlined text-[40px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
            </div>
            <h2 className="text-2xl font-extrabold text-center mb-2">이번 주 스캔 완료</h2>
            <p className="text-t-muted text-sm font-medium text-center mb-2">주 {maxScansPerMonth}회 스캔을 모두 사용했습니다</p>
            <p className="text-t-dim text-xs font-medium text-center mb-8">매주 초기화됩니다</p>
            <button onClick={() => router.push('/subscription')}
                className="w-full max-w-[280px] py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all">
                구독하고 계속하기
            </button>
        </div>
    );

    /* ══════════════════════════════════════════════════════
       STEP 1 · 스캔
    ══════════════════════════════════════════════════════ */
    if (step === 'history') return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-8">

            {/* 헤더 */}
            <header className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-themed relative">
                <button onClick={() => router.push('/?tab=contents')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <p className="text-[16px] font-extrabold absolute left-1/2 -translate-x-1/2">낙첨 내역</p>
                <button onClick={() => router.push('/?tab=scan')} className="ml-auto flex items-center gap-1.5 bg-[#14b8a6]/15 rounded-xl px-3 py-1.5 active:opacity-60 transition-opacity">
                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                    <span className="text-[11px] font-bold text-[#14b8a6]">낙첨 복권 스캔</span>
                </button>
            </header>

            {SCANNER_HISTORY.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 px-6 gap-6 mt-20">
                    <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <span className="material-symbols-outlined text-[40px] text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                    </div>
                    <div className="text-center">
                        <p className="text-[17px] font-extrabold mb-2">스캔 내역이 없어요</p>
                        <p className="text-t-muted text-[13px] leading-relaxed">낙첨 복권을 스캔하면<br/>아쉬움 지수와 AI Re-Draw를 받을 수 있어요</p>
                    </div>
                    <button onClick={() => router.push('/?tab=scan')}
                        className="flex items-center gap-2 px-6 py-3.5 bg-bg-inverse text-t-inverse font-bold text-[14px] rounded-2xl active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                        낙첨복권 스캔하기
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4 px-6 pb-32">
                    <div className="pt-4 pb-1">
                        <p className="text-[13px] text-t-muted leading-relaxed">등록한 낙첨 복권을 선택하면 AI가 아쉬움 지수와 낙첨 패턴을 분석해, 당첨 확률이 높은 번호로 보정한 재추첨 번호를 드려요.</p>
                    </div>
                    {SCANNER_HISTORY.map(item => {
                        const isSelected = selectedItem?.id === item.id;
                        return (
                            <button key={item.id}
                                onClick={() => setSelectedItem(isSelected ? null : item)}
                                className={`rounded-3xl overflow-hidden text-left active:scale-[0.98] transition-all w-full border-2 ${
                                    isSelected
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-transparent bg-card-gray'
                                }`}>
                                <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[11px] text-t-muted font-medium">로또6/45</p>
                                            <p className="text-[18px] font-extrabold text-t-primary">제{item.drawNo}회차</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] text-t-muted font-medium">{item.date}</span>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[13px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pb-1">
                                        {item.myNums.map(n => (
                                            <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold ${LOTTO_COLOR_SCANNER(n)}`}>
                                                {n}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* 하단 포인트 사용 바 */}
            {selectedItem && (
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <div className="bg-surface p-5 rounded-3xl w-full flex flex-col gap-4 border border-themed shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex justify-between w-full text-t-muted text-[13px] font-semibold">
                            <span>비용: <span className="font-bold text-t-primary">{REDRAW_COST}P</span></span>
                            {!isGuest && <span>잔액: <span className="text-t-primary font-bold">{points.toLocaleString()}P</span></span>}
                        </div>
                        {!canRedraw && !isGuest && (
                            <p className="text-xs text-red-400 font-semibold text-center">포인트가 부족합니다 ({REDRAW_COST - points}P 더 필요)</p>
                        )}
                        <button
                            onClick={() => setStep('redrawing')}
                            disabled={!isGuest && !canRedraw}
                            className="w-full py-4 rounded-xl bg-purple-500 text-white font-extrabold text-base active:scale-95 transition-all disabled:opacity-30">
                            {isGuest ? '로그인 후 사용하기' : 'AI 재추첨 받기'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    if (step === 'scan') return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            {/* 헤더 */}
            <header className="flex items-center gap-3 px-4 pt-6 pb-2 relative">
                <button onClick={() => setStep('history')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <h1 className="text-[16px] font-extrabold absolute left-1/2 -translate-x-1/2">낙첨복권 스캔</h1>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 text-t-muted text-[12px] font-semibold">
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        <span className={scansLeft <= 5 ? 'text-amber-400 font-bold' : ''}>{scansThisMonth}/{maxScansPerMonth}</span>
                    </div>
                </div>
            </header>

            {/* 스캔 횟수 경고 */}
            {scansLeft <= 5 && (
                <div className="mx-6 mt-3 flex items-center gap-2 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                    <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <span className="text-xs font-semibold text-amber-500">이번 주 스캔 {scansLeft}회 남음</span>
                </div>
            )}

            {/* 스캔 모드 칩 */}
            <div className="flex justify-center mt-4 px-6">
                <div className="flex bg-card-gray rounded-full p-1 gap-1">
                    <button className="px-4 py-1.5 rounded-full bg-bg-inverse text-t-inverse text-[12px] font-bold">카메라</button>
                    <button onClick={() => router.push('/manual_entry')}
                        className="px-4 py-1.5 rounded-full text-t-muted text-[12px] font-semibold">직접 입력</button>
                </div>
            </div>

            {/* 뷰파인더 */}
            <section className="flex-1 flex justify-center items-center mt-5 mb-6 px-6">
                <div className="w-full max-w-[300px] h-[420px] bg-surface rounded-[32px] relative flex flex-col justify-center items-center overflow-hidden border border-themed">
                    {/* 스캔 라인 */}
                    <div className="absolute inset-0 w-full h-[120px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"
                        style={{ animation: 'scanLine 2.5s ease-in-out infinite' }} />

                    {/* 코너 마커 (보라색) */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-purple-400" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-purple-400" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-purple-400" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-purple-400" />

                    {/* 안내 */}
                    <div className="flex flex-col items-center gap-3 z-10">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[26px] text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                        </div>
                        <p className="text-t-muted text-[13px] font-medium text-center max-w-[180px] leading-relaxed">
                            낙첨 복권을 프레임 안에<br/>맞춰주세요
                        </p>
                    </div>

                    {torchOn && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>ON
                        </div>
                    )}
                </div>
            </section>

            {/* 컨트롤 */}
            <section className="flex justify-center items-center gap-10 px-6 pb-4">
                <button className="size-12 rounded-full bg-card-gray flex items-center justify-center active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[24px] font-light">collections</span>
                </button>
                {/* 셔터 → 분석 시작 */}
                <button
                    onClick={() => setStep('analyzing')}
                    className="size-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.4)] active:scale-95 transition-transform"
                >
                    <div className="size-[70px] rounded-full border-2 border-black" />
                </button>
                <button
                    onClick={() => setTorchOn(p => !p)}
                    className={`size-12 rounded-full flex items-center justify-center transition-colors active:scale-90 ${torchOn ? 'bg-amber-500/20 text-amber-400' : 'bg-card-gray text-t-primary'}`}
                >
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: torchOn ? "'FILL' 1" : "'FILL' 0" }}>flash_on</span>
                </button>
            </section>



            <style jsx>{`
                @keyframes scanLine {
                    0%   { top: -10%; }
                    50%  { top: 60%; }
                    100% { top: -10%; }
                }
            `}</style>
        </div>
    );

    /* ══════════════════════════════════════════════════════
       STEP · 재추첨 로딩
    ══════════════════════════════════════════════════════ */
    if (step === 'redrawing') {
        const redrawSteps = ['낙첨 패턴 분석 중...', '±1 아쉬움 번호 계산 중...', 'Hot 번호 데이터 로딩 중...', '번호 보정 중...'];
        return (
            <div className="flex flex-col w-full min-h-screen bg-background text-t-primary items-center justify-center px-6 gap-8">
                {/* 클로버 + 말풍선 */}
                <div className="flex items-end gap-3 w-full max-w-[320px]">
                    <div className="flex-shrink-0" style={{ filter: 'drop-shadow(0 8px 24px rgba(167,139,250,0.5))' }}>
                        <Image src="/character.png" alt="클로버" width={96} height={96} unoptimized />
                    </div>
                    <div className="flex-1 bg-card-gray border border-themed rounded-2xl rounded-bl-none px-4 py-3 mb-1">
                        <p className="text-[14px] font-bold text-t-primary leading-snug">패턴 분석 중이에요! 🍀</p>
                        <p className="text-[12px] text-t-muted mt-1 font-medium">더 좋은 번호로 보정해드릴게요</p>
                    </div>
                </div>

                {/* 진행 단계 */}
                <div className="w-full max-w-[320px] flex flex-col gap-3">
                    {redrawSteps.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                i < redrawIdx ? 'bg-purple-500' : i === redrawIdx ? 'border-2 border-purple-400' : 'bg-white/8'
                            }`} style={i === redrawIdx ? { animation: 'spin 0.8s linear infinite' } : {}}>
                                {i < redrawIdx && <span className="material-symbols-outlined text-[13px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                            </div>
                            <p className={`text-[14px] font-semibold ${
                                i < redrawIdx ? 'text-t-primary' : i === redrawIdx ? 'text-purple-300' : 'text-t-faint'
                            }`}>{s}</p>
                        </div>
                    ))}
                </div>

                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* ══════════════════════════════════════════════════════
       STEP 2 · 분석 중
    ══════════════════════════════════════════════════════ */
    if (step === 'analyzing') {
        const steps = [
            '복권 번호 인식 중...',
            '당첨 번호 불러오는 중...',
            '±1 아쉬움 번호 계산 중...',
            '합계 근접도 분석 중...',
            '연속번호 패턴 확인 중...',
            'AI Re-Draw 생성 중...',
        ];
        return (
            <div className="flex flex-col w-full min-h-screen bg-background text-t-primary items-center justify-center px-6 gap-8">
                {/* 아이콘 */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-purple-500/15 flex items-center justify-center border border-purple-500/20">
                        <span className="material-symbols-outlined text-[44px] text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    </div>
                    <div className="absolute inset-0 rounded-3xl border-2 border-t-transparent border-purple-400"
                        style={{ animation: 'spin 1s linear infinite' }} />
                </div>

                {/* 단계 리스트 */}
                <div className="w-full flex flex-col gap-3">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-400 ${
                                i < analyzeIdx ? 'bg-purple-500' : i === analyzeIdx ? 'border-2 border-purple-400' : 'bg-white/8'
                            }`} style={i === analyzeIdx ? { animation: 'spin 0.8s linear infinite' } : {}}>
                                {i < analyzeIdx && <span className="material-symbols-outlined text-[13px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                            </div>
                            <p className={`text-[14px] font-semibold transition-colors ${
                                i < analyzeIdx ? 'text-t-primary' : i === analyzeIdx ? 'text-purple-300' : 'text-t-faint'
                            }`}>{s}</p>
                        </div>
                    ))}
                </div>

                {/* 번호 미리보기 */}
                <div className="w-full bg-card-gray rounded-2xl p-4 border border-themed flex flex-col gap-2">
                    <p className="text-[11px] text-t-muted font-bold uppercase tracking-wider">인식된 번호</p>
                    <div className="flex gap-2">
                        {MY_NUMS.map(n => (
                            <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                {String(n).padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    /* ══════════════════════════════════════════════════════
       STEP 3 · 결과
    ══════════════════════════════════════════════════════ */
    const nudgeScore = 92;

    if (step === 'result' && regret) return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <header className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-themed sticky top-0 bg-background z-10">
                <button onClick={() => setStep('history')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <p className="text-[16px] font-extrabold">분석 결과</p>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[12px] font-bold text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">제{DRAW_NO}회</span>
                    {!pointsClaimed
                        ? <button onClick={() => setPointsClaimed(true)}
                            className="flex items-center gap-1 text-[12px] font-extrabold text-[#34d399] bg-[#34d399]/10 px-3 py-1 rounded-full border border-[#34d399]/25 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                            +50P
                          </button>
                        : <span className="text-[11px] font-bold text-white/25 px-3 py-1 rounded-full bg-white/5">+50P 완료</span>
                    }
                </div>
            </header>

            <div className="flex flex-col px-6 pt-5 gap-5 pb-12 overflow-y-auto">

                {/* ① 긍정적 넛지 메시지 */}
                <div className="relative rounded-3xl overflow-hidden p-6 flex flex-col gap-2"
                    style={{ background: 'linear-gradient(135deg, #1a0533 0%, #2d1b4e 50%, #1a1a40 100%)', border: '1px solid rgba(167,139,250,0.3)' }}>
                    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20"
                        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
                    <div className="relative z-10">
                        <p className="text-[28px] font-extrabold text-white leading-tight">
                            이번주는 운이<br/>
                            <span className="text-purple-300">{nudgeScore}%</span> 충전됐습니다! 🎉
                        </p>
                        <p className="text-purple-300/70 text-[13px] mt-2 leading-relaxed">
                            아쉽게 빗나갔지만, 그 에너지가 다음 주를 위해<br/>완전히 충전되고 있어요. 포기하지 마세요!
                        </p>
                    </div>
                    <div className="relative z-10 mt-3">
                        <div className="h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                                style={{ width: `${nudgeScore}%`, animation: 'growBar 1s ease 0.3s both' }} />
                        </div>
                        <p className="text-[10px] text-purple-300/50 mt-1 text-right font-medium">다음 추첨 충전율</p>
                    </div>
                </div>

                {/* ② 아쉬움 지수 + 번호 비교 */}
                <div className="rounded-3xl overflow-hidden border border-themed">

                    {/* 스코어 존 */}
                    <div className="p-5 flex flex-col gap-5"
                        style={{ background: 'linear-gradient(160deg, rgba(168,85,247,0.13) 0%, rgba(236,72,153,0.07) 100%)' }}>

                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-t-muted uppercase tracking-widest">아쉬움 지수</p>
                            <span className="text-[11px] font-bold text-purple-300 bg-purple-500/15 px-2.5 py-1 rounded-full">
                                {regret.total >= 86 ? '아슬아슬' : regret.total >= 71 ? '매우 아쉬움' : regret.total >= 51 ? '꽤 아쉬웠어요' : regret.total >= 31 ? '조금 아쉬워요' : '아직 멀었어요'}
                            </span>
                        </div>

                        {/* 큰 숫자 + 바 */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-end gap-2">
                                <span className="text-[64px] font-extrabold text-white leading-none">{regret.total}</span>
                                <span className="text-t-muted text-[16px] font-medium mb-2">/ 100</span>
                            </div>
                            <div className="h-[6px] bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                                    style={{ width: `${regret.total}%`, transition: 'width 1.2s ease' }} />
                            </div>
                        </div>

                        {/* 세부 4항목 */}
                        <div className="grid grid-cols-4 gap-0 divide-x divide-white/8">
                            {[
                                { label: '±1 아쉬움',  score: regret.nearScore, max: 40, color: '#f472b6' },
                                { label: '합계 근접',  score: regret.sumScore,  max: 25, color: '#60a5fa' },
                                { label: '연속번호',   score: regret.conScore,  max: 20, color: '#fbbf24' },
                                { label: '직접 적중', score: regret.hitScore,  max: 15, color: '#34d399' },
                            ].map(({ label, score, max, color }, i) => (
                                <div key={label} className={`flex flex-col gap-1 ${i === 0 ? 'pr-3' : i === 3 ? 'pl-3' : 'px-3'}`}>
                                    <span className="text-[18px] font-extrabold text-white leading-none">{score}</span>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(score / max) * 100}%`, backgroundColor: color }} />
                                    </div>
                                    <span className="text-[9px] text-t-muted font-medium leading-tight mt-0.5">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 번호 비교 존 */}
                    <div className="bg-card-gray p-5 flex flex-col gap-4 border-t border-themed">

                        {/* 내 번호 */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] text-t-muted font-semibold uppercase tracking-wider">내 번호</p>
                            <div className="flex gap-2">
                                {MY_NUMS.map(n => {
                                    const isHit  = WIN_NUMS.includes(n);
                                    const isNear = WIN_NUMS.some(w => Math.abs(w - n) === 1);
                                    return (
                                        <div key={n} className="flex flex-col items-center gap-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold
                                                ${isHit ? LOTTO_COLOR(n) : isNear ? 'bg-pink-500/20 text-pink-300 ring-1 ring-pink-400/50' : 'bg-white/8 text-t-muted'}`}>
                                                {String(n).padStart(2, '0')}
                                            </div>
                                            {isHit  && <span className="text-[9px] text-[#34d399] font-bold">적중</span>}
                                            {isNear && !isHit && <span className="text-[9px] text-pink-400 font-bold">±1</span>}
                                            {!isHit && !isNear && <span className="text-[9px] text-transparent select-none">·</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-px bg-white/6" />

                        {/* 당첨 번호 */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[11px] text-t-muted font-semibold uppercase tracking-wider">제{DRAW_NO}회 당첨 번호</p>
                            <div className="flex gap-2">
                                {WIN_NUMS.map(n => (
                                    <div key={n} className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                        {String(n).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ③ AI Re-Draw */}
                <div className="rounded-3xl p-5 flex flex-col gap-4"
                    style={{ background: 'linear-gradient(135deg, #0f1a0f 0%, #1a2d1a 100%)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <p className="text-[13px] font-bold text-[#34d399] uppercase tracking-wider">AI Re-Draw</p>
                    </div>
                    <p className="text-[12px] text-white/50 -mt-2 leading-relaxed">낙첨 패턴을 반영해 당첨 확률이 높은 번호로 소폭 보정했어요</p>
                    <div className="flex gap-2">
                        {reDrawNums.map(n => (
                            <div key={n} className={`w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                {String(n).padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 하단 버튼 */}
                <button onClick={() => setStep('history')}
                    className="w-full py-4 rounded-2xl bg-bg-inverse text-t-inverse font-bold text-[14px] active:scale-95 transition-all">
                    확인
                </button>
            </div>
            <style jsx>{`@keyframes growBar { from { width: 0; } to { width: ${nudgeScore}%; } }`}</style>
        </div>
    );

    return null;
}
