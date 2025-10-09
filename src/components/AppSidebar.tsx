import React from 'react';
import { Home, Thermometer, Building2, Wrench, Fish, Utensils, Heart, Package, DollarSign, Calendar, Cloud, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag, Shield, Truck, UserCog } from 'lucide-react';
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
  const { t } = useSettings();
  const { user } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'iot-control', label: t('iot-control'), icon: Wifi },
    { id: 'units', label: t('units'), icon: Building2 },
    { id: 'infrastructures', label: t('infrastructures'), icon: Wrench },
    { id: 'fish', label: t('fish'), icon: Fish },
    { id: 'livestock', label: t('livestock'), icon: Beef },
    { id: 'feeding', label: t('feeding'), icon: Utensils },
    { id: 'health', label: t('health'), icon: Heart },
    { id: 'transformation', label: t('transformation'), icon: Shield },
    { id: 'production', label: t('production'), icon: Package },
    { id: 'accounting', label: t('accounting'), icon: Calculator },
    { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
    { id: 'sales', label: t('sales'), icon: ShoppingBag },
    { id: 'suppliers', label: t('suppliers'), icon: Truck },
    { id: 'hr', label: t('hr'), icon: UserCheck },
    { id: 'planning', label: t('planning'), icon: Calendar },
    { id: 'weather', label: t('weather'), icon: Cloud },
    { id: 'team', label: t('team'), icon: Users },
    { id: 'reports', label: t('reports'), icon: FileText },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  // Ajouter l'option admin si l'utilisateur est admin
  if (user?.role === 'admin') {
    navigationItems.push({
      id: 'admin',
      label: t('admin'),
      icon: UserCog,
    });
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
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
      </SidebarContent>
    </Sidebar>
  );
}
