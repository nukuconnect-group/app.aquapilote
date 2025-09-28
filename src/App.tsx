
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';

const AppContent: React.FC = () => {
  console.log('AppContent rendering');
  return <MainLayout />;
};

const App: React.FC = () => {
  console.log('App rendering');
  
  return (
    <div style={{ minHeight: '100vh' }}>
      <BrowserRouter>
        <SettingsProvider>
          <AuthProvider>
            <ProductionUnitsProvider>
              <IoTProvider>
                <LogsProvider>
                  <AppContent />
                  <Toaster />
                </LogsProvider>
              </IoTProvider>
            </ProductionUnitsProvider>
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
