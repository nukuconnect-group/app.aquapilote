
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fish, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Scale,
  Calculator
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ControlFishing {
  id: string;
  date: string;
  unitId: string;
  basinId: string;
  sampleSize: number;
  totalWeight: number;
  averageWeight: number;
  mortalityCount: number;
  mortalityCause: string;
  feedingAdjustment: string;
  rendementM2: number;
  notes: string;
  fishCount: number;
  waterTemp: number;
  season: string;
}

interface FishControlFishingProps {
  unitId: string;
  unitName: string;
}

const FishControlFishing = ({ unitId, unitName }: FishControlFishingProps) => {
  const [controlRecords, setControlRecords] = useState<ControlFishing[]>([
    {
      id: '1',
      date: '2024-03-15',
      unitId: unitId,
      basinId: 'BAS001',
      sampleSize: 50,
      totalWeight: 6.25,
      averageWeight: 125,
      mortalityCount: 2,
      mortalityCause: 'Stress manipulation',
      feedingAdjustment: 'Maintenir ration actuelle',
      rendementM2: 15.2,
      notes: 'Croissance satisfaisante, poissons en bonne santé',
      fishCount: 2500,
      waterTemp: 26.5,
      season: 'Printemps'
    },
    {
      id: '2',
      date: '2024-02-28',
      unitId: unitId,
      basinId: 'BAS001',
      sampleSize: 45,
      totalWeight: 4.95,
      averageWeight: 110,
      mortalityCount: 1,
      mortalityCause: 'Naturelle',
      feedingAdjustment: 'Augmenter de 10%',
      rendementM2: 13.8,
      notes: 'Légère baisse de croissance, surveillance nécessaire',
      fishCount: 2520,
      waterTemp: 24.2,
      season: 'Hiver'
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    basinId: '',
    sampleSize: 0,
    totalWeight: 0,
    mortalityCount: 0,
    mortalityCause: '',
    feedingAdjustment: '',
    notes: '',
    fishCount: 0,
    waterTemp: 0,
    season: ''
  });

  const mortalityCauses = [
    'Naturelle',
    'Stress manipulation',
    'Maladie',
    'Qualité de l\'eau',
    'Prédation',
    'Accident',
    'Inconnue'
  ];

  const feedingAdjustments = [
    'Maintenir ration actuelle',
    'Augmenter de 10%',
    'Augmenter de 20%',
    'Réduire de 10%',
    'Réduire de 20%',
    'Changer type d\'aliment',
    'Ajuster fréquence'
  ];

  const seasons = ['Printemps', 'Été', 'Automne', 'Hiver'];

  const calculateStats = () => {
    const averageWeight = controlRecords.reduce((sum, record) => sum + record.averageWeight, 0) / controlRecords.length;
    const totalMortality = controlRecords.reduce((sum, record) => sum + record.mortalityCount, 0);
    const averageRendement = controlRecords.reduce((sum, record) => sum + record.rendementM2, 0) / controlRecords.length;
    const growthTrend = controlRecords.length >= 2 ? 
      ((controlRecords[0].averageWeight - controlRecords[controlRecords.length - 1].averageWeight) / controlRecords[controlRecords.length - 1].averageWeight) * 100 : 0;

    return {
      averageWeight: averageWeight.toFixed(1),
      totalMortality,
      averageRendement: averageRendement.toFixed(1),
      growthTrend: growthTrend.toFixed(1)
    };
  };

  const handleSaveRecord = () => {
    const averageWeight = newRecord.totalWeight > 0 && newRecord.sampleSize > 0 ? 
      (newRecord.totalWeight * 1000) / newRecord.sampleSize : 0;
    
    const rendementM2 = newRecord.fishCount > 0 ? 
      (newRecord.fishCount * averageWeight) / 1000 : 0;

    const record: ControlFishing = {
      id: Date.now().toString(),
      unitId,
      averageWeight,
      rendementM2,
      ...newRecord
    };

    setControlRecords(prev => [record, ...prev]);
    
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      basinId: '',
      sampleSize: 0,
      totalWeight: 0,
      mortalityCount: 0,
      mortalityCause: '',
      feedingAdjustment: '',
      notes: '',
      fishCount: 0,
      waterTemp: 0,
      season: ''
    });
    setShowDialog(false);
  };

  const stats = calculateStats();

  // Données pour les graphiques
  const weightEvolutionData = controlRecords
    .slice()
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      poids: record.averageWeight,
      rendement: record.rendementM2
    }));

  const mortalityData = controlRecords
    .slice()
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      mortalite: record.mortalityCount
    }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Fish className="w-5 h-5 text-blue-600" />
            Pêche de Contrôle - {unitName}
          </h3>
          <p className="text-sm text-gray-600">Suivi technique et évaluation des performances</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle pêche de contrôle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-3xl mx-2 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enregistrer une Pêche de Contrôle</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Date</Label>
                <Input 
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Bassin</Label>
                <Input 
                  value={newRecord.basinId}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, basinId: e.target.value }))}
                  placeholder="ID du bassin"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Taille de l'échantillon</Label>
                <Input 
                  type="number"
                  value={newRecord.sampleSize}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, sampleSize: parseInt(e.target.value) || 0 }))}
                  placeholder="Nombre de poissons pesés"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Poids total (kg)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={newRecord.totalWeight}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, totalWeight: parseFloat(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Effectif total estimé</Label>
                <Input 
                  type="number"
                  value={newRecord.fishCount}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, fishCount: parseInt(e.target.value) || 0 }))}
                  placeholder="Nombre total de poissons"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Température eau (°C)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={newRecord.waterTemp}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, waterTemp: parseFloat(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Saison</Label>
                <Select value={newRecord.season} onValueChange={(value) => setNewRecord(prev => ({ ...prev, season: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Sélectionner la saison" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season} value={season}>{season}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Mortalités observées</Label>
                <Input 
                  type="number"
                  value={newRecord.mortalityCount}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, mortalityCount: parseInt(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Cause de mortalité</Label>
                <Select value={newRecord.mortalityCause} onValueChange={(value) => setNewRecord(prev => ({ ...prev, mortalityCause: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Sélectionner la cause" />
                  </SelectTrigger>
                  <SelectContent>
                    {mortalityCauses.map(cause => (
                      <SelectItem key={cause} value={cause}>{cause}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Ajustement alimentation</Label>
                <Select value={newRecord.feedingAdjustment} onValueChange={(value) => setNewRecord(prev => ({ ...prev, feedingAdjustment: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Recommandation" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedingAdjustments.map(adjustment => (
                      <SelectItem key={adjustment} value={adjustment}>{adjustment}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm">Observations</Label>
                <Textarea 
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes et observations techniques..."
                  className="text-sm"
                />
              </div>
              {/* Calculs automatiques affichés */}
              {newRecord.sampleSize > 0 && newRecord.totalWeight > 0 && (
                <div className="sm:col-span-2 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Calculs automatiques
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Poids moyen individuel</p>
                      <p className="font-bold text-lg text-blue-800">
                        {((newRecord.totalWeight * 1000) / newRecord.sampleSize).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Poids total général</p>
                      <p className="font-bold text-lg text-blue-800">
                        {newRecord.totalWeight.toFixed(2)} kg
                      </p>
                    </div>
                    {newRecord.fishCount > 0 && (
                      <div>
                        <p className="text-gray-600">Rendement estimé (kg/m²)</p>
                        <p className="font-bold text-lg text-blue-800">
                          {((newRecord.fishCount * ((newRecord.totalWeight * 1000) / newRecord.sampleSize)) / 1000).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={handleSaveRecord} className="flex-1">
                  Enregistrer la pêche de contrôle
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{stats.averageWeight}g</p>
            <p className="text-xs sm:text-sm text-gray-600">Poids moyen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{stats.averageRendement}</p>
            <p className="text-xs sm:text-sm text-gray-600">kg/m² moyen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{stats.totalMortality}</p>
            <p className="text-xs sm:text-sm text-gray-600">Mortalités totales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className={`h-4 w-4 sm:h-5 sm:w-5 ${parseFloat(stats.growthTrend) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <p className="text-lg sm:text-2xl font-bold">{stats.growthTrend}%</p>
            <p className="text-xs sm:text-sm text-gray-600">Évolution croissance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
          <TabsTrigger value="records">Enregistrements</TabsTrigger>
          <TabsTrigger value="growth-chart">Graphique poids</TabsTrigger>
          <TabsTrigger value="mortality-chart">Mortalité</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {controlRecords.map(record => (
            <Card key={record.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Bassin {record.basinId}</CardTitle>
                    <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString('fr-FR')} - {record.season}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {record.averageWeight.toFixed(0)}g moyen
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {record.rendementM2.toFixed(1)} kg/m²
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Échantillon:</span>
                    <span className="ml-1 font-medium">{record.sampleSize} poissons</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Poids total:</span>
                    <span className="ml-1 font-medium">{record.totalWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mortalités:</span>
                    <span className="ml-1 font-medium">{record.mortalityCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Température:</span>
                    <span className="ml-1 font-medium">{record.waterTemp}°C</span>
                  </div>
                </div>
                
                {record.mortalityCause && (
                  <div className="mb-2 text-xs sm:text-sm">
                    <span className="text-gray-600">Cause mortalité:</span>
                    <span className="ml-1 font-medium">{record.mortalityCause}</span>
                  </div>
                )}
                
                {record.feedingAdjustment && (
                  <div className="mb-2 text-xs sm:text-sm">
                    <span className="text-gray-600">Ajustement alimentation:</span>
                    <span className="ml-1 font-medium">{record.feedingAdjustment}</span>
                  </div>
                )}
                
                {record.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs sm:text-sm">
                    <strong>Notes:</strong> {record.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="growth-chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Évolution du Poids et Rendement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="poids" stroke="#3b82f6" strokeWidth={2} name="Poids moyen (g)" />
                    <Line yAxisId="right" type="monotone" dataKey="rendement" stroke="#10b981" strokeWidth={2} name="Rendement (kg/m²)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mortality-chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Évolution de la Mortalité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mortalityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="mortalite" fill="#ef4444" name="Mortalités" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FishControlFishing;
