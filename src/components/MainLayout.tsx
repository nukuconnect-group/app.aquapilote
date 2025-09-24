
import React, { useState } from 'react';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import MobileMenuModal from './MobileMenuModal';
import Header from './Header';
import IntelligentDashboard from './IntelligentDashboard';
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

  const handleTabChange = (tab: string) => {
    if (tab === 'settings') {
      setShowMobileMenu(true);
    } else {
      setActiveTab(tab);
    }
  };

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
              <main className="p-3 sm:p-4 lg:p-6 overflow-auto pb-20 md:pb-6 max-w-full">
                <div className="w-full max-w-none">
                  {renderContent()}
                </div>
              </main>
            </div>
          </div>

          {/* Navigation mobile en bas */}
          <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          
          {/* Modal menu mobile */}
          <MobileMenuModal 
            isOpen={showMobileMenu}
            onClose={() => setShowMobileMenu(false)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </SettingsProvider>
    </LogsProvider>
  );
};

export default MainLayout;
