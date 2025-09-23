
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProductionPlanning = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendrier de Production</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Juillet 2024</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>15 Jul - Récolte Bassin A1 (Carpe)</span>
                <Badge variant="outline">Prévu</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>22 Jul - Nettoyage Bassin C2</span>
                <Badge variant="secondary">Maintenance</Badge>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">Août 2024</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>01 Aoû - Récolte Bassin B2 (Tilapia)</span>
                <Badge variant="outline">Prévu</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>10 Aoû - Nouveau cycle Bassin A1</span>
                <Badge variant="default">Démarrage</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionPlanning;
