
// React core imports
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import Welcome from '@/pages/Welcome';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <AuthProvider>
            <ProductionUnitsProvider>
              <IoTProvider>
                <LogsProvider>
                  <div style={{ minHeight: '100vh' }}>
                    <Routes>
                      {/* Page d'accueil avec splash screen et onboarding */}
                      <Route path="/" element={<Welcome />} />
                      
                      {/* Page d'authentification */}
                      <Route path="/auth" element={<Auth />} />
                      
                      {/* Dashboard protégé (nécessite authentification) */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Page 404 */}
                      <Route path="/404" element={<NotFound />} />
                      
                      {/* Redirection des routes inconnues vers 404 */}
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                    <Toaster />
                    <OfflineIndicator />
                  </div>
                </LogsProvider>
              </IoTProvider>
            </ProductionUnitsProvider>
          </AuthProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
