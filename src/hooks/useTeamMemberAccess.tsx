import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DashboardRole,
  computeAllowedModulesFromDashboards,
  isValidDashboardRole,
} from '@/lib/dashboardRoles';

// Permissions basées sur les modules réels de l'application
export interface TeamMemberModulePermissions {
  dashboard?: boolean;
  production?: boolean;
  feeding?: boolean;
  livestock?: boolean;
  health?: boolean;
  reproduction?: boolean;
  infrastructure?: boolean;
  environment?: boolean;
  iot?: boolean;
  accounting?: boolean;
  economics?: boolean;
  sales?: boolean;
  purchases?: boolean;
  suppliers?: boolean;
  planning?: boolean;
  reports?: boolean;
  settings?: boolean;
  [key: string]: boolean | undefined;
}

export interface TeamMemberUnitAccess {
  unitId: string;
  unitName: string;
  permissions: TeamMemberModulePermissions;
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
  globalPermissions: TeamMemberModulePermissions;
  assignedUnits: TeamMemberUnitAccess[];
  dashboardRoles: DashboardRole[];
}

export const useTeamMemberAccess = () => {
  const { user } = useAuth();
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [teamMemberInfo, setTeamMemberInfo] = useState<TeamMemberInfo | null>(null);
  const [allowedUnitIds, setAllowedUnitIds] = useState<string[]>([]);
  const [allowedModules, setAllowedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeamMemberStatus = async () => {
      if (!user?.id) {
        setIsTeamMember(false);
        setTeamMemberInfo(null);
        setAllowedUnitIds([]);
        setAllowedModules(new Set());
        setIsLoading(false);
        return;
      }

      try {
        // Vérifier si l'utilisateur est un membre d'équipe via user_id (pas email - plus sécurisé)
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('user_id', user.id)
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
            permissions: (unit.permissions as unknown) as TeamMemberModulePermissions
          }));

          // Récupérer les rôles dashboard assignés (production / administration)
          const rawDashboardRoles = (teamMember as { dashboard_roles?: unknown }).dashboard_roles;
          const dashboardRoles: DashboardRole[] = Array.isArray(rawDashboardRoles)
            ? (rawDashboardRoles.filter(isValidDashboardRole) as DashboardRole[])
            : [];

          // Modules autorisés : union de (permissions globales + permissions par unité + dashboards assignés)
          const modules = computeAllowedModulesFromDashboards(dashboardRoles);

          // Permissions globales du membre
          const globalPerms = (teamMember.permissions as unknown) as TeamMemberModulePermissions || {};
          Object.keys(globalPerms).forEach(key => {
            if (globalPerms[key]) {
              modules.add(key);
            }
          });

          // Permissions par unité
          assignedUnits.forEach(unit => {
            Object.keys(unit.permissions).forEach(key => {
              if (unit.permissions[key]) {
                modules.add(key);
              }
            });
          });

          const info: TeamMemberInfo = {
            id: teamMember.id,
            ownerId: teamMember.owner_id,
            memberName: teamMember.member_name,
            memberEmail: teamMember.member_email,
            role: teamMember.role,
            customRole: teamMember.custom_role || undefined,
            department: teamMember.department || undefined,
            status: teamMember.status,
            globalPermissions: globalPerms,
            assignedUnits,
            dashboardRoles,
          };

          setIsTeamMember(true);
          setTeamMemberInfo(info);
          setAllowedUnitIds(assignedUnits.map(u => u.unitId));
          setAllowedModules(modules);
        } else {
          setIsTeamMember(false);
          setTeamMemberInfo(null);
          setAllowedUnitIds([]);
          setAllowedModules(new Set());
        }
      } catch (error) {
        console.error('Error in team member check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeamMemberStatus();
  }, [user?.id]);

  // Vérifier si l'utilisateur a accès à une unité spécifique
  const hasAccessToUnit = (unitId: string): boolean => {
    if (!isTeamMember) return true; // Non-membre a accès à tout
    return allowedUnitIds.includes(unitId);
  };

  // Vérifier si l'utilisateur a accès à un module spécifique
  const hasAccessToModule = (moduleId: string): boolean => {
    if (!isTeamMember) return true; // Non-membre a accès à tout
    return allowedModules.has(moduleId);
  };

  // Obtenir les permissions pour une unité spécifique
  const getUnitPermissions = (unitId: string): TeamMemberModulePermissions | null => {
    if (!isTeamMember || !teamMemberInfo) return null;
    const unitAccess = teamMemberInfo.assignedUnits.find(u => u.unitId === unitId);
    return unitAccess?.permissions || null;
  };

  // Vérifier une permission spécifique pour une unité
  const hasPermissionForUnit = (unitId: string, moduleId: string): boolean => {
    if (!isTeamMember) return true; // Non-membre a toutes les permissions
    const permissions = getUnitPermissions(unitId);
    return permissions?.[moduleId] ?? false;
  };

  // Obtenir la liste des modules autorisés
  const getAllowedModulesList = (): string[] => {
    return Array.from(allowedModules);
  };

  return {
    isTeamMember,
    teamMemberInfo,
    allowedUnitIds,
    allowedModules,
    isLoading,
    hasAccessToUnit,
    hasAccessToModule,
    getUnitPermissions,
    hasPermissionForUnit,
    getAllowedModulesList
  };
};
