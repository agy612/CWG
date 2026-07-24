import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/**
 * 친구 초대 — 코드 발급·공유·보상 현황 (2차 기획 ⑥).
 *
 * 가입 폼에는 추천인 코드 "입력"만 있었음 → 내 코드를 발급/공유하는 화면.
 * - 내 초대 코드(6자리) + 원탭 공유(시스템 공유 시트 / 링크 복사)
 * - 초대 현황판: 가입 완료 친구 수, 받은 보너스 누계, 3명 마일스톤
 * - 프로토타입: 로컬 완결(cwg_invites). 실보상 지급은 서버 연동 시점에 활성화.
 */

const KEY = 'cwg_invites';
const REWARD_PER_FRIEND = 100;
const MILESTONE_COUNT = 3;
const MILESTONE_BONUS = 500;

/* 헷갈리는 문자(0/O, 1/I) 제외 6자리 코드 */
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

export default function Invite() {
    const router = useRouter();
    const [state, setState] = useState({ code: '', friends: [] });
    const [toast, setToast] = useState('');

    useEffect(() => {
        let s = loadState();
        if (!s || !s.code) {
            s = { code: generateCode(), friends: [] };
            localStorage.setItem(KEY, JSON.stringify(s));
        }
        setState(s);
    }, []);

    const persist = (next) => {
        setState(next);
        localStorage.setItem(KEY, JSON.stringify(next));
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2000);
    };

    const inviteLink = `https://fulif.app/invite/${state.code}`;
    const shareText = `Fulif에서 함께 번호 만들어요! 아래 초대 링크로 가입하면 친구도 나도 +${REWARD_PER_FRIEND}P를 받아요 — ${inviteLink} (초대 코드: ${state.code})`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            showToast('초대 링크를 복사했어요');
        } catch {
            showToast('복사에 실패했어요');
        }
    };

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Fulif 초대', text: shareText, url: inviteLink });
            } catch { /* 사용자가 공유 취소 */ }
        } else {
            copyLink();
        }
    };

    /* (데모) 친구 가입 시뮬레이션 — 서버 연동 전 현황판 UX 확인용 */
    const simulateJoin = () => {
        const n = state.friends.length + 1;
        persist({
            ...state,
            friends: [...state.friends, { name: `친구${n}`, date: new Date().toISOString().slice(0, 10) }],
        });
        showToast(`친구${n} 가입 완료 · +${REWARD_PER_FRIEND}P`);
    };

    const friendCount = state.friends.length;
    const milestoneHits = Math.floor(friendCount / MILESTONE_COUNT); // 3명 단위 반복 보너스
    const milestoneProgress = friendCount % MILESTONE_COUNT;
    const totalBonus = friendCount * REWARD_PER_FRIEND + milestoneHits * MILESTONE_BONUS;

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 친구 초대</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-16">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight flex-1">친구 초대</h1>
                </div>

                {/* Hero */}
                <div className="px-6 mb-5">
                    <h2 className="text-[24px] font-extrabold tracking-tight leading-snug">
                        내 초대 링크로 친구가 가입하면<br />
                        <span className="text-[#14b8a6]">친구도 나도 +{REWARD_PER_FRIEND}P</span>
                    </h2>
                    <p className="text-t-muted text-[13px] font-medium mt-2">
                        친구가 초대 링크를 눌러 가입을 완료하는 순간 두 사람 모두에게 포인트를 드려요
                    </p>
                </div>

                {/* 초대 방법 3단계 */}
                <div className="mx-6 mb-4 grid grid-cols-3 gap-2">
                    {[
                        { icon: 'ios_share', label: '초대 링크 공유' },
                        { icon: 'person_add', label: '친구가 링크로 가입' },
                        { icon: 'toll', label: `둘 다 +${REWARD_PER_FRIEND}P 지급` },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 bg-card-gray rounded-2xl border border-themed py-4 px-2">
                            <div className="w-9 h-9 rounded-full bg-[#14b8a6]/12 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px] text-[#14b8a6]">{s.icon}</span>
                            </div>
                            <span className="text-[10px] font-bold text-t-dim">STEP {i + 1}</span>
                            <span className="text-[11px] font-bold text-t-primary text-center leading-tight">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* 내 초대 코드 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 metallic-grain" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="text-t-muted text-xs font-bold uppercase tracking-widest mb-3">내 초대 코드</div>
                        <div className="flex gap-1.5 mb-5">
                            {(state.code || '······').split('').map((ch, i) => (
                                <div key={i} className="w-11 py-3 rounded-xl bg-background border border-themed-light flex items-center justify-center text-[22px] font-extrabold text-t-primary tracking-tight">
                                    {ch}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={copyLink}
                                className="flex-1 py-3.5 rounded-xl bg-btn-secondary text-t-primary font-bold text-sm border border-themed active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                링크 복사
                            </button>
                            <button
                                onClick={share}
                                className="flex-1 py-3.5 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[18px]">share</span>
                                공유하기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 초대 현황 */}
                <div className="mx-6 bg-card-gray rounded-3xl p-6 border border-themed mb-4">
                    <div className="text-sm font-extrabold text-t-primary mb-4">초대 현황</div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-t-dim uppercase tracking-widest mb-1">가입한 친구</span>
                            <span className="text-[26px] font-extrabold tracking-tight text-t-primary">{friendCount}<span className="text-[14px] text-t-muted font-bold ml-0.5">명</span></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-t-dim uppercase tracking-widest mb-1">받은 보너스</span>
                            <span className="text-[26px] font-extrabold tracking-tight text-[#14b8a6]">{totalBonus.toLocaleString()}<span className="text-[14px] font-bold ml-0.5">P</span></span>
                        </div>
                    </div>

                    {/* 3명 단위 반복 마일스톤 */}
                    <div className={`rounded-2xl p-4 border ${milestoneHits > 0 ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' : 'bg-background border-themed'}`}>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-1.5">
                                <span className={`material-symbols-outlined text-[18px] ${milestoneHits > 0 ? 'text-[#D4AF37]' : 'text-t-muted'}`} style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                                <span className={`text-[13px] font-extrabold ${milestoneHits > 0 ? 'text-[#D4AF37]' : 'text-t-primary'}`}>
                                    {MILESTONE_COUNT}명 초대할 때마다 +{MILESTONE_BONUS.toLocaleString()}P 추가
                                </span>
                            </div>
                            <span className="text-[12px] font-bold text-t-muted">
                                {milestoneProgress}/{MILESTONE_COUNT}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-btn-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 bg-[#14b8a6]"
                                style={{ width: `${(milestoneProgress / MILESTONE_COUNT) * 100}%` }}
                            />
                        </div>
                        {milestoneHits > 0 && (
                            <div className="text-[11px] font-bold text-[#D4AF37] mt-2">
                                지금까지 보너스 {milestoneHits}회 · +{(milestoneHits * MILESTONE_BONUS).toLocaleString()}P 받았어요
                            </div>
                        )}
                    </div>
                </div>

                {/* 가입한 친구 리스트 */}
                <div className="mx-6 mb-4">
                    {friendCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 bg-card-gray rounded-3xl border border-themed">
                            <span className="material-symbols-outlined text-[40px] text-t-dim font-light mb-2">group_add</span>
                            <div className="text-sm text-t-muted font-semibold">아직 가입한 친구가 없어요</div>
                            <div className="text-xs text-t-dim font-medium mt-1">코드를 공유하고 함께 포인트를 받아보세요</div>
                        </div>
                    ) : (
                        <div className="bg-card-gray rounded-3xl border border-themed px-5 py-2">
                            {state.friends.map((f, i) => (
                                <div key={i} className="flex items-center justify-between py-3.5 border-b border-themed last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-btn-secondary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px] text-t-secondary font-light">person</span>
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-t-primary">{f.name}</div>
                                            <div className="text-[11px] text-t-dim font-medium">{f.date} 가입</div>
                                        </div>
                                    </div>
                                    <span className="text-[13px] font-extrabold text-[#14b8a6]">+{REWARD_PER_FRIEND}P</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 안내 */}
                <div className="mx-6 text-[11px] text-t-dim font-medium leading-relaxed">
                    · 친구가 초대 링크를 통해 가입하거나, 가입 시 추천인 코드를 입력하고 가입을 완료하면 두 사람 모두에게 +{REWARD_PER_FRIEND}P가 지급됩니다.<br />
                    · 보상 포인트는 지급일로부터 1년간 유효합니다.<br />
                    · 비정상적인 방법으로 초대 보상을 받은 경우 회수될 수 있습니다.
                </div>

                {/* (데모) 서버 연동 전 현황판 확인용 */}
                <button
                    onClick={simulateJoin}
                    className="mx-auto mt-6 text-[11px] text-t-faint font-medium underline underline-offset-2"
                >
                    (데모) 친구 가입 시뮬레이션
                </button>

                {/* Toast */}
                {toast && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-bg-inverse text-t-inverse text-[13px] font-bold px-5 py-3 rounded-full shadow-2xl whitespace-nowrap">
                        {toast}
                    </div>
                )}
            </div>
        </div>
    );
}
