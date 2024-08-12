// app/hooks/useTranslation.ts
import { useLanguage } from "../contexts/LanguageContext";
import { translations, TranslationKey } from "../utils/translations";

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey) => {
    return translations[language][key];
  };

  return { t };
};
