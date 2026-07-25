import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../../contexts/UserContext';
import TabHeader from './TabHeader';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const SUB_WEIGHT = { GUEST: 1.0, FREE: 1.0, STANDARD: 1.5, PRO: 2.0 };

const LUCKY_WEIGHT_FROM_SCORE = (score) => {
    if (score >= 90) return 2.0;
    if (score >= 70) return 1.5;
    if (score >= 50) return 1.2;
    return 1.0;
};

/* 등수 배지 색 (라이트) */
const RANK_STYLE = (rank) => {
    if (rank === 1) return { bg: '#FFF3D6', fg: '#D69500' };
    if (rank === 2) return { bg: '#EEF1F4', fg: '#8B95A1' };
    if (rank === 3) return { bg: '#F9EBDD', fg: '#C77B3C' };
    return { bg: 'var(--color-btn-secondary)', fg: 'var(--color-text-secondary)' };
};

/* 경품명 → 데모 썸네일 이미지 + 후원 브랜드 (실제 서비스에선 경품별 이미지/후원사 지정) */
const PRIZE_INFO = (name = '') => {
    if (/iphone|아이폰/i.test(name))       return { img: '/prizes/phone.svg',  brand: 'Apple' };
    if (/갤럭시/i.test(name))               return { img: '/prizes/phone.svg',  brand: 'Samsung' };
    if (/메가/i.test(name))                 return { img: '/prizes/coffee.svg', brand: '메가커피' };
    if (/스타벅스/i.test(name))             return { img: '/prizes/coffee.svg', brand: '스타벅스' };
    if (/커피|아메리카노/i.test(name))       return { img: '/prizes/coffee.svg', brand: '카페' };
    if (/포인트|point/i.test(name))         return { img: '/prizes/coin.svg',   brand: 'FULIF' };
    if (/기프티콘|상품권|쿠폰/i.test(name))  return { img: '/prizes/voucher.svg', brand: '기프티콘' };
    return { img: '/prizes/gift.svg', brand: '후원사' };
};

const CURRENT_DRAW = {
    drawNo: 15,
    lottery: '로또6/45',
    targetRound: 1158,
    targetDate: '2026-02-22',
    registerFrom: '2026-02-22 21:00',
    registerTo: '2026-02-25 20:00',
    drawDate: '2026-02-25 20:30',
};

const PRIZES = [
    { rank: 1, count: 1,    name: 'iPhone 16 Pro 256GB' },
    { rank: 2, count: 5,    name: '30만 포인트' },
    { rank: 3, count: 50,   name: '10만 포인트' },
    { rank: 4, count: 200,  name: '3만 포인트' },
    { rank: 5, count: 1000, name: '5천 포인트' },
];

const MY_TICKETS = [
    { id: 1, round: 1158, scanDate: '2026-02-26 19:32', nums: [3, 11, 19, 27, 35, 44], luckyScore: 87 },
    { id: 2, round: 1158, scanDate: '2026-02-25 12:10', nums: [7, 14, 22, 31, 38, 43], luckyScore: 92 },
    { id: 3, round: 1158, scanDate: '2026-02-24 08:45', nums: [5, 12, 21, 29, 37, 42], luckyScore: 65 },
    { id: 4, round: 1158, scanDate: '2026-02-23 21:18', nums: [2,  9, 18, 26, 34, 41], luckyScore: 71 },
];

const PAST_DRAWS = [
    {
        drawNo: 14, drawDate: '2026-02-23', targetRound: 1157,
        myResult: 'WON1', myPrize: 'iPhone 16 Pro 256GB',
        myEntries: 4, mySubTier: 'STANDARD', mySubWeight: 1.5, myLuckyScore: 92, myLuckyWeight: 2.0,
        prizes: PRIZES,
    },
    {
        drawNo: 13, drawDate: '2026-02-16', targetRound: 1156,
        myResult: 'WON3', myPrize: '메가커피 아메리카노 1잔',
        myEntries: 5, mySubTier: 'STANDARD', mySubWeight: 1.5, myLuckyScore: 88, myLuckyWeight: 1.5,
        prizes: [
            { rank: 1, count: 1,    name: 'iPhone 16 Pro 256GB' },
            { rank: 2, count: 5,    name: '30만 포인트' },
            { rank: 3, count: 50,   name: '메가커피 아메리카노 1잔' },
            { rank: 4, count: 200,  name: '3만 포인트' },
            { rank: 5, count: 1000, name: '5천 포인트' },
        ],
    },
    {
        drawNo: 12, drawDate: '2026-02-09', targetRound: 1155,
        myResult: 'MISS', myPrize: null,
        myEntries: 2, mySubTier: 'FREE', mySubWeight: 1.0, myLuckyScore: 45, myLuckyWeight: 1.0,
        prizes: PRIZES,
    },
    {
        drawNo: 11, drawDate: '2026-02-02', targetRound: 1154,
        myResult: 'WON5', myPrize: '5천 포인트',
        myEntries: 4, mySubTier: 'FREE', mySubWeight: 1.0, myLuckyScore: 71, myLuckyWeight: 1.5,
        prizes: PRIZES,
    },
];

function fmtDate(s) { return s.replace(/-/g, '.'); }

/**
 * PrizeDrawView — 경품추첨 화면 본문.
 *
 * embedded=false (기본, /prize_draw 라우트): 자체 sticky 헤더(뒤로가기 + 제목)를 렌더.
 * embedded=true (스캔·경품 탭 내부): 상위 래퍼가 세그먼트 토글을 제공하므로
 *   뒤로가기/제목 헤더는 생략하고 안내(info) 버튼만 우측에 노출.
 */
export default function PrizeDrawView({ embedded = false, onScan }) {
    const router = useRouter();
    const { tier } = useUser();
    const [tab, setTab] = useState('ACTIVE'); // 'ACTIVE' | 'DONE'
    const [expanded, setExpanded] = useState({});
    const [showInfo, setShowInfo] = useState(false);
    const [showMyTickets, setShowMyTickets] = useState(false);
    const toggle = (drawNo) => setExpanded(e => ({ ...e, [drawNo]: !e[drawNo] }));

    const InfoButton = (
        <button
            onClick={() => setShowInfo(true)}
            aria-label="응모 안내"
            className="pressable inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray text-t-secondary"
            style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}
        >
            <span className="material-symbols-outlined text-[15px]">help</span>
            <span className="text-[12px] font-bold whitespace-nowrap">응모 안내</span>
        </button>
    );

    return (
        <div className={embedded ? (onScan ? 'pb-40' : '') : 'pb-24'}>
            {!embedded && <Head><title>경품추첨</title></Head>}

            {/* Header */}
            {embedded ? (
                <TabHeader
                    title="경품추첨"
                    subtitle="낙첨복권으로 경품 응모 · 로또6/45 제1158회"
                    action={InfoButton}
                />
            ) : (
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                        </button>
                        <h1 className="text-[17px] font-bold tracking-tight m-0">경품추첨</h1>
                    </div>
                    {InfoButton}
                </div>
            )}

            {/* Segment toggle (진행중 / 완료) — 토스식 세그먼트 */}
            <div className="mx-6 mt-3 flex gap-1 p-1 bg-card-gray rounded-2xl">
                {[
                    { key: 'ACTIVE', label: '진행중' },
                    { key: 'DONE',   label: '완료' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${
                            tab === t.key ? 'bg-background text-t-primary' : 'text-t-muted'
                        }`}
                        style={tab === t.key ? { boxShadow: '0 2px 6px var(--color-shadow)' } : undefined}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'ACTIVE' ? (
                <>
                    {/* 이번 회차 히어로 — 회차 + 진행 상태 + 1등 경품 하이라이트 */}
                    <section className="mx-6 mt-4">
                        <div className="bg-card-gray rounded-[24px] p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[19px] font-bold text-t-primary">제{CURRENT_DRAW.drawNo}회 경품추첨</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-positive-soft text-positive">
                                    <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                                    진행중
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <svg width="18" height="13" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
                                    <rect width="22" height="16" rx="2" fill="#003DA5" />
                                    <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Pretendard,Inter,sans-serif">KR</text>
                                </svg>
                                <span className="text-[13px] font-semibold text-t-secondary">{CURRENT_DRAW.lottery} 제{CURRENT_DRAW.targetRound}회 대상</span>
                            </div>

                            {/* 1등 경품 하이라이트 */}
                            <div className="mt-4 rounded-[20px] p-4 flex items-center gap-4" style={{ backgroundColor: 'var(--color-btn-secondary)' }}>
                                <img src={PRIZE_INFO(PRIZES[0].name).img} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="inline-flex self-start items-center text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFF3D6', color: '#D69500' }}>1등 경품 · {PRIZE_INFO(PRIZES[0].name).brand}</span>
                                    <span className="text-[18px] font-bold text-t-primary tracking-tight mt-1.5 truncate">{PRIZES[0].name}</span>
                                    <span className="text-[12px] font-medium text-t-muted mt-0.5">당첨 {PRIZES[0].count.toLocaleString()}명</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 내 응모 현황 — 응모 장수 */}
                    <section className="mx-6 mt-3">
                        <div className="bg-accent-soft rounded-[20px] p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-card-gray flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[26px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-t-secondary">이번 회차 내 응모</span>
                                <span className="text-[20px] font-bold text-t-primary tracking-tight mt-0.5">
                                    응모권 <span className="text-accent">{MY_TICKETS.length}장</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setShowMyTickets(true)}
                                className="pressable text-[13px] font-bold text-accent whitespace-nowrap flex items-center"
                            >
                                내역 보기
                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            </button>
                        </div>
                    </section>

                    {/* 나머지 경품 (2~5등) */}
                    <section className="mx-6 mt-5">
                        <div className="flex items-baseline justify-between mb-2.5 px-1">
                            <h2 className="text-[16px] font-bold text-t-primary">이번 회차 경품</h2>
                            <span className="text-t-muted text-[12px] font-medium">1~5등 · 총 {PRIZES.reduce((a, p) => a + p.count, 0).toLocaleString()}명</span>
                        </div>
                        <div className="bg-card-gray rounded-[20px] px-5 py-1">
                            {PRIZES.map((p, i) => {
                                const st = RANK_STYLE(p.rank);
                                const info = PRIZE_INFO(p.name);
                                return (
                                    <div key={p.rank} className={`flex items-center gap-3 py-3.5 ${i < PRIZES.length - 1 ? 'border-b border-themed' : ''}`}>
                                        {/* 경품 썸네일 + 등수 배지 */}
                                        <div className="relative flex-shrink-0">
                                            <img src={info.img} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                                            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ring-2 ring-[var(--color-card)]" style={{ backgroundColor: st.bg, color: st.fg }}>{p.rank}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <div className="text-t-primary text-[15px] font-bold leading-tight truncate">{p.name}</div>
                                            <div className="text-t-muted text-[12px] font-medium mt-0.5">{info.brand}</div>
                                        </div>
                                        <span className="text-t-muted text-[13px] font-semibold flex-shrink-0">{p.count.toLocaleString()}명</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 응모 일정 — 3단계 타임라인 */}
                    <section className="mx-6 mt-5 mb-2">
                        <h2 className="text-[16px] font-bold text-t-primary mb-2.5 px-1">응모 일정</h2>
                        <div className="bg-card-gray rounded-[20px] p-5">
                            {[
                                { label: '낙첨 등록 시작', date: '2026.02.22 (토) 21:00', icon: 'flag', state: 'done' },
                                { label: '낙첨 등록 마감', date: '2026.02.25 (화) 20:00', icon: 'lock_clock', state: 'active' },
                                { label: '경품 추첨', date: '2026.02.25 (화) 20:30', icon: 'trophy', state: 'upcoming' },
                            ].map((s, i, arr) => {
                                const isLast = i === arr.length - 1;
                                const dotBg = s.state === 'upcoming' ? 'var(--color-btn-secondary)' : 'var(--color-accent)';
                                const dotFg = s.state === 'upcoming' ? 'var(--color-text-muted)' : 'var(--color-accent-fg)';
                                return (
                                    <div key={i} className="flex gap-3">
                                        {/* 타임라인 라인 + 점 */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: dotBg }}>
                                                <span className="material-symbols-outlined text-[18px]" style={{ color: dotFg, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                                            </div>
                                            {!isLast && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: 'var(--color-border-light)' }} />}
                                        </div>
                                        {/* 내용 */}
                                        <div className={`flex flex-col ${isLast ? '' : 'pb-4'}`}>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[14px] font-bold text-t-primary">{s.label}</span>
                                                {s.state === 'active' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-positive-soft text-positive">진행중</span>}
                                            </div>
                                            <span className={`text-[13px] font-medium mt-0.5 ${s.state === 'upcoming' && isLast ? 'text-accent font-bold' : 'text-t-muted'}`}>{s.date}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="rounded-2xl p-3.5 mt-1" style={{ backgroundColor: 'var(--color-btn-secondary)' }}>
                                <p className="text-[12px] text-t-secondary font-medium leading-relaxed">
                                    <span className="font-bold text-t-primary">지난 회차 낙첨 복권</span>으로 응모해요. 매주 <span className="font-bold text-t-primary">토요일 21:00</span>부터 <span className="font-bold text-t-primary">화요일 20:00</span>까지 등록하면, <span className="font-bold text-t-primary">화요일 20:30</span>에 경품을 추첨해요
                                </p>
                            </div>
                        </div>
                    </section>

                </>
            ) : (
                /* === DONE === */
                <section className="mx-6 mt-4">
                    <div className="flex flex-col gap-3">
                        {PAST_DRAWS.map(d => {
                            return (
                                <div key={d.drawNo} className="bg-card-gray rounded-[20px] p-5 flex flex-col gap-4">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-t-primary text-[16px] font-bold">제{d.drawNo}회</span>
                                            <span className="text-t-muted text-[12px] font-medium">로또6/45 제{d.targetRound}회 · {fmtDate(d.drawDate)} 추첨</span>
                                        </div>
                                        {(() => {
                                            const won = d.myResult && d.myResult.startsWith('WON');
                                            return (
                                                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${won ? 'bg-positive-soft text-positive' : 'bg-btn-secondary text-t-muted'}`}>
                                                    {won ? '당첨' : '미당첨'}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    {/* 내 결과 요약 */}
                                    {d.myPrize && (
                                        <div className="rounded-[16px] p-3.5 flex items-center gap-3" style={{ backgroundColor: 'var(--color-btn-secondary)' }}>
                                            <img src={PRIZE_INFO(d.myPrize).img} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[12px] font-medium text-t-muted">내 당첨 경품 · {PRIZE_INFO(d.myPrize).brand}</span>
                                                <span className="text-[15px] font-bold text-t-primary truncate">{d.myPrize}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Result button */}
                                    <button
                                        onClick={() => router.push(`/prize_result?drawNo=${d.drawNo}`)}
                                        className="pressable rounded-[16px] px-4 py-3 flex items-center justify-between"
                                        style={{ backgroundColor: 'var(--color-btn-secondary)' }}
                                    >
                                        <div className="flex flex-col text-left">
                                            <span className="text-[14px] text-t-primary font-bold">결과 확인하기</span>
                                            <span className="text-[12px] text-t-muted font-medium mt-0.5">추첨영상과 함께 번호를 확인하세요</span>
                                        </div>
                                        <span className="material-symbols-outlined text-[28px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                    </button>

                                    {/* Expandable: Prizes */}
                                    <div className="border-t border-themed pt-1">
                                        <button
                                            onClick={() => toggle(d.drawNo)}
                                            className="w-full flex items-center justify-between py-2"
                                        >
                                            <span className="text-t-secondary text-[13px] font-bold">이번 회차 경품 보기</span>
                                            <span
                                                className="material-symbols-outlined text-[20px] text-t-dim transition-transform"
                                                style={{ transform: expanded[d.drawNo] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            >
                                                expand_more
                                            </span>
                                        </button>

                                        {expanded[d.drawNo] && (
                                            <div className="mt-1 flex flex-col gap-2">
                                                {d.prizes.map(p => {
                                                    const st = RANK_STYLE(p.rank);
                                                    const info = PRIZE_INFO(p.name);
                                                    return (
                                                        <div key={p.rank} className="flex items-center justify-between text-[13px]">
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="relative flex-shrink-0">
                                                                    <img src={info.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ring-2 ring-[var(--color-card)]" style={{ backgroundColor: st.bg, color: st.fg }}>{p.rank}</span>
                                                                </div>
                                                                <span className="text-t-secondary font-medium truncate">{p.name}</span>
                                                            </div>
                                                            <span className="text-t-muted font-medium flex-shrink-0">{p.count.toLocaleString()}명</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 낙첨복권 스캔 — 화면 하단에 떠 있는 패널 (열람 패널과 동일 형태) */}
            {onScan && (
                <div className="fixed bottom-[80px] left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                    <div
                        className="backdrop-blur-xl p-6 rounded-3xl w-full flex flex-col items-center border border-themed"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 94%, transparent)', boxShadow: '0 12px 40px var(--color-shadow)' }}
                    >
                        <p className="text-t-secondary text-[13px] font-semibold mb-4 text-center leading-relaxed">
                            이번 주 낙첨된 복권, 그냥 버리지 마세요!<br/>
                            등록하고 광고를 보면 경품 추첨에 응모할 수 있어요
                        </p>
                        <button
                            onClick={onScan}
                            className="w-full py-4 rounded-xl bg-accent text-accent-fg font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                            낙첨복권 스캔하기
                        </button>
                    </div>
                </div>
            )}

            {/* 내 응모 내역 시트 */}
            {showMyTickets && (
                <div className="fixed inset-0 z-[900] flex items-end justify-center max-w-[430px] mx-auto" onClick={() => setShowMyTickets(false)}>
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
                    <div className="relative w-full bg-card-gray rounded-t-3xl p-6 pb-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-4" />
                        <div className="flex items-baseline justify-between mb-4">
                            <h3 className="text-[18px] font-bold text-t-primary">내 응모 내역</h3>
                            <span className="text-[13px] font-semibold text-t-muted">응모권 {MY_TICKETS.length}장</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {MY_TICKETS.map((t, ti) => (
                                <div key={t.id} className="rounded-[16px] p-4" style={{ backgroundColor: 'var(--color-btn-secondary)' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[13px] font-bold text-t-primary">응모권 {ti + 1}</span>
                                        <span className="text-[12px] font-medium text-t-muted">{t.scanDate}</span>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {t.nums.map((n, i) => (
                                            <div key={i} className={`size-8 rounded-full flex items-center justify-center text-[12px] font-extrabold ${LOTTO_BALL_COLOR(n)}`}>{n}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowMyTickets(false)} className="pressable mt-5 w-full py-3.5 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]">확인</button>
                    </div>
                </div>
            )}

            {/* Info / 안내 modal */}
            {showInfo && (
                <div className="fixed inset-0 z-[900] flex items-end justify-center max-w-[430px] mx-auto" onClick={() => setShowInfo(false)}>
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
                    <div className="relative w-full bg-card-gray rounded-t-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-t-faint mx-auto mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[18px] font-bold text-t-primary">경품추첨 안내</h3>
                            <button onClick={() => setShowInfo(false)} className="w-8 h-8 rounded-full bg-btn-secondary flex items-center justify-center active:scale-90 transition-transform">
                                <span className="material-symbols-outlined text-[18px] text-t-muted">close</span>
                            </button>
                        </div>

                        <ul className="space-y-3">
                            {[
                                {
                                    icon: 'receipt_long',
                                    title: '직접 입력 응모권 당첨 시',
                                    desc: '직접 입력은 모바일 복권 구매를 전제로 합니다. 당첨 확정 전, 모바일 복권 구매 내역(스크린샷 등) 증빙을 요청드릴 수 있습니다.',
                                },
                                {
                                    icon: 'casino',
                                    title: '추첨 방식',
                                    desc: '등록 기간 종료 후 자동 추첨이 진행되며, 응모권이 많을수록 당첨 확률이 올라갑니다. 당첨 시 알림으로 안내드립니다.',
                                },
                                {
                                    icon: 'workspace_premium',
                                    title: 'PRO 혜택',
                                    desc: 'PRO 구독 시 낙첨번호를 매주 20세트까지 등록할 수 있어 응모 기회가 늘어납니다.',
                                },
                            ].map((t, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-btn-secondary flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[18px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[14px] font-bold text-t-primary leading-tight">{t.title}</div>
                                        <div className="text-[12px] text-t-muted font-medium leading-snug mt-0.5">{t.desc}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setShowInfo(false)}
                            className="pressable mt-5 w-full py-3.5 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]"
                        >
                            확인했어요
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
