
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Fish, Droplets, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isRegistering?: boolean;
  onToggleMode: () => void;
  selectedPlan?: string | null;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ 
  isOpen, 
  onClose, 
  isRegistering = false, 
  onToggleMode,
  selectedPlan = null 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
      
      const success = await register(formData.name, formData.email, formData.password, selectedPlan || 'trial');
      if (success) {
        toast({
          title: "✅ Compte créé avec succès",
          description: "Bienvenue dans AQUA PILOT ! Vous pouvez maintenant vous connecter.",
        });
        onClose();
      } else {
        toast({
          title: "❌ Erreur lors de l'inscription",
          description: "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.",
          variant: "destructive",
        });
      }
    } else {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: "✅ Connexion réussie",
          description: "Bon retour sur AQUA PILOT !",
        });
        onClose();
      } else {
        toast({
          title: "❌ Erreur de connexion",
          description: "Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.",
          variant: "destructive",
        });
      }
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'trial': return 'Essai Gratuit (30 jours)';
      case 'monthly': return 'Plan Mensuel (29€/mois)';
      case 'annual': return 'Plan Annuel (290€/an)';
      default: return 'Plan non sélectionné';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-aqua rounded-lg flex items-center justify-center">
                <Fish className="w-7 h-7 text-white animate-float" />
              </div>
              <Droplets className="w-5 h-5 text-aqua-400 absolute -top-1 -right-1 animate-wave" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl sm:text-2xl">
            {isRegistering ? 'Créer un compte' : 'Se connecter'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {isRegistering ? 'Rejoignez AQUA PILOTE pour gérer votre exploitation' : 'Accédez à votre tableau de bord'}
          </DialogDescription>
          
          {selectedPlan && isRegistering && (
            <div className="bg-aqua-50 p-3 rounded-lg border border-aqua-200 mt-4">
              <p className="text-sm text-aqua-800">
                <strong>Plan sélectionné :</strong> {getPlanName(selectedPlan)}
              </p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <Label htmlFor="name" className="text-sm">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-sm"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div>
              <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="text-sm"
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-gradient-aqua text-white text-sm" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isRegistering ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              isRegistering ? 'Créer mon compte' : 'Se connecter'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-sm text-aqua-600 hover:text-aqua-700 underline"
            >
              {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
            </button>
          </div>

          {!isRegistering && (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Compte de démonstration :</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Email :</strong> demo@aquapilot.com</p>
                <p><strong>Mot de passe :</strong> <code className="bg-gray-100 px-1 rounded">demo123</code></p>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
