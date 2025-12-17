import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp, Filter, FileSpreadsheet, File } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import UnitReportGenerator from './reports/UnitReportGenerator';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/clientConfig';
import { 
  exportToCSV, 
  exportToExcel, 
  exportToWord, 
  exportToPDF,
  getReportFilename,
  type ReportData 
} from '@/lib/reportExportUtils';
import { toast } from 'sonner';

const ReportsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  const { units, transactions, purchases, getGlobalFinancialData } = useProductionUnits();
  const { formatCurrency } = useSettings();
  const { user } = useAuth();

  // Données réelles
  const [productionCycles, setProductionCycles] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<any[]>([]);
  const [generatedReports, setGeneratedReports] = useState<any[]>([]);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const { data: cycles } = await supabase
          .from('production_cycles')
          .select('*')
          .order('created_at', { ascending: false });
        if (cycles) setProductionCycles(cycles);

        const { data: health } = await supabase
          .from('health_records')
          .select('*')
          .order('date', { ascending: false })
          .limit(100);
        if (health) setHealthRecords(health);

        const { data: feeding } = await supabase
          .from('feeding_records')
          .select('*')
          .order('date', { ascending: false })
          .limit(100);
        if (feeding) setFeedingRecords(feeding);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      }
    };

    fetchData();
  }, [user?.id]);

  const reportTypes = [
    {
      id: 'production',
      title: 'Rapport de Production',
      description: 'Analyse détaillée de la production piscicole',
      icon: BarChart3,
      frequency: 'Hebdomadaire',
      status: 'ready',
      dataCount: productionCycles.length
    },
    {
      id: 'financial',
      title: 'Rapport Financier',
      description: 'Revenus, dépenses et bénéfices',
      icon: TrendingUp,
      frequency: 'Mensuel',
      status: 'ready',
      dataCount: transactions.length
    },
    {
      id: 'health',
      title: 'Rapport Sanitaire',
      description: 'État de santé des poissons et traitements',
      icon: PieChart,
      frequency: 'Bi-hebdomadaire',
      status: 'ready',
      dataCount: healthRecords.length
    },
    {
      id: 'quality',
      title: 'Qualité de l\'Eau',
      description: 'Paramètres physicochimiques de l\'eau',
      icon: FileText,
      frequency: 'Quotidien',
      status: 'ready',
      dataCount: healthRecords.length
    }
  ];

  const getPeriodLabel = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'week':
        return `Semaine du ${new Date(now.setDate(now.getDate() - 7)).toLocaleDateString('fr-FR')} au ${new Date().toLocaleDateString('fr-FR')}`;
      case 'month':
        return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `T${quarter} ${now.getFullYear()}`;
      case 'year':
        return now.getFullYear().toString();
      default:
        return 'Période personnalisée';
    }
  };

  const buildReportData = (reportId: string): ReportData => {
    const financialData = getGlobalFinancialData();
    const period = getPeriodLabel();
    const generatedAt = new Date().toLocaleString('fr-FR');

    const sections: ReportData['sections'] = [];

    switch (reportId) {
      case 'production':
        sections.push({
          title: 'Résumé de Production',
          type: 'summary',
          summary: [
            { label: 'Cycles actifs', value: productionCycles.filter(c => c.status === 'active').length },
            { label: 'Cycles terminés', value: productionCycles.filter(c => c.status === 'completed').length },
            { label: 'Total unités', value: units.length },
            { label: 'Distributions d\'aliment', value: feedingRecords.length }
          ]
        });
        if (productionCycles.length > 0) {
          sections.push({
            title: 'Détail des Cycles de Production',
            type: 'table',
            headers: ['Nom', 'Unité', 'Espèce', 'Statut', 'Date début', 'Quantité actuelle', 'Objectif'],
            rows: productionCycles.map(c => [
              c.name,
              c.unit_name || '-',
              c.species || '-',
              c.status === 'active' ? 'Actif' : 'Terminé',
              c.start_date,
              c.current_quantity?.toLocaleString('fr-FR') || '0',
              c.target_quantity?.toLocaleString('fr-FR') || '0'
            ])
          });
        }
        break;

      case 'financial':
        sections.push({
          title: 'Résumé Financier',
          type: 'summary',
          summary: [
            { label: 'Revenus totaux', value: formatCurrency(financialData.revenue) },
            { label: 'Dépenses totales', value: formatCurrency(financialData.expenses) },
            { label: 'Bénéfice net', value: formatCurrency(financialData.profit) },
            { label: 'Marge', value: financialData.revenue ? `${((financialData.profit / financialData.revenue) * 100).toFixed(1)}%` : '0%' }
          ]
        });
        if (transactions.length > 0) {
          const revenues = transactions.filter(t => t.type === 'revenue');
          const expenses = transactions.filter(t => t.type === 'expense');
          
          sections.push({
            title: 'Revenus',
            type: 'table',
            headers: ['Date', 'Catégorie', 'Description', 'Montant (F CFA)'],
            rows: revenues.slice(0, 20).map(t => [
              t.date,
              t.category,
              t.description || '-',
              t.amount.toLocaleString('fr-FR')
            ])
          });

          sections.push({
            title: 'Dépenses',
            type: 'table',
            headers: ['Date', 'Catégorie', 'Description', 'Montant (F CFA)'],
            rows: expenses.slice(0, 20).map(t => [
              t.date,
              t.category,
              t.description || '-',
              t.amount.toLocaleString('fr-FR')
            ])
          });
        }
        break;

      case 'health':
        if (healthRecords.length > 0) {
          const avgTemp = healthRecords.reduce((sum, h) => sum + (h.temperature || 0), 0) / healthRecords.length;
          const avgPh = healthRecords.reduce((sum, h) => sum + (h.ph || 0), 0) / healthRecords.length;
          const avgOxygen = healthRecords.reduce((sum, h) => sum + (h.oxygen || 0), 0) / healthRecords.length;
          const totalMortality = healthRecords.reduce((sum, h) => sum + (h.mortality || 0), 0);

          sections.push({
            title: 'Indicateurs Sanitaires',
            type: 'summary',
            summary: [
              { label: 'Température moyenne', value: `${avgTemp.toFixed(1)}°C` },
              { label: 'pH moyen', value: avgPh.toFixed(2) },
              { label: 'Oxygène moyen', value: `${avgOxygen.toFixed(1)} mg/L` },
              { label: 'Mortalité totale', value: totalMortality }
            ]
          });

          sections.push({
            title: 'Historique Sanitaire',
            type: 'table',
            headers: ['Date', 'Température', 'pH', 'Oxygène', 'Mortalité'],
            rows: healthRecords.slice(0, 30).map(h => [
              h.date,
              h.temperature ? `${h.temperature.toFixed(1)}°C` : '-',
              h.ph?.toFixed(2) || '-',
              h.oxygen ? `${h.oxygen.toFixed(1)} mg/L` : '-',
              h.mortality || 0
            ])
          });
        } else {
          sections.push({
            title: 'Indicateurs Sanitaires',
            type: 'summary',
            summary: [{ label: 'Statut', value: 'Aucune donnée sanitaire disponible' }]
          });
        }
        break;

      case 'quality':
        if (healthRecords.length > 0) {
          sections.push({
            title: 'Qualité de l\'Eau',
            type: 'table',
            headers: ['Date', 'Température (°C)', 'pH', 'Oxygène (mg/L)'],
            rows: healthRecords.slice(0, 50).map(h => [
              h.date,
              h.temperature?.toFixed(1) || '-',
              h.ph?.toFixed(2) || '-',
              h.oxygen?.toFixed(1) || '-'
            ])
          });
        } else {
          sections.push({
            title: 'Qualité de l\'Eau',
            type: 'summary',
            summary: [{ label: 'Statut', value: 'Aucune mesure de qualité d\'eau disponible' }]
          });
        }
        break;
    }

    return {
      title: reportTypes.find(r => r.id === reportId)?.title || 'Rapport',
      period,
      generatedAt,
      sections
    };
  };

  const handleGenerateReport = (reportId: string, format: string) => {
    setIsGenerating(reportId);

    try {
      const data = buildReportData(reportId);
      const filename = getReportFilename(reportId);

      switch (format) {
        case 'pdf':
          exportToPDF(data, filename);
          break;
        case 'excel':
          exportToExcel(data, filename);
          break;
        case 'csv':
          exportToCSV(data, filename);
          break;
        case 'word':
          exportToWord(data, filename);
          break;
      }

      // Ajouter à l'historique
      const newReport = {
        id: Date.now(),
        name: `${data.title} - ${data.period}`,
        type: format.toUpperCase(),
        date: new Date().toLocaleDateString('fr-FR'),
        size: '~50 KB',
        downloads: 1
      };
      setGeneratedReports(prev => [newReport, ...prev].slice(0, 20));

      toast.success(`${data.title} généré en ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Prêt';
      case 'processing': return 'En cours';
      case 'error': return 'Erreur';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Rapports & Analyses</h2>
            <p className="text-indigo-100">Génération et export de rapports détaillés - Données réelles</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-24 bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mr-2 md:mr-3" />
            <div>
              <p className="text-lg md:text-2xl font-bold">{generatedReports.length}</p>
              <p className="text-xs text-muted-foreground">Rapports générés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Download className="h-6 w-6 md:h-8 md:w-8 text-green-600 mr-2 md:mr-3" />
            <div>
              <p className="text-lg md:text-2xl font-bold">{generatedReports.reduce((sum, r) => sum + r.downloads, 0)}</p>
              <p className="text-xs text-muted-foreground">Téléchargements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mr-2 md:mr-3" />
            <div>
              <p className="text-lg md:text-2xl font-bold">{productionCycles.length}</p>
              <p className="text-xs text-muted-foreground">Cycles actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mr-2 md:mr-3" />
            <div>
              <p className="text-lg md:text-2xl font-bold">{reportTypes.length}</p>
              <p className="text-xs text-muted-foreground">Types de rapports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Générer</TabsTrigger>
          <TabsTrigger value="units">Par Unité</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="scheduled">Programmés</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <CardDescription>{report.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Données disponibles:</span>
                        <span>{report.dataCount} enregistrement(s)</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Fréquence:</span>
                        <span>{report.frequency}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(report.id, selectedFormat)}
                          disabled={isGenerating === report.id}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {selectedFormat.toUpperCase()}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGenerateReport(report.id, 'excel')}
                          disabled={isGenerating === report.id}
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGenerateReport(report.id, 'word')}
                          disabled={isGenerating === report.id}
                        >
                          <File className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <UnitReportGenerator />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-medium">Rapports Générés</h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
          
          <Card>
            <CardContent className={generatedReports.length === 0 ? "p-8" : "p-0"}>
              {generatedReports.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Aucun rapport généré</p>
                  <p className="text-sm mt-2">Les rapports que vous générez apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y">
                  {generatedReports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{report.name}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span>Format: {report.type}</span>
                              <span>Taille: {report.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports Programmés</CardTitle>
              <CardDescription>Configuration des générations automatiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>Programmation automatique des rapports en cours de développement</p>
                <p className="text-sm mt-2">Cette fonctionnalité permettra de planifier la génération automatique de rapports</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
