import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

/* ── 언어별 문구 (실제 i18n 연동 전 목업) ───────────────── */
const LANGS = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
];

const T = {
    ko: {
        tagline: '낙첨 복권을 스캔하고\n포인트를 받아보세요',
        google: 'Google로 계속하기',
        apple: 'Apple로 계속하기',
        email: '이메일로 로그인',
        signupPrompt: '처음 오셨나요? ',
        signupLink: '회원가입 (+100P 보너스)',
        terms1: '계속 진행하면 ', termsTos: '이용약관', termsAnd: ' 및 ',
        termsPrivacy: '개인정보 처리방침', terms2: '에 동의하는 것으로 간주됩니다.',
        emailTitle: '이메일로 로그인',
        emailSubtitle: '가입하신 이메일로 로그인해주세요',
        emailLabel: '이메일', emailPlaceholder: '이메일을 입력하세요',
        pwLabel: '비밀번호', pwPlaceholder: '비밀번호를 입력하세요',
        errMsg: '이메일과 비밀번호(8자 이상)를 확인해주세요',
        loginBtn: '로그인', noAccount: '계정이 없으신가요? ', signup: '회원가입',
    },
    en: {
        tagline: 'Scan losing lottery tickets\nand earn points',
        google: 'Continue with Google',
        apple: 'Continue with Apple',
        email: 'Sign in with email',
        signupPrompt: 'First time here? ',
        signupLink: 'Sign up (+100P bonus)',
        terms1: 'By continuing, you agree to our ', termsTos: 'Terms of Service', termsAnd: ' and ',
        termsPrivacy: 'Privacy Policy', terms2: '.',
        emailTitle: 'Sign in with email',
        emailSubtitle: 'Sign in with your registered email',
        emailLabel: 'Email', emailPlaceholder: 'Enter your email',
        pwLabel: 'Password', pwPlaceholder: 'Enter your password',
        errMsg: 'Please check your email and password (8+ characters)',
        loginBtn: 'Sign in', noAccount: "Don't have an account? ", signup: 'Sign up',
    },
    ja: {
        tagline: 'はずれ宝くじをスキャンして\nポイントを受け取ろう',
        google: 'Googleで続ける',
        apple: 'Appleで続ける',
        email: 'メールでログイン',
        signupPrompt: 'はじめての方は ',
        signupLink: '新規登録（+100Pボーナス）',
        terms1: '続行すると、', termsTos: '利用規約', termsAnd: ' および ',
        termsPrivacy: 'プライバシーポリシー', terms2: 'に同意したものとみなされます。',
        emailTitle: 'メールでログイン',
        emailSubtitle: '登録したメールでログインしてください',
        emailLabel: 'メール', emailPlaceholder: 'メールアドレスを入力',
        pwLabel: 'パスワード', pwPlaceholder: 'パスワードを入力',
        errMsg: 'メールとパスワード（8文字以上）を確認してください',
        loginBtn: 'ログイン', noAccount: 'アカウントをお持ちでない方は ', signup: '新規登録',
    },
};

/* ── 언어 선택 드롭다운 (우상단) ────────────────────────── */
function LangSelector({ lang, onChange }) {
    const [open, setOpen] = useState(false);
    const current = LANGS.find(l => l.code === lang) || LANGS[0];

    return (
        <div className="absolute top-12 right-4 z-30">
            <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 bg-card-gray border border-themed-light rounded-full pl-3 pr-2.5 py-2 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[18px] text-t-muted">language</span>
                <span className="text-[13px] font-bold text-t-primary">{current.label}</span>
                <span className="material-symbols-outlined text-[18px] text-t-dim">{open ? 'expand_less' : 'expand_more'}</span>
            </button>

            {open && (
                <>
                    {/* 바깥 클릭 닫기 */}
                    <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-card-gray border border-themed-light rounded-2xl overflow-hidden shadow-2xl z-10">
                        {LANGS.map(l => (
                            <button key={l.code}
                                onClick={() => { onChange(l.code); setOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left active:bg-card-hover transition-colors ${
                                    l.code === lang ? 'text-[#14b8a6]' : 'text-t-primary'
                                }`}>
                                <span className="text-[14px] font-bold">{l.label}</span>
                                {l.code === lang && <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function Login() {
    const router = useRouter();

    // 'main' = 소셜 버튼 화면, 'email' = 이메일/비밀번호 입력 화면
    const [view, setView] = useState('main');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [lang, setLang] = useState('ko');

    useEffect(() => {
        // Already logged in → go to home
        if (localStorage.getItem('user_registered')) {
            router.replace('/');
            return;
        }
        // 저장된 언어 불러오기 (없으면 기기 언어 추정)
        const saved = localStorage.getItem('app_lang');
        if (saved && T[saved]) {
            setLang(saved);
        } else if (typeof navigator !== 'undefined') {
            const nav = navigator.language?.slice(0, 2);
            if (T[nav]) setLang(nav);
        }
    }, []);

    const changeLang = (code) => {
        setLang(code);
        localStorage.setItem('app_lang', code);
    };

    const t = T[lang];

    const emailOk = email.includes('@') && email.includes('.');
    const canSubmit = emailOk && password.length >= 8;

    const finishLogin = (provider) => {
        localStorage.setItem('user_registered', 'true');
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('auth_provider', provider);
        router.push('/');
    };

    const handleEmailLogin = () => {
        if (!canSubmit) {
            setError(t.errMsg);
            return;
        }
        // 로그인 시뮬레이션: 실제 인증 서버 연동 전이라 입력만 검증하고 통과
        localStorage.setItem('user_email', email);
        finishLogin('email');
    };

    /* ── 이메일 로그인 입력 화면 ────────────────────────── */
    if (view === 'email') return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 이메일 로그인</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                <LangSelector lang={lang} onChange={changeLang} />

                {/* 상단 뒤로가기 */}
                <div className="flex items-center gap-3 px-4 pt-12 pb-4">
                    <button onClick={() => { setView('main'); setError(''); }}
                        className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                </div>

                <div className="px-6 pt-2">
                    <h1 className="text-[28px] font-extrabold tracking-tight mb-2">{t.emailTitle}</h1>
                    <p className="text-t-muted text-sm font-medium mb-8">{t.emailSubtitle}</p>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-bold text-t-muted pl-1">{t.emailLabel}</label>
                            <input type="email" placeholder={t.emailPlaceholder} value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                className="w-full bg-card-gray border border-themed rounded-2xl px-4 py-4 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-light transition-colors" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[12px] font-bold text-t-muted pl-1">{t.pwLabel}</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} placeholder={t.pwPlaceholder} value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                                    className="w-full bg-card-gray border border-themed rounded-2xl px-4 py-4 pr-12 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-light transition-colors" />
                                <button onClick={() => setShowPw(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <span className="material-symbols-outlined text-[20px] text-t-dim">{showPw ? 'visibility' : 'visibility_off'}</span>
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-[12px] text-red-400 pl-1">{error}</p>}
                    </div>
                </div>

                <div className="mt-auto px-6 pb-12 pt-8 flex flex-col gap-4">
                    <button onClick={handleEmailLogin} disabled={!canSubmit}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 ${
                            canSubmit ? 'bg-bg-inverse text-t-inverse' : 'bg-card-gray text-t-dim cursor-not-allowed'
                        }`}>
                        {t.loginBtn}
                    </button>
                    <div className="text-center">
                        <span className="text-t-muted text-sm font-medium">{t.noAccount}</span>
                        <button onClick={() => router.push('/signup')}
                            className="text-[#14b8a6] text-sm font-bold active:opacity-60 transition-opacity">
                            {t.signup}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ── 메인 (소셜 로그인) 화면 ────────────────────────── */
    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 로그인</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                <LangSelector lang={lang} onChange={changeLang} />

                {/* Hero - 로고 + 문구 */}
                <div className="flex flex-1 flex-col items-center justify-center px-6">
                    <div className="mb-8" style={{ filter: 'drop-shadow(0 12px 40px rgba(79,70,229,0.45))' }}>
                        <Image src="/A1.png" alt="FULIF" width={132} height={132} priority unoptimized />
                    </div>
                    <p className="text-t-primary text-[19px] font-bold text-center leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                        {t.tagline}
                    </p>
                </div>

                {/* Actions - 소셜/이메일 로그인 */}
                <div className="px-6 flex flex-col gap-3">
                    {/* 구글 로그인 */}
                    <button
                        onClick={() => finishLogin('google')}
                        className="w-full py-4 rounded-xl bg-white text-[#1f1f1f] font-bold text-[15px] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        {t.google}
                    </button>

                    {/* 애플 로그인 */}
                    <button
                        onClick={() => finishLogin('apple')}
                        className="w-full py-4 rounded-xl bg-black text-white font-bold text-[15px] active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/15"
                    >
                        <svg width="18" height="20" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                        </svg>
                        {t.apple}
                    </button>

                    {/* 이메일 로그인 → 입력 화면으로 전환 */}
                    <button
                        onClick={() => setView('email')}
                        className="w-full py-4 rounded-xl bg-card-gray text-t-primary font-bold text-[15px] active:scale-95 transition-all border border-themed-light flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                        {t.email}
                    </button>
                </div>

                {/* 회원가입 */}
                <div className="px-6 mt-5 text-center">
                    <span className="text-t-muted text-sm font-medium">{t.signupPrompt}</span>
                    <button
                        onClick={() => router.push('/signup')}
                        className="text-[#14b8a6] text-sm font-bold active:opacity-60 transition-opacity"
                    >
                        {t.signupLink}
                    </button>
                </div>

                {/* Footer */}
                <div className="px-6 pt-8 pb-12 text-center">
                    <p className="text-t-faint text-xs leading-relaxed">
                        {t.terms1}<span className="text-t-muted">{t.termsTos}</span>{t.termsAnd}<span className="text-t-muted">{t.termsPrivacy}</span>{t.terms2}
                    </p>
                </div>
            </div>
        </div>
    );
}
