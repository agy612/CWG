import React from 'react';
import { formatDateWithDay } from '../../utils/lottery';

export default function SummaryCard({ data, type }) {
  const { totalWinners, totalPrizeAmount, prizeBreakdown, round, drawDate } = data;

  const isThisWeek = type === 'THIS_WEEK_WINNERS';
  const bgGradient = isThisWeek
    ? 'from-[#14b8a6]/10 to-transparent'
    : 'from-card-gray/50 to-transparent';
  const title = isThisWeek ? '이번 주 당첨자 발생!' : '지난주 당첨 현황';

  return (
    <div className={`relative bg-gradient-to-br ${bgGradient} bg-card-gray border border-themed rounded-2xl p-5 overflow-hidden`} style={{ height: '200px' }}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-20 h-20 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-t-primary to-transparent rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <h3 className="text-xs font-bold text-t-primary">{title}</h3>
        </div>

        {/* Total winners */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-t-primary">총 {totalWinners}명</span>
          </div>

          {/* Breakdown - single line */}
          <div className="flex items-center justify-center gap-3">
            {prizeBreakdown.map((item) => (
              <div key={item.rank} className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-t-muted">{item.rank}등</span>
                <span className="text-xs font-bold text-t-primary">×{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-themed-light mb-auto" />

        {/* Bottom info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-t-muted">총 당첨금</span>
            <span className="text-xs font-bold text-t-primary">{totalPrizeAmount.toLocaleString()}원</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-t-muted">추첨일</span>
            <span className="text-[10px] font-semibold text-t-muted">제{round}회 · {formatDateWithDay(drawDate).split(' (')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
