import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Calendar,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedingRecord {
  id: string;
  date: string;
  time?: string;
  feed_type?: string;
  quantity: number;
  temperature?: number;
  behavior?: string;
  infrastructure_id?: string;
  cycle_id?: string;
  notes?: string;
}

interface FeedStock {
  id: string;
  feed_type: string;
  cost?: number;
  quantity: number;
}

interface Infrastructure {
  id: string;
  infrastructure_name: string;
  infrastructure_type: string;
}

interface Cycle {
  id: string;
  name: string;
  status: string;
}

interface FeedingAnalyticsDashboardProps {
  records: FeedingRecord[];
  stocks: FeedStock[];
  infrastructures: Infrastructure[];
  cycles: Cycle[];
  unitName: string;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const FeedingAnalyticsDashboard = ({ 
  records, 
  stocks, 
  infrastructures, 
  cycles,
  unitName 
}: FeedingAnalyticsDashboardProps) => {
  
  // Calcul des statistiques principales
  const stats = useMemo(() => {
    const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
    const totalDistributions = records.length;
    
    // Estimation du coût basé sur les stocks
    const avgCostPerKg = stocks.reduce((sum, s) => {
      if (s.cost && s.quantity > 0) {
        return sum + (s.cost / s.quantity);
      }
      return sum;
    }, 0) / Math.max(stocks.filter(s => s.cost && s.quantity > 0).length, 1);
    
    const estimatedCost = totalQuantity * avgCostPerKg;
    
    // Quantité moyenne par distribution
    const avgPerDistribution = totalDistributions > 0 ? totalQuantity / totalDistributions : 0;
    
    // Distribution sur les 7 derniers jours
    const last7Days = records.filter(r => {
      const recordDate = parseISO(r.date);
      const daysDiff = Math.floor((new Date().getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    const quantityLast7Days = last7Days.reduce((sum, r) => sum + r.quantity, 0);
    
    return {
      totalQuantity,
      totalDistributions,
      estimatedCost,
      avgPerDistribution,
      quantityLast7Days
    };
  }, [records, stocks]);

  // Données pour le graphique temporel (par jour)
  const timelineData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayRecords = records.filter(r => r.date === dayStr);
      const quantity = dayRecords.reduce((sum, r) => sum + r.quantity, 0);
      const distributions = dayRecords.length;
      
      return {
        date: format(day, 'dd/MM', { locale: fr }),
        quantity,
        distributions
      };
    });
  }, [records]);

  // Données par infrastructure
  const infrastructureData = useMemo(() => {
    const dataMap = new Map<string, { name: string; quantity: number; distributions: number }>();
    
    // Initialiser avec toutes les infrastructures
    infrastructures.forEach(infra => {
      dataMap.set(infra.id, {
        name: infra.infrastructure_name,
        quantity: 0,
        distributions: 0
      });
    });
    
    // Ajouter les enregistrements sans infrastructure
    dataMap.set('none', {
      name: 'Non spécifié',
      quantity: 0,
      distributions: 0
    });
    
    // Compter les quantités
    records.forEach(record => {
      const key = record.infrastructure_id || 'none';
      const existing = dataMap.get(key);
      if (existing) {
        existing.quantity += record.quantity;
        existing.distributions += 1;
      }
    });
    
    return Array.from(dataMap.values()).filter(d => d.quantity > 0);
  }, [records, infrastructures]);

  // Données par cycle
  const cycleData = useMemo(() => {
    const dataMap = new Map<string, { name: string; quantity: number; distributions: number }>();
    
    // Initialiser avec tous les cycles
    cycles.forEach(cycle => {
      dataMap.set(cycle.id, {
        name: cycle.name,
        quantity: 0,
        distributions: 0
      });
    });
    
    // Ajouter les enregistrements sans cycle
    dataMap.set('none', {
      name: 'Hors cycle',
      quantity: 0,
      distributions: 0
    });
    
    // Compter les quantités
    records.forEach(record => {
      const key = record.cycle_id || 'none';
      const existing = dataMap.get(key);
      if (existing) {
        existing.quantity += record.quantity;
        existing.distributions += 1;
      }
    });
    
    return Array.from(dataMap.values()).filter(d => d.quantity > 0);
  }, [records, cycles]);

  // Données par type d'aliment
  const feedTypeData = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    records.forEach(record => {
      const type = record.feed_type || 'Non spécifié';
      dataMap.set(type, (dataMap.get(type) || 0) + record.quantity);
    });
    
    return Array.from(dataMap.entries()).map(([name, quantity]) => ({
      name,
      quantity
    }));
  }, [records]);

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune donnée disponible pour générer les statistiques.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{stats.totalQuantity.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Quantité totale</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.totalDistributions}</p>
            <p className="text-xs text-muted-foreground">Distributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.avgPerDistribution.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Moyenne/distribution</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{stats.quantityLast7Days.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{stats.estimatedCost.toFixed(0)} €</p>
            <p className="text-xs text-muted-foreground">Coût estimé</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique temporel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution de la consommation (30 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={Math.floor(timelineData.length / 10)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quantity" 
                name="Quantité (kg)" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="distributions" 
                name="Nombre distributions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Répartition par infrastructure */}
        {infrastructureData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Consommation par infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={infrastructureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" name="Quantité (kg)" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {infrastructureData.map((infra, idx) => (
                  <div key={idx} className="flex justify-between text-sm border-b pb-2">
                    <span className="font-medium">{infra.name}</span>
                    <div className="text-right">
                      <span className="text-muted-foreground">{infra.quantity.toFixed(1)} kg</span>
                      <span className="text-xs text-muted-foreground ml-2">({infra.distributions} dist.)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Répartition par cycle */}
        {cycleData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Consommation par cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cycleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {cycleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {cycleData.map((cycle, idx) => (
                  <div key={idx} className="flex justify-between text-sm border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-medium">{cycle.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{cycle.quantity.toFixed(1)} kg</span>
                      <span className="text-xs text-muted-foreground ml-2">({cycle.distributions} dist.)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Répartition par type d'aliment */}
      {feedTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Consommation par type d'aliment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  width={150}
                />
                <Tooltip />
                <Bar dataKey="quantity" name="Quantité (kg)" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tableau récapitulatif mensuel */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-medium">Mois</th>
                  <th className="pb-2 font-medium text-right">Quantité (kg)</th>
                  <th className="pb-2 font-medium text-right">Distributions</th>
                  <th className="pb-2 font-medium text-right">Moyenne/jour</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const monthsMap = new Map<string, { quantity: number; distributions: number; days: Set<string> }>();
                  
                  records.forEach(record => {
                    const date = parseISO(record.date);
                    const monthKey = format(date, 'yyyy-MM');
                    
                    if (!monthsMap.has(monthKey)) {
                      monthsMap.set(monthKey, { quantity: 0, distributions: 0, days: new Set() });
                    }
                    
                    const monthData = monthsMap.get(monthKey)!;
                    monthData.quantity += record.quantity;
                    monthData.distributions += 1;
                    monthData.days.add(record.date);
                  });
                  
                  return Array.from(monthsMap.entries())
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .slice(0, 6)
                    .map(([monthKey, data]) => (
                      <tr key={monthKey} className="border-b last:border-0">
                        <td className="py-2">{format(parseISO(monthKey + '-01'), 'MMMM yyyy', { locale: fr })}</td>
                        <td className="py-2 text-right font-medium">{data.quantity.toFixed(1)}</td>
                        <td className="py-2 text-right">{data.distributions}</td>
                        <td className="py-2 text-right">{(data.quantity / data.days.size).toFixed(1)}</td>
                      </tr>
                    ));
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedingAnalyticsDashboard;
