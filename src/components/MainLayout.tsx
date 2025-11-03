import React, { useState } from 'react';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import MobileMenuModal from './MobileMenuModal';
import Header from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Dashboard from '@/components/Dashboard';
import IntelligentDashboard from './IntelligentDashboard';
import AdminDashboard from './AdminDashboard';
import SplashScreen from './SplashScreen';
import PrivacyPolicy from './PrivacyPolicy';
import Onboarding from './Onboarding';
import SubscriptionPlans from './SubscriptionPlans';
import LoginDialog from './LoginDialog';
import EnhancedRegistration from './EnhancedRegistration';
import PWAInstallPrompt from './PWAInstallPrompt';
import { useAuth } from '@/contexts/AuthContext';
import IoTControlCenter from './IoTControlCenter';
import ProductionUnitsManagement from './ProductionUnitsManagement';
import InfrastructureManagement from './InfrastructureManagement';
import FishManagement from './FishManagement';
import LivestockManagement from './LivestockManagement';
import FeedingManagement from './FeedingManagement';
import HealthMonitoring from './HealthMonitoring';
import ProphylaxieManagement from './ProphylaxieManagement';
import TransformationManagement from './TransformationManagement';
import ProductionManagement from './ProductionManagement';
import AccountingManagement from './AccountingManagement';
import SuppliersManagement from './SuppliersManagement';
import HRManagement from './HRManagement';
import SalesManagement from './SalesManagement';
import PurchasesManagement from './PurchasesManagement';
import PlanningManagement from './PlanningManagement';
import WeatherDashboard from './WeatherDashboard';
import TeamManagement from './TeamManagement';
import ReportsManagement from './ReportsManagement';
import SettingsManagement from './SettingsManagement';
const MainLayout = () => {
  console.log('MainLayout rendering');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showEnhancedRegister, setShowEnhancedRegister] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    return localStorage.getItem('aqua_pilot_splash') !== 'true';
  });
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const {
    user,
    hasSeenOnboarding,
    completeOnboarding,
    hasSelectedPlan,
    completeSubscriptionSelection
  } = useAuth();
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

  // Protéger l'application - demander connexion si pas connecté
  if (!user) {
    return (
      <>
        <LoginDialog 
          isOpen={!showEnhancedRegister} 
          onClose={() => {}}
          isRegistering={false} 
          onToggleMode={handleRegister}
        />
        
        {showEnhancedRegister && (
          <EnhancedRegistration
            onClose={() => setShowEnhancedRegister(false)}
            onSwitchToLogin={handleLogin}
          />
        )}
      </>
    );
  }

  // Afficher les plans de souscription si pas encore sélectionné
  if (!hasSelectedPlan) {
    return <SubscriptionPlans onSelectPlan={() => {}} onSkip={completeSubscriptionSelection} />;
  }
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <IntelligentDashboard />;
      case 'iot-control':
        return <IoTControlCenter />;
      case 'units':
        return <ProductionUnitsManagement />;
      case 'infrastructures':
        return <InfrastructureManagement />;
      case 'fish':
        return <FishManagement />;
      case 'livestock':
        return <LivestockManagement />;
      case 'feeding':
        return <FeedingManagement />;
      case 'health':
        return <ProphylaxieManagement />;
      case 'transformation':
        return <TransformationManagement />;
      case 'production':
        return <ProductionManagement />;
      case 'accounting':
        return <AccountingManagement />;
      case 'hr':
        return <HRManagement />;
      case 'purchases':
        return <PurchasesManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'suppliers':
        return <SuppliersManagement />;
      case 'planning':
        return <PlanningManagement />;
      case 'weather':
        return <WeatherDashboard />;
      case 'team':
        return <TeamManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <IntelligentDashboard />;
    }
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar Navigation - masqué sur mobile */}
        <div className="hidden md:flex">
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Conteneur principal avec header et contenu */}
        <div className="flex-1 flex flex-col min-w-0 mt-0 pt-0">
          {/* Header fixe en haut sans marges */}
          <div className="fixed top-0 left-0 right-0 z-[1000] flex items-center border-b border-border bg-background w-full m-0 p-0 md:left-auto">
            <div className="hidden md:block">
              <SidebarTrigger className="ml-2" />
            </div>
            <div className="flex-1 w-full m-0 p-0">
              <Header />
            </div>
          </div>
          
          {/* Main Content avec padding-top pour compenser le header fixe */}
          <main className="flex-1 overflow-y-auto p-0 sm:p-4 lg:p-6 pb-20 md:pb-6 pt-[3rem] md:pt-14 lg:pt-16">
            <div className="w-full max-w-none">
              {renderContent()}
            </div>
          </main>
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
    </SidebarProvider>
  );
};
export default MainLayout;