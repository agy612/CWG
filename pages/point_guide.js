import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

/* ─── 포인트 획득 정책 ───────────────────────────────────────── */
const EARN = [
    { title: '신규 가입 보너스', loc: '회원가입', amount: '100P', note: '가입하면 바로 받아요' },
    { title: '추천 보상', loc: '추천 가입', amount: '500P', note: '내 추천코드로 친구가 가입하면 받아요' },
    { title: '추천 등록', loc: '추천 가입', amount: '500P', note: '친구의 추천코드를 입력하면 받아요' },
    { title: '낙첨 스캔 등록', loc: '스캔 탭', amount: '1장당 10P', note: '매주 등록할 수 있는 매수는 등급별로 달라요' },
    { title: '광고 시청 보상', loc: '스캔 완료 / 광고', amount: '광고 1초당 1P', note: '무료 회원 하루 10회 · 구독 회원 하루 20회' },
    { title: '쿠폰 등록', loc: '마이 > 쿠폰', amount: '쿠폰별 지정 P', note: '쿠폰에 적힌 만큼 받아요' },
    { title: '경품 추첨 당첨', loc: '경품 추첨', amount: '경품별 지정 P', note: '당첨되면 받아요' },
    { title: '넘버센스 게임', loc: '콘텐츠 탭', amount: '게임 누적 팟', note: '성공하면 받고, 실패하면 사라져요' },
];

/* ─── 포인트 소비 정책 ───────────────────────────────────────── */
const SPEND = [
    { title: 'FULIF 번호 생성', loc: '번호생성 탭', amount: '200P', note: '구독 회원(STANDARD·PRO)은 무료 · 회차당' },
    { title: '번호 추가 생성', loc: '번호생성 > 추가 생성', amount: '100P / 회', note: 'PRO 회원만 이용 가능' },
    { title: '포인트샵 STANDARD 구독권', loc: '포인트샵', amount: '1개월 5,000P · 1년 54,000P', note: '1년권은 10% 더 저렴해요' },
    { title: '포인트샵 PRO 구독권', loc: '포인트샵', amount: '1개월 8,000P · 1년 86,400P', note: '1년권은 10% 더 저렴해요' },
];

function PolicyTable({ rows, type }) {
    const earn = type === 'earn';
    const amtColor = earn ? 'text-[#14b8a6]' : 'text-t-secondary';
    return (
        <div className="bg-card-gray rounded-2xl border border-themed divide-y divide-themed overflow-hidden">
            {rows.map((r) => (
                <div key={r.title} className="flex items-start justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                        <div className="text-[13.5px] font-bold text-t-primary leading-tight">{r.title}</div>
                        <div className="text-[11px] text-t-dim font-medium mt-0.5">{r.loc}</div>
                    </div>
                    <div className="text-right flex-shrink-0 max-w-[54%]">
                        <div className={`text-[12.5px] font-extrabold leading-tight ${amtColor}`}>{r.amount}</div>
                        {r.note && <div className="text-[11px] text-t-dim font-medium mt-0.5 leading-snug">{r.note}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function PointGuide() {
    const router = useRouter();

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 포인트 안내</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">포인트 안내</h1>
                </div>

                {/* Intro */}
                <div className="px-6 mb-6">
                    <p className="text-[13px] text-t-muted font-medium leading-relaxed">
                        포인트를 어떻게 모으고 쓰는지 한눈에 확인하세요.
                        등급(FREE / STANDARD / PRO)에 따라 적립·차감 기준이 달라질 수 있어요.
                    </p>
                </div>

                {/* 적립 */}
                <div className="px-6 mb-7">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[18px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                        <h2 className="text-[15px] font-extrabold text-t-primary">적립 (획득)</h2>
                    </div>
                    <PolicyTable rows={EARN} type="earn" />
                </div>

                {/* 사용 */}
                <div className="px-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[18px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>remove_circle</span>
                        <h2 className="text-[15px] font-extrabold text-t-primary">사용 (소비)</h2>
                    </div>
                    <PolicyTable rows={SPEND} type="spend" />
                </div>

                {/* Footer notice */}
                <div className="mx-6 mt-7 flex items-start gap-2 bg-btn-secondary/30 rounded-2xl p-4 border border-themed">
                    <span className="material-symbols-outlined text-[16px] text-t-muted mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <span className="text-[11px] text-t-muted font-medium leading-relaxed">
                        지급·차감 기준은 운영 정책에 따라 변경될 수 있으며, 포인트는 현금으로 환전되지 않습니다.
                    </span>
                </div>
            </div>
        </div>
    );
}
