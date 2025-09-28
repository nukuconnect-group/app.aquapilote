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
  return <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden shadow-lg backdrop-blur-sm safe-area-inset-bottom">
      <div className="flex justify-around items-center w-full py-2 px-1">
        {mainItems.map(item => 
          <Button 
            key={item.id} 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center py-2 px-1 h-auto min-w-0 flex-1 min-h-[56px] transition-colors ${
              activeTab === item.id 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`} 
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 transition-colors ${
              activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className="text-[10px] sm:text-xs font-medium truncate max-w-full leading-tight text-center">
              {item.label}
            </span>
          </Button>
        )}
      </div>
    </div>;
};
export default MobileNavigation;