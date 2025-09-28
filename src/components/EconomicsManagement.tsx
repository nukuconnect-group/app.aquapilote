
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Plus, TrendingUp, TrendingDown, BarChart3, PieChart, Users, FileText, ShoppingCart } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import ProductionUnitSelector from './ProductionUnitSelector';
import TransactionForm from './economics/TransactionForm';
import ClientManager from './economics/ClientManager';
import InvoiceManager from './economics/InvoiceManager';

const EconomicsManagement = () => {
  const {
    activeUnit,
    getUnitFinancialData,
    getGlobalFinancialData
  } = useProductionUnits();

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: '1', date: '2024-01-18', description: 'Vente carpes - Restaurant Les Saveurs', amount: 2500, type: 'revenue' },
    { id: '2', date: '2024-01-17', description: 'Achat aliments Biomar', amount: -800, type: 'expense' },
    { id: '3', date: '2024-01-16', description: 'Maintenance pompe', amount: -350, type: 'expense' },
    { id: '4', date: '2024-01-15', description: 'Vente alevins - Aquarium Municipal', amount: 1800, type: 'revenue' }
  ]);

  const handleAddTransaction = (transaction: any) => {
    const newTransaction = {
      id: Date.now().toString(),
      date: transaction.date,
      description: `${transaction.type === 'sale' ? 'Vente' : 'Achat'} ${transaction.productName}${transaction.clientName ? ` - ${transaction.clientName}` : ''}${transaction.supplierName ? ` - ${transaction.supplierName}` : ''}`,
      amount: transaction.type === 'sale' ? transaction.totalAmount : -transaction.totalAmount,
      type: transaction.type === 'sale' ? 'revenue' : 'expense'
    };
    setTransactions([newTransaction, ...transactions]);
  };

  if (!activeUnit) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestion Économique</h2>
              <p className="text-emerald-100">Analyse financière et économique</p>
            </div>
          </div>
          <div className="mt-4">
            <ProductionUnitSelector />
          </div>
        </div>

        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-gray-500">
            Sélectionnez une unité pour voir ses données économiques
          </p>
        </div>
      </div>
    );
  }

  const unitFinancialData = getUnitFinancialData(activeUnit.id);
  const globalFinancialData = getGlobalFinancialData();
  const currentData = unitFinancialData || {
    revenue: 0,
    expenses: 0,
    profit: 0,
    monthlyData: []
  };
  const profitMargin = currentData.revenue > 0 ? (currentData.profit / currentData.revenue * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur d'unité */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold mb-2 text-sm">Gestion Économique - {activeUnit.name}</h2>
            <p className="text-emerald-100 text-xs">Analyse financière et rentabilité</p>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span className="text-base">Type: {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {activeUnit.type}
              </Badge>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            className="text-xs"
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle transaction
          </Button>
        </div>
        
        <ProductionUnitSelector />
      </div>

      {/* Formulaire de transaction */}
      {showTransactionForm && (
        <TransactionForm 
          onAddTransaction={handleAddTransaction}
          onClose={() => setShowTransactionForm(false)}
        />
      )}

      {/* Métriques financières */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">€{currentData.revenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Chiffre d'affaires</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold">€{currentData.expenses.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Charges</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">€{currentData.profit.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Bénéfice net</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{profitMargin}%</p>
            <p className="text-sm text-gray-600">Marge bénéficiaire</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="comparison">Comparaison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {currentData.monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Évolution financière - {activeUnit.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Charges" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Bénéfices" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Détail des revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Ventes principales</span>
                    <span className="font-bold">€{(currentData.revenue * 0.8).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ventes secondaires</span>
                    <span className="font-bold">€{(currentData.revenue * 0.2).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détail des charges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Alimentation</span>
                    <span className="font-bold">€{(currentData.expenses * 0.4).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Personnel</span>
                    <span className="font-bold">€{(currentData.expenses * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Maintenance</span>
                    <span className="font-bold">€{(currentData.expenses * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Autres</span>
                    <span className="font-bold">€{(currentData.expenses * 0.1).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Historique des Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
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

        <TabsContent value="clients">
          <ClientManager />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceManager />
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparaison avec les autres unités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <h4 className="font-semibold text-blue-800">Performance globale</h4>
                  <p className="text-2xl font-bold text-blue-600">€{globalFinancialData.profit.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Bénéfice total toutes unités</p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Part de cette unité dans le bénéfice global: {currentData.profit > 0 ? (currentData.profit / globalFinancialData.profit * 100).toFixed(1) : '0'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EconomicsManagement;
