import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const SEEN_KEY = 'fulif_champ_intro_seen';

/**
 * 번호생성 탭 첫 진입 시 1회 노출되는 챔피언십 안내 팝업.
 * 닫거나 안내 페이지로 이동하면 다시 뜨지 않는다.
 */
export default function ChampionshipIntroPopup() {
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [entered, setEntered] = useState(false);

    // Dev Pages에서 강제 노출 (?popup=championship) — 이땐 노출 이력을 남기지 않는다
    const force = router.query.popup === 'championship';

    useEffect(() => {
        if (!router.isReady) return;
        setEntered(false);

        if (force) {
            setVisible(true);
            requestAnimationFrame(() => setEntered(true));
            return;
        }

        try {
            if (localStorage.getItem(SEEN_KEY)) return;
        } catch { return; }

        const timer = setTimeout(() => {
            setVisible(true);
            requestAnimationFrame(() => setEntered(true));
        }, 500);
        return () => clearTimeout(timer);
    }, [router.isReady, router.asPath]); // asPath 의존 — 데모 재진입(nonce 쿼리 변경) 시에도 다시 뜨게

    const markSeen = () => {
        if (force) return;
        try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
    };

    const handleClose = () => {
        markSeen();
        setVisible(false);
    };

    const handleGo = () => {
        markSeen();
        setVisible(false);
        router.push('/championship_guide');
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 max-w-[430px] mx-auto">
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={handleClose} />

            <div
                className="relative w-full max-w-[330px] bg-card-gray rounded-[28px] px-6 pt-6 pb-6 shadow-2xl"
                style={{
                    opacity: entered ? 1 : 0,
                    transform: entered ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
                    transition: 'opacity 240ms ease-out, transform 240ms var(--ease-out-strong)',
                }}
            >
                <button
                    onClick={handleClose}
                    aria-label="닫기"
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-t-dim active:bg-btn-secondary transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="flex flex-col items-center text-center">
                    <img src="/pulli_trophy.png" alt="" className="w-[124px] h-[124px] object-contain" />

                    <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full bg-accent-soft text-accent text-[11px] font-bold">
                        PRO 전용
                    </span>

                    <h2 className="text-[20px] font-bold tracking-tight text-t-primary mt-2.5">
                        나만의 번호로 겨루는<br />챔피언십
                    </h2>

                    <p className="text-[14px] font-medium text-t-muted leading-relaxed mt-2.5">
                        내가 만든 번호가 그 주 추첨번호와<br />
                        얼마나 가까웠는지로 점수를 쌓아요.<br />
                        1년간 모은 점수로 시즌 챔피언을 가려요.
                    </p>
                </div>

                <button
                    onClick={handleGo}
                    className="pressable w-full mt-6 py-4 rounded-2xl bg-accent text-accent-fg font-bold text-[15px]"
                >
                    챔피언십 안내 보기
                </button>
                <button
                    onClick={handleClose}
                    className="w-full mt-2 py-2.5 text-t-muted font-semibold text-[14px] active:opacity-60 transition-opacity"
                >
                    다음에 볼게요
                </button>
            </div>
        </div>
    );
}
