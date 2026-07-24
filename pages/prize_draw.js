import React from 'react';
import PrizeDrawView from './components/PrizeDrawView';

// /prize_draw 라우트 — 독립 페이지로 진입 시 자체 헤더(뒤로가기)를 포함해 렌더.
// 스캔·경품 탭 내부에서는 ScanEventTab 이 <PrizeDrawView embedded /> 로 직접 사용한다.
export default function PrizeDraw() {
    return <PrizeDrawView />;
}
