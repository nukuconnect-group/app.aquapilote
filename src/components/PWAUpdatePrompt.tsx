import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Écouter les messages du service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('✅ Nouvelle version détectée:', event.data.version);
        setShowPrompt(true);
        toast.info('Une nouvelle version est disponible', {
          description: 'Cliquez sur "Mettre à jour" pour actualiser l\'application',
          duration: 10000,
        });
      }
      
      if (event.data && event.data.type === 'CACHE_CLEARED') {
        console.log('✅ Cache vidé avec succès');
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Obtenir l'enregistrement du service worker
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        setRegistration(reg);
        
        // Vérifier les mises à jour au démarrage
        reg.update();
        
        // Vérifier les mises à jour toutes les 30 minutes
        const interval = setInterval(() => {
          console.log('🔄 Vérification des mises à jour...');
          reg.update();
        }, 30 * 60 * 1000);

        return () => clearInterval(interval);
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleUpdate = () => {
    if (!registration || !registration.waiting) {
      // Si pas de SW en attente, forcer un rechargement
      window.location.reload();
      return;
    }

    // Envoyer le message au SW pour qu'il s'active immédiatement
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Attendre que le nouveau SW prenne le contrôle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Nouveau service worker activé, rechargement...');
      window.location.reload();
    });
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-md">
      <Card className="p-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Nouvelle version disponible
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Une mise à jour de l'application est prête à être installée.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Mettre à jour
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
