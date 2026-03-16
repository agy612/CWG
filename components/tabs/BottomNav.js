import React from 'react';

const tabs = [
    { id: 'home', label: '홈', icon: 'home', type: 'fill' },
    { id: 'scan', label: '스캔', icon: 'qr_code_scanner', type: 'outline' },
    { id: 'picks', label: '픽생성', icon: 'confirmation_number', type: 'outline' },
    { id: 'championship', label: '챔피언십', icon: 'leaderboard', type: 'outline' },
    { id: 'my', label: '마이', icon: 'person', type: 'outline' },
];

export default function BottomNav({ activeTab, setActiveTab }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-background/90 backdrop-blur-xl px-6 py-4 border-t border-themed z-50">
            <div className="flex justify-between items-center">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const iconClass = isActive
                        ? "material-symbols-outlined text-[26px]"
                        : "material-symbols-outlined text-[26px] font-light";

                    const iconStyle = isActive
                        ? { fontVariationSettings: "'FILL' 1, 'wght' 600" }
                        : { fontVariationSettings: "'FILL' 0, 'wght' 300" };

                    const textClass = isActive ? "text-t-primary" : "text-t-muted";

                    return (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${textClass}`}
                        >
                            <span className={iconClass} style={iconStyle}>{tab.icon}</span>
                            <span className="text-[10px] font-medium mt-1">{tab.label}</span>
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
