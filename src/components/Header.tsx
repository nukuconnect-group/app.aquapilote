import React, { useState } from 'react';
import { Settings, LogOut, UserCircle, Sun, Moon, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoginDialog from '@/components/LoginDialog';
import NotificationsPanel from '@/components/NotificationsPanel';
import SettingsManagement from '@/components/SettingsManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
const Header = () => {
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div>
              <h1 className="text-primary-foreground text-sm sm:text-base lg:text-lg tracking-wide font-semibold">
                {t('app_title')}
              </h1>
              <p className="text-primary-foreground/80 text-[10px] sm:text-xs leading-tight hidden sm:block">{t('app_subtitle')}</p>
            </div>
          </div>

          {/* Navigation actions à droite */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <NotificationsPanel />
            
            {/* Langue */}
            <Select value={language} onValueChange={(value) => setLanguage(value as 'fr' | 'en')}>
              <SelectTrigger className="w-[70px] h-8 sm:h-9 text-primary-foreground border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10">
                <SelectValue>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm uppercase">{language}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>

            {/* Paramètres */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-9 sm:w-9">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <SettingsManagement />
              </DialogContent>
            </Dialog>
            
            {/* Profil utilisateur */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
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
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm"
                onClick={handleLogin}
              >
                <User className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">{language === 'fr' ? 'Connexion' : 'Login'}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <SettingsManagement />
        </DialogContent>
      </Dialog>

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