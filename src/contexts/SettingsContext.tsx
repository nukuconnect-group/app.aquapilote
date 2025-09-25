
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  currency: 'EUR' | 'USD' | 'XOF' | 'MAD';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setCurrency: (currency: 'EUR' | 'USD' | 'XOF' | 'MAD') => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation  
    dashboard: 'Tableau de bord',
    'iot-control': 'Centre IoT',
    units: 'Unités',
    infrastructures: 'Infrastructures',
    fish: 'Poissons',
    livestock: 'Cheptel',
    feeding: 'Alimentation',
    health: 'Prophylaxie',
    production: 'Production',
    accounting: 'Comptabilité',
    hr: 'RH & Paie',
    sales: 'Vente',
    planning: 'Planification',
    weather: 'Météo',
    team: 'Équipe',
    reports: 'Rapports',
    settings: 'Paramètres',
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
    close: 'Fermer',
    // Currency symbols
    currency_symbol: 'EUR' === 'EUR' ? '€' : 'USD' === 'USD' ? '$' : 'XOF' === 'XOF' ? 'FCFA' : 'MAD' === 'MAD' ? 'DH' : '€',
    // Units
    select_unit: 'Sélectionner une unité',
    production_unit: 'Unité de production',
    // Sales
    new_sale: 'Nouvelle Vente',
    client_name: 'Nom du client',
    contact: 'Contact',
    products: 'Produits',
    total: 'Total',
    payment_method: 'Mode de paiement',
    notes: 'Notes',
    // HR
    employee_management: 'Gestion des Employés',
    new_employee: 'Nouvel Employé',
    first_name: 'Prénom',
    last_name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    position: 'Poste',
    salary: 'Salaire',
    // Planning
    planning_management: 'Planification & Organisation',
    new_task: 'Nouvelle Tâche',
    task_title: 'Titre de la tâche',
    task_description: 'Description',
    task_date: 'Date',
    task_time: 'Heure',
    purchases: 'Achats',
    // Weather
    weather_dashboard: 'Météo Agricole',
    current_conditions: 'Conditions actuelles',
    temperature: 'Température',
    humidity: 'Humidité',
    precipitation: 'Précipitations',
    wind_speed: 'Vitesse du vent',
    forecast: 'Prévisions'
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    'iot-control': 'IoT Center',
    units: 'Units',
    infrastructures: 'Infrastructure',
    fish: 'Fish',
    livestock: 'Livestock',
    feeding: 'Feeding',
    health: 'Health',
    production: 'Production',
    accounting: 'Accounting',
    hr: 'HR & Payroll',
    sales: 'Sales',
    planning: 'Planning',
    weather: 'Weather',
    team: 'Team',
    reports: 'Reports',
    settings: 'Settings',
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
    close: 'Close',
    // Currency symbols
    currency_symbol: 'EUR' === 'EUR' ? '€' : 'USD' === 'USD' ? '$' : 'XOF' === 'XOF' ? 'CFA' : 'MAD' === 'MAD' ? 'DH' : '€',
    // Units  
    select_unit: 'Select a unit',
    production_unit: 'Production unit',
    // Sales
    new_sale: 'New Sale',
    client_name: 'Client name',
    contact: 'Contact',
    products: 'Products',
    total: 'Total',
    payment_method: 'Payment method',
    notes: 'Notes',
    // HR
    employee_management: 'Employee Management',
    new_employee: 'New Employee',
    first_name: 'First name',
    last_name: 'Last name',
    email: 'Email',
    phone: 'Phone',
    position: 'Position',
    salary: 'Salary',
    // Planning
    planning_management: 'Planning & Organization',
    new_task: 'New Task',
    task_title: 'Task title',
    task_description: 'Description',
    task_date: 'Date',
    task_time: 'Time',
    purchases: 'Purchases',
    // Weather
    weather_dashboard: 'Agricultural Weather',
    current_conditions: 'Current conditions',
    temperature: 'Temperature',
    humidity: 'Humidity',
    precipitation: 'Precipitation',
    wind_speed: 'Wind speed',
    forecast: 'Forecast'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => {
    return localStorage.getItem('app-theme') as 'light' | 'dark' | 'auto' || 'light';
  });
  const [language, setLanguage] = useState<'fr' | 'en'>(() => {
    return localStorage.getItem('app-language') as 'fr' | 'en' || 'fr';
  });
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XOF' | 'MAD'>(() => {
    return localStorage.getItem('app-currency') as 'EUR' | 'USD' | 'XOF' | 'MAD' || 'XOF';
  });

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const currencySymbols = {
      'EUR': '€',
      'USD': '$', 
      'XOF': 'FCFA',
      'MAD': 'DH'
    };
    
    const symbol = currencySymbols[currency];
    const formatted = amount.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');
    
    if (currency === 'XOF' || currency === 'MAD') {
      return `${formatted} ${symbol}`;
    } else {
      return currency === 'USD' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
    }
  };

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const handleSetLanguage = (newLanguage: 'fr' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
  };

  const handleSetCurrency = (newCurrency: 'EUR' | 'USD' | 'XOF' | 'MAD') => {
    setCurrency(newCurrency);
    localStorage.setItem('app-currency', newCurrency);
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
      setTheme: handleSetTheme,
      setLanguage: handleSetLanguage,
      setCurrency: handleSetCurrency,
      t,
      formatCurrency
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
