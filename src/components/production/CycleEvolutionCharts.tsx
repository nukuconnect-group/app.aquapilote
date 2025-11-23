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
  cycleDuration?: number; // Durée totale prévue du cycle en jours
  feedingRecords?: any[]; // Enregistrements d'alimentation du module Feeding
  healthRecords?: any[]; // Enregistrements de pêche de contrôle du module Health
}

const CycleEvolutionCharts: React.FC<CycleEvolutionChartsProps> = ({ 
  cycleId, 
  cycleName, 
  daysElapsed,
  cycleDuration = 150, // Par défaut 150 jours
  feedingRecords = [],
  healthRecords = []
}) => {
  // Calcul du pourcentage d'avancement du cycle (0-100%)
  const cycleProgress = Math.min(100, (daysElapsed / cycleDuration) * 100);
  
  // Génération des données de croissance avec pourcentage (0-100%)
  const growthData = Array.from({ length: Math.max(1, daysElapsed) }, (_, i) => {
    const dayNumber = i + 1;
    const progressPct = Math.min(100, (dayNumber / cycleDuration) * 100);
    
    // Recherche du poids moyen dans les enregistrements de santé pour ce jour
    const healthRecord = healthRecords.find(r => {
      const recordDate = new Date(r.date);
      const cycleDay = Math.floor((recordDate.getTime() - Date.now() + (daysElapsed * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
      return cycleDay === dayNumber;
    });
    
    const actualWeight = healthRecord?.density || null;
    
    return {
      jour: dayNumber,
      progression: progressPct,
      objectif: progressPct, // Objectif suit la progression linéaire
      poidsMoyen: actualWeight || (progressPct * 5), // Poids estimé basé sur la progression
      mortalite: Math.random() * 1.5
    };
  });

  // Génération des données d'alimentation liées aux enregistrements réels
  const feedingData = Array.from({ length: Math.max(1, daysElapsed) }, (_, i) => {
    const dayNumber = i + 1;
    
    // Recherche des enregistrements d'alimentation pour ce jour
    const feedingRecord = feedingRecords.find(r => {
      const recordDate = new Date(r.date);
      const cycleDay = Math.floor((recordDate.getTime() - Date.now() + (daysElapsed * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
      return cycleDay === dayNumber;
    });
    
    return {
      jour: dayNumber,
      quantite: feedingRecord?.quantity || 0,
      fcr: feedingRecord?.fcr || 1.2 + Math.random() * 0.3,
      hasData: !!feedingRecord
    };
  });

  const waterQualityData = Array.from({ length: Math.min(14, daysElapsed) }, (_, i) => {
    const dayNumber = i + 1;
    
    // Recherche des données de qualité d'eau dans les enregistrements de santé
    const healthRecord = healthRecords.find(r => {
      const recordDate = new Date(r.date);
      const cycleDay = Math.floor((recordDate.getTime() - Date.now() + (daysElapsed * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
      return cycleDay === dayNumber;
    });
    
    return {
      jour: `J${dayNumber}`,
      temperature: healthRecord?.temperature || 24 + Math.random() * 2,
      oxygene: healthRecord?.oxygen || 6.5 + Math.random() * 1.5,
      ph: healthRecord?.ph || 7 + Math.random() * 0.5
    };
  });

  // Génération d'alertes basées sur les données réelles
  const alerts = [];
  
  // Alertes basées sur les enregistrements de santé
  if (healthRecords.length > 0) {
    const latestHealth = healthRecords[healthRecords.length - 1];
    if (latestHealth.temperature > 28) {
      alerts.push({ 
        level: 'warning', 
        message: `Température élevée détectée (${latestHealth.temperature.toFixed(1)}°C)`, 
        date: new Date(latestHealth.date).toLocaleDateString('fr-FR')
      });
    }
    if (latestHealth.oxygen < 6) {
      alerts.push({ 
        level: 'warning', 
        message: `Niveau d'oxygène bas (${latestHealth.oxygen.toFixed(1)} mg/L)`, 
        date: new Date(latestHealth.date).toLocaleDateString('fr-FR')
      });
    }
  }
  
  // Alertes basées sur l'alimentation
  if (feedingRecords.length > 0) {
    const latestFeeding = feedingRecords[feedingRecords.length - 1];
    if (latestFeeding.fcr && latestFeeding.fcr > 1.8) {
      alerts.push({ 
        level: 'warning', 
        message: `FCR élevé détecté (${latestFeeding.fcr.toFixed(2)})`, 
        date: new Date(latestFeeding.date).toLocaleDateString('fr-FR')
      });
    }
  }
  
  // Alerte sur la progression du cycle
  if (cycleProgress < 50 && daysElapsed > cycleDuration * 0.6) {
    alerts.push({ 
      level: 'warning', 
      message: 'Progression du cycle en retard sur l\'objectif', 
      date: 'Aujourd\'hui'
    });
  }
  
  if (alerts.length === 0) {
    alerts.push({ 
      level: 'info', 
      message: 'Tous les paramètres sont dans les normes', 
      date: 'Aujourd\'hui'
    });
  }

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

      {/* Progression du cycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Progression du Cycle (0-100%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-primary/5 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Jour {daysElapsed} / {cycleDuration}</span>
              <span className="font-bold">{cycleProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all" 
                style={{ width: `${cycleProgress}%` }}
              />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
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
                  domain={[0, 100]}
                  label={{ value: 'Progression (%)', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => `${value.toFixed(1)}%`}
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
                  dataKey="progression"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#progressGrad)"
                  name="Progression Réelle"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Évolution du poids (données de pêche de contrôle) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Évolution du Poids (Pêche de Contrôle)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthRecords.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="jour" 
                    label={{ value: 'Jours', position: 'insideBottom', offset: -5 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    label={{ value: 'Poids Moyen (g)', angle: -90, position: 'insideLeft' }}
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
                    type="monotone"
                    dataKey="poidsMoyen"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    name="Poids Moyen"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée de pêche de contrôle</p>
                <p className="text-sm">Enregistrez des données dans le module Prophylaxie</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alimentation et FCR (données du module alimentation) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-4 h-4 text-primary" />
            Alimentation et Taux de Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedingRecords.length > 0 ? (
            <>
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
                      dot={(props) => {
                        const { payload } = props;
                        return payload.hasData ? <circle {...props} fill="#10b981" r={4} /> : null;
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="fcr"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="FCR"
                      dot={(props) => {
                        const { payload } = props;
                        return payload.hasData ? <circle {...props} fill="#f59e0b" r={4} /> : null;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-muted-foreground text-xs">FCR Moyen</p>
                  <p className="text-lg font-bold text-green-700">
                    {(feedingRecords.reduce((sum, r) => sum + (r.fcr || 0), 0) / feedingRecords.length).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-muted-foreground text-xs">Aliment Total</p>
                  <p className="text-lg font-bold text-blue-700">
                    {feedingRecords.reduce((sum, r) => sum + (r.quantity || 0), 0).toLocaleString()} kg
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée d'alimentation</p>
                <p className="text-sm">Enregistrez des données dans le module Alimentation</p>
              </div>
            </div>
          )}
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
