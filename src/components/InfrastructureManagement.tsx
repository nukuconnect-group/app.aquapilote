import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Settings, Activity, Thermometer, MapPin } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import InfrastructureForm from './infrastructure/InfrastructureForm';
import InfrastructureCard from './infrastructure/InfrastructureCard';

const InfrastructureManagement = () => {
  const { activeUnit, getUnitInfrastructures } = useProductionUnits();

  const handleInfrastructureSave = (infrastructure: any) => {
    console.log('Infrastructure saved:', infrastructure);
    // The form component already handles the saving logic
  };

  if (!activeUnit) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-gray-500">
            Sélectionnez une unité de production pour voir ses infrastructures
          </p>
        </div>
      </div>
    );
  }

  const infrastructures = getUnitInfrastructures(activeUnit.id);

  const getInfrastructureIcon = (type: string) => {
    if (type.includes('bassin')) return Activity;
    if (type.includes('chambre')) return Thermometer;
    return Building;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInfrastructureTypeLabel = (type: string) => {
    switch (type) {
      case 'bassin_incubation': return 'Bassin d\'incubation';
      case 'bassin_grossissement': return 'Bassin de grossissement';
      case 'chambre_froide': return 'Chambre froide';
      case 'chambre_froide_positive': return 'Chambre froide positive';
      case 'bassin_quarantaine': return 'Bassin de quarantaine';
      case 'salle_transformation': return 'Salle de transformation';
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête spécifique à l'unité */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Infrastructures - {activeUnit.name}</h2>
            <p className="text-gray-100">Gestion des équipements et installations</p>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span>Type: {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {infrastructures.length} infrastructures
              </Badge>
            </div>
          </div>
          <InfrastructureForm onSave={handleInfrastructureSave} />
        </div>
      </div>

      {/* Statistiques des infrastructures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Building className="h-5 w-5 text-gray-600" />
            </div>
            <p className="text-2xl font-bold">{infrastructures.length}</p>
            <p className="text-sm text-gray-600">Total infrastructures</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{infrastructures.filter(i => i.status === 'active').length}</p>
            <p className="text-sm text-gray-600">Actives</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Settings className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">{infrastructures.filter(i => i.status === 'maintenance').length}</p>
            <p className="text-sm text-gray-600">En maintenance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">
              {infrastructures.reduce((sum, i) => sum + i.capacity, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Capacité totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des infrastructures */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste complète</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {infrastructures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {infrastructures.map((infrastructure) => (
                <InfrastructureCard key={infrastructure.id} infrastructure={infrastructure} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucune infrastructure configurée
              </h3>
              <p className="text-gray-500 mb-4">
                Ajoutez des infrastructures pour l'unité {activeUnit.name}
              </p>
              <InfrastructureForm onSave={handleInfrastructureSave} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring en temps réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructures.filter(i => i.status === 'active').map((infrastructure) => (
                  <div key={infrastructure.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{infrastructure.name}</h4>
                      <Badge variant="outline">En ligne</Badge>
                    </div>
                    
                    {infrastructure.specifications && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {Object.entries(infrastructure.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Planning de maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructures.map((infrastructure) => (
                  <div key={infrastructure.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{infrastructure.name}</h4>
                      <p className="text-sm text-gray-600">{getInfrastructureTypeLabel(infrastructure.type)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(infrastructure.status)}>
                        {infrastructure.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Programmer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfrastructureManagement;
