
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface Alert {
  type: "warning" | "info" | "success";
  message: string;
  temps: string;
}

const ProductionAlerts = () => {
  const alertesProduction: Alert[] = [
    {
      type: "warning",
      message: "Bassin A1: Croissance en dessous de l'objectif (-12%)",
      temps: "Il y a 2h"
    },
    {
      type: "info",
      message: "Bassin B2: Récolte prévue dans 15 jours",
      temps: "Il y a 4h"
    },
    {
      type: "success",
      message: "Bassin C1: Objectif de poids atteint avec 3 jours d'avance",
      temps: "Hier"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alertes et Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertesProduction.map((alerte, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className={`p-1 rounded-full ${
                alerte.type === 'warning' ? 'bg-orange-100' :
                alerte.type === 'info' ? 'bg-blue-100' :
                'bg-green-100'
              }`}>
                {alerte.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                {alerte.type === 'info' && <Clock className="w-4 h-4 text-blue-500" />}
                {alerte.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alerte.message}</p>
                <p className="text-xs text-gray-500">{alerte.temps}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionAlerts;
