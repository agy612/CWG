import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/* 이미 사용 중인 닉네임(데모) — 실제로는 서버에서 중복 확인 */
const TAKEN_NICKNAMES = ['admin', 'fulif', 'test', '클로버', '로또왕', 'nickname'];

/* 국가별 지역 */
const COUNTRY_REGIONS = {
    KR: ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'],
    JP: ['도쿄', '오사카', '나고야', '후쿠오카', '삿포로', '기타'],
    US: ['California', 'New York', 'Texas', 'Washington', 'Other'],
};
const COUNTRIES = [
    { key: 'KR', label: '대한민국' },
    { key: 'JP', label: '일본' },
    { key: 'US', label: '미국' },
];

const GENDERS = [
    { key: 'male', label: '남성' },
    { key: 'female', label: '여성' },
    { key: 'none', label: '비공개' },
];

/* 프로필 기본 캐릭터 — 색별 풀리 4종 (+ 좌측 카메라 = 총 5칸) */
const CHAR_PRESETS = [
    '/char_wave.png', '/pulli_pink.png', '/pulli_orange.png', '/pulli_blue.png',
];

const DEFAULT_PROFILE = {
    image: '',
    nickname: 'Nickname',
    gender: 'none',
    birth: '',
    country: 'KR',
    region: '서울',
};

export default function ProfileEdit() {
    const router = useRouter();
    const fileRef = useRef(null);

    const [profile, setProfile] = useState(DEFAULT_PROFILE);
    const [initial, setInitial] = useState(DEFAULT_PROFILE);
    const [email, setEmail] = useState('user@fulif.com');
    const [nickError, setNickError] = useState('');
    const [saved, setSaved] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    // 저장된 프로필 로드
    useEffect(() => {
        try {
            const raw = localStorage.getItem('fulif_profile');
            if (raw) {
                const p = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
                setProfile(p);
                setInitial(p);
            }
        } catch {}
        const savedEmail = localStorage.getItem('fulif_email');
        if (savedEmail) setEmail(savedEmail);
    }, []);

    // 닉네임 유효성 (2~20자 + 중복)
    const validateNick = (v) => {
        const t = v.trim();
        if (t.length < 2 || t.length > 20) return '닉네임은 2~20자로 입력해 주세요';
        if (/\s/.test(t)) return '공백은 사용할 수 없어요';
        const dupe = TAKEN_NICKNAMES.includes(t.toLowerCase()) && t.toLowerCase() !== initial.nickname.toLowerCase();
        if (dupe) return '이미 사용 중인 닉네임이에요';
        return '';
    };

    const onNickChange = (v) => {
        setProfile(p => ({ ...p, nickname: v }));
        setNickError(validateNick(v));
    };

    const onPickImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setProfile(p => ({ ...p, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const changed = JSON.stringify(profile) !== JSON.stringify(initial);
    const valid = !validateNick(profile.nickname);
    const canSave = changed && valid;

    const handleSave = () => {
        if (!canSave) return;
        const clean = { ...profile, nickname: profile.nickname.trim() };
        localStorage.setItem('fulif_profile', JSON.stringify(clean));
        setInitial(clean);
        setProfile(clean);
        setSaved(true);
        setTimeout(() => router.back(), 700);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">

            {/* 헤더 */}
            <header className="flex items-center px-4 pt-6 pb-4 sticky top-0 bg-background z-20">
                <button onClick={() => router.back()} aria-label="뒤로"
                    className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <p className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">프로필 편집</p>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-40">

                {/* 프로필 이미지 — 누르면 선택 시트 */}
                <div className="flex flex-col items-center pt-6 pb-8">
                    <button onClick={() => setShowPicker(true)} className="pressable relative">
                        <div className="w-24 h-24 rounded-full bg-card-gray flex items-center justify-center overflow-hidden border border-themed">
                            {profile.image
                                ? <img src={profile.image} alt="" className="w-full h-full object-cover" />
                                : <span className="material-symbols-outlined text-[46px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>}
                        </div>
                        <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center ring-4 ring-[var(--color-bg)]">
                            <span className="material-symbols-outlined text-[17px] text-accent-fg">photo_camera</span>
                        </span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
                    <button onClick={() => setShowPicker(true)} className="text-[13px] font-semibold text-accent mt-3">프로필 사진 변경</button>
                </div>

                {/* 닉네임 */}
                <div className="mb-6">
                    <label className="text-[14px] font-bold text-t-primary block mb-2">닉네임</label>
                    <input
                        value={profile.nickname}
                        onChange={(e) => onNickChange(e.target.value)}
                        maxLength={20}
                        placeholder="닉네임을 입력해 주세요"
                        className="w-full h-13 py-3.5 px-4 rounded-2xl bg-input-bg text-[15px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors"
                        style={{ borderColor: nickError ? '#F04452' : undefined }}
                    />
                    <div className="flex items-center justify-between mt-1.5 px-1">
                        <span className={`text-[12px] font-medium ${nickError ? 'text-[#F04452]' : 'text-t-muted'}`}>
                            {nickError || '2~20자, 다른 사용자와 중복될 수 없어요'}
                        </span>
                        <span className="text-[12px] font-medium text-t-dim">{profile.nickname.trim().length}/20</span>
                    </div>
                </div>

                {/* 성별 */}
                <div className="mb-6">
                    <label className="text-[14px] font-bold text-t-primary block mb-2">성별</label>
                    <div className="grid grid-cols-3 gap-2">
                        {GENDERS.map(g => {
                            const on = profile.gender === g.key;
                            return (
                                <button key={g.key}
                                    onClick={() => setProfile(p => ({ ...p, gender: g.key }))}
                                    className={`pressable py-3.5 rounded-2xl text-[14px] font-bold border transition-colors ${on ? 'bg-accent-soft border-accent text-accent' : 'bg-input-bg border-themed text-t-secondary'}`}
                                >
                                    {g.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 생년월일 */}
                <div className="mb-6">
                    <label className="text-[14px] font-bold text-t-primary block mb-2">생년월일</label>
                    <input
                        type="date"
                        value={profile.birth}
                        max="2026-07-24"
                        onChange={(e) => setProfile(p => ({ ...p, birth: e.target.value }))}
                        className="w-full py-3.5 px-4 rounded-2xl bg-input-bg text-[15px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors"
                    />
                </div>

                {/* 국가 · 지역 */}
                <div className="mb-6">
                    <label className="text-[14px] font-bold text-t-primary block mb-2">국가 · 지역</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <select
                                value={profile.country}
                                onChange={(e) => {
                                    const c = e.target.value;
                                    setProfile(p => ({ ...p, country: c, region: COUNTRY_REGIONS[c][0] }));
                                }}
                                className="w-full py-3.5 px-4 pr-10 rounded-2xl bg-input-bg text-[15px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors appearance-none"
                            >
                                {COUNTRIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                            </select>
                            <span className="material-symbols-outlined text-[20px] text-t-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                        </div>
                        <div className="relative">
                            <select
                                value={profile.region}
                                onChange={(e) => setProfile(p => ({ ...p, region: e.target.value }))}
                                className="w-full py-3.5 px-4 pr-10 rounded-2xl bg-input-bg text-[15px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors appearance-none"
                            >
                                {(COUNTRY_REGIONS[profile.country] || []).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <span className="material-symbols-outlined text-[20px] text-t-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                        </div>
                    </div>
                </div>

                {/* 이메일 (수정 불가) */}
                <div className="mb-6">
                    <label className="text-[14px] font-bold text-t-primary block mb-2">이메일</label>
                    <div className="w-full py-3.5 px-4 rounded-2xl bg-card-gray flex items-center justify-between">
                        <span className="text-[15px] font-semibold text-t-muted truncate">{email}</span>
                        <span className="material-symbols-outlined text-[18px] text-t-dim flex-shrink-0 ml-2">lock</span>
                    </div>
                    <span className="text-[12px] font-medium text-t-dim mt-1.5 px-1 block">이메일은 변경할 수 없어요</span>
                </div>
            </div>

            {/* 저장 버튼 (하단 고정) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-6 pb-6 pt-3 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent">
                <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`pressable w-full py-4 rounded-2xl font-bold text-[16px] transition-colors ${canSave ? 'bg-accent text-accent-fg' : 'bg-btn-secondary text-t-dim'}`}
                >
                    {saved ? '저장됐어요' : '저장하기'}
                </button>
            </div>

            {/* 프로필 사진 선택 시트 */}
            {showPicker && (
                <div className="fixed inset-0 z-[200] flex flex-col justify-end max-w-[430px] mx-auto"
                    onClick={() => setShowPicker(false)}>
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
                    <div className="relative bg-card-gray rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-5" />
                        <p className="text-[17px] font-bold text-t-primary mb-5">프로필 사진</p>
                        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                            {/* 좌측: 직접 촬영/업로드 */}
                            <button
                                onClick={() => { fileRef.current?.click(); setShowPicker(false); }}
                                className="pressable flex-shrink-0 w-[72px] h-[72px] rounded-full bg-input-bg flex flex-col items-center justify-center border-2 border-dashed border-themed-medium"
                            >
                                <span className="material-symbols-outlined text-[24px] text-t-secondary">photo_camera</span>
                            </button>
                            {/* 색별 캐릭터 */}
                            {CHAR_PRESETS.map(src => {
                                const on = profile.image === src;
                                return (
                                    <button key={src}
                                        onClick={() => { setProfile(p => ({ ...p, image: src })); setShowPicker(false); }}
                                        className={`pressable flex-shrink-0 w-[72px] h-[72px] rounded-full overflow-hidden bg-input-bg flex items-center justify-center border-2 transition-colors ${on ? 'border-accent' : 'border-transparent'}`}
                                    >
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[12px] font-medium text-t-dim mt-3">캐릭터를 고르거나 직접 사진을 올릴 수 있어요</p>
                    </div>
                </div>
            )}
        </div>
    );
}
