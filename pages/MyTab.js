import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import TabHeader, { HeaderIconButton } from './components/TabHeader';

const menuItems = [
    { id: 'chat', icon: 'forum', label: '풀리에게 물어보기', route: '/chat' },
    { id: 'attendance', icon: 'event_available', label: '출석체크', route: '/attendance' },
    { id: 'daily_ads', icon: 'smart_display', label: '오늘의 광고 보기', route: '/daily_ads' },
    { id: 'invite', icon: 'group_add', label: '친구 초대', route: '/invite' },
    { id: 'shop', icon: 'store', label: '포인트샵', route: '/point_shop' },
    { id: 'sub', icon: 'credit_card', label: '구독 관리', route: '/my_subscription' },
    { id: 'prize', icon: 'redeem', label: '경품추첨', route: '/prize_draw' },
    { id: 'coupon', icon: 'confirmation_number', label: '쿠폰함', route: '/coupon_wallet' },
    { id: 'lucky', icon: 'filter_vintage', label: '럭키/제외 번호', route: '/lucky_numbers' },
    { id: 'notifications', icon: 'notifications', label: '알림 설정', route: '/notification_settings' },
    { id: 'tutorial', icon: 'school', label: '튜토리얼 다시 보기', route: '/tutorial_intro' },
    { id: 'help', icon: 'help', label: '고객센터', route: '/help' },
];

export default function MyTab() {
    const router = useRouter();
    const { tier, points, scansThisMonth, maxScansPerMonth, subscriptionPlan, subscriptionExpiry, badgeColor, badgeLabel } = useUser();
    const { theme, switchTheme, THEMES } = useTheme();

    const isGuest = tier === 'GUEST';
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user_registered');
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('lottery_selected');
        router.replace('/login');
    };

    if (isGuest) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-32 items-center justify-center px-6">
                <div className="w-20 h-20 rounded-full bg-card-gray flex items-center justify-center mb-6 border border-themed-light">
                    <span className="material-symbols-outlined text-[40px] text-t-dim font-light">person</span>
                </div>
                <h2 className="text-2xl font-extrabold text-center mb-2">아직 가입하지 않으셨나요?</h2>
                <p className="text-t-muted text-sm font-medium text-center mb-8">가입하면 +100P 보너스와 함께<br/>모든 기능을 이용할 수 있어요</p>
                <button onClick={() => router.push('/signup')} className="w-full max-w-[280px] py-4 rounded-xl bg-bg-inverse text-t-inverse font-extrabold text-base active:scale-95 transition-all mb-3">
                    무료로 시작하기
                </button>
                <button onClick={() => router.push('/lottery_selection')} className="text-t-muted text-sm font-semibold hover:text-t-primary transition-colors">
                    로그인
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-32">

            {/* Header */}
            <TabHeader
                title="마이"
                subtitle="환영합니다"
                action={
                    <HeaderIconButton
                        icon="notifications"
                        label="알림"
                        onClick={() => router.push('/notifications')}
                    />
                }
            />

            {/* Profile */}
            <div className="flex items-center gap-5 px-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-card-gray flex items-center justify-center border border-themed-light" style={{ boxShadow: '0 0 20px var(--color-glow)' }}>
                    <span className="material-symbols-outlined text-[32px] font-light text-t-secondary">person</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-[20px] font-extrabold tracking-tight">Nickname</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${badgeColor}`}>{badgeLabel}</span>
                        <span className="text-t-muted text-xs font-semibold">가입일: 2026-01-15</span>
                    </div>
                </div>
            </div>

            {/* Points Card */}
            <div className="mx-6 bg-card-gray rounded-3xl p-6 flex flex-col gap-2 relative overflow-hidden border border-themed mb-4">
                <div className="absolute inset-0 metallic-grain" />
                <div className="text-t-muted text-sm font-semibold z-10">내 포인트</div>
                <div className="text-4xl font-extrabold tracking-tight text-t-primary mb-1 z-10">{points.toLocaleString()} P</div>
                <div className="flex items-center justify-between z-10">
                    <div className="text-t-dim text-xs font-medium">만료 예정: 2027-01-15</div>
                    <button onClick={() => router.push('/point_history')} className="text-t-muted text-[13px] font-semibold hover:text-t-primary transition-colors">
                        거래 내역 보기 &gt;
                    </button>
                </div>
            </div>

            {/* Scan Stats */}
            <div className="mx-6 bg-card-gray rounded-3xl p-6 grid grid-cols-3 gap-y-3 gap-x-4 border border-themed mb-4">
                <div className="col-span-3 text-t-muted text-sm font-semibold">이번 주 스캔 통계</div>
                <div className="flex flex-col">
                    <div className="text-t-dim text-[10px] font-bold uppercase tracking-widest mb-1">스캔 횟수</div>
                    <div className="text-xl font-bold text-t-primary">{scansThisMonth}회</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-t-dim text-[10px] font-bold uppercase tracking-widest mb-1">획득 포인트</div>
                    <div className="text-xl font-bold text-[#14b8a6]">{(scansThisMonth * (tier === 'FREE' ? 50 : tier === 'STANDARD' ? 75 : 100)).toLocaleString()}P</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-t-dim text-[10px] font-bold uppercase tracking-widest mb-1">남은 스캔</div>
                    <div className="text-xl font-bold text-t-primary">{maxScansPerMonth - scansThisMonth}회</div>
                </div>
            </div>

            {/* Subscription Status */}
            {subscriptionPlan && (
                <div className={`mx-6 mb-4 flex items-center gap-3 rounded-2xl p-4 border ${
                    subscriptionPlan === 'PRO'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20'
                        : 'bg-card-gray border-themed-light'
                }`}>
                    <span className={`material-symbols-outlined text-[22px] ${subscriptionPlan === 'PRO' ? 'text-[#D4AF37]' : 'text-t-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <div className="flex-1">
                        <div className={`text-sm font-bold ${subscriptionPlan === 'PRO' ? 'text-[#D4AF37]' : 'text-t-primary'}`}>{subscriptionPlan} 구독 중</div>
                        <div className="text-xs text-t-muted font-medium mt-0.5">{subscriptionExpiry} 갱신 예정</div>
                    </div>
                    <button onClick={() => router.push('/my_subscription')} className="text-xs font-semibold text-t-secondary hover:text-t-primary transition-colors">관리</button>
                </div>
            )}

            {/* Upgrade prompt for FREE */}
            {tier === 'FREE' && (
                <div className="mx-6 mb-4 flex items-center gap-3 bg-card-gray rounded-2xl p-4 border border-themed">
                    <span className="material-symbols-outlined text-[22px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>upgrade</span>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-t-primary">무료 회원</div>
                        <div className="text-xs text-t-muted font-medium mt-0.5">구독하면 포인트 1.5배 + 픽 무제한</div>
                    </div>
                    <button onClick={() => router.push('/subscription')} className="text-xs font-bold text-[#14b8a6] hover:opacity-80 transition-opacity">업그레이드</button>
                </div>
            )}

            {/* Menu */}
            <div className="flex flex-col px-6 gap-1 mb-8">
                <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3 px-2">메뉴</div>

                {/* Theme Setting */}
                <button onClick={() => setShowThemePicker(true)}
                    className="flex justify-between items-center py-4 border-b border-themed cursor-pointer hover:bg-card-hover rounded-xl px-2 -mx-2 transition-colors group active:scale-[0.98] w-full"
                >
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-[24px] text-t-secondary font-light group-hover:text-t-primary transition-colors">palette</span>
                        <span className="text-[15px] font-semibold text-t-primary">화면 모드</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-t-muted font-medium">{THEMES[theme].label}</span>
                        <span className="material-symbols-outlined text-[20px] text-t-dim font-light group-hover:text-t-primary transition-colors">chevron_right</span>
                    </div>
                </button>

                {menuItems.map(item => (
                    <button key={item.id} onClick={() => router.push(item.route)}
                        className="flex justify-between items-center py-4 border-b border-themed cursor-pointer hover:bg-card-hover rounded-xl px-2 -mx-2 transition-colors group active:scale-[0.98] w-full"
                    >
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[24px] text-t-secondary font-light group-hover:text-t-primary transition-colors">{item.icon}</span>
                            <span className="text-[15px] font-semibold text-t-primary">{item.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-[20px] text-t-dim font-light group-hover:text-t-primary transition-colors">chevron_right</span>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center flex flex-col items-center gap-4 mt-auto border-t border-themed pt-8 mx-6">
                <div className="text-t-dim text-xs font-semibold">버전: 1.0.0</div>
                <button onClick={() => setShowLogoutConfirm(true)} className="bg-transparent border-none text-[#FF453A] text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity">로그아웃</button>
            </div>

            {/* Logout confirm dialog */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <h3 className="text-lg font-extrabold text-t-primary text-center mb-2">로그아웃</h3>
                        <p className="text-t-muted text-sm font-medium text-center mb-6">로그아웃 하시겠습니까?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-4 rounded-xl bg-btn-secondary text-btn-secondary-text font-bold text-sm active:scale-95 transition-all border border-themed"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-4 rounded-xl bg-[#FF453A]/15 text-[#FF453A] font-extrabold text-sm active:scale-95 transition-all border border-[#FF453A]/20"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Theme picker dialog */}
            {showThemePicker && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center max-w-[430px] mx-auto">
                    <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setShowThemePicker(false)} />
                    <div className="relative w-full bg-card-gray rounded-t-3xl border-t border-themed-light p-6 pb-10 shadow-2xl">
                        <h3 className="text-lg font-extrabold text-t-primary text-center mb-1">화면 모드</h3>
                        <p className="text-t-muted text-sm font-medium text-center mb-6">원하는 테마를 선택하세요</p>
                        <div className="flex flex-col gap-2">
                            {Object.values(THEMES).map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => { switchTheme(t.key); setShowThemePicker(false); }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                                        theme === t.key
                                            ? 'bg-[#14b8a6]/10 border-[#14b8a6]/30'
                                            : 'bg-background border-themed hover:border-themed-light'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        theme === t.key ? 'bg-[#14b8a6]/20' : 'bg-card-gray'
                                    }`}>
                                        <span className={`material-symbols-outlined text-[22px] ${
                                            theme === t.key ? 'text-[#14b8a6]' : 'text-t-secondary'
                                        }`} style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className={`text-[15px] font-bold ${theme === t.key ? 'text-[#14b8a6]' : 'text-t-primary'}`}>{t.label}</div>
                                        <div className="text-xs text-t-muted font-medium mt-0.5">{t.desc}</div>
                                    </div>
                                    {theme === t.key && (
                                        <span className="material-symbols-outlined text-[22px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
