import React, { useState } from 'react';
import { Settings, LogOut, UserCircle, Sun, Moon, User, Globe, PanelLeft, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoginDialog from '@/components/LoginDialog';
import NotificationsPanel from '@/components/NotificationsPanel';
import ProfileDialog from '@/components/ProfileDialog';
import { ConnectionStatusIndicator } from '@/components/ConnectionStatusIndicator';
import TaskAlertIndicator from '@/components/TaskAlertIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
import { supportedLanguages, type SupportedLanguage } from '@/i18n';

const Header = ({ onNavigate, onOpenMobileMenu }: { onNavigate?: (tab: string) => void; onOpenMobileMenu?: () => void }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();
  const {
    t,
    language,
    setLanguage,
    timezone
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
    addLog(t('logout'), 'Authentification', `${user?.name} ${t('logout_success_desc')}`, 'info');
    logout();
    toast({
      title: t('logout_success'),
      description: t('logout_success_desc')
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const currentLang = supportedLanguages.find(l => l.code === language);

  const broadcastSearch = (q: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:search', { detail: q }));
    }
  };

  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    broadcastSearch(v);
  };

  return <>
    <header className="bg-sidebar md:bg-emerald-800 h-12 lg:h-14 w-full max-w-none shadow-md m-0 p-0 border-0">
      <div className="flex justify-between items-center h-full w-full pl-0 pr-0 sm:px-4 lg:px-6 m-0">
        {/* Logo et titre à gauche */}
        <div className="flex items-center space-x-1 sm:space-x-3 min-w-0 pl-0">
          {onOpenMobileMenu && (
            <Button
              variant="ghost"
              size="sm"
              data-mobile-menu-trigger
              className="md:hidden text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground h-8 w-8 p-0 ml-0 rounded-none"
              onClick={onOpenMobileMenu}
              aria-label="Menu"
            >
              <PanelLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="min-w-0 shrink-0">
            <h1 className="text-primary-foreground text-sm sm:text-base lg:text-lg tracking-wide font-semibold truncate">
              {t('app_title')}
            </h1>
            <p className="text-primary-foreground/80 text-[10px] sm:text-xs leading-tight hidden sm:block truncate">
              {t('app_subtitle')}
            </p>
          </div>
        </div>

        {/* Barre de recherche centrale (responsive) */}
        <div className="hidden sm:flex flex-1 max-w-xl mx-3 lg:mx-6">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/70" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('search') || 'Rechercher dans l\'application…'}
              className="h-8 lg:h-9 pl-8 pr-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/30 focus-visible:bg-primary-foreground/15"
              aria-label="Recherche"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation actions à droite */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0 ml-2 pr-0 text-sidebar-foreground md:text-primary-foreground">
          {/* Bouton recherche mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden text-primary-foreground hover:bg-primary-foreground/20 h-7 w-7 p-0"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Rechercher"
          >
            <Search className="w-4 h-4" />
          </Button>
          {/* Indicateur de statut de connexion - visible uniquement sur ordinateur et tablette */}
          <div className="hidden md:flex">
            <ConnectionStatusIndicator />
          </div>
          
          {/* Indicateur d'alerte de tâches */}
          <TaskAlertIndicator />
          
          {/* Notifications */}
          <NotificationsPanel />
          
          {/* Langue */}
          <Select value={language} onValueChange={(value) => setLanguage(value as SupportedLanguage)}>
            <SelectTrigger className="w-[60px] sm:w-[70px] lg:w-[80px] h-7 sm:h-8 lg:h-9 text-primary-foreground border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10 text-xs sm:text-sm">
              <SelectValue>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="uppercase hidden sm:inline">{language}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background border-border max-h-[300px]">
              {supportedLanguages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </SelectItem>
              ))}
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
              <span className="hidden sm:inline">{t('login')}</span>
            </Button>
          )}
        </div>
      </div>
      {mobileSearchOpen && (
        <div className="sm:hidden px-2 pb-2 -mt-1 bg-sidebar md:bg-emerald-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/70" />
            <Input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher…"
              className="h-8 pl-8 pr-8 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
            />
            {searchQuery && (
              <button type="button" onClick={() => handleSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground/70">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Settings Sidebar */}
    <Sheet open={showSettings} onOpenChange={setShowSettings}>
      <SheetContent side="right" className="w-full sm:w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('settings_profile')}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Indicateur de connexion */}
          <div className="bg-muted/50 rounded-lg p-4">
            <ConnectionStatusIndicator showTextOnMobile />
          </div>

          <Separator />

          {/* Profil utilisateur */}
          {isAuthenticated && user && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">{t('profile')}</h3>
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
            <h3 className="font-semibold text-sm">{t('localization')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t('country')}</span>
                </div>
                <span className="text-sm text-muted-foreground">{timezone.split('/')[1]?.replace('_', ' ') || 'Auto'}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t('timezone_label')}</span>
                </div>
                <span className="text-sm text-muted-foreground">{timezone || 'Auto'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Langue */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('preferences')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="language-select" className="text-sm">
                  {t('language')}
                </Label>
                <Select value={language} onValueChange={(value) => setLanguage(value as SupportedLanguage)}>
                  <SelectTrigger id="language-select" className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {supportedLanguages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="theme-select" className="text-sm">
                  {t('theme')}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="w-20"
                  >
                    <Sun className="w-4 h-4 mr-1" />
                    {t('light')}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="w-20"
                  >
                    <Moon className="w-4 h-4 mr-1" />
                    {t('dark')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('notifications')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="email-notif" className="text-sm cursor-pointer">
                  {t('email_notifications')}
                </Label>
                <Switch id="email-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="push-notif" className="text-sm cursor-pointer">
                  {t('push_notifications')}
                </Label>
                <Switch id="push-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="alerts-notif" className="text-sm cursor-pointer">
                  {t('system_alerts')}
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
              {t('view_all_settings')}
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
                {t('logout')}
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
