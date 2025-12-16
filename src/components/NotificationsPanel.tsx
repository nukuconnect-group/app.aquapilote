
import React, { useState } from 'react';
import { Bell, X, Check, AlertTriangle, Info, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  module: string;
}

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Température anormale',
      message: 'La température du bassin B1 dépasse 28°C',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      module: 'Surveillance'
    },
    {
      id: '2',
      title: 'Nourrissage programmé',
      message: 'Nourrissage du bassin A1 prévu dans 30 minutes',
      type: 'info',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false,
      module: 'Alimentation'
    },
    {
      id: '3',
      title: 'Nouveau membre ajouté',
      message: 'Sophie Martin a été ajoutée à l\'équipe',
      type: 'success',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      module: 'Équipe'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <X className="w-4 h-4 text-red-600" />;
      case 'success': return <Check className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 min-h-[44px] sm:min-h-0">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center p-0 rounded-full">
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
            </span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                Tout marquer comme lu
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] sm:h-96 pr-2">
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
                  className={`border-l-4 p-3 rounded-r-lg transition-all ${getTypeColor(notification.type)} ${
                    !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.module}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString('fr-FR', {
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
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 w-7 p-0 hover:bg-green-100"
                          title="Marquer comme lu"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 w-7 p-0 hover:bg-red-100"
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
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-center text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes les notifications sont lues'
              }
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsPanel;
