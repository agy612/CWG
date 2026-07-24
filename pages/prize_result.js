import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const RANK_BADGE = (rank) => {
    if (rank === 1) return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30';
    if (rank === 2) return 'bg-zinc-300/15 text-zinc-200 border-zinc-300/30';
    if (rank === 3) return 'bg-orange-700/20 text-orange-300 border-orange-700/40';
    return 'bg-white/5 text-t-secondary border-themed';
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
    const finalW = +(d.mySubWeight * d.myLuckyWeight).toFixed(2);

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>제{d.drawNo}회 추첨 결과</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl pb-12">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary hover:text-t-primary transition-colors">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-[17px] font-extrabold tracking-tight leading-tight">제{d.drawNo}회 추첨 결과</h1>
                        <span className="text-t-dim text-[11px] font-medium">{fmtDate(d.drawDate)}</span>
                    </div>
                </div>

                {/* My result hero — simple */}
                <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5">
                    <div className="text-t-muted text-[11px] font-bold uppercase tracking-widest mb-3">내 당첨 결과</div>
                    {won ? (
                        <div className="flex items-center gap-3">
                            <span className={`w-12 h-12 rounded-xl border flex items-center justify-center text-[18px] font-extrabold ${RANK_BADGE(d.myRank)}`}>
                                {d.myRank}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-[#14b8a6] text-[20px] font-extrabold tracking-tight leading-none">{d.myRank}등 당첨</span>
                                <span className="text-t-secondary text-[13px] font-bold mt-1">{d.myPrize}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="w-12 h-12 rounded-xl border border-themed bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[22px] text-t-dim font-light">close</span>
                            </span>
                            <div className="flex flex-col">
                                <span className="text-t-primary text-[20px] font-extrabold tracking-tight leading-none">미당첨</span>
                                <span className="text-t-dim text-[12px] font-medium mt-1">다음 회차에 다시 도전해보세요</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Redeem barcode (in-store coupon) */}
                {won && d.redeem && (
                    <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5 flex flex-col gap-3">
                        <div className="flex items-baseline justify-between">
                            <span className="text-t-muted text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
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

                {/* Manual-entry proof upload */}
                {won && d.myEntryType === 'MANUAL' && (
                    <section className="mx-6 mt-3 bg-amber-500/8 rounded-2xl border border-amber-500/30 p-5">
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-amber-400 text-[11px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                구매 내역 첨부 필요
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                proofSubmitted
                                    ? 'bg-[#14b8a6]/15 text-[#14b8a6] border-[#14b8a6]/30'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}>
                                {proofSubmitted ? '검토 중' : '미제출'}
                            </span>
                        </div>
                        <p className="text-[12px] text-t-secondary font-medium leading-relaxed mb-4">
                            직접 입력한 응모권으로 당첨된 건으로, 경품 지급을 위해 <span className="text-t-primary font-bold">모바일 복권 구매 내역(스크린샷)</span>을 첨부해 주세요. 최대 5장까지 업로드 가능합니다.
                        </p>

                        {/* Files grid (after first upload) */}
                        {proofFiles.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {proofFiles.map((f, i) => (
                                    <div key={i} className="aspect-square rounded-lg bg-black border border-themed relative overflow-hidden">
                                        <img src={f.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                        {!proofSubmitted && (
                                            <button
                                                onClick={() => removeFile(i)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center active:scale-90 transition-transform"
                                                aria-label="삭제"
                                            >
                                                <span className="material-symbols-outlined text-[14px] text-white">close</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!proofSubmitted && proofFiles.length < 5 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-themed-light bg-card-gray flex flex-col items-center justify-center hover:bg-card-hover transition-colors active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-[22px] text-t-dim">add</span>
                                        <span className="text-[10px] text-t-dim font-bold mt-0.5">{proofFiles.length}/5</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Empty upload zone */}
                        {proofFiles.length === 0 && !proofSubmitted && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-8 border-2 border-dashed border-themed-light rounded-xl bg-card-gray/40 flex flex-col items-center gap-2 hover:bg-card-hover transition-colors active:scale-[0.99]"
                            >
                                <span className="material-symbols-outlined text-[28px] text-t-dim" style={{ fontVariationSettings: "'FILL' 1" }}>add_photo_alternate</span>
                                <span className="text-[12px] text-t-secondary font-bold">스크린샷 첨부하기</span>
                                <span className="text-[11px] text-t-dim font-medium">탭하여 사진 선택 (최대 5장)</span>
                            </button>
                        )}

                        <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={onFileSelect} className="hidden" />

                        {/* Submit button */}
                        {!proofSubmitted && proofFiles.length > 0 && (
                            <button
                                onClick={submitProof}
                                className="mt-3 w-full py-3 rounded-xl bg-[#14b8a6] text-black font-extrabold text-[13px] active:scale-95 transition-transform"
                            >
                                {proofFiles.length}장 제출하기
                            </button>
                        )}

                        {/* Submitted state */}
                        {proofSubmitted && (
                            <div className="bg-[#14b8a6]/10 border border-[#14b8a6]/25 rounded-xl px-3 py-2.5 flex items-start gap-2">
                                <span className="material-symbols-outlined text-[16px] text-[#14b8a6] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <div className="flex-1">
                                    <div className="text-[12px] font-bold text-t-primary">제출 완료</div>
                                    <div className="text-[11px] text-t-muted font-medium mt-0.5">영업일 기준 1~2일 내 검토 후 경품이 지급됩니다.</div>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Target lottery banner */}
                <div className="mx-6 mt-4 bg-card-gray rounded-2xl px-4 py-2.5 border border-themed">
                    <div className="flex items-center gap-2 flex-wrap">
                        <svg width="18" height="13" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
                            <rect width="22" height="16" rx="2" fill="#003DA5" />
                            <text x="11" y="11.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">KR</text>
                        </svg>
                        <span className="text-[12px] font-bold text-t-primary">{d.lottery}</span>
                        <span className="text-[10px] font-bold text-t-muted bg-white/8 px-1.5 py-0.5 rounded-full">제{d.targetRound}회</span>
                        <span className="text-white/15">·</span>
                        <span className="text-[10px] text-t-muted font-medium">{fmtDate(d.targetDate)}</span>
                        <span className="ml-auto text-[10px] text-[#14b8a6] font-semibold">제{d.drawNo}회 추첨</span>
                    </div>
                </div>

                {/* Schedule */}
                <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-t-muted text-[13px] font-semibold">낙첨 등록 기간</span>
                        <span className="text-t-primary text-[13px] font-bold">{fmtDate(d.registerFrom)} ~ {fmtDate(d.registerTo)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-t-muted text-[13px] font-semibold">경품 추첨일시</span>
                        <span className="text-t-primary text-[13px] font-bold">{fmtDate(d.drawDate)}</span>
                    </div>
                </section>

                {/* My entry status */}
                <section className="mx-6 mt-3 bg-card-gray rounded-2xl border border-themed p-5">
                    <div className="flex items-baseline justify-between mb-3">
                        <span className="text-t-muted text-[11px] font-bold uppercase tracking-widest">내 응모 현황</span>
                        <span className="text-t-primary text-[14px] font-extrabold">
                            응모권 {d.myEntries}장 · 가중치 <span className={finalW >= 2 ? 'text-[#D4AF37]' : 'text-[#14b8a6]'}>×{finalW}</span>
                        </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[12px]">
                            <span className="text-t-muted">구독 등급 · {d.mySubTier}</span>
                            <span className="text-t-secondary font-bold">×{d.mySubWeight.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-[12px]">
                            <span className="text-t-muted">럭키스코어 · {d.myLuckyScore}점</span>
                            <span className="text-t-secondary font-bold">×{d.myLuckyWeight.toFixed(1)}</span>
                        </div>
                    </div>
                </section>

                {/* Prizes 1~5 */}
                <section className="mx-6 mt-5">
                    <div className="flex items-baseline justify-between mb-2 px-1">
                        <h2 className="text-t-muted text-[11px] font-bold uppercase tracking-widest">이번 회차 경품</h2>
                        <span className="text-t-dim text-[11px] font-medium">1~5등</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {d.prizes.map(p => (
                            <div key={p.rank} className={`bg-card-gray rounded-2xl border flex items-center gap-3 px-4 py-3 ${won && p.rank === d.myRank ? 'border-[#14b8a6]/40' : 'border-themed'}`}>
                                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${RANK_BADGE(p.rank)}`}>
                                    <span className="text-[13px] font-extrabold">{p.rank}</span>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="text-t-primary text-[14px] font-bold leading-tight">{p.name}</div>
                                    <div className="text-t-dim text-[11px] font-medium mt-0.5">
                                        {p.count.toLocaleString()}명
                                        {won && p.rank === d.myRank && <span className="ml-2 text-[#14b8a6] font-bold">· 당첨</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
