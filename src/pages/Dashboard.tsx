import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import MobileMenuModal from '@/components/MobileMenuModal';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import OfflineDataManager from '@/components/OfflineDataManager';
import IntelligentDashboard from '@/components/IntelligentDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import IoTControlCenter from '@/components/IoTControlCenter';
import ProductionUnitsManagement from '@/components/ProductionUnitsManagement';
import InfrastructureManagement from '@/components/InfrastructureManagement';
import LivestockManagement from '@/components/LivestockManagement';
import FeedingManagement from '@/components/FeedingManagement';
import ProphylaxieManagement from '@/components/ProphylaxieManagement';
import TransformationManagement from '@/components/TransformationManagement';
import ProductionManagement from '@/components/ProductionManagement';
import AccountingManagement from '@/components/AccountingManagement';
import SuppliersManagement from '@/components/SuppliersManagement';
import HRManagement from '@/components/HRManagement';
import SalesManagement from '@/components/SalesManagement';
import PurchasesManagement from '@/components/PurchasesManagement';
import PlanningManagement from '@/components/PlanningManagement';
import WeatherDashboard from '@/components/WeatherDashboard';
import TeamManagement from '@/components/TeamManagement';
import ReportsManagement from '@/components/ReportsManagement';
import SettingsManagement from '@/components/SettingsManagement';

/**
 * Page principale du dashboard
 * Accessible uniquement aux utilisateurs authentifiés
 */
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
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
      case 'offline':
        return <OfflineDataManager />;
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header fixe en haut sans marges sur mobile */}
          <div className="sticky top-0 z-40 flex items-center border-b border-border bg-background w-full">
            <div className="hidden md:block">
              <SidebarTrigger className="ml-2" />
            </div>
            <div className="flex-1 w-full">
              <Header onNavigate={setActiveTab} />
            </div>
          </div>
          
          {/* Main Content avec scroll */}
          <main className="flex-1 overflow-y-auto p-0 sm:p-4 lg:p-6 pb-20 md:pb-6">
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
        
        {/* Offline Indicator */}
        <OfflineIndicator />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
