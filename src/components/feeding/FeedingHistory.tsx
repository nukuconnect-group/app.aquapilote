
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, Thermometer, BarChart3, Printer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
}

interface FeedingHistoryProps {
  records: FeedingRecord[];
  onEdit: (record: FeedingRecord) => void;
  onDelete: (id: string) => void;
  onPrint: (record: FeedingRecord) => void;
}

const FeedingHistory = ({ records, onEdit, onDelete, onPrint }: FeedingHistoryProps) => {
  const sortedRecords = records.sort((a, b) => 
    new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
  );

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">Aucun enregistrement d'alimentation</p>
        </CardContent>
      </Card>
    );
  }

  // Données pour le graphique
  const feedingChartData = sortedRecords
    .slice()
    .reverse()
    .map(record => ({
      date: new Date(`${record.date} ${record.time}`).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      quantite: record.quantity,
      temperature: record.temperature
    }));

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Graphique d'évolution */}
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Évolution de l'Alimentation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 10 }} 
                  label={{ value: 'Quantité (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Température (°C)', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="quantite" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Quantité (kg)"
                  dot={{ r: 3 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Température (°C)"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      {sortedRecords.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm sm:text-base break-words">{record.feedType}</h4>
                  <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                    {record.quantity} {record.unit}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="break-words">
                      {new Date(`${record.date} ${record.time}`).toLocaleDateString('fr-FR')} à {record.time}
                    </span>
                  </div>
                  {record.temperature && (
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 flex-shrink-0" />
                      {record.temperature}°C
                    </div>
                  )}
                </div>
                
                {record.notes && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 break-words">{record.notes}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onPrint(record)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  title="Imprimer la fiche"
                >
                  <Printer className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(record)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete(record.id)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeedingHistory;
