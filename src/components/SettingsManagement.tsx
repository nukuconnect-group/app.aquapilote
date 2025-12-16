import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, User, Bell, Palette, Shield, Database, Download, Upload, Save, Eye, EyeOff, 
  Smartphone, Mail, Lock, Globe, Moon, Sun, HelpCircle, Trash2, RefreshCw, 
  FileText, Zap, Volume2, VolumeX, Clock, MapPin, CreditCard, Link2, LogOut,
  AlertTriangle, Check, X, Vibrate, Languages, Monitor, Accessibility, Wifi, WifiOff
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SettingsManagement = () => {
  const { 
    theme, language, currency, offlineMode, showOfflineIndicator, timezone, country,
    setTheme, setLanguage, setCurrency, setOfflineMode, setShowOfflineIndicator, setTimezone, setCountry, t 
  } = useSettings();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    alerts: true,
    sound: true,
    vibration: true,
    criticalOnly: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  });
  
  const [accessibility, setAccessibility] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false
  });
  
  const [privacy, setPrivacy] = useState({
    shareUsageData: false,
    showOnlineStatus: true,
    allowAnalytics: false
  });
  
  const [userProfile, setUserProfile] = useState({
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    adresse: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Charger les données du vrai utilisateur connecté
  useEffect(() => {
    if (user) {
      setUserProfile({
        nom: user.name || '',
        email: user.email || '',
        telephone: '',
        entreprise: user.entreprise || '',
        adresse: '',
        bio: ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userProfile.nom,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: language === 'fr' ? 'Profil mis à jour' : 'Profile updated',
        description: language === 'fr' ? 'Vos informations ont été sauvegardées' : 'Your information has been saved'
      });
    } catch (error) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible de sauvegarder le profil' : 'Could not save profile',
        variant: 'destructive'
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }
    
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'fr' ? 'Mot de passe modifié' : 'Password changed',
        description: language === 'fr' ? 'Votre mot de passe a été mis à jour' : 'Your password has been updated'
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    toast({
      title: language === 'fr' ? 'Export en cours' : 'Export in progress',
      description: language === 'fr' ? 'Vos données sont en cours de préparation...' : 'Your data is being prepared...'
    });
    // TODO: Implement actual data export
  };

  const handleDeleteAccount = () => {
    toast({
      title: language === 'fr' ? 'Suppression de compte' : 'Account deletion',
      description: language === 'fr' ? 'Contactez le support pour supprimer votre compte' : 'Contact support to delete your account',
      variant: 'destructive'
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const timezones = [
    { value: 'Africa/Lome', label: 'Africa/Lomé (UTC+0)' },
    { value: 'Africa/Abidjan', label: 'Africa/Abidjan (UTC+0)' },
    { value: 'Africa/Dakar', label: 'Africa/Dakar (UTC+0)' },
    { value: 'Africa/Lagos', label: 'Africa/Lagos (UTC+1)' },
    { value: 'Africa/Casablanca', label: 'Africa/Casablanca (UTC+1)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
    { value: 'UTC', label: 'UTC (UTC+0)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' }
  ];

  const countries = [
    { value: 'TG', label: '🇹🇬 Togo' },
    { value: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
    { value: 'SN', label: '🇸🇳 Sénégal' },
    { value: 'BJ', label: '🇧🇯 Bénin' },
    { value: 'GH', label: '🇬🇭 Ghana' },
    { value: 'NG', label: '🇳🇬 Nigeria' },
    { value: 'CM', label: '🇨🇲 Cameroun' },
    { value: 'MA', label: '🇲🇦 Maroc' },
    { value: 'FR', label: '🇫🇷 France' },
    { value: 'US', label: '🇺🇸 États-Unis' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-aqua-500 to-ocean-500 p-4 sm:p-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{t('settings')}</h2>
            <p className="text-aqua-100 text-xs sm:text-sm md:text-base">
              {language === 'fr' ? 'Configuration et préférences du système' : 'System configuration and preferences'}
            </p>
          </div>
          <Settings className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-aqua-100 shrink-0" />
        </div>
      </div>

      {/* Tabs responsives */}
      <Tabs defaultValue="profile" className="space-y-4 w-full">
        <div className="overflow-x-auto -mx-4 sm:-mx-0 px-4 sm:px-0">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 gap-1 min-w-max sm:min-w-0">
            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <User className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('notifications')}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('appearance')}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Sécurité' : 'Security'}</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Accessibility className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Accessibilité' : 'Accessibility'}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Confidentialité' : 'Privacy'}</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Database className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Système' : 'System'}</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('backup_restore')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Profil utilisateur */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="w-5 h-5 text-aqua-600" />
                {t('personal_info')}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Gérez vos informations personnelles' : 'Manage your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <Label htmlFor="nom" className="text-xs sm:text-sm">{t('full_name')}</Label>
                  <Input 
                    id="nom" 
                    value={userProfile.nom} 
                    onChange={e => setUserProfile({...userProfile, nom: e.target.value})}
                    className="mt-1 h-9 sm:h-10 text-sm"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="email" className="text-xs sm:text-sm">{t('email')}</Label>
                  <Input 
                    id="email" 
                    type="email"
                    className="mt-1 h-9 sm:h-10 text-sm bg-muted"
                    value={userProfile.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'fr' ? 'L\'email ne peut pas être modifié' : 'Email cannot be changed'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="telephone">{t('phone')}</Label>
                  <Input 
                    id="telephone" 
                    value={userProfile.telephone} 
                    onChange={e => setUserProfile({...userProfile, telephone: e.target.value})}
                    placeholder="+228 XX XX XX XX"
                  />
                </div>
                <div>
                  <Label htmlFor="entreprise">{t('company')}</Label>
                  <Input 
                    id="entreprise" 
                    value={userProfile.entreprise} 
                    onChange={e => setUserProfile({...userProfile, entreprise: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="adresse">{t('address')}</Label>
                <Input 
                  id="adresse" 
                  value={userProfile.adresse} 
                  onChange={e => setUserProfile({...userProfile, adresse: e.target.value})} 
                />
              </div>
              <div>
                <Label htmlFor="bio">{language === 'fr' ? 'Biographie' : 'Biography'}</Label>
                <Textarea 
                  id="bio" 
                  value={userProfile.bio} 
                  onChange={e => setUserProfile({...userProfile, bio: e.target.value})}
                  placeholder={language === 'fr' ? 'Parlez-nous de vous...' : 'Tell us about yourself...'}
                  rows={3}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveProfile} className="flex-1 sm:flex-none">
                  <Save className="w-4 h-4 mr-2" />
                  {t('save_changes')}
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="flex-1 sm:flex-none">
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Déconnexion' : 'Logout'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Bell className="w-5 h-5 text-aqua-600" />
                {t('notification_preferences')}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Configurez comment vous souhaitez être notifié' : 'Configure how you want to be notified'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('email_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('receive_email_alerts')}</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={checked => setNotifications({...notifications, email: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('push_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('device_notifications')}</p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={checked => setNotifications({...notifications, push: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('sms_emergency')}</Label>
                    <p className="text-sm text-muted-foreground">{t('sms_critical_alerts')}</p>
                  </div>
                  <Switch 
                    checked={notifications.sms} 
                    onCheckedChange={checked => setNotifications({...notifications, sms: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base font-medium">{language === 'fr' ? 'Son des notifications' : 'Notification sound'}</Label>
                      <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Jouer un son pour les alertes' : 'Play sound for alerts'}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.sound} 
                    onCheckedChange={checked => setNotifications({...notifications, sound: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label className="text-base font-medium">{language === 'fr' ? 'Vibration' : 'Vibration'}</Label>
                      <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Vibrer pour les notifications' : 'Vibrate for notifications'}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.vibration} 
                    onCheckedChange={checked => setNotifications({...notifications, vibration: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <Label className="text-base font-medium">{language === 'fr' ? 'Alertes critiques uniquement' : 'Critical alerts only'}</Label>
                      <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Ne recevoir que les alertes importantes' : 'Only receive important alerts'}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.criticalOnly} 
                    onCheckedChange={checked => setNotifications({...notifications, criticalOnly: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label className="text-base font-medium">{language === 'fr' ? 'Heures calmes' : 'Quiet hours'}</Label>
                        <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Désactiver les notifications pendant certaines heures' : 'Disable notifications during certain hours'}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.quietHoursEnabled} 
                      onCheckedChange={checked => setNotifications({...notifications, quietHoursEnabled: checked})} 
                    />
                  </div>
                  {notifications.quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4 ml-8">
                      <div>
                        <Label className="text-sm">{language === 'fr' ? 'Début' : 'Start'}</Label>
                        <Input 
                          type="time" 
                          value={notifications.quietHoursStart}
                          onChange={e => setNotifications({...notifications, quietHoursStart: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'fr' ? 'Fin' : 'End'}</Label>
                        <Input 
                          type="time" 
                          value={notifications.quietHoursEnd}
                          onChange={e => setNotifications({...notifications, quietHoursEnd: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apparence */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Palette className="w-5 h-5 text-aqua-600" />
                {t('theme_appearance')}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Personnalisez l\'apparence de l\'application' : 'Customize the app appearance'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">{t('display_mode')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    className={`p-4 border-2 rounded-lg transition-all ${
                      theme === 'light' ? 'border-aqua-500 bg-aqua-50 shadow-md' : 'border-border hover:border-aqua-300'
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-8 h-8 mx-auto mb-2 text-aqua-600" />
                    <span className="text-sm font-medium block">{t('light')}</span>
                    <span className="text-xs text-muted-foreground">{language === 'fr' ? 'Mode clair' : 'Light mode'}</span>
                  </button>
                  <button 
                    className={`p-4 border-2 rounded-lg transition-all ${
                      theme === 'dark' ? 'border-aqua-500 bg-aqua-50 shadow-md' : 'border-border hover:border-aqua-300'
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium block">{t('dark')}</span>
                    <span className="text-xs text-muted-foreground">{language === 'fr' ? 'Mode sombre' : 'Dark mode'}</span>
                  </button>
                  <button 
                    className={`p-4 border-2 rounded-lg transition-all ${
                      theme === 'auto' ? 'border-aqua-500 bg-aqua-50 shadow-md' : 'border-border hover:border-aqua-300'
                    }`}
                    onClick={() => setTheme('auto')}
                  >
                    <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium block">{t('auto')}</span>
                    <span className="text-xs text-muted-foreground">{language === 'fr' ? 'Selon le système' : 'System default'}</span>
                  </button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t('language')}
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t('currency')}
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">F CFA (XOF)</SelectItem>
                    <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                    <SelectItem value="USD">$ Dollar US (USD)</SelectItem>
                    <SelectItem value="MAD">Dirham (MAD)</SelectItem>
                    <SelectItem value="GHS">Cedi (GHS)</SelectItem>
                    <SelectItem value="NGN">Naira (NGN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {language === 'fr' ? 'Pays' : 'Country'}
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {language === 'fr' ? 'Fuseau horaire' : 'Timezone'}
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Shield className="w-5 h-5 text-aqua-600" />
                {language === 'fr' ? 'Sécurité du compte' : 'Account security'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Gérez la sécurité de votre compte' : 'Manage your account security'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">{language === 'fr' ? 'Changer le mot de passe' : 'Change password'}</h4>
                
                <div>
                  <Label htmlFor="current-password">{language === 'fr' ? 'Mot de passe actuel' : 'Current password'}</Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder={language === 'fr' ? 'Entrez votre mot de passe actuel' : 'Enter your current password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-password">{language === 'fr' ? 'Nouveau mot de passe' : 'New password'}</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder={language === 'fr' ? 'Entrez un nouveau mot de passe' : 'Enter a new password'}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'fr' ? 'Minimum 6 caractères' : 'Minimum 6 characters'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">{language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder={language === 'fr' ? 'Confirmez le nouveau mot de passe' : 'Confirm the new password'}
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleChangePassword} disabled={passwordLoading} className="w-full sm:w-auto">
                  <Lock className="w-4 h-4 mr-2" />
                  {passwordLoading 
                    ? (language === 'fr' ? 'Modification...' : 'Changing...') 
                    : (language === 'fr' ? 'Changer le mot de passe' : 'Change password')}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">{language === 'fr' ? 'Sessions actives' : 'Active sessions'}</h4>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-medium text-green-800">{language === 'fr' ? 'Session actuelle' : 'Current session'}</p>
                    <p className="text-sm text-green-600">{language === 'fr' ? 'Ce navigateur' : 'This browser'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibilité */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Accessibility className="w-5 h-5 text-aqua-600" />
                {language === 'fr' ? 'Options d\'accessibilité' : 'Accessibility options'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Adaptez l\'application à vos besoins' : 'Adapt the app to your needs'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Réduire les animations' : 'Reduce motion'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Désactiver les animations et transitions' : 'Disable animations and transitions'}</p>
                  </div>
                  <Switch 
                    checked={accessibility.reducedMotion} 
                    onCheckedChange={checked => setAccessibility({...accessibility, reducedMotion: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Contraste élevé' : 'High contrast'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Augmenter le contraste des couleurs' : 'Increase color contrast'}</p>
                  </div>
                  <Switch 
                    checked={accessibility.highContrast} 
                    onCheckedChange={checked => setAccessibility({...accessibility, highContrast: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Texte agrandi' : 'Large text'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Augmenter la taille du texte' : 'Increase text size'}</p>
                  </div>
                  <Switch 
                    checked={accessibility.largeText} 
                    onCheckedChange={checked => setAccessibility({...accessibility, largeText: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Optimisé lecteur d\'écran' : 'Screen reader optimized'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Améliorer la compatibilité avec les lecteurs d\'écran' : 'Improve screen reader compatibility'}</p>
                  </div>
                  <Switch 
                    checked={accessibility.screenReaderOptimized} 
                    onCheckedChange={checked => setAccessibility({...accessibility, screenReaderOptimized: checked})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidentialité */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Lock className="w-5 h-5 text-aqua-600" />
                {language === 'fr' ? 'Confidentialité des données' : 'Data privacy'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Contrôlez comment vos données sont utilisées' : 'Control how your data is used'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Partager les données d\'utilisation' : 'Share usage data'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Nous aider à améliorer l\'application' : 'Help us improve the app'}</p>
                  </div>
                  <Switch 
                    checked={privacy.shareUsageData} 
                    onCheckedChange={checked => setPrivacy({...privacy, shareUsageData: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Afficher mon statut en ligne' : 'Show online status'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Les autres peuvent voir quand vous êtes connecté' : 'Others can see when you are online'}</p>
                  </div>
                  <Switch 
                    checked={privacy.showOnlineStatus} 
                    onCheckedChange={checked => setPrivacy({...privacy, showOnlineStatus: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Autoriser les analytics' : 'Allow analytics'}</Label>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Collecter des statistiques anonymes' : 'Collect anonymous statistics'}</p>
                  </div>
                  <Switch 
                    checked={privacy.allowAnalytics} 
                    onCheckedChange={checked => setPrivacy({...privacy, allowAnalytics: checked})} 
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {language === 'fr' ? 'Zone dangereuse' : 'Danger zone'}
                </h4>
                <div className="p-4 border border-destructive/50 rounded-lg space-y-3">
                  <div>
                    <p className="font-medium">{language === 'fr' ? 'Exporter mes données' : 'Export my data'}</p>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Télécharger toutes vos données au format JSON' : 'Download all your data in JSON format'}</p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Exporter' : 'Export'}
                  </Button>
                </div>
                <div className="p-4 border border-destructive rounded-lg space-y-3 bg-destructive/5">
                  <div>
                    <p className="font-medium text-destructive">{language === 'fr' ? 'Supprimer mon compte' : 'Delete my account'}</p>
                    <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Cette action est irréversible' : 'This action is irreversible'}</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Supprimer le compte' : 'Delete account'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Système */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Database className="w-5 h-5 text-aqua-600" />
                {language === 'fr' ? 'Configuration système' : 'System configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  {language === 'fr' ? 'Mode hors ligne et stockage local' : 'Offline mode and local storage'}
                </h4>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Mode hors ligne' : 'Offline mode'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'fr' ? 'Permet à l\'application de fonctionner sans connexion internet' : 'Allows the app to work without internet'}
                    </p>
                  </div>
                  <Switch 
                    checked={offlineMode} 
                    onCheckedChange={setOfflineMode}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">{language === 'fr' ? 'Afficher l\'indicateur de synchronisation' : 'Show sync indicator'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'fr' ? 'Affiche le nombre d\'actions en attente de synchronisation' : 'Shows pending sync actions count'}
                    </p>
                  </div>
                  <Switch 
                    checked={showOfflineIndicator} 
                    onCheckedChange={setShowOfflineIndicator}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 {language === 'fr' ? 'Astuce' : 'Tip'}:</strong> {language === 'fr' 
                      ? 'L\'application fonctionne automatiquement hors ligne. Vos données sont sauvegardées localement et synchronisées automatiquement dès que la connexion est rétablie.'
                      : 'The app works automatically offline. Your data is saved locally and synced automatically when connection is restored.'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">{language === 'fr' ? 'Informations système' : 'System information'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">v2.1.3</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">{language === 'fr' ? 'Dernière MAJ' : 'Last update'}:</span>
                    <span className="font-medium">15 {language === 'fr' ? 'juin' : 'June'} 2024</span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">PWA:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      {language === 'fr' ? 'Compatible iOS/Android' : 'iOS/Android compatible'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">{language === 'fr' ? 'Stockage' : 'Storage'}:</span>
                    <span className="font-medium">IndexedDB</span>
                  </div>
                  <div className="md:col-span-2 flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">{language === 'fr' ? 'Développeur' : 'Developer'}:</span>
                    <span className="font-medium">Startup AFRICA HORIZON AQUATIC</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">{language === 'fr' ? 'Cache et stockage' : 'Cache and storage'}</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Vider le cache' : 'Clear cache'}
                  </Button>
                  <Button variant="outline">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'fr' ? 'Effacer les données locales' : 'Clear local data'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sauvegarde */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Download className="w-5 h-5 text-aqua-600" />
                {language === 'fr' ? 'Sauvegarde et restauration' : 'Backup and restore'}
              </CardTitle>
              <CardDescription>
                {language === 'fr' ? 'Gérez vos sauvegardes de données' : 'Manage your data backups'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">{language === 'fr' ? 'Sauvegarde automatique' : 'Automatic backup'}</h4>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Sauvegarde quotidienne à 02:00' : 'Daily backup at 02:00'}</p>
                      <p className="text-sm text-muted-foreground">{language === 'fr' ? 'Dernière sauvegarde: Aujourd\'hui à 02:00' : 'Last backup: Today at 02:00'}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">{language === 'fr' ? 'Actions manuelles' : 'Manual actions'}</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 sm:flex-none">
                      <Download className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Créer une sauvegarde' : 'Create backup'}
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Restaurer' : 'Restore'}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">{language === 'fr' ? 'Historique des sauvegardes' : 'Backup history'}</h4>
                  <div className="space-y-2">
                    {[
                      { date: '16 Déc 2024, 02:00', size: '2.4 MB', type: 'auto' },
                      { date: '15 Déc 2024, 02:00', size: '2.3 MB', type: 'auto' },
                      { date: '14 Déc 2024, 14:30', size: '2.3 MB', type: 'manual' }
                    ].map((backup, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{backup.date}</p>
                            <p className="text-xs text-muted-foreground">{backup.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={backup.type === 'auto' ? 'secondary' : 'default'}>
                            {backup.type === 'auto' ? (language === 'fr' ? 'Auto' : 'Auto') : (language === 'fr' ? 'Manuel' : 'Manual')}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManagement;
