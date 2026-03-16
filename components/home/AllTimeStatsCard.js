import React from 'react';

export default function AllTimeStatsCard({ data }) {
  const { totalWinners, totalAmount, breakdown, recentWin } = data.allTimeStats;

  return (
    <div className="relative bg-card-gray border border-themed rounded-2xl p-5 overflow-hidden" style={{ height: '200px' }}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-20 h-20 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-[#14b8a6] to-transparent rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <h3 className="text-xs font-bold text-t-primary">CWG 역대 당첨 현황</h3>
        </div>

        {/* Total stats */}
        <div className="text-center mb-4">
          <div className="text-[10px] font-medium text-t-muted mb-1.5">총 당첨자</div>
          <div className="text-2xl font-extrabold text-t-primary mb-1">{totalWinners}명</div>
        </div>

        {/* Breakdown - single line */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {breakdown.map((item) => (
            <div key={item.rank} className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-t-muted">{item.rank}등</span>
              <span className="text-xs font-bold text-t-primary">×{item.count}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-themed-light mb-auto" />

        {/* Bottom info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-t-muted">총 당첨금</span>
            <span className="text-xs font-bold text-t-primary">{totalAmount.toLocaleString()}원</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-t-muted">최근 당첨</span>
            <span className="text-[10px] font-semibold text-t-muted">{recentWin.daysAgo}일 전 ({recentWin.rank}등)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
