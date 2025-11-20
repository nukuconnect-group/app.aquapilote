import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOffline } from '@/hooks/useOffline';
import { offlineSync } from '@/lib/offlineSync';
import { useSettings } from '@/contexts/SettingsContext';

const OfflineSyncIndicator = () => {
  const { isOnline, pendingActionsCount } = useOffline();
  const { language } = useSettings();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Afficher l'indicateur si hors ligne ou si des actions sont en attente
    setShowIndicator(!isOnline || pendingActionsCount > 0);

    const handleSyncComplete = () => {
      setIsSyncing(false);
    };

    window.addEventListener('offline-sync-complete', handleSyncComplete);
    
    return () => {
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, [isOnline, pendingActionsCount]);

  const handleManualSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    await offlineSync.sync();
  };

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 items-end">
      {/* Indicateur de connexion */}
      <Badge 
        variant={isOnline ? "default" : "secondary"}
        className={`
          flex items-center gap-2 px-3 py-2 shadow-lg
          ${isOnline ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-500 hover:bg-gray-600'}
          transition-all duration-300
        `}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-medium">
              {language === 'fr' ? 'En ligne' : 'Online'}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-xs font-medium">
              {language === 'fr' ? 'Hors ligne' : 'Offline'}
            </span>
          </>
        )}
      </Badge>

      {/* Compteur d'actions en attente */}
      {pendingActionsCount > 0 && (
        <Badge 
          variant="outline"
          className="flex items-center gap-2 px-3 py-2 shadow-lg bg-background border-2 border-orange-500"
        >
          <CloudOff className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-orange-500">
            {pendingActionsCount} {language === 'fr' ? 'action(s) en attente' : 'pending action(s)'}
          </span>
          
          {isOnline && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-1"
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </Badge>
      )}

      {/* Indicateur de synchronisation en cours */}
      {isSyncing && (
        <Badge 
          variant="outline"
          className="flex items-center gap-2 px-3 py-2 shadow-lg bg-background border-2 border-blue-500 animate-pulse"
        >
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-xs font-medium text-blue-500">
            {language === 'fr' ? 'Synchronisation...' : 'Syncing...'}
          </span>
        </Badge>
      )}
    </div>
  );
};

export default OfflineSyncIndicator;
