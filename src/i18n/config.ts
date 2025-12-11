import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from './locales/en/common.json';
import commonDE from './locales/de/common.json';
import homeEN from './locales/en/home.json';
import homeDE from './locales/de/home.json';
import aboutEN from './locales/en/about.json';
import aboutDE from './locales/de/about.json';
import chaptersEN from './locales/en/chapters.json';
import chaptersDE from './locales/de/chapters.json';
import announcementsEN from './locales/en/announcements.json';
import announcementsDE from './locales/de/announcements.json';
import adminEN from './locales/en/admin.json';
import adminDE from './locales/de/admin.json';

const resources = {
    en: {
        common: commonEN,
        home: homeEN,
        about: aboutEN,
        chapters: chaptersEN,
        announcements: announcementsEN,
        admin: adminEN,
    },
    de: {
        common: commonDE,
        home: homeDE,
        about: aboutDE,
        chapters: chaptersDE,
        announcements: announcementsDE,
        admin: adminDE,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'home', 'about', 'chapters', 'announcements', 'admin'],

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    });

export default i18n;
