
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Building, Settings, Trash2, Power, PowerOff, Edit, MapPin } from 'lucide-react';
import { Infrastructure, useProductionUnits } from '@/contexts/ProductionUnitsContext';
import InfrastructureForm from './InfrastructureForm';

interface InfrastructureCardProps {
  infrastructure: Infrastructure;
}

const InfrastructureCard = ({ infrastructure }: InfrastructureCardProps) => {
  const { infrastructures, setInfrastructures } = useProductionUnits();
  const [isEditOpen, setIsEditOpen] = useState(false);

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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <IconComponent className="w-5 h-5 mr-2 text-gray-600" />
              {infrastructure.name}
            </CardTitle>
            <Badge className={getStatusColor(infrastructure.status)}>
              {infrastructure.status === 'active' ? 'Actif' : 
               infrastructure.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-medium text-gray-700">
              {getInfrastructureTypeLabel(infrastructure.type)}
            </p>
            <p className="text-gray-500">
              Capacité: {infrastructure.capacity.toLocaleString()}
            </p>
            {infrastructure.specifications?.location && (
              <p className="text-gray-500 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {infrastructure.specifications.location}
              </p>
            )}
            {infrastructure.specifications?.usage && (
              <p className="text-gray-500 mt-1">
                Usage: {infrastructure.specifications.usage}
              </p>
            )}
          </div>
          
          {infrastructure.specifications && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Spécifications:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(infrastructure.specifications)
                  .filter(([key]) => !['location', 'usage', 'description'].includes(key))
                  .map(([key, value]) => (
                    <span 
                      key={key} 
                      className="inline-block bg-gray-100 rounded px-2 py-1 text-xs"
                    >
                      {key}: {value}
                    </span>
                  ))}
              </div>
            </div>
          )}
          
          <div className="pt-3 border-t flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsEditOpen(true)}
              className="flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Modifier
            </Button>
            
            {infrastructure.status === 'active' ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toggleStatus('inactive')}
              >
                <PowerOff className="w-3 h-3 mr-1" />
                Désactiver
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toggleStatus('active')}
              >
                <Power className="w-3 h-3 mr-1" />
                Activer
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer l'infrastructure "{infrastructure.name}" ? 
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteInfrastructure}>
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
