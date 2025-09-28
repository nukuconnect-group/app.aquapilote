
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: 'aqua' | 'ocean' | 'green' | 'yellow' | 'red';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'aqua'
}) => {
  const colorClasses = {
    aqua: 'bg-aqua-50 text-aqua-600 border-aqua-200',
    ocean: 'bg-ocean-50 text-ocean-600 border-ocean-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] w-full">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{value}</p>
            {change && (
              <p className={`text-xs sm:text-sm mt-1 truncate ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${colorClasses[color]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
