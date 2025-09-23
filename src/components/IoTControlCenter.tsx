
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  Plane, 
  Camera, 
  Activity, 
  Shield, 
  AlertTriangle,
  Settings,
  PlayCircle,
  Pause,
  MapPin,
  Clock,
  Thermometer,
  Droplets
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useIoT } from '@/contexts/IoTContext';
import EnvironmentalDashboard from './EnvironmentalDashboard';
import MqttConfiguration from './MqttConfiguration';

const IoTControlCenter = () => {
  const { activeUnit, units } = useProductionUnits();
  const { getActiveAlerts } = useIoT();
  
  const [droneStatus, setDroneStatus] = useState({
    connected: 2,
    active: 1,
    battery: [85, 67],
    missions: [
      { id: 1, name: 'Surveillance Bassin A', status: 'active', progress: 45 },
      { id: 2, name: 'Inspection Périmètre', status: 'scheduled', progress: 0 }
    ]
  });

  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: 'Alerte Oxygène Critique', active: true, conditions: 'O2 < 5mg/L' },
    { id: 2, name: 'Ajustement pH Auto', active: true, conditions: 'pH < 6.5 ou pH > 8.0' },
    { id: 3, name: 'Notification Température', active: false, conditions: 'Temp > 28°C' }
  ]);

  const alerts = getActiveAlerts();

  const startDroneMission = (missionId: number) => {
    setDroneStatus(prev => ({
      ...prev,
      missions: prev.missions.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'active', progress: 5 }
          : mission
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Centre de Contrôle & IoT</h2>
            <p className="text-blue-100">Surveillance intelligente et automatisation avancée</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-xs text-blue-200">Alertes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{droneStatus.connected}</div>
              <div className="text-xs text-blue-200">Drones</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="environmental">Environnemental</TabsTrigger>
          <TabsTrigger value="drones">Surveillance Drones</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statut IoT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-600" />
                  Réseau IoT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Capteurs actifs</span>
                    <Badge className="bg-green-100 text-green-800">24 / 26</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualité signal</span>
                    <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière sync</span>
                    <span className="text-sm text-gray-600">Il y a 2 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertes critiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Alertes Critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="text-sm">
                        <div className="font-medium text-red-800">Oxygène faible</div>
                        <div className="text-red-600">Bassin A - 4.2 mg/L</div>
                      </div>
                      <Badge variant="destructive" className="text-xs">Critique</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Surveillance par drones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-purple-600" />
                  Drones Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Drone #1</span>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 text-xs">En mission</Badge>
                      <div className="text-xs text-gray-600">Batterie: {droneStatus.battery[0]}%</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Drone #2</span>
                    <div className="text-right">
                      <Badge className="bg-gray-100 text-gray-800 text-xs">En veille</Badge>
                      <div className="text-xs text-gray-600">Batterie: {droneStatus.battery[1]}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental">
          <EnvironmentalDashboard />
        </TabsContent>

        <TabsContent value="drones" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-purple-600" />
                  Missions de Surveillance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {droneStatus.missions.map(mission => (
                    <div key={mission.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{mission.name}</h4>
                        <Badge className={
                          mission.status === 'active' ? 'bg-green-100 text-green-800' :
                          mission.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {mission.status === 'active' ? 'En cours' : 
                           mission.status === 'scheduled' ? 'Programmé' : 'Terminé'}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${mission.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progression: {mission.progress}%</span>
                        {mission.status === 'scheduled' && (
                          <Button size="sm" onClick={() => startDroneMission(mission.id)}>
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Démarrer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Surveillance Visuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Vue en direct du Drone #1</p>
                    <p className="text-xs text-gray-500">Bassin de grossissement A</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">
                      <MapPin className="w-4 h-4 mr-1" />
                      Localiser
                    </Button>
                    <Button size="sm" variant="outline">
                      <Camera className="w-4 h-4 mr-1" />
                      Capturer
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Altitude:</span>
                      <span>15m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vitesse:</span>
                      <span>5 km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Autonomie:</span>
                      <span>45 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Règles d'Automatisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-gray-600">{rule.conditions}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {rule.active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <MqttConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTControlCenter;
