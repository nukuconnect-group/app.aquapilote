import React from 'react';
import { Home, Building2, Wrench, Utensils, Heart, Package, Calendar, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag, Truck, UserCog, Database, Shield, MessageCircle, Headphones } from 'lucide-react';
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

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { open } = useSidebar();
  const { t, language } = useSettings();
  const { user } = useAuth();
  const { isTeamMember, teamMemberInfo } = useTeamMemberAccess();

  // Modules accessibles aux membres d'équipe selon leurs permissions
  const getTeamMemberAllowedTabs = () => {
    if (!isTeamMember || !teamMemberInfo) return null;
    
    const allowedTabs = new Set<string>();
    allowedTabs.add('dashboard'); // Toujours accès au dashboard
    
    teamMemberInfo.assignedUnits.forEach(unit => {
      const perms = unit.permissions;
      if (perms.canView) {
        allowedTabs.add('units');
        allowedTabs.add('infrastructures');
      }
      if (perms.canManageFeeding) {
        allowedTabs.add('feeding');
      }
      if (perms.canManageHealth) {
        allowedTabs.add('health');
      }
      if (perms.canManageProduction) {
        allowedTabs.add('production');
        allowedTabs.add('livestock');
      }
    });
    
    // Toujours accès aux paramètres de base
    allowedTabs.add('settings');
    
    return allowedTabs;
  };

  const allowedTabs = getTeamMemberAllowedTabs();

  const navigationGroups = [
    {
      label: language === 'fr' ? 'Tableau de bord' : 'Dashboard',
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: Home },
        { id: 'iot-control', label: t('iot-control'), icon: Wifi },
        { id: 'units', label: t('units'), icon: Building2 },
      ]
    },
    {
      label: language === 'fr' ? 'Production & Élevage' : 'Production & Livestock',
      items: [
        { id: 'infrastructures', label: t('infrastructures'), icon: Wrench },
        { id: 'livestock', label: t('livestock'), icon: Beef },
        { id: 'feeding', label: t('feeding'), icon: Utensils },
        { id: 'health', label: t('health'), icon: Heart },
        { id: 'production', label: 'Cycles de production', icon: Package },
      ]
    },
    {
      label: language === 'fr' ? 'Gestion Financière' : 'Financial Management',
      items: [
        { id: 'accounting', label: t('accounting'), icon: Calculator },
        { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
        { id: 'sales', label: t('sales'), icon: ShoppingBag },
        { id: 'suppliers', label: t('suppliers'), icon: Truck },
      ]
    },
    {
      label: language === 'fr' ? 'Ressources Humaines' : 'Human Resources',
      items: [
        { id: 'hr', label: t('hr'), icon: UserCheck },
        { id: 'team', label: t('team'), icon: Users },
      ]
    },
    {
      label: language === 'fr' ? 'Planification & Rapports' : 'Planning & Reports',
      items: [
        { id: 'planning', label: t('planning'), icon: Calendar },
        { id: 'reports', label: t('reports'), icon: FileText },
      ]
    },
    {
      label: language === 'fr' ? 'Outils & Aide' : 'Tools & Help',
      items: [
        { id: 'aqua-assistant', label: 'AquaAssistant IA', icon: MessageCircle },
        { id: 'support', label: language === 'fr' ? 'Support Client' : 'Customer Support', icon: Headphones },
      ]
    },
    {
      label: language === 'fr' ? 'Configuration' : 'Configuration',
      items: [
        { id: 'offline', label: language === 'fr' ? 'Mode hors ligne' : 'Offline Mode', icon: Database },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  // Ajouter l'option admin si l'utilisateur est admin
  if (user?.role === 'admin' && !isTeamMember) {
    navigationGroups.push({
      label: language === 'fr' ? 'Administration' : 'Administration',
      items: [
        { id: 'admin', label: t('admin'), icon: UserCog }
      ]
    });
  }

  // Filtrer les groupes et items selon les permissions du membre d'équipe
  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!allowedTabs) return true; // Non membre = accès complet
      return allowedTabs.has(item.id);
    })
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="overflow-y-auto">
        {/* Indicateur membre d'équipe */}
        {isTeamMember && teamMemberInfo && open && (
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Membre d'équipe</span>
            </div>
            <Badge variant="outline" className="mt-1 text-xs">
              {teamMemberInfo.role === 'custom' ? teamMemberInfo.customRole : teamMemberInfo.role}
            </Badge>
          </div>
        )}
        
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.id)}
                        isActive={isActive}
                        tooltip={open ? undefined : item.label}
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
