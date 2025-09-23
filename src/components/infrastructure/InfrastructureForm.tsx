import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useProductionUnits, Infrastructure } from '@/contexts/ProductionUnitsContext';
import { useLogs } from '@/contexts/LogsContext';

interface InfrastructureFormProps {
  onSave?: (infrastructure: any) => void;
  infrastructure?: Infrastructure;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

const InfrastructureForm = ({ onSave, infrastructure, onClose, trigger }: InfrastructureFormProps) => {
  const { units, infrastructures, setInfrastructures } = useProductionUnits();
  const { addLog } = useLogs();
  
  const [showDialog, setShowDialog] = useState(false);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  
  const [newInfrastructure, setNewInfrastructure] = useState({
    name: '',
    unitId: '',
    type: '',
    customTypeName: '',
    capacity: 0,
    status: 'active' as 'active' | 'maintenance' | 'inactive',
    specifications: {
      volume: '',
      profondeur: '',
      materiau: '',
      temperature: '',
      ph: '',
      oxygenLevel: ''
    }
  });

  // Initialize form with existing infrastructure data if editing
  useEffect(() => {
    if (infrastructure) {
      setNewInfrastructure({
        name: infrastructure.name,
        unitId: infrastructure.unitId,
        type: infrastructure.type,
        customTypeName: infrastructure.customTypeName || '',
        capacity: infrastructure.capacity,
        status: infrastructure.status,
        specifications: {
          volume: infrastructure.specifications?.volume || '',
          profondeur: infrastructure.specifications?.profondeur || '',
          materiau: infrastructure.specifications?.materiau || '',
          temperature: infrastructure.specifications?.temperature || '',
          ph: infrastructure.specifications?.ph || '',
          oxygenLevel: infrastructure.specifications?.oxygenLevel || ''
        }
      });
    }
  }, [infrastructure]);

  const predefinedTypes = [
    { value: 'bassin_incubation', label: 'Bassin d\'incubation' },
    { value: 'bassin_grossissement', label: 'Bassin de grossissement' },
    { value: 'bassin_beton', label: 'Bassin en béton' },
    { value: 'etang_naturel', label: 'Étang naturel' },
    { value: 'etang_artificiel', label: 'Étang artificiel' },
    { value: 'chambre_froide', label: 'Chambre froide' },
    { value: 'chambre_froide_positive', label: 'Chambre froide positive' },
    { value: 'chambre_froide_negative', label: 'Chambre froide négative' },
    { value: 'silo_aliment', label: 'Silo à aliment' },
    { value: 'reservoir_eau', label: 'Réservoir d\'eau' },
    { value: 'systeme_filtration', label: 'Système de filtration' },
    { value: 'pompe_eau', label: 'Pompe à eau' },
    { value: 'aerateur', label: 'Aérateur' },
    { value: 'laboratoire', label: 'Laboratoire d\'analyse' },
    { value: 'custom', label: 'Type personnalisé...' }
  ];

  const allTypes = [
    ...predefinedTypes.filter(t => t.value !== 'custom'),
    ...customTypes.map(type => ({ value: type, label: type })),
    predefinedTypes.find(t => t.value === 'custom')!
  ];

  const handleSaveCustomType = () => {
    if (customTypeName.trim()) {
      setCustomTypes(prev => [...prev, customTypeName.trim()]);
      setNewInfrastructure(prev => ({ 
        ...prev, 
        type: customTypeName.trim(),
        customTypeName: customTypeName.trim()
      }));
      setCustomTypeName('');
      setShowCustomTypeInput(false);
    }
  };

  const handleTypeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomTypeInput(true);
    } else {
      setNewInfrastructure(prev => ({ 
        ...prev, 
        type: value,
        customTypeName: ''
      }));
      setShowCustomTypeInput(false);
    }
  };

  const handleSave = () => {
    const infrastructureData = {
      ...newInfrastructure,
      id: infrastructure?.id || Date.now().toString(),
      specifications: Object.fromEntries(
        Object.entries(newInfrastructure.specifications).filter(([_, value]) => value !== '')
      )
    };
    
    if (infrastructure) {
      // Update existing infrastructure
      const updatedInfrastructures = infrastructures.map(inf =>
        inf.id === infrastructure.id ? infrastructureData : inf
      );
      setInfrastructures(updatedInfrastructures);
      addLog('Infrastructure modifiée', 'Infrastructures', `${infrastructureData.name} mise à jour`, 'success');
    } else {
      // Create new infrastructure
      setInfrastructures([...infrastructures, infrastructureData]);
      addLog('Infrastructure créée', 'Infrastructures', `${infrastructureData.name} ajoutée`, 'success');
    }
    
    if (onSave) {
      onSave(infrastructureData);
    }
    
    // Reset form if creating new
    if (!infrastructure) {
      setNewInfrastructure({
        name: '',
        unitId: '',
        type: '',
        customTypeName: '',
        capacity: 0,
        status: 'active',
        specifications: {
          volume: '',
          profondeur: '',
          materiau: '',
          temperature: '',
          ph: '',
          oxygenLevel: ''
        }
      });
    }
    
    setShowDialog(false);
    if (onClose) {
      onClose();
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-full sm:max-w-3xl mx-2 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{infrastructure ? 'Modifier l\'infrastructure' : 'Nouvelle Infrastructure'}</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Nom de l'infrastructure</Label>
          <Input 
            value={newInfrastructure.name}
            onChange={(e) => setNewInfrastructure(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Bassin principal A1"
            className="text-sm"
          />
        </div>
        
        <div>
          <Label className="text-sm">Unité de production</Label>
          <Select value={newInfrastructure.unitId} onValueChange={(value) => setNewInfrastructure(prev => ({ ...prev, unitId: value }))}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner une unité" />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => (
                <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Type d'infrastructure</Label>
          <Select value={newInfrastructure.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              {allTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCustomTypeInput && (
          <div>
            <Label className="text-sm">Nom du type personnalisé</Label>
            <div className="flex gap-2">
              <Input 
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder="Ex: Bassin circulaire fibre"
                className="text-sm"
              />
              <Button size="sm" onClick={handleSaveCustomType}>
                Ajouter
              </Button>
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm">Capacité</Label>
          <Input 
            type="number"
            value={newInfrastructure.capacity}
            onChange={(e) => setNewInfrastructure(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            className="text-sm"
          />
        </div>

        <div>
          <Label className="text-sm">État</Label>
          <Select value={newInfrastructure.status} onValueChange={(value: 'active' | 'maintenance' | 'inactive') => 
            setNewInfrastructure(prev => ({ ...prev, status: value }))
          }>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Spécifications techniques */}
        <div className="sm:col-span-2">
          <Label className="text-sm font-medium">Spécifications techniques</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            <div>
              <Label className="text-xs text-gray-600">Volume (L ou m³)</Label>
              <Input 
                value={newInfrastructure.specifications.volume}
                onChange={(e) => setNewInfrastructure(prev => ({ 
                  ...prev, 
                  specifications: { ...prev.specifications, volume: e.target.value }
                }))}
                placeholder="Ex: 15000"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Profondeur (m)</Label>
              <Input 
                value={newInfrastructure.specifications.profondeur}
                onChange={(e) => setNewInfrastructure(prev => ({ 
                  ...prev, 
                  specifications: { ...prev.specifications, profondeur: e.target.value }
                }))}
                placeholder="Ex: 2.5"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Matériau</Label>
              <Input 
                value={newInfrastructure.specifications.materiau}
                onChange={(e) => setNewInfrastructure(prev => ({ 
                  ...prev, 
                  specifications: { ...prev.specifications, materiau: e.target.value }
                }))}
                placeholder="Ex: Béton, Fibre, Terre"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Température (°C)</Label>
              <Input 
                value={newInfrastructure.specifications.temperature}
                onChange={(e) => setNewInfrastructure(prev => ({ 
                  ...prev, 
                  specifications: { ...prev.specifications, temperature: e.target.value }
                }))}
                placeholder="Ex: 25-28"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">pH</Label>
              <Input 
                value={newInfrastructure.specifications.ph}
                onChange={(e) => setNewInfrastructure(prev => ({ 
                  ...prev, 
                  specifications: { ...prev.specifications, ph: e.target.value }
                }))}
                placeholder="Ex: 7.0-7.5"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Oxygène (mg/L)</Label>
              <Input 
                value={newInfrastructure.specifications.oxygenLevel}
                onChange={(e) => setNewInfrastructure(prev => ({ 
                  ...prev, 
                  specifications: { ...prev.specifications, oxygenLevel: e.target.value }
                }))}
                placeholder="Ex: 6-8"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            {infrastructure ? 'Mettre à jour' : 'Créer l\'infrastructure'}
          </Button>
          <Button variant="outline" onClick={() => {
            setShowDialog(false);
            if (onClose) onClose();
          }}>
            Annuler
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  // If it's being used within another dialog (like in InfrastructureCard), don't wrap in Dialog
  if (infrastructure && onClose) {
    return dialogContent;
  }

  // For new infrastructure creation, wrap in Dialog with trigger
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter infrastructure
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
};

export default InfrastructureForm;
