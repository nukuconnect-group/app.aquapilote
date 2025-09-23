
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
  ShoppingCart
} from 'lucide-react';

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileMenuModal = ({ isOpen, onClose, activeTab, onTabChange }: MobileMenuModalProps) => {
  const menuItems = [
    // Modules essentiels
    { 
      category: 'Modules Essentiels',
      items: [
        { id: 'infrastructures', label: 'Infrastructures', icon: Building, color: 'text-gray-600' },
        { id: 'livestock', label: 'Cheptel', icon: Beef, color: 'text-brown-600' },
        { id: 'feeding', label: 'Alimentation', icon: Utensils, color: 'text-orange-600' },
        { id: 'health', label: 'Prophylaxie', icon: Heart, color: 'text-red-600' },
      ]
    },
    // Gestion et production
    {
      category: 'Gestion & Production',
      items: [
        { id: 'production', label: 'Production', icon: BarChart3, color: 'text-green-600' },
        { id: 'accounting', label: 'Comptabilité', icon: Calculator, color: 'text-emerald-600' },
        { id: 'hr', label: 'RH & Paie', icon: UserCheck, color: 'text-indigo-600' },
        { id: 'sales', label: 'Vente', icon: ShoppingCart, color: 'text-pink-600' },
      ]
    },
    // Planification et rapports
    {
      category: 'Planification & Rapports',
      items: [
        { id: 'planning', label: 'Planification', icon: Calendar, color: 'text-indigo-600' },
        { id: 'weather', label: 'Météo', icon: CloudRain, color: 'text-sky-600' },
        { id: 'team', label: 'Équipe', icon: Users, color: 'text-pink-600' },
        { id: 'reports', label: 'Rapports', icon: FileText, color: 'text-slate-600' }
      ]
    }
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] p-0 mobile-friendly-modal">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-responsive-title">Menu principal</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-4 sm:space-y-6">
            {menuItems.map((category) => (
              <div key={category.category}>
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wide">
                  {category.category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'outline'}
                      className="h-16 sm:h-18 flex flex-col items-center justify-center space-y-1 text-xs p-2 min-h-[60px] touch-manipulation"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        activeTab === item.id ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                      <span className="font-medium leading-tight text-center text-xs">
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
