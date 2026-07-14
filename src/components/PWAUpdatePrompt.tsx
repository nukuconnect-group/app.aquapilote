import { useEffect } from 'react';

export const PWAUpdatePrompt = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Auto-appliquer les mises à jour dès qu'un nouveau SW est en attente,
    // sans afficher de prompt à l'utilisateur. Le reload est déclenché par
    // le listener controllerchange dans main.tsx.
    const activateWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        activateWaiting(reg);
        reg.update();
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed') activateWaiting(reg);
          });
        });
      }
    });
  }, []);

  return null;
};
