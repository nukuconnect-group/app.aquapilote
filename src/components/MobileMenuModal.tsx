import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home,
  Wifi,
  Factory,
  Utensils, 
  Heart, 
  Building, 
  Calendar, 
  Users, 
  FileText,
  Beef,
  Package,
  Calculator,
  UserCheck,
  ShoppingCart,
  ShoppingBag,
  Settings,
  Truck,
  UserCog,
  Database,
  Shield,
  MessageCircle,
  Headphones,
  BarChart3,
  Bell
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberAccess } from '@/hooks/useTeamMemberAccess';
import { Badge } from '@/components/ui/badge';

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileMenuModal = ({ isOpen, onClose, activeTab, onTabChange }: MobileMenuModalProps) => {
  const { t } = useSettings();
  const { user } = useAuth();
  const { isTeamMember, teamMemberInfo, hasAccessToModule } = useTeamMemberAccess();

  // Mapping des IDs de tabs vers les IDs de modules
  const tabToModuleMapping: Record<string, string> = {
    'dashboard': 'dashboard',
    'iot-control': 'iot',
    'units': 'infrastructure',
    'infrastructures': 'infrastructure',
    'livestock': 'livestock',
    'feeding': 'feeding',
    'health': 'health',
    'production': 'production',
    'accounting': 'accounting',
    'purchases': 'purchases',
    'sales': 'sales',
    'suppliers': 'suppliers',
    'hr': 'accounting',
    'team': 'settings',
    'planning': 'planning',
    'reports': 'reports',
    'aqua-assistant': 'dashboard',
    'support': 'support',
    'offline': 'settings',
    'settings': 'settings',
    'admin': 'admin',
    'analytics': 'reports',
    'performance-alerts': 'dashboard'
  };

  const isTabAllowed = (tabId: string): boolean => {
    if (!isTeamMember) return true;
    const moduleId = tabToModuleMapping[tabId] || tabId;
    return hasAccessToModule(moduleId);
  };
  
  const menuItems = [
    // Tableau de bord
    {
      category: t('category_dashboard'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: Home },
        { id: 'performance-alerts', label: t('performance_alerts'), icon: Bell },
        { id: 'iot-control', label: t('iot-control'), icon: Wifi },
        { id: 'units', label: t('units'), icon: Factory },
      ]
    },
    // Production & Elevage
    { 
      category: t('category_production'),
      items: [
        { id: 'infrastructures', label: t('infrastructures'), icon: Building },
        { id: 'livestock', label: t('livestock'), icon: Beef },
        { id: 'feeding', label: t('feeding'), icon: Utensils },
        { id: 'health', label: t('health'), icon: Heart },
        { id: 'production', label: t('production_cycles'), icon: Package },
      ]
    },
    // Gestion financiere
    {
      category: t('category_financial'),
      items: [
        { id: 'accounting', label: t('accounting'), icon: Calculator },
        { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
        { id: 'sales', label: t('sales'), icon: ShoppingBag },
        { id: 'suppliers', label: t('suppliers'), icon: Truck },
      ]
    },
    // Ressources humaines
    {
      category: t('category_hr'),
      items: [
        { id: 'hr', label: t('hr'), icon: UserCheck },
        { id: 'team', label: t('team'), icon: Users },
      ]
    },
    // Planification et rapports
    {
      category: t('category_planning'),
      items: [
        { id: 'analytics', label: t('analytics'), icon: BarChart3 },
        { id: 'planning', label: t('planning'), icon: Calendar },
        { id: 'reports', label: t('reports'), icon: FileText }
      ]
    },
    // Outils & Aide
    {
      category: t('category_tools'),
      items: [
        { id: 'aqua-assistant', label: t('aqua_assistant'), icon: MessageCircle },
        { id: 'support', label: t('customer_support'), icon: Headphones }
      ]
    },
    // Configuration
    {
      category: t('category_config'),
      items: [
        { id: 'offline', label: t('offline_mode_menu'), icon: Database },
        { id: 'settings', label: t('settings'), icon: Settings }
      ]
    }
  ];

  // Ajouter section Admin si l'utilisateur est admin et non membre d'equipe
  if (user?.role === 'admin' && !isTeamMember) {
    menuItems.push({
      category: t('category_admin'),
      items: [
        { id: 'admin', label: t('admin'), icon: UserCog }
      ]
    });
  }

  // Filtrer les items selon les permissions
  const filteredMenuItems = menuItems.map(category => ({
    ...category,
    items: category.items.filter(item => isTabAllowed(item.id))
  })).filter(category => category.items.length > 0);

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="left" className="p-0 w-[62vw] max-w-[220px] flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border">
        <SheetHeader className="p-4 pb-2 border-b border-sidebar-border">
          <SheetTitle className="text-base text-sidebar-foreground">
            {t('main_menu')}
          </SheetTitle>
          
          {/* Indicateur membre d'equipe */}
          {isTeamMember && teamMemberInfo && (
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-white" />
              <Badge variant="outline" className="text-xs text-white border-white/30 bg-white/10">
                {teamMemberInfo.role === 'custom' ? teamMemberInfo.customRole : teamMemberInfo.role}
              </Badge>
            </div>
          )}
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-3 pt-3 pb-6">
          <div className="space-y-3">
            {filteredMenuItems.map((category) => (
              <div key={category.category}>
                <h3 className="text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-wide px-1">
                  {category.category}
                </h3>
                <div className="flex flex-col gap-0.5">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full h-8 px-2 flex flex-row items-center gap-2 text-left rounded-md transition-colors touch-manipulation ${
                        activeTab === item.id
                          ? 'bg-white/20 text-white'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm leading-none truncate">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenuModal;
