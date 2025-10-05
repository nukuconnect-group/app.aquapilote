import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, X, Monitor } from 'lucide-react';
import aquaPilotLogo from '@/assets/aqua-pilot-logo-optimized.webp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      console.log('PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(event);
      
      // Attendre un peu avant de montrer le prompt pour ne pas être intrusif
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // Écouter l'installation réussie
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Ne plus montrer pendant cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas montrer si déjà installé ou rejeté cette session
  if (isInstalled || 
      sessionStorage.getItem('pwa-install-dismissed') === 'true' || 
      !showInstallPrompt || 
      !deferredPrompt) {
    return null;
  }

  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const deviceType = getDeviceType();
  const DeviceIcon = deviceType === 'mobile' ? Smartphone : Monitor;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center md:left-auto md:right-4 md:max-w-sm">
      <Card className="w-full max-w-sm shadow-2xl border-aqua-200 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <img 
                src={aquaPilotLogo} 
                alt="AQUA PILOT" 
                className="w-10 h-10 rounded-lg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  Installer AQUA PILOT
                </h3>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {deviceType === 'mobile' 
                  ? "Installez l'app sur votre téléphone pour un accès rapide et hors-ligne"
                  : "Installez l'app sur votre ordinateur pour un accès rapide depuis le bureau"
                }
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 bg-gradient-aqua text-white text-xs h-8"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Installer
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-3"
                >
                  Plus tard
                </Button>
              </div>
              
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <DeviceIcon className="w-3 h-3" />
                <span>
                  {deviceType === 'mobile' ? 'Ajout à l\'écran d\'accueil' : 'Application de bureau'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;