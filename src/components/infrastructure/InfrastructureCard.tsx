
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Settings, Trash2, Power, PowerOff, Edit, MapPin } from 'lucide-react';
import { Infrastructure, useProductionUnits } from '@/contexts/ProductionUnitsContext';
import InfrastructureForm from './InfrastructureForm';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import InfrastructureLivestockCard from './InfrastructureLivestockCard';

interface InfrastructureCardProps {
  infrastructure: Infrastructure;
}

const InfrastructureCard = ({ infrastructure }: InfrastructureCardProps) => {
  const { infrastructures, setInfrastructures, activeUnit } = useProductionUnits();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { infrastructures: cycleInfras } = useCycleInfrastructures();
  const { batches } = useLivestockBatches(infrastructure.unitId);
  
  // Trouver l'infrastructure de cycle associée
  const cycleInfra = cycleInfras.find(ci => ci.infrastructure_name === infrastructure.name);
  
  // Trouver le lot de poisson rattaché
  const attachedBatch = cycleInfra?.livestock_batch_id 
    ? batches.find(b => b.id === cycleInfra.livestock_batch_id)
    : null;

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
          {attachedBatch && (
            <div className="pt-3 border-t">
              <InfrastructureLivestockCard 
                batch={attachedBatch} 
                infrastructureId={infrastructure.id}
              />
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
    </>
  );
};

export default InfrastructureCard;
