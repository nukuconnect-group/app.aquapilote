import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Star, Building2, MessageSquare } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface TeamStatsProps {
  totalMembers: number;
  activeMembers: number;
  totalUnits: number;
  totalModules: number;
}

const TeamStats: React.FC<TeamStatsProps> = ({ totalMembers, activeMembers, totalUnits, totalModules }) => {
  const { t } = useSettings();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalMembers}</p>
              <p className="text-sm text-muted-foreground">{t('total_members')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{activeMembers}</p>
              <p className="text-sm text-muted-foreground">{t('active_label')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{totalUnits}</p>
              <p className="text-sm text-muted-foreground">{t('units_label')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{totalModules}</p>
              <p className="text-sm text-muted-foreground">{t('modules_label')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamStats;
