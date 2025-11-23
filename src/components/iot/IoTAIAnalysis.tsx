import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    } catch (error) {
      console.error('Error:', error);
      toast.error('Une erreur est survenue lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IoTData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setIotData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

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
    </div>
  );
};

export default IoTAIAnalysis;
