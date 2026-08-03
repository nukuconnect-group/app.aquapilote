import { useCallback, useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALLED_KEY = 'aqua-pwa-installed';

export const isStandaloneDisplay = (): boolean => {
  if (typeof window === 'undefined') return false;
  const standaloneMedia =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches;
  const iosStandalone = (window.navigator as any).standalone === true;
  return Boolean(standaloneMedia || iosStandalone);
};

/** Chromium-based browsers fire `beforeinstallprompt` when the app is installable. */
export const supportsInstallPrompt = (): boolean =>
  typeof window !== 'undefined' && 'onbeforeinstallprompt' in window;

interface PWAInstallState {
  /** L'app est installée (ou lancée en mode application) */
  isInstalled: boolean;
  /** Une installation native est proposable maintenant */
  canPromptInstall: boolean;
  /** Détection terminée : évite d'afficher une bannière trop tôt */
  isReady: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

export const usePWAInstallState = (): PWAInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandaloneDisplay());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const markInstalled = (installed: boolean) => {
      if (cancelled) return;
      setIsInstalled(installed);
      try {
        if (installed) localStorage.setItem(INSTALLED_KEY, 'true');
        else localStorage.removeItem(INSTALLED_KEY);
      } catch {}
    };

    const detect = async () => {
      if (isStandaloneDisplay()) {
        markInstalled(true);
        setIsReady(true);
        return;
      }

      // Android / Chromium : source de vérité fiable même dans un onglet navigateur
      const getInstalled = (navigator as any).getInstalledRelatedApps;
      if (typeof getInstalled === 'function') {
        try {
          const related = await getInstalled.call(navigator);
          if (Array.isArray(related) && related.length > 0) {
            markInstalled(true);
            setIsReady(true);
            return;
          }
          // API disponible et aucune app liée => réellement désinstallée
          markInstalled(false);
          setIsReady(true);
          return;
        } catch {}
      }

      // Sinon on retombe sur la mémoire locale (par navigateur/profil)
      let remembered = false;
      try {
        remembered = localStorage.getItem(INSTALLED_KEY) === 'true';
      } catch {}
      if (!cancelled) {
        setIsInstalled(remembered);
        setIsReady(true);
      }
    };

    detect();

    // Si l'évènement se déclenche, l'app N'EST PAS installée (ou a été désinstallée)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      markInstalled(false);
      setIsReady(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      markInstalled(true);
    };

    const displayModeQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayChange = () => markInstalled(isStandaloneDisplay());
    displayModeQuery?.addEventListener?.('change', handleDisplayChange);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      cancelled = true;
      displayModeQuery?.removeEventListener?.('change', handleDisplayChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return 'unavailable' as const;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch {}
      }
      return outcome;
    } catch {
      setDeferredPrompt(null);
      return 'unavailable' as const;
    }
  }, [deferredPrompt]);

  return {
    isInstalled,
    canPromptInstall: Boolean(deferredPrompt) && !isInstalled,
    isReady,
    promptInstall,
  };
};
