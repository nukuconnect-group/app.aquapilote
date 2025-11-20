import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useIOSNetworkStatus } from '@/hooks/useIOSDetection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Composant de protection de route
 * Redirige vers la page d'authentification si l'utilisateur n'est pas connecté
 * Affiche un loader pendant la vérification de la session
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, isDemoMode } = useAuth();
  const { isOnline, showReconnecting } = useIOSNetworkStatus();

  // Afficher un loader pendant la vérification de la session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Vérification de votre session...</p>
          
          {/* Indicateur de connexion pour iOS */}
          {showReconnecting && (
            <div className="flex items-center justify-center gap-2 text-yellow-600 mt-4">
              <WifiOff className="h-5 w-5" />
              <span className="text-sm">Reconnexion en cours...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rediriger vers /auth si non connecté et pas en mode démo
  if (!user && !isDemoMode) {
    return <Navigate to="/auth" replace />;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
