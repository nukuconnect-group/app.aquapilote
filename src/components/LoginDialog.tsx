
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-small.webp';
import aquacultureCagesDesktop from '@/assets/aquaculture-cages-desktop.jpg';
import fishColumnsMobile from '@/assets/fish-columns-mobile.jpg';

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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, register, resetPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de se connecter avec Google. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showResetPassword) {
      const success = await resetPassword(formData.email);
      if (success) {
        toast({
          title: "✅ Email envoyé",
          description: "Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.",
        });
        setShowResetPassword(false);
        setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' });
      } else {
        toast({
          title: "❌ Erreur",
          description: "Impossible d'envoyer l'email. Vérifiez votre adresse email.",
          variant: "destructive",
        });
      }
      return;
    }
    
    if (isRegistering) {
      if (!formData.name || !formData.email || !formData.password) {
        toast({
          title: "❌ Champs manquants",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: "❌ Mot de passe trop court",
          description: "Le mot de passe doit contenir au moins 8 caractères",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "❌ Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
      
      const success = await register(formData.name, formData.email, formData.password, selectedPlan || 'trial');
      if (success) {
        toast({
          title: "✅ Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte, puis connectez-vous.",
        });
        onToggleMode();
      } else {
        toast({
          title: "❌ Erreur lors de l'inscription",
          description: "Vérifiez que l'email n'est pas déjà utilisé et que tous les champs sont corrects.",
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
      <DialogContent className="!max-w-none w-screen h-screen p-0 overflow-hidden border-0 flex items-center justify-center">
        {/* Image de fond professionnelle - Desktop en pleine largeur */}
        <div 
          className="hidden sm:block fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${aquacultureCagesDesktop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.85)',
            width: '100%',
            height: '100vh'
          }}
        />
        
        {/* Image de fond professionnelle - Mobile en pleine largeur */}
        <div 
          className="sm:hidden fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${fishColumnsMobile})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.85)',
            width: '100%',
            height: '100vh'
          }}
        />
        
        {/* Overlay gradient pour meilleure lisibilité */}
        <div className="fixed inset-0 bg-gradient-to-br from-aqua-900/40 via-ocean-600/30 to-aqua-800/40 z-[1]" />
        
        {/* Contenu au-dessus du fond - centré verticalement et horizontalement */}
        <div className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-lg shadow-2xl w-[90%] max-w-md mx-auto my-auto overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white rounded-full p-3 shadow-xl">
                <img 
                  src={aquaPilotLogo} 
                  alt="AQUA PILOT" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                />
              </div>
            </div>
            <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {showResetPassword ? 'Réinitialiser le mot de passe' : isRegistering ? 'Créer un compte' : 'Se connecter'}
            </DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base md:text-lg text-muted-foreground mt-2">
              {showResetPassword ? 'Entrez votre email pour recevoir un lien de réinitialisation' : isRegistering ? 'Rejoignez AQUA PILOT pour gérer votre exploitation aquacole' : 'Accédez à votre tableau de bord de gestion'}
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
            {isRegistering && !showResetPassword && (
              <div>
                <Label htmlFor="name" className="text-sm sm:text-base font-medium text-card-foreground">Nom complet *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 text-sm sm:text-base h-10 sm:h-11 md:h-12 bg-background text-foreground"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm sm:text-base font-medium text-card-foreground">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 text-sm sm:text-base h-10 sm:h-11 md:h-12 bg-background text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm sm:text-base font-medium text-card-foreground">Mot de passe *</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="text-sm sm:text-base h-10 sm:h-11 md:h-12 pr-10 bg-background text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {isRegistering && <p className="text-xs text-muted-foreground mt-1">Minimum 8 caractères</p>}
            </div>

            {isRegistering && !showResetPassword && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base font-medium text-card-foreground">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className="mt-1 text-sm sm:text-base h-10 sm:h-11 md:h-12 bg-background text-foreground"
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-aqua hover:opacity-90 text-white text-sm sm:text-base md:text-lg h-10 sm:h-11 md:h-12 font-semibold shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  {showResetPassword ? 'Envoi...' : isRegistering ? 'Création...' : 'Connexion...'}
                </>
              ) : (
                showResetPassword ? 'Envoyer le lien' : isRegistering ? 'Créer mon compte' : 'Se connecter'
              )}
            </Button>

            {!showResetPassword && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-muted-foreground">Ou continuer avec</span>
                </div>
              </div>
            )}

            {!showResetPassword && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 sm:h-11 md:h-12"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            )}

            <div className="text-center pt-3 sm:pt-4 space-y-2">
              {!showResetPassword && !isRegistering && (
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="block w-full text-sm sm:text-base text-muted-foreground hover:text-foreground underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
              
              {showResetPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                  className="text-sm sm:text-base text-primary hover:text-primary/80 underline font-medium"
                >
                  Retour à la connexion
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-sm sm:text-base text-primary hover:text-primary/80 underline font-medium"
                >
                  {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
                </button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
