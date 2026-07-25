import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const TABS = ['전체', '적립', '사용'];

const TRANSACTIONS = [
    { id: 1, type: 'earn', icon: 'photo_camera', label: '낙첨 티켓 스캔', sub: '제1159회 · 로또6/45', amount: +75, date: '2026-02-28', tag: '스캔' },
    { id: 2, type: 'earn', icon: 'smart_display', label: '광고 보너스', sub: '스캔 보너스 광고 시청', amount: +25, date: '2026-02-28', tag: '보너스' },
    { id: 3, type: 'use', icon: 'emoji_events', label: '럭키이벤트 번호 생성', sub: '제1159회 · 트렌드 전략', amount: -100, date: '2026-02-27', tag: '럭키이벤트' },
    { id: 4, type: 'earn', icon: 'photo_camera', label: '낙첨 티켓 스캔', sub: '제1158회 · 로또6/45', amount: +75, date: '2026-02-21', tag: '스캔' },
    { id: 5, type: 'use', icon: 'lock_open', label: 'CWG 픽 열람', sub: '제1158회 · 10세트 열람', amount: -200, date: '2026-02-21', tag: '픽생성' },
    { id: 6, type: 'earn', icon: 'photo_camera', label: '낙첨 티켓 스캔', sub: '제1157회 · 로또6/45', amount: +75, date: '2026-02-14', tag: '스캔' },
    { id: 7, type: 'use', icon: 'emoji_events', label: '럭키이벤트 번호 생성', sub: '제1157회 · 수학 전략', amount: -100, date: '2026-02-14', tag: '럭키이벤트' },
    { id: 8, type: 'earn', icon: 'card_giftcard', label: '쿠폰 사용 적립', sub: 'WELCOME100 · 신규 가입 쿠폰', amount: +100, date: '2026-02-10', tag: '쿠폰' },
    { id: 9, type: 'earn', icon: 'celebration', label: '회원가입 보너스', sub: '첫 가입 환영 포인트', amount: +100, date: '2026-01-15', tag: '보너스' },
    { id: 10, type: 'earn', icon: 'photo_camera', label: '낙첨 티켓 스캔', sub: '제1155회 · 로또6/45', amount: +50, date: '2026-01-25', tag: '스캔' },
];

const TAG_COLOR = (tag) => {
    const map = {
        '스캔': 'bg-accent-soft text-accent',
        '보너스': 'bg-amber-500/15 text-amber-400',
        '럭키이벤트': 'bg-purple-500/15 text-purple-400',
        '픽생성': 'bg-blue-500/15 text-blue-400',
        '쿠폰': 'bg-green-500/15 text-green-400',
    };
    return map[tag] || 'bg-btn-secondary text-t-secondary';
};

export default function PointHistory() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('전체');

    const filtered = TRANSACTIONS.filter(t => {
        if (activeTab === '적립') return t.type === 'earn';
        if (activeTab === '사용') return t.type === 'use';
        return true;
    });

    const totalBalance = 1250;
    const totalEarned = TRANSACTIONS.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
    const totalUsed = Math.abs(TRANSACTIONS.filter(t => t.type === 'use').reduce((s, t) => s + t.amount, 0));

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 포인트 내역</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">포인트 내역</h1>
                </div>

                {/* Balance Card */}
                <div className="mx-6 mb-6 bg-card-gray rounded-3xl p-6 border border-themed">
                    <div className="text-t-muted text-sm font-semibold mb-1">현재 포인트</div>
                    <div className="text-4xl font-extrabold tracking-tight text-t-primary mb-4">{totalBalance.toLocaleString()} P</div>
                    <div className="flex gap-0 border-t border-themed pt-4">
                        <div className="flex-1 flex flex-col gap-0.5">
                            <div className="text-[11px] font-bold text-t-dim uppercase tracking-widest">총 적립</div>
                            <div className="text-lg font-bold text-accent">+{totalEarned.toLocaleString()} P</div>
                        </div>
                        <div className="w-px bg-themed" />
                        <div className="flex-1 flex flex-col gap-0.5 pl-4">
                            <div className="text-[11px] font-bold text-t-dim uppercase tracking-widest">총 사용</div>
                            <div className="text-lg font-bold text-t-secondary">-{totalUsed.toLocaleString()} P</div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mx-6 mb-4 flex bg-card-gray rounded-2xl p-1 border border-themed">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab ? 'bg-accent text-accent-fg' : 'text-t-muted'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Transaction List */}
                <div className="px-6 flex flex-col">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <span className="material-symbols-outlined text-[48px] text-t-faint">receipt_long</span>
                            <p className="text-t-dim text-sm font-semibold">내역이 없습니다</p>
                        </div>
                    ) : (
                        filtered.map((t, idx) => (
                            <div key={t.id} className={`flex items-center gap-4 py-4 ${idx < filtered.length - 1 ? 'border-b border-themed' : ''}`}>
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    t.type === 'earn' ? 'bg-accent-soft' : 'bg-btn-secondary'
                                }`}>
                                    <span className={`material-symbols-outlined text-[20px] font-light ${
                                        t.type === 'earn' ? 'text-accent' : 'text-t-secondary'
                                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {t.icon}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-t-primary truncate">{t.label}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${TAG_COLOR(t.tag)}`}>{t.tag}</span>
                                    </div>
                                    <div className="text-xs text-t-dim font-medium truncate">{t.sub}</div>
                                    <div className="text-[10px] text-t-faint font-medium mt-0.5">{t.date}</div>
                                </div>

                                {/* Amount */}
                                <div className={`text-base font-extrabold flex-shrink-0 ${t.amount > 0 ? 'text-accent' : 'text-t-secondary'}`}>
                                    {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}P
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Point Expiry Notice */}
                <div className="mx-6 mt-8 mb-6 flex items-start gap-2 bg-btn-secondary/30 rounded-2xl p-4 border border-themed">
                    <span className="material-symbols-outlined text-[16px] text-t-muted mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <span className="text-[11px] text-t-muted font-medium leading-relaxed">포인트는 마지막 획득일로부터 12개월 후 소멸됩니다. 현금으로 환전되지 않습니다.</span>
                </div>
            </div>
        </div>
    );
}
