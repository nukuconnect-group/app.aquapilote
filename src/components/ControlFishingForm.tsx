import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Fish, Trash2, Calculator, Scale, Info, FileDown, AlertTriangle, Loader2 } from 'lucide-react';
import { useProductionCycles } from '@/hooks/useProductionCycles';
import { useCycleInfrastructures } from '@/hooks/useCycleInfrastructures';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportControlFishingPDF } from '@/lib/controlFishingPdf';
import { useToast } from '@/hooks/use-toast';

interface ControlFishingFormProps {
  unitId: string;
  onRecordCreated?: () => void;
}

interface SampleBatch {
  id: string;
  infrastructureId: string;
  species: string;
  subjectCount: number;
  totalWeight: number; // grammes : poids total du lot pesé
  individualWeight: number; // grammes : PMI calculé (totalWeight / subjectCount)
}

const ControlFishingForm = ({ unitId, onRecordCreated }: ControlFishingFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { cycles } = useProductionCycles(unitId);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const { infrastructures } = useCycleInfrastructures(selectedCycleId);
  const { createRecord, records: allHealthRecords } = useHealthRecords(selectedCycleId, unitId);
  const { batches: livestockBatches } = useLivestockBatches(unitId);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    temperature: '',
    ph: '',
    oxygen: '',
    mortality: '',
    notes: '',
  });

  // Sélection multiple d'infrastructures
  const [selectedInfraIds, setSelectedInfraIds] = useState<string[]>([]);
  const [sampleBatches, setSampleBatches] = useState<SampleBatch[]>([]);
  const [newBatch, setNewBatch] = useState({ infrastructureId: '', species: '', subjectCount: '', totalWeight: '' });
  const [batchError, setBatchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeCycles = cycles.filter((c) => c.status === 'active');
  const selectedCycle = cycles.find((c) => c.id === selectedCycleId);

  const batchOf = (infra: any) => livestockBatches.find((b) => b.id === infra?.livestock_batch_id);
  const availableOf = (infra: any) => {
    const b = batchOf(infra);
    return b?.quantity ?? infra?.current_quantity ?? 0;
  };

  const selectedInfras = useMemo(
    () => infrastructures.filter((i) => selectedInfraIds.includes(i.id)),
    [infrastructures, selectedInfraIds]
  );

  // Total de sujets disponibles sur l'ensemble des infrastructures sélectionnées
  const availableSubjects = useMemo(
    () => selectedInfras.reduce((sum, i) => sum + availableOf(i), 0),
    [selectedInfras, livestockBatches]
  );

  // Le lot d'ajout pointe toujours vers une infrastructure valide
  useEffect(() => {
    if (selectedInfraIds.length === 0) {
      setNewBatch((p) => ({ ...p, infrastructureId: '' }));
      return;
    }
    setNewBatch((p) =>
      selectedInfraIds.includes(p.infrastructureId) ? p : { ...p, infrastructureId: selectedInfraIds[0] }
    );
  }, [selectedInfraIds]);

  const pastControlRecords = useMemo(
    () => allHealthRecords.filter((r) => r.basin_id && selectedInfraIds.includes(r.basin_id)),
    [allHealthRecords, selectedInfraIds]
  );

  // Sujets prélevés par infrastructure
  const perInfra = useMemo(() => {
    return selectedInfras.map((infra) => {
      const rows = sampleBatches.filter((b) => b.infrastructureId === infra.id);
      const subjects = rows.reduce((s, b) => s + b.subjectCount, 0);
      const weight = rows.reduce((s, b) => s + b.totalWeight, 0);
      const available = availableOf(infra);
      return {
        infra,
        rows,
        subjects,
        weight,
        available,
        pmi: subjects > 0 ? weight / subjects : 0,
        percentage: available > 0 ? (subjects / available) * 100 : 0,
        over: available > 0 && subjects > available,
      };
    });
  }, [selectedInfras, sampleBatches, livestockBatches]);

  const batchCalculations = useMemo(() => {
    const totalSubjects = sampleBatches.reduce((sum, b) => sum + b.subjectCount, 0);
    const totalWeight = sampleBatches.reduce((sum, b) => sum + b.totalWeight, 0);
    return {
      totalSubjects,
      totalWeight,
      totalWeightKg: totalWeight / 1000,
      pmi: totalSubjects > 0 ? totalWeight / totalSubjects : 0,
      samplePercentage: availableSubjects > 0 ? (totalSubjects / availableSubjects) * 100 : 0,
    };
  }, [sampleBatches, availableSubjects]);

  const speciesCalculations = useMemo(() => {
    const map = new Map<string, { species: string; subjects: number; weight: number }>();
    sampleBatches.forEach((b) => {
      const key = (b.species || 'Non précisée').trim() || 'Non précisée';
      const entry = map.get(key) || { species: key, subjects: 0, weight: 0 };
      entry.subjects += b.subjectCount;
      entry.weight += b.totalWeight;
      map.set(key, entry);
    });
    return Array.from(map.values()).map((e) => ({ ...e, pmi: e.subjects > 0 ? e.weight / e.subjects : 0 }));
  }, [sampleBatches]);

  const rowErrors = useMemo(() => {
    const map: Record<string, string> = {};
    sampleBatches.forEach((b) => {
      if (!Number.isFinite(b.subjectCount) || b.subjectCount <= 0) {
        map[b.id] = 'Le nombre de sujets doit être un entier supérieur à 0.';
      } else if (!Number.isFinite(b.totalWeight) || b.totalWeight <= 0) {
        map[b.id] = 'Le poids total du lot doit être supérieur à 0 g.';
      } else if (b.totalWeight / b.subjectCount > 100000) {
        map[b.id] = 'PMI incohérent : vérifiez le poids total (en grammes) et le nombre de sujets.';
      }
    });
    return map;
  }, [sampleBatches]);

  const hasRowErrors = Object.keys(rowErrors).length > 0;
  const overSampled = perInfra.some((p) => p.over);

  const toggleInfra = (id: string, checked: boolean) => {
    setSubmitError(null);
    setSelectedInfraIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
    if (!checked) setSampleBatches((prev) => prev.filter((b) => b.infrastructureId !== id));
  };

  const validateNewBatch = (): string | null => {
    if (!newBatch.infrastructureId) return 'Sélectionnez au moins une infrastructure avant de prélever.';
    const subjectCount = Number(newBatch.subjectCount);
    const totalWeight = Number(newBatch.totalWeight);
    if (!newBatch.subjectCount.trim() || !Number.isFinite(subjectCount)) return 'Le nombre de sujets prélevés est obligatoire.';
    if (!Number.isInteger(subjectCount)) return 'Le nombre de sujets doit être un nombre entier.';
    if (subjectCount <= 0) return 'Le nombre de sujets doit être supérieur à 0.';
    if (!newBatch.totalWeight.trim() || !Number.isFinite(totalWeight)) return 'Le poids TOTAL du lot (en grammes) est obligatoire.';
    if (totalWeight <= 0) return 'Le poids total doit être supérieur à 0 g.';
    const target = perInfra.find((p) => p.infra.id === newBatch.infrastructureId);
    if (target && target.available > 0 && target.subjects + subjectCount > target.available) {
      return `Le total prélevé sur ${target.infra.infrastructure_name} (${target.subjects + subjectCount}) dépasse les ${target.available} sujets disponibles.`;
    }
    return null;
  };

  const handleAddSampleBatch = () => {
    const error = validateNewBatch();
    if (error) {
      setBatchError(error);
      return;
    }
    setBatchError(null);
    const subjectCount = parseInt(newBatch.subjectCount, 10);
    const totalWeight = parseFloat(newBatch.totalWeight);
    const infra = infrastructures.find((i) => i.id === newBatch.infrastructureId);
    const defaultSpecies = batchOf(infra)?.species || selectedCycle?.species || 'Non précisée';

    setSampleBatches((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        infrastructureId: newBatch.infrastructureId,
        species: (newBatch.species || defaultSpecies).trim(),
        subjectCount,
        totalWeight,
        individualWeight: totalWeight / subjectCount,
      },
    ]);
    setNewBatch((p) => ({ ...p, subjectCount: '', totalWeight: '' }));
  };

  const handleUpdateSampleBatch = (
    id: string,
    field: 'species' | 'subjectCount' | 'totalWeight' | 'infrastructureId',
    value: string
  ) => {
    setSampleBatches((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated: SampleBatch = {
          ...b,
          infrastructureId: field === 'infrastructureId' ? value : b.infrastructureId,
          species: field === 'species' ? value : b.species,
          subjectCount: field === 'subjectCount' ? parseInt(value) || 0 : b.subjectCount,
          totalWeight: field === 'totalWeight' ? parseFloat(value) || 0 : b.totalWeight,
          individualWeight: 0,
        };
        updated.individualWeight = updated.subjectCount > 0 ? updated.totalWeight / updated.subjectCount : 0;
        return updated;
      })
    );
  };

  const handleRemoveSampleBatch = (id: string) => setSampleBatches((prev) => prev.filter((b) => b.id !== id));

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      temperature: '',
      ph: '',
      oxygen: '',
      mortality: '',
      notes: '',
    });
    setSampleBatches([]);
    setSelectedInfraIds([]);
    setSelectedCycleId('');
    setBatchError(null);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!unitId) return setSubmitError('Aucune unité de production sélectionnée.');
    if (!selectedCycleId) return setSubmitError('Sélectionnez un cycle de production actif.');
    if (selectedInfraIds.length === 0) return setSubmitError('Sélectionnez au moins une infrastructure.');
    if (sampleBatches.length === 0) return setSubmitError('Ajoutez au moins un lot prélevé.');
    if (hasRowErrors) return setSubmitError('Corrigez les lots en erreur avant d’enregistrer la pêche de contrôle.');
    if (overSampled) return setSubmitError('Le total prélevé dépasse les sujets disponibles sur une infrastructure.');

    const totalMortality = formData.mortality ? Math.max(0, parseFloat(formData.mortality)) : 0;
    const groups = perInfra.filter((p) => p.rows.length > 0);

    setSaving(true);
    try {
      for (const group of groups) {
        const share =
          totalMortality > 0 && batchCalculations.totalSubjects > 0
            ? Math.round((group.subjects / batchCalculations.totalSubjects) * totalMortality)
            : 0;

        const speciesRows = Array.from(
          group.rows
            .reduce((map, b) => {
              const key = (b.species || 'Non précisée').trim();
              const entry = map.get(key) || { subjects: 0, weight: 0 };
              entry.subjects += b.subjectCount;
              entry.weight += b.totalWeight;
              map.set(key, entry);
              return map;
            }, new Map<string, { subjects: number; weight: number }>())
            .entries()
        );

        const notes = [
          `=== PÊCHE DE CONTRÔLE — ${group.infra.infrastructure_name} ===`,
          ...group.rows.map(
            (b, i) =>
              `Lot ${i + 1} (${b.species}): ${b.subjectCount} sujets — poids total ${b.totalWeight}g → PMI ${b.individualWeight.toFixed(2)}g`
          ),
          '',
          '=== PMI PAR ESPÈCE ===',
          ...speciesRows.map(
            ([sp, v]) => `${sp}: ${v.subjects} sujets — ${v.weight.toFixed(0)}g → PMI ${(v.weight / v.subjects).toFixed(2)}g`
          ),
          '',
          '=== CALCULS INFRASTRUCTURE ===',
          `Sujets prélevés: ${group.subjects}`,
          `Poids total: ${group.weight.toFixed(0)}g (${(group.weight / 1000).toFixed(2)}kg)`,
          `PMI: ${group.pmi.toFixed(2)}g`,
          `Pourcentage prélevé: ${group.percentage.toFixed(2)}% sur ${group.available} sujets disponibles`,
          '',
          '=== SYNTHÈSE GLOBALE (toutes infrastructures sélectionnées) ===',
          `Infrastructures: ${groups.map((g) => g.infra.infrastructure_name).join(', ')}`,
          `Total sujets: ${batchCalculations.totalSubjects} — PMI global: ${batchCalculations.pmi.toFixed(2)}g`,
          formData.notes ? `\n=== OBSERVATIONS ===\n${formData.notes}` : '',
        ]
          .join('\n')
          .trim();

        await createRecord({
          cycle_id: selectedCycleId,
          unit_id: unitId,
          basin_id: group.infra.id,
          date: formData.date,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          ph: formData.ph ? parseFloat(formData.ph) : undefined,
          oxygen: formData.oxygen ? parseFloat(formData.oxygen) : undefined,
          mortality: share || undefined,
          average_weight: group.pmi,
          sample_count: group.subjects,
          density: group.percentage,
          feeding: group.weight / 1000,
          notes,
        });
      }

      toast({
        title: 'Pêche de contrôle enregistrée',
        description: `${groups.length} infrastructure(s) — PMI global ${batchCalculations.pmi.toFixed(2)} g`,
      });
      onRecordCreated?.();
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating control fishing record:', error);
      setSubmitError(error?.message || 'Enregistrement impossible. Vérifiez votre connexion et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (sampleBatches.length === 0) {
      toast({ title: 'Aucun lot', description: 'Ajoutez au moins un lot prélevé avant d’exporter.', variant: 'destructive' });
      return;
    }
    try {
      exportControlFishingPDF({
        cycleName: selectedCycle ? `${selectedCycle.name} - ${selectedCycle.species}` : undefined,
        infrastructureName: selectedInfras.map((i) => i.infrastructure_name).join(', '),
        date: formData.date,
        availableSubjects,
        batches: sampleBatches.map((b) => ({
          species: b.species,
          subjectCount: b.subjectCount,
          totalWeight: b.totalWeight,
          individualWeight: b.individualWeight,
        })),
        speciesRows: speciesCalculations,
        totals: batchCalculations,
        environment: {
          temperature: formData.temperature,
          ph: formData.ph,
          oxygen: formData.oxygen,
          mortality: formData.mortality,
        },
        notes: formData.notes,
      });
      toast({ title: 'PDF généré', description: 'Le rapport de pêche de contrôle a été téléchargé.' });
    } catch (err) {
      console.error('Erreur export PDF pêche de contrôle', err);
      toast({ title: 'Export impossible', description: 'Une erreur est survenue pendant la génération du PDF.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setSubmitError(null); }}>
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
          {/* Récapitulatif global */}
          {sampleBatches.length > 0 && (
            <Card className="border-primary/40 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2 flex-wrap">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Récapitulatif en temps réel
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileDown className="w-4 h-4 mr-1" />
                    Exporter en PDF
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-background p-2">
                    <span className="text-[11px] text-muted-foreground block">Total sujets</span>
                    <p className="font-bold text-lg">{batchCalculations.totalSubjects.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-background p-2">
                    <span className="text-[11px] text-muted-foreground block">Poids total</span>
                    <p className="font-bold text-lg">{batchCalculations.totalWeightKg.toFixed(2)} kg</p>
                  </div>
                  <div className="rounded-lg bg-background p-2">
                    <span className="text-[11px] text-muted-foreground block">PMI global</span>
                    <p className="font-bold text-lg text-primary">{batchCalculations.pmi.toFixed(2)} g</p>
                  </div>
                  <div className="rounded-lg bg-background p-2">
                    <span className="text-[11px] text-muted-foreground block">% prélevé</span>
                    <p className="font-bold text-lg">{batchCalculations.samplePercentage.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Détail par infrastructure</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perInfra.map((p) => (
                      <div key={p.infra.id} className="text-xs bg-background rounded p-2 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{p.infra.infrastructure_name}</span>
                          <span className="font-bold text-primary whitespace-nowrap">PMI {p.pmi.toFixed(2)} g</span>
                        </div>
                        <p className={`text-muted-foreground ${p.over ? 'text-destructive' : ''}`}>
                          {p.subjects} / {p.available} sujets · {(p.weight / 1000).toFixed(2)} kg · {p.percentage.toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Détail par espèce</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {speciesCalculations.map((s) => (
                      <div key={s.species} className="flex items-center justify-between gap-2 text-xs bg-background rounded p-2">
                        <span className="font-medium truncate">{s.species}</span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          {s.subjects} sujets · {(s.weight / 1000).toFixed(2)} kg
                        </span>
                        <span className="font-bold text-primary whitespace-nowrap">PMI {s.pmi.toFixed(2)} g</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(hasRowErrors || overSampled) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      {overSampled
                        ? 'Le total prélevé dépasse les sujets disponibles sur au moins une infrastructure.'
                        : 'Certains lots contiennent des valeurs invalides (vides, nulles ou négatives).'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sélection du cycle + infrastructures */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cycle & infrastructures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cycle">Cycle actif</Label>
                {activeCycles.length === 0 ? (
                  <Alert>
                    <AlertDescription>Aucun cycle actif disponible. Créez d'abord un cycle de production.</AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={selectedCycleId}
                    onValueChange={(value) => {
                      setSelectedCycleId(value);
                      setSelectedInfraIds([]);
                      setSampleBatches([]);
                      setSubmitError(null);
                    }}
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label>Infrastructures à échantillonner (sélection multiple)</Label>
                    {infrastructures.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          selectedInfraIds.length === infrastructures.length
                            ? (setSelectedInfraIds([]), setSampleBatches([]))
                            : setSelectedInfraIds(infrastructures.map((i) => i.id))
                        }
                      >
                        {selectedInfraIds.length === infrastructures.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                      </Button>
                    )}
                  </div>

                  {infrastructures.length === 0 ? (
                    <Alert>
                      <AlertDescription>Aucune infrastructure rattachée à ce cycle.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {infrastructures.map((infra) => {
                        const attached = batchOf(infra);
                        const available = availableOf(infra);
                        const checked = selectedInfraIds.includes(infra.id);
                        return (
                          <label
                            key={infra.id}
                            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                              checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => toggleInfra(infra.id, Boolean(v))}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{infra.infrastructure_name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {infra.infrastructure_type}
                                {attached?.species ? ` · ${attached.species}` : ''}
                              </p>
                              <p className="text-xs mt-1">
                                <span className="text-muted-foreground">Sujets disponibles : </span>
                                <span className="font-bold text-primary">{available.toLocaleString()}</span>
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {selectedInfras.length > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Disponibilité consolidée
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Infrastructures</span>
                      <p className="font-bold text-lg">{selectedInfras.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Sujets disponibles (total)</span>
                      <p className="font-bold text-lg text-primary">{availableSubjects.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Pêches précédentes</span>
                      <p className="font-medium">{pastControlRecords.length} enregistrement(s)</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfras.map((i) => (
                      <Badge key={i.id} variant="secondary" className="text-[11px]">
                        {i.infrastructure_name} · {availableOf(i).toLocaleString()} sujets
                      </Badge>
                    ))}
                  </div>

                  {pastControlRecords.length > 0 && (
                    <div className="pt-3 border-t">
                      <span className="text-xs font-medium text-muted-foreground">Dernières pêches</span>
                      <div className="space-y-2 mt-2">
                        {pastControlRecords.slice(0, 3).map((record) => (
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
          {selectedInfraIds.length > 0 && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Prélèvement par lots
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                    <p className="text-xs text-foreground/80">
                      Choisissez l'infrastructure, l'espèce, le nombre de sujets prélevés et le{' '}
                      <strong>poids TOTAL du lot pesé (pas le poids d'un poisson)</strong>. Le{' '}
                      <strong>PMI</strong> est calculé automatiquement (poids total ÷ nombre de sujets), par lot, par
                      infrastructure, par espèce et au global.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 sm:col-span-3">
                      <Label className="text-xs">Infrastructure</Label>
                      <Select
                        value={newBatch.infrastructureId || undefined}
                        onValueChange={(v) => { setBatchError(null); setNewBatch({ ...newBatch, infrastructureId: v }); }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedInfras.map((i) => (
                            <SelectItem key={i.id} value={i.id} className="text-xs">
                              {i.infrastructure_name} ({availableOf(i)} sujets)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 sm:col-span-2">
                      <Label className="text-xs">Espèce</Label>
                      <Input
                        value={newBatch.species}
                        onChange={(e) => setNewBatch({ ...newBatch, species: e.target.value })}
                        placeholder={selectedCycle?.species || 'Tilapia'}
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Label className="text-xs">Nb sujets</Label>
                      <Input
                        type="number"
                        min="1"
                        className="h-9"
                        value={newBatch.subjectCount}
                        onChange={(e) => { setBatchError(null); setNewBatch({ ...newBatch, subjectCount: e.target.value }); }}
                        placeholder="200"
                      />
                    </div>
                    <div className="col-span-8 sm:col-span-3">
                      <Label className="text-xs">Poids TOTAL du lot (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        className="h-9"
                        value={newBatch.totalWeight}
                        onChange={(e) => { setBatchError(null); setNewBatch({ ...newBatch, totalWeight: e.target.value }); }}
                        placeholder="10000"
                      />
                      {Number(newBatch.subjectCount) > 0 && Number(newBatch.totalWeight) > 0 && (
                        <p className="text-[11px] text-primary font-medium mt-1">
                          PMI ≈ {(Number(newBatch.totalWeight) / Number(newBatch.subjectCount)).toFixed(2)} g
                        </p>
                      )}
                    </div>
                    <div className="col-span-12 sm:col-span-2">
                      <Button type="button" onClick={handleAddSampleBatch} className="w-full" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {batchError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-xs">{batchError}</AlertDescription>
                    </Alert>
                  )}

                  {sampleBatches.length > 0 && (
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Lot</TableHead>
                            <TableHead className="text-xs">Infrastructure</TableHead>
                            <TableHead className="text-xs">Espèce</TableHead>
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
                              <TableCell>
                                <Select
                                  value={batch.infrastructureId}
                                  onValueChange={(v) => handleUpdateSampleBatch(batch.id, 'infrastructureId', v)}
                                >
                                  <SelectTrigger className="h-8 text-xs min-w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedInfras.map((i) => (
                                      <SelectItem key={i.id} value={i.id} className="text-xs">
                                        {i.infrastructure_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  className="h-8 text-xs"
                                  value={batch.species}
                                  onChange={(e) => handleUpdateSampleBatch(batch.id, 'species', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="1"
                                  className="h-8 text-xs text-right"
                                  value={batch.subjectCount || ''}
                                  onChange={(e) => handleUpdateSampleBatch(batch.id, 'subjectCount', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  className="h-8 text-xs text-right"
                                  value={batch.totalWeight || ''}
                                  onChange={(e) => handleUpdateSampleBatch(batch.id, 'totalWeight', e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right font-medium text-primary">
                                {batch.individualWeight.toFixed(2)}
                                {rowErrors[batch.id] && (
                                  <span className="block text-[10px] text-destructive font-normal">{rowErrors[batch.id]}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSampleBatch(batch.id)}>
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, oxygen: e.target.value })}
                        placeholder="6.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mortality">Mortalité observée (répartie par infrastructure)</Label>
                      <Input
                        id="mortality"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.mortality}
                        onChange={(e) => setFormData({ ...formData, mortality: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes et observations sur la pêche de contrôle..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {submitError && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-xs">{submitError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={sampleBatches.length === 0 || hasRowErrors || overSampled || saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {sampleBatches.length === 0
                  ? 'Ajoutez au moins un lot prélevé'
                  : `Enregistrer la pêche (${batchCalculations.totalSubjects} sujets, PMI: ${batchCalculations.pmi.toFixed(2)}g)`}
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ControlFishingForm;
