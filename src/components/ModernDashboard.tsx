import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, AlertTriangle, Building2, Droplets, Factory, FileText,
  Fish, Plus, Settings, Sparkles, Thermometer, TrendingUp, Users,
  Wind, BarChart3, Bell, Map as MapIcon, Download, ArrowRight,
  Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, ChevronDown, ChevronUp,
  Gauge, DollarSign, ShoppingCart, UserCog, Wrench, Layers, CircleDollarSign
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useProductionCycles } from '@/hooks/useProductionCycles';
import { useLivestockBatches } from '@/hooks/useLivestockBatches';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useFeedingRecords } from '@/hooks/useFeedingRecords';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useAIAnalyses } from '@/hooks/useAIAnalyses';
import { useFeedStocks } from '@/hooks/useFeedStocks';
import AlertsPanel from './AlertsPanel';
import FarmsMap from './dashboard/FarmsMap';
import { analyzeParameter } from '@/lib/waterQualityThresholds';

interface ModernDashboardProps {
  onNavigate?: (tab: string) => void;
}

const KpiCard: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: { value: number; positive: boolean };
}> = ({ label, value, hint, icon: Icon, tone = 'primary', trend }) => {
  const tones: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
    info: 'bg-sky-500/10 text-sky-600',
  };
  return (
    <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">{value}</p>
            {hint && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</p>}
          </div>
          <div className={`p-2 rounded-lg ${tones[tone]} shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        {trend && (
          <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend.positive ? '' : 'rotate-180'}`} />
            {trend.positive ? '+' : ''}{trend.value}% vs période préc.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickAction: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: string;
}> = ({ icon: Icon, label, onClick, tone = 'bg-primary/10 text-primary' }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/40 transition-all text-center"
  >
    <div className={`p-2.5 rounded-lg ${tone} group-hover:scale-110 transition-transform`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
    </div>
    <span className="text-[11px] sm:text-xs font-medium leading-tight">{label}</span>
  </button>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const ModernDashboard: React.FC<ModernDashboardProps> = ({ onNavigate }) => {
  const { activeUnit, setActiveUnit, units, getUnitEquipment, getUnitInfrastructures, getUnitDepreciableAssets, calculateDepreciation } = useProductionUnits();
  const { formatCurrency } = useSettings();
  const [showMap, setShowMap] = useState(false);
  const [selectedFarmFilter, setSelectedFarmFilter] = useState<string>('all');
  const [selectedBasinFilter, setSelectedBasinFilter] = useState<string>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'7' | '14' | '30'>('7');

  const { cycles } = useProductionCycles(activeUnit?.id);
  const { batches } = useLivestockBatches(activeUnit?.id);
  const { records: healthRecords } = useHealthRecords(undefined, activeUnit?.id);
  const { records: feedingRecords } = useFeedingRecords(undefined, activeUnit?.id);
  const financial = useFinancialSummary(activeUnit?.id);
  const { analyses } = useAIAnalyses(8, activeUnit?.id);
  const { stocks: feedStocks } = useFeedStocks(activeUnit?.id);

  const go = (tab: string) => onNavigate?.(tab);
  const basinOptions = useMemo(() => {
    const unitInfrastructures = activeUnit ? (getUnitInfrastructures?.(activeUnit.id) || []) : [];
    return unitInfrastructures.filter((infra: any) => infra.infrastructure_name);
  }, [activeUnit, getUnitInfrastructures]);

  // KPIs
  const activeCycles = cycles.filter((c) => c.status === 'active').length;
  const totalStock = batches.reduce((s, b) => s + (b.quantity || 0), 0);
  const estimatedProduction = batches.reduce(
    (s, b) => s + ((b.quantity || 0) * (b.average_weight || 0)) / 1000, 0
  );
  const criticalAlerts = analyses.filter((a) => a.alerte).length;
  const totalBiomassKg = batches.reduce(
    (sum, batch) => sum + (((batch.quantity || 0) * (batch.average_weight || 0)) / 1000),
    0,
  );
  const totalFeedRemaining = feedStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const lowFeedAlerts = feedStocks.filter((stock) => (stock.quantity || 0) <= (stock.min_threshold || 50)).length;
  const totalInitialStock = batches.reduce((sum, batch) => sum + ((batch as any).initial_quantity || batch.quantity || 0), 0);
  const survivalRate = totalInitialStock > 0
    ? Math.max(0, Math.min(100, Math.round((totalStock / totalInitialStock) * 100)))
    : 100;

  const filteredHealthRecords = useMemo(() => {
    const periodDays = Number(selectedPeriodFilter);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - periodDays);

    return healthRecords.filter((record: any) => {
      const matchesBasin = selectedBasinFilter === 'all' || record.basin_id === selectedBasinFilter;
      const matchesPeriod = !record.date || new Date(record.date) >= minDate;
      return matchesBasin && matchesPeriod;
    });
  }, [healthRecords, selectedBasinFilter, selectedPeriodFilter]);

  const latestWater = useMemo(() => {
    const recent = filteredHealthRecords.slice(0, 10);
    if (recent.length === 0) return { temp: 0, oxy: 0, ph: 0 };
    const avg = (k: 'temperature' | 'oxygen' | 'ph') =>
      recent.reduce((s, r) => s + ((r as any)[k] || 0), 0) / recent.length;
    return {
      temp: +avg('temperature').toFixed(1),
      oxy: +avg('oxygen').toFixed(2),
      ph: +avg('ph').toFixed(2),
    };
  }, [filteredHealthRecords]);

  // Chart data — water quality last 14 records
  const waterChart = useMemo(() => {
    const recs = [...filteredHealthRecords]
      .slice(0, Number(selectedPeriodFilter))
      .reverse()
      .map((r, i) => ({
        label: r.date ? new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : `J${i + 1}`,
        temperature: r.temperature || 0,
        oxygene: r.oxygen || 0,
        ph: r.ph || 0,
        timestamp: r.date || '',
      }));
    return recs;
  }, [filteredHealthRecords, selectedPeriodFilter]);

  // Production / mortality monthly
  const productionChart = useMemo(() => {
    return financial.monthlyData.map((m) => {
      const mortality = healthRecords
        .filter((r) => r.date?.includes(m.month))
        .reduce((s, r) => s + (r.mortality || 0), 0);
      const feed = feedingRecords
        .filter((r) => r.date?.includes(m.month))
        .reduce((s, r) => s + (r.quantity || 0), 0);
      return {
        month: m.month,
        production: Math.round(m.sales / 1000),
        mortalite: mortality,
        aliment: Math.round(feed),
      };
    });
  }, [financial.monthlyData, healthRecords, feedingRecords]);

  const unitReports = units.map((u) => {
    const uBatches = batches.filter((b) => b.unit_id === u.id);
    const uCycles = cycles.filter((c) => c.unit_id === u.id);
    const uStock = uBatches.reduce((s, b) => s + (b.quantity || 0), 0);
    const ratio = u.capacity ? Math.min(100, Math.round((uStock / u.capacity) * 100)) : 0;
    const status = !u.isActive ? 'critical' : ratio > 85 ? 'warning' : 'normal';
    return { unit: u, activeCycles: uCycles.filter((c) => c.status === 'active').length, stock: uStock, ratio, status };
  });

  const recommendations = useMemo(() => {
    const list: { title: string; detail: string; tone: 'danger' | 'warning' | 'info' }[] = [];
    if (latestWater.oxy && latestWater.oxy < 5)
      list.push({ title: 'Oxygène dissous faible', detail: 'Activez l\'aération et surveillez la densité des bassins.', tone: 'danger' });
    if (latestWater.temp && (latestWater.temp > 30 || latestWater.temp < 22))
      list.push({ title: 'Température hors plage', detail: 'Procédez à un renouvellement partiel d\'eau.', tone: 'warning' });
    if (latestWater.ph && (latestWater.ph < 6.5 || latestWater.ph > 8.5))
      list.push({ title: 'pH déséquilibré', detail: 'Vérifiez l\'alcalinité et ajustez progressivement.', tone: 'warning' });
    if (criticalAlerts > 0)
      list.push({ title: `${criticalAlerts} analyse(s) IA critique(s)`, detail: 'Consultez l\'historique IoT pour les actions recommandées.', tone: 'danger' });
    if (list.length === 0)
      list.push({ title: 'Paramètres dans la norme', detail: 'Continuez le suivi quotidien des bassins.', tone: 'info' });
    return list;
  }, [latestWater, criticalAlerts]);

  // Cycles progression (temporelle + production)
  const cycleProgress = useMemo(() => {
    return cycles
      .filter((c) => c.status === 'active')
      .slice(0, 5)
      .map((c: any) => {
        const start = c.start_date ? new Date(c.start_date) : null;
        const durationDays = c.expected_duration || c.duration || 0;
        const elapsed = start ? Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000)) : 0;
        const timeProgress = durationDays > 0 ? Math.min(100, Math.round((elapsed / durationDays) * 100)) : 0;
        const target = c.target_production || c.expected_production || 0;
        const current = c.current_production || 0;
        const prodProgress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return { id: c.id, name: c.name || c.cycle_name || `Cycle ${c.id?.slice(0, 4)}`, startDate: start, elapsed, timeProgress, current, target, prodProgress };
      });
  }, [cycles]);

  const unitEquipment = activeUnit ? (getUnitEquipment?.(activeUnit.id) || []) : [];
  const unitInfra = activeUnit ? (getUnitInfrastructures?.(activeUnit.id) || []) : [];
  const unitAssets = activeUnit ? (getUnitDepreciableAssets?.(activeUnit.id) || []) : [];
  const unitLabel = activeUnit?.name?.toUpperCase() || 'GLOBAL';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Centre de pilotage</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Vue consolidée de vos opérations aquacoles</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:min-w-[320px]">
          <Select value={activeUnit?.id || ''} onValueChange={(v) => { const u = units.find((x) => x.id === v); if (u) setActiveUnit(u); }}>
            <SelectTrigger className="h-9 min-w-[210px] text-xs sm:text-sm">
              <SelectValue placeholder="Sélectionner une unité" />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs sm:text-sm">{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs — 4 cartes principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Fermes */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Fermes</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 tracking-tight leading-tight">{units.length}</p>
              </div>
              <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 text-primary shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{units.filter((u) => u.isActive).length} actives</p>
            <div className="mt-2 grid grid-cols-1 gap-1 text-[10px] text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">Active</span>
                <span className="font-medium text-foreground truncate">{activeUnit?.name || 'Globale'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Cycles actifs */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Cycles actifs</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 tracking-tight leading-tight">{activeCycles}</p>
              </div>
              <div className="p-1.5 sm:p-2 rounded-md bg-sky-500/10 text-sky-600 shrink-0">
                <Factory className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{cycles.length} cycles total</p>
            <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-1.5 text-[10px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">Effectifs</span>
                <span className="font-semibold text-foreground">{totalStock.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Biomasse */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Biomasse</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 tracking-tight leading-tight">{totalBiomassKg.toFixed(1)}<span className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1">kg</span></p>
              </div>
              <div className="p-1.5 sm:p-2 rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
                <Fish className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">Estimée en cours</p>
            <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-1.5 text-[10px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">Survie</span>
                <span className="font-semibold text-foreground">{survivalRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Alertes */}
        <Card className="relative overflow-hidden border-border/60 hover:shadow-md transition-shadow">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Alertes</p>
                <p className="text-lg sm:text-2xl font-bold mt-0.5 tracking-tight leading-tight">{criticalAlerts}</p>
              </div>
              <div className={`p-1.5 sm:p-2 rounded-md shrink-0 ${criticalAlerts > 0 ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">24 dernières heures</p>
            <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-1.5 text-[10px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">Stocks bas</span>
                <span className="font-semibold text-foreground">{lowFeedAlerts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick access */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Accès rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            <QuickAction icon={Plus} label="Ajouter une donnée" onClick={() => go('livestock')} tone="bg-primary/10 text-primary" />
            <QuickAction icon={Building2} label="Mes fermes" onClick={() => go('units')} tone="bg-sky-500/10 text-sky-600" />
            <QuickAction icon={FileText} label="Générer un rapport" onClick={() => go('reports')} tone="bg-emerald-500/10 text-emerald-600" />
            <QuickAction icon={Bell} label="Voir les alertes" onClick={() => go('performance-alerts')} tone="bg-amber-500/10 text-amber-600" />
            <QuickAction icon={Users} label="Utilisateurs" onClick={() => go('team')} tone="bg-purple-500/10 text-purple-600" />
            <QuickAction icon={Settings} label="Paramètres" onClick={() => go('settings')} tone="bg-slate-500/10 text-slate-600" />
          </div>
        </CardContent>
      </Card>

      {/* Résumé Financier - mini-stats inline */}
      <Card className="border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/10 dark:border-emerald-900/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Résumé Financier — {unitLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> Revenus
              </div>
              <p className="text-lg sm:text-xl font-bold mt-1 text-emerald-600">{formatCurrency(financial.totalRevenue)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{financial.confirmedSales} ventes</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <ShoppingCart className="w-3.5 h-3.5" /> Dépenses
              </div>
              <p className="text-lg sm:text-xl font-bold mt-1 text-red-600">{formatCurrency(financial.totalExpenses)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{financial.purchasesCount} achats</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                <UserCog className="w-3.5 h-3.5" /> Salaires
              </div>
              <p className="text-lg sm:text-xl font-bold mt-1 text-purple-600">{formatCurrency(financial.totalSalaries)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{financial.employeesCount} employés</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <CircleDollarSign className="w-3.5 h-3.5" /> Solde
              </div>
              <p className={`text-lg sm:text-xl font-bold mt-1 ${financial.netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatCurrency(financial.netBalance)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{financial.netBalance >= 0 ? 'Bénéfice' : 'Perte'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finance evolution + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Évolution financière (6 derniers mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financial.monthlyData}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#10b981" fill="url(#gRev)" />
                  <Area type="monotone" dataKey="expenses" name="Dépenses" stroke="#ef4444" fill="url(#gExp)" />
                  <Line type="monotone" dataKey="profit" name="Bénéfice" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" /> Répartition des dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financial.expenseBreakdown.length ? financial.expenseBreakdown : [{ name: 'Aucune', value: 1, color: '#e5e7eb' }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {(financial.expenseBreakdown.length ? financial.expenseBreakdown : [{ name: 'Aucune', value: 1, color: '#e5e7eb' }]).map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics + Finance details + AI reco */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Indicateurs comparatifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Revenus', value: financial.totalRevenue },
                    { name: 'Dépenses', value: financial.totalExpenses },
                    { name: 'Stock alim.', value: financial.feedStockValue },
                    { name: 'Conso alim.', value: financial.feedConsumed },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600" /> Paramètres en direct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Thermometer className="w-3 h-3" /> Temp.</p>
                <p className={`text-sm font-bold ${latestWater.temp > 30 || latestWater.temp < 22 ? 'text-red-600' : 'text-foreground'}`}>{latestWater.temp}°C</p>
                {waterChart.length > 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    {waterChart[waterChart.length - 1].temperature >= waterChart[waterChart.length - 2].temperature ? '↗' : '↘'}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Wind className="w-3 h-3" /> O₂</p>
                <p className={`text-sm font-bold ${latestWater.oxy < 5 ? 'text-red-600' : 'text-foreground'}`}>{latestWater.oxy} mg/L</p>
                {waterChart.length > 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    {waterChart[waterChart.length - 1].oxygene >= waterChart[waterChart.length - 2].oxygene ? '↗' : '↘'}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-center">
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Droplets className="w-3 h-3" /> pH</p>
                <p className={`text-sm font-bold ${latestWater.ph < 6.5 || latestWater.ph > 8.5 ? 'text-red-600' : 'text-foreground'}`}>{latestWater.ph}</p>
                {waterChart.length > 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    {waterChart[waterChart.length - 1].ph >= waterChart[waterChart.length - 2].ph ? '↗' : '↘'}
                  </p>
                )}
              </div>
            </div>
            <div className="h-[90px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={waterChart.slice(-7)}>
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="oxygene" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ph" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">Tendances sur 7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mini paramètres en ligne */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Temp.</span>
                  <span className={`text-xs font-bold ${latestWater.temp > 30 || latestWater.temp < 22 ? 'text-red-600' : 'text-foreground'}`}>{latestWater.temp}°C</span>
                </div>
                <div className="h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waterChart.slice(-7)}>
                      <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">O₂</span>
                  <span className={`text-xs font-bold ${latestWater.oxy < 5 ? 'text-red-600' : 'text-foreground'}`}>{latestWater.oxy} mg/L</span>
                </div>
                <div className="h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waterChart.slice(-7)}>
                      <Area type="monotone" dataKey="oxygene" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">pH</span>
                  <span className={`text-xs font-bold ${latestWater.ph < 6.5 || latestWater.ph > 8.5 ? 'text-red-600' : 'text-foreground'}`}>{latestWater.ph}</span>
                </div>
                <div className="h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={waterChart.slice(-7)}>
                      <Area type="monotone" dataKey="ph" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {recommendations.map((r, i) => {
              const tones: Record<string, string> = {
                danger: 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900',
                warning: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900',
                info: 'border-sky-200 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-900',
              };
              return (
                <div key={i} className={`p-2.5 rounded-lg border ${tones[r.tone]}`}>
                  <p className="font-semibold text-xs">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.detail}</p>
                </div>
              );
              })}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => go('aqua-assistant')}>
              Ouvrir AquaAssistant
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports per unit */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-600" /> Suivi opérationnel — {unitLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cycles" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="cycles" className="text-xs sm:text-sm">Cycles</TabsTrigger>
              <TabsTrigger value="equipment" className="text-xs sm:text-sm">Équipements</TabsTrigger>
              <TabsTrigger value="infrastructure" className="text-xs sm:text-sm">Infrastructures</TabsTrigger>
              <TabsTrigger value="depreciation" className="text-xs sm:text-sm">Amortissements</TabsTrigger>
            </TabsList>

            <TabsContent value="cycles" className="space-y-3 mt-4">
              {cycleProgress.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun cycle actif en cours.</p>
              ) : (
                cycleProgress.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        {c.startDate && (
                          <p className="text-[11px] text-muted-foreground">
                            Démarré le {c.startDate.toLocaleDateString('fr-FR')} • {c.elapsed} jours
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">En cours</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Progression temporelle</span>
                          <span className="font-medium">{c.timeProgress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${c.timeProgress}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Production</span>
                          <span className="font-medium">{c.current.toLocaleString()}/{c.target.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${c.prodProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="equipment" className="space-y-3 mt-4">
              {unitEquipment.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun équipement enregistré pour cette unité.</p>
              ) : (
                unitEquipment.slice(0, 8).map((e: any) => {
                  const cap = Number(e.capacity || e.maxCapacity || 0);
                  const used = Number(e.currentUsage || e.usage || 0);
                  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
                  return (
                    <div key={e.id} className="p-3 rounded-lg border border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-2"><Wrench className="w-3.5 h-3.5 text-muted-foreground" />{e.name || e.type}</p>
                          <p className="text-[11px] text-muted-foreground">{e.type} {e.brand ? `• ${e.brand}` : ''}</p>
                        </div>
                        <Badge variant={e.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {e.status || 'actif'}
                        </Badge>
                      </div>
                      {cap > 0 && (
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-muted-foreground">Utilisation</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="infrastructure" className="space-y-3 mt-4">
              {unitInfra.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucune infrastructure enregistrée.</p>
              ) : (
                unitInfra.slice(0, 8).map((inf: any) => {
                  const cap = Number(inf.capacity || 0);
                  const occ = Number(inf.currentOccupancy || inf.occupancy || 0);
                  const pct = cap > 0 ? Math.min(100, Math.round((occ / cap) * 100)) : 0;
                  return (
                    <div key={inf.id} className="p-3 rounded-lg border border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-muted-foreground" />{inf.name}</p>
                          <p className="text-[11px] text-muted-foreground">{inf.type} {cap ? `• capacité ${cap.toLocaleString()}` : ''}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{inf.status || 'actif'}</Badge>
                      </div>
                      {cap > 0 && (
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-muted-foreground">Occupation</span>
                            <span className="font-medium">{occ.toLocaleString()}/{cap.toLocaleString()}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="depreciation" className="space-y-3 mt-4">
              {unitAssets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aucun actif amortissable enregistré.</p>
              ) : (
                unitAssets.slice(0, 8).map((a: any) => {
                  const depRaw: any = calculateDepreciation ? calculateDepreciation(a) : null;
                  const dep = depRaw && typeof depRaw === 'object'
                    ? depRaw
                    : { currentValue: a.purchaseValue || 0, totalDepreciated: 0, percentageDepreciated: 0 };
                  return (
                    <div key={a.id} className="p-3 rounded-lg border border-border/60">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-2"><PiggyBank className="w-3.5 h-3.5 text-muted-foreground" />{a.name}</p>
                          <p className="text-[11px] text-muted-foreground">Valeur initiale : {formatCurrency(a.purchaseValue || 0)}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{formatCurrency(dep.currentValue)}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Amortissement cumulé</span>
                          <span className="font-medium">{Math.round(dep.percentageDepreciated || 0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, dep.percentageDepreciated || 0)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Rapports des unités de production
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => go('reports')}>
            <Download className="w-3.5 h-3.5 mr-1" /> Exporter
          </Button>
        </CardHeader>
        <CardContent>
          {unitReports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune unité de production enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 font-medium">Unité</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Cycles actifs</th>
                    <th className="py-2 font-medium">Stock</th>
                    <th className="py-2 font-medium">Occupation</th>
                    <th className="py-2 font-medium">Statut</th>
                    <th className="py-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unitReports.map((r) => (
                    <tr key={r.unit.id} className="border-b last:border-0 hover:bg-accent/40">
                      <td className="py-2.5 font-medium">{r.unit.name}</td>
                      <td className="py-2.5 text-muted-foreground capitalize">{r.unit.type}</td>
                      <td className="py-2.5">{r.activeCycles}</td>
                      <td className="py-2.5">{r.stock.toLocaleString()}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full ${r.ratio > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${r.ratio}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{r.ratio}%</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Badge variant={r.status === 'critical' ? 'destructive' : r.status === 'warning' ? 'secondary' : 'default'} className="text-[10px]">
                          {r.status === 'critical' ? 'Critique' : r.status === 'warning' ? 'Attention' : 'Normal'}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button size="sm" variant="ghost" onClick={() => go('reports')}>
                          Détails <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts panel */}
      <AlertsPanel />

      {/* Map (option) */}
      <div>
        <Button variant="outline" size="sm" onClick={() => setShowMap((v) => !v)} className="gap-2">
          <MapIcon className="w-4 h-4" />
          {showMap ? 'Masquer la carte des fermes' : 'Afficher la carte des fermes'}
          {showMap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>
        {showMap && (
          <div className="mt-3">
            <FarmsMap />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernDashboard;