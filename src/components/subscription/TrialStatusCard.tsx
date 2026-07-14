import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, AlertTriangle, CheckCircle2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentSubscription, getPlanLabel } from '@/hooks/useCurrentSubscription';

export const TrialStatusCard: React.FC = () => {
  const { subscription, loading } = useCurrentSubscription();
  const navigate = useNavigate();

  if (loading || !subscription) return null;

  const { status, days_remaining, total_days, plan, isTrial, isExpired } = subscription;
  const usedDays = Math.max(0, total_days - days_remaining);
  const progress = Math.min(100, (usedDays / total_days) * 100);
  const criticalSoon = days_remaining <= 7 && (isTrial || status === 'active');

  const Icon = isExpired ? AlertTriangle : isTrial ? Sparkles : Crown;
  const gradient = isExpired
    ? 'from-red-500/10 via-red-500/5 to-transparent border-red-500/30'
    : criticalSoon
      ? 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30'
      : isTrial
        ? 'from-sky-500/10 via-blue-500/5 to-transparent border-sky-500/30'
        : 'from-emerald-500/10 via-green-500/5 to-transparent border-emerald-500/30';

  return (
    <Card className={`mb-4 border-2 bg-gradient-to-r ${gradient}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`rounded-full p-2 ${isExpired ? 'bg-red-500/15' : criticalSoon ? 'bg-amber-500/15' : isTrial ? 'bg-sky-500/15' : 'bg-emerald-500/15'}`}>
              <Icon className={`w-5 h-5 ${isExpired ? 'text-red-600' : criticalSoon ? 'text-amber-600' : isTrial ? 'text-sky-600' : 'text-emerald-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm sm:text-base truncate">{getPlanLabel(plan)}</span>
                <Badge variant={isExpired ? 'destructive' : 'secondary'} className="text-[10px]">
                  {status === 'trial' ? 'Essai gratuit' : status === 'active' ? 'Actif' : status === 'expired' ? 'Expiré' : status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                <Clock className="w-3 h-3 shrink-0" />
                {isExpired
                  ? `Votre abonnement a expiré`
                  : isTrial
                    ? days_remaining === 0
                      ? `Vous êtes en mode essai gratuit — dernier jour !`
                      : `Vous êtes en mode essai gratuit — ${days_remaining} j restant${days_remaining > 1 ? 's' : ''}`
                    : days_remaining === 0
                      ? `Dernier jour !`
                      : `${days_remaining} jour${days_remaining > 1 ? 's' : ''} restant${days_remaining > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 sm:min-w-[220px]">
            <div className="w-full sm:w-56">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Jour {usedDays}/{total_days}</span>
                {criticalSoon && !isExpired && <span className="text-amber-600 font-medium">Bientôt terminé</span>}
              </div>
            </div>
            {(isExpired || criticalSoon) && (
              <Button
                size="sm"
                onClick={() => navigate('/subscription')}
                className={isExpired ? 'bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto' : 'w-full sm:w-auto'}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {isExpired ? 'Souscrire maintenant' : 'Passer au plan payant'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialStatusCard;
