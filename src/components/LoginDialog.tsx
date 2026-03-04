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
import { useSettings } from '@/contexts/SettingsContext';
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
  const { t } = useSettings();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('google_login_error') || "Impossible de se connecter avec Google.",
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
      setMfaError(t('mfa_code_6_digits') || 'Veuillez entrer un code à 6 chiffres');
      return;
    }

    const success = await completeMFALogin(mfaCode);
    
    if (success) {
      toast({
        title: `✅ ${t('login_success')}`,
        description: t('welcome_back'),
      });
      setShowMFAVerification(false);
      setMfaCode('');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      onClose();
      navigate('/dashboard', { replace: true });
    } else {
      setMfaError(t('mfa_invalid_code') || 'Code invalide. Veuillez réessayer.');
      setMfaCode('');
    }
  };

  const handleRecoveryCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    
    const formattedCode = recoveryCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (formattedCode.length !== 8) {
      setMfaError(t('recovery_code_8_chars') || 'Le code de récupération doit contenir 8 caractères');
      return;
    }

    const success = await completeMFALoginWithRecoveryCode(formattedCode);
    
    if (success) {
      toast({
        title: `✅ ${t('login_success')}`,
        description: t('recovery_code_validated') || 'Code de récupération validé.',
      });
      setShowMFAVerification(false);
      setShowRecoveryCodeInput(false);
      setRecoveryCode('');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      onClose();
      navigate('/dashboard', { replace: true });
    } else {
      setMfaError(t('recovery_code_invalid') || 'Code de récupération invalide ou déjà utilisé');
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
      const email = formData.email.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: `❌ ${t('invalid_email')}`,
          description: t('invalid_email'),
          variant: "destructive",
        });
        return;
      }

      const success = await resetPassword(email);
      if (success) {
        toast({
          title: `✅ ${t('success')}`,
          description: t('reset_email_sent') || 'Un email de réinitialisation a été envoyé.',
        });
        setShowResetPassword(false);
        setFormData({ name: '', email: email, password: '', confirmPassword: '' });
      } else {
        toast({
          title: `❌ ${t('error')}`,
          description: t('reset_email_error') || "Impossible d'envoyer l'email.",
          variant: "destructive",
        });
      }
      return;
    }
    
    if (isRegistering) {
      const name = formData.name.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!name || name.length < 2) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('name_too_short'),
          variant: "destructive",
        });
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: `❌ ${t('invalid_email')}`,
          description: t('invalid_email'),
          variant: "destructive",
        });
        return;
      }

      if (password.length < 8) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('password_too_short'),
          variant: "destructive",
        });
        return;
      }

      if (password !== formData.confirmPassword) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('passwords_dont_match'),
          variant: "destructive",
        });
        return;
      }
      
      try {
        const result = await register(name, email, password, selectedPlan || 'trial');
        if (result.success) {
          toast({
            title: `✅ ${t('registration_success')}`,
            description: t('check_email_confirm'),
          });
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
          onToggleMode();
        } else {
          toast({
            title: `❌ ${t('registration_error')}`,
            description: result.error || t('registration_error'),
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('technical_error') || "Une erreur est survenue.",
          variant: "destructive",
        });
      }
    } else {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: `❌ ${t('invalid_email')}`,
          description: t('invalid_email'),
          variant: "destructive",
        });
        return;
      }

      if (!password || password.length < 8) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('password_too_short'),
          variant: "destructive",
        });
        return;
      }

      try {
        const result = await login(email, password);
        
        if (result.requiresMFA) {
          setShowMFAVerification(true);
          return;
        }
        
        if (result.success) {
          toast({
            title: `✅ ${t('login_success')}`,
            description: t('welcome_back'),
          });
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
          onClose();
          navigate('/dashboard', { replace: true });
        } else {
          toast({
            title: `❌ ${t('login_error')}`,
            description: t('invalid_credentials'),
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: `❌ ${t('error')}`,
          description: t('technical_error') || "Problème de connexion.",
          variant: "destructive",
        });
      }
    }
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'trial': return t('trial_plan') || 'Essai Gratuit (30 jours)';
      case 'monthly': return t('monthly_plan') || 'Plan Mensuel (29€/mois)';
      case 'annual': return t('annual_plan') || 'Plan Annuel (290€/an)';
      default: return t('no_plan_selected') || 'Plan non sélectionné';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="!max-w-none w-screen h-screen p-0 overflow-hidden border-0 flex items-center justify-center">
        {/* Background images */}
        <div 
          className="hidden md:block fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${aquacultureCagesDesktop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        />
        <div 
          className="md:hidden fixed inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${fishColumnsMobile})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        />
        
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-cyan-900/70 z-[1]" />
        
        <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="fixed inset-0 z-[2] overflow-hidden pointer-events-none hidden md:block">
          <Fish className="absolute top-20 left-[10%] w-8 h-8 text-white/10 animate-bounce" style={{ animationDuration: '3s' }} />
          <Waves className="absolute top-40 right-[15%] w-10 h-10 text-white/10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <Fish className="absolute bottom-32 left-[20%] w-6 h-6 text-white/10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        </div>
        
        <div className="relative z-10 w-[95%] max-w-[440px] mx-auto my-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
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
                    {t('recovery_code_title') || 'Code de récupération'}
                  </DialogTitle>
                  <DialogDescription className="text-center text-sm sm:text-base text-muted-foreground mt-2">
                    {t('recovery_code_desc') || 'Entrez l\'un de vos codes de récupération à 8 caractères'}
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
                    <Label htmlFor="recoveryCode" className="sr-only">{t('recovery_code_title') || 'Code de récupération'}</Label>
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
                      {t('recovery_code_8_chars') || 'Les codes sont composés de 8 caractères alphanumériques'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowRecoveryCodeInput(false); setRecoveryCode(''); setMfaError(null); }}
                      className="flex-1"
                    >
                      {t('back')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || recoveryCode.length !== 8}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('loading')}
                        </>
                      ) : (
                        t('confirm')
                      )}
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {t('recovery_code_once') || 'Chaque code ne peut être utilisé qu\'une seule fois'}
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
                    {t('mfa_verification_title') || 'Vérification 2FA requise'}
                  </DialogTitle>
                  <DialogDescription className="text-center text-sm sm:text-base text-muted-foreground mt-2">
                    {t('mfa_verification_desc') || 'Entrez le code à 6 chiffres de votre application d\'authentification'}
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
                      {t('mfa_open_app') || 'Ouvrez Google Authenticator, Authy ou votre app 2FA'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelMFA}
                      className="flex-1"
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || mfaCode.length !== 6}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('loading')}
                        </>
                      ) : (
                        t('confirm')
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
                    {t('use_recovery_code') || 'Utiliser un code de récupération'}
                  </Button>
                </div>
              </>
            )
          ) : (
            <>
              <DialogHeader className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src={aquaPilotLogo} 
                      alt="AQUA PILOT Logo" 
                      className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg"
                    />
                  </div>
                  
                  <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                    {showResetPassword ? t('reset_password') : isRegistering ? t('create_account') : t('welcome_back')}
                  </DialogTitle>
                  
                  <DialogDescription className="text-sm text-muted-foreground mt-2">
                    {showResetPassword 
                      ? (t('reset_password_desc') || 'Entrez votre email pour réinitialiser')
                      : isRegistering 
                        ? (t('join_aquaculture') || 'Rejoignez la révolution de l\'aquaculture intelligente')
                        : (t('login_desc') || 'Connectez-vous à votre espace de gestion')}
                  </DialogDescription>
                </div>
              
                {selectedPlan && isRegistering && (
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-3 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200 font-medium text-center">
                      {t('selected_plan') || 'Plan sélectionné'} : <span className="font-bold">{getPlanName(selectedPlan)}</span>
                    </p>
                  </div>
                )}
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {/* Full name (registration) */}
                {isRegistering && !showResetPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {t('full_name')}
                    </Label>
                    <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                      <Input
                        id="name"
                        type="text"
                        placeholder={t('full_name')}
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
                    {t('email')}
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

                {/* Password */}
                {!showResetPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {t('password')}
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
                      <p className="text-xs text-muted-foreground">{t('password_too_short')}</p>
                    )}
                  </div>
                )}

                {/* Confirm password */}
                {isRegistering && !showResetPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {t('confirm_password')}
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
                      <p className="text-xs text-destructive">{t('passwords_dont_match')}</p>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 hover:from-cyan-700 hover:via-blue-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('loading')}
                    </>
                  ) : (
                    <>
                      {showResetPassword ? (t('send_reset_link') || 'Envoyer le lien') : isRegistering ? t('create_account') : t('login')}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Separator */}
                {!showResetPassword && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted-foreground/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-3 bg-white dark:bg-slate-900 text-muted-foreground">{t('or_continue_with')}</span>
                    </div>
                  </div>
                )}

                {/* Google */}
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
                    {isRegistering ? t('signup_with_google') : t('login_with_google')}
                  </Button>
                )}

                {/* Demo */}
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
                    {t('try_demo')}
                  </Button>
                )}

                {/* Links */}
                <div className="text-center pt-4 space-y-3 border-t border-muted-foreground/10">
                  {!showResetPassword && !isRegistering && (
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('forgot_password')}
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
                      ← {t('back')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onToggleMode}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                    >
                      {isRegistering ? t('already_have_account') : t('dont_have_account')}
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
