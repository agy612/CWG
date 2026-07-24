import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const NOTIFICATION_GROUPS = [
    {
        group: '스캔 & 결과',
        items: [
            {
                id: 'draw_result',
                icon: 'emoji_events',
                label: '당첨 결과 알림',
                desc: '추첨 결과 발표 후 스캔 리마인더',
                default: true,
            },
            {
                id: 'scan_reminder',
                icon: 'photo_camera',
                label: '스캔 리마인더',
                desc: '매주 추첨 후 티켓 스캔 알림',
                default: true,
            },
            {
                id: 'hit_match',
                icon: 'celebration',
                label: '번호 일치 알림',
                desc: '생성한 번호가 3개 이상 일치할 때 알림',
                default: true,
            },
        ],
    },
    {
        group: 'CWG 픽 & 럭키이벤트',
        items: [
            {
                id: 'new_picks',
                icon: 'auto_awesome',
                label: '새 CWG 픽 알림',
                desc: '매주 새 CWG 픽 생성 시 알림 (구독자)',
                default: true,
            },
            {
                id: 'championship_free',
                icon: 'stars',
                label: '무료 럭키이벤트 알림',
                desc: '일일 무료 티켓 충전 시 알림 (PRO)',
                default: false,
            },
        ],
    },
    {
        group: '프로모션 & 혜택',
        items: [
            {
                id: 'promotion',
                icon: 'local_offer',
                label: '프로모션 알림',
                desc: '이벤트, 쿠폰, 포인트 적립 알림',
                default: false,
            },
            {
                id: 'subscription',
                icon: 'credit_card',
                label: '구독 갱신 알림',
                desc: '구독 만료 3일 전 미리 알림',
                default: true,
            },
        ],
    },
];

function Toggle({ on, onChange }) {
    return (
        <button
            onClick={() => onChange(!on)}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${on ? 'bg-[#14b8a6]' : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
    );
}

export default function NotificationSettings() {
    const router = useRouter();
    const [settings, setSettings] = useState(() => {
        const s = {};
        NOTIFICATION_GROUPS.forEach(g => g.items.forEach(item => { s[item.id] = item.default; }));
        return s;
    });
    const [saved, setSaved] = useState(false);

    const toggle = (id) => {
        setSettings(prev => ({ ...prev, [id]: !prev[id] }));
        setSaved(false);
    };

    const toggleAll = (on) => {
        const s = {};
        NOTIFICATION_GROUPS.forEach(g => g.items.forEach(item => { s[item.id] = on; }));
        setSettings(s);
        setSaved(false);
    };

    const allOn = Object.values(settings).every(Boolean);
    const allOff = Object.values(settings).every(v => !v);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => router.back(), 1000);
    };

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 알림 설정</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-36">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">알림 설정</h1>
                </div>

                {/* Master Toggle */}
                <div className="mx-6 mb-6 bg-card-gray rounded-2xl p-5 border border-themed flex items-center justify-between">
                    <div>
                        <div className="text-sm font-bold text-t-primary mb-0.5">전체 알림</div>
                        <div className="text-xs text-t-muted font-medium">{allOn ? '모든 알림 켜짐' : allOff ? '모든 알림 꺼짐' : '일부 알림 켜짐'}</div>
                    </div>
                    <Toggle on={!allOff} onChange={(v) => toggleAll(v)} />
                </div>

                {/* Notification Groups */}
                <div className="px-6 flex flex-col gap-6">
                    {NOTIFICATION_GROUPS.map(g => (
                        <div key={g.group}>
                            <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3 px-1">{g.group}</div>
                            <div className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                                {g.items.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-center gap-4 p-5 ${idx < g.items.length - 1 ? 'border-b border-themed' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-btn-secondary flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[20px] text-t-secondary font-light" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {item.icon}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-t-primary mb-0.5">{item.label}</div>
                                            <div className="text-xs text-t-muted font-medium leading-snug">{item.desc}</div>
                                        </div>
                                        <Toggle on={settings[item.id]} onChange={() => toggle(item.id)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* OS Notification Permission Notice */}
                <div className="mx-6 mt-6 flex items-start gap-2 bg-btn-secondary/30 rounded-2xl p-4 border border-themed">
                    <span className="material-symbols-outlined text-[16px] text-t-muted mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <span className="text-[11px] text-t-muted font-medium leading-relaxed">
                        알림을 받으려면 기기의 알림 권한이 허용되어 있어야 합니다. 기기 설정에서 CWG 앱의 알림을 허용해주세요.
                    </span>
                </div>

                {/* Sticky Save */}
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
                    <button
                        onClick={handleSave}
                        className={`w-full py-4 rounded-xl font-extrabold text-base active:scale-95 transition-all ${
                            saved ? 'bg-[#14b8a6] text-black' : 'bg-bg-inverse text-t-inverse'
                        }`}
                    >
                        {saved ? '✓ 저장 완료!' : '저장하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
