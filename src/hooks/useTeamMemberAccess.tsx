import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMemberPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageFeeding: boolean;
  canManageHealth: boolean;
  canManageProduction: boolean;
}

export interface TeamMemberUnitAccess {
  unitId: string;
  unitName: string;
  permissions: TeamMemberPermissions;
}

export interface TeamMemberInfo {
  id: string;
  ownerId: string;
  memberName: string;
  memberEmail: string;
  role: string;
  customRole?: string;
  department?: string;
  status: string;
  assignedUnits: TeamMemberUnitAccess[];
}

export const useTeamMemberAccess = () => {
  const { user } = useAuth();
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamMemberInfo, setTeamMemberInfo] = useState<TeamMemberInfo | null>(null);
  const [allowedUnitIds, setAllowedUnitIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeamMemberStatus = async () => {
      if (!user?.email) {
        setIsTeamMember(false);
        setTeamMemberInfo(null);
        setAllowedUnitIds([]);
        setIsLoading(false);
        return;
      }

      try {
        // Vérifier si l'utilisateur est un membre d'équipe
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('member_email', user.email.toLowerCase())
          .eq('status', 'active')
          .maybeSingle();

        if (teamError) {
          console.error('Error checking team member status:', teamError);
          setIsLoading(false);
          return;
        }

        if (teamMember) {
          // C'est un membre d'équipe - charger ses unités assignées
          const { data: memberUnits, error: unitsError } = await supabase
            .from('team_member_units')
            .select('*')
            .eq('team_member_id', teamMember.id);

          if (unitsError) {
            console.error('Error fetching team member units:', unitsError);
          }

          const assignedUnits: TeamMemberUnitAccess[] = (memberUnits || []).map(unit => ({
            unitId: unit.unit_id,
            unitName: unit.unit_name,
            permissions: (unit.permissions as unknown) as TeamMemberPermissions
          }));

          const info: TeamMemberInfo = {
            id: teamMember.id,
            ownerId: teamMember.owner_id,
            memberName: teamMember.member_name,
            memberEmail: teamMember.member_email,
            role: teamMember.role,
            customRole: teamMember.custom_role || undefined,
            department: teamMember.department || undefined,
            status: teamMember.status,
            assignedUnits
          };

          setIsTeamMember(true);
          setTeamMemberInfo(info);
          setAllowedUnitIds(assignedUnits.map(u => u.unitId));
        } else {
          setIsTeamMember(false);
          setTeamMemberInfo(null);
          setAllowedUnitIds([]);
        }
      } catch (error) {
        console.error('Error in team member check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeamMemberStatus();
  }, [user?.email]);

  // Vérifier si l'utilisateur a accès à une unité spécifique
  const hasAccessToUnit = (unitId: string): boolean => {
    if (!isTeamMember) return true; // Non-membre a accès à tout
    return allowedUnitIds.includes(unitId);
  };

  // Obtenir les permissions pour une unité spécifique
  const getUnitPermissions = (unitId: string): TeamMemberPermissions | null => {
    if (!isTeamMember || !teamMemberInfo) return null;
    const unitAccess = teamMemberInfo.assignedUnits.find(u => u.unitId === unitId);
    return unitAccess?.permissions || null;
  };

  // Vérifier une permission spécifique pour une unité
  const hasPermission = (unitId: string, permission: keyof TeamMemberPermissions): boolean => {
    if (!isTeamMember) return true; // Non-membre a toutes les permissions
    const permissions = getUnitPermissions(unitId);
    return permissions?.[permission] ?? false;
  };

  return {
    isTeamMember,
    teamMemberInfo,
    allowedUnitIds,
    isLoading,
    hasAccessToUnit,
    getUnitPermissions,
    hasPermission
  };
};
