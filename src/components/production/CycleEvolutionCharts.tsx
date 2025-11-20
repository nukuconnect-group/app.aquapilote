import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, Scale } from 'lucide-react';

interface CycleEvolutionChartsProps {
  cycleId: string;
  cycleName: string;
  daysElapsed: number;
}

const CycleEvolutionCharts: React.FC<CycleEvolutionChartsProps> = ({ cycleId, cycleName, daysElapsed }) => {
  // Données simulées - à remplacer par de vraies données
  const growthData = Array.from({ length: Math.min(daysElapsed, 30) }, (_, i) => ({
    jour: i + 1,
    poidsMoyen: 50 + (i * 15) + Math.random() * 20,
    objectif: 50 + (i * 16),
    mortalite: Math.random() * 2
  }));

  const feedingData = Array.from({ length: Math.min(daysElapsed, 30) }, (_, i) => ({
    jour: i + 1,
    quantite: 80 + (i * 3) + Math.random() * 10,
    fcr: 1.2 + Math.random() * 0.3
  }));

  const waterQualityData = Array.from({ length: 14 }, (_, i) => ({
    jour: `J${i + 1}`,
    temperature: 24 + Math.random() * 2,
    oxygene: 6.5 + Math.random() * 1.5,
    ph: 7 + Math.random() * 0.5
  }));

  // Alertes simulées
  const alerts = [
    { level: 'warning', message: 'Température élevée détectée (26.5°C)', date: 'Il y a 2 jours' },
    { level: 'info', message: 'Taux de croissance optimal', date: 'Il y a 1 jour' }
  ];

  return (
    <div className="space-y-6">
      {/* Alertes */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Alertes et Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  alert.level === 'warning' 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${
                    alert.level === 'warning' ? 'text-orange-900' : 'text-blue-900'
                  }`}>
                    {alert.message}
                  </p>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {alert.date}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Évolution de la croissance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Évolution du Poids Moyen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="jour" 
                  label={{ value: 'Jours', position: 'insideBottom', offset: -5 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  label={{ value: 'Poids (g)', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="objectif"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                  name="Objectif"
                />
                <Area
                  type="monotone"
                  dataKey="poidsMoyen"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#growthGrad)"
                  name="Poids Moyen"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alimentation et FCR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-4 h-4 text-primary" />
            Alimentation et Taux de Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="jour" 
                  label={{ value: 'Jours', position: 'insideBottom', offset: -5 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Quantité (kg)', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'FCR', angle: 90, position: 'insideRight' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="quantite"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Quantité d'aliment (kg)"
                  dot={{ fill: '#10b981' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fcr"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="FCR"
                  dot={{ fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-muted-foreground text-xs">FCR Moyen</p>
              <p className="text-lg font-bold text-green-700">1.25</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-muted-foreground text-xs">Aliment Total</p>
              <p className="text-lg font-bold text-blue-700">2,450 kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualité de l'eau */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Paramètres de Qualité de l'Eau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterQualityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="jour"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="temperature" fill="#ef4444" name="Température (°C)" />
                <Bar dataKey="oxygene" fill="#3b82f6" name="Oxygène dissous (mg/L)" />
                <Bar dataKey="ph" fill="#8b5cf6" name="pH" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-muted-foreground">Temp. Moy.</p>
              <p className="font-bold text-red-700">24.8°C</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <p className="text-muted-foreground">O₂ Moy.</p>
              <p className="font-bold text-blue-700">7.2 mg/L</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <p className="text-muted-foreground">pH Moy.</p>
              <p className="font-bold text-purple-700">7.25</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleEvolutionCharts;
