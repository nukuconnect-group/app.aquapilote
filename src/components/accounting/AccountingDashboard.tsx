
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calculator, DollarSign, CreditCard, AlertTriangle, Calendar, Users, ShoppingCart, Utensils, FileText } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

const AccountingDashboard = () => {
  const { formatCurrency, t } = useSettings();
  const { activeUnit } = useProductionUnits();
  const summary = useFinancialSummary(activeUnit?.id);
  
  const profitMargin = summary.totalRevenue > 0 
    ? (summary.netBalance / summary.totalRevenue * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
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

      {/* Détails financiers */}
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

      {/* Flux de trésorerie et alertes */}
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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary.monthlyData.some(m => m.revenue > 0 || m.expenses > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Évolution financière (6 mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Dépenses" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Résultat" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {summary.expenseBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Répartition des dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {summary.expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Graphique détaillé des ventes et achats */}
      {summary.monthlyData.some(m => m.sales > 0 || m.purchases > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Détail mensuel: Ventes vs Achats vs Salaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="Ventes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" fill="#ef4444" name="Achats" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salaries" fill="#8b5cf6" name="Salaires" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Message si aucune donnée */}
      {summary.totalRevenue === 0 && summary.totalExpenses === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Calculator className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-medium text-sm mb-1">Aucune donnée financière</h4>
            <p className="text-xs text-muted-foreground">
              Commencez à enregistrer des ventes, achats et employés pour voir les statistiques
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingDashboard;
