import React from 'react';

export default function ParticipationStatsCard({ data }) {
  const { totalUsers, totalScans, methodBreakdown, methodPercentages } = data.participationStats;

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
          <h3 className="text-xs font-bold text-t-primary">이번 주 참여 현황</h3>
        </div>

        {/* Main stats */}
        <div className="flex gap-5 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-t-muted mb-1">참여 유저</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold text-t-primary">{totalUsers.toLocaleString()}</span>
              <span className="text-[10px] font-medium text-t-muted">명</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-t-muted mb-1">스캔 티켓</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold text-t-primary">{totalScans.toLocaleString()}</span>
              <span className="text-[10px] font-medium text-t-muted">개</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-themed-light mb-auto" />

        {/* Method breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
              <span className="text-[10px] font-medium text-t-muted">CWG 픽</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-t-primary">{methodBreakdown.picks.toLocaleString()}</span>
              <span className="text-[9px] font-medium text-t-muted">({methodPercentages.picks}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] font-medium text-t-muted">챔피언십</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-t-primary">{methodBreakdown.championship.toLocaleString()}</span>
              <span className="text-[9px] font-medium text-t-muted">({methodPercentages.championship}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-t-secondary" />
              <span className="text-[10px] font-medium text-t-muted">스캔</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-t-primary">{methodBreakdown.scan.toLocaleString()}</span>
              <span className="text-[9px] font-medium text-t-muted">({methodPercentages.scan}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
