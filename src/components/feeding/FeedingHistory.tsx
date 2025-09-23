
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, Thermometer } from 'lucide-react';

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
}

const FeedingHistory = ({ records, onEdit, onDelete }: FeedingHistoryProps) => {
  const sortedRecords = records.sort((a, b) => 
    new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
  );

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Aucun enregistrement d'alimentation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm sm:text-base">{record.feedType}</h4>
                  <Badge variant="secondary" className="w-fit">
                    {record.quantity} {record.unit}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(`${record.date} ${record.time}`).toLocaleDateString('fr-FR')} à {record.time}
                  </div>
                  {record.temperature && (
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {record.temperature}°C
                    </div>
                  )}
                </div>
                
                {record.notes && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">{record.notes}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEdit(record)}
                  className="h-8 px-2"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete(record.id)}
                  className="h-8 px-2 text-red-600 hover:text-red-700"
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
