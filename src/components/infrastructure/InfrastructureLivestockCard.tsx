import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fish, TrendingUp, Activity, Calendar, Droplets, Scale, Users, Leaf } from 'lucide-react';
import { LivestockBatch } from '@/hooks/useLivestockBatches';
import { useHealthRecords } from '@/hooks/useHealthRecords';

interface InfrastructureLivestockCardProps {
  batch: LivestockBatch;
  infrastructureId?: string;
  compact?: boolean;
}

const InfrastructureLivestockCard = ({ batch, infrastructureId, compact = false }: InfrastructureLivestockCardProps) => {
  const { records } = useHealthRecords(batch.unit_id);

  const filteredRecords = infrastructureId 
    ? records.filter(r => r.basin_id === infrastructureId)
    : records;

  const lastControlRecord = filteredRecords.length > 0 
    ? filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'sick': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'sold': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'Sain';
      case 'sick': return 'Malade';
      case 'quarantine': return 'Quarantaine';
      case 'sold': return 'Vendu';
      default: return status;
    }
  };

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case 'alevins': return 'Alevins';
      case 'juveniles': return 'Juvéniles';
      case 'adultes': return 'Adultes';
      case 'geniteurs': return 'Géniteurs';
      default: return type || 'Non défini';
    }
  };

  // Calculs automatiques de prévision
  const calculateForecast = () => {
    const survivalRate = batch.expected_survival_rate / 100;
    const expectedQuantity = Math.round(batch.quantity * survivalRate);
    const currentBiomass = (batch.quantity * batch.average_weight) / 1000; // en kg
    
    // Estimation du poids final basé sur l'âge et le type
    let targetWeight = batch.average_weight;
    if (batch.type === 'alevins') {
      targetWeight = 300; // poids cible adulte en grammes
    } else if (batch.type === 'juveniles') {
      targetWeight = 350;
    } else if (batch.type === 'adultes') {
      targetWeight = batch.average_weight * 1.2;
    }
    
    const expectedBiomass = (expectedQuantity * targetWeight) / 1000; // en kg
    
    return {
      expectedQuantity,
      currentBiomass,
      expectedBiomass,
      targetWeight,
      survivalRate: batch.expected_survival_rate
    };
  };

  const forecast = calculateForecast();

  // Vue compacte pour la carte
  if (compact) {
    return (
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Fish className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{batch.species}</p>
              {batch.variety && (
                <p className="text-xs text-muted-foreground truncate">{batch.variety}</p>
              )}
            </div>
          </div>
          <Badge className={`${getStatusColor(batch.status)} text-xs flex-shrink-0`}>
            {getStatusLabel(batch.status)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span>{batch.quantity.toLocaleString()} ind.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="w-3 h-3 text-muted-foreground" />
            <span className="font-semibold text-green-600">{batch.average_weight}g/ind.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3 h-3 text-muted-foreground" />
            <span>{getTypeLabel(batch.type)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>{batch.current_age}j</span>
          </div>
        </div>
        
        {/* Prévisions automatiques */}
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Biomasse actuelle:</span>
            <span className="font-semibold">{forecast.currentBiomass.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Prévision survie ({forecast.survivalRate}%):</span>
            <span className="font-semibold text-blue-600">{forecast.expectedQuantity.toLocaleString()} ind.</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Biomasse prévue:</span>
            <span className="font-semibold text-green-600">{forecast.expectedBiomass.toFixed(1)} kg</span>
          </div>
        </div>
      </div>
    );
  }

  // Vue complète pour les détails
  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
      <CardHeader className="pb-3 p-4">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Fish className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">{batch.species}</p>
              {batch.variety && (
                <p className="text-xs text-muted-foreground font-normal">{batch.variety}</p>
              )}
            </div>
          </span>
          <div className="flex flex-col items-end gap-1">
            <Badge className={getStatusColor(batch.status)}>
              {getStatusLabel(batch.status)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(batch.type)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-background rounded-lg">
            <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
            <p className="text-lg font-bold">{batch.quantity.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Individus</p>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <Scale className="w-4 h-4 mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold">{batch.average_weight}g</p>
            <p className="text-xs text-muted-foreground">Poids moyen</p>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-600" />
            <p className="text-lg font-bold">{batch.total_weight.toFixed(1)}kg</p>
            <p className="text-xs text-muted-foreground">Biomasse</p>
          </div>
          <div className="text-center p-2 bg-background rounded-lg">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-orange-600" />
            <p className="text-lg font-bold">{batch.current_age}</p>
            <p className="text-xs text-muted-foreground">Jours</p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {batch.acquisition_date && (
            <div className="flex justify-between items-center p-2 bg-background rounded-lg">
              <span className="text-muted-foreground">Acquisition</span>
              <span className="font-medium">
                {new Date(batch.acquisition_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {batch.expected_harvest_date && (
            <div className="flex justify-between items-center p-2 bg-background rounded-lg">
              <span className="text-muted-foreground">Récolte prévue</span>
              <span className="font-medium">
                {new Date(batch.expected_harvest_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          {batch.source && (
            <div className="flex justify-between items-center p-2 bg-background rounded-lg">
              <span className="text-muted-foreground">Source</span>
              <span className="font-medium truncate ml-2">{batch.source}</span>
            </div>
          )}
          {batch.feeding_plan && (
            <div className="flex justify-between items-center p-2 bg-background rounded-lg">
              <span className="text-muted-foreground">Plan alim.</span>
              <span className="font-medium truncate ml-2">{batch.feeding_plan}</span>
            </div>
          )}
          {batch.expected_survival_rate && (
            <div className="flex justify-between items-center p-2 bg-background rounded-lg">
              <span className="text-muted-foreground">Taux survie</span>
              <span className="font-medium">{batch.expected_survival_rate}%</span>
            </div>
          )}
          {batch.last_health_check && (
            <div className="flex justify-between items-center p-2 bg-background rounded-lg">
              <span className="text-muted-foreground">Dernier contrôle</span>
              <span className="font-medium">
                {new Date(batch.last_health_check).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>

        {/* Dernière pêche de contrôle */}
        {lastControlRecord && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Dernière pêche de contrôle</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {new Date(lastControlRecord.date).toLocaleDateString('fr-FR')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {lastControlRecord.average_weight && (
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Poids moyen</p>
                    <p className="font-semibold text-sm">{lastControlRecord.average_weight}g</p>
                  </div>
                </div>
              )}
              
              {lastControlRecord.sample_count && (
                <div className="p-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Échantillon</p>
                  <p className="font-semibold text-sm">{lastControlRecord.sample_count} ind.</p>
                </div>
              )}
              
              {lastControlRecord.temperature && (
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Température</p>
                    <p className="font-semibold text-sm">{lastControlRecord.temperature}°C</p>
                  </div>
                </div>
              )}
              
              {lastControlRecord.oxygen && (
                <div className="p-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Oxygène</p>
                  <p className="font-semibold text-sm">{lastControlRecord.oxygen} mg/L</p>
                </div>
              )}
              
              {lastControlRecord.ph && (
                <div className="p-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">pH</p>
                  <p className="font-semibold text-sm">{lastControlRecord.ph}</p>
                </div>
              )}
              
              {lastControlRecord.mortality !== null && lastControlRecord.mortality !== undefined && (
                <div className="p-2 bg-background rounded-lg">
                  <p className="text-xs text-muted-foreground">Mortalité</p>
                  <p className="font-semibold text-sm text-red-600">{lastControlRecord.mortality}</p>
                </div>
              )}
            </div>

            {lastControlRecord.notes && (
              <div className="mt-2 p-2 bg-muted rounded-lg text-xs">
                <p className="font-medium mb-1">Notes:</p>
                <p className="text-muted-foreground">{lastControlRecord.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes du lot */}
        {batch.notes && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-1">Notes du lot:</p>
            <p className="text-sm bg-background p-2 rounded-lg">{batch.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfrastructureLivestockCard;
