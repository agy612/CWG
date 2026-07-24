import React from 'react';

/**
 * TabHeader — unified header for primary tabs (Picks / Championship / Contents / My).
 *
 * Layout: title + optional subtitle on the left, optional action button(s) on the right.
 *
 * Props:
 *   title       — main heading (string)
 *   subtitle    — secondary line below title (string, optional)
 *   action      — single action node (e.g. <button>) rendered on the right (optional)
 *   actions     — array of nodes for multiple right-side actions (optional)
 */
export default function TabHeader({ title, subtitle, action, actions }) {
    const rightNodes = actions ?? (action ? [action] : []);

    return (
        <header className="px-6 pt-7 pb-5 flex items-end justify-between gap-3">
            <div className="flex flex-col min-w-0">
                <h1 className="text-[24px] font-extrabold tracking-tight leading-tight m-0">{title}</h1>
                {subtitle && (
                    <p className="text-[12px] text-t-muted font-medium mt-1 leading-snug truncate">
                        {subtitle}
                    </p>
                )}
            </div>
            {rightNodes.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    {rightNodes.map((node, i) => (
                        <React.Fragment key={i}>{node}</React.Fragment>
                    ))}
                </div>
            )}
        </header>
    );
}

/**
 * Convenience action button — 40×40 icon button matching the header style.
 */
export function HeaderIconButton({ icon, onClick, label, filled = false, text = false }) {
    // text=true — 아이콘만으로 의미가 안 통하는 버튼(이전 기록 등)은 라벨을 함께 노출
    if (text) {
        return (
            <button
                onClick={onClick}
                aria-label={label}
                className="inline-flex items-center gap-1 pl-2 pr-2.5 py-1.5 rounded-full bg-card-gray border border-themed text-t-muted hover:text-t-primary active:scale-95 transition-all"
            >
                <span
                    className="material-symbols-outlined text-[14px]"
                    style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                    {icon}
                </span>
                <span className="text-[11px] font-bold whitespace-nowrap">{label}</span>
            </button>
        );
    }
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="w-10 h-10 flex items-center justify-center rounded-full text-t-secondary hover:text-t-primary active:scale-90 transition-all"
        >
            <span
                className="material-symbols-outlined text-[22px]"
                style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
                {icon}
            </span>
        </button>
    );
}
