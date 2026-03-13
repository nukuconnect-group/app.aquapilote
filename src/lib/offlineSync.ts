// Système de synchronisation automatique en arrière-plan
import { offlineStorage } from './offlineStorage';

class OfflineSync {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs: number = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync();
      }
    }, intervalMs);

    // Synchroniser immédiatement si en ligne
    if (navigator.onLine) {
      this.sync();
    }
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Synchroniser manuellement
  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    
    try {
      await offlineStorage.syncPendingActions();
      
      // Émettre un événement de synchronisation réussie
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: { success: true }
      }));
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: { success: false, error }
      }));
    } finally {
      this.isSyncing = false;
    }
  }

  // Obtenir le statut de synchronisation
  getSyncStatus(): { isSyncing: boolean; isOnline: boolean } {
    return {
      isSyncing: this.isSyncing,
      isOnline: navigator.onLine
    };
  }
}

// Instance singleton
export const offlineSync = new OfflineSync();

// Démarrer la synchronisation automatique au chargement
if (typeof window !== 'undefined') {
  // Attendre que l'app soit prête
  window.addEventListener('load', () => {
    offlineSync.startAutoSync();
  });

  // Synchroniser quand la connexion est rétablie
  window.addEventListener('online', () => {
    offlineSync.sync();
  });
}
