import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, Clock, Lightbulb, AlertTriangle, AlertCircle } from 'lucide-react';
import type { ParameterAlert } from '@/lib/waterQualityThresholds';

interface AlertCardProps {
  alert: ParameterAlert;
  index: number;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // Premier alert ouvert par défaut

  const isCritical = alert.level === 'critical';

  return (
    <Card className={cn(
      "border-l-4 transition-all duration-200 hover:shadow-md",
      isCritical 
        ? "border-l-red-500 bg-red-50/50 dark:bg-red-950/20" 
        : "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-3 pt-4">
            <div className="flex items-start gap-3">
              {/* Icône */}
              <div className={cn(
                "p-2 rounded-lg flex-shrink-0",
                isCritical ? "bg-red-500" : "bg-amber-500"
              )}>
                {isCritical ? (
                  <AlertTriangle className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn(
                      "font-semibold text-sm leading-tight",
                      isCritical ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"
                    )}>
                      {alert.parameter}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Valeur: <span className="font-mono font-bold">{alert.value}{alert.unit}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={cn(
                      "text-xs",
                      isCritical ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
                    )}>
                      {isCritical ? 'CRITIQUE' : 'ATTENTION'}
                    </Badge>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </div>

                {/* Message résumé */}
                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                  {alert.message}
                </p>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-4 pl-11">
              {/* Urgence */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className={cn(
                  "w-4 h-4",
                  isCritical ? "text-red-600" : "text-amber-600"
                )} />
                <span className="text-muted-foreground">Délai d'intervention:</span>
                <Badge variant="outline" className={cn(
                  "font-mono text-xs",
                  isCritical 
                    ? "border-red-300 text-red-700 bg-red-100" 
                    : "border-amber-300 text-amber-700 bg-amber-100"
                )}>
                  {alert.urgency}
                </Badge>
              </div>

              {/* Recommandations */}
              <div className="rounded-lg bg-background/80 border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-sm">Actions recommandées</span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {alert.recommendation}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
