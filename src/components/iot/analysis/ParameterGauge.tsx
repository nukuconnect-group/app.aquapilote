import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WATER_QUALITY_THRESHOLDS } from '@/lib/waterQualityThresholds';

interface ParameterGaugeProps {
  paramKey: string;
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ParameterGauge: React.FC<ParameterGaugeProps> = ({ 
  paramKey, 
  value, 
  showLabel = true,
  size = 'md' 
}) => {
  const threshold = WATER_QUALITY_THRESHOLDS[paramKey];
  if (!threshold) return null;

  // Calculer le pourcentage basé sur la plage totale
  const range = threshold.max_critical - threshold.min_critical;
  const normalizedValue = ((value - threshold.min_critical) / range) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, normalizedValue));

  // Déterminer le statut et la couleur
  let status: 'critical' | 'warning' | 'optimal' = 'optimal';
  let statusLabel = 'Optimal';
  let colorClass = 'bg-emerald-500';

  if (value <= threshold.min_critical || value >= threshold.max_critical) {
    status = 'critical';
    statusLabel = 'Critique';
    colorClass = 'bg-red-500';
  } else if (value <= threshold.min_warning || value >= threshold.max_warning) {
    status = 'warning';
    statusLabel = 'Attention';
    colorClass = 'bg-amber-500';
  } else if (value >= threshold.optimal_min && value <= threshold.optimal_max) {
    status = 'optimal';
    statusLabel = 'Optimal';
    colorClass = 'bg-emerald-500';
  } else {
    status = 'optimal';
    statusLabel = 'Acceptable';
    colorClass = 'bg-blue-500';
  }

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <span>{threshold.icon}</span>
            {threshold.name}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-bold",
              status === 'critical' && 'text-red-600',
              status === 'warning' && 'text-amber-600',
              status === 'optimal' && 'text-emerald-600'
            )}>
              {value.toFixed(1)}{threshold.unit}
            </span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] px-1.5 py-0",
                status === 'critical' && 'border-red-500 text-red-600 bg-red-50',
                status === 'warning' && 'border-amber-500 text-amber-600 bg-amber-50',
                status === 'optimal' && 'border-emerald-500 text-emerald-600 bg-emerald-50'
              )}
            >
              {statusLabel}
            </Badge>
          </div>
        </div>
      )}
      <div className="relative">
        <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
          <div 
            className={cn("h-full transition-all duration-500 rounded-full", colorClass)}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        {/* Marqueurs de zones */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {/* Zone optimale */}
          <div 
            className="absolute h-full border-l border-r border-emerald-400/50 bg-emerald-100/20"
            style={{ 
              left: `${((threshold.optimal_min - threshold.min_critical) / range) * 100}%`,
              width: `${((threshold.optimal_max - threshold.optimal_min) / range) * 100}%`
            }}
          />
        </div>
      </div>
      {/* Légende mini */}
      <div className="flex justify-between text-[9px] text-muted-foreground/70 px-0.5">
        <span>{threshold.min_critical}{threshold.unit}</span>
        <span className="text-emerald-600">Zone optimale</span>
        <span>{threshold.max_critical}{threshold.unit}</span>
      </div>
    </div>
  );
};
