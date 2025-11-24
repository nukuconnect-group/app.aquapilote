
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface LogsContextType {
  logs: LogEntry[];
  addLog: (action: string, module: string, details: string, severity?: 'info' | 'warning' | 'error' | 'success') => Promise<void>;
  clearLogs: () => void;
  getLogsByModule: (module: string) => LogEntry[];
  getLogsByUser: (userId: string) => LogEntry[];
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export const useLogs = () => {
  const context = useContext(LogsContext);
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogsProvider');
  }
  return context;
};

export const LogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { user } = useAuth();

  // Charger les logs depuis Supabase
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1000);

        if (error) {
          console.error('Error loading logs:', error);
          return;
        }

        if (data && Array.isArray(data)) {
          const formattedLogs = data.map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp,
            userId: log.user_id || '',
            userName: log.user_name,
            action: log.action,
            module: log.module,
            details: log.details || '',
            severity: log.severity as 'info' | 'warning' | 'error' | 'success'
          }));
          setLogs(formattedLogs);
        }
      } catch (error) {
        console.error('Error loading logs:', error);
      }
    };

    loadLogs();
  }, []);

  // Écouter les nouveaux logs en temps réel (Supabase Realtime)
  useEffect(() => {
    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          console.log('New log received:', payload);
          const newLog = payload.new as any;
          const formattedLog: LogEntry = {
            id: newLog.id,
            timestamp: newLog.timestamp,
            userId: newLog.user_id || '',
            userName: newLog.user_name,
            action: newLog.action,
            module: newLog.module,
            details: newLog.details || '',
            severity: newLog.severity
          };
          setLogs(prev => [formattedLog, ...prev].slice(0, 1000));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addLog = async (action: string, module: string, details: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_name: user.name,
          action,
          module,
          details,
          severity,
          timestamp: new Date().toISOString()
        } as any);

      if (error) {
        console.error('Error adding log:', error);
      }
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogsByModule = (module: string) => {
    return logs.filter(log => log.module === module);
  };

  const getLogsByUser = (userId: string) => {
    return logs.filter(log => log.userId === userId);
  };

  return (
    <LogsContext.Provider value={{
      logs,
      addLog,
      clearLogs,
      getLogsByModule,
      getLogsByUser
    }}>
      {children}
    </LogsContext.Provider>
  );
};
