import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

/* ─── 캐릭터 정의 ──────────────────────────────────────── */
const CHARACTERS = {
    doctor: {
        id: 'doctor',
        name: '닥터 로또',
        title: '데이터 분석가',
        tag: '데이터 중심',
        tagColor: 'text-[#14b8a6] bg-[#14b8a6]/10',
        gradient: 'from-[#0f2027] via-[#203a43] to-[#2c5364]',
        cardGradient: 'from-[#0f2027] via-[#1a3a4a] to-[#0e4a5a]',
        accentColor: '#14b8a6',
        icon: 'biotech',
        iconBg: 'bg-[#14b8a6]/20',
        iconColor: 'text-[#14b8a6]',
        borderColor: 'border-[#14b8a6]/30',
        bubbleBg: 'bg-[#1e3a42]',
        inputBg: 'bg-[#1e3a42]/50',
        greeting: '안녕하세요. 저는 52주간의 당첨 데이터를 분석하는 닥터 로또입니다.',
        prompt: '오늘 꿈이나 특별한 경험을 말씀해주시면, 데이터 패턴과 연결해 번호를 도출해드리겠습니다.',
        closingDoctor: (conf) => `입력하신 경험에서 ${conf}%의 패턴 일치도를 확인했습니다. 아래 번호들이 이번 회차 데이터와 가장 높은 연관성을 보입니다.`,
        closing: null,
    },
    shaman: {
        id: 'shaman',
        name: '샤먼 스텔라',
        title: '직관의 안내자',
        tag: '직관 중심',
        tagColor: 'text-purple-400 bg-purple-400/10',
        gradient: 'from-[#1a0533] via-[#2d1b4e] to-[#3d2060]',
        cardGradient: 'from-[#1a0533] via-[#2d1b4e] to-[#1a0533]',
        accentColor: '#a78bfa',
        icon: 'auto_awesome',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        bubbleBg: 'bg-[#2d1b4e]',
        inputBg: 'bg-purple-900/20',
        greeting: '안녕, 나는 샤먼 스텔라야 ✨',
        prompt: '오늘 꿈이나 특별한 일을 나에게 속삭여봐. 우주의 메시지를 읽어줄게.',
        closingDoctor: null,
        closing: '우주가 당신에게 보내는 메시지를 담았어요 ✨ 이 번호와 함께 행운이 찾아오길 바랄게요!',
    },
};

/* ─── Lucky DB ────────────────────────────────────────── */
const LUCKY_DB = {
    '바다': { symbol: '🌊', meaning: '광대함과 풍요', nums: [7, 27], doctorReason: '파란 계열 번호(20-30대)가 최근 12회차 출현율 +18%', shamanReason: '바다는 무한한 가능성과 풍요의 상징이에요' },
    '고래': { symbol: '🐋', meaning: '대형 행운의 전조', nums: [14, 42], doctorReason: '대형 동물 키워드: 10대·40대 번호 당첨 빈도 상위 15%', shamanReason: '고래를 만난 꿈은 인생의 큰 전환점을 알려줘요' },
    '하늘': { symbol: '☁️', meaning: '높은 이상과 자유', nums: [3, 33], doctorReason: '3의 배수 계열이 이번 회차 Hot 구간으로 분류됨', shamanReason: '하늘은 당신의 무한한 가능성을 품고 있어요' },
    '불': { symbol: '🔥', meaning: '강한 에너지', nums: [5, 35], doctorReason: '홀수 끝자리 번호군이 최근 5회차 연속 출현', shamanReason: '불꽃은 강렬한 변화의 에너지를 담고 있어요' },
    '물': { symbol: '💧', meaning: '흐름과 변화', nums: [9, 29], doctorReason: '9 계열 번호가 전체 평균 대비 출현율 +12%', shamanReason: '물은 막힌 것을 뚫어내는 변화의 힘이에요' },
    '산': { symbol: '⛰️', meaning: '안정과 인내', nums: [11, 41], doctorReason: '11·41은 이번 회차 Cold 탈출 직전 번호로 분류', shamanReason: '산은 오랜 인내 끝에 찾아오는 큰 보상이에요' },
    '꽃': { symbol: '🌸', meaning: '개화와 새로운 시작', nums: [6, 26], doctorReason: '6·26은 최근 3주 연속 미출현으로 역출현 확률 상승', shamanReason: '꽃은 오랫동안 기다려온 행운이 꽃피는 신호예요' },
    '새': { symbol: '🐦', meaning: '자유와 좋은 소식', nums: [8, 18], doctorReason: '8·18은 짝수 연속 패턴 중 당첨 포함율 23%로 최상위', shamanReason: '새는 하늘에서 보내는 기쁜 소식의 전령이에요' },
    '꿈': { symbol: '💫', meaning: '잠재된 가능성', nums: [3, 21], doctorReason: '꿈 관련 입력 패턴에서 3·21 조합이 통계적 유의미', shamanReason: '꿈 속의 메시지는 우주가 직접 보내는 신호예요' },
    '만남': { symbol: '🤝', meaning: '새로운 인연과 기회', nums: [12, 22], doctorReason: '12·22 쌍은 최근 회차 연속 출현 패턴에 부합', shamanReason: '만남은 인연의 실이 엮이는 특별한 순간이에요' },
    '금': { symbol: '✨', meaning: '부와 성공의 기운', nums: [1, 31], doctorReason: '1·31은 이번 회차 당첨 예측 모델 상위 10% 번호', shamanReason: '황금빛 기운은 풍요의 문이 열리는 신호예요' },
    '별': { symbol: '⭐', meaning: '빛나는 운명', nums: [17, 37], doctorReason: '17·37은 소수 번호 계열로 출현 주기 충족 임박', shamanReason: '별은 당신만을 위해 빛나는 운명의 표시예요' },
};
const FALLBACK_KEYWORDS = ['꿈', '별', '금'];

const LOTTO_COLOR = (n) => {
    if (n <= 10) return 'bg-[#FBC400] text-black';
    if (n <= 20) return 'bg-[#69C8F2] text-black';
    if (n <= 30) return 'bg-[#FF7272] text-white';
    if (n <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

function extractKeywords(text) {
    const found = Object.keys(LUCKY_DB).filter(k => text.includes(k));
    return found.length > 0 ? found.slice(0, 3) : FALLBACK_KEYWORDS;
}

function buildResult(keywords, charId) {
    const allNums = [];
    keywords.forEach(k => {
        if (LUCKY_DB[k]) LUCKY_DB[k].nums.forEach(n => { if (!allNums.includes(n)) allNums.push(n); });
    });
    while (allNums.length < 6) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!allNums.includes(n)) allNums.push(n);
    }
    return {
        nums: allNums.slice(0, 6).sort((a, b) => a - b),
        reasons: keywords.map(k => ({
            keyword: k,
            symbol: LUCKY_DB[k]?.symbol,
            meaning: LUCKY_DB[k]?.meaning,
            reason: charId === 'doctor' ? LUCKY_DB[k]?.doctorReason : LUCKY_DB[k]?.shamanReason,
            nums: LUCKY_DB[k]?.nums,
        })),
    };
}

const EXAMPLES = ['바다에서 고래를 만났어', '하늘에서 별이 떨어졌어', '황금 꽃밭을 걸었어'];

/* ─── 채팅 말풍선 ─────────────────────────────────────── */
function BotBubble({ char, text, delay = 0 }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, []);
    if (!visible) return <div className="h-10" />;
    return (
        <div className="flex items-end gap-2" style={{ animation: 'slideUp 0.3s ease' }}>
            <div className={`w-9 h-9 rounded-full ${char.iconBg} flex items-center justify-center flex-shrink-0 mb-1`}>
                <span className={`material-symbols-outlined text-[16px] ${char.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{char.icon}</span>
            </div>
            <div className={`${char.bubbleBg} border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[78%]`}>
                <p className="text-[14px] text-t-primary leading-relaxed">{text}</p>
            </div>
        </div>
    );
}

function UserBubble({ text, accentColor }) {
    return (
        <div className="flex justify-end" style={{ animation: 'slideUp 0.2s ease' }}>
            <div className="rounded-2xl rounded-br-sm px-4 py-3 max-w-[78%]" style={{ backgroundColor: accentColor }}>
                <p className="text-[14px] text-white font-medium">{text}</p>
            </div>
        </div>
    );
}

/* ─── 행운 부적 카드 (세로형) ─────────────────────────── */
function LuckyCharmCard({ char, nums, keywords, confidence, reasons }) {
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const glyph = char.id === 'doctor' ? '⬡' : '✦';

    return (
        /* 카드 외곽 — 골드 테두리 + 그림자 */
        <div className="mx-auto w-full max-w-[320px]"
            style={{ filter: `drop-shadow(0 8px 32px ${char.accentColor}40)` }}>
            <div
                className="relative rounded-[28px] overflow-hidden flex flex-col"
                style={{
                    background: `linear-gradient(160deg, #0a0a0a 0%, #111 60%, #0a0a0a 100%)`,
                    border: `1.5px solid ${char.accentColor}50`,
                }}
            >
                {/* ── 골드 테두리 안쪽 라인 */}
                <div className="absolute inset-[6px] rounded-[22px] pointer-events-none"
                    style={{ border: `1px solid ${char.accentColor}20` }} />

                {/* ── 배경 문양 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                    <span className="text-[320px] leading-none select-none" style={{ color: char.accentColor }}>{glyph}</span>
                </div>
                <div className="absolute top-5 left-5 opacity-10 text-[28px]" style={{ color: char.accentColor }}>{glyph}</div>
                <div className="absolute top-5 right-5 opacity-10 text-[28px]" style={{ color: char.accentColor }}>{glyph}</div>

                {/* ── 상단: 브랜드 + 캐릭터 */}
                <div className="relative z-10 pt-7 px-7 flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em]"
                        style={{ color: `${char.accentColor}80` }}>CWG · AI 럭키 도슨트</p>

                    {/* 캐릭터 아이콘 링 */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ background: `radial-gradient(circle, ${char.accentColor}30, transparent)`, border: `1.5px solid ${char.accentColor}50` }}>
                            <span className={`material-symbols-outlined text-[30px] ${char.iconColor}`}
                                style={{ fontVariationSettings: "'FILL' 1" }}>{char.icon}</span>
                        </div>
                        {/* 회전 링 */}
                        <div className="absolute -inset-2 rounded-full opacity-40"
                            style={{ border: `1px dashed ${char.accentColor}`, animation: 'slowSpin 12s linear infinite' }} />
                    </div>

                    <div className="text-center">
                        <p className="text-white font-extrabold text-[17px]">{char.name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: `${char.accentColor}90` }}>{char.title}</p>
                    </div>
                </div>

                {/* ── 구분선 */}
                <div className="relative z-10 mx-7 my-5 flex items-center gap-3">
                    <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${char.accentColor}50)` }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${char.accentColor}70` }}>행운의 번호</span>
                    <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${char.accentColor}50)` }} />
                </div>

                {/* ── 번호 (중앙 메인) */}
                <div className="relative z-10 px-7 flex justify-center gap-1">
                    {nums.map((n, i) => (
                        <div key={n}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold shadow-lg ${LOTTO_COLOR(n)}`}
                            style={{ animation: `popIn 0.4s ease ${i * 0.08}s both` }}>
                            {String(n).padStart(2, '0')}
                        </div>
                    ))}
                </div>


                {/* ── 번호 해석 구분선 */}
                <div className="relative z-10 mx-7 my-5 flex items-center gap-3">
                    <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${char.accentColor}30)` }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${char.accentColor}50` }}>번호 해석</span>
                    <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${char.accentColor}30)` }} />
                </div>

                {/* ── 번호 해석 */}
                <div className="relative z-10 px-7 flex flex-col gap-3">
                    {reasons?.slice(0, 2).map((r, i) => (
                        <div key={i} className="rounded-2xl p-3 flex gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>{r.symbol}</div>
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[12px] font-bold text-white">"{r.keyword}"</span>
                                    <span className="text-[10px]" style={{ color: `${char.accentColor}70` }}>→ {r.meaning}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.reason}</p>
                                <div className="flex gap-1 mt-0.5">
                                    {r.nums.map(n => (
                                        <span key={n} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${LOTTO_COLOR(n)}`}>
                                            {String(n).padStart(2, '0')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── 하단 푸터 */}
                <div className="relative z-10 mt-6 mb-6 mx-7 flex items-center justify-between">
                    <p className="text-[10px]" style={{ color: `${char.accentColor}40` }}>{today}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${char.accentColor}40` }}>cwg.ai</p>
                </div>
            </div>
        </div>
    );
}

/* ─── 캐릭터별 후속 질문 ────────────────────────────────── */
const FOLLOW_UPS = {
    doctor: [
        '흥미롭군요. 그 경험에서 어떤 감정이 가장 강하게 느껴졌나요? 감정 변수도 번호 도출에 반영됩니다.',
        '분석이 완료됐습니다. 입력하신 데이터를 기반으로 최적 번호를 도출했습니다. 결과를 확인하시겠습니까?',
    ],
    shaman: [
        '오~ 느낌이 오는데 🌙 그 순간 어떤 색깔이나 빛이 보였어? 색의 기운이 번호를 불러줘.',
        '우주가 드디어 신호를 보내줬어 ✨ 너만을 위한 번호가 완성됐어. 확인해볼래?',
    ],
};

/* ─── 히스토리 데이터 (데모) ─────────────────────────────── */
const PICKER_HISTORY = [
    { id: 1, date: '4/21', charId: 'shaman', charName: '샤먼 스텔라', keywords: ['꿈', '바다', '물'], confidence: 88, nums: [7, 14, 22, 31, 38, 43] },
    { id: 2, date: '4/19', charId: 'doctor', charName: '닥터 로또',   keywords: ['하늘', '금', '꽃'],  confidence: 91, nums: [3, 17, 25, 32, 38, 44] },
    { id: 3, date: '4/17', charId: 'shaman', charName: '샤먼 스텔라', keywords: ['불', '새'],           confidence: 85, nums: [5, 18, 24, 35, 39, 42] },
    { id: 4, date: '4/14', charId: 'doctor', charName: '닥터 로또',   keywords: ['산', '만남'],         confidence: 87, nums: [11, 22, 28, 33, 40, 45] },
    { id: 5, date: '4/12', charId: 'shaman', charName: '샤먼 스텔라', keywords: ['고래', '바다', '꿈'], confidence: 93, nums: [9, 16, 27, 34, 38, 41] },
];

/* ─── 메인 컴포넌트 ─────────────────────────────────────── */
export default function AiLuckyDocentPage() {
    const router = useRouter();
    const [step, setStep]               = useState('select');
    const [character, setCharacter]     = useState(null);
    const [messages, setMessages]       = useState([]);  // { role: 'bot'|'user', text }
    const [inputText, setInputText]     = useState('');
    const [allInputText, setAllInputText] = useState('');
    const [turn, setTurn]               = useState(0);
    const [botTyping, setBotTyping]     = useState(false);
    const [readyForResult, setReadyForResult] = useState(false);
    const [keywords, setKeywords]       = useState([]);
    const [analyzeStep, setAnalyzeStep] = useState(0);
    const [result, setResult]           = useState(null);
    const [confidence, setConfidence]   = useState(() => Math.floor(Math.random() * 10) + 82);
    const bottomRef = useRef(null);
    const inputRef  = useRef(null);
    const char      = character ? CHARACTERS[character] : null;

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, botTyping, step]);

    const loadFromHistory = (item) => {
        setCharacter(item.charId);
        setKeywords(item.keywords);
        setConfidence(item.confidence);
        setResult({ nums: item.nums, reasons: [] });
        setStep('result');
    };

    /* 캐릭터 선택 → 채팅 초기화 */
    const selectCharacter = (id) => {
        setCharacter(id);
        setMessages([]);
        setInputText('');
        setAllInputText('');
        setTurn(0);
        setBotTyping(false);
        setReadyForResult(false);
        setStep('chat');
    };

    /* 텍스트 전송 (멀티턴) */
    const handleSend = () => {
        if (!inputText.trim() || botTyping || readyForResult) return;
        const userText = inputText.trim();
        setAllInputText(prev => prev + ' ' + userText);
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInputText('');
        setBotTyping(true);

        const nextTurn = turn + 1;
        setTurn(nextTurn);
        const followUps = FOLLOW_UPS[character];
        const isLast = nextTurn >= followUps.length;

        setTimeout(() => {
            setBotTyping(false);
            setMessages(prev => [...prev, { role: 'bot', text: followUps[nextTurn - 1] }]);
            if (isLast) setReadyForResult(true);
        }, 900);
    };

    /* 결과 확인 버튼 → 분석 시작 */
    const handleConfirmResult = () => {
        setStep('analyzing');
        const kw = extractKeywords(allInputText);
        setKeywords(kw);
        const timings = [0, 900, 1700, 2500];
        timings.forEach((t, i) => setTimeout(() => setAnalyzeStep(i), t));
        setTimeout(() => {
            setResult(buildResult(kw, character));
            setStep('result');
        }, 3200);
    };

    /* ── 1. 캐릭터 선택 ─────────────────────────────────── */
    if (step === 'history') return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <header className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-themed">
                <button onClick={() => setStep('select')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <p className="text-[16px] font-extrabold">히스토리</p>
            </header>
            <div className="flex flex-col px-6 pt-4 pb-10 gap-3">
                {PICKER_HISTORY.map(item => {
                    const c = CHARACTERS[item.charId];
                    return (
                        <button key={item.id} onClick={() => loadFromHistory(item)}
                            className={`rounded-2xl overflow-hidden border ${c.borderColor} bg-card-gray text-left active:scale-[0.98] transition-all w-full`}>
                            <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${c.cardGradient}`}>
                                <div className={`w-8 h-8 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <span className={`material-symbols-outlined text-[16px] ${c.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-white">{item.charName}</p>
                                    <p className="text-[10px] text-white/40 font-medium">{item.keywords.join(' · ')}</p>
                                </div>
                                <span className="text-[10px] text-white/30 flex-shrink-0">{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-4 py-3">
                                {item.nums.map(n => (
                                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold ${LOTTO_COLOR(n)}`}>
                                        {String(n).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    if (step === 'select') return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <header className="flex items-center gap-3 px-4 pt-6 pb-4">
                <button onClick={() => router.push('/?tab=contents')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
            </header>
            <div className="px-6 pt-2 pb-8 flex flex-col gap-8">
                <div>
                    <p className="text-[12px] font-bold text-t-muted uppercase tracking-widest mb-2">AI 럭키 도슨트</p>
                    <h1 className="text-[26px] font-extrabold leading-tight">당신의 이야기에서<br/>번호를 찾아드려요</h1>
                    <p className="text-t-muted text-[13px] mt-2 leading-relaxed">꿈, 오늘의 경험, 느낌을 말해주세요.<br/>AI가 그 안에서 행운의 번호를 읽어낼게요.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <p className="text-[13px] font-bold text-t-secondary">도슨트를 선택하세요</p>

                    {Object.values(CHARACTERS).map(c => (
                        <button key={c.id} onClick={() => selectCharacter(c.id)}
                            className={`w-full text-left rounded-3xl overflow-hidden border ${c.borderColor} bg-card-gray active:scale-[0.98] transition-all`}>
                            <div className={`w-full h-[100px] bg-gradient-to-br ${c.gradient} flex items-center px-6 gap-4 relative overflow-hidden`}>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                                    <span className="material-symbols-outlined text-[80px] text-white">{c.icon}</span>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center border ${c.borderColor} flex-shrink-0`}>
                                    <span className={`material-symbols-outlined text-[28px] ${c.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                                </div>
                                <div>
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.tagColor}`}>{c.tag}</span>
                                    <p className="text-white text-[18px] font-extrabold mt-1">{c.name}</p>
                                    <p className="text-white/50 text-[11px]">{c.title}</p>
                                </div>
                            </div>
                            <div className="px-5 py-4">
                                <p className="text-[13px] text-t-muted leading-relaxed">{c.greeting}</p>
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );

    /* ── 2. 채팅 ────────────────────────────────────────── */
    if (step === 'chat' && char) return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            {/* 헤더 */}
            <header className="flex items-center gap-3 px-4 pt-6 pb-3 border-b border-themed sticky top-0 bg-background z-10">
                <button onClick={() => setStep('select')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <div className={`w-9 h-9 rounded-full ${char.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-[18px] ${char.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{char.icon}</span>
                </div>
                <div className="flex-1">
                    <p className="text-[15px] font-bold leading-tight">{char.name}</p>
                    <p className="text-[11px] font-medium" style={{ color: char.accentColor }}>
                        {botTyping ? '입력 중...' : readyForResult ? '분석 완료' : '온라인'}
                    </p>
                </div>
            </header>

            {/* 채팅 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 pb-36">
                {/* 초기 봇 메시지 */}
                <BotBubble char={char} text={char.greeting} delay={200} />
                <BotBubble char={char} text={char.prompt} delay={800} />

                {/* 예시 빠른 선택 (첫 메시지 전) */}
                {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2 pl-11 mt-1" style={{ animation: 'slideUp 0.4s ease 1s both' }}>
                        {EXAMPLES.map(ex => (
                            <button key={ex} onClick={() => setInputText(ex)}
                                className="text-[12px] font-semibold bg-card-gray border border-themed rounded-full px-3 py-1.5 active:scale-95 transition-all"
                                style={{ color: char.accentColor }}>
                                {ex}
                            </button>
                        ))}
                    </div>
                )}

                {/* 동적 대화 메시지 */}
                {messages.map((msg, i) =>
                    msg.role === 'user'
                        ? <UserBubble key={i} text={msg.text} accentColor={char.accentColor} />
                        : <BotBubble key={i} char={char} text={msg.text} />
                )}

                {/* 봇 타이핑 인디케이터 */}
                {botTyping && (
                    <div className="flex items-end gap-2">
                        <div className={`w-9 h-9 rounded-full ${char.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <span className={`material-symbols-outlined text-[16px] ${char.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{char.icon}</span>
                        </div>
                        <div className={`${char.bubbleBg} border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3`}>
                            <div className="flex gap-1.5 items-center h-5">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-t-muted" style={{ animation: `bounce 1s ease ${i * 0.2}s infinite` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* 하단 입력바 / 결과 확인 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto border-t border-themed bg-background px-3 py-3">
                {readyForResult ? (
                    <button
                        onClick={handleConfirmResult}
                        className="w-full py-4 rounded-2xl font-extrabold text-[15px] text-white active:scale-95 transition-all"
                        style={{ backgroundColor: char.accentColor }}
                    >
                        결과 확인
                    </button>
                ) : (
                    <div className="flex items-end gap-2">
                        <div className="flex-1 bg-card-gray rounded-2xl px-4 py-2.5 flex items-end gap-2 border border-themed">
                            <textarea
                                ref={inputRef}
                                value={inputText}
                                onChange={e => setInputText(e.target.value.slice(0, 200))}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                                placeholder={char.id === 'doctor' ? '오늘 경험이나 꿈을 입력해주세요...' : '꿈이나 오늘 있었던 일을 속삭여봐...'}
                                rows={1}
                                className="flex-1 bg-transparent text-t-primary text-[14px] leading-relaxed resize-none outline-none placeholder:text-t-faint min-h-[22px] max-h-[88px]"
                                style={{ height: 'auto' }}
                                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            />
                            <span className="text-[11px] text-t-faint self-end mb-0.5">{inputText.length}/200</span>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || botTyping}
                            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all disabled:opacity-30"
                            style={{ backgroundColor: char.accentColor }}
                        >
                            <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes bounce   { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
                @keyframes slideUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes slowSpin { to { transform: rotate(360deg); } }
                @keyframes popIn    { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
            `}</style>
        </div>
    );

    /* ── 3. 분석 중 ──────────────────────────────────────── */
    const ANALYZE_MESSAGES = [
        '이야기를 읽고 있어요 🍀',
        '키워드를 발견했어요!',
        '번호를 연결하고 있어요...',
        '거의 다 됐어요! ✨',
    ];

    if (step === 'analyzing' && char) return (
        <div className="flex flex-col w-full min-h-screen items-center justify-center px-6 gap-8"
            style={{ background: `linear-gradient(160deg, #0a0a0a 0%, #0f0f1a 100%)` }}>

            {/* 클로버 + 말풍선 */}
            <div className="flex items-end gap-3 w-full max-w-[320px]">
                <div className="flex-shrink-0" style={{ filter: `drop-shadow(0 8px 24px ${char.accentColor}60)` }}>
                    <Image src="/character.png" alt="클로버" width={96} height={96} unoptimized />
                </div>
                <div className="flex-1 rounded-2xl rounded-bl-none px-4 py-3 mb-1 border"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${char.accentColor}30` }}>
                    <p className="text-[14px] font-bold text-white leading-snug">
                        {ANALYZE_MESSAGES[Math.min(analyzeStep, ANALYZE_MESSAGES.length - 1)]}
                    </p>
                    <p className="text-[12px] mt-1 font-medium" style={{ color: `${char.accentColor}80` }}>
                        {char.name}이 분석 중이에요
                    </p>
                </div>
            </div>

            {/* 캐릭터 아이콘 스피너 */}
            <div className="relative">
                <div className={`w-24 h-24 rounded-3xl ${char.iconBg} flex items-center justify-center border`}
                    style={{ borderColor: `${char.accentColor}30` }}>
                    <span className={`material-symbols-outlined text-[44px] ${char.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}>{char.icon}</span>
                </div>
                <div className="absolute inset-0 rounded-3xl"
                    style={{ border: `2px solid ${char.accentColor}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            </div>

            {/* 진행 단계 바 */}
            <div className="w-full max-w-[280px] flex flex-col gap-1.5">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-1.5 rounded-full overflow-hidden bg-white/8">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: analyzeStep > i ? '100%' : analyzeStep === i ? '60%' : '0%',
                                backgroundColor: char.accentColor,
                                opacity: analyzeStep >= i ? 1 : 0.3,
                            }} />
                    </div>
                ))}
            </div>

            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    /* ── 4. 결과 ─────────────────────────────────────────── */
    if (step === 'result' && char && result) return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary">
            <header className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-themed sticky top-0 bg-background z-10">
                <button onClick={() => setStep('select')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-card-gray">
                    <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
                </button>
                <p className="text-[15px] font-bold">행운 부적</p>
            </header>

            <div className="flex flex-col px-6 pt-5 gap-5 pb-10 overflow-y-auto">

                {/* ★ 행운 부적 카드 */}
                <LuckyCharmCard char={char} nums={result.nums} keywords={keywords} confidence={confidence} reasons={result.reasons} />

                {/* 하단 버튼 */}
                <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-card-gray border border-themed text-t-secondary font-bold text-[13px] active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[18px]">share</span>
                        공유하기
                    </button>
                    <button onClick={() => router.push('/?tab=contents')}
                        className="flex-1 py-3.5 rounded-2xl bg-bg-inverse text-t-inverse font-bold text-[13px] active:scale-95 transition-all">
                        확인
                    </button>
                </div>

            </div>
        </div>
    );

    return null;
}
