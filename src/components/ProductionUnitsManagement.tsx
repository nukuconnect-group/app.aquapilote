
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Building, 
  Plus, 
  Edit,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useProductionUnits, ProductionUnitType } from '@/contexts/ProductionUnitsContext';
import { useLogs } from '@/contexts/LogsContext';

const ProductionUnitsManagement = () => {
  const { units, addUnit, updateUnit, deleteUnit } = useProductionUnits();
  const { addLog } = useLogs();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configUnit, setConfigUnit] = useState<any>(null);
  
  const [newUnit, setNewUnit] = useState({
    name: '',
    type: '' as ProductionUnitType,
    description: '',
    capacity: 0,
    currentStock: 0,
    manager: '',
    isActive: true
  });

  const unitTypes = [
    { value: 'ecloserie', label: 'Écloserie' },
    { value: 'grossissement', label: 'Grossissement' },
    { value: 'transformation', label: 'Transformation' },
    { value: 'conservation', label: 'Conservation' },
    { value: 'fabrication_aliment', label: 'Fabrication d\'aliment' },
    { value: 'commercialisation', label: 'Commercialisation' }
  ];

  const handleSaveUnit = () => {
    if (editingUnit) {
      updateUnit(editingUnit.id, newUnit);
      addLog('Unité modifiée', 'Infrastructures', `Unité ${newUnit.name} mise à jour`, 'info');
      setEditingUnit(null);
    } else {
      addUnit(newUnit);
      addLog('Unité créée', 'Infrastructures', `Nouvelle unité ${newUnit.name} ajoutée`, 'success');
    }
    
    setNewUnit({
      name: '',
      type: '' as ProductionUnitType,
      description: '',
      capacity: 0,
      currentStock: 0,
      manager: '',
      isActive: true
    });
    setShowAddDialog(false);
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setNewUnit({
      name: unit.name,
      type: unit.type,
      description: unit.description,
      capacity: unit.capacity,
      currentStock: unit.currentStock,
      manager: unit.manager,
      isActive: unit.isActive
    });
    setShowAddDialog(true);
  };

  const handleDeleteUnit = (unitId: string, unitName: string) => {
    deleteUnit(unitId);
    addLog('Unité supprimée', 'Infrastructures', `Unité ${unitName} supprimée définitivement`, 'warning');
  };

  const handleToggleUnit = (unitId: string, unitName: string, isActive: boolean) => {
    updateUnit(unitId, { isActive: !isActive });
    addLog(
      isActive ? 'Unité désactivée' : 'Unité activée', 
      'Infrastructures', 
      `Unité ${unitName} ${isActive ? 'désactivée' : 'activée'}`, 
      'info'
    );
  };

  const openConfigDialog = (unit: any) => {
    setConfigUnit(unit);
    setShowConfigDialog(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Gestion des Unités</h2>
            <p className="text-purple-100 text-sm sm:text-base">Configuration et administration des unités de production</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle unité
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-2xl mx-2">
              <DialogHeader>
                <DialogTitle>{editingUnit ? 'Modifier l\'unité' : 'Créer une nouvelle unité'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Nom de l'unité</Label>
                  <Input 
                    value={newUnit.name}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Écloserie principale"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Type d'unité</Label>
                  <Select value={newUnit.type} onValueChange={(value: ProductionUnitType) => setNewUnit(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Capacité</Label>
                  <Input 
                    type="number"
                    value={newUnit.capacity}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Stock actuel</Label>
                  <Input 
                    type="number"
                    value={newUnit.currentStock}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, currentStock: parseInt(e.target.value) }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Responsable</Label>
                  <Input 
                    value={newUnit.manager}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="Nom du responsable"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newUnit.isActive}
                    onCheckedChange={(checked) => setNewUnit(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label className="text-sm">Unité active</Label>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm">Description</Label>
                  <Textarea 
                    value={newUnit.description}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de l'unité..."
                    className="text-sm"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button onClick={handleSaveUnit} className="flex-1">
                    {editingUnit ? 'Modifier' : 'Créer'} l'unité
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddDialog(false);
                    setEditingUnit(null);
                    setNewUnit({
                      name: '',
                      type: '' as ProductionUnitType,
                      description: '',
                      capacity: 0,
                      currentStock: 0,
                      manager: '',
                      isActive: true
                    });
                  }}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {units.map(unit => (
          <Card key={unit.id} className={`${!unit.isActive ? 'opacity-60 border-gray-300' : 'border-l-4 border-l-purple-500'}`}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-purple-600" />
                  <div>
                    <CardTitle className="text-base sm:text-lg">{unit.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge className={unit.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {unit.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {unitTypes.find(t => t.value === unit.type)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleToggleUnit(unit.id, unit.name, unit.isActive)}
                    className="text-xs"
                  >
                    {unit.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openConfigDialog(unit)}
                    className="text-xs"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditUnit(unit)}
                    className="text-xs"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'unité</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer définitivement l'unité "{unit.name}" ? 
                          Cette action est irréversible et supprimera toutes les données associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteUnit(unit.id, unit.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Capacité:</span>
                  <span className="ml-1 font-medium">{unit.capacity.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Stock:</span>
                  <span className="ml-1 font-medium">{unit.currentStock.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Utilisation:</span>
                  <span className="ml-1 font-medium">{((unit.currentStock / unit.capacity) * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Responsable:</span>
                  <span className="ml-1 font-medium">{unit.manager}</span>
                </div>
              </div>
              {unit.description && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs sm:text-sm">
                  <strong>Description:</strong> {unit.description}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de configuration */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-full sm:max-w-lg mx-2">
          <DialogHeader>
            <DialogTitle>Configuration - {configUnit?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>État de l'unité</Label>
              <Switch 
                checked={configUnit?.isActive}
                onCheckedChange={(checked) => {
                  handleToggleUnit(configUnit.id, configUnit.name, configUnit.isActive);
                  setConfigUnit({...configUnit, isActive: checked});
                }}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Type:</strong> {unitTypes.find(t => t.value === configUnit?.type)?.label}</p>
              <p><strong>Créée le:</strong> {new Date(configUnit?.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><strong>Capacité totale:</strong> {configUnit?.capacity?.toLocaleString()}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionUnitsManagement;
