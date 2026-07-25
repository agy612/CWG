import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const INITIAL_NOTIFICATIONS = [
    {
        id: 'n1',
        type: 'hit',
        icon: 'celebration',
        iconColor: 'text-accent',
        iconBg: 'bg-accent-soft',
        title: '번호 일치 알림',
        message: '이번 주 생성한 번호에서 4개 일치가 나왔어요! 결과를 확인해보세요.',
        time: '방금 전',
        unread: true,
        route: '/scan_result',
    },
    {
        id: 'n2',
        type: 'pick',
        icon: 'auto_awesome',
        iconColor: 'text-[#D4AF37]',
        iconBg: 'bg-[#D4AF37]/15',
        title: '이번 주 번호가 도착했어요',
        message: '제1228회 추천 번호와 내가 만든 번호를 확인해보세요.',
        time: '2시간 전',
        unread: true,
        route: '/number_push',
    },
    {
        id: 'n3',
        type: 'reminder',
        icon: 'photo_camera',
        iconColor: 'text-t-primary',
        iconBg: 'bg-card-hover',
        title: '스캔 리마인더',
        message: '추첨 결과가 발표되었어요. 보유 티켓을 스캔하고 포인트를 받아가세요.',
        time: '어제',
        unread: false,
        route: '/ScanTab',
    },
    {
        id: 'n4',
        type: 'promo',
        icon: 'local_offer',
        iconColor: 'text-[#FF6B6B]',
        iconBg: 'bg-[#FF6B6B]/15',
        title: '주말 한정 2배 포인트 이벤트',
        message: '이번 주말 스캔 시 적립 포인트가 2배! 놓치지 마세요.',
        time: '2일 전',
        unread: false,
        route: '/promo_preview',
    },
    {
        id: 'n5',
        type: 'subscription',
        icon: 'credit_card',
        iconColor: 'text-t-secondary',
        iconBg: 'bg-btn-secondary',
        title: '구독 갱신 안내',
        message: 'STANDARD 구독이 3일 후 갱신될 예정입니다.',
        time: '3일 전',
        unread: false,
        route: '/my_subscription',
    },
    {
        id: 'n6',
        type: 'event',
        icon: 'stars',
        iconColor: 'text-[#A78BFA]',
        iconBg: 'bg-[#A78BFA]/15',
        title: '무료 럭키이벤트 충전 완료',
        message: '오늘의 무료 티켓이 충전되었어요. 지금 참여해보세요!',
        time: '4일 전',
        unread: false,
        route: '/championship_history',
    },
];

function MiniAdBanner() {
    return (
        <button
            onClick={() => alert('광고 상세 페이지로 이동')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl border border-themed bg-gradient-to-r from-[#3182F6]/10 via-card-gray to-[#D4AF37]/10 active:scale-[0.98] transition-all text-left relative overflow-hidden"
        >
            <div className="absolute top-1.5 right-2 text-[9px] font-bold text-t-dim tracking-widest uppercase">AD</div>
            <div className="w-10 h-10 rounded-xl bg-bg-inverse flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px] text-t-inverse" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-t-primary truncate">PRO 구독 50% 할인</div>
                <div className="text-[11px] text-t-muted font-medium truncate">월 구독료 반값, 픽 무제한 + 포인트 2배</div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-t-dim font-light">chevron_right</span>
        </button>
    );
}

export default function Notifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => n.unread).length;

    const handleOpen = (n) => {
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x));
        if (n.route) router.push(n.route);
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(x => ({ ...x, unread: false })));
    };

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 알림</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight flex-1">알림</h1>
                    <button
                        onClick={() => router.push('/notification_settings')}
                        aria-label="알림 설정"
                        className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray border border-themed text-t-muted hover:text-t-primary active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[14px]">settings</span>
                        <span className="text-[11px] font-bold whitespace-nowrap">설정</span>
                    </button>
                </div>

                {/* Summary Bar */}
                <div className="mx-6 mb-4 flex items-center justify-between">
                    <div className="text-xs text-t-muted font-semibold">
                        {unreadCount > 0 ? (
                            <>읽지 않은 알림 <span className="text-accent font-bold">{unreadCount}</span>개</>
                        ) : (
                            '모든 알림을 확인했어요'
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] font-bold text-t-secondary hover:text-t-primary transition-colors">
                            모두 읽음
                        </button>
                    )}
                </div>

                {/* Mini ad banner at the top */}
                <div className="px-6 mb-3">
                    <MiniAdBanner />
                </div>

                {/* Notification List */}
                <div className="px-6 flex flex-col gap-2">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <span className="material-symbols-outlined text-[48px] text-t-dim font-light mb-3">notifications_off</span>
                            <div className="text-sm text-t-muted font-semibold">받은 알림이 없어요</div>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <button
                                key={n.id}
                                onClick={() => handleOpen(n)}
                                className={`w-full flex flex-col p-4 rounded-2xl border transition-all active:scale-[0.98] text-left ${
                                    n.unread
                                        ? 'bg-card-gray border-themed-light'
                                        : 'bg-card-gray/50 border-themed'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`text-sm truncate ${n.unread ? 'font-extrabold text-t-primary' : 'font-semibold text-t-secondary'}`}>
                                        {n.title}
                                    </div>
                                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
                                </div>
                                <div className="text-xs text-t-muted font-medium leading-snug line-clamp-2 mb-1.5">
                                    {n.message}
                                </div>
                                <div className="text-[11px] text-t-dim font-semibold">{n.time}</div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
