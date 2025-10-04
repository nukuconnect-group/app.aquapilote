import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Video,
  X,
  Scan
} from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisResult {
  averageWeight: number;
  diseases: Array<{
    name: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    description: string;
  }>;
  recommendations: string[];
  timestamp: string;
}

const CameraAnalysis = () => {
  const { activeUnit } = useProductionUnits();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const validTypes = type === 'photo' 
      ? ['image/jpeg', 'image/png', 'image/jpg']
      : ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: `Veuillez sélectionner ${type === 'photo' ? 'une image' : 'une vidéo'} valide.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    
    // Simulation de l'analyse IA (dans une vraie app, appeler une API)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Résultat simulé
    const mockResult: AnalysisResult = {
      averageWeight: 287,
      diseases: [
        {
          name: 'Taches blanches détectées',
          severity: 'medium',
          confidence: 78,
          description: 'Possibles signes d\'infection parasitaire externe'
        },
        {
          name: 'Nageoires légèrement abîmées',
          severity: 'low',
          confidence: 65,
          description: 'Peut être dû à la densité ou au comportement de compétition'
        }
      ],
      recommendations: [
        'Effectuer un traitement anti-parasitaire dans les 48h',
        'Vérifier la qualité de l\'eau (pH, oxygène)',
        'Réduire la densité du bassin si possible',
        'Surveiller l\'évolution sur 3 jours'
      ],
      timestamp: new Date().toISOString()
    };

    setAnalysisResult(mockResult);
    setAnalyzing(false);

    toast({
      title: "Analyse terminée",
      description: "L'IA a détecté plusieurs indicateurs de santé",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        className="w-full sm:w-auto"
      >
        <Camera className="w-4 h-4 mr-2" />
        Analyser avec Caméra
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              Analyse IA par Caméra - {activeUnit?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Sélection du fichier */}
            {!selectedFile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="p-6 text-center">
                    <Camera className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="font-semibold mb-2">Prendre une photo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Photographiez vos poissons pour une analyse instantanée
                    </p>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner une photo
                    </Button>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <CardContent className="p-6 text-center">
                    <Video className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <h3 className="font-semibold mb-2">Importer une vidéo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analysez le comportement et la santé via vidéo
                    </p>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner une vidéo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => handleFileSelect(e, 'photo')}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo"
              onChange={(e) => handleFileSelect(e, 'video')}
              className="hidden"
            />

            {/* Prévisualisation et analyse */}
            {selectedFile && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Fichier sélectionné</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                          setAnalysisResult(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {previewUrl && (
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        {selectedFile.type.startsWith('image/') ? (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-auto max-h-96 object-contain"
                          />
                        ) : (
                          <video 
                            src={previewUrl} 
                            controls 
                            className="w-full h-auto max-h-96"
                          />
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button 
                        onClick={runAnalysis}
                        disabled={analyzing}
                        className="flex-1"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Scan className="w-4 h-4 mr-2" />
                            Lancer l'analyse IA
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Résultats de l'analyse */}
                {analysisResult && (
                  <div className="space-y-4">
                    {/* Poids moyen */}
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold mb-1">Poids moyen estimé</h3>
                            <div className="text-3xl font-bold text-blue-600">
                              {analysisResult.averageWeight} g
                            </div>
                          </div>
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Maladies détectées */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          Anomalies détectées
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisResult.diseases.map((disease, idx) => (
                            <div 
                              key={idx}
                              className={`p-4 border rounded-lg ${getSeverityColor(disease.severity)}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{disease.name}</h4>
                                <Badge className={getSeverityColor(disease.severity)}>
                                  {disease.severity === 'high' ? 'Sévère' : 
                                   disease.severity === 'medium' ? 'Modéré' : 'Léger'}
                                </Badge>
                              </div>
                              <p className="text-sm mb-2">{disease.description}</p>
                              <div className="text-xs text-muted-foreground">
                                Confiance IA : {disease.confidence}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommandations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          Recommandations prophylactiques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                          setAnalysisResult(null);
                        }}
                      >
                        Nouvelle analyse
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Rapport enregistré",
                            description: "Les résultats ont été ajoutés au module Prophylaxie",
                          });
                          setShowDialog(false);
                        }}
                      >
                        Enregistrer dans Prophylaxie
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CameraAnalysis;
