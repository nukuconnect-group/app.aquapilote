import React, { useState } from 'react';
import { Settings, LogOut, UserCircle, Sun, Moon, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoginDialog from '@/components/LoginDialog';
import NotificationsPanel from '@/components/NotificationsPanel';
import SettingsManagement from '@/components/SettingsManagement';
import ProfileDialog from '@/components/ProfileDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
const Header = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();
  const {
    t,
    language,
    setLanguage,
    timezone,
    setTimezone
  } = useSettings();
  const {
    addLog
  } = useLogs();
  const {
    toast
  } = useToast();
  const { theme, setTheme } = useTheme();
  const handleLogin = () => {
    if (!isAuthenticated) {
      setIsRegistering(false);
      setShowLogin(true);
    }
  };
  const handleLogout = () => {
    addLog(t('logout'), 'Authentification', `${user?.name} ${language === 'fr' ? 's\'est déconnecté' : 'logged out'}`, 'info');
    logout();
    toast({
      title: language === 'fr' ? "Déconnexion réussie" : "Logout successful",
      description: language === 'fr' ? "Vous avez été déconnecté avec succès" : "You have been logged out successfully"
    });
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return <>
      <header className="bg-emerald-800 h-12 lg:h-14 w-full shadow-md m-0 p-0">
        <div className="flex justify-between items-center h-full w-full px-2 sm:px-4 lg:px-6 m-0">
          {/* Logo et titre à gauche */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-primary-foreground text-sm sm:text-base lg:text-lg tracking-wide font-semibold truncate">
                {t('app_title')}
              </h1>
              <p className="text-primary-foreground/80 text-[10px] sm:text-xs leading-tight hidden sm:block truncate">
                {t('app_subtitle')}
              </p>
            </div>
          </div>

          {/* Navigation actions à droite */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0 ml-2">{/* Notifications */}
            <NotificationsPanel />
            
            {/* Langue */}
            <Select value={language} onValueChange={(value) => setLanguage(value as 'fr' | 'en')}>
              <SelectTrigger className="w-[60px] sm:w-[70px] lg:w-[80px] h-7 sm:h-8 lg:h-9 text-primary-foreground border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10 text-xs sm:text-sm">
                <SelectValue>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="uppercase hidden sm:inline">{language}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>

            {/* Paramètres */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-primary-foreground/20 h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-0"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            
            {/* Profil utilisateur */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 rounded-full p-0">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mobile-dropdown bg-background z-50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer touch-action-none" onClick={() => setShowProfile(true)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer touch-action-none" onClick={() => setShowSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer touch-action-none text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/20 h-7 sm:h-8 lg:h-9 px-2 sm:px-3 lg:px-4 text-xs sm:text-sm"
                onClick={handleLogin}
              >
                <User className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Connexion' : 'Login'}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Settings Sidebar */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-full sm:w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{language === 'fr' ? 'Paramètres & Profil' : 'Settings & Profile'}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Profil utilisateur */}
            {isAuthenticated && user && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">{language === 'fr' ? 'Profil' : 'Profile'}</h3>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {user.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.role && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Localisation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">{language === 'fr' ? 'Localisation' : 'Location'}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{language === 'fr' ? 'Pays' : 'Country'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{timezone.split('/')[1]?.replace('_', ' ') || 'Auto'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{language === 'fr' ? 'Fuseau horaire' : 'Timezone'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{timezone || 'Auto'}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Langue */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">{language === 'fr' ? 'Préférences' : 'Preferences'}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language-select" className="text-sm">
                    {language === 'fr' ? 'Langue' : 'Language'}
                  </Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as 'fr' | 'en')}>
                    <SelectTrigger id="language-select" className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-select" className="text-sm">
                    {language === 'fr' ? 'Thème' : 'Theme'}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="w-20"
                    >
                      <Sun className="w-4 h-4 mr-1" />
                      {language === 'fr' ? 'Clair' : 'Light'}
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="w-20"
                    >
                      <Moon className="w-4 h-4 mr-1" />
                      {language === 'fr' ? 'Sombre' : 'Dark'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">{language === 'fr' ? 'Notifications' : 'Notifications'}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="email-notif" className="text-sm cursor-pointer">
                    {language === 'fr' ? 'Notifications email' : 'Email notifications'}
                  </Label>
                  <Switch id="email-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="push-notif" className="text-sm cursor-pointer">
                    {language === 'fr' ? 'Notifications push' : 'Push notifications'}
                  </Label>
                  <Switch id="push-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Label htmlFor="alerts-notif" className="text-sm cursor-pointer">
                    {language === 'fr' ? 'Alertes système' : 'System alerts'}
                  </Label>
                  <Switch id="alerts-notif" defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setShowSettings(false);
                  onNavigate?.('settings');
                }}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Voir tous les paramètres' : 'View all settings'}
              </Button>
              
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    setShowSettings(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === 'fr' ? 'Déconnexion' : 'Logout'}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>


      {/* Profile Dialog */}
      <ProfileDialog 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Login Dialog */}
      <LoginDialog 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        isRegistering={isRegistering}
        onToggleMode={() => setIsRegistering(!isRegistering)}
      />
    </>;
};

export default Header;