import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, Loader2, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

// Demo notifications for non-authenticated users
const demoNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'demo',
    title: 'Température anormale',
    message: 'La température du bassin B1 dépasse 28°C',
    type: 'warning',
    module: 'Surveillance',
    is_read: false,
    is_critical: true,
    metadata: {},
    created_at: new Date().toISOString(),
    read_at: null
  },
  {
    id: '2',
    user_id: 'demo',
    title: 'Nourrissage programmé',
    message: 'Nourrissage du bassin A1 prévu dans 30 minutes',
    type: 'info',
    module: 'Alimentation',
    is_read: false,
    is_critical: false,
    metadata: {},
    created_at: new Date(Date.now() - 1800000).toISOString(),
    read_at: null
  },
  {
    id: '3',
    user_id: 'demo',
    title: 'Nouveau membre ajouté',
    message: 'Sophie Martin a été ajoutée à l\'équipe',
    type: 'success',
    module: 'Équipe',
    is_read: true,
    is_critical: false,
    metadata: {},
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read_at: new Date(Date.now() - 3000000).toISOString()
  }
];

const NotificationsPanel = () => {
  const { isAuthenticated } = useAuth();
  const {
    notifications: realNotifications,
    loading,
    unreadCount: realUnreadCount,
    criticalCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Use demo data if not authenticated
  const [localDemoNotifications, setLocalDemoNotifications] = useState(demoNotifications);
  
  const notifications = isAuthenticated ? realNotifications : localDemoNotifications;
  const unreadCount = isAuthenticated 
    ? realUnreadCount 
    : localDemoNotifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    if (isAuthenticated) {
      markAsRead(id);
    } else {
      setLocalDemoNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
    }
  };

  const handleMarkAllAsRead = () => {
    if (isAuthenticated) {
      markAllAsRead();
    } else {
      setLocalDemoNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
    }
  };

  const handleDelete = (id: string) => {
    if (isAuthenticated) {
      deleteNotification(id);
    } else {
      setLocalDemoNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getIcon = (type: string, isCritical: boolean) => {
    if (isCritical) return <BellRing className="w-4 h-4 text-red-600 animate-pulse" />;
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <X className="w-4 h-4 text-red-600" />;
      case 'success': return <Check className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string, isCritical: boolean) => {
    if (isCritical) return 'border-l-red-500 bg-red-50 dark:bg-red-950/30';
    switch (type) {
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-950/30';
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-950/30';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 min-h-[44px] sm:min-h-0">
          {criticalCount > 0 ? (
            <BellRing className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          ) : (
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          {unreadCount > 0 && (
            <Badge className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] ${criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-red-500'} text-white text-[10px] font-bold flex items-center justify-center p-0 rounded-full`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
              {criticalCount > 0 && (
                <Badge variant="destructive" className="ml-1 animate-pulse">
                  {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                </Badge>
              )}
            </span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                Tout marquer comme lu
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] sm:h-96 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-3 rounded-r-lg transition-all ${getTypeColor(notification.type, notification.is_critical)} ${
                      !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="shrink-0 mt-0.5">
                          {getIcon(notification.type, notification.is_critical)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                            {notification.is_critical && (
                              <Badge variant="destructive" className="ml-2 text-[10px] py-0">
                                CRITIQUE
                              </Badge>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.module}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-center text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes les notifications sont lues'
              }
            </p>
            {!isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground mt-1">
                Connectez-vous pour recevoir vos notifications en temps réel
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsPanel;
