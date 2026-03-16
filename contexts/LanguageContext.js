import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import ko from '../locales/ko.json';
import ja from '../locales/ja.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

const translations = { en, ko, ja, es, fr, de };

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState('ko');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cwg_language');
            if (saved && translations[saved]) {
                setCurrentLang(saved);
            }
        }
    }, []);

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setCurrentLang(lang);
            if (typeof window !== 'undefined') {
                localStorage.setItem('cwg_language', lang);
            }
        }
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key;
            }
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ currentLang, changeLanguage, t, languages: Object.keys(translations) }}>
            {children}
        </LanguageContext.Provider>
    );
};
