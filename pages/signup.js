import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';


function FieldLabel({ children, required }) {
    return (
        <label className="text-xs font-bold text-t-muted uppercase tracking-widest pl-1 flex items-center gap-1">
            {children}
            {required && <span className="text-[#14b8a6] normal-case tracking-normal font-semibold">*</span>}
        </label>
    );
}

function InputField({ type = 'text', placeholder, value, onChange, maxLength, autoComplete, rightElement, error }) {
    return (
        <div className="relative">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                autoComplete={autoComplete}
                className={`w-full bg-card-gray border rounded-2xl p-4 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none transition-colors ${
                    error
                        ? 'border-red-500/60 focus:border-red-500'
                        : 'border-themed focus:border-themed-medium'
                } ${rightElement ? 'pr-12' : ''}`}
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
    );
}

export default function Signup() {
    const router = useRouter();
    const userCtx = useUser();

    const [step, setStep] = useState('form');

    // Form fields
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [referralCode, setReferralCode] = useState('');

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);
    const [agreedMarketing, setAgreedMarketing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Derived validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError = submitted && !emailRegex.test(email.trim())
        ? '올바른 이메일을 입력해주세요'
        : '';
    const nicknameError = submitted && nickname.trim().length < 2
        ? '닉네임은 2자 이상이어야 합니다'
        : '';
    const passwordError = submitted && password.length < 6
        ? '비밀번호는 6자 이상이어야 합니다'
        : '';
    const passwordConfirmError = submitted && password !== passwordConfirm
        ? '비밀번호가 일치하지 않습니다'
        : '';
    const genderError = submitted && !gender
        ? '성별을 선택해주세요'
        : '';
    const ageNum = parseInt(age, 10);
    const ageError = submitted && (!age || isNaN(ageNum) || ageNum < 14 || ageNum > 120)
        ? '만 14세 이상의 나이를 입력해주세요'
        : '';

    const passwordsMatch = password.length > 0 && password === passwordConfirm;

    const isValid =
        emailRegex.test(email.trim()) &&
        nickname.trim().length >= 2 &&
        password.length >= 6 &&
        password === passwordConfirm &&
        gender !== '' &&
        !isNaN(parseInt(age, 10)) && parseInt(age, 10) >= 14 && parseInt(age, 10) <= 120 &&
        agreedTerms &&
        agreedPrivacy;

    const handleSubmit = () => {
        setSubmitted(true);
        if (!isValid) return;

        if (typeof window !== 'undefined') {
            localStorage.setItem('user_registered', 'true');
            localStorage.setItem('user_id', email.trim());
            localStorage.setItem('user_nickname', nickname.trim());
            localStorage.setItem('user_gender', gender);
            localStorage.setItem('user_age', age);
            if (referralCode.trim()) {
                localStorage.setItem('user_referral_code', referralCode.trim());
            }
        }

        setStep('complete');
    };

    // ── Complete screen ──────────────────────────────────────────────────────
    if (step === 'complete') {
        return (
            <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
                <Head><title>CWG - 가입 완료</title></Head>
                <div className="relative flex min-h-screen w-full flex-col items-center justify-center max-w-[430px] mx-auto bg-background shadow-2xl px-8">

                    <div className="w-24 h-24 rounded-full bg-[#14b8a6]/15 flex items-center justify-center mb-8">
                        <span className="material-symbols-outlined text-[56px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-center mb-3">가입 완료!</h1>
                    <p className="text-lg font-semibold text-btn-secondary-text text-center mb-2">
                        환영합니다, {nickname.trim()}님!
                    </p>
                    <p className="text-sm text-t-muted text-center mb-8">
                        첫 가입 보너스로 100P를 드렸어요!
                    </p>

                    <div className="w-full bg-card-gray rounded-3xl p-8 flex flex-col items-center gap-2 border border-themed mb-8">
                        <div className="text-t-muted text-sm font-semibold">현재 포인트</div>
                        <div className="text-5xl font-extrabold text-[#14b8a6] tracking-tight">100 P</div>
                        <div className="text-xs text-t-dim font-medium mt-1">첫 가입 보너스 +100P 지급 완료</div>
                    </div>

                    <button
                        onClick={() => router.replace('/lottery_selection')}
                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                    >
                        시작하기
                    </button>
                </div>
            </div>
        );
    }

    // ── Form screen ──────────────────────────────────────────────────────────
    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head>
                <title>CWG - 회원가입</title>
            </Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                {/* Header */}
                <div className="pt-14 pb-8 px-6">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center gap-1 text-t-muted active:opacity-60 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        <span className="text-sm font-semibold">뒤로</span>
                    </button>
                    <h1 className="text-3xl font-extrabold tracking-tight">회원가입</h1>
                    <p className="text-t-muted text-sm mt-2 font-medium">정보를 입력하고 100P 보너스를 받아보세요!</p>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col px-6 gap-5">

                    {/* 이메일 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel required>이메일</FieldLabel>
                        <InputField
                            type="email"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={50}
                            autoComplete="email"
                            error={!!emailError}
                        />
                        {emailError && (
                            <p className="text-xs text-red-400 pl-1 font-medium">{emailError}</p>
                        )}
                    </div>

                    {/* 닉네임 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel required>닉네임</FieldLabel>
                        <InputField
                            placeholder="2자 이상 입력해주세요"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={12}
                            autoComplete="nickname"
                            error={!!nicknameError}
                        />
                        {nicknameError && (
                            <p className="text-xs text-red-400 pl-1 font-medium">{nicknameError}</p>
                        )}
                    </div>

                    {/* 비밀번호 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel required>비밀번호</FieldLabel>
                        <InputField
                            type={showPassword ? 'text' : 'password'}
                            placeholder="6자 이상"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            error={!!passwordError}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-t-dim active:opacity-60 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            }
                        />
                        {passwordError && (
                            <p className="text-xs text-red-400 pl-1 font-medium">{passwordError}</p>
                        )}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel required>비밀번호 확인</FieldLabel>
                        <InputField
                            type={showPasswordConfirm ? 'text' : 'password'}
                            placeholder="비밀번호를 다시 입력해주세요"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            autoComplete="new-password"
                            error={!!passwordConfirmError}
                            rightElement={
                                passwordsMatch ? (
                                    <span className="material-symbols-outlined text-[20px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        check_circle
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirm((v) => !v)}
                                        className="text-t-dim active:opacity-60 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPasswordConfirm ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                )
                            }
                        />
                        {passwordConfirmError && (
                            <p className="text-xs text-red-400 pl-1 font-medium">{passwordConfirmError}</p>
                        )}
                    </div>

                    {/* 성별 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel required>성별</FieldLabel>
                        <div className="flex gap-3">
                            {[
                                { value: 'male', label: '남성', icon: 'man' },
                                { value: 'female', label: '여성', icon: 'woman' },
                            ].map(({ value, label, icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setGender(value)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border font-bold text-[15px] transition-all active:scale-95 ${
                                        gender === value
                                            ? 'bg-bg-inverse text-t-inverse border-transparent'
                                            : 'bg-card-gray text-t-primary border-themed'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: gender === value ? "'FILL' 1" : "'FILL' 0" }}>
                                        {icon}
                                    </span>
                                    {label}
                                </button>
                            ))}
                        </div>
                        {genderError && (
                            <p className="text-xs text-red-400 pl-1 font-medium">{genderError}</p>
                        )}
                    </div>

                    {/* 나이 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel required>나이</FieldLabel>
                        <InputField
                            type="number"
                            placeholder="만 나이를 입력해주세요"
                            value={age}
                            onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            autoComplete="off"
                            error={!!ageError}
                        />
                        {ageError && (
                            <p className="text-xs text-red-400 pl-1 font-medium">{ageError}</p>
                        )}
                    </div>

                    {/* 추천인 코드 */}
                    <div className="flex flex-col gap-2">
                        <FieldLabel>추천인 코드 <span className="text-t-dim normal-case tracking-normal font-normal">(선택)</span></FieldLabel>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="추천인 코드를 입력해주세요"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                maxLength={10}
                                className="w-full bg-card-gray border border-themed rounded-2xl p-4 text-[15px] font-medium text-t-primary placeholder:text-t-dim focus:outline-none focus:border-themed-medium transition-colors tracking-widest"
                            />
                        </div>
                        <p className="text-[11px] text-t-dim pl-1 font-medium">추천인과 함께 추가 포인트를 받을 수 있어요</p>
                    </div>

                </div>

                {/* Terms section */}
                <div className="mt-8 px-6 flex flex-col gap-4">
                    <div className="h-[1px] w-full bg-card-gray mb-2" />

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setAgreedTerms(!agreedTerms)}
                            className={`size-6 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${agreedTerms ? 'bg-bg-inverse border-bg-inverse' : 'border-t-dim bg-transparent'}`}
                        >
                            {agreedTerms && <span className="material-symbols-outlined text-t-inverse text-[14px]">check</span>}
                        </button>
                        <span className="text-sm font-medium text-btn-secondary-text flex-1">[필수] 이용약관 동의</span>
                        <span className="material-symbols-outlined text-[18px] text-t-dim">chevron_right</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setAgreedPrivacy(!agreedPrivacy)}
                            className={`size-6 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${agreedPrivacy ? 'bg-bg-inverse border-bg-inverse' : 'border-t-dim bg-transparent'}`}
                        >
                            {agreedPrivacy && <span className="material-symbols-outlined text-t-inverse text-[14px]">check</span>}
                        </button>
                        <span className="text-sm font-medium text-btn-secondary-text flex-1">[필수] 개인정보 처리방침 동의</span>
                        <span className="material-symbols-outlined text-[18px] text-t-dim">chevron_right</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setAgreedMarketing(!agreedMarketing)}
                            className={`size-6 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${agreedMarketing ? 'bg-[#14b8a6] border-[#14b8a6]' : 'border-t-dim bg-transparent'}`}
                        >
                            {agreedMarketing && <span className="material-symbols-outlined text-t-inverse text-[14px]">check</span>}
                        </button>
                        <span className="text-sm font-medium text-btn-secondary-text flex-1">[선택] 마케팅 수신 동의</span>
                    </div>

                    {submitted && (!agreedTerms || !agreedPrivacy) && (
                        <p className="text-xs text-red-400 pl-1 font-medium">필수 약관에 동의해주세요</p>
                    )}
                </div>

                {/* Bottom Action */}
                <div className="mt-auto px-6 pb-12 pt-8">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 ${
                            isValid
                                ? 'bg-bg-inverse text-t-inverse shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                : 'bg-btn-secondary text-t-muted cursor-not-allowed opacity-50'
                        }`}
                    >
                        가입 완료
                    </button>

                    <div className="mt-4 text-center">
                        <span className="text-[#14b8a6] text-xs font-bold bg-[#14b8a6]/10 px-3 py-1.5 rounded-full inline-flex items-center gap-1 border border-[#14b8a6]/20">
                            <span className="material-symbols-outlined text-[14px]">redeem</span>
                            첫 가입 보너스 +100P!
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
