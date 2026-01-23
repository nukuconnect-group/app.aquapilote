import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Shield, AlertTriangle, Key, Mail, Lock, User, Fish, Waves, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/clientConfig';
import aquacultureCagesDesktop from '@/assets/aquaculture-cages-desktop.jpg';
import fishColumnsMobile from '@/assets/fish-columns-mobile.jpg';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-main.png';

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
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [showRecoveryCodeInput, setShowRecoveryCodeInput] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { login, register, resetPassword, completeMFALogin, completeMFALoginWithRecoveryCode, cancelMFALogin, isLoading, enterDemoMode } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    
    if (mfaCode.length !== 6) {
      setMfaError('Veuillez entrer un code à 6 chiffres');
      return;
    }

    const success = await completeMFALogin(mfaCode);
    
    if (success) {
      toast({
        title: "✅ Connexion réussie",
        description: "Bon retour sur AQUA PILOT !",
      });
      setShowMFAVerification(false);
      setMfaCode('');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      onClose();
      navigate('/dashboard', { replace: true });
    } else {
      setMfaError('Code invalide. Veuillez réessayer.');
      setMfaCode('');
    }
  };
  const handleRecoveryCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    
    const formattedCode = recoveryCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (formattedCode.length !== 8) {
      setMfaError('Le code de récupération doit contenir 8 caractères');
      return;
    }

    const success = await completeMFALoginWithRecoveryCode(formattedCode);
    
    if (success) {
      toast({
        title: "✅ Connexion réussie",
        description: "Code de récupération validé. Pensez à en générer de nouveaux dans les paramètres.",
      });
      setShowMFAVerification(false);
      setShowRecoveryCodeInput(false);
      setRecoveryCode('');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      onClose();
      navigate('/dashboard', { replace: true });
    } else {
      setMfaError('Code de récupération invalide ou déjà utilisé');
      setRecoveryCode('');
    }
  };

  const handleCancelMFA = () => {
    cancelMFALogin();
    setShowMFAVerification(false);
    setShowRecoveryCodeInput(false);
    setMfaCode('');
    setRecoveryCode('');
    setMfaError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showResetPassword) {
      // Validation email pour reset
      const email = formData.email.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "❌ Email invalide",
          description: "Veuillez entrer une adresse email valide.",
          variant: "destructive",
        });
        return;
      }

      const success = await resetPassword(email);
      if (success) {
        toast({
          title: "✅ Email envoyé",
          description: "Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.",
        });
        setShowResetPassword(false);
        setFormData({ name: '', email: email, password: '', confirmPassword: '' });
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
      // Validation complète pour l'inscription
      const name = formData.name.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!name || name.length < 2) {
        toast({
          title: "❌ Nom invalide",
          description: "Le nom doit contenir au moins 2 caractères",
          variant: "destructive",
        });
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "❌ Email invalide",
          description: "Veuillez entrer une adresse email valide",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 8) {
        toast({
          title: "❌ Mot de passe trop court",
          description: "Le mot de passe doit contenir au moins 8 caractères",
          variant: "destructive",
        });
        return;
      }

      if (password !== formData.confirmPassword) {
        toast({
          title: "❌ Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const result = await register(name, email, password, selectedPlan || 'trial');
        if (result.success) {
          toast({
            title: "✅ Inscription réussie",
            description: "Vérifiez votre email pour confirmer votre compte, puis connectez-vous.",
          });
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
          onToggleMode();
        } else {
          toast({
            title: "❌ Erreur lors de l'inscription",
            description: result.error || "Une erreur est survenue lors de l'inscription",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Erreur technique",
          description: "Une erreur est survenue. Réessayez dans quelques instants.",
          variant: "destructive",
        });
      }
    } else {
      // Validation pour la connexion
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "❌ Email invalide",
          description: "Veuillez entrer une adresse email valide",
          variant: "destructive",
        });
        return;
      }

      if (!password || password.length < 8) {
        toast({
          title: "❌ Mot de passe invalide",
          description: "Le mot de passe doit contenir au moins 8 caractères",
          variant: "destructive",
        });
        return;
      }

      try {
        const result = await login(email, password);
        
        if (result.requiresMFA) {
          // MFA is required - show verification screen
          setShowMFAVerification(true);
          return;
        }
        
        if (result.success) {
          toast({
            title: "✅ Connexion réussie",
            description: "Bon retour sur AQUA PILOT !",
          });
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
          onClose();
          // Redirection vers le dashboard
          navigate('/dashboard', { replace: true });
        } else {
          toast({
            title: "❌ Erreur de connexion",
            description: "Email ou mot de passe incorrect. Vérifiez vos identifiants.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Erreur technique",
          description: "Problème de connexion. Vérifiez votre connexion internet.",
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
        {/* Image de fond professionnelle - Desktop */}
        <div 
          className="hidden md:block fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${aquacultureCagesDesktop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        />
        
        {/* Image de fond professionnelle - Mobile */}
        <div 
          className="md:hidden fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${fishColumnsMobile})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        />
        
        {/* Overlay gradient premium */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-cyan-900/70 z-[1]" />
        
        {/* Éléments décoratifs animés */}
        <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Icônes flottantes décoratives */}
        <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none hidden md:block">
          <Fish className="absolute top-20 left-[10%] w-8 h-8 text-white/10 animate-bounce" style={{ animationDuration: '3s' }} />
          <Waves className="absolute top-40 right-[15%] w-10 h-10 text-white/10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <Fish className="absolute bottom-32 left-[20%] w-6 h-6 text-white/10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        </div>
        
        {/* Conteneur principal avec effet glassmorphism */}
        <div className="relative z-10 w-[95%] max-w-[440px] mx-auto my-auto">
          {/* Carte principale */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Barre supérieure décorative */}
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500" />
            
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
              {/* MFA Verification Screen */}
              {showMFAVerification ? (
            showRecoveryCodeInput ? (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Key className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-foreground">
                    Code de récupération
                  </DialogTitle>
                  <DialogDescription className="text-center text-sm sm:text-base text-muted-foreground mt-2">
                    Entrez l'un de vos codes de récupération à 8 caractères
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleRecoveryCodeVerify} className="space-y-6 mt-6">
                  {mfaError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{mfaError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="recoveryCode" className="sr-only">Code de récupération</Label>
                    <Input
                      id="recoveryCode"
                      type="text"
                      maxLength={10}
                      placeholder="XXXXXXXX"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                      className="text-center text-2xl tracking-widest font-mono h-16 uppercase"
                      autoComplete="off"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Les codes sont composés de 8 caractères alphanumériques
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowRecoveryCodeInput(false); setRecoveryCode(''); setMfaError(null); }}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || recoveryCode.length !== 8}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        'Vérifier'
                      )}
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Chaque code ne peut être utilisé qu'une seule fois
                </p>
              </>
            ) : (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-foreground">
                    Vérification 2FA requise
                  </DialogTitle>
                  <DialogDescription className="text-center text-sm sm:text-base text-muted-foreground mt-2">
                    Entrez le code à 6 chiffres de votre application d'authentification
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleMFAVerify} className="space-y-6 mt-6">
                  {mfaError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{mfaError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="mfaCode" className="sr-only">Code 2FA</Label>
                    <Input
                      id="mfaCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-3xl tracking-widest font-mono h-16"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Ouvrez Google Authenticator, Authy ou votre app 2FA
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelMFA}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || mfaCode.length !== 6}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        'Vérifier'
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setShowRecoveryCodeInput(true); setMfaCode(''); setMfaError(null); }}
                    className="w-full text-muted-foreground"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Utiliser un code de récupération
                  </Button>
                </div>
              </>
            )
          ) : (
            <>
              <DialogHeader className="space-y-4">
                {/* Logo et titre */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src={aquaPilotLogo} 
                      alt="AQUA PILOT Logo" 
                      className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg"
                    />
                  </div>
                  
                  <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                    {showResetPassword ? 'Réinitialisation' : isRegistering ? 'Créer un compte' : 'Bienvenue'}
                  </DialogTitle>
                  
                  <DialogDescription className="text-sm text-muted-foreground mt-2">
                    {showResetPassword 
                      ? 'Entrez votre email pour réinitialiser' 
                      : isRegistering 
                        ? 'Rejoignez la révolution de l\'aquaculture intelligente' 
                        : 'Connectez-vous à votre espace de gestion'}
                  </DialogDescription>
                </div>
              
                {selectedPlan && isRegistering && (
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-3 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium text-center">
                      Plan sélectionné : <span className="font-bold">{getPlanName(selectedPlan)}</span>
                    </p>
                  </div>
                )}
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Nom complet (inscription) */}
                {isRegistering && !showResetPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Nom complet
                    </Label>
                    <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Votre nom complet"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="h-12 pl-4 bg-muted/50 border-muted-foreground/20 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Adresse email
                  </Label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="h-12 pl-4 bg-muted/50 border-muted-foreground/20 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                {!showResetPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Mot de passe
                    </Label>
                    <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        minLength={8}
                        className="h-12 pl-4 pr-12 bg-muted/50 border-muted-foreground/20 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {isRegistering && (
                      <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                    )}
                  </div>
                )}

                {/* Confirmation mot de passe (inscription) */}
                {isRegistering && !showResetPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Confirmer le mot de passe
                    </Label>
                    <div className={`relative transition-all duration-200 ${focusedField === 'confirmPassword' ? 'scale-[1.01]' : ''}`}>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        required
                        minLength={8}
                        className="h-12 pl-4 bg-muted/50 border-muted-foreground/20 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                )}

                {/* Bouton principal */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {showResetPassword ? 'Envoi...' : isRegistering ? 'Création...' : 'Connexion...'}
                    </>
                  ) : (
                    <>
                      {showResetPassword ? 'Envoyer le lien' : isRegistering ? 'Créer mon compte' : 'Se connecter'}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Séparateur */}
                {!showResetPassword && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted-foreground/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-3 bg-white dark:bg-slate-900 text-muted-foreground">Ou</span>
                    </div>
                  </div>
                )}

                {/* Bouton Google */}
                {!showResetPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-muted-foreground/20 hover:bg-muted/50 transition-all"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuer avec Google
                  </Button>
                )}

                {/* Bouton démo */}
                {!showResetPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-11 text-muted-foreground hover:text-foreground transition-all"
                    onClick={() => {
                      enterDemoMode();
                      navigate('/dashboard');
                    }}
                  >
                    <Fish className="w-4 h-4 mr-2" />
                    Voir la démonstration
                  </Button>
                )}

                {/* Liens */}
                <div className="text-center pt-4 space-y-3 border-t border-muted-foreground/10">
                  {!showResetPassword && !isRegistering && (
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                    >
                      ← Retour à la connexion
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onToggleMode}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                    >
                      {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
