import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Fish, Sparkles, History, Save, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { loadSpecies, loadRulesForSpecies, computeFeeding, FishSpecies, FeedingRule, FeedingResult } from '@/lib/feedingEngine';

const AquaFeedAI: React.FC = () => {
  const { user } = useAuth();
  const { activeUnit } = useProductionUnits();
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [rules, setRules] = useState<FeedingRule[]>([]);
  const [speciesId, setSpeciesId] = useState<string>('');
  const [fishCount, setFishCount] = useState<number>(1000);
  const [avgWeight, setAvgWeight] = useState<number>(50);
  const [waterTemp, setWaterTemp] = useState<number | ''>('');
  const [cycleDays, setCycleDays] = useState<number | ''>('');
  const [result, setResult] = useState<FeedingResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadSpecies().then(s => { setSpecies(s); if (s.length && !speciesId) setSpeciesId(s[0].id); }); }, []);
  useEffect(() => { if (speciesId) loadRulesForSpecies(speciesId).then(setRules); }, [speciesId]);
  useEffect(() => { loadHistory(); }, [user?.id]);

  const currentSpecies = useMemo(() => species.find(s => s.id === speciesId) ?? null, [species, speciesId]);

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
  };

  const handleSave = async () => {
    if (!result || !user?.id) return;
    setLoading(true);
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
    });
    setLoading(false);
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Calcul enregistré', description: 'Historique mis à jour.' });
      loadHistory();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><Sparkles className="w-6 h-6 text-primary" /></div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">AquaFeed AI</CardTitle>
              <CardDescription>Calcul intelligent de la ration alimentaire quotidienne.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto">
          <TabsTrigger value="calculator"><Calculator className="w-4 h-4 mr-2" />Calculateur</TabsTrigger>
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
                          <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-1">{h.fish_count} poissons × {h.avg_weight_g} g → biomasse {h.biomass_kg} kg</p>
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