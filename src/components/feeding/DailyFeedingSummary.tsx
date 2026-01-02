import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  Thermometer, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Utensils
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FeedingRecord } from '@/hooks/useFeedingRecords';

interface DailyFeedingSummaryProps {
  records: FeedingRecord[];
  onEdit: (record: FeedingRecord) => void;
  onDelete: (id: string) => void;
}

const SESSION_LABELS: Record<string, { label: string; icon: string }> = {
  matin: { label: 'Matin', icon: '🌅' },
  midi: { label: 'Midi', icon: '☀️' },
  'apres-midi': { label: 'Après-midi', icon: '🌤️' },
  soir: { label: 'Soir', icon: '🌆' },
  nuit: { label: 'Nuit', icon: '🌙' },
};

const BEHAVIOR_LABELS: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: 'bg-green-100 text-green-800' },
  actif: { label: 'Très actifs', color: 'bg-blue-100 text-blue-800' },
  lent: { label: 'Peu actifs', color: 'bg-yellow-100 text-yellow-800' },
  refus_partiel: { label: 'Refus partiel', color: 'bg-orange-100 text-orange-800' },
  refus_total: { label: 'Refus total', color: 'bg-red-100 text-red-800' },
  stress: { label: 'Stress', color: 'bg-red-100 text-red-800' },
};

const DailyFeedingSummary = ({ records, onEdit, onDelete }: DailyFeedingSummaryProps) => {
  const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set());

  // Grouper par date
  const recordsByDate = useMemo(() => {
    const grouped: Record<string, FeedingRecord[]> = {};
    
    records.forEach(record => {
      const date = record.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
    });
    
    // Trier par date décroissante
    const sortedDates = Object.keys(grouped).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    // Trier les sessions par heure dans chaque jour
    sortedDates.forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return timeA.localeCompare(timeB);
      });
    });
    
    return { grouped, sortedDates };
  }, [records]);

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) {
      return "Aujourd'hui";
    }
    if (dateStr === yesterday.toISOString().split('T')[0]) {
      return "Hier";
    }
    
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDaySummary = (dayRecords: FeedingRecord[]) => {
    const totalQuantity = dayRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const totalMortality = dayRecords.reduce((sum, r) => sum + (r.mortality || 0), 0);
    const feeders = [...new Set(dayRecords.map(r => r.feeder_name).filter(Boolean))];
    
    return { totalQuantity, totalMortality, feeders, sessionCount: dayRecords.length };
  };

  const getSessionInfo = (record: FeedingRecord) => {
    const sessionType = record.session_type || 'autre';
    return SESSION_LABELS[sessionType] || { label: sessionType, icon: '📋' };
  };

  const getBehaviorInfo = (behavior: string | undefined) => {
    if (!behavior) return null;
    return BEHAVIOR_LABELS[behavior] || { label: behavior, color: 'bg-gray-100 text-gray-800' };
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Utensils className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune session de nourrissage enregistrée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recordsByDate.sortedDates.map((date) => {
        const dayRecords = recordsByDate.grouped[date];
        const isExpanded = expandedDates.has(date);
        const summary = getDaySummary(dayRecords);

        return (
          <Card key={date} className="overflow-hidden">
            <Collapsible open={isExpanded} onOpenChange={() => toggleDate(date)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{formatDate(date)}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{summary.sessionCount} session(s)</span>
                          <span>•</span>
                          <span className="font-medium text-primary">{summary.totalQuantity.toFixed(1)} kg</span>
                          {summary.totalMortality > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-600">⚠️ {summary.totalMortality} mort(s)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {summary.feeders.length > 0 && (
                        <Badge variant="outline" className="text-xs hidden sm:flex">
                          <User className="w-3 h-3 mr-1" />
                          {summary.feeders.slice(0, 2).join(', ')}
                          {summary.feeders.length > 2 && ` +${summary.feeders.length - 2}`}
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayRecords.map((record) => {
                    const sessionInfo = getSessionInfo(record);
                    const behaviorInfo = getBehaviorInfo(record.behavior);
                    
                    return (
                      <div 
                        key={record.id} 
                        className="p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* En-tête de session */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs font-medium">
                                {sessionInfo.icon} {sessionInfo.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {record.time || '--:--'}
                              </Badge>
                              <Badge className="text-xs bg-primary/10 text-primary border-0">
                                {record.quantity} kg
                              </Badge>
                            </div>
                            
                            {/* Détails */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {record.feeder_name && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  <span className="font-medium text-foreground">{record.feeder_name}</span>
                                </div>
                              )}
                              {record.feed_type && (
                                <div className="flex items-center gap-1 text-muted-foreground col-span-2 sm:col-span-1">
                                  <Utensils className="w-3 h-3" />
                                  <span className="truncate">{record.feed_type}</span>
                                </div>
                              )}
                              {record.temperature && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Thermometer className="w-3 h-3" />
                                  <span>{record.temperature}°C</span>
                                </div>
                              )}
                              {behaviorInfo && (
                                <Badge className={`text-xs ${behaviorInfo.color} border-0`}>
                                  {behaviorInfo.label}
                                </Badge>
                              )}
                            </div>

                            {/* Quantités prescrites/servies */}
                            {record.prescribed_quantity && (
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground">Prescrit: {record.prescribed_quantity} kg</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">Servi: {record.actual_quantity || record.quantity} kg</span>
                                {(record.remaining_quantity || 0) > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    Reste: {record.remaining_quantity} kg
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Mortalité */}
                            {(record.mortality || 0) > 0 && (
                              <div className="mt-2">
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Mortalité: {record.mortality}
                                </Badge>
                              </div>
                            )}

                            {/* Notes */}
                            {record.notes && (
                              <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">
                                {record.notes}
                              </p>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEdit(record)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onDelete(record.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

export default DailyFeedingSummary;
