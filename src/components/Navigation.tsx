
import React from 'react';
import { Home, Thermometer, Building2, Wrench, Fish, Utensils, Heart, Package, DollarSign, Calendar, Cloud, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag } from 'lucide-react';
interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange
}) => {
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
    <nav className="h-full flex flex-col bg-card border-border">
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-3 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => onTabChange(item.id)} 
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-r-2 border-primary shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
export default Navigation;
