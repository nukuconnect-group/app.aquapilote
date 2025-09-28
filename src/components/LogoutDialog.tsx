import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <LogOut className="w-6 h-6" />
            Déconnexion
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-aqua rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{user?.name || 'Utilisateur'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">{user?.entreprise}</p>
            </div>

            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleLogout}
                className="flex-1 bg-gradient-aqua text-white"
              >
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;