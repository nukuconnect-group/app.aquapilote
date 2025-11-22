import React, { useState, useEffect } from 'react';
import { Fish, Plus, Edit, Trash2, Calendar, TrendingUp, AlertTriangle, Activity, BarChart3 } from 'lucide-react';
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
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SmartAlerts from './alerts/SmartAlerts';

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
  const { units } = useProductionUnits();
  const { t } = useSettings();
  
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [livestockBatches, setLivestockBatches] = useState<LivestockBatch[]>([
    {
      id: '1',
      species: 'Tilapia',
      variety: 'Tilapia du Nil',
      quantity: 1500,
      averageWeight: 150,
      totalWeight: 225,
      acquisitionDate: '2024-01-15',
      source: 'Écloserie Aqua Plus',
      unitId: 'unit1',
      unitName: 'Bassin A1',
      status: 'healthy',
      notes: 'Lot en bonne santé, croissance normale',
      expectedHarvestDate: '2024-06-15',
      currentAge: 120,
      feedingPlan: 'Standard croissance',
      lastHealthCheck: '2024-03-01'
    },
    {
      id: '2',
      species: 'Carpe',
      variety: 'Carpe commune',
      quantity: 800,
      averageWeight: 200,
      totalWeight: 160,
      acquisitionDate: '2024-02-01',
      source: 'Pisciculture Lac Vert',
      unitId: 'unit2',
      unitName: 'Bassin B1',
      status: 'healthy',
      notes: 'Adaptation réussie',
      expectedHarvestDate: '2024-07-01',
      currentAge: 90,
      feedingPlan: 'Intensif',
      lastHealthCheck: '2024-02-28'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<LivestockBatch | null>(null);
  const [showControlForm, setShowControlForm] = useState(false);
  const [controlRecords, setControlRecords] = useState<ControlFishing[]>([
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
  ]);
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
    quantity: 0,
    averageWeight: 0,
    acquisitionDate: '',
    source: '',
    unitId: '',
    unitName: '',
    notes: '',
    expectedHarvestDate: '',
    feedingPlan: '',
    status: 'healthy' as const
  });

  const species = ['Tilapia', 'Carpe', 'Truite', 'Poisson-chat', 'Bar', 'Daurade'];

  const handleAddBatch = () => {
    if (!formData.species || !formData.quantity || !formData.unitId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedUnit = units.find(u => u.id === formData.unitId);
    const newBatch: LivestockBatch = {
      id: Date.now().toString(),
      ...formData,
      unitName: selectedUnit?.name || '',
      totalWeight: formData.quantity * formData.averageWeight / 1000, // en kg
      currentAge: Math.floor((Date.now() - new Date(formData.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24)),
      lastHealthCheck: new Date().toISOString().split('T')[0]
    };

    setLivestockBatches(prev => [...prev, newBatch]);
    addLog('Ajout cheptel', 'Cheptel', `Nouveau lot: ${formData.species} - ${formData.quantity} individus - Unité: ${selectedUnit?.name}`, 'success');
    
    toast({
      title: "Lot ajouté",
      description: `${formData.quantity} ${formData.species} ajoutés avec succès à ${selectedUnit?.name}`
    });

    setFormData({
      species: '',
      variety: '',
      quantity: 0,
      averageWeight: 0,
      acquisitionDate: '',
      source: '',
      unitId: '',
      unitName: '',
      notes: '',
      expectedHarvestDate: '',
      feedingPlan: '',
      status: 'healthy'
    });
    setShowAddForm(false);
  };

  const handleDeleteBatch = (id: string) => {
    const batch = livestockBatches.find(b => b.id === id);
    setLivestockBatches(prev => prev.filter(b => b.id !== id));
    addLog('Suppression cheptel', 'Cheptel', `Lot supprimé: ${batch?.species} - ${batch?.quantity} individus`, 'warning');
    
    toast({
      title: "Lot supprimé",
      description: "Le lot a été supprimé avec succès"
    });
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

  const filteredBatches = selectedUnit === 'all' 
    ? livestockBatches 
    : livestockBatches.filter(batch => batch.unitId === selectedUnit);

  const filteredControlRecords = selectedUnit === 'all'
    ? controlRecords
    : controlRecords.filter(record => record.bassinId === selectedUnit);

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
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full bg-white/20 border-white/30 text-white text-sm">
                <SelectValue />
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
                      <Label>Variété</Label>
                      <Input
                        value={formData.variety}
                        onChange={(e) => setFormData({...formData, variety: e.target.value})}
                        placeholder="Variété"
                      />
                    </div>
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
                    <Label>Date de récolte prévue</Label>
                    <Input
                      type="date"
                      value={formData.expectedHarvestDate}
                      onChange={(e) => setFormData({...formData, expectedHarvestDate: e.target.value})}
                    />
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

      {/* Alertes intelligentes */}
      {alertsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes intelligentes
            </CardTitle>
            <CardDescription>Surveillance automatique des performances</CardDescription>
          </CardHeader>
          <CardContent>
            <SmartAlerts data={alertsData} unitId={selectedUnit !== 'all' ? selectedUnit : undefined} />
          </CardContent>
        </Card>
      )}

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

      {/* Onglets de gestion */}
      <Tabs defaultValue="lots" className="space-y-3 sm:space-y-4">
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="lots" className="text-xs sm:text-sm px-2 py-2">Lots</TabsTrigger>
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
                        
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Quantité</p>
                            <p className="font-medium truncate">{batch.quantity.toLocaleString()} individus</p>
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

        {/* Onglet Pêche de contrôle */}
        <TabsContent value="control">
          <div className="space-y-4">
            {/* En-tête avec bouton d'ajout */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg flex-wrap">
                      <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base">Pêche de Contrôle - {selectedUnit === 'all' ? 'Toutes les unités' : units.find(u => u.id === selectedUnit)?.name || ''}</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm mt-1">Suivi technique et évaluation des performances</CardDescription>
                  </div>
                  <Dialog open={showControlForm} onOpenChange={setShowControlForm}>
                    <DialogTrigger asChild>
                      <Button className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto text-xs sm:text-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Nouvelle pêche de contrôle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Enregistrer une Pêche de Contrôle</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={controlFormData.date}
                              onChange={(e) => setControlFormData({...controlFormData, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Bassin *</Label>
                            <Select value={controlFormData.bassinId} onValueChange={(value) => setControlFormData({...controlFormData, bassinId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="ID du bassin" />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map(unit => (
                                  <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Taille de l'échantillon</Label>
                            <Input
                              type="number"
                              value={controlFormData.sampleSize}
                              onChange={(e) => setControlFormData({...controlFormData, sampleSize: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label>Poids total (kg)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={controlFormData.totalWeight}
                              onChange={(e) => setControlFormData({...controlFormData, totalWeight: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Effectif total estimé</Label>
                            <Input
                              type="number"
                              value={controlFormData.estimatedTotal}
                              onChange={(e) => setControlFormData({...controlFormData, estimatedTotal: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label>Température eau (°C)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={controlFormData.waterTemp}
                              onChange={(e) => setControlFormData({...controlFormData, waterTemp: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Saison</Label>
                            <Select value={controlFormData.season} onValueChange={(value) => setControlFormData({...controlFormData, season: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la saison" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Printemps">Printemps</SelectItem>
                                <SelectItem value="Été">Été</SelectItem>
                                <SelectItem value="Automne">Automne</SelectItem>
                                <SelectItem value="Hiver">Hiver</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Mortalités observées</Label>
                            <Input
                              type="number"
                              value={controlFormData.mortality}
                              onChange={(e) => setControlFormData({...controlFormData, mortality: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Cause de mortalité</Label>
                            <Select value={controlFormData.mortalityCause} onValueChange={(value) => setControlFormData({...controlFormData, mortalityCause: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la cause" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Naturelle">Naturelle</SelectItem>
                                <SelectItem value="Stress manipulation">Stress manipulation</SelectItem>
                                <SelectItem value="Maladie">Maladie</SelectItem>
                                <SelectItem value="Prédation">Prédation</SelectItem>
                                <SelectItem value="Autre">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Ajustement alimentation</Label>
                            <Select value={controlFormData.feedingAdjustment} onValueChange={(value) => setControlFormData({...controlFormData, feedingAdjustment: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Recommandation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Maintenir ration actuelle">Maintenir ration actuelle</SelectItem>
                                <SelectItem value="Augmenter légèrement">Augmenter légèrement</SelectItem>
                                <SelectItem value="Augmenter significativement">Augmenter significativement</SelectItem>
                                <SelectItem value="Réduire légèrement">Réduire légèrement</SelectItem>
                                <SelectItem value="Réduire significativement">Réduire significativement</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Observations</Label>
                          <Textarea
                            value={controlFormData.notes}
                            onChange={(e) => setControlFormData({...controlFormData, notes: e.target.value})}
                            placeholder="Notes et observations techniques..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowControlForm(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleAddControlFishing} className="bg-cyan-600 hover:bg-cyan-700">
                          Enregistrer la pêche de contrôle
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs de navigation */}
            <Tabs defaultValue="enregistrements" className="space-y-3 sm:space-y-4">
              <TabsList className="w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="enregistrements" className="text-xs sm:text-sm px-2 py-2">Enreg.</TabsTrigger>
                <TabsTrigger value="graphiques" className="text-xs sm:text-sm px-2 py-2">Poids</TabsTrigger>
                <TabsTrigger value="mortalite" className="text-xs sm:text-sm px-2 py-2">Mortalité</TabsTrigger>
              </TabsList>

              {/* Tab Enregistrements */}
              <TabsContent value="enregistrements">
                {/* Métriques principales */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-lg sm:text-2xl font-bold truncate">{avgWeight.toFixed(1)}g</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">Poids moyen</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-lg sm:text-2xl font-bold truncate">{avgRendement.toFixed(1)}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">kg/m² moy.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-lg sm:text-2xl font-bold truncate">{totalMortality}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">Mortalités</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-lg sm:text-2xl font-bold truncate">{growthEvolution.toFixed(1)}%</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">Évolution</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Liste des enregistrements */}
                <div className="space-y-3 sm:space-y-4">
                  {filteredControlRecords.map((record) => (
                    <Card key={record.id} className="border-l-4 border-l-cyan-600">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex flex-col gap-2 mb-3">
                              <h3 className="font-semibold text-base sm:text-lg">{record.bassinName}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs w-fit">
                                {new Date(record.date).toLocaleDateString('fr-FR')} - {record.season}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground">Échantillon</p>
                                <p className="font-medium truncate">{record.sampleSize} poissons</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Poids total</p>
                                <p className="font-medium truncate">{record.totalWeight} kg</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Mortalités</p>
                                <p className="font-medium">{record.mortality}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Température</p>
                                <p className="font-medium">{record.waterTemp}°C</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className="bg-blue-100 text-blue-800 text-xs">{record.averageWeight}g moy.</Badge>
                              <Badge className="bg-green-100 text-green-800 text-xs">{record.rendementM2} kg/m²</Badge>
                            </div>

                            {record.mortalityCause && (
                              <div className="text-xs sm:text-sm mb-2">
                                <span className="text-muted-foreground">Cause mortalité: </span>
                                <span className="font-medium break-words">{record.mortalityCause}</span>
                              </div>
                            )}

                            <div className="text-xs sm:text-sm mb-2">
                              <span className="text-muted-foreground">Ajustement alim.: </span>
                              <span className="font-medium break-words">{record.feedingAdjustment}</span>
                            </div>

                            {record.notes && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-xs sm:text-sm break-words"><strong>Notes:</strong> {record.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredControlRecords.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Fish className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Aucune pêche de contrôle enregistrée</h3>
                        <p className="text-muted-foreground mb-4">
                          Commencez par enregistrer votre première pêche de contrôle
                        </p>
                        <Button onClick={() => setShowControlForm(true)} className="bg-cyan-600 hover:bg-cyan-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Nouvelle pêche de contrôle
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Tab Graphiques poids */}
              <TabsContent value="graphiques">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Évolution du poids moyen et rendement</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={filteredControlRecords.sort((a, b) => 
                          new Date(a.date).getTime() - new Date(b.date).getTime()
                        ).map(r => ({
                          date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                          poids: r.averageWeight,
                          rendement: r.rendementM2
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Line yAxisId="left" type="monotone" dataKey="poids" stroke="#3b82f6" name="Poids (g)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="rendement" stroke="#10b981" name="Rendement (kg/m²)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Mortalité */}
              <TabsContent value="mortalite">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Suivi de la mortalité</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={filteredControlRecords.sort((a, b) => 
                          new Date(a.date).getTime() - new Date(b.date).getTime()
                        ).map(r => ({
                          date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                          mortalite: r.mortality
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip contentStyle={{ fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="mortalite" fill="#ef4444" name="Mortalité (nb)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Onglet Graphiques & Évolution */}
        <TabsContent value="charts">
          <div className="grid gap-3 sm:gap-4">
            {/* Graphique performance par espèce */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Performance par espèce</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Comparaison des performances des différentes espèces</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { espece: 'Tilapia', quantite: 1500, poids: 225, rendement: 28 },
                      { espece: 'Carpe', quantite: 800, poids: 160, rendement: 22 },
                      { espece: 'Truite', quantite: 600, poids: 120, rendement: 18 }
                    ]}>
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

            {/* Graphique tendances temporelles */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Tendances de croissance globale</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Évolution globale du cheptel</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { mois: 'Sept', individus: 2100, biomasse: 315 },
                      { mois: 'Oct', individus: 2450, biomasse: 380 },
                      { mois: 'Nov', individus: 2900, biomasse: 465 },
                      { mois: 'Dec', individus: 3200, biomasse: 535 },
                      { mois: 'Jan', individus: 3600, biomasse: 612 }
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

            {/* KPIs additionnels */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold truncate">94.2%</p>
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
                      <p className="text-lg sm:text-2xl font-bold truncate">1.52</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Indice conv.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-base sm:text-2xl font-bold truncate">26.5 kg/m²</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Densité moy.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold truncate">145j</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Durée cycle</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LivestockManagement;
