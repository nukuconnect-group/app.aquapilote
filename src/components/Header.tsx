
import React, { useState } from 'react';
import { Settings, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LoginDialog from '@/components/LoginDialog';
import NotificationsPanel from '@/components/NotificationsPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { addLog } = useLogs();
  const { toast } = useToast();

  const handleLogin = () => {
    if (!isAuthenticated) {
      setIsRegistering(false);
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    addLog('Déconnexion', 'Authentification', `${user?.name} s'est déconnecté`, 'info');
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès"
    });
    // Redirection automatique vers la page de connexion via le contexte d'authentification
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <header className="bg-primary h-12 lg:h-14 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center h-full px-3 sm:px-4 lg:px-6">
          {/* Logo et titre à gauche */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div>
              <h1 className="text-primary-foreground text-xs sm:text-sm lg:text-base font-bold tracking-wide">
                AQUA PILOTE
              </h1>
              <p className="text-primary-foreground/80 text-xs leading-tight hidden sm:block">Gestion Piscicole Intelligente</p>
            </div>
          </div>

          {/* Navigation actions à droite */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Notifications */}
            <NotificationsPanel />
            
            {/* Paramètres */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-9 sm:w-9">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mobile-friendly-modal">
                <DialogHeader>
                  <DialogTitle className="text-responsive-title">Paramètres système</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-responsive">Notifications</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Notifications email</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Notifications push</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Alertes critiques</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-responsive">Préférences</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Langue</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option>Français</option>
                          <option>English</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Fuseau horaire</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option>Europe/Paris</option>
                          <option>UTC</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-responsive">Système</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Version: 1.0.0</p>
                      <p>Dernière mise à jour: 03/07/2025</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Profil utilisateur */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:bg-primary-foreground/10 rounded-lg p-1 transition-colors min-h-[44px] sm:min-h-0">
                    <Avatar className="w-6 h-6 sm:w-7 sm:h-7 border border-primary-foreground/30">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-primary-foreground text-xs hidden sm:inline">{user.name.split(' ')[0]}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleLogin} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-9 sm:w-9 min-h-[44px] sm:min-h-0">
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <LoginDialog 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)} 
          isRegistering={isRegistering} 
          onToggleMode={() => setIsRegistering(!isRegistering)} 
        />
      )}
    </>
  );
};

export default Header;
