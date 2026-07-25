import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const coupons = [
    { id: 1, type: 'DISCOUNT', title: '10% 할인 쿠폰', desc: '구독 결제 시 10% 할인', expiry: '2026-03-31', status: 'ACTIVE', icon: 'card_giftcard' },
    { id: 2, type: 'TICKET', title: '럭키이벤트 1회 무료', desc: '나만의 번호 생성 1회 무료', expiry: '2026-02-28', status: 'ACTIVE', icon: 'confirmation_number' },
    { id: 3, type: 'POINT', title: '500P 지급 쿠폰', desc: '스캔 이벤트 달성 보상', expiry: '2026-01-31', status: 'USED', date: '2026-01-25', icon: 'monetization_on' },
    { id: 4, type: 'SUBSCRIPTION', title: 'Standard 1개월 무료', desc: '오픈 기념 혜택', expiry: '2025-12-31', status: 'EXPIRED', date: '2025-12-31', icon: 'stars' },
];

export default function CouponWallet() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [codeValue, setCodeValue] = useState('');
    const [registerMsg, setRegisterMsg] = useState(null); // { type: 'success'|'error', text }
    const [usedCouponIds, setUsedCouponIds] = useState([]);

    const filteredCoupons = coupons.filter(c => {
        if (usedCouponIds.includes(c.id)) return activeTab === 'USED';
        return c.status === activeTab;
    });

    const handleRegister = () => {
        if (!codeValue.trim()) {
            setRegisterMsg({ type: 'error', text: '쿠폰 코드를 입력해주세요.' });
            return;
        }
        // Simulate validation (real: API call)
        if (codeValue.length < 6) {
            setRegisterMsg({ type: 'error', text: '존재하지 않는 쿠폰 코드입니다.' });
            return;
        }
        setRegisterMsg({ type: 'success', text: '쿠폰이 등록되었습니다!' });
        setCodeValue('');
        setTimeout(() => {
            setRegisterMsg(null);
            setShowCodeInput(false);
        }, 1500);
    };

    const handleUse = (coupon) => {
        setUsedCouponIds(prev => [...prev, coupon.id]);
        switch (coupon.type) {
            case 'DISCOUNT':
            case 'SUBSCRIPTION':
                router.push('/subscription');
                break;
            case 'TICKET':
                router.push('/');
                break;
            case 'POINT':
                // Instant points — just mark as used, stay on page
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-background font-sans text-t-primary antialiased min-h-screen">
            <Head>
                <title>CWG - Coupon Wallet</title>
            </Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl pb-24">

                {/* Header */}
                <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pt-12 pb-4 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-[24px] text-t-secondary hover:text-t-primary transition-colors">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-extrabold tracking-tight m-0">쿠폰함</h1>
                    </div>
                    <button
                        onClick={() => setShowCodeInput(prev => !prev)}
                        className="text-[13px] font-bold text-accent bg-accent-soft px-3 py-1.5 rounded-full hover:bg-accent-soft transition-colors"
                    >
                        코드 입력 +
                    </button>
                </div>

                {/* Code Input */}
                {showCodeInput && (
                    <div className="mx-6 mt-2 mb-2 flex flex-col gap-2">
                        <div className="flex gap-2">
                        <input
                            type="text"
                            value={codeValue}
                            onChange={e => setCodeValue(e.target.value.toUpperCase())}
                            placeholder="쿠폰 코드 입력"
                            className="flex-1 bg-card-gray border border-themed-light rounded-xl px-4 py-3 text-t-primary text-sm font-semibold outline-none focus:border-accent/50 transition-colors"
                        />
                        <button
                            onClick={handleRegister}
                            disabled={!codeValue.trim()}
                            className="px-4 py-3 rounded-xl bg-accent text-accent-fg font-bold text-sm active:scale-95 transition-all disabled:opacity-40"
                        >
                            등록
                        </button>
                        </div>
                        {registerMsg && (
                            <div className={`text-xs font-semibold px-1 ${registerMsg.type === 'success' ? 'text-accent' : 'text-red-400'}`}>
                                {registerMsg.text}
                            </div>
                        )}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex px-6 mt-4 gap-6 border-b border-themed">
                    {['ACTIVE', 'USED', 'EXPIRED'].map((tab) => {
                        const label = tab === 'ACTIVE' ? '사용 가능' : tab === 'USED' ? '사용 완료' : '만료';
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-[14px] font-bold transition-all relative ${isActive ? 'text-t-primary' : 'text-t-dim'}`}
                            >
                                {label}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* List */}
                <div className="flex flex-col px-6 pt-8 pb-12 gap-4">
                    {filteredCoupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <span className="material-symbols-outlined text-[64px] font-light text-t-dim mb-4">local_activity</span>
                            <span className="text-t-secondary font-semibold text-sm">해당하는 쿠폰이 없어요</span>
                            <span className="text-t-dim font-medium text-xs mt-1">프로모션에서 쿠폰을 받아보세요</span>
                        </div>
                    ) : (
                        filteredCoupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className={`relative bg-card-gray rounded-3xl p-6 border flex flex-col gap-4 overflow-hidden transition-all ${
                                    coupon.status === 'ACTIVE'
                                        ? 'border-themed-light hover:border-white/30 cursor-pointer group'
                                        : 'border-transparent opacity-60 grayscale cursor-not-allowed'
                                }`}
                            >
                                {coupon.status === 'ACTIVE' && <div className="absolute inset-0 metallic-grain opacity-5" />}

                                <div className="flex justify-between items-start z-10 relative">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${coupon.status === 'ACTIVE' ? 'bg-accent-soft' : 'bg-btn-secondary'}`}>
                                            <span className={`material-symbols-outlined text-[20px] ${coupon.status === 'ACTIVE' ? 'text-accent' : 'text-t-muted'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{coupon.icon}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-lg font-bold tracking-tight text-t-primary">{coupon.title}</span>
                                            <span className="text-xs font-medium text-t-secondary">{coupon.desc}</span>
                                        </div>
                                    </div>

                                    {coupon.status === 'USED' && (
                                        <span className="text-xs font-bold text-t-muted uppercase tracking-widest bg-btn-secondary px-2 py-1 rounded">완료</span>
                                    )}
                                    {coupon.status === 'EXPIRED' && (
                                        <span className="text-xs font-bold text-red-500/70 uppercase tracking-widest bg-red-900/20 px-2 py-1 rounded">만료됨</span>
                                    )}
                                </div>

                                <div className="flex justify-between items-end mt-2 z-10 relative">
                                    <span className="text-[11px] font-semibold text-t-muted">
                                        {coupon.status === 'ACTIVE'
                                            ? `유효기간: ${coupon.expiry} 까지`
                                            : `${coupon.status === 'USED' ? '사용일' : '만료일'}: ${coupon.date}`
                                        }
                                    </span>

                                    {coupon.status === 'ACTIVE' && !usedCouponIds.includes(coupon.id) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUse(coupon); }}
                                            className="bg-accent text-accent-fg px-4 py-2 rounded-lg text-xs font-extrabold active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                                        >
                                            사용하기
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
