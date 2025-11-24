import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Database,
  Image,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface CacheInfo {
  name: string;
  size: number;
  count: number;
  type: 'static' | 'dynamic' | 'images' | 'api';
}

export const CacheManager = () => {
  const [cacheList, setCacheList] = useState<CacheInfo[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadCacheInfo = async () => {
    if (!('caches' in window)) {
      toast.error('Cache API non disponible dans ce navigateur');
      return;
    }

    setLoading(true);
    try {
      const cacheNames = await window.caches.keys();
      const cacheInfos: CacheInfo[] = [];
      let total = 0;

      for (const cacheName of cacheNames) {
        const cache = await window.caches.open(cacheName);
        const keys = await cache.keys();
        
        let cacheSize = 0;
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            cacheSize += blob.size;
          }
        }

        const type = cacheName.includes('images') ? 'images' 
          : cacheName.includes('api') ? 'api'
          : cacheName.includes('static') ? 'static'
          : 'dynamic';

        cacheInfos.push({
          name: cacheName,
          size: cacheSize,
          count: keys.length,
          type
        });

        total += cacheSize;
      }

      setCacheList(cacheInfos);
      setTotalSize(total);
    } catch (error) {
      console.error('Erreur lors du chargement des infos de cache:', error);
      toast.error('Erreur lors du chargement des informations de cache');
    } finally {
      setLoading(false);
    }
  };

  const clearAllCaches = async () => {
    if (!('caches' in window)) return;

    setClearing(true);
    try {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map(name => window.caches.delete(name)));
      
      // Notifier le service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      }

      toast.success('Cache vidé avec succès');
      await loadCacheInfo();
      
      // Recharger la page après 1 seconde
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
      toast.error('Erreur lors du nettoyage du cache');
    } finally {
      setClearing(false);
    }
  };

  const clearSpecificCache = async (cacheName: string) => {
    try {
      await window.caches.delete(cacheName);
      toast.success(`Cache "${cacheName}" supprimé`);
      await loadCacheInfo();
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
      toast.error('Erreur lors de la suppression du cache');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getCacheIcon = (type: CacheInfo['type']) => {
    switch (type) {
      case 'images':
        return <Image className="h-4 w-4" />;
      case 'api':
        return <Database className="h-4 w-4" />;
      case 'static':
        return <FileText className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const getCacheTypeLabel = (type: CacheInfo['type']) => {
    switch (type) {
      case 'images':
        return 'Images';
      case 'api':
        return 'API';
      case 'static':
        return 'Statique';
      default:
        return 'Dynamique';
    }
  };

  useEffect(() => {
    loadCacheInfo();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Gestion du Cache PWA
            </CardTitle>
            <CardDescription>
              Gérez le cache de l'application pour optimiser les performances
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCacheInfo}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllCaches}
              disabled={clearing || cacheList.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tout vider
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Résumé global */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Taille Totale</span>
            </div>
            <p className="text-2xl font-bold">{formatBytes(totalSize)}</p>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Caches</span>
            </div>
            <p className="text-2xl font-bold">{cacheList.length}</p>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Éléments</span>
            </div>
            <p className="text-2xl font-bold">
              {cacheList.reduce((acc, cache) => acc + cache.count, 0)}
            </p>
          </div>
        </div>

        {/* Liste des caches */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Caches Disponibles</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Chargement des informations...</p>
            </div>
          ) : cacheList.length === 0 ? (
            <div className="text-center py-8 rounded-lg border border-dashed">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucun cache disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cacheList.map((cache) => (
                <div
                  key={cache.name}
                  className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getCacheIcon(cache.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getCacheTypeLabel(cache.type)}
                          </Badge>
                        </div>
                        <p className="text-sm font-mono text-muted-foreground truncate">
                          {cache.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSpecificCache(cache.name)}
                      className="ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {cache.count} élément{cache.count > 1 ? 's' : ''}
                      </span>
                      <span className="font-medium">{formatBytes(cache.size)}</span>
                    </div>
                    <Progress 
                      value={(cache.size / totalSize) * 100} 
                      className="h-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">À propos du cache</p>
              <p className="text-muted-foreground text-xs">
                Le cache permet à l'application de fonctionner hors ligne et d'améliorer les performances. 
                Vider le cache supprimera les données temporaires et nécessitera de les recharger.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
