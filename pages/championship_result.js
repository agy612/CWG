import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

const TUTORIAL_STEP_IDX = 7;  // championship-generate 스텝 인덱스
const TUTORIAL_TOTAL    = 12; // STEPS.length

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const RESULT_NUMBERS = [7, 14, 22, 31, 38, 43];

const ANALYSIS = {
    oddEven: { odd: 3, even: 3, label: '홀짝 비율', value: '3 : 3', ideal: true },
    highLow: { high: 4, low: 2, label: '고저 비율', value: '4 : 2', ideal: false },
    sum: { value: 155, label: '번호 합계', range: '100~175', ideal: true },
    acValue: { value: 8, label: 'AC값', range: '7~10', ideal: true },
    primes: { value: 2, label: '소수 개수', ideal: true },
    sections: [
        { range: '1~15', count: 2 },
        { range: '16~30', count: 2 },
        { range: '31~45', count: 2 },
    ],
};

const STAT_ROWS = [
    { label: '홀짝 비율', value: '3 : 3', good: true, desc: '이상적인 균형' },
    { label: '고저 비율', value: '4 : 2', good: false, desc: '고번호 편중' },
    { label: '번호 합계', value: '155', good: true, desc: '권장 범위 이내' },
    { label: 'AC값', value: '8', good: true, desc: '복잡도 우수' },
    { label: '소수 개수', value: '2개', good: true, desc: '적정 비율' },
];

export default function ChampionshipResult() {
    const router = useRouter();
    const [saveStep, setSaveStep] = useState('idle'); // 'idle' | 'naming' | 'saved'
    const [saveName, setSaveName] = useState('');
    const [pendingFilterValues, setPendingFilterValues] = useState(null);
    const [isTutorial, setIsTutorial] = useState(false);

    const preset = router.query.preset || '트렌드';
    const cost = router.query.cost || '100';

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('cwg_pending_filterValues') || 'null');
            setPendingFilterValues(stored);
        } catch {}
        setIsTutorial(!!localStorage.getItem('tutorial_in_progress'));
    }, []);

    const handleSavePreset = () => {
        if (!saveName.trim()) return;
        const stored = JSON.parse(localStorage.getItem('cwg_saved_presets') || '[]');
        if (stored.length >= 10) stored.shift();
        const newPreset = {
            id: Date.now(),
            name: saveName.trim(),
            filterValues: pendingFilterValues,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem('cwg_saved_presets', JSON.stringify([...stored, newPreset]));
        setSaveStep('saved');
    };

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 럭키이벤트 결과</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-36">

                {/* ── 튜토리얼 컴팩트 카드 ── */}
                {isTutorial && (
                    <div className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto px-4 z-50"
                        style={{ paddingTop: 48, background: 'linear-gradient(to bottom, rgba(0,0,0,0.98) 65%, rgba(0,0,0,0))' }}>
                        <div className="bg-[rgba(10,10,16,0.96)] border border-white/10 rounded-3xl px-4 py-3 shadow-2xl">
                            <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase text-center mb-3">
                                {TUTORIAL_STEP_IDX + 1} / {TUTORIAL_TOTAL}
                            </p>
                            <div className="flex items-end gap-2 mb-2.5">
                                <div className="flex-shrink-0" style={{ filter: 'drop-shadow(0 4px 12px rgba(74,222,128,0.4))' }}>
                                    <Image src="/character.png" alt="클로버" width={44} height={44} unoptimized />
                                </div>
                                <div className="relative flex-1 bg-[rgba(14,14,20,0.97)] border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2">
                                    <p className="text-[11.5px] text-white font-medium leading-relaxed">
                                        번호 생성 완료! 🎯{'\n'}이제 콘텐츠 탭도 확인해봐요 ✨
                                    </p>
                                    <div className="absolute -left-[6px] bottom-3 w-0 h-0"
                                        style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid rgba(14,14,20,0.97)' }} />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-center mb-0">
                                {Array.from({ length: TUTORIAL_TOTAL }).map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                                        i === TUTORIAL_STEP_IDX ? 'w-7 bg-[#4ade80]' : 'w-1.5 bg-white/[0.18]'
                                    }`} />
                                ))}
                            </div>
                            <button
                                onClick={() => router.back()}
                                className="w-full mt-2.5 py-3 rounded-xl bg-[#4ade80] text-black font-extrabold text-[14px] active:scale-95 transition-all shadow-[0_0_16px_rgba(74,222,128,0.4)]"
                            >
                                확인했어요! 다음으로 →
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className={`${isTutorial ? 'pt-[230px]' : 'pt-12'} pb-4 px-6 flex items-center gap-3`}>
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">번호 생성 완료</h1>
                    <button
                        onClick={() => router.push('/championship_history')}
                        className="ml-auto text-t-secondary hover:text-t-primary transition-colors text-sm font-semibold"
                    >
                        히스토리
                    </button>
                </div>

                {/* 캐릭터 + 말풍선 */}
                <div className="mx-6 mt-4 mb-6 flex items-end gap-3">
                    <div className="flex-shrink-0" style={{ filter: 'drop-shadow(0 8px 24px rgba(74,222,128,0.45))' }}>
                        <Image src="/character.png" alt="클로버" width={100} height={100} unoptimized priority />
                    </div>
                    <div className="flex-1 bg-card-gray border border-themed rounded-2xl rounded-bl-none px-4 py-3.5 mb-1">
                        <p className="text-[14px] font-bold text-t-primary leading-snug">번호 생성 완료! 🎉</p>
                        <p className="text-[12px] text-t-muted mt-1 font-medium leading-relaxed">
                            <span className="text-t-primary font-semibold">{preset}</span> 전략 · 제1159회 · -{cost}P<br/>
                            이 번호로 꼭 대박 나세요 🍀
                        </p>
                    </div>
                </div>

                {/* Generated Numbers */}
                <div className="mx-6 bg-card-gray rounded-3xl p-8 border border-themed mb-4">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-5 text-center">생성된 번호</div>
                    <div className="flex gap-3 justify-center">
                        {RESULT_NUMBERS.map((num, idx) => (
                            <div
                                key={idx}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg ${LOTTO_BALL_COLOR(num)}`}
                                style={{ animationDelay: `${idx * 0.08}s` }}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section Distribution */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-4">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-4">구간 분포</div>
                    <div className="flex gap-3">
                        {ANALYSIS.sections.map((s, idx) => (
                            <div key={idx} className="flex-1 bg-btn-secondary/60 rounded-xl p-3 flex flex-col items-center gap-1">
                                <div className="text-[10px] font-bold text-t-muted">{s.range}</div>
                                <div className="text-2xl font-extrabold text-t-primary">{s.count}</div>
                                <div className="text-[10px] text-t-muted">개</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Statistics Analysis */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-4">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-4">번호 특성 분석</div>
                    <div className="flex flex-col gap-3">
                        {STAT_ROWS.map((row, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-themed last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${row.good ? 'bg-[#14b8a6]' : 'bg-amber-500'}`} />
                                    <span className="text-sm font-semibold text-btn-secondary-text">{row.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-t-primary">{row.value}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        row.good ? 'bg-[#14b8a6]/15 text-[#14b8a6]' : 'bg-amber-500/15 text-amber-500'
                                    }`}>{row.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Used Filters Preview */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-t-muted text-xs font-bold uppercase tracking-wider">적용된 전략</div>
                        <span className="text-xs font-bold text-t-primary bg-zinc-700 px-2 py-1 rounded-full">{preset}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['핫 넘버 90', '듀 넘버 60', '연속 번호 50', '홀짝 균형 40'].map((tag, idx) => (
                            <span key={idx} className="text-[11px] font-semibold text-t-secondary bg-btn-secondary px-3 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>

                    {/* Save Preset */}
                    {saveStep === 'idle' && (
                        <button
                            onClick={() => setSaveStep('naming')}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-themed-light text-t-secondary hover:border-white/20 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>bookmark</span>
                            <span className="text-sm font-semibold">이 전략 프리셋으로 저장</span>
                        </button>
                    )}
                    {saveStep === 'naming' && (
                        <div className="mt-4 flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={e => setSaveName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSavePreset()}
                                    placeholder="프리셋 이름 (최대 10자)"
                                    maxLength={10}
                                    autoFocus
                                    className="flex-1 bg-btn-secondary border border-themed-light rounded-xl px-4 py-3 text-t-primary text-sm font-semibold outline-none focus:border-[#14b8a6]/50 transition-colors"
                                />
                                <button
                                    onClick={handleSavePreset}
                                    disabled={!saveName.trim()}
                                    className="px-4 py-3 rounded-xl bg-[#14b8a6] text-black font-bold text-sm active:scale-95 transition-all disabled:opacity-40"
                                >
                                    저장
                                </button>
                            </div>
                            <button onClick={() => setSaveStep('idle')} className="text-xs text-t-dim font-semibold text-center">취소</button>
                        </div>
                    )}
                    {saveStep === 'saved' && (
                        <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#14b8a6]/15 border border-[#14b8a6]/30 text-[#14b8a6]">
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                            <span className="text-sm font-semibold">'{saveName}' 저장 완료</span>
                        </div>
                    )}
                </div>

                {/* Point Deducted Notice */}
                <div className="mx-6 flex items-center gap-2 bg-btn-secondary/40 rounded-2xl p-4 border border-themed mb-4">
                    <span className="material-symbols-outlined text-[18px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                    <span className="text-xs font-semibold text-t-muted">포인트 -{cost}P 차감 · 잔액 1,150P</span>
                </div>

                {/* Auto Save Notice */}
                <div className="mx-6 flex items-center gap-2 bg-[#14b8a6]/10 rounded-2xl p-4 border border-[#14b8a6]/20 mb-6">
                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                    <span className="text-xs font-semibold text-[#14b8a6]">히스토리에 자동 저장됨 · 추첨 후 당첨 여부가 자동 확인됩니다</span>
                </div>

                {/* Sticky Actions */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <button
                        onClick={() => router.back()}
                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all mb-3"
                    >
                        다시 생성하기 (-100P)
                    </button>
                    <button
                        onClick={() => router.push('/championship_history')}
                        className="w-full py-4 rounded-xl bg-transparent border border-themed-light text-btn-secondary-text font-semibold text-sm active:scale-95 transition-all"
                    >
                        히스토리 보기
                    </button>
                </div>
            </div>
        </div>
    );
}
