import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { UserProvider } from '../contexts/UserContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import DevTierSwitcher from '../components/DevTierSwitcher';
import PromotionPopup from '../components/PromotionPopup';
import Splash from '../components/Splash';

const HOME_ROUTES = ['/'];

function AppInner({ Component, pageProps }) {
  const router = useRouter();
  const { theme } = useTheme();
  const isHome = HOME_ROUTES.includes(router.pathname);

  const [showSplash, setShowSplash] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('splash_shown')) {
      setShowSplash(true);
      sessionStorage.setItem('splash_shown', '1');
    }
  }, []);

  return (
    <div className={`theme-${theme} bg-background font-sans text-t-primary antialiased overflow-x-hidden min-h-screen`}>
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">
        <Component {...pageProps} />
        <DevTierSwitcher />
        {/* isHome && <PromotionPopup /> */}
      </div>
      {showSplash && <Splash duration={1800} onDone={() => setShowSplash(false)} />}
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <Head>
          <title>CWG App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
        </Head>
        <AppInner Component={Component} pageProps={pageProps} />
      </UserProvider>
    </ThemeProvider>
  );
}
