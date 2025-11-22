import { Wifi, WifiOff, RefreshCw, Database, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOfflineContext } from '@/contexts/OfflineContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const OfflineIndicator = () => {
  const { 
    isOnline, 
    isSyncing, 
    pendingActionsCount, 
    lastSyncTime, 
    cachedDataInfo,
    syncData 
  } = useOfflineContext();

  const handleSync = async () => {
    await syncData();
  };

  // Calculer la taille du cache en Mo
  const cacheSizeMB = (cachedDataInfo.totalSize / (1024 * 1024)).toFixed(2);
  const totalCachedItems = Object.values(cachedDataInfo.tables).reduce(
    (sum, table) => sum + table.count, 
    0
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isOnline ? "secondary" : "outline"}
            size="sm"
            className={`flex items-center gap-2 shadow-lg ${
              !isOnline ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900' : ''
            }`}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-xs sm:text-sm font-medium">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
            {pendingActionsCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-xs">
                {pendingActionsCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 sm:w-96" align="end">
          <div className="space-y-4">
            {/* En-tête */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-600" />
                    Mode en ligne
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-yellow-600" />
                    Mode hors ligne
                  </>
                )}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSync}
                disabled={isSyncing || !isOnline}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Statut */}
            <div className="space-y-2 text-sm">
              {!isOnline && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-1">
                    📱 Vous êtes hors ligne
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                    Vous pouvez continuer à consulter vos données. Elles seront synchronisées automatiquement quand vous serez de nouveau en ligne.
                  </p>
                </div>
              )}

              {pendingActionsCount > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
                    ⏳ {pendingActionsCount} action(s) en attente
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    {isOnline 
                      ? 'Synchronisation en cours...' 
                      : 'Seront synchronisées dès que vous serez en ligne'}
                  </p>
                </div>
              )}
            </div>

            {/* Données en cache */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Données disponibles hors ligne
              </h4>
              
              {totalCachedItems > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(cachedDataInfo.tables).map(([table, info]) => (
                      <div key={table} className="p-2 bg-muted rounded">
                        <p className="font-medium truncate">{table}</p>
                        <p className="text-muted-foreground">
                          {info.count} élément{info.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total: {cacheSizeMB} Mo en cache
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground p-3 bg-muted rounded text-center">
                  Aucune donnée en cache pour le moment
                </p>
              )}
            </div>

            {/* Dernière synchronisation */}
            {lastSyncTime && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Clock className="h-3 w-3" />
                Dernière sync: {formatDistanceToNow(lastSyncTime, { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
