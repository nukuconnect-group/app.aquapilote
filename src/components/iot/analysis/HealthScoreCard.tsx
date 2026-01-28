import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  summary: string;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, status, summary }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          icon: AlertTriangle,
          label: 'CRITIQUE',
          bgClass: 'from-red-500/20 to-red-600/10 border-red-500/50',
          iconBg: 'bg-red-500',
          textClass: 'text-red-700',
          ringColor: 'ring-red-500',
          strokeColor: '#ef4444'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          label: 'ATTENTION',
          bgClass: 'from-amber-500/20 to-amber-600/10 border-amber-500/50',
          iconBg: 'bg-amber-500',
          textClass: 'text-amber-700',
          ringColor: 'ring-amber-500',
          strokeColor: '#f59e0b'
        };
      case 'excellent':
        return {
          icon: Shield,
          label: 'EXCELLENT',
          bgClass: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/50',
          iconBg: 'bg-emerald-500',
          textClass: 'text-emerald-700',
          ringColor: 'ring-emerald-500',
          strokeColor: '#10b981'
        };
      default:
        return {
          icon: CheckCircle2,
          label: 'BON',
          bgClass: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
          iconBg: 'bg-blue-500',
          textClass: 'text-blue-700',
          ringColor: 'ring-blue-500',
          strokeColor: '#3b82f6'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  // SVG circle dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={cn(
      "border-2 bg-gradient-to-br transition-all duration-300 hover:shadow-lg",
      config.bgClass
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Score circulaire */}
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={config.strokeColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-3xl font-bold", config.textClass)}>{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Informations */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", config.iconBg)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  État de santé
                </p>
                <p className={cn("text-lg font-bold", config.textClass)}>
                  {config.label}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
