import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Fish, Sparkles, History, Save, TrendingUp, AlertTriangle, Gauge, Wallet, Utensils, Sliders } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { loadSpecies, loadRulesForSpecies, computeFeeding, computeAdvancedFeeding, FishSpecies, FeedingRule, FeedingResult, AdvancedFeedingResult, DENSITY_LIMITS } from '@/lib/feedingEngine';
import ExportDropdown from '@/components/ExportDropdown';
import AdvancedAquaFeedCalculator from './AdvancedAquaFeedCalculator';

const AquaFeedAI: React.FC = () => {
  const { user } = useAuth();
  const { activeUnit, infrastructures, formatCurrency } = useProductionUnits();
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [rules, setRules] = useState<FeedingRule[]>([]);
  const [speciesId, setSpeciesId] = useState<string>('');
  const [fishCount, setFishCount] = useState<number>(1000);
  const [avgWeight, setAvgWeight] = useState<number>(50);
  const [waterTemp, setWaterTemp] = useState<number | ''>('');
  const [cycleDays, setCycleDays] = useState<number | ''>('');
  const [result, setResult] = useState<FeedingResult | null>(null);
  const [advancedResult, setAdvancedResult] = useState<AdvancedFeedingResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Champs avancés
  const [infrastructureId, setInfrastructureId] = useState<string>('');
  const [fcrOverride, setFcrOverride] = useState<number | ''>('');
  const [feedPrice, setFeedPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [targetWeight, setTargetWeight] = useState<number | ''>('');
  const [volumeM3, setVolumeM3] = useState<number | ''>('');
  const [surfaceM2, setSurfaceM2] = useState<number | ''>('');

  useEffect(() => { loadSpecies().then(s => { setSpecies(s); if (s.length && !speciesId) setSpeciesId(s[0].id); }); }, []);
  useEffect(() => { if (speciesId) loadRulesForSpecies(speciesId).then(setRules); }, [speciesId]);
  useEffect(() => { loadHistory(); }, [user?.id]);

  const currentSpecies = useMemo(() => species.find(s => s.id === speciesId) ?? null, [species, speciesId]);
  const unitInfrastructures = useMemo(
    () => infrastructures.filter(i => !activeUnit || i.unitId === activeUnit.id),
    [infrastructures, activeUnit]
  );
  const selectedInfra = useMemo(() => unitInfrastructures.find(i => i.id === infrastructureId) ?? null, [unitInfrastructures, infrastructureId]);

  // Cascade IC : override manuel > (par infra dans specs) > par espèce
  const effectiveFcr = useMemo(() => {
    if (typeof fcrOverride === 'number' && fcrOverride > 0) return fcrOverride;
    const infraFcr = (selectedInfra?.specifications as any)?.fcr;
    if (typeof infraFcr === 'number' && infraFcr > 0) return infraFcr;
    return currentSpecies?.default_fcr ?? 1.5;
  }, [fcrOverride, selectedInfra, currentSpecies]);

  // Auto-remplir volume/surface depuis les specs de l'infrastructure
  useEffect(() => {
    if (!selectedInfra) return;
    const specs = selectedInfra.specifications || {};
    if ((specs.volume || specs.capacity) && volumeM3 === '') {
      setVolumeM3(Number(specs.volume ?? specs.capacity));
    }
    if (specs.surface && surfaceM2 === '') {
      setSurfaceM2(Number(specs.surface));
    }
  }, [selectedInfra]);

  const loadHistory = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('feed_calculations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setHistory(data ?? []);
  };

  const handleCompute = () => {
    if (!speciesId || fishCount <= 0 || avgWeight <= 0) {
      toast({ title: 'Champs manquants', description: 'Sélectionnez une espèce et saisissez nombre + poids.', variant: 'destructive' });
      return;
    }
    const r = computeFeeding({
      fishCount, avgWeightG: avgWeight, rules, species: currentSpecies,
      cycleDays: typeof cycleDays === 'number' ? cycleDays : undefined,
    });
    setResult(r);
    setAdvancedResult(null);
  };

  const handleComputeAdvanced = () => {
    if (!speciesId || fishCount <= 0 || avgWeight <= 0) {
      toast({ title: 'Champs manquants', description: 'Sélectionnez une espèce et saisissez nombre + poids.', variant: 'destructive' });
      return;
    }
    const r = computeAdvancedFeeding({
      fishCount, avgWeightG: avgWeight, rules, species: currentSpecies,
      cycleDays: typeof cycleDays === 'number' ? cycleDays : undefined,
      infraType: selectedInfra?.type,
      advanced: {
        fcr: effectiveFcr,
        feed_price_per_kg: typeof feedPrice === 'number' ? feedPrice : null,
        sale_price_per_kg: typeof salePrice === 'number' ? salePrice : null,
        target_final_weight_g: typeof targetWeight === 'number' ? targetWeight : null,
        volume_m3: typeof volumeM3 === 'number' ? volumeM3 : null,
        surface_m2: typeof surfaceM2 === 'number' ? surfaceM2 : null,
      },
    });
    setAdvancedResult(r);
    setResult(r);
    if (r.warnings.length > 0) {
      toast({ title: 'Attention', description: r.warnings[0], variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!result || !user?.id) return;
    setLoading(true);
    const adv = advancedResult;
    const { error } = await supabase.from('feed_calculations').insert({
      user_id: user.id,
      unit_id: activeUnit?.id ?? null,
      species_id: speciesId || null,
      species_name: currentSpecies?.name ?? null,
      fish_count: fishCount,
      avg_weight_g: avgWeight,
      biomass_kg: result.biomass_kg,
      stage: result.stage,
      feed_rate_pct: result.feed_rate_pct,
      daily_ration_kg: result.daily_ration_kg,
      meals_per_day: result.meals_per_day,
      ration_per_meal_kg: result.ration_per_meal_kg,
      water_temp: typeof waterTemp === 'number' ? waterTemp : null,
      cycle_days: typeof cycleDays === 'number' ? cycleDays : (currentSpecies?.default_cycle_days ?? null),
      projected_final_weight_g: result.projected_final_weight_g,
      projected_total_feed_kg: result.projected_total_feed_kg,
      calc_mode: adv ? 'advanced' : 'basic',
      infrastructure_id: selectedInfra?.id ?? null,
      infrastructure_name: selectedInfra?.name ?? null,
      infrastructure_type: selectedInfra?.type ?? null,
      fcr: adv?.fcr_used ?? null,
      feed_price_per_kg: typeof feedPrice === 'number' ? feedPrice : null,
      sale_price_per_kg: typeof salePrice === 'number' ? salePrice : null,
      expected_cost: adv?.expected_cost ?? null,
      expected_revenue: adv?.expected_revenue ?? null,
      expected_margin: adv?.expected_margin ?? null,
      density_kg_per_m3: adv?.density_kg_per_m3 ?? null,
      density_fish_per_m2: adv?.density_fish_per_m2 ?? null,
      volume_m3: typeof volumeM3 === 'number' ? volumeM3 : null,
      surface_m2: typeof surfaceM2 === 'number' ? surfaceM2 : null,
      meal_schedule: (adv?.meal_schedule ?? null) as any,
    } as any);
    setLoading(false);
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Calcul enregistré', description: 'Historique mis à jour.' });
      loadHistory();
    }
  };

  // Options d'export pour le résultat courant
  const exportOptions = useMemo(() => {
    if (!result) return null;
    const adv = advancedResult;
    const rows: Array<{ label: string; value: string }> = [
      { label: 'Espèce', value: currentSpecies?.name ?? '—' },
      { label: 'Nombre de poissons', value: String(fishCount) },
      { label: 'Poids moyen (g)', value: String(avgWeight) },
      { label: 'Biomasse (kg)', value: String(result.biomass_kg) },
      { label: 'Stade', value: result.stage },
      { label: 'Taux d\'alimentation (%)', value: String(result.feed_rate_pct) },
      { label: 'Ration journalière (kg)', value: String(result.daily_ration_kg) },
      { label: 'Repas / jour', value: String(result.meals_per_day) },
      { label: 'Ration / repas (kg)', value: String(result.ration_per_meal_kg) },
      { label: 'Poids final projeté (g)', value: String(result.projected_final_weight_g) },
      { label: 'Aliment total prévu cycle (kg)', value: String(result.projected_total_feed_kg) },
    ];
    if (adv) {
      rows.push(
        { label: '── AVANCÉ ──', value: '' },
        { label: 'Infrastructure', value: `${selectedInfra?.name ?? '—'} (${selectedInfra?.type ?? '—'})` },
        { label: 'IC (FCR) utilisé', value: String(adv.fcr_used) },
        { label: 'Biomasse finale prévue (kg)', value: String(adv.expected_biomass_final_kg) },
        { label: 'Gain de biomasse (kg)', value: String(adv.expected_weight_gain_kg) },
        { label: 'Aliment nécessaire selon IC (kg)', value: String(adv.expected_feed_from_fcr_kg) },
        { label: 'Coût aliment prévu', value: formatCurrency(adv.expected_cost) },
        { label: 'Revenu prévu', value: formatCurrency(adv.expected_revenue) },
        { label: 'Marge prévue', value: formatCurrency(adv.expected_margin) },
        { label: 'Densité (kg/m³)', value: adv.density_kg_per_m3 !== null ? String(adv.density_kg_per_m3) : '—' },
        { label: 'Densité (poissons/m²)', value: adv.density_fish_per_m2 !== null ? String(adv.density_fish_per_m2) : '—' },
      );
      adv.meal_schedule.forEach(m => {
        rows.push({ label: `Repas ${m.meal} (${m.time})`, value: `${m.ration_kg} kg (${m.pct}%)` });
      });
      adv.warnings.forEach((w, i) => rows.push({ label: `⚠️ Alerte ${i + 1}`, value: w }));
    }
    return {
      title: 'Rapport AquaFeed AI',
      subtitle: `${currentSpecies?.name ?? ''}${selectedInfra ? ` — ${selectedInfra.name}` : ''}`,
      filename: `aquafeed-${(currentSpecies?.name ?? 'calcul').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}`,
      unitName: activeUnit?.name,
      columns: [
        { key: 'label', label: 'Paramètre' },
        { key: 'value', label: 'Valeur' },
      ],
      data: rows,
    };
  }, [result, advancedResult, currentSpecies, selectedInfra, activeUnit, fishCount, avgWeight, formatCurrency]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Sparkles className="w-6 h-6 text-primary" /></div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">AquaFeed AI</CardTitle>
              <CardDescription>Calcul intelligent de la ration — mode basique et mode avancé (IC, densité, coûts, prévisions).</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="calculator"><Calculator className="w-4 h-4 mr-2" />Calculateur</TabsTrigger>
          <TabsTrigger value="advanced"><Sliders className="w-4 h-4 mr-2" />Avancé (IC)</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Fish className="w-4 h-4" />Paramètres</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Espèce</Label>
                  <Select value={speciesId} onValueChange={setSpeciesId}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      {species.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nombre de poissons</Label>
                  <Input type="number" min={1} value={fishCount} onChange={e => setFishCount(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Poids moyen (g)</Label>
                  <Input type="number" min={0} value={avgWeight} onChange={e => setAvgWeight(Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Temp. (°C)</Label>
                    <Input type="number" value={waterTemp} onChange={e => setWaterTemp(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Cycle (j)</Label>
                    <Input type="number" placeholder={String(currentSpecies?.default_cycle_days ?? 180)}
                      value={cycleDays} onChange={e => setCycleDays(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCompute}><Calculator className="w-4 h-4 mr-2" />Calculer</Button>
                {result && <Button variant="outline" className="w-full" onClick={handleSave} disabled={loading}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>}
                {result && exportOptions && (
                  <ExportDropdown options={exportOptions} label="Exporter" className="w-full" />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Résultat</CardTitle></CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-12 text-muted-foreground">Lancez un calcul pour afficher la ration recommandée.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Stat label="Biomasse" value={`${result.biomass_kg} kg`} />
                      <Stat label="Stade" value={result.stage} />
                      <Stat label="Taux" value={`${result.feed_rate_pct}%`} />
                      <Stat label="Repas/jour" value={String(result.meals_per_day)} />
                      <Stat label="Ration/jour" value={`${result.daily_ration_kg} kg`} highlight />
                      <Stat label="Ration/repas" value={`${result.ration_per_meal_kg} kg`} highlight />
                      <Stat label="Poids final" value={`${result.projected_final_weight_g} g`} />
                      <Stat label="Aliment cycle" value={`${result.projected_total_feed_kg} kg`} />
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.growth_curve}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="day" label={{ value: 'Jour', position: 'insideBottom', offset: -2 }} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="weight_g" name="Poids (g)" stroke="hsl(var(--primary))" />
                          <Line yAxisId="right" type="monotone" dataKey="cumulative_feed_kg" name="Aliment cumulé (kg)" stroke="hsl(var(--chart-2, 200 90% 50%))" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sliders className="w-4 h-4" />Paramètres avancés</CardTitle>
                <CardDescription className="text-xs">IC (Indice de Conversion), infrastructure, densité, coûts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Espèce</Label>
                  <Select value={speciesId} onValueChange={setSpeciesId}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>
                      {species.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Infrastructure</Label>
                  <Select value={infrastructureId} onValueChange={setInfrastructureId}>
                    <SelectTrigger><SelectValue placeholder="Choisir bassin, étang, bac..." /></SelectTrigger>
                    <SelectContent>
                      {unitInfrastructures.length === 0 && <div className="p-2 text-xs text-muted-foreground">Aucune infrastructure pour cette unité.</div>}
                      {unitInfrastructures.map(i => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name} — {DENSITY_LIMITS[i.type]?.label ?? i.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Nombre poissons</Label>
                    <Input type="number" min={1} value={fishCount} onChange={e => setFishCount(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Poids moyen (g)</Label>
                    <Input type="number" min={0} value={avgWeight} onChange={e => setAvgWeight(Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cycle (jours)</Label>
                    <Input type="number" placeholder={String(currentSpecies?.default_cycle_days ?? 180)}
                      value={cycleDays} onChange={e => setCycleDays(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Poids cible (g)</Label>
                    <Input type="number" placeholder="ex: 500" value={targetWeight}
                      onChange={e => setTargetWeight(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">IC (FCR)
                    <Badge variant="outline" className="text-[10px]">défaut espèce : {currentSpecies?.default_fcr ?? 1.5}</Badge>
                  </Label>
                  <Input type="number" step="0.01" placeholder={`Utilisera ${effectiveFcr}`} value={fcrOverride}
                    onChange={e => setFcrOverride(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Volume (m³)</Label>
                    <Input type="number" value={volumeM3} onChange={e => setVolumeM3(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Surface (m²)</Label>
                    <Input type="number" value={surfaceM2} onChange={e => setSurfaceM2(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Prix aliment/kg</Label>
                    <Input type="number" value={feedPrice} onChange={e => setFeedPrice(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Prix vente/kg</Label>
                    <Input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleComputeAdvanced}>
                  <Calculator className="w-4 h-4 mr-2" />Calcul avancé
                </Button>
                {advancedResult && <Button variant="outline" className="w-full" onClick={handleSave} disabled={loading}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>}
                {advancedResult && exportOptions && (
                  <ExportDropdown options={exportOptions} label="Exporter rapport" className="w-full" />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Résultat détaillé</CardTitle></CardHeader>
              <CardContent>
                {!advancedResult ? (
                  <div className="text-center py-12 text-muted-foreground">Lancez le calcul avancé pour obtenir les prévisions détaillées.</div>
                ) : (
                  <div className="space-y-4">
                    {advancedResult.warnings.length > 0 && (
                      <div className="space-y-2">
                        {advancedResult.warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Ration & croissance</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Stat label="Biomasse" value={`${advancedResult.biomass_kg} kg`} />
                        <Stat label="IC utilisé" value={String(advancedResult.fcr_used)} highlight />
                        <Stat label="Ration/jour" value={`${advancedResult.daily_ration_kg} kg`} highlight />
                        <Stat label="Aliment cycle (IC)" value={`${advancedResult.expected_feed_from_fcr_kg} kg`} highlight />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1"><Gauge className="w-3 h-3" />Densité</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <Stat label="kg / m³" value={advancedResult.density_kg_per_m3 !== null ? String(advancedResult.density_kg_per_m3) : '—'} />
                        <Stat label="poissons / m²" value={advancedResult.density_fish_per_m2 !== null ? String(advancedResult.density_fish_per_m2) : '—'} />
                        <Stat label="Biomasse finale" value={`${advancedResult.expected_biomass_final_kg} kg`} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1"><Wallet className="w-3 h-3" />Économie prévisionnelle</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Stat label="Coût aliment" value={formatCurrency(advancedResult.expected_cost)} />
                        <Stat label="Revenu prévu" value={formatCurrency(advancedResult.expected_revenue)} />
                        <Stat label="Marge prévue" value={formatCurrency(advancedResult.expected_margin)} highlight />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1"><Utensils className="w-3 h-3" />Répartition des repas</p>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="text-left px-3 py-2">Repas</th>
                              <th className="text-left px-3 py-2">Heure</th>
                              <th className="text-right px-3 py-2">Ration (kg)</th>
                              <th className="text-right px-3 py-2">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {advancedResult.meal_schedule.map(m => (
                              <tr key={m.meal} className="border-t">
                                <td className="px-3 py-2">#{m.meal}</td>
                                <td className="px-3 py-2">{m.time}</td>
                                <td className="px-3 py-2 text-right font-medium">{m.ration_kg}</td>
                                <td className="px-3 py-2 text-right">{m.pct}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={advancedResult.growth_curve}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="day" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="weight_g" name="Poids (g)" stroke="hsl(var(--primary))" />
                          <Line yAxisId="right" type="monotone" dataKey="cumulative_feed_kg" name="Aliment cumulé (kg)" stroke="hsl(var(--chart-2, 200 90% 50%))" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" />Calculs récents</CardTitle></CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Aucun calcul enregistré.</div>
              ) : (
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge>{h.species_name ?? '—'}</Badge>
                          <Badge variant="outline">{h.stage}</Badge>
                          {h.calc_mode === 'advanced' && <Badge className="bg-primary/15 text-primary border-primary/30">Avancé</Badge>}
                          {h.infrastructure_name && <Badge variant="secondary" className="text-[10px]">{h.infrastructure_name}</Badge>}
                          <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-1">{h.fish_count} poissons × {h.avg_weight_g} g → biomasse {h.biomass_kg} kg</p>
                        {h.fcr && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            IC {h.fcr} · Aliment cycle {h.projected_total_feed_kg} kg
                            {h.expected_margin ? ` · Marge ${formatCurrency(Number(h.expected_margin))}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{h.daily_ration_kg} kg/j</p>
                        <p className="text-xs text-muted-foreground">{h.meals_per_day} repas</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-3 rounded-lg border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-card'}`}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={`text-base font-semibold ${highlight ? 'text-primary' : ''}`}>{value}</p>
  </div>
);

export default AquaFeedAI;