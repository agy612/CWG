import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import 'swiper/css';
import 'swiper/css/pagination';
import { UserProvider } from '../contexts/UserContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import DevTierSwitcher from '../components/common/DevTierSwitcher';
import PromotionPopup from '../components/common/PromotionPopup';

const HOME_ROUTES = ['/'];

function AppInner({ Component, pageProps }) {
  const router = useRouter();
  const isHome = HOME_ROUTES.includes(router.pathname);
  const { theme } = useTheme();

  return (
    <div className={`theme-${theme} bg-background font-sans text-t-primary antialiased overflow-x-hidden min-h-screen`}>
      <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto bg-background shadow-2xl">
        <Component {...pageProps} />
        <DevTierSwitcher />
        {isHome && <PromotionPopup />}
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <Head>
            <title>CWG App</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
          </Head>
          <AppInner Component={Component} pageProps={pageProps} />
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
