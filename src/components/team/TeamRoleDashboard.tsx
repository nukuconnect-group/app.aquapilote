import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Building2, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamMembers';
import { useSettings } from '@/contexts/SettingsContext';

interface ModulePermission {
  id: string;
  label: string;
  description: string;
}

interface TeamRoleDashboardProps {
  members: TeamMember[];
  modulePermissions: ModulePermission[];
  onEditMember: (member: TeamMember) => void;
}

const TeamRoleDashboard: React.FC<TeamRoleDashboardProps> = ({ members, modulePermissions, onEditMember }) => {
  const { t } = useSettings();

  const activeMembers = members.filter((m) => m.status === 'active');
  const membersByRole = members.reduce((acc, member) => {
    const role = member.custom_role || member.role || 'Membre';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);
  const membersByDept = members.reduce((acc, member) => {
    const dept = member.department || 'Non assigné';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">Actif</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">Inactif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">En attente</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getPermissionCount = (member: TeamMember) => Object.values(member.permissions || {}).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{members.length}</p>
            <p className="text-xs text-muted-foreground">Total membres</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold">{activeMembers.length}</p>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold">{Object.keys(membersByRole).length}</p>
            <p className="text-xs text-muted-foreground">Rôles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-purple-600" />
            <p className="text-2xl font-bold">{Object.keys(membersByDept).length}</p>
            <p className="text-xs text-muted-foreground">Départements</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Membres par rôle
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          {Object.entries(membersByRole).map(([role, roleMembers]) => (
            <div key={role} className="border rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm sm:text-base">{t(role) || role}</h4>
                  <Badge variant="outline" className="text-xs">{roleMembers.length} membre(s)</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {roleMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.member_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.member_email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(member.status)}
                      <Badge variant="secondary" className="text-xs">{getPermissionCount(member)} modules</Badge>
                      <Button variant="ghost" size="sm" onClick={() => onEditMember(member)} className="h-7 w-7 p-0">
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(membersByRole).length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun membre dans l'équipe</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            Matrice des permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Ajoutez des membres pour voir la matrice</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold sticky left-0 bg-background min-w-[120px]">Membre</th>
                    {modulePermissions.slice(0, 10).map((mod) => (
                      <th key={mod.id} className="text-center p-2 font-medium min-w-[70px]">
                        <span className="hidden sm:inline">{mod.label}</span>
                        <span className="sm:hidden">{mod.label.slice(0, 4)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 sticky left-0 bg-background">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate max-w-[100px]">{member.member_name}</span>
                          {getStatusBadge(member.status)}
                        </div>
                      </td>
                      {modulePermissions.slice(0, 10).map((mod) => (
                        <td key={mod.id} className="text-center p-2">
                          {member.permissions[mod.id] ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamRoleDashboard;
