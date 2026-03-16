import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import SummaryCard from './SummaryCard';
import WinnerCard from './WinnerCard';
import HighPrizeRankingCard from './HighPrizeRankingCard';
import AllTimeStatsCard from './AllTimeStatsCard';
import ParticipationStatsCard from './ParticipationStatsCard';

export default function WinnerCarousel({ data }) {
  if (!data || data.length === 0) return null;

  // 모든 카드를 1차원 배열로 평탄화 (flatten)
  const allCards = [];

  data.forEach((caseData) => {
    const { type } = caseData;

    // Case A & B: THIS_WEEK_WINNERS or LAST_WEEK_WINNERS
    if (type === 'THIS_WEEK_WINNERS' || type === 'LAST_WEEK_WINNERS') {
      const { summary, winners } = caseData;

      // Summary 카드 추가
      allCards.push({
        type: 'summary',
        component: <SummaryCard data={summary} type={type} />,
        key: `summary-${type}`
      });

      // 개별 당첨자 카드 추가
      winners.forEach((winner, index) => {
        allCards.push({
          type: 'winner',
          component: <WinnerCard winner={winner} index={index} type={type} />,
          key: `winner-${winner.id}-${index}`
        });
      });
    }
    // Case C-1: HIGH_PRIZE_RANKING
    else if (type === 'HIGH_PRIZE_RANKING') {
      allCards.push({
        type: 'high-prize',
        component: <HighPrizeRankingCard data={caseData} />,
        key: 'high-prize'
      });
    }
    // Case C-2: ALL_TIME_STATS
    else if (type === 'ALL_TIME_STATS') {
      allCards.push({
        type: 'all-time',
        component: <AllTimeStatsCard data={caseData} />,
        key: 'all-time'
      });
    }
    // Case D: PARTICIPATION_STATS
    else if (type === 'PARTICIPATION_STATS') {
      allCards.push({
        type: 'participation',
        component: <ParticipationStatsCard data={caseData} />,
        key: 'participation'
      });
    }
  });

  return (
    <div className="winner-carousel-section">
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={1.05}
        centeredSlides={false}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        }}
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '32px',
        }}
      >
        {allCards.map((card) => (
          <SwiperSlide key={card.key}>
            {card.component}
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .winner-carousel-section .swiper-pagination {
          bottom: 4px;
        }
        .winner-carousel-section .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: var(--color-text-faint);
          opacity: 1;
          margin: 0 3px;
          transition: all 0.3s;
        }
        .winner-carousel-section .swiper-pagination-bullet-active {
          background: #14b8a6;
          width: 20px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
