import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Onboarding from '@/components/Onboarding';
import { Loader2 } from 'lucide-react';

/**
 * Page d'accueil - Affiche l'onboarding pour les nouveaux utilisateurs
 * Redirige vers le dashboard si déjà connecté
 */
const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, hasSeenOnboarding, completeOnboarding } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
        navigate('/dashboard', { replace: true });
      } else if (!hasSeenOnboarding) {
        // Afficher l'onboarding pour les nouveaux visiteurs
        setShowOnboarding(true);
      } else {
        // Si l'onboarding a déjà été vu, aller directement à l'auth
        navigate('/auth', { replace: true });
      }
    }
  }, [user, isLoading, hasSeenOnboarding, navigate]);

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setShowOnboarding(false);
  };

  const handleLogin = () => {
    completeOnboarding();
    navigate('/auth', { replace: true });
  };

  const handleRegister = () => {
    completeOnboarding();
    navigate('/auth', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return null;
};

export default Welcome;
