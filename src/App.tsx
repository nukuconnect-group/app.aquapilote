
// React core imports
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductionUnitsProvider } from '@/contexts/ProductionUnitsContext';
import { IoTProvider } from '@/contexts/IoTContext';
import { LogsProvider } from '@/contexts/LogsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';
import { ThemeProvider } from '@/components/ThemeProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import Welcome from '@/pages/Welcome';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import { useIOSDetection } from '@/hooks/useIOSDetection';

const AppContent: React.FC = () => {
  const { isIOSSafari } = useIOSDetection();

  useEffect(() => {
    // Log pour le débogage iOS
    if (isIOSSafari) {
      console.log('Running on iOS Safari - Optimizations active');
    }
  }, [isIOSSafari]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        {/* Page d'accueil - Compatible iOS */}
        <Route path="/" element={<Welcome />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        
        {/* Page d'authentification */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        
        {/* Dashboard protégé par authentification */}
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
        
        {/* Redirection des routes inconnues vers la page d'accueil */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <OfflineIndicator />
      <PWAUpdatePrompt />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="aqua-pilot-theme">
      <ErrorBoundary>
        <BrowserRouter>
          <SettingsProvider>
            <AuthProvider>
              <ProductionUnitsProvider>
                <IoTProvider>
                  <LogsProvider>
                    <AppContent />
                  </LogsProvider>
                </IoTProvider>
              </ProductionUnitsProvider>
            </AuthProvider>
          </SettingsProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
