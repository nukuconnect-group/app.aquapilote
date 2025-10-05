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
  const { sensorReadings, getActiveAlerts, basins } = useIoT();
  const { t, formatCurrency } = useSettings();
  
  const [iotModules, setIotModules] = useState<IoTModuleData[]>([
    {
      id: 'temp_001',
      name: 'Température Bassin A',
      type: 'temperature',
      value: 26.5,
      unit: '°C',
      status: 'normal',
      trend: 'up',
      history: [
        { time: '00:00', value: 25.8 },
        { time: '04:00', value: 25.5 },
        { time: '08:00', value: 26.0 },
        { time: '12:00', value: 26.5 },
        { time: '16:00', value: 27.2 },
        { time: '20:00', value: 26.8 },
      ]
    },
    {
      id: 'oxy_001',
      name: 'Oxygène Bassin A',
      type: 'oxygen',
      value: 7.2,
      unit: 'mg/L',
      status: 'normal',
      trend: 'stable',
      history: [
        { time: '00:00', value: 7.0 },
        { time: '04:00', value: 6.8 },
        { time: '08:00', value: 7.1 },
        { time: '12:00', value: 7.2 },
        { time: '16:00', value: 7.3 },
        { time: '20:00', value: 7.2 },
      ]
    },
    {
      id: 'ph_001',
      name: 'pH Bassin A',
      type: 'ph',
      value: 7.4,
      unit: 'pH',
      status: 'normal',
      trend: 'stable',
      history: [
        { time: '00:00', value: 7.3 },
        { time: '04:00', value: 7.4 },
        { time: '08:00', value: 7.5 },
        { time: '12:00', value: 7.4 },
        { time: '16:00', value: 7.3 },
        { time: '20:00', value: 7.4 },
      ]
    },
    {
      id: 'sal_001',
      name: 'Salinité Bassin A',
      type: 'salinity',
      value: 15.2,
      unit: 'ppt',
      status: 'normal',
      trend: 'down',
      history: [
        { time: '00:00', value: 15.8 },
        { time: '04:00', value: 15.6 },
        { time: '08:00', value: 15.4 },
        { time: '12:00', value: 15.2 },
        { time: '16:00', value: 15.1 },
        { time: '20:00', value: 15.2 },
      ]
    },
    {
      id: 'temp_002',
      name: 'Température Bassin B',
      type: 'temperature',
      value: 28.1,
      unit: '°C',
      status: 'warning',
      trend: 'up',
      history: [
        { time: '00:00', value: 26.5 },
        { time: '04:00', value: 27.0 },
        { time: '08:00', value: 27.5 },
        { time: '12:00', value: 28.0 },
        { time: '16:00', value: 28.5 },
        { time: '20:00', value: 28.1 },
      ]
    },
    {
      id: 'oxy_002',
      name: 'Oxygène Bassin B',
      type: 'oxygen',
      value: 5.1,
      unit: 'mg/L',
      status: 'critical',
      trend: 'down',
      history: [
        { time: '00:00', value: 6.2 },
        { time: '04:00', value: 5.9 },
        { time: '08:00', value: 5.6 },
        { time: '12:00', value: 5.3 },
        { time: '16:00', value: 5.0 },
        { time: '20:00', value: 5.1 },
      ]
    }
  ]);

  // Simuler la mise à jour des données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setIotModules(prev => prev.map(module => {
        // Générer une petite variation aléatoire
        const variation = (Math.random() - 0.5) * 0.2;
        const newValue = +(module.value + variation).toFixed(1);
        
        // Déterminer le statut en fonction du type et de la valeur
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        if (module.type === 'temperature') {
          if (newValue > 28 || newValue < 22) status = 'warning';
          if (newValue > 30 || newValue < 20) status = 'critical';
        } else if (module.type === 'oxygen') {
          if (newValue < 6 || newValue > 9) status = 'warning';
          if (newValue < 5 || newValue > 10) status = 'critical';
        } else if (module.type === 'ph') {
          if (newValue < 6.5 || newValue > 8.0) status = 'warning';
          if (newValue < 6.0 || newValue > 8.5) status = 'critical';
        }
        
        // Déterminer la tendance
        const trend = variation > 0.05 ? 'up' : variation < -0.05 ? 'down' : 'stable';
        
        // Ajouter le nouveau point à l'historique (garder les 6 derniers)
        const newHistory = [
          ...module.history.slice(1),
          { time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), value: newValue }
        ];
        
        return {
          ...module,
          value: newValue,
          status,
          trend,
          history: newHistory
        };
      }));
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Statistiques Globales IoT */}
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
              {((activeSensors/totalSensors)*100).toFixed(0)}% {t('normal')}
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

      {/* Modules IoT individuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {iotModules.map((module) => {
          const IconComponent = getModuleIcon(module.type);
          
          return (
            <Card key={module.id} className={`border-l-4 ${
              module.status === 'critical' ? 'border-l-red-500' :
              module.status === 'warning' ? 'border-l-orange-500' :
              'border-l-green-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-sm font-medium">{module.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(module.status)}>
                    {getStatusText(module.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Valeur actuelle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{module.value}</div>
                    <div className="text-sm text-muted-foreground">{module.unit}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    {getTrendIcon(module.trend)}
                    <div className="text-xs text-muted-foreground mt-1">
                      {getTrendText(module.trend)}
                    </div>
                  </div>
                </div>

                {/* Graphique miniature */}
                <div className="h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={module.history}>
                      <defs>
                        <linearGradient id={`gradient-${module.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={getChartColor(module.type)} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={getChartColor(module.type)} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={getChartColor(module.type)} 
                        strokeWidth={2}
                        fill={`url(#gradient-${module.id})`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [`${value} ${module.unit}`, module.name]}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  {t('last_update')} : {new Date().toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphiques détaillés */}
      <Card>
        <CardHeader>
          <CardTitle>{t('evolution')} des {t('parameters').toLowerCase()} (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  type="category" 
                  allowDuplicatedCategory={false}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                {iotModules.map((module) => (
                  <Line 
                    key={module.id}
                    data={module.history}
                    dataKey="value" 
                    name={module.name}
                    stroke={getChartColor(module.type)}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IoTOverview;
