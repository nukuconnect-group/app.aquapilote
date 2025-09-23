import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
const ProductionChart = () => {
  const data = [{
    month: 'Jan',
    production: 1.2,
    objectif: 1.5,
    revenus: 8500
  }, {
    month: 'Fév',
    production: 1.8,
    objectif: 1.6,
    revenus: 12200
  }, {
    month: 'Mar',
    production: 2.1,
    objectif: 1.8,
    revenus: 14800
  }, {
    month: 'Avr',
    production: 1.9,
    objectif: 2.0,
    revenus: 13500
  }, {
    month: 'Mai',
    production: 2.4,
    objectif: 2.2,
    revenus: 16800
  }, {
    month: 'Jun',
    production: 2.3,
    objectif: 2.3,
    revenus: 15900
  }];
  return <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-aqua-600" />
          <span className="text-sm">Évolution de la Production</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="objectifGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} label={{
              value: 'Tonnes',
              angle: -90,
              position: 'insideLeft'
            }} />
              <Tooltip contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }} formatter={(value, name) => [`${value}T`, name === 'production' ? 'Production réelle' : 'Objectif']} />
              <Area type="monotone" dataKey="objectif" stroke="#0ea5e9" strokeWidth={2} fill="url(#objectifGradient)" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="production" stroke="#14b8a6" strokeWidth={3} fill="url(#productionGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-aqua-500 rounded-full"></div>
            <span className="text-gray-600">Production réelle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-ocean-500 rounded-full bg-transparent"></div>
            <span className="text-gray-600">Objectif mensuel</span>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default ProductionChart;