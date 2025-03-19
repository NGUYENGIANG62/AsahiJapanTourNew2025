import { createContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@/types';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>('en');

  // Initialize language from browser or localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ja', 'zh', 'ko', 'vi'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    } else {
      // Try to get browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (['en', 'ja', 'zh', 'ko', 'vi'].includes(browserLang)) {
        setLanguageState(browserLang);
        i18n.changeLanguage(browserLang);
      }
    }
  }, [i18n]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
