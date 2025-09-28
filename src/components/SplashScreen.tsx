import React, { useEffect, useState } from 'react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animation de progression sur 10 secondes
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1; // +1% toutes les 100ms = 10 secondes
      });
    }, 100);

    // Timer principal pour masquer le splash
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Animation de sortie plus longue
    }, 10000); // 10 secondes exactement

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
      <div className="text-center max-w-sm mx-auto px-8">
        {/* Logo avec animation plus prononcée */}
        <div className="relative mb-8">
          <div className="animate-bounce">
            <img 
              src={aquaPilotLogo} 
              alt="AQUA PILOT" 
              className="w-32 h-32 mx-auto drop-shadow-2xl rounded-2xl"
            />
          </div>
          {/* Cercles animés autour du logo */}
          <div className="absolute inset-0 animate-ping">
            <div className="w-32 h-32 mx-auto border-2 border-white/30 rounded-full"></div>
          </div>
        </div>
        
        {/* Titre avec animation */}
        <h1 className="text-5xl font-bold text-white mb-3 tracking-wide animate-fade-in">
          AQUA PILOT
        </h1>
        
        <p className="text-xl text-blue-100 font-medium mb-8 animate-fade-in">
          Gestion Piscicole Intelligente
        </p>
        
        {/* Barre de progression */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Pourcentage de chargement */}
        <p className="text-white/80 text-sm font-medium mb-6">
          Chargement... {progress}%
        </p>
        
        {/* Spinner animé */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;