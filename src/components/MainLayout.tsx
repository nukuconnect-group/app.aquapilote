import React, { useState } from 'react';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import MobileMenuModal from './MobileMenuModal';
import Header from './Header';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import IntelligentDashboard from './IntelligentDashboard';
import Onboarding from './Onboarding';
import SubscriptionPlans from './SubscriptionPlans';
import LoginDialog from './LoginDialog';
import RegistrationForm from './RegistrationForm';
import AuthManager from './AuthManager';
import { useAuth } from '@/contexts/AuthContext';
import IoTControlCenter from './IoTControlCenter';
import ProductionUnitsManagement from './ProductionUnitsManagement';
import InfrastructureManagement from './InfrastructureManagement';
import FishManagement from './FishManagement';
import LivestockManagement from './LivestockManagement';
import FeedingManagement from './FeedingManagement';
import HealthMonitoring from './HealthMonitoring';
import ProductionManagement from './ProductionManagement';
import AccountingManagement from './AccountingManagement';
import HRManagement from './HRManagement';
import SalesManagement from './SalesManagement';
import PurchasesManagement from './PurchasesManagement';
import PlanningManagement from './PlanningManagement';
import WeatherDashboard from './WeatherDashboard';
import TeamManagement from './TeamManagement';
import ReportsManagement from './ReportsManagement';
import SettingsManagement from './SettingsManagement';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { LogsProvider } from '@/contexts/LogsContext';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
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
    setShowRegister(false);
  };

  const handleRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  // Afficher l'onboarding si pas encore vu
  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Afficher les plans de souscription si pas encore sélectionné et utilisateur connecté
  if (user && !hasSelectedPlan) {
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
        return <HealthMonitoring />;
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
      default:
        return <IntelligentDashboard />;
    }
  };

  return (
    <LogsProvider>
      <SettingsProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-background flex flex-col w-full max-w-none m-0 p-0 overflow-x-hidden">
            {/* Header fixe en haut */}
            <div className="w-full max-w-none flex-shrink-0">
              <Header />
            </div>
            
            <div className="flex flex-1 w-full overflow-hidden">
              {/* Sidebar Navigation - masqué sur mobile */}
              <div className="hidden md:block flex-shrink-0">
                <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 w-full max-w-none overflow-auto">
                <main className="p-2 sm:p-4 lg:p-6 safe-area-mobile w-full max-w-none">
                  <div className="w-full max-w-none overflow-hidden">
                    {renderContent()}
                  </div>
                </main>
              </div>
            </div>

            {/* Navigation mobile en bas */}
            <div className="flex-shrink-0 md:hidden">
              <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            
            {/* Modal menu mobile */}
            <MobileMenuModal 
              isOpen={showMobileMenu} 
              onClose={() => setShowMobileMenu(false)} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            {/* Dialogs de connexion/inscription */}
            <AuthManager
              isLoginOpen={showLogin}
              isRegisterOpen={showRegister}
              onCloseLogin={() => setShowLogin(false)}
              onCloseRegister={() => setShowRegister(false)}
            />
          </div>
        </SidebarProvider>
      </SettingsProvider>
    </LogsProvider>
  );
};

export default MainLayout;