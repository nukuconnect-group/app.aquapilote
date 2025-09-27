
import React from 'react';
import { Home, Thermometer, Building2, Wrench, Fish, Utensils, Heart, Package, DollarSign, Calendar, Cloud, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar 
} from '@/components/ui/sidebar';
interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const { state } = useSidebar();
  const navigationItems = [{
    id: 'dashboard',
    label: 'Tableau de Bord',
    icon: Home
  }, {
    id: 'units',
    label: 'Toutes les unités',
    icon: Building2
  }, {
    id: 'infrastructures',
    label: 'Infrastructures',
    icon: Wrench
  }, {
    id: 'fish',
    label: 'Poissons',
    icon: Fish
  }, {
    id: 'livestock',
    label: 'Cheptel',
    icon: Beef
  }, {
    id: 'feeding',
    label: 'Alimentation',
    icon: Utensils
  }, {
    id: 'health',
    label: 'Prophylaxie',
    icon: Heart
  }, {
    id: 'production',
    label: 'Production',
    icon: Package
  }, {
    id: 'accounting',
    label: 'Comptabilité',
    icon: Calculator
  }, {
    id: 'purchases',
    label: 'Achats',
    icon: ShoppingCart
  }, {
    id: 'sales',
    label: 'Vente',
    icon: ShoppingBag
  }, {
    id: 'hr',
    label: 'Gestion RH',
    icon: UserCheck
  }, {
    id: 'planning',
    label: 'Planification',
    icon: Calendar
  }, {
    id: 'weather',
    label: 'Météo',
    icon: Cloud
  }, {
    id: 'iot-control',
    label: 'Contrôle & IoT',
    icon: Wifi
  }, {
    id: 'team',
    label: 'Équipe',
    icon: Users
  }, {
    id: 'reports',
    label: 'Rapports',
    icon: FileText
  }, {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings
  }];
  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <Icon className="w-4 h-4" />
                      {state !== "collapsed" && <span>{item.label}</span>}
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
};
export default Navigation;
