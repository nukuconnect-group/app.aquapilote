import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Wifi, 
  Activity,
  Fish,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

interface IoTModeAnalysisProps {
  showDialog: boolean;
  onClose: () => void;
}

const IoTModeAnalysis: React.FC<IoTModeAnalysisProps> = ({ showDialog, onClose }) => {
  const { activeUnit } = useProductionUnits();

  // Données simulées provenant du module IoT
  const iotData = {
    fishCount: 12450,
    averageWeight: 285,
    dailyGrowth: 3.2,
    dailyMortality: 0.8,
    healthScore: 87,
    waterQuality: {
      pH: 7.2,
      oxygen: 6.8,
      temperature: 24.5,
      ammonia: 0.02
    },
    recommendations: [
      { type: 'prevention', message: 'Maintenir le niveau d\'oxygène actuel', priority: 'low' },
      { type: 'feeding', message: 'Ajuster la ration de 5% pour optimiser la croissance', priority: 'medium' },
      { type: 'monitoring', message: 'Surveiller la température en après-midi', priority: 'medium' }
    ]
  };

  return (
    <>
      <Button 
        onClick={() => {}}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Wifi className="w-4 h-4 mr-2" />
        Analyser avec IoT
      </Button>

      <Dialog open={showDialog} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              Analyse IoT + IA - {activeUnit?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Score de santé */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Score de Santé Global</div>
                    <div className="text-4xl font-bold text-green-600">{iotData.healthScore}/100</div>
                    <Badge className="mt-2 bg-green-100 text-green-800">Excellent état</Badge>
                  </div>
                  <Brain className="w-16 h-16 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Métriques principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <Fish className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">{iotData.fishCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Poissons</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Activity className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-2xl font-bold">{iotData.averageWeight}g</div>
                  <div className="text-xs text-muted-foreground">Poids moyen</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                  <div className="text-2xl font-bold">{iotData.dailyGrowth}%</div>
                  <div className="text-xs text-muted-foreground">Croissance/j</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mb-2" />
                  <div className="text-2xl font-bold">{iotData.dailyMortality}%</div>
                  <div className="text-xs text-muted-foreground">Mortalité/j</div>
                </CardContent>
              </Card>
            </div>

            {/* Qualité de l'eau */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Eau (Temps Réel)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">pH</div>
                    <div className="text-xl font-bold text-blue-600">{iotData.waterQuality.pH}</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                  <div className="text-center p-3 bg-cyan-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Oxygène</div>
                    <div className="text-xl font-bold text-cyan-600">{iotData.waterQuality.oxygen} mg/L</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Température</div>
                    <div className="text-xl font-bold text-orange-600">{iotData.waterQuality.temperature}°C</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Ammoniaque</div>
                    <div className="text-xl font-bold text-yellow-600">{iotData.waterQuality.ammonia} ppm</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Recommandations de Prévention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {iotData.recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 border rounded-lg ${
                        rec.priority === 'high' ? 'border-red-300 bg-red-50' :
                        rec.priority === 'medium' ? 'border-orange-300 bg-orange-50' :
                        'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {rec.type}
                          </Badge>
                          <p className="text-sm mt-2">{rec.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Fermer
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  // Enregistrer dans prophylaxie
                  onClose();
                }}
              >
                Enregistrer dans Prophylaxie
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IoTModeAnalysis;
