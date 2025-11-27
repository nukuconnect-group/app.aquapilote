import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Plus, TrendingUp, Activity, Clock, AlertTriangle, Utensils, Printer, Mail } from 'lucide-react';
import SmartAlerts from './alerts/SmartAlerts';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import ProductionCycleForm from './production/ProductionCycleForm';
import ProductionCycleDetails from './production/ProductionCycleDetails';
import { useFeedingRecords } from '@/hooks/useFeedingRecords';
import { useProductionCycles } from '@/hooks/useProductionCycles';
import { useSettings } from '@/contexts/SettingsContext';
import FeedingForm from './feeding/FeedingForm';
import FeedingHistory from './feeding/FeedingHistory';
import FeedStockManager from './feeding/FeedStockManager';
import FeedingChart from './feeding/FeedingChart';
import FeedingPlanScheduler from './feeding/FeedingPlanScheduler';
import { generateFeedingRecordHTML, printHTML } from '@/lib/feedingPrintUtils';
import { useToast } from '@/hooks/use-toast';

const FeedingManagement = () => {
  const { activeUnit } = useProductionUnits();
  const { t } = useSettings();
  const { toast } = useToast();
  const { records: feedingRecords, loading, createRecord, updateRecord, deleteRecord } = useFeedingRecords();
  const { cycles } = useProductionCycles(activeUnit?.id);
  
  const activeCycle = cycles.find(c => c.status === 'active');

  if (!activeUnit) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Gestion de l'Alimentation</h2>
              <p className="text-orange-100 text-sm sm:text-base">Fiches techniques et suivi nutritionnel</p>
            </div>
          </div>
          <div className="mt-4">
            <ProductionUnitSelector />
          </div>
        </div>
        
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-gray-500">
            Sélectionnez une unité de production pour gérer son alimentation
          </p>
        </div>
      </div>
    );
  }

  const getFeedingData = () => {
    switch (activeUnit.type) {
      case 'ecloserie':
        return {
          title: 'Alimentation - Écloserie',
          subtitle: 'Nourriture spécialisée pour alevins et géniteurs',
          dailyQuantity: '15 kg',
          feedType: 'Aliment starter + Reproducteurs',
          feedingTimes: 6,
          lastFeeding: '14:30',
          nextFeeding: '17:00',
          notes: 'Alimentation renforcée pour la reproduction'
        };
      
      case 'grossissement':
        return {
          title: 'Alimentation - Grossissement',
          subtitle: 'Programme d\'alimentation pour la croissance',
          dailyQuantity: '250 kg',
          feedType: 'Aliment croissance premium',
          feedingTimes: 4,
          lastFeeding: '13:45',
          nextFeeding: '18:00',
          notes: 'Ajustement selon la biomasse'
        };
      
      case 'fabrication_aliment':
        return {
          title: 'Production d\'Aliment',
          subtitle: 'Fabrication et formulation',
          dailyQuantity: '2,500 kg',
          feedType: 'Mix protéine 32%',
          feedingTimes: 'Production continue',
          lastFeeding: 'En cours',
          nextFeeding: 'Batch suivant: 16:00',
          notes: 'Contrôle qualité en cours'
        };
      
      default:
        return {
          title: `Alimentation - ${activeUnit.name}`,
          subtitle: 'Gestion de l\'alimentation',
          dailyQuantity: 'N/A',
          feedType: 'Non applicable',
          feedingTimes: 0,
          lastFeeding: 'N/A',
          nextFeeding: 'N/A',
          notes: 'Unité sans alimentation directe'
        };
    }
  };

  const feedingData = getFeedingData();

  if (!['ecloserie', 'grossissement', 'fabrication_aliment'].includes(activeUnit.type)) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Gestion de l'Alimentation</h2>
              <p className="text-orange-100 text-sm sm:text-base">Unité: {activeUnit.name}</p>
            </div>
          </div>
          <div className="mt-4">
            <ProductionUnitSelector />
          </div>
        </div>
        
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Pas d'alimentation requise
          </h3>
          <p className="text-gray-500">
            Cette unité ({activeUnit.type}) ne nécessite pas de gestion d'alimentation
          </p>
        </div>
      </div>
    );
  }

  const unitRecords = feedingRecords.filter(record => record.unit_id === activeUnit.id);

  const handleSaveFeedingRecord = async (record: any) => {
    try {
      await createRecord({
        unit_id: activeUnit.id,
        cycle_id: activeCycle?.id,
        infrastructure_id: record.infrastructureId,
        date: record.date,
        time: record.time,
        feed_type: record.feedType,
        quantity: record.quantity,
        temperature: record.temperature || undefined,
        notes: record.notes || undefined,
        behavior: record.fishBehavior || undefined,
      });
    } catch (error) {
      console.error('Error saving feeding record:', error);
    }
  };

  const handlePrintRecord = (record: any) => {
    const html = generateFeedingRecordHTML(record, activeUnit.name);
    printHTML(html);
  };

  const handleEditRecord = async (record: any) => {
    try {
      await updateRecord(record.id, {
        date: record.date,
        time: record.time,
        feed_type: record.feed_type,
        quantity: record.quantity,
        temperature: record.temperature || undefined,
        notes: record.notes || undefined,
        behavior: record.behavior || undefined,
      });
    } catch (error) {
      console.error('Error updating feeding record:', error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord(id);
    } catch (error) {
      console.error('Error deleting feeding record:', error);
    }
  };

  const handleStockUpdate = (stocks: any[]) => {
    console.log('Stocks updated:', stocks);
  };

  const handlePlanUpdate = (plans: any[]) => {
    console.log('Plans updated:', plans);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur d'unité */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{feedingData.title}</h2>
            <p className="text-orange-100 text-sm sm:text-base">{feedingData.subtitle}</p>
            <div className="mt-2 flex flex-wrap items-center space-x-4 text-xs sm:text-sm">
              <span>Unité: {activeUnit.name}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <FeedingForm 
              unitId={activeUnit.id}
              unitName={activeUnit.name}
              cycleId={activeCycle?.id}
              onSave={handleSaveFeedingRecord}
            />
          </div>
        </div>
        
        <ProductionUnitSelector />
      </div>

      {/* Métriques d'alimentation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{feedingData.dailyQuantity}</p>
            <p className="text-xs sm:text-sm text-gray-600">Quantité/jour</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{feedingData.feedingTimes}</p>
            <p className="text-xs sm:text-sm text-gray-600">Repas/jour</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-sm sm:text-xl font-bold">{feedingData.lastFeeding}</p>
            <p className="text-xs sm:text-sm text-gray-600">Dernier repas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <p className="text-sm sm:text-xl font-bold">{feedingData.nextFeeding}</p>
            <p className="text-xs sm:text-sm text-gray-600">Prochain repas</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les détails */}
      <Tabs defaultValue="history" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="planning">Planification</TabsTrigger>
            <TabsTrigger value="stock">Stock aliment</TabsTrigger>
            <TabsTrigger value="analytics">Suivi graphique</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="history" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                Chargement des enregistrements...
              </CardContent>
            </Card>
          ) : unitRecords.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucun enregistrement d'alimentation pour cette unité.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {unitRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{record.feed_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.date} - {record.time || 'N/A'}
                        </p>
                        <p className="text-sm">Quantité: {record.quantity} kg</p>
                        {record.notes && <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handlePrintRecord(record)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteRecord(record.id)}>
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <FeedingPlanScheduler
            unitId={activeUnit.id}
            unitName={activeUnit.name}
            cycleId={activeCycle?.id}
            cycleName={activeCycle?.name || 'Aucun cycle actif'}
          />
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <FeedStockManager
            unitId={activeUnit.id}
            onStockUpdate={handleStockUpdate}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Graphiques à venir...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedingManagement;
