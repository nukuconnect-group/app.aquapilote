
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface FeedingRecord {
  id: string;
  date: string;
  time: string;
  feedType: string;
  quantity: number;
  unit: string;
  temperature: number;
  notes: string;
  unitId: string;
  feederName?: string;
  prescribedQuantity?: number;
  actualQuantity?: number;
}

interface FeedingChartProps {
  records: FeedingRecord[];
  cycleId: string;
  cycleName: string;
}

const FeedingChart = ({ records, cycleId, cycleName }: FeedingChartProps) => {
  // Simulation de données pour le cycle sélectionné
  const feedingData = [
    { date: '2024-01-15', planned: 25, actual: 25, missed: false },
    { date: '2024-01-16', planned: 25, actual: 23, missed: false },
    { date: '2024-01-17', planned: 26, actual: 0, missed: true },
    { date: '2024-01-18', planned: 26, actual: 28, missed: false },
    { date: '2024-01-19', planned: 27, actual: 27, missed: false },
    { date: '2024-01-20', planned: 27, actual: 25, missed: false },
    { date: '2024-01-21', planned: 28, actual: 28, missed: false }
  ];

  const missedFeedings = feedingData.filter(d => d.missed).length;
  const totalFeedings = feedingData.length;
  const complianceRate = ((totalFeedings - missedFeedings) / totalFeedings * 100).toFixed(1);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution du nourrissage
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Cycle: {cycleName}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={missedFeedings > 0 ? "destructive" : "secondary"}>
                {complianceRate}% de conformité
              </Badge>
            </div>
            {missedFeedings > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {missedFeedings} nourrissage(s) raté(s)
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={feedingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Quantité (kg)', angle: -90, position: 'insideLeft' }}
                fontSize={12}
              />
              <Tooltip 
                labelFormatter={(value) => `Date: ${formatDate(value)}`}
                formatter={(value, name) => [
                  `${value} kg`,
                  name === 'planned' ? 'Prévu' : 'Réalisé'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="planned" 
                stroke="#8884d8" 
                strokeDasharray="5 5"
                name="planned"
                dot={{ fill: '#8884d8', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#82ca9d" 
                name="actual"
                dot={(props) => {
                  const data = feedingData[props.index];
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill={data?.missed ? '#ef4444' : '#82ca9d'}
                      stroke={data?.missed ? '#dc2626' : '#82ca9d'}
                      strokeWidth={2}
                    />
                  );
                }}
              />
              {feedingData.map((entry, index) => 
                entry.missed && (
                  <ReferenceLine 
                    key={index}
                    x={entry.date} 
                    stroke="#ef4444" 
                    strokeDasharray="2 2"
                    label={{ value: "Raté", position: "top" }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-xs text-blue-600 font-medium">Moyenne planifiée</p>
            <p className="text-lg font-bold text-blue-800">
              {(feedingData.reduce((sum, d) => sum + d.planned, 0) / feedingData.length).toFixed(1)} kg
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-xs text-green-600 font-medium">Moyenne réalisée</p>
            <p className="text-lg font-bold text-green-800">
              {(feedingData.reduce((sum, d) => sum + (d.missed ? 0 : d.actual), 0) / feedingData.filter(d => !d.missed).length).toFixed(1)} kg
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <p className="text-xs text-orange-600 font-medium">Écart moyen</p>
            <p className="text-lg font-bold text-orange-800">
              {(feedingData.reduce((sum, d) => sum + Math.abs(d.planned - (d.missed ? 0 : d.actual)), 0) / feedingData.length).toFixed(1)} kg
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedingChart;
