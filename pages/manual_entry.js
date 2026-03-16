import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { getLotteryInfo, formatDate } from '../utils/lottery';

const GAMES = [
    { code: 'KR_LOTTO_645', label: '한국 로또 6/45', countryCode: 'KR', countryBg: '#003DA5', count: 6, max: 45 },
    { code: 'JP_LOTO6_643', label: '일본 로토6', countryCode: 'JP', countryBg: '#BC002D', count: 6, max: 43 },
    { code: 'EU_EUROMILLIONS', label: 'EuroMillions', countryCode: 'EU', countryBg: '#003399', count: 5, max: 50 },
    { code: 'EU_EUROJACKPOT', label: 'Eurojackpot', countryCode: 'EU', countryBg: '#003399', count: 5, max: 50 },
];

function FlagBadge({ code, bg }) {
    return (
        <svg width="26" height="18" viewBox="0 0 26 18" style={{ borderRadius: 3, flexShrink: 0 }}>
            <rect width="26" height="18" rx="2" fill={bg} />
            <text x="13" y="13" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">{code}</text>
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

export default function ManualEntry() {
    const router = useRouter();
    const { tier } = useUser();
    const [selectedGame, setSelectedGame] = useState(GAMES[0]);
    const [round, setRound] = useState('');
    const [numbers, setNumbers] = useState([]);
    const [inputNum, setInputNum] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const info = getLotteryInfo();
        setRound(String(info.currentRound));
        setPurchaseDate(formatDate(info.currentDrawDate));
    }, []);

    const required = selectedGame.count;
    const earnedPoints = tier === 'FREE' ? 50 : tier === 'STANDARD' ? 75 : 100;

    const addNumber = () => {
        const n = parseInt(inputNum, 10);
        setError('');
        if (isNaN(n) || n < 1 || n > selectedGame.max) {
            setError(`1 ~ ${selectedGame.max} 사이의 숫자를 입력하세요`);
            return;
        }
        if (numbers.includes(n)) {
            setError('이미 입력된 번호입니다');
            return;
        }
        if (numbers.length >= required) {
            setError(`최대 ${required}개까지 입력 가능합니다`);
            return;
        }
        setNumbers(prev => [...prev, n].sort((a, b) => a - b));
        setInputNum('');
    };

    const removeNumber = (n) => {
        setNumbers(prev => prev.filter(x => x !== n));
    };

    const handleSubmit = () => {
        if (numbers.length !== required) {
            setError(`번호를 ${required}개 모두 입력하세요 (현재 ${numbers.length}개)`);
            return;
        }
        if (!round || round.length === 0) {
            setError('회차를 입력하세요');
            return;
        }
        router.push('/scan_result');
    };

    const isComplete = numbers.length === required && round.length > 0;

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 직접 입력</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-36">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">직접 입력</h1>
                </div>


                {/* Game Selection */}
                <div className="mx-6 mb-4">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3">복권 선택</div>
                    <div className="flex flex-col gap-2">
                        {GAMES.map(g => (
                            <button
                                key={g.code}
                                onClick={() => { setSelectedGame(g); setNumbers([]); setError(''); }}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-98 ${
                                    selectedGame.code === g.code
                                        ? 'bg-card-hover border-themed-medium'
                                        : 'bg-card-gray border-themed'
                                }`}
                            >
                                <FlagBadge code={g.countryCode} bg={g.countryBg} />
                                <span className={`text-sm font-semibold ${selectedGame.code === g.code ? 'text-t-primary' : 'text-t-secondary'}`}>{g.label}</span>
                                {selectedGame.code === g.code && (
                                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6] ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Round & Date */}
                <div className="mx-6 mb-4 flex gap-3">
                    <div className="flex-1">
                        <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-2">회차</div>
                        <input
                            type="number"
                            value={round}
                            onChange={e => setRound(e.target.value)}
                            placeholder={round || "회차"}
                            className="w-full bg-card-gray border border-themed rounded-xl px-4 py-3 text-t-primary text-sm font-semibold outline-none focus:border-themed-medium transition-colors"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-2">구매일</div>
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={e => setPurchaseDate(e.target.value)}
                            className="w-full bg-card-gray border border-themed rounded-xl px-4 py-3 text-t-primary text-sm font-semibold outline-none focus:border-themed-medium transition-colors"
                        />
                    </div>
                </div>

                {/* Number Input */}
                <div className="mx-6 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-t-muted text-xs font-bold uppercase tracking-wider">번호 입력</div>
                        <span className="text-xs font-bold text-t-muted">{numbers.length} / {required}</span>
                    </div>

                    {/* Selected Balls */}
                    <div className="flex gap-2 flex-wrap mb-4 min-h-[48px]">
                        {numbers.map(n => (
                            <button key={n} onClick={() => removeNumber(n)} className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold ${LOTTO_BALL_COLOR(n)} active:scale-90 transition-transform relative`}>
                                {n}
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[10px] text-white font-bold">close</span>
                                </span>
                            </button>
                        ))}
                        {Array.from({ length: Math.max(0, required - numbers.length) }).map((_, i) => (
                            <div key={'empty' + i} className="w-12 h-12 rounded-full bg-btn-secondary border-2 border-dashed border-t-faint flex items-center justify-center">
                                <span className="text-t-dim text-lg font-bold">?</span>
                            </div>
                        ))}
                    </div>

                    {/* Input Row */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1" max={selectedGame.max}
                            value={inputNum}
                            onChange={e => setInputNum(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addNumber()}
                            placeholder={`1 ~ ${selectedGame.max}`}
                            className="flex-1 bg-card-gray border border-themed rounded-xl px-4 py-3 text-t-primary text-sm font-semibold outline-none focus:border-themed-medium transition-colors"
                        />
                        <button
                            onClick={addNumber}
                            disabled={numbers.length >= required}
                            className="px-5 py-3 rounded-xl bg-bg-inverse text-t-inverse font-bold text-sm active:scale-95 transition-all disabled:opacity-30"
                        >
                            추가
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs font-semibold mt-2">{error}</p>
                    )}
                </div>

                {/* Duplicate check info */}
                <div className="mx-6 mb-4 flex items-start gap-2 bg-[#14b8a6]/10 rounded-2xl p-4 border border-[#14b8a6]/20">
                    <span className="material-symbols-outlined text-[16px] text-[#14b8a6] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <div className="text-xs text-[#14b8a6] font-medium leading-relaxed">
                        <strong>중복 티켓 체크:</strong> 동일한 번호를 다른 사용자는 등록할 수 있지만, 한 사용자가 같은 번호를 중복으로 등록할 수 없습니다.
                    </div>
                </div>

                {/* Quick Number Grid */}
                <div className="mx-6 mb-6">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3">빠른 선택</div>
                    <div className="grid grid-cols-9 gap-1.5">
                        {Array.from({ length: selectedGame.max }, (_, i) => i + 1).map(n => {
                            const selected = numbers.includes(n);
                            return (
                                <button
                                    key={n}
                                    onClick={() => {
                                        if (selected) removeNumber(n);
                                        else if (numbers.length < required) {
                                            setNumbers(prev => [...prev, n].sort((a, b) => a - b));
                                            setError('');
                                        }
                                    }}
                                    className={`h-8 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                                        selected
                                            ? LOTTO_BALL_COLOR(n)
                                            : 'bg-btn-secondary text-t-secondary hover:bg-card-hover'
                                    }`}
                                >
                                    {n}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mx-6 mb-24 flex items-start gap-2 bg-surface rounded-2xl p-4 border border-themed">
                    <span className="material-symbols-outlined text-[14px] text-t-muted mt-0.5">warning</span>
                    <div className="text-xs text-t-muted font-medium leading-relaxed">
                        직접 입력한 번호는 사용자가 선택한 것으로, 당첨을 보장하지 않습니다. 당첨 결과에 대한 책임은 사용자 본인에게 있습니다.
                    </div>
                </div>

                {/* Sticky Submit */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <button
                        onClick={handleSubmit}
                        disabled={!isComplete}
                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all disabled:opacity-30"
                    >
                        {isComplete ? `낙첨 확인하기 (${earnedPoints}P 적립)` : `번호 ${required}개 모두 입력하세요`}
                    </button>
                </div>
            </div>
        </div>
    );
}
