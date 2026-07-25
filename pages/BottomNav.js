import React from 'react';

const tabs = [
    { id: 'home', label: '홈', icon: 'home', type: 'fill' },
    { id: 'picks', label: '번호생성', icon: 'confirmation_number', type: 'outline' },
    { id: 'scan', label: '스캔·경품', icon: 'qr_code_scanner', type: 'outline' },
    { id: 'contents', label: '콘텐츠', icon: 'article', type: 'outline' },
    { id: 'my', label: '마이', icon: 'person', type: 'outline' },
];

export default function BottomNav({ activeTab, setActiveTab }) {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto backdrop-blur-xl px-4 pt-1.5 pb-3 border-t border-themed z-50"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 94%, transparent)' }}
        >
            <div className="flex justify-between items-center">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const iconStyle = isActive
                        ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
                        : { fontVariationSettings: "'FILL' 0, 'wght' 400" };

                    const textClass = isActive ? "text-accent" : "text-t-dim";

                    return (
                        <button
                            key={tab.id}
                            id={`tut-nav-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pressable flex flex-col items-center cursor-pointer flex-1 py-1 transition-colors ${textClass}`}
                        >
                            <span
                                className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-200 ${isActive ? 'bg-accent-soft' : ''}`}
                            >
                                <span className="material-symbols-outlined text-[23px]" style={iconStyle}>{tab.icon}</span>
                            </span>
                            <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-accent' : 'font-medium'}`}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
