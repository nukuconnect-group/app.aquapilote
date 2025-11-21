import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fish, Plus, TrendingUp, AlertTriangle, Eye, Scale, Trash2, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import FishControlFishing from './fish/FishControlFishing';
import { useSettings } from '@/contexts/SettingsContext';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';

interface FishBatch {
  id: string;
  species: string;
  variety: string;
  quantity: number;
  averageWeight: number;
  totalWeight: number;
  acquisitionDate: string;
  source: string;
  status: 'healthy' | 'sick' | 'quarantine' | 'sold';
  notes: string;
  expectedHarvestDate: string;
  currentAge: number;
  feedingPlan: string;
  lastHealthCheck: string;
}

const FishManagement = () => {
  const { activeUnit } = useProductionUnits();
  const { t } = useSettings();
  const { addLog } = useLogs();
  const { toast } = useToast();
  
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [batches, setBatches] = useState<FishBatch[]>([
    {
      id: '1',
      species: 'Tilapia',
      variety: 'Tilapia du Nil',
      quantity: 1500,
      averageWeight: 150,
      totalWeight: 225,
      acquisitionDate: '2024-01-15',
      source: 'Écloserie Aqua Plus',
      status: 'healthy',
      notes: 'Lot en bonne santé, croissance normale',
      expectedHarvestDate: '2024-06-15',
      currentAge: 120,
      feedingPlan: 'Standard croissance',
      lastHealthCheck: '2024-03-01'
    }
  ]);
  
  const [formData, setFormData] = useState({
    species: '',
    variety: '',
    quantity: 0,
    averageWeight: 0,
    acquisitionDate: '',
    source: '',
    notes: '',
    expectedHarvestDate: '',
    feedingPlan: '',
    status: 'healthy' as const
  });

  const species = ['Tilapia', 'Carpe', 'Truite', 'Poisson-chat', 'Bar', 'Daurade'];

  const handleAddBatch = () => {
    if (!formData.species || !formData.quantity || !activeUnit) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newBatch: FishBatch = {
      id: Date.now().toString(),
      ...formData,
      totalWeight: formData.quantity * formData.averageWeight / 1000,
      currentAge: Math.floor((Date.now() - new Date(formData.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24)),
      lastHealthCheck: new Date().toISOString().split('T')[0]
    };

    setBatches(prev => [...prev, newBatch]);
    addLog('Ajout lot', 'Poisson', `Nouveau lot: ${formData.species} - ${formData.quantity} individus`, 'success');
    
    toast({
      title: "Lot ajouté",
      description: `${formData.quantity} ${formData.species} ajoutés avec succès`
    });

    setFormData({
      species: '',
      variety: '',
      quantity: 0,
      averageWeight: 0,
      acquisitionDate: '',
      source: '',
      notes: '',
      expectedHarvestDate: '',
      feedingPlan: '',
      status: 'healthy'
    });
    setShowAddBatch(false);
  };

  const handleDeleteBatch = (id: string) => {
    const batch = batches.find(b => b.id === id);
    setBatches(prev => prev.filter(b => b.id !== id));
    addLog('Suppression lot', 'Poisson', `Lot supprimé: ${batch?.species} - ${batch?.quantity} individus`, 'warning');
    
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
  
  if (!activeUnit) {
    return (
      <div className="space-y-4 w-full">
        <div className="bg-gradient-to-r from-aqua-500 to-ocean-500 p-4 sm:p-6 text-white -mx-0 sm:-mx-4 lg:-mx-6 -mt-0 sm:-mt-4 lg:-mt-6">
          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Gestion des Poissons</h2>
              <p className="text-primary-foreground/90 text-sm sm:text-base">Suivi des lots et performances zootechniques</p>
            </div>
            <div className="w-full">
              <ProductionUnitSelector />
            </div>
          </div>
        </div>
        
        <div className="text-center py-12 px-4">
          <Fish className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sélectionnez une unité de production pour gérer son cheptel
          </p>
        </div>
      </div>
    );
  }

  const getUnitSpecificContent = () => {
    switch (activeUnit.type) {
      case 'ecloserie':
        return {
          title: 'Gestion du Cheptel - Écloserie',
          subtitle: 'Géniteurs et production d\'alevins',
          data: {
            geniteurs_males: 45,
            geniteurs_femelles: 38,
            alevins_produits: 125000,
            larves_stade1: 45000,
            larves_stade2: 35000,
            larves_stade3: 25000,
            taux_fecondite: 89,
            prochaine_ponte: '2024-04-15'
          }
        };
      case 'grossissement':
        return {
          title: 'Gestion du Cheptel - Grossissement',
          subtitle: 'Poissons en croissance',
          data: {
            juveniles: 25000,
            sub_adultes: 15000,
            adultes: 2000,
            poids_moyen: 125,
            taux_croissance: 8.5,
            taux_mortalite: 2.1,
            densite_population: 85
          }
        };
      case 'transformation':
        return {
          title: 'Gestion du Stock - Transformation',
          subtitle: 'Poissons à transformer',
          data: {
            poissons_entiers: 1500,
            poissons_transformes: 950,
            rendement_decoupage: 78,
            stock_produits_finis: 740,
            commandes_en_attente: 12
          }
        };
      case 'conservation':
        return {
          title: 'Gestion du Stock - Conservation',
          subtitle: 'Produits en stockage',
          data: {
            produits_frais: 850,
            produits_congeles: 1200,
            temperature_moyenne: -2.5,
            capacite_utilisee: 85,
            rotation_stock: 15
          }
        };
      default:
        return {
          title: `Gestion du Cheptel - ${activeUnit.name}`,
          subtitle: 'Suivi des stocks et populations',
          data: {}
        };
    }
  };

  const unitContent = getUnitSpecificContent();

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* En-tête spécifique à l'unité - Pleine largeur sur mobile */}
      <div className="bg-gradient-to-r from-aqua-500 to-ocean-500 p-4 sm:p-6 text-white -mx-0 sm:-mx-4 lg:-mx-6 -mt-0 sm:-mt-4 lg:-mt-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 break-words">{unitContent.title}</h2>
              <p className="text-aqua-100 text-xs sm:text-sm md:text-base">{unitContent.subtitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="truncate">Unité: {activeUnit.name}</span>
                <Badge variant="secondary" className="bg-white/20 text-white text-xs shrink-0">
                  {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}
                </Badge>
              </div>
            </div>
            <Dialog open={showAddBatch} onOpenChange={setShowAddBatch}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto shrink-0" 
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un lot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau lot</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau lot de poissons pour {activeUnit.name}
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

                  {activeUnit.type !== 'transformation' && activeUnit.type !== 'conservation' && (
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
                  <Button variant="outline" onClick={() => setShowAddBatch(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddBatch}>
                    Ajouter le lot
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="w-full">
            <ProductionUnitSelector />
          </div>
        </div>
      </div>

      {/* Métriques spécifiques à l'unité */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {activeUnit.type === 'ecloserie' && <>
            <Card className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold truncate">{unitContent.data.geniteurs_males}</p>
                <p className="text-xs sm:text-sm text-gray-600">Géniteurs ♂</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold truncate">{unitContent.data.geniteurs_femelles}</p>
                <p className="text-xs sm:text-sm text-gray-600">Géniteurs ♀</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold">{unitContent.data.taux_fecondite}%</p>
                <p className="text-xs sm:text-sm text-gray-600">Taux fécondité</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-aqua-600 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold truncate">{unitContent.data.alevins_produits.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-600">Alevins produits</p>
              </CardContent>
            </Card>
          </>}

        {activeUnit.type === 'grossissement' && <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.juveniles?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Juvéniles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.poids_moyen}g</p>
                <p className="text-sm text-gray-600">Poids moyen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.taux_mortalite}%</p>
                <p className="text-sm text-gray-600">Mortalité</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.densite_population}%</p>
                <p className="text-sm text-gray-600">Densité</p>
              </CardContent>
            </Card>
          </>}

        {(activeUnit.type === 'transformation' || activeUnit.type === 'conservation') && <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[0]}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[0]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[1]}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[1]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[2]}{activeUnit.type === 'conservation' ? '°C' : '%'}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[2]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[3]}{activeUnit.type === 'conservation' ? '%' : ''}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[3]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
          </>}
      </div>

      {/* Détails par onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            {activeUnit.type !== 'transformation' && activeUnit.type !== 'conservation' && (
              <TabsTrigger value="control-fishing">Pêche de contrôle</TabsTrigger>
            )}
            {activeUnit.type === 'transformation' && (
              <TabsTrigger value="batches">Lots transformés</TabsTrigger>
            )}
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">État du cheptel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(unitContent.data).slice(0, 4).map(([key, value]) => <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="font-semibold">
                        {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                      </span>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertes et recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeUnit.type === 'ecloserie' && <>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Taux de fécondité optimal</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Ponte prévue dans 5 jours</span>
                      </div>
                    </>}
                  {activeUnit.type === 'grossissement' && <>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Croissance dans la norme</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Surveiller la densité</span>
                      </div>
                    </>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {activeUnit.type !== 'transformation' && activeUnit.type !== 'conservation' && (
          <TabsContent value="control-fishing" className="space-y-4">
            <FishControlFishing 
              unitId={activeUnit.id}
              unitName={activeUnit.name}
            />
          </TabsContent>
        )}

        {activeUnit.type === 'transformation' && (
          <TabsContent value="batches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des lots transformés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Suivez et gérez les lots de poissons transformés par espèce et type de transformation
                  </p>
                  {/* Example batch data */}
                  <div className="grid gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">Lot #2024-001</h4>
                          <p className="text-sm text-muted-foreground">Tilapia - Filet</p>
                        </div>
                        <Badge variant="outline">En cours</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Poids initial</p>
                          <p className="font-medium">500 kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Poids transformé</p>
                          <p className="font-medium">380 kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rendement</p>
                          <p className="font-medium">76%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Détails du cheptel - {activeUnit.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Données détaillées à venir pour l'unité {activeUnit.type}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des lots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.filter(b => b.status !== 'sold').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun lot actif</p>
                ) : (
                  batches.filter(b => b.status !== 'sold').map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
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
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Quantité</p>
                              <p className="font-medium">{batch.quantity.toLocaleString()} individus</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Poids total</p>
                              <p className="font-medium">{batch.totalWeight.toFixed(1)} kg</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Âge</p>
                              <p className="font-medium">{batch.currentAge} jours</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Source</p>
                              <p className="font-medium">{batch.source || 'N/A'}</p>
                            </div>
                          </div>

                          {batch.notes && (
                            <div className="mt-3 text-sm">
                              <p className="text-muted-foreground">Notes:</p>
                              <p className="text-foreground">{batch.notes}</p>
                            </div>
                          )}

                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            {batch.feedingPlan && (
                              <div>
                                <p className="text-muted-foreground">Plan alimentation</p>
                                <p className="font-medium">{batch.feedingPlan}</p>
                              </div>
                            )}
                            {batch.expectedHarvestDate && (
                              <div>
                                <p className="text-muted-foreground">Récolte prévue</p>
                                <p className="font-medium">{new Date(batch.expectedHarvestDate).toLocaleDateString('fr-FR')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FishManagement;
