import React, { useState } from 'react';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import MobileMenuModal from './MobileMenuModal';
import Header from './Header';
import IntelligentDashboard from './IntelligentDashboard';
import SplashScreen from './SplashScreen';
import PrivacyPolicy from './PrivacyPolicy';
import Onboarding from './Onboarding';
import SubscriptionPlans from './SubscriptionPlans';
import LoginDialog from './LoginDialog';
import EnhancedRegistration from './EnhancedRegistration';
import PWAInstallPrompt from './PWAInstallPrompt';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showEnhancedRegister, setShowEnhancedRegister] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // États d'authentification simplifiés (sans context pour éviter les erreurs)
  const [user, setUser] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === 'settings') {
      setShowMobileMenu(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogin = () => {
    setShowLogin(true);
    setShowEnhancedRegister(false);
  };

  const handleRegister = () => {
    setShowEnhancedRegister(true);
    setShowLogin(false);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      const privacySeen = localStorage.getItem('privacy_accepted');
      if (privacySeen !== 'true') {
        setShowPrivacy(true);
      }
    } catch (error) {
      console.error('Erreur accès localStorage:', error);
    }
  };

  const handlePrivacyAccept = () => {
    try {
      localStorage.setItem('privacy_accepted', 'true');
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
    }
    setShowPrivacy(false);
  };

  const completeOnboarding = () => {
    setHasSeenOnboarding(true);
  };

  const completeSubscriptionSelection = () => {
    setHasSelectedPlan(true);
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
    return <Onboarding onComplete={completeOnboarding} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Afficher les plans de souscription si pas encore sélectionné et utilisateur connecté
  if (user && !hasSelectedPlan) {
    return <SubscriptionPlans onSelectPlan={() => {}} onSkip={completeSubscriptionSelection} />;
  }

  const renderContent = () => {
    return <IntelligentDashboard />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header fixe en haut */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation - masqué sur mobile */}
        <div className="w-56 lg:w-64 bg-card shadow-sm hidden md:block border-r border-border">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="p-3 sm:p-4 lg:p-6 overflow-auto pb-20 md:pb-6 max-w-full px-[4px] py-[23px]">
            <div className="w-full max-w-none">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Navigation mobile en bas */}
      <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Modal menu mobile */}
      <MobileMenuModal isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Dialogs de connexion/inscription */}
      <LoginDialog 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        isRegistering={false} 
        onToggleMode={handleRegister}
      />
      
      {showEnhancedRegister && (
        <EnhancedRegistration
          onClose={() => setShowEnhancedRegister(false)}
          onSwitchToLogin={handleLogin}
        />
      )}

      {/* PWA Install Prompt */}
      {user && <PWAInstallPrompt />}
    </div>
  );
};

export default MainLayout;