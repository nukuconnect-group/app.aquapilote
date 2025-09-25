import React, { useState } from 'react';
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

const SettingsManagement = () => {
  const { theme, language, currency, setTheme, setLanguage, setCurrency, t } = useSettings();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    alerts: true
  });
  const [userProfile, setUserProfile] = useState({
    nom: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    telephone: '+33 6 12 34 56 78',
    entreprise: 'Aquaculture Pro',
    adresse: '123 Rue de la Pisciculture, 75001 Paris'
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-aqua-500 to-ocean-500 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('settings')}</h2>
            <p className="text-aqua-100 text-sm sm:text-base">
              {language === 'fr' ? 'Configuration et préférences du système' : 'System configuration and preferences'}
            </p>
          </div>
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-aqua-100" />
        </div>
      </div>

      {/* Tabs responsives */}
      <Tabs defaultValue="profile" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 min-w-[600px] sm:min-w-0">
            <TabsTrigger value="profile" className="text-xs px-2">Profil</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-2">Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs px-2">Apparence</TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-2">Sécurité</TabsTrigger>
            <TabsTrigger value="system" className="text-xs px-2">Système</TabsTrigger>
            <TabsTrigger value="backup" className="text-xs px-2">Sauvegarde</TabsTrigger>
          </TabsList>
        </div>

        {/* Profil utilisateur */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="w-5 h-5 text-aqua-600" />
                {t('profile') || 'Informations personnelles'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input 
                    id="nom" 
                    value={userProfile.nom} 
                    onChange={e => setUserProfile({...userProfile, nom: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={userProfile.email} 
                    onChange={e => setUserProfile({...userProfile, email: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input 
                    id="telephone" 
                    value={userProfile.telephone} 
                    onChange={e => setUserProfile({...userProfile, telephone: e.target.value})} 
                  />
                </div>
                <div>
                  <Label htmlFor="entreprise">Entreprise</Label>
                  <Input 
                    id="entreprise" 
                    value={userProfile.entreprise} 
                    onChange={e => setUserProfile({...userProfile, entreprise: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input 
                  id="adresse" 
                  value={userProfile.adresse} 
                  onChange={e => setUserProfile({...userProfile, adresse: e.target.value})} 
                />
              </div>
              <Button className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
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
                Préférences de notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifications par email</Label>
                    <p className="text-sm text-gray-600">Recevoir les alertes par email</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={checked => setNotifications({...notifications, email: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifications push</Label>
                    <p className="text-sm text-gray-600">Notifications sur votre appareil</p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={checked => setNotifications({...notifications, push: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">SMS d'urgence</Label>
                    <p className="text-sm text-gray-600">SMS pour les alertes critiques</p>
                  </div>
                  <Switch 
                    checked={notifications.sms} 
                    onCheckedChange={checked => setNotifications({...notifications, sms: checked})} 
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Alertes système</Label>
                    <p className="text-sm text-gray-600">Notifications pour les événements système</p>
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
                Thème et apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Mode d'affichage</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      theme === 'light' ? 'border-aqua-500 bg-aqua-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-aqua-600" />
                    <span className="text-sm font-medium">Clair</span>
                  </button>
                  <button 
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'border-aqua-500 bg-aqua-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Sombre</span>
                  </button>
                  <button 
                    className={`p-3 border-2 rounded-lg transition-colors ${
                      theme === 'auto' ? 'border-aqua-500 bg-aqua-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTheme('auto')}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">Auto</span>
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
