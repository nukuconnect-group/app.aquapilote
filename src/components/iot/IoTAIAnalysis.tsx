import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Fish, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Droplets,
  Wind,
  ThermometerSun,
  RefreshCw
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useToast } from '@/components/ui/use-toast';

interface AIAnalysisData {
  unitId: string;
  fishCount: number;
  averageWeight: number;
  dailyGrowth: number;
  dailyMortality: number;
  healthScore: number;
  recommendations: Array<{
    type: 'feeding' | 'oxygenation' | 'water_renewal' | 'treatment';
    priority: 'high' | 'medium' | 'low';
    message: string;
  }>;
  lastUpdate: string;
}

const IoTAIAnalysis = () => {
  const { units, activeUnit } = useProductionUnits();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisData[]>([
    {
      unitId: 'GROSS001',
      fishCount: 12450,
      averageWeight: 285,
      dailyGrowth: 3.2,
      dailyMortality: 0.8,
      healthScore: 87,
      recommendations: [
        { type: 'feeding', priority: 'medium', message: 'Augmenter la ration alimentaire de 5% pour optimiser la croissance' },
        { type: 'oxygenation', priority: 'high', message: 'Améliorer l\'oxygénation durant les heures chaudes (14h-18h)' }
      ],
      lastUpdate: new Date().toISOString()
    },
    {
      unitId: 'TRANS001',
      fishCount: 8920,
      averageWeight: 145,
      dailyGrowth: 4.1,
      dailyMortality: 1.2,
      healthScore: 82,
      recommendations: [
        { type: 'water_renewal', priority: 'medium', message: 'Renouvellement d\'eau recommandé (20% du volume)' },
        { type: 'treatment', priority: 'low', message: 'Traitement préventif anti-parasitaire suggéré' }
      ],
      lastUpdate: new Date().toISOString()
    }
  ]);

  const runAIAnalysis = async (unitId?: string) => {
    setAnalyzing(true);
    
    // Simulation de l'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Analyse IA terminée",
      description: `Données actualisées pour ${unitId ? units.find(u => u.id === unitId)?.name : 'toutes les unités'}`,
    });
    
    setAnalyzing(false);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Fish className="w-4 h-4" />;
      case 'oxygenation': return <Wind className="w-4 h-4" />;
      case 'water_renewal': return <Droplets className="w-4 h-4" />;
      case 'treatment': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const currentAnalysis = analysisData.find(a => a.unitId === activeUnit?.id) || analysisData[0];

  return (
    <div className="space-y-6">
      {/* En-tête avec score de santé global */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              Analyse IA - {units.find(u => u.id === currentAnalysis.unitId)?.name}
            </CardTitle>
            <Button 
              onClick={() => runAIAnalysis(activeUnit?.id)}
              disabled={analyzing}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Analyse...' : 'Actualiser'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full ${getHealthScoreBg(currentAnalysis.healthScore)} flex items-center justify-center`}>
                <span className={`text-2xl font-bold ${getHealthScoreColor(currentAnalysis.healthScore)}`}>
                  {currentAnalysis.healthScore}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Score de Santé Global</h3>
                <p className="text-sm text-muted-foreground">
                  Basé sur 12 indicateurs clés
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-xs text-muted-foreground">
                Dernière analyse : {new Date(currentAnalysis.lastUpdate).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Fish className="w-5 h-5 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800">IoT + IA</Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.fishCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Poissons détectés</div>
            <div className="text-xs text-green-600 mt-1">Détection automatique</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">Estimé</Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.averageWeight} g</div>
            <div className="text-sm text-muted-foreground">Poids moyen</div>
            <div className="text-xs text-green-600 mt-1">+{currentAnalysis.dailyGrowth}% / jour</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800">IA</Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.dailyGrowth}%</div>
            <div className="text-sm text-muted-foreground">Croissance / jour</div>
            <div className="text-xs text-muted-foreground mt-1">Basé sur 7 derniers jours</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <Badge className={currentAnalysis.dailyMortality > 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                {currentAnalysis.dailyMortality > 1 ? 'Attention' : 'Normal'}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.dailyMortality}%</div>
            <div className="text-sm text-muted-foreground">Mortalité / jour</div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ {Math.round(currentAnalysis.fishCount * currentAnalysis.dailyMortality / 100)} sujets
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations intelligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Recommandations Intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentAnalysis.recommendations.map((rec, idx) => (
              <div 
                key={idx} 
                className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getRecommendationIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(rec.priority)}>
                        Priorité {rec.priority === 'high' ? 'élevée' : rec.priority === 'medium' ? 'moyenne' : 'basse'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{rec.message}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Appliquer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graphique de tendance santé */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du Score de Santé (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: 'Lun', score: 85 },
              { day: 'Mar', score: 84 },
              { day: 'Mer', score: 86 },
              { day: 'Jeu', score: 88 },
              { day: 'Ven', score: 87 },
              { day: 'Sam', score: 86 },
              { day: 'Dim', score: currentAnalysis.healthScore }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium">{item.day}</div>
                <Progress value={item.score} className="flex-1" />
                <div className={`w-12 text-sm font-bold text-right ${getHealthScoreColor(item.score)}`}>
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IoTAIAnalysis;
