import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

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

    const preset = router.query.preset || '트렌드';
    const cost = router.query.cost || '100';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = JSON.parse(localStorage.getItem('cwg_pending_filterValues') || 'null');
                setPendingFilterValues(stored);
            } catch {}
        }
    }, []);

    const handleSavePreset = () => {
        if (!saveName.trim()) return;
        if (typeof window !== 'undefined') {
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
        }
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 챔피언십 결과</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-36">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
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

                {/* Trophy Animation */}
                <div className="flex flex-col items-center mt-4 mb-8 px-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-t-dim via-t-secondary to-t-primary shadow-2xl flex items-center justify-center mb-4 border border-themed-light">
                        <span className="material-symbols-outlined text-[40px] text-background" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    </div>
                    <p className="text-t-muted text-sm font-semibold">
                        <span className="text-t-primary font-bold">{preset}</span> 전략 · 제1159회 · -{cost}P
                    </p>
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
                        <span className="text-xs font-bold text-t-primary bg-btn-secondary px-2 py-1 rounded-full">{preset}</span>
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
                            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-themed-light text-t-secondary hover:border-themed-medium transition-all active:scale-95"
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
