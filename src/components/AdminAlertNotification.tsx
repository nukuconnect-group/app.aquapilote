import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { format } from 'date-fns';

interface CriticalError {
  id: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

const RESOLVED_TECHNICAL_ERRORS = [
  'Cannot stop, scanner is not running or paused',
];

const getSafeSummary = (details: string) => {
  if (!details) return 'Une erreur interne a été détectée.';
  try {
    const payload = JSON.parse(details);
    const message = payload?.data?.message || payload?.message;
    return typeof message === 'string' ? message : 'Une erreur interne a été détectée.';
  } catch {
    return details.length > 240 ? `${details.slice(0, 240)}…` : details;
  }
};

const AdminAlertNotification = () => {
  const { logs } = useLogs();
  const [criticalErrors, setCriticalErrors] = useState<CriticalError[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Filtrer les erreurs critiques non lues
    const errors = logs
      .filter((log) => {
        if (log.severity !== 'error' || dismissed.has(log.id)) return false;
        const content = `${log.action} ${log.details}`;
        return !RESOLVED_TECHNICAL_ERRORS.some((pattern) => content.includes(pattern));
      })
      .map(log => ({
        id: log.id,
        action: log.action,
        module: log.module,
        details: getSafeSummary(log.details),
        timestamp: log.timestamp
      }))
      .slice(0, 5); // Limiter à 5 erreurs à la fois

    setCriticalErrors(errors);

    // Jouer un son pour les nouvelles erreurs
    if (errors.length > 0 && errors.some(e => !dismissed.has(e.id))) {
      playNotificationSound();
    }
  }, [logs, dismissed]);

  const playNotificationSound = () => {
    // Créer un son d'alerte simple
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const dismissError = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  const dismissAll = () => {
    const allIds = criticalErrors.map(e => e.id);
    setDismissed(prev => {
      const newSet = new Set(prev);
      allIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  if (criticalErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full">
      <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-destructive animate-pulse" />
          <span className="font-medium text-destructive">
            {criticalErrors.length} erreur{criticalErrors.length > 1 ? 's' : ''} critique{criticalErrors.length > 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissAll}
          className="text-destructive hover:text-destructive/80"
        >
          Tout ignorer
        </Button>
      </div>

      {criticalErrors.map((error) => (
        <Alert
          key={error.id}
          variant="destructive"
          className="animate-in slide-in-from-right duration-300 shadow-lg"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>{error.module} - {error.action}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => dismissError(error.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription className="space-y-1">
            <p className="text-sm">{error.details}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(error.timestamp), 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default AdminAlertNotification;