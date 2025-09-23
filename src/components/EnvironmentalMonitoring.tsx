
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Droplets, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Settings,
  TrendingUp,
  Waves
} from 'lucide-react';
import { useIoT, SensorReading } from '@/contexts/IoTContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const EnvironmentalMonitoring = () => {
  const { activeUnit } = useProductionUnits();
  const { 
    getUnitBasins, 
    realTimeData, 
    getBasinReadings, 
    updateThreshold,
    getActiveAlerts 
  } = useIoT();
  
  const [selectedBasin, setSelectedBasin] = useState<string>('');
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [thresholdValues, setThresholdValues] = useState({ min: '', max: '' });

  if (!activeUnit) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Waves className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Sélectionnez une unité pour voir le monitoring environnemental</p>
        </CardContent>
      </Card>
    );
  }

  const unitBasins = getUnitBasins(activeUnit.id);
  const activeAlerts = getActiveAlerts().filter(alert => 
    unitBasins.some(basin => basin.id === alert.basinId)
  );

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case 'oxygen': return <Droplets className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'ph': return <Activity className="w-4 h-4" />;
      case 'turbidity': return <Waves className="w-4 h-4" />;
      case 'mortality': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSensorLabel = (sensorType: string) => {
    switch (sensorType) {
      case 'oxygen': return 'Oxygène';
      case 'temperature': return 'Température';
      case 'ph': return 'pH';
      case 'turbidity': return 'Turbidité';
      case 'mortality': return 'Mortalité';
      default: return sensorType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const formatChartData = (readings: SensorReading[]) => {
    return readings
      .slice(0, 20)
      .reverse()
      .map((reading, index) => ({
        time: new Date(reading.timestamp).toLocaleTimeString(),
        value: reading.value,
        status: reading.status
      }));
  };

  return (
    <div className="space-y-6">
      {/* Alertes actives */}
      {activeAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes Environnementales ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {activeAlerts.slice(0, 5).map(alert => {
                const basin = unitBasins.find(b => b.id === alert.basinId);
                return (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      {getSensorIcon(alert.sensorType)}
                      <span className="font-medium">{basin?.name}</span>
                      <span className="text-sm text-gray-600">
                        {getSensorLabel(alert.sensorType)}: {alert.value}{alert.unit}
                      </span>
                    </div>
                    <Badge className={alert.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {alert.status === 'critical' ? 'Critique' : 'Attention'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring par bassin */}
      <Tabs defaultValue={unitBasins[0]?.id || ''} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-auto gap-1" style={{ gridTemplateColumns: `repeat(${unitBasins.length}, 1fr)` }}>
            {unitBasins.map(basin => (
              <TabsTrigger key={basin.id} value={basin.id} className="text-xs">
                {basin.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Seuils
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurer les Seuils d'Alerte</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valeur Min</Label>
                    <Input
                      type="number"
                      value={thresholdValues.min}
                      onChange={(e) => setThresholdValues(prev => ({ ...prev, min: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Valeur Max</Label>
                    <Input
                      type="number"
                      value={thresholdValues.max}
                      onChange={(e) => setThresholdValues(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
                <Button className="w-full">Sauvegarder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {unitBasins.map(basin => (
          <TabsContent key={basin.id} value={basin.id} className="space-y-4">
            {/* Valeurs actuelles */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {basin.sensors.map(sensorType => {
                const latestReading = realTimeData[basin.id]?.find(r => r.sensorType === sensorType);
                return (
                  <Card key={sensorType} className={latestReading ? getStatusColor(latestReading.status) : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        {getSensorIcon(sensorType)}
                        <span className="text-xs font-medium">
                          {getSensorLabel(sensorType)}
                        </span>
                      </div>
                      <div className="text-lg font-bold">
                        {latestReading ? `${latestReading.value}${latestReading.unit}` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {latestReading ? new Date(latestReading.timestamp).toLocaleTimeString() : 'Pas de données'}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Graphiques historiques */}
            <div className="grid gap-4">
              {basin.sensors.map(sensorType => {
                const readings = realTimeData[basin.id]?.filter(r => r.sensorType === sensorType) || [];
                const chartData = formatChartData(readings);
                
                return (
                  <Card key={`chart-${sensorType}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getSensorIcon(sensorType)}
                        Historique - {getSensorLabel(sensorType)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EnvironmentalMonitoring;
