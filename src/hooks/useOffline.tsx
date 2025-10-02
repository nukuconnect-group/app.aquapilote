import { useState, useEffect } from 'react';
import { offlineStorage, getConnectionStatus } from '@/lib/offlineStorage';
import { useToast } from '@/hooks/use-toast';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        toast({
          title: "Connexion rétablie",
          description: "Synchronisation des données en cours...",
          duration: 3000,
        });
        syncPendingActions();
      } else {
        toast({
          title: "Mode hors ligne",
          description: "Vos modifications seront synchronisées à la reconnexion.",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    const syncPendingActions = async () => {
      try {
        await offlineStorage.syncPendingActions();
        updatePendingCount();
      } catch (error) {
        console.error('Erreur de synchronisation:', error);
      }
    };

    const updatePendingCount = async () => {
      try {
        const actions = await offlineStorage.getPendingActions();
        setPendingActionsCount(actions.length);
      } catch (error) {
        console.error('Erreur lors du comptage des actions:', error);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Mettre à jour le compteur initial
    updatePendingCount();

    // Vérifier régulièrement les actions en attente
    const interval = setInterval(updatePendingCount, 10000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [toast]);

  const addOfflineAction = async (
    type: string,
    data: any,
    endpoint: string,
    method: string = 'POST'
  ) => {
    try {
      await offlineStorage.addPendingAction({ type, data, endpoint, method });
      setPendingActionsCount(prev => prev + 1);
      
      if (!isOnline) {
        toast({
          title: "Action enregistrée",
          description: "Sera synchronisée à la reconnexion",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'action:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'action",
        variant: "destructive",
      });
    }
  };

  const saveOfflineData = async (key: string, data: any) => {
    try {
      await offlineStorage.saveOfflineData(key, data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const getOfflineData = async (key: string) => {
    try {
      return await offlineStorage.getOfflineData(key);
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return null;
    }
  };

  return {
    isOnline,
    pendingActionsCount,
    addOfflineAction,
    saveOfflineData,
    getOfflineData,
    connectionStatus: getConnectionStatus(),
  };
};
