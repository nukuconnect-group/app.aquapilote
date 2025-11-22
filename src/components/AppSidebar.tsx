import React from 'react';
import { Home, Building2, Wrench, Utensils, Heart, Package, Calendar, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag, Truck, UserCog } from 'lucide-react';
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

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { open } = useSidebar();
  const { t, language } = useSettings();
  const { user } = useAuth();

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
      label: language === 'fr' ? 'Configuration' : 'Configuration',
      items: [
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  // Ajouter l'option admin si l'utilisateur est admin
  if (user?.role === 'admin') {
    navigationGroups.push({
      label: language === 'fr' ? 'Administration' : 'Administration',
      items: [
        { id: 'admin', label: t('admin'), icon: UserCog }
      ]
    });
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="overflow-y-auto">
        {navigationGroups.map((group) => (
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
