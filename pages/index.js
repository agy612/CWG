import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HomeTab from '../components/tabs/HomeTab';
import ScanTab from '../components/tabs/ScanTab';
import PicksTab from '../components/tabs/PicksTab';
import ChampionshipTab from '../components/tabs/ChampionshipTab';
import MyTab from '../components/tabs/MyTab';
import BottomNav from '../components/tabs/BottomNav';

export default function Index() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('home');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const registered = localStorage.getItem('user_registered');
            if (!registered) {
                router.replace('/login');
            } else {
                setReady(true);
            }
        }
    }, [router]);

    if (!ready) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-themed-light border-t-t-primary rounded-full animate-spin" />
                    <p className="text-t-secondary text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    const renderScreen = () => {
        switch (activeTab) {
            case 'home':
                return <HomeTab setActiveTab={setActiveTab} />;
            case 'scan':
                return <ScanTab />;
            case 'picks':
                return <PicksTab />;
            case 'championship':
                return <ChampionshipTab />;
            case 'my':
                return <MyTab />;
            default:
                return <HomeTab setActiveTab={setActiveTab} />;
        }
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto pb-24">
                {renderScreen()}
            </div>
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
}
