import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/SettingsContext';
import { TeamMember } from '@/hooks/useTeamMembers';

interface ModulePermission {
  id: string;
  label: string;
  description: string;
}

interface PermissionsOverviewProps {
  modulePermissions: ModulePermission[];
  teamMembers: TeamMember[];
}

const PermissionsOverview: React.FC<PermissionsOverviewProps> = ({ modulePermissions, teamMembers }) => {
  const { t } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('available_permissions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulePermissions.map((module) => {
            const membersWithAccess = teamMembers.filter(m => m.permissions[module.id]);
            return (
              <div key={module.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{module.label}</h4>
                <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                <Badge variant="secondary">
                  {membersWithAccess.length} {membersWithAccess.length !== 1 ? t('members_with_access') : t('member_with_access')}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsOverview;
