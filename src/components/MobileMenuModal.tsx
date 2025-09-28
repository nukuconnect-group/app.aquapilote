
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Utensils, 
  Heart, 
  BarChart3, 
  Building, 
  Calendar, 
  CloudRain, 
  Users, 
  FileText,
  Activity,
  Wrench,
  Beef,
  Package,
  Calculator,
  UserCheck,
  ShoppingCart,
  ShoppingBag,
  Settings
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileMenuModal = ({ isOpen, onClose, activeTab, onTabChange }: MobileMenuModalProps) => {
  const { t } = useSettings();
  
  const menuItems = [
    // Modules essentiels
    { 
      category: 'Modules Essentiels',
      items: [
        { id: 'infrastructures', label: t('infrastructures'), icon: Building, color: 'text-gray-600' },
        { id: 'livestock', label: t('livestock'), icon: Beef, color: 'text-brown-600' },
        { id: 'feeding', label: t('feeding'), icon: Utensils, color: 'text-orange-600' },
        { id: 'health', label: t('health'), icon: Heart, color: 'text-red-600' },
      ]
    },
    // Gestion et production
    {
      category: 'Gestion & Production',
      items: [
        { id: 'production', label: t('production'), icon: BarChart3, color: 'text-green-600' },
        { id: 'accounting', label: t('accounting'), icon: Calculator, color: 'text-emerald-600' },
        { id: 'purchases', label: t('purchases'), icon: ShoppingCart, color: 'text-blue-600' },
        { id: 'sales', label: t('sales'), icon: ShoppingBag, color: 'text-pink-600' },
        { id: 'hr', label: t('hr'), icon: UserCheck, color: 'text-indigo-600' },
      ]
    },
    // Planification et rapports
    {
      category: 'Planification & Rapports',
      items: [
        { id: 'planning', label: t('planning'), icon: Calendar, color: 'text-indigo-600' },
        { id: 'weather', label: t('weather'), icon: CloudRain, color: 'text-sky-600' },
        { id: 'team', label: t('team'), icon: Users, color: 'text-pink-600' },
        { id: 'reports', label: t('reports'), icon: FileText, color: 'text-slate-600' }
      ]
    },
    // Configuration
    {
      category: 'Configuration',
      items: [
        { id: 'settings', label: t('settings'), icon: Settings, color: 'text-gray-600' }
      ]
    }
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm max-h-[90vh] p-0 mobile-friendly-modal mx-2">
        <DialogHeader className="p-3 sm:p-4 pb-2">
          <DialogTitle className="text-base sm:text-lg lg:text-xl font-bold">Menu principal</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-3 sm:px-4 pb-4 max-h-[75vh]">
          <div className="space-y-3 sm:space-y-4">
            {menuItems.map((category) => (
              <div key={category.category}>
                <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {category.category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'outline'}
                      className="h-14 sm:h-16 flex flex-col items-center justify-center space-y-1 text-xs p-2 min-h-[56px] touch-manipulation"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        activeTab === item.id ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                      <span className="font-medium leading-tight text-center text-[10px] sm:text-xs truncate">
                        {item.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MobileMenuModal;
