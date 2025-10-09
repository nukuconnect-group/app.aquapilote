import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  currency: 'EUR' | 'USD' | 'XOF' | 'MAD';
  offlineMode: boolean;
  showOfflineIndicator: boolean;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setCurrency: (currency: 'EUR' | 'USD' | 'XOF' | 'MAD') => void;
  setOfflineMode: (enabled: boolean) => void;
  setShowOfflineIndicator: (show: boolean) => void;
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
    transformation: 'Transformation',
    production: 'Production',
    accounting: 'Comptabilité',
    purchases: 'Achats',
    sales: 'Vente',
    suppliers: 'Fournisseurs',
    hr: 'RH & Paie',
    planning: 'Planification',
    weather: 'Météo',
    team: 'Équipe',
    reports: 'Rapports',
    settings: 'Paramètres',
    admin: 'Administration',
    // Header
    app_title: 'AQUA PILOTE',
    app_subtitle: 'Gestion Piscicole Intelligente',
    system_settings: 'Paramètres système',
    notifications: 'Notifications',
    profile: 'Profil',
    logout: 'Se déconnecter',
    // Settings
    appearance: 'Apparence',
    language: 'Langue',
    currency: 'Devise',
    theme_light: 'Clair',
    theme_dark: 'Sombre',
    theme_auto: 'Auto',
    personal_info: 'Informations personnelles',
    full_name: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    company: 'Entreprise',
    address: 'Adresse',
    notification_preferences: 'Préférences de notification',
    email_notifications: 'Notifications par email',
    receive_email_alerts: 'Recevoir les alertes par email',
    push_notifications: 'Notifications push',
    device_notifications: 'Notifications sur votre appareil',
    sms_emergency: 'SMS d\'urgence',
    sms_critical_alerts: 'SMS pour les alertes critiques',
    system_alerts: 'Alertes système',
    system_events_notifications: 'Notifications pour les événements système',
    theme_appearance: 'Thème et apparence',
    display_mode: 'Mode d\'affichage',
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Auto',
    security_privacy: 'Sécurité et confidentialité',
    current_password: 'Mot de passe actuel',
    new_password: 'Nouveau mot de passe',
    confirm_password: 'Confirmer le mot de passe',
    change_password: 'Changer le mot de passe',
    system_configuration: 'Configuration système',
    offline_mode: 'Mode hors ligne',
    offline_mode_description: 'Permet à l\'application de fonctionner sans connexion internet',
    show_sync_indicator: 'Afficher l\'indicateur de synchronisation',
    sync_indicator_description: 'Affiche le nombre d\'actions en attente de synchronisation',
    offline_tip: 'L\'application fonctionne automatiquement hors ligne. Vos données sont sauvegardées localement et synchronisées automatiquement dès que la connexion est rétablie.',
    timezone: 'Fuseau horaire',
    system_info: 'Informations système',
    version: 'Version',
    last_update: 'Dernière MAJ',
    pwa_support: 'PWA',
    enabled: 'Activé',
    developer: 'Développeur',
    developer_name: 'Startup AFRICA HORIZON AQUATIC',
    backup_restore: 'Sauvegarde et restauration',
    // Common
    save: 'Sauvegarder',
    save_changes: 'Sauvegarder les modifications',
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
    parameters: 'Paramètres',
    // Admin Dashboard
    admin_dashboard: 'Tableau de bord administrateur',
    user_management: 'Gestion des utilisateurs',
    subscription_management: 'Gestion des abonnements',
    statistics_overview: 'Statistiques globales',
    total_users: 'Total utilisateurs',
    active_users: 'Utilisateurs actifs',
    new_subscriptions: 'Nouveaux abonnés',
    active_subscriptions: 'Abonnements actifs',
    total_visits: 'Total de visites',
    search_users: 'Rechercher un utilisateur...',
    filter_by_role: 'Filtrer par rôle',
    filter_by_status: 'Filtrer par statut',
    filter_by_subscription: 'Filtrer par abonnement',
    all_roles: 'Tous les rôles',
    all_statuses: 'Tous les statuts',
    all_subscriptions: 'Tous les abonnements',
    name: 'Nom',
    role: 'Rôle',
    subscription_type: 'Type d\'abonnement',
    remaining_duration: 'Durée restante',
    registration_date: 'Date d\'inscription',
    last_activity: 'Dernière activité',
    actions: 'Actions',
    add_user: 'Ajouter un utilisateur',
    add_new_user: 'Ajouter un nouvel utilisateur',
    user_details: 'Détails de l\'utilisateur',
    activate: 'Activer',
    deactivate: 'Désactiver',
    reset_password: 'Réinitialiser le mot de passe',
    view_details: 'Voir les détails',
    active: 'Actif',
    inactive: 'Inactif',
    admin_role: 'Administrateur',
    manager_role: 'Gestionnaire',
    operator_role: 'Opérateur',
    trial_plan: 'Essai gratuit',
    basic_plan: 'Basique',
    pro_plan: 'Professionnel',
    enterprise_plan: 'Entreprise',
    password: 'Mot de passe',
    subscription_plan: 'Plan d\'abonnement',
    subscription_duration: 'Durée d\'abonnement',
    days: 'jours',
    unlimited: 'Illimité',
    user_created_success: 'Utilisateur créé avec succès',
    user_updated_success: 'Utilisateur mis à jour avec succès',
    user_deleted_success: 'Utilisateur supprimé avec succès',
    user_activated_success: 'Utilisateur activé avec succès',
    user_deactivated_success: 'Utilisateur désactivé avec succès',
    password_reset_success: 'Mot de passe réinitialisé avec succès',
    confirm_delete: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
    confirm_deactivate: 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?',
    modules_access: 'Accès aux modules',
    usage_statistics: 'Statistiques d\'utilisation',
    activity_history: 'Historique d\'activité',
    time_spent: 'Temps passé',
    modules_used: 'Modules utilisés',
    last_connection: 'Dernière connexion'
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
    transformation: 'Transformation',
    production: 'Production',
    accounting: 'Accounting',
    purchases: 'Purchases',
    sales: 'Sales',
    suppliers: 'Suppliers',
    hr: 'HR & Payroll',
    planning: 'Planning',
    weather: 'Weather',
    team: 'Team',
    reports: 'Reports',
    settings: 'Settings',
    admin: 'Administration',
    // Header
    app_title: 'AQUA PILOT',
    app_subtitle: 'Intelligent Aquaculture Management',
    system_settings: 'System settings',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',
    // Settings
    appearance: 'Appearance',
    language: 'Language',
    currency: 'Currency',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_auto: 'Auto',
    personal_info: 'Personal information',
    full_name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    address: 'Address',
    notification_preferences: 'Notification preferences',
    email_notifications: 'Email notifications',
    receive_email_alerts: 'Receive email alerts',
    push_notifications: 'Push notifications',
    device_notifications: 'Notifications on your device',
    sms_emergency: 'Emergency SMS',
    sms_critical_alerts: 'SMS for critical alerts',
    system_alerts: 'System alerts',
    system_events_notifications: 'Notifications for system events',
    theme_appearance: 'Theme and appearance',
    display_mode: 'Display mode',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    security_privacy: 'Security and privacy',
    current_password: 'Current password',
    new_password: 'New password',
    confirm_password: 'Confirm password',
    change_password: 'Change password',
    system_configuration: 'System configuration',
    offline_mode: 'Offline mode',
    offline_mode_description: 'Allows the application to work without internet connection',
    show_sync_indicator: 'Show synchronization indicator',
    sync_indicator_description: 'Displays the number of actions pending synchronization',
    offline_tip: 'The application works automatically offline. Your data is saved locally and automatically synchronized as soon as the connection is restored.',
    timezone: 'Timezone',
    system_info: 'System information',
    version: 'Version',
    last_update: 'Last update',
    pwa_support: 'PWA',
    enabled: 'Enabled',
    developer: 'Developer',
    developer_name: 'Startup AFRICA HORIZON AQUATIC',
    backup_restore: 'Backup and restore',
    // Common
    save: 'Save',
    save_changes: 'Save changes',
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
    parameters: 'Parameters',
    // Admin Dashboard
    admin_dashboard: 'Administrator Dashboard',
    user_management: 'User Management',
    subscription_management: 'Subscription Management',
    statistics_overview: 'Statistics Overview',
    total_users: 'Total Users',
    active_users: 'Active Users',
    new_subscriptions: 'New Subscriptions',
    active_subscriptions: 'Active Subscriptions',
    total_visits: 'Total Visits',
    search_users: 'Search users...',
    filter_by_role: 'Filter by role',
    filter_by_status: 'Filter by status',
    filter_by_subscription: 'Filter by subscription',
    all_roles: 'All roles',
    all_statuses: 'All statuses',
    all_subscriptions: 'All subscriptions',
    name: 'Name',
    role: 'Role',
    subscription_type: 'Subscription Type',
    remaining_duration: 'Remaining Duration',
    registration_date: 'Registration Date',
    last_activity: 'Last Activity',
    actions: 'Actions',
    add_user: 'Add User',
    add_new_user: 'Add new user',
    user_details: 'User Details',
    activate: 'Activate',
    deactivate: 'Deactivate',
    reset_password: 'Reset Password',
    view_details: 'View Details',
    active: 'Active',
    inactive: 'Inactive',
    admin_role: 'Administrator',
    manager_role: 'Manager',
    operator_role: 'Operator',
    trial_plan: 'Free Trial',
    basic_plan: 'Basic',
    pro_plan: 'Professional',
    enterprise_plan: 'Enterprise',
    password: 'Password',
    subscription_plan: 'Subscription Plan',
    subscription_duration: 'Subscription Duration',
    days: 'days',
    unlimited: 'Unlimited',
    user_created_success: 'User created successfully',
    user_updated_success: 'User updated successfully',
    user_deleted_success: 'User deleted successfully',
    user_activated_success: 'User activated successfully',
    user_deactivated_success: 'User deactivated successfully',
    password_reset_success: 'Password reset successfully',
    confirm_delete: 'Are you sure you want to delete this user?',
    confirm_deactivate: 'Are you sure you want to deactivate this user?',
    modules_access: 'Modules Access',
    usage_statistics: 'Usage Statistics',
    activity_history: 'Activity History',
    time_spent: 'Time Spent',
    modules_used: 'Modules Used',
    last_connection: 'Last Connection'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XOF' | 'MAD'>('XOF');
  const [offlineMode, setOfflineModeState] = useState<boolean>(true);
  const [showOfflineIndicator, setShowOfflineIndicatorState] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation sûre après le montage du composant
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'auto';
      const savedLanguage = localStorage.getItem('app-language') as 'fr' | 'en';
      const savedCurrency = localStorage.getItem('app-currency') as 'EUR' | 'USD' | 'XOF' | 'MAD';
      const savedOfflineMode = localStorage.getItem('app-offline-mode');
      const savedShowOfflineIndicator = localStorage.getItem('app-show-offline-indicator');
      
      if (savedTheme) setTheme(savedTheme);
      
      // Détection automatique de la langue du navigateur si aucune langue sauvegardée
      if (savedLanguage) {
        setLanguage(savedLanguage);
      } else {
        const browserLanguage = navigator.language.toLowerCase();
        const detectedLanguage = browserLanguage.startsWith('fr') ? 'fr' : 'en';
        setLanguage(detectedLanguage);
        localStorage.setItem('app-language', detectedLanguage);
      }
      
      if (savedCurrency) setCurrency(savedCurrency);
      if (savedOfflineMode !== null) setOfflineModeState(savedOfflineMode === 'true');
      if (savedShowOfflineIndicator !== null) setShowOfflineIndicatorState(savedShowOfflineIndicator === 'true');
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Appliquer le thème au document
  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    
    const applyTheme = (themeToApply: 'light' | 'dark') => {
      if (themeToApply === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'auto') {
      // Détection du thème système
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
  }, [theme, isInitialized]);

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

  const handleSetOfflineMode = (enabled: boolean) => {
    try {
      localStorage.setItem('app-offline-mode', String(enabled));
    } catch (error) {
      console.error('Error saving offline mode:', error);
    }
    setOfflineModeState(enabled);
  };

  const handleSetShowOfflineIndicator = (show: boolean) => {
    try {
      localStorage.setItem('app-show-offline-indicator', String(show));
    } catch (error) {
      console.error('Error saving show offline indicator:', error);
    }
    setShowOfflineIndicatorState(show);
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
        offlineMode,
        showOfflineIndicator,
        setTheme: handleSetTheme,
        setLanguage: handleSetLanguage,
        setCurrency: handleSetCurrency,
        setOfflineMode: handleSetOfflineMode,
        setShowOfflineIndicator: handleSetShowOfflineIndicator,
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