
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Settings, Trash2, Power, PowerOff, Edit, MapPin, Fish, Plus } from 'lucide-react';
import { Infrastructure, useProductionUnits } from '@/contexts/ProductionUnitsContext';
import InfrastructureForm from './InfrastructureForm';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import InfrastructureLivestockCard from './InfrastructureLivestockCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface InfrastructureCardProps {
  infrastructure: Infrastructure;
}

const InfrastructureCard = ({ infrastructure }: InfrastructureCardProps) => {
  const { infrastructures, setInfrastructures, activeUnit } = useProductionUnits();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const { toast } = useToast();
  const { infrastructures: cycleInfras, updateInfrastructure } = useCycleInfrastructures();
  const { batches, createBatch } = useLivestockBatches(infrastructure.unitId);
  
  // Trouver l'infrastructure de cycle associée
  const cycleInfra = cycleInfras.find(ci => ci.infrastructure_name === infrastructure.name);
  
  // Trouver le lot de poisson rattaché
  const attachedBatch = cycleInfra?.livestock_batch_id 
    ? batches.find(b => b.id === cycleInfra.livestock_batch_id)
    : null;

  // État du formulaire de création de lot
  const [batchFormData, setBatchFormData] = useState({
    species: '',
    variety: '',
    quantity: 0,
    averageWeight: 0,
    acquisitionDate: new Date().toISOString().split('T')[0],
    source: '',
    notes: '',
    expectedHarvestDate: '',
    feedingPlan: '',
    status: 'healthy' as const
  });

  const species = ['Tilapia', 'Carpe', 'Truite', 'Poisson-chat', 'Bar', 'Daurade', 'Autre'];

  const getInfrastructureIcon = (type: string) => {
    if (type.includes('bassin')) return Building;
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
    const types: Record<string, string> = {
      'bassin_incubation': 'Bassin d\'incubation',
      'bassin_grossissement': 'Bassin de grossissement',
      'chambre_froide': 'Chambre froide',
      'chambre_froide_positive': 'Chambre froide positive',
      'bassin_quarantaine': 'Bassin de quarantaine',
      'salle_transformation': 'Salle de transformation',
      'pompe_oxygene': 'Pompe à oxygène',
      'systeme_filtration': 'Système de filtration',
      'generateur': 'Générateur électrique',
      'autre': 'Autre'
    };
    return types[type] || type.replace('_', ' ');
  };

  const toggleStatus = (newStatus: 'active' | 'inactive') => {
    const updatedInfrastructures = infrastructures.map(inf =>
      inf.id === infrastructure.id 
        ? { ...inf, status: newStatus }
        : inf
    );
    setInfrastructures(updatedInfrastructures);
  };

  const deleteInfrastructure = () => {
    const updatedInfrastructures = infrastructures.filter(inf => inf.id !== infrastructure.id);
    setInfrastructures(updatedInfrastructures);
  };

  const handleEditSave = (updatedInfrastructure: any) => {
    console.log('Infrastructure updated:', updatedInfrastructure);
    // The form component already handles the saving logic
  };

  const handleCreateAndAttachBatch = async () => {
    if (!batchFormData.species || !batchFormData.quantity) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires (espèce et quantité)",
        variant: "destructive"
      });
      return;
    }

    if (!activeUnit) {
      toast({
        title: "Erreur",
        description: "Aucune unité sélectionnée",
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculer l'âge et le poids total
      const currentAge = batchFormData.acquisitionDate 
        ? Math.floor((Date.now() - new Date(batchFormData.acquisitionDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const totalWeight = batchFormData.quantity * batchFormData.averageWeight / 1000;

      // Créer le lot
      const newBatch = await createBatch({
        species: batchFormData.species,
        variety: batchFormData.variety,
        quantity: batchFormData.quantity,
        average_weight: batchFormData.averageWeight,
        total_weight: totalWeight,
        acquisition_date: batchFormData.acquisitionDate || null,
        source: batchFormData.source,
        unit_id: activeUnit.id,
        unit_name: activeUnit.name,
        status: batchFormData.status,
        notes: batchFormData.notes,
        expected_harvest_date: batchFormData.expectedHarvestDate || null,
        current_age: currentAge,
        feeding_plan: batchFormData.feedingPlan,
        last_health_check: new Date().toISOString().split('T')[0]
      });

      // Si un cycle infra existe, rattacher le lot
      if (cycleInfra && newBatch) {
        await updateInfrastructure(cycleInfra.id, {
          livestock_batch_id: newBatch.id
        });
      }

      toast({
        title: "Succès",
        description: "Lot créé et rattaché à l'infrastructure"
      });

      // Réinitialiser le formulaire
      setBatchFormData({
        species: '',
        variety: '',
        quantity: 0,
        averageWeight: 0,
        acquisitionDate: new Date().toISOString().split('T')[0],
        source: '',
        notes: '',
        expectedHarvestDate: '',
        feedingPlan: '',
        status: 'healthy'
      });
      setIsCreateBatchOpen(false);
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const IconComponent = getInfrastructureIcon(infrastructure.type);

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="pb-3 p-3 sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base md:text-lg flex items-start sm:items-center gap-2 min-w-0 flex-1">
              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="truncate">{infrastructure.name}</span>
            </CardTitle>
            <Badge className={`${getStatusColor(infrastructure.status)} text-xs sm:text-sm flex-shrink-0`}>
              {infrastructure.status === 'active' ? 'Actif' : 
               infrastructure.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="text-xs sm:text-sm">
            <p className="font-medium text-gray-700 break-words">
              {getInfrastructureTypeLabel(infrastructure.type)}
            </p>
            <p className="text-gray-500">
              Capacité: {infrastructure.capacity.toLocaleString()}
            </p>
            {infrastructure.specifications?.location && (
              <p className="text-gray-500 flex items-start sm:items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="break-words">{infrastructure.specifications.location}</span>
              </p>
            )}
            {infrastructure.specifications?.usage && (
              <p className="text-gray-500 mt-1 break-words">
                Usage: {infrastructure.specifications.usage}
              </p>
            )}
          </div>
          
          {infrastructure.specifications && (
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700">Spécifications:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(infrastructure.specifications)
                  .filter(([key]) => !['location', 'usage', 'description'].includes(key))
                  .map(([key, value]) => (
                    <span 
                      key={key} 
                      className="inline-block bg-gray-100 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs break-all"
                    >
                      {key}: {value}
                    </span>
                  ))}
              </div>
            </div>
          )}
          
          {/* Afficher le lot de poisson rattaché s'il existe */}
          {attachedBatch ? (
            <div className="pt-3 border-t">
              <InfrastructureLivestockCard 
                batch={attachedBatch} 
                infrastructureId={infrastructure.id}
              />
            </div>
          ) : cycleInfra && (
            <div className="pt-3 border-t">
              <div className="text-center py-4">
                <Fish className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Aucun lot rattaché à cette infrastructure
                </p>
                <Button 
                  size="sm" 
                  onClick={() => setIsCreateBatchOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer et rattacher un lot
                </Button>
              </div>
            </div>
          )}
          
          <div className="pt-3 border-t flex flex-col sm:flex-row gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditOpen(true)}
              className="w-full sm:flex-1 text-xs sm:text-sm"
            >
              <Edit className="w-3 h-3 mr-1" />
              Modifier
            </Button>
            
            {infrastructure.status === 'active' ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toggleStatus('inactive')}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <PowerOff className="w-3 h-3 mr-1" />
                Désactiver
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toggleStatus('active')}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <Power className="w-3 h-3 mr-1" />
                Activer
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base sm:text-lg">
                    Confirmer la suppression
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Êtes-vous sûr de vouloir supprimer l'infrastructure "{infrastructure.name}" ? 
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteInfrastructure} className="w-full sm:w-auto">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'infrastructure</DialogTitle>
          </DialogHeader>
          <InfrastructureForm 
            infrastructure={infrastructure} 
            onSave={handleEditSave}
            onClose={() => setIsEditOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de création de lot */}
      <Dialog open={isCreateBatchOpen} onOpenChange={setIsCreateBatchOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un lot de poisson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Espèce *</Label>
                <Select 
                  value={batchFormData.species} 
                  onValueChange={(value) => setBatchFormData({...batchFormData, species: value})}
                >
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
                  value={batchFormData.variety}
                  onChange={(e) => setBatchFormData({...batchFormData, variety: e.target.value})}
                  placeholder="Variété"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantité *</Label>
                <Input
                  type="number"
                  value={batchFormData.quantity || ''}
                  onChange={(e) => setBatchFormData({...batchFormData, quantity: parseInt(e.target.value) || 0})}
                  placeholder="Nombre d'individus"
                />
              </div>
              <div>
                <Label>Poids moyen (g)</Label>
                <Input
                  type="number"
                  value={batchFormData.averageWeight || ''}
                  onChange={(e) => setBatchFormData({...batchFormData, averageWeight: parseInt(e.target.value) || 0})}
                  placeholder="Poids en grammes"
                />
              </div>
            </div>

            <div>
              <Label>Date d'acquisition</Label>
              <Input
                type="date"
                value={batchFormData.acquisitionDate}
                onChange={(e) => setBatchFormData({...batchFormData, acquisitionDate: e.target.value})}
              />
            </div>

            <div>
              <Label>Source/Fournisseur</Label>
              <Input
                value={batchFormData.source}
                onChange={(e) => setBatchFormData({...batchFormData, source: e.target.value})}
                placeholder="Nom du fournisseur"
              />
            </div>

            <div>
              <Label>Plan d'alimentation</Label>
              <Input
                value={batchFormData.feedingPlan}
                onChange={(e) => setBatchFormData({...batchFormData, feedingPlan: e.target.value})}
                placeholder="Ex: Standard croissance"
              />
            </div>

            <div>
              <Label>Date de récolte prévue</Label>
              <Input
                type="date"
                value={batchFormData.expectedHarvestDate}
                onChange={(e) => setBatchFormData({...batchFormData, expectedHarvestDate: e.target.value})}
              />
            </div>

            <div>
              <Label>Statut</Label>
              <Select 
                value={batchFormData.status} 
                onValueChange={(value) => setBatchFormData({...batchFormData, status: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">En bonne santé</SelectItem>
                  <SelectItem value="sick">Malade</SelectItem>
                  <SelectItem value="quarantine">Quarantaine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={batchFormData.notes}
                onChange={(e) => setBatchFormData({...batchFormData, notes: e.target.value})}
                placeholder="Notes supplémentaires..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateAndAttachBatch}
                className="flex-1"
              >
                <Fish className="w-4 h-4 mr-2" />
                Créer et rattacher
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsCreateBatchOpen(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InfrastructureCard;
