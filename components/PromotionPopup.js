import React, { useState, useEffect } from 'react';

const PROMO = {
    id: 'promo_welcome',
    type: 'POINT',
    title: '신규 가입 환영 이벤트!',
    desc: '지금 바로 받아가세요!',
    benefits: ['500 포인트 즉시 지급', '챔피언십 3회 무료'],
};

export default function PromotionPopup() {
    const [visible, setVisible] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [hideToday, setHideToday] = useState(false);

    useEffect(() => {
        const key = `promo_hidden_${PROMO.id}`;
        const val = localStorage.getItem(key);
        if (val && Date.now() < parseInt(val, 10)) return;
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        if (hideToday) {
            const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem(`promo_hidden_${PROMO.id}`, String(tomorrow));
        }
        setVisible(false);
    };

    const handleClaim = () => {
        setClaimed(true);
        setTimeout(() => setVisible(false), 1500);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-[340px] bg-card-gray rounded-[28px] border border-themed-light shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">

                {/* Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#14b8a6]/15 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center px-5 pt-5 pb-4 border-b border-themed">
                    <span className="text-t-primary text-sm font-extrabold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                        특별 프로모션!
                    </span>
                    <button onClick={handleClose} className="text-t-muted hover:text-t-primary transition-colors">
                        <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col items-center px-6 py-6 gap-4">
                    <div className="size-16 rounded-full bg-[#14b8a6]/15 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                    </div>

                    <h2 className="text-xl font-extrabold text-t-primary text-center">{PROMO.title}</h2>

                    <div className="w-full flex flex-col gap-2">
                        {PROMO.benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 bg-[#14b8a6]/10 rounded-xl px-4 py-3 border border-[#14b8a6]/20">
                                <span className="material-symbols-outlined text-[14px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                <span className="text-[#14b8a6] text-sm font-semibold">{b}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-t-muted text-sm text-center">{PROMO.desc}</p>

                    {claimed ? (
                        <div className="w-full flex items-center justify-center gap-2 py-4 bg-[#14b8a6]/10 rounded-2xl border border-[#14b8a6]/20">
                            <span className="material-symbols-outlined text-[20px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="text-[#14b8a6] font-bold text-sm">혜택이 지급되었습니다!</span>
                        </div>
                    ) : (
                        <div className="w-full flex gap-3">
                            <button onClick={handleClaim} className="flex-1 py-3 rounded-xl bg-bg-inverse text-t-inverse font-bold text-sm active:scale-95 transition-all">
                                받기
                            </button>
                            <button onClick={handleClose} className="flex-1 py-3 rounded-xl bg-btn-secondary text-t-secondary font-semibold text-sm active:scale-95 transition-all border border-themed">
                                나중에
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <button
                    onClick={() => setHideToday(v => !v)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-t border-themed text-t-dim text-xs font-medium hover:text-t-secondary transition-colors"
                >
                    <div className={`size-4 rounded border flex items-center justify-center transition-colors ${hideToday ? 'bg-zinc-600 border-zinc-600' : 'border-zinc-700'}`}>
                        {hideToday && <span className="material-symbols-outlined text-t-primary text-[10px]">check</span>}
                    </div>
                    오늘 하루 보지 않기
                </button>
            </div>
        </div>
    );
}
