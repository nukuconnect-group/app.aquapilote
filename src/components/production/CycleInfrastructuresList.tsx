import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Edit, Trash2, TrendingUp, Fish, Scale, Target, Calculator } from 'lucide-react';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import InfrastructureLivestockCard from '../infrastructure/InfrastructureLivestockCard';

interface CycleInfrastructuresListProps {
  cycleId: string;
}

// Fonction de calcul des prévisions
const calculateBatchForecast = (batch: any) => {
  if (!batch) return null;
  
  const survivalRate = batch.expected_survival_rate / 100;
  const expectedQuantity = Math.round(batch.quantity * survivalRate);
  const currentBiomass = (batch.quantity * batch.average_weight) / 1000; // en kg
  
  // Estimation du poids final basé sur le type
  let targetWeight = batch.average_weight;
  if (batch.type === 'alevins') {
    targetWeight = 300; // poids cible adulte en grammes
  } else if (batch.type === 'juveniles') {
    targetWeight = 350;
  } else if (batch.type === 'adultes') {
    targetWeight = batch.average_weight * 1.2;
  }
  
  const expectedBiomass = (expectedQuantity * targetWeight) / 1000; // en kg
  const individualWeight = batch.average_weight;
  
  return {
    quantity: batch.quantity,
    expectedQuantity,
    currentBiomass,
    expectedBiomass,
    targetWeight,
    individualWeight,
    survivalRate: batch.expected_survival_rate
  };
};

const CycleInfrastructuresList = ({ cycleId }: CycleInfrastructuresListProps) => {
  const { infrastructures, loading, updateInfrastructure, deleteInfrastructure } = useCycleInfrastructures(cycleId);
  const { batches } = useLivestockBatches();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ current_quantity: 0, notes: '', livestock_batch_id: '' });

  // Calculs automatiques des totaux
  const totals = useMemo(() => {
    let totalQuantity = 0;
    let totalExpectedQuantity = 0;
    let totalCurrentBiomass = 0;
    let totalExpectedBiomass = 0;
    let batchCount = 0;
    let totalAverageWeight = 0;

    infrastructures.forEach((infra) => {
      const batch = infra.livestock_batch_id ? batches.find(b => b.id === infra.livestock_batch_id) : null;
      if (batch) {
        const forecast = calculateBatchForecast(batch);
        if (forecast) {
          totalQuantity += forecast.quantity;
          totalExpectedQuantity += forecast.expectedQuantity;
          totalCurrentBiomass += forecast.currentBiomass;
          totalExpectedBiomass += forecast.expectedBiomass;
          totalAverageWeight += forecast.individualWeight;
          batchCount++;
        }
      }
      totalQuantity += infra.current_quantity;
    });

    return {
      totalQuantity,
      totalExpectedQuantity,
      totalCurrentBiomass,
      totalExpectedBiomass,
      averageWeight: batchCount > 0 ? totalAverageWeight / batchCount : 0,
      batchCount
    };
  }, [infrastructures, batches]);

  const handleEdit = (infra: any) => {
    setEditingId(infra.id);
    setEditData({
      current_quantity: infra.current_quantity,
      notes: infra.notes || '',
      livestock_batch_id: infra.livestock_batch_id || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    // Si un lot est sélectionné, mettre à jour la quantité automatiquement
    const selectedBatch = editData.livestock_batch_id 
      ? batches.find(b => b.id === editData.livestock_batch_id)
      : null;
    
    const updateData = {
      ...editData,
      current_quantity: selectedBatch ? selectedBatch.quantity : editData.current_quantity
    };
    
    await updateInfrastructure(editingId, updateData);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment retirer cette infrastructure du cycle ?')) {
      await deleteInfrastructure(id);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (infrastructures.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune infrastructure rattachée à ce cycle</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Infrastructures du cycle
            </span>
            <Badge variant="secondary">
              {infrastructures.length} infrastructure(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistiques globales avec calculs automatiques */}
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Quantité actuelle</span>
              </div>
              <p className="text-xl font-bold text-primary">{totals.totalQuantity.toLocaleString()}</p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Prévision quantité</span>
              </div>
              <p className="text-xl font-bold text-blue-600">{totals.totalExpectedQuantity.toLocaleString()}</p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Biomasse actuelle</span>
              </div>
              <p className="text-xl font-bold text-green-600">{totals.totalCurrentBiomass.toFixed(1)} kg</p>
            </div>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">Biomasse prévue</span>
              </div>
              <p className="text-xl font-bold text-orange-600">{totals.totalExpectedBiomass.toFixed(1)} kg</p>
            </div>
          </div>
          
          {totals.batchCount > 0 && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Fish className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Poids moyen individuel:</span>
                <span className="font-bold">{totals.averageWeight.toFixed(1)}g</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Calculs automatiques basés sur {totals.batchCount} lot(s) rattaché(s)
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {infrastructures.map((infra) => {
              const attachedBatch = infra.livestock_batch_id 
                ? batches.find(b => b.id === infra.livestock_batch_id)
                : null;
              
              const batchForecast = attachedBatch ? calculateBatchForecast(attachedBatch) : null;

              return (
                <Card key={infra.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-semibold">{infra.infrastructure_name}</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="text-xs">
                              {infra.infrastructure_type}
                            </Badge>
                          </div>
                          
                          {/* Affichage détaillé si lot rattaché */}
                          {attachedBatch && batchForecast ? (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <div className="flex items-center gap-2 text-primary mb-2">
                                <Fish className="w-4 h-4" />
                                <span className="font-semibold text-sm">Lot: {attachedBatch.species}</span>
                                {attachedBatch.variety && (
                                  <Badge variant="outline" className="text-xs">{attachedBatch.variety}</Badge>
                                )}
                              </div>
                              
                              {/* Données actuelles */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                <div className="text-center p-2 bg-white/50 dark:bg-background/50 rounded">
                                  <p className="text-xs text-muted-foreground">Individus</p>
                                  <p className="font-bold text-sm">{batchForecast.quantity.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-2 bg-white/50 dark:bg-background/50 rounded">
                                  <p className="text-xs text-muted-foreground">Poids moyen</p>
                                  <p className="font-bold text-sm text-green-600">{batchForecast.individualWeight}g</p>
                                </div>
                                <div className="text-center p-2 bg-white/50 dark:bg-background/50 rounded">
                                  <p className="text-xs text-muted-foreground">Biomasse</p>
                                  <p className="font-bold text-sm">{batchForecast.currentBiomass.toFixed(1)} kg</p>
                                </div>
                                <div className="text-center p-2 bg-white/50 dark:bg-background/50 rounded">
                                  <p className="text-xs text-muted-foreground">Taux survie</p>
                                  <p className="font-bold text-sm text-blue-600">{batchForecast.survivalRate}%</p>
                                </div>
                              </div>
                              
                              {/* Prévisions automatiques */}
                              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-700">
                                <div className="flex items-center gap-1 mb-1">
                                  <Calculator className="w-3 h-3 text-orange-600" />
                                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Prévisions automatiques</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">Qté prévue:</span>
                                    <p className="font-bold">{batchForecast.expectedQuantity.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Poids cible:</span>
                                    <p className="font-bold">{batchForecast.targetWeight}g</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Biomasse prévue:</span>
                                    <p className="font-bold text-green-600">{batchForecast.expectedBiomass.toFixed(1)} kg</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Quantité manuelle:</span>
                              <span className="font-semibold">{infra.current_quantity.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {!attachedBatch && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground flex items-center gap-2">
                              <Fish className="w-3 h-3" />
                              Rattachez un lot pour calculs automatiques
                            </div>
                          )}
                          
                          {infra.notes && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Notes:</span> {infra.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    
                    <div className="flex gap-2">
                      <Dialog open={editingId === infra.id} onOpenChange={(open) => !open && setEditingId(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(infra)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier {infra.infrastructure_name}</DialogTitle>
                          </DialogHeader>
                           <div className="space-y-4 py-4">
                             <div>
                              <Label htmlFor="livestock">Lot de poisson rattaché</Label>
                              <Select 
                                value={editData.livestock_batch_id || "none"} 
                                onValueChange={(value) => {
                                  const batch = value !== "none" ? batches.find(b => b.id === value) : null;
                                  setEditData({
                                    ...editData,
                                    livestock_batch_id: value === "none" ? "" : value,
                                    current_quantity: batch ? batch.quantity : editData.current_quantity
                                  });
                                }}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="Sélectionner un lot" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Aucun lot</SelectItem>
                                  {batches.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                      {batch.species} - {batch.quantity} ind. ({batch.average_weight}g moy.)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Afficher les détails du lot sélectionné */}
                              {editData.livestock_batch_id && editData.livestock_batch_id !== "none" && (() => {
                                const selectedBatch = batches.find(b => b.id === editData.livestock_batch_id);
                                if (selectedBatch) {
                                  const forecast = calculateBatchForecast(selectedBatch);
                                  return (
                                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs space-y-1">
                                      <p><span className="text-muted-foreground">Poids moyen individuel:</span> <strong>{selectedBatch.average_weight}g</strong></p>
                                      <p><span className="text-muted-foreground">Biomasse actuelle:</span> <strong>{forecast?.currentBiomass.toFixed(1)} kg</strong></p>
                                      <p><span className="text-muted-foreground">Prévision quantité:</span> <strong>{forecast?.expectedQuantity.toLocaleString()}</strong></p>
                                      <p><span className="text-muted-foreground">Prévision biomasse:</span> <strong className="text-green-600">{forecast?.expectedBiomass.toFixed(1)} kg</strong></p>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            
                            {!editData.livestock_batch_id || editData.livestock_batch_id === "none" ? (
                              <div>
                                <Label htmlFor="quantity">Quantité manuelle</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  value={editData.current_quantity}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    current_quantity: parseInt(e.target.value) || 0
                                  })}
                                />
                              </div>
                            ) : (
                              <div className="p-2 bg-muted rounded text-sm text-muted-foreground">
                                La quantité est automatiquement synchronisée avec le lot rattaché
                              </div>
                            )}
                            
                            <div>
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                id="notes"
                                value={editData.notes}
                                onChange={(e) => setEditData({
                                  ...editData,
                                  notes: e.target.value
                                })}
                                rows={3}
                              />
                            </div>
                            <Button onClick={handleSaveEdit} className="w-full">
                              Enregistrer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(infra.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Afficher les détails complets du lot rattaché */}
                  {attachedBatch && (
                    <div className="mt-4 pt-4 border-t">
                      <InfrastructureLivestockCard 
                        batch={attachedBatch} 
                        infrastructureId={infra.id}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleInfrastructuresList;
