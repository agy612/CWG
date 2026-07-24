import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TabHeader, { HeaderIconButton } from './components/TabHeader';
import PicksTab from './PicksTab';
import ChampionshipTab from './ChampionshipTab';

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/**
 * GenerateTab — "번호생성" 하단 탭 (통합 흐름).
 *
 * 메인: CWG 추천 번호 10세트 (PicksTab embedded) + 하단에 떠 있는 패널.
 *   - 열람 전: 패널 = "200P로 열람하기 / 구독 알아보기" (PicksTab 내부)
 *   - 열람 후: 패널 = "번호 추가 생성하기" → 추가 생성 페이지로 이동
 * 추가 생성 페이지: 가중치 생성기(ChampionshipTab embedded). 생성분은 통합 "내 번호"에 누적.
 */
export default function GenerateTab({ onSubviewChange }) {
    const router = useRouter();
    const [showGenerator, setShowGenerator] = useState(false);
    const [genResultOpen, setGenResultOpen] = useState(false); // 생성 결과 표시 중엔 헤더/리스트 접기
    const [myNumbers, setMyNumbers] = useState([]);

    // 서브페이지(추가 생성) 진입 시 하단 네비 숨김을 부모(index)에 알림
    useEffect(() => {
        if (onSubviewChange) onSubviewChange(showGenerator);
    }, [showGenerator, onSubviewChange]);
    useEffect(() => () => { if (onSubviewChange) onSubviewChange(false); }, []);

    // 추가 생성한 "내 번호" 누적 로드/갱신
    useEffect(() => {
        const load = () => {
            try { setMyNumbers(JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]')); } catch {}
        };
        load();
        window.addEventListener('cwg-mynum-added', load);
        return () => window.removeEventListener('cwg-mynum-added', load);
    }, []);

    const openGenerator = () => {
        setShowGenerator(true);
        window.dispatchEvent(new CustomEvent('cwg-generator-open')); // 튜토리얼 진행용
    };

    /* ── 추가 생성 페이지 ── */
    if (showGenerator) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-28">
                {/* 결과 표시 중엔 헤더/리스트를 접어 결과에 집중 */}
                {!genResultOpen && (
                    <>
                        <header className="flex items-center gap-3 px-4 pt-6 pb-2 relative">
                            <button onClick={() => setShowGenerator(false)} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                                <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                            </button>
                            <h1 className="text-[16px] font-extrabold absolute left-1/2 -translate-x-1/2">번호 추가 생성</h1>
                            <div className="ml-auto">
                                <HeaderIconButton
                                    icon="history"
                                    label="이전 기록"
                                    text
                                    onClick={() => router.push('/championship_history')}
                                />
                            </div>
                        </header>

                        {/* 설명 섹션 */}
                        <div className="mx-6 mt-2 bg-card-gray rounded-2xl border border-themed p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-[20px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
                                <h3 className="text-[15px] font-extrabold text-t-primary">나만의 번호 만들기</h3>
                            </div>
                            <p className="text-[13px] text-t-muted font-medium leading-relaxed">
                                fulif이 제공하는 <span className="text-t-primary font-bold">35가지 가중치</span>를 직접 조절해
                                나만의 전략으로 번호를 생성해요. Fulif 추천 10세트에 더해,
                                <span className="text-t-primary font-bold"> 11번째 번호부터</span>는 원하는 만큼 직접 만들 수 있어요.
                            </p>
                        </div>

                        {/* 내가 만든 번호 누적 */}
                        {myNumbers.length > 0 && (
                            <div className="px-6 mt-3 flex flex-col gap-2">
                                <div className="text-xs font-semibold text-t-muted mb-1">내가 만든 번호 ({myNumbers.length})</div>
                                {myNumbers.map((item, i) => {
                                    const ordinal = 11 + i;
                                    return (
                                        <div key={i} className="bg-card-gray rounded-2xl p-4 border border-themed flex items-center gap-2">
                                            <span className="text-t-faint text-xs font-bold w-6 text-center flex-shrink-0">{ordinal}</span>
                                            <div className="flex items-center gap-1.5 flex-1 justify-center">
                                                {item.numbers.map((num, j) => (
                                                    <div key={j} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold ${LOTTO_BALL_COLOR(num)}`}>{num}</div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-[#14b8a6] bg-[#14b8a6]/15 px-2 py-0.5 rounded-full flex-shrink-0">{item.preset}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* 가중치 생성기 — 설명/리스트와 프리셋 사이 여백 */}
                <div className={genResultOpen ? '' : 'mt-5'}>
                    <ChampionshipTab embedded onResultChange={setGenResultOpen} />
                </div>
            </div>
        );
    }

    /* ── 메인: CWG 추천 번호 ── */
    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-52">

            <TabHeader
                title="번호생성"
                subtitle="이번 주 번호 · 로또6/45 · 제1159회"
                action={
                    <HeaderIconButton
                        icon="history"
                        label="이전 기록"
                        text
                        onClick={() => router.push('/championship_history')}
                    />
                }
            />

            {/* 지난주 1등 카드 */}
            <div className="mx-6 bg-card-gray rounded-3xl p-8 flex flex-col gap-2 relative overflow-hidden border border-themed">
                <div className="absolute right-0 top-0 w-32 h-32 opacity-20 pointer-events-none flex gap-1 transform rotate-12">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-full w-2 bg-gradient-to-t from-transparent via-[#14b8a6] to-transparent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
                <div className="text-t-secondary text-[13px] font-semibold z-10">지난주 1등 당첨금 · 제1158회</div>
                <div className="mt-1 text-[40px] font-extrabold tracking-tight text-t-primary z-10 leading-none">26억 4천만원</div>
                <div className="mt-2 text-t-dim text-[13px] font-medium z-10">(8명 / 3.3억)</div>
            </div>

            {/* CWG 추천 번호 10세트 + 떠 있는 패널(열람 전: 열람 / 열람 후: 추가 생성) */}
            <div className="mt-6">
                <PicksTab embedded onAddGenerate={openGenerator} />
            </div>
        </div>
    );
}
