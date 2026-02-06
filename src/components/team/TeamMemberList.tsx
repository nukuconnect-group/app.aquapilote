import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { TeamMember } from '@/hooks/useTeamMembers';
import TeamMemberCard from './TeamMemberCard';

interface TeamMemberListProps {
  members: TeamMember[];
  isCreatingAccount: boolean;
  onCreateAccount: (member: TeamMember) => void;
  onViewCredentials: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onToggleStatus: (member: TeamMember) => void;
  onResetPassword: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  isCreatingAccount,
  onCreateAccount,
  onViewCredentials,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}) => {
  const { t } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('team_members_count')} ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('no_members')}</p>
            <p className="text-sm">{t('no_members_hint')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isCreatingAccount={isCreatingAccount}
                onCreateAccount={onCreateAccount}
                onViewCredentials={onViewCredentials}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onResetPassword={onResetPassword}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamMemberList;
