import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import SplashScreen from '@/components/SplashScreen';
import Onboarding from '@/components/Onboarding';
import MainLayout from '@/components/MainLayout';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import { Toaster } from '@/components/ui/toaster';

const AppWithPrivacy = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = React.useState(false);
  const [showMainApp, setShowMainApp] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    // S'assurer que le composant est monté avant d'accéder à localStorage
    setIsInitialized(true);
    
    // Vérifier si l'utilisateur a déjà accepté la politique de confidentialité
    const hasAcceptedPrivacy = localStorage.getItem('privacy-policy-accepted') === 'true';
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';

    if (!hasAcceptedPrivacy) {
      setShowPrivacyPolicy(true);
    } else if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      setShowMainApp(true);
    }
  }, []);

  // Ne rien rendre tant que le composant n'est pas initialisé
  if (!isInitialized) {
    return null;
  }

  const handleSplashComplete = () => {
    setShowSplash(false);
    
    const hasAcceptedPrivacy = localStorage.getItem('privacy-policy-accepted') === 'true';
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';

    if (!hasAcceptedPrivacy) {
      setShowPrivacyPolicy(true);
    } else if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      setShowMainApp(true);
    }
  };

  const handlePrivacyAccept = () => {
    setShowPrivacyPolicy(false);
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed') === 'true';
    
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      setShowMainApp(true);
    }
  };

  const handlePrivacyDecline = () => {
    // Rediriger vers une page d'information ou fermer l'application
    window.location.href = 'https://www.google.com';
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setShowOnboarding(false);
    setShowMainApp(true);
  };

  const handleLogin = () => {
    // La connexion sera gérée par le MainLayout
    setShowOnboarding(false);
    setShowMainApp(true);
  };

  const handleRegister = () => {
    // L'inscription sera gérée par le MainLayout
    setShowOnboarding(false);
    setShowMainApp(true);
  };

  return (
    <SettingsProvider>
      <AuthProvider>
        <ProductionUnitsProvider>
          <IoTProvider>
            <LogsProvider>
              <div className="min-h-screen">
                {showSplash && (
                  <SplashScreen onComplete={handleSplashComplete} />
                )}
                
                {showPrivacyPolicy && (
                  <PrivacyPolicy 
                    onAccept={handlePrivacyAccept}
                    onDecline={handlePrivacyDecline}
                  />
                )}
                
                {showOnboarding && (
                  <Onboarding
                    onComplete={handleOnboardingComplete}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                  />
                )}
                
                {showMainApp && <MainLayout />}
                
                <Toaster />
              </div>
            </LogsProvider>
          </IoTProvider>
        </ProductionUnitsProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default AppWithPrivacy;