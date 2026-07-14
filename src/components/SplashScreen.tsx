import React, { useEffect, useState } from 'react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-small.webp';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation de progression sur 3 secondes (30ms * 100 = 3000ms)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 30); // 30ms par increment pour 3 secondes total

    // Timer principal pour masquer le splash après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Attendre la fin de l'animation de sortie avant d'appeler onComplete
      setTimeout(onComplete, 500);
    }, 3000); // 3 secondes

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-aqua-600 via-blue-700 to-aqua-800 flex items-center justify-center z-[9999] transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="text-center max-w-md mx-auto px-8">
        {/* Logo avec animation */}
        <div className="relative mb-10">
          <div className="animate-fade-in">
            <img 
              src={aquaPilotLogo} 
              alt="AQUAPILOTE" 
              className="w-40 h-40 mx-auto drop-shadow-2xl rounded-3xl animate-pulse"
            />
          </div>
          {/* Cercles animés autour du logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-white/20 rounded-full animate-ping"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center animation-delay-300">
            <div className="w-56 h-56 border-4 border-white/10 rounded-full animate-ping"></div>
          </div>
        </div>
        
        {/* Titre avec animation */}
        <h1 className="text-6xl font-bold text-white mb-4 tracking-wide animate-fade-in drop-shadow-lg">
          AQUAPILOTE
        </h1>
        
        <p className="text-2xl text-blue-100 font-medium mb-12 animate-fade-in">
          Gestion Piscicole Intelligente
        </p>
        
        {/* Barre de progression moderne */}
        <div className="relative w-full mb-6">
          <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-4 overflow-hidden shadow-lg">
            <div 
              className="bg-gradient-to-r from-white to-blue-200 h-full rounded-full transition-all duration-100 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Pourcentage de chargement avec style amélioré */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
          <p className="text-white text-2xl font-bold drop-shadow-md">
            {progress}%
          </p>
        </div>
        
        {/* Message de chargement */}
        <p className="text-white/70 text-sm font-medium animate-fade-in">
          Initialisation de l'application...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;