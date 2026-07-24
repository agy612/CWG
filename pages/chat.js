import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import InterstitialAd from './components/ads/InterstitialAd';

/**
 * 풀리(Fuli) — 나만의 로또 챗봇 프로토타입 (기획서 1단계).
 *
 * AI 연동 없이 룰·문구 조합으로 대화 흐름과 재미를 검증하는 단계.
 *  - S1 데일리 브리핑(선톡): 회차 D-day + 출석 행운 숫자 + 내 번호 현황 인용
 *  - S3 대화형 번호 만들기: 메시지에서 숫자 추출 → 번호 6개 생성 → [내 번호에 저장]
 *  - S4 꿈해몽: 내장 사전 매칭 → 번호 조합 제안
 *  - S6 FAQ: 포인트/구독/스캔/추첨시간 정형 답변
 *  - 번호 습관 상담: cwg_my_numbers 통계를 문구 조합으로 (2단계에서 AI 코멘트로 교체)
 *
 * 과금(2차 기획): 풀리는 구독 전용 콘텐츠 기능.
 *   - 무료·게스트: 사용 불가 → 구독 유도 화면
 *   - STANDARD: 하루 3회 / PRO: 하루 5회 (티어별 chatDailyLimit)
 *   - 소진 시 광고 1편당 대화 1회 충전 (보상형 InterstitialAd 재사용)
 * 사용량: AI형 응답(생성/꿈/습관/자유)만 차감. FAQ·인사말은 무제한.
 * 저장: cwg_chat_quota = { date, used, bonus } / cwg_chat_lastopen = 'YYYY-MM-DD'
 */

const QUOTA_KEY = 'cwg_chat_quota';
const AD_BONUS = 1; // 광고 1편당 대화 1회 충전

const LOTTO_BALL_COLOR = (num) => {
    if (num <= 10) return 'bg-[#FBC400] text-black';
    if (num <= 20) return 'bg-[#69C8F2] text-black';
    if (num <= 30) return 'bg-[#FF7272] text-white';
    if (num <= 40) return 'bg-[#AAAAAA] text-black';
    return 'bg-[#B0D840] text-black';
};

const toDateStr = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* 꿈해몽 사전 (프로토타입 내장분) */
const DREAM_DICT = {
    '돼지': { nums: [8, 18, 28], story: '돼지는 전통적으로 재물운의 상징이에요!' },
    '물': { nums: [3, 13, 33], story: '맑은 물은 재물이 흘러들어온다는 뜻으로 풀이돼요.' },
    '불': { nums: [5, 15, 45], story: '불꿈은 하는 일이 번창한다는 길몽으로 봐요.' },
    '조상': { nums: [1, 21, 41], story: '조상님이 나오는 꿈은 도움을 주신다는 의미래요.' },
    '똥': { nums: [4, 14, 44], story: '지저분하지만... 똥꿈은 최고의 재물운 꿈이에요!' },
    '대통령': { nums: [9, 19, 29], story: '귀인을 만나는 꿈 — 큰 행운의 신호로 풀이돼요.' },
    '뱀': { nums: [2, 12, 32], story: '뱀꿈은 재물과 지혜를 상징해요.' },
    '용': { nums: [7, 17, 37], story: '용꿈은 꿈 중의 꿈! 대박의 상징이죠.' },
    '돈': { nums: [6, 16, 36], story: '꿈에서 돈을 받았다면 좋은 기운이 들어온 거예요.' },
};

/* FAQ 정형 답변 (LLM 불필요 — CS 절감) */
const FAQ = [
    { keys: ['포인트', '만료'], a: '포인트는 적립일로부터 1년간 유효해요. 마이 탭 > 거래 내역에서 만료 예정을 확인할 수 있어요.' },
    { keys: ['구독', '해지'], a: '구독은 마이 탭 > 구독 관리에서 변경·해지할 수 있어요. STANDARD는 광고 제거 + 픽 무제한, PRO는 포인트 2배까지!' },
    { keys: ['스캔', '방법'], a: '낙첨 티켓을 스캔·경품 탭에서 촬영하면 포인트가 적립되고 경품 추첨에 자동 응모돼요.' },
    { keys: ['추첨', '몇시'], a: '로또 추첨은 매주 토요일 저녁 8시 45분이에요. 잊지 않게 제가 토요일에 알려드릴게요!' },
    { keys: ['출석'], a: '홈 화면의 출석 칩을 누르면 매일 5P와 오늘의 행운 숫자를 받을 수 있어요. 7일 연속이면 보상 2배 찬스!' },
];

/* 요일별 질문 칩 로테이션 */
const CHIPS_BY_DAY = {
    0: ['결과 정리해줘', '이번 주 번호 미리 만들어줘', '포인트 언제 만료돼?'],
    1: ['지난 회차 복기해줘', '내 번호 습관 알려줘', '꿈 얘기해도 돼?'],
    2: ['지난 회차 복기해줘', '내 번호 습관 알려줘', '꿈 얘기해도 돼?'],
    3: ['내 번호 습관 알려줘', '지난 회차 복기해줘', '행운 숫자 넣어서 만들어줘'],
    4: ['이번 주 번호 만들어줘', '행운 숫자 넣어서 만들어줘', '내 번호 습관 알려줘'],
    5: ['이번 주 번호 만들어줘', '행운 숫자 넣어서 만들어줘', '추첨 몇 시야?'],
    6: ['추첨 몇 시야?', '번호 하나만 더 만들어줘', '내 번호 보여줘'],
};

/* 토요일 추첨까지 D-day */
function drawDday(now) {
    const day = now.getDay();
    const diff = (6 - day + 7) % 7;
    if (diff === 0) return now.getHours() < 21 ? 0 : 7;
    return diff;
}

/* 포함 숫자를 넣어 6개 번호 생성 */
function makeNumbers(include = []) {
    const set = new Set(include.filter(n => n >= 1 && n <= 45).slice(0, 5));
    while (set.size < 6) set.add(Math.floor(Math.random() * 45) + 1);
    return [...set].sort((a, b) => a - b);
}

/* 내 번호 습관 통계 → 문구 조합 (2단계에서 이 결과를 AI 코멘트로 교체) */
function habitComment(myNumbers) {
    const all = myNumbers.flatMap(m => m.numbers);
    if (all.length === 0) return null;
    const odd = all.filter(n => n % 2 === 1).length;
    const low = all.filter(n => n <= 22).length;
    const oddPct = Math.round((odd / all.length) * 100);
    const lowPct = Math.round((low / all.length) * 100);
    const ranges = [0, 0, 0, 0, 0];
    all.forEach(n => ranges[Math.min(4, Math.floor((n - 1) / 9))]++);
    const favIdx = ranges.indexOf(Math.max(...ranges));
    const favLabel = ['1~9', '10~18', '19~27', '28~36', '37~45'][favIdx];
    const favPct = Math.round((ranges[favIdx] / all.length) * 100);
    const oddLine = oddPct >= 65 ? '홀수를 확실히 좋아하시네요' : oddPct <= 35 ? '짝수파시군요!' : '홀짝 밸런스가 좋아요';
    return `지금까지 만든 ${myNumbers.length}세트를 살펴봤어요.\n${favLabel} 구간을 ${favPct}%로 가장 자주 고르시고, ${oddLine} (홀수 ${oddPct}%). 고저 비율은 저(1~22) ${lowPct}%예요.`;
}

let msgId = 0;
const mid = () => `m${++msgId}`;

export default function Chat() {
    const router = useRouter();
    const { tier, chatDailyLimit } = useUser();
    const baseLimit = chatDailyLimit || 0;
    const isSubscriber = baseLimit > 0; // STANDARD/PRO만 풀리 사용 가능
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [quota, setQuota] = useState({ date: '', used: 0, bonus: 0 });
    const [showAd, setShowAd] = useState(false);
    const [savedIds, setSavedIds] = useState({});
    const scrollRef = useRef(null);

    const today = useMemo(() => new Date(), []);
    const todayStr = toDateStr(today);
    const chips = CHIPS_BY_DAY[today.getDay()];
    const limit = baseLimit + (quota.bonus || 0);
    const remaining = Math.max(0, limit - quota.used);

    /* 진입: 쿼터 로드 + 선톡(데일리 브리핑) */
    useEffect(() => {
        let q;
        try { q = JSON.parse(localStorage.getItem(QUOTA_KEY) || 'null'); } catch {}
        if (!q || q.date !== todayStr) q = { date: todayStr, used: 0, bonus: 0 };
        setQuota(q);
        localStorage.setItem(QUOTA_KEY, JSON.stringify(q));
        localStorage.setItem('cwg_chat_lastopen', todayStr);

        // 선톡 재료: D-day + 출석 행운 숫자 + 내 번호 수 (개인 데이터 훅 원칙)
        const dday = drawDday(today);
        let lucky = null, myCount = 0;
        try {
            const att = JSON.parse(localStorage.getItem('cwg_attendance') || '{}');
            lucky = att.rewards?.[todayStr]?.lucky ?? null;
            myCount = JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]').length;
        } catch {}

        const ddayLine = dday === 0 ? '오늘 저녁 8시 45분 추첨이에요! 🎉' : `추첨까지 D-${dday}이에요.`;
        let hook;
        if (lucky) hook = `오늘 출석에서 받은 행운 숫자 ${lucky}, 번호에 넣어볼까요?`;
        else if (myCount > 0) hook = `이번 주 만들어둔 번호가 ${myCount}세트 있네요. 하나 더 만들까요?`;
        else hook = '아직 이번 주 번호가 없네요. 저랑 같이 만들어봐요!';

        setMessages([
            { id: mid(), role: 'bot', text: `안녕하세요, 풀리예요! 👋\n${ddayLine} ${hook}` },
        ]);
        setMounted(true);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, typing]);

    const spendQuota = () => {
        setQuota(prev => {
            const next = { ...prev, used: prev.used + 1 };
            localStorage.setItem(QUOTA_KEY, JSON.stringify(next));
            return next;
        });
    };

    const chargeQuota = () => {
        setQuota(prev => {
            const next = { ...prev, bonus: (prev.bonus || 0) + AD_BONUS };
            localStorage.setItem(QUOTA_KEY, JSON.stringify(next));
            return next;
        });
    };

    /* ── 룰 기반 응답 엔진 (2단계에서 '자유 대화' 분기만 AI로 교체) ── */
    const buildReply = (text) => {
        const t = text.trim();

        // FAQ (무제한 — 차감 없음)
        const faqHit = FAQ.find(f => f.keys.some(k => t.includes(k)));
        if (faqHit) return { paid: false, msgs: [{ id: mid(), role: 'bot', text: faqHit.a }] };

        // 꿈해몽
        const dreamKey = Object.keys(DREAM_DICT).find(k => t.includes(k));
        if (t.includes('꿈') && !dreamKey) {
            return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '오, 무슨 꿈이었어요? 돼지, 물, 불, 조상님, 뱀, 용... 나온 게 있으면 말해주세요!' }] };
        }
        if (dreamKey) {
            const d = DREAM_DICT[dreamKey];
            const nums = makeNumbers(d.nums);
            return {
                paid: true,
                msgs: [{
                    id: mid(), role: 'bot',
                    text: `${d.story}\n${dreamKey} 꿈의 숫자 ${d.nums.join('·')}를 넣어 한 세트 만들어봤어요.`,
                    balls: nums, action: { type: 'save', numbers: nums, preset: '꿈해몽' },
                }],
            };
        }

        // 번호 생성 (행운 숫자/언급 숫자 반영)
        if (/만들|생성|뽑|골라/.test(t)) {
            const mentioned = (t.match(/\d{1,2}/g) || []).map(Number).filter(n => n >= 1 && n <= 45);
            let include = [...mentioned];
            if (/행운/.test(t)) {
                try {
                    const att = JSON.parse(localStorage.getItem('cwg_attendance') || '{}');
                    const lucky = att.rewards?.[todayStr]?.lucky;
                    if (lucky) include.push(lucky);
                    else return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '오늘 행운 숫자를 아직 안 받으셨네요! 출석체크 먼저 하고 오시면 그 숫자로 만들어드릴게요.', action: { type: 'link', route: '/attendance', label: '출석하러 가기' } }] };
                } catch {}
            }
            const nums = makeNumbers(include);
            const intro = include.length > 0
                ? `${[...new Set(include)].join('·')}를 넣어서 균형 있게 조합했어요.`
                : '이번 주 느낌으로 한 세트 만들어봤어요.';
            return {
                paid: true,
                msgs: [{ id: mid(), role: 'bot', text: intro, balls: nums, action: { type: 'save', numbers: nums, preset: '풀리 추천' } }],
            };
        }

        // 내 번호 보기 / 습관 상담 / 회고
        let myNumbers = [];
        try { myNumbers = JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]'); } catch {}

        if (/보여줘|내 번호/.test(t) && !/습관/.test(t)) {
            if (myNumbers.length === 0) return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '아직 만들어둔 번호가 없어요. "번호 만들어줘"라고 말해보세요!' }] };
            const last = myNumbers[myNumbers.length - 1];
            return { paid: false, msgs: [{ id: mid(), role: 'bot', text: `지금까지 ${myNumbers.length}세트를 만드셨어요. 가장 최근 번호는 이거예요:`, balls: last.numbers }] };
        }

        if (/습관|분석|어때/.test(t)) {
            const comment = habitComment(myNumbers);
            if (!comment) return { paid: false, msgs: [{ id: mid(), role: 'bot', text: '아직 분석할 번호가 없어요. 3세트 정도 만들면 습관을 짚어드릴 수 있어요. 지금 하나 만들어볼까요?' }] };
            return { paid: true, msgs: [{ id: mid(), role: 'bot', text: comment }] };
        }

        if (/복기|결과|정리/.test(t)) {
            return {
                paid: true,
                msgs: [{ id: mid(), role: 'bot', text: '지난 1158회에서는 세트 2가 3개 일치까지 갔었어요 (3·23·37). 22번 하나 차이로 4개를 놓쳤는데... 아쉬움 지수 87점! 😢\n낙첨 티켓이 있다면 스캔하고 포인트라도 챙기세요.', action: { type: 'link', route: '/?tab=scan', label: '스캔하러 가기' } }],
            };
        }

        // 자유 대화 폴백 (2단계에서 이 분기만 AI로 교체)
        return {
            paid: true,
            msgs: [{ id: mid(), role: 'bot', text: '음, 그 얘기는 제가 아직 서툴러요 😅 대신 이런 건 잘해요 — "번호 만들어줘", "내 번호 습관 알려줘", "돼지꿈 꿨어" 같은 것들이요!' }],
        };
    };

    const send = (text) => {
        const t = (text ?? input).trim();
        if (!t || typing) return;
        setInput('');
        setMessages(prev => [...prev, { id: mid(), role: 'user', text: t }]);
        setTyping(true);

        setTimeout(() => {
            const reply = buildReply(t);
            // 한도 확인: AI형 응답만 차감
            if (reply.paid && remaining <= 0) {
                setMessages(prev => [...prev, {
                    id: mid(), role: 'bot',
                    text: `오늘 대화 ${limit}회를 모두 사용했어요.\n광고 한 편 보시면 ${AD_BONUS}회를 더 드릴게요! (내일이 되면 다시 ${baseLimit}회로 충전돼요)`,
                    action: { type: 'ad' },
                }]);
                setTyping(false);
                return;
            }
            if (reply.paid) spendQuota();
            setMessages(prev => [...prev, ...reply.msgs]);
            setTyping(false);
        }, 700);
    };

    const saveNumbers = (msg) => {
        try {
            const list = JSON.parse(localStorage.getItem('cwg_my_numbers') || '[]');
            list.push({ numbers: msg.action.numbers, preset: msg.action.preset, round: 1228, date: todayStr });
            localStorage.setItem('cwg_my_numbers', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('cwg-mynum-added'));
            setSavedIds(prev => ({ ...prev, [msg.id]: true }));
            setMessages(prev => [...prev, { id: mid(), role: 'bot', text: '내 번호에 저장했어요! 번호생성 탭에서 확인할 수 있어요. 🍀' }]);
        } catch {}
    };

    /* ── 무료·게스트: 구독 전용 안내 화면 ── */
    if (mounted && !isSubscriber) {
        return (
            <div className="bg-background font-sans text-t-primary antialiased h-screen flex flex-col">
                <Head><title>CWG - 풀리</title></Head>
                <div className="relative flex flex-col w-full max-w-[430px] mx-auto h-full">
                    {/* Header */}
                    <div className="pt-12 pb-3 px-5 flex items-center gap-3 border-b border-themed bg-background z-10">
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[26px] font-light text-t-secondary">arrow_back</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#14b8a6]/15 border border-[#14b8a6]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Image src="/character.png" alt="풀리" width={38} height={38} unoptimized priority />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[15px] font-extrabold leading-tight">풀리</div>
                            <div className="text-[11px] text-t-muted font-medium">나만의 로또 AI 코치</div>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-1 rounded-full">구독 전용</span>
                    </div>

                    {/* 본문 — 구독 유도 */}
                    <div className="flex-1 overflow-y-auto flex flex-col items-center text-center px-8 pt-10 pb-8">
                        <div style={{ filter: 'drop-shadow(0 10px 30px rgba(74,222,128,0.4))' }}>
                            <Image src="/character.png" alt="풀리" width={140} height={140} unoptimized priority />
                        </div>
                        <h2 className="text-[22px] font-extrabold tracking-tight mt-4 leading-snug">
                            토요일이 기다려지는<br /><span className="text-[#14b8a6]">내 로또 단짝, 풀리</span>
                        </h2>
                        <p className="text-[13px] text-t-muted font-medium mt-3 leading-relaxed">
                            내 번호·스캔 기록을 아는 AI 코치와<br />매일 대화하며 이번 주 번호를 함께 만들어요.
                        </p>

                        {/* 티어별 제공량 */}
                        <div className="w-full mt-7 flex flex-col gap-2.5">
                            {[
                                { plan: 'STANDARD', color: 'text-t-primary', chip: 'bg-card-gray border-themed', desc: '하루 3회 대화' },
                                { plan: 'PRO', color: 'text-[#D4AF37]', chip: 'bg-[#D4AF37]/10 border-[#D4AF37]/30', desc: '하루 5회 대화 + 심층 분석' },
                            ].map(p => (
                                <div key={p.plan} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${p.chip}`}>
                                    <span className={`text-[12px] font-extrabold w-20 text-left ${p.color}`}>{p.plan}</span>
                                    <span className="text-[13px] font-semibold text-t-secondary flex-1 text-left">{p.desc}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 mt-1 px-1">
                                <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_display</span>
                                <span className="text-[12px] text-t-muted font-medium text-left">횟수를 다 쓰면 광고 1편당 대화 1회를 더 받아요</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-8 pt-2">
                        <button
                            onClick={() => router.push('/subscription')}
                            className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all"
                        >
                            구독하고 풀리와 대화하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background font-sans text-t-primary antialiased h-screen flex flex-col">
            <Head><title>CWG - 풀리</title></Head>
            <div className="relative flex flex-col w-full max-w-[430px] mx-auto h-full">

                {/* Header */}
                <div className="pt-12 pb-3 px-5 flex items-center gap-3 border-b border-themed bg-background z-10">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[26px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#14b8a6]/15 border border-[#14b8a6]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image src="/character.png" alt="풀리" width={38} height={38} unoptimized priority />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-extrabold leading-tight">풀리</div>
                        <div className="text-[11px] text-t-muted font-medium">다정한 코치 · 추첨 D-{drawDday(today) || 'DAY'}</div>
                    </div>
                    <div className="text-[10.5px] font-bold text-t-muted bg-card-gray border border-themed px-2.5 py-1 rounded-full">
                        오늘 {mounted ? `${Math.min(quota.used, limit)}/${limit}` : '-'}회
                    </div>
                </div>

                {/* 책임 고지 */}
                <div className="px-5 py-1.5 text-center text-[10px] text-t-dim font-medium bg-card-gray/50 border-b border-themed">
                    재미로 즐기는 대화예요 · 당첨을 보장하지 않아요
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
                    {messages.map(m => (
                        <div key={m.id} className={`max-w-[85%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}>
                            <div className={`px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line ${
                                m.role === 'user'
                                    ? 'bg-bg-inverse text-t-inverse rounded-2xl rounded-br-md'
                                    : 'bg-card-gray border border-themed rounded-2xl rounded-bl-md text-t-primary'
                            }`}>
                                {m.text}
                                {m.balls && (
                                    <div className="flex gap-1.5 mt-2.5">
                                        {m.balls.map((n, i) => (
                                            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold ${LOTTO_BALL_COLOR(n)}`}>
                                                {String(n).padStart(2, '0')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {m.action?.type === 'save' && (
                                    <button
                                        onClick={() => !savedIds[m.id] && saveNumbers(m)}
                                        className={`mt-2.5 px-3.5 py-2 rounded-lg text-[12px] font-extrabold border transition-all ${
                                            savedIds[m.id]
                                                ? 'text-t-dim border-themed bg-transparent'
                                                : 'text-[#14b8a6] border-[#14b8a6]/40 bg-[#14b8a6]/10 active:scale-95'
                                        }`}
                                    >
                                        {savedIds[m.id] ? '저장 완료 ✓' : '+ 내 번호에 저장'}
                                    </button>
                                )}
                                {m.action?.type === 'link' && (
                                    <button
                                        onClick={() => router.push(m.action.route)}
                                        className="mt-2.5 px-3.5 py-2 rounded-lg text-[12px] font-extrabold text-[#14b8a6] border border-[#14b8a6]/40 bg-[#14b8a6]/10 active:scale-95 transition-all"
                                    >
                                        {m.action.label} →
                                    </button>
                                )}
                                {m.action?.type === 'ad' && (
                                    <button
                                        onClick={() => setShowAd(true)}
                                        className="mt-2.5 px-3.5 py-2 rounded-lg text-[12px] font-extrabold text-[#D4AF37] border border-[#D4AF37]/40 bg-[#D4AF37]/10 active:scale-95 transition-all"
                                    >
                                        광고 보고 +{AD_BONUS}회 충전
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="self-start bg-card-gray border border-themed rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-t-dim animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 질문 칩 + 입력창 */}
                <div className="border-t border-themed bg-background px-4 pt-2.5 pb-6">
                    <div className="flex gap-1.5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                        {chips.map(c => (
                            <button
                                key={c}
                                onClick={() => send(c)}
                                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-bold text-[#14b8a6] border border-[#14b8a6]/30 bg-[#14b8a6]/5 active:scale-95 transition-all"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') send(); }}
                            placeholder="풀리에게 말해보세요"
                            maxLength={500}
                            className="flex-1 bg-card-gray border border-themed rounded-full px-4 py-3 text-[13.5px] text-t-primary placeholder:text-t-dim outline-none focus:border-[#14b8a6]/50"
                        />
                        <button
                            onClick={() => send()}
                            disabled={!input.trim() || typing}
                            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                input.trim() && !typing ? 'bg-bg-inverse text-t-inverse active:scale-90' : 'bg-btn-secondary text-t-dim'
                            }`}
                            aria-label="보내기"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                        </button>
                    </div>
                </div>

                {/* 보상형 광고 — 대화 횟수 충전 */}
                <InterstitialAd
                    open={showAd}
                    countdownSec={5}
                    index={2}
                    onReward={chargeQuota}
                    onClose={() => {
                        setShowAd(false);
                        setMessages(prev => [...prev, { id: mid(), role: 'bot', text: `충전 완료! 대화 ${AD_BONUS}회가 추가됐어요. 어디까지 얘기했죠? 😄` }]);
                    }}
                />
            </div>
        </div>
    );
}
