import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const MOCK_SCANS = [
    { id: 1, number: '4821-9034-5671', draw: 1158, lottery: '로또 6/45', date: '2026-03-15', points: 50, status: 'lose' },
    { id: 2, number: '7763-2190-8842', draw: 1158, lottery: '로또 6/45', date: '2026-03-14', points: 50, status: 'lose' },
    { id: 3, number: '1155-6677-3300', draw: 1157, lottery: '로또 6/45', date: '2026-03-12', points: 75, status: 'lose' },
    { id: 4, number: '9902-3344-1128', draw: 1157, lottery: '로또 6/45', date: '2026-03-10', points: 50, status: 'lose' },
    { id: 5, number: '5566-7788-2233', draw: 1156, lottery: '로또 6/45', date: '2026-03-08', points: 50, status: 'lose' },
    { id: 6, number: '3344-1122-9988', draw: 1156, lottery: '로또 6/45', date: '2026-03-05', points: 75, status: 'lose' },
    { id: 7, number: '8877-6655-4433', draw: 1155, lottery: '로또 6/45', date: '2026-03-01', points: 50, status: 'lose' },
];

export default function ScanHistory() {
    const router = useRouter();

    const totalPoints = MOCK_SCANS.reduce((sum, s) => sum + s.points, 0);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>FULIF - 스캔 내역</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl pb-24">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-themed pt-12 pb-4 px-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary hover:text-t-primary transition-colors">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight m-0">스캔 내역</h1>
                </div>

                <div className="flex flex-col px-6 pt-6 pb-12 gap-6">

                    {/* Summary */}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-card-gray rounded-2xl p-4 border border-themed flex flex-col items-center gap-1">
                            <span className="text-2xl font-extrabold text-t-primary">{MOCK_SCANS.length}</span>
                            <span className="text-[11px] font-bold text-t-muted">총 스캔</span>
                        </div>
                        <div className="flex-1 bg-card-gray rounded-2xl p-4 border border-themed flex flex-col items-center gap-1">
                            <span className="text-2xl font-extrabold text-[#14b8a6]">+{totalPoints}</span>
                            <span className="text-[11px] font-bold text-t-muted">적립 포인트</span>
                        </div>
                    </div>

                    {/* Scan List */}
                    <div className="flex flex-col gap-3">
                        {MOCK_SCANS.map((scan) => (
                            <div key={scan.id} className="bg-card-gray rounded-2xl px-5 py-4 border border-themed flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[20px] text-t-secondary font-light">confirmation_number</span>
                                </div>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <span className="text-[14px] font-bold text-t-primary tracking-wider truncate">{scan.number}</span>
                                    <span className="text-[11px] font-medium text-t-muted">{scan.lottery} · 제{scan.draw}회 · {scan.date}</span>
                                </div>
                                <span className="text-[14px] font-bold text-[#14b8a6] shrink-0">+{scan.points}P</span>
                            </div>
                        ))}
                    </div>

                    {MOCK_SCANS.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 bg-card-gray rounded-3xl border border-themed">
                            <span className="material-symbols-outlined text-[48px] font-light text-t-dim mb-3">photo_camera</span>
                            <span className="text-t-secondary font-semibold text-sm">스캔 내역이 없어요</span>
                            <span className="text-t-dim font-medium text-xs mt-1">복권을 스캔하면 여기에 표시됩니다</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
