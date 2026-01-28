import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Brain, Sparkles, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface AIRecommendationCardProps {
  isLoading?: boolean;
  hasAlert: boolean;
  recommendation: string;
  isAutomatic?: boolean;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  isLoading,
  hasAlert,
  recommendation,
  isAutomatic = false
}) => {
  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Brain className="w-12 h-12 text-primary/30" />
              </div>
              <Brain className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Analyse IA en cours...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Traitement des paramètres et génération des recommandations
              </p>
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-2 overflow-hidden",
      hasAlert 
        ? "border-red-500/50 bg-gradient-to-br from-red-50 to-background dark:from-red-950/30" 
        : "border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/30"
    )}>
      {/* En-tête avec gradient */}
      <div className={cn(
        "px-6 py-4 border-b",
        hasAlert 
          ? "bg-gradient-to-r from-red-500 to-red-600" 
          : "bg-gradient-to-r from-emerald-500 to-emerald-600"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Recommandation IA
                {isAutomatic && (
                  <Sparkles className="w-4 h-4" />
                )}
              </h3>
              <p className="text-xs text-white/80">
                {isAutomatic ? 'Analyse automatique temps réel' : 'Analyse personnalisée'}
              </p>
            </div>
          </div>
          <Badge 
            className={cn(
              "text-sm px-4 py-1",
              hasAlert 
                ? "bg-white text-red-600" 
                : "bg-white text-emerald-600"
            )}
          >
            <span className="flex items-center gap-1.5">
              {hasAlert ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  ALERTE
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  RAS
                </>
              )}
            </span>
          </Badge>
        </div>
      </div>

      {/* Contenu de la recommandation */}
      <CardContent className="p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-line text-foreground/90 leading-relaxed">
            {recommendation}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
