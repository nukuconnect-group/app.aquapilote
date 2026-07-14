import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  HardDrive,
  FileUp
} from 'lucide-react';
import { useOfflineContext } from '@/contexts/OfflineContext';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useSettings } from '@/contexts/SettingsContext';
import FileUploadManager from './FileUploadManager';
import OfflineFilesSync from './OfflineFilesSync';
import PWAInstallCard from './PWAInstallCard';

export const OfflineDataManager = () => {
  const {
    isOnline,
    isSyncing,
    pendingActionsCount,
    lastSyncTime,
    cachedDataInfo,
    syncData,
    preloadData,
    clearCache,
  } = useOfflineContext();
  
  const { t, language } = useSettings();
  const dateLocale = language === 'fr' ? fr : enUS;

  const [isPreloading, setIsPreloading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handlePreload = async () => {
    setIsPreloading(true);
    try {
      await preloadData();
    } finally {
      setIsPreloading(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Êtes-vous sûr de vouloir vider le cache ? Vous devrez recharger les données.')) {
      setIsClearing(true);
      try {
        await clearCache();
      } finally {
        setIsClearing(false);
      }
    }
  };

  const cacheSizeMB = (cachedDataInfo.totalSize / (1024 * 1024)).toFixed(2);
  const totalCachedItems = Object.values(cachedDataInfo.tables).reduce(
    (sum, table) => sum + table.count,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
              <Database className="h-5 h-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="break-words">{t('offline_mode')}</span>
            </h2>
            <p className="text-blue-100 text-sm sm:text-base">
              {t('offline_management_desc')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge className="bg-green-500 text-white text-xs sm:text-sm">
                <Wifi className="h-3 h-3 sm:h-4 sm:w-4 mr-1" />
                {t('online')}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500 text-white text-xs sm:text-sm">
                <WifiOff className="h-3 h-3 sm:h-4 sm:w-4 mr-1" />
                {t('offline')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Installation PWA */}
      <PWAInstallCard />

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{cacheSizeMB} Mo</p>
            <p className="text-xs sm:text-sm text-gray-600">Taille du cache</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{totalCachedItems}</p>
            <p className="text-xs sm:text-sm text-gray-600">Éléments en cache</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              {pendingActionsCount > 0 ? (
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{pendingActionsCount}</p>
            <p className="text-xs sm:text-sm text-gray-600">Actions en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Actions rapides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gérez vos données hors ligne
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <Button
            onClick={handlePreload}
            disabled={isPreloading || !isOnline}
            className="w-full text-sm sm:text-base"
          >
            <Download className={`h-4 w-4 mr-2 ${isPreloading ? 'animate-bounce' : ''}`} />
            {isPreloading ? 'Téléchargement en cours...' : 'Télécharger toutes les données'}
          </Button>

          <Button
            onClick={syncData}
            disabled={isSyncing || !isOnline || pendingActionsCount === 0}
            variant="outline"
            className="w-full text-sm sm:text-base"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </Button>

          <Button
            onClick={handleClearCache}
            disabled={isClearing || totalCachedItems === 0}
            variant="destructive"
            className="w-full text-sm sm:text-base"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vider le cache
          </Button>
        </CardContent>
      </Card>

      {/* Détails des données en cache */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Données disponibles hors ligne</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {totalCachedItems > 0 
              ? `${Object.keys(cachedDataInfo.tables).length} table(s) en cache`
              : 'Aucune donnée en cache'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {totalCachedItems > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(cachedDataInfo.tables).map(([table, info]) => (
                <div key={table} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base break-words">{table}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {info.count} élément{info.count > 1 ? 's' : ''}
                        {info.lastUpdate && (
                          <> • Mis à jour {formatDistanceToNow(info.lastUpdate, { 
                            addSuffix: true, 
                            locale: fr 
                          })}</>
                        )}
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                      {info.count}
                    </Badge>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Aucune donnée en cache
              </p>
              <Button
                onClick={handlePreload}
                disabled={isPreloading || !isOnline}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger les données
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info sur la dernière synchronisation */}
      {lastSyncTime && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Dernière synchronisation</p>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  {formatDistanceToNow(lastSyncTime, { 
                    addSuffix: true, 
                    locale: fr 
                  })} • {lastSyncTime.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information sur le mode hors ligne */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium mb-2 text-sm sm:text-base">
                💡 Comment fonctionne le mode hors ligne ?
              </h4>
              <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                <li className="break-words">
                  • Vos données sont automatiquement mises en cache quand vous êtes en ligne
                </li>
                <li className="break-words">
                  • Vous pouvez consulter toutes vos données même sans connexion Internet
                </li>
                <li className="break-words">
                  • Les modifications effectuées hors ligne sont synchronisées automatiquement
                </li>
                <li className="break-words">
                  • Les images sont compressées automatiquement avant l'upload
                </li>
                <li className="break-words">
                  • Cliquez sur "Télécharger toutes les données" pour forcer une mise à jour
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des fichiers et photos */}
      <Tabs defaultValue="upload" className="space-y-4">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              <FileUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Upload de fichiers
            </TabsTrigger>
            <TabsTrigger value="sync" className="text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Synchronisation
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upload">
          <FileUploadManager 
            module="general" 
            moduleLabel="Général"
          />
        </TabsContent>

        <TabsContent value="sync">
          <OfflineFilesSync />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfflineDataManager;
