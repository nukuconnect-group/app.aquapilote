import React, { useState, useCallback, useEffect } from 'react';
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
import { useSettings } from '@/contexts/SettingsContext';
import { useIoT } from '@/contexts/IoTContext';
import { analyzeWaterQuality, WaterQualityAnalysis, WaterQualityRecommendation } from '@/utils/waterQualityAnalysis';

interface AIAnalysisData {
  unitId: string;
  fishCount: number;
  averageWeight: number;
  dailyGrowth: number;
  dailyMortality: number;
  healthScore: number;
  recommendations: WaterQualityRecommendation[];
  lastUpdate: string;
}

const IoTAIAnalysis = () => {
  const { units, activeUnit } = useProductionUnits();
  const { toast } = useToast();
  const { t, formatCurrency } = useSettings();
  const { getBasinReadings, getUnitBasins } = useIoT();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Générer l'analyse basée sur les données IoT réelles
  const generateAnalysis = useCallback(() => {
    if (!units || units.length === 0) {
      setIsInitialized(true);
      return;
    }
    const analyses: AIAnalysisData[] = units.map(unit => {
      const basins = getUnitBasins(unit.id);
      
      // Données simulées pour le poisson (à remplacer par de vraies données)
      const fishCount = Math.floor(Math.random() * 5000) + 8000;
      const averageWeight = Math.floor(Math.random() * 150) + 150;
      const basinVolume = 50; // Volume en m³ (à adapter selon vos données)
      
      // Récupérer les paramètres d'eau du premier bassin
      const firstBasin = basins[0];
      const readings = firstBasin ? getBasinReadings(firstBasin.id) : [];
      
      const latestReadings = {
        temperature: readings.find(r => r.sensorType === 'temperature')?.value || 25,
        pH: readings.find(r => r.sensorType === 'ph')?.value || 7.5,
        oxygen: readings.find(r => r.sensorType === 'oxygen')?.value || 6.5,
        ammonia: 0.03, // Pas encore disponible dans les capteurs IoT
      };

      // Générer les recommandations basées sur l'analyse
      const temp = latestReadings.temperature;
      const ph = latestReadings.pH;
      const oxygen = latestReadings.oxygen;
      const ammonia = latestReadings.ammonia || 0;

      const analysis = analyzeWaterQuality(
        temp, ph, oxygen, ammonia, fishCount, basinVolume, averageWeight, unit.type
      );
      const recommendations = analysis.recommendations;

      // Calculer le score de santé basé sur les recommandations
      const criticalCount = recommendations.filter(r => r.priority === 'high' && r.status === 'critical').length;
      const highCount = recommendations.filter(r => r.priority === 'high').length;
      const mediumCount = recommendations.filter(r => r.priority === 'medium').length;
      
      let healthScore = analysis.healthScore;

      return {
        unitId: unit.id,
        fishCount,
        averageWeight,
        dailyGrowth: Math.random() * 2 + 2.5,
        dailyMortality: Math.random() * 1 + 0.5,
        healthScore,
        recommendations,
        lastUpdate: new Date().toISOString()
      };
    });

    setAnalysisData(analyses);
    setIsInitialized(true);
  }, [units, getBasinReadings, getUnitBasins]);

  const runAIAnalysis = async (unitId?: string) => {
    setAnalyzing(true);
    
    // Générer l'analyse
    await new Promise(resolve => setTimeout(resolve, 1500));
    generateAnalysis();
    
    toast({
      title: t('success'),
      description: `Analyse complète générée pour ${unitId ? units.find(u => u.id === unitId)?.name : 'toutes les unités'}`,
    });
    
    setAnalyzing(false);
  };

  // Générer l'analyse initiale
  useEffect(() => {
    if (units && units.length > 0 && !isInitialized) {
      generateAnalysis();
    }
  }, [units, generateAnalysis, isInitialized]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-destructive';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-950/20';
    if (score >= 60) return 'bg-orange-100 dark:bg-orange-950/20';
    return 'bg-destructive/10';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground border-destructive';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-orange-100 dark:bg-orange-950/20 text-orange-800 dark:text-orange-400 border-orange-300 dark:border-orange-900';
      case 'low': return 'bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-900';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityText = (priority: string) => {
    const priorities = {
      critical: 'CRITIQUE',
      high: t('critical'),
      medium: t('warning'),
      low: t('info')
    };
    return priorities[priority] || priority;
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Fish className="w-4 h-4" />;
      case 'oxygenation': return <Wind className="w-4 h-4" />;
      case 'water_renewal': return <Droplets className="w-4 h-4" />;
      case 'treatment': return <Activity className="w-4 h-4" />;
      case 'temperature': return <ThermometerSun className="w-4 h-4" />;
      case 'ph_adjustment': return <Activity className="w-4 h-4" />;
      case 'density': return <Fish className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const currentAnalysis = analysisData.find(a => a.unitId === activeUnit?.id) || analysisData[0];

  if (!isInitialized || !currentAnalysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec score de santé global */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              {t('recommendations')} IA - {units.find(u => u.id === currentAnalysis.unitId)?.name}
            </CardTitle>
            <Button 
              onClick={() => runAIAnalysis(activeUnit?.id)}
              disabled={analyzing}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? t('loading') : t('last_update')}
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
                <h3 className="font-semibold text-lg">{t('health_score')} {t('global_health')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('statistics')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-xs text-muted-foreground">
                {t('last_update')} : {new Date(currentAnalysis.lastUpdate).toLocaleString()}
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
              <Fish className="w-5 h-5 text-primary" />
              <Badge variant="secondary">IoT + IA</Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.fishCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{t('detected_subjects')}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">{t('status')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <Badge variant="secondary">{t('average_weight')}</Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.averageWeight} g</div>
            <div className="text-sm text-muted-foreground">{t('average_weight')}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+{currentAnalysis.dailyGrowth}% / {t('daily_production').toLowerCase()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <Badge variant="secondary">IA</Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.dailyGrowth}%</div>
            <div className="text-sm text-muted-foreground">{t('daily_growth')}</div>
            <div className="text-xs text-muted-foreground mt-1">{t('statistics')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <Badge variant={currentAnalysis.dailyMortality > 1 ? 'destructive' : 'secondary'}>
                {currentAnalysis.dailyMortality > 1 ? t('warning') : t('normal')}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{currentAnalysis.dailyMortality}%</div>
            <div className="text-sm text-muted-foreground">{t('daily_mortality')}</div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ {Math.round(currentAnalysis.fishCount * currentAnalysis.dailyMortality / 100)} {t('detected_subjects').toLowerCase()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations intelligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {t('recommendations')}
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
                    {getRecommendationIcon(rec.parameter)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(rec.priority)}>
                        {getPriorityText(rec.priority)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{rec.parameter}: {rec.action}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    {t('add')}
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
          <CardTitle>{t('evolution')} {t('health_score')} (7 {t('daily_production').toLowerCase()})</CardTitle>
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
