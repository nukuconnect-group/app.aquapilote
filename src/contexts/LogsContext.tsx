
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  addLog: (action: string, module: string, details: string, severity?: 'info' | 'warning' | 'error' | 'success') => void;
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

  useEffect(() => {
    // Charger les logs depuis le localStorage
    const savedLogs = localStorage.getItem('app_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  useEffect(() => {
    // Sauvegarder les logs dans le localStorage
    localStorage.setItem('app_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (action: string, module: string, details: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    if (!user) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      action,
      module,
      details,
      severity
    };

    setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Garder seulement les 1000 derniers logs
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('app_logs');
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
