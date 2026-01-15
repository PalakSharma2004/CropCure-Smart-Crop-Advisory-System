import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

// Get saved language or default to English
const savedLanguage = localStorage.getItem('cropcare_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export const changeLanguage = (lang: string) => {
  localStorage.setItem('cropcare_language', lang);
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

export default i18n;
