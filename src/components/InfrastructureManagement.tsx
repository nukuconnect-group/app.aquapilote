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
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        <div className="text-center py-8 sm:py-12 px-4">
          <Building className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* En-tête spécifique à l'unité */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 sm:p-6 rounded-lg sm:rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 truncate">
              Infrastructures - {activeUnit.name}
            </h2>
            <p className="text-gray-100 text-sm sm:text-base">
              Gestion des équipements et installations
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="truncate">
                Type: {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white text-xs sm:text-sm">
                {infrastructures.length} infrastructures
              </Badge>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <InfrastructureForm onSave={handleInfrastructureSave} />
          </div>
        </div>
      </div>

      {/* Statistiques des infrastructures */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold truncate">{infrastructures.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total infrastructures</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold truncate">
              {infrastructures.filter(i => i.status === 'active').length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Actives</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-bold truncate">
              {infrastructures.filter(i => i.status === 'maintenance').length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">En maintenance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            </div>
            <p className="text-lg sm:text-2xl font-bold truncate">
              {infrastructures.reduce((sum, i) => sum + i.capacity, 0).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Capacité totale</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des infrastructures */}
      <Tabs defaultValue="list" className="space-y-4">
        <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="list" className="text-xs sm:text-sm px-2 sm:px-3">
              Liste complète
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-xs sm:text-sm px-2 sm:px-3">
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs sm:text-sm px-2 sm:px-3">
              Maintenance
            </TabsTrigger>
          </TabsList>
        </div>

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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Monitoring en temps réel</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {infrastructures.filter(i => i.status === 'active').map((infrastructure) => (
                  <div key={infrastructure.id} className="p-3 sm:p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {infrastructure.name}
                      </h4>
                      <Badge variant="outline" className="w-fit text-xs sm:text-sm">
                        En ligne
                      </Badge>
                    </div>
                    
                    {infrastructure.specifications && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                        {Object.entries(infrastructure.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between gap-2 min-w-0">
                            <span className="text-gray-600 truncate">{key}:</span>
                            <span className="font-medium truncate">{value}</span>
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Planning de maintenance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {infrastructures.map((infrastructure) => (
                  <div key={infrastructure.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 border rounded">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {infrastructure.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {getInfrastructureTypeLabel(infrastructure.type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getStatusColor(infrastructure.status)} text-xs sm:text-sm`}>
                        {infrastructure.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs sm:text-sm">
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
