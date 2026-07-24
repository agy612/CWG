// Dummy ad data — replace with real ad SDK integrations later

export const BANNER_ADS = [
    {
        id: 'b1',
        brand: 'CoinPlus',
        title: '신규 가입 5만원 즉시 지급',
        sub: '국내 1위 디지털 자산 거래소',
        cta: '지금 받기',
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #92400e 100%)',
        accent: '#fef3c7',
    },
    {
        id: 'b2',
        brand: 'StayNow',
        title: '여름 특가 최대 70% 할인',
        sub: '전국 호텔 · 리조트 · 풀빌라',
        cta: '예약하기',
        bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 60%, #155e75 100%)',
        accent: '#cffafe',
    },
    {
        id: 'b3',
        brand: 'FoodieDelivery',
        title: '첫 주문 1만원 할인 쿠폰',
        sub: '24시간 빠른 배달 서비스',
        cta: '쿠폰 받기',
        bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #7f1d1d 100%)',
        accent: '#fee2e2',
    },
    {
        id: 'b4',
        brand: 'StreamFlix',
        title: '첫 달 무료 체험',
        sub: '5만편 이상의 콘텐츠',
        cta: '체험 시작',
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 60%, #4c1d95 100%)',
        accent: '#ede9fe',
    },
    {
        id: 'b5',
        brand: 'GameQuest',
        title: '신작 RPG 사전예약 진행 중',
        sub: '예약 시 한정 아이템 지급',
        cta: '예약하기',
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 60%, #064e3b 100%)',
        accent: '#d1fae5',
    },
    {
        id: 'b6',
        brand: 'AutoDeal',
        title: '중고차 시세 무료 진단',
        sub: '내 차 가격 30초 만에 확인',
        cta: '진단받기',
        bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 60%, #1e3a8a 100%)',
        accent: '#dbeafe',
    },
];

export const SPONSOR_LOGOS = [
    { id: 's01', src: '/ads/imgi_34_logo_01.png' },
    { id: 's02', src: '/ads/imgi_35_logo_02.png' },
    { id: 's03', src: '/ads/imgi_36_logo_03.png' },
    { id: 's04', src: '/ads/imgi_37_logo_04.png' },
    { id: 's05', src: '/ads/imgi_38_logo_05.png' },
    { id: 's06', src: '/ads/imgi_39_logo_06.png' },
    { id: 's07', src: '/ads/imgi_40_logo_07.png' },
    { id: 's08', src: '/ads/imgi_41_logo_08.png' },
    { id: 's09', src: '/ads/imgi_42_logo_09.png' },
    { id: 's10', src: '/ads/imgi_43_logo_10.png' },
    { id: 's11', src: '/ads/imgi_44_logo_11.png' },
    { id: 's12', src: '/ads/imgi_45_logo_12.png' },
    { id: 's13', src: '/ads/imgi_46_logo_13.png' },
];

export const INTERSTITIAL_ADS = [
    {
        id: 'i1',
        brand: 'CoinPlus',
        title: '지금 가입하면',
        highlight: '5만원',
        sub: '신규 회원 한정 즉시 지급 이벤트',
        cta: '지금 시작하기',
        bg: 'linear-gradient(160deg, #1a0f00 0%, #2a1a00 50%, #100a00 100%)',
        accent: '#fbbf24',
        badge: '오픈 이벤트',
    },
    {
        id: 'i2',
        brand: 'StreamFlix',
        title: '첫 달은',
        highlight: '무료',
        sub: '5만편 이상 영화 · 드라마 · 예능 무제한',
        cta: '무료로 시작',
        bg: 'linear-gradient(160deg, #1a0033 0%, #2d0a4e 50%, #100020 100%)',
        accent: '#c4a7ff',
        badge: 'PROMOTION',
    },
    {
        id: 'i3',
        brand: 'StayNow',
        title: '여름 특가',
        highlight: '최대 70%',
        sub: '전국 5만개 숙소 · 오늘 마감 임박',
        cta: '예약하기',
        bg: 'linear-gradient(160deg, #002a33 0%, #003e4d 50%, #001a26 100%)',
        accent: '#22d3ee',
        badge: 'HOT DEAL',
    },
];

// 스캔 후 "광고 보고 경품 응모" 선택지 — 카테고리별 10개.
// 모두 15초 · +15P 통일. img는 데모용 실제 광고 소재(띠배너 로고와 동일 폴더) — 브랜드명은 로고와 일치.
export const CHOICE_ADS = [
    { id: 'c01', brand: '한화',           category: '금융',   duration: 15, points: 15, img: '/ads/imgi_34_logo_01.png' },
    { id: 'c02', brand: '기아',           category: '자동차', duration: 15, points: 15, img: '/ads/imgi_35_logo_02.png' },
    { id: 'c03', brand: '한국지역난방공사', category: '에너지', duration: 15, points: 15, img: '/ads/imgi_36_logo_03.png' },
    { id: 'c04', brand: '농심',           category: '식품',   duration: 15, points: 15, img: '/ads/imgi_37_logo_04.png' },
    { id: 'c05', brand: '아시아나항공',    category: '여행',   duration: 15, points: 15, img: '/ads/imgi_38_logo_05.png' },
    { id: 'c06', brand: 'CJ프레시웨이',    category: '식품',   duration: 15, points: 15, img: '/ads/imgi_39_logo_06.png' },
    { id: 'c07', brand: 'CGV',            category: '문화',   duration: 15, points: 15, img: '/ads/imgi_40_logo_07.png' },
    { id: 'c08', brand: '현대글로비스',    category: '물류',   duration: 15, points: 15, img: '/ads/imgi_41_logo_08.png' },
    { id: 'c09', brand: '현대오토에버',    category: 'IT',     duration: 15, points: 15, img: '/ads/imgi_42_logo_09.png' },
    { id: 'c10', brand: 'KB타이틀',       category: '금융',   duration: 15, points: 15, img: '/ads/imgi_43_logo_10.png' },
];

// Pick a random item by stable index (so server/client match)
export const pickByIndex = (arr, idx) => arr[idx % arr.length];
