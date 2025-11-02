import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/SplashScreen';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import Onboarding from '@/components/Onboarding';
import SubscriptionPlans from '@/components/SubscriptionPlans';

/**
 * Page de bienvenue avec splash screen, onboarding et sélection d'abonnement
 * Redirige vers /auth ou /dashboard selon l'état de l'utilisateur
 */
const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    hasSeenOnboarding, 
    completeOnboarding,
    hasSelectedPlan,
    completeSubscriptionSelection,
    isLoading
  } = useAuth();

  const [showSplash, setShowSplash] = useState(() => {
    return localStorage.getItem('aqua_pilot_splash') !== 'true';
  });
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Redirection automatique si l'utilisateur est déjà connecté et a complété l'onboarding
  useEffect(() => {
    if (!isLoading) {
      if (user && hasSeenOnboarding && hasSelectedPlan) {
        navigate('/dashboard', { replace: true });
      } else if (!showSplash && !showPrivacy && hasSeenOnboarding && !user) {
        navigate('/auth', { replace: true });
      }
    }
  }, [user, hasSeenOnboarding, hasSelectedPlan, isLoading, navigate, showSplash, showPrivacy]);

  const handleSplashComplete = () => {
    localStorage.setItem('aqua_pilot_splash', 'true');
    setShowSplash(false);
    const privacySeen = localStorage.getItem('privacy_accepted');
    if (privacySeen !== 'true') {
      setShowPrivacy(true);
    }
  };

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacy_accepted', 'true');
    setShowPrivacy(false);
  };

  const handleLogin = () => {
    navigate('/auth', { replace: true });
  };

  const handleRegister = () => {
    navigate('/auth', { replace: true });
  };

  // Afficher le splash screen au premier lancement
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Afficher la politique de confidentialité si pas encore acceptée
  if (showPrivacy) {
    return <PrivacyPolicy onAccept={handlePrivacyAccept} />;
  }

  // Afficher l'onboarding si pas encore vu
  if (!hasSeenOnboarding) {
    return (
      <Onboarding 
        onComplete={completeOnboarding} 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
      />
    );
  }

  // Afficher les plans de souscription si pas encore sélectionné (et utilisateur connecté)
  if (user && !hasSelectedPlan) {
    return (
      <SubscriptionPlans 
        onSelectPlan={() => {}} 
        onSkip={completeSubscriptionSelection} 
      />
    );
  }

  // Par défaut, ne rien afficher (redirection en cours)
  return null;
};

export default Welcome;
