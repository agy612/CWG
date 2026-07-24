import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import PlanPicker, { PRICE, won } from '../components/PlanPicker';

const GOLD         = 'var(--color-gold)';
const GOLD_FG      = 'var(--color-gold-fg)';
const GOLD_SOFT    = 'var(--color-gold-soft)';
const GOLD_BORDER  = 'var(--color-gold-border)';
const GOLD_CARD_BG = 'var(--color-gold-card-bg)';

const SOURCE_LABEL = {
    SHOP:     { label: '포인트샵', icon: 'store',                color: '#14b8a6' },
    COUPON:   { label: '쿠폰',     icon: 'confirmation_number',  color: '#a78bfa' },
    STORE:    { label: '스토어',   icon: 'shopping_bag',         color: '#f59e0b' },
    PROMO:    { label: '프로모션', icon: 'campaign',             color: '#60a5fa' },
};

/* mock: 보유 구독권/할인권 */
const INITIAL_TICKETS = [
    { id: 't1', kind: 'PLAN',     plan: 'PRO',      duration: '1개월', source: 'SHOP',   acquiredAt: '2026-05-12', expiresAt: '2026-08-12' },
    { id: 't2', kind: 'PLAN',     plan: 'STANDARD', duration: '1개월', source: 'COUPON', acquiredAt: '2026-05-20', expiresAt: '2026-07-20' },
    { id: 't3', kind: 'PLAN',     plan: 'STANDARD', duration: '3개월', source: 'STORE',  acquiredAt: '2026-04-30', expiresAt: '2026-10-30' },
    { id: 't4', kind: 'DISCOUNT', plan: null,       rate: 20,         source: 'PROMO',  acquiredAt: '2026-05-25', expiresAt: '2026-06-30' },
    { id: 't5', kind: 'DISCOUNT', plan: null,       rate: 10,         source: 'COUPON', acquiredAt: '2026-05-01', expiresAt: '2026-06-15' },
];

/* mock: 이력 */
const HISTORY = [
    { id: 'h1', type: 'PURCHASE', label: 'PRO 구독 1개월 결제', amount: 8000, date: '2026-05-12', meta: '카드 결제' },
    { id: 'h2', type: 'APPLY',    label: 'Standard 1개월 적용', amount: null, date: '2026-04-10', meta: '쿠폰 사용' },
    { id: 'h3', type: 'EXPIRE',   label: 'Standard 1개월 만료', amount: null, date: '2026-03-15', meta: '자동 만료' },
    { id: 'h4', type: 'PURCHASE', label: 'Standard 구독 1개월 결제', amount: 5000, date: '2026-02-15', meta: '카드 결제' },
];

const TABS = [
    { id: 'CURRENT', label: '현재 구독' },
    { id: 'OWNED',   label: '보유 구독권' },
    { id: 'HISTORY', label: '이력' },
];

export default function MySubscription() {
    const router = useRouter();
    const { tier, subscriptionPlan, subscriptionExpiry } = useUser();

    const [activeTab, setActiveTab] = useState('CURRENT');
    const [tickets, setTickets] = useState(INITIAL_TICKETS);
    const [confirmTicket, setConfirmTicket] = useState(null); // ticket pending apply
    const [detailTicket, setDetailTicket]   = useState(null); // ticket for detail sheet
    const [toast, setToast] = useState(null);

    /* 할인권 사용 시 선택값 */
    const [discPlan, setDiscPlan]       = useState('PRO');
    const [discBilling, setDiscBilling] = useState('monthly');

    const isPro    = tier === 'PRO';
    const isStd    = tier === 'STANDARD';
    const isActive = isPro || isStd;
    const nextBillingDate = subscriptionExpiry || '—';

    const planTickets     = useMemo(() => tickets.filter(t => t.kind === 'PLAN'),     [tickets]);
    const discountTickets = useMemo(() => tickets.filter(t => t.kind === 'DISCOUNT'), [tickets]);

    const showToast = (text) => {
        setToast(text);
        setTimeout(() => setToast(null), 1800);
    };

    const handleApply = (ticket) => {
        setTickets(prev => prev.filter(t => t.id !== ticket.id));
        setConfirmTicket(null);
        if (ticket.kind === 'PLAN') {
            showToast(`${ticket.plan} ${ticket.duration} 적용 완료`);
        }
    };

    const handleApplyDiscount = (ticket) => {
        const base = PRICE[discPlan][discBilling];
        const final = Math.round(base * (1 - ticket.rate / 100));
        setTickets(prev => prev.filter(t => t.id !== ticket.id));
        setConfirmTicket(null);
        showToast(`${discPlan} ${discBilling === 'monthly' ? '월간' : '연간'} ${won(final)} 결제 완료`);
    };

    /* 할인권 시트 열 때마다 기본값(PRO·월간)으로 초기화 */
    const openConfirmTicket = (ticket) => {
        if (ticket.kind === 'DISCOUNT') {
            setDiscPlan('PRO');
            setDiscBilling('monthly');
        }
        setConfirmTicket(ticket);
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 내 구독</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">

                {/* Header */}
                <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight">내 구독</h1>
                </div>

                {/* Tabs */}
                <div className="flex px-6 mt-2 gap-6 border-b border-themed">
                    {TABS.map(tab => {
                        const isOn = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-[14px] font-bold transition-all relative ${isOn ? 'text-t-primary' : 'text-t-dim'}`}
                            >
                                {tab.label}
                                {tab.id === 'OWNED' && tickets.length > 0 && (
                                    <span className={`ml-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isOn ? 'bg-bg-inverse text-t-inverse' : 'bg-btn-secondary text-t-muted'}`}>
                                        {tickets.length}
                                    </span>
                                )}
                                {isOn && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* === 현재 구독 === */}
                {activeTab === 'CURRENT' && (
                    <div className="pt-4">
                        {/* 구독 중인 사용자에겐 간단한 현재 구독 정보 카드 + 액션 라인 */}
                        {isActive && (
                            <div className="px-6 mb-2 flex flex-col gap-2">
                                <div
                                    className={`p-4 rounded-2xl border flex items-center gap-3 ${isPro ? '' : 'bg-card-gray border-themed-light'}`}
                                    style={isPro ? { background: GOLD_CARD_BG, borderColor: GOLD_BORDER } : undefined}
                                >
                                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1", color: isPro ? GOLD : 'var(--color-text)' }}>workspace_premium</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-extrabold" style={isPro ? { color: GOLD } : undefined}>
                                            {isPro ? 'PRO' : 'Standard'} 구독 중
                                        </div>
                                        <div className="text-[11px] text-t-muted font-medium">다음 결제일: {nextBillingDate}</div>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('OWNED')}
                                        className="text-[11px] font-bold text-t-secondary underline underline-offset-2 active:opacity-60"
                                    >
                                        보유 구독권 {tickets.length}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 핵심: 업그레이드 안내 + 플랜 피커 */}
                        <PlanPicker
                            tier={tier}
                            nextBillingDate={nextBillingDate}
                            embedded
                            onManageClick={() => setActiveTab('OWNED')}
                        />

                        {/* 구독자 전용 하단 액션 (해지) */}
                        {isActive && (
                            <div className="px-6 mt-6">
                                <button
                                    onClick={() => showToast('해지 플로우는 결제 페이지에서 진행됩니다')}
                                    className="w-full flex items-center justify-between p-4 bg-card-gray rounded-2xl border border-themed active:opacity-80 transition-opacity"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[20px] text-t-muted">cancel</span>
                                        <span className="text-sm font-semibold text-t-secondary">구독 해지</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[18px] text-t-dim">chevron_right</span>
                                </button>
                                <p className="mt-3 text-xs text-t-dim font-medium text-center">
                                    해지 즉시 혜택이 종료됩니다. 적립 포인트는 유지됩니다.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* === 보유 구독권 === */}
                {activeTab === 'OWNED' && (
                    <div className="px-6 pt-6 flex flex-col gap-6">
                        {/* PLAN 구독권 */}
                        <section className="flex flex-col gap-3">
                            <h2 className="text-[13px] font-bold text-t-muted uppercase tracking-widest pl-1">구독권 {planTickets.length}개</h2>
                            {planTickets.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-card-gray border border-themed text-center text-xs text-t-dim font-medium">
                                    보유한 구독권이 없어요
                                </div>
                            ) : planTickets.map(t => {
                                const isPlanPro = t.plan === 'PRO';
                                const src = SOURCE_LABEL[t.source];
                                return (
                                    <div
                                        key={t.id}
                                        className="p-5 rounded-2xl border bg-card-gray flex flex-col gap-3"
                                        style={isPlanPro ? { borderColor: GOLD_BORDER, background: GOLD_CARD_BG } : { borderColor: 'var(--color-border)' }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 rounded-xl flex items-center justify-center" style={isPlanPro ? { background: GOLD_SOFT } : { background: 'var(--color-btn-secondary)' }}>
                                                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1", color: isPlanPro ? GOLD : 'var(--color-text)' }}>workspace_premium</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-extrabold" style={isPlanPro ? { color: GOLD } : undefined}>{t.plan}</span>
                                                        <span className="text-xs font-bold text-t-secondary">{t.duration}</span>
                                                    </div>
                                                    <div className="text-[11px] text-t-muted font-medium mt-0.5">~{t.expiresAt} 까지 사용</div>
                                                </div>
                                            </div>
                                            <span
                                                className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                                                style={{ background: `${src.color}1a`, color: src.color }}
                                            >
                                                <span className="material-symbols-outlined text-[12px]">{src.icon}</span>
                                                {src.label}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setDetailTicket(t)}
                                                className="flex-1 py-2.5 rounded-lg bg-btn-secondary text-btn-secondary-text font-bold text-xs border border-themed active:scale-95 transition-all"
                                            >
                                                상세
                                            </button>
                                            <button
                                                onClick={() => openConfirmTicket(t)}
                                                className="flex-1 py-2.5 rounded-lg font-extrabold text-xs active:scale-95 transition-all"
                                                style={isPlanPro
                                                    ? { background: GOLD, color: GOLD_FG }
                                                    : { background: 'var(--color-bg-inverse)', color: 'var(--color-text-inverse)' }}
                                            >
                                                사용하기
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        {/* DISCOUNT 할인권 */}
                        <section className="flex flex-col gap-3">
                            <h2 className="text-[13px] font-bold text-t-muted uppercase tracking-widest pl-1">할인권 {discountTickets.length}개</h2>
                            {discountTickets.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-card-gray border border-themed text-center text-xs text-t-dim font-medium">
                                    보유한 할인권이 없어요
                                </div>
                            ) : discountTickets.map(t => {
                                const src = SOURCE_LABEL[t.source];
                                return (
                                    <div key={t.id} className="p-5 rounded-2xl bg-card-gray border border-themed flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-11 rounded-xl flex items-center justify-center bg-[#14b8a6]/15">
                                                <span className="material-symbols-outlined text-[22px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="text-base font-extrabold text-t-primary">{t.rate}% 할인</div>
                                                <div className="text-[11px] text-t-muted font-medium mt-0.5">구독 결제 시 · ~{t.expiresAt}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: `${src.color}1a`, color: src.color }}>
                                                <span className="material-symbols-outlined text-[12px]">{src.icon}</span>
                                                {src.label}
                                            </span>
                                            <button
                                                onClick={() => openConfirmTicket(t)}
                                                className="px-3 py-1.5 rounded-lg bg-bg-inverse text-t-inverse font-bold text-xs active:scale-95 transition-all"
                                            >
                                                사용
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        <div className="flex flex-col gap-2 mt-2">
                            <button onClick={() => router.push('/point_shop')} className="text-xs text-t-muted font-semibold underline underline-offset-2 active:opacity-60">
                                포인트샵에서 더 보기
                            </button>
                            <button onClick={() => router.push('/coupon_wallet')} className="text-xs text-t-muted font-semibold underline underline-offset-2 active:opacity-60">
                                쿠폰함 열기
                            </button>
                        </div>
                    </div>
                )}

                {/* === 이력 === */}
                {activeTab === 'HISTORY' && (
                    <div className="px-6 pt-6 flex flex-col gap-3">
                        {HISTORY.map(h => {
                            const meta = h.type === 'PURCHASE'
                                ? { icon: 'shopping_cart', color: '#14b8a6', tag: '결제' }
                                : h.type === 'APPLY'
                                ? { icon: 'check_circle', color: '#a78bfa', tag: '적용' }
                                : { icon: 'event_busy',  color: '#f87171', tag: '만료' };
                            return (
                                <div key={h.id} className="p-4 rounded-2xl bg-card-gray border border-themed flex items-center gap-3">
                                    <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}1a` }}>
                                        <span className="material-symbols-outlined text-[20px]" style={{ color: meta.color }}>{meta.icon}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-t-primary">{h.label}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${meta.color}1a`, color: meta.color }}>{meta.tag}</span>
                                        </div>
                                        <div className="text-[11px] text-t-muted font-medium mt-0.5">{h.date} · {h.meta}</div>
                                    </div>
                                    {h.amount != null && (
                                        <div className="text-sm font-extrabold text-t-primary">₩{h.amount.toLocaleString('ko-KR')}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 적용 확인 시트 */}
                {confirmTicket && confirmTicket.kind === 'PLAN' && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setConfirmTicket(null)} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                            <h3 className="text-lg font-extrabold text-center mb-2">
                                {confirmTicket.plan} {confirmTicket.duration} 적용
                            </h3>
                            <p className="text-t-muted text-sm font-medium text-center mb-6">
                                {isActive ? '현재 구독 종료 후 자동으로 이어집니다.' : '즉시 구독이 시작됩니다.'}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmTicket(null)} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                                <button onClick={() => handleApply(confirmTicket)} className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all">
                                    사용하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 할인권 사용 시트 — 플랜/주기 즉시 선택 후 결제 */}
                {confirmTicket && confirmTicket.kind === 'DISCOUNT' && (() => {
                    const base   = PRICE[discPlan][discBilling];
                    const final  = Math.round(base * (1 - confirmTicket.rate / 100));
                    const saving = base - final;
                    return (
                        <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setConfirmTicket(null)} />
                            <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                                <h3 className="text-lg font-extrabold text-center mb-1">{confirmTicket.rate}% 할인 적용</h3>
                                <p className="text-t-muted text-xs font-medium text-center mb-5">플랜과 결제 주기를 선택하세요</p>

                                {/* 플랜 선택 */}
                                <div className="flex gap-2 mb-3">
                                    {['STANDARD', 'PRO'].map(p => {
                                        const on = discPlan === p;
                                        const proGold = p === 'PRO';
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setDiscPlan(p)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-extrabold border transition-all ${
                                                    on ? '' : 'bg-background border-themed text-t-muted'
                                                }`}
                                                style={on
                                                    ? proGold
                                                        ? { background: GOLD, color: GOLD_FG, borderColor: GOLD }
                                                        : { background: 'var(--color-bg-inverse)', color: 'var(--color-text-inverse)', borderColor: 'var(--color-bg-inverse)' }
                                                    : undefined}
                                            >
                                                {p === 'PRO' ? 'PRO' : 'Standard'}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 주기 선택 */}
                                <div className="flex bg-background rounded-xl p-1 border border-themed mb-5">
                                    {[['monthly', '월간'], ['yearly', '연간 -20%']].map(([k, label]) => {
                                        const on = discBilling === k;
                                        return (
                                            <button
                                                key={k}
                                                onClick={() => setDiscBilling(k)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                                    on ? 'bg-bg-inverse text-t-inverse shadow-sm' : 'text-t-muted'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* 가격 박스 */}
                                <div className="p-4 rounded-xl bg-background border border-themed mb-5">
                                    <div className="flex justify-between items-center text-xs text-t-muted font-medium">
                                        <span>정가</span>
                                        <span className="line-through">{won(base)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold mt-1" style={{ color: '#14b8a6' }}>
                                        <span>{confirmTicket.rate}% 할인</span>
                                        <span>-{won(saving)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-themed">
                                        <span className="text-sm font-bold text-t-primary">결제 금액</span>
                                        <span className="text-xl font-extrabold text-t-primary">{won(final)}<span className="text-xs text-t-muted font-medium ml-1">/{discBilling === 'monthly' ? '월' : '년'}</span></span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setConfirmTicket(null)} className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed">취소</button>
                                    <button
                                        onClick={() => handleApplyDiscount(confirmTicket)}
                                        className="flex-1 py-4 rounded-xl font-extrabold text-sm active:scale-95 transition-all"
                                        style={discPlan === 'PRO'
                                            ? { background: GOLD, color: GOLD_FG }
                                            : { background: 'var(--color-bg-inverse)', color: 'var(--color-text-inverse)' }}
                                    >
                                        결제하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* 상세 시트 */}
                {detailTicket && (
                    <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setDetailTicket(null)} />
                        <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                            <h3 className="text-lg font-extrabold text-center mb-4">구독권 상세</h3>
                            <div className="flex flex-col gap-2 text-sm">
                                <Row k="플랜"     v={`${detailTicket.plan} · ${detailTicket.duration}`} />
                                <Row k="획득 경로" v={SOURCE_LABEL[detailTicket.source].label} />
                                <Row k="획득일"   v={detailTicket.acquiredAt} />
                                <Row k="사용 만료" v={detailTicket.expiresAt} />
                            </div>
                            <button onClick={() => setDetailTicket(null)} className="w-full mt-6 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm border border-themed active:scale-95 transition-all">
                                닫기
                            </button>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-bg-inverse text-t-inverse text-sm font-bold px-5 py-3 rounded-full shadow-2xl">
                        {toast}
                    </div>
                )}
            </div>
        </div>
    );
}

function Row({ k, v }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-themed last:border-0">
            <span className="text-t-muted font-medium">{k}</span>
            <span className="text-t-primary font-bold">{v}</span>
        </div>
    );
}
