import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, AlertTriangle, CheckCircle, History, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAIAnalyses } from '@/hooks/useAIAnalyses';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IoTData {
  temperature: number;
  oxygene_dissous: number;
  ph: number;
  ammonium: number;
  nitrite: number;
}

interface AquapiloteResponse {
  alerte: boolean;
  conseil: string;
}

const IoTAIAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AquapiloteResponse | null>(null);
  const { analyses, loading: loadingHistory, refetch, deleteAnalysis } = useAIAnalyses(20);
  
  const [iotData, setIotData] = useState<IoTData>({
    temperature: 25,
    oxygene_dissous: 7.5,
    ph: 7.2,
    ammonium: 0.5,
    nitrite: 0.2
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('aquapilote-recommendation', {
        body: { iotData }
      });

      if (error) {
        console.error('Error calling function:', error);
        toast.error('Erreur lors de l\'analyse');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
      toast.success('Analyse terminée avec succès');
      
      // Refresh history
      await refetch();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysis(id);
      toast.success('Analyse supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleInputChange = (field: keyof IoTData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setIotData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    return [...analyses]
      .reverse() // Du plus ancien au plus récent
      .map(analysis => ({
        date: format(new Date(analysis.created_at), 'dd/MM HH:mm', { locale: fr }),
        timestamp: new Date(analysis.created_at).getTime(),
        temperature: Number(analysis.temperature),
        oxygene: Number(analysis.oxygene_dissous),
        ph: Number(analysis.ph),
        ammonium: Number(analysis.ammonium),
        nitrite: Number(analysis.nitrite),
        alerte: analysis.alerte
      }));
  }, [analyses]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Analyse IA des Bassins
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Entrez les paramètres de l'eau pour obtenir une analyse intelligente et des recommandations personnalisées
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulaire de saisie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={iotData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="Ex: 25.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxygene">Oxygène Dissous (mg/L)</Label>
              <Input
                id="oxygene"
                type="number"
                step="0.1"
                value={iotData.oxygene_dissous}
                onChange={(e) => handleInputChange('oxygene_dissous', e.target.value)}
                placeholder="Ex: 7.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph">pH (potentiel hydrogène)</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                value={iotData.ph}
                onChange={(e) => handleInputChange('ph', e.target.value)}
                placeholder="Ex: 7.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ammonium">Ammonium/Ammoniaque (mg/L)</Label>
              <Input
                id="ammonium"
                type="number"
                step="0.1"
                value={iotData.ammonium}
                onChange={(e) => handleInputChange('ammonium', e.target.value)}
                placeholder="Ex: 0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nitrite">Nitrite (mg/L)</Label>
              <Input
                id="nitrite"
                type="number"
                step="0.1"
                value={iotData.nitrite}
                onChange={(e) => handleInputChange('nitrite', e.target.value)}
                placeholder="Ex: 0.2"
              />
            </div>
          </div>

          {/* Bouton d'analyse */}
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analyser et Recommander
              </>
            )}
          </Button>

          {/* Affichage des résultats */}
          {result && (
            <div className="space-y-4 pt-4 border-t">
              {/* Badge d'alerte */}
              <div className="flex justify-center">
                {result.alerte ? (
                  <Badge className="bg-red-500 text-white px-6 py-2 text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ALERTE
                  </Badge>
                ) : (
                  <Badge className="bg-green-500 text-white px-6 py-2 text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    RAS
                  </Badge>
                )}
              </div>

              {/* Conseil */}
              <Alert className={result.alerte ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
                <AlertDescription className="text-base">
                  <div className="font-semibold mb-2 text-foreground">Recommandation :</div>
                  <div className="text-foreground/90">{result.conseil}</div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carte d'information */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">À propos de l'analyse IA</h3>
              <p className="text-sm text-blue-800">
                Notre système d'intelligence artificielle analyse en temps réel les paramètres de l'eau de vos bassins 
                et fournit des recommandations personnalisées basées sur les meilleures pratiques en aquaculture. 
                Les alertes sont déclenchées lorsque les paramètres sortent des plages optimales pour assurer la santé 
                de vos poissons.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Graphiques d'évolution */}
      {analyses.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution des Paramètres
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Visualisez l'évolution des paramètres d'eau au fil du temps
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Température */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                Température (°C)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Oxygène dissous */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Oxygène Dissous (mg/L)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="oxygene" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* pH */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                pH
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[6, 9]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Ammonium et Nitrite */}
            <div>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Ammonium (NH₄) et Nitrite (NO₂) (mg/L)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ammonium" 
                    name="Ammonium"
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nitrite" 
                    name="Nitrite"
                    stroke="#ec4899" 
                    strokeWidth={2}
                    dot={{ fill: '#ec4899', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Historique des Analyses
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Consultez l'évolution des recommandations au fil du temps
          </p>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune analyse pour le moment</p>
              <p className="text-sm mt-1">Effectuez votre première analyse ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                >
                  {/* En-tête avec date et badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(analysis.created_at), { 
                          addSuffix: true,
                          locale: fr 
                        })}
                      </span>
                      {analysis.alerte ? (
                        <Badge className="bg-red-500 text-white flex-shrink-0">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ALERTE
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white flex-shrink-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          RAS
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(analysis.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Paramètres */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="bg-background rounded p-2">
                      <div className="text-muted-foreground">Temp.</div>
                      <div className="font-semibold">{analysis.temperature}°C</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="text-muted-foreground">O₂</div>
                      <div className="font-semibold">{analysis.oxygene_dissous} mg/L</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="text-muted-foreground">pH</div>
                      <div className="font-semibold">{analysis.ph}</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="text-muted-foreground">NH₄</div>
                      <div className="font-semibold">{analysis.ammonium} mg/L</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="text-muted-foreground">NO₂</div>
                      <div className="font-semibold">{analysis.nitrite} mg/L</div>
                    </div>
                  </div>

                  {/* Conseil */}
                  <Alert className={analysis.alerte ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <AlertDescription className="text-sm">
                      <div className="font-medium mb-1">Recommandation :</div>
                      <div className="text-foreground/80">{analysis.conseil}</div>
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IoTAIAnalysis;
