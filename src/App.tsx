import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import MainLayout from '@/components/MainLayout';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

// Version ultra-simplifiée pour éviter les problèmes de cache
function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <ProductionUnitsProvider>
            <IoTProvider>
              <LogsProvider>
                <div className="min-h-screen bg-background">
                  <MainLayout />
                  <Toaster />
                </div>
              </LogsProvider>
            </IoTProvider>
          </ProductionUnitsProvider>
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;