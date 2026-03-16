import React from 'react';

const RANK_MEDAL = {
  1: { icon: 'trophy', color: 'text-[#FFD700]' },
  2: { icon: 'trophy', color: 'text-[#C0C0C0]' },
  3: { icon: 'trophy', color: 'text-[#CD7F32]' }
};

export default function HighPrizeRankingCard({ data }) {
  const { rankings } = data.highPrizeRanking;

  return (
    <div className="relative bg-card-gray border border-themed rounded-2xl p-5 overflow-hidden" style={{ height: '200px' }}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-20 h-20 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-[#FFD700] to-transparent rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="material-symbols-outlined text-[16px] text-[#14b8a6]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <h3 className="text-xs font-bold text-t-primary">역대 고액 당첨 TOP 3</h3>
        </div>

        {/* Rankings */}
        <div className="space-y-3">
          {rankings.map((item) => {
            const medal = RANK_MEDAL[item.rank];
            return (
              <div key={item.rank} className="flex items-center gap-2.5">
                {/* Medal */}
                <span className={`material-symbols-outlined text-[14px] ${medal.color} flex-shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  emoji_events
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-t-primary">제{item.round}회</span>
                    <span className="text-[10px] font-medium text-t-muted">·</span>
                    <span className="text-[10px] font-medium text-t-muted">{item.prizeRank}등</span>
                    <span className="text-[10px] font-medium text-t-muted">·</span>
                    <span className="text-xs font-bold text-[#14b8a6]">{item.amount.toLocaleString()}원</span>
                  </div>
                  <div className="text-[10px] font-medium text-t-muted">{item.nickname} 님</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
