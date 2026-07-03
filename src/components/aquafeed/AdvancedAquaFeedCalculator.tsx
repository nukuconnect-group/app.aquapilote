import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, Utensils, Fish, Wallet, Package, Info } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ExportDropdown from '@/components/ExportDropdown';

type Species = 'tilapia' | 'clarias';
type InfraType = 'etang' | 'bassin_beton' | 'bac_hors_sol' | 'biofloc' | 'ras' | 'cage_flottante';

const INFRA_LABELS: Record<InfraType, string> = {
  etang: 'Étang',
  bassin_beton: 'Bassin béton',
  bac_hors_sol: 'Bac hors-sol',
  biofloc: 'Biofloc',
  ras: 'RAS (recirculation)',
  cage_flottante: 'Cage flottante',
};

const FCR_PRESETS = [1.0, 1.2, 1.3, 1.5, 1.8];
const BAG_PRESETS = [15, 25, 50];

interface ObjectiveResult {
  productionTargetKg: number;
  finalWeightKg: number;
  initialWeightKg: number;
  survivalRate: number;
  fcr: number;
  feedPrice: number;
  bagWeight: number;
  fishToHarvest: number;
  fingerlings: number;
  initialBiomass: number;
  biomassGain: number;
  totalFeedKg: number;
  totalCost: number;
  bagsNeeded: number;
}

interface DailyResult {
  fishCount: number;
  avgWeightG: number;
  biomassKg: number;
  feedRatePct: number;
  dailyRationKg: number;
  monthlyRationKg: number;
  cost: number;
  bagsPerMonth: number;
}

const AdvancedAquaFeedCalculator: React.FC = () => {
  const { formatCurrency, activeUnit } = useProductionUnits();

  // Mode 1: production objective
  const [species, setSpecies] = useState<Species>('tilapia');
  const [infra, setInfra] = useState<InfraType>('bassin_beton');
  const [productionTarget, setProductionTarget] = useState<number>(5000); // kg
  const [finalWeight, setFinalWeight] = useState<number>(500); // g
  const [initialWeight, setInitialWeight] = useState<number>(5); // g
  const [survivalRate, setSurvivalRate] = useState<number>(90); // %
  const [fcr, setFcr] = useState<number>(1.5);
  const [feedPrice, setFeedPrice] = useState<number>(650);
  const [bagWeight, setBagWeight] = useState<number>(25);
  const [customBag, setCustomBag] = useState<number | ''>('');

  // Mode 2: daily ration from biomass
  const [dFishCount, setDFishCount] = useState<number>(1000);
  const [dAvgWeight, setDAvgWeight] = useState<number>(200); // g
  const [dFeedRate, setDFeedRate] = useState<number>(3); // %
  const [dFeedPrice, setDFeedPrice] = useState<number>(650);
  const [dBagWeight, setDBagWeight] = useState<number>(25);

  const objectiveResult: ObjectiveResult | null = useMemo(() => {
    const bag = typeof customBag === 'number' && customBag > 0 ? customBag : bagWeight;
    if (productionTarget <= 0 || finalWeight <= 0 || initialWeight <= 0 || survivalRate <= 0 || fcr <= 0 || bag <= 0) return null;
    const finalKg = finalWeight / 1000;
    const initialKg = initialWeight / 1000;
    const fishToHarvest = productionTarget / finalKg;
    const fingerlings = (fishToHarvest * 100) / survivalRate;
    const initialBiomass = fingerlings * initialKg;
    const biomassGain = productionTarget - initialBiomass;
    const totalFeedKg = biomassGain * fcr;
    const totalCost = totalFeedKg * feedPrice;
    const bagsNeeded = Math.ceil(totalFeedKg / bag);
    return {
      productionTargetKg: productionTarget,
      finalWeightKg: finalKg,
      initialWeightKg: initialKg,
      survivalRate,
      fcr,
      feedPrice,
      bagWeight: bag,
      fishToHarvest: Math.round(fishToHarvest),
      fingerlings: Math.ceil(fingerlings),
      initialBiomass: Math.round(initialBiomass * 100) / 100,
      biomassGain: Math.round(biomassGain * 100) / 100,
      totalFeedKg: Math.round(totalFeedKg * 100) / 100,
      totalCost: Math.round(totalCost),
      bagsNeeded,
    };
  }, [productionTarget, finalWeight, initialWeight, survivalRate, fcr, feedPrice, bagWeight, customBag]);

  const dailyResult: DailyResult | null = useMemo(() => {
    if (dFishCount <= 0 || dAvgWeight <= 0 || dFeedRate <= 0 || dBagWeight <= 0) return null;
    const biomassKg = (dFishCount * dAvgWeight) / 1000;
    const dailyRationKg = biomassKg * (dFeedRate / 100);
    const monthlyRationKg = dailyRationKg * 30;
    const cost = monthlyRationKg * dFeedPrice;
    const bagsPerMonth = Math.ceil(monthlyRationKg / dBagWeight);
    return {
      fishCount: dFishCount,
      avgWeightG: dAvgWeight,
      biomassKg: Math.round(biomassKg * 1000) / 1000,
      feedRatePct: dFeedRate,
      dailyRationKg: Math.round(dailyRationKg * 1000) / 1000,
      monthlyRationKg: Math.round(monthlyRationKg * 100) / 100,
      cost: Math.round(cost),
      bagsPerMonth,
    };
  }, [dFishCount, dAvgWeight, dFeedRate, dFeedPrice, dBagWeight]);

  const exportOptions = useMemo(() => {
    if (!objectiveResult) return null;
    const r = objectiveResult;
    const rows = [
      { label: 'Espèce', value: species === 'tilapia' ? 'Tilapia' : 'Clarias' },
      { label: 'Infrastructure', value: INFRA_LABELS[infra] },
      { label: '── HYPOTHÈSES ──', value: '' },
      { label: 'Objectif de production (kg)', value: String(r.productionTargetKg) },
      { label: 'Poids moyen final (g)', value: String(finalWeight) },
      { label: 'Poids moyen initial alevin (g)', value: String(initialWeight) },
      { label: 'Taux de survie (%)', value: String(r.survivalRate) },
      { label: 'IC (Indice de Conversion)', value: String(r.fcr) },
      { label: 'Prix aliment / kg', value: formatCurrency(r.feedPrice) },
      { label: 'Poids du sac (kg)', value: String(r.bagWeight) },
      { label: '── RÉSULTATS ──', value: '' },
      { label: 'Poissons à récolter', value: r.fishToHarvest.toLocaleString('fr-FR') },
      { label: 'Alevins à empoissonner', value: r.fingerlings.toLocaleString('fr-FR') },
      { label: 'Biomasse initiale (kg)', value: String(r.initialBiomass) },
      { label: 'Gain de biomasse (kg)', value: String(r.biomassGain) },
      { label: 'Quantité totale d\'aliment (kg)', value: String(r.totalFeedKg) },
      { label: 'Coût total alimentation', value: formatCurrency(r.totalCost) },
      { label: 'Nombre de sacs à acheter', value: String(r.bagsNeeded) },
    ];
    return {
      title: 'AquaFeed AI — Plan de production',
      subtitle: `${species === 'tilapia' ? 'Tilapia' : 'Clarias'} · ${INFRA_LABELS[infra]} · Objectif ${r.productionTargetKg} kg`,
      filename: `aquafeed-objectif-${species}-${new Date().toISOString().slice(0, 10)}`,
      unitName: activeUnit?.name,
      columns: [
        { key: 'label', label: 'Paramètre' },
        { key: 'value', label: 'Valeur' },
      ],
      data: rows,
    };
  }, [objectiveResult, species, infra, finalWeight, initialWeight, formatCurrency, activeUnit]);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Calculateur professionnel Tilapia / Clarias
          </CardTitle>
          <CardDescription>
            Deux modes de calcul : à partir d'un <strong>objectif de production</strong> ou à partir de la <strong>biomasse et ration journalière</strong>.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="objective" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto">
          <TabsTrigger value="objective"><Target className="w-4 h-4 mr-2" />Objectif de production</TabsTrigger>
          <TabsTrigger value="daily"><Utensils className="w-4 h-4 mr-2" />Biomasse & ration/jour</TabsTrigger>
        </TabsList>

        {/* MODE 1 : OBJECTIF DE PRODUCTION */}
        <TabsContent value="objective" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Fish className="w-4 h-4" />Paramètres</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Espèce</Label>
                    <Select value={species} onValueChange={v => setSpecies(v as Species)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tilapia">Tilapia</SelectItem>
                        <SelectItem value="clarias">Clarias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Infrastructure</Label>
                    <Select value={infra} onValueChange={v => setInfra(v as InfraType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(INFRA_LABELS) as InfraType[]).map(k => (
                          <SelectItem key={k} value={k}>{INFRA_LABELS[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Objectif de production (kg)</Label>
                  <Input type="number" min={0} value={productionTarget}
                    onChange={e => setProductionTarget(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground mt-1">= {(productionTarget / 1000).toLocaleString('fr-FR')} tonnes</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Poids final (g)</Label>
                    <Input type="number" min={0} value={finalWeight}
                      onChange={e => setFinalWeight(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Poids alevin (g)</Label>
                    <Input type="number" min={0} value={initialWeight}
                      onChange={e => setInitialWeight(Number(e.target.value))} />
                  </div>
                </div>

                <div>
                  <Label>Taux de survie (%)</Label>
                  <Input type="number" min={1} max={100} value={survivalRate}
                    onChange={e => setSurvivalRate(Number(e.target.value))} />
                </div>

                <div>
                  <Label>IC (Indice de Conversion)</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {FCR_PRESETS.map(v => (
                      <Button key={v} type="button" size="sm"
                        variant={fcr === v ? 'default' : 'outline'}
                        className="h-7 px-2 text-xs"
                        onClick={() => setFcr(v)}>{v}</Button>
                    ))}
                  </div>
                  <Input type="number" step="0.01" min={0.1} value={fcr}
                    onChange={e => setFcr(Number(e.target.value))} />
                </div>

                <div>
                  <Label>Prix aliment / kg</Label>
                  <Input type="number" min={0} value={feedPrice}
                    onChange={e => setFeedPrice(Number(e.target.value))} />
                </div>

                <div>
                  <Label>Poids du sac (kg)</Label>
                  <RadioGroup
                    value={customBag === '' || customBag === 0 ? String(bagWeight) : 'custom'}
                    onValueChange={(v) => {
                      if (v === 'custom') {
                        if (customBag === '' || customBag === 0) setCustomBag(20);
                      } else {
                        setBagWeight(Number(v));
                        setCustomBag('');
                      }
                    }}
                    className="grid grid-cols-4 gap-2"
                  >
                    {BAG_PRESETS.map(b => (
                      <div key={b} className="flex items-center gap-1">
                        <RadioGroupItem value={String(b)} id={`bag-${b}`} />
                        <Label htmlFor={`bag-${b}`} className="text-xs cursor-pointer">{b} kg</Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="custom" id="bag-custom" />
                      <Label htmlFor="bag-custom" className="text-xs cursor-pointer">Autre</Label>
                    </div>
                  </RadioGroup>
                  {(customBag !== '' && customBag !== 0) && (
                    <Input type="number" min={1} className="mt-2" placeholder="Poids personnalisé (kg)"
                      value={customBag}
                      onChange={e => setCustomBag(e.target.value === '' ? '' : Number(e.target.value))} />
                  )}
                </div>

                {exportOptions && (
                  <ExportDropdown options={exportOptions} label="Exporter le plan" className="w-full" />
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Calculator className="w-4 h-4" />Résultats & détail des calculs</CardTitle>
                <CardDescription className="text-xs">Recalcul automatique à chaque modification d'un paramètre.</CardDescription>
              </CardHeader>
              <CardContent>
                {!objectiveResult ? (
                  <div className="text-center py-12 text-muted-foreground">Renseignez les paramètres pour voir le plan.</div>
                ) : (
                  <div className="space-y-5">
                    {/* Synthèse */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <ResultStat icon={<Fish className="w-3.5 h-3.5" />} label="Poissons à récolter" value={objectiveResult.fishToHarvest.toLocaleString('fr-FR')} />
                      <ResultStat icon={<Fish className="w-3.5 h-3.5" />} label="Alevins à stocker" value={objectiveResult.fingerlings.toLocaleString('fr-FR')} highlight />
                      <ResultStat label="Biomasse initiale" value={`${objectiveResult.initialBiomass} kg`} />
                      <ResultStat label="Gain de biomasse" value={`${objectiveResult.biomassGain} kg`} />
                      <ResultStat icon={<Package className="w-3.5 h-3.5" />} label="Aliment total" value={`${objectiveResult.totalFeedKg} kg`} highlight />
                      <ResultStat icon={<Package className="w-3.5 h-3.5" />} label="Sacs à acheter" value={`${objectiveResult.bagsNeeded} sacs`} highlight />
                      <ResultStat icon={<Wallet className="w-3.5 h-3.5" />} label="Coût aliment total" value={formatCurrency(objectiveResult.totalCost)} highlight />
                      <ResultStat label="Coût / kg produit" value={formatCurrency(Math.round(objectiveResult.totalCost / Math.max(1, objectiveResult.productionTargetKg)))} />
                    </div>

                    {/* Tableau récapitulatif */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tableau récapitulatif</p>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody>
                            <RecapRow label="Espèce" value={species === 'tilapia' ? 'Tilapia' : 'Clarias'} />
                            <RecapRow label="Infrastructure" value={INFRA_LABELS[infra]} />
                            <RecapRow label="Objectif de production" value={`${objectiveResult.productionTargetKg} kg (${(objectiveResult.productionTargetKg / 1000).toLocaleString('fr-FR')} t)`} />
                            <RecapRow label="Poids moyen final visé" value={`${finalWeight} g (${objectiveResult.finalWeightKg} kg)`} />
                            <RecapRow label="Poids moyen initial alevin" value={`${initialWeight} g (${objectiveResult.initialWeightKg} kg)`} />
                            <RecapRow label="Taux de survie" value={`${objectiveResult.survivalRate} %`} />
                            <RecapRow label="IC (FCR)" value={String(objectiveResult.fcr)} />
                            <RecapRow label="Prix aliment / kg" value={formatCurrency(objectiveResult.feedPrice)} />
                            <RecapRow label="Poids du sac" value={`${objectiveResult.bagWeight} kg`} />
                            <RecapRow label="Poissons à récolter" value={objectiveResult.fishToHarvest.toLocaleString('fr-FR')} bold />
                            <RecapRow label="Alevins à empoissonner" value={objectiveResult.fingerlings.toLocaleString('fr-FR')} bold />
                            <RecapRow label="Biomasse initiale" value={`${objectiveResult.initialBiomass} kg`} />
                            <RecapRow label="Gain de biomasse" value={`${objectiveResult.biomassGain} kg`} />
                            <RecapRow label="Quantité totale d'aliment" value={`${objectiveResult.totalFeedKg} kg`} bold />
                            <RecapRow label="Coût total de l'alimentation" value={formatCurrency(objectiveResult.totalCost)} bold />
                            <RecapRow label="Nombre de sacs à acheter" value={`${objectiveResult.bagsNeeded} sacs de ${objectiveResult.bagWeight} kg`} bold />
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Détail des calculs */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                        <Info className="w-3 h-3" /> Détail des calculs & formules
                      </p>
                      <div className="space-y-2 text-sm">
                        <FormulaStep n={1} title="Nombre de poissons à récolter"
                          formula="Objectif (kg) ÷ Poids final (kg)"
                          calc={`${objectiveResult.productionTargetKg} ÷ ${objectiveResult.finalWeightKg} = ${objectiveResult.fishToHarvest.toLocaleString('fr-FR')} poissons`} />
                        <FormulaStep n={2} title="Nombre d'alevins à stocker"
                          formula="Poissons à récolter × 100 ÷ Taux de survie (%)"
                          calc={`${objectiveResult.fishToHarvest.toLocaleString('fr-FR')} × 100 ÷ ${objectiveResult.survivalRate} = ${objectiveResult.fingerlings.toLocaleString('fr-FR')} alevins`} />
                        <FormulaStep n={3} title="Biomasse initiale"
                          formula="Nombre d'alevins × Poids initial (kg)"
                          calc={`${objectiveResult.fingerlings.toLocaleString('fr-FR')} × ${objectiveResult.initialWeightKg} = ${objectiveResult.initialBiomass} kg`} />
                        <FormulaStep n={4} title="Gain de biomasse"
                          formula="Objectif − Biomasse initiale"
                          calc={`${objectiveResult.productionTargetKg} − ${objectiveResult.initialBiomass} = ${objectiveResult.biomassGain} kg`} />
                        <FormulaStep n={5} title="Quantité totale d'aliment"
                          formula="Gain de biomasse × IC"
                          calc={`${objectiveResult.biomassGain} × ${objectiveResult.fcr} = ${objectiveResult.totalFeedKg} kg`} />
                        <FormulaStep n={6} title="Coût total de l'alimentation"
                          formula="Quantité d'aliment × Prix / kg"
                          calc={`${objectiveResult.totalFeedKg} × ${formatCurrency(objectiveResult.feedPrice)} = ${formatCurrency(objectiveResult.totalCost)}`} />
                        <FormulaStep n={7} title="Nombre de sacs à acheter"
                          formula="⌈ Quantité d'aliment ÷ Poids du sac ⌉"
                          calc={`⌈ ${objectiveResult.totalFeedKg} ÷ ${objectiveResult.bagWeight} ⌉ = ${objectiveResult.bagsNeeded} sacs`} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MODE 2 : RATION JOURNALIÈRE */}
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Utensils className="w-4 h-4" />Ration journalière</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nombre de poissons</Label>
                  <Input type="number" min={0} value={dFishCount} onChange={e => setDFishCount(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Poids moyen individuel (g)</Label>
                  <Input type="number" min={0} value={dAvgWeight} onChange={e => setDAvgWeight(Number(e.target.value))} />
                </div>
                <div>
                  <Label>% d'alimentation appliqué</Label>
                  <Input type="number" step="0.1" min={0} value={dFeedRate} onChange={e => setDFeedRate(Number(e.target.value))} />
                  <p className="text-[11px] text-muted-foreground mt-1">Ex. alevins 8-10%, juvéniles 4-6%, grossissement 2-3%.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Prix aliment/kg</Label>
                    <Input type="number" min={0} value={dFeedPrice} onChange={e => setDFeedPrice(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Poids sac (kg)</Label>
                    <Input type="number" min={1} value={dBagWeight} onChange={e => setDBagWeight(Number(e.target.value))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Résultat journalier & mensuel</CardTitle></CardHeader>
              <CardContent>
                {!dailyResult ? (
                  <div className="text-center py-12 text-muted-foreground">Renseignez les paramètres.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <ResultStat label="Biomasse" value={`${dailyResult.biomassKg} kg`} />
                      <ResultStat label="Taux appliqué" value={`${dailyResult.feedRatePct} %`} />
                      <ResultStat label="Ration / jour" value={`${dailyResult.dailyRationKg} kg`} highlight />
                      <ResultStat label="Ration / mois" value={`${dailyResult.monthlyRationKg} kg`} />
                      <ResultStat label="Coût / mois" value={formatCurrency(dailyResult.cost)} highlight />
                      <ResultStat label="Sacs / mois" value={`${dailyResult.bagsPerMonth} sacs`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                        <Info className="w-3 h-3" /> Formules
                      </p>
                      <div className="space-y-2 text-sm">
                        <FormulaStep n={1} title="Biomasse totale"
                          formula="Nombre de poissons × Poids moyen (kg)"
                          calc={`${dailyResult.fishCount} × ${(dailyResult.avgWeightG / 1000)} = ${dailyResult.biomassKg} kg`} />
                        <FormulaStep n={2} title="Ration journalière"
                          formula="Biomasse × % d'alimentation"
                          calc={`${dailyResult.biomassKg} × ${dailyResult.feedRatePct}% = ${dailyResult.dailyRationKg} kg/j`} />
                        <FormulaStep n={3} title="Coût mensuel"
                          formula="Ration/jour × 30 × Prix/kg"
                          calc={`${dailyResult.dailyRationKg} × 30 × ${formatCurrency(dFeedPrice)} = ${formatCurrency(dailyResult.cost)}`} />
                        <FormulaStep n={4} title="Nombre de sacs / mois"
                          formula="⌈ Ration mensuelle ÷ Poids du sac ⌉"
                          calc={`⌈ ${dailyResult.monthlyRationKg} ÷ ${dBagWeight} ⌉ = ${dailyResult.bagsPerMonth} sacs`} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ResultStat: React.FC<{ label: string; value: string; icon?: React.ReactNode; highlight?: boolean }> = ({ label, value, icon, highlight }) => (
  <div className={`p-3 rounded-lg border ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-card'}`}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">{icon}{label}</p>
    <p className={`text-base font-semibold mt-0.5 ${highlight ? 'text-primary' : ''}`}>{value}</p>
  </div>
);

const RecapRow: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <tr className="border-b last:border-b-0">
    <td className="px-3 py-1.5 text-muted-foreground">{label}</td>
    <td className={`px-3 py-1.5 text-right ${bold ? 'font-semibold text-primary' : ''}`}>{value}</td>
  </tr>
);

const FormulaStep: React.FC<{ n: number; title: string; formula: string; calc: string }> = ({ n, title, formula, calc }) => (
  <div className="p-3 rounded-lg border bg-muted/30">
    <div className="flex items-center gap-2 mb-1">
      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Étape {n}</Badge>
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="text-xs text-muted-foreground font-mono">Formule : {formula}</p>
    <p className="text-sm font-mono mt-0.5">= {calc}</p>
  </div>
);

export default AdvancedAquaFeedCalculator;