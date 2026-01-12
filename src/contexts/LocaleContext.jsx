import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем переводы при изменении языка
  useEffect(() => {
    loadTranslations(locale);
  }, [locale]);

  const loadTranslations = async (lang) => {
    setIsLoading(true);
    try {
      // Загружаем файлы переводов для выбранного языка
      const modules = await Promise.all([
        import(`../locales/${lang}/menu.json`),
        import(`../locales/${lang}/auth.json`),
        import(`../locales/${lang}/common.json`),
        // Добавьте другие файлы по необходимости
      ]);
      
      const [menu, auth, common] = modules;
      
      setTranslations({
        menu: menu.default,
        auth: auth.default,
        common: common.default
      });
      
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback на украинский если не удалось загрузить
      if (lang !== 'uk') {
        try {
          const fallbackModules = await Promise.all([
            import('../locales/uk/menu.json'),
            import('../locales/uk/auth.json'),
            import('../locales/uk/common.json'),
          ]);
          
          const [menu, auth, common] = fallbackModules;
          
          setTranslations({
            menu: menu.default,
            auth: auth.default,
            common: common.default
          });
        } catch (fallbackError) {
          console.error('Fallback translations failed:', fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const t = useCallback((key, namespace = 'common') => {
    if (isLoading) return key;
    
    const keys = key.split('.');
    let value = translations[namespace];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for ${namespace}.${key}`);
        return key;
      }
    }
    
    return value;
  }, [translations, isLoading]);

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
    isLoading
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};