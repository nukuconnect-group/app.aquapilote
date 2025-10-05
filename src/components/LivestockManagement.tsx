import React, { useState } from 'react';
import { Fish, Plus, Edit, Trash2, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
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
}

const LivestockManagement = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();
  const { units } = useProductionUnits();
  
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

  const totalQuantity = filteredBatches.reduce((sum, batch) => sum + batch.quantity, 0);
  const totalWeight = filteredBatches.reduce((sum, batch) => sum + batch.totalWeight, 0);
  const healthyBatches = filteredBatches.filter(batch => batch.status === 'healthy').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Gestion du Cheptel</h2>
            <p className="text-green-100 text-sm sm:text-base">Suivi et gestion des lots de poissons par unité</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full sm:w-48 bg-white/20 border-white/30 text-white">
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
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un lot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau lot</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau lot de poissons dans une unité
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
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

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Fish className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalQuantity.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Individus total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalWeight.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Kg total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{healthyBatches}</p>
                <p className="text-sm text-gray-600">Lots sains</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{filteredBatches.length}</p>
                <p className="text-sm text-gray-600">Lots actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des lots */}
      <Card>
        <CardHeader>
          <CardTitle>Lots de poissons</CardTitle>
          <CardDescription>
            Gestion et suivi de tous les lots par unité de production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBatches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{batch.species}</h3>
                      {batch.variety && (
                        <Badge variant="secondary">{batch.variety}</Badge>
                      )}
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status === 'healthy' ? 'Sain' : 
                         batch.status === 'sick' ? 'Malade' :
                         batch.status === 'quarantine' ? 'Quarantaine' : 'Vendu'}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {batch.unitName}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quantité</p>
                        <p className="font-medium">{batch.quantity.toLocaleString()} individus</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Poids total</p>
                        <p className="font-medium">{batch.totalWeight.toFixed(1)} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Âge</p>
                        <p className="font-medium">{batch.currentAge} jours</p>
                      </div>
                      {batch.feedingPlan && (
                        <div>
                          <p className="text-gray-600">Plan alimentation</p>
                          <p className="font-medium">{batch.feedingPlan}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Acquisition</p>
                        <p className="font-medium">{new Date(batch.acquisitionDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Récolte prévue</p>
                        <p className="font-medium">{new Date(batch.expectedHarvestDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Source</p>
                        <p className="font-medium">{batch.source}</p>
                      </div>
                    </div>

                    {batch.notes && (
                      <div className="mt-3">
                        <p className="text-gray-600 text-sm">Notes</p>
                        <p className="text-sm">{batch.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => setEditingBatch(batch)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteBatch(batch.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivestockManagement;
