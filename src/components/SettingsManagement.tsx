import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Bell, Palette, Shield, Database, Download, Upload, Save, Eye, EyeOff, Smartphone, Mail, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

const SettingsManagement = () => {
  const { 
    theme, language, currency, offlineMode, showOfflineIndicator,
    setTheme, setLanguage, setCurrency, setOfflineMode, setShowOfflineIndicator, t 
  } = useSettings();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    alerts: true
  });
  const [userProfile, setUserProfile] = useState({
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    adresse: ''
  });

  // Charger les données du vrai utilisateur connecté
  useEffect(() => {
    if (user) {
      setUserProfile({
        nom: user.name || '',
        email: user.email || '',
        telephone: '', // Propriété non définie dans le type User actuel
        entreprise: user.entreprise || '',
        adresse: '' // Propriété non définie dans le type User actuel
      });
    }
  }, [user]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* En-tête - Pleine largeur sur mobile */}
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1 min-w-max sm:min-w-0">
            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              {t('profile')}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              {t('notifications')}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              {t('appearance')}
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              {language === 'fr' ? 'Sécurité' : 'Security'}
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              {language === 'fr' ? 'Système' : 'System'}
            </TabsTrigger>
            <TabsTrigger value="backup" className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap">
              {t('backup_restore')}
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
                    className="mt-1 h-9 sm:h-10 text-sm"
                    value={userProfile.email} 
                    onChange={e => setUserProfile({...userProfile, email: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="telephone">{t('phone')}</Label>
                  <Input 
                    id="telephone" 
                    value={userProfile.telephone} 
                    onChange={e => setUserProfile({...userProfile, telephone: e.target.value})} 
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
              <Button className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {t('save_changes')}
              </Button>
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
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('email_notifications')}</Label>
                    <p className="text-sm text-gray-600">{t('receive_email_alerts')}</p>
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
                    <p className="text-sm text-gray-600">{t('device_notifications')}</p>
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
                    <p className="text-sm text-gray-600">{t('sms_critical_alerts')}</p>
                  </div>
                  <Switch 
                    checked={notifications.sms} 
                    onCheckedChange={checked => setNotifications({...notifications, sms: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('system_alerts')}</Label>
                    <p className="text-sm text-gray-600">{t('system_events_notifications')}</p>
                  </div>
                  <Switch 
                    checked={notifications.alerts} 
                    onCheckedChange={checked => setNotifications({...notifications, alerts: checked})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apparence - Maintenant fonctionnelle */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Palette className="w-5 h-5 text-aqua-600" />
                {t('theme_appearance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">{t('display_mode')}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      theme === 'light' ? 'border-aqua-500 bg-aqua-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-aqua-600" />
                    <span className="text-sm font-medium">{t('light')}</span>
                  </button>
                  <button 
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'border-aqua-500 bg-aqua-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">{t('dark')}</span>
                  </button>
                  <button 
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      theme === 'auto' ? 'border-aqua-500 bg-aqua-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTheme('auto')}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">{t('auto')}</span>
                  </button>
                </div>
              </div>
              
              <Separator />
              
                  <div>
                    <Label className="text-base font-medium mb-3 block">{t('language')}</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full sm:w-48">
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
                    <Label className="text-base font-medium mb-3 block">{t('currency')}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">F CFA (XOF)</SelectItem>
                        <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                        <SelectItem value="USD">$ Dollar US (USD)</SelectItem>
                        <SelectItem value="MAD">Dirham (MAD)</SelectItem>
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
                Sécurité et confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Entrez votre mot de passe actuel" 
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
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input id="new-password" type="password" placeholder="Entrez un nouveau mot de passe" />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirmez le nouveau mot de passe" />
                </div>
                
                <Button className="w-full sm:w-auto">
                  <Lock className="w-4 h-4 mr-2" />
                  Changer le mot de passe
                </Button>
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
                Configuration système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Mode hors ligne et stockage local</h4>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Mode hors ligne</Label>
                    <p className="text-sm text-gray-600">
                      Permet à l'application de fonctionner sans connexion internet
                    </p>
                  </div>
                  <Switch 
                    checked={offlineMode} 
                    onCheckedChange={setOfflineMode}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Afficher l'indicateur de synchronisation</Label>
                    <p className="text-sm text-gray-600">
                      Affiche le nombre d'actions en attente de synchronisation
                    </p>
                  </div>
                  <Switch 
                    checked={showOfflineIndicator} 
                    onCheckedChange={setShowOfflineIndicator}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Astuce :</strong> L'application fonctionne automatiquement hors ligne. 
                    Vos données sont sauvegardées localement et synchronisées automatiquement 
                    dès que la connexion est rétablie.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Fuseau horaire</Label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="UTC">UTC (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                  </select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Informations système</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-medium">v2.1.3</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dernière MAJ:</span>
                    <span className="ml-2 font-medium">15 juin 2024</span>
                  </div>
                  <div>
                    <span className="text-gray-600">PWA:</span>
                    <span className="ml-2 font-medium">✓ Compatible iOS/Android</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stockage:</span>
                    <span className="ml-2 font-medium">IndexedDB</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Développeur:</span>
                    <span className="ml-2 font-medium">Startup AFRICA HORIZON AQUATIC</span>
                  </div>
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
                Sauvegarde et restauration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Sauvegarde automatique</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sauvegarde quotidienne à 02:00</p>
                      <p className="text-sm text-gray-600">Dernière sauvegarde: Aujourd'hui à 02:00</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Actions manuelles</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 sm:flex-none">
                      <Download className="w-4 h-4 mr-2" />
                      Créer une sauvegarde
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Upload className="w-4 h-4 mr-2" />
                      Restaurer
                    </Button>
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
