// Export all translations
import { fr } from './locales/fr';
import { en } from './locales/en';
import type { SupportedLanguage } from './types';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  fr,
  en,
  es: en,
  pt: en,
  ar: en,
  ewe: fr,
  kabye: fr,
  wolof: fr,
  bambara: fr,
};

export const supportedLanguages: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ewe', label: 'Eʋegbe (Ewe)', flag: '🇹🇬' },
  { code: 'kabye', label: 'Kabɩyɛ (Kabyè)', flag: '🇹🇬' },
  { code: 'wolof', label: 'Wolof', flag: '🇸🇳' },
  { code: 'bambara', label: 'Bamanankan (Bambara)', flag: '🇲🇱' },
];

export type { SupportedLanguage } from './types';
