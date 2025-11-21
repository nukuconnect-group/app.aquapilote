import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import MobileMenuModal from './MobileMenuModal';
import Header from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import IntelligentDashboard from './IntelligentDashboard';
import AdminDashboard from './AdminDashboard';
import PWAInstallPrompt from './PWAInstallPrompt';
import IoTControlCenter from './IoTControlCenter';
import ProductionUnitsManagement from './ProductionUnitsManagement';
import InfrastructureManagement from './InfrastructureManagement';
import FishManagement from './FishManagement';
import FeedingManagement from './FeedingManagement';
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
        return <FishManagement />;
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
        <MobileMenuModal 
          isOpen={showMobileMenu} 
          onClose={() => setShowMobileMenu(false)} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
