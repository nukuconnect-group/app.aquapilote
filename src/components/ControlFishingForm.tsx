import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Fish, Trash2, Calculator, Scale, Info } from 'lucide-react';
import { useProductionCycles } from '@/hooks/useProductionCycles';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ControlFishingFormProps {
  unitId: string;
  onRecordCreated?: () => void;
}

interface SampleBatch {
  id: string;
  subjectCount: number;
  totalWeight: number; // grammes (poids moyen général saisi pour le lot)
  individualWeight: number; // grammes, calculé automatiquement (totalWeight / subjectCount)
}

const ControlFishingForm = ({ unitId, onRecordCreated }: ControlFishingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cycles } = useProductionCycles(unitId);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const { infrastructures } = useCycleInfrastructures(selectedCycleId);
  const { createRecord, records: allHealthRecords } = useHealthRecords(selectedCycleId, unitId);
  const { batches: livestockBatches } = useLivestockBatches(unitId);
  
  const [formData, setFormData] = useState({
    infrastructureId: '',
    date: new Date().toISOString().split('T')[0],
    temperature: '',
    ph: '',
    oxygen: '',
    mortality: '',
    notes: ''
  });

  // Système de prélèvement par lots
  const [sampleBatches, setSampleBatches] = useState<SampleBatch[]>([]);
  const [newBatch, setNewBatch] = useState({
    subjectCount: '',
    totalWeight: ''
  });

  const activeCycles = cycles.filter(c => c.status === 'active');
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  const selectedInfrastructure = infrastructures.find(i => i.id === formData.infrastructureId);
  
  // Trouver le lot de poissons attaché à l'infrastructure
  const attachedBatch = useMemo(() => {
    if (!selectedInfrastructure?.livestock_batch_id) return null;
    return livestockBatches.find(b => b.id === selectedInfrastructure.livestock_batch_id);
  }, [selectedInfrastructure, livestockBatches]);

  // Calculer le nombre de sujets disponibles (depuis le lot attaché ou l'infrastructure)
  const availableSubjects = useMemo(() => {
    if (attachedBatch) {
      return attachedBatch.quantity;
    }
    return selectedInfrastructure?.current_quantity || 0;
  }, [attachedBatch, selectedInfrastructure]);
  
  // Filtrer les pêches de contrôle passées pour l'infrastructure sélectionnée
  const pastControlRecords = allHealthRecords.filter(r => r.basin_id === formData.infrastructureId);
  
  // Calculs automatiques pour les lots prélevés
  const batchCalculations = useMemo(() => {
    const totalSubjects = sampleBatches.reduce((sum, b) => sum + b.subjectCount, 0);
    const totalWeight = sampleBatches.reduce((sum, b) => sum + b.totalWeight, 0);
    const pmi = totalSubjects > 0 ? totalWeight / totalSubjects : 0;
    const samplePercentage = availableSubjects > 0 
      ? ((totalSubjects / availableSubjects) * 100)
      : 0;
    
    return {
      totalSubjects,
      totalWeight, // en grammes
      totalWeightKg: totalWeight / 1000,
      pmi, // Poids Moyen Individuel en grammes
      samplePercentage
    };
  }, [sampleBatches, availableSubjects]);

  // Ajouter un lot prélevé
  const handleAddSampleBatch = () => {
    const subjectCount = parseInt(newBatch.subjectCount) || 0;
    const totalWeight = parseFloat(newBatch.totalWeight) || 0;

    if (subjectCount <= 0 || totalWeight <= 0) return;

    const newSampleBatch: SampleBatch = {
      id: Date.now().toString(),
      subjectCount,
      totalWeight,
      individualWeight: totalWeight / subjectCount
    };
    
    setSampleBatches([...sampleBatches, newSampleBatch]);
    setNewBatch({ subjectCount: '', totalWeight: '' });
  };

  // Supprimer un lot prélevé
  const handleRemoveSampleBatch = (id: string) => {
    setSampleBatches(sampleBatches.filter(b => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sampleBatches.length === 0) {
      return;
    }
    
    try {
      // Créer les notes avec les détails des lots prélevés
      const batchDetails = sampleBatches.map((b, i) => 
        `Lot ${i + 1}: ${b.subjectCount} sujets — poids total ${b.totalWeight}g → PMI ${b.individualWeight.toFixed(2)}g`
      ).join('\n');
      
      const calculationNotes = `
=== PRÉLÈVEMENT PAR LOTS ===
${batchDetails}

=== CALCULS ===
Total sujets prélevés: ${batchCalculations.totalSubjects}
Poids total: ${batchCalculations.totalWeight.toFixed(0)}g (${batchCalculations.totalWeightKg.toFixed(2)}kg)
PMI (Poids Moyen Individuel): ${batchCalculations.pmi.toFixed(2)}g
Pourcentage prélevé: ${batchCalculations.samplePercentage.toFixed(2)}%
Sujets disponibles dans l'infrastructure: ${availableSubjects}

${formData.notes ? `=== OBSERVATIONS ===\n${formData.notes}` : ''}
      `.trim();
      
      await createRecord({
        cycle_id: selectedCycleId,
        unit_id: unitId,
        basin_id: formData.infrastructureId,
        date: formData.date,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        ph: formData.ph ? parseFloat(formData.ph) : undefined,
        oxygen: formData.oxygen ? parseFloat(formData.oxygen) : undefined,
        mortality: formData.mortality ? parseFloat(formData.mortality) : undefined,
        average_weight: batchCalculations.pmi,
        sample_count: batchCalculations.totalSubjects,
        density: batchCalculations.samplePercentage, // Utiliser density pour stocker le % prélevé
        feeding: batchCalculations.totalWeightKg, // Utiliser feeding pour stocker le poids total en kg
        notes: calculationNotes
      });
      
      onRecordCreated?.();
      
      setIsOpen(false);
      
      // Reset form
      setFormData({
        infrastructureId: '',
        date: new Date().toISOString().split('T')[0],
        temperature: '',
        ph: '',
        oxygen: '',
        mortality: '',
        notes: ''
      });
      setSampleBatches([]);
      setSelectedCycleId('');
    } catch (error) {
      console.error('Error creating control fishing record:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Fish className="w-4 h-4 mr-2" />
          Pêche de contrôle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fish className="w-5 h-5" />
            Enregistrer une pêche de contrôle
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du cycle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cycle de production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cycle">Cycle actif</Label>
                {activeCycles.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Aucun cycle actif disponible. Créez d'abord un cycle de production.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select 
                    value={selectedCycleId} 
                    onValueChange={(value) => {
                      setSelectedCycleId(value);
                      setFormData({...formData, infrastructureId: ''});
                      setSampleBatches([]);
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name} - {cycle.species}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedCycleId && (
                <div>
                  <Label htmlFor="infrastructure">Infrastructure</Label>
                  {infrastructures.length === 0 ? (
                    <Alert>
                      <AlertDescription>
                        Aucune infrastructure rattachée à ce cycle.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select 
                      value={formData.infrastructureId || undefined}
                      onValueChange={(value) => {
                        setFormData({ ...formData, infrastructureId: value });
                        setSampleBatches([]);
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une infrastructure" />
                      </SelectTrigger>
                      <SelectContent>
                        {infrastructures
                          .filter((infra) => Boolean(infra.id))
                          .map((infra) => {
                            const batch = livestockBatches.find((b) => b.id === infra.livestock_batch_id);
                            const subjectCount = batch?.quantity || infra.current_quantity || 0;
                            return (
                              <SelectItem key={infra.id} value={infra.id}>
                                {infra.infrastructure_name} ({infra.infrastructure_type}) - {subjectCount} sujets
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              
              {/* Informations détaillées sur l'infrastructure sélectionnée */}
              {selectedInfrastructure && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Détails de l'infrastructure
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Sujets disponibles</span>
                      <p className="font-bold text-lg text-primary">{availableSubjects.toLocaleString()}</p>
                    </div>
                    
                    {attachedBatch && (
                      <>
                        <div>
                          <span className="text-muted-foreground block text-xs">Espèce</span>
                          <p className="font-medium">{attachedBatch.species}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Poids moyen actuel</span>
                          <p className="font-medium">{attachedBatch.average_weight}g</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Biomasse totale</span>
                          <p className="font-medium">{attachedBatch.total_weight?.toFixed(2)}kg</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Statut du lot</span>
                          <Badge variant={attachedBatch.status === 'healthy' ? 'default' : 'destructive'}>
                            {attachedBatch.status === 'healthy' ? 'Sain' : attachedBatch.status}
                          </Badge>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <span className="text-muted-foreground block text-xs">Pêches précédentes</span>
                      <p className="font-medium">{pastControlRecords.length} enregistrement(s)</p>
                    </div>
                  </div>
                  
                  {/* Dernières pêches de contrôle */}
                  {pastControlRecords.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-xs font-medium text-muted-foreground">Dernières pêches</span>
                      <div className="space-y-2 mt-2">
                        {pastControlRecords.slice(0, 3).map((record, idx) => (
                          <div key={record.id} className="text-xs flex justify-between items-center bg-background/50 p-2 rounded">
                            <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                            <div className="flex gap-3">
                              <span>PMI: <strong>{record.average_weight?.toFixed(1) || '-'}g</strong></span>
                              <span>Échant: <strong>{record.sample_count || '-'}</strong></span>
                              <span>%: <strong>{record.density?.toFixed(1) || '-'}%</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prélèvement par lots */}
          {formData.infrastructureId && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Prélèvement par lots
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      Saisissez le nombre de sujets prélevés et le <strong>poids total (général)</strong> du lot pesé.
                      Le PMI (Poids Moyen Individuel) est calculé automatiquement : poids total ÷ nombre de sujets.
                    </p>
                  </div>
                  
                  {/* Formulaire d'ajout de lot */}
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label className="text-xs">Nb sujets</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newBatch.subjectCount}
                        onChange={(e) => setNewBatch({...newBatch, subjectCount: e.target.value})}
                        placeholder="200"
                      />
                    </div>
                    <div className="col-span-4">
                      <Label className="text-xs">Poids total du lot (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={newBatch.totalWeight}
                        onChange={(e) => setNewBatch({...newBatch, totalWeight: e.target.value})}
                        placeholder="10000"
                      />
                      {Number(newBatch.subjectCount) > 0 && Number(newBatch.totalWeight) > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          PMI ≈ {(Number(newBatch.totalWeight) / Number(newBatch.subjectCount)).toFixed(2)} g
                        </p>
                      )}
                    </div>
                    <div className="col-span-4">
                      <Button 
                        type="button" 
                        onClick={handleAddSampleBatch}
                        disabled={!newBatch.subjectCount || !newBatch.totalWeight}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                  
                  {/* Tableau des lots prélevés */}
                  {sampleBatches.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Lot</TableHead>
                            <TableHead className="text-xs text-right">Sujets</TableHead>
                            <TableHead className="text-xs text-right">Poids total (g)</TableHead>
                            <TableHead className="text-xs text-right">PMI calculé (g)</TableHead>
                            <TableHead className="text-xs w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sampleBatches.map((batch, idx) => (
                            <TableRow key={batch.id}>
                              <TableCell className="font-medium">Lot {idx + 1}</TableCell>
                              <TableCell className="text-right">{batch.subjectCount}</TableCell>
                              <TableCell className="text-right">{batch.totalWeight.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-medium text-primary">
                                {batch.individualWeight.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveSampleBatch(batch.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Résumé des calculs */}
                  {sampleBatches.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                      <h5 className="font-semibold text-sm flex items-center gap-2 text-green-800">
                        <Calculator className="w-4 h-4" />
                        Calculs automatiques
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs block">Total sujets</span>
                          <p className="font-bold text-lg">{batchCalculations.totalSubjects}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">Poids total</span>
                          <p className="font-bold text-lg">{batchCalculations.totalWeightKg.toFixed(2)} kg</p>
                          <p className="text-xs text-muted-foreground">{batchCalculations.totalWeight.toLocaleString()} g</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">PMI</span>
                          <p className="font-bold text-lg text-primary">{batchCalculations.pmi.toFixed(2)} g</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs block">% prélevé</span>
                          <p className="font-bold text-lg">{batchCalculations.samplePercentage.toFixed(2)}%</p>
                          <p className="text-xs text-muted-foreground">sur {availableSubjects} sujets</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Données environnementales */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Paramètres environnementaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date de la pêche</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Température (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        placeholder="25.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ph">pH</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        value={formData.ph}
                        onChange={(e) => setFormData({...formData, ph: e.target.value})}
                        placeholder="7.2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="oxygen">Oxygène dissous (mg/L)</Label>
                      <Input
                        id="oxygen"
                        type="number"
                        step="0.1"
                        value={formData.oxygen}
                        onChange={(e) => setFormData({...formData, oxygen: e.target.value})}
                        placeholder="6.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mortality">Mortalité observée</Label>
                      <Input
                        id="mortality"
                        type="number"
                        step="1"
                        value={formData.mortality}
                        onChange={(e) => setFormData({...formData, mortality: e.target.value})}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Notes et observations sur la pêche de contrôle..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full"
                disabled={sampleBatches.length === 0}
              >
                {sampleBatches.length === 0 
                  ? 'Ajoutez au moins un lot prélevé' 
                  : `Enregistrer la pêche (${batchCalculations.totalSubjects} sujets, PMI: ${batchCalculations.pmi.toFixed(2)}g)`
                }
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ControlFishingForm;
