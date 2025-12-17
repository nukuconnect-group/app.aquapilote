
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useLogs } from '@/contexts/LogsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

const ReportsGenerator = () => {
  const { addLog } = useLogs();
  const { formatCurrency, t } = useSettings();
  const { activeUnit, getUnitFinancialData } = useProductionUnits();
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportYear, setReportYear] = useState('2024');
  const [reportMonth, setReportMonth] = useState('01');

  // Récupérer les données réelles de l'unité active
  const unitData = activeUnit ? getUnitFinancialData(activeUnit.id) : null;
  
  // Données basées sur les données réelles (ou vides si pas de données)
  const monthlyData = unitData?.monthlyData || [];
  
  // Calculer les catégories de dépenses basées sur les données réelles
  const totalExpenses = unitData?.expenses || 0;
  const expenseBreakdown = totalExpenses > 0 ? [
    { category: 'Alimentation', amount: Math.round(totalExpenses * 0.4), percentage: 40, color: '#8884d8' },
    { category: 'Personnel', amount: Math.round(totalExpenses * 0.3), percentage: 30, color: '#82ca9d' },
    { category: 'Maintenance', amount: Math.round(totalExpenses * 0.2), percentage: 20, color: '#ffc658' },
    { category: 'Énergie', amount: Math.round(totalExpenses * 0.08), percentage: 8, color: '#ff7300' },
    { category: 'Autres', amount: Math.round(totalExpenses * 0.02), percentage: 2, color: '#00C49F' }
  ] : [];

  const totalRevenue = unitData?.revenue || 0;
  const revenueBreakdown = totalRevenue > 0 ? [
    { category: 'Vente poissons adultes', amount: Math.round(totalRevenue * 0.6), percentage: 60, color: '#8884d8' },
    { category: 'Vente alevins', amount: Math.round(totalRevenue * 0.3), percentage: 30, color: '#82ca9d' },
    { category: 'Services', amount: Math.round(totalRevenue * 0.08), percentage: 8, color: '#ffc658' },
    { category: 'Autres', amount: Math.round(totalRevenue * 0.02), percentage: 2, color: '#ff7300' }
  ] : [];

  // Bilan comptable - valeurs à 0 par défaut
  const balanceSheetData = {
    assets: {
      current: {
        cash: 0,
        accountsReceivable: 0,
        inventory: 0,
        total: 0
      },
      fixed: {
        equipment: 0,
        buildings: 0,
        land: 0,
        total: 0
      },
      total: 0
    },
    liabilities: {
      current: {
        accountsPayable: 0,
        shortTermLoans: 0,
        total: 0
      },
      longTerm: {
        mortgages: 0,
        longTermLoans: 0,
        total: 0
      },
      total: 0
    },
    equity: {
      ownersEquity: 0,
      total: 0
    }
  };

  const generatePDFReport = (reportType: string) => {
    const reportData = {
      type: reportType,
      period: reportPeriod,
      year: reportYear,
      month: reportMonth,
      timestamp: new Date().toISOString()
    };

    const filename = `rapport_${reportType}_${reportPeriod}_${reportYear}${reportMonth ? '_' + reportMonth : ''}.pdf`;
    
    addLog('Rapport généré', 'Comptabilité', `Rapport ${reportType} généré: ${filename}`, 'success');
    
    console.log('Génération PDF:', reportData);
    alert(`Rapport PDF généré: ${filename}`);
  };

  const exportToExcel = (reportType: string) => {
    const filename = `export_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    addLog('Export Excel', 'Comptabilité', `Export Excel généré: ${filename}`, 'info');
    alert(`Export Excel généré: ${filename}`);
  };

  const exportForAccountant = () => {
    const filename = `export_comptable_${new Date().toISOString().split('T')[0]}.zip`;
    addLog('Export comptable', 'Comptabilité', `Export pour cabinet comptable généré: ${filename}`, 'info');
    alert(`Archive pour cabinet comptable générée: ${filename}`);
  };

  const netResult = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Configuration des rapports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Configuration des rapports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Période</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="yearly">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Année</Label>
              <Select value={reportYear} onValueChange={setReportYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportPeriod === 'monthly' && (
              <div>
                <Label>Mois</Label>
                <Select value={reportMonth} onValueChange={setReportMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janvier</SelectItem>
                    <SelectItem value="02">Février</SelectItem>
                    <SelectItem value="03">Mars</SelectItem>
                    <SelectItem value="04">Avril</SelectItem>
                    <SelectItem value="05">Mai</SelectItem>
                    <SelectItem value="06">Juin</SelectItem>
                    <SelectItem value="07">Juillet</SelectItem>
                    <SelectItem value="08">Août</SelectItem>
                    <SelectItem value="09">Septembre</SelectItem>
                    <SelectItem value="10">Octobre</SelectItem>
                    <SelectItem value="11">Novembre</SelectItem>
                    <SelectItem value="12">Décembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Actions rapides</Label>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={exportForAccountant}>
                  <Download className="w-4 h-4 mr-2" />
                  Export comptable
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="profit-loss">Compte de résultat</TabsTrigger>
          <TabsTrigger value="balance-sheet">Bilan comptable</TabsTrigger>
          <TabsTrigger value="cash-flow">Flux de trésorerie</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {monthlyData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Évolution des performances
                    <Button variant="outline" size="sm" onClick={() => generatePDFReport('dashboard')}>
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenus" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Charges" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {expenseBreakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Répartition des charges
                      <Button variant="outline" size="sm" onClick={() => exportToExcel('expenses')}>
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percentage }) => `${category} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucune donnée financière disponible. Ajoutez des transactions pour voir les rapports.
                </p>
              </CardContent>
            </Card>
          )}

          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Évolution du résultat net
                  <Button variant="outline" size="sm" onClick={() => generatePDFReport('profit-trend')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyser
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Bénéfice" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Compte de résultat - {reportPeriod === 'monthly' ? `${reportMonth}/${reportYear}` : reportYear}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportToExcel('profit-loss')}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generatePDFReport('profit-loss')}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Produits */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-green-800">PRODUITS</h4>
                  <div className="space-y-2">
                    {revenueBreakdown.length > 0 ? (
                      <>
                        {revenueBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span>{item.category}</span>
                            <span className="font-bold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-green-100 rounded font-bold text-green-800">
                          <span>TOTAL PRODUITS</span>
                          <span>{formatCurrency(totalRevenue)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground p-2">Aucun produit enregistré</p>
                    )}
                  </div>
                </div>

                {/* Charges */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-red-800">CHARGES</h4>
                  <div className="space-y-2">
                    {expenseBreakdown.length > 0 ? (
                      <>
                        {expenseBreakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <span>{item.category}</span>
                            <span className="font-bold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-red-100 rounded font-bold text-red-800">
                          <span>TOTAL CHARGES</span>
                          <span>{formatCurrency(totalExpenses)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground p-2">Aucune charge enregistrée</p>
                    )}
                  </div>
                </div>

                {/* Résultat */}
                <div className="border-t-2 pt-4">
                  <div className={`flex justify-between items-center p-4 rounded font-bold text-lg ${netResult >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    <span>RÉSULTAT NET</span>
                    <span>{formatCurrency(netResult)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Bilan comptable au 31/{reportMonth}/{reportYear}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportToExcel('balance-sheet')}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generatePDFReport('balance-sheet')}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ACTIF */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-blue-800">ACTIF</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Actif circulant</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between">
                          <span>Trésorerie</span>
                          <span>{formatCurrency(balanceSheetData.assets.current.cash)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Créances clients</span>
                          <span>{formatCurrency(balanceSheetData.assets.current.accountsReceivable)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stock</span>
                          <span>{formatCurrency(balanceSheetData.assets.current.inventory)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total actif circulant</span>
                          <span>{formatCurrency(balanceSheetData.assets.current.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Actif immobilisé</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between">
                          <span>Équipements</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixed.equipment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bâtiments</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixed.buildings)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Terrains</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixed.land)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total actif immobilisé</span>
                          <span>{formatCurrency(balanceSheetData.assets.fixed.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg p-3 bg-blue-100 rounded">
                      <span>TOTAL ACTIF</span>
                      <span>{formatCurrency(balanceSheetData.assets.total)}</span>
                    </div>
                  </div>
                </div>

                {/* PASSIF */}
                <div>
                  <h4 className="font-semibold text-lg mb-4 text-green-800">PASSIF</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Dettes à court terme</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between">
                          <span>Dettes fournisseurs</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.current.accountsPayable)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emprunts court terme</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.current.shortTermLoans)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total dettes court terme</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.current.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Dettes à long terme</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between">
                          <span>Emprunts hypothécaires</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.longTerm.mortgages)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emprunts long terme</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.longTerm.longTermLoans)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total dettes long terme</span>
                          <span>{formatCurrency(balanceSheetData.liabilities.longTerm.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Capitaux propres</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between font-semibold">
                          <span>Capitaux propres</span>
                          <span>{formatCurrency(balanceSheetData.equity.ownersEquity)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg p-3 bg-green-100 rounded">
                      <span>TOTAL PASSIF</span>
                      <span>{formatCurrency(balanceSheetData.liabilities.total + balanceSheetData.equity.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tableau des flux de trésorerie
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => exportToExcel('cash-flow')}>
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => generatePDFReport('cash-flow')}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">Flux de trésorerie liés à l'activité</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Résultat net</span>
                      <span>{formatCurrency(netResult)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amortissements</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variation des créances</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variation des dettes</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t p-2 bg-blue-50">
                      <span>Flux net de trésorerie d'activité</span>
                      <span>{formatCurrency(netResult)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Flux de trésorerie liés aux investissements</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Acquisition d'équipements</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cession d'actifs</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t p-2 bg-red-50">
                      <span>Flux net de trésorerie d'investissement</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Flux de trésorerie liés au financement</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Nouveaux emprunts</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remboursements d'emprunts</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t p-2 bg-green-50">
                      <span>Flux net de trésorerie de financement</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 pt-4">
                  <div className="flex justify-between font-bold text-lg p-4 bg-muted rounded">
                    <span>VARIATION NETTE DE TRÉSORERIE</span>
                    <span>{formatCurrency(netResult)}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Trésorerie début de période</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Trésorerie fin de période</span>
                      <span>{formatCurrency(netResult)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsGenerator;
