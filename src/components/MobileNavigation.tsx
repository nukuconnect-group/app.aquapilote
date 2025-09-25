import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Fish, Utensils, Heart, BarChart3, Building, Settings, Factory, Activity, Calculator, UserCheck, ShoppingCart, Wifi } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const MobileNavigation = ({
  activeTab,
  onTabChange
}: MobileNavigationProps) => {
  const {
    t
  } = useSettings();
  const mainItems = [{
    id: 'dashboard',
    label: t('dashboard'),
    icon: Home,
    color: 'text-blue-600'
  }, {
    id: 'iot-control',
    label: t('iot-control'),
    icon: Wifi,
    color: 'text-cyan-600'
  }, {
    id: 'units',
    label: t('units'),
    icon: Factory,
    color: 'text-purple-600'
  }, {
    id: 'fish',
    label: t('fish'),
    icon: Fish,
    color: 'text-aqua-600'
  }, {
    id: 'settings',
    label: 'Plus',
    icon: Settings,
    color: 'text-gray-500'
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden shadow-lg backdrop-blur-sm px-[4px] py-[5px]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {mainItems.map(item => <Button key={item.id} variant="ghost" size="sm" className={`flex flex-col items-center py-1.5 px-1 h-auto text-xs min-w-0 flex-1 min-h-[44px] ${activeTab === item.id ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`} onClick={() => onTabChange(item.id)}>
            <item.icon className={`w-4 h-4 mb-0.5 ${activeTab === item.id ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs leading-tight truncate max-w-full font-medium">{item.label}</span>
          </Button>)}
      </div>
    </div>;
};
export default MobileNavigation;