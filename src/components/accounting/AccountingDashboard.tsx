
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calculator, BarChart3, DollarSign, CreditCard, AlertTriangle, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';

interface AccountingDashboardProps {
  unitData: {
    revenue: number;
    expenses: number;
    profit: number;
    monthlyData: any[];
  };
  cashFlow: {
    totalInflow: number;
    totalOutflow: number;
    currentBalance: number;
    pendingInvoices: number;
    overdueInvoices: number;
  };
}

const AccountingDashboard = ({ unitData, cashFlow }: AccountingDashboardProps) => {
  const { formatCurrency, t } = useSettings();
  const profitMargin = unitData.revenue > 0 ? (unitData.profit / unitData.revenue * 100).toFixed(1) : '0';
  
  const expenseCategories = [
    { name: 'Alimentation', value: unitData.expenses * 0.4, color: '#8884d8' },
    { name: 'Personnel', value: unitData.expenses * 0.3, color: '#82ca9d' },
    { name: 'Maintenance', value: unitData.expenses * 0.2, color: '#ffc658' },
    { name: 'Autres', value: unitData.expenses * 0.1, color: '#ff7300' }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">+12%</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(unitData.revenue)}</p>
            <p className="text-sm text-gray-600">Chiffre d'affaires</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <Badge className="bg-red-100 text-red-800">-5%</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(unitData.expenses)}</p>
            <p className="text-sm text-gray-600">Charges totales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <Badge className={`${unitData.profit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {profitMargin}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(unitData.profit)}</p>
            <p className="text-sm text-gray-600">Résultat net</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <Badge className={`${cashFlow.currentBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Trésorerie
              </Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(cashFlow.currentBalance)}</p>
            <p className="text-sm text-gray-600">Solde actuel</p>
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
                <span className="text-green-600">Entrées</span>
                <span className="font-bold text-green-600">+{formatCurrency(cashFlow.totalInflow)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Sorties</span>
                <span className="font-bold text-red-600">-{formatCurrency(cashFlow.totalOutflow)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Solde net</span>
                <span className={`font-bold ${(cashFlow.totalInflow - cashFlow.totalOutflow) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashFlow.totalInflow - cashFlow.totalOutflow)}
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
              {cashFlow.overdueInvoices > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">Factures en retard</span>
                  <Badge className="bg-red-100 text-red-800">{cashFlow.overdueInvoices}</Badge>
                </div>
              )}
              {cashFlow.pendingInvoices > 0 && (
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-yellow-800">Factures en attente</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{cashFlow.pendingInvoices}</Badge>
                </div>
              )}
              {cashFlow.currentBalance < 5000 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm text-orange-800">Trésorerie faible</span>
                  <Badge className="bg-orange-100 text-orange-800">Attention</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Échéances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">{t('upcomingDueDates') || 'Prochaines échéances'} :</p>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• {t('salaries') || 'Salaires'} : 28/01 ({formatCurrency(3200)})</li>
                  <li>• {t('supplierBiomar') || 'Fournisseur Biomar'} : 30/01 ({formatCurrency(800)})</li>
                  <li>• {t('insurance') || 'Assurance'} : 15/02 ({formatCurrency(450)})</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {unitData.monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Évolution financière</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={unitData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus" />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Charges" />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Résultat" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Répartition des charges</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;
