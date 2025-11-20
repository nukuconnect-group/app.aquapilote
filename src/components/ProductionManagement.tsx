
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, TrendingUp, Activity, Clock } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import ProductionCycleForm from './production/ProductionCycleForm';
import ProductionCycleDetails from './production/ProductionCycleDetails';

const ProductionManagement = () => {
  const { activeUnit, getUnitCycles } = useProductionUnits();
  const [customCycles, setCustomCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!activeUnit) {
    return (
      <div className="space-y-responsive">
        <div className="bg-gradient-ocean p-responsive rounded-xl text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-responsive">
            <div>
              <h2 className="text-responsive-title font-bold mb-2">Gestion des Cycles</h2>
              <p className="text-primary-foreground/80 text-responsive">Suivi des cycles et performances</p>
            </div>
          </div>
          <div className="mt-4">
            <ProductionUnitSelector />
          </div>
        </div>

        <div className="text-center py-12">
          <BarChart3 className="icon-responsive-lg mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-responsive-subtitle font-semibold text-foreground mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-muted-foreground text-responsive">
            Sélectionnez une unité pour voir sa production
          </p>
        </div>
      </div>
    );
  }

  const unitCycles = [...getUnitCycles(activeUnit.id), ...customCycles.filter(c => c.unitId === activeUnit.id)];

  const handleSaveCycle = (cycle) => {
    setCustomCycles([...customCycles, cycle]);
  };

  const handleShowDetails = (cycle) => {
    setSelectedCycle(cycle);
    setShowDetails(true);
  };

  const handleEditCycle = (cycle) => {
    // Future: Implement cycle editing
    console.log('Edit cycle:', cycle);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur d'unité */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Cycles - {activeUnit.name}</h2>
            <p className="text-green-100 text-sm sm:text-base">Suivi des cycles et performances</p>
            <div className="mt-2 flex flex-wrap items-center space-x-4 text-xs sm:text-sm">
              <span>Type: {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {unitCycles.length} cycles
              </Badge>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <ProductionCycleForm 
              unitId={activeUnit.id}
              unitName={activeUnit.name}
              unitType={activeUnit.type}
              onSave={handleSaveCycle}
            />
          </div>
        </div>
        
        <ProductionUnitSelector />
      </div>

      {/* Métriques de production */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{unitCycles.filter(c => c.status === 'active').length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Cycles actifs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{unitCycles.reduce((sum, c) => sum + c.currentQuantity, 0).toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-600">Production actuelle</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{unitCycles.reduce((sum, c) => sum + c.targetQuantity, 0).toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-600">Objectif total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{unitCycles.filter(c => c.status === 'completed').length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Cycles terminés</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des cycles */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active">Cycles actifs</TabsTrigger>
            <TabsTrigger value="all">Tous les cycles</TabsTrigger>
            <TabsTrigger value="planning">Planification</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="space-y-4">
          {unitCycles.filter(c => c.status === 'active').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unitCycles.filter(c => c.status === 'active').map((cycle) => (
                <Card key={cycle.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg">{cycle.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800 w-fit">
                        {cycle.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="text-xs sm:text-sm">
                      <p className="text-gray-600">Démarré le {cycle.startDate}</p>
                      <p className="font-medium">
                        {cycle.currentQuantity.toLocaleString()} / {cycle.targetQuantity.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ width: `${(cycle.currentQuantity / cycle.targetQuantity) * 100}%` }}
                      ></div>
                    </div>
                    
                    {cycle.notes && (
                      <p className="text-xs sm:text-sm text-gray-500">{cycle.notes}</p>
                    )}
                    
                    <div className="pt-2 border-t flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleShowDetails(cycle)}
                      >
                        Détails
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 sm:flex-none"
                        onClick={() => handleEditCycle(cycle)}
                      >
                        Modifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun cycle actif
              </h3>
              <p className="text-gray-500 mb-4">
                Aucun cycle de production en cours pour {activeUnit.name}
              </p>
              <ProductionCycleForm 
                unitId={activeUnit.id}
                unitName={activeUnit.name}
                unitType={activeUnit.type}
                onSave={handleSaveCycle}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {unitCycles.map((cycle) => (
              <Card key={cycle.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base">{cycle.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {cycle.startDate} - {cycle.endDate || 'En cours'}
                      </p>
                    </div>
                    <Badge 
                      className={
                        cycle.status === 'active' ? 'bg-green-100 text-green-800' :
                        cycle.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {cycle.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Planification des cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm sm:text-base">Planification des prochains cycles de production pour {activeUnit.name}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal des détails du cycle */}
      {selectedCycle && (
        <ProductionCycleDetails
          cycle={selectedCycle}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedCycle(null);
          }}
          onEdit={handleEditCycle}
        />
      )}
    </div>
  );
};

export default ProductionManagement;
