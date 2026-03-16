// 당첨자 관련 유틸 및 샘플 데이터

/**
 * 닉네임 마스킹 처리
 * @param {string} nickname - 원본 닉네임
 * @returns {string} 마스킹된 닉네임
 */
export function maskNickname(nickname) {
  if (!nickname || nickname.length < 2) return nickname;
  const visiblePart = nickname.slice(0, Math.min(nickname.length - 1, 2));
  return `${visiblePart}***`;
}

/**
 * 홈 카드 데이터 가져오기 (모든 케이스 반환)
 * @returns {Array} 모든 HomeCardData 배열
 */
export function getHomeCardData() {
  // TODO: 실제 API 호출로 교체
  // 현재는 모든 샘플 데이터를 배열로 반환 (개발/테스트용)

  return [
    SAMPLE_THIS_WEEK,
    SAMPLE_LAST_WEEK,
    SAMPLE_HIGH_PRIZE_RANKING,
    SAMPLE_ALL_TIME_STATS,
    SAMPLE_PARTICIPATION_STATS
  ];
}

// ============================================================
// 샘플 데이터 (개발용)
// ============================================================

// 이번 주 당첨자
export const SAMPLE_THIS_WEEK = {
  type: 'THIS_WEEK_WINNERS',
  summary: {
    round: 1159,
    drawDate: new Date('2026-03-15'),
    totalWinners: 3,
    totalPrizeAmount: 1600000,
    prizeBreakdown: [
      { rank: 3, count: 1 },
      { rank: 4, count: 2 }
    ]
  },
  winners: [
    {
      id: 'w1',
      userId: 'user1',
      nickname: '행운***',
      round: 1159,
      drawDate: new Date('2026-03-15'),
      createdAt: new Date('2026-03-09T10:30:00Z'),
      prizeRank: 3,
      prizeAmount: 1500000,
      type: 'CHAMPIONSHIP',
      strategyName: '트렌드',
      isPublic: true,
    },
    {
      id: 'w2',
      userId: 'user2',
      nickname: '로또***',
      round: 1159,
      drawDate: new Date('2026-03-15'),
      createdAt: new Date('2026-03-10T14:20:00Z'),
      prizeRank: 4,
      prizeAmount: 50000,
      type: 'PICK',
      pickId: 3,
      isPublic: true,
    },
    {
      id: 'w3',
      userId: 'user3',
      nickname: '대박***',
      round: 1159,
      drawDate: new Date('2026-03-15'),
      createdAt: new Date('2026-03-11T09:15:00Z'),
      prizeRank: 4,
      prizeAmount: 50000,
      type: 'CHAMPIONSHIP',
      strategyName: '균형',
      isPublic: true,
    },
  ]
};

// 지난주 당첨자
export const SAMPLE_LAST_WEEK = {
  type: 'LAST_WEEK_WINNERS',
  summary: {
    round: 1158,
    drawDate: new Date('2026-03-08'),
    totalWinners: 2,
    totalPrizeAmount: 1550000,
    prizeBreakdown: [
      { rank: 3, count: 1 },
      { rank: 5, count: 1 }
    ]
  },
  winners: [
    {
      id: 'w4',
      userId: 'user4',
      nickname: '황금***',
      round: 1158,
      drawDate: new Date('2026-03-08'),
      createdAt: new Date('2026-03-02T16:45:00Z'),
      prizeRank: 3,
      prizeAmount: 1500000,
      type: 'PICK',
      pickId: 8,
      isPublic: true,
    },
    {
      id: 'w5',
      userId: 'user5',
      nickname: '복권***',
      round: 1158,
      drawDate: new Date('2026-03-08'),
      createdAt: new Date('2026-03-04T11:20:00Z'),
      prizeRank: 5,
      prizeAmount: 5000,
      type: 'CHAMPIONSHIP',
      strategyName: '역발상',
      isPublic: true,
    }
  ]
};

// 역대 고액 당첨 순위
export const SAMPLE_HIGH_PRIZE_RANKING = {
  type: 'HIGH_PRIZE_RANKING',
  highPrizeRanking: {
    rankings: [
      {
        rank: 1,
        round: 1098,
        prizeRank: 2,
        amount: 58000000,
        nickname: '황금***',
        date: new Date('2024-12-14')
      },
      {
        rank: 2,
        round: 1045,
        prizeRank: 2,
        amount: 52000000,
        nickname: '대박***',
        date: new Date('2024-11-02')
      },
      {
        rank: 3,
        round: 987,
        prizeRank: 2,
        amount: 48500000,
        nickname: '럭키***',
        date: new Date('2024-09-15')
      }
    ]
  }
};

// CWG 전체 당첨 통계
export const SAMPLE_ALL_TIME_STATS = {
  type: 'ALL_TIME_STATS',
  allTimeStats: {
    totalWinners: 128,
    totalAmount: 20605000,
    breakdown: [
      { rank: 3, count: 12, totalAmount: 18000000 },
      { rank: 4, count: 45, totalAmount: 2250000 },
      { rank: 5, count: 71, totalAmount: 355000 }
    ],
    recentWin: {
      rank: 4,
      amount: 50000,
      daysAgo: 3
    }
  }
};

// 이번 주 참여 현황
export const SAMPLE_PARTICIPATION_STATS = {
  type: 'PARTICIPATION_STATS',
  participationStats: {
    round: 1159,
    drawDate: new Date('2026-03-15'),
    totalUsers: 1240,
    totalScans: 3580,
    methodBreakdown: {
      picks: 850,
      championship: 680,
      scan: 270
    },
    methodPercentages: {
      picks: 47,
      championship: 38,
      scan: 15
    }
  }
};
