import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Trash2, Settings, Key, Eye, CheckCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { TeamMember } from '@/hooks/useTeamMembers';

interface TeamMemberCardProps {
  member: TeamMember;
  onViewCredentials: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onToggleStatus: (member: TeamMember) => void;
  onResetPassword: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onViewCredentials,
  onEdit,
  onToggleStatus,
  onResetPassword,
  onDelete,
}) => {
  const { t } = useSettings();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('status_active');
      case 'inactive': return t('status_inactive');
      case 'pending': return t('status_pending');
      default: return status;
    }
  };

  const getPermissionCount = (permissions: Record<string, boolean>) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className={member.user_id ? "ring-2 ring-green-500" : ""}>
          <AvatarFallback className={member.user_id ? "bg-green-100 text-green-700" : ""}>
            {member.member_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{member.member_name}</h4>
            {member.user_id && (
              <span title="Compte actif"><CheckCircle className="w-4 h-4 text-green-600" /></span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.member_email}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {member.custom_role || member.role}
            </Badge>
            {member.department && (
              <Badge variant="secondary" className="text-xs">{member.department}</Badge>
            )}
            <Badge className={getStatusColor(member.status)}>
              {getStatusLabel(member.status)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getPermissionCount(member.permissions)} permissions
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('account_created') || 'Compte actif'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-right text-sm text-muted-foreground hidden sm:block">
          <p>{t('added_on')} {new Date(member.invited_at).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onViewCredentials(member)} title={t('view_credentials')} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" disabled={!member.user_id}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(member)} title={t('edit_member')}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onToggleStatus(member)} title={t('toggle_status')}>
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onResetPassword(member)} title={t('reset_password')} disabled={!member.user_id}>
          <Key className="w-4 h-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(member)} title={t('delete_member')}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TeamMemberCard;
