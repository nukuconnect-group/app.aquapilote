import React, { useState, useEffect, useMemo } from 'react';
import { Fish, Plus, Edit, Trash2, Calendar, TrendingUp, Activity, BarChart3, Heart, Printer, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import ControlFishingForm from './ControlFishingForm';
import ReproductionManagement from './reproduction/ReproductionManagement';
import { generateControlFishingPdf } from '@/lib/controlFishingPdf';

interface LivestockBatch {
  id: string;
  species: string;
  variety: string;
  quantity: number;
  averageWeight: number;
  totalWeight: number;
  acquisitionDate: string;
  source: string;
  unitId: string;
  unitName: string;
  status: 'healthy' | 'sick' | 'quarantine' | 'sold';
  notes: string;
  expectedHarvestDate: string;
  currentAge: number; // en jours
  feedingPlan: string;
  lastHealthCheck: string;
  controlRecords?: ControlFishing[];
}

interface ControlFishing {
  id: string;
  date: string;
  bassinId: string;
  bassinName: string;
  sampleSize: number;
  totalWeight: number;
  estimatedTotal: number;
  waterTemp: number;
  season: string;
  mortality: number;
  mortalityCause?: string;
  feedingAdjustment?: string;
  notes: string;
  averageWeight?: number;
  rendementM2?: number;
}

const LivestockManagement = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();
  const { units, activeUnit, setActiveUnit } = useProductionUnits();
  const { t } = useSettings();
  const { isDemoMode } = useAuth();
  
  // Utiliser l'unité active du contexte
  const selectedUnit = activeUnit?.id || 'all';
  
  // Filtrer par unité active
  const { batches: dbBatches, loading: batchesLoading, createBatch, deleteBatch, updateBatch } = useLivestockBatches(activeUnit?.id);
  
  // Charger les pêches de contrôle (health records) depuis la DB - sans filtre de cycle pour voir toutes les pêches
  const { records: healthRecords, refetch: refetchHealthRecords } = useHealthRecords(undefined, activeUnit?.id);
  
  // Charger les infrastructures pour les noms
  const { infrastructures: allCycleInfras } = useCycleInfrastructures(undefined, true);
  
  // Fonction pour changer l'unité sélectionnée
  const handleUnitChange = (unitId: string) => {
    if (unitId === 'all') {
      setActiveUnit(null);
    } else {
      const unit = units.find(u => u.id === unitId);
      setActiveUnit(unit || null);
    }
  };
  
  // Convertir les lots de la DB au format local pour compatibilité
  const livestockBatches: LivestockBatch[] = dbBatches.map(batch => ({
    id: batch.id,
    species: batch.species,
    variety: batch.variety || '',
    quantity: batch.quantity,
    averageWeight: batch.average_weight,
    totalWeight: batch.total_weight,
    acquisitionDate: batch.acquisition_date || '',
    source: batch.source || '',
    unitId: batch.unit_id,
    unitName: batch.unit_name,
    status: batch.status as 'healthy' | 'sick' | 'quarantine' | 'sold',
    notes: batch.notes || '',
    expectedHarvestDate: batch.expected_harvest_date || '',
    currentAge: batch.current_age,
    feedingPlan: batch.feeding_plan || '',
    lastHealthCheck: batch.last_health_check || ''
  }));

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<LivestockBatch | null>(null);
  const [showControlForm, setShowControlForm] = useState(false);
  
  // Données de contrôle de pêche - vides par défaut, remplies en mode démo
  const getDemoControlRecords = (): ControlFishing[] => isDemoMode ? [
    {
      id: '1',
      date: '2024-03-15',
      bassinId: 'unit1',
      bassinName: 'Bassin BAS001',
      sampleSize: 50,
      totalWeight: 6.25,
      estimatedTotal: 1500,
      waterTemp: 26.5,
      season: 'Printemps',
      mortality: 2,
      mortalityCause: 'Stress manipulation',
      feedingAdjustment: 'Maintenir ration actuelle',
      notes: 'Croissance satisfaisante, poissons en bonne santé',
      averageWeight: 125,
      rendementM2: 15.2
    },
    {
      id: '2',
      date: '2024-02-28',
      bassinId: 'unit1',
      bassinName: 'Bassin BAS001',
      sampleSize: 50,
      totalWeight: 5.5,
      estimatedTotal: 1480,
      waterTemp: 24.5,
      season: 'Hiver',
      mortality: 3,
      mortalityCause: 'Naturelle',
      feedingAdjustment: 'Augmenter légèrement',
      notes: 'Adaptation aux conditions hivernales',
      averageWeight: 110,
      rendementM2: 13.8
    }
  ] : [];
  
  const [controlRecords, setControlRecords] = useState<ControlFishing[]>(getDemoControlRecords());
  
  // Mettre à jour les données de contrôle quand le mode démo change
  useEffect(() => {
    setControlRecords(getDemoControlRecords());
  }, [isDemoMode]);
  
  const [controlFormData, setControlFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bassinId: '',
    sampleSize: 0,
    totalWeight: 0,
    estimatedTotal: 0,
    waterTemp: 0,
    season: '',
    mortality: 0,
    mortalityCause: '',
    feedingAdjustment: 'Maintenir ration actuelle',
    notes: ''
  });
  const [formData, setFormData] = useState({
    species: '',
    variety: '',
    type: 'alevins',
    quantity: 0,
    averageWeight: 0,
    acquisitionDate: '',
    source: '',
    unitId: '',
    unitName: '',
    notes: '',
    expectedHarvestDate: '',
    feedingPlan: '',
    status: 'healthy' as const,
    expectedSurvivalRate: 95
  });

  const species = ['Tilapia', 'Carpe', 'Truite', 'Poisson-chat', 'Bar', 'Daurade'];

  const handleAddBatch = async () => {
    if (!formData.species || !formData.quantity || !formData.unitId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedUnit = units.find(u => u.id === formData.unitId);
    const currentAge = formData.acquisitionDate 
      ? Math.floor((Date.now() - new Date(formData.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    try {
      await createBatch({
        species: formData.species,
        variety: formData.variety,
        type: formData.type,
        quantity: formData.quantity,
        average_weight: formData.averageWeight,
        total_weight: formData.quantity * formData.averageWeight / 1000,
        acquisition_date: formData.acquisitionDate || null,
        source: formData.source,
        unit_id: formData.unitId,
        unit_name: selectedUnit?.name || '',
        status: formData.status,
        notes: formData.notes,
        expected_harvest_date: formData.expectedHarvestDate || null,
        current_age: currentAge,
        feeding_plan: formData.feedingPlan,
        last_health_check: new Date().toISOString().split('T')[0],
        expected_survival_rate: formData.expectedSurvivalRate
      });

      addLog('Ajout cheptel', 'Cheptel', `Nouveau lot: ${formData.species} - ${formData.quantity} individus - Unité: ${selectedUnit?.name}`, 'success');

      setFormData({
        species: '',
        variety: '',
        type: 'alevins',
        quantity: 0,
        averageWeight: 0,
        acquisitionDate: '',
        source: '',
        unitId: '',
        unitName: '',
        notes: '',
        expectedHarvestDate: '',
        feedingPlan: '',
        status: 'healthy',
        expectedSurvivalRate: 95
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    const batch = livestockBatches.find(b => b.id === id);
    try {
      await deleteBatch(id);
      addLog('Suppression cheptel', 'Cheptel', `Lot supprimé: ${batch?.species} - ${batch?.quantity} individus`, 'warning');
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const handleAddControlFishing = () => {
    if (!controlFormData.bassinId || !controlFormData.sampleSize || !controlFormData.totalWeight) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedUnit = units.find(u => u.id === controlFormData.bassinId);
    const averageWeight = controlFormData.sampleSize > 0 
      ? (controlFormData.totalWeight / controlFormData.sampleSize) * 1000 
      : 0;

    const newRecord: ControlFishing = {
      id: Date.now().toString(),
      ...controlFormData,
      bassinName: selectedUnit?.name || '',
      averageWeight: Math.round(averageWeight),
      rendementM2: 0 // À calculer selon la surface disponible
    };

    setControlRecords(prev => [newRecord, ...prev]);
    addLog('Pêche contrôle', 'Cheptel', `Nouvelle pêche de contrôle enregistrée - ${selectedUnit?.name}`, 'success');
    
    toast({
      title: "Pêche de contrôle enregistrée",
      description: `Données enregistrées pour ${selectedUnit?.name}`
    });

    setControlFormData({
      date: new Date().toISOString().split('T')[0],
      bassinId: '',
      sampleSize: 0,
      totalWeight: 0,
      estimatedTotal: 0,
      waterTemp: 0,
      season: '',
      mortality: 0,
      mortalityCause: '',
      feedingAdjustment: 'Maintenir ration actuelle',
      notes: ''
    });
    setShowControlForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Les données sont déjà filtrées par le hook via activeUnit.id
  const filteredBatches = livestockBatches;

  const filteredControlRecords = activeUnit
    ? controlRecords.filter(record => record.bassinId === activeUnit.id)
    : controlRecords;

  const totalQuantity = filteredBatches.reduce((sum, batch) => sum + batch.quantity, 0);
  const totalWeight = filteredBatches.reduce((sum, batch) => sum + batch.totalWeight, 0);
  const healthyBatches = filteredBatches.filter(batch => batch.status === 'healthy').length;

  // Calcul des métriques de pêche de contrôle
  const avgWeight = filteredControlRecords.length > 0
    ? filteredControlRecords.reduce((sum, r) => sum + (r.averageWeight || 0), 0) / filteredControlRecords.length
    : 0;
  const avgRendement = filteredControlRecords.length > 0
    ? filteredControlRecords.reduce((sum, r) => sum + (r.rendementM2 || 0), 0) / filteredControlRecords.length
    : 0;
  const totalMortality = filteredControlRecords.reduce((sum, r) => sum + r.mortality, 0);
  const growthEvolution = filteredControlRecords.length > 1
    ? ((filteredControlRecords[0].averageWeight || 0) - (filteredControlRecords[filteredControlRecords.length - 1].averageWeight || 0)) / 
      (filteredControlRecords[filteredControlRecords.length - 1].averageWeight || 1) * 100
    : 0;

  // Calcul des métriques pour les alertes
  const [alertsData, setAlertsData] = useState<any>(null);

  useEffect(() => {
    if (filteredBatches.length > 0) {
      // Calcul des métriques moyennes
      const totalMortality = filteredBatches.reduce((sum, batch) => {
        const mortality = batch.controlRecords?.reduce((s, r) => s + r.mortality, 0) || 0;
        return sum + mortality;
      }, 0);

      const avgGrowthRate = filteredBatches.reduce((sum, batch) => {
        if (batch.controlRecords && batch.controlRecords.length > 1) {
          const records = batch.controlRecords.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const lastRecord = records[records.length - 1];
          const firstRecord = records[0];
          const days = Math.max(1, Math.floor(
            (new Date(lastRecord.date).getTime() - new Date(firstRecord.date).getTime()) / (1000 * 60 * 60 * 24)
          ));
          const growth = (lastRecord.averageWeight - firstRecord.averageWeight) / days;
          return sum + growth;
        }
        return sum;
      }, 0) / Math.max(1, filteredBatches.filter(b => b.controlRecords && b.controlRecords.length > 1).length);

      // Paramètres eau moyens (simulation - à remplacer par vraies données)
      const avgTemp = 26.5;
      const avgPh = 7.2;
      const avgOxygen = 6.5;

      setAlertsData({
        quantity: totalQuantity,
        mortality: totalMortality,
        growthRate: avgGrowthRate,
        temperature: avgTemp,
        ph: avgPh,
        oxygen: avgOxygen,
        feedingEfficiency: 1.52,
        unitName: selectedUnit === 'all' ? 'Toutes les unités' : units.find(u => u.id === selectedUnit)?.name
      });
    }
  }, [filteredBatches, selectedUnit, units]);

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">Gestion du Cheptel</h2>
            <p className="text-green-100 text-xs sm:text-sm">Suivi et gestion des lots de poissons par unité</p>
          </div>
          <div className="flex flex-col gap-2">
            <Select value={selectedUnit} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-full bg-white/20 border-white/30 text-white text-sm">
                <SelectValue placeholder="Sélectionner une unité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les unités</SelectItem>
                {units.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 text-sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="truncate">Ajouter un lot</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau lot</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau lot de poissons dans une unité
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Espèce *</Label>
                      <Select value={formData.species} onValueChange={(value) => setFormData({...formData, species: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {species.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Souche/Variété</Label>
                      <Input
                        value={formData.variety}
                        onChange={(e) => setFormData({...formData, variety: e.target.value})}
                        placeholder="Ex: Monosex, Red, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Type de lot *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alevins">Alevins</SelectItem>
                        <SelectItem value="geniteurs">Géniteurs</SelectItem>
                        <SelectItem value="juveniles">Juvéniles</SelectItem>
                        <SelectItem value="adultes">Adultes</SelectItem>
                        <SelectItem value="autres">Autres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Unité de production *</Label>
                    <Select value={formData.unitId} onValueChange={(value) => {
                      const unit = units.find(u => u.id === value);
                      setFormData({...formData, unitId: value, unitName: unit?.name || ''});
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {unit.type}
                              </Badge>
                              {unit.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Quantité *</Label>
                      <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                        placeholder="Nombre d'individus"
                      />
                    </div>
                    <div>
                      <Label>Poids moyen (g)</Label>
                      <Input
                        type="number"
                        value={formData.averageWeight}
                        onChange={(e) => setFormData({...formData, averageWeight: parseInt(e.target.value) || 0})}
                        placeholder="Poids en grammes"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Date d'acquisition</Label>
                    <Input
                      type="date"
                      value={formData.acquisitionDate}
                      onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Source/Fournisseur</Label>
                    <Input
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      placeholder="Nom du fournisseur"
                    />
                  </div>

                  {units.find(u => u.id === formData.unitId)?.type !== 'transformation' && 
                   units.find(u => u.id === formData.unitId)?.type !== 'conservation' && (
                    <div>
                      <Label>Plan d'alimentation</Label>
                      <Select value={formData.feedingPlan} onValueChange={(value) => setFormData({...formData, feedingPlan: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard croissance">Standard croissance</SelectItem>
                          <SelectItem value="Intensif">Intensif</SelectItem>
                          <SelectItem value="Extensif">Extensif</SelectItem>
                          <SelectItem value="Finition">Finition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Taux de survie prévisionnel (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.expectedSurvivalRate}
                      onChange={(e) => setFormData({...formData, expectedSurvivalRate: parseFloat(e.target.value) || 95})}
                      placeholder="Ex: 95"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Taux de survie attendu pour ce lot (par défaut 95%)
                    </p>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Observations, remarques..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddBatch}>
                    Ajouter le lot
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>


      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Fish className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{totalQuantity.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Individus total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{totalWeight.toFixed(1)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Kg total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{healthyBatches}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Lots sains</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold truncate">{filteredBatches.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Lots actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de gestion - Reproduction visible uniquement pour écloserie */}
      <Tabs defaultValue="lots" className="space-y-3 sm:space-y-4">
        <TabsList className={`w-full grid h-auto ${activeUnit?.type === 'ecloserie' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="lots" className="text-xs sm:text-sm px-2 py-2">Lots</TabsTrigger>
          {activeUnit?.type === 'ecloserie' && (
            <TabsTrigger value="reproduction" className="text-xs sm:text-sm px-2 py-2">
              <Heart className="w-3 h-3 mr-1 hidden sm:inline" />
              Reproduction
            </TabsTrigger>
          )}
          <TabsTrigger value="control" className="text-xs sm:text-sm px-2 py-2">Pêche</TabsTrigger>
          <TabsTrigger value="charts" className="text-xs sm:text-sm px-2 py-2">Graphiques</TabsTrigger>
        </TabsList>

        {/* Onglet Liste des lots */}
        <TabsContent value="lots">
          <Card>
            <CardHeader>
              <CardTitle>Lots de poissons</CardTitle>
              <CardDescription>
                Gestion et suivi de tous les lots par unité de production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {filteredBatches.map((batch) => (
                  <div key={batch.id} className="border rounded-lg p-3 sm:p-4 hover:bg-accent/50">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg">{batch.species}</h3>
                          {batch.variety && (
                            <Badge variant="secondary" className="text-xs">{batch.variety}</Badge>
                          )}
                          <Badge className={`${getStatusColor(batch.status)} text-xs`}>
                            {batch.status === 'healthy' ? 'Sain' : 
                             batch.status === 'sick' ? 'Malade' :
                             batch.status === 'quarantine' ? 'Quarantaine' : 'Vendu'}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                            {batch.unitName}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Quantité</p>
                            <p className="font-medium truncate">{batch.quantity.toLocaleString()} individus</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Poids moyen ind.</p>
                            <p className="font-medium">{batch.averageWeight} g</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Poids total</p>
                            <p className="font-medium">{batch.totalWeight.toFixed(1)} kg</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Âge</p>
                            <p className="font-medium">{batch.currentAge} jours</p>
                          </div>
                          {batch.feedingPlan && (
                            <div>
                              <p className="text-muted-foreground">Plan aliment.</p>
                              <p className="font-medium truncate">{batch.feedingPlan}</p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Acquisition</p>
                            <p className="font-medium">{new Date(batch.acquisitionDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Récolte prévue</p>
                            <p className="font-medium">{new Date(batch.expectedHarvestDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Source</p>
                            <p className="font-medium truncate">{batch.source}</p>
                          </div>
                        </div>

                        {batch.notes && (
                          <div className="mt-2">
                            <p className="text-muted-foreground text-xs">Notes</p>
                            <p className="text-xs line-clamp-2">{batch.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingBatch(batch)} className="flex-1 sm:flex-none">
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteBatch(batch.id)} className="flex-1 sm:flex-none">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Reproduction (uniquement pour écloseries) */}
        <TabsContent value="reproduction">
          <ReproductionManagement selectedUnitId={selectedUnit} />
        </TabsContent>

        {/* Onglet Pêche de contrôle */}
        <TabsContent value="control">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg flex-wrap">
                      <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Pêche de Contrôle</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">
                      Enregistrez les pêches de contrôle par infrastructure
                    </CardDescription>
                  </div>
                  {healthRecords.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const recordsWithNames = healthRecords.map(r => {
                          const infra = allCycleInfras.find(i => i.id === r.basin_id);
                          return {
                            ...r,
                            infrastructureName: infra?.infrastructure_name || 'N/A'
                          };
                        });
                        generateControlFishingPdf({
                          records: recordsWithNames,
                          unitName: activeUnit?.name
                        });
                      }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimer PDF
                    </Button>
                  )}
                </div>
                <ControlFishingForm 
                  unitId={selectedUnit === 'all' ? (units[0]?.id || '') : selectedUnit}
                  onRecordCreated={refetchHealthRecords}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthRecords.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Historique des pêches ({healthRecords.length})</h4>
                  {healthRecords.slice(0, 10).map((record) => {
                    const infra = allCycleInfras.find(i => i.id === record.basin_id);
                    return (
                      <div key={record.id} className="border rounded-lg p-3 text-sm hover:bg-accent/30">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                          <div className="flex gap-2">
                            {infra && <Badge variant="outline">{infra.infrastructure_name}</Badge>}
                            {record.density && (
                              <Badge variant="secondary" className="text-xs">
                                {record.density.toFixed(1)}% prélevé
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="text-muted-foreground block">PMI</span>
                            <span className="font-bold text-primary">{record.average_weight?.toFixed(1) ?? '-'}g</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="text-muted-foreground block">Échantillon</span>
                            <span className="font-medium">{record.sample_count ?? '-'} sujets</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="text-muted-foreground block">Poids total</span>
                            <span className="font-medium">{record.feeding?.toFixed(2) ?? '-'} kg</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="text-muted-foreground block">Temp</span>
                            <span className="font-medium">{record.temperature ?? '-'}°C</span>
                          </div>
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="text-muted-foreground block">pH / O₂</span>
                            <span className="font-medium">{record.ph ?? '-'} / {record.oxygen ?? '-'}</span>
                          </div>
                        </div>
                        {record.notes && record.notes.includes('PRÉLÈVEMENT PAR LOTS') && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Voir détails des lots
                            </summary>
                            <pre className="text-xs mt-2 p-2 bg-muted rounded whitespace-pre-wrap">
                              {record.notes}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Fish className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Aucune pêche de contrôle enregistrée. Utilisez le formulaire ci-dessus pour en ajouter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Graphiques & Évolution */}
        <TabsContent value="charts">
          <div className="grid gap-3 sm:gap-4">
            {/* Message si pas de données */}
            {filteredBatches.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Fish className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
                  <p className="text-muted-foreground">
                    Ajoutez des lots de poissons pour voir les graphiques de performance.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Graphique performance par espèce - données réelles */}
            {filteredBatches.length > 0 && (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Performance par espèce</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Comparaison des performances des différentes espèces</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={
                        // Agréger les données par espèce
                        Object.values(filteredBatches.reduce((acc, batch) => {
                          const species = batch.species || 'Autres';
                          if (!acc[species]) {
                            acc[species] = { espece: species, quantite: 0, poids: 0 };
                          }
                          acc[species].quantite += batch.quantity;
                          acc[species].poids += batch.totalWeight;
                          return acc;
                        }, {} as Record<string, { espece: string; quantite: number; poids: number }>))
                      }>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="espece" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="quantite" fill="#3b82f6" name="Quantité" />
                        <Bar dataKey="poids" fill="#10b981" name="Poids total (kg)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Graphique tendances temporelles - données réelles */}
            {filteredBatches.length > 0 && (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Tendances de croissance globale</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Évolution globale du cheptel</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                  <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { mois: 'Actuel', individus: totalQuantity, biomasse: totalWeight }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line yAxisId="left" type="monotone" dataKey="individus" stroke="#8b5cf6" name="Individus" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="biomasse" stroke="#f59e0b" name="Biomasse (kg)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KPIs additionnels - calculés à partir des vraies données */}
            {filteredBatches.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-lg sm:text-2xl font-bold truncate">
                          {healthyBatches > 0 ? ((healthyBatches / filteredBatches.length) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Taux survie</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-lg sm:text-2xl font-bold truncate">
                          {totalQuantity > 0 ? (totalWeight / (totalQuantity / 1000)).toFixed(2) : '0'}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Poids moy. (g)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-base sm:text-2xl font-bold truncate">{filteredBatches.length}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Lots actifs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-lg sm:text-2xl font-bold truncate">
                          {filteredBatches.length > 0 
                            ? Math.round(filteredBatches.reduce((sum, b) => sum + b.currentAge, 0) / filteredBatches.length) 
                            : 0}j
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Âge moy.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LivestockManagement;
