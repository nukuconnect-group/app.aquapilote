
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import aquaPilotLogo from '@/assets/aqua-pilot-logo.png';
import aquacultureBackground from '@/assets/aquaculture-background.jpg';
import aquacultureMobileBackground from '@/assets/aquaculture-mobile-background.jpg';

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
      <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-4 p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Image de fond professionnelle - Desktop */}
        <div 
          className="hidden sm:block absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: `url(${aquacultureBackground})`,
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Image de fond professionnelle - Mobile */}
        <div 
          className="sm:hidden absolute inset-0 bg-cover bg-center z-0"
          style={{ 
            backgroundImage: `url(${aquacultureMobileBackground})`,
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Overlay gradient pour meilleure lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-aqua-900/60 via-ocean-600/50 to-aqua-800/60 z-[1]" />
        
        {/* Contenu au-dessus du fond */}
        <div className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-lg shadow-2xl m-2 sm:m-4">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <img 
                  src={aquaPilotLogo} 
                  alt="AQUA PILOT" 
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
                />
              </div>
            </div>
            <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {isRegistering ? 'Créer un compte' : 'Se connecter'}
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mt-2">
              {isRegistering ? 'Rejoignez AQUA PILOT pour gérer votre exploitation aquacole' : 'Accédez à votre tableau de bord de gestion'}
            </DialogDescription>
          
            {selectedPlan && isRegistering && (
              <div className="bg-gradient-to-r from-aqua-50 to-ocean-50 dark:from-aqua-900/30 dark:to-ocean-900/30 p-3 sm:p-4 rounded-xl border-2 border-aqua-300 dark:border-aqua-600 mt-4 sm:mt-6 shadow-md">
                <p className="text-sm sm:text-base md:text-lg text-aqua-900 dark:text-aqua-100 font-semibold">
                  <strong>Plan sélectionné :</strong> {getPlanName(selectedPlan)}
                </p>
              </div>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-6">
            {isRegistering && (
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 text-sm sm:text-base h-10 sm:h-11 md:h-12"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 text-sm sm:text-base h-10 sm:h-11 md:h-12"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Mot de passe</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11 md:h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="mt-1 text-sm sm:text-base h-10 sm:h-11 md:h-12"
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-aqua hover:opacity-90 text-white text-sm sm:text-base md:text-lg h-10 sm:h-11 md:h-12 font-semibold shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  {isRegistering ? 'Création...' : 'Connexion...'}
                </>
              ) : (
                isRegistering ? 'Créer mon compte' : 'Se connecter'
              )}
            </Button>

            <div className="text-center pt-3 sm:pt-4">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-sm sm:text-base text-aqua-600 dark:text-aqua-400 hover:text-aqua-700 dark:hover:text-aqua-300 underline font-medium"
              >
                {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
