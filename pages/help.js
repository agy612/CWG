import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const FAQS = [
    {
        q: '티켓 스캔은 어떻게 하나요?',
        a: '앱 하단 스캔 탭을 눌러 카메라를 실행하세요. 복권 티켓을 프레임 안에 맞추면 자동으로 번호가 인식됩니다. 인식이 어려울 경우 갤러리 업로드 또는 직접 입력을 이용하세요.',
    },
    {
        q: '스캔 시 포인트가 얼마나 적립되나요?',
        a: 'FREE 회원: 기본 50P (광고 시청 시 +25P 추가)\nSTANDARD: 75P\nPRO: 기본 100P (광고 선택 시 최대 200P)\n직접 입력 시 50% 감소 적용됩니다.',
    },
    {
        q: 'CWG 픽은 무엇인가요?',
        a: 'CWG 알고리즘이 자동 생성하는 매주 10세트의 추천 번호입니다. 이전 당첨 이력과 통계를 분석하여 생성됩니다. FREE 회원은 200P로 1회 열람, 구독자는 무제한 열람 가능합니다.',
    },
    {
        q: '럭키이벤트란 무엇인가요?',
        a: '20가지 필터를 직접 조정하여 나만의 전략으로 번호를 생성하는 기능입니다. 빈도, 패턴, 수학, 히스토리, 개인 설정 등 5개 카테고리의 필터를 조합할 수 있습니다. FREE 100P, STANDARD 100P, PRO 일 1회 무료 + 50P입니다.',
    },
    {
        q: '구독은 언제든지 해지할 수 있나요?',
        a: '네, 구독은 언제든지 해지 가능합니다. 해지 후에도 구독 기간 만료일까지 혜택이 유지되며, 해지 시 포인트는 유지됩니다.',
    },
    {
        q: '포인트는 현금으로 환전할 수 있나요?',
        a: '아니요. 포인트는 앱 내 CWG 픽 열람, 럭키이벤트 번호 생성, 포인트샵 상품 구매에만 사용 가능하며 현금으로 환전되지 않습니다. 포인트는 마지막 획득일로부터 12개월 후 소멸됩니다.',
    },
    {
        q: '같은 티켓을 중복 스캔하면 어떻게 되나요?',
        a: '보안 시스템이 중복 스캔을 감지합니다. 이미 스캔된 티켓은 재스캔 시 포인트가 적립되지 않으며, 비정상적인 시도가 반복될 경우 계정이 24시간 제한될 수 있습니다.',
    },
    {
        q: '해외 복권도 스캔할 수 있나요?',
        a: '현재 로또6/45, 일본 로토6, 유럽 EuroMillions, Eurojackpot 총 4종을 지원합니다. 로또 선택 화면에서 해당 복권을 선택 후 스캔하세요.',
    },
];

const CONTACT_ITEMS = [
    { icon: 'mail', label: '이메일 문의', value: 'support@cwg-app.com', action: 'email' },
    { icon: 'chat_bubble', label: '카카오톡 채널', value: '@cwg공식', action: 'kakao' },
    { icon: 'schedule', label: '운영 시간', value: '평일 10:00 ~ 18:00 (KST)', action: null },
];

export default function Help() {
    const router = useRouter();
    const [expandedFaq, setExpandedFaq] = useState(null);

    return (
        <div className="bg-[#0a0a0a] font-sans text-t-primary antialiased min-h-screen">
            <Head><title>CWG - 고객센터</title></Head>
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto shadow-2xl pb-24">

                {/* Header */}
                <div className="pt-12 pb-4 px-6 flex items-center gap-3">
                    <button onClick={() => router.back()} className="active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-[28px] font-light text-t-secondary">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-extrabold tracking-tight">고객센터</h1>
                </div>

                {/* Intro */}
                <div className="mx-6 mb-6 bg-card-gray rounded-3xl p-6 border border-themed">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-[28px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                        <div className="text-lg font-extrabold">무엇을 도와드릴까요?</div>
                    </div>
                    <p className="text-t-muted text-sm font-medium leading-relaxed">
                        아래 FAQ에서 자주 묻는 질문을 확인하거나, 추가 문의는 이메일로 연락해주세요.
                    </p>
                </div>

                {/* FAQ */}
                <div className="px-6 mb-8">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3 px-1">자주 묻는 질문</div>
                    <div className="flex flex-col gap-2">
                        {FAQS.map((faq, idx) => (
                            <div key={idx} className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                                <button
                                    className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left active:bg-themed-light transition-colors"
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                >
                                    <span className="text-sm font-semibold text-t-primary leading-snug">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-[20px] text-t-dim flex-shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {expandedFaq === idx && (
                                    <div className="px-5 pb-4 border-t border-themed">
                                        <p className="text-t-secondary text-sm font-medium leading-relaxed pt-4 whitespace-pre-line">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="px-6 mb-8">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3 px-1">직접 문의</div>
                    <div className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                        {CONTACT_ITEMS.map((item, idx) => (
                            <div key={idx} className={`flex items-center gap-4 p-5 ${idx < CONTACT_ITEMS.length - 1 ? 'border-b border-themed' : ''}`}>
                                <div className="w-10 h-10 rounded-full bg-btn-secondary flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[20px] text-t-secondary font-light">{item.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-t-muted font-semibold mb-0.5">{item.label}</div>
                                    <div className="text-sm font-semibold text-t-primary">{item.value}</div>
                                </div>
                                {item.action && (
                                    <span className="material-symbols-outlined text-[20px] text-t-dim">chevron_right</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* App Info */}
                <div className="px-6 mb-6">
                    <div className="text-t-muted text-xs font-bold uppercase tracking-wider mb-3 px-1">앱 정보</div>
                    <div className="bg-card-gray rounded-2xl border border-themed overflow-hidden">
                        {[
                            { label: '앱 버전', value: '1.0.0' },
                            { label: '서비스 약관', value: '보기', arrow: true },
                            { label: '개인정보처리방침', value: '보기', arrow: true },
                            { label: '오픈소스 라이선스', value: '보기', arrow: true },
                        ].map((row, idx) => (
                            <div key={idx} className={`flex items-center justify-between px-5 py-4 ${idx < 3 ? 'border-b border-themed' : ''}`}>
                                <span className="text-sm font-semibold text-btn-secondary-text">{row.label}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-t-muted font-medium">{row.value}</span>
                                    {row.arrow && <span className="material-symbols-outlined text-[16px] text-t-faint">chevron_right</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
