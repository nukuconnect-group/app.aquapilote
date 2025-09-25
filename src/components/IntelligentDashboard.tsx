import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Fish, Factory, Thermometer, Activity, TrendingUp, Settings, AlertTriangle, Clock, Heart, Egg, Scale } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import ProductionUnitSelector from './ProductionUnitSelector';
import AlertsPanel from './AlertsPanel';
const IntelligentDashboard = () => {
  const {
    activeUnit,
    getUnitInfrastructures,
    getUnitEquipment,
    getUnitCycles,
    getUnitFinancialData,
    getGlobalFinancialData
  } = useProductionUnits();
  const { formatCurrency } = useSettings();
  const [viewMode, setViewMode] = useState<'unit' | 'global'>('unit');
  const unitInfrastructures = activeUnit ? getUnitInfrastructures(activeUnit.id) : [];
  const unitEquipment = activeUnit ? getUnitEquipment(activeUnit.id) : [];
  const unitCycles = activeUnit ? getUnitCycles(activeUnit.id) : [];
  const unitFinancialData = activeUnit ? getUnitFinancialData(activeUnit.id) : null;
  const globalFinancialData = getGlobalFinancialData();
  const currentFinancialData = viewMode === 'global' ? globalFinancialData : unitFinancialData;
  const getUnitSpecificData = () => {
    if (!activeUnit) return {
      metrics: [],
      livestock: null
    };
    const baseMetrics = [{
      title: "Stock Actuel",
      value: activeUnit.currentStock.toLocaleString(),
      subtitle: `${(activeUnit.currentStock / activeUnit.capacity * 100).toFixed(1)}% de capacité`,
      icon: Fish,
      color: "aqua"
    }, {
      title: "Cycles Actifs",
      value: unitCycles.filter(c => c.status === 'active').length.toString(),
      subtitle: `${unitCycles.length} total`,
      icon: Activity,
      color: "green"
    }];

    // unit-specific data logic
    switch (activeUnit.type) {
      case 'ecloserie':
        return {
          // ecloserie data
          metrics: [...baseMetrics, {
            title: "Géniteurs Mâles",
            value: "45",
            subtitle: "Matures pour reproduction",
            icon: Fish,
            color: "blue"
          }, {
            title: "Géniteurs Femelles",
            value: "38",
            subtitle: "En période de ponte",
            icon: Heart,
            color: "pink"
          }, {
            title: "Taux de Fécondité",
            value: "89%",
            subtitle: "+3% vs cycle précédent",
            icon: Egg,
            color: "yellow"
          }, {
            title: "Alevins Produits",
            value: "125,000",
            subtitle: "Ce cycle",
            icon: Activity,
            color: "green"
          }],
          livestock: {
            geniteurs_males: 45,
            geniteurs_femelles: 38,
            alevins_total: 125000,
            larves_stade1: 45000,
            larves_stade2: 35000,
            larves_stade3: 25000,
            taux_fecondite: 89,
            taux_eclosion: 92,
            prochaine_eclosion: "2024-04-15"
          }
        };
      case 'transformation':
        return {
          metrics: [...baseMetrics, {
            title: "Poissons Transformés",
            value: "2,450 kg",
            subtitle: "Cette semaine",
            icon: Scale,
            color: "orange"
          }, {
            title: "Équipements Actifs",
            value: unitEquipment.filter(eq => eq.status === 'active').length.toString(),
            subtitle: `${unitEquipment.length} total`,
            icon: Factory,
            color: "purple"
          }, {
            title: "Rendement",
            value: "78%",
            subtitle: "Taux de découpe",
            icon: TrendingUp,
            color: "green"
          }],
          livestock: null
        };
      case 'conservation':
        return {
          metrics: [...baseMetrics, {
            title: "Chambres Froides",
            value: unitEquipment.filter(eq => eq.type.includes('chambre_froide')).length.toString(),
            subtitle: "Toutes opérationnelles",
            icon: Thermometer,
            color: "blue"
          }, {
            title: "Température Moy.",
            value: "-2.5°C",
            subtitle: "Dans les normes",
            icon: Thermometer,
            color: "cyan"
          }, {
            title: "Capacité Utilisée",
            value: "85%",
            subtitle: "1,700/2,000 kg",
            icon: Factory,
            color: "purple"
          }],
          livestock: null
        };
      case 'grossissement':
        return {
          metrics: [...baseMetrics, {
            title: "Croissance Moy.",
            value: "125g",
            subtitle: "Poids moyen actuel",
            icon: TrendingUp,
            color: "green"
          }, {
            title: "Mortalité",
            value: "2.1%",
            subtitle: "Taux acceptable",
            icon: Activity,
            color: "red"
          }],
          livestock: null
        };
      default:
        return {
          metrics: baseMetrics,
          livestock: null
        };
    }
  };
  const {
    metrics,
    livestock
  } = getUnitSpecificData();
  if (!activeUnit && viewMode === 'unit') {
    return <div className="space-y-6">
        {/* En-tête amélioré du tableau de bord */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg">
          <div className="p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Fish className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
                    Tableau de Bord Intelligent
                  </h1>
                  <p className="text-blue-100 text-base font-medium">
                    Vue adaptée à votre unité de production
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-blue-200 font-medium">Dernière mise à jour</p>
                  <p className="font-bold text-sm sm:text-base">Aujourd'hui, 14:30</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sélecteur d'unité intégré dans l'en-tête */}
          <div className="px-6 pb-6">
            <ProductionUnitSelector />
          </div>
        </div>

        <div className="text-center py-8 sm:py-12">
          <Fish className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Sélectionnez une unité de production pour voir ses données spécifiques
          </p>
        </div>
      </div>;
  }
  return <div className="space-y-4 sm:space-y-6">
      {/* En-tête amélioré du tableau de bord */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg">
        <div className="p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              
              <div>
                <h1 className="sm:text-3xl mb-2 tracking-tight text-xl font-extrabold">
                  Tableau de Bord Intelligent
                </h1>
                <p className="text-blue-100 font-medium text-sm">
                  Vue adaptée à votre unité de production
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-blue-200 font-medium">Dernière mise à jour</p>
                <p className="font-bold text-sm sm:text-base">Aujourd'hui, 14:30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sélecteur d'unité intégré dans l'en-tête */}
        <div className="px-6 pb-6">
          <ProductionUnitSelector />
        </div>
      </div>

      {/* Sélecteur de vue */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button variant={viewMode === 'unit' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('unit')} disabled={!activeUnit} className="text-xs sm:text-sm">
            Vue Unité
          </Button>
          <Button variant={viewMode === 'global' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('global')} className="text-xs sm:text-sm">
            Vue Globale
          </Button>
        </div>

        {viewMode === 'unit' && activeUnit && <Badge variant="secondary" className="text-xs">
            {activeUnit.name}
          </Badge>}
      </div>

      {/* Métriques dynamiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {viewMode === 'unit' ? metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return <Card key={index} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-aqua-600" />
                  </div>
                  <p className="text-base sm:text-xl font-bold truncate">{metric.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{metric.title}</p>
                  <p className="text-xs text-gray-500 truncate">{metric.subtitle}</p>
                </CardContent>
              </Card>;
      }) :
      // global metrics
      [{
        title: 'CA Total',
        value: formatCurrency(globalFinancialData.revenue),
        subtitle: 'Toutes unités',
        icon: TrendingUp
      }, {
        title: 'Charges',
        value: formatCurrency(globalFinancialData.expenses),
        subtitle: 'Total dépenses',
        icon: Activity
      }, {
        title: 'Bénéfice',
        value: formatCurrency(globalFinancialData.profit),
        subtitle: 'Résultat net',
        icon: Fish
      }, {
        title: 'Marge',
        value: `${(globalFinancialData.profit / globalFinancialData.revenue * 100).toFixed(1)}%`,
        subtitle: 'Rentabilité',
        icon: Factory
      }].map((metric, index) => {
        const IconComponent = metric.icon;
        return <Card key={index} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <p className="text-base sm:text-xl font-bold truncate">{metric.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{metric.title}</p>
                  <p className="text-xs text-gray-500 truncate">{metric.subtitle}</p>
                </CardContent>
              </Card>;
      })}
      </div>

      {/* Données spécifiques à l'écloserie */}
      {viewMode === 'unit' && activeUnit?.type === 'ecloserie' && livestock && <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">Cheptel - Écloserie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* livestock display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Géniteurs</h4>
                <p className="text-xs text-blue-600">♂ {livestock.geniteurs_males} | ♀ {livestock.geniteurs_femelles}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Production</h4>
                <p className="text-xs text-green-600">{livestock.alevins_total.toLocaleString()} alevins</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Performances</h4>
                <p className="text-xs text-yellow-600">Fécondité: {livestock.taux_fecondite}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Stades Larvaires</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Stade 1</span>
                  <div className="flex items-center gap-2">
                    <Progress value={60} className="w-16 h-2" />
                    <span className="text-xs">{livestock.larves_stade1.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Stade 2</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-16 h-2" />
                    <span className="text-xs">{livestock.larves_stade2.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Stade 3</span>
                  <div className="flex items-center gap-2">
                    <Progress value={30} className="w-16 h-2" />
                    <span className="text-xs">{livestock.larves_stade3.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Données financières */}
      {currentFinancialData && <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Évolution Financière - {viewMode === 'global' ? 'Toutes Unités' : activeUnit?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={currentFinancialData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus" />
                <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} name="Bénéfices" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>}

      {/* Onglets pour données spécifiques à l'unité */}
      {viewMode === 'unit' && activeUnit && <Tabs defaultValue="cycles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="equipment">Équipements</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructures</TabsTrigger>
          </TabsList>

          {/* tabs content */}
          <TabsContent value="cycles" className="space-y-4">
            <div className="grid gap-3 sm:gap-4">
              {unitCycles.length > 0 ? unitCycles.map(cycle => <Card key={cycle.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{cycle.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Démarré le {cycle.startDate}
                          </p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progression</span>
                              <span>{cycle.currentQuantity.toLocaleString()}/{cycle.targetQuantity.toLocaleString()}</span>
                            </div>
                            <Progress value={cycle.currentQuantity / cycle.targetQuantity * 100} className="h-2" />
                          </div>
                        </div>
                        <Badge variant={cycle.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                          {cycle.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>) : <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  <p className="text-sm">Aucun cycle actif</p>
                </div>}
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="grid gap-3 sm:gap-4">
              {unitEquipment.length > 0 ? unitEquipment.map(eq => <Card key={eq.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{eq.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 capitalize">
                            {eq.type.replace('_', ' ')}
                          </p>
                          {eq.specifications && <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(eq.specifications).slice(0, 3).map(([key, value]) => <span key={key} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs">
                                  {key}: {value}
                                </span>)}
                            </div>}
                        </div>
                        <Badge variant={eq.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                          {eq.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>) : <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  <p className="text-sm">Aucun équipement configuré</p>
                </div>}
            </div>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <div className="grid gap-3 sm:gap-4">
              {unitInfrastructures.length > 0 ? unitInfrastructures.map(infra => <Card key={infra.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base truncate">{infra.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Capacité: {infra.capacity.toLocaleString()}
                          </p>
                          {infra.specifications && <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(infra.specifications).slice(0, 3).map(([key, value]) => <span key={key} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs">
                                  {key}: {value}
                                </span>)}
                            </div>}
                        </div>
                        <Badge variant={infra.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                          {infra.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>) : <div className="text-center py-6 sm:py-8 text-gray-500">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  <p className="text-sm">Aucune infrastructure configurée</p>
                </div>}
            </div>
          </TabsContent>
        </Tabs>}

      {/* Panneau d'alertes déplacé en dernière position */}
      <AlertsPanel />
    </div>;
};
export default IntelligentDashboard;