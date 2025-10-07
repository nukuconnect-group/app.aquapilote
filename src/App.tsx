
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppContent: React.FC = () => {
  return <MainLayout />;
};

const App: React.FC = () => {
  console.log('App component rendering');
  
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProductionUnitsProvider>
            <IoTProvider>
              <LogsProvider>
                <ErrorBoundary>
                  <div style={{ minHeight: '100vh' }}>
                    <AppContent />
                    <Toaster />
                    <OfflineIndicator />
                  </div>
                </ErrorBoundary>
              </LogsProvider>
            </IoTProvider>
          </ProductionUnitsProvider>
        </AuthProvider>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
