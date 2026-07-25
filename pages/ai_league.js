import React, { useState } from 'react';
import { useRouter } from 'next/router';

/* ─── 로또 상수 ─────────────────────────────────────────── */
const LOTTO_TYPE = { flag: '🇰🇷', name: '로또6/45', pick: 6, max: 45 };

const LOTTO_COLOR = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

/* ─── 예측 소스 (history = 저장된 번호 목록) ─────────────── */
const REGISTER_SOURCES = [
    {
        id: 'champ', label: '럭키이벤트 픽', desc: '내가 생성한 번호', icon: 'emoji_events', color: '#fbbf24',
        history: [
            { label: '픽 A세트', sub: '밸런스형 조합', date: '4/20', nums: [3,17,25,32,38,44] },
            { label: '픽 B세트', sub: '고번호 집중형', date: '4/20', nums: [7,19,28,34,39,42] },
            { label: '픽 C세트', sub: '분산형 조합',   date: '4/19', nums: [2,11,23,31,37,45] },
            { label: '픽 D세트', sub: '저번호 집중형', date: '4/18', nums: [6,14,22,30,36,43] },
        ],
    },
    {
        id: 'picker', label: 'AI 럭키 도슨트', desc: '행운부적 추천 번호', icon: 'auto_awesome', color: '#a78bfa',
        history: [
            { label: '대화 #1', sub: '"오늘 재수 좋은 번호"', date: '4/21', nums: [7,14,22,31,38,43] },
            { label: '대화 #2', sub: '"꿈에서 본 숫자"',      date: '4/19', nums: [5,12,20,29,36,41] },
            { label: '대화 #3', sub: '"생일 기반 번호"',      date: '4/17', nums: [9,18,24,33,39,44] },
        ],
    },
    {
        id: 'scanner', label: 'AI 낙첨번호 재추첨', desc: 'AI Re-Draw 번호', icon: 'document_scanner', color: '#34d399',
        history: [
            { label: 'Re-Draw #1', sub: '아쉬움 지수 92점 · 제1159회', date: '4/21', nums: [11,19,27,33,39,42] },
            { label: 'Re-Draw #2', sub: '아쉬움 지수 78점 · 제1158회', date: '4/19', nums: [8,16,24,30,38,44] },
            { label: 'Re-Draw #3', sub: '아쉬움 지수 65점 · 제1157회', date: '4/17', nums: [4,13,22,28,35,43] },
        ],
    },
    {
        id: 'manual', label: '직접 입력', desc: '숫자를 직접 선택', icon: 'grid_on', color: '#60a5fa',
        history: null,
    },
];

/* ─── AI 모델 ────────────────────────────────────────────── */
const AI_MODELS = [
    { id: 'deep', name: '딥러닝 패턴', icon: 'psychology',  color: '#a78bfa', totalWins: 12, winRate: 34, nums: [8,14,24,31,37,43] },
    { id: 'stat', name: '통계 최적화', icon: 'bar_chart',   color: '#60a5fa', totalWins: 9,  winRate: 28, nums: [3,17,22,34,39,45] },
    { id: 'rand', name: '완전 랜덤',   icon: 'casino',      color: '#f472b6', totalWins: 4,  winRate: 18, nums: [5,12,20,28,36,41] },
];

/* ─── 지난 주 데이터 ─────────────────────────────────────── */
const LAST_WEEK_BOARD = [
    { rank: 1, name: '딥러닝 패턴',  isAi: true,  icon: 'psychology', color: '#a78bfa', nums: [8,14,24,31,37,43], hits: 6 },
    { rank: 2, name: '행운왕_철수',  isAi: false, avatar: 'https://i.pravatar.cc/80?img=11', nums: [8,14,22,31,37,43], hits: 5 },
    { rank: 3, name: 'lotto_king',   isAi: false, avatar: 'https://i.pravatar.cc/80?img=32', nums: [7,14,24,31,38,43], hits: 4 },
    { rank: 4, name: '나',           isAi: false, avatar: 'https://i.pravatar.cc/80?img=47', nums: [3,14,22,31,38,43], hits: 3, isMe: true },
    { rank: 5, name: 'lucky_7777',   isAi: false, avatar: 'https://i.pravatar.cc/80?img=23', nums: [7,13,21,30,36,42], hits: 2 },
];
const LAST_WIN_NUMS = [8, 14, 24, 31, 37, 43];
const TOTAL_ENTRIES = 47;

/* ─── 보상 체계 ─────────────────────────────────────────── */
const REWARDS = [
    { minRank: 1,  maxRank: 1,  emoji: '🥇', label: '1위',  points: 500, bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)'  },
    { minRank: 2,  maxRank: 2,  emoji: '🥈', label: '2위',  points: 300, bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.3)' },
    { minRank: 3,  maxRank: 3,  emoji: '🥉', label: '3위',  points: 150, bg: 'rgba(205,127,50,0.1)',  border: 'rgba(205,127,50,0.3)'  },
    { minRank: 4,  maxRank: 10, emoji: '🎖️', label: '입상', points: 50,  bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.2)'  },
];

function getReward(rank) {
    return REWARDS.find(r => rank >= r.minRank && rank <= r.maxRank) || null;
}

/* ─── Ball ───────────────────────────────────────────────── */
function Ball({ n, dim, size = 'md' }) {
    const cls = size === 'lg' ? 'w-11 h-11 text-[14px]' : size === 'sm' ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[11px]';
    return (
        <div className={`${cls} rounded-full flex items-center justify-center font-extrabold flex-shrink-0 ${dim ? 'opacity-20' : ''} ${LOTTO_COLOR(n)}`}>
            {String(n).padStart(2, '0')}
        </div>
    );
}

/* ─── 예측 등록 모달 ─────────────────────────────────────── */
function RegisterModal({ onClose, onRegister }) {
    const [step, setStep]               = useState('source');
    const [source, setSource]           = useState(null);
    const [selectedEntry, setSelected]  = useState(null);
    const [manualNums, setManualNums]   = useState([]);

    const handleSourceTap = (src) => {
        setSource(src);
        setSelected(null);
        setManualNums([]);
        setStep('pick');
    };

    const toggleManual = (n) => {
        setManualNums(prev =>
            prev.includes(n)
                ? prev.filter(x => x !== n)
                : prev.length < LOTTO_TYPE.pick ? [...prev, n].sort((a, b) => a - b) : prev
        );
    };

    const finalNums = selectedEntry?.nums ?? manualNums;
    const canRegister = source?.history ? selectedEntry !== null : manualNums.length === LOTTO_TYPE.pick;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}>
            <div className="w-full max-w-[430px] rounded-t-3xl flex flex-col"
                style={{ background: '#141414', maxHeight: '88vh' }}
                onClick={e => e.stopPropagation()}>

                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 flex-shrink-0" />

                {/* 헤더 */}
                <div className="flex items-center gap-2 px-5 pt-4 pb-3 flex-shrink-0">
                    {step === 'pick' && (
                        <button onClick={() => setStep('source')}
                            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 flex-shrink-0">
                            <span className="material-symbols-outlined text-[19px]">arrow_back_ios_new</span>
                        </button>
                    )}
                    <div className="flex-1">
                        <p className="text-[15px] font-extrabold text-white">
                            {step === 'source' ? '예측 번호 등록' : source?.label}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-t-muted">제1160회</span>
                            <span className="text-white/15">·</span>
                            <span className="text-[11px] text-t-muted">{LOTTO_TYPE.flag} {LOTTO_TYPE.name}</span>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px] text-t-muted">close</span>
                    </button>
                </div>

                {/* ── 소스 선택 ── */}
                {step === 'source' && (
                    <div className="flex flex-col gap-2 px-5 pb-6 overflow-y-auto">
                        <p className="text-[11px] text-t-muted font-medium mb-1">번호를 가져올 곳을 선택하세요</p>
                        {REGISTER_SOURCES.map(src => (
                            <button key={src.id}
                                onClick={() => handleSourceTap(src)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left active:opacity-70 transition-opacity"
                                style={{ background: `${src.color}0d`, border: `1px solid ${src.color}25` }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${src.color}18` }}>
                                    <span className="material-symbols-outlined text-[18px]"
                                        style={{ color: src.color, fontVariationSettings: "'FILL' 1" }}>{src.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-white">{src.label}</p>
                                    <p className="text-[11px] text-t-muted font-medium">{src.desc}</p>
                                </div>
                                <span className="material-symbols-outlined text-[20px] text-white/20 flex-shrink-0">chevron_right</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── 히스토리에서 선택 ── */}
                {step === 'pick' && source?.history && (
                    <div className="flex flex-col flex-1 min-h-0">
                        <p className="text-[11px] text-t-muted font-medium px-5 pb-3">
                            번호를 선택하세요
                        </p>
                        {/* 스크롤 리스트 */}
                        <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-2">
                            {source.history.map((entry, i) => {
                                const isSelected = selectedEntry === entry;
                                return (
                                    <button key={i}
                                        onClick={() => setSelected(isSelected ? null : entry)}
                                        className="flex flex-col gap-2.5 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                                        style={{
                                            background: isSelected ? `${source.color}18` : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${isSelected ? source.color + '55' : 'rgba(255,255,255,0.08)'}`,
                                        }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[13px] font-bold text-white">{entry.label}</p>
                                                <p className="text-[11px] text-t-muted font-medium">{entry.sub}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-white/25">{entry.date}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-transparent' : 'border-white/20'}`}
                                                    style={isSelected ? { background: source.color } : {}}>
                                                    {isSelected && <span className="material-symbols-outlined text-[13px] text-black" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {entry.nums.map(n => <Ball key={n} n={n} />)}
                                        </div>
                                    </button>
                                );
                            })}
                            <div className="h-2" />
                        </div>
                        {/* 고정 하단 버튼 */}
                        <div className="px-5 py-4 flex-shrink-0 border-t border-white/5">
                            <button onClick={() => canRegister && onRegister(finalNums)}
                                disabled={!canRegister}
                                className="w-full py-4 rounded-2xl font-extrabold text-[15px] active:scale-95 transition-all disabled:opacity-25"
                                style={{ background: canRegister ? source.color : 'rgba(255,255,255,0.08)', color: 'black' }}>
                                {canRegister ? '이 번호로 등록하기' : '번호를 선택하세요'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── 직접 입력 ── */}
                {step === 'pick' && !source?.history && (
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* 선택된 번호 미리보기 */}
                        <div className="flex items-center gap-2 px-5 pb-4 flex-shrink-0">
                            <div className="flex gap-1.5 flex-1 min-h-[36px] items-center">
                                {manualNums.length === 0
                                    ? <p className="text-[12px] text-white/20 font-medium">아래에서 번호를 선택하세요</p>
                                    : manualNums.map(n => <Ball key={n} n={n} />)
                                }
                            </div>
                            <span className="text-[12px] font-bold flex-shrink-0"
                                style={{ color: canRegister ? '#34d399' : 'rgba(255,255,255,0.25)' }}>
                                {manualNums.length}/{LOTTO_TYPE.pick}
                            </span>
                        </div>
                        {/* 번호 그리드 */}
                        <div className="flex-1 overflow-y-auto px-5">
                            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
                                {Array.from({ length: LOTTO_TYPE.max }, (_, i) => i + 1).map(n => {
                                    const isSelected = manualNums.includes(n);
                                    const isFull = !isSelected && manualNums.length >= LOTTO_TYPE.pick;
                                    return (
                                        <button key={n} onClick={() => !isFull && toggleManual(n)}
                                            className={`aspect-square rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all active:scale-90 ${isFull ? 'opacity-20' : ''} ${isSelected ? LOTTO_COLOR(n) : 'bg-white/8 text-white/50'}`}>
                                            {String(n).padStart(2, '0')}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="h-2" />
                        </div>
                        <div className="px-5 py-4 flex-shrink-0 border-t border-white/5">
                            <button onClick={() => canRegister && onRegister(finalNums)}
                                disabled={!canRegister}
                                className="w-full py-4 rounded-2xl font-extrabold text-[15px] active:scale-95 transition-all disabled:opacity-25"
                                style={{ background: canRegister ? '#60a5fa' : 'rgba(255,255,255,0.08)', color: 'black' }}>
                                {canRegister ? '등록하기' : `${LOTTO_TYPE.pick - manualNums.length}개 더 선택`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── 메인 페이지 ─────────────────────────────────────────── */
export default function AiLeaguePage() {
    const router = useRouter();
    const [tab, setTab]                       = useState('this');
    const [registered, setRegistered]         = useState(false);
    const [myNums, setMyNums]                 = useState([]);
    const [showRegisterModal, setShowModal]   = useState(false);
    const [followed, setFollowed]             = useState({});
    const [showRewardModal, setShowReward]    = useState(false);
    const [rewardClaimed, setRewardClaimed]   = useState(false);

    const myLastEntry = LAST_WEEK_BOARD.find(e => e.isMe);
    const myReward    = myLastEntry ? getReward(myLastEntry.rank) : null;

    const handleRegister = (nums) => { setMyNums(nums); setRegistered(true); setShowModal(false); };
    const toggleFollow   = (name) => setFollowed(p => ({ ...p, [name]: !p[name] }));

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-24">

            {/* ── 헤더 ── */}
            <header className="flex items-center px-4 pt-6 pb-3 relative">
                <button onClick={() => router.push('/?tab=contents')}
                    className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <p className="text-[15px] font-extrabold">AI vs 유저 리그</p>
                    <p className="text-[10px] text-t-muted font-medium">시즌 1 · 3주차</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" style={{ animation: 'lp 1.5s ease infinite' }} />
                    <span className="text-[10px] font-extrabold text-[#34d399] tracking-wider">LIVE</span>
                </div>
            </header>

            {/* ── 시즌 배너 ── */}
            <div className="relative overflow-hidden mx-6 mt-1 mb-4 rounded-3xl border"
                style={{ background: 'linear-gradient(145deg, #0e0225 0%, #18093e 55%, #09152b 100%)', borderColor: 'rgba(167,139,250,0.22)' }}>
                <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2), transparent 70%)' }} />
                <div className="relative z-10 p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] text-purple-300/50 font-bold uppercase tracking-widest mb-1">예측 등록 중</p>
                            <p className="text-[22px] font-extrabold text-white leading-tight">
                                제1160회<br /><span className="text-purple-300">D-3</span> 남음
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-1">
                            <div className="flex items-center gap-1.5 bg-white/6 rounded-full px-3 py-1.5">
                                <span className="text-[12px]">{LOTTO_TYPE.flag}</span>
                                <span className="text-[10px] font-bold text-white/70">{LOTTO_TYPE.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/6 rounded-full px-3 py-1.5">
                                <span className="material-symbols-outlined text-[13px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                                <span className="text-[11px] font-bold text-white">{TOTAL_ENTRIES}명 참가</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white/6 rounded-full pl-2 pr-3 py-1.5">
                                {AI_MODELS.map(m => (
                                    <span key={m.id} className="material-symbols-outlined text-[13px]"
                                        style={{ color: m.color, fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                                ))}
                                <span className="text-[10px] font-bold text-white/50 ml-1">AI 3모델</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl p-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span className="material-symbols-outlined text-[18px] text-t-muted">history</span>
                        <div className="flex-1">
                            <p className="text-[10px] text-t-muted font-medium">지난 주(제1159회) 내 결과</p>
                            <p className="text-[13px] font-extrabold text-white">{myLastEntry?.rank}위 · {myLastEntry?.hits}개 적중</p>
                        </div>
                        <button onClick={() => setTab('last')} className="text-[11px] font-bold text-purple-300 active:opacity-60">결과 보기</button>
                    </div>

                    {registered ? (
                        <div className="rounded-2xl p-4 flex flex-col gap-3"
                            style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    <p className="text-[12px] font-extrabold text-[#34d399]">제1160회 예측 등록 완료</p>
                                </div>
                                <button onClick={() => setShowModal(true)} className="text-[10px] text-white/30 font-bold active:opacity-60">수정</button>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {myNums.map(n => <Ball key={n} n={n} size="sm" />)}
                            </div>
                            <p className="text-[10px] text-white/20 font-medium">번호는 추첨 후 공개됩니다</p>
                        </div>
                    ) : (
                        <button onClick={() => setShowModal(true)}
                            className="w-full py-3.5 rounded-2xl font-extrabold text-[14px] text-black active:scale-95 transition-all"
                            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
                            예측 등록하기
                        </button>
                    )}
                </div>
            </div>

            {/* ── 탭 ── */}
            <div className="flex gap-1 mx-6 mb-4 bg-card-gray rounded-xl p-1">
                {[['this', '이번 주'], ['last', '지난 주 결과']].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all ${tab === id ? 'bg-accent text-accent-fg' : 'text-t-muted'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ══ 이번 주 ══ */}
            {tab === 'this' && (
                <div className="flex flex-col px-6 gap-4">
                    {registered && (
                        <div className="rounded-2xl p-4 flex flex-col gap-3 border"
                            style={{ background: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[15px] text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                                <p className="text-[12px] font-extrabold text-[#34d399]">내 예측 번호 · 제1160회</p>
                                <span className="ml-auto text-[10px] text-white/25 font-medium">추첨 후 공개</span>
                            </div>
                            <div className="flex gap-1.5">
                                {myNums.map(n => (
                                    <div key={n} className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold bg-white/8 text-white/35 border border-white/10">
                                        {String(n).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="text-[11px] font-bold text-t-muted uppercase tracking-widest">AI 예측 번호 · 제1160회</p>
                    {AI_MODELS.map(m => (
                        <div key={m.id} className="rounded-2xl p-4 flex flex-col gap-3 border"
                            style={{ background: `${m.color}0d`, borderColor: `${m.color}28` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}18` }}>
                                    <span className="material-symbols-outlined text-[18px]" style={{ color: m.color, fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[13px] font-extrabold text-white">{m.name}</p>
                                    <p className="text-[10px] text-t-muted font-medium">역대 우승 {m.totalWins}회 · 승률 {m.winRate}%</p>
                                </div>
                                <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full" style={{ background: `${m.color}20`, color: m.color }}>AI</span>
                            </div>
                            <div className="flex gap-1.5">{m.nums.map(n => <Ball key={n} n={n} />)}</div>
                        </div>
                    ))}
                    <div className="bg-card-gray rounded-2xl p-4 border border-themed flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-extrabold text-white">{TOTAL_ENTRIES}명 예측 등록 완료</p>
                            <p className="text-[11px] text-t-muted font-medium mt-0.5">유저 번호는 추첨 후 공개</p>
                        </div>
                        <p className="text-[28px] font-extrabold text-white">{TOTAL_ENTRIES}<span className="text-[13px] text-white/30 font-medium ml-0.5">명</span></p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-bold text-t-muted uppercase tracking-widest">이번 주 보상</p>
                        <div className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                            {REWARDS.map((r, i) => (
                                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < REWARDS.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <span className="text-[16px] w-5 text-center flex-shrink-0">{r.emoji}</span>
                                    <span className="text-[12px] font-bold text-t-primary flex-1">{r.minRank === r.maxRank ? `${r.minRank}위` : `${r.minRank}~${r.maxRank}위`}</span>
                                    <span className="text-[13px] font-extrabold text-[#34d399]">+{r.points}P</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ 지난 주 결과 ══ */}
            {tab === 'last' && (
                <div className="flex flex-col px-6 gap-3">
                    {myReward && (
                        <div className="rounded-2xl p-4 flex items-center gap-4"
                            style={{ background: myReward.bg, border: `1px solid ${myReward.border}` }}>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px]">{myReward.emoji}</span>
                                    <span className="text-[13px] font-extrabold text-white">{myReward.label} 보상 획득!</span>
                                    {!rewardClaimed && <span className="text-[8px] font-extrabold bg-red-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">NEW</span>}
                                </div>
                                <p className="text-[11px] text-t-muted font-medium">{myLastEntry?.hits}개 적중 · {myLastEntry?.rank}위</p>
                                <span className="text-[15px] font-extrabold text-[#34d399] mt-1">+{myReward.points}P</span>
                            </div>
                            <button onClick={() => setShowReward(true)}
                                className="px-4 py-2.5 rounded-xl text-[12px] font-extrabold active:scale-95 transition-all flex-shrink-0"
                                style={{ background: rewardClaimed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)', color: rewardClaimed ? 'rgba(255,255,255,0.3)' : 'white' }}>
                                {rewardClaimed ? '수령 완료' : '보상 받기'}
                            </button>
                        </div>
                    )}
                    <div className="bg-card-gray rounded-2xl p-4 border border-themed flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-t-muted uppercase tracking-wider">제1159회 당첨 번호</p>
                        <div className="flex gap-1.5">{LAST_WIN_NUMS.map(n => <Ball key={n} n={n} />)}</div>
                    </div>
                    <p className="text-[11px] text-t-muted font-medium">제1159회 기준 최종 결과</p>
                    {(() => {
                        const top = LAST_WEEK_BOARD[0];
                        return (
                            <div className="rounded-2xl p-4 flex gap-3"
                                style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.13), rgba(167,139,250,0.04))', border: '1px solid rgba(167,139,250,0.25)' }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                    style={{ background: top.isAi ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.08)' }}>
                                    {top.isAi
                                        ? <span className="material-symbols-outlined text-[24px] text-purple-300" style={{ fontVariationSettings: "'FILL' 1" }}>{top.icon}</span>
                                        : <img src={top.avatar} alt={top.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[14px] font-extrabold text-white">{top.name}</span>
                                        {top.isAi && <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">AI</span>}
                                        <span className="text-[11px] text-[#FBC400] font-extrabold ml-auto">👑 1위</span>
                                    </div>
                                    <div className="flex gap-1.5">{top.nums.map(n => <Ball key={n} n={n} dim={!LAST_WIN_NUMS.includes(n)} />)}</div>
                                    <p className="text-[10px] text-purple-300/50 font-medium mt-1.5">{top.hits}개 적중</p>
                                </div>
                            </div>
                        );
                    })()}
                    <div className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                        {LAST_WEEK_BOARD.map((e, i) => (
                            <div key={e.rank}
                                className={`flex items-center gap-3 px-4 py-3.5 ${i < LAST_WEEK_BOARD.length - 1 ? 'border-b border-white/5' : ''} ${e.isMe ? 'bg-[#34d399]/5' : ''}`}>
                                <span className="text-[13px] font-extrabold w-5 text-center flex-shrink-0"
                                    style={{ color: ['', '#FBC400', '#C0C0C0', '#CD7F32'][e.rank] || 'rgba(255,255,255,0.2)' }}>
                                    {e.rank}
                                </span>
                                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                                    style={{ background: e.isAi ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.06)' }}>
                                    {e.isAi
                                        ? <span className="material-symbols-outlined text-[17px] text-purple-300" style={{ fontVariationSettings: "'FILL' 1" }}>{e.icon}</span>
                                        : <img src={e.avatar} alt={e.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="text-[13px] font-bold truncate">{e.name}</span>
                                        {e.isAi && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 flex-shrink-0">AI</span>}
                                        {e.isMe && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#34d399]/15 text-[#34d399] flex-shrink-0">나</span>}
                                    </div>
                                    <div className="flex gap-1">{e.nums.map(n => <Ball key={n} n={n} dim={!LAST_WIN_NUMS.includes(n)} />)}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <span className="text-[14px] font-extrabold">{e.hits}<span className="text-[10px] text-white/30 font-medium ml-0.5">개</span></span>
                                    {!e.isMe && !e.isAi && (
                                        <button onClick={() => toggleFollow(e.name)}
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all ${followed[e.name] ? 'bg-[#34d399]/20 text-[#34d399]' : 'bg-white/6 text-t-muted'}`}>
                                            {followed[e.name] ? '팔로잉' : '팔로우'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showRegisterModal && <RegisterModal onClose={() => setShowModal(false)} onRegister={handleRegister} />}

            {showRewardModal && myReward && (
                <div className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setShowReward(false)}>
                    <div className="w-full max-w-[430px] rounded-t-3xl p-6 flex flex-col gap-5"
                        style={{ background: '#141414' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-2" />
                        <div className="flex flex-col items-center gap-1.5 text-center">
                            <p className="text-[44px] leading-tight">{myReward.emoji}</p>
                            <p className="text-[20px] font-extrabold text-white">지난 주 {myReward.label} 달성!</p>
                            <p className="text-[13px] text-t-muted font-medium">제1159회 · {myLastEntry?.hits}개 적중 · {myLastEntry?.rank}위</p>
                        </div>
                        <div className="bg-card-gray rounded-2xl p-4 flex items-center gap-3 border border-themed">
                            <div className="w-10 h-10 rounded-xl bg-[#34d399]/15 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[20px] text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-bold text-white">포인트 보상</p>
                                <p className="text-[11px] text-t-muted">다음 시즌에 사용 가능</p>
                            </div>
                            <span className="text-[22px] font-extrabold text-[#34d399]">+{myReward.points}P</span>
                        </div>
                        <button onClick={() => { setRewardClaimed(true); setShowReward(false); }}
                            disabled={rewardClaimed}
                            className="w-full py-4 rounded-2xl font-extrabold text-[15px] active:scale-95 transition-all disabled:opacity-40"
                            style={{ background: rewardClaimed ? 'rgba(255,255,255,0.06)' : 'white', color: rewardClaimed ? 'rgba(255,255,255,0.3)' : 'black' }}>
                            {rewardClaimed ? '이미 수령했습니다' : `+${myReward.points}P 받기`}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`@keyframes lp { 0%,100%{opacity:1;} 50%{opacity:0.35;} }`}</style>
        </div>
    );
}
