// Export all translations
import { fr } from './locales/fr';
import { en } from './locales/en';
import { ewe } from './locales/ewe';
import { kabye } from './locales/kabye';
import { adja } from './locales/adja';
import { wolof } from './locales/wolof';
import { bambara } from './locales/bambara';
import type { SupportedLanguage } from './types';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  fr,
  en,
  es: { ...fr, ...en },
  pt: { ...fr, ...en },
  ar: { ...fr, ...en },
  ewe: { ...fr, ...ewe },
  kabye: { ...fr, ...kabye },
  adja: { ...fr, ...adja },
  wolof: { ...fr, ...wolof },
  bambara: { ...fr, ...bambara },
};

export const supportedLanguages: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ewe', label: 'Eʋegbe (Ewe)', flag: '🇹🇬' },
  { code: 'kabye', label: 'Kabɩyɛ (Kabyè)', flag: '🇹🇬' },
  { code: 'adja', label: 'Adja', flag: '🇹🇬' },
  { code: 'wolof', label: 'Wolof', flag: '🇸🇳' },
  { code: 'bambara', label: 'Bamanankan (Bambara)', flag: '🇲🇱' },
];

export type { SupportedLanguage } from './types';
