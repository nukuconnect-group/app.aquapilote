
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useLogs } from '@/contexts/LogsContext';

const ReportsGenerator = () => {
  const { addLog } = useLogs();
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportYear, setReportYear] = useState('2024');
  const [reportMonth, setReportMonth] = useState('01');

  // Données d'exemple pour les rapports
  const monthlyData = [
    { month: 'Jan', revenue: 12500, expenses: 8900, profit: 3600 },
    { month: 'Fév', revenue: 14200, expenses: 9500, profit: 4700 },
    { month: 'Mar', revenue: 13800, expenses: 9200, profit: 4600 },
    { month: 'Avr', revenue: 15100, expenses: 10200, profit: 4900 },
    { month: 'Mai', revenue: 16300, expenses: 11100, profit: 5200 },
    { month: 'Jun', revenue: 15800, expenses: 10600, profit: 5200 }
  ];

  const quarterlyData = [
    { quarter: 'Q1 2024', revenue: 40500, expenses: 27600, profit: 12900 },
    { quarter: 'Q2 2024', revenue: 47200, expenses: 31900, profit: 15300 },
    { quarter: 'Q3 2023', revenue: 44800, expenses: 30200, profit: 14600 },
    { quarter: 'Q4 2023', revenue: 48900, expenses: 33100, profit: 15800 }
  ];

  const expenseBreakdown = [
    { category: 'Alimentation', amount: 4500, percentage: 40, color: '#8884d8' },
    { category: 'Personnel', amount: 3600, percentage: 32, color: '#82ca9d' },
    { category: 'Maintenance', amount: 1800, percentage: 16, color: '#ffc658' },
    { category: 'Énergie', amount: 900, percentage: 8, color: '#ff7300' },
    { category: 'Autres', amount: 450, percentage: 4, color: '#00C49F' }
  ];

  const revenueBreakdown = [
    { category: 'Vente poissons adultes', amount: 8500, percentage: 60, color: '#8884d8' },
    { category: 'Vente alevins', amount: 4250, percentage: 30, color: '#82ca9d' },
    { category: 'Services', amount: 1275, percentage: 9, color: '#ffc658' },
    { category: 'Autres', amount: 142, percentage: 1, color: '#ff7300' }
  ];

  const balanceSheetData = {
    assets: {
      current: {
        cash: 15420,
        accountsReceivable: 4300,
        inventory: 8900,
        total: 28620
      },
      fixed: {
        equipment: 45000,
        buildings: 85000,
        land: 35000,
        total: 165000
      },
      total: 193620
    },
    liabilities: {
      current: {
        accountsPayable: 3200,
        shortTermLoans: 8000,
        total: 11200
      },
      longTerm: {
        mortgages: 75000,
        longTermLoans: 25000,
        total: 100000
      },
      total: 111200
    },
    equity: {
      ownersEquity: 82420,
      total: 82420
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

    // Simulation de génération PDF
    const filename = `rapport_${reportType}_${reportPeriod}_${reportYear}${reportMonth ? '_' + reportMonth : ''}.pdf`;
    
    addLog('Rapport généré', 'Comptabilité', `Rapport ${reportType} généré: ${filename}`, 'success');
    
    // Ici, dans une vraie application, on générerait le PDF
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
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
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
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenus" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Charges" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

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
                  <Tooltip />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Bénéfice" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
                    {revenueBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span>{item.category}</span>
                        <span className="font-bold">€{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded font-bold text-green-800">
                      <span>TOTAL PRODUITS</span>
                      <span>€{revenueBreakdown.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Charges */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-red-800">CHARGES</h4>
                  <div className="space-y-2">
                    {expenseBreakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span>{item.category}</span>
                        <span className="font-bold">€{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-red-100 rounded font-bold text-red-800">
                      <span>TOTAL CHARGES</span>
                      <span>€{expenseBreakdown.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Résultat */}
                <div className="border-t-2 pt-4">
                  <div className="flex justify-between items-center p-4 bg-blue-100 rounded font-bold text-blue-800 text-lg">
                    <span>RÉSULTAT NET</span>
                    <span>€{(revenueBreakdown.reduce((sum, item) => sum + item.amount, 0) - expenseBreakdown.reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}</span>
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
                          <span>€{balanceSheetData.assets.current.cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Créances clients</span>
                          <span>€{balanceSheetData.assets.current.accountsReceivable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stock</span>
                          <span>€{balanceSheetData.assets.current.inventory.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total actif circulant</span>
                          <span>€{balanceSheetData.assets.current.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Actif immobilisé</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between">
                          <span>Équipements</span>
                          <span>€{balanceSheetData.assets.fixed.equipment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bâtiments</span>
                          <span>€{balanceSheetData.assets.fixed.buildings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Terrains</span>
                          <span>€{balanceSheetData.assets.fixed.land.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total actif immobilisé</span>
                          <span>€{balanceSheetData.assets.fixed.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg p-3 bg-blue-100 rounded">
                      <span>TOTAL ACTIF</span>
                      <span>€{balanceSheetData.assets.total.toLocaleString()}</span>
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
                          <span>€{balanceSheetData.liabilities.current.accountsPayable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emprunts court terme</span>
                          <span>€{balanceSheetData.liabilities.current.shortTermLoans.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total dettes court terme</span>
                          <span>€{balanceSheetData.liabilities.current.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Dettes à long terme</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between">
                          <span>Emprunts hypothécaires</span>
                          <span>€{balanceSheetData.liabilities.longTerm.mortgages.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Emprunts long terme</span>
                          <span>€{balanceSheetData.liabilities.longTerm.longTermLoans.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total dettes long terme</span>
                          <span>€{balanceSheetData.liabilities.longTerm.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Capitaux propres</h5>
                      <div className="space-y-1 ml-4">
                        <div className="flex justify-between font-semibold">
                          <span>Capitaux propres</span>
                          <span>€{balanceSheetData.equity.ownersEquity.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg p-3 bg-green-100 rounded">
                      <span>TOTAL PASSIF</span>
                      <span>€{(balanceSheetData.liabilities.total + balanceSheetData.equity.total).toLocaleString()}</span>
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
                      <span>€3,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amortissements</span>
                      <span>€1,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variation des créances</span>
                      <span>€-500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variation des dettes</span>
                      <span>€300</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t p-2 bg-blue-50">
                      <span>Flux net de trésorerie d'activité</span>
                      <span>€4,600</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Flux de trésorerie liés aux investissements</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Acquisition d'équipements</span>
                      <span>€-2,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cession d'actifs</span>
                      <span>€800</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t p-2 bg-red-50">
                      <span>Flux net de trésorerie d'investissement</span>
                      <span>€-1,700</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3">Flux de trésorerie liés au financement</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Nouveaux emprunts</span>
                      <span>€5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remboursements d'emprunts</span>
                      <span>€-3,200</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t p-2 bg-green-50">
                      <span>Flux net de trésorerie de financement</span>
                      <span>€1,800</span>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 pt-4">
                  <div className="flex justify-between font-bold text-lg p-4 bg-gray-100 rounded">
                    <span>VARIATION NETTE DE TRÉSORERIE</span>
                    <span>€4,700</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Trésorerie début de période</span>
                      <span>€10,720</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Trésorerie fin de période</span>
                      <span>€15,420</span>
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
