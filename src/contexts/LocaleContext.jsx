import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import ukTranslations from '../locales/uk.json';
let enTranslations = null;

const LocaleContext = createContext({});

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'uk';
  });
  
  const [translations, setTranslations] = useState(() => ({
    uk: ukTranslations,
    en: null
  }));
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (locale === 'en' && !translations.en) {
      loadEnglishTranslations();
    }
  }, [locale, translations.en]);

  const loadEnglishTranslations = async () => {
    setIsLoading(true);
    try {
      const module = await import('../locales/en.json');
      setTranslations(prev => ({
        ...prev,
        en: module.default
      }));
    } catch (error) {
      console.error('Failed to load English translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = useCallback((key) => {
    const keys = key.split('.');
    
    let currentTranslations = translations[locale];
    
    if (!currentTranslations) {
      currentTranslations = translations.uk;
    }
    
    let value = currentTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        let ukValue = translations.uk;
        for (const k2 of keys) {
          if (ukValue && typeof ukValue === 'object' && k2 in ukValue) {
            ukValue = ukValue[k2];
          } else {
            console.warn(`Translation missing: ${key}`);
            return key;
          }
        }
        return ukValue;
      }
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    console.warn(`Translation returns object for key: ${key}`);
    return key;
  }, [translations, locale]);

  const changeLocale = useCallback(async (newLocale) => {
    if (newLocale !== locale && ['uk', 'en'].includes(newLocale)) {
      setLocale(newLocale);
      localStorage.setItem('locale', newLocale);
    }
  }, [locale]);

  const value = {
    locale,
    t,
    changeLocale,
    isLoading: locale === 'en' && !translations.en,
    isLoaded: true
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};