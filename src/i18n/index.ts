// Export all translations
import { fr } from './locales/fr';
import { en } from './locales/en';
import type { SupportedLanguage } from './types';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  fr,
  en,
  // Placeholders for future languages - will use English as fallback
  es: en,
  pt: en,
  ar: en,
};

export const supportedLanguages: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  // Ready to add more languages
  // { code: 'es', label: 'Español', flag: '🇪🇸' },
  // { code: 'pt', label: 'Português', flag: '🇵🇹' },
  // { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export type { SupportedLanguage } from './types';
