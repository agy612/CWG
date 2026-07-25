import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* 등수 배지 색 (라이트) */
const RANK_STYLE = (rank) => {
    if (rank === 1) return { bg: '#FFF3D6', fg: '#D69500' };
    if (rank === 2) return { bg: '#EEF1F4', fg: '#8B95A1' };
    if (rank === 3) return { bg: '#F9EBDD', fg: '#C77B3C' };
    return { bg: 'var(--color-btn-secondary)', fg: 'var(--color-text-secondary)' };
};

/* 경품명 → 데모 썸네일 이미지 + 후원 브랜드 */
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

const PRIZES = [
    { rank: 1, count: 1,    name: 'iPhone 16 Pro 256GB' },
    { rank: 2, count: 5,    name: '30만 포인트' },
    { rank: 3, count: 50,   name: '10만 포인트' },
    { rank: 4, count: 200,  name: '3만 포인트' },
    { rank: 5, count: 1000, name: '5천 포인트' },
];

// Mock data per past draw
const DRAW_DATA = {
    14: {
        drawNo: 14, drawDate: '2026-02-23 14:00',
        lottery: '로또6/45', targetRound: 1157, targetDate: '2026-02-15',
        registerFrom: '2026-02-16 00:00', registerTo: '2026-02-21 23:59',
        myResult: 'WON1', myPrize: 'iPhone 16 Pro 256GB', myRank: 1, myEntryType: 'MANUAL',
        myEntries: 4, mySubTier: 'STANDARD', mySubWeight: 1.5, myLuckyScore: 92, myLuckyWeight: 2.0,
        prizes: PRIZES,
    },
    13: {
        drawNo: 13, drawDate: '2026-02-16 14:00',
        lottery: '로또6/45', targetRound: 1156, targetDate: '2026-02-08',
        registerFrom: '2026-02-09 00:00', registerTo: '2026-02-14 23:59',
        myResult: 'WON3', myPrize: '메가커피 아메리카노 1잔', myRank: 3, myEntryType: 'SCAN',
        myEntries: 5, mySubTier: 'STANDARD', mySubWeight: 1.5, myLuckyScore: 88, myLuckyWeight: 1.5,
        redeem: {
            store: '메가커피',
            item: '아메리카노 1잔',
            barcode: '8801234567890',
            validUntil: '2026-03-16',
        },
        prizes: [
            { rank: 1, count: 1,    name: 'iPhone 16 Pro 256GB' },
            { rank: 2, count: 5,    name: '30만 포인트' },
            { rank: 3, count: 50,   name: '메가커피 아메리카노 1잔' },
            { rank: 4, count: 200,  name: '3만 포인트' },
            { rank: 5, count: 1000, name: '5천 포인트' },
        ],
    },
    12: {
        drawNo: 12, drawDate: '2026-02-09 14:00',
        lottery: '로또6/45', targetRound: 1155, targetDate: '2026-02-01',
        registerFrom: '2026-02-02 00:00', registerTo: '2026-02-07 23:59',
        myResult: 'MISS', myPrize: null, myRank: null,
        myEntries: 2, mySubTier: 'FREE', mySubWeight: 1.0, myLuckyScore: 45, myLuckyWeight: 1.0,
        prizes: PRIZES,
    },
    11: {
        drawNo: 11, drawDate: '2026-02-02 14:00',
        lottery: '로또6/45', targetRound: 1154, targetDate: '2026-01-25',
        registerFrom: '2026-01-26 00:00', registerTo: '2026-01-31 23:59',
        myResult: 'WON5', myPrize: '5천 포인트', myRank: 5,
        myEntries: 4, mySubTier: 'FREE', mySubWeight: 1.0, myLuckyScore: 71, myLuckyWeight: 1.5,
        prizes: PRIZES,
    },
};

function fmtDate(s) { return s.replace(/-/g, '.'); }

function Barcode({ code }) {
    // Deterministic bar pattern derived from the code so it stays stable on rerenders
    const bars = [];
    for (let i = 0; i < 64; i++) {
        const seed = code.charCodeAt(i % code.length) + i * 7;
        bars.push({ w: (seed % 3) + 1, black: (seed % 2) === 0 });
    }
    return (
        <div className="bg-white rounded-xl p-5 flex flex-col items-center gap-3">
            <div className="flex items-end h-16">
                {bars.map((b, i) => (
                    <div
                        key={i}
                        style={{ width: `${b.w}px`, height: '100%', marginLeft: i > 0 ? '1px' : 0 }}
                        className={b.black ? 'bg-black' : 'bg-white'}
                    />
                ))}
            </div>
            <div className="text-black text-[14px] font-mono tracking-[0.25em] font-bold">{code}</div>
        </div>
    );
}

export default function PrizeResult() {
    const router = useRouter();
    const { drawNo } = router.query;
    const fileInputRef = useRef(null);
    const [proofFiles, setProofFiles] = useState([]);
    const [proofSubmitted, setProofSubmitted] = useState(false);
    const [addr, setAddr] = useState({ name: '', phone: '', zip: '', address: '', detail: '' });

    const d = drawNo ? DRAW_DATA[drawNo] : null;

    const onFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const mapped = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
        setProofFiles(prev => [...prev, ...mapped].slice(0, 5));
        e.target.value = '';
    };
    const removeFile = (idx) => setProofFiles(p => p.filter((_, i) => i !== idx));
    const submitProof = () => { if (proofFiles.length > 0) setProofSubmitted(true); };

    if (!d) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center text-t-muted">
                <span className="text-sm">결과를 불러오는 중...</span>
            </div>
        );
    }

    const won = d.myResult?.startsWith('WON');
    const needsDelivery = won && /iphone|아이폰|갤럭시|폰|에어팟|노트북|가전/i.test(d.myPrize || '');
    const needsProof = won && d.myEntryType === 'MANUAL';
    const addrFilled = addr.name && addr.phone && addr.address;
    const canSubmit = (!needsProof || proofFiles.length > 0) && (!needsDelivery || addrFilled);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>제{d.drawNo}회 추첨 결과</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl pb-12">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-4 flex items-center gap-2">
                    <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-[17px] font-bold tracking-tight leading-tight">제{d.drawNo}회 추첨 결과</h1>
                        <span className="text-t-muted text-[12px] font-medium">{fmtDate(d.drawDate)}</span>
                    </div>
                </div>

                {/* My result hero */}
                <section className="mx-6 mt-3">
                    {won ? (
                        <div className="rounded-[20px] p-5 ring-2 ring-accent bg-card-gray">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[22px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                                <span className="text-accent text-[20px] font-bold tracking-tight">{d.myRank}등 당첨</span>
                            </div>
                            <div className="mt-3 rounded-[16px] p-3.5 flex items-center gap-3" style={{ backgroundColor: 'var(--color-btn-secondary)' }}>
                                <img src={PRIZE_INFO(d.myPrize).img} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[12px] font-medium text-t-muted">내 당첨 경품 · {PRIZE_INFO(d.myPrize).brand}</span>
                                    <span className="text-[16px] font-bold text-t-primary truncate">{d.myPrize}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[20px] p-5 bg-card-gray flex items-center gap-3">
                            <span className="w-12 h-12 rounded-2xl bg-btn-secondary flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[24px] text-t-muted">sentiment_dissatisfied</span>
                            </span>
                            <div className="flex flex-col">
                                <span className="text-t-primary text-[19px] font-bold tracking-tight leading-none">아쉽게 미당첨</span>
                                <span className="text-t-muted text-[13px] font-medium mt-1.5">다음 회차에 다시 도전해보세요</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Redeem barcode (in-store coupon) */}
                {won && d.redeem && (
                    <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5 flex flex-col gap-3">
                        <div className="flex items-baseline justify-between">
                            <span className="text-t-muted text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                                교환 바코드
                            </span>
                            <span className="text-[10px] font-bold text-t-dim">유효기간 {fmtDate(d.redeem.validUntil)}</span>
                        </div>

                        <Barcode code={d.redeem.barcode} />

                        <p className="text-[12px] text-t-secondary font-medium leading-relaxed">
                            가까운 <span className="text-t-primary font-bold">{d.redeem.store}</span> 매장에서 이 바코드를 보여주시면 <span className="text-t-primary font-bold">{d.redeem.item}</span>으로 교환할 수 있습니다.
                        </p>
                    </section>
                )}

                {/* 경품 수령 — 구매내역/배송지 확인 (강조 카드) */}
                {won && (needsProof || needsDelivery) && (
                    <section className="mx-6 mt-3 rounded-[20px] overflow-hidden bg-card-gray ring-2 ring-accent">
                        {/* 헤더 바 */}
                        <div className="px-5 py-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--color-accent)' }}>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>card_giftcard</span>
                                <span className="text-[15px] font-bold text-white">경품 수령 정보 입력</span>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/20 text-white">
                                {proofSubmitted ? '접수 완료' : '입력 필요'}
                            </span>
                        </div>

                        <div className="p-5 flex flex-col gap-5">
                            {proofSubmitted ? (
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[24px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-t-primary">수령 신청이 접수됐어요</span>
                                        <span className="text-[13px] font-medium text-t-muted mt-0.5">영업일 기준 1~2일 내 검토 후 {needsDelivery ? '배송해 드려요' : '경품이 지급돼요'}.</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* 구매 내역 첨부 (직접 입력 당첨) */}
                                    {needsProof && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[14px] font-bold text-t-primary">모바일 복권 구매 내역</span>
                                                <span className="text-[11px] font-bold text-accent">필수</span>
                                            </div>
                                            <p className="text-[12px] text-t-muted font-medium leading-relaxed mb-3">
                                                직접 입력 당첨 건은 구매 내역 <span className="font-bold text-t-secondary">스크린샷</span>으로 확인해요 (최대 5장)
                                            </p>
                                            {proofFiles.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {proofFiles.map((f, i) => (
                                                        <div key={i} className="aspect-square rounded-xl bg-btn-secondary relative overflow-hidden">
                                                            <img src={f.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                                            <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center" aria-label="삭제">
                                                                <span className="material-symbols-outlined text-[14px] text-white">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {proofFiles.length < 5 && (
                                                        <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-themed-medium bg-input-bg flex flex-col items-center justify-center">
                                                            <span className="material-symbols-outlined text-[22px] text-t-dim">add</span>
                                                            <span className="text-[10px] text-t-dim font-bold mt-0.5">{proofFiles.length}/5</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button onClick={() => fileInputRef.current?.click()} className="pressable w-full py-7 border-2 border-dashed border-accent rounded-2xl bg-accent-soft flex flex-col items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[28px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>add_photo_alternate</span>
                                                    <span className="text-[13px] text-accent font-bold">스크린샷 첨부하기</span>
                                                </button>
                                            )}
                                            <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={onFileSelect} className="hidden" />
                                        </div>
                                    )}

                                    {/* 배송지 입력 (실물 경품) */}
                                    {needsDelivery && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-2.5">
                                                <span className="text-[14px] font-bold text-t-primary">배송 정보</span>
                                                <span className="text-[11px] font-bold text-accent">필수</span>
                                                <span className="text-[12px] font-medium text-t-muted ml-auto">실물 경품은 택배로 배송돼요</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input value={addr.name} onChange={e => setAddr(a => ({ ...a, name: e.target.value }))} placeholder="받는 분" className="py-3 px-3.5 rounded-xl bg-input-bg text-[14px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors" />
                                                    <input value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} inputMode="tel" placeholder="연락처" className="py-3 px-3.5 rounded-xl bg-input-bg text-[14px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors" />
                                                </div>
                                                <input value={addr.address} onChange={e => setAddr(a => ({ ...a, address: e.target.value }))} placeholder="주소 (도로명/지번)" className="py-3 px-3.5 rounded-xl bg-input-bg text-[14px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors" />
                                                <input value={addr.detail} onChange={e => setAddr(a => ({ ...a, detail: e.target.value }))} placeholder="상세 주소 (동/호수)" className="py-3 px-3.5 rounded-xl bg-input-bg text-[14px] font-semibold text-t-primary outline-none border border-themed focus:border-accent transition-colors" />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={submitProof}
                                        disabled={!canSubmit}
                                        className={`pressable w-full py-4 rounded-2xl font-bold text-[15px] transition-colors ${canSubmit ? 'bg-accent text-accent-fg' : 'bg-btn-secondary text-t-dim'}`}
                                    >
                                        경품 수령 신청하기
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* 대상 복권 + 일정 */}
                <section className="mx-6 mt-4 bg-card-gray rounded-[20px] p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5">
                        <svg width="18" height="13" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
                            <rect width="22" height="16" rx="2" fill="#003DA5" />
                            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Pretendard,Inter,sans-serif">KR</text>
                        </svg>
                        <span className="text-[14px] font-bold text-t-primary">{d.lottery} 제{d.targetRound}회 대상</span>
                    </div>
                    <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                    <div className="flex items-center justify-between">
                        <span className="text-t-muted text-[14px] font-medium">낙첨 등록 기간</span>
                        <span className="text-t-primary text-[14px] font-bold">{fmtDate(d.registerFrom)} ~ {fmtDate(d.registerTo)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-t-muted text-[14px] font-medium">경품 추첨일시</span>
                        <span className="text-accent text-[14px] font-bold">{fmtDate(d.drawDate)}</span>
                    </div>
                </section>

                {/* 이번 회차 경품 */}
                <section className="mx-6 mt-5">
                    <div className="flex items-baseline justify-between mb-2.5 px-1">
                        <h2 className="text-[16px] font-bold text-t-primary">이번 회차 경품</h2>
                        <span className="text-t-muted text-[12px] font-medium">1~5등</span>
                    </div>
                    <div className="bg-card-gray rounded-[20px] px-5 py-1">
                        {d.prizes.map((p, i) => {
                            const st = RANK_STYLE(p.rank);
                            const info = PRIZE_INFO(p.name);
                            const mine = won && p.rank === d.myRank;
                            return (
                                <div key={p.rank} className={`flex items-center gap-3 py-3.5 ${i < d.prizes.length - 1 ? 'border-b border-themed' : ''}`}>
                                    <div className="relative flex-shrink-0">
                                        <img src={info.img} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                                        <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ring-2 ring-[var(--color-card)]" style={{ backgroundColor: st.bg, color: st.fg }}>{p.rank}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <div className="text-t-primary text-[15px] font-bold leading-tight truncate">{p.name}</div>
                                        <div className="text-t-muted text-[12px] font-medium mt-0.5">{info.brand}</div>
                                    </div>
                                    {mine ? (
                                        <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-accent-soft text-accent flex-shrink-0">내 당첨</span>
                                    ) : (
                                        <span className="text-t-muted text-[13px] font-semibold flex-shrink-0">{p.count.toLocaleString()}명</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
