import React, { useState, useRef, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';

/* ─── AgeGroupPicker ─────────────────────────────────────── */
const AGE_GROUPS = ['10대 미만', '10대', '20대', '30대', '40대', '50대', '60대 이상'];
const ITEM_H = 56;

function AgeGroupPicker({ value, onChange }) {
    const ref = useRef(null);

    useEffect(() => {
        const idx = AGE_GROUPS.indexOf(value);
        if (ref.current && idx !== -1) ref.current.scrollTop = idx * ITEM_H;
    }, []);

    const handleScroll = useCallback(() => {
        if (!ref.current) return;
        const idx = Math.round(ref.current.scrollTop / ITEM_H);
        const clamped = Math.max(0, Math.min(idx, AGE_GROUPS.length - 1));
        if (AGE_GROUPS[clamped] !== value) onChange(AGE_GROUPS[clamped]);
    }, [value, onChange]);

    return (
        <div className="relative overflow-hidden w-full" style={{ height: ITEM_H * 5 }}>
            {/* 선택 하이라이트 (z:1, semi-transparent) */}
            <div className="absolute inset-x-0 pointer-events-none"
                style={{ top: ITEM_H * 2, height: ITEM_H, zIndex: 1,
                    background: 'rgba(255,255,255,0.07)',
                    borderTop: '1px solid rgba(255,255,255,0.14)',
                    borderBottom: '1px solid rgba(255,255,255,0.14)' }} />
            {/* 상단 페이드 (z:3, text 위) */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: ITEM_H * 2, zIndex: 3,
                    background: 'linear-gradient(to bottom, var(--color-bg) 20%, transparent)' }} />
            {/* 하단 페이드 (z:3) */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{ height: ITEM_H * 2, zIndex: 3,
                    background: 'linear-gradient(to top, var(--color-bg) 20%, transparent)' }} />
            {/* 스크롤 컨테이너 (z:2, 하이라이트 위·페이드 아래) */}
            <div ref={ref} onScroll={handleScroll}
                className="h-full overflow-y-scroll"
                style={{ position: 'relative', zIndex: 2, scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}>
                <div style={{ height: ITEM_H * 2 }} />
                {AGE_GROUPS.map(ag => (
                    <div key={ag}
                        onClick={() => { const i = AGE_GROUPS.indexOf(ag); ref.current.scrollTo({ top: i * ITEM_H, behavior: 'smooth' }); onChange(ag); }}
                        style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
                        className="flex items-center justify-center text-[22px] font-bold text-t-primary cursor-pointer select-none">
                        {ag}
                    </div>
                ))}
                <div style={{ height: ITEM_H * 2 }} />
            </div>
        </div>
    );
}

/* ─── ProgressBar ────────────────────────────────────────── */
function ProgressBar({ step }) {
    return (
        <div className="flex gap-1.5 px-6">
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex-1 h-[3px] rounded-full transition-all duration-500"
                    style={{ background: i < step ? 'var(--color-text)' : 'var(--color-border-light)' }} />
            ))}
        </div>
    );
}

/* ─── 스텝별 캐릭터 설정
   순서: 1닉네임 2성별 3나이대 4추천인 5약관 6테마
   ──────────────────────────────────────────────── */
const CHAR_CFG = {
    1: { bubble: null,                           align: 'center', size: 144, flip: false },
    2: { bubble: "편하신대로 알려주세요",           align: 'left',   size: 120, flip: false },
    3: { bubble: "어느 나이대이신가요?",            align: 'right',  size: 124, flip: true  },
    4: { bubble: "있으면 둘 다 보너스 받아요",      align: 'center', size: 116, flip: false },
    5: { bubble: "필수 동의 사항이에요",            align: 'right',  size: 112, flip: true  },
    6: { bubble: "선택하면 바로 바뀌어요",          align: 'left',   size: 132, flip: false },
};

function CharacterArea({ step, nickname }) {
    const c = CHAR_CFG[step];
    const bubbleText = step === 1
        ? (nickname.trim() ? `${nickname.trim()}님, 반가워요!` : "어떻게 불러드릴까요?")
        : c.bubble;

    const justifyClass = c.align === 'center' ? 'justify-center' : c.align === 'left' ? 'justify-start' : 'justify-end';
    const alignClass   = c.align === 'center' ? 'items-center'   : c.align === 'left' ? 'items-start'   : 'items-end';

    return (
        <div className={`flex px-6 pt-3 pb-1 ${justifyClass}`}>
            <div className={`flex flex-col gap-2 ${alignClass}`}>
                <div className="bg-card-gray border border-themed-light rounded-2xl px-4 py-2.5 max-w-[210px]">
                    <p className="text-[13px] font-semibold text-t-primary">{bubbleText}</p>
                </div>
                <div style={{ transform: c.flip ? 'scaleX(-1)' : 'none', filter: 'drop-shadow(0 10px 28px rgba(74,222,128,0.3))' }}>
                    <Image src="/character.png" alt="캐릭터" width={c.size} height={c.size} unoptimized />
                </div>
            </div>
        </div>
    );
}

/* ─── 공통 컴포넌트 ───────────────────────────────────────── */
function TextInput({ placeholder, value, onChange, type = 'text', right }) {
    return (
        <div className="relative">
            <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
                className="w-full bg-card-gray border border-themed rounded-2xl px-4 py-4 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-light transition-colors pr-12" />
            {right && <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>}
        </div>
    );
}

function NextBtn({ label = '다음', disabled, onClick }) {
    return (
        <button disabled={disabled} onClick={onClick}
            className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 ${
                disabled ? 'bg-card-gray text-t-dim cursor-not-allowed' : 'bg-accent text-accent-fg'
            }`}>
            {label}
        </button>
    );
}

/* ─── 메인 ───────────────────────────────────────────────── */
export default function Signup() {
    const router = useRouter();
    const { switchTheme, theme } = useTheme();

    const [step, setStep] = useState('auth');

    /* Auth */
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [confirm,  setConfirm]  = useState('');
    const [showPw,   setShowPw]   = useState(false);
    const [showCf,   setShowCf]   = useState(false);

    /* Profile */
    const [nickname,        setNickname]        = useState('');
    const [gender,          setGender]          = useState('');
    const [ageGroup,        setAgeGroup]        = useState('30대');
    const [referral,        setReferral]        = useState('');
    const [agreedTerms,     setAgreedTerms]     = useState(false);
    const [agreedPrivacy,   setAgreedPrivacy]   = useState(false);
    const [agreedMarketing, setAgreedMarketing] = useState(false);

    const emailOk    = email.includes('@') && email.includes('.');
    const passwordOk = password.length >= 8;
    const confirmOk  = password === confirm && confirm.length > 0;
    const authValid  = emailOk && passwordOk && confirmOk;
    const requiredTerms = agreedTerms && agreedPrivacy;
    const allTerms      = requiredTerms && agreedMarketing;

    const handleBack = () => {
        if (step === 'auth') { router.back(); return; }
        if (step === 1)      { setStep('auth'); return; }
        setStep(s => s - 1);
    };

    const goNext = () => {
        if (step === 'auth') { setStep(1); return; }
        if (step === 6) {
            localStorage.setItem('user_registered', 'true');
            setStep('complete');
            return;
        }
        setStep(s => s + 1);
    };

    /* ── 완료 화면 ──────────────────────────────────────── */
    if (step === 'complete') return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 가입 완료</title></Head>
            <div className="flex min-h-screen w-full flex-col items-center justify-center max-w-[430px] mx-auto px-8">
                <div className="mb-8" style={{ filter: 'drop-shadow(0 16px 48px rgba(74,222,128,0.6))' }}>
                    <Image src="/character.png" alt="캐릭터" width={200} height={200} unoptimized />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-center mb-3">가입 완료!</h1>
                <p className="text-lg font-semibold text-t-muted text-center mb-2">환영합니다, {nickname || '사용자'}님!</p>
                <p className="text-sm text-t-muted text-center mb-8">첫 가입 보너스로 100P를 드렸어요!</p>
                <div className="w-full bg-card-gray rounded-3xl p-8 flex flex-col items-center gap-2 border border-themed mb-8">
                    <p className="text-t-muted text-sm font-semibold">현재 포인트</p>
                    <p className="text-5xl font-extrabold text-accent">100 P</p>
                    <p className="text-xs text-t-dim font-medium mt-1">첫 가입 보너스 +100P 지급 완료</p>
                </div>
                <button onClick={() => router.replace('/tutorial_intro?from=signup')}
                    className="w-full py-4 rounded-xl bg-accent text-accent-fg font-extrabold text-base active:scale-95 transition-all">
                    시작하기
                </button>
            </div>
        </div>
    );

    /* ── 이메일 가입 (사전 단계) ─────────────────────────── */
    if (step === 'auth') return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 회원가입</title></Head>
            <div className="flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background">
                <div className="flex items-center gap-3 px-4 pt-12 pb-4">
                    <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                </div>
                <div className="relative mx-4 mb-5 rounded-3xl overflow-hidden border border-[#4ade80]/15 bg-gradient-to-br from-[#061e1e] via-[#0a2828] to-[#061424]" style={{ height: 180 }}>
                    <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-accent-soft pointer-events-none" />
                    <div className="absolute left-5 top-0 bottom-0 flex flex-col justify-center" style={{ right: 150 }}>
                        <h2 className="text-[22px] font-extrabold text-white leading-snug tracking-tight">같이<br/>시작해봐요!</h2>
                        <p className="text-[12px] text-white/40 mt-2 font-medium">가입하면 바로 100P 드려요</p>
                    </div>
                    <div className="absolute bottom-0 right-2" style={{ filter: 'drop-shadow(0 6px 20px rgba(74,222,128,0.5))' }}>
                        <Image src="/character.png" alt="캐릭터" width={140} height={140} unoptimized priority />
                    </div>
                </div>
                <div className="flex flex-col px-6 gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-t-muted pl-1">이메일</label>
                        <TextInput placeholder="이메일을 입력하세요" value={email} onChange={setEmail} type="email" />
                        {email.length > 0 && !emailOk && <p className="text-[11px] text-red-400 pl-1">올바른 이메일 형식을 입력해주세요</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-t-muted pl-1">비밀번호</label>
                        <TextInput placeholder="8자 이상 입력하세요" value={password} onChange={setPassword}
                            type={showPw ? 'text' : 'password'}
                            right={<button onClick={() => setShowPw(p => !p)}><span className="material-symbols-outlined text-[20px] text-t-dim">{showPw ? 'visibility' : 'visibility_off'}</span></button>} />
                        {password.length > 0 && !passwordOk && <p className="text-[11px] text-red-400 pl-1">8자 이상 입력해주세요</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-t-muted pl-1">비밀번호 확인</label>
                        <TextInput placeholder="비밀번호를 다시 입력하세요" value={confirm} onChange={setConfirm}
                            type={showCf ? 'text' : 'password'}
                            right={<button onClick={() => setShowCf(p => !p)}><span className="material-symbols-outlined text-[20px] text-t-dim">{showCf ? 'visibility' : 'visibility_off'}</span></button>} />
                        {confirm.length > 0 && !confirmOk && <p className="text-[11px] text-red-400 pl-1">비밀번호가 일치하지 않아요</p>}
                        {confirmOk && <p className="text-[11px] text-accent pl-1">✓ 비밀번호가 일치해요</p>}
                    </div>
                </div>
                <div className="mt-auto px-6 pb-12 pt-8">
                    <NextBtn disabled={!authValid} onClick={() => setStep(1)} />
                    <div className="mt-4 text-center">
                        <span className="text-accent text-xs font-bold bg-accent-soft px-3 py-1.5 rounded-full inline-flex items-center gap-1 border border-accent/20">
                            <span className="material-symbols-outlined text-[14px]">redeem</span>
                            첫 가입 보너스 +100P!
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ── STEP 1-6 ────────────────────────────────────────── */
    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 회원가입</title></Head>
            <div className="flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background">

                {/* 상단: 뒤로가기 + 진행바 */}
                <div className="pt-12 pb-3 flex-shrink-0">
                    <div className="flex items-center px-4 mb-4">
                        <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                        </button>
                    </div>
                    <ProgressBar step={step} />
                </div>

                {/* 스텝 콘텐츠 (전환마다 페이드인) */}
                <div key={step} className="flex flex-col flex-1 step-anim">

                    {/* 성별(2) 스텝은 캐릭터가 카드 안에 있어서 상단 영역 생략 */}
                    {step !== 2 && <CharacterArea step={step} nickname={nickname} />}

                    <div className="flex flex-col flex-1 px-6 pt-4">
                        <p className="text-[11px] font-bold text-t-dim tracking-widest uppercase mb-3">STEP {step} / 6</p>

                        {/* ── 1: 닉네임 ── */}
                        {step === 1 && (
                            <>
                                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight mb-6">
                                    어떻게<br/>불러드릴까요?
                                </h2>
                                <TextInput placeholder="닉네임을 입력하세요" value={nickname} onChange={setNickname} />
                            </>
                        )}

                        {/* ── 2: 성별 — 캐릭터 카드 ── */}
                        {step === 2 && (
                            <>
                                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight mb-5">
                                    성별을<br/>알려주실 수 있나요?
                                </h2>
                                <div className="flex gap-4">
                                    {[
                                        {
                                            g: '남성',
                                            src: '/character.png',
                                            glow: 'rgba(74,222,128,0.38)',
                                            selectedBg: 'rgba(20,184,166,0.1)',
                                            selectedBorder: '#3182F6',
                                        },
                                        {
                                            g: '여성',
                                            src: '/char_female.png',
                                            glow: 'rgba(236,72,153,0.38)',
                                            selectedBg: 'rgba(236,72,153,0.1)',
                                            selectedBorder: 'rgba(236,72,153,0.8)',
                                        },
                                    ].map(({ g, src, glow, selectedBg, selectedBorder }) => {
                                        const selected = gender === g;
                                        return (
                                            <button key={g} onClick={() => setGender(selected ? '' : g)}
                                                className="flex-1 flex flex-col items-center justify-center gap-4 py-8 rounded-3xl border transition-all active:scale-[0.97]"
                                                style={{
                                                    background: selected ? selectedBg : 'var(--color-card)',
                                                    borderColor: selected ? selectedBorder : 'var(--color-border)',
                                                }}>
                                                <div style={{ filter: `drop-shadow(0 8px 20px ${glow})` }}>
                                                    <Image src={src} alt={g} width={100} height={100} unoptimized />
                                                </div>
                                                <p className="text-[17px] font-bold"
                                                    style={{ color: selected ? selectedBorder : 'var(--color-text-muted)' }}>
                                                    {g}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* ── 3: 나이대 ── */}
                        {step === 3 && (
                            <>
                                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight mb-4">
                                    어느<br/>나이대이신가요?
                                </h2>
                                <AgeGroupPicker value={ageGroup} onChange={setAgeGroup} />
                            </>
                        )}

                        {/* ── 4: 추천인 ── */}
                        {step === 4 && (
                            <>
                                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight mb-6">
                                    추천해주신<br/>분이 있나요?
                                </h2>
                                <TextInput placeholder="추천인 코드를 입력해주세요" value={referral} onChange={setReferral} />
                                <p className="text-[12px] text-t-dim mt-3 pl-1">
                                    입력하면 추천인과 함께 보너스 포인트를 드려요
                                </p>
                            </>
                        )}

                        {/* ── 5: 약관 ── */}
                        {step === 5 && (
                            <>
                                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight mb-6">
                                    약관에<br/>동의해주세요
                                </h2>
                                <div className="flex flex-col bg-card-gray rounded-3xl border border-themed overflow-hidden">
                                    <button onClick={() => { const n = !allTerms; setAgreedTerms(n); setAgreedPrivacy(n); setAgreedMarketing(n); }}
                                        className="flex items-center gap-4 px-5 py-4 border-b border-themed">
                                        <div className={`w-6 h-6 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                                            allTerms ? 'bg-white border-white' : 'border-t-dim'}`}>
                                            {allTerms && <span className="material-symbols-outlined text-black text-[14px]">check</span>}
                                        </div>
                                        <span className="text-[15px] font-bold text-t-primary">전체 동의</span>
                                    </button>
                                    {[
                                        { label: '[필수] 이용약관 동의',           checked: agreedTerms,     set: setAgreedTerms,     chevron: true  },
                                        { label: '[필수] 개인정보 처리방침 동의',   checked: agreedPrivacy,   set: setAgreedPrivacy,   chevron: true  },
                                        { label: '[선택] 마케팅 수신 동의',         checked: agreedMarketing, set: setAgreedMarketing, chevron: false },
                                    ].map(({ label, checked, set, chevron }) => (
                                        <button key={label} onClick={() => set(p => !p)}
                                            className="flex items-center gap-4 px-5 py-4 border-b border-themed last:border-b-0 text-left">
                                            <div className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                                                checked ? 'bg-white border-white' : 'border-t-dim'}`}>
                                                {checked && <span className="material-symbols-outlined text-black text-[12px]">check</span>}
                                            </div>
                                            <span className="flex-1 text-[14px] font-medium text-t-muted">{label}</span>
                                            {chevron && <span className="material-symbols-outlined text-[18px] text-t-dim">chevron_right</span>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── 6: 테마 ── */}
                        {step === 6 && (
                            <>
                                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight mb-6">
                                    어떤 분위기가<br/>좋으세요?
                                </h2>
                                <div className="flex gap-4">
                                    {[
                                        { key: 'dark-navy', label: '다크', icon: 'dark_mode'  },
                                        { key: 'light',     label: '라이트', icon: 'light_mode' },
                                    ].map(t => (
                                        <button key={t.key} onClick={() => switchTheme(t.key)}
                                            className={`flex-1 flex flex-col items-center gap-3 py-8 rounded-3xl border transition-all active:scale-95 ${
                                                theme === t.key
                                                    ? 'border-accent bg-accent-soft'
                                                    : 'border-themed bg-card-gray'
                                            }`}>
                                            <span className="material-symbols-outlined text-[32px]"
                                                style={{ fontVariationSettings: "'FILL' 1", color: theme === t.key ? '#3182F6' : 'var(--color-text-muted)' }}>
                                                {t.icon}
                                            </span>
                                            <p className={`text-[16px] font-bold ${theme === t.key ? 'text-accent' : 'text-t-primary'}`}>
                                                {t.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* 하단 버튼 */}
                        <div className="mt-auto pt-8 pb-12 flex flex-col gap-3">
                            {[2, 3, 4].includes(step) && (
                                <button onClick={() => setStep(s => s + 1)}
                                    className="text-[14px] font-semibold text-t-dim text-center py-2 active:opacity-60 transition-opacity">
                                    건너뛰기
                                </button>
                            )}
                            <NextBtn
                                label={step === 6 ? '가입 완료!' : '다음'}
                                disabled={(step === 1 && !nickname.trim()) || (step === 5 && !requiredTerms)}
                                onClick={goNext}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                ::-webkit-scrollbar { display: none; }
                @keyframes stepIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .step-anim { animation: stepIn 0.28s ease forwards; }
            `}</style>
        </div>
    );
}
