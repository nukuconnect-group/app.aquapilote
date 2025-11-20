import { useEffect, useState } from 'react';

/**
 * Hook pour détecter iOS Safari et optimiser l'expérience
 */
export const useIOSDetection = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Détecter Safari
    const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safari);

    // Détecter si l'app est en mode standalone (PWA installée)
    const standalone = (window.navigator as any).standalone === true || 
                      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Ajouter des classes au body pour le CSS
    if (iOS) {
      document.body.classList.add('ios-device');
    }
    if (safari) {
      document.body.classList.add('safari-browser');
    }
    if (standalone) {
      document.body.classList.add('pwa-standalone');
    }

    // Fix pour le viewport height sur iOS
    if (iOS) {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      
      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);

      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    }
  }, []);

  return {
    isIOS,
    isSafari,
    isStandalone,
    isIOSSafari: isIOS && isSafari
  };
};

/**
 * Hook pour gérer les erreurs réseau sur iOS
 */
export const useIOSNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnecting(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Pour iOS, vérifier périodiquement la connexion
    const checkConnection = setInterval(() => {
      if (!navigator.onLine && isOnline) {
        setIsOnline(false);
        setShowReconnecting(true);
      } else if (navigator.onLine && !isOnline) {
        setIsOnline(true);
        setShowReconnecting(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkConnection);
    };
  }, [isOnline]);

  return {
    isOnline,
    showReconnecting
  };
};