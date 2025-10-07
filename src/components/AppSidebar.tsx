import React from 'react';
import { Home, Thermometer, Building2, Wrench, Fish, Utensils, Heart, Package, DollarSign, Calendar, Cloud, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag, Shield, Truck } from 'lucide-react';
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

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { open } = useSidebar();

  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'iot-control', label: 'Contrôle & IoT', icon: Wifi },
    { id: 'units', label: 'Toutes les unités', icon: Building2 },
    { id: 'infrastructures', label: 'Infrastructures', icon: Wrench },
    { id: 'fish', label: 'Poissons', icon: Fish },
    { id: 'livestock', label: 'Cheptel', icon: Beef },
    { id: 'feeding', label: 'Alimentation', icon: Utensils },
    { id: 'health', label: 'Prophylaxie', icon: Heart },
    { id: 'transformation', label: 'Transformation', icon: Shield },
    { id: 'production', label: 'Production', icon: Package },
    { id: 'accounting', label: 'Comptabilité', icon: Calculator },
    { id: 'purchases', label: 'Achats', icon: ShoppingCart },
    { id: 'sales', label: 'Vente', icon: ShoppingBag },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'hr', label: 'Gestion RH', icon: UserCheck },
    { id: 'planning', label: 'Planification', icon: Calendar },
    { id: 'weather', label: 'Météo', icon: Cloud },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'reports', label: 'Rapports', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

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
