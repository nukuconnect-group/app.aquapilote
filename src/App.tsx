
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ProductionUnitsManagement from '@/components/ProductionUnitsManagement';
import InfrastructureManagement from '@/components/InfrastructureManagement';
import FishManagement from '@/components/FishManagement';
import LivestockManagement from '@/components/LivestockManagement';
import FeedingManagement from '@/components/FeedingManagement';
import HealthMonitoring from '@/components/HealthMonitoring';
import ProductionManagement from '@/components/ProductionManagement';
import AccountingManagement from '@/components/AccountingManagement';
import HRManagement from '@/components/HRManagement';
import SalesManagement from '@/components/SalesManagement';
import PlanningManagement from '@/components/PlanningManagement';
import WeatherDashboard from '@/components/WeatherDashboard';
import TeamManagement from '@/components/TeamManagement';
import ReportsManagement from '@/components/ReportsManagement';
import SettingsManagement from '@/components/SettingsManagement';
import IoTControlCenter from '@/components/IoTControlCenter';
import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import PurchasesManagement from './components/PurchasesManagement';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white shadow-lg">
          <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {(() => {
              switch (activeTab) {
                case 'dashboard':
                  return <Dashboard />;
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
                case 'purchases':
                  return <PurchasesManagement />;
                case 'sales':
                  return <SalesManagement />;
                case 'hr':
                  return <HRManagement />;
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
                  return <Dashboard />;
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductionUnitsProvider>
        <IoTProvider>
          <LogsProvider>
            <SettingsProvider>
              <AppContent />
              <Toaster />
            </SettingsProvider>
          </LogsProvider>
        </IoTProvider>
      </ProductionUnitsProvider>
    </AuthProvider>
  );
};

export default App;
