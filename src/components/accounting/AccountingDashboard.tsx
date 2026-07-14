
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calculator, DollarSign, CreditCard, AlertTriangle, Calendar, Users, ShoppingCart, Utensils, FileText } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

// Palette sobre "cabinet comptable"
const CHART_COLORS = {
  revenue: '#0f766e',   // teal-700
  expenses: '#b91c1c',  // red-700
  profit: '#1d4ed8',    // blue-700
  salaries: '#7c3aed',  // violet-600
  sales: '#059669',     // emerald-600
  purchases: '#dc2626', // red-600
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))',
};

const AccountingDashboard = () => {
  const { formatCurrency, t } = useSettings();
  const { activeUnit } = useProductionUnits();
  const summary = useFinancialSummary(activeUnit?.id);

  const profitMargin = summary.totalRevenue > 0 
    ? (summary.netBalance / summary.totalRevenue * 100).toFixed(1) 
    : '0';

  const hasFinancialActivity = summary.monthlyData.some(m => m.revenue > 0 || m.expenses > 0);
  const hasSalesActivity = summary.monthlyData.some(m => m.sales > 0 || m.purchases > 0);
  const hasNoData = summary.totalRevenue === 0 && summary.totalExpenses === 0;

  // Enrichissement des données mensuelles avec la marge en %
  const enrichedMonthly = summary.monthlyData.map((m: any) => ({
    ...m,
    margin: m.revenue > 0 ? Number(((m.profit / m.revenue) * 100).toFixed(1)) : 0,
    cashflow: (m.sales || 0) - (m.purchases || 0) - (m.salaries || 0),
  }));

  const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  };

  return (
    <div className="space-y-6">
      {/* ===== 1. GRAPHIQUES PRO EN TÊTE ===== */}
      {hasNoData ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-1">Aucune donnée financière</h4>
            <p className="text-sm text-muted-foreground">
              Enregistrez des ventes, achats et employés pour voir apparaître vos indicateurs comptables.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Graphique principal : évolution CA / Charges / Résultat + marge % */}
          {hasFinancialActivity && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Compte de résultat — 6 derniers mois
                  </CardTitle>
                  <Badge variant={summary.netBalance >= 0 ? 'default' : 'destructive'} className="text-xs">
                    Marge nette : {profitMargin}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={enrichedMonthly}>
                    <defs>
                      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="month" stroke={CHART_COLORS.axis} fontSize={11} />
                    <YAxis
                      yAxisId="left"
                      stroke={CHART_COLORS.axis}
                      fontSize={11}
                      tickFormatter={(v) => formatCurrency(v).replace(/\s/g, '')}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={CHART_COLORS.profit}
                      fontSize={11}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value: number, name: string) =>
                        name === 'Marge %' ? [`${value}%`, name] : [formatCurrency(value), name]
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} strokeWidth={2} fill="url(#gradRev)" name="Chiffre d'affaires" />
                    <Area yAxisId="left" type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} strokeWidth={2} fill="url(#gradExp)" name="Charges" />
                    <Line yAxisId="left" type="monotone" dataKey="profit" stroke={CHART_COLORS.profit} strokeWidth={2.5} dot={{ r: 3 }} name="Résultat net" />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke={CHART_COLORS.profit} strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Marge %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cash-flow mensuel */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Flux de trésorerie mensuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={enrichedMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                    <XAxis dataKey="month" stroke={CHART_COLORS.axis} fontSize={11} />
                    <YAxis stroke={CHART_COLORS.axis} fontSize={11} tickFormatter={(v) => formatCurrency(v).replace(/\s/g, '')} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="sales" fill={CHART_COLORS.sales} name="Encaissements" radius={[3, 3, 0, 0]} stackId="in" />
                    <Bar dataKey="purchases" fill={CHART_COLORS.purchases} name="Décaissements achats" radius={[3, 3, 0, 0]} stackId="out" />
                    <Bar dataKey="salaries" fill={CHART_COLORS.salaries} name="Salaires" radius={[3, 3, 0, 0]} stackId="out" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition des charges */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIconInline />
                  Répartition des charges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary.expenseBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Aucune charge enregistrée</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={summary.expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={11}
                      >
                        {summary.expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ===== 2. KPIs CHIFFRÉS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">Revenus</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
            <p className="text-xs text-green-600 mt-1">
              {summary.confirmedSales} ventes confirmées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <Badge className="bg-red-100 text-red-800">Dépenses</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
            <p className="text-sm text-muted-foreground">Charges totales</p>
            <p className="text-xs text-red-600 mt-1">
              {summary.purchasesCount} achats reçus
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <Badge className={`${summary.netBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {profitMargin}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.netBalance)}</p>
            <p className="text-sm text-muted-foreground">Résultat net</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">RH</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalSalaries)}</p>
            <p className="text-sm text-muted-foreground">Masse salariale</p>
            <p className="text-xs text-purple-600 mt-1">
              {summary.employeesCount} employés actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== 3. Détails financiers ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium">Ventes</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalSalesRevenue)}</p>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Confirmées: {summary.confirmedSales}</span>
              <span>En attente: {summary.pendingSales}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Achats</span>
            </div>
            <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalPurchases)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.purchasesCount} achats reçus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Alimentation</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.feedPurchases)}</p>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Stock: {formatCurrency(summary.feedStockValue)}</span>
              <span>Consommé: {summary.feedConsumed.toFixed(1)} kg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium">Solde</span>
            </div>
            <p className={`text-xl font-bold ${summary.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Trésorerie disponible
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ===== 4. Flux détaillé, alertes, résumé ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Flux de trésorerie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-green-600">Entrées (Ventes)</span>
                <span className="font-bold text-green-600">+{formatCurrency(summary.totalSalesRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Achats</span>
                <span className="font-bold text-red-600">-{formatCurrency(summary.totalPurchases)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-600">Salaires</span>
                <span className="font-bold text-purple-600">-{formatCurrency(summary.totalSalaries)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Solde net</span>
                <span className={`font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.pendingSales > 0 && (
                <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">Ventes en attente</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{summary.pendingSales}</Badge>
                </div>
              )}
              {summary.netBalance < 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm text-red-800 dark:text-red-200">Solde négatif</span>
                  <Badge className="bg-red-100 text-red-800">Attention</Badge>
                </div>
              )}
              {summary.feedStocksCount === 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <span className="text-sm text-orange-800 dark:text-orange-200">Pas de stock aliment</span>
                  <Badge className="bg-orange-100 text-orange-800">À vérifier</Badge>
                </div>
              )}
              {summary.pendingSales === 0 && summary.netBalance >= 0 && summary.feedStocksCount > 0 && (
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm text-green-800 dark:text-green-200">Tout est en ordre</span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Résumé du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ventes</span>
                <span className="font-medium text-green-600">{summary.confirmedSales}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Achats</span>
                <span className="font-medium text-red-600">{summary.purchasesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Employés</span>
                <span className="font-medium text-purple-600">{summary.employeesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Types d'aliments</span>
                <span className="font-medium text-orange-600">{summary.feedStocksCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

// Icône inline pour éviter un import supplémentaire
const PieChartIconInline: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export default AccountingDashboard;
