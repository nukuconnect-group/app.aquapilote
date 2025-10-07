import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Activity, 
  Scale, 
  Utensils, 
  Calendar,
  Fish,
  Target,
  AlertCircle
} from 'lucide-react';

interface CycleDetailsProps {
  cycle: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate?: string;
    currentQuantity: number;
    targetQuantity: number;
    notes?: string;
    initialQuantity?: number;
    stockingDate?: string;
    fingerlingsCount?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (cycle: any) => void;
}

const ProductionCycleDetails: React.FC<CycleDetailsProps> = ({ cycle, isOpen, onClose, onEdit }) => {
  // Données calculées (à remplacer par de vraies données provenant du context/API)
  const daysElapsed = Math.floor((new Date().getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const expectedEndDate = cycle.endDate || 'Non défini';
  const averageWeight = ((cycle.currentQuantity * 2.5) / cycle.currentQuantity * 1000).toFixed(0); // Poids moyen en grammes
  const dailyGrowth = (parseFloat(averageWeight) / daysElapsed).toFixed(1);
  const feedConsumed = (cycle.currentQuantity * 1.5).toFixed(1); // kg d'aliment
  const feedConversionRatio = 1.2; // FCR
  const survivalRate = ((cycle.currentQuantity / cycle.targetQuantity) * 100).toFixed(1);
  const waterTemperature = 24.5; // °C
  const dissolvedOxygen = 7.2; // mg/L

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{cycle.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={
                cycle.status === 'active' ? 'bg-green-100 text-green-800' :
                cycle.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {cycle.status}
              </Badge>
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(cycle);
                    onClose();
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                >
                  Modifier
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informations générales */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Informations du cycle
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date de début</p>
                  <p className="font-medium">{new Date(cycle.startDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fin prévue</p>
                  <p className="font-medium">
                    {expectedEndDate !== 'Non défini' 
                      ? new Date(expectedEndDate).toLocaleDateString('fr-FR')
                      : expectedEndDate}
                  </p>
                </div>
                {cycle.stockingDate && (
                  <div>
                    <p className="text-muted-foreground">Date d'empoisonnement</p>
                    <p className="font-medium">{new Date(cycle.stockingDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Jours écoulés</p>
                  <p className="font-medium">{daysElapsed} jours</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taux de survie</p>
                  <p className="font-medium text-green-600">{survivalRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Fish className="w-4 h-4" />
                Production
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {cycle.initialQuantity && (
                    <div>
                      <p className="text-muted-foreground">Objectif initial</p>
                      <p className="font-medium text-lg">{cycle.initialQuantity.toLocaleString()}</p>
                    </div>
                  )}
                  {cycle.fingerlingsCount && (
                    <div>
                      <p className="text-muted-foreground">Nombre d'alevins empoisonnés</p>
                      <p className="font-medium text-lg">{cycle.fingerlingsCount.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Quantité actuelle</p>
                    <p className="font-medium text-lg">{cycle.currentQuantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Objectif final prévu</p>
                    <p className="font-medium text-lg">{cycle.targetQuantity.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{((cycle.currentQuantity / cycle.targetQuantity) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${(cycle.currentQuantity / cycle.targetQuantity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Croissance */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Croissance
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Poids moyen</p>
                  <p className="font-medium text-lg">{averageWeight}g</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Croissance journalière</p>
                  <p className="font-medium text-lg text-green-600">+{dailyGrowth}g/jour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alimentation */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Alimentation
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Aliment ingéré</p>
                  <p className="font-medium text-lg">{feedConsumed} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taux de conversion (FCR)</p>
                  <p className="font-medium text-lg">{feedConversionRatio}</p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <Target className="w-3 h-3 inline mr-1" />
                  Consommation moyenne: {(parseFloat(feedConsumed) / daysElapsed).toFixed(2)} kg/jour
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres environnementaux */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Conditions environnementales
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Température de l'eau</p>
                  <p className="font-medium">{waterTemperature}°C</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Oxygène dissous</p>
                  <p className="font-medium">{dissolvedOxygen} mg/L</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {cycle.notes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground">{cycle.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionCycleDetails;