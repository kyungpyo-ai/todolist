import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './ko.json';
import en from './en.json';
import { useUiStore } from '../stores/uiStore';

const savedLanguage = useUiStore.getState().language;

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

export default i18n;
