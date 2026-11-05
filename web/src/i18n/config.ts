import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const supportedLanguages = ['es', 'en', 'fr', 'de'] as const;

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'es';

  try {
    const storedLanguage = window.localStorage.getItem('i18nextLng');
    return storedLanguage && supportedLanguages.includes(storedLanguage as (typeof supportedLanguages)[number])
      ? storedLanguage
      : 'es';
  } catch {
    return 'es';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    lng: getInitialLanguage(),
    supportedLngs: supportedLanguages,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
