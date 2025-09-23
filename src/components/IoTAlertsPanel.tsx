
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Droplets, 
  Thermometer, 
  Activity, 
  Waves,
  CheckCircle,
  Bell
} from 'lucide-react';
import { useIoT } from '@/contexts/IoTContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

const IoTAlertsPanel = () => {
  const { activeUnit } = useProductionUnits();
  const { getActiveAlerts, getUnitBasins } = useIoT();

  if (!activeUnit) return null;

  const unitBasins = getUnitBasins(activeUnit.id);
  const activeAlerts = getActiveAlerts().filter(alert => 
    unitBasins.some(basin => basin.id === alert.basinId)
  );

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'oxygen': return Droplets;
      case 'temperature': return Thermometer;
      case 'ph': return Activity;
      case 'turbidity': return Waves;
      case 'mortality': return AlertTriangle;
      default: return Activity;
    }
  };

  const getSensorLabel = (sensorType: string) => {
    switch (sensorType) {
      case 'oxygen': return 'Oxygène dissous';
      case 'temperature': return 'Température';
      case 'ph': return 'pH de l\'eau';
      case 'turbidity': return 'Turbidité';
      case 'mortality': return 'Mortalité';
      default: return sensorType;
    }
  };

  const getActionSuggestion = (sensorType: string, status: string) => {
    switch (sensorType) {
      case 'oxygen':
        return status === 'critical' ? 'Activer l\'aérateur d\'urgence' : 'Vérifier le système d\'aération';
      case 'temperature':
        return 'Ajuster le système de refroidissement';
      case 'ph':
        return 'Vérifier et ajuster le pH';
      case 'turbidity':
        return 'Nettoyer le bassin et vérifier la filtration';
      case 'mortality':
        return 'Inspection vétérinaire recommandée';
      default:
        return 'Vérifier les paramètres';
    }
  };

  if (activeAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-gray-600">Tous les paramètres sont normaux</p>
          <p className="text-xs text-gray-500">Aucune alerte environnementale</p>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = activeAlerts.filter(a => a.status === 'critical');
  const warningAlerts = activeAlerts.filter(a => a.status === 'warning');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-red-600" />
            <span className="text-sm">Alertes IoT - {activeUnit.name}</span>
          </div>
          <div className="flex space-x-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalAlerts.length} critique{criticalAlerts.length > 1 ? 's' : ''}
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                {warningAlerts.length} attention
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Alertes critiques en premier */}
          {criticalAlerts.slice(0, 5).map(alert => {
            const basin = unitBasins.find(b => b.id === alert.basinId);
            const IconComponent = getSensorIcon(alert.sensorType);
            
            return (
              <Alert key={alert.id} className="border-red-200 bg-red-50">
                <IconComponent className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-red-800">
                        {basin?.name} - {getSensorLabel(alert.sensorType)}
                      </div>
                      <div className="text-sm text-red-700">
                        Valeur: {alert.value}{alert.unit} - {getActionSuggestion(alert.sensorType, alert.status)}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-700">
                      Traiter
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}

          {/* Alertes d'attention */}
          {warningAlerts.slice(0, 3).map(alert => {
            const basin = unitBasins.find(b => b.id === alert.basinId);
            const IconComponent = getSensorIcon(alert.sensorType);
            
            return (
              <Alert key={alert.id} className="border-yellow-200 bg-yellow-50">
                <IconComponent className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="ml-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-yellow-800">
                        {basin?.name} - {getSensorLabel(alert.sensorType)}
                      </div>
                      <div className="text-sm text-yellow-700">
                        Valeur: {alert.value}{alert.unit} - {getActionSuggestion(alert.sensorType, alert.status)}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                      Surveiller
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default IoTAlertsPanel;
