import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  Wind,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Fish
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useIoT } from '@/contexts/IoTContext';
import { useSettings } from '@/contexts/SettingsContext';

interface IoTModuleData {
  id: string;
  name: string;
  type: 'temperature' | 'oxygen' | 'ph' | 'salinity' | 'turbidity';
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: Array<{ time: string; value: number }>;
}

const IoTOverview = () => {
  const { activeUnit, units } = useProductionUnits();
  const { sensorReadings, getActiveAlerts, basins, realTimeData } = useIoT();
  const { t, formatCurrency } = useSettings();
  
  // État vide par défaut - données réelles uniquement si capteurs connectés
  const [iotModules, setIotModules] = useState<IoTModuleData[]>([]);
  
  // Vérifier si des capteurs IoT sont réellement connectés
  const hasRealIoTConnection = basins.length > 0 && sensorReadings.length > 0;

  // Mettre à jour les modules IoT uniquement avec des données réelles
  useEffect(() => {
    if (hasRealIoTConnection && sensorReadings.length > 0) {
      // Construire les modules à partir des vraies données de capteurs
      const modules: IoTModuleData[] = sensorReadings.map((reading, index) => ({
        id: `sensor_${index}`,
        name: reading.sensorType,
        type: reading.sensorType as any,
        value: reading.value,
        unit: reading.sensorType === 'temperature' ? '°C' : 
              reading.sensorType === 'oxygen' ? 'mg/L' : 
              reading.sensorType === 'ph' ? 'pH' : 'ppt',
        status: reading.status,
        trend: 'stable' as const,
        history: [{ time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), value: reading.value }]
      }));
      setIotModules(modules);
    } else {
      // Aucune connexion IoT - garder vide
      setIotModules([]);
    }
  }, [hasRealIoTConnection, sensorReadings]);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'oxygen': return Wind;
      case 'ph': return Droplets;
      case 'salinity': return Activity;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return t('normal');
      case 'warning': return t('warning');
      case 'critical': return t('critical');
      default: return t('status');
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up': return t('rising');
      case 'down': return t('falling');
      case 'stable': return t('stable');
      default: return t('stable');
    }
  };

  // Calcul des statistiques globales
  const activeAlerts = getActiveAlerts();
  const criticalAlerts = activeAlerts.filter(a => a.status === 'critical').length;
  const warningAlerts = activeAlerts.filter(a => a.status === 'warning').length;
  const totalSensors = iotModules.length;
  const activeSensors = iotModules.filter(m => m.status === 'normal').length;
  const anomalyRate = ((totalSensors - activeSensors) / totalSensors * 100).toFixed(1);
  const globalHealthScore = Math.round(iotModules.reduce((acc, m) => {
    if (m.status === 'normal') return acc + 100;
    if (m.status === 'warning') return acc + 70;
    return acc + 40;
  }, 0) / totalSensors);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-blue-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChartColor = (type: string) => {
    switch (type) {
      case 'temperature': return '#ef4444';
      case 'oxygen': return '#3b82f6';
      case 'ph': return '#8b5cf6';
      case 'salinity': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Define the zootechnical parameters to display
  const zootechnicalParams = [
    { type: 'oxygen', name: 'Oxygène', unit: 'mg/L', icon: Wind, color: '#3b82f6' },
    { type: 'ph', name: 'pH', unit: '', icon: Droplets, color: '#8b5cf6' },
    { type: 'temperature', name: 'Température', unit: '°C', icon: Thermometer, color: '#ef4444' },
    { type: 'nitrite', name: 'Nitrite', unit: 'mg/L', icon: Activity, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Paramètres zootechniques - 4 icônes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {zootechnicalParams.map((param) => {
          const IconComponent = param.icon;
          const sensorData = iotModules.find(m => m.type === param.type);
          return (
            <Card key={param.type} className="border-l-4" style={{ borderLeftColor: param.color }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${param.color}20` }}>
                    <IconComponent className="w-5 h-5" style={{ color: param.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{param.name}</p>
                    <p className="text-xl font-bold">
                      {sensorData ? `${sensorData.value} ${param.unit}` : '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Message si pas de connexion IoT */}
      {!hasRealIoTConnection && (
        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardContent className="p-8 text-center">
            <Wifi className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">0 capteurs connectés</h3>
            <p className="text-muted-foreground mb-4">
              Connectez vos capteurs pour visualiser les données en temps réel.
            </p>
            <p className="text-sm text-muted-foreground">
              Allez dans l'onglet Configuration pour paramétrer votre connexion MQTT.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistiques Globales IoT - uniquement si connecté */}
      {hasRealIoTConnection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Wifi className="w-5 h-5 text-blue-600" />
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{activeSensors}/{totalSensors}</div>
              <div className="text-sm text-muted-foreground">{t('connected_sensors')}</div>
              <div className="text-xs text-green-600 mt-1">
                {totalSensors > 0 ? ((activeSensors/totalSensors)*100).toFixed(0) : 0}% {t('normal')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <Badge className={activeAlerts.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {activeAlerts.length > 0 ? t('warning') : t('normal')}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{activeAlerts.length}</div>
              <div className="text-sm text-muted-foreground">{t('active_alerts')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {criticalAlerts} {t('critical').toLowerCase()} • {warningAlerts} {t('warning').toLowerCase()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <Badge className={globalHealthScore >= 80 ? 'bg-green-100 text-green-800' : globalHealthScore >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}>
                  {globalHealthScore >= 80 ? t('normal') : t('warning')}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{globalHealthScore}/100</div>
              <div className="text-sm text-muted-foreground">{t('global_health')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {basins.length} {t('basin').toLowerCase()}(s) {t('active_ponds').toLowerCase()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-red-600" />
                <Badge className={parseFloat(anomalyRate) > 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {parseFloat(anomalyRate) > 10 ? t('critical') : t('normal')}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{anomalyRate}%</div>
              <div className="text-sm text-muted-foreground">{t('anomaly_rate')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalSensors - activeSensors} {t('sensor').toLowerCase()}(s) en anomalie
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques des paramètres zootechniques - Vue en courbes - uniquement si connecté */}
      {hasRealIoTConnection && iotModules.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {iotModules.map((module) => {
            const IconComponent = getModuleIcon(module.type);
            
            return (
              <Card key={module.id} className={`border-l-4 ${
                module.status === 'critical' ? 'border-l-red-500' :
                module.status === 'warning' ? 'border-l-orange-500' :
                'border-l-green-500'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-base font-semibold">{module.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(module.status)}>
                      {getStatusText(module.status)}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-primary">{module.value}</div>
                    <div className="text-lg text-muted-foreground">{module.unit}</div>
                    {getTrendIcon(module.trend)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Graphique en courbe - Format large */}
                  <div className="h-40 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={module.history}>
                        <defs>
                          <linearGradient id={`gradient-${module.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getChartColor(module.type)} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={getChartColor(module.type)} stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 11 }}
                          stroke="#9ca3af"
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }}
                          stroke="#9ca3af"
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            fontSize: '13px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: number) => [`${value} ${module.unit}`, 'Valeur']}
                          labelFormatter={(label) => `Heure: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={getChartColor(module.type)} 
                          strokeWidth={3}
                          dot={{ fill: getChartColor(module.type), r: 4 }}
                          activeDot={{ r: 6 }}
                          fill={`url(#gradient-${module.id})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      {t('last_update')} : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(module.trend)}
                      <span className={
                        module.trend === 'up' ? 'text-orange-600' :
                        module.trend === 'down' ? 'text-blue-600' :
                        'text-gray-600'
                      }>
                        {getTrendText(module.trend)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Graphique comparatif global - Tous les paramètres - uniquement si connecté */}
      {hasRealIoTConnection && iotModules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Évolution Comparative des Paramètres Zootechniques</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Surveillance en temps réel sur 24 heures</p>
              </div>
              <Fish className="w-8 h-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    type="category" 
                    allowDuplicatedCategory={false}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  {iotModules.map((module) => (
                    <Line 
                      key={module.id}
                      data={module.history}
                      dataKey="value" 
                      name={`${module.name} (${module.unit})`}
                      stroke={getChartColor(module.type)}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IoTOverview;
