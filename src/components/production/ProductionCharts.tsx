
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell 
} from 'recharts';
import { TrendingUp, PieChart } from 'lucide-react';

const ProductionCharts = () => {
  const productionData = [
    { month: 'Jan', production: 1200, objectif: 1500, revenus: 8500, couts: 6200 },
    { month: 'Fév', production: 1800, objectif: 1600, revenus: 12200, couts: 8400 },
    { month: 'Mar', production: 2100, objectif: 1800, revenus: 14800, couts: 9600 },
    { month: 'Avr', production: 1900, objectif: 2000, revenus: 13500, couts: 8800 },
    { month: 'Mai', production: 2400, objectif: 2200, revenus: 16800, couts: 10200 },
    { month: 'Jun', production: 2300, objectif: 2300, revenus: 15900, couts: 9800 }
  ];

  const dailyData = [
    { day: 'Lun', production: 45, qualite: 92 },
    { day: 'Mar', production: 52, qualite: 94 },
    { day: 'Mer', production: 38, qualite: 89 },
    { day: 'Jeu', production: 61, qualite: 96 },
    { day: 'Ven', production: 55, qualite: 91 },
    { day: 'Sam', production: 48, qualite: 93 },
    { day: 'Dim', production: 42, qualite: 88 }
  ];

  const speciesData = [
    { name: 'Carpe', value: 35, color: '#14b8a6' },
    { name: 'Tilapia', value: 28, color: '#0ea5e9' },
    { name: 'Truite', value: 20, color: '#8b5cf6' },
    { name: 'Saumon', value: 17, color: '#f59e0b' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique de production */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-aqua-600" />
            Production vs Objectifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="productionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="objectif"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  fill="url(#productionGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par espèce */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-aqua-600" />
            Répartition par Espèce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={speciesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {speciesData.map((species, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: species.color }}
                ></div>
                <span>{species.name}: {species.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Quotidienne */}
      <Card>
        <CardHeader>
          <CardTitle>Production Quotidienne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="production" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rentabilité Mensuelle */}
      <Card>
        <CardHeader>
          <CardTitle>Rentabilité Mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenus" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="couts" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionCharts;
