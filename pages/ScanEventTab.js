import React, { useState, useEffect } from 'react';
import ScanTab from './ScanTab';
import PrizeDrawView from './components/PrizeDrawView';

/**
 * ScanEventTab — "스캔·경품" 하단 탭 (통합 여정).
 *
 * 경품추첨이 메인 화면. "낙첨복권 스캔하고 응모권 추가하기" 액션을 누르면
 * 같은 탭 안에서 낙첨 스캔(카메라/직접입력)으로 진입한다.
 * 스캔 → /scan_result → /scan_complete 루프가 경품 추첨일 안내로 닫힌다.
 */
export default function ScanEventTab({ onSubviewChange }) {
    const [showScan, setShowScan] = useState(false);

    // 홈의 "낙첨복권 스캔" 카드로 진입 시 곧장 스캔 화면으로
    useEffect(() => {
        if (sessionStorage.getItem('cwg_open_scan')) {
            sessionStorage.removeItem('cwg_open_scan');
            setShowScan(true);
        }
    }, []);

    // 스캔 서브페이지 진입 시 하단 네비 숨김을 부모(index)에 알림
    useEffect(() => {
        if (onSubviewChange) onSubviewChange(showScan);
    }, [showScan, onSubviewChange]);
    useEffect(() => () => { if (onSubviewChange) onSubviewChange(false); }, []);

    if (showScan) {
        return <ScanTab embedded onClose={() => setShowScan(false)} />;
    }

    return <PrizeDrawView embedded onScan={() => setShowScan(true)} />;
}
