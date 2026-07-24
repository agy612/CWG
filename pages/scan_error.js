import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const ERRORS = [
    {
        id: 'OCR_FAILED',
        label: 'OCR 실패',
        icon: 'photo_camera',
        color: '#F59E0B',
        title: '번호를 인식하지 못했어요',
        desc: '다시 촬영하거나 수동으로\n입력해주세요',
        actions: [{ label: '재촬영', primary: true }, { label: '수동 입력', primary: false }],
    },
    {
        id: 'DUPLICATE_TICKET',
        label: '중복 티켓',
        icon: 'content_copy',
        color: '#F59E0B',
        title: '이미 등록된 티켓이에요',
        desc: '이 복권은 이미 등록되어\n포인트를 받았어요',
        detail: '등록일: 2026-02-15  ·  획득 포인트: +50P',
        actions: [{ label: '확인', primary: true }],
    },
    {
        id: 'NOT_LOSING_TICKET',
        label: '당첨 티켓',
        icon: 'emoji_events',
        color: '#D4AF37',
        title: '축하합니다! 당첨 티켓이에요',
        desc: '이 티켓은 당첨 티켓이라\n등록 대상이 아니에요',
        detail: '당첨번호: 3 · 7 · 14 · 24 · 37 · 41  ·  일치: 3개',
        actions: [{ label: '확인', primary: true }],
    },
    {
        id: 'DRAW_NOT_YET',
        label: '추첨 전',
        icon: 'schedule',
        color: '#71717A',
        title: '아직 추첨 전이에요',
        desc: '제1159회는 아직 추첨 결과가\n나오지 않았어요',
        detail: '추첨일: 2026-03-01 (토)',
        actions: [{ label: '확인', primary: true }],
    },
    {
        id: 'DAILY_LIMIT_EXCEEDED',
        label: '한도 초과',
        icon: 'block',
        color: '#EF4444',
        title: '오늘 스캔 한도를 초과했어요',
        desc: '오늘 스캔 한도(30회)를\n모두 사용했어요',
        detail: '내일 다시 스캔해주세요!',
        actions: [{ label: '확인', primary: true }],
    },
    {
        id: 'ACCOUNT_LOCKED',
        label: '계정 잠금',
        icon: 'lock',
        color: '#EF4444',
        title: '계정 이용이 제한됐어요',
        desc: '비정상 활동이 감지되어\n24시간 이용이 제한돼요',
        detail: '제한 해제: 2026-02-26 10:00',
        actions: [{ label: '문의하기', primary: false }, { label: '확인', primary: true }],
    },
];

function ErrorPopup({ err, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 max-w-[430px] mx-auto">
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-[340px] bg-card-gray rounded-[28px] border border-themed-light shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">

                {/* Glow */}
                <div
                    className="absolute top-0 right-0 w-48 h-48 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
                    style={{ backgroundColor: `${err.color}20` }}
                />

                {/* Header */}
                <div className="flex justify-between items-center px-5 pt-5 pb-4 border-b border-themed">
                    <span className="text-t-primary text-sm font-extrabold flex items-center gap-1.5">
                        <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ color: err.color, fontVariationSettings: "'FILL' 1" }}
                        >
                            {err.icon}
                        </span>
                        {err.label}
                    </span>
                    <button onClick={onClose}>
                        <span className="material-symbols-outlined text-[22px] text-t-muted hover:text-t-primary transition-colors">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center px-6 py-6 gap-5">
                    <div
                        className="size-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${err.color}20` }}
                    >
                        <span
                            className="material-symbols-outlined text-[32px]"
                            style={{ color: err.color, fontVariationSettings: "'FILL' 1" }}
                        >
                            {err.icon}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-center">
                        <h2 className="text-lg font-extrabold text-t-primary">{err.title}</h2>
                        <p className="text-sm font-medium text-t-muted whitespace-pre-line leading-relaxed">{err.desc}</p>
                    </div>

                    {err.detail && (
                        <div
                            className="w-full rounded-xl px-4 py-3 text-center border"
                            style={{ backgroundColor: `${err.color}10`, borderColor: `${err.color}30` }}
                        >
                            <span className="text-sm font-semibold" style={{ color: err.color }}>{err.detail}</span>
                        </div>
                    )}

                    <div className="w-full flex gap-3">
                        {err.actions.map(action => (
                            <button
                                key={action.label}
                                onClick={onClose}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm active:scale-95 transition-all ${
                                    action.primary
                                        ? 'bg-bg-inverse text-t-inverse'
                                        : 'bg-btn-secondary text-btn-secondary-text border border-themed'
                                }`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-900 rounded-xl px-3 py-1.5 border border-themed">
                        <span className="material-symbols-outlined text-[12px] text-t-dim">code</span>
                        <span className="text-t-dim font-mono text-[11px]">{err.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ScanError() {
    const router = useRouter();
    const [activeErr, setActiveErr] = useState(null);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG Dev - 스캔 에러 상태</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-4 px-6 flex items-center gap-4 border-b border-themed">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-extrabold">스캔 에러 상태</h1>
                        <p className="text-t-dim text-xs font-medium">Dev Preview · 6가지 상태</p>
                    </div>
                </div>

                {/* Error Cards */}
                <div className="flex flex-col px-6 pt-6 pb-16 gap-3">
                    {ERRORS.map(err => (
                        <button
                            key={err.id}
                            onClick={() => setActiveErr(err)}
                            className="w-full bg-card-gray rounded-2xl p-5 border border-themed flex items-center gap-4 active:opacity-70 transition-opacity text-left"
                        >
                            <div
                                className="size-12 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${err.color}20` }}
                            >
                                <span
                                    className="material-symbols-outlined text-[24px]"
                                    style={{ color: err.color, fontVariationSettings: "'FILL' 1" }}
                                >
                                    {err.icon}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-t-primary">{err.label}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-btn-secondary text-t-muted font-mono">{err.id}</span>
                                </div>
                                <span className="text-xs text-t-muted font-medium truncate">{err.title}</span>
                            </div>
                            <span className="material-symbols-outlined text-[20px] text-t-dim flex-shrink-0">chevron_right</span>
                        </button>
                    ))}
                </div>
            </div>

            {activeErr && (
                <ErrorPopup
                    key={activeErr.id}
                    err={activeErr}
                    onClose={() => setActiveErr(null)}
                />
            )}
        </div>
    );
}
