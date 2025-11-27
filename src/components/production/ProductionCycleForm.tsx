import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Calendar, AlertCircle } from 'lucide-react';
import { useProductionCycles } from '@/hooks/useProductionCycles';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductionCycleFormProps {
  unitId: string;
  unitName: string;
  unitType: string;
  onSave?: (cycle: any) => void;
}

const ProductionCycleForm = ({ unitId, unitName, unitType, onSave }: ProductionCycleFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { createCycle } = useProductionCycles();
  const { createInfrastructures } = useCycleInfrastructures();
  const { getUnitInfrastructures } = useProductionUnits();
  const { batches } = useLivestockBatches(unitId);
  
  // Récupérer les infrastructures réelles de l'unité
  const unitInfrastructures = getUnitInfrastructures(unitId);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    customSpecies: '',
    startDate: '',
    expectedDuration: '6',
    initialQuantity: '',
    targetQuantity: '',
    initialWeight: '',
    targetWeight: '',
    feedType: '',
    notes: '',
    infrastructures: [] as string[],
    infrastructureBatches: {} as Record<string, string>
  });

  // Calcul automatique de la date de fin
  const calculateEndDate = () => {
    if (!formData.startDate || !formData.expectedDuration) return '';
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(formData.expectedDuration));
    return endDate.toISOString().split('T')[0];
  };

  const calculatedEndDate = calculateEndDate();

  const speciesByType = {
    ecloserie: ['Carpe commune', 'Tilapia', 'Truite arc-en-ciel', 'Saumon', 'Bar'],
    grossissement: ['Carpe commune', 'Tilapia', 'Truite arc-en-ciel', 'Saumon', 'Bar', 'Dorade'],
    transformation: ['Produits transformés', 'Filets', 'Entiers vidés'],
    conservation: ['Produits frais', 'Produits congelés', 'Produits fumés'],
    fabrication_aliment: ['Aliment starter', 'Aliment croissance', 'Aliment finition'],
    commercialisation: ['Vente directe', 'Grossistes', 'Restauration']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Déterminer l'espèce finale (personnalisée ou prédéfinie)
      const finalSpecies = formData.species === 'custom' 
        ? formData.customSpecies 
        : formData.species;
      
      const cycleData = {
        unit_id: unitId,
        unit_name: unitName,
        unit_type: unitType,
        name: formData.name,
        status: 'active',
        start_date: formData.startDate,
        end_date: calculatedEndDate,
        current_quantity: parseInt(formData.initialQuantity),
        target_quantity: parseInt(formData.targetQuantity),
        initial_quantity: parseInt(formData.initialQuantity),
        fingerlings_count: parseInt(formData.initialQuantity),
        stocking_date: formData.startDate,
        notes: formData.notes,
        species: finalSpecies,
        duration_months: parseInt(formData.expectedDuration),
      };

      const savedCycle = await createCycle(cycleData);
      
      if (!savedCycle) {
        throw new Error('Failed to create cycle');
      }
      
      // Créer les infrastructures rattachées au cycle avec leurs lots
      if (formData.infrastructures.length > 0) {
        await createInfrastructures(savedCycle.id, formData.infrastructures, unitType, formData.infrastructureBatches);
      }
      
      // Appeler onSave si fourni (pour compatibilité avec l'ancien code)
      if (onSave) {
        onSave({
          id: savedCycle.id,
          name: savedCycle.name,
          species: formData.species,
          startDate: savedCycle.start_date,
          endDate: savedCycle.end_date,
          expectedDuration: parseInt(formData.expectedDuration),
          initialQuantity: savedCycle.initial_quantity || 0,
          targetQuantity: savedCycle.target_quantity || 0,
          currentQuantity: savedCycle.current_quantity || 0,
          initialWeight: parseFloat(formData.initialWeight) || 0,
          targetWeight: parseFloat(formData.targetWeight) || 0,
          feedType: formData.feedType,
          notes: savedCycle.notes || '',
          infrastructures: formData.infrastructures,
          unitId: savedCycle.unit_id,
          status: savedCycle.status,
          progress: 0
        });
      }
      
      setIsOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        species: '',
        customSpecies: '',
        startDate: '',
        expectedDuration: '6',
        initialQuantity: '',
        targetQuantity: '',
        initialWeight: '',
        targetWeight: '',
        feedType: '',
        notes: '',
        infrastructures: [],
        infrastructureBatches: {}
      });
    } catch (error) {
      console.error('Error creating cycle:', error);
    }
  };

  const species = speciesByType[unitType] || [];
  // Utiliser les infrastructures réelles de l'unité au lieu des hardcodées
  const infrastructures = unitInfrastructures.filter(inf => inf.status === 'active');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau cycle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Créer un cycle - {unitName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du cycle</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={`Cycle ${unitName} ${new Date().getFullYear()}`}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Espèce/Produit</Label>
                  <Select 
                    value={formData.species} 
                    onValueChange={(value) => setFormData({...formData, species: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {species.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                      <SelectItem value="custom">➕ Espèce personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.species === 'custom' && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="customSpecies">Nom de l'espèce</Label>
                    <Input
                      id="customSpecies"
                      value={formData.customSpecies}
                      onChange={(e) => setFormData({...formData, customSpecies: e.target.value})}
                      placeholder="Ex: Tilapia du Nil"
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructures rattachées */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Infrastructures rattachées au cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Sélectionnez une ou plusieurs infrastructures qui feront partie de ce cycle de production
                </p>
                
                {infrastructures.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucune infrastructure active disponible. Créez d'abord des infrastructures dans le module Infrastructure pour pouvoir les rattacher à un cycle.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-3">
                      {infrastructures.map((infra) => (
                        <div key={infra.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`infra-${infra.id}`}
                              checked={formData.infrastructures.includes(infra.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Auto-sélectionner le lot suggéré si disponible
                                  const suggestedBatch = (infra as any).suggestedBatchId || '';
                                  setFormData({
                                    ...formData,
                                    infrastructures: [...formData.infrastructures, infra.name],
                                    infrastructureBatches: {
                                      ...formData.infrastructureBatches,
                                      [infra.name]: suggestedBatch
                                    }
                                  });
                                } else {
                                  const newBatches = { ...formData.infrastructureBatches };
                                  delete newBatches[infra.name];
                                  setFormData({
                                    ...formData,
                                    infrastructures: formData.infrastructures.filter(i => i !== infra.name),
                                    infrastructureBatches: newBatches
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`infra-${infra.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              <div>
                                <div className="font-medium">{infra.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {infra.customTypeName || infra.type} - Capacité: {infra.capacity}
                                </div>
                              </div>
                            </Label>
                          </div>
                          
                          {formData.infrastructures.includes(infra.name) && (
                            <div className="ml-6">
                              <Label className="text-xs">Lot de poisson (optionnel)</Label>
                              <Select
                                value={formData.infrastructureBatches[infra.name] || (infra as any).suggestedBatchId || 'none'}
                                onValueChange={(value) => {
                                  setFormData({
                                    ...formData,
                                    infrastructureBatches: {
                                      ...formData.infrastructureBatches,
                                      [infra.name]: value === 'none' ? '' : value
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue placeholder="Sélectionner un lot" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun lot</SelectItem>
                                  {batches.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                      {batch.species} - {batch.quantity} individus ({batch.average_weight}g)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {(infra as any).suggestedBatchId && (
                                <p className="text-xs text-primary mt-1">
                                  ✓ Lot suggéré pour cette infrastructure
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.infrastructures.length > 0 && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium text-primary">
                          {formData.infrastructures.length} infrastructure(s) sélectionnée(s)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Planification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Planification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="expectedDuration">Durée prévue (mois)</Label>
                  <Select value={formData.expectedDuration} onValueChange={(value) => setFormData({...formData, expectedDuration: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 24].map((months) => (
                        <SelectItem key={months} value={months.toString()}>
                          {months} mois
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {calculatedEndDate && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    📅 Date de fin calculée : {new Date(calculatedEndDate).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objectifs de production */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Objectifs de production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="initialQuantity">Quantité initiale</Label>
                  <Input
                    id="initialQuantity"
                    type="number"
                    value={formData.initialQuantity}
                    onChange={(e) => setFormData({...formData, initialQuantity: e.target.value})}
                    placeholder="1000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="targetQuantity">Objectif quantité</Label>
                  <Input
                    id="targetQuantity"
                    type="number"
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData({...formData, targetQuantity: e.target.value})}
                    placeholder="800"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="initialWeight">Poids initial (kg)</Label>
                  <Input
                    id="initialWeight"
                    type="number"
                    step="0.1"
                    value={formData.initialWeight}
                    onChange={(e) => setFormData({...formData, initialWeight: e.target.value})}
                    placeholder="50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="targetWeight">Poids objectif (kg)</Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({...formData, targetWeight: e.target.value})}
                    placeholder="2000"
                  />
                </div>
              </div>
              
              {unitType === 'ecloserie' || unitType === 'grossissement' ? (
                <div>
                  <Label htmlFor="feedType">Programme alimentaire</Label>
                  <Select onValueChange={(value) => setFormData({...formData, feedType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un aliment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Programme Starter</SelectItem>
                      <SelectItem value="croissance">Programme Croissance</SelectItem>
                      <SelectItem value="finition">Programme Finition</SelectItem>
                      <SelectItem value="reproducteur">Programme Reproducteur</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Créez vos stocks d'aliments dans le module Alimentation
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes et observations</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Objectifs spécifiques, contraintes, observations..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Créer le cycle
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionCycleForm;
