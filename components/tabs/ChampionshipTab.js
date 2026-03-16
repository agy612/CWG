import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../contexts/UserContext';
import { getLotteryInfo } from '../../utils/lottery';

const PRESET_VALUES = {
    '트렌드': { hot: 90, cold: 0, due: 60, freqBalance: 30, oddEven: 40, highLow: 40, consecutive: 50, sectionSpread: 60, numberGap: 30, edgeNumber: 20, sumRange: 50, primeRatio: 30, acValue: 50, lastDigit: 40, prevInclude: 20, prevExclude: 30, losingAvoid: 40, historyExclude: 50, luckyNumber: 30, excludeNumber: 100 },
    '역발상': { hot: 0, cold: 80, due: 30, freqBalance: 40, oddEven: 50, highLow: 50, consecutive: 20, sectionSpread: 70, numberGap: 60, edgeNumber: 70, sumRange: 40, primeRatio: 50, acValue: 60, lastDigit: 50, prevInclude: 0, prevExclude: 70, losingAvoid: 90, historyExclude: 60, luckyNumber: 20, excludeNumber: 100 },
    '균형': { hot: 40, cold: 40, due: 40, freqBalance: 80, oddEven: 80, highLow: 80, consecutive: 40, sectionSpread: 80, numberGap: 60, edgeNumber: 40, sumRange: 80, primeRatio: 60, acValue: 70, lastDigit: 70, prevInclude: 30, prevExclude: 30, losingAvoid: 50, historyExclude: 50, luckyNumber: 40, excludeNumber: 100 },
    '수학': { hot: 30, cold: 20, due: 30, freqBalance: 50, oddEven: 90, highLow: 80, consecutive: 30, sectionSpread: 80, numberGap: 70, edgeNumber: 50, sumRange: 100, primeRatio: 70, acValue: 90, lastDigit: 80, prevInclude: 20, prevExclude: 20, losingAvoid: 40, historyExclude: 40, luckyNumber: 20, excludeNumber: 100 },
    '내번호': { hot: 10, cold: 10, due: 10, freqBalance: 20, oddEven: 30, highLow: 30, consecutive: 20, sectionSpread: 30, numberGap: 20, edgeNumber: 10, sumRange: 30, primeRatio: 20, acValue: 30, lastDigit: 20, prevInclude: 10, prevExclude: 20, losingAvoid: 30, historyExclude: 80, luckyNumber: 100, excludeNumber: 100 },
    '커스텀': null,
};

const FILTER_GROUPS = [
    {
        id: 'A', label: '빈도', icon: 'bar_chart',
        filters: [
            { id: 'hot', label: '핫 넘버', desc: '최근 자주 출현한 번호 선호' },
            { id: 'cold', label: '콜드 넘버', desc: '최근 출현이 적은 번호 선호' },
            { id: 'due', label: '듀 넘버', desc: '출현 주기 대비 미출현 번호' },
            { id: 'freqBalance', label: '빈도 균형', desc: '핫/콜드 균형 잡힌 구성' },
        ],
    },
    {
        id: 'B', label: '패턴', icon: 'pattern',
        filters: [
            { id: 'oddEven', label: '홀짝 균형', desc: '홀수/짝수 비율 조정 (3:3 선호)' },
            { id: 'highLow', label: '고저 균형', desc: '고번호/저번호 비율 조정' },
            { id: 'consecutive', label: '연속 번호', desc: '연속된 번호 포함 정도' },
            { id: 'sectionSpread', label: '구간 분산', desc: '전 구간 균등 분포 선호' },
            { id: 'numberGap', label: '번호 간격', desc: '번호 간 적절한 간격 유지' },
            { id: 'edgeNumber', label: '끝번호', desc: '1, 45 등 끝자리 번호 선호' },
        ],
    },
    {
        id: 'C', label: '수학', icon: 'calculate',
        filters: [
            { id: 'sumRange', label: '합계 범위', desc: '6개 합계 100~175 권장 범위' },
            { id: 'primeRatio', label: '소수 비율', desc: '소수 번호 포함 비율 조정' },
            { id: 'acValue', label: 'AC값', desc: '번호 복잡도 7~10 범위 선호' },
            { id: 'lastDigit', label: '끝자리 다양성', desc: '끝자리 번호 다양성 확보' },
        ],
    },
    {
        id: 'D', label: '히스토리', icon: 'history',
        filters: [
            { id: 'prevInclude', label: '이전 당첨 포함', desc: '이전 회차 당첨번호 일부 포함' },
            { id: 'prevExclude', label: '이전 당첨 제외', desc: '이전 회차 당첨번호 제외' },
            { id: 'losingAvoid', label: '낙첨 패턴 회피', desc: '반복 낙첨 조합 패턴 피하기' },
        ],
    },
    {
        id: 'E', label: '개인 설정', icon: 'person',
        filters: [
            { id: 'historyExclude', label: '내 번호 중복 제외', desc: '과거 생성 번호와 중복 방지' },
            { id: 'luckyNumber', label: '럭키 번호 포함', desc: '설정한 럭키 번호 우선 포함' },
            { id: 'excludeNumber', label: '제외 번호 배제', desc: '설정한 제외 번호 반드시 제외' },
        ],
    },
];

const DEFAULT_VALUES = Object.fromEntries(
    FILTER_GROUPS.flatMap(g => g.filters.map(f => [f.id, 0]))
);

const PRESET_ICONS = { '트렌드': 'local_fire_department', '역발상': 'ac_unit', '균형': 'balance', '수학': 'calculate', '내번호': 'filter_vintage', '커스텀': 'edit' };

export default function ChampionshipTab() {
    const router = useRouter();
    const { tier, points, championshipCostFirst, championshipFreeToday, championshipCostAdditional } = useUser();

    const [activePreset, setActivePreset] = useState('트렌드');
    const [filterValues, setFilterValues] = useState({ ...DEFAULT_VALUES, ...PRESET_VALUES['트렌드'] });
    const [expandedGroup, setExpandedGroup] = useState('A');
    const [savedPresets, setSavedPresets] = useState([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [lotteryInfo, setLotteryInfo] = useState(null);
    const carouselRef = useRef(null);
    const dragState = useRef({ dragging: false, startX: 0, scrollLeft: 0 });

    const onCarouselMouseDown = (e) => {
        dragState.current = { dragging: true, startX: e.pageX, scrollLeft: carouselRef.current.scrollLeft };
        carouselRef.current.style.cursor = 'grabbing';
    };
    const onCarouselMouseMove = (e) => {
        if (!dragState.current.dragging) return;
        e.preventDefault();
        carouselRef.current.scrollLeft = dragState.current.scrollLeft - (e.pageX - dragState.current.startX);
    };
    const onCarouselMouseUp = (e) => {
        dragState.current.dragging = false;
        if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
    };
    const onCarouselClick = (e) => {
        // suppress click if it was a drag (moved more than 5px)
        if (Math.abs(e.pageX - dragState.current.startX) > 5) e.stopPropagation();
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = JSON.parse(localStorage.getItem('cwg_saved_presets') || '[]');
                setSavedPresets(stored);
            } catch {}
        }
        setLotteryInfo(getLotteryInfo());
    }, []);

    const isGuest = tier === 'GUEST';

    const cost = championshipFreeToday ? 0 : (championshipCostFirst ?? 100);
    const costLabel = isGuest ? '로그인 필요' :
        championshipFreeToday ? '오늘 1회 무료 남음!' :
        `${cost}P`;

    const canGenerate = !isGuest && points >= cost;

    const handlePresetSelect = (preset, savedFilterValues) => {
        setActivePreset(preset);
        if (savedFilterValues) {
            setFilterValues(savedFilterValues);
        } else if (PRESET_VALUES[preset]) {
            setFilterValues({ ...DEFAULT_VALUES, ...PRESET_VALUES[preset] });
        }
    };

    const handleDeleteSavedPreset = (id, e) => {
        e.stopPropagation();
        const updated = savedPresets.filter(p => p.id !== id);
        setSavedPresets(updated);
        if (typeof window !== 'undefined') {
            localStorage.setItem('cwg_saved_presets', JSON.stringify(updated));
        }
        if (activePreset === `saved_${id}`) {
            setActivePreset('트렌드');
            setFilterValues({ ...DEFAULT_VALUES, ...PRESET_VALUES['트렌드'] });
        }
    };

    const handleSliderChange = (id, value) => {
        setFilterValues(prev => ({ ...prev, [id]: Number(value) }));
        setActivePreset('커스텀');
    };

    const handleGenerate = () => {
        if (isGuest) { router.push('/signup'); return; }
        setShowConfirmDialog(true);
    };

    const handleConfirmGenerate = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cwg_pending_filterValues', JSON.stringify(filterValues));
        }
        router.push(`/championship_result?preset=${activePreset}&cost=${cost}`);
    };

    const activeFiltersCount = Object.values(filterValues).filter(v => v > 0).length;

    // Guest preview overlay
    const GuestOverlay = () => (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-overlay-heavy backdrop-blur-sm rounded-2xl">
            <span className="material-symbols-outlined text-[40px] text-t-muted mb-3">lock</span>
            <p className="text-sm font-bold text-btn-secondary-text mb-4 text-center">로그인 후 사용 가능합니다</p>
            <button onClick={() => router.push('/signup')} className="px-6 py-3 bg-bg-inverse text-t-inverse font-extrabold rounded-full text-sm active:scale-95 transition-all">
                무료로 시작하기
            </button>
        </div>
    );

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-36">

            {/* Header */}
            <div className="flex items-center gap-4 mt-8 mb-6 px-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-t-dim via-t-secondary to-t-primary shadow-2xl relative flex-shrink-0 flex items-center justify-center overflow-hidden border border-themed-light">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-overlay" />
                    <span className="material-symbols-outlined text-[30px] text-t-faint z-10" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
                <div className="flex flex-col flex-1">
                    <h1 className="text-2xl font-extrabold m-0 tracking-tight">챔피언십</h1>
                    <p className="text-t-muted text-[13px] font-semibold mt-0.5">나만의 전략으로 번호를 만들자!</p>
                    <p className="text-t-dim text-xs font-medium mt-0.5">로또 6/45 · 제{lotteryInfo?.nextRound || '---'}회</p>
                </div>
                <button onClick={() => router.push('/championship_history')} className="flex flex-col items-center gap-0.5 text-t-muted hover:text-t-primary transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-[22px] font-light">history</span>
                    <span className="text-[10px] font-bold">히스토리</span>
                </button>
            </div>

            {/* PRO free daily badge */}
            {championshipFreeToday && (
                <div className="mx-6 mb-4 flex items-center gap-2 bg-[#D4AF37]/10 rounded-2xl p-3 border border-[#D4AF37]/20">
                    <span className="material-symbols-outlined text-[18px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <span className="text-xs font-bold text-[#D4AF37]">PRO 혜택: 오늘 1회 무료 생성 남아있음 (추가 생성 시 50P)</span>
                </div>
            )}

            {/* Presets */}
            <div
                ref={carouselRef}
                className="flex gap-2.5 overflow-x-auto pb-3 px-6 select-none"
                style={{ scrollbarWidth: 'none', cursor: 'grab' }}
                onMouseDown={onCarouselMouseDown}
                onMouseMove={onCarouselMouseMove}
                onMouseUp={onCarouselMouseUp}
                onMouseLeave={onCarouselMouseUp}
                onClick={onCarouselClick}
            >
                {Object.keys(PRESET_VALUES).map(preset => (
                    <button
                        key={preset}
                        onClick={() => handlePresetSelect(preset)}
                        className={`px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                            activePreset === preset
                                ? 'bg-bg-inverse text-t-inverse shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                : 'bg-card-gray text-t-primary border border-themed'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{PRESET_ICONS[preset]}</span>
                        {preset}
                    </button>
                ))}
                {savedPresets.length > 0 && (
                    <div className="w-px bg-[var(--color-border-light)] self-stretch mx-1 flex-shrink-0" />
                )}
                {savedPresets.map(sp => (
                    <button
                        key={sp.id}
                        onClick={() => handlePresetSelect(`saved_${sp.id}`, sp.filterValues)}
                        className={`px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                            activePreset === `saved_${sp.id}`
                                ? 'bg-bg-inverse text-t-inverse shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                : 'bg-card-gray text-t-primary border border-[#14b8a6]/30'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                        {sp.name}
                        <span
                            role="button"
                            onClick={(e) => handleDeleteSavedPreset(sp.id, e)}
                            className="material-symbols-outlined text-[13px] opacity-40 hover:opacity-100 -mr-1"
                        >close</span>
                    </button>
                ))}
            </div>

            {/* Filters count */}
            <div className="mx-6 mt-4 mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-t-muted">활성 필터 <span className="text-t-primary font-bold">{activeFiltersCount}</span>개 / 35개</span>
                <button onClick={() => { setFilterValues(DEFAULT_VALUES); setActivePreset('커스텀'); }} className="text-xs font-semibold text-t-dim hover:text-t-primary transition-colors">초기화</button>
            </div>

            {/* Filter Groups */}
            <div className="mt-2 flex flex-col gap-2 px-6 relative">
                {isGuest && <GuestOverlay />}

                {FILTER_GROUPS.map(group => {
                    const isOpen = expandedGroup === group.id;
                    const groupActive = group.filters.filter(f => filterValues[f.id] > 0).length;

                    return (
                        <div key={group.id} className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                            <button
                                className="w-full flex items-center gap-3 px-5 py-4 active:bg-card-hover transition-colors"
                                onClick={() => setExpandedGroup(isOpen ? null : group.id)}
                            >
                                <span className="material-symbols-outlined text-[20px] text-t-secondary font-light" style={{ fontVariationSettings: "'FILL' 1" }}>{group.icon}</span>
                                <span className="text-sm font-bold text-t-primary flex-1 text-left">[{group.id}] {group.label}</span>
                                {groupActive > 0 && (
                                    <span className="text-[11px] font-bold text-[#14b8a6] bg-[#14b8a6]/15 px-2 py-0.5 rounded-full">{groupActive}활성</span>
                                )}
                                <span className={`material-symbols-outlined text-[20px] text-t-dim transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {isOpen && (
                                <div className="border-t border-themed px-5 pt-4 pb-5 flex flex-col gap-6">
                                    {group.filters.map(filter => {
                                        const val = filterValues[filter.id];
                                        const isActive = val > 0;
                                        return (
                                            <div key={filter.id} className="flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-bold ${isActive ? 'text-t-primary' : 'text-t-muted'}`}>{filter.label}</span>
                                                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />}
                                                        </div>
                                                        <span className="text-[11px] text-t-dim font-medium mt-0.5">{filter.desc}</span>
                                                    </div>
                                                    <span className={`text-base font-extrabold ${isActive ? 'text-t-primary' : 'text-t-faint'}`}>{val}</span>
                                                </div>
                                                <div className="relative w-full h-1 bg-btn-secondary rounded-full">
                                                    <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-75 ${isActive ? 'bg-bg-inverse' : 'bg-card-hover'}`} style={{ width: `${val}%` }} />
                                                    <input type="range" min="0" max="100" step="10" value={val}
                                                        onChange={e => handleSliderChange(filter.id, e.target.value)}
                                                        className="absolute w-full top-[-8px] opacity-0 cursor-pointer h-5 z-20"
                                                    />
                                                    {isActive && (
                                                        <div className="absolute top-[-6px] w-4 h-4 rounded-full bg-bg-inverse shadow-[0_2px_5px_rgba(0,0,0,0.5)] pointer-events-none z-10" style={{ left: `calc(${val}% - 8px)` }} />
                                                    )}
                                                </div>
                                                <div className="flex justify-between text-[10px] text-t-faint font-bold">
                                                    <span>무시</span><span>약함</span><span>강함</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Lucky number shortcut */}
            <button onClick={() => router.push('/lucky_numbers')} className="mx-6 mt-4 flex items-center gap-3 p-4 bg-card-gray rounded-2xl border border-themed active:bg-btn-secondary transition-colors">
                <span className="material-symbols-outlined text-[20px] text-t-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>filter_vintage</span>
                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-t-primary">럭키/제외 번호 설정</div>
                    <div className="text-xs text-t-muted font-medium mt-0.5">개인 설정 필터에 적용됩니다</div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-t-dim">chevron_right</span>
            </button>

            {/* Sticky Bottom */}
            <div className="fixed bottom-[80px] left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-[var(--color-gradient-solid)] via-[var(--color-gradient-solid)]/90 to-transparent z-40">
                <div className="bg-surface p-5 rounded-3xl w-full flex flex-col gap-4 border border-themed shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between w-full text-t-muted text-[13px] font-semibold">
                        <span>비용: <span className={`font-bold ${cost === 0 ? 'text-[#D4AF37]' : 'text-t-primary'}`}>{costLabel}</span></span>
                        {!isGuest && <span>잔액: <span className="text-t-primary font-bold">{points.toLocaleString()}P</span></span>}
                    </div>
                    {!canGenerate && !isGuest && (
                        <p className="text-xs text-red-400 font-semibold text-center">포인트가 부족합니다 ({cost - points}P 더 필요)</p>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={!isGuest && !canGenerate}
                        className="w-full py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all disabled:opacity-30"
                    >
                        {isGuest ? '로그인 후 사용하기' : '번호 생성하기'}
                    </button>
                </div>
            </div>

            {/* Confirm generate dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowConfirmDialog(false)} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <div className="flex flex-col items-center gap-1 mb-4">
                            <span className="material-symbols-outlined text-[36px] text-t-secondary mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                            <h3 className="text-lg font-extrabold text-t-primary">챔피언십 번호 생성 확인</h3>
                            <p className="text-t-muted text-sm font-medium text-center">
                                {cost > 0 ? `${cost}P를 사용해서` : '무료로'} 나만의 전략으로<br/>번호 6개를 생성합니다
                            </p>
                        </div>
                        <div className="mb-6 flex items-start gap-2 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                            <span className="material-symbols-outlined text-[16px] text-amber-500 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                            <div className="text-xs text-amber-500 font-medium leading-relaxed">
                                번호는 사용자마다 랜덤으로 생성되며, 당첨 결과에 대한 책임을 지지 않습니다.
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmGenerate}
                                className="flex-1 py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-sm active:scale-95 transition-all"
                            >
                                {cost > 0 ? `${cost}P 사용하기` : '무료 생성하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
