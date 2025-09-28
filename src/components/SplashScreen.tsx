import React, { useEffect, useState } from 'react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Attendre la fin de l'animation
    }, 4000); // Afficher pendant 4 secondes

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        <div className="animate-pulse">
          <img 
            src={aquaPilotLogo} 
            alt="AQUA PILOT" 
            className="w-24 h-24 mx-auto mb-6 drop-shadow-xl"
          />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
          AQUA PILOT
        </h1>
        
        <p className="text-xl text-blue-200 font-medium mb-8">
          Gestion Piscicole Intelligente
        </p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;