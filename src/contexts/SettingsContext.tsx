// React core imports
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  currency: 'EUR' | 'USD' | 'XOF' | 'MAD';
  timezone: string;
  country: string;
  offlineMode: boolean;
  showOfflineIndicator: boolean;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setCurrency: (currency: 'EUR' | 'USD' | 'XOF' | 'MAD') => void;
  setTimezone: (timezone: string) => void;
  setCountry: (country: string) => void;
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
    expenses: 'Charges',
    netProfit: 'Bénéfice net',
    profitMargin: 'Marge bénéficiaire',
    primarySales: 'Ventes principales',
    secondarySales: 'Ventes secondaires',
    staff: 'Personnel',
    maintenance: 'Maintenance',
    others: 'Autres',
    globalPerformance: 'Performance globale',
    totalProfit: 'Bénéfice total toutes unités',
    // Invoices
    invoiceManagement: 'Gestion des Factures',
    newInvoice: 'Nouvelle Facture',
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    drafts: 'Brouillons',
    pending: 'En attente',
    paidInvoices: 'Payées',
    overdueInvoices: 'En retard',
    invoiceList: 'Liste des Factures',
    invoiceNumber: 'N° Facture',
    client: 'Client',
    dueDate: 'Échéance',
    amount: 'Montant',
    invoicePreview: 'Aperçu de la facture',
    description: 'Description',
    quantity: 'Quantité',
    unitPrice: 'Prix unitaire',
    subtotal: 'Sous-total',
    vat: 'TVA',
    profit: 'Bénéfice',
    // Profile
    invalid_file_type: 'Type de fichier invalide. Utilisez JPG, PNG ou WEBP.',
    file_too_large: 'Le fichier est trop volumineux. Taille maximale : 5MB',
    upload_failed: 'Échec de l\'upload de la photo',
    profile_updated: 'Profil mis à jour avec succès',
    update_failed: 'Échec de la mise à jour du profil',
    click_camera_to_change: 'Cliquez sur l\'icône caméra pour changer la photo',
    enter_full_name: 'Entrez votre nom complet',
    email_cannot_be_changed: 'L\'email ne peut pas être modifié',
    user_role: 'Utilisateur',
    saving: 'Enregistrement...',
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
    last_connection: 'Dernière connexion',
    // Dashboard Intelligent
    intelligent_dashboard: 'Tableau de Bord Intelligent',
    adapted_view: 'Vue adaptée à votre unité de production',
    dashboard_last_update: 'Dernière mise à jour',
    today: 'Aujourd\'hui',
    no_unit_selected: 'Aucune unité sélectionnée',
    select_unit_prompt: 'Sélectionnez une unité de production pour voir ses données spécifiques',
    unit_view: 'Vue Unité',
    global_view: 'Vue Globale',
    current_stock: 'Stock Actuel',
    capacity_percent: 'de capacité',
    active_cycles_label: 'Cycles Actifs',
    total_label: 'total',
    male_breeders: 'Géniteurs Mâles',
    mature_breeding: 'Matures pour reproduction',
    female_breeders: 'Géniteurs Femelles',
    spawning_period: 'En période de ponte',
    fertility_rate: 'Taux de Fécondité',
    vs_previous_cycle: 'vs cycle précédent',
    fry_produced: 'Alevins Produits',
    this_cycle: 'Ce cycle',
    fish_transformed: 'Poissons Transformés',
    this_week: 'Cette semaine',
    active_equipment_label: 'Équipements Actifs',
    yield_label: 'Rendement',
    cutting_rate: 'Taux de découpe',
    cold_rooms: 'Chambres Froides',
    all_operational: 'Toutes opérationnelles',
    avg_temperature: 'Température Moy.',
    within_standards: 'Dans les normes',
    capacity_used: 'Capacité Utilisée',
    avg_growth: 'Croissance Moy.',
    current_avg_weight: 'Poids moyen actuel',
    mortality_label: 'Mortalité',
    acceptable_rate: 'Taux acceptable',
    hatchery_livestock: 'Cheptel - Écloserie',
    breeders_label: 'Géniteurs',
    production_label: 'Production',
    fry_label: 'alevins',
    performance_label: 'Performances',
    fertility_label: 'Fécondité',
    larval_stages: 'Stades Larvaires',
    stage_label: 'Stade',
    financial_evolution: 'Évolution Financière',
    all_units_label: 'Toutes Unités',
    revenue_chart: 'Revenus',
    benefits_label: 'Bénéfices',
    cycles_tab: 'Cycles',
    equipment_tab: 'Équipements',
    infrastructures_tab: 'Infrastructures',
    started_on: 'Démarré le',
    progress_label: 'Progression',
    no_active_cycles: 'Aucun cycle actif',
    no_equipment_msg: 'Aucun équipement',
    no_infrastructure_msg: 'Aucune infrastructure',
    // Fish Management
    livestock_management: 'Gestion du Cheptel',
    fish_performance_tracking: 'Suivi des poissons et performances zootechniques',
    select_unit_livestock: 'Sélectionnez une unité de production pour gérer son cheptel',
    hatchery_management: 'Gestion du Cheptel - Écloserie',
    breeders_fry_production: 'Géniteurs et production d\'alevins',
    fattening_management: 'Gestion du Cheptel - Grossissement',
    growing_fish: 'Poissons en croissance',
    transformation_stock: 'Gestion du Stock - Transformation',
    fish_to_transform: 'Poissons à transformer',
    conservation_stock: 'Gestion du Stock - Conservation',
    products_in_storage: 'Produits en stockage',
    new_tracking: 'Nouveau suivi',
    juveniles_label: 'Juvéniles',
    density_label: 'Densité',
    overview_tab: 'Vue d\'ensemble',
    control_fishing_tab: 'Pêche de contrôle',
    transformed_batches_tab: 'Lots transformés',
    details_tab: 'Détails',
    history_tab: 'Historique',
    livestock_status: 'État du cheptel',
    alerts_recommendations: 'Alertes et recommandations',
    optimal_fertility: 'Taux de fécondité optimal',
    spawning_in_days: 'Ponte prévue dans 5 jours',
    growth_normal: 'Croissance dans la norme',
    monitor_density: 'Surveiller la densité',
    transformed_batches_management: 'Gestion des lots transformés',
    track_transformed_batches: 'Suivez et gérez les lots de poissons transformés par espèce et type de transformation',
    batch_label: 'Lot',
    in_progress_status: 'En cours',
    initial_weight_label: 'Poids initial',
    transformed_weight_label: 'Poids transformé',
    date_label: 'Date',
    livestock_details: 'Détails du cheptel',
    coming_soon_text: 'à venir pour l\'unité',
    evolution_history: 'Historique des évolutions',
    history_data_text: 'Historique des données pour l\'unité',
    // Livestock Batches
    batch_tracking: 'Suivi et gestion des lots de poissons par unité',
    all_units_filter: 'Toutes les unités',
    add_batch_btn: 'Ajouter un lot',
    add_new_batch_title: 'Ajouter un nouveau lot',
    register_new_batch: 'Enregistrez un nouveau lot de poissons dans une unité',
    species_label: 'Espèce',
    variety_label: 'Variété',
    production_unit_label: 'Unité de production',
    select_unit_placeholder: 'Sélectionner une unité',
    quantity_label: 'Quantité',
    number_of_individuals: 'Nombre d\'individus',
    avg_weight_label: 'Poids moyen',
    weight_in_grams: 'Poids en grammes',
    acquisition_date_label: 'Date d\'acquisition',
    source_supplier_label: 'Source/Fournisseur',
    supplier_name_placeholder: 'Nom du fournisseur',
    feeding_plan_label: 'Plan d\'alimentation',
    standard_growth_option: 'Standard croissance',
    intensive_option: 'Intensif',
    extensive_option: 'Extensif',
    finishing_option: 'Finition',
    expected_harvest_date_label: 'Date de récolte prévue',
    notes_label: 'Notes',
    observations_placeholder: 'Observations, remarques...',
    error_title: 'Erreur',
    required_fields_error: 'Veuillez remplir tous les champs obligatoires',
    batch_added_title: 'Lot ajouté',
    batch_added_success_text: 'ajoutés avec succès à',
    batch_deleted_title: 'Lot supprimé',
    batch_deleted_success_text: 'Le lot a été supprimé avec succès',
    total_individuals_stat: 'Individus total',
    total_kg_stat: 'Kg total',
    healthy_batches_stat: 'Lots sains',
    active_batches_stat: 'Lots actifs',
    fish_batches_title: 'Lots de poissons',
    batch_management_tracking: 'Gestion et suivi de tous les lots par unité de production',
    healthy_status: 'Sain',
    sick_status: 'Malade',
    quarantine_status: 'Quarantaine',
    sold_status: 'Vendu',
    age_label: 'Âge',
    days_unit: 'jours',
    source_label: 'Source',
    last_check_label: 'Dernier contrôle',
    harvest_date_label: 'Date de récolte',
    // Feeding Management
    feeding_management_title: 'Gestion de l\'Alimentation',
    technical_nutritional_subtitle: 'Fiches techniques et suivi nutritionnel',
    no_feeding_required_title: 'Pas d\'alimentation requise',
    no_feeding_for_unit_text: 'ne nécessite pas de gestion d\'alimentation',
    hatchery_feeding_title: 'Alimentation - Écloserie',
    specialized_food_subtitle: 'Nourriture spécialisée pour alevins et géniteurs',
    fattening_feeding_title: 'Alimentation - Grossissement',
    growth_feeding_program: 'Programme d\'alimentation pour la croissance',
    feed_production_title: 'Production d\'Aliment',
    manufacturing_formulation: 'Fabrication et formulation',
    quantity_per_day_stat: 'Quantité/jour',
    meals_per_day_stat: 'Repas/jour',
    last_meal_stat: 'Dernier repas',
    next_meal_stat: 'Prochain repas',
    planning_tab: 'Planification',
    feed_stock_tab: 'Stock aliment',
    graphical_tracking_tab: 'Suivi graphique'
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
    netProfit: 'Net Profit',
    profitMargin: 'Profit Margin',
    primarySales: 'Primary Sales',
    secondarySales: 'Secondary Sales',
    staff: 'Staff',
    maintenance: 'Maintenance',
    others: 'Others',
    globalPerformance: 'Global Performance',
    totalProfit: 'Total profit all units',
    // Invoices
    invoiceManagement: 'Invoice Management',
    newInvoice: 'New Invoice',
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    drafts: 'Drafts',
    pending: 'Pending',
    paidInvoices: 'Paid',
    overdueInvoices: 'Overdue',
    invoiceList: 'Invoice List',
    invoiceNumber: 'Invoice #',
    client: 'Client',
    dueDate: 'Due Date',
    amount: 'Amount',
    invoicePreview: 'Invoice Preview',
    description: 'Description',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    vat: 'VAT',
    profit: 'Profit',
    // Profile
    invalid_file_type: 'Invalid file type. Use JPG, PNG or WEBP.',
    file_too_large: 'File is too large. Maximum size: 5MB',
    upload_failed: 'Photo upload failed',
    profile_updated: 'Profile updated successfully',
    update_failed: 'Profile update failed',
    click_camera_to_change: 'Click the camera icon to change photo',
    enter_full_name: 'Enter your full name',
    email_cannot_be_changed: 'Email cannot be changed',
    user_role: 'User',
    saving: 'Saving...',
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
    last_connection: 'Last Connection',
    // Intelligent Dashboard
    intelligent_dashboard: 'Intelligent Dashboard',
    adapted_view: 'View adapted to your production unit',
    dashboard_last_update: 'Last update',
    today: 'Today',
    no_unit_selected: 'No unit selected',
    select_unit_prompt: 'Select a production unit to view its specific data',
    unit_view: 'Unit View',
    global_view: 'Global View',
    current_stock: 'Current Stock',
    capacity_percent: 'of capacity',
    active_cycles_label: 'Active Cycles',
    total_label: 'total',
    male_breeders: 'Male Breeders',
    mature_breeding: 'Mature for breeding',
    female_breeders: 'Female Breeders',
    spawning_period: 'In spawning period',
    fertility_rate: 'Fertility Rate',
    vs_previous_cycle: 'vs previous cycle',
    fry_produced: 'Fry Produced',
    this_cycle: 'This cycle',
    fish_transformed: 'Fish Transformed',
    this_week: 'This week',
    active_equipment_label: 'Active Equipment',
    yield_label: 'Yield',
    cutting_rate: 'Cutting rate',
    cold_rooms: 'Cold Rooms',
    all_operational: 'All operational',
    avg_temperature: 'Avg. Temperature',
    within_standards: 'Within standards',
    capacity_used: 'Capacity Used',
    avg_growth: 'Avg. Growth',
    current_avg_weight: 'Current average weight',
    mortality_label: 'Mortality',
    acceptable_rate: 'Acceptable rate',
    hatchery_livestock: 'Livestock - Hatchery',
    breeders_label: 'Breeders',
    production_label: 'Production',
    fry_label: 'fry',
    performance_label: 'Performance',
    fertility_label: 'Fertility',
    larval_stages: 'Larval Stages',
    stage_label: 'Stage',
    financial_evolution: 'Financial Evolution',
    all_units_label: 'All Units',
    revenue_chart: 'Revenue',
    benefits_label: 'Benefits',
    cycles_tab: 'Cycles',
    equipment_tab: 'Equipment',
    infrastructures_tab: 'Infrastructure',
    started_on: 'Started on',
    progress_label: 'Progress',
    no_active_cycles: 'No active cycles',
    no_equipment_msg: 'No equipment',
    no_infrastructure_msg: 'No infrastructure',
    // Fish Management
    livestock_management: 'Livestock Management',
    fish_performance_tracking: 'Fish tracking and zootechnical performance',
    select_unit_livestock: 'Select a production unit to manage its livestock',
    hatchery_management: 'Livestock Management - Hatchery',
    breeders_fry_production: 'Breeders and fry production',
    fattening_management: 'Livestock Management - Fattening',
    growing_fish: 'Growing fish',
    transformation_stock: 'Stock Management - Transformation',
    fish_to_transform: 'Fish to transform',
    conservation_stock: 'Stock Management - Storage',
    products_in_storage: 'Products in storage',
    new_tracking: 'New tracking',
    juveniles_label: 'Juveniles',
    density_label: 'Density',
    overview_tab: 'Overview',
    control_fishing_tab: 'Control fishing',
    transformed_batches_tab: 'Transformed batches',
    details_tab: 'Details',
    history_tab: 'History',
    livestock_status: 'Livestock status',
    alerts_recommendations: 'Alerts and recommendations',
    optimal_fertility: 'Optimal fertility rate',
    spawning_in_days: 'Spawning expected in 5 days',
    growth_normal: 'Growth within normal range',
    monitor_density: 'Monitor density',
    transformed_batches_management: 'Transformed batches management',
    track_transformed_batches: 'Track and manage transformed fish batches by species and transformation type',
    batch_label: 'Batch',
    in_progress_status: 'In progress',
    initial_weight_label: 'Initial weight',
    transformed_weight_label: 'Transformed weight',
    date_label: 'Date',
    livestock_details: 'Livestock details',
    coming_soon_text: 'coming soon for unit',
    evolution_history: 'Evolution history',
    history_data_text: 'History data for unit',
    // Livestock Batches
    batch_tracking: 'Fish batch tracking and management per unit',
    all_units_filter: 'All units',
    add_batch_btn: 'Add batch',
    add_new_batch_title: 'Add new batch',
    register_new_batch: 'Register a new batch of fish in a unit',
    species_label: 'Species',
    variety_label: 'Variety',
    production_unit_label: 'Production unit',
    select_unit_placeholder: 'Select a unit',
    quantity_label: 'Quantity',
    number_of_individuals: 'Number of individuals',
    avg_weight_label: 'Average weight',
    weight_in_grams: 'Weight in grams',
    acquisition_date_label: 'Acquisition date',
    source_supplier_label: 'Source/Supplier',
    supplier_name_placeholder: 'Supplier name',
    feeding_plan_label: 'Feeding plan',
    standard_growth_option: 'Standard growth',
    intensive_option: 'Intensive',
    extensive_option: 'Extensive',
    finishing_option: 'Finishing',
    expected_harvest_date_label: 'Expected harvest date',
    notes_label: 'Notes',
    observations_placeholder: 'Observations, remarks...',
    error_title: 'Error',
    required_fields_error: 'Please fill in all required fields',
    batch_added_title: 'Batch added',
    batch_added_success_text: 'successfully added to',
    batch_deleted_title: 'Batch deleted',
    batch_deleted_success_text: 'The batch has been successfully deleted',
    total_individuals_stat: 'Total individuals',
    total_kg_stat: 'Total kg',
    healthy_batches_stat: 'Healthy batches',
    active_batches_stat: 'Active batches',
    fish_batches_title: 'Fish batches',
    batch_management_tracking: 'Management and tracking of all batches by production unit',
    healthy_status: 'Healthy',
    sick_status: 'Sick',
    quarantine_status: 'Quarantine',
    sold_status: 'Sold',
    age_label: 'Age',
    days_unit: 'days',
    source_label: 'Source',
    last_check_label: 'Last check',
    harvest_date_label: 'Harvest date',
    // Feeding Management
    feeding_management_title: 'Feeding Management',
    technical_nutritional_subtitle: 'Technical sheets and nutritional tracking',
    no_feeding_required_title: 'No feeding required',
    no_feeding_for_unit_text: 'does not require feeding management',
    hatchery_feeding_title: 'Feeding - Hatchery',
    specialized_food_subtitle: 'Specialized food for fry and breeders',
    fattening_feeding_title: 'Feeding - Fattening',
    growth_feeding_program: 'Feeding program for growth',
    feed_production_title: 'Feed Production',
    manufacturing_formulation: 'Manufacturing and formulation',
    quantity_per_day_stat: 'Quantity/day',
    meals_per_day_stat: 'Meals/day',
    last_meal_stat: 'Last meal',
    next_meal_stat: 'Next meal',
    planning_tab: 'Planning',
    feed_stock_tab: 'Feed stock',
    graphical_tracking_tab: 'Graphical tracking'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'XOF' | 'MAD'>('XOF'); // F CFA par défaut
  const [timezone, setTimezoneState] = useState<string>('');
  const [country, setCountryState] = useState<string>('');
  const [offlineMode, setOfflineModeState] = useState<boolean>(true);
  const [showOfflineIndicator, setShowOfflineIndicatorState] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Détecter automatiquement le fuseau horaire et le pays
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezoneState(detectedTimezone);
    
    // Détecter le pays basé sur le fuseau horaire
    const timezoneToCountry: { [key: string]: string } = {
      'Europe/Paris': 'France',
      'Europe/London': 'United Kingdom',
      'America/New_York': 'United States',
      'Africa/Abidjan': 'Côte d\'Ivoire',
      'Africa/Casablanca': 'Maroc',
      'Africa/Dakar': 'Sénégal',
      'Africa/Lagos': 'Nigeria',
      'Asia/Dubai': 'UAE',
      'Asia/Tokyo': 'Japan'
    };
    
    const detectedCountry = timezoneToCountry[detectedTimezone] || detectedTimezone.split('/')[1]?.replace(/_/g, ' ') || 'Unknown';
    setCountryState(detectedCountry);
  }, []);

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
      
      // Mettre F CFA par défaut si aucune devise n'est sauvegardée
      if (savedCurrency) {
        setCurrency(savedCurrency);
      } else {
        setCurrency('XOF'); // F CFA par défaut
        localStorage.setItem('app-currency', 'XOF');
      }
      
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

  const handleSetTimezone = (tz: string) => {
    setTimezoneState(tz);
  };

  const handleSetCountry = (c: string) => {
    setCountryState(c);
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
        timezone,
        country,
        offlineMode,
        showOfflineIndicator,
        setTheme: handleSetTheme,
        setLanguage: handleSetLanguage,
        setCurrency: handleSetCurrency,
        setTimezone: handleSetTimezone,
        setCountry: handleSetCountry,
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