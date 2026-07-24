import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

/* ─── 로또 색상 ──────────────────────────────────────────── */
const LOTTO_COLOR = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* ─── 캐릭터 + 말풍선 ────────────────────────────────────── */
function CharacterSection({ text }) {
    return (
        <div className="flex items-end gap-3 px-6">
            {/* 캐릭터 이미지 자리 — <Image> 교체 예정 */}
            <div className="w-16 h-16 rounded-2xl bg-card-gray border border-themed border-dashed flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-t-faint text-center leading-tight">캐릭터<br/>이미지</span>
            </div>
            {/* 말풍선 */}
            <div className="relative bg-card-gray border border-themed rounded-2xl rounded-bl-sm px-4 py-3 flex-1">
                <p className="text-[13px] font-medium text-t-primary leading-relaxed">{text}</p>
                <div className="absolute -left-2 bottom-3 w-0 h-0"
                    style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '8px solid var(--color-card-gray)' }} />
            </div>
        </div>
    );
}

/* ─── 진행 도트 ──────────────────────────────────────────── */
function Dots({ total, current }) {
    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#14b8a6]' : 'w-2 bg-white/15'}`} />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   체험 컴포넌트들
══════════════════════════════════════════════════════════ */

/* ① 홈 미리보기 */
function HomePreview() {
    return (
        <div className="mx-6 rounded-3xl border border-themed bg-card-gray overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] text-t-muted font-semibold">내 포인트</p>
                    <p className="text-[28px] font-extrabold text-[#14b8a6]">100 P</p>
                    <p className="text-[10px] text-t-faint mt-0.5">첫 가입 보너스 지급 완료</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#14b8a6]/15 rounded-xl px-3 py-2">
                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                    <span className="text-[11px] font-bold text-[#14b8a6]">낙첨 복권 스캔</span>
                </div>
            </div>
            <div className="border-t border-themed px-5 py-3 flex gap-2">
                {[7, 14, 22, 31, 38, 43].map(n => (
                    <div key={n} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold ${LOTTO_COLOR(n)}`}>{n}</div>
                ))}
            </div>
            <div className="px-5 pb-4">
                <p className="text-[10px] text-t-faint font-medium">이번 주 CWG 픽 · 1159회차</p>
            </div>
        </div>
    );
}

/* ② 스캔 체험 */
function ScanPreview() {
    const [state, setState] = useState('idle'); // idle | scanning | done
    const [nums] = useState([5, 14, 23, 31, 38, 42]);

    const handleScan = () => {
        if (state !== 'idle') return;
        setState('scanning');
        setTimeout(() => setState('done'), 1800);
    };

    return (
        <div className="mx-6 flex flex-col gap-4">
            {/* 뷰파인더 */}
            <div className="relative w-full h-[180px] bg-surface rounded-3xl border border-themed overflow-hidden flex items-center justify-center">
                {state === 'scanning' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14b8a6]/20 to-transparent"
                        style={{ animation: 'scanLine 1.5s ease-in-out infinite' }} />
                )}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#14b8a6]" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#14b8a6]" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#14b8a6]" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#14b8a6]" />

                {state === 'done' ? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <p className="text-[12px] font-bold text-[#14b8a6]">스캔 완료! +50P 적립</p>
                        <div className="flex gap-1.5">
                            {nums.map(n => (
                                <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold ${LOTTO_COLOR(n)}`}>{n}</div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[28px] text-t-dim" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                        <p className="text-[12px] text-t-muted font-medium">{state === 'scanning' ? '인식 중...' : '복권을 프레임 안에 맞춰주세요'}</p>
                    </div>
                )}
            </div>

            {/* 셔터 버튼 */}
            {state !== 'done' && (
                <div className="flex justify-center">
                    <button onClick={handleScan}
                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-transform">
                        <div className="w-[56px] h-[56px] rounded-full border-2 border-black" />
                    </button>
                </div>
            )}
            {state === 'done' && (
                <p className="text-center text-[12px] text-[#14b8a6] font-semibold">실제 앱에서는 포인트가 바로 적립돼요!</p>
            )}

            <style jsx>{`
                @keyframes scanLine { 0% { top: -20%; } 50% { top: 60%; } 100% { top: -20%; } }
            `}</style>
        </div>
    );
}

/* ③ 픽 생성 체험 */
function PickPreview() {
    const [nums, setNums] = useState([]);
    const [generating, setGenerating] = useState(false);
    const allNums = [7, 14, 22, 31, 38, 43];

    const generate = () => {
        if (generating || nums.length > 0) return;
        setGenerating(true);
        allNums.forEach((n, i) => {
            setTimeout(() => {
                setNums(prev => [...prev, n]);
                if (i === allNums.length - 1) setGenerating(false);
            }, i * 250);
        });
    };

    return (
        <div className="mx-6 flex flex-col gap-3">
            {/* 무료 체험권 배지 */}
            <div className="flex items-center gap-2 bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-2xl px-4 py-3">
                <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                <div>
                    <p className="text-[13px] font-extrabold text-[#14b8a6]">튜토리얼 무료 픽 생성권 1회</p>
                    <p className="text-[10px] text-[#14b8a6]/70 font-medium">평소엔 포인트가 필요해요</p>
                </div>
            </div>

            <div className="rounded-3xl border border-themed bg-card-gray p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#14b8a6]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-t-primary">CWG 픽 · 1159회차</p>
                        <p className="text-[10px] text-t-muted">AI 통계 분석 기반</p>
                    </div>
                </div>

                <div className="flex gap-2 min-h-[44px] items-center flex-wrap">
                    {nums.length === 0 && !generating && (
                        <p className="text-[12px] text-t-faint">무료 체험권으로 번호를 받아보세요</p>
                    )}
                    {nums.map((n, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_COLOR(n)}`}
                            style={{ animation: 'popIn 0.3s ease' }}>
                            {n}
                        </div>
                    ))}
                </div>

                <button onClick={generate} disabled={nums.length > 0}
                    className={`w-full py-3 rounded-xl font-bold text-[14px] transition-all active:scale-95 ${
                        nums.length > 0 ? 'bg-white/5 text-t-faint cursor-default' : 'bg-bg-inverse text-t-inverse'
                    }`}>
                    {nums.length > 0 ? '생성 완료 ✓' : '무료로 픽 받기'}
                </button>

                {nums.length > 0 && (
                    <p className="text-center text-[11px] text-[#14b8a6] font-semibold">튜토리얼 무료 체험 완료! 이후엔 포인트로 이용해요.</p>
                )}
            </div>

            <style jsx>{`
                @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

/* ④ 챔피언십 체험 */
function ChampionshipPreview() {
    const [nums, setNums]           = useState([]);
    const [generating, setGenerating] = useState(false);
    const allNums = [7, 14, 25, 31, 38, 42];
    const filters = [
        { label: 'Hot 번호 비율', value: 65, color: '#f472b6' },
        { label: 'Cold 번호 비율', value: 30, color: '#60a5fa' },
        { label: '홀수 비율',     value: 55, color: '#fbbf24' },
    ];

    const generate = () => {
        if (generating || nums.length > 0) return;
        setGenerating(true);
        allNums.forEach((n, i) => {
            setTimeout(() => {
                setNums(prev => [...prev, n]);
                if (i === allNums.length - 1) setGenerating(false);
            }, i * 240);
        });
    };

    return (
        <div className="mx-6 flex flex-col gap-3">
            <div className="rounded-3xl border border-[#f59e0b]/20 bg-card-gray p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/15 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-[#f59e0b]" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-t-primary">나만의 번호 전략</p>
                        <p className="text-[10px] text-t-muted">핫/콜드 비율, 홀짝 등 20가지 필터</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5">
                    {filters.map(({ label, value, color }) => (
                        <div key={label} className="flex items-center gap-3">
                            <span className="text-[11px] text-t-muted w-24 flex-shrink-0">{label}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                            </div>
                            <span className="text-[11px] font-bold w-8 text-right" style={{ color }}>{value}%</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 min-h-[44px] items-center flex-wrap">
                    {nums.length === 0 && !generating && (
                        <p className="text-[12px] text-t-faint">전략에 맞는 번호가 생성돼요</p>
                    )}
                    {nums.map((n, i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_COLOR(n)}`}
                            style={{ animation: 'popIn 0.3s ease' }}>
                            {n}
                        </div>
                    ))}
                </div>

                <button onClick={generate} disabled={nums.length > 0}
                    className={`w-full py-3 rounded-xl font-bold text-[14px] active:scale-95 transition-all ${
                        nums.length > 0 ? 'bg-white/5 text-t-faint cursor-default' : 'bg-bg-inverse text-t-inverse'
                    }`}>
                    {nums.length > 0 ? '생성 완료 ✓' : '내 전략으로 번호 생성'}
                </button>
            </div>

            <style jsx>{`
                @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

/* ⑤ 넘버 센스 미리보기 */
function NumberSensePreview() {
    const [phase, setPhase] = useState('idle');
    const [found, setFound] = useState(new Set());
    const targets   = [4, 13, 17];
    const targetSet = new Set(targets);

    useEffect(() => {
        if (phase !== 'memorize') return;
        const t = setTimeout(() => setPhase('find'), 2200);
        return () => clearTimeout(t);
    }, [phase]);

    const tapNum = (n) => {
        if (phase !== 'find') return;
        const next = new Set(found);
        next.has(n) ? next.delete(n) : next.add(n);
        setFound(next);
        if ([...next].filter(x => targetSet.has(x)).length === targets.length
            && ![...next].some(x => !targetSet.has(x)))
            setTimeout(() => setPhase('done'), 300);
    };

    return (
        <div className="mx-6">
            <div className="rounded-3xl overflow-hidden border border-indigo-500/25 bg-card-gray">
                <div className="px-5 py-3 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #0f0f2e 0%, #1e1b4b 100%)' }}>
                    <p className="text-[13px] font-extrabold text-white">넘버 센스</p>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300/60">번호 기억 훈련 게임</span>
                </div>

                {phase === 'idle' && (
                    <div className="p-5 flex flex-col gap-4">
                        <p className="text-[12px] text-t-muted leading-relaxed">3개 번호를 2초간 기억하고, 번호판에서 직접 찾아내는 훈련이에요. 아래 버튼을 눌러 체험해보세요!</p>
                        <div className="flex gap-2 justify-center">
                            {targets.map(n => (
                                <div key={n} className={`w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setPhase('memorize')}
                            className="w-full py-3 rounded-xl bg-indigo-500 text-white text-[13px] font-extrabold active:scale-95 transition-all">
                            기억 훈련 시작
                        </button>
                    </div>
                )}

                {phase === 'memorize' && (
                    <div className="px-5 py-8 flex flex-col items-center gap-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300/70">기억하세요!</p>
                        <div className="flex gap-3">
                            {targets.map((n, i) => (
                                <div key={n} className={`rounded-xl flex items-center justify-center text-[16px] font-extrabold ${LOTTO_COLOR(n)}`}
                                    style={{ width: 56, height: 56, animation: `popIn 0.25s ease ${i * 0.08}s both` }}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-white/20">잠시 후 숨겨져요...</p>
                    </div>
                )}

                {(phase === 'find' || phase === 'done') && (
                    <div className="px-5 py-4 flex flex-col gap-3">
                        <p className={`text-[11px] font-extrabold text-center uppercase tracking-widest ${phase === 'done' ? 'text-[#4ade80]' : 'text-indigo-300/70'}`}>
                            {phase === 'done' ? '🎉 정답! 감각 훈련 완료' : '방금 본 3개를 찾아보세요'}
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(n => {
                                const ok = targetSet.has(n), sel = found.has(n), done = phase === 'done';
                                return (
                                    <button key={n} onClick={() => tapNum(n)}
                                        className={`h-10 rounded-xl text-[12px] font-bold transition-all active:scale-95 ${
                                            done && ok ? LOTTO_COLOR(n) : sel && ok ? 'bg-indigo-500 text-white' : sel ? 'bg-red-500/25 text-red-300' : 'text-white/50'
                                        }`}
                                        style={{ background: (done && ok) || sel ? undefined : 'rgba(255,255,255,0.06)' }}>
                                        {n}
                                    </button>
                                );
                            })}
                        </div>
                        {phase === 'done' && (
                            <button onClick={() => { setPhase('idle'); setFound(new Set()); }}
                                className="text-[12px] text-indigo-400 text-center py-1 active:opacity-60">
                                다시 해보기
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}

/* ⑥ 럭키 스코어 미리보기 */
function LuckyScorePreview() {
    const [barOn, setBarOn] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setBarOn(true), 300);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="mx-6">
            <div className="rounded-3xl overflow-hidden border border-purple-500/25 bg-card-gray">
                <div className="px-5 py-3 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, #100820 0%, #1e0f3a 100%)' }}>
                    <p className="text-[13px] font-extrabold text-white">럭키 스코어</p>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(192,132,252,0.6)' }}>낙첨 아쉬움 분석</span>
                </div>

                <div className="px-5 py-4 flex flex-col gap-4">
                    <p className="text-[12px] text-t-muted leading-relaxed">낙첨 티켓을 스캔하면 당첨 번호와 얼마나 아쉬웠는지 분석해줘요. 점수가 높을수록 경품 응모 가중치가 올라가요!</p>

                    <div className="flex flex-col gap-2">
                        <div>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5">내 번호</p>
                            <div className="flex gap-1.5">
                                {[8, 9, 10, 19, 29, 39].map(n => (
                                    <div key={n} className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-extrabold ${LOTTO_COLOR(n)}`}>{n}</div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5">당첨 번호</p>
                            <div className="flex gap-1.5">
                                {[8, 9, 10, 20, 30, 40].map(n => (
                                    <div key={n} className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-extrabold ${LOTTO_COLOR(n)}`}>{n}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl p-4" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-end gap-1.5">
                                <span className="font-extrabold leading-none" style={{ fontSize: 40, color: '#c084fc' }}>93</span>
                                <span className="text-[11px] text-white/30 mb-0.5">/ 100</span>
                            </div>
                            <span className="text-[12px] font-extrabold px-3 py-1.5 rounded-xl"
                                style={{ background: 'rgba(236,72,153,0.2)', color: '#f472b6' }}>×2.0 가중치</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: barOn ? '93%' : '0%', background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }} />
                        </div>
                        <p className="text-[11px]" style={{ color: 'rgba(192,132,252,0.5)' }}>3개 연속 적중 + ±1 아쉬움 → 아슬아슬 등급</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   스텝 정의
══════════════════════════════════════════════════════════ */
const STEPS = [
    {
        id: 'welcome',
        tag: null,
        title: 'CWG에 오신 걸\n환영해요! 🎉',
        bubble: '안녕하세요! 저는 CWG 안내 캐릭터예요.\n앱의 모든 기능을 함께 체험해볼게요. 직접 눌러보면서 익혀보세요!',
        cta: '투어 시작하기',
        preview: null,
    },
    {
        id: 'home',
        tag: '홈',
        title: '내 포인트와\nCWG 픽을 확인해요',
        bubble: '홈에서는 내 포인트 잔액과 이번 주 AI가 추천한 번호를 바로 볼 수 있어요. 스캔할수록 포인트가 쌓여요!',
        cta: '다음',
        preview: <HomePreview />,
    },
    {
        id: 'scan',
        tag: '낙첨 복권 스캔',
        title: '낙첨 복권도\n가치가 있어요 📸',
        bubble: '낙첨된 복권을 버리지 마세요! 스캔하면 포인트를 드려요. 아래 셔터를 눌러서 직접 체험해보세요.',
        cta: '다음',
        preview: <ScanPreview />,
    },
    {
        id: 'pick',
        tag: 'CWG 픽 생성',
        title: 'AI가 분석한\n번호를 받아보세요',
        bubble: '매주 AI가 통계 데이터를 분석해서 추천 번호를 줘요. 튜토리얼 한정으로 무료 1회 체험권을 드렸어요!',
        cta: '다음',
        preview: <PickPreview />,
    },
    {
        id: 'championship',
        tag: '럭키이벤트',
        title: '내 스타일로\n번호를 직접 만들어요',
        bubble: 'Hot/Cold 비율, 홀짝 등 20가지 필터로 나만의 전략을 세울 수 있어요. 버튼을 눌러 번호를 직접 생성해보세요!',
        cta: '다음',
        preview: <ChampionshipPreview />,
    },
    {
        id: 'number_sense',
        tag: '넘버 센스',
        title: '번호 감각을\n직접 키워보세요',
        bubble: '번호를 잠깐 기억하고 번호판에서 찾는 게임이에요. 꾸준히 훈련하면 번호 감각이 올라가요! 아래에서 미니 게임을 체험해보세요.',
        cta: '다음',
        preview: <NumberSensePreview />,
    },
    {
        id: 'lucky_score',
        tag: '럭키 스코어',
        title: '낙첨도\n기회가 돼요',
        bubble: '낙첨 티켓을 스캔하면 당첨 번호와 얼마나 아쉬웠는지 점수로 분석해줘요. 점수가 높을수록 경품 추첨에서 응모권 가중치를 더 받아요!',
        cta: '다음',
        preview: <LuckyScorePreview />,
    },
    {
        id: 'done',
        tag: null,
        title: '준비 완료! 🎊',
        bubble: '이제 모든 기능을 알았죠? 행운의 번호로 대박 나세요! 언제든 도움이 필요하면 마이 탭을 확인해보세요.',
        cta: '앱 시작하기',
        preview: null,
    },
];

/* ══════════════════════════════════════════════════════════
   메인
══════════════════════════════════════════════════════════ */
export default function Tutorial() {
    const router = useRouter();
    const [idx, setIdx] = useState(0);
    const step = STEPS[idx];
    const isLast = idx === STEPS.length - 1;
    const isFirst = idx === 0;

    const finish = () => {
        localStorage.setItem('tutorial_completed', 'true');
        router.replace('/');
    };

    const next = () => { if (isLast) finish(); else setIdx(i => i + 1); };
    const prev = () => { if (!isFirst) setIdx(i => i - 1); };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 튜토리얼</title></Head>
            <div className="flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background">

                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 pt-12 pb-3">
                    <button onClick={prev} className={`w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-opacity ${isFirst ? 'opacity-0 pointer-events-none' : ''}`}>
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    {step.tag && (
                        <span className="text-[11px] font-bold text-[#14b8a6] bg-[#14b8a6]/10 px-3 py-1 rounded-full border border-[#14b8a6]/20">{step.tag}</span>
                    )}
                    <button onClick={finish} className="text-[13px] font-semibold text-t-muted active:text-t-primary">
                        건너뛰기
                    </button>
                </div>

                {/* 타이틀 */}
                <div className="px-6 pb-4">
                    <h1 className="text-[24px] font-extrabold leading-tight" style={{ whiteSpace: 'pre-line' }}>{step.title}</h1>
                </div>

                {/* 체험 영역 */}
                {step.preview ? (
                    <div className="flex-1 overflow-y-auto py-2">
                        {step.preview}
                    </div>
                ) : (
                    /* 웰컴/완료: 큰 캐릭터 이미지 */
                    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
                        <div className="w-full h-[220px] rounded-3xl bg-card-gray border border-themed border-dashed flex items-center justify-center">
                            {/* 여기에 <Image> 삽입 — 각 스텝마다 다른 포즈 */}
                            <p className="text-[12px] text-t-faint font-medium">캐릭터 이미지</p>
                        </div>
                    </div>
                )}

                {/* 고정 하단 — 캐릭터 말풍선 + 버튼 */}
                <div className="border-t border-themed bg-background px-6 pt-4 pb-10 flex flex-col gap-4">

                    {/* 캐릭터 말풍선 (항상 하단 고정) */}
                    <div className="flex items-end gap-3">
                        {/* 캐릭터 이미지 자리 */}
                        <div className="w-12 h-12 rounded-xl bg-card-gray border border-themed border-dashed flex-shrink-0 flex items-center justify-center">
                            <span className="text-[8px] text-t-faint text-center leading-tight">캐릭터</span>
                        </div>
                        <div className="relative bg-card-gray border border-themed rounded-2xl rounded-bl-sm px-4 py-3 flex-1">
                            <p className="text-[12px] font-medium text-t-primary leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{step.bubble}</p>
                            <div className="absolute -left-2 bottom-3 w-0 h-0"
                                style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '8px solid var(--color-card-gray)' }} />
                        </div>
                    </div>

                    {/* 진행 도트 + 버튼 */}
                    <Dots total={STEPS.length} current={idx} />
                    <button onClick={next}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 ${
                            isLast
                                ? 'bg-[#14b8a6] text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                                : 'bg-bg-inverse text-t-inverse'
                        }`}>
                        {step.cta}
                    </button>
                </div>
            </div>
        </div>
    );
}
