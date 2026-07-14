import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Waves } from 'lucide-react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-main.png';

/**
 * Page d'accueil - Affiche le logo et redirige vers l'authentification
 * Redirige vers le dashboard si déjà connecté
 */
const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, hasSeenOnboarding, isDemoMode } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Marquer comme prêt après un court délai pour iOS
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
      navigate('/dashboard', { replace: true });
    } else if (!isLoading && !user && !isDemoMode && !hasSeenOnboarding) {
      // Si pas connecté et pas vu l'onboarding, rediriger vers l'onboarding
      navigate('/onboarding', { replace: true });
    }
  }, [user, isLoading, hasSeenOnboarding, isDemoMode, navigate]);

  const handleGetStarted = () => {
    navigate('/auth', { replace: true });
  };

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4">
      <div className="text-center space-y-8 max-w-2xl w-full">
        {/* Logo AQUAPILOTE avec fallback pour iOS */}
        <div className="flex justify-center mb-8">
          {!imageError ? (
            <img 
              src={aquaPilotLogo} 
              alt="AQUAPILOTE Logo" 

              className="h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 w-auto object-contain transition-opacity duration-300"
              onError={() => setImageError(true)}
              loading="eager"
            />
          ) : (
            <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
              <Waves className="h-32 w-32 text-primary" />
            </div>
          )}
        </div>

        {/* Titre et description */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            Bienvenue sur AQUAPILOTE
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto">
            Votre solution professionnelle de gestion aquacole intelligente
          </p>
        </div>

        {/* Bouton de connexion */}
        <div className="pt-8">
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="px-8 py-6 text-lg font-semibold"
          >
            Commencer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
