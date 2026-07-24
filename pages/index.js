import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HomeTab from './HomeTab';
import GenerateTab from './GenerateTab';
import ScanEventTab from './ScanEventTab';
import ContentsTab from './ContentsTab';
import MyTab from './MyTab';
import BottomNav from './BottomNav';

export default function Index() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [contentsView, setContentsView] = useState('main');
    const [subview, setSubview] = useState(false); // 탭 내부 서브페이지(추가 생성/스캔) 진입 시 하단 네비 숨김
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const registered = localStorage.getItem('user_registered');
        if (!registered) {
            router.replace('/login');
        } else if (!localStorage.getItem('lottery_selected')) {
            // 가입은 됐지만 지역/로또 미선택 → 지역 선택으로
            router.replace('/lottery_selection');
        } else {
            const q = router.query.tab;
            // 구 럭키이벤트 딥링크 호환 → 번호생성 탭(추가 생성이 그 안에 통합됨)
            if (q === 'championship') {
                setActiveTab('picks');
            } else if (q) {
                setActiveTab(q);
            }
            setReady(true);
        }
    }, [router.query.tab]);

    if (!ready) return null;

    const renderScreen = () => {
        switch (activeTab) {
            case 'home':
                return <HomeTab setActiveTab={setActiveTab} />;
            case 'picks':
                return <GenerateTab onSubviewChange={setSubview} />;
            case 'scan':
                return <ScanEventTab onSubviewChange={setSubview} />;
            case 'contents':
                return <ContentsTab onViewChange={setContentsView} />;
            case 'my':
                return <MyTab />;
            default:
                return <HomeTab setActiveTab={setActiveTab} />;
        }
    };

    // 콘텐츠 비-main 상세 뷰 또는 탭 내부 서브페이지(추가 생성/스캔)에선 하단 네비를 숨긴다.
    const hideNav = (activeTab === 'contents' && contentsView !== 'main') || subview;
    const showBottomNav = !hideNav;

    return (
        <>
            <div className={`flex-1 overflow-y-auto ${hideNav ? '' : 'pb-24'}`}>
                {renderScreen()}
            </div>
            {showBottomNav && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
        </>
    );
}
