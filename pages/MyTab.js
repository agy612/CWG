import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import TabHeader, { HeaderIconButton } from './components/TabHeader';

/* 메뉴 순서 — 스크린샷 기준. img=3D 아이콘, theme=화면모드 피커, danger=계정 삭제(빨강), route=null은 준비 중 */
const menuItems = [
    { id: 'attendance', img: '/menu/attendance.png', label: '출석체크', route: '/attendance' },
    { id: 'invite', img: '/menu/invite.png', label: '친구초대', route: '/invite' },
    { id: 'daily_ads', img: '/menu/daily_ads.png', label: '오늘의 광고보기', route: '/daily_ads' },
    { id: 'shop', img: '/menu/shop.png', label: '포인트 교환', route: '/point_shop' },
    { id: 'sub', img: '/menu/sub.png', label: '구독 관리', route: '/my_subscription' },
    { id: 'coupon', img: '/menu/coupon.png', label: '쿠폰함', route: '/coupon_wallet' },
    { id: 'scan_history', img: '/menu/scan_history.png', label: '스캔 내역', route: '/point_history' },
    { id: 'results', img: '/menu/results.png', label: '내 결과 기록', route: '/championship_history' },
    { id: 'notifications', img: '/menu/notifications.png', label: '알림 설정', route: '/notification_settings' },
    { id: 'language', img: '/menu/language.png', label: '언어 설정', route: null },
    { id: 'theme', img: '/menu/theme.png', label: '화면모드 설정', theme: true },
    { id: 'lotto', img: '/menu/lotto.png', label: '내 로또 설정', route: '/lucky_numbers' },
    { id: 'guide', img: '/menu/guide.png', label: '가이드 / 도움말', route: '/guide' },
    { id: 'help', img: '/menu/help.png', label: '고객센터', route: '/help' },
    { id: 'delete', img: '/menu/delete.png', label: '계정 삭제', danger: true, route: null },
];

export default function MyTab() {
    const router = useRouter();
    const { tier, points, scansThisMonth, maxScansPerMonth, subscriptionPlan, subscriptionExpiry, badgeColor, badgeLabel } = useUser();
    const { theme, switchTheme, THEMES } = useTheme();

    const isGuest = tier === 'GUEST';
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);
    const [profile, setProfile] = useState({ nickname: 'Nickname', image: '' });

    useEffect(() => {
        try {
            const raw = localStorage.getItem('fulif_profile');
            if (raw) {
                const p = JSON.parse(raw);
                setProfile({ nickname: p.nickname || 'Nickname', image: p.image || '' });
            }
        } catch {}
    }, []);

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
                <button onClick={() => router.push('/signup')} className="w-full max-w-[280px] py-4 rounded-xl bg-accent text-accent-fg font-extrabold text-base active:scale-95 transition-all mb-3">
                    무료로 시작하기
                </button>
                <button onClick={() => router.push('/lottery_selection')} className="text-t-muted text-sm font-semibold hover:text-t-primary transition-colors">
                    로그인
                </button>
            </div>
        );
    }

    const earnedPoints = scansThisMonth * (tier === 'FREE' ? 50 : tier === 'STANDARD' ? 75 : 100);

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-t-primary pb-32">

            {/* Header */}
            <TabHeader
                title="마이"
                action={
                    <button
                        onClick={() => router.push('/notifications')}
                        aria-label="알림"
                        className="pressable relative inline-flex items-center gap-1 pl-2.5 pr-3 py-2 rounded-full bg-card-gray text-t-secondary"
                        style={{ boxShadow: '0 2px 8px var(--color-shadow)' }}
                    >
                        <span className="material-symbols-outlined text-[18px]">notifications</span>
                        <span className="text-[13px] font-bold">알림</span>
                        <span className="absolute top-1.5 left-6 w-2 h-2 rounded-full bg-[#F04452] ring-2 ring-[var(--color-card)]" />
                    </button>
                }
            />

            {/* Profile 카드 → 프로필 편집 */}
            <button
                onClick={() => router.push('/profile_edit')}
                className="pressable mx-6 mb-3 bg-card-gray rounded-[24px] p-5 flex items-center gap-4 text-left"
            >
                <div className="w-14 h-14 rounded-full bg-btn-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profile.image
                        ? <img src={profile.image} alt="" className="w-full h-full object-cover" />
                        : <span className="material-symbols-outlined text-[30px] text-t-muted" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>}
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="text-[19px] font-bold tracking-tight truncate">{profile.nickname}</div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>{badgeLabel}</span>
                        <span className="text-t-muted text-[12px] font-medium">가입 2026-01-15</span>
                    </div>
                </div>
                <span className="material-symbols-outlined text-[22px] text-t-dim">chevron_right</span>
            </button>

            {/* Points Card */}
            <button
                onClick={() => router.push('/point_history')}
                className="pressable mx-6 mb-3 bg-card-gray rounded-[24px] p-5 text-left block"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-t-muted font-semibold">내 포인트</span>
                    <span className="inline-flex items-center text-[13px] text-t-muted font-semibold whitespace-nowrap">
                        포인트 내역
                        <span className="material-symbols-outlined text-[15px] ml-0.5">chevron_right</span>
                    </span>
                </div>
                <div className="text-[38px] leading-none font-bold tracking-tight text-t-primary">{points.toLocaleString()}<span className="text-[24px] font-bold ml-0.5">P</span></div>
                <div className="text-t-muted text-[12px] font-medium mt-2.5">2027-01-15 만료 예정</div>
            </button>

            {/* Scan Stats — 한 블럭 */}
            <div className="mx-6 mb-4 bg-card-gray rounded-[20px] p-5">
                <div className="text-[15px] font-bold text-t-primary mb-4">이번 주 활동 통계</div>
                <div className="grid grid-cols-3">
                    {[
                        { label: '스캔 횟수', value: `${scansThisMonth}회`, accent: false },
                        { label: '획득 포인트', value: `${earnedPoints.toLocaleString()}P`, accent: true },
                        { label: '남은 스캔', value: `${maxScansPerMonth - scansThisMonth}회`, accent: false },
                    ].map((s, i) => (
                        <div key={s.label} className={`flex flex-col items-center ${i < 2 ? 'border-r border-themed' : ''}`}>
                            <span className={`text-[22px] font-bold tracking-tight ${s.accent ? 'text-accent' : 'text-t-primary'}`}>{s.value}</span>
                            <span className="text-[12px] font-medium text-t-muted mt-1">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscription / Upgrade 배너 */}
            {subscriptionPlan ? (
                <button
                    onClick={() => router.push('/my_subscription')}
                    className="pressable mx-6 mb-4 flex items-center gap-3 rounded-[20px] p-4 bg-card-gray text-left"
                >
                    <span className="material-symbols-outlined text-[26px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold text-t-primary">{subscriptionPlan} 구독 중</div>
                        <div className="text-[12px] text-t-muted font-medium mt-0.5">{subscriptionExpiry} 갱신 예정</div>
                    </div>
                    <span className="material-symbols-outlined text-[22px] text-t-dim">chevron_right</span>
                </button>
            ) : tier === 'FREE' && (
                <button
                    onClick={() => router.push('/subscription')}
                    className="pressable mx-6 mb-4 block text-left"
                >
                    <div className="relative overflow-hidden rounded-[20px]" style={{ height: 132 }}>
                        <img src="/sub_banner.png" alt="" className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none" />
                        {/* 좌측 흰색 그라데이션 오버레이 (글자 가독성) */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(233,242,253,0.98) 0%, rgba(233,242,253,0.85) 38%, rgba(233,242,253,0) 68%)' }} />
                        <div className="relative z-10 h-full px-5 flex flex-col justify-center">
                            <div className="text-[19px] font-bold" style={{ color: '#14304C' }}>구독으로 더 많은 혜택을!</div>
                            <div className="inline-flex items-center gap-0.5 mt-1.5 text-[13px] font-semibold" style={{ color: '#1B64DA' }}>
                                자세히 보기
                                <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Menu — 토스식 흰 카드 그룹 (제목도 카드 안에) */}
            <div className="mx-6 mb-6 bg-card-gray rounded-[20px] px-4 pt-4 pb-1">
                <div className="text-t-secondary text-[14px] font-bold mb-1 px-1">메뉴</div>
                {menuItems.map((item, i) => {
                    const onClick = item.theme
                        ? () => setShowThemePicker(true)
                        : item.danger
                            ? () => setShowLogoutConfirm(true)
                            : item.route
                                ? () => router.push(item.route)
                                : undefined;
                    return (
                        <React.Fragment key={item.id}>
                            <button onClick={onClick}
                                className="flex justify-between items-center py-2.5 px-1 w-full active:opacity-60 transition-opacity disabled:opacity-100"
                                disabled={!onClick}
                            >
                                <div className="flex items-center gap-3">
                                    <img src={item.img} alt="" className="w-9 h-9 object-contain flex-shrink-0" />
                                    <span className={`text-[15px] font-semibold ${item.danger ? 'text-t-muted' : 'text-t-primary'}`}>{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-[20px] text-t-dim">chevron_right</span>
                            </button>
                            {i < menuItems.length - 1 && <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-6 mt-auto pb-2">
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="pressable w-full py-3.5 rounded-2xl bg-card-gray text-t-secondary font-bold text-[15px]"
                >
                    로그아웃
                </button>
                <div className="text-center mt-6">
                    <div className="text-t-secondary text-[13px] font-bold">FULIF Inc.</div>
                    <div className="text-t-dim text-[11px] font-medium mt-1 leading-relaxed">
                        서울특별시 송파구 법원로9길 26<br/>H비즈니스파크 C동 10층 · 버전 1.0.0
                    </div>
                </div>
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
                                            ? 'bg-accent-soft border-accent'
                                            : 'bg-background border-themed hover:border-themed-light'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        theme === t.key ? 'bg-accent-soft' : 'bg-card-gray'
                                    }`}>
                                        <span className={`material-symbols-outlined text-[22px] ${
                                            theme === t.key ? 'text-accent' : 'text-t-secondary'
                                        }`} style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className={`text-[15px] font-bold ${theme === t.key ? 'text-accent' : 'text-t-primary'}`}>{t.label}</div>
                                        <div className="text-xs text-t-muted font-medium mt-0.5">{t.desc}</div>
                                    </div>
                                    {theme === t.key && (
                                        <span className="material-symbols-outlined text-[22px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
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
