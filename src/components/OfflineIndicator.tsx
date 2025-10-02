import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { offlineStorage } from '@/lib/offlineStorage';

export const OfflineIndicator = () => {
  const { isOnline, pendingActionsCount } = useOffline();

  const handleSync = async () => {
    try {
      await offlineStorage.syncPendingActions();
    } catch (error) {
      console.error('Erreur de synchronisation manuelle:', error);
    }
  };

  if (isOnline && pendingActionsCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {!isOnline && (
        <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2">
          <WifiOff className="h-4 w-4" />
          Mode hors ligne
        </Badge>
      )}
      
      {isOnline && pendingActionsCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
          <Wifi className="h-4 w-4" />
          {pendingActionsCount} action(s) en attente
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 ml-1"
            onClick={handleSync}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
};
