import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SLIDES = [
    {
        id: 'welcome',
        title: 'Fulif에\n오신 걸 환영해요',
        body: '핵심 기능을 슬라이드로\n빠르게 소개해드릴게요',
        accentA: '#4ade80',
        accentB: '#3182F6',
        kind: 'welcome',
        screenLabel: '환영합니다',
    },
    {
        id: 'scan',
        title: '낙첨 복권 등록하고\n포인트 + 응모권 받기',
        body: '복권을 등록하면 포인트 적립,\n광고까지 보면 매주 경품 추첨에\n응모할 수 있어요',
        accentA: '#3182F6',
        accentB: '#06b6d4',
        kind: 'screen',
        screen: '/스캔.png',
        screenLabel: '스캔 화면',
        overlay: 'scan',
    },
    {
        id: 'picks',
        title: 'Fulif 특허 필터로\n매주 10세트 생성',
        body: '데이터 기반 자체 35개 필터로\n한국·일본·유럽 로또 번호를\n매주 자동 생성해드려요',
        accentA: '#a78bfa',
        accentB: '#6366f1',
        kind: 'screen',
        screen: '/픽생성.png',
        screenLabel: '픽생성 화면',
        overlay: 'picks',
    },
    {
        id: 'championship',
        title: '필터 가중치를 조절해\n나만의 번호 만들기',
        body: '35개 자체 필터의 가중치를\n직접 조정해서 나만의 전략으로\n번호를 만들어보세요',
        accentA: '#f59e0b',
        accentB: '#ef4444',
        kind: 'screen',
        screen: '/럭키이벤트.png',
        screenLabel: '럭키 이벤트 화면',
        overlay: 'championship',
    },
    {
        id: 'contents',
        title: '아쉬움 점수로\n응모권 가중치 올리기',
        body: '넘버 센스와 럭키 스코어로\n아쉬움 점수를 쌓으면\n경품 추첨 가중치가 최대 ×2.0까지',
        accentA: '#34d399',
        accentB: '#10b981',
        kind: 'screen',
        screen: '/콘텐츠.png',
        screenLabel: '콘텐츠 화면',
        overlay: 'contents',
    },
    {
        id: 'done',
        title: '낙첨 복권을\n새로운 행운으로',
        body: '스캔으로 포인트 쌓고, 응모권으로\n매주 경품에 도전하고, 나만의 번호로\n다음 주를 노려보세요',
        accentA: '#4ade80',
        accentB: '#22d3ee',
        kind: 'done',
        screenLabel: '준비 완료',
    },
];

export default function TutorialIntro() {
    const router = useRouter();
    const [idx, setIdx] = useState(0);
    const [drag, setDrag] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [slideW, setSlideW] = useState(0);
    const containerRef = useRef(null);
    const startX = useRef(null);

    useEffect(() => {
        const update = () => setSlideW(containerRef.current?.offsetWidth || 0);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const goNext = () => setIdx(i => Math.min(i + 1, SLIDES.length - 1));
    const finish = () => {
        // 회원가입 직후 진입이면 홈으로, 마이탭 "다시보기"면 이전 화면으로
        if (router.query.from === 'signup') router.replace('/');
        else router.back();
    };

    const onStart = (clientX) => { startX.current = clientX; setDragging(true); };
    const onMove = (clientX) => {
        if (startX.current === null) return;
        setDrag(clientX - startX.current);
    };
    const onEnd = () => {
        if (startX.current === null) return;
        const threshold = (slideW || 1) * 0.18;
        if (drag < -threshold && idx < SLIDES.length - 1) setIdx(i => i + 1);
        else if (drag > threshold && idx > 0) setIdx(i => i - 1);
        setDrag(0);
        setDragging(false);
        startX.current = null;
    };

    const px = -idx * slideW + drag;
    const bgPx = px * 0.35;
    const fgPx = px * 1.15;

    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const slideTransition = dragging ? 'none' : `transform 0.55s ${easing}`;

    const isLast = idx === SLIDES.length - 1;

    return (
        <div ref={containerRef} className="fixed inset-0 max-w-[430px] mx-auto overflow-hidden text-white"
            style={{ background: '#06070b' }}>

            {/* ── 패럴랙스 배경 레이어 (느림) ── */}
            <div className="absolute inset-0 pointer-events-none flex"
                style={{
                    transform: `translate3d(${bgPx}px, 0, 0)`,
                    transition: slideTransition,
                    width: slideW ? slideW * SLIDES.length : '100%',
                }}>
                {SLIDES.map((s, i) => (
                    <div key={s.id} className="relative h-full flex-shrink-0"
                        style={{ width: slideW || '100%' }}>
                        {/* 큰 글로우 블롭 두 개 */}
                        <div className="absolute rounded-full"
                            style={{
                                background: s.accentA,
                                width: 360, height: 360,
                                top: '8%', left: '-12%',
                                filter: 'blur(80px)',
                                opacity: 0.42,
                            }} />
                        <div className="absolute rounded-full"
                            style={{
                                background: s.accentB,
                                width: 420, height: 420,
                                bottom: '6%', right: '-18%',
                                filter: 'blur(90px)',
                                opacity: 0.34,
                            }} />
                        {/* 노이즈/그레인 */}
                        <div className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px)',
                                backgroundSize: '40px 40px, 60px 60px',
                            }} />
                    </div>
                ))}
            </div>

            {/* ── 슬라이드 본체 (드래그 영역) ── */}
            <div
                onTouchStart={(e) => onStart(e.touches[0].clientX)}
                onTouchMove={(e) => onMove(e.touches[0].clientX)}
                onTouchEnd={onEnd}
                onMouseDown={(e) => onStart(e.clientX)}
                onMouseMove={(e) => dragging && onMove(e.clientX)}
                onMouseUp={onEnd}
                onMouseLeave={() => dragging && onEnd()}
                className="absolute inset-0 flex select-none"
                style={{
                    transform: `translate3d(${px}px, 0, 0)`,
                    transition: slideTransition,
                    width: slideW ? slideW * SLIDES.length : '100%',
                    cursor: dragging ? 'grabbing' : 'grab',
                    touchAction: 'pan-y',
                }}>
                {SLIDES.map((s, i) => (
                    <SlideBody key={s.id} slide={s} active={i === idx} width={slideW} />
                ))}
            </div>

            {/* ── 전경 패럴랙스 데코 (빠름) — 우상단 작은 점들 ── */}
            <div className="absolute inset-0 pointer-events-none flex"
                style={{
                    transform: `translate3d(${fgPx}px, 0, 0)`,
                    transition: slideTransition,
                    width: slideW ? slideW * SLIDES.length : '100%',
                }}>
                {SLIDES.map((s, i) => (
                    <div key={s.id} className="relative h-full flex-shrink-0"
                        style={{ width: slideW || '100%' }}>
                        <div className="absolute w-2 h-2 rounded-full"
                            style={{ background: s.accentA, top: '14%', right: '18%', opacity: 0.6, boxShadow: `0 0 12px ${s.accentA}` }} />
                        <div className="absolute w-1.5 h-1.5 rounded-full"
                            style={{ background: s.accentB, top: '22%', right: '32%', opacity: 0.45, boxShadow: `0 0 8px ${s.accentB}` }} />
                        <div className="absolute w-1 h-1 rounded-full bg-white/40"
                            style={{ bottom: '32%', left: '12%' }} />
                    </div>
                ))}
            </div>

            {/* ── 하단 바: 인디케이터 + 다음/시작하기 (프로스티드 글래스) ── */}
            <div className="absolute bottom-0 inset-x-0 z-30 px-6 pb-10 pt-5 flex items-center justify-between"
                style={{
                    background: 'rgba(10, 12, 18, 0.72)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 -8px 24px rgba(0,0,0,0.25)',
                }}>
                <Dots total={SLIDES.length} current={idx} />
                <button
                    onClick={isLast ? finish : goNext}
                    className={`px-5 py-3 rounded-full font-extrabold text-[14px] active:scale-95 transition-all flex items-center gap-1.5 ${
                        isLast ? 'bg-[#4ade80] text-black' : 'bg-white text-black'
                    }`}
                    style={{
                        boxShadow: isLast
                            ? '0 12px 28px rgba(74,222,128,0.45), 0 0 24px rgba(74,222,128,0.35)'
                            : '0 8px 22px rgba(0,0,0,0.45)',
                    }}>
                    {isLast ? '시작하기' : '다음'}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
            </div>

            <style jsx global>{`
                @keyframes ti-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes ti-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.06); }
                }
                @keyframes ti-pop {
                    0% { opacity: 0; transform: scale(0.6); }
                    60% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes ti-swipe-hint {
                    0%, 100% { transform: translateX(0); opacity: 0.35; }
                    50% { transform: translateX(-6px); opacity: 0.6; }
                }
                @keyframes ti-rotate {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes ti-twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.6); }
                    50%      { opacity: 0.9; transform: scale(1.3); }
                }
                @keyframes ti-burst {
                    0%, 100% { opacity: 0.4; }
                    50%      { opacity: 0.95; }
                }
                @keyframes ti-tap-pulse {
                    0%   { transform: scale(1);   opacity: 0.7; }
                    100% { transform: scale(1.7); opacity: 0;   }
                }
                @keyframes ti-tap-pulse-rect {
                    0%   { transform: scale(1);    opacity: 0.7; }
                    100% { transform: scale(1.18); opacity: 0;   }
                }
            `}</style>
        </div>
    );
}

/* ─── 슬라이드 본체 ──────────────────────────────────────── */
function SlideBody({ slide, active, width }) {
    const d = (ms) => ({ transitionDelay: active ? `${ms}ms` : '0ms' });
    return (
        <div className="relative h-full flex-shrink-0 overflow-hidden"
            style={{ width: width || '100%' }}>

            {/* ── 텍스트: 좌상단 ── */}
            <div className="absolute top-20 left-7 right-7 z-20">
                <div className={`text-[11px] font-bold text-white/40 tracking-[0.18em] uppercase mb-3 transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                    style={d(150)}>
                    {slide.screenLabel}
                </div>
                <h1 className={`text-[26px] font-extrabold leading-[1.18] tracking-tight whitespace-pre-line mb-3 transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={d(280)}>
                    {slide.title}
                </h1>
                <p className={`text-white/55 text-[13.5px] font-medium leading-relaxed whitespace-pre-line transition-all duration-700 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={d(420)}>
                    {slide.body}
                </p>
            </div>

            {/* ── 모형: 종류별 배치 ── */}
            {slide.kind === 'screen' ? (
                <div className="absolute left-1/2 -translate-x-1/2 z-40"
                    style={{ bottom: 80 }}>
                    <Mock kind={slide.kind} active={active} slide={slide} />
                </div>
            ) : (
                <div className="absolute left-0 right-0 z-30 flex items-center justify-center pointer-events-none"
                    style={{ top: 230, bottom: 130 }}>
                    <Mock kind={slide.kind} active={active} slide={slide} />
                </div>
            )}
        </div>
    );
}

/* ─── 슬라이드별 목업 ────────────────────────────────────── */
function Mock({ kind, active, slide }) {
    if (kind === 'welcome') return <MockWelcome active={active} />;
    if (kind === 'done') return <MockDone active={active} />;
    if (kind === 'screen') return <PhoneScreen active={active} slide={slide} />;
    return null;
}

/* ─── 폰 프레임 + 스크린샷 ────────────────────────────────── */
function PhoneScreen({ active, slide }) {
    const [imgFailed, setImgFailed] = React.useState(false);
    React.useEffect(() => { setImgFailed(false); }, [slide.screen]);

    return (
        <div className="relative">
            {/* 폰 프레임 */}
            <div
                className="relative rounded-[36px] overflow-hidden"
                style={{
                    width: 220,
                    height: 420,
                    background: '#0a0a0f',
                    border: '6px solid #1a1a22',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
                    opacity: active ? 1 : 0,
                    transform: active ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.92)',
                    transition: 'opacity 0.7s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: active ? '120ms' : '0ms',
                }}>
                {/* 노치 */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-black z-20" style={{ width: 64, height: 18 }} />

                {/* 스크린샷 또는 플레이스홀더 — 상단 맞춤 */}
                {slide.screen && !imgFailed ? (
                    <img
                        src={slide.screen}
                        alt={slide.screenLabel}
                        onError={() => setImgFailed(true)}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        draggable={false}
                    />
                ) : (
                    <ScreenPlaceholder label={slide.screenLabel} screen={slide.screen} accent={slide.accentA} />
                )}
            </div>

            {/* 슬라이드별 플로팅 애니메이션 오버레이 */}
            {slide.overlay === 'scan' && <OverlayScan active={active} />}
            {slide.overlay === 'picks' && <OverlayPicks active={active} />}
            {slide.overlay === 'championship' && <OverlayChamp active={active} accent={slide.accentA} />}
            {slide.overlay === 'contents' && <OverlayContents active={active} />}
        </div>
    );
}

function ScreenPlaceholder({ label, screen, accent }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-2"
            style={{
                background: `linear-gradient(180deg, ${accent}14, transparent 40%), #0d0d12`,
            }}>
            <span className="material-symbols-outlined text-[28px] text-white/30">image</span>
            <div className="text-[11px] font-bold text-white/55">{label}</div>
            <div className="text-[9px] text-white/30 font-mono leading-relaxed px-2">
                {screen || '캡쳐 필요'}
            </div>
        </div>
    );
}

const POP_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/* ── 스캔: 홈 헤더 우상단의 "낙첨 복권 스캔" 버튼 ── */
function OverlayScan({ active }) {
    return (
        <>
            {/* 프로스티드 카드에 담아 폰 좌측에 띄움 */}
            <div className="absolute"
                style={{
                    top: 80, left: -70,
                    opacity: active ? 1 : 0,
                    transform: active ? 'translate(0, 0) scale(1)' : 'translate(-10px, 0) scale(0.88)',
                    transition: `opacity 0.5s ease, transform 0.7s ${POP_EASE}`,
                    transitionDelay: active ? '500ms' : '0ms',
                }}>
                {/* 배경 카드 (홈 헤더 스니펫 느낌) */}
                <div className="p-3 rounded-3xl"
                    style={{
                        background: 'rgba(15, 17, 24, 0.92)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 18px 40px rgba(0,0,0,0.55), 0 0 24px rgba(20,184,166,0.2)',
                    }}>
                    {/* 작은 라벨 */}
                    <div className="text-[8px] font-bold text-white/40 tracking-[0.15em] uppercase mb-2 px-1">홈 우측 상단</div>
                    <div className="relative">
                        {/* tap-pulse 외곽 글로우 (2겹) */}
                        {[0, 0.6].map((delay, i) => (
                            <div key={i}
                                className="absolute inset-0 rounded-2xl pointer-events-none"
                                style={{
                                    border: '2px solid rgba(20,184,166,0.65)',
                                    animation: active ? 'ti-tap-pulse-rect 1.8s ease-out infinite' : 'none',
                                    animationDelay: `${delay}s`,
                                }} />
                        ))}
                        {/* HomeTab 버튼 그대로 */}
                        <div className="flex items-center gap-2 rounded-2xl px-4 py-3"
                            style={{
                                background: 'rgba(20,184,166,0.22)',
                                border: '1px solid rgba(20,184,166,0.45)',
                                boxShadow: '0 8px 24px rgba(20,184,166,0.35)',
                            }}>
                            <span className="material-symbols-outlined text-[22px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                            <span className="text-[13px] font-extrabold text-accent whitespace-nowrap">낙첨 복권 스캔</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* +50P 토스트 - 스캔 적립 보상 */}
            <div className={`absolute right-[-18px] px-4 py-2.5 rounded-full bg-black/90 backdrop-blur border border-[#4ade80]/50 flex items-center gap-2 transition-all duration-700 ${active ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'}`}
                style={{
                    top: 200,
                    transitionDelay: active ? '1300ms' : '0ms',
                    boxShadow: '0 0 32px rgba(74,222,128,0.5)',
                }}>
                <span className="material-symbols-outlined text-[18px] text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                <span className="text-[13px] font-extrabold text-white">+50 P</span>
            </div>

            {/* 광고 → 응모권 칩 (광고 보면 추첨 응모) */}
            <div className={`absolute right-[-18px] px-4 py-2.5 rounded-full bg-black/90 backdrop-blur border border-[#fbbf24]/50 flex items-center gap-2 transition-all duration-700 ${active ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'}`}
                style={{
                    top: 252,
                    transitionDelay: active ? '1600ms' : '0ms',
                    boxShadow: '0 0 32px rgba(251,191,36,0.45)',
                }}>
                <span className="material-symbols-outlined text-[18px] text-[#fbbf24]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                <span className="text-[13px] font-extrabold text-white">응모권 +1</span>
            </div>
        </>
    );
}

/* ── 픽: 번호 세트 카드 3장 우측에서 스태거드 슬라이드인 ── */
function OverlayPicks({ active }) {
    const colors = ['#FBC400', '#69C8F2', '#FF7272', '#FF7272', '#AAAAAA', '#B0D840'];
    const rows = [
        [3, 12, 18, 27, 35, 41],
        [5, 17, 24, 31, 38, 44],
        [8, 13, 19, 28, 33, 40],
    ];
    return (
        <div className="absolute -right-12 top-16 flex flex-col gap-2 z-10">
            {rows.map((row, r) => (
                <div key={r}
                    className="flex items-center gap-1 p-2 rounded-2xl"
                    style={{
                        background: 'rgba(20,20,28,0.92)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                        opacity: active ? 1 : 0,
                        transform: active ? 'translateX(0)' : 'translateX(30px)',
                        transition: `opacity 0.6s ease, transform 0.6s ${POP_EASE}`,
                        transitionDelay: active ? `${500 + r * 140}ms` : '0ms',
                    }}>
                    <div className="text-[8px] font-bold text-white/30 w-3 text-center">#{r + 1}</div>
                    {row.map((n, i) => (
                        <div key={i}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-black"
                            style={{
                                background: colors[i],
                                opacity: active ? 1 : 0,
                                transform: active ? 'scale(1)' : 'scale(0.3)',
                                transition: `transform 0.4s ${POP_EASE}, opacity 0.3s ease`,
                                transitionDelay: active ? `${700 + r * 140 + i * 50}ms` : '0ms',
                            }}>{n}</div>
                    ))}
                </div>
            ))}
            <div className={`text-[10px] text-white/40 font-bold text-center mt-1 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: active ? '1300ms' : '0ms' }}>
                + 7 세트 더
            </div>
        </div>
    );
}

/* ── 챔피언십: 실제 ChampionshipTab의 가중치 슬라이더 미니 버전 ── */
function OverlayChamp({ active, accent }) {
    const targets = [70, 50, 90];
    const filters = [
        { label: '핫 넘버', desc: '최근 자주 출현' },
        { label: '홀짝 균형', desc: '3:3 비율 선호' },
        { label: 'AC값',     desc: '복잡도 우수' },
    ];
    const [vals, setVals] = React.useState([0, 0, 0]);
    React.useEffect(() => {
        if (!active) { setVals([0, 0, 0]); return; }
        const timers = targets.map((t, i) =>
            setTimeout(() => setVals(prev => { const n = [...prev]; n[i] = t; return n; }), 800 + i * 320)
        );
        return () => timers.forEach(clearTimeout);
    }, [active]);

    return (
        <div className="absolute -right-14 top-12 p-4 rounded-2xl flex flex-col gap-3 z-10"
            style={{
                width: 200,
                background: 'rgba(20,20,28,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 16px 36px rgba(0,0,0,0.5), 0 0 24px ${accent}33`,
                opacity: active ? 1 : 0,
                transform: active ? 'translateX(0) scale(1)' : 'translateX(24px) scale(0.95)',
                transition: `opacity 0.6s ease, transform 0.7s ${POP_EASE}`,
                transitionDelay: active ? '450ms' : '0ms',
            }}>
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/55 tracking-[0.12em] uppercase">필터 가중치</span>
                <span className="material-symbols-outlined text-[14px]" style={{ color: accent, fontVariationSettings: "'FILL' 1" }}>tune</span>
            </div>

            {filters.map((f, i) => {
                const v = vals[i];
                const isActive = v > 0;
                return (
                    <div key={f.label} className="flex flex-col gap-1.5">
                        {/* 라벨 + 값 (실제 UI와 동일) */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-white/45'}`}>{f.label}</span>
                                    {isActive && <span className="w-1 h-1 rounded-full" style={{ background: accent }} />}
                                </div>
                                <span className="text-[8px] text-white/30 font-medium leading-tight">{f.desc}</span>
                            </div>
                            <span className={`text-[11px] font-extrabold ${isActive ? 'text-white' : 'text-white/30'}`}>{v}</span>
                        </div>
                        {/* 트랙 + 채움 + 핸들 (ChampionshipTab과 동일 구조) */}
                        <div className="relative w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <div className="absolute left-0 top-0 h-full rounded-full"
                                style={{
                                    background: isActive ? '#ffffff' : 'rgba(255,255,255,0.25)',
                                    width: `${v}%`,
                                    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease',
                                }} />
                            {isActive && (
                                <div className="absolute rounded-full bg-white"
                                    style={{
                                        width: 12, height: 12,
                                        top: -5,
                                        left: `calc(${v}% - 6px)`,
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                                        transition: 'left 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                                    }} />
                            )}
                        </div>
                        {/* 무시/약함/강함 (실제 UI) */}
                        <div className="flex justify-between text-[7px] font-bold text-white/30">
                            <span>무시</span><span>약함</span><span>강함</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ── 콘텐츠: ContentsTab의 실제 카드 디자인 ── */
function OverlayContents({ active }) {
    const lottoColor = (n) => {
        if (n <= 10) return { bg: '#FBC400', fg: '#000' };
        if (n <= 20) return { bg: '#69C8F2', fg: '#000' };
        if (n <= 30) return { bg: '#FF7272', fg: '#fff' };
        if (n <= 40) return { bg: '#AAAAAA', fg: '#000' };
        return { bg: '#B0D840', fg: '#000' };
    };
    const showNums = [7, 19, 33];
    const gridNums = Array.from({ length: 18 }, (_, i) => i + 1);
    const correct = new Set([7, 19, 33]);

    return (
        <div className="absolute -left-16 top-8 flex flex-col gap-2.5 z-10" style={{ width: 168 }}>
            {/* 카드 1 · 넘버 센스 (NumberSenseCard 미니) */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 14px 32px rgba(0,0,0,0.5), 0 0 22px rgba(99,102,241,0.28)',
                    opacity: active ? 1 : 0,
                    transform: active ? 'translateX(0) rotate(0)' : 'translateX(-30px) rotate(-3deg)',
                    transition: `opacity 0.6s ease, transform 0.7s ${POP_EASE}`,
                    transitionDelay: active ? '500ms' : '0ms',
                }}>
                <div className="relative px-3 pt-3 pb-2.5"
                    style={{ background: 'linear-gradient(135deg, #0f0f2e 0%, #1e1b4b 55%, #150e30 100%)' }}>
                    {/* 뱃지 */}
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">넘버 센스</div>
                    {/* 기억할 번호 라벨 */}
                    <p className="text-[7px] font-bold uppercase tracking-widest mb-1.5"
                        style={{ color: 'rgba(165,180,252,0.5)' }}>기억할 번호</p>
                    {/* 번호공 3개 */}
                    <div className="flex gap-1 mb-2">
                        {showNums.map((n, i) => {
                            const c = lottoColor(n);
                            return (
                                <div key={n}
                                    className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-extrabold"
                                    style={{
                                        background: c.bg, color: c.fg,
                                        opacity: active ? 1 : 0,
                                        transform: active ? 'scale(1)' : 'scale(0.3)',
                                        transition: `opacity 0.4s ease, transform 0.5s ${POP_EASE}`,
                                        transitionDelay: active ? `${800 + i * 100}ms` : '0ms',
                                    }}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            );
                        })}
                    </div>
                    {/* 6x3 그리드 */}
                    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                        {gridNums.map(n => {
                            const ok = correct.has(n);
                            const c = ok ? lottoColor(n) : null;
                            return (
                                <div key={n}
                                    className="h-2.5 rounded text-[6px] font-bold flex items-center justify-center"
                                    style={{
                                        background: ok ? c.bg : 'rgba(255,255,255,0.05)',
                                        color: ok ? c.fg : 'rgba(255,255,255,0.3)',
                                        opacity: ok ? 1 : 0.13,
                                    }}>{n}</div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 카드 2 · 럭키 스코어 (LuckyScoreCard 미니) */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    border: '1px solid rgba(168,85,247,0.3)',
                    boxShadow: '0 14px 32px rgba(0,0,0,0.5), 0 0 22px rgba(168,85,247,0.3)',
                    opacity: active ? 1 : 0,
                    transform: active ? 'translateX(0) rotate(0)' : 'translateX(-30px) rotate(3deg)',
                    transition: `opacity 0.6s ease, transform 0.7s ${POP_EASE}`,
                    transitionDelay: active ? '700ms' : '0ms',
                }}>
                <div className="relative px-3 pt-3 pb-2.5"
                    style={{ background: 'linear-gradient(135deg, #100820 0%, #1e0f3a 55%, #160a2e 100%)' }}>
                    {/* 뱃지 */}
                    <div className="absolute top-2 right-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                        럭키 스코어
                    </div>
                    {/* 아쉬움 점수 라벨 */}
                    <p className="text-[7px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: 'rgba(192,132,252,0.5)' }}>아쉬움 점수</p>
                    {/* 큰 숫자 + 가중치 */}
                    <div className="flex items-end gap-1.5 mb-2">
                        <span className="font-extrabold leading-none"
                            style={{
                                fontSize: 32, color: '#c084fc',
                                opacity: active ? 1 : 0,
                                transition: 'opacity 0.5s ease',
                                transitionDelay: active ? '900ms' : '0ms',
                            }}>92</span>
                        <span className="text-[8px] font-extrabold mb-0.5 px-1 py-px rounded"
                            style={{
                                background: 'rgba(236,72,153,0.2)', color: '#f472b6',
                                opacity: active ? 1 : 0,
                                transform: active ? 'scale(1)' : 'scale(0.5)',
                                transition: `opacity 0.4s ease, transform 0.5s ${POP_EASE}`,
                                transitionDelay: active ? '1100ms' : '0ms',
                            }}>×2.0</span>
                    </div>
                    {/* 진행 바 3개 */}
                    <div className="flex flex-col gap-1">
                        {[
                            { score: 92, color: 'linear-gradient(90deg, #7c3aed, #ec4899)', delay: 1100 },
                            { score: 74, color: 'rgba(255,255,255,0.18)', delay: 1200 },
                            { score: 61, color: 'rgba(255,255,255,0.11)', delay: 1300 },
                        ].map((b, i) => (
                            <div key={i} className="h-1 rounded-full overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div className="h-full rounded-full"
                                    style={{
                                        width: active ? `${b.score}%` : '0%',
                                        background: b.color,
                                        transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                                        transitionDelay: active ? `${b.delay}ms` : '0ms',
                                    }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MockWelcome({ active }) {
    const balls = [
        { n: 7, color: '#FBC400', x: -130, y: -70, delay: 600, dur: 3.4 },
        { n: 14, color: '#69C8F2', x: 125, y: -55, delay: 750, dur: 3.0 },
        { n: 22, color: '#FF7272', x: -120, y: 95, delay: 900, dur: 3.8 },
        { n: 35, color: '#AAAAAA', x: 130, y: 85, delay: 1050, dur: 3.5 },
        { n: 42, color: '#B0D840', x: 0, y: -140, delay: 1200, dur: 3.6 },
    ];
    const sparkles = [
        { x: -170, y: -10, size: 4, delay: 1400 },
        { x: 160, y: 40, size: 3, delay: 1500 },
        { x: -70, y: 160, size: 2, delay: 1600 },
        { x: 90, y: -130, size: 5, delay: 1700 },
        { x: 150, y: 130, size: 3, delay: 1800 },
        { x: -150, y: 130, size: 2, delay: 1900 },
    ];
    return (
        <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
            {/* 회전하는 외곽 점선 링 */}
            <div className="absolute rounded-full"
                style={{
                    width: 320, height: 320,
                    border: '1px dashed rgba(74,222,128,0.28)',
                    animation: active ? 'ti-rotate 24s linear infinite' : 'none',
                    opacity: active ? 1 : 0,
                    transition: 'opacity 0.9s ease',
                }} />
            {/* 안쪽 솔리드 링 */}
            <div className="absolute rounded-full"
                style={{
                    width: 240, height: 240,
                    border: '1.5px solid rgba(74,222,128,0.18)',
                    opacity: active ? 1 : 0,
                    transform: active ? 'scale(1)' : 'scale(0.85)',
                    transition: 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.22,1,0.36,1)',
                    transitionDelay: active ? '150ms' : '0ms',
                }} />
            {/* 글로우 헤일로 */}
            <div className="absolute rounded-full"
                style={{
                    width: 260, height: 260,
                    background: 'radial-gradient(circle, rgba(74,222,128,0.42), transparent 65%)',
                    filter: 'blur(24px)',
                    opacity: active ? 1 : 0,
                    transition: 'opacity 1s ease',
                    animation: active ? 'ti-pulse 3.5s ease-in-out infinite' : 'none',
                }} />

            {/* 캐릭터 */}
            <div className="relative" style={{
                animation: active ? 'ti-float 3.5s ease-in-out infinite' : 'none',
                filter: 'drop-shadow(0 18px 42px rgba(74,222,128,0.6))',
                transition: 'opacity 0.7s ease, transform 0.9s cubic-bezier(0.34,1.56,0.64,1)',
                opacity: active ? 1 : 0,
                transform: active ? 'scale(1)' : 'scale(0.6)',
                transitionDelay: active ? '250ms' : '0ms',
            }}>
                <Image src="/character.png" alt="클로버" width={220} height={220} priority unoptimized />
            </div>

            {/* 떠다니는 번호공 */}
            {balls.map((b, i) => (
                <div key={b.n}
                    className="absolute w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold text-black"
                    style={{
                        background: b.color,
                        boxShadow: `0 8px 20px rgba(0,0,0,0.45), 0 0 14px ${b.color}66`,
                        left: `calc(50% + ${b.x}px - 20px)`,
                        top: `calc(50% + ${b.y}px - 20px)`,
                        opacity: active ? 0.92 : 0,
                        transform: active ? 'scale(1)' : 'scale(0.2)',
                        transition: `opacity 0.5s ease, transform 0.7s ${POP_EASE}`,
                        transitionDelay: `${b.delay}ms`,
                        animation: active ? `ti-float ${b.dur}s ease-in-out ${i * 0.18}s infinite` : 'none',
                    }}>{b.n}</div>
            ))}

            {/* 반짝이 점들 */}
            {sparkles.map((s, i) => (
                <div key={i} className="absolute rounded-full bg-white"
                    style={{
                        width: s.size, height: s.size,
                        left: `calc(50% + ${s.x}px)`,
                        top: `calc(50% + ${s.y}px)`,
                        boxShadow: '0 0 12px rgba(255,255,255,0.9)',
                        opacity: 0,
                        animation: active ? `ti-twinkle 2.6s ease-in-out ${i * 0.32}s infinite` : 'none',
                        animationDelay: `${s.delay}ms`,
                    }} />
            ))}
        </div>
    );
}

function MockDone({ active }) {
    const features = [
        { icon: 'qr_code_scanner',    label: '스캔 적립', color: '#3182F6' },
        { icon: 'confirmation_number', label: '경품 응모', color: '#fbbf24' },
        { icon: 'auto_awesome',        label: '번호 생성', color: '#a78bfa' },
        { icon: 'sports_esports',      label: '콘텐츠',    color: '#34d399' },
    ];
    const rays = [0, 45, 90, 135, 180, 225, 270, 315];
    return (
        <div className="relative flex flex-col items-center gap-7">
            {/* 캐릭터 + 셀러브레이션 */}
            <div className="relative flex items-center justify-center" style={{ width: 260, height: 220 }}>
                {/* 광선 8방향 */}
                {rays.map((deg, i) => (
                    <div key={deg}
                        className="absolute pointer-events-none"
                        style={{
                            width: 2.5, height: 40,
                            background: 'linear-gradient(to top, transparent, rgba(74,222,128,0.7))',
                            left: '50%', top: '50%',
                            transformOrigin: 'top center',
                            transform: `translate(-50%, 0) rotate(${deg}deg) translateY(-115px)`,
                            opacity: active ? 1 : 0,
                            transition: `opacity 0.4s ease`,
                            animation: active ? `ti-burst 2.8s ease-out ${i * 0.08}s infinite` : 'none',
                            animationDelay: `${500 + i * 60}ms`,
                        }} />
                ))}

                {/* 글로우 */}
                <div className="absolute rounded-full"
                    style={{
                        width: 240, height: 240,
                        background: 'radial-gradient(circle, rgba(74,222,128,0.38), transparent 65%)',
                        filter: 'blur(22px)',
                        opacity: active ? 1 : 0,
                        transition: 'opacity 1s ease',
                        animation: active ? 'ti-pulse 3.5s ease-in-out infinite' : 'none',
                    }} />

                {/* 캐릭터 */}
                <div className="relative" style={{
                    animation: active ? 'ti-float 3s ease-in-out infinite' : 'none',
                    filter: 'drop-shadow(0 18px 42px rgba(74,222,128,0.6))',
                    transition: 'opacity 0.7s ease, transform 0.9s cubic-bezier(0.34,1.56,0.64,1)',
                    opacity: active ? 1 : 0,
                    transform: active ? 'scale(1)' : 'scale(0.5)',
                    transitionDelay: active ? '200ms' : '0ms',
                }}>
                    <Image src="/character.png" alt="클로버" width={180} height={180} priority unoptimized />
                </div>

                {/* 체크 뱃지 */}
                <div className="absolute"
                    style={{
                        right: 18, top: 6,
                        opacity: active ? 1 : 0,
                        transform: active ? 'scale(1) rotate(0)' : 'scale(0) rotate(-180deg)',
                        transition: 'opacity 0.4s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
                        transitionDelay: '700ms',
                    }}>
                    <div className="w-12 h-12 rounded-full bg-[#4ade80] flex items-center justify-center"
                        style={{ boxShadow: '0 8px 24px rgba(74,222,128,0.55), 0 0 24px rgba(74,222,128,0.5)' }}>
                        <span className="material-symbols-outlined text-[26px] text-black" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
                    </div>
                </div>

                {/* 떠다니는 컨페티 */}
                {[
                    { x: -100, y: -40, color: '#FBC400', size: 6 },
                    { x: 110, y: -50, color: '#FF7272', size: 5 },
                    { x: -90, y: 70, color: '#69C8F2', size: 4 },
                    { x: 100, y: 60, color: '#B0D840', size: 6 },
                    { x: 0, y: -100, color: '#4ade80', size: 4 },
                ].map((c, i) => (
                    <div key={i} className="absolute rounded-full"
                        style={{
                            width: c.size, height: c.size,
                            background: c.color,
                            left: `calc(50% + ${c.x}px)`,
                            top: `calc(50% + ${c.y}px)`,
                            boxShadow: `0 0 8px ${c.color}88`,
                            opacity: active ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                            transitionDelay: `${900 + i * 80}ms`,
                            animation: active ? `ti-float ${2.5 + i * 0.2}s ease-in-out ${i * 0.3}s infinite` : 'none',
                        }} />
                ))}
            </div>

            {/* 기능 언락 카드 — 4개 */}
            <div className="flex gap-1.5">
                {features.map((f, i) => (
                    <div key={f.label}
                        className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-2xl"
                        style={{
                            width: 66,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(12px)',
                            opacity: active ? 1 : 0,
                            transform: active ? 'translateY(0)' : 'translateY(15px)',
                            transition: `opacity 0.5s ease, transform 0.6s ${POP_EASE}`,
                            transitionDelay: `${1000 + i * 110}ms`,
                        }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: `${f.color}22`, border: `1px solid ${f.color}55` }}>
                            <span className="material-symbols-outlined text-[16px]"
                                style={{ color: f.color, fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                        </div>
                        <div className="text-[9px] font-bold text-white/80 whitespace-nowrap">{f.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Dots({ total, current }) {
    return (
        <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-7 bg-white' : 'w-1.5 bg-white/25'
                }`} />
            ))}
        </div>
    );
}
