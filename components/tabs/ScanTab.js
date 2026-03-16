import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../contexts/UserContext';

export default function ScanTab() {
    const router = useRouter();
    const { tier, scansThisMonth, maxScansPerMonth } = useUser();
    const [torchOn, setTorchOn] = useState(false);

    const isGuest = tier === 'GUEST';
    const scansLeft = maxScansPerMonth - scansThisMonth;
    const isLimitReached = scansLeft <= 0;

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
                <h2 className="text-2xl font-extrabold text-center mb-2">이번 달 스캔 완료</h2>
                <p className="text-t-muted text-sm font-medium text-center mb-2">월 30회 스캔을 모두 사용했습니다</p>
                <p className="text-t-dim text-xs font-medium text-center mb-8">다음 달 1일에 초기화됩니다</p>
                <button
                    onClick={() => router.push('/subscription')}
                    className="w-full max-w-[280px] py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                >
                    구독하고 계속하기
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-24">
            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-6 pb-2">
                <div className="text-t-muted text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    <span className={scansLeft <= 5 ? 'text-amber-400 font-bold' : ''}>{scansThisMonth}/{maxScansPerMonth}</span>
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">Scan Ticket</h1>
                <button
                    onClick={() => router.push('/scan_history')}
                    className="text-t-muted text-xs font-semibold flex items-center gap-1 hover:text-t-primary transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    내역
                </button>
            </header>

            {/* Low scan warning */}
            {scansLeft <= 5 && scansLeft > 0 && (
                <div className="mx-6 mt-3 flex items-center gap-2 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                    <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <span className="text-xs font-semibold text-amber-500">이번 달 스캔 {scansLeft}회 남음</span>
                </div>
            )}

            {/* Scan Mode Chips */}
            <div className="flex justify-center gap-2 mt-4 px-6">
                <div className="flex bg-card-gray rounded-full p-1 gap-1">
                    <button className="px-4 py-1.5 rounded-full bg-bg-inverse text-t-inverse text-xs font-bold">카메라</button>
                    <button
                        onClick={() => router.push('/manual_entry')}
                        className="px-4 py-1.5 rounded-full text-t-muted text-xs font-semibold hover:text-t-primary transition-colors"
                    >
                        직접 입력
                    </button>
                </div>
            </div>

            {/* Main Viewfinder */}
            <section className="flex-1 flex justify-center items-center mt-6 mb-8 px-6">
                <div className="w-full max-w-[300px] h-[400px] bg-surface rounded-[32px] relative flex flex-col justify-center items-center overflow-hidden border border-themed">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#14b8a6]/10 to-transparent w-full h-[150%] animate-[scan_3s_ease-in-out_infinite]" />
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-muted-teal" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-muted-teal" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-muted-teal" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-muted-teal" />
                    <div className="flex flex-col items-center gap-3 z-10">
                        <div className="w-10 h-10 rounded-full bg-[#14b8a6]/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[22px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                        </div>
                        <p className="text-t-muted text-sm font-medium text-center max-w-[180px]">복권 티켓을 프레임 안에<br/>맞춰주세요</p>
                    </div>
                    {torchOn && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flash_on</span>ON
                        </div>
                    )}
                </div>
            </section>

            {/* Controls */}
            <section className="flex justify-center items-center gap-10 px-6">
                <button onClick={() => router.push('/scan_result')} className="size-12 rounded-full bg-card-gray flex items-center justify-center text-t-primary hover:bg-card-hover transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-[24px] font-light">collections</span>
                </button>
                <button onClick={() => router.push('/scan_result')} className="size-20 rounded-full bg-bg-inverse flex items-center justify-center shadow-[0_0_20px_var(--color-shadow)] active:scale-95 transition-transform">
                    <div className="size-[70px] rounded-full border-2 border-[var(--color-text-inverse)]" />
                </button>
                <button onClick={() => setTorchOn(p => !p)} className={`size-12 rounded-full flex items-center justify-center transition-colors active:scale-90 ${torchOn ? 'bg-amber-500/20 text-amber-400' : 'bg-card-gray text-t-primary hover:bg-card-hover'}`}>
                    <span className="material-symbols-outlined text-[24px] font-light" style={{ fontVariationSettings: torchOn ? "'FILL' 1" : "'FILL' 0" }}>flash_on</span>
                </button>
            </section>

            {/* Point preview */}
            <div className="mx-6 mt-6 bg-card-gray rounded-2xl p-4 border border-themed flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    <span className="text-xs font-semibold text-t-secondary">스캔 적립 포인트</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                    {tier === 'FREE' && <span className="text-t-primary">+50P <span className="text-t-muted font-normal text-xs">(광고 시 +25P 추가)</span></span>}
                    {tier === 'STANDARD' && <span className="text-[#14b8a6]">+75P</span>}
                    {tier === 'PRO' && <span className="text-[#D4AF37]">+100P <span className="text-t-muted font-normal text-xs">(광고 시 +100P 추가)</span></span>}
                </div>
            </div>

            {/* Duplicate check info */}
            <div className="mx-6 mt-4 flex items-start gap-2 bg-[#14b8a6]/10 rounded-2xl p-4 border border-[#14b8a6]/20">
                <span className="material-symbols-outlined text-[16px] text-[#14b8a6] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <div className="text-xs text-[#14b8a6] font-medium leading-relaxed">
                    <strong>중복 티켓 체크:</strong> 동일한 번호를 다른 사용자는 등록할 수 있지만, 한 사용자가 같은 번호를 중복으로 등록할 수 없습니다.
                </div>
            </div>

            <div className="text-center mt-4">
                <button onClick={() => router.push('/manual_entry')} className="text-t-muted text-[13px] font-medium hover:text-t-primary transition-colors">
                    번호를 직접 입력하기 &gt;
                </button>
            </div>
        </div>
    );
}
