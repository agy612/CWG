import React, { useReducer, useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';

/* ─── 레벨 설정 ──────────────────────────────────────────────── */
const LEVELS = [
    { level: 1, count: 1, showMs: 2500, selectMs: 15000, label: '5등', sublabel: '1개 일치', color: '#818cf8', scatter: false, hasBonus: false },
    { level: 2, count: 2, showMs: 2000, selectMs: 13000, label: '4등', sublabel: '2개 일치', color: '#60a5fa', scatter: false, hasBonus: false },
    { level: 3, count: 3, showMs: 1500, selectMs: 11000, label: '3등', sublabel: '3개 일치', color: '#34d399', scatter: false, hasBonus: false },
    { level: 4, count: 4, showMs: 1000, selectMs:  9000, label: '2등', sublabel: '4개 일치', color: '#f472b6', scatter: false, hasBonus: false },
    { level: 5, count: 5, showMs:  700, selectMs:  8000, label: '1등', sublabel: '5개 일치', color: '#fbbf24', scatter: true,  hasBonus: false },
];
const WINS_TO_LEVEL = 3;

/* ─── 파워 시스템 ─────────────────────────────────────────────
 * 게임 1회 = 파워 1개 소모. 1시간에 1개씩 자동 충전(최대 3개).
 * 소진 시 30P로 파워 1개를 즉시 구매해 이어서 도전할 수 있다. */
const MAX_POWER = 3;
const POWER_REFILL_MS = 60 * 60 * 1000;
const POWER_BUY_COST = 30;
const POWER_KEY = 'cwg_ns_power';

function loadPower() {
    try {
        const saved = JSON.parse(localStorage.getItem(POWER_KEY));
        if (!saved) return { power: MAX_POWER, lastRefillTs: Date.now() };
        let { power, lastRefillTs } = saved;
        if (power >= MAX_POWER) return { power: MAX_POWER, lastRefillTs: Date.now() };
        const gained = Math.floor((Date.now() - lastRefillTs) / POWER_REFILL_MS);
        if (gained > 0) {
            power = Math.min(MAX_POWER, power + gained);
            lastRefillTs = power >= MAX_POWER ? Date.now() : lastRefillTs + gained * POWER_REFILL_MS;
        }
        return { power, lastRefillTs };
    } catch {
        return { power: MAX_POWER, lastRefillTs: Date.now() };
    }
}

const savePower = (p) => localStorage.setItem(POWER_KEY, JSON.stringify(p));

/* ─── 유틸 ──────────────────────────────────────────────────── */
const ballColor = (n) => {
    if (n <= 10) return { bg: '#FBC400', text: '#000' };
    if (n <= 20) return { bg: '#69C8F2', text: '#000' };
    if (n <= 30) return { bg: '#FF7272', text: '#fff' };
    if (n <= 40) return { bg: '#AAAAAA', text: '#000' };
    return { bg: '#B0D840', text: '#000' };
};

function randNums(count) {
    return Array.from({ length: 45 }, (_, i) => i + 1)
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .sort((a, b) => a - b);
}

function scatterPos(roundKey, idx, total) {
    const a = (roundKey * 17 + idx * 31 + 7) % 100;
    const b = (roundKey * 13 + idx * 43 + 11) % 80;
    const cols = total <= 4 ? 2 : 3;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const offsetX = (a % 20) - 10;
    const offsetY = (b % 20) - 10;
    const baseX = (col / (cols - 1 || 1)) * 60 + 20;
    const baseY = (row / (Math.ceil(total / cols) - 1 || 1)) * 60 + 20;
    return {
        left: `calc(${Math.max(5, Math.min(85, baseX + offsetX))}% - 30px)`,
        top:  `calc(${Math.max(5, Math.min(85, baseY + offsetY))}% - 30px)`,
    };
}

/* ─── 스테이지 보너스 (각 단계 클리어 기본 포인트) ─────────────── */
const STAGE_BONUS = [80, 160, 280, 440, 650];

/* ─── 리듀서 ─────────────────────────────────────────────────── */
const INIT = {
    phase: 'idle',
    level: 0, round: 0, score: 0, combo: 0, maxCombo: 0,
    winsInLevel: 0, shownNums: [], selected: [],
    lastScore: 0, pendingLevelUp: false, roundKey: 0,
    deadReason: null, wrongNum: null,
    canRevive: true, canPointRevive: true, multiplier: 1, clearedLevel: 0,
};

function reducer(s, a) {
    switch (a.type) {
        case 'START_GAME':
            return { ...INIT, phase: 'ready', shownNums: randNums(LEVELS[0].count), roundKey: 1 };
        case 'START_ROUND': {
            const cfg = LEVELS[Math.min(s.level, LEVELS.length - 1)];
            return { ...s, phase: 'ready', shownNums: randNums(cfg.count), selected: [], pendingLevelUp: false, roundKey: s.roundKey + 1 };
        }
        case 'START_SHOWING':
            return { ...s, phase: 'showing' };
        case 'SHOW_BOARD':
            return { ...s, phase: 'selecting' };
        case 'TAP_NUM': {
            if (s.phase !== 'selecting') return s;
            const n = a.num;
            if (s.selected.includes(n)) return s;
            if (!new Set(s.shownNums).has(n))
                return { ...s, phase: 'dead', deadReason: 'wrong', wrongNum: n };
            const newSel = [...s.selected, n];
            if (newSel.length < s.shownNums.length)
                return { ...s, selected: newSel };
            const newCombo = s.combo + 1;
            const pts = (s.level + 1) * 10 + newCombo * 5;
            const newWins = s.winsInLevel + 1;
            const stageComplete = newWins >= WINS_TO_LEVEL;
            const levelUp = stageComplete && s.level < LEVELS.length - 1;
            return {
                ...s, phase: 'correct', selected: newSel,
                combo: newCombo, maxCombo: Math.max(s.maxCombo, newCombo),
                score: s.score + pts, round: s.round + 1, lastScore: pts,
                winsInLevel: stageComplete ? 0 : newWins,
                level: levelUp ? s.level + 1 : s.level,
                pendingLevelUp: stageComplete,
                clearedLevel: stageComplete ? s.level : s.clearedLevel,
            };
        }
        case 'TIMEOUT':
            return s.phase === 'selecting'
                ? { ...s, phase: 'dead', deadReason: 'timeout', wrongNum: null }
                : s;
        case 'NEXT_ROUND':
            if (s.pendingLevelUp) return { ...s, phase: 'stageclear' };
            return reducer(s, { type: 'START_ROUND' });
        case 'TAKE_REWARD': {
            const bonus = STAGE_BONUS[Math.min(s.clearedLevel, STAGE_BONUS.length - 1)] * s.multiplier;
            return { ...s, phase: 'complete', score: s.score + bonus, pendingLevelUp: false };
        }
        case 'DOUBLE_DOWN': {
            const bonus = STAGE_BONUS[Math.min(s.clearedLevel, STAGE_BONUS.length - 1)] * s.multiplier;
            return reducer(
                { ...s, score: s.score + bonus, multiplier: s.multiplier * 2, pendingLevelUp: false },
                { type: 'START_ROUND' }
            );
        }
        case 'REVIVE': {
            const cfg = LEVELS[Math.min(s.level, LEVELS.length - 1)];
            return { ...s, phase: 'ready', canRevive: false, shownNums: randNums(cfg.count), selected: [], roundKey: s.roundKey + 1 };
        }
        case 'POINT_REVIVE': {
            const cfg = LEVELS[Math.min(s.level, LEVELS.length - 1)];
            return { ...s, phase: 'ready', canPointRevive: false, shownNums: randNums(cfg.count), selected: [], roundKey: s.roundKey + 1 };
        }
        default: return s;
    }
}

/* ─── 서브 컴포넌트 ──────────────────────────────────────────── */
function Ball({ n, size = 56, glow = false, style = {} }) {
    const { bg, text } = ballColor(n);
    return (
        <div className="flex items-center justify-center rounded-full font-extrabold select-none"
            style={{
                width: size, height: size, flexShrink: 0,
                background: bg, color: text, fontSize: size * 0.32,
                boxShadow: glow ? `0 0 18px ${bg}99, 0 0 6px ${bg}60` : undefined,
                ...style,
            }}>
            {String(n).padStart(2, '0')}
        </div>
    );
}

function NumberGrid({ shownNums, selected, deadNum, phase, onTap }) {
    const shownSet = new Set(shownNums);
    const selSet   = new Set(selected);
    return (
        <div className="grid gap-[4px]" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
            {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
                const isSel   = selSet.has(n);
                const isShown = shownSet.has(n);
                const isDead  = n === deadNum;
                let bg, color, border = 'transparent';

                if (phase === 'selecting') {
                    if (isSel) { const c = ballColor(n); bg = c.bg; color = c.text; }
                    else { bg = 'rgba(255,255,255,0.07)'; color = 'rgba(255,255,255,0.5)'; }
                } else if (phase === 'correct') {
                    if (isShown) { const c = ballColor(n); bg = c.bg; color = c.text; }
                    else { bg = 'rgba(255,255,255,0.04)'; color = 'rgba(255,255,255,0.14)'; }
                } else {
                    if (isDead) {
                        bg = 'rgba(239,68,68,0.35)'; color = '#fca5a5'; border = '1px solid #ef4444';
                    } else if (isSel && isShown) {
                        const c = ballColor(n); bg = c.bg + 'aa'; color = c.text;
                    } else if (!isSel && isShown) {
                        const c = ballColor(n); bg = 'rgba(255,255,255,0.04)'; color = c.bg; border = `1px dashed ${c.bg}`;
                    } else {
                        bg = 'rgba(255,255,255,0.03)'; color = 'rgba(255,255,255,0.12)';
                    }
                }

                const tappable = phase === 'selecting' && !isSel;
                return (
                    <button key={n}
                        onClick={() => tappable && onTap(n)}
                        disabled={!tappable}
                        className={`rounded-lg text-[12px] font-bold transition-all ${tappable ? 'active:scale-75' : ''} ${isSel && phase === 'selecting' ? 'pop-anim' : ''}`}
                        style={{ height: 34, background: bg, color, border }}>
                        {n}
                    </button>
                );
            })}
        </div>
    );
}

/* ─── 순위 팝업 ──────────────────────────────────────────────── */
function RankPopup({ score, onClose }) {
    const myIdx = MOCK_RANKS.findIndex(r => r.isMe);
    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-10 rounded-t-3xl px-5 pt-5 pb-8"
                style={{ background: '#111827', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-yellow-400"
                            style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        <p className="text-[15px] font-extrabold text-white">이번 주 순위</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <span className="material-symbols-outlined text-[18px] text-white/50">close</span>
                    </button>
                </div>
                {MOCK_RANKS.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5"
                        style={{ borderBottom: i < MOCK_RANKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                            background: r.isMe ? 'rgba(99,102,241,0.07)' : 'transparent',
                            borderRadius: r.isMe ? 12 : 0, paddingLeft: r.isMe ? 8 : 0, paddingRight: r.isMe ? 8 : 0 }}>
                        <p className="w-5 text-center text-[13px] font-extrabold flex-shrink-0"
                            style={{ color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b87333' : 'rgba(255,255,255,0.2)' }}>
                            {i + 1}
                        </p>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.07)' }}>{r.emoji}</div>
                        <p className="flex-1 text-[13px] font-bold text-white/75 truncate">
                            {r.name}
                            {r.isMe && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold"
                                style={{ background: 'rgba(99,102,241,0.25)', color: '#818cf8' }}>나</span>}
                        </p>
                        <p className="text-[13px] font-extrabold flex-shrink-0"
                            style={{ color: r.isMe ? '#818cf8' : 'rgba(255,255,255,0.5)' }}>
                            {r.isMe ? score.toLocaleString() : r.score.toLocaleString()}P
                        </p>
                    </div>
                ))}
                {myIdx >= 0 && (
                    <p className="text-center text-[11px] text-white/25 mt-3">
                        1위까지 <span className="text-white/50 font-bold">{(MOCK_RANKS[0].score - score).toLocaleString()}P</span> 남음
                    </p>
                )}
            </div>
        </div>
    );
}

/* ─── 게임 안내 캐러셀 ────────────────────────────────────────── */
function SlideHead({ icon, color, badge, title }) {
    return (
        <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${color}1f`, border: `1px solid ${color}33` }}>
                <span className="material-symbols-outlined text-[28px]"
                    style={{ color, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            {badge && (
                <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1.5" style={{ color }}>{badge}</p>
            )}
            <h3 className="text-[20px] font-extrabold text-white leading-tight">{title}</h3>
        </div>
    );
}

function GuideCarousel({ onClose }) {
    const [page, setPage] = useState(0);
    const [touchX, setTouchX] = useState(null);

    const slides = [
        /* 0 · 소개 */
        () => (
            <div className="flex flex-col items-center">
                <SlideHead icon="psychology" color="#818cf8" badge="What is it?" title="넘버 센스란?" />
                <div className="flex items-center justify-center gap-2 mb-5">
                    {[7, 23, 38].map((n, i) => {
                        const { bg, text } = ballColor(n);
                        return (
                            <div key={n} className="zoom-in flex items-center justify-center rounded-full font-extrabold"
                                style={{ width: 52, height: 52, background: bg, color: text, fontSize: 17,
                                    boxShadow: `0 0 18px ${bg}88`, animationDelay: `${i * 0.1}s` }}>
                                {String(n).padStart(2, '0')}
                            </div>
                        );
                    })}
                    <span className="material-symbols-outlined text-[22px] text-white/25 mx-1">arrow_forward</span>
                    <div className="flex items-center justify-center rounded-full text-white/25 text-[11px] font-bold"
                        style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.14)' }}>
                        ?
                    </div>
                </div>
                <p className="text-[14px] text-white/55 leading-relaxed text-center px-2">
                    화면에 <span className="text-white font-bold">잠깐</span> 나타난 로또 번호를 기억했다가,
                    번호가 사라진 뒤 <span className="text-white font-bold">1~45 숫자판</span>에서
                    그대로 골라내는 <span style={{ color: '#a5b4fc' }} className="font-extrabold">번호 기억 게임</span>이에요.
                </p>
            </div>
        ),
        /* 1 · 진행 방식 */
        () => (
            <div className="flex flex-col">
                <SlideHead icon="touch_app" color="#34d399" badge="How to play" title="이렇게 진행돼요" />
                <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-[10px] font-extrabold tracking-widest text-white/25 mb-2">STEP 1 · 기억</p>
                    <p className="text-[14px] font-extrabold text-white mb-1">번호를 눈에 담아요</p>
                    <p className="text-[12px] text-white/45 mb-3">로또 번호가 짧게 표시됐다 사라져요. 잘 기억해 두세요.</p>
                    <div className="flex gap-2">
                        {[7, 23, 38].map(n => {
                            const { bg, text } = ballColor(n);
                            return (
                                <div key={n} className="flex items-center justify-center rounded-full font-extrabold text-[13px]"
                                    style={{ width: 38, height: 38, background: bg, color: text }}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            );
                        })}
                        <div className="flex items-center justify-center rounded-full text-white/20 text-[10px] font-bold"
                            style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.12)' }}>
                            사라짐
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-[10px] font-extrabold tracking-widest text-white/25 mb-2">STEP 2 · 선택</p>
                    <p className="text-[14px] font-extrabold text-white mb-1">기억한 번호를 탭해요</p>
                    <p className="text-[12px] text-white/45 mb-3">숫자판에서 기억한 번호만 골라 탭! 제한 시간 안에 전부 맞히면 성공.</p>
                    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
                        {Array.from({ length: 9 }, (_, i) => i + 1).map(n => {
                            const hit = [7].includes(n);
                            const { bg, text } = ballColor(n);
                            return (
                                <div key={n} className="rounded-md flex items-center justify-center text-[11px] font-bold"
                                    style={{ height: 26, background: hit ? bg : 'rgba(255,255,255,0.07)', color: hit ? text : 'rgba(255,255,255,0.35)' }}>
                                    {n}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        ),
        /* 2 · 단계 구성 */
        () => (
            <div className="flex flex-col">
                <SlideHead icon="stairs" color="#60a5fa" badge="Stages" title="5단계로 점점 어려워져요" />
                <p className="text-[13px] text-white/50 leading-relaxed text-center mb-4 px-1">
                    한 단계는 <span className="text-white font-bold">3라운드</span>예요.
                    3라운드를 모두 성공하면 <span className="text-white font-bold">다음 단계</span>로 올라가요.
                </p>
                <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="grid grid-cols-2 px-1 pb-1.5 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-[10px] font-bold text-white/30">단계</p>
                        <p className="text-[10px] font-bold text-white/30 text-right">기억할 번호</p>
                    </div>
                    {LEVELS.map((lv, i) => (
                        <div key={lv.level} className="grid grid-cols-2 items-center px-1 py-1.5"
                            style={{ borderBottom: i < LEVELS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[12px] font-extrabold" style={{ color: lv.color }}>{lv.level}단계</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${lv.color}22`, color: lv.color }}>{lv.label}</span>
                            </div>
                            <p className="text-[13px] font-extrabold text-white/80 text-right">
                                {lv.count}개
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        ),
        /* 3 · 포인트 */
        () => (
            <div className="flex flex-col">
                <SlideHead icon="workspace_premium" color="#fbbf24" badge="Reward" title="포인트는 이렇게 쌓여요" />
                <div className="flex flex-col gap-3">
                    <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.16)' }}>
                        <span className="material-symbols-outlined text-[18px] mt-0.5" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <p className="text-[13px] text-white/65 leading-relaxed">
                            한 단계(3라운드)를 클리어할 때마다 <span className="text-white font-bold">보너스 포인트</span>를 받아요.
                        </p>
                    </div>
                    <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.16)' }}>
                        <span className="material-symbols-outlined text-[18px] mt-0.5" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>alt_route</span>
                        <p className="text-[13px] text-white/65 leading-relaxed">
                            클리어할 때마다 <span className="text-white font-bold">지금 받고 끝내기</span> 또는
                            <span className="text-white font-bold"> 다음 단계 도전</span>을 고를 수 있어요.
                        </p>
                    </div>
                    <div className="rounded-2xl p-3.5 flex items-start gap-2.5" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.16)' }}>
                        <span className="material-symbols-outlined text-[18px] mt-0.5" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                        <p className="text-[13px] text-white/65 leading-relaxed">
                            계속 도전하면 보너스가 <span className="text-white font-bold">×2로 불어나요.</span> 단계가 오를수록 점점 커집니다.
                        </p>
                    </div>
                </div>
            </div>
        ),
        /* 4 · 실패 */
        () => (
            <div className="flex flex-col">
                <SlideHead icon="warning" color="#f87171" badge="Game over" title="실패하면 즉시 종료돼요" />
                <div className="flex flex-col gap-2 mb-4">
                    <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)' }}>
                        <span className="material-symbols-outlined text-[17px]" style={{ color: '#f87171', fontVariationSettings: "'FILL' 1" }}>close</span>
                        <p className="text-[13px] text-white/55">기억에 없던 번호를 탭하면 바로 종료</p>
                    </div>
                    <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.16)' }}>
                        <span className="material-symbols-outlined text-[17px]" style={{ color: '#f87171', fontVariationSettings: "'FILL' 1" }}>timer_off</span>
                        <p className="text-[13px] text-white/55">제한 시간 안에 다 고르지 못해도 종료</p>
                    </div>
                </div>
                <div className="rounded-2xl px-4 py-3.5" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)' }}>
                    <p className="text-[13px] font-bold leading-relaxed" style={{ color: '#fca5a5' }}>
                        ⚠️ 아직 <span className="font-extrabold">받지 않은 포인트</span>는 실패하면 사라져요.
                        욕심내기 전에 적절한 타이밍에 받는 게 중요해요!
                    </p>
                </div>
            </div>
        ),
        /* 5 · 파워 */
        () => (
            <div className="flex flex-col">
                <SlideHead icon="bolt" color="#60a5fa" badge="Energy" title="파워로 플레이해요" />
                <div className="flex items-center justify-center gap-2 mb-5">
                    {[0, 1, 2].map(i => (
                        <span key={i} className="material-symbols-outlined text-[34px]"
                            style={{ color: '#60a5fa', fontVariationSettings: "'FILL' 1", filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.5))' }}>bolt</span>
                    ))}
                    <span className="text-[14px] font-extrabold text-white/70 ml-1">최대 3개</span>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.16)' }}>
                        <span className="material-symbols-outlined text-[17px]" style={{ color: '#60a5fa' }}>sports_esports</span>
                        <p className="text-[13px] text-white/55">게임 1회 플레이에 파워 <span className="text-white font-bold">1개</span>를 사용해요</p>
                    </div>
                    <div className="rounded-2xl p-3.5 flex items-center gap-2.5" style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.16)' }}>
                        <span className="material-symbols-outlined text-[17px]" style={{ color: '#60a5fa' }}>schedule</span>
                        <p className="text-[13px] text-white/55">파워는 <span className="text-white font-bold">1시간에 1개씩</span> 자동 충전돼요</p>
                    </div>
                </div>
            </div>
        ),
    ];

    const total = slides.length;
    const isLast = page === total - 1;
    const go = (p) => setPage(Math.max(0, Math.min(total - 1, p)));

    const onTouchStart = (e) => setTouchX(e.touches[0].clientX);
    const onTouchEnd = (e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (dx < -40) go(page + 1);
        else if (dx > 40) go(page - 1);
        setTouchX(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-10 rounded-t-3xl flex flex-col"
                style={{ background: '#111827', borderTop: '1px solid rgba(255,255,255,0.08)', height: '78vh' }}>

                {/* 헤더 — 점 인디케이터 + 닫기 */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        {slides.map((_, i) => (
                            <button key={i} onClick={() => go(i)} className="rounded-full transition-all duration-300"
                                style={{ width: i === page ? 22 : 7, height: 7, background: i === page ? '#818cf8' : 'rgba(255,255,255,0.18)' }} />
                        ))}
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90"
                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <span className="material-symbols-outlined text-[18px] text-white/50">close</span>
                    </button>
                </div>

                {/* 슬라이드 본문 */}
                <div className="flex-1 overflow-y-auto px-5 py-2" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                    <div key={page} className="fade-up h-full flex flex-col justify-center">
                        {slides[page]()}
                    </div>
                </div>

                {/* 푸터 — 이전 / 다음 */}
                <div className="flex items-center gap-3 px-5 pt-3 pb-7 flex-shrink-0"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {page > 0 && (
                        <button onClick={() => go(page - 1)}
                            className="px-5 py-3.5 rounded-2xl font-bold text-[14px] active:scale-95 transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            이전
                        </button>
                    )}
                    <button onClick={() => (isLast ? onClose() : go(page + 1))}
                        className="flex-1 py-3.5 rounded-2xl font-extrabold text-[15px] text-white active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
                        {isLast ? '확인했어요' : '다음'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── 목업 순위 ──────────────────────────────────────────────── */
const MY_RANK = 4;
const MOCK_RANKS = [
    { name: 'lotto_king',  score: 3200, emoji: '👑' },
    { name: '행운왕_철수', score: 2850, emoji: '🎯' },
    { name: 'lucky_7777',  score: 2450, emoji: '🎲' },
    { name: '나',          score: 1980, emoji: '😊', isMe: true },
    { name: 'lucky_star',  score: 1640, emoji: '⭐' },
];

/* ─── 목업 번호 감각 분석 ─────────────────────────────────────── */
const MOCK_SENSE = {
    hasData: true,
    accuracy: 68,
    avgReactionMs: 2140,
    weakRange: '31~40',
    oddRatio: 62,
    highRatio: 55,
    streak: 3,
    avgDeathRound: 3.8,
};

/* ─── 메인 ────────────────────────────────────────────────────── */
export default function NumberSense() {
    const router = useRouter();
    const user = useUser();
    const [g, dispatch] = useReducer(reducer, INIT);
    const [showInfo, setShowInfo] = useState(false);
    const [showRank, setShowRank] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [powerState, setPowerState] = useState({ power: MAX_POWER, lastRefillTs: 0 });
    const [balance, setBalance] = useState(user?.points ?? 0);
    const [showPowerSheet, setShowPowerSheet] = useState(false);
    const [toast, setToast] = useState(null);
    const [nowTs, setNowTs] = useState(0);
    const cfg = LEVELS[Math.min(g.level, LEVELS.length - 1)];

    /* 파워 로드 + 1초마다 자동충전 반영 */
    useEffect(() => {
        const sync = () => {
            const loaded = loadPower();
            savePower(loaded);
            setPowerState(loaded);
            setNowTs(Date.now());
        };
        sync();
        const id = setInterval(sync, 1000);
        return () => clearInterval(id);
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    };

    const consumePower = () => {
        setPowerState(prev => {
            const next = {
                power: Math.max(0, prev.power - 1),
                lastRefillTs: prev.power >= MAX_POWER ? Date.now() : prev.lastRefillTs,
            };
            savePower(next);
            return next;
        });
    };

    const handleStartGame = () => {
        if (powerState.power <= 0) { setShowPowerSheet(true); return; }
        consumePower();
        dispatch({ type: 'START_GAME' });
    };

    /* 파워 소진 → 30P로 파워 1개 구매 후 즉시 새 게임 */
    const handleBuyPowerAndStart = () => {
        if (balance < POWER_BUY_COST) {
            setShowPowerSheet(false);
            showToast('포인트가 부족해요. 스캔·출석으로 포인트를 모아보세요!');
            return;
        }
        const remain = balance - POWER_BUY_COST;
        setBalance(remain);
        setShowPowerSheet(false);
        showToast(`30P를 사용했어요. 남은 포인트 ${remain.toLocaleString()}P. 새 게임을 시작할게요`);
        dispatch({ type: 'START_GAME' });
    };

    /* 게임오버 → 30P 사용해 이어서 도전 (게임당 1회) */
    const handlePointRevive = () => {
        if (balance < POWER_BUY_COST) { showToast('포인트가 부족해요'); return; }
        const remain = balance - POWER_BUY_COST;
        setBalance(remain);
        showToast(`30P를 사용했어요. 남은 포인트 ${remain.toLocaleString()}P`);
        dispatch({ type: 'POINT_REVIVE' });
    };

    /* 다음 무료 충전까지 남은 시간 */
    const nextRefillSec = powerState.power >= MAX_POWER || !nowTs
        ? 0
        : Math.max(0, Math.ceil((powerState.lastRefillTs + POWER_REFILL_MS - nowTs) / 1000));
    const fmtRefill = (sec) => `${Math.floor(sec / 60)}분 ${String(sec % 60).padStart(2, '0')}초`;

    /* 토스트 + 파워 소진 안내 시트 — 시작/재도전이 가능한 화면들에서 공용 */
    const powerOverlays = (
        <>
            {toast && (
                <div className="fixed top-14 left-0 right-0 z-[300] flex justify-center px-6 max-w-[430px] mx-auto pointer-events-none">
                    <div className="fade-up rounded-2xl px-4 py-3 flex items-start gap-2"
                        style={{ background: 'rgba(17,24,39,0.97)', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                        <span className="material-symbols-outlined text-[17px] mt-0.5 flex-shrink-0"
                            style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>toll</span>
                        <p className="text-[12.5px] font-bold text-white leading-snug">{toast}</p>
                    </div>
                </div>
            )}
            {showPowerSheet && (
                <div className="fixed inset-0 z-[200] flex flex-col justify-end max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowPowerSheet(false)} />
                    <div className="relative z-10 rounded-t-3xl px-5 pt-6 pb-8"
                        style={{ background: '#111827', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex flex-col items-center text-center mb-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                                style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)' }}>
                                <span className="material-symbols-outlined text-[28px]"
                                    style={{ color: '#60a5fa', fontVariationSettings: "'FILL' 1" }}>battery_alert</span>
                            </div>
                            <h3 className="text-[18px] font-extrabold text-white mb-2">오늘의 파워를 모두 사용했어요</h3>
                            <p className="text-[13px] text-white/50 leading-relaxed px-2">
                                1시간 뒤 충전되거나 <span className="text-white font-bold">30P</span>로 지금 바로
                                이어서 도전할 수 있어요.<br />계속하시겠어요?
                            </p>
                        </div>
                        {nextRefillSec > 0 && (
                            <div className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-center gap-2"
                                style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)' }}>
                                <span className="material-symbols-outlined text-[16px]" style={{ color: '#60a5fa' }}>schedule</span>
                                <p className="text-[12px] text-white/50">
                                    다음 무료 충전까지 <span className="font-extrabold text-white tabular-nums">{fmtRefill(nextRefillSec)}</span>
                                </p>
                            </div>
                        )}
                        <button onClick={handleBuyPowerAndStart}
                            className="w-full py-4 rounded-2xl font-extrabold text-[15px] text-white active:scale-95 transition-all mb-2.5"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
                            포인트로 계속하기 (30P)
                            <span className="block text-[11px] font-bold opacity-60 mt-0.5">보유 {balance.toLocaleString()}P</span>
                        </button>
                        <button onClick={() => setShowPowerSheet(false)}
                            className="w-full py-3.5 rounded-2xl font-bold text-[14px] active:scale-95 transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            다음에 할게요
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    /* ready → 카운트다운 3·2·1 → showing */
    useEffect(() => {
        if (g.phase !== 'ready') return;
        setCountdown(3);
        const t1 = setTimeout(() => setCountdown(2), 500);
        const t2 = setTimeout(() => setCountdown(1), 1000);
        const t3 = setTimeout(() => dispatch({ type: 'START_SHOWING' }), 1500);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [g.phase, g.roundKey]);

    useEffect(() => {
        if (g.phase !== 'showing') return;
        const id = setTimeout(() => dispatch({ type: 'SHOW_BOARD' }), cfg.showMs);
        return () => clearTimeout(id);
    }, [g.phase, g.roundKey, cfg.showMs]);

    useEffect(() => {
        if (g.phase !== 'selecting') return;
        const id = setTimeout(() => dispatch({ type: 'TIMEOUT' }), cfg.selectMs);
        return () => clearTimeout(id);
    }, [g.phase, g.roundKey, cfg.selectMs]);

    useEffect(() => {
        if (g.phase !== 'correct') return;
        const id = setTimeout(() => dispatch({ type: 'NEXT_ROUND' }), 750);
        return () => clearTimeout(id);
    }, [g.phase, g.roundKey]);


    const STYLES = (
        <style jsx global>{`
            ::-webkit-scrollbar { display: none; }
            @keyframes shrink    { from{width:100%} to{width:0%} }
            @keyframes fadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
            @keyframes zoomIn    { from{opacity:0;transform:scale(0.2)} to{opacity:1;transform:scale(1)} }
            @keyframes pop       { 0%,100%{transform:scale(1)} 50%{transform:scale(1.22)} }
            @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
            @keyframes flashRed  { 0%{opacity:0.8} 100%{opacity:0} }
            @keyframes flashGrn  { 0%{opacity:0.5} 100%{opacity:0} }
            @keyframes pulseTxt  { 0%,100%{opacity:1} 50%{opacity:0.4} }
            @keyframes floatUp   { 0%{opacity:1;transform:translateY(0) scale(1.1)} 100%{opacity:0;transform:translateY(-44px) scale(0.8)} }
            @keyframes comboIn   { from{opacity:0;transform:scale(2)} to{opacity:1;transform:scale(1)} }
            @keyframes countPop  { 0%{opacity:0;transform:scale(1.6)} 25%{opacity:1;transform:scale(1)} 75%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0.7)} }
            @keyframes charBounce { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-12px) scale(1.05)} 60%{transform:translateY(-8px) scale(1.03)} }
            .fade-up   { animation: fadeUp .22s ease forwards; }
            .zoom-in   { animation: zoomIn .32s cubic-bezier(.175,.885,.32,1.275) forwards; }
            .pop-anim  { animation: pop .38s ease; }
            .shake     { animation: shake .4s ease; }
            .char-bounce { animation: charBounce 0.6s ease forwards; }
        `}</style>
    );

    const BG = 'linear-gradient(160deg, #07071a 0%, #0e0e26 55%, #080820 100%)';

    /* ══════ IDLE ══════ */
    if (g.phase === 'idle') {
        const sense = MOCK_SENSE;
        const noPower = powerState.power <= 0;

        return (
            <div className="font-sans select-none min-h-screen overflow-y-auto"
                style={{ background: 'linear-gradient(180deg, #080818 0%, #0c0c24 55%, #09091e 100%)' }}>
                <Head><title>넘버 센스</title></Head>
                {STYLES}
                <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto pb-32">

                    {/* 헤더 */}
                    <div className="pt-12 pb-4 px-6 relative flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform relative z-10">
                            <span className="material-symbols-outlined text-[28px] font-light text-white/50">arrow_back</span>
                        </button>
                        <h1 className="absolute inset-x-0 text-center text-[17px] font-extrabold tracking-tight text-white pointer-events-none">넘버 센스</h1>
                        <div className="ml-auto flex items-center gap-2 relative z-10">
                            <button onClick={() => setShowRank(true)} className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <span className="material-symbols-outlined text-[18px] text-white/50">emoji_events</span>
                            </button>
                            <button onClick={() => setShowInfo(true)} className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <span className="material-symbols-outlined text-[18px] text-white/50">info</span>
                            </button>
                        </div>
                    </div>

                    {showRank && <RankPopup score={0} onClose={() => setShowRank(false)} />}

                    {/* 히어로 */}
                    <div className="flex flex-col items-center pt-2 pb-2">
                        <Image src="/character.png" alt="" width={160} height={160} unoptimized priority />
                        <p className="text-[22px] font-extrabold text-white tracking-tight leading-snug mt-3 text-center px-6">
                            당신의 번호 감각,<br />
                            <span style={{ color: '#818cf8' }}>얼마나 정확할까요?</span>
                        </p>
                        <p className="text-white/30 text-[12px] font-medium mt-2 text-center px-8 leading-relaxed">
                            로또 번호를 기억하고 골라내는 과정에서<br />당신만의 숫자 패턴이 드러납니다
                        </p>
                    </div>

                    {/* 게임 규칙 요약 — 아이콘 3개 */}
                    <div className="flex items-center justify-center gap-5 mt-5 mb-6 px-5">
                        {[
                            { icon: 'visibility',      label: '번호 노출', desc: '0.7~2.5초' },
                            { icon: 'touch_app',       label: '기억 후 탭', desc: '1~6개 번호' },
                            { icon: 'workspace_premium', label: '포인트 적립', desc: '단계별 보상' },
                        ].map(item => (
                            <div key={item.label} className="flex flex-col items-center gap-1.5">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'rgba(99,102,241,0.15)' }}>
                                    <span className="material-symbols-outlined text-[20px]"
                                        style={{ color: '#818cf8', fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                </div>
                                <p className="text-[11px] font-extrabold text-white/70">{item.label}</p>
                                <p className="text-[10px] text-white/30">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* AI 번호 감각 분석 카드 */}
                    <div className="mx-5 mb-5">
                        <div className="rounded-3xl overflow-hidden"
                            style={{
                                background: 'linear-gradient(145deg, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.07) 100%)',
                                border: '1px solid rgba(99,102,241,0.22)',
                            }}>

                            {/* 카드 헤더 */}
                            <div className="px-5 pt-5 pb-4 flex items-center justify-between"
                                style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]"
                                        style={{ color: '#818cf8', fontVariationSettings: "'FILL' 1" }}>psychology</span>
                                    <p className="text-[14px] font-extrabold text-white">번호 감각 분석</p>
                                </div>
                                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                                    style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                                    AI
                                </span>
                            </div>

                            {!sense.hasData ? (
                                <div className="px-5 py-8 flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-[40px] text-white/10"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                                    <p className="text-[13px] font-bold text-white/30">플레이 후 분석됩니다</p>
                                    <p className="text-[11px] text-white/20 text-center leading-relaxed">
                                        정답률, 반응속도, 편향 패턴 등<br />당신만의 번호 감각을 수치로 보여드려요
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* 종합 인사이트 */}
                                    <div className="px-5 py-4"
                                        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                        <p className="text-[10px] font-extrabold tracking-wider text-white/25 mb-1.5">종합 인사이트</p>
                                        <p className="text-[15px] font-extrabold text-white leading-snug">
                                            {sense.weakRange}번대 기억이 가장 취약해요
                                        </p>
                                        <p className="text-[12px] text-white/40 mt-1.5 leading-relaxed">
                                            {sense.oddRatio > 50 ? '홀수' : '짝수'}에 치우친 선택 패턴이 반복됩니다.
                                            번호를 고르게 기억하는 훈련이 필요해요.
                                        </p>
                                    </div>

                                    {/* 핵심 지표 3개 */}
                                    <div className="grid grid-cols-3"
                                        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                        {[
                                            { label: '정답률',   value: `${sense.accuracy}%`,                          color: '#818cf8' },
                                            { label: '반응속도', value: `${(sense.avgReactionMs/1000).toFixed(1)}s`,    color: '#fbbf24' },
                                            { label: '평균생존', value: `${sense.avgDeathRound}R`,                      color: 'rgba(255,255,255,0.55)' },
                                        ].map((m, i) => (
                                            <div key={m.label} className="flex flex-col items-center py-4"
                                                style={{ borderRight: i < 2 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                                                <p className="text-[22px] font-extrabold leading-none" style={{ color: m.color }}>{m.value}</p>
                                                <p className="text-[10px] text-white/30 mt-1">{m.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 패턴 리스트 */}
                                    <div className="px-5 py-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-bold text-white/30">자주 틀리는 구간</p>
                                            <p className="text-[13px] font-extrabold" style={{ color: '#f87171' }}>
                                                {sense.weakRange}번대
                                            </p>
                                        </div>
                                        <div className="h-px" style={{ background: 'rgba(99,102,241,0.1)' }} />
                                        {[
                                            {
                                                label: '홀/짝 경향',
                                                dominant: sense.oddRatio > 50 ? '홀수' : '짝수',
                                                pct: sense.oddRatio > 50 ? sense.oddRatio : 100 - sense.oddRatio,
                                                sub: `반대 ${sense.oddRatio > 50 ? 100 - sense.oddRatio : sense.oddRatio}%`,
                                                color: '#f472b6',
                                            },
                                            {
                                                label: '번호대 경향',
                                                dominant: sense.highRatio > 50 ? '높은 번호(23~45)' : '낮은 번호(1~22)',
                                                pct: sense.highRatio > 50 ? sense.highRatio : 100 - sense.highRatio,
                                                sub: `반대 ${sense.highRatio > 50 ? 100 - sense.highRatio : sense.highRatio}%`,
                                                color: '#60a5fa',
                                            },
                                        ].map((p, i) => (
                                            <React.Fragment key={p.label}>
                                                {i > 0 && <div className="h-px" style={{ background: 'rgba(99,102,241,0.1)' }} />}
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-bold text-white/30">{p.label}</p>
                                                    <p className="text-[13px] font-extrabold" style={{ color: p.color }}>
                                                        {p.dominant} {p.pct}%
                                                    </p>
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                    {/* 시작 버튼 — 하단 고정 */}
                    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-5 pb-8 pt-4 z-40"
                        style={{ background: 'linear-gradient(to top, #09091e 65%, transparent)' }}>
                        {/* 파워 상태 */}
                        <div className="flex items-center justify-center gap-1 mb-3">
                            {Array.from({ length: MAX_POWER }, (_, i) => (
                                <span key={i} className="material-symbols-outlined text-[20px]"
                                    style={{
                                        color: i < powerState.power ? '#60a5fa' : 'rgba(255,255,255,0.15)',
                                        fontVariationSettings: "'FILL' 1",
                                        filter: i < powerState.power ? 'drop-shadow(0 0 6px rgba(96,165,250,0.5))' : 'none',
                                    }}>bolt</span>
                            ))}
                            <p className="text-[11px] font-extrabold text-white/45 ml-1.5">파워 {powerState.power}/{MAX_POWER}</p>
                            {nextRefillSec > 0 && (
                                <p className="text-[10px] text-white/25 ml-1 tabular-nums">· {fmtRefill(nextRefillSec)} 후 충전</p>
                            )}
                        </div>
                        {noPower ? (
                            <button onClick={() => setShowPowerSheet(true)}
                                className="w-full py-4 rounded-2xl font-extrabold text-[17px] active:scale-95 transition-all flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#000' }}>
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
                                30P로 파워 구매
                            </button>
                        ) : (
                            <button onClick={handleStartGame}
                                className="w-full py-4 rounded-2xl font-extrabold text-[17px] active:scale-95 transition-all"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: '#fff' }}>
                                게임 시작
                                <span className="text-[12px] font-bold opacity-60 ml-1.5">⚡ 파워 1개 사용</span>
                            </button>
                        )}
                    </div>

                    {/* 게임 가이드 캐러셀 */}
                    {showInfo && <GuideCarousel onClose={() => setShowInfo(false)} />}
                    {powerOverlays}
                </div>
            </div>
        );
    }

    /* ══════ READY (카운트다운) ══════ */
    if (g.phase === 'ready') return (
        <div className="flex flex-col w-full min-h-screen max-w-[430px] mx-auto font-sans select-none items-center justify-center"
            style={{ background: BG }}>
            <Head><title>넘버 센스</title></Head>
            {STYLES}
            <div className="flex flex-col items-center gap-3">
                <p className="text-[12px] font-extrabold tracking-widest uppercase text-white/30">ROUND {g.round + 1}</p>
                <div key={`${g.roundKey}-${countdown}`} style={{ animation: 'countPop 0.5s ease forwards' }}>
                    <p className="text-[110px] font-extrabold leading-none tabular-nums"
                        style={{ color: cfg.color, textShadow: `0 0 40px ${cfg.color}55` }}>
                        {countdown}
                    </p>
                </div>
                <p className="text-[13px] font-bold text-white/30">준비하세요</p>
            </div>
        </div>
    );

    /* ══════ SHOWING ══════ */
    if (g.phase === 'showing') return (
        <div className="flex flex-col w-full min-h-screen max-w-[430px] mx-auto font-sans select-none"
            style={{ background: BG }}>
            <Head><title>넘버 센스</title></Head>
            {STYLES}
            <header className="relative flex items-center px-4 pt-12 pb-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => router.back()}
                    className="w-9 h-9 flex items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <span className="material-symbols-outlined text-white/50 text-[20px]">arrow_back_ios_new</span>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: cfg.color }}>{cfg.label}</p>
                    <p className="text-[15px] font-extrabold text-white">ROUND {g.round + 1}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {g.combo >= 2 && (
                        <span className="text-[12px] font-extrabold px-2.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                            ×{g.combo}
                        </span>
                    )}
                    <span className="text-[14px] font-extrabold text-white">{g.score}P</span>
                    <button onClick={() => setShowRank(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                        style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
                        <span className="material-symbols-outlined text-[16px]"
                            style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    </button>
                </div>
            </header>

            {/* 순위 팝업 */}
            {showRank && <RankPopup score={g.score} onClose={() => setShowRank(false)} />}

            <div className="flex flex-col flex-1 items-center justify-center px-6 pb-8 gap-8">
                <p className="text-[13px] font-extrabold tracking-widest uppercase"
                    style={{ color: cfg.color, animation: 'pulseTxt 0.8s ease infinite' }}>
                    기억하세요!
                </p>

                {cfg.scatter ? (
                    <div className="relative w-full" style={{ height: 220 }}>
                        {g.shownNums.map((n, i) => {
                            const pos = scatterPos(g.roundKey, i, g.shownNums.length);
                            const { bg, text } = ballColor(n);
                            return (
                                <div key={n} className="absolute zoom-in flex items-center justify-center rounded-full font-extrabold"
                                    style={{ width: 62, height: 62, background: bg, color: text, fontSize: 20,
                                        boxShadow: `0 0 22px ${bg}88`, animationDelay: `${i * 0.06}s`, ...pos }}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            );
                        })}
                    </div>
                ) : cfg.hasBonus ? (
                    <div key={g.roundKey} className="flex flex-col items-center gap-4">
                        <div className="flex flex-wrap justify-center gap-3">
                            {g.shownNums.slice(0, 5).map((n, i) => {
                                const { bg, text } = ballColor(n);
                                return (
                                    <div key={n} className="zoom-in flex items-center justify-center rounded-full font-extrabold"
                                        style={{ width: 68, height: 68, background: bg, color: text, fontSize: 22,
                                            boxShadow: `0 0 24px ${bg}99`, animationDelay: `${i * 0.08}s` }}>
                                        {String(n).padStart(2, '0')}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-px w-10 bg-white/15" />
                            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cfg.color }}>+ 보너스</p>
                            <div className="h-px w-10 bg-white/15" />
                        </div>
                        {(() => {
                            const n = g.shownNums[5];
                            const { bg, text } = ballColor(n);
                            return (
                                <div className="zoom-in flex items-center justify-center rounded-full font-extrabold"
                                    style={{ width: 68, height: 68, background: bg, color: text, fontSize: 22,
                                        boxShadow: `0 0 30px ${cfg.color}99, 0 0 12px ${bg}`, border: `2px solid ${cfg.color}`,
                                        animationDelay: '0.45s' }}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div key={g.roundKey} className="flex flex-wrap justify-center gap-4">
                        {g.shownNums.map((n, i) => {
                            const { bg, text } = ballColor(n);
                            return (
                                <div key={n} className="zoom-in flex items-center justify-center rounded-full font-extrabold"
                                    style={{ width: 74, height: 74, background: bg, color: text, fontSize: 24,
                                        boxShadow: `0 0 28px ${bg}aa`, animationDelay: `${i * 0.09}s` }}>
                                    {String(n).padStart(2, '0')}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="w-full max-w-[280px] flex flex-col gap-2 items-center">
                    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div key={g.roundKey} className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${cfg.color}, #fff6)`,
                                animation: `shrink ${cfg.showMs}ms linear forwards` }} />
                    </div>
                    <p className="text-white/25 text-[11px]">{cfg.count}개 · {(cfg.showMs / 1000).toFixed(1)}초 후 사라집니다</p>
                </div>

                <div className="flex items-center gap-2">
                    {Array.from({ length: WINS_TO_LEVEL }, (_, i) => (
                        <div key={i} className="w-6 h-1.5 rounded-full transition-all"
                            style={{ background: i < g.winsInLevel ? cfg.color : 'rgba(255,255,255,0.12)' }} />
                    ))}
                    <p className="text-[10px] font-medium text-white/25 ml-1">레벨업까지</p>
                </div>
            </div>
        </div>
    );

    /* ══════ SELECTING / CORRECT ══════ */
    if (g.phase === 'selecting' || g.phase === 'correct') {
        const isCorrect = g.phase === 'correct';
        const found  = g.selected.length;
        const target = g.shownNums.length;

        return (
            <div className="relative flex flex-col w-full min-h-screen max-w-[430px] mx-auto font-sans select-none overflow-hidden"
                style={{ background: BG }}>
                <Head><title>넘버 센스</title></Head>
                {STYLES}

                {isCorrect && (
                    <div className="absolute inset-0 z-40 pointer-events-none"
                        style={{ background: 'rgba(34,197,94,0.35)', animation: 'flashGrn 0.6s ease forwards' }} />
                )}
                {isCorrect && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <p className="text-[36px] font-extrabold"
                            style={{ color: '#22c55e', textShadow: '0 0 20px #22c55e88', animation: 'floatUp 0.7s ease forwards' }}>
                            +{g.lastScore}
                        </p>
                    </div>
                )}

                <header className="relative flex items-center px-4 pt-12 pb-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => router.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-full"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <span className="material-symbols-outlined text-white/50 text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: cfg.color }}>{cfg.label}</p>
                        <p className="text-[15px] font-extrabold text-white">ROUND {g.round + (isCorrect ? 0 : 1)}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {g.combo >= 2 && (
                            <span className="text-[12px] font-extrabold px-2.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)',
                                    ...(isCorrect && g.combo >= 2 ? { animation: 'comboIn 0.4s cubic-bezier(.175,.885,.32,1.275)' } : {}) }}>
                                ×{g.combo}
                            </span>
                        )}
                        <span className="text-[14px] font-extrabold text-white">{g.score}P</span>
                        <button onClick={() => setShowRank(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform"
                            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
                            <span className="material-symbols-outlined text-[16px]"
                                style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        </button>
                    </div>
                </header>

                {/* 순위 팝업 */}
                {showRank && <RankPopup score={g.score} onClose={() => setShowRank(false)} />}

                {/* 타이머 바 — 초록→노랑→빨강 */}
                {!isCorrect && (
                    <div className="w-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div key={g.roundKey} className="h-full rounded-r-full"
                            style={{
                                background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 45%, #22c55e 100%)',
                                animation: `shrink ${cfg.selectMs}ms linear forwards`,
                            }} />
                    </div>
                )}

                <div className="flex flex-col flex-1 px-4 pb-6 gap-4 pt-4">
                    <div className="flex items-center justify-center gap-2.5 min-h-[58px]">
                        {Array.from({ length: target }, (_, i) => {
                            const num = g.selected[i];
                            if (num !== undefined) {
                                const { bg, text } = ballColor(num);
                                return (
                                    <div key={i} className="zoom-in flex items-center justify-center rounded-full font-extrabold"
                                        style={{ width: 48, height: 48, background: bg, color: text, fontSize: 15,
                                            boxShadow: `0 0 14px ${bg}99` }}>
                                        {String(num).padStart(2, '0')}
                                    </div>
                                );
                            }
                            return (
                                <div key={i} className="flex items-center justify-center rounded-full"
                                    style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.04)',
                                        border: '2px dashed rgba(255,255,255,0.13)' }} />
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between px-1 min-h-[24px]">
                        {isCorrect ? (
                            <div className="w-full flex items-center justify-center gap-2 fade-up">
                                <span className="material-symbols-outlined text-[18px]"
                                    style={{ color: '#22c55e', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                <p className="text-[14px] font-extrabold" style={{ color: '#22c55e' }}>
                                    완벽해요!{g.combo > 1 ? `  ×${g.combo} 콤보!` : ''}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-white/35 text-[11px] font-bold uppercase tracking-wider">기억한 번호를 탭하세요</p>
                                <p className="text-[13px] font-extrabold"
                                    style={{ color: found === target ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                                    {found} / {target}
                                </p>
                            </>
                        )}
                    </div>

                    <NumberGrid
                        shownNums={g.shownNums}
                        selected={g.selected}
                        deadNum={null}
                        phase={isCorrect ? 'correct' : 'selecting'}
                        onTap={(n) => dispatch({ type: 'TAP_NUM', num: n })}
                    />

                    <div className="flex items-center justify-center gap-2 mt-auto">
                        {Array.from({ length: WINS_TO_LEVEL }, (_, i) => (
                            <div key={i} className="w-6 h-1.5 rounded-full transition-all"
                                style={{ background: i < g.winsInLevel ? cfg.color : 'rgba(255,255,255,0.1)' }} />
                        ))}
                        <p className="text-[10px] text-white/20 ml-1">레벨업까지</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ══════ DEAD ══════ */
    if (g.phase === 'dead') return (
        <div className="relative flex flex-col w-full min-h-screen max-w-[430px] mx-auto font-sans select-none overflow-hidden"
            style={{ background: BG }}>
            <Head><title>넘버 센스</title></Head>
            {STYLES}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'rgba(239,68,68,0.1)' }} />
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'rgba(239,68,68,0.55)', animation: 'flashRed 0.5s ease forwards' }} />

            <div className="relative z-20 flex flex-col flex-1 px-6 pt-10 pb-12 gap-4">

                {/* 캐릭터 + GAME OVER */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative shake">
                        <Image src="/char_regret.png" alt="" width={110} height={110} unoptimized />
                        <div className="absolute -bottom-1 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.95)', border: '2px solid #0e0e26' }}>
                            <span className="material-symbols-outlined text-[15px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                        </div>
                    </div>
                    <div className="text-center mt-1">
                        <p className="text-[34px] font-extrabold text-white tracking-tight leading-none">GAME OVER</p>
                        <p className="text-[13px] font-bold mt-1.5" style={{ color: '#f87171' }}>
                            {g.deadReason === 'timeout' ? '⏱ 시간 초과!' : `${g.wrongNum}번은 정답이 아니에요`}
                        </p>
                    </div>
                </div>

                {/* 정답 공개 */}
                <div className="rounded-2xl p-4 fade-up"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', animationDelay: '.1s' }}>
                    <p className="text-white/25 text-[10px] font-bold tracking-widest uppercase mb-3">정답</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {g.shownNums.map((n, i) => (
                            <div key={n} className="zoom-in" style={{ animationDelay: `${i * 0.07}s` }}>
                                <Ball n={n} size={50} glow />
                            </div>
                        ))}
                    </div>
                    {g.wrongNum && (
                        <div className="mt-3 pt-3 flex items-center justify-center gap-1.5"
                            style={{ borderTop: '1px solid rgba(239,68,68,0.18)' }}>
                            <span className="material-symbols-outlined text-[14px]" style={{ color: '#ef4444', fontVariationSettings: "'FILL' 1" }}>close</span>
                            <p className="text-[12px]" style={{ color: '#f87171' }}>{g.wrongNum}번은 정답에 없었어요</p>
                        </div>
                    )}
                </div>

                {/* 점수 + 스탯 */}
                <div className="rounded-2xl overflow-hidden fade-up" style={{ border: '1px solid rgba(99,102,241,0.25)', animationDelay: '.15s' }}>
                    <div className="px-5 py-4 text-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-1">최종 점수</p>
                        <p className="text-[52px] font-extrabold leading-none" style={{ color: '#a5b4fc' }}>{g.score.toLocaleString()}</p>
                        <p className="text-white/20 text-[11px] mt-0.5">P</p>
                    </div>
                    <div className="grid grid-cols-3 divide-x" style={{ borderTop: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.05)' }}>
                        {[
                            { label: '생존 라운드', value: `${g.round}R` },
                            { label: '최고 콤보',   value: `×${g.maxCombo}` },
                            { label: '도달 레벨',   value: `Lv.${g.level + 1}` },
                        ].map(st => (
                            <div key={st.label} className="flex flex-col items-center py-3 gap-0.5" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
                                <p className="text-[16px] font-extrabold text-white">{st.value}</p>
                                <p className="text-white/25 text-[10px]">{st.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 부활 */}
                {g.canRevive && (
                    <div className="rounded-2xl p-4 fade-up flex items-center gap-3"
                        style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', animationDelay: '.2s' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(251,191,36,0.15)' }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-extrabold text-white leading-tight">광고 보고 한 번 더!</p>
                            <p className="text-[11px] text-white/30">현재 점수 유지 · 게임당 1회</p>
                        </div>
                        <button onClick={() => dispatch({ type: 'REVIVE' })}
                            className="px-4 py-2 rounded-xl font-extrabold text-[13px] active:scale-95 transition-all flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#000' }}>
                            부활
                        </button>
                    </div>
                )}

                {/* 30P 이어서 도전 — 게임당 1회 */}
                {g.canPointRevive && (
                    <div className="rounded-2xl p-4 fade-up flex items-center gap-3"
                        style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.22)', animationDelay: '.23s' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.15)' }}>
                            <span className="material-symbols-outlined text-[20px]" style={{ color: '#818cf8', fontVariationSettings: "'FILL' 1" }}>toll</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-extrabold text-white leading-tight">30P로 이어서 도전</p>
                            <p className="text-[11px] text-white/30">현재 점수 유지 · 게임당 1회 · 보유 {balance.toLocaleString()}P</p>
                        </div>
                        <button onClick={handlePointRevive}
                            className="px-4 py-2 rounded-xl font-extrabold text-[13px] active:scale-95 transition-all flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: '#fff' }}>
                            30P 계속
                        </button>
                    </div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 mt-auto fade-up" style={{ animationDelay: '.26s' }}>
                    <button onClick={() => router.back()}
                        className="flex-1 py-4 rounded-2xl font-bold text-[15px] active:scale-95 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        나가기
                    </button>
                    <button onClick={handleStartGame}
                        className="flex-1 py-4 rounded-2xl font-extrabold text-[15px] text-white active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
                        다시 도전
                    </button>
                </div>
            </div>
            {powerOverlays}
        </div>
    );

    /* ══════ STAGE CLEAR ══════ */
    if (g.phase === 'stageclear') {
        const clearedCfg  = LEVELS[Math.min(g.clearedLevel, LEVELS.length - 1)];
        const baseBonus   = STAGE_BONUS[Math.min(g.clearedLevel, STAGE_BONUS.length - 1)];
        const earnedBonus = baseBonus * g.multiplier;
        const nextBonus   = baseBonus * g.multiplier * 2;
        const isLastLevel = g.clearedLevel >= LEVELS.length - 1;

        return (
            <div className="flex flex-col w-full min-h-screen max-w-[430px] mx-auto font-sans select-none"
                style={{ background: BG }}>
                <Head><title>넘버 센스</title></Head>
                {STYLES}
                <div className="flex flex-col flex-1 items-center justify-center px-6 gap-5">

                    {/* 캐릭터 + 클리어 메시지 */}
                    <div className="flex flex-col items-center gap-3 fade-up">
                        <div className="relative">
                            <Image src="/char_number_sense.png" alt="" width={120} height={120} unoptimized className="char-bounce"
                                style={{ filter: 'drop-shadow(0 4px 24px rgba(99,102,241,0.5))' }} />
                            <div className="absolute -top-1 -right-2 px-2.5 py-0.5 rounded-full"
                                style={{ background: clearedCfg.color }}>
                                <p className="text-[10px] font-extrabold text-black">CLEAR!</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-extrabold tracking-widest uppercase mb-1"
                                style={{ color: clearedCfg.color }}>{clearedCfg.label} 클리어</p>
                            <p className="text-[30px] font-extrabold text-white leading-tight">스테이지 완료!</p>
                            <p className="text-white/30 text-[13px] mt-1">{g.round}라운드 생존 · ×{g.maxCombo} 최고 콤보</p>
                        </div>
                    </div>

                    {/* 보상 카드 */}
                    <div className="w-full rounded-2xl p-5 text-center fade-up"
                        style={{ background: `${clearedCfg.color}12`, border: `1px solid ${clearedCfg.color}30`, animationDelay: '.08s' }}>
                        <p className="text-[11px] font-bold text-white/30 mb-1">이번 스테이지 보너스</p>
                        <p className="text-[44px] font-extrabold leading-none" style={{ color: clearedCfg.color }}>
                            +{earnedBonus}
                        </p>
                        <p className="text-white/25 text-[12px] mt-0.5">P {g.multiplier > 1 ? `(×${g.multiplier} 적용)` : ''}</p>
                        <div className="mt-3 pt-3 flex items-center justify-center gap-1.5"
                            style={{ borderTop: `1px solid ${clearedCfg.color}20` }}>
                            <p className="text-[12px] text-white/35">현재 점수</p>
                            <p className="text-[14px] font-extrabold text-white">{(g.score + earnedBonus).toLocaleString()}P</p>
                        </div>
                    </div>

                    {/* 선택 */}
                    {isLastLevel ? (
                        <button onClick={() => dispatch({ type: 'TAKE_REWARD' })}
                            className="w-full py-4 rounded-2xl font-extrabold text-[16px] text-white active:scale-95 transition-all fade-up"
                            style={{ background: `linear-gradient(135deg, ${clearedCfg.color}, #fff8)`, animationDelay: '.14s' }}>
                            최종 클리어! 포인트 받기
                        </button>
                    ) : (
                        <div className="w-full flex flex-col gap-2.5 fade-up" style={{ animationDelay: '.14s' }}>
                            <button onClick={() => dispatch({ type: 'DOUBLE_DOWN' })}
                                className="w-full py-4 rounded-2xl font-extrabold text-[16px] active:scale-95 transition-all"
                                style={{ background: `linear-gradient(135deg, ${clearedCfg.color}cc, ${LEVELS[Math.min(g.clearedLevel + 1, LEVELS.length - 1)].color})`, color: '#fff' }}>
                                ×2 보너스로 계속 도전
                                <span className="block text-[11px] font-bold opacity-70 mt-0.5">
                                    다음 스테이지 클리어 시 +{nextBonus}P
                                </span>
                            </button>
                            <button onClick={() => dispatch({ type: 'TAKE_REWARD' })}
                                className="w-full py-3.5 rounded-2xl font-bold text-[14px] active:scale-95 transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                지금 받기 (+{earnedBonus}P)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ══════ COMPLETE ══════ */
    if (g.phase === 'complete') return (
        <div className="flex flex-col w-full min-h-screen max-w-[430px] mx-auto font-sans select-none"
            style={{ background: BG }}>
            <Head><title>넘버 센스</title></Head>
            {STYLES}
            <div className="flex flex-col flex-1 px-6 pt-16 pb-12 gap-4">

                {/* 캐릭터 */}
                <div className="flex flex-col items-center gap-3 fade-up">
                    <Image src="/char_number_sense.png" alt="" width={120} height={120} unoptimized className="char-bounce"
                        style={{ filter: 'drop-shadow(0 4px 32px rgba(99,102,241,0.6))' }} />
                    <div className="text-center">
                        <p className="text-[28px] font-extrabold text-white tracking-tight leading-none mb-1">수고했어요!</p>
                        <p className="text-[13px] font-bold" style={{ color: '#818cf8' }}>포인트가 적립되었어요</p>
                    </div>
                </div>

                {/* 최종 점수 */}
                <div className="rounded-2xl p-5 text-center fade-up"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', animationDelay: '.08s' }}>
                    <p className="text-white/30 text-[11px] font-bold tracking-widest uppercase mb-1">적립 포인트</p>
                    <p className="text-[52px] font-extrabold leading-none" style={{ color: '#a5b4fc' }}>{g.score.toLocaleString()}</p>
                    <p className="text-white/20 text-[12px]">P</p>
                </div>

                {/* 스탯 */}
                <div className="grid grid-cols-3 gap-2 fade-up" style={{ animationDelay: '.14s' }}>
                    {[
                        { label: '생존 라운드', value: `${g.round}R` },
                        { label: '최고 콤보',  value: `×${g.maxCombo}` },
                        { label: '도달 레벨',  value: `Lv ${g.level + 1}` },
                    ].map(st => (
                        <div key={st.label} className="rounded-2xl p-3 text-center"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <p className="text-[18px] font-extrabold text-white mb-0.5">{st.value}</p>
                            <p className="text-white/30 text-[10px]">{st.label}</p>
                        </div>
                    ))}
                </div>

                {/* 번호 감각 분석 업데이트 예고 */}
                <div className="rounded-2xl px-4 py-3 flex items-center gap-2.5 fade-up"
                    style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', animationDelay: '.2s' }}>
                    <span className="material-symbols-outlined text-[18px]"
                        style={{ color: '#818cf8', fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <p className="text-[12px] text-white/40 font-medium">번호 감각 분석이 업데이트됐어요</p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 mt-auto fade-up" style={{ animationDelay: '.25s' }}>
                    <button onClick={() => router.back()}
                        className="flex-1 py-4 rounded-2xl font-bold text-[15px] active:scale-95 transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        나가기
                    </button>
                    <button onClick={handleStartGame}
                        className="flex-1 py-4 rounded-2xl font-extrabold text-[15px] text-white active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
                        다시 도전
                    </button>
                </div>
            </div>
            {powerOverlays}
        </div>
    );

    return null;
}
