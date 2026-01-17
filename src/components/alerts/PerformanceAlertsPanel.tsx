import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bell, 
  Check, 
  Trash2, 
  RefreshCw,
  Target,
  Thermometer,
  Droplets,
  Activity,
  Package,
  Clock,
  CheckCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { usePerformanceAlerts, PerformanceAlert } from '@/hooks/usePerformanceAlerts';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'fcr':
      return <Target className="h-4 w-4" />;
    case 'temperature':
      return <Thermometer className="h-4 w-4" />;
    case 'oxygen':
    case 'ph':
      return <Droplets className="h-4 w-4" />;
    case 'mortality':
      return <Activity className="h-4 w-4" />;
    case 'production':
    case 'stock':
      return <Package className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

const getAlertTypeName = (type: string) => {
  switch (type) {
    case 'fcr':
      return 'FCR';
    case 'temperature':
      return 'Température';
    case 'oxygen':
      return 'Oxygène';
    case 'ph':
      return 'pH';
    case 'mortality':
      return 'Mortalité';
    case 'production':
      return 'Production';
    case 'stock':
      return 'Stock';
    default:
      return type;
  }
};

interface AlertCardProps {
  alert: PerformanceAlert;
  onAcknowledge: (id: string) => void;
  onDelete: (id: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onDelete }) => {
  const isCritical = alert.severity === 'critical';
  
  return (
    <div 
      className={`p-4 rounded-lg border ${
        isCritical 
          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' 
          : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
      } ${alert.is_acknowledged ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-full ${
            isCritical 
              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' 
              : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
          }`}>
            {getAlertIcon(alert.alert_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm">{alert.title}</h4>
              <Badge variant={isCritical ? 'destructive' : 'outline'} className="text-xs">
                {getAlertTypeName(alert.alert_type)}
              </Badge>
              {alert.is_acknowledged && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Acquittée
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(parseISO(alert.created_at), { addSuffix: true, locale: fr })}
              </span>
              {alert.unit_name && (
                <span>Unité: {alert.unit_name}</span>
              )}
              {alert.metric_value !== undefined && alert.metric_value !== null && (
                <span>
                  Valeur: {typeof alert.metric_value === 'number' ? alert.metric_value.toFixed(2) : alert.metric_value}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!alert.is_acknowledged && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAcknowledge(alert.id)}
              className="h-8 w-8 p-0"
              title="Acquitter"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(alert.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const PerformanceAlertsPanel: React.FC = () => {
  const { 
    alerts, 
    unacknowledgedAlerts, 
    criticalAlerts,
    loading,
    checking,
    acknowledgeAlert,
    deleteAlert,
    checkThresholds,
    refetch
  } = usePerformanceAlerts();

  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'critical'>('unacknowledged');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = React.useMemo(() => {
    let result = alerts;
    
    // Filter by status
    switch (filter) {
      case 'unacknowledged':
        result = result.filter(a => !a.is_acknowledged);
        break;
      case 'critical':
        result = result.filter(a => a.severity === 'critical' && !a.is_acknowledged);
        break;
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(a => a.alert_type === typeFilter);
    }
    
    return result;
  }, [alerts, filter, typeFilter]);

  const alertTypes = React.useMemo(() => {
    const types = new Set(alerts.map(a => a.alert_type));
    return Array.from(types);
  }, [alerts]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alertes de Performance
          </h2>
          <p className="text-muted-foreground mt-1">
            {unacknowledgedAlerts.length} alerte(s) non acquittée(s)
            {criticalAlerts.length > 0 && (
              <span className="text-red-500 font-medium ml-2">
                dont {criticalAlerts.length} critique(s)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={() => checkThresholds()}
            disabled={checking}
            size="sm"
          >
            {checking ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Vérifier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{alerts.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('unacknowledged')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{unacknowledgedAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Non acquittées</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('critical')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Critiques</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.is_acknowledged).length}
            </div>
            <div className="text-xs text-muted-foreground">Acquittées</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-2 h-6">Toutes</TabsTrigger>
            <TabsTrigger value="unacknowledged" className="text-xs px-2 h-6">Non acquittées</TabsTrigger>
            <TabsTrigger value="critical" className="text-xs px-2 h-6">Critiques</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {alertTypes.length > 1 && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs h-8 px-2 rounded-md border bg-background"
          >
            <option value="all">Tous les types</option>
            {alertTypes.map(type => (
              <option key={type} value={type}>{getAlertTypeName(type)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Alerts List */}
      <Card>
        <CardContent className="p-0">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="font-medium text-lg">Aucune alerte</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'all' 
                  ? 'Aucune alerte de performance enregistrée'
                  : filter === 'critical'
                  ? 'Aucune alerte critique non acquittée'
                  : 'Toutes les alertes ont été acquittées'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {filteredAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={acknowledgeAlert}
                    onDelete={deleteAlert}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAlertsPanel;
