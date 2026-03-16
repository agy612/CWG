import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

export default function Login() {
    const router = useRouter();
    const user = useUser();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 비밀번호 찾기 states
    const [resetStep, setResetStep] = useState(null); // null | 'find' | 'reset' | 'done'
    const [resetId, setResetId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('user_registered')) {
            router.replace('/');
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('이메일을 입력해주세요.');
            return;
        }
        if (!password) {
            setError('비밀번호를 입력해주세요.');
            return;
        }

        setLoading(true);

        // Simulate async login
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Store login state
        if (typeof window !== 'undefined') {
            localStorage.setItem('user_registered', 'true');
            localStorage.setItem('onboarding_completed', 'true');
            localStorage.setItem('user_id', email.trim());
        }

        // Update UserContext to FREE tier on login
        if (user && user.switchTier) {
            user.switchTier('FREE');
        }

        setLoading(false);
        router.push('/');
    };

    const handleFindAccount = async () => {
        setResetError('');
        if (!resetId.trim()) {
            setResetError('이메일을 입력해주세요.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetId.trim())) {
            setResetError('올바른 이메일을 입력해주세요.');
            return;
        }
        setResetLoading(true);
        await new Promise(r => setTimeout(r, 500));
        setResetLoading(false);
        setResetStep('reset');
    };

    const handleResetPassword = async () => {
        setResetError('');
        if (newPassword.length < 6) {
            setResetError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setResetError('비밀번호가 일치하지 않습니다.');
            return;
        }
        setResetLoading(true);
        await new Promise(r => setTimeout(r, 500));
        setResetLoading(false);
        setResetStep('done');
    };

    const closeReset = () => {
        setResetStep(null);
        setResetId('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setShowNewPassword(false);
        setResetError('');
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 로그인</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl overflow-y-auto">

                {/* Logo / Hero */}
                <div className="flex flex-col items-center pt-20 pb-8 px-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-card-gray to-surface flex items-center justify-center mb-6 shadow-2xl border border-themed-light">
                        <span className="material-symbols-outlined text-t-primary text-[40px]">filter_vintage</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-center mb-2">FULIF</h1>
                    <p className="text-t-muted text-[14px] font-medium text-center leading-relaxed">
                        낙첨 복권을 스캔하고<br />포인트를 돌려받으세요
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="px-6 flex flex-col gap-4 mt-4" noValidate>

                    {/* ID field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-t-muted uppercase tracking-widest pl-1">
                            이메일
                        </label>
                        <input
                            type="email"
                            autoComplete="email"
                            placeholder="이메일을 입력해주세요"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            className="w-full bg-card-gray border border-themed rounded-2xl px-4 py-3.5 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-medium transition-colors"
                        />
                    </div>

                    {/* Password field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-t-muted uppercase tracking-widest pl-1">
                            비밀번호
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="비밀번호를 입력해주세요"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="w-full bg-card-gray border border-themed rounded-2xl px-4 py-3.5 pr-12 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-medium transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-t-dim hover:text-t-secondary transition-colors"
                                tabIndex={-1}
                                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <p className="text-sm font-medium text-red-400 pl-1 -mt-1">{error}</p>
                    )}

                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-extrabold text-base transition-all active:scale-95 mt-2 ${
                            loading
                                ? 'bg-btn-secondary text-t-muted opacity-60 cursor-not-allowed'
                                : 'bg-bg-inverse text-t-inverse shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                로그인 중…
                            </span>
                        ) : '로그인'}
                    </button>
                </form>

                {/* Forgot password */}
                <div className="mt-4 px-6 text-center">
                    <button
                        type="button"
                        onClick={() => setResetStep('find')}
                        className="text-t-muted text-[13px] font-medium hover:text-t-secondary transition-colors underline underline-offset-2"
                    >
                        비밀번호 찾기
                    </button>
                </div>

                {/* 비밀번호 찾기 Bottom Sheet */}
                {resetStep && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={closeReset} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">

                            {resetStep === 'find' && (
                                <>
                                    <div className="flex flex-col items-center gap-1 mb-6">
                                        <span className="material-symbols-outlined text-[36px] text-t-primary mb-1">lock_reset</span>
                                        <h3 className="text-lg font-extrabold text-t-primary">비밀번호 찾기</h3>
                                        <p className="text-t-muted text-sm font-medium text-center">가입 시 사용한 이메일을 입력해주세요</p>
                                    </div>
                                    <div className="flex flex-col gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder="이메일 입력"
                                            value={resetId}
                                            onChange={(e) => { setResetId(e.target.value); setResetError(''); }}
                                            className="w-full bg-input-bg border border-themed rounded-2xl px-4 py-3.5 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-medium transition-colors"
                                        />
                                        {resetError && <p className="text-xs text-red-400 pl-1 font-medium">{resetError}</p>}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={closeReset} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                                        <button
                                            onClick={handleFindAccount}
                                            disabled={resetLoading}
                                            className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {resetLoading ? '확인 중…' : '다음'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {resetStep === 'reset' && (
                                <>
                                    <div className="flex flex-col items-center gap-1 mb-6">
                                        <span className="material-symbols-outlined text-[36px] text-[#14b8a6] mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                        <h3 className="text-lg font-extrabold text-t-primary">새 비밀번호 설정</h3>
                                        <p className="text-t-muted text-sm font-medium text-center"><span className="text-t-primary font-bold">{resetId}</span> 계정의 비밀번호를 재설정합니다</p>
                                    </div>
                                    <div className="flex flex-col gap-3 mb-4">
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="새 비밀번호 (6자 이상)"
                                                value={newPassword}
                                                onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
                                                className="w-full bg-input-bg border border-themed rounded-2xl px-4 py-3.5 pr-12 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-medium transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(v => !v)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-t-dim"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="새 비밀번호 확인"
                                            value={newPasswordConfirm}
                                            onChange={(e) => { setNewPasswordConfirm(e.target.value); setResetError(''); }}
                                            className={`w-full bg-input-bg border rounded-2xl px-4 py-3.5 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none transition-colors ${
                                                newPasswordConfirm && newPassword === newPasswordConfirm ? 'border-[#14b8a6]' : 'border-themed focus:border-themed-medium'
                                            }`}
                                        />
                                        {newPasswordConfirm && newPassword === newPasswordConfirm && (
                                            <p className="text-xs text-[#14b8a6] pl-1 font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                비밀번호가 일치합니다
                                            </p>
                                        )}
                                        {resetError && <p className="text-xs text-red-400 pl-1 font-medium">{resetError}</p>}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => { setResetStep('find'); setResetError(''); }} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">이전</button>
                                        <button
                                            onClick={handleResetPassword}
                                            disabled={resetLoading}
                                            className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {resetLoading ? '변경 중…' : '비밀번호 변경'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {resetStep === 'done' && (
                                <>
                                    <div className="flex flex-col items-center gap-2 mb-6">
                                        <div className="w-16 h-16 rounded-full bg-[#14b8a6]/15 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[36px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </div>
                                        <h3 className="text-lg font-extrabold text-t-primary">변경 완료!</h3>
                                        <p className="text-t-muted text-sm font-medium text-center">비밀번호가 성공적으로 변경되었습니다.<br/>새 비밀번호로 로그인해주세요.</p>
                                    </div>
                                    <button
                                        onClick={closeReset}
                                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all"
                                    >
                                        로그인하러 가기
                                    </button>
                                </>
                            )}

                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="mt-8 px-6 flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-card-gray" />
                    <span className="text-t-dim text-xs font-medium">또는</span>
                    <div className="flex-1 h-[1px] bg-card-gray" />
                </div>

                {/* Sign up link */}
                <div className="px-6 mt-6">
                    <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="w-full py-4 rounded-xl bg-card-gray text-t-primary font-bold text-base active:scale-95 transition-all border border-themed-light flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px] text-t-muted">person_add</span>
                        회원가입
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-auto px-6 pb-12 pt-10 text-center">
                    <p className="text-t-faint text-xs leading-relaxed">
                        계속 진행하면 <span className="text-t-muted">이용약관</span> 및{' '}
                        <span className="text-t-muted">개인정보 처리방침</span>에 동의하는 것으로 간주됩니다.
                    </p>
                </div>

            </div>
        </div>
    );
}
