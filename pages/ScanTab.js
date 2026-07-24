import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

export default function ScanTab({ embedded = false, onClose }) {
    const router = useRouter();
    const { tier, scansThisMonth, maxScansPerMonth } = useUser();
    const [torchOn, setTorchOn] = useState(false);
    const [mode, setMode] = useState('scan'); // 'scan' | 'manual'
    const [showTips, setShowTips] = useState(false);

    // Manual entry state
    const [draft, setDraft] = useState([]); // currently selected numbers (≤6)
    const [savedSets, setSavedSets] = useState([]); // committed sets

    const isGuest = tier === 'GUEST';
    const scansLeft = maxScansPerMonth - scansThisMonth;
    const isLimitReached = scansLeft <= 0;

    const toggleNum = (n) => {
        setDraft(prev => {
            if (prev.includes(n)) return prev.filter(x => x !== n);
            if (prev.length >= 6) return prev;
            return [...prev, n].sort((a, b) => a - b);
        });
    };

    const addSet = () => {
        if (draft.length !== 6) return;
        if (savedSets.length + scansThisMonth >= maxScansPerMonth) return;
        setSavedSets(prev => [...prev, draft]);
        setDraft([]);
    };

    const removeSet = (idx) => {
        setSavedSets(prev => prev.filter((_, i) => i !== idx));
    };

    const submitAll = () => {
        if (savedSets.length === 0) return;
        router.push('/scan_result');
    };

    // GUEST: show sign-in prompt
    if (isGuest) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-24 items-center justify-center px-6">
                <div className="w-20 h-20 rounded-full bg-card-gray flex items-center justify-center mb-6 border border-themed-light">
                    <span className="material-symbols-outlined text-[40px] text-t-dim font-light">photo_camera</span>
                </div>
                <h2 className="text-2xl font-extrabold text-center mb-2">로그인이 필요합니다</h2>
                <p className="text-t-muted text-sm font-medium text-center mb-8">낙첨 티켓을 스캔하고 포인트를 적립하려면<br/>먼저 가입해주세요</p>
                <button
                    onClick={() => router.push('/signup')}
                    className="w-full max-w-[280px] py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                >
                    무료로 시작하기
                </button>
            </div>
        );
    }

    // Limit reached
    if (isLimitReached) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-24 items-center justify-center px-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                    <span className="material-symbols-outlined text-[40px] text-red-400 font-light" style={{ fontVariationSettings: "'FILL' 1" }}>block</span>
                </div>
                <h2 className="text-2xl font-extrabold text-center mb-2">이번 주 스캔 완료</h2>
                <p className="text-t-muted text-sm font-medium text-center mb-2">이번 주 등록 가능 {maxScansPerMonth}개를 모두 사용했습니다</p>
                <p className="text-t-dim text-xs font-medium text-center mb-8">매주 초기화됩니다</p>
                <button
                    onClick={() => router.push('/subscription')}
                    className="w-full max-w-[280px] py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                >
                    구독하고 계속하기
                </button>
            </div>
        );
    }

    const remainingQuota = maxScansPerMonth - scansThisMonth - savedSets.length;

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-24">
            {/* Header — 탭 임베드 시 뒤로가기(경품추첨 복귀)+제목+주의사항 */}
            {embedded ? (
                <header className="flex items-center gap-3 px-4 pt-3 pb-2 relative">
                    <button onClick={() => (onClose ? onClose() : router.back())} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[16px] font-extrabold absolute left-1/2 -translate-x-1/2">낙첨 복권 스캔</h1>
                    <div className="ml-auto flex items-center gap-1">
                        <button
                            onClick={() => setShowTips(true)}
                            aria-label="주의사항"
                            className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray border border-themed text-t-muted hover:text-t-primary active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            <span className="text-[11px] font-bold whitespace-nowrap">주의사항</span>
                        </button>
                    </div>
                </header>
            ) : (
                <header className="flex items-center gap-3 px-4 pt-6 pb-2 relative">
                    <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[16px] font-extrabold absolute left-1/2 -translate-x-1/2">낙첨 복권 스캔</h1>
                    <div className="ml-auto flex items-center gap-1">
                        <button
                            onClick={() => setShowTips(true)}
                            aria-label="주의사항"
                            className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray border border-themed text-t-muted hover:text-t-primary active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            <span className="text-[11px] font-bold whitespace-nowrap">주의사항</span>
                        </button>
                    </div>
                </header>
            )}

            {/* Mode Tabs */}
            <div className="mx-6 mt-3 grid grid-cols-2 gap-1 p-1 bg-card-gray rounded-2xl border border-themed">
                {[
                    { key: 'scan', label: '스캔', icon: 'photo_camera' },
                    { key: 'manual', label: '직접입력', icon: 'keyboard' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setMode(t.key)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            mode === t.key
                                ? 'bg-bg-inverse text-t-inverse'
                                : 'text-t-muted hover:text-t-primary'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: mode === t.key ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Low scan warning */}
            {scansLeft <= 5 && scansLeft > 0 && (
                <div className="mx-6 mt-3 flex items-center gap-2 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                    <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <span className="text-xs font-semibold text-amber-500">이번 주 스캔 {scansLeft}회 남음</span>
                </div>
            )}

            {/* Quota info */}
            <div className="mx-6 mt-3 flex items-center gap-2 bg-card-gray rounded-xl p-3 border border-themed">
                <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <span className="text-xs font-semibold text-t-secondary">
                    이번 주 <span className="text-t-primary font-bold">{scansThisMonth}/{maxScansPerMonth}개</span> 등록 ·{' '}
                    {tier === 'FREE'
                        ? <>무료 회원은 <span className="text-t-primary font-bold">최대 10개</span>까지 등록 가능</>
                        : <>구독 회원은 <span className="text-t-primary font-bold">최대 20개</span>까지 등록 가능</>
                    }
                </span>
            </div>

            {mode === 'scan' ? (
                <>
                    {/* Main Viewfinder */}
                    <section className="flex-1 flex justify-center items-center mt-5 mb-6 px-4">
                        <div className="w-full max-w-[400px] aspect-[3/4] bg-surface rounded-[32px] relative flex flex-col justify-center items-center overflow-hidden border border-themed">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14b8a6]/10 to-transparent w-full h-[150%] animate-[scan_3s_ease-in-out_infinite]" />
                            <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-muted-teal" />
                            <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-muted-teal" />
                            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-muted-teal" />
                            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-muted-teal" />
                            <div className="flex flex-col items-center gap-3 z-10">
                                <div className="w-12 h-12 rounded-full bg-[#14b8a6]/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[26px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                                </div>
                                <p className="text-t-muted text-sm font-medium text-center max-w-[200px]">복권 티켓을 프레임 안에<br/>맞춰주세요</p>
                            </div>
                            {torchOn && (
                                <div className="absolute top-4 right-4 flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>ON
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Controls — history + shutter + torch (아이콘 아래 텍스트 라벨로 의미 명확화) */}
                    <section className="flex justify-center items-start gap-10 px-6 pb-8">
                        <div className="flex flex-col items-center gap-1.5">
                            <button
                                onClick={() => router.push('/scan_result')}
                                className="size-12 rounded-full bg-card-gray flex items-center justify-center text-t-primary hover:bg-card-hover transition-colors active:scale-90 relative"
                                aria-label="이전 스캔 기록"
                            >
                                <span className="material-symbols-outlined text-[24px] font-light">history</span>
                            </button>
                            <span className="text-[10px] font-bold text-t-muted">이전 기록</span>
                        </div>
                        <button onClick={() => router.push('/scan_result')} className="size-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-transform">
                            <div className="size-[70px] rounded-full border-2 border-black" />
                        </button>
                        <div className="flex flex-col items-center gap-1.5">
                            <button onClick={() => setTorchOn(p => !p)} aria-label="플래시"
                                    className={`size-12 rounded-full flex items-center justify-center transition-colors active:scale-90 ${torchOn ? 'bg-amber-500/20 text-amber-400' : 'bg-card-gray text-t-primary hover:bg-card-hover'}`}>
                                <span className="material-symbols-outlined text-[24px] font-light" style={{ fontVariationSettings: torchOn ? "'FILL' 1" : "'FILL' 0" }}>flash_on</span>
                            </button>
                            <span className="text-[10px] font-bold text-t-muted">플래시</span>
                        </div>
                    </section>
                </>
            ) : (
                <>
                    {/* Draw info banner — matches scan_result */}
                    <div className="mx-6 mt-4 bg-card-gray rounded-2xl px-4 py-2.5 border border-themed">
                        <div className="flex items-center gap-2 flex-wrap">
                            <svg width="18" height="13" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
                                <rect width="22" height="16" rx="2" fill="#003DA5" />
                                <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">KR</text>
                            </svg>
                            <span className="text-[12px] font-bold text-t-primary">로또6/45</span>
                            <span className="text-[10px] font-bold text-t-muted bg-white/8 px-1.5 py-0.5 rounded-full">제1159회</span>
                            <span className="text-white/15">·</span>
                            <span className="text-[10px] text-t-muted font-medium">2026-02-27</span>
                            <span className="ml-auto text-[10px] text-[#14b8a6] font-semibold">추첨 완료</span>
                        </div>
                    </div>

                    {/* Manual entry — number grid */}
                    <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-[13px] font-extrabold text-t-primary">번호 선택</div>
                                <div className="text-[11px] text-t-muted font-medium mt-0.5">1~45 중 6개를 선택하세요</div>
                            </div>
                            <div className="text-[12px] font-bold">
                                <span className={draft.length === 6 ? 'text-[#14b8a6]' : 'text-t-primary'}>{draft.length}</span>
                                <span className="text-t-dim">/6</span>
                            </div>
                        </div>

                        {/* Selected preview */}
                        <div className="flex gap-1.5 justify-center mb-4 min-h-[36px]">
                            {Array.from({ length: 6 }).map((_, i) => {
                                const n = draft[i];
                                return n != null ? (
                                    <button
                                        key={i}
                                        onClick={() => toggleNum(n)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_BALL_COLOR(n)} active:scale-90 transition-transform`}
                                    >
                                        {n}
                                    </button>
                                ) : (
                                    <div key={i} className="w-9 h-9 rounded-full border border-dashed border-themed-light" />
                                );
                            })}
                        </div>

                        {/* 45 number grid */}
                        <div className="grid grid-cols-7 gap-1.5">
                            {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
                                const selected = draft.includes(n);
                                return (
                                    <button
                                        key={n}
                                        onClick={() => toggleNum(n)}
                                        className={`aspect-square rounded-full flex items-center justify-center text-[12px] font-bold transition-all active:scale-90 ${
                                            selected
                                                ? `${LOTTO_BALL_COLOR(n)} shadow-[0_0_10px_rgba(20,184,166,0.5)]`
                                                : 'bg-surface text-t-secondary border border-themed hover:border-themed-light'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Add set button */}
                        <button
                            onClick={addSet}
                            disabled={draft.length !== 6 || remainingQuota <= 0}
                            className={`mt-4 w-full py-3 rounded-xl font-extrabold text-[13px] transition-all ${
                                draft.length === 6 && remainingQuota > 0
                                    ? 'bg-[#14b8a6] text-black active:scale-95'
                                    : 'bg-surface text-t-dim border border-themed'
                            }`}
                        >
                            {remainingQuota <= 0 ? '이번 주 등록 한도 도달' : draft.length === 6 ? '세트 추가' : `${6 - draft.length}개 더 선택`}
                        </button>
                    </section>

                    {/* Saved sets list */}
                    <section className="mx-6 mt-4">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-t-muted">
                                저장된 세트 <span className="text-t-primary">{savedSets.length}</span>
                            </div>
                            {savedSets.length > 0 && (
                                <button onClick={() => setSavedSets([])} className="text-[11px] font-semibold text-t-dim hover:text-t-primary">전체 삭제</button>
                            )}
                        </div>

                        {savedSets.length === 0 ? (
                            <div className="bg-card-gray/40 rounded-2xl border border-dashed border-themed py-8 flex flex-col items-center">
                                <span className="material-symbols-outlined text-[28px] text-t-dim font-light mb-1">inbox</span>
                                <div className="text-[11px] text-t-muted font-medium">추가된 세트가 없어요</div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {savedSets.map((nums, idx) => (
                                    <div key={idx} className="bg-card-gray rounded-2xl border border-themed px-4 py-3 flex items-center gap-3">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-t-muted bg-white/8 px-2 py-0.5 rounded-full flex-shrink-0">
                                            세트 {idx + 1}
                                        </span>
                                        <div className="flex gap-1 flex-1 justify-center flex-wrap">
                                            {nums.map((n, i) => (
                                                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold ${LOTTO_BALL_COLOR(n)}`}>
                                                    {n}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => removeSet(idx)}
                                            className="w-7 h-7 rounded-full flex items-center justify-center text-t-muted hover:text-t-primary active:scale-90 transition-transform flex-shrink-0"
                                            aria-label="삭제"
                                        >
                                            <span className="material-symbols-outlined text-[18px] font-light">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Bottom submit CTA */}
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                        <button
                            onClick={submitAll}
                            disabled={savedSets.length === 0}
                            className={`w-full py-4 rounded-xl font-extrabold text-base transition-all ${
                                savedSets.length > 0
                                    ? 'bg-bg-inverse text-t-inverse active:scale-95'
                                    : 'bg-surface text-t-dim border border-themed'
                            }`}
                        >
                            {savedSets.length > 0 ? `${savedSets.length}세트 한번에 등록하기` : '세트를 추가해주세요'}
                        </button>
                    </div>
                </>
            )}

            {/* Tips / 주의사항 modal */}
            {showTips && (
                <div className="fixed inset-0 z-[900] flex items-end justify-center max-w-[430px] mx-auto" onClick={() => setShowTips(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full bg-[#141414] rounded-t-3xl border-t border-x border-themed p-6 pb-8" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[22px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                                <h3 className="text-[17px] font-extrabold text-t-primary">스캔 주의사항</h3>
                            </div>
                            <button onClick={() => setShowTips(false)} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center active:scale-90 transition-transform">
                                <span className="material-symbols-outlined text-[18px] text-t-muted">close</span>
                            </button>
                        </div>

                        <ul className="space-y-3">
                            {[
                                {
                                    icon: 'content_copy',
                                    title: '중복 티켓 체크',
                                    desc: '동일한 번호를 다른 사용자는 등록할 수 있지만, 한 사용자가 같은 번호를 중복 등록할 수는 없습니다.',
                                },
                                {
                                    icon: 'receipt_long',
                                    title: '직접 입력 시 안내',
                                    desc: '대형 경품 당첨 시 복권 구매 내역 등의 증빙을 요청드릴 수 있습니다.',
                                },
                            ].map((t, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[18px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-extrabold text-t-primary leading-tight">{t.title}</div>
                                        <div className="text-[11px] text-t-muted font-medium leading-snug mt-0.5">{t.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setShowTips(false)}
                            className="mt-5 w-full py-3 rounded-xl bg-white/8 text-t-primary font-bold text-[13px] active:scale-95 transition-all"
                        >
                            확인했어요
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
