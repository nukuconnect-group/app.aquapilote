
import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import UnitReportGenerator from './reports/UnitReportGenerator';

const ReportsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const reportTypes = [
    {
      id: 'production',
      title: 'Rapport de Production',
      description: 'Analyse détaillée de la production piscicole',
      icon: BarChart3,
      lastGenerated: '-',
      frequency: 'Hebdomadaire',
      status: 'ready'
    },
    {
      id: 'financial',
      title: 'Rapport Financier',
      description: 'Revenus, dépenses et bénéfices',
      icon: TrendingUp,
      lastGenerated: '-',
      frequency: 'Mensuel',
      status: 'ready'
    },
    {
      id: 'health',
      title: 'Rapport Sanitaire',
      description: 'État de santé des poissons et traitements',
      icon: PieChart,
      lastGenerated: '-',
      frequency: 'Bi-hebdomadaire',
      status: 'ready'
    },
    {
      id: 'quality',
      title: 'Qualité de l\'Eau',
      description: 'Paramètres physicochimiques de l\'eau',
      icon: FileText,
      lastGenerated: '-',
      frequency: 'Quotidien',
      status: 'ready'
    }
  ];

  const recentReports: { id: number; name: string; type: string; date: string; size: string; downloads: number }[] = [];

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
            <p className="text-indigo-100">Génération et export de rapports détaillés par unité</p>
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
              <p className="text-lg md:text-2xl font-bold">{recentReports.length}</p>
              <p className="text-xs text-muted-foreground">Rapports ce mois</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Download className="h-6 w-6 md:h-8 md:w-8 text-green-600 mr-2 md:mr-3" />
            <div>
              <p className="text-lg md:text-2xl font-bold">{recentReports.reduce((sum, r) => sum + r.downloads, 0)}</p>
              <p className="text-xs text-muted-foreground">Téléchargements</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4 md:p-6">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mr-2 md:mr-3" />
            <div>
              <p className="text-lg md:text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Rapports programmés</p>
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
                        <span>Dernière génération:</span>
                        <span>{report.lastGenerated}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Fréquence:</span>
                        <span>{report.frequency}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          disabled={report.status === 'processing'}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Générer {selectedFormat.toUpperCase()}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4" />
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
            <h3 className="text-lg font-medium">Rapports Récents</h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
          
          <Card>
            <CardContent className={recentReports.length === 0 ? "p-8" : "p-0"}>
              {recentReports.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Aucun rapport généré récemment</p>
                  <p className="text-sm mt-2">Les rapports que vous générez apparaîtront ici</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentReports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{report.name}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span>Type: {report.type}</span>
                              <span>Taille: {report.size}</span>
                              <span>Téléchargé {report.downloads} fois</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
