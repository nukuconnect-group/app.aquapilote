// Types pour le système i18n
export type SupportedLanguage = 'fr' | 'en' | 'es' | 'pt' | 'ar' | 'ewe' | 'kabye' | 'adja' | 'wolof' | 'bambara';

export interface TranslationKeys {
  // Navigation
  dashboard: string;
  'iot-control': string;
  units: string;
  infrastructures: string;
  fish: string;
  livestock: string;
  feeding: string;
  health: string;
  transformation: string;
  production: string;
  accounting: string;
  purchases: string;
  sales: string;
  suppliers: string;
  hr: string;
  planning: string;
  weather: string;
  team: string;
  reports: string;
  settings: string;
  admin: string;
  analytics: string;
  performance_alerts: string;
  reproduction: string;
  economics: string;
  
  // Header
  app_title: string;
  app_subtitle: string;
  system_settings: string;
  notifications: string;
  profile: string;
  logout: string;
  login: string;
  logout_success: string;
  logout_success_desc: string;
  settings_profile: string;
  
  // Settings
  appearance: string;
  language: string;
  currency: string;
  theme_light: string;
  theme_dark: string;
  theme_auto: string;
  theme: string;
  preferences: string;
  localization: string;
  country: string;
  timezone_label: string;
  view_all_settings: string;
  
  // Profile
  personal_info: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  
  // Notifications
  notification_preferences: string;
  email_notifications: string;
  receive_email_alerts: string;
  push_notifications: string;
  device_notifications: string;
  sms_emergency: string;
  sms_critical_alerts: string;
  system_alerts: string;
  system_events_notifications: string;
  
  // Common UI Elements
  save: string;
  save_changes: string;
  cancel: string;
  edit: string;
  delete: string;
  add: string;
  close: string;
  yes: string;
  no: string;
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  download: string;
  upload: string;
  confirm: string;
  back: string;
  next: string;
  previous: string;
  create: string;
  update: string;
  view: string;
  details: string;
  all: string;
  none: string;
  select: string;
  required: string;
  optional: string;
  actions: string;
  print: string;
  refresh: string;
  apply: string;
  reset: string;
  submit: string;
  
  // Dashboard
  welcome: string;
  overview: string;
  statistics: string;
  recent_activity: string;
  quick_actions: string;
  today: string;
  this_week: string;
  this_month: string;
  
  // Production
  total_production: string;
  daily_production: string;
  monthly_production: string;
  annual_production: string;
  production_units: string;
  active_ponds: string;
  total_fish: string;
  average_weight: string;
  production_cycle: string;
  
  // Health
  health_status: string;
  mortality_rate: string;
  vaccinations: string;
  treatments: string;
  quarantine: string;
  
  // Feeding
  daily_feeding: string;
  feed_consumption: string;
  feed_conversion_ratio: string;
  feeding_schedule: string;
  
  // Environmental
  water_quality: string;
  temperature: string;
  oxygen_level: string;
  ph_level: string;
  salinity: string;
  
  // Finance
  revenue: string;
  expenses: string;
  netProfit: string;
  profitMargin: string;
  profit: string;
  total: string;
  amount: string;
  
  // Status
  status: string;
  active: string;
  inactive: string;
  pending: string;
  completed: string;
  cancelled: string;
  in_progress: string;
  
  // Connection
  network_connected: string;
  network_disconnected: string;
  database_connected: string;
  database_error: string;
  database_connecting: string;
  last_sync: string;
  online: string;
  offline: string;
  
  // Alerts
  critical: string;
  stable: string;
  acknowledged: string;
  unacknowledged: string;
  high_mortality: string;
  high_fcr: string;
  low_oxygen: string;
  temperature_warning: string;
  ph_warning: string;
  stock_low: string;
  production_behind: string;
  
  // Generic placeholders
  [key: string]: string;
}

export type Translations = Record<SupportedLanguage, TranslationKeys>;
