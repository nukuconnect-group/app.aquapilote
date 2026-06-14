import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity, AlertTriangle, Building2, Droplets, Factory, FileText,
  Fish, Plus, Settings, Sparkles, Thermometer, TrendingUp, Users,
  Wind, BarChart3, Bell, Map as MapIcon, Download, ArrowRight,
  Wallet, ArrowDownRight, ArrowUpRight, PiggyBank, ChevronDown, ChevronUp
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
import AlertsPanel from './AlertsPanel';
import FarmsMap from './dashboard/FarmsMap';

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

const ModernDashboard: React.FC<ModernDashboardProps> = ({ onNavigate }) => {
  const { activeUnit, units } = useProductionUnits();
  const { formatCurrency } = useSettings();

  const { cycles } = useProductionCycles(activeUnit?.id);
  const { batches } = useLivestockBatches(activeUnit?.id);
  const { records: healthRecords } = useHealthRecords(undefined, activeUnit?.id);
  const { records: feedingRecords } = useFeedingRecords(undefined, activeUnit?.id);
  const financial = useFinancialSummary(activeUnit?.id);
  const { analyses } = useAIAnalyses(5);

  const go = (tab: string) => onNavigate?.(tab);

  // KPIs
  const activeCycles = cycles.filter((c) => c.status === 'active').length;
  const totalStock = batches.reduce((s, b) => s + (b.quantity || 0), 0);
  const estimatedProduction = batches.reduce(
    (s, b) => s + ((b.quantity || 0) * (b.average_weight || 0)) / 1000, 0
  );
  const criticalAlerts = analyses.filter((a) => a.alerte).length;

  const latestWater = useMemo(() => {
    const recent = healthRecords.slice(0, 10);
    if (recent.length === 0) return { temp: 0, oxy: 0, ph: 0 };
    const avg = (k: 'temperature' | 'oxygen' | 'ph') =>
      recent.reduce((s, r) => s + ((r as any)[k] || 0), 0) / recent.length;
    return {
      temp: +avg('temperature').toFixed(1),
      oxy: +avg('oxygen').toFixed(2),
      ph: +avg('ph').toFixed(2),
    };
  }, [healthRecords]);

  // Chart data — water quality last 14 records
  const waterChart = useMemo(() => {
    const recs = [...healthRecords]
      .slice(0, 14)
      .reverse()
      .map((r, i) => ({
        label: r.date ? new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : `J${i + 1}`,
        temperature: r.temperature || 0,
        oxygene: r.oxygen || 0,
        ph: r.ph || 0,
      }));
    return recs;
  }, [healthRecords]);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Centre de pilotage</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Vue consolidée de vos opérations aquacoles</p>
        </div>
        <div className="w-full sm:w-auto sm:min-w-[260px]">
          <ProductionUnitSelector />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard label="Fermes" value={units.length} icon={Building2} tone="primary" hint={`${units.filter(u => u.isActive).length} actives`} />
        <KpiCard label="Bassins actifs" value={activeCycles} icon={Factory} tone="info" hint={`${cycles.length} cycles total`} />
        <KpiCard label="Production estimée" value={`${estimatedProduction.toFixed(1)} kg`} icon={Fish} tone="success" hint={`${totalStock.toLocaleString()} individus`} />
        <KpiCard label="Alertes critiques" value={criticalAlerts} icon={AlertTriangle} tone={criticalAlerts > 0 ? 'danger' : 'success'} hint="Dernières 24 h" />
        <KpiCard label="Qualité moy." value={latestWater.ph ? `pH ${latestWater.ph}` : '—'} icon={Droplets} tone="info" hint="Moyenne récente" />
        <KpiCard label="Température" value={latestWater.temp ? `${latestWater.temp}°C` : '—'} icon={Thermometer} tone="warning" hint="Moyenne 10 derniers" />
        <KpiCard label="Oxygène dissous" value={latestWater.oxy ? `${latestWater.oxy} mg/L` : '—'} icon={Wind} tone={latestWater.oxy && latestWater.oxy < 5 ? 'danger' : 'success'} hint="Moyenne récente" />
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

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-sky-600" /> Qualité de l'eau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waterChart}>
                  <defs>
                    <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOxy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="temperature" name="Température (°C)" stroke="#f97316" fill="url(#gTemp)" />
                  <Area type="monotone" dataKey="oxygene" name="Oxygène (mg/L)" stroke="#06b6d4" fill="url(#gOxy)" />
                  <Line type="monotone" dataKey="ph" name="pH" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Production & mortalité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productionChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="production" name="Production (k)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mortalite" name="Mortalité" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FarmsMap />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recommendations.map((r, i) => {
              const tones: Record<string, string> = {
                danger: 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900',
                warning: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900',
                info: 'border-sky-200 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-900',
              };
              return (
                <div key={i} className={`p-3 rounded-lg border ${tones[r.tone]}`}>
                  <p className="font-semibold text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
                </div>
              );
            })}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => go('aqua-assistant')}>
              Ouvrir AquaAssistant
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports per unit */}
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
    </div>
  );
};

export default ModernDashboard;