
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  currency: 'EUR' | 'USD' | 'XOF' | 'MAD';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setCurrency: (currency: 'EUR' | 'USD' | 'XOF' | 'MAD') => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    dashboard: 'Accueil',
    units: 'Unités',
    fish: 'Cheptel',
    economics: 'Finance',
    settings: 'Plus',
    // Settings
    appearance: 'Apparence',
    language: 'Langue',
    currency: 'Devise',
    theme_light: 'Clair',
    theme_dark: 'Sombre',
    theme_auto: 'Auto',
    // Common
    save: 'Sauvegarder',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    close: 'Fermer'
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    units: 'Units',
    fish: 'Livestock',
    economics: 'Finance',
    settings: 'More',
    // Settings
    appearance: 'Appearance',
    language: 'Language',
    currency: 'Currency',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_auto: 'Auto',
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    close: 'Close'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XOF' | 'MAD'>('EUR');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <SettingsContext.Provider value={{
      theme,
      language,
      currency,
      setTheme,
      setLanguage,
      setCurrency,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
