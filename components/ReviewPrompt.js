import React, { useState } from 'react';
import Image from 'next/image';

/**
 * ReviewPrompt — 인앱 리뷰 유도 팝업 (2단계 패턴, 캐릭터 센터 팝업).
 *
 * 1단계: "앱이 마음에 드시나요?" — 긍정/부정 분기
 * 2단계: 긍정 → 스토어 리뷰 이동 / 부정 → 1:1 문의(고객센터)로 전환
 *   → 불만은 내부로, 만족은 스토어로.
 *
 * 노출 정책 (cwg_review_prompt):
 *   - 트리거별 1회 (scan_complete / attendance_streak)
 *   - 전체 90일 내 재노출 금지
 *   - "다시 보지 않기" 선택 시 영구 미노출
 *
 * 사용: canShowReview(trigger)로 판단 후 open, 열 때 markReviewShown(trigger) 호출.
 */

const KEY = 'cwg_review_prompt';
const COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // 90일

function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function canShowReview(trigger) {
    if (typeof window === 'undefined') return false;
    const s = loadState();
    if (s.never) return false;
    if (s.triggers && s.triggers[trigger]) return false;
    if (s.lastShown && Date.now() - s.lastShown < COOLDOWN_MS) return false;
    return true;
}

export function markReviewShown(trigger) {
    const s = loadState();
    localStorage.setItem(KEY, JSON.stringify({
        ...s,
        lastShown: Date.now(),
        triggers: { ...(s.triggers || {}), [trigger]: Date.now() },
    }));
}

function markNever() {
    const s = loadState();
    localStorage.setItem(KEY, JSON.stringify({ ...s, never: true }));
}

export default function ReviewPrompt({ open, onClose }) {
    const [step, setStep] = useState('ask'); // ask | positive | negative | thanks
    const [feedback, setFeedback] = useState('');

    if (!open) return null;

    const close = () => { setStep('ask'); setFeedback(''); onClose?.(); };
    const closeNever = () => { markNever(); close(); };

    const goStore = () => {
        // 네이티브 래핑 시 인앱 리뷰 API / 스토어 딥링크로 교체
        alert('스토어 리뷰 페이지로 이동합니다 (프로토타입)');
        close();
    };

    const sendFeedback = () => {
        // 서버 연동 시 VOC API로 전송 — 현재는 로컬 프로토타입이라 전송 없이 감사 화면으로
        setStep('thanks');
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 max-w-[430px] mx-auto">
            <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={close} />
            <div className="relative w-full max-w-[340px] bg-card-gray rounded-[28px] border border-themed-light shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">

                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#D4AF37]/15 blur-[60px] rounded-full -translate-y-1/2 pointer-events-none" />

                {step === 'ask' && (
                    <div className="relative flex flex-col items-center px-6 pt-7 pb-6">
                        {/* 캐릭터 + 별 */}
                        <div className="relative mb-1">
                            <div style={{ filter: 'drop-shadow(0 8px 24px rgba(212,175,55,0.4))' }}>
                                <Image src="/character.png" alt="풀리" width={104} height={104} unoptimized />
                            </div>
                            <span className="absolute -right-5 top-0 material-symbols-outlined text-[22px] text-[#D4AF37] rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="absolute -left-5 top-6 material-symbols-outlined text-[14px] text-[#D4AF37]/70 -rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <div className="flex gap-1 mb-3">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className="material-symbols-outlined text-[20px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                        </div>
                        <h3 className="text-[19px] font-extrabold text-t-primary mb-1">Fulif, 마음에 드시나요?</h3>
                        <p className="text-t-muted text-[13px] font-medium mb-5">솔직한 의견이 서비스를 더 좋게 만들어요</p>
                        <div className="flex gap-3 w-full mb-1">
                            <button
                                onClick={() => setStep('negative')}
                                className="flex-1 py-3.5 rounded-xl bg-btn-secondary text-t-secondary font-bold text-sm active:scale-95 transition-all border border-themed"
                            >
                                아쉬워요
                            </button>
                            <button
                                onClick={() => setStep('positive')}
                                className="flex-1 py-3.5 rounded-xl bg-accent text-accent-fg font-extrabold text-sm active:scale-95 transition-all"
                            >
                                좋아요!
                            </button>
                        </div>
                        <button onClick={closeNever} className="w-full text-center text-t-dim text-xs font-medium py-2.5 hover:text-t-secondary transition-colors">
                            다시 보지 않기
                        </button>
                    </div>
                )}

                {step === 'positive' && (
                    <div className="relative flex flex-col items-center px-6 pt-7 pb-6 text-center">
                        <div className="mb-3" style={{ filter: 'drop-shadow(0 8px 24px rgba(74,222,128,0.45))' }}>
                            <Image src="/character.png" alt="풀리" width={104} height={104} unoptimized />
                        </div>
                        <h3 className="text-[19px] font-extrabold text-t-primary mb-1.5">감사합니다! 💚</h3>
                        <p className="text-t-muted text-[13px] font-medium leading-relaxed mb-5">
                            스토어에 별점을 남겨주시면<br />더 많은 분들이 Fulif을 만날 수 있어요
                        </p>
                        <button
                            onClick={goStore}
                            className="w-full py-3.5 rounded-xl bg-accent text-accent-fg font-extrabold text-sm active:scale-95 transition-all mb-1"
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                스토어에 리뷰 남기기
                            </span>
                        </button>
                        <button onClick={close} className="w-full text-center text-t-dim text-xs font-medium py-2.5 hover:text-t-secondary transition-colors">
                            나중에 할게요
                        </button>
                    </div>
                )}

                {step === 'negative' && (
                    <div className="relative flex flex-col items-center px-6 pt-7 pb-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-card-hover flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[30px] text-t-secondary">forum</span>
                        </div>
                        <h3 className="text-[19px] font-extrabold text-t-primary mb-1.5">어떤 점이 아쉬웠나요?</h3>
                        <p className="text-t-muted text-[13px] font-medium leading-relaxed mb-4">
                            적어주신 의견은 팀에 바로 전달되고<br />빠르게 개선에 반영할게요
                        </p>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="예) 스캔이 자꾸 실패해요, 포인트 적립이 헷갈려요…"
                            rows={4}
                            className="w-full rounded-xl bg-background border border-themed p-3.5 text-[13px] text-t-primary font-medium placeholder:text-t-faint resize-none outline-none focus:border-accent/50 mb-4"
                        />
                        <button
                            onClick={sendFeedback}
                            disabled={!feedback.trim()}
                            className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all mb-1 ${
                                feedback.trim()
                                    ? 'bg-accent text-accent-fg active:scale-95'
                                    : 'bg-btn-secondary text-t-dim'
                            }`}
                        >
                            의견 보내기
                        </button>
                        <button onClick={close} className="w-full text-center text-t-dim text-xs font-medium py-2.5 hover:text-t-secondary transition-colors">
                            닫기
                        </button>
                    </div>
                )}

                {step === 'thanks' && (
                    <div className="relative flex flex-col items-center px-6 pt-7 pb-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[30px] text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                        <h3 className="text-[19px] font-extrabold text-t-primary mb-1.5">소중한 의견 감사합니다</h3>
                        <p className="text-t-muted text-[13px] font-medium leading-relaxed mb-5">
                            보내주신 내용은 팀이 확인 후<br />서비스 개선에 반영할게요
                        </p>
                        <button
                            onClick={close}
                            className="w-full py-3.5 rounded-xl bg-accent text-accent-fg font-extrabold text-sm active:scale-95 transition-all"
                        >
                            확인
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
