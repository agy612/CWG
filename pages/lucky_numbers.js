import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const MAX_LUCKY = 5;
const MAX_EXCLUDE = 10;

export default function LuckyNumbers() {
    const router = useRouter();
    const [luckyNumbers, setLuckyNumbers] = useState([7, 14]);
    const [excludeNumbers, setExcludeNumbers] = useState([13, 27]);
    const [activeSection, setActiveSection] = useState('lucky'); // 'lucky' | 'exclude'
    const [saved, setSaved] = useState(false);

    const toggleLucky = (n) => {
        if (excludeNumbers.includes(n)) return; // can't be in both
        if (luckyNumbers.includes(n)) {
            setLuckyNumbers(prev => prev.filter(x => x !== n));
        } else if (luckyNumbers.length < MAX_LUCKY) {
            setLuckyNumbers(prev => [...prev, n].sort((a, b) => a - b));
        }
        setSaved(false);
    };

    const toggleExclude = (n) => {
        if (luckyNumbers.includes(n)) return; // can't be in both
        if (excludeNumbers.includes(n)) {
            setExcludeNumbers(prev => prev.filter(x => x !== n));
        } else if (excludeNumbers.length < MAX_EXCLUDE) {
            setExcludeNumbers(prev => [...prev, n].sort((a, b) => a - b));
        }
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => router.back(), 1000);
    };

    const getBallState = (n) => {
        if (luckyNumbers.includes(n)) return 'lucky';
        if (excludeNumbers.includes(n)) return 'exclude';
        return 'none';
    };

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 럭키/제외 번호</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-36">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">럭키/제외 번호</h1>
                </div>

                {/* Guide */}
                <div className="mx-6 mb-6 bg-card-gray rounded-2xl p-4 border border-themed">
                    <p className="text-t-secondary text-xs font-semibold leading-relaxed">
                        럭키이벤트 번호 생성 시 사용됩니다.<br/>
                        <span className="text-accent">럭키 번호</span>는 최대 {MAX_LUCKY}개, <span className="text-red-400">제외 번호</span>는 최대 {MAX_EXCLUDE}개 설정 가능합니다.
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="mx-6 mb-6 flex bg-card-gray rounded-2xl p-1 border border-themed">
                    <button
                        onClick={() => setActiveSection('lucky')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSection === 'lucky' ? 'bg-accent text-accent-fg' : 'text-t-muted'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>filter_vintage</span>
                        럭키 번호 ({luckyNumbers.length}/{MAX_LUCKY})
                    </button>
                    <button
                        onClick={() => setActiveSection('exclude')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSection === 'exclude' ? 'bg-red-500/80 text-t-primary' : 'text-t-muted'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                        제외 번호 ({excludeNumbers.length}/{MAX_EXCLUDE})
                    </button>
                </div>

                {/* Selected Numbers Display */}
                <div className="mx-6 mb-6">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3">
                        {activeSection === 'lucky' ? '선택된 럭키 번호' : '선택된 제외 번호'}
                    </div>
                    <div className="flex gap-2 flex-wrap min-h-[52px]">
                        {(activeSection === 'lucky' ? luckyNumbers : excludeNumbers).map(n => (
                            <button
                                key={n}
                                onClick={() => activeSection === 'lucky' ? toggleLucky(n) : toggleExclude(n)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold relative active:scale-90 transition-transform ${
                                    activeSection === 'lucky' ? LOTTO_BALL_COLOR(n) : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                            >
                                {n}
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[10px] text-t-primary">close</span>
                                </span>
                            </button>
                        ))}
                        {(activeSection === 'lucky' ? luckyNumbers : excludeNumbers).length === 0 && (
                            <div className="text-t-dim text-sm font-medium">아래 그리드에서 번호를 선택하세요</div>
                        )}
                    </div>
                </div>

                {/* Number Grid */}
                <div className="mx-6 mb-6">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3">번호 선택 (1 ~ 45)</div>
                    <div className="grid grid-cols-9 gap-1.5">
                        {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
                            const state = getBallState(n);
                            const isLucky = state === 'lucky';
                            const isExclude = state === 'exclude';
                            const isDisabledLucky = activeSection === 'lucky' && !isLucky && luckyNumbers.length >= MAX_LUCKY;
                            const isDisabledExclude = activeSection === 'exclude' && !isExclude && excludeNumbers.length >= MAX_EXCLUDE;
                            const isOppositeSelected = activeSection === 'lucky' ? isExclude : isLucky;

                            return (
                                <button
                                    key={n}
                                    onClick={() => activeSection === 'lucky' ? toggleLucky(n) : toggleExclude(n)}
                                    disabled={isOppositeSelected || (activeSection === 'lucky' ? isDisabledLucky : isDisabledExclude)}
                                    className={`h-9 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                                        isLucky
                                            ? LOTTO_BALL_COLOR(n)
                                            : isExclude
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : isOppositeSelected
                                                    ? 'bg-zinc-900 text-t-faint cursor-not-allowed'
                                                    : 'bg-btn-secondary text-t-secondary hover:bg-card-hover'
                                    } ${(activeSection === 'lucky' ? isDisabledLucky : isDisabledExclude) && !isLucky && !isExclude ? 'opacity-30' : ''}`}
                                >
                                    {n}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mx-6 mb-6 flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-[#FBC400]" />
                        <span className="text-xs text-t-muted font-medium">럭키</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-red-500/40 border border-red-500/50" />
                        <span className="text-xs text-t-muted font-medium">제외</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-zinc-700" />
                        <span className="text-xs text-t-muted font-medium">선택 불가</span>
                    </div>
                </div>

                {/* Sticky Save */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
                    <button
                        onClick={handleSave}
                        className={`w-full py-4 rounded-xl font-extrabold text-base active:scale-95 transition-all ${
                            saved ? 'bg-accent text-accent-fg' : 'bg-accent text-accent-fg'
                        }`}
                    >
                        {saved ? '✓ 저장 완료!' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
