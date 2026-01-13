import { useLocale } from '../contexts/LocaleContext';

export const useTranslations = () => {
  const { t, locale, changeLocale, isLoading } = useLocale();
  
  return {
    t,
    locale,
    changeLocale,
    isLoading
  };
};