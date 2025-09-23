
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

const UnitReportGenerator = () => {
  const { units, getUnitFinancialData, getGlobalFinancialData } = useProductionUnits();
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('financial');

  const generateReport = () => {
    console.log(`Génération du rapport ${reportType} pour l'unité ${selectedUnit}`);
    // Logique de génération de rapport
  };

  const getReportData = () => {
    if (selectedUnit === 'all') {
      return getGlobalFinancialData();
    }
    return getUnitFinancialData(selectedUnit);
  };

  const reportData = getReportData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Unité de production</label>
          <Select value={selectedUnit} onValueChange={setSelectedUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une unité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les unités</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Type de rapport</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Rapport Financier</SelectItem>
              <SelectItem value="production">Rapport de Production</SelectItem>
              <SelectItem value="health">Rapport Sanitaire</SelectItem>
              <SelectItem value="comprehensive">Rapport Complet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={generateReport} className="whitespace-nowrap">
          <Download className="w-4 h-4 mr-2" />
          Générer PDF
        </Button>
      </div>

      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    €{reportData.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Revenus totaux</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    €{reportData.expenses.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Dépenses totales</p>
                </div>
                <Package className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    €{reportData.profit.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Bénéfice net</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Aperçu du rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Unité sélectionnée:</span>
              <Badge variant="outline">
                {selectedUnit === 'all' ? 'Toutes les unités' : 
                 units.find(u => u.id === selectedUnit)?.name || 'Inconnue'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Type de rapport:</span>
              <Badge variant="secondary">{reportType}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Période:</span>
              <Badge>Dernier trimestre</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitReportGenerator;
