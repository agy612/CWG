import React from 'react';
import { formatDate } from '../../utils/lottery';

const RANK_MEDAL = {
  1: { icon: 'trophy', color: 'text-[#FFD700]', label: '1등' },
  2: { icon: 'trophy', color: 'text-[#C0C0C0]', label: '2등' },
  3: { icon: 'military_tech', color: 'text-[#14b8a6]', label: '3등' },
  4: { icon: 'military_tech', color: 'text-[#FDD835]', label: '4등' },
  5: { icon: 'military_tech', color: 'text-[#9E9E9E]', label: '5등' }
};

export default function WinnerCard({ winner, index, type }) {
  const { nickname, prizeRank, prizeAmount, strategyName, pickId, round, createdAt } = winner;

  const medal = RANK_MEDAL[prizeRank] || RANK_MEDAL[5];
  const isThisWeek = type === 'THIS_WEEK_WINNERS';
  const bgGradient = isThisWeek
    ? 'from-[#14b8a6]/5 to-transparent'
    : 'from-card-gray/5 to-transparent';

  const displayType = winner.type === 'CHAMPIONSHIP' ? `챔피언십 - ${strategyName}` : `CWG 픽 #${pickId}`;
  const displayDate = formatDate(createdAt).substring(5); // MM-DD

  return (
    <div className={`relative bg-gradient-to-br ${bgGradient} bg-card-gray border border-themed rounded-2xl p-5 overflow-hidden`} style={{ height: '200px' }}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-20 h-20 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-t-primary to-transparent rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
        {/* Medal icon */}
        <span className={`material-symbols-outlined text-[32px] ${medal.color} mb-2.5`} style={{ fontVariationSettings: "'FILL' 1" }}>
          emoji_events
        </span>

        {/* Nickname */}
        <div className="text-base font-extrabold text-t-primary mb-2.5">{nickname} 님</div>

        {/* Prize info */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xl font-extrabold text-t-primary">{prizeAmount.toLocaleString()}원</span>
          <span className={`text-[10px] font-bold ${medal.color}`}>({medal.label})</span>
        </div>

        {/* Divider */}
        <div className="w-12 h-px border-t border-themed-light mb-3" />

        {/* Details */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-t-muted">
            {displayType}
          </div>
          <div className="text-[10px] font-medium text-t-muted">
            제{round}회 · {displayDate}
          </div>
        </div>
      </div>
    </div>
  );
}
