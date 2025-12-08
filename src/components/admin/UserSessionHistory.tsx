import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Monitor, Globe, LogIn, LogOut } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUserSessions } from '@/hooks/useUserSessions';

interface UserSession {
  id: string;
  user_id: string;
  login_at: string;
  logout_at: string | null;
  last_activity_at: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
}

interface UserSessionHistoryProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserSessionHistory: React.FC<UserSessionHistoryProps> = ({
  userId,
  userName,
  isOpen,
  onClose
}) => {
  const { getUserSessionHistory } = useUserSessions();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadSessions();
    }
  }, [isOpen, userId]);

  const loadSessions = async () => {
    setIsLoading(true);
    const data = await getUserSessionHistory(userId);
    setSessions(data);
    setIsLoading(false);
  };

  const getBrowserName = (userAgent: string | null): string => {
    if (!userAgent) return 'Inconnu';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Autre';
  };

  const getDeviceType = (userAgent: string | null): string => {
    if (!userAgent) return 'Inconnu';
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablette';
    return 'Desktop';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historique des connexions - {userName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune session enregistrée
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border ${
                    session.is_active 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {format(new Date(session.login_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                        {session.is_active && (
                          <Badge variant="default" className="bg-green-500">
                            En ligne
                          </Badge>
                        )}
                      </div>

                      {session.logout_at && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">
                            Déconnexion: {format(new Date(session.logout_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          {getDeviceType(session.user_agent)} - {getBrowserName(session.user_agent)}
                        </div>
                        {session.ip_address && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {session.ip_address}
                          </div>
                        )}
                      </div>

                      {session.is_active && (
                        <p className="text-xs text-green-600">
                          Dernière activité: {formatDistanceToNow(new Date(session.last_activity_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs text-muted-foreground">
                      {session.logout_at ? (
                        <span>
                          Durée: {formatDistanceToNow(new Date(session.login_at), { 
                            includeSeconds: true,
                            locale: fr 
                          }).replace('environ ', '')}
                        </span>
                      ) : session.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Session active
                        </Badge>
                      ) : (
                        <Badge variant="outline">Session interrompue</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserSessionHistory;
