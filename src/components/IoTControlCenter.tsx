import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wifi, 
  Activity, 
  Shield, 
  AlertTriangle,
  Settings,
  Thermometer,
  Droplets,
  Waves,
  Brain
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useIoT } from '@/contexts/IoTContext';
import EnvironmentalDashboard from './EnvironmentalDashboard';
import MqttConfiguration from './MqttConfiguration';
import IoTAIAnalysis from './iot/IoTAIAnalysis';
import IoTBasinOverview from './iot/IoTBasinOverview';

const IoTControlCenter = () => {
  const { activeUnit, units } = useProductionUnits();
  const { getActiveAlerts } = useIoT();

  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: 'Alerte Oxygène Critique', active: true, conditions: 'O2 < 5mg/L' },
    { id: 2, name: 'Ajustement pH Auto', active: true, conditions: 'pH < 6.5 ou pH > 8.0' },
    { id: 3, name: 'Notification Température', active: false, conditions: 'Temp > 28°C' }
  ]);

  const alerts = getActiveAlerts();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-responsive rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-responsive">
          <div className="flex-1">
            <h2 className="text-responsive-title font-bold mb-2">Centre de Contrôle & IoT</h2>
            <p className="text-blue-100 text-responsive">Surveillance intelligente et automatisation avancée</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 justify-end sm:justify-center">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">{alerts.length}</div>
              <div className="text-xs text-blue-200">Alertes Actives</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 gap-1">
              <Waves className="w-4 h-4" />
              Bassins & Paramètres
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 gap-1">
              <Brain className="w-4 h-4" />
              Analyse IA
            </TabsTrigger>
            <TabsTrigger value="environmental" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 gap-1">
              <Thermometer className="w-4 h-4" />
              Environnemental
            </TabsTrigger>
            <TabsTrigger value="automation" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 gap-1">
              <Settings className="w-4 h-4" />
              Automatisation
            </TabsTrigger>
            <TabsTrigger value="config" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0 gap-1">
              <Wifi className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <IoTBasinOverview />
        </TabsContent>

        <TabsContent value="ai-analysis">
          <IoTAIAnalysis />
        </TabsContent>

        <TabsContent value="environmental">
          <EnvironmentalDashboard />
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
