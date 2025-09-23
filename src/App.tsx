
import React from 'react';
import MainLayout from '@/components/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';

const AppContent: React.FC = () => {
  return <MainLayout />;
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
