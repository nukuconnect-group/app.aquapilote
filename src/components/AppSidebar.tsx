import React from 'react';
import { Home, Building2, Wrench, Utensils, Heart, Package, Calendar, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag, Truck, UserCog, Database, Shield, MessageCircle, Headphones, BarChart3, Bell } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberAccess } from '@/hooks/useTeamMemberAccess';
import { Badge } from '@/components/ui/badge';
import { hasAssignedModule } from '@/lib/moduleAccess';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { open } = useSidebar();
  const { t, language } = useSettings();
  const { user } = useAuth();
  const { isTeamMember, teamMemberInfo, hasAccessToModule } = useTeamMemberAccess();

  // Verifier si un tab est accessible
  const isTabAllowed = (tabId: string): boolean => {
    if (!isTeamMember) return true; // Non-membre = acces complet
    return hasAssignedModule(tabId, hasAccessToModule);
  };

  const navigationGroups = [
    {
      label: t('category_dashboard'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: Home },
        { id: 'performance-alerts', label: t('performance_alerts'), icon: Bell },
        { id: 'iot-control', label: t('iot-control'), icon: Wifi },
        { id: 'units', label: t('units'), icon: Building2 },
      ]
    },
    {
      label: t('category_production'),
      items: [
        { id: 'infrastructures', label: t('infrastructures'), icon: Wrench },
        { id: 'livestock', label: t('livestock'), icon: Beef },
        { id: 'feeding', label: t('feeding'), icon: Utensils },
        { id: 'health', label: t('health'), icon: Heart },
        { id: 'production', label: t('production'), icon: Package },
      ]
    },
    {
      label: t('category_financial'),
      items: [
        { id: 'accounting', label: t('accounting'), icon: Calculator },
        { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
        { id: 'sales', label: t('sales'), icon: ShoppingBag },
        { id: 'suppliers', label: t('suppliers'), icon: Truck },
      ]
    },
    {
      label: t('category_hr'),
      items: [
        { id: 'hr', label: t('hr'), icon: UserCheck },
        { id: 'team', label: t('team'), icon: Users },
      ]
    },
    {
      label: t('category_planning'),
      items: [
        { id: 'analytics', label: t('analytics'), icon: BarChart3 },
        { id: 'planning', label: t('planning'), icon: Calendar },
        { id: 'reports', label: t('reports'), icon: FileText },
      ]
    },
    {
      label: t('category_tools'),
      items: [
        { id: 'aqua-assistant', label: t('aqua_assistant'), icon: MessageCircle },
        { id: 'support', label: t('customer_support'), icon: Headphones },
      ]
    },
    {
      label: t('category_config'),
      items: [
        { id: 'offline', label: t('offline_mode_menu'), icon: Database },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  // Ajouter l'option admin si l'utilisateur est admin
  if (user?.role === 'admin' && !isTeamMember) {
    navigationGroups.push({
      label: t('category_admin'),
      items: [
        { id: 'admin', label: t('admin'), icon: UserCog }
      ]
    });
  }

  // Filtrer les groupes et items selon les permissions du membre d'equipe
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => isTabAllowed(item.id))
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="overflow-y-auto">
        {/* Indicateur membre d'equipe */}
        {isTeamMember && teamMemberInfo && open && (
          <div className="px-3 py-2 border-b border-sidebar-border/50">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Shield className="w-3 h-3" />
              <span>{t('team_member')}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs text-white border-white/30 bg-white/10">
                {teamMemberInfo.role === 'custom' ? teamMemberInfo.customRole : teamMemberInfo.role}
              </Badge>
              {(teamMemberInfo.dashboardRoles ?? []).map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px] bg-white/20 text-white">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-white/80 font-semibold tracking-wide uppercase text-[11px]">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        size="sm"
                        onClick={() => onTabChange(item.id)}
                        isActive={isActive}
                        tooltip={open ? undefined : item.label}
                        className="text-white hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
