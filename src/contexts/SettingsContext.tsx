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
    yes: 'Oui',
    no: 'Non',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Attention',
    info: 'Information',
    // Dashboard
    welcome: 'Bienvenue',
    overview: 'Vue d\'ensemble',
    statistics: 'Statistiques',
    recent_activity: 'Activité récente',
    quick_actions: 'Actions rapides',
    // Production
    total_production: 'Production totale',
    daily_production: 'Production journalière',
    monthly_production: 'Production mensuelle',
    annual_production: 'Production annuelle',
    production_units: 'Unités de production',
    active_ponds: 'Bassins actifs',
    total_fish: 'Total poissons',
    average_weight: 'Poids moyen',
    // Health
    health_status: 'État sanitaire',
    mortality_rate: 'Taux de mortalité',
    vaccinations: 'Vaccinations',
    treatments: 'Traitements',
    quarantine: 'Quarantaine',
    // Feeding
    daily_feeding: 'Alimentation quotidienne',
    feed_consumption: 'Consommation d\'aliment',
    feed_conversion_ratio: 'Taux de conversion',
    feeding_schedule: 'Planning alimentaire',
    // Environmental
    water_quality: 'Qualité de l\'eau',
    temperature: 'Température',
    oxygen_level: 'Niveau d\'oxygène',
    ph_level: 'Niveau pH',
    salinity: 'Salinité',
    // Finance
    revenue: 'Chiffre d\'affaires',
    expenses: 'Dépenses',
    profit: 'Bénéfice',
    cost_per_kg: 'Coût par kg',
    profit_margin: 'Marge bénéficiaire',
    // IoT
    iot_status: 'État IoT',
    connected_sensors: 'Capteurs connectés',
    active_alerts: 'Alertes actives',
    global_health: 'Santé globale',
    anomaly_rate: 'Taux d\'anomalies',
    critical: 'Critique',
    stable: 'Stable',
    rising: 'En hausse',
    falling: 'En baisse',
    last_update: 'Dernière mise à jour',
    detected_subjects: 'Sujets détectés',
    health_score: 'Score de santé',
    daily_growth: 'Croissance journalière',
    daily_mortality: 'Mortalité journalière',
    recommendations: 'Recommandations',
    basin: 'Bassin',
    sensor: 'Capteur',
    value: 'Valeur',
    status: 'État',
    trend: 'Tendance',
    evolution: 'Évolution',
    parameters: 'Paramètres'
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
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    // Dashboard
    welcome: 'Welcome',
    overview: 'Overview',
    statistics: 'Statistics',
    recent_activity: 'Recent Activity',
    quick_actions: 'Quick Actions',
    // Production
    total_production: 'Total Production',
    daily_production: 'Daily Production',
    monthly_production: 'Monthly Production',
    annual_production: 'Annual Production',
    production_units: 'Production Units',
    active_ponds: 'Active Ponds',
    total_fish: 'Total Fish',
    average_weight: 'Average Weight',
    // Health
    health_status: 'Health Status',
    mortality_rate: 'Mortality Rate',
    vaccinations: 'Vaccinations',
    treatments: 'Treatments',
    quarantine: 'Quarantine',
    // Feeding
    daily_feeding: 'Daily Feeding',
    feed_consumption: 'Feed Consumption',
    feed_conversion_ratio: 'Feed Conversion Ratio',
    feeding_schedule: 'Feeding Schedule',
    // Environmental
    water_quality: 'Water Quality',
    temperature: 'Temperature',
    oxygen_level: 'Oxygen Level',
    ph_level: 'pH Level',
    salinity: 'Salinity',
    // Finance
    revenue: 'Revenue',
    expenses: 'Expenses',
    profit: 'Profit',
    cost_per_kg: 'Cost per kg',
    profit_margin: 'Profit Margin',
    // IoT
    iot_status: 'IoT Status',
    connected_sensors: 'Connected Sensors',
    active_alerts: 'Active Alerts',
    global_health: 'Global Health',
    anomaly_rate: 'Anomaly Rate',
    critical: 'Critical',
    stable: 'Stable',
    rising: 'Rising',
    falling: 'Falling',
    last_update: 'Last Update',
    detected_subjects: 'Detected Subjects',
    health_score: 'Health Score',
    daily_growth: 'Daily Growth',
    daily_mortality: 'Daily Mortality',
    recommendations: 'Recommendations',
    basin: 'Basin',
    sensor: 'Sensor',
    value: 'Value',
    status: 'Status',
    trend: 'Trend',
    evolution: 'Evolution',
    parameters: 'Parameters'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('SettingsProvider rendering');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XOF' | 'MAD'>('XOF');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation sûre après le montage du composant
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'auto';
      const savedLanguage = localStorage.getItem('app-language') as 'fr' | 'en';
      const savedCurrency = localStorage.getItem('app-currency') as 'EUR' | 'USD' | 'XOF' | 'MAD';
      
      if (savedTheme) setTheme(savedTheme);
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedCurrency) setCurrency(savedCurrency);
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      localStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
    setTheme(newTheme);
  };

  const handleSetLanguage = (newLanguage: 'fr' | 'en') => {
    try {
      localStorage.setItem('app-language', newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
    setLanguage(newLanguage);
  };

  const handleSetCurrency = (newCurrency: 'EUR' | 'USD' | 'XOF' | 'MAD') => {
    try {
      localStorage.setItem('app-currency', newCurrency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
    setCurrency(newCurrency);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const formatCurrency = (amount: number): string => {
    const currencySymbols = {
      EUR: '€',
      USD: '$',
      XOF: 'CFA',
      MAD: 'MAD'
    };

    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return `${formattedAmount} ${currencySymbols[currency]}`;
  };

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading settings...
      </div>
    );
  }

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        currency,
        setTheme: handleSetTheme,
        setLanguage: handleSetLanguage,
        setCurrency: handleSetCurrency,
        t,
        formatCurrency,
      }}
    >
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