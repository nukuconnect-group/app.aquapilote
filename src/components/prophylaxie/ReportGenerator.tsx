import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download,
  FileSpreadsheet,
  Calendar,
  Building2
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useToast } from '@/components/ui/use-toast';

const ReportGenerator = () => {
  const { units, activeUnit } = useProductionUnits();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generatePDFReport = async (type: 'farm' | 'unit') => {
    setGenerating(true);
    
    // Simulation de la génération
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Rapport généré",
      description: `Le rapport ${type === 'farm' ? 'général de la ferme' : 'détaillé du bassin'} a été créé avec succès`,
    });
    
    setGenerating(false);
  };

  const generateExcelReport = async (type: 'farm' | 'unit') => {
    setGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Export Excel généré",
      description: `Les données ${type === 'farm' ? 'de la ferme' : 'du bassin'} ont été exportées`,
    });
    
    setGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Génération de Rapports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rapport général ferme */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-semibold">Rapport Général de la Ferme</h4>
                  <p className="text-sm text-muted-foreground">
                    Vue d'ensemble de toutes les unités de production
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-3">
              Inclut : Données IoT, analyses caméra, croissance, mortalité, interventions
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => generatePDFReport('farm')}
                disabled={generating}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Générer PDF
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => generateExcelReport('farm')}
                disabled={generating}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>

          {/* Rapport détaillé par bassin */}
          <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold">Rapport Détaillé par Bassin</h4>
                  <p className="text-sm text-muted-foreground">
                    Historique complet : {activeUnit?.name || 'Sélectionner un bassin'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Historique croissance</span>
                <Badge className="bg-green-100 text-green-800">30 jours</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Données mortalité</span>
                <Badge className="bg-blue-100 text-blue-800">Complet</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Maladies détectées</span>
                <Badge className="bg-orange-100 text-orange-800">3 alertes</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Interventions</span>
                <Badge className="bg-purple-100 text-purple-800">12 actions</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => generatePDFReport('unit')}
                disabled={generating || !activeUnit}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Générer PDF
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => generateExcelReport('unit')}
                disabled={generating || !activeUnit}
                className="flex-1"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>

          {/* Info sur le contenu des rapports */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>Contenu des rapports :</strong>
                <ul className="mt-1 space-y-1 ml-4 list-disc">
                  <li>Synthèse des données IoT et capteurs</li>
                  <li>Résultats des analyses caméra</li>
                  <li>Évolution de la croissance et mortalité</li>
                  <li>Maladies détectées et traitements appliqués</li>
                  <li>Recommandations et actions préventives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;
