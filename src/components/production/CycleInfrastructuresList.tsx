import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Edit, Trash2, TrendingUp, Fish } from 'lucide-react';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import InfrastructureLivestockCard from '../infrastructure/InfrastructureLivestockCard';

interface CycleInfrastructuresListProps {
  cycleId: string;
}

const CycleInfrastructuresList = ({ cycleId }: CycleInfrastructuresListProps) => {
  const { infrastructures, loading, updateInfrastructure, deleteInfrastructure } = useCycleInfrastructures(cycleId);
  const { batches } = useLivestockBatches();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ current_quantity: 0, notes: '', livestock_batch_id: '' });

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
    await updateInfrastructure(editingId, editData);
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

  const totalQuantity = infrastructures.reduce((sum, i) => sum + i.current_quantity, 0);

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
          <div className="mb-4 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Production totale</p>
                <p className="text-2xl font-bold text-primary">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {infrastructures.map((infra) => {
              const attachedBatch = infra.livestock_batch_id 
                ? batches.find(b => b.id === infra.livestock_batch_id)
                : null;

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
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Quantité actuelle:</span>
                            <span className="font-semibold">{infra.current_quantity.toLocaleString()}</span>
                          </div>
                          {attachedBatch ? (
                            <div className="mt-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                              <div className="flex items-center gap-2 text-primary mb-1">
                                <Fish className="w-4 h-4" />
                                <span className="font-semibold text-sm">Lot rattaché</span>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Espèce:</span>
                                  <span className="font-medium">{attachedBatch.species}</span>
                                </div>
                                {attachedBatch.variety && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Variété:</span>
                                    <span className="font-medium">{attachedBatch.variety}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Quantité:</span>
                                  <span className="font-medium">{attachedBatch.quantity.toLocaleString()} individus</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Poids moyen:</span>
                                  <span className="font-medium">{attachedBatch.average_weight}g</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Taux survie prévu:</span>
                                  <span className="font-medium text-blue-600">{attachedBatch.expected_survival_rate}%</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                              Aucun lot rattaché
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
                                onValueChange={(value) => setEditData({
                                  ...editData,
                                  livestock_batch_id: value === "none" ? "" : value
                                })}
                              >
                                <SelectTrigger className="text-sm">
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
                            </div>
                            <div>
                              <Label htmlFor="quantity">Quantité actuelle</Label>
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

                  {/* Afficher les détails du lot rattaché */}
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
