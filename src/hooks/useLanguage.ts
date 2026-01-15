import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '@/i18n';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const setLanguage = (lang: 'en' | 'hi') => {
    changeLanguage(lang);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
  };

  const currentLanguage = getCurrentLanguage() as 'en' | 'hi';
  const isHindi = currentLanguage === 'hi';

  return {
    t,
    currentLanguage,
    isHindi,
    setLanguage,
    toggleLanguage,
  };
};
