import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fish, Plus, TrendingUp, AlertTriangle, Eye, Scale } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import ProductionUnitSelector from './ProductionUnitSelector';
import FishControlFishing from './fish/FishControlFishing';
import { useSettings } from '@/contexts/SettingsContext';

const FishManagement = () => {
  const { activeUnit } = useProductionUnits();
  const { t } = useSettings();
  
  if (!activeUnit) {
    return (
      <div className="space-y-responsive">
        <div className="bg-gradient-aqua p-responsive rounded-xl text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-responsive">
            <div>
              <h2 className="text-responsive-title font-bold mb-2">Gestion du Cheptel</h2>
              <p className="text-primary-foreground/80 text-responsive">Suivi des poissons et performances zootechniques</p>
            </div>
          </div>
          <div className="mt-4">
            <ProductionUnitSelector />
          </div>
        </div>
        
        <div className="text-center py-12">
          <Fish className="icon-responsive-lg mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-responsive-subtitle font-semibold text-foreground mb-2">
            Aucune unité sélectionnée
          </h3>
          <p className="text-muted-foreground text-responsive">
            Sélectionnez une unité de production pour gérer son cheptel
          </p>
        </div>
      </div>
    );
  }

  const getUnitSpecificContent = () => {
    switch (activeUnit.type) {
      case 'ecloserie':
        return {
          title: 'Gestion du Cheptel - Écloserie',
          subtitle: 'Géniteurs et production d\'alevins',
          data: {
            geniteurs_males: 45,
            geniteurs_femelles: 38,
            alevins_produits: 125000,
            larves_stade1: 45000,
            larves_stade2: 35000,
            larves_stade3: 25000,
            taux_fecondite: 89,
            prochaine_ponte: '2024-04-15'
          }
        };
      case 'grossissement':
        return {
          title: 'Gestion du Cheptel - Grossissement',
          subtitle: 'Poissons en croissance',
          data: {
            juveniles: 25000,
            sub_adultes: 15000,
            adultes: 2000,
            poids_moyen: 125,
            taux_croissance: 8.5,
            taux_mortalite: 2.1,
            densite_population: 85
          }
        };
      case 'transformation':
        return {
          title: 'Gestion du Stock - Transformation',
          subtitle: 'Poissons à transformer',
          data: {
            poissons_entiers: 1500,
            poissons_transformes: 950,
            rendement_decoupage: 78,
            stock_produits_finis: 740,
            commandes_en_attente: 12
          }
        };
      case 'conservation':
        return {
          title: 'Gestion du Stock - Conservation',
          subtitle: 'Produits en stockage',
          data: {
            produits_frais: 850,
            produits_congeles: 1200,
            temperature_moyenne: -2.5,
            capacite_utilisee: 85,
            rotation_stock: 15
          }
        };
      default:
        return {
          title: `Gestion du Cheptel - ${activeUnit.name}`,
          subtitle: 'Suivi des stocks et populations',
          data: {}
        };
    }
  };

  const unitContent = getUnitSpecificContent();

  return (
    <div className="space-y-6">
      {/* En-tête spécifique à l'unité */}
      <div className="bg-gradient-to-r from-aqua-500 to-ocean-500 p-4 sm:p-6 text-white -mx-0 sm:-mx-4 lg:-mx-6 -mt-0 sm:-mt-4 lg:-mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{unitContent.title}</h2>
            <p className="text-aqua-100 text-sm sm:text-base">{unitContent.subtitle}</p>
            <div className="mt-2 flex flex-wrap items-center space-x-4 text-xs sm:text-sm">
              <span>Unité: {activeUnit.name}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {activeUnit.type.charAt(0).toUpperCase() + activeUnit.type.slice(1)}
              </Badge>
            </div>
          </div>
          <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau suivi
          </Button>
        </div>
        
        <div className="mt-4">
          <ProductionUnitSelector />
        </div>
      </div>

      {/* Métriques spécifiques à l'unité */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activeUnit.type === 'ecloserie' && <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.geniteurs_males}</p>
                <p className="text-sm text-gray-600">Géniteurs ♂</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-5 w-5 text-pink-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.geniteurs_femelles}</p>
                <p className="text-sm text-gray-600">Géniteurs ♀</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.taux_fecondite}%</p>
                <p className="text-sm text-gray-600">Taux fécondité</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-aqua-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.alevins_produits.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Alevins produits</p>
              </CardContent>
            </Card>
          </>}

        {activeUnit.type === 'grossissement' && <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.juveniles?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Juvéniles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.poids_moyen}g</p>
                <p className="text-sm text-gray-600">Poids moyen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.taux_mortalite}%</p>
                <p className="text-sm text-gray-600">Mortalité</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{unitContent.data.densite_population}%</p>
                <p className="text-sm text-gray-600">Densité</p>
              </CardContent>
            </Card>
          </>}

        {(activeUnit.type === 'transformation' || activeUnit.type === 'conservation') && <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Fish className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[0]}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[0]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[1]}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[1]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[2]}{activeUnit.type === 'conservation' ? '°C' : '%'}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[2]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{Object.values(unitContent.data)[3]}{activeUnit.type === 'conservation' ? '%' : ''}</p>
                <p className="text-sm text-gray-600">{Object.keys(unitContent.data)[3]?.replace('_', ' ')}</p>
              </CardContent>
            </Card>
          </>}
      </div>

      {/* Détails par onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            {activeUnit.type !== 'transformation' && activeUnit.type !== 'conservation' && (
              <TabsTrigger value="control-fishing">Pêche de contrôle</TabsTrigger>
            )}
            {activeUnit.type === 'transformation' && (
              <TabsTrigger value="batches">Lots transformés</TabsTrigger>
            )}
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">État du cheptel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(unitContent.data).slice(0, 4).map(([key, value]) => <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="font-semibold">
                        {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                      </span>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertes et recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeUnit.type === 'ecloserie' && <>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Taux de fécondité optimal</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Ponte prévue dans 5 jours</span>
                      </div>
                    </>}
                  {activeUnit.type === 'grossissement' && <>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Croissance dans la norme</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Surveiller la densité</span>
                      </div>
                    </>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {activeUnit.type !== 'transformation' && activeUnit.type !== 'conservation' && (
          <TabsContent value="control-fishing" className="space-y-4">
            <FishControlFishing 
              unitId={activeUnit.id}
              unitName={activeUnit.name}
            />
          </TabsContent>
        )}

        {activeUnit.type === 'transformation' && (
          <TabsContent value="batches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des lots transformés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Suivez et gérez les lots de poissons transformés par espèce et type de transformation
                  </p>
                  {/* Example batch data */}
                  <div className="grid gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">Lot #2024-001</h4>
                          <p className="text-sm text-muted-foreground">Tilapia - Filet</p>
                        </div>
                        <Badge variant="outline">En cours</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Poids initial</p>
                          <p className="font-medium">500 kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Poids transformé</p>
                          <p className="font-medium">380 kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rendement</p>
                          <p className="font-medium">76%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Détails du cheptel - {activeUnit.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Données détaillées à venir pour l'unité {activeUnit.type}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des évolutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Historique des données pour l'unité {activeUnit.name}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FishManagement;
