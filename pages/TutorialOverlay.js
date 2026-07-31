import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PAD = 14;

/* ──────────────────────────────────────────────────────────
   스텝 정의
   interactive: true  → CTA 없음, 실제 UI를 직접 눌러야 진행
   triggerTab         → activeTab이 이 값이 되면 자동 진행
   light              → 반투명 오버레이 (UI 살짝 보임)
   pointerThrough     → 오버레이 클릭 차단 없음 (UI 직접 조작 가능)
────────────────────────────────────────────────────────── */
const STEPS = [
    /* 0 ─ 환영 */
    {
        id: 'welcome',
        tab: 'home', elementId: null, panel: 'center',
        bubble: '안녕하세요! 저는 Fulif 마스코트 클로버예요 🍀\n앱의 핵심 기능을 직접 눌러보며 체험해볼게요!',
        cta: '투어 시작하기',
    },
    /* 1 ─ 스캔 버튼 → 직접 눌러서 스캔 탭으로 */
    {
        id: 'scan-btn',
        tab: 'home', elementId: 'tut-scan-btn', panel: 'bottom',
        interactive: true, triggerTab: 'scan',
        bubble: '낙첨된 복권을 등록하면\n포인트와 경품을 받을 수 있어요! 🎁\n포인트로는 새로운 번호를 얻고\n경품은 매주 추첨돼요 — 버튼을 눌러봐요!',
    },
    /* 2 ─ 스캔 탭 설명 */
    {
        id: 'scan-page',
        tab: 'scan', elementId: null, panel: 'bottom',
        light: true,
        bubble: '카메라로 스캔하거나\n번호를 직접 입력할 수도 있어요! 📸\n낙첨된 복권을 한번 등록해봐요!',
        cta: '다음으로',
    },
    /* 3 ─ 포인트 */
    {
        id: 'points',
        tab: 'my', elementId: 'tut-points', panel: 'bottom',
        bubble: '등록할 때마다 포인트가 여기에 쌓여요! 💰\n포인트로 이 앱에서 다양한 방식으로\n새로운 번호를 얻을 수 있어요!',
        cta: '확인!',
    },
    /* 4 ─ 픽생성 탭으로 이동 (BottomNav 직접 클릭) */
    {
        id: 'nav-picks',
        tab: 'home', elementId: 'tut-nav-picks', panel: 'top',
        interactive: true, triggerTab: 'picks', compact: true,
        bubble: '아래 픽생성 탭을 직접 눌러서\n이동해봐요! 🎰',
    },
    /* 5 ─ 픽 열람하기 패널 직접 누르기 */
    {
        id: 'picks-unlock',
        tab: 'picks', elementId: 'tut-picks-panel', panel: 'top',
        interactive: true, triggerEvent: 'cwg-picks-unlocked', compact: true,
        bubble: '자체 35개 필터와 데이터 기반 분석으로\n선별한 이번 주 번호 10세트예요! 🎰\n아래 버튼을 눌러서 직접 열람해봐요!',
    },
    /* 6 ─ 번호 추가 생성 진입 (CWG 열람 후 하단 패널 → 생성 페이지로 이동) */
    {
        id: 'nav-championship',
        tab: 'picks', elementId: 'tut-generator', panel: 'top',
        interactive: true, triggerEvent: 'cwg-generator-open', compact: true,
        bubble: 'CWG 추천 번호를 받았어요!\n이제 "번호 추가 생성하기"를 눌러\n나만의 번호도 만들어봐요 🏆',
        cta: '다음',
    },
    /* 7 ─ 챔피언십: 생성 버튼 → 결과 인플레이스 표시 → 확인 버튼 */
    {
        id: 'championship-generate',
        tab: 'picks', elementId: 'tut-champ-generate', panel: 'top',
        compact: true, interactive: true, triggerEvent: 'cwg-championship-done',
        bubble: '슬라이더 값이 곧 가중치예요!\n높일수록 AI가 그 기준을 강하게 반영해요\n35가지를 조합한 게 나만의 전략 🏆\n아래 생성 버튼을 눌러봐요!',
    },
    /* 8 ─ 콘텐츠 탭으로 이동 (BottomNav 직접 클릭) */
    {
        id: 'nav-contents',
        tab: 'home', elementId: 'tut-nav-contents', panel: 'top',
        interactive: true, triggerTab: 'contents', compact: true,
        bubble: '아래 콘텐츠 탭을 눌러서\n이동해봐요! ✨',
    },
    /* 9 ─ 넘버센스 */
    {
        id: 'number-sense',
        tab: 'contents', elementId: 'tut-number-sense', panel: 'bottom',
        bubble: '번호를 잠깐 기억하고\n번호판에서 찾는 훈련 게임이에요! 🧠\n꾸준히 하면 번호 감각이 올라가요!',
        cta: '다음',
    },
    /* 10 ─ 럭키 스코어 */
    {
        id: 'lucky-score',
        tab: 'contents', elementId: 'tut-lucky-score', panel: 'bottom',
        bubble: '낙첨 티켓을 스캔하면\n당첨 번호와 얼마나 아쉬웠는지\n점수로 분석해줘요! 🍀\n점수가 높을수록 경품 추첨 가중치를 더 받아요!',
        cta: '마지막이에요!',
    },
    /* 11 ─ 완료 */
    {
        id: 'done',
        tab: 'home', elementId: null, panel: 'center',
        bubble: '이제 Fulif의 모든 기능을 알았어요 🎊\n포인트 쌓고, 번호 분석하고,\n꼭 대박 나세요!',
        cta: '앱 시작하기',
    },
];

/* ══════════════════════════════════════════════════════════ */
export default function TutorialOverlay({ activeTab, setActiveTab, onFinish, startIdx = 0 }) {
    const [idx, setIdx] = useState(startIdx);
    const [spotlight, setSpotlight] = useState(null);
    const [bubbleIn, setBubbleIn] = useState(false);
    const [stepDone, setStepDone] = useState(false);

    const step = STEPS[idx];
    const isLast = idx === STEPS.length - 1;

    /* ── 탭 자동 전환
         triggerTab 스텝은 탭 이동 자체가 트리거라 자동 전환 안 함.
         triggerEvent 스텝은 탭은 이동하되 사용자 조작을 기다림. ── */
    useEffect(() => {
        if (step.tab && !(step.interactive && step.triggerTab)) setActiveTab(step.tab);
    }, [idx]);

    /* ── interactive 스텝: 실제 탭 변경 감지 → 자동 진행 ── */
    useEffect(() => {
        if (!step.interactive || !step.triggerTab) return;
        if (activeTab === step.triggerTab) {
            const t = setTimeout(() => setIdx(i => i + 1), 350);
            return () => clearTimeout(t);
        }
    }, [activeTab, step.interactive, step.triggerTab]);

    /* ── interactive 스텝: 커스텀 DOM 이벤트 감지 → 결과 확인 후 수동 진행 ── */
    useEffect(() => {
        if (!step.interactive || !step.triggerEvent) return;
        const handler = () => {
            setSpotlight(null);  // 스포트라이트 해제 → 결과 전체 화면 노출
            setStepDone(true);   // CTA 버튼 표시
        };
        window.addEventListener(step.triggerEvent, handler);
        return () => window.removeEventListener(step.triggerEvent, handler);
    }, [idx, step.interactive, step.triggerEvent]);

    /* ── 스포트라이트 계산 ── */
    useEffect(() => {
        setBubbleIn(false);
        setSpotlight(null);
        setStepDone(false);

        if (!step.elementId) {
            const t = setTimeout(() => setBubbleIn(true), 280);
            return () => clearTimeout(t);
        }

        const t1 = setTimeout(() => {
            const el = document.getElementById(step.elementId);
            if (!el) { setBubbleIn(true); return; }

            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const t2 = setTimeout(() => {
                const r = el.getBoundingClientRect();
                setSpotlight({
                    x: r.left - PAD,
                    y: r.top - PAD,
                    w: r.width + PAD * 2,
                    h: r.height + PAD * 2,
                });
                setTimeout(() => setBubbleIn(true), 420);
            }, 540);

            return () => clearTimeout(t2);
        }, 300);

        return () => clearTimeout(t1);
    }, [idx]);

    const next = () => isLast ? onFinish() : setIdx(i => i + 1);
    const skip = () => onFinish();

    const s = spotlight;
    const overlayAlpha = (step.light || stepDone) ? 0.52 : 0.84;
    const bg = `rgba(0,0,0,${overlayAlpha})`;

    return (
        <>
            {/* ── 어두운 오버레이 ── */}
            {s ? (
                /* 4-rect 스포트라이트 */
                <>
                    <div className="fixed z-[500]"
                        style={{ top: 0, left: 0, right: 0, height: Math.max(0, s.y), background: bg }} />
                    <div className="fixed z-[500]"
                        style={{ top: s.y + s.h, left: 0, right: 0, bottom: 0, background: bg }} />
                    <div className="fixed z-[500]"
                        style={{ top: s.y, left: 0, width: Math.max(0, s.x), height: s.h, background: bg }} />
                    <div className="fixed z-[500]"
                        style={{ top: s.y, left: s.x + s.w, right: 0, height: s.h, background: bg }} />
                    {/* 스포트라이트 테두리 글로우 */}
                    <div className="fixed z-[500] pointer-events-none" style={{
                        top: s.y, left: s.x, width: s.w, height: s.h,
                        borderRadius: 16,
                        boxShadow: '0 0 0 2.5px #4ade80, 0 0 0 5px rgba(74,222,128,0.12), 0 0 30px rgba(74,222,128,0.25)',
                        animation: 'tutGlow 2s ease-in-out infinite',
                    }} />
                </>
            ) : (
                /* 전체 오버레이 */
                <div
                    className="fixed inset-0 z-[500]"
                    style={{
                        background: bg,
                        pointerEvents: step.pointerThrough ? 'none' : 'auto',
                    }}
                />
            )}

            {/* ── UI 레이어 ── */}
            <div className="fixed inset-0 z-[502] max-w-[430px] mx-auto" style={{ pointerEvents: 'none' }}>

                {/* 건너뛰기 */}
                {!isLast && (
                    <button
                        onClick={skip}
                        style={{ pointerEvents: 'auto' }}
                        className="absolute top-12 right-4 text-[12px] font-semibold text-white/40 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 active:text-white/70">
                        건너뛰기
                    </button>
                )}

                {/* ── 센터 패널 (웰컴 / 완료) ── */}
                {step.panel === 'center' && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-5"
                        style={{
                            pointerEvents: 'auto',
                            opacity: bubbleIn ? 1 : 0,
                            transform: bubbleIn ? 'scale(1)' : 'scale(0.94)',
                            transition: 'opacity 0.4s ease, transform 0.4s ease',
                        }}>
                        <div style={{ filter: 'drop-shadow(0 10px 28px rgba(74,222,128,0.45))' }}>
                            <Image src="/character.png" alt="클로버" width={180} height={180} priority unoptimized />
                        </div>
                        <div className="w-full bg-[rgba(12,12,18,0.96)] border border-white/10 rounded-3xl px-6 py-5 shadow-2xl">
                            <p className="text-[14px] text-white font-medium leading-relaxed text-center"
                                style={{ whiteSpace: 'pre-line' }}>{step.bubble}</p>
                        </div>
                        <ProgressDots total={STEPS.length} current={idx} />
                        <button onClick={next}
                            className={`w-full py-4 rounded-2xl font-extrabold text-[15px] active:scale-95 transition-all ${
                                isLast
                                    ? 'bg-[#4ade80] text-black shadow-[0_0_28px_rgba(74,222,128,0.5)]'
                                    : 'bg-white text-black shadow-xl'
                            }`}>
                            {step.cta}
                        </button>
                    </div>
                )}

                {/* ── 하단 패널 ── */}
                {step.panel === 'bottom' && (
                    <BottomPanel
                        step={step} idx={idx} isLast={isLast}
                        visible={bubbleIn} spotlight={s}
                        onNext={next} onSkip={skip}
                    />
                )}

                {/* ── 상단 패널 (하단 요소 스포트라이트) ── */}
                {step.panel === 'top' && (
                    <TopPanel
                        step={step} idx={idx} isLast={isLast}
                        visible={bubbleIn} spotlight={s}
                        stepDone={stepDone}
                        onNext={next}
                    />
                )}
            </div>

            <style jsx global>{`
                @keyframes tutGlow {
                    0%, 100% { box-shadow: 0 0 0 2.5px #4ade80, 0 0 0 5px rgba(74,222,128,0.12), 0 0 30px rgba(74,222,128,0.25); }
                    50% { box-shadow: 0 0 0 2.5px #4ade80, 0 0 0 8px rgba(74,222,128,0.06), 0 0 15px rgba(74,222,128,0.1); }
                }
                @keyframes tutTapPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.15); opacity: 0.6; }
                }
                @keyframes tutArrowBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(8px); }
                }
                @keyframes tutArrowBounceUp {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </>
    );
}

/* ── 하단 패널 ──────────────────────────────────────────── */
function BottomPanel({ step, idx, isLast, visible, spotlight: s, onNext, onSkip }) {
    return (
        <>
            {/* 방향 화살표 — 스포트라이트 위에서 아래를 가리킴 */}
            {s && visible && (
                <div
                    className="fixed pointer-events-none z-[503]"
                    style={{
                        left: Math.min(Math.max(s.x + s.w / 2 - 12, 20), 390),
                        top: Math.max(s.y - 52, 60),
                        animation: 'tutArrowBounce 1.2s ease-in-out infinite',
                    }}>
                    <ArrowDown />
                </div>
            )}

            {/* 패널 본체 */}
            <div
                className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.98) 55%, rgba(0,0,0,0))',
                    pointerEvents: 'auto',
                    transform: visible ? 'translateY(0)' : 'translateY(115%)',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>

                <StepCounter idx={idx} />
                <CharBubble text={step.bubble} />
                <ProgressDots total={STEPS.length} current={idx} />

                {step.interactive ? (
                    /* interactive 스텝: 탭 유도 표시 */
                    <div className="mt-3 flex items-center justify-center gap-2.5 py-3">
                        <span
                            className="text-[22px]"
                            style={{ animation: 'tutTapPulse 1.1s ease-in-out infinite' }}>
                            👆
                        </span>
                        <p className="text-[13px] text-white/60 font-semibold">
                            위 요소를 직접 눌러보세요
                        </p>
                    </div>
                ) : (
                    <button onClick={onNext}
                        className="w-full mt-3 py-4 rounded-2xl bg-white text-black font-extrabold text-[15px] active:scale-95 transition-all shadow-lg">
                        {step.cta}
                    </button>
                )}
            </div>
        </>
    );
}

/* ── 상단 패널 ──────────────────────────────────────────── */
function TopPanel({ step, idx, isLast, visible, spotlight: s, stepDone, onNext }) {
    const compact = step.compact;
    return (
        <>
            <div
                className="absolute top-0 left-0 right-0 px-4"
                style={{
                    paddingTop: compact ? 48 : 44,
                    background: compact ? 'none' : 'linear-gradient(to bottom, rgba(0,0,0,0.98) 55%, rgba(0,0,0,0))',
                    pointerEvents: 'auto',
                    transform: visible ? 'translateY(0)' : 'translateY(-115%)',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>

                {compact ? (
                    /* 픽/챔피언십용 콤팩트 플로팅 카드 — UI를 최대한 가리지 않음 */
                    <div className="bg-[rgba(10,10,16,0.96)] border border-white/10 rounded-3xl px-4 py-3 shadow-2xl">
                        <StepCounter idx={idx} />
                        <CharBubble text={step.bubble} small />
                        <ProgressDots total={STEPS.length} current={idx} />
                        {step.interactive ? (
                            stepDone ? (
                                <button onClick={onNext}
                                    className="w-full mt-2.5 py-3 rounded-xl bg-[#4ade80] text-black font-extrabold text-[14px] active:scale-95 transition-all shadow-[0_0_16px_rgba(74,222,128,0.4)]">
                                    확인했어요! 다음으로 →
                                </button>
                            ) : (
                                <div className="mt-2.5 flex items-center justify-center gap-2 py-2">
                                    <span className="text-[18px]" style={{ animation: 'tutTapPulse 1.1s ease-in-out infinite' }}>👇</span>
                                    <p className="text-[12px] text-white/60 font-semibold">아래 버튼을 직접 눌러보세요</p>
                                </div>
                            )
                        ) : (
                            <button onClick={onNext}
                                className="w-full mt-2.5 py-3 rounded-xl bg-white text-black font-extrabold text-[14px] active:scale-95 transition-all">
                                {step.cta}
                            </button>
                        )}
                    </div>
                ) : (
                    /* 일반 그라디언트 패널 */
                    <>
                        <StepCounter idx={idx} />
                        <CharBubble text={step.bubble} />
                        <ProgressDots total={STEPS.length} current={idx} />
                        <button onClick={onNext}
                            className="w-full mt-3 py-4 rounded-2xl bg-white text-black font-extrabold text-[15px] active:scale-95 transition-all shadow-lg">
                            {step.cta}
                        </button>
                    </>
                )}
            </div>

            {/* 방향 화살표 — compact는 카드 아래에서 아래쪽 요소를 가리킴 */}
            {s && visible && compact && (
                <div
                    className="fixed pointer-events-none z-[503]"
                    style={{
                        left: Math.min(Math.max(s.x + s.w / 2 - 12, 20), 390),
                        top: s.y - 52,
                        animation: 'tutArrowBounce 1.2s ease-in-out infinite',
                    }}>
                    <ArrowDown />
                </div>
            )}
            {s && visible && !compact && (
                <div
                    className="fixed pointer-events-none z-[503]"
                    style={{
                        left: Math.min(Math.max(s.x + s.w / 2 - 12, 20), 390),
                        top: s.y - 44,
                        animation: 'tutArrowBounceUp 1.2s ease-in-out infinite',
                    }}>
                    <ArrowUp />
                </div>
            )}
        </>
    );
}

/* ── 공통 UI 조각들 ──────────────────────────────────────── */
function CharBubble({ text, small }) {
    const imgSize = small ? 44 : 60;
    const mb = small ? 'mb-2.5' : 'mb-4';
    const px = small ? 'px-3 py-2' : 'px-4 py-3';
    const textSize = small ? 'text-[11.5px]' : 'text-[12.5px]';
    return (
        <div className={`flex items-end gap-2 ${mb}`}>
            <div className="flex-shrink-0" style={{ filter: 'drop-shadow(0 4px 12px rgba(74,222,128,0.4))' }}>
                <Image src="/character.png" alt="클로버" width={imgSize} height={imgSize} unoptimized />
            </div>
            <div className={`relative flex-1 bg-[rgba(14,14,20,0.97)] border border-white/10 rounded-2xl rounded-bl-sm ${px}`}>
                <p className={`${textSize} text-white font-medium leading-relaxed`}
                    style={{ whiteSpace: 'pre-line' }}>{text}</p>
                <div className="absolute -left-[6px] bottom-3 w-0 h-0"
                    style={{
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        borderRight: '6px solid rgba(14,14,20,0.97)',
                    }} />
            </div>
        </div>
    );
}

function StepCounter({ idx }) {
    return (
        <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase text-center mb-3">
            {idx + 1} / {STEPS.length}
        </p>
    );
}

function ProgressDots({ total, current }) {
    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-7 bg-[#4ade80]' : 'w-1.5 bg-white/18'
                }`} />
            ))}
        </div>
    );
}

function ArrowDown() {
    return (
        <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
            <line x1="12" y1="1" x2="12" y2="22" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <polyline points="5,16 12,24 19,16" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ArrowUp() {
    return (
        <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
            <line x1="12" y1="29" x2="12" y2="8" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <polyline points="5,14 12,6 19,14" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
