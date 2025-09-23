
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Activity, Target, Droplets } from 'lucide-react';

interface KPIData {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ElementType;
  period: string;
}

const ProductionKPICards = () => {
  const kpiData: KPIData[] = [
    {
      title: "Production Totale",
      value: "11.7T",
      change: "+15.2%",
      changeType: "positive",
      icon: TrendingUp,
      period: "ce mois"
    },
    {
      title: "Taux de Croissance",
      value: "2.3%",
      change: "+0.5%",
      changeType: "positive",
      icon: Activity,
      period: "par jour"
    },
    {
      title: "Efficacité Alimentaire",
      value: "1.8",
      change: "-0.2",
      changeType: "positive",
      icon: Target,
      period: "FCR moyen"
    },
    {
      title: "Rendement/m³",
      value: "45kg",
      change: "+8%",
      changeType: "positive",
      icon: Droplets,
      period: "densité"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.period}</p>
              </div>
              <div className={`p-3 rounded-full ${
                kpi.changeType === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <kpi.icon className={`w-6 h-6 ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-sm font-medium ${
                kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductionKPICards;
