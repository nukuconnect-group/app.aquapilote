import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fish, TrendingUp, Activity, Calendar, Droplets } from 'lucide-react';
import { LivestockBatch } from '@/hooks/useLivestockBatches';
import { useHealthRecords } from '@/hooks/useHealthRecords';

interface InfrastructureLivestockCardProps {
  batch: LivestockBatch;
  infrastructureId?: string;
}

const InfrastructureLivestockCard = ({ batch, infrastructureId }: InfrastructureLivestockCardProps) => {
  const { records } = useHealthRecords(batch.unit_id);

  // Filtrer par infrastructure si fourni, sinon utiliser tous les enregistrements de l'unité
  const filteredRecords = infrastructureId 
    ? records.filter(r => r.basin_id === infrastructureId)
    : records;

  // Trouver la dernière pêche de contrôle
  const lastControlRecord = filteredRecords.length > 0 
    ? filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-300';
      case 'sick': return 'bg-red-100 text-red-800 border-red-300';
      case 'quarantine': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sold': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy': return 'En bonne santé';
      case 'sick': return 'Malade';
      case 'quarantine': return 'Quarantaine';
      case 'sold': return 'Vendu';
      default: return status;
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Fish className="w-5 h-5 text-primary" />
            Lot de poissons rattaché
          </span>
          <Badge className={getStatusColor(batch.status)}>
            {getStatusLabel(batch.status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations du lot */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Espèce</p>
            <p className="font-semibold">{batch.species}</p>
            {batch.variety && (
              <p className="text-xs text-muted-foreground">{batch.variety}</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Quantité</p>
            <p className="font-semibold">{batch.quantity.toLocaleString()} individus</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Poids moyen</p>
            <p className="font-semibold">{batch.average_weight} g</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Poids total</p>
            <p className="font-semibold">{batch.total_weight.toFixed(2)} kg</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Âge actuel</p>
            <p className="font-semibold">{batch.current_age} jours</p>
          </div>
          {batch.acquisition_date && (
            <div>
              <p className="text-muted-foreground mb-1">Date acquisition</p>
              <p className="font-semibold text-xs">
                {new Date(batch.acquisition_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {/* Dernière pêche de contrôle */}
        {lastControlRecord && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm">Dernière pêche de contrôle</h4>
              <Badge variant="outline" className="text-xs">
                {new Date(lastControlRecord.date).toLocaleDateString('fr-FR')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lastControlRecord.average_weight && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Poids moyen</p>
                    <p className="font-semibold">{lastControlRecord.average_weight} g</p>
                  </div>
                </div>
              )}
              
              {lastControlRecord.sample_count && (
                <div>
                  <p className="text-xs text-muted-foreground">Échantillon</p>
                  <p className="font-semibold">{lastControlRecord.sample_count} individus</p>
                </div>
              )}
              
              {lastControlRecord.temperature && (
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Température</p>
                    <p className="font-semibold">{lastControlRecord.temperature}°C</p>
                  </div>
                </div>
              )}
              
              {lastControlRecord.oxygen && (
                <div>
                  <p className="text-xs text-muted-foreground">Oxygène dissous</p>
                  <p className="font-semibold">{lastControlRecord.oxygen} mg/L</p>
                </div>
              )}
              
              {lastControlRecord.ph && (
                <div>
                  <p className="text-xs text-muted-foreground">pH</p>
                  <p className="font-semibold">{lastControlRecord.ph}</p>
                </div>
              )}
              
              {lastControlRecord.mortality !== null && lastControlRecord.mortality !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground">Mortalité</p>
                  <p className="font-semibold text-red-600">{lastControlRecord.mortality}</p>
                </div>
              )}
            </div>

            {lastControlRecord.notes && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
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
            <p className="text-sm">{batch.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfrastructureLivestockCard;
