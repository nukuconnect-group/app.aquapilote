
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Plus, TrendingUp, AlertTriangle, CreditCard, FileText, Settings } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import AccountingDashboard from './accounting/AccountingDashboard';
import TransactionManager from './accounting/TransactionManager';
import CashFlowManager from './accounting/CashFlowManager';
import ReportsGenerator from './accounting/ReportsGenerator';
import DepreciationManager from './accounting/DepreciationManager';

const AccountingManagement = () => {
  const {
    activeUnit,
    getUnitFinancialData,
    getGlobalFinancialData,
    currency,
    setCurrency
  } = useProductionUnits();

  const currencies = [
    { code: 'FCFA', symbol: 'F CFA', name: 'Franc CFA' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar US' }
  ];

  if (!activeUnit) {
    return (
        <div className="space-y-responsive">
        <div className="bg-gradient-ocean p-responsive rounded-xl text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-responsive">
            <div>
              <h2 className="text-responsive-title font-bold mb-2">Gestion Comptable</h2>
              <p className="text-primary-foreground/80 text-responsive">Comptabilité complète et gestion financière</p>
            </div>
            <div className="flex items-center gap-responsive">
              <div className="flex items-center gap-2">
                <Settings className="icon-responsive" />
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value as 'FCFA' | 'EUR' | 'USD')}
                  className="bg-card/20 border border-border rounded px-2 py-1 text-responsive"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code} className="text-foreground bg-background">
                      {curr.symbol} {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ProductionUnitSelector />
          </div>
        </div>

        <div className="text-center py-12">
          <Calculator className="icon-responsive-lg mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-responsive-subtitle font-semibold text-foreground mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-muted-foreground text-responsive">
            Sélectionnez une unité pour accéder à sa comptabilité
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

  // Données de trésorerie simulées
  const cashFlowData = {
    totalInflow: 14200,
    totalOutflow: 9500,
    currentBalance: 15420,
    pendingInvoices: 3,
    overdueInvoices: 1
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur d'unité et devise */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Comptabilité - {activeUnit.name}</h2>
            <p className="text-emerald-100">Gestion comptable complète et reporting financier</p>
            <div className="mt-2 flex items-center space-x-4">
              <span>Type: {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {activeUnit.type}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as 'FCFA' | 'EUR' | 'USD')}
                className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white text-sm"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code} className="text-black">
                    {curr.symbol} {curr.name}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="secondary" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alertes ({cashFlowData.overdueInvoices})
            </Button>
          </div>
        </div>
        
        <ProductionUnitSelector />
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="dashboard">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Plus className="w-4 h-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="depreciation">
            <Calculator className="w-4 h-4 mr-2" />
            Amortissements
          </TabsTrigger>
          <TabsTrigger value="cashflow">
            <CreditCard className="w-4 h-4 mr-2" />
            Trésorerie
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Rapports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AccountingDashboard 
            unitData={currentData} 
            cashFlow={cashFlowData}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionManager />
        </TabsContent>

        <TabsContent value="depreciation">
          <DepreciationManager />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowManager />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountingManagement;
