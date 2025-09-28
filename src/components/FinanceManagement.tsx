
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  FileText, 
  CreditCard,
  PiggyBank,
  Target,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useSettings } from '@/contexts/SettingsContext';

const FinanceManagement = () => {
  const { currency } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Alimentation', budget: 5000, spent: 4200, percentage: 84 },
    { id: 2, category: 'Maintenance', budget: 2000, spent: 1500, percentage: 75 },
    { id: 3, category: 'Personnel', budget: 8000, spent: 8000, percentage: 100 },
    { id: 4, category: 'Équipements', budget: 3000, spent: 800, percentage: 27 }
  ]);

  const revenueData = [
    { month: 'Jan', revenue: 12000, expenses: 8000, profit: 4000 },
    { month: 'Fév', revenue: 15000, expenses: 9500, profit: 5500 },
    { month: 'Mar', revenue: 18000, expenses: 11000, profit: 7000 },
    { month: 'Avr', revenue: 16000, expenses: 10200, profit: 5800 },
    { month: 'Mai', revenue: 20000, expenses: 12500, profit: 7500 },
    { month: 'Jun', revenue: 22000, expenses: 13000, profit: 9000 }
  ];

  const expenseData = [
    { name: 'Alimentation', value: 4200, color: '#0088FE' },
    { name: 'Personnel', value: 8000, color: '#00C49F' },
    { name: 'Maintenance', value: 1500, color: '#FFBB28' },
    { name: 'Équipements', value: 800, color: '#FF8042' },
    { name: 'Autres', value: 1200, color: '#8884d8' }
  ];

  const transactions = [
    { id: 1, date: '2024-06-18', description: 'Vente poissons - Client A', amount: 2500, type: 'revenue' },
    { id: 2, date: '2024-06-17', description: 'Achat aliments', amount: -800, type: 'expense' },
    { id: 3, date: '2024-06-16', description: 'Maintenance pompe', amount: -350, type: 'expense' },
    { id: 4, date: '2024-06-15', description: 'Vente poissons - Client B', amount: 1800, type: 'revenue' }
  ];

  const kpis = [
    { title: 'Chiffre d\'Affaires', value: `${currency === 'XOF' ? 'F CFA ' : currency === 'EUR' ? '€' : '$'}22,000`, change: '+12%', trend: 'up', icon: DollarSign },
    { title: 'Charges', value: `${currency === 'XOF' ? 'F CFA ' : currency === 'EUR' ? '€' : '$'}13,000`, change: '+5%', trend: 'up', icon: CreditCard },
    { title: 'Bénéfice Net', value: `${currency === 'XOF' ? 'F CFA ' : currency === 'EUR' ? '€' : '$'}9,000`, change: '+28%', trend: 'up', icon: TrendingUp },
    { title: 'Marge Brute', value: '40.9%', change: '+2.1%', trend: 'up', icon: Target }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête responsive */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Gestion Financière</h2>
            <p className="text-green-100 text-sm sm:text-base">Suivi économique et budgétaire</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-40 bg-white/20 border-white/30 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nouvelle Transaction</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs - Grid responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  <Badge variant="secondary" className="text-xs">
                    {kpi.change}
                  </Badge>
                </div>
                <p className="text-lg sm:text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{kpi.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs avec navigation responsive */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 text-xs sm:text-sm">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base">Évolution des Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base">Répartition des Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Transactions récentes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Transactions Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 4).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                    <span className={`text-sm font-bold ${
                      transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'revenue' ? '+' : ''}{transaction.amount}€
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Gestion des Budgets</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Budget
            </Button>
          </div>

          <div className="grid gap-4">
            {budgets.map((budget) => (
              <Card key={budget.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{budget.category}</h4>
                        <span className="text-sm text-gray-600">
                          {budget.spent}€ / {budget.budget}€
                        </span>
                      </div>
                      <Progress value={budget.percentage} className="mb-2" />
                      <p className="text-xs text-gray-500">
                        {budget.percentage}% utilisé • Reste: {budget.budget - budget.spent}€
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Historique des Transactions</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exporter</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nouvelle Transaction</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'revenue' ? '+' : ''}{transaction.amount}€
                      </span>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Analyses Financières Détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" />
                  <Bar dataKey="expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Rapport Mensuel', desc: 'Synthèse du mois en cours', icon: FileText },
              { title: 'Bilan Annuel', desc: 'Rapport annuel complet', icon: Calculator },
              { title: 'Flux de Trésorerie', desc: 'Analyse des flux financiers', icon: TrendingUp }
            ].map((report, index) => {
              const IconComponent = report.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <IconComponent className="w-8 h-8 mx-auto mb-3 text-green-600" />
                    <h4 className="font-medium mb-2">{report.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
                    <Button size="sm" variant="outline">Générer</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManagement;
