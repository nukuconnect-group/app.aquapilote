import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Fish, Thermometer, Activity } from 'lucide-react';
const PondOverview = () => {
  const ponds = [{
    id: 'B001',
    name: 'Bassin Principal A',
    fishCount: 2450,
    species: 'Tilapia',
    temperature: 26.8,
    oxygenLevel: 8.2,
    status: 'optimal',
    lastFed: '2h ago'
  }, {
    id: 'B002',
    name: 'Bassin Elevage B',
    fishCount: 1800,
    species: 'Carpe',
    temperature: 25.4,
    oxygenLevel: 7.8,
    status: 'good',
    lastFed: '4h ago'
  }, {
    id: 'B003',
    name: 'Bassin Reproduction C',
    fishCount: 950,
    species: 'Poisson-chat',
    temperature: 24.2,
    oxygenLevel: 6.8,
    status: 'attention',
    lastFed: '1h ago'
  }, {
    id: 'B004',
    name: 'Bassin Quarantaine',
    fishCount: 120,
    species: 'Divers',
    temperature: 27.1,
    oxygenLevel: 8.0,
    status: 'maintenance',
    lastFed: 'N/A'
  }];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'Optimal';
      case 'good':
        return 'Bon';
      case 'attention':
        return 'Attention';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Inconnu';
    }
  };
  return <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Droplets className="w-5 h-5 text-aqua-600" />
          <span className="text-sm">Vue d'Ensemble des Bassins</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ponds.map(pond => <div key={pond.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900 text-xs">{pond.name}</h3>
                  <Badge className={getStatusColor(pond.status)}>
                    {getStatusText(pond.status)}
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">#{pond.id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Fish className="w-4 h-4 text-aqua-500" />
                  <span className="text-gray-600">{pond.fishCount} {pond.species}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600">{pond.temperature}°C</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">O₂: {pond.oxygenLevel} mg/L</span>
                </div>
                
                <div className="text-gray-500">
                  Dernier repas: {pond.lastFed}
                </div>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
};
export default PondOverview;