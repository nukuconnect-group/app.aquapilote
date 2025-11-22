
import React from 'react';
import { Home, Thermometer, Building2, Wrench, Utensils, Heart, Package, DollarSign, Calendar, Cloud, Users, FileText, Settings, Beef, Calculator, UserCheck, ShoppingCart, Wifi, ShoppingBag, Shield, Truck, UserCog } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const { t } = useSettings();
  const { user } = useAuth();
  
  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'iot-control', label: t('iot-control'), icon: Wifi },
    { id: 'units', label: t('units'), icon: Building2 },
    { id: 'infrastructures', label: t('infrastructures'), icon: Wrench },
    { id: 'livestock', label: t('livestock'), icon: Beef },
    { id: 'feeding', label: t('feeding'), icon: Utensils },
    { id: 'health', label: t('health'), icon: Heart },
    { id: 'production', label: 'Cycles de production', icon: Package },
    { id: 'accounting', label: t('accounting'), icon: Calculator },
    { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
    { id: 'sales', label: t('sales'), icon: ShoppingBag },
    { id: 'suppliers', label: t('suppliers'), icon: Truck },
    { id: 'hr', label: t('hr'), icon: UserCheck },
    { id: 'planning', label: t('planning'), icon: Calendar },
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
