import { useLocale } from '../contexts/LocaleContext';

export const useTranslations = (namespace = 'common') => {
  const { t, locale, changeLocale, isLoading } = useLocale();
  
  const translate = (key) => {
    return t(key, namespace);
  };

  return {
    t: translate,
    locale,
    changeLocale,
    isLoading
  };
};

export const useMenuTranslations = () => useTranslations('menu');
export const useAuthTranslations = () => useTranslations('auth');
export const useCommonTranslations = () => useTranslations('common');