import React, { useState } from 'react';
import { useRouter } from 'next/router';

/* ─── 데이터 ────────────────────────────────────────────── */
const LEAGUE = { week: 15, drawNo: 1159, deadline: '04.19 토 20:00', dDay: 6, status: 'OPEN' };

const AI_MODELS = [
    { id: 'stat',   name: '닥터 로또',    type: '통계 최적화',   icon: 'biotech',       color: '#14b8a6', win: 23, loss: 5,  nums: [5, 12, 22, 31, 38, 44] },
    { id: 'deep',   name: '딥마인드',     type: '딥러닝 패턴',   icon: 'hub',           color: '#60a5fa', win: 19, loss: 9,  nums: [3, 11, 19, 28, 35, 42] },
    { id: 'random', name: '랜덤 오라클', type: '완전 랜덤',     icon: 'casino',        color: '#f59e0b', win: 12, loss: 16, nums: [7, 16, 24, 33, 40, 45] },
    { id: 'shaman', name: '샤먼 스텔라', type: '직관 예측',     icon: 'auto_awesome',  color: '#a78bfa', win: 17, loss: 11, nums: [4, 13, 21, 29, 36, 43] },
];

const LEADERBOARD = [
    { rank: 1, name: '행운의달인',  type: 'USER', score: 4, matched: 4, avatar: '🎯', nums: [7, 14, 28, 33, 39, 42] },
    { rank: 2, name: '닥터 로또',   type: 'AI',   score: 3, matched: 3, avatar: '🤖', nums: [5, 12, 22, 31, 38, 44], aiId: 'stat' },
    { rank: 3, name: '별빛추적자',  type: 'USER', score: 3, matched: 3, avatar: '⭐', nums: [2, 15, 23, 30, 37, 44] },
    { rank: 4, name: '샤먼 스텔라', type: 'AI',   score: 2, matched: 2, avatar: '✨', nums: [4, 13, 21, 29, 36, 43], aiId: 'shaman' },
    { rank: 5, name: '로또박사99',  type: 'USER', score: 2, matched: 2, avatar: '🎲', nums: [9, 18, 27, 34, 41, 45] },
    { rank: 6, name: '딥마인드',    type: 'AI',   score: 1, matched: 1, avatar: '🔵', nums: [3, 11, 19, 28, 35, 42], aiId: 'deep' },
    { rank: 7, name: '행운별자리',  type: 'USER', score: 1, matched: 1, avatar: '🌟', nums: [6, 17, 25, 32, 38, 43] },
    { rank: 8, name: '나',         type: 'ME',   score: 0, matched: 0, avatar: '😊', nums: [7, 14, 28, 33, 39, 42] },
];

const ITEMS = [
    { id: 'lock',    name: '번호 고정권',  desc: '1~2개 번호를 강제 포함',      cost: 300, icon: 'lock',      color: '#f59e0b' },
    { id: 'exclude', name: '번호 제외권',  desc: '특정 번호 1개 영구 제외',     cost: 200, icon: 'block',     color: '#f472b6' },
    { id: 'hint',    name: 'AI 힌트권',   desc: 'AI 예측 번호 1개 미리 공개',  cost: 150, icon: 'lightbulb', color: '#34d399' },
    { id: 'reroll',  name: '리롤권',      desc: '등록 번호 무료 재추첨 1회',   cost: 100, icon: 'refresh',   color: '#60a5fa' },
];

const LOTTO_COLOR = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

/* ─── 공통 헤더 ─────────────────────────────────────────── */
function PageHeader({ onBack, title, right }) {
    return (
        <header className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-themed sticky top-0 bg-background z-10">
            <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </button>
            <p className="text-[16px] font-extrabold flex-1">{title}</p>
            {right}
        </header>
    );
}

/* ══════════════════════════════════════════════════════════
   SCREEN A · 메인 리그 대시보드
══════════════════════════════════════════════════════════ */
function MainLeague({ router, setScreen }) {
    const top1 = LEADERBOARD[0];

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            {/* 리그 헤더 배너 */}
            <div className="relative px-6 pt-6 pb-5 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)' }}>
                {/* 배경 글로우 */}
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />

                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => router.push('/?tab=contents')} className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 -ml-1">
                                <span className="material-symbols-outlined text-[20px] text-white/70">arrow_back_ios_new</span>
                            </button>
                            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 rounded-full px-2.5 py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ animation: 'pulse 1s ease infinite' }} />
                                <span className="text-red-400 text-[10px] font-extrabold uppercase tracking-wider">LIVE</span>
                            </div>
                            <span className="text-white/40 text-[11px] font-semibold">제{LEAGUE.drawNo}회 · D-{LEAGUE.dDay}</span>
                        </div>
                        <h1 className="text-[22px] font-extrabold text-white leading-tight">
                            AI vs 유저<br/>예측 리그
                        </h1>
                        <p className="text-white/40 text-[12px] mt-1">WEEK {LEAGUE.week} · 마감 {LEAGUE.deadline}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-lime-400/15 border border-lime-400/30 rounded-2xl px-3 py-2 text-center">
                            <p className="text-lime-400 text-[20px] font-extrabold">D-{LEAGUE.dDay}</p>
                            <p className="text-lime-400/60 text-[9px] font-bold uppercase">추첨까지</p>
                        </div>
                    </div>
                </div>

                {/* 참여 인원 */}
                <div className="relative z-10 flex items-center gap-4 mt-4 pt-4 border-t border-white/8">
                    {[
                        { label: '참가자', value: '2,847명' },
                        { label: 'AI 모델', value: `${AI_MODELS.length}개` },
                        { label: '내 순위', value: '8위' },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col">
                            <p className="text-white/40 text-[10px] font-semibold">{s.label}</p>
                            <p className="text-white font-extrabold text-[15px]">{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4 px-6 pt-4 pb-10">

                {/* 현재 1위 카드 */}
                <div className="bg-card-gray rounded-3xl p-4 border border-themed flex items-center gap-4">
                    <div className="text-[36px]">{top1.avatar}</div>
                    <div className="flex flex-col flex-1 gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-yellow-400 font-extrabold">🥇 현재 1위</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${top1.type === 'AI' ? 'bg-blue-500/20 text-blue-400' : 'bg-lime-500/20 text-lime-400'}`}>{top1.type}</span>
                        </div>
                        <p className="text-[16px] font-extrabold text-t-primary">{top1.name}</p>
                        <div className="flex gap-1 mt-1">
                            {top1.nums.map(n => (
                                <div key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${LOTTO_COLOR(n)}`}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-t-muted mt-1">{top1.matched}개 적중 · {top1.score}점</p>
                    </div>
                    <button className="flex-shrink-0 px-4 py-2 rounded-full border border-themed text-[12px] font-bold text-t-secondary active:scale-95 transition-all">
                        팔로우
                    </button>
                </div>

                {/* 스코어보드 미리보기 */}
                <div className="bg-card-gray rounded-3xl border border-themed overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-themed">
                        <p className="text-[13px] font-extrabold">스코어보드</p>
                        <button onClick={() => setScreen('bracket')}
                            className="text-[12px] font-semibold text-t-muted active:opacity-60">
                            전체 보기 →
                        </button>
                    </div>
                    {LEADERBOARD.slice(0, 5).map((entry, i) => (
                        <div key={entry.rank}
                            className={`flex items-center gap-3 px-5 py-3 border-b border-themed last:border-0 ${entry.type === 'ME' ? 'bg-lime-500/5' : ''}`}>
                            <p className={`w-5 text-[13px] font-extrabold ${i < 3 ? 'text-yellow-400' : 'text-t-muted'}`}>
                                {i < 3 ? RANK_MEDAL[i] : entry.rank}
                            </p>
                            <p className="text-[18px]">{entry.avatar}</p>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-[13px] font-bold">{entry.name}</p>
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                        entry.type === 'AI' ? 'bg-blue-500/20 text-blue-400' :
                                        entry.type === 'ME' ? 'bg-lime-500/20 text-lime-400' :
                                        'bg-white/10 text-t-muted'}`}>{entry.type}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[12px] text-t-muted">{entry.matched}적중</span>
                                <span className="text-[14px] font-extrabold text-t-primary">{entry.score}점</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI 모델 라인업 */}
                <div className="flex flex-col gap-3">
                    <p className="text-[13px] font-extrabold text-t-secondary">AI 모델 라인업</p>
                    <div className="grid grid-cols-2 gap-2">
                        {AI_MODELS.map(ai => (
                            <div key={ai.id} className="bg-card-gray rounded-2xl p-4 border border-themed flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${ai.color}20` }}>
                                        <span className="material-symbols-outlined text-[16px]" style={{ color: ai.color, fontVariationSettings: "'FILL' 1" }}>{ai.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-extrabold leading-tight">{ai.name}</p>
                                        <p className="text-[9px] text-t-dim">{ai.type}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {ai.nums.slice(0, 3).map(n => (
                                        <div key={n} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${LOTTO_COLOR(n)}`}>
                                            {String(n).padStart(2, '0')}
                                        </div>
                                    ))}
                                    <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-[9px] text-t-faint font-bold">+3</div>
                                </div>
                                <div className="flex gap-2 text-[10px] text-t-muted">
                                    <span className="text-lime-400 font-bold">{ai.win}승</span>
                                    <span>{ai.loss}패</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 참전 + 아이템 버튼 */}
                <div className="flex gap-3 mt-2">
                    <button onClick={() => setScreen('register')}
                        className="flex-1 py-4 rounded-2xl font-extrabold text-[15px] active:scale-95 transition-all text-black"
                        style={{ background: 'linear-gradient(135deg, #84cc16, #22c55e)' }}>
                        ⚔️ 참전하기
                    </button>
                    <button onClick={() => setScreen('shop')}
                        className="px-5 py-4 rounded-2xl bg-card-gray border border-themed font-bold text-[13px] text-t-secondary active:scale-95 transition-all">
                        🎒 아이템
                    </button>
                </div>
            </div>

            <style jsx>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   SCREEN B · 번호 등록
══════════════════════════════════════════════════════════ */
function RegisterScreen({ setScreen }) {
    const [nums, setNums]           = useState([7, 14, 28, 33, 39, 42]);
    const [usedItem, setUsedItem]   = useState(null);
    const [locked, setLocked]       = useState([]);
    const [registered, setRegistered] = useState(false);

    const toggleLock = (n) => {
        setLocked(prev => prev.includes(n) ? prev.filter(x => x !== n) : prev.length < 2 ? [...prev, n] : prev);
    };

    if (registered) return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary items-center justify-center px-6 gap-6">
            <div className="w-24 h-24 rounded-full bg-lime-500/15 flex items-center justify-center border border-lime-500/20">
                <span className="material-symbols-outlined text-[44px] text-lime-400" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <div className="text-center">
                <p className="text-[24px] font-extrabold">참전 완료! ⚔️</p>
                <p className="text-t-muted text-[13px] mt-1">WEEK {LEAGUE.week} 리그에 등록됐어요</p>
            </div>
            <div className="w-full bg-card-gray rounded-2xl p-4 border border-themed flex flex-col gap-3">
                <p className="text-[12px] text-t-muted font-bold">등록된 번호</p>
                <div className="flex gap-2 justify-center">
                    {nums.map(n => (
                        <div key={n} className={`w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-extrabold ${LOTTO_COLOR(n)} ${locked.includes(n) ? 'ring-2 ring-yellow-400' : ''}`}>
                            {String(n).padStart(2, '0')}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={() => setScreen('bracket')}
                className="w-full py-4 rounded-2xl bg-bg-inverse text-t-inverse font-extrabold text-[15px] active:scale-95 transition-all">
                스코어보드 보기 →
            </button>
            <button onClick={() => setScreen('main')} className="text-[13px] text-t-muted font-medium">
                메인으로
            </button>
        </div>
    );

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <PageHeader onBack={() => setScreen('main')} title="번호 등록"
                right={<span className="text-[12px] text-lime-400 font-bold bg-lime-400/10 px-3 py-1 rounded-full">WEEK {LEAGUE.week}</span>} />

            <div className="flex flex-col px-6 pt-5 gap-5 pb-10 overflow-y-auto">

                {/* 내 번호 */}
                <div className="bg-card-gray rounded-3xl p-5 border border-themed flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-t-muted">참전 번호</p>
                        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#14b8a6] active:opacity-60">
                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                            도슨트 번호 불러오기
                        </button>
                    </div>
                    <div className="flex gap-2 justify-center">
                        {nums.map(n => (
                            <div key={n} className="flex flex-col items-center gap-1.5">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-extrabold ${LOTTO_COLOR(n)} ${locked.includes(n) ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : ''}`}>
                                    {String(n).padStart(2, '0')}
                                </div>
                                {locked.includes(n) && (
                                    <span className="text-[9px] text-yellow-400 font-extrabold">고정</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {usedItem === 'lock' && (
                        <p className="text-[11px] text-yellow-400 text-center">번호를 탭해서 최대 2개 고정</p>
                    )}
                    {usedItem === 'lock' && (
                        <div className="flex gap-2 justify-center flex-wrap">
                            {nums.map(n => (
                                <button key={n} onClick={() => toggleLock(n)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold border transition-all ${locked.includes(n) ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300' : 'border-themed bg-white/5 text-t-muted'}`}>
                                    {String(n).padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 아이템 적용 */}
                <div className="flex flex-col gap-3">
                    <p className="text-[13px] font-bold text-t-secondary">아이템 적용</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ITEMS.slice(0, 4).map(item => (
                            <button key={item.id}
                                onClick={() => setUsedItem(usedItem === item.id ? null : item.id)}
                                className={`rounded-2xl p-4 border text-left flex flex-col gap-1.5 transition-all active:scale-95 ${usedItem === item.id ? 'border-opacity-100' : 'border-themed bg-card-gray'}`}
                                style={usedItem === item.id ? { borderColor: item.color, backgroundColor: `${item.color}12` } : {}}>
                                <div className="flex items-center justify-between">
                                    <span className="material-symbols-outlined text-[20px]" style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                    {usedItem === item.id && <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full" style={{ color: item.color, backgroundColor: `${item.color}20` }}>적용중</span>}
                                </div>
                                <p className="text-[12px] font-extrabold text-t-primary">{item.name}</p>
                                <p className="text-[10px] text-t-dim leading-tight">{item.desc}</p>
                                <p className="text-[11px] font-bold" style={{ color: item.color }}>{item.cost}P</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI 상대 미리보기 */}
                <div className="bg-card-gray rounded-2xl p-4 border border-themed flex flex-col gap-3">
                    <p className="text-[12px] font-bold text-t-muted uppercase tracking-wider">이번 주 AI 상대</p>
                    <div className="flex gap-2">
                        {AI_MODELS.map(ai => (
                            <div key={ai.id} className="flex-1 flex flex-col items-center gap-1.5 bg-white/4 rounded-xl p-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ai.color}20` }}>
                                    <span className="material-symbols-outlined text-[16px]" style={{ color: ai.color, fontVariationSettings: "'FILL' 1" }}>{ai.icon}</span>
                                </div>
                                <p className="text-[9px] text-t-muted font-semibold text-center leading-tight">{ai.name}</p>
                                <p className="text-[9px] font-bold text-lime-400">{ai.win}W</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => setRegistered(true)}
                    className="w-full py-4 rounded-2xl font-extrabold text-[15px] active:scale-95 transition-all text-black mt-2"
                    style={{ background: 'linear-gradient(135deg, #84cc16, #22c55e)' }}>
                    ⚔️ 참전하기 (WEEK {LEAGUE.week})
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   SCREEN C · 스코어보드 (e-sports 대진표)
══════════════════════════════════════════════════════════ */
function BracketScreen({ setScreen }) {
    const [tab, setTab] = useState('board'); // board | matchup

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <PageHeader onBack={() => setScreen('main')} title="스코어보드"
                right={
                    <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-full px-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ animation: 'pulse 1s infinite' }} />
                        <span className="text-red-400 text-[10px] font-extrabold">LIVE</span>
                    </div>
                } />

            {/* 탭 */}
            <div className="flex px-6 gap-2 py-3 border-b border-themed">
                {[['board', '순위표'], ['matchup', '대진표']].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all ${tab === id ? 'bg-bg-inverse text-t-inverse' : 'bg-card-gray text-t-muted border border-themed'}`}>
                        {label}
                    </button>
                ))}
                <span className="ml-auto text-[12px] text-t-muted self-center">WEEK {LEAGUE.week}</span>
            </div>

            <div className="flex-1 overflow-y-auto pb-10">

                {/* 순위표 */}
                {tab === 'board' && (
                    <div className="flex flex-col">
                        {/* 헤더 */}
                        <div className="flex items-center px-5 py-2 text-[10px] text-t-faint font-bold uppercase tracking-wider border-b border-themed">
                            <span className="w-8">순위</span>
                            <span className="flex-1">참가자</span>
                            <span className="w-16 text-center">번호</span>
                            <span className="w-12 text-right">점수</span>
                        </div>

                        {LEADERBOARD.map((entry, i) => (
                            <div key={entry.rank}
                                className={`flex items-center px-5 py-3.5 border-b border-themed gap-3 ${entry.type === 'ME' ? 'bg-lime-500/5 border-lime-500/20' : ''}`}>
                                {/* 순위 */}
                                <span className={`w-5 text-[14px] font-extrabold flex-shrink-0 ${i < 3 ? '' : 'text-t-muted'}`}>
                                    {i < 3 ? RANK_MEDAL[i] : entry.rank}
                                </span>

                                {/* 프로필 */}
                                <span className="text-[22px] flex-shrink-0">{entry.avatar}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-[13px] font-bold truncate">{entry.name}</p>
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                            entry.type === 'AI' ? 'bg-blue-500/20 text-blue-400' :
                                            entry.type === 'ME' ? 'bg-lime-500/20 text-lime-400' :
                                            'bg-white/8 text-t-muted'}`}>
                                            {entry.type === 'ME' ? '나' : entry.type}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-t-dim">{entry.matched}개 적중</p>
                                </div>

                                {/* 번호 미니 */}
                                <div className="flex gap-0.5 flex-shrink-0">
                                    {entry.nums.slice(0, 3).map(n => (
                                        <div key={n} className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${LOTTO_COLOR(n)}`}>
                                            {String(n).padStart(2, '0')}
                                        </div>
                                    ))}
                                </div>

                                {/* 점수 */}
                                <div className="w-10 text-right flex-shrink-0">
                                    <p className={`text-[16px] font-extrabold ${i === 0 ? 'text-yellow-400' : 'text-t-primary'}`}>{entry.score}</p>
                                    <p className="text-[9px] text-t-faint">pts</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 대진표 */}
                {tab === 'matchup' && (
                    <div className="px-6 pt-5 flex flex-col gap-4">
                        <p className="text-[12px] text-t-muted font-semibold text-center">WEEK {LEAGUE.week} · 현재 진행 중</p>

                        {/* 매치업 카드들 */}
                        {[
                            { a: LEADERBOARD[0], b: LEADERBOARD[1], status: 'WINNING' },
                            { a: LEADERBOARD[2], b: LEADERBOARD[3], status: 'TIE' },
                            { a: LEADERBOARD[4], b: LEADERBOARD[5], status: 'WINNING' },
                            { a: LEADERBOARD[6], b: LEADERBOARD[7], status: 'WINNING' },
                        ].map((match, i) => (
                            <div key={i} className="bg-card-gray rounded-3xl border border-themed overflow-hidden">
                                {/* 매치 헤더 */}
                                <div className="flex items-center justify-between px-4 py-2 border-b border-themed bg-white/3">
                                    <span className="text-[10px] text-t-dim font-bold uppercase">MATCH {i + 1}</span>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                        match.status === 'TIE' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-lime-500/20 text-lime-400'
                                    }`}>{match.status}</span>
                                </div>

                                {/* 두 플레이어 */}
                                {[match.a, match.b].map((entry, j) => (
                                    <div key={j} className={`flex items-center gap-3 px-4 py-3 ${j === 0 ? 'border-b border-themed' : ''} ${entry.type === 'ME' ? 'bg-lime-500/5' : ''}`}>
                                        <span className="text-[22px]">{entry.avatar}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-[13px] font-bold">{entry.name}</p>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                                    entry.type === 'AI' ? 'bg-blue-500/20 text-blue-400' :
                                                    entry.type === 'ME' ? 'bg-lime-500/20 text-lime-400' :
                                                    'bg-white/8 text-t-dim'}`}>{entry.type === 'ME' ? '나' : entry.type}</span>
                                            </div>
                                            {/* 번호 */}
                                            <div className="flex gap-1 mt-1.5">
                                                {entry.nums.map(n => (
                                                    <div key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${LOTTO_COLOR(n)}`}>
                                                        {String(n).padStart(2, '0')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-[22px] font-extrabold ${j === 0 && match.status !== 'TIE' ? 'text-lime-400' : 'text-t-primary'}`}>{entry.score}</p>
                                            <p className="text-[9px] text-t-faint">pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   SCREEN D · 아이템 샵
══════════════════════════════════════════════════════════ */
function ShopScreen({ setScreen }) {
    const [myPoints] = useState(350);

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <PageHeader onBack={() => setScreen('main')} title="아이템 샵"
                right={
                    <div className="flex items-center gap-1.5 bg-yellow-400/15 rounded-full px-3 py-1.5">
                        <span className="material-symbols-outlined text-[14px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                        <span className="text-yellow-400 font-extrabold text-[13px]">{myPoints.toLocaleString()}P</span>
                    </div>
                } />

            <div className="flex flex-col px-6 pt-5 gap-4 pb-10 overflow-y-auto">
                <p className="text-[13px] text-t-muted">스캔 보상으로 얻은 포인트로 아이템을 구매하세요</p>

                <div className="flex flex-col gap-3">
                    {ITEMS.map(item => {
                        const canBuy = myPoints >= item.cost;
                        return (
                            <div key={item.id} className="bg-card-gray rounded-3xl p-5 border border-themed flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                                    <span className="material-symbols-outlined text-[26px]"
                                        style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[15px] font-extrabold">{item.name}</p>
                                    <p className="text-[12px] text-t-muted leading-relaxed mt-0.5">{item.desc}</p>
                                    <p className="text-[13px] font-extrabold mt-1.5" style={{ color: item.color }}>{item.cost}P</p>
                                </div>
                                <button disabled={!canBuy}
                                    className="flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold text-[13px] active:scale-95 transition-all disabled:opacity-30"
                                    style={canBuy ? { backgroundColor: item.color, color: '#000' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                                    {canBuy ? '구매' : '부족'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* 포인트 충전 */}
                <div className="bg-card-gray rounded-2xl p-4 border border-themed flex items-center justify-between mt-2">
                    <div>
                        <p className="text-[14px] font-bold">포인트 부족하신가요?</p>
                        <p className="text-[12px] text-t-muted mt-0.5">낙첨 티켓 스캔하고 포인트 적립</p>
                    </div>
                    <button onClick={() => setScreen('main')}
                        className="px-4 py-2.5 rounded-2xl bg-bg-inverse text-t-inverse font-bold text-[12px] active:scale-95 transition-all">
                        스캔하기
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════════ */
export default function PredictionLeaguePage() {
    const router   = useRouter();
    const [screen, setScreen] = useState('main');

    const props = { router, setScreen };

    if (screen === 'main')     return <MainLeague    {...props} />;
    if (screen === 'register') return <RegisterScreen {...props} />;
    if (screen === 'bracket')  return <BracketScreen  {...props} />;
    if (screen === 'shop')     return <ShopScreen     {...props} />;
    return null;
}
