import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

/* 참여 방법 — 3단계 */
const STEPS = [
    {
        no: '①',
        text: '번호생성 > 챔피언십 번호생성에서 35개 필터를 조절해 나만의 번호를 만들어요',
        note: '매주 최대 10세트',
    },
    { no: '②', text: '한 번에 다 만들어도 되고, 며칠에 걸쳐 채워도 돼요' },
    { no: '③', text: '만든 번호는 FULIF 기록실에 저장되고, 추첨이 끝나면 자동으로 채점돼요' },
];

/* 점수 적립 방식 — 일치 / 근접 */
const SCORES = [
    {
        icon: 'check_circle',
        title: '일치 점수',
        lines: [
            '추첨번호와 일치한 세트에 점수를 드려요.',
            '1등 번호와 일치하면 명예 챔피언으로 시상해드려요. 대신 점수는 그 주 근접 점수 상위권과 비슷한 기본 점수로 드려요. 한 번의 1등으로 시즌 순위가 결정되지 않도록 해서, 다른 회원도 끝까지 도전할 수 있게 하기 위해서예요. 명예 챔피언이 된 회원도 쌓아온 누적 점수는 그대로 남아 연말 시즌 챔피언에 계속 도전할 수 있어요.',
            '복권 구매와 무관하게, 본인이 생성한 번호가 1등과 일치하면 시상해드려요.',
        ],
    },
    {
        icon: 'radar',
        title: '근접 점수',
        lines: [
            '한 세트도 일치하지 않았더라도, 그중 가장 근접했던 1세트를 골라 점수를 드려요.',
            '10세트가 모두 일치하지 않아도 점수는 반드시 남아요.',
            '아깝게 비껴간 번호일수록 더 높은 점수를 받아요.',
        ],
    },
];

/* 시상 — 1등만 상을 받는 게 아니에요 */
const AWARDS = [
    { icon: 'workspace_premium', title: '시즌 챔피언', desc: '1년간 가장 높은 점수를 쌓은 한 명 — 꾸준함의 왕관' },
    { icon: 'leaderboard', title: '시즌 TOP 10', desc: '시즌 챔피언 포함 TOP 10에 순위별 시상' },
    { icon: 'military_tech', title: '명예 챔피언', desc: '1등 번호와 일치를 해낸 회원 (시즌 중 수시)' },
    { icon: 'redeem', title: '시즌 경품 추첨', desc: 'PRO 회원 전용' },
    {
        icon: 'celebration',
        title: '시즌 특별 이벤트',
        desc: '상위권만의 잔치가 아니에요. 누적 점수 구간별 리그(상위·중위·하위)로 나눠 시즌별 이벤트 추첨을 통해 시상하고, 다양한 주제의 시상도 있어요. (순위 급상승상 등)\n어떤 순위에 있어도 상을 받을 수 있는 가능성이 있어요.',
    },
];

/* 유의사항 */
const NOTES = [
    '챔피언십은 복권 구매와 무관한 번호 일치 게임이에요. 챔피언십에서 나만의 번호를 생성하면 FULIF 기록실에 그대로 기록돼 점수를 쌓아가는 구조예요.',
    '시상은 트로피·물품·포인트로 드리며, 현금은 지급하지 않아요.',
];

export default function ChampionshipGuide() {
    const router = useRouter();
    const { tier } = useUser();
    const isPro = tier === 'PRO';

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head><title>FULIF - 챔피언십 안내</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-16">

                {/* Header */}
                <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl pt-12 pb-3 px-4 flex items-center gap-2">
                    <button onClick={() => router.back()} aria-label="뒤로" className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray transition-colors">
                        <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-[17px] font-bold tracking-tight">챔피언십 안내</h1>
                </div>

                {/* Hero */}
                <div
                    className="mx-6 mt-3 rounded-[24px] p-6"
                    style={{ background: 'linear-gradient(120deg, #2D71E8 0%, #1B64DA 100%)' }}
                >
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/18 text-white text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        PRO 전용
                    </span>
                    <h2 className="text-[24px] font-bold tracking-tight text-white mt-3">챔피언십</h2>
                    <p className="text-[14px] font-semibold text-white/90 mt-2 leading-snug">
                        PRO 회원만 참여하는 1년 단위<br />나만의 번호 만들기 대결
                    </p>
                    <p className="text-[13px] font-medium text-white/75 mt-3 leading-relaxed">
                        내가 직접 만든 번호가 그 주 추첨번호와 몇 개 일치하는지로 점수를 쌓는 게임이에요. 점수는 연말까지 계속 쌓여요.
                    </p>
                </div>

                {/* 이렇게 참여해요 */}
                <div className="mx-6 mt-8">
                    <h2 className="text-[17px] font-bold text-t-primary mb-3">이렇게 참여해요</h2>
                    <div className="bg-card-gray rounded-[20px] px-5 py-1">
                        {STEPS.map((s, i) => (
                            <div key={s.no} className={`flex gap-3 py-4 ${i < STEPS.length - 1 ? 'border-b border-themed' : ''}`}>
                                <span className="text-[15px] font-bold text-accent flex-shrink-0 leading-relaxed">{s.no}</span>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[14px] font-semibold text-t-primary leading-relaxed">{s.text}</span>
                                    {s.note && (
                                        <span className="inline-flex self-start items-center mt-2 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[12px] font-bold">
                                            {s.note}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 점수는 두 가지로 쌓여요 */}
                <div className="mx-6 mt-8">
                    <h2 className="text-[17px] font-bold text-t-primary mb-3">점수는 두 가지로 쌓여요</h2>
                    <div className="flex flex-col gap-3">
                        {SCORES.map((s) => (
                            <div key={s.title} className="bg-card-gray rounded-[20px] p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-[18px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                                    </span>
                                    <span className="text-[16px] font-bold text-t-primary">{s.title}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {s.lines.map((line, i) => (
                                        <p key={i} className="text-[13px] font-medium text-t-secondary leading-relaxed">{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 누군가 1등을 맞혀도 내 도전은 계속돼요 */}
                <div className="mx-6 mt-8">
                    <div className="bg-accent-soft rounded-[20px] p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[20px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>all_inclusive</span>
                            <h2 className="text-[16px] font-bold text-accent">누군가 1등을 맞혀도 내 도전은 계속돼요</h2>
                        </div>
                        <p className="text-[13px] font-medium text-t-secondary leading-relaxed">
                            시즌 중 1등 번호와 일치한 회원이 나와도, 도전이 끝나거나 누적 점수가 사라지지 않아요. 그 회원은 명예 챔피언으로 따로 시상받고, 점수 구조는 그대로예요. 시즌 챔피언은 1년간 꾸준히 점수를 가장 많이 쌓은 회원이 됩니다.
                        </p>
                    </div>
                </div>

                {/* 1등만 상을 받는 게 아니에요 */}
                <div className="mx-6 mt-8">
                    <h2 className="text-[17px] font-bold text-t-primary mb-1">1등만 상을 받는 게 아니에요</h2>
                    <p className="text-[13px] font-medium text-t-muted mb-3">다양한 방식으로 시상해요</p>
                    <div className="bg-card-gray rounded-[20px] px-5 py-1">
                        {AWARDS.map((a, i) => (
                            <div key={a.title} className={`flex gap-3 py-4 ${i < AWARDS.length - 1 ? 'border-b border-themed' : ''}`}>
                                <span className="w-9 h-9 rounded-full bg-btn-secondary flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[20px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                                </span>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[15px] font-bold text-t-primary">{a.title}</span>
                                    <span className="text-[13px] font-medium text-t-muted leading-relaxed mt-0.5 whitespace-pre-line">{a.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 알아두세요 */}
                <div className="mx-6 mt-8">
                    <h2 className="text-[17px] font-bold text-t-primary mb-3">알아두세요</h2>
                    <div className="bg-card-gray rounded-[20px] p-5 flex flex-col gap-3">
                        {NOTES.map((n, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-t-dim text-[13px] leading-relaxed flex-shrink-0">·</span>
                                <p className="text-[13px] font-medium text-t-muted leading-relaxed">{n}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mx-6 mt-8">
                    {isPro ? (
                        <button
                            onClick={() => router.push('/?tab=picks')}
                            className="pressable w-full py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px]"
                        >
                            챔피언십 번호 만들러 가기
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/subscription')}
                            className="pressable w-full py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[16px]"
                        >
                            PRO 구독하고 참여하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
