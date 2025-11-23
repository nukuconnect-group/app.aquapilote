
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Calendar } from 'lucide-react';
import { useProductionCycles } from '@/hooks/useProductionCycles';

interface ProductionCycleFormProps {
  unitId: string;
  unitName: string;
  unitType: string;
  onSave?: (cycle: any) => void;
}

const ProductionCycleForm = ({ unitId, unitName, unitType, onSave }: ProductionCycleFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { createCycle } = useProductionCycles();
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
    infrastructure: ''
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

  const infrastructuresByType = {
    ecloserie: ['Bac éclosion 1', 'Bac éclosion 2', 'Bac alevinage', 'Système recirculation'],
    grossissement: ['Bassin A1', 'Bassin A2', 'Bassin B1', 'Étang Nord', 'Cage flottante'],
    transformation: ['Atelier découpe', 'Zone emballage', 'Poste filetage'],
    conservation: ['Chambre froide 1', 'Chambre froide 2', 'Congélateur'],
    fabrication_aliment: ['Ligne production 1', 'Ligne production 2', 'Zone stockage'],
    commercialisation: ['Point vente', 'Zone expédition', 'Véhicule livraison']
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
      
      // Appeler onSave si fourni (pour compatibilité avec l'ancien code)
      if (onSave) {
        onSave({
          id: savedCycle.id,
          name: savedCycle.name,
          species: formData.species,
          startDate: savedCycle.start_date,
          endDate: savedCycle.end_date,
          expectedDuration: parseInt(formData.expectedDuration),
          initialQuantity: savedCycle.initial_quantity,
          targetQuantity: savedCycle.target_quantity,
          currentQuantity: savedCycle.current_quantity,
          initialWeight: parseFloat(formData.initialWeight) || 0,
          targetWeight: parseFloat(formData.targetWeight) || 0,
          feedType: formData.feedType,
          notes: savedCycle.notes,
          infrastructure: formData.infrastructure,
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
        infrastructure: ''
      });
    } catch (error) {
      console.error('Error creating cycle:', error);
    }
  };

  const species = speciesByType[unitType] || [];
  const infrastructures = infrastructuresByType[unitType] || [];

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
                  <div>
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
                
                <div>
                  <Label htmlFor="infrastructure">Infrastructure</Label>
                  <Select onValueChange={(value) => setFormData({...formData, infrastructure: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {infrastructures.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      <SelectValue placeholder="Sélectionner un programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Programme Starter</SelectItem>
                      <SelectItem value="croissance">Programme Croissance</SelectItem>
                      <SelectItem value="finition">Programme Finition</SelectItem>
                      <SelectItem value="reproducteur">Programme Reproducteur</SelectItem>
                    </SelectContent>
                  </Select>
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
