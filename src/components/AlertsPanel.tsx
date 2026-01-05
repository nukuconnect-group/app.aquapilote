import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell, Thermometer, Fish, Activity, Droplets, Package, TrendingDown, Heart } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useFeedStocks } from '@/hooks/useFeedStocks';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import { useProductionCycles } from '@/hooks/useProductionCycles';

interface RealAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  action: string;
  icon: React.ElementType;
  module?: string;
}

const AlertsPanel = () => {
  const { activeUnit } = useProductionUnits();
  const { notifications } = useNotifications();
  const { stocks: feedStocks } = useFeedStocks();
  const { records: healthRecords } = useHealthRecords(undefined, activeUnit?.id);
  const { batches } = useLivestockBatches(activeUnit?.id);
  const { cycles } = useProductionCycles(activeUnit?.id);

  // Générer les alertes réelles à partir des données
  const realAlerts = useMemo(() => {
    const alerts: RealAlert[] = [];
    const now = new Date();

    // Alertes des stocks d'aliments
    const lowStocks = feedStocks.filter(stock => {
      const minThreshold = stock.min_threshold || 50;
      return stock.quantity <= minThreshold;
    });

    lowStocks.forEach(stock => {
      alerts.push({
        id: `stock-${stock.id}`,
        type: stock.quantity <= (stock.min_threshold || 50) / 2 ? 'critical' : 'warning',
        title: `Stock aliment faible: ${stock.feed_type}`,
        message: `Stock actuel: ${stock.quantity} ${stock.unit}. Seuil minimum: ${stock.min_threshold || 50} ${stock.unit}`,
        time: 'En temps réel',
        action: 'Commander',
        icon: Package,
        module: 'alimentation'
      });
    });

    // Alertes d'aliments périmés
    const expiredStocks = feedStocks.filter(stock => {
      if (!stock.expiration_date) return false;
      return new Date(stock.expiration_date) <= now;
    });

    expiredStocks.forEach(stock => {
      alerts.push({
        id: `expired-${stock.id}`,
        type: 'critical',
        title: `Aliment périmé: ${stock.feed_type}`,
        message: `Date d'expiration dépassée le ${new Date(stock.expiration_date!).toLocaleDateString('fr-FR')}`,
        time: 'Urgent',
        action: 'Retirer',
        icon: AlertTriangle,
        module: 'alimentation'
      });
    });

    // Alertes mortalité élevée (derniers 7 jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentHealthRecords = healthRecords.filter(r => new Date(r.date) >= weekAgo);
    const totalMortality = recentHealthRecords.reduce((sum, r) => sum + (r.mortality || 0), 0);
    const totalStock = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const mortalityRate = totalStock > 0 ? (totalMortality / totalStock) * 100 : 0;

    if (mortalityRate > 5) {
      alerts.push({
        id: 'mortality-high',
        type: mortalityRate > 10 ? 'critical' : 'warning',
        title: 'Taux de mortalité élevé',
        message: `${mortalityRate.toFixed(1)}% de mortalité sur les 7 derniers jours (${totalMortality} individus)`,
        time: 'Cette semaine',
        action: 'Analyser',
        icon: TrendingDown,
        module: 'santé'
      });
    }

    // Alertes des cycles en fin de production
    cycles.forEach(cycle => {
      if (cycle.status === 'active' && cycle.end_date) {
        const endDate = new Date(cycle.end_date);
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEnd <= 7 && daysUntilEnd > 0) {
          alerts.push({
            id: `cycle-end-${cycle.id}`,
            type: 'info',
            title: `Fin de cycle proche: ${cycle.name}`,
            message: `Le cycle se termine dans ${daysUntilEnd} jour(s). Préparez la récolte.`,
            time: `${daysUntilEnd}j restants`,
            action: 'Planifier',
            icon: Fish,
            module: 'production'
          });
        }
      }
    });

    // Alertes qualité de l'eau (paramètres anormaux)
    const todayRecords = healthRecords.filter(r => 
      new Date(r.date).toDateString() === now.toDateString()
    );

    todayRecords.forEach(record => {
      if (record.oxygen && record.oxygen < 5) {
        alerts.push({
          id: `oxygen-${record.id}`,
          type: 'critical',
          title: 'Niveau d\'oxygène critique',
          message: `Oxygène à ${record.oxygen} mg/L (minimum recommandé: 5 mg/L)`,
          time: 'Aujourd\'hui',
          action: 'Activer aération',
          icon: Droplets,
          module: 'santé'
        });
      }

      if (record.temperature && (record.temperature > 32 || record.temperature < 20)) {
        alerts.push({
          id: `temp-${record.id}`,
          type: 'warning',
          title: 'Température anormale',
          message: `Température à ${record.temperature}°C (plage optimale: 24-30°C)`,
          time: 'Aujourd\'hui',
          action: 'Réguler',
          icon: Thermometer,
          module: 'santé'
        });
      }

      if (record.ph && (record.ph < 6.5 || record.ph > 8.5)) {
        alerts.push({
          id: `ph-${record.id}`,
          type: 'warning',
          title: 'pH hors norme',
          message: `pH à ${record.ph} (plage optimale: 6.5-8.5)`,
          time: 'Aujourd\'hui',
          action: 'Corriger',
          icon: Activity,
          module: 'santé'
        });
      }
    });

    // Lots en quarantaine
    const quarantineBatches = batches.filter(b => b.status === 'quarantine');
    if (quarantineBatches.length > 0) {
      alerts.push({
        id: 'quarantine',
        type: 'warning',
        title: `${quarantineBatches.length} lot(s) en quarantaine`,
        message: `Surveillance requise pour ${quarantineBatches.map(b => b.species).join(', ')}`,
        time: 'En cours',
        action: 'Vérifier',
        icon: Heart,
        module: 'cheptel'
      });
    }

    // Notifications critiques non lues
    const criticalNotifications = notifications.filter(n => n.is_critical && !n.is_read);
    criticalNotifications.forEach(notif => {
      alerts.push({
        id: `notif-${notif.id}`,
        type: 'critical',
        title: notif.title,
        message: notif.message,
        time: new Date(notif.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        action: 'Voir',
        icon: AlertCircle,
        module: notif.module
      });
    });

    // Message de succès si aucune alerte
    if (alerts.length === 0) {
      alerts.push({
        id: 'all-good',
        type: 'success',
        title: 'Tout est en ordre',
        message: 'Aucune alerte détectée. Votre exploitation fonctionne normalement.',
        time: 'Maintenant',
        action: 'Continuer',
        icon: CheckCircle,
        module: 'système'
      });
    }

    // Trier par priorité (critical > warning > info > success)
    const priority = { critical: 0, warning: 1, info: 2, success: 3 };
    return alerts.sort((a, b) => priority[a.type] - priority[b.type]);
  }, [feedStocks, healthRecords, batches, cycles, notifications, activeUnit]);

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
          iconClass: 'text-red-600',
          bgClass: 'bg-red-50 border-red-200',
          label: 'Critique'
        };
      case 'warning':
        return {
          badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconClass: 'text-yellow-600',
          bgClass: 'bg-yellow-50 border-yellow-200',
          label: 'Attention'
        };
      case 'info':
        return {
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClass: 'text-blue-600',
          bgClass: 'bg-blue-50 border-blue-200',
          label: 'Information'
        };
      case 'success':
        return {
          badgeClass: 'bg-green-100 text-green-800 border-green-200',
          iconClass: 'text-green-600',
          bgClass: 'bg-green-50 border-green-200',
          label: 'Succès'
        };
      default:
        return {
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
          iconClass: 'text-gray-600',
          bgClass: 'bg-gray-50 border-gray-200',
          label: 'Info'
        };
    }
  };

  const criticalCount = realAlerts.filter(a => a.type === 'critical').length;
  const warningCount = realAlerts.filter(a => a.type === 'warning').length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-aqua-600" />
            <span className="text-sm sm:text-base">
              Alertes {activeUnit ? `- ${activeUnit.name}` : 'Globales'}
            </span>
          </div>
          <div className="flex gap-1">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                {warningCount} attention
              </Badge>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                OK
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {realAlerts.map(alert => {
            const config = getAlertConfig(alert.type);
            const IconComponent = alert.icon;
            
            return (
              <div key={alert.id} className={`border rounded-lg p-3 sm:p-4 ${config.bgClass} hover:shadow-sm transition-shadow`}>
                <div className="flex items-start space-x-3">
                  <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">
                        {alert.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {alert.time}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${config.badgeClass} text-xs`}>
                          {config.label}
                        </Badge>
                        {alert.module && (
                          <Badge variant="outline" className="text-xs">
                            {alert.module}
                          </Badge>
                        )}
                      </div>
                      
                      <Button variant="outline" size="sm" className="text-xs">
                        {alert.action}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
