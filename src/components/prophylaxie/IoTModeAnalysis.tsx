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
  Brain,
  Droplets,
  Wind,
  ThermometerSun
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useIoT } from '@/contexts/IoTContext';
import { analyzeWaterQuality } from '@/utils/waterQualityAnalysis';

interface IoTModeAnalysisProps {
  showDialog: boolean;
  onClose: () => void;
}

const IoTModeAnalysis: React.FC<IoTModeAnalysisProps> = ({ showDialog, onClose }) => {
  const { activeUnit } = useProductionUnits();
  const { getBasinReadings, getUnitBasins } = useIoT();

  // Récupérer les données réelles des capteurs IoT
  const basins = activeUnit ? getUnitBasins(activeUnit.id) : [];
  const firstBasin = basins[0];
  const readings = firstBasin ? getBasinReadings(firstBasin.id) : [];
  
  const waterParams = {
    temperature: readings.find(r => r.sensorType === 'temperature')?.value || 25,
    pH: readings.find(r => r.sensorType === 'ph')?.value || 7.5,
    oxygen: readings.find(r => r.sensorType === 'oxygen')?.value || 6.5,
    ammonia: 0.03,
  };

  // Données simulées pour le poisson (à remplacer par de vraies données)
  const fishCount = 12450;
  const averageWeight = 285;
  const basinVolume = 50;
  const dailyGrowth = 2.5; // % de croissance quotidienne estimée
  const dailyMortality = 0.1; // % de mortalité quotidienne estimée

  // Générer les recommandations
  const temp = waterParams.temperature;
  const ph = waterParams.pH;
  const oxygen = waterParams.oxygen;
  const ammonia = waterParams.ammonia;
  const pondVolume = basinVolume;

  // Analyser la qualité de l'eau et générer les recommandations
  const analysis = analyzeWaterQuality(
    temp, 
    ph, 
    oxygen, 
    ammonia, 
    fishCount, 
    pondVolume, 
    averageWeight,
    'grossissement',
    new Date()
  );
  
  const recommendations = analysis.recommendations;
  const healthScore = analysis.healthScore;

  const getHealthStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent état', color: 'text-green-600', bg: 'bg-green-100', border: 'border-l-green-500' };
    if (score >= 70) return { label: 'Bon état', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-l-blue-500' };
    if (score >= 50) return { label: 'État moyen', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-l-orange-500' };
    return { label: 'État critique', color: 'text-red-600', bg: 'bg-red-100', border: 'border-l-red-500' };
  };

  const status = getHealthStatus(healthScore);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white border-red-600';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getIcon = (parameter: string) => {
    const param = parameter.toLowerCase();
    if (param.includes('oxygène')) return <Wind className="w-4 h-4" />;
    if (param.includes('température')) return <ThermometerSun className="w-4 h-4" />;
    if (param.includes('ph')) return <Activity className="w-4 h-4" />;
    if (param.includes('densité')) return <Fish className="w-4 h-4" />;
    if (param.includes('ammoniac')) return <Droplets className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
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
                    <div className="text-4xl font-bold text-green-600">{healthScore}/100</div>
                    <Badge className={`mt-2 ${status.bg} ${status.color}`}>{status.label}</Badge>
                  </div>
                  <Brain className="w-16 h-16 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Métriques principales */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Fish className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-2" />
                  <div className="text-lg sm:text-2xl font-bold truncate">{fishCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Poissons</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">{averageWeight}g</div>
                  <div className="text-xs text-muted-foreground">Poids moyen</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">{dailyGrowth}%</div>
                  <div className="text-xs text-muted-foreground">Croissance/j</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 sm:p-4">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">{dailyMortality}%</div>
                  <div className="text-xs text-muted-foreground">Mortalité/j</div>
                </CardContent>
              </Card>
            </div>

            {/* Qualité de l'eau */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">Paramètres Eau (Temps Réel)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">pH</div>
                    <div className="text-base sm:text-xl font-bold text-blue-600">{waterParams.pH}</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-cyan-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Oxygène</div>
                    <div className="text-base sm:text-xl font-bold text-cyan-600 truncate">{waterParams.oxygen} mg/L</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Température</div>
                    <div className="text-base sm:text-xl font-bold text-orange-600">{waterParams.temperature}°C</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Ammoniaque</div>
                    <div className="text-base sm:text-xl font-bold text-yellow-600 truncate">{waterParams.ammonia} ppm</div>
                    <Badge className="mt-1 bg-green-100 text-green-800 text-xs">Optimal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="truncate">Recommandations de Prévention</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 sm:p-3 border rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getIcon(rec.parameter)}</div>
                        <div className="flex-1 min-w-0">
                          <Badge className={`${getPriorityColor(rec.priority)} text-xs mb-2`}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <p className="text-xs sm:text-sm mt-2 font-medium break-words">{rec.parameter}: {rec.action}</p>
                          <p className="text-xs text-muted-foreground mt-1 break-words"><strong>Impact santé:</strong> {rec.healthImpact}</p>
                          <p className="text-xs text-muted-foreground mt-1"><strong>Délai:</strong> {rec.timeline}</p>
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
