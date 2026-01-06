import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
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
  MessageCircle
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
  const { t, language } = useSettings();
  const { user } = useAuth();
  const { isTeamMember, teamMemberInfo } = useTeamMemberAccess();

  // Obtenir les onglets autorisés pour les membres d'équipe
  const getAllowedTabs = () => {
    if (!isTeamMember || !teamMemberInfo) return null;
    
    const allowedTabs = new Set<string>(['dashboard', 'settings']);
    
    teamMemberInfo.assignedUnits.forEach(unit => {
      const perms = unit.permissions;
      if (perms.canView) {
        allowedTabs.add('units');
        allowedTabs.add('infrastructures');
      }
      if (perms.canManageFeeding) {
        allowedTabs.add('feeding');
      }
      if (perms.canManageHealth) {
        allowedTabs.add('health');
      }
      if (perms.canManageProduction) {
        allowedTabs.add('production');
        allowedTabs.add('livestock');
      }
    });
    
    return allowedTabs;
  };

  const allowedTabs = getAllowedTabs();
  
  const menuItems = [
    // Production & Élevage
    { 
      category: language === 'fr' ? 'Production & Élevage' : 'Production & Livestock',
      items: [
        { id: 'infrastructures', label: t('infrastructures'), icon: Building },
        { id: 'livestock', label: t('livestock'), icon: Beef },
        { id: 'feeding', label: t('feeding'), icon: Utensils },
        { id: 'health', label: t('health'), icon: Heart },
        { id: 'production', label: 'Cycles de production', icon: Package },
      ]
    },
    // Gestion financière
    {
      category: language === 'fr' ? 'Gestion Financière' : 'Financial Management',
      items: [
        { id: 'accounting', label: t('accounting'), icon: Calculator },
        { id: 'purchases', label: t('purchases'), icon: ShoppingCart },
        { id: 'sales', label: t('sales'), icon: ShoppingBag },
        { id: 'suppliers', label: t('suppliers'), icon: Truck },
      ]
    },
    // Ressources humaines
    {
      category: language === 'fr' ? 'Ressources Humaines' : 'Human Resources',
      items: [
        { id: 'hr', label: t('hr'), icon: UserCheck },
        { id: 'team', label: t('team'), icon: Users },
      ]
    },
    // Planification et rapports
    {
      category: language === 'fr' ? 'Planification & Rapports' : 'Planning & Reports',
      items: [
        { id: 'planning', label: t('planning'), icon: Calendar },
        { id: 'reports', label: t('reports'), icon: FileText }
      ]
    },
    // Outils
    {
      category: language === 'fr' ? 'Outils' : 'Tools',
      items: [
        { id: 'aqua-assistant', label: 'AquaAssistant IA', icon: MessageCircle }
      ]
    },
    // Configuration
    {
      category: language === 'fr' ? 'Configuration' : 'Configuration',
      items: [
        { id: 'offline', label: language === 'fr' ? 'Mode hors ligne' : 'Offline Mode', icon: Database },
        { id: 'settings', label: t('settings'), icon: Settings }
      ]
    }
  ];

  // Ajouter section Admin si l'utilisateur est admin et non membre d'équipe
  if (user?.role === 'admin' && !isTeamMember) {
    menuItems.push({
      category: language === 'fr' ? 'Administration' : 'Administration',
      items: [
        { id: 'admin', label: t('admin'), icon: UserCog }
      ]
    });
  }

  // Filtrer les items selon les permissions
  const filteredMenuItems = menuItems.map(category => ({
    ...category,
    items: category.items.filter(item => {
      if (!allowedTabs) return true;
      return allowedTabs.has(item.id);
    })
  })).filter(category => category.items.length > 0);

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] p-0 mobile-friendly-modal">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-responsive-title">
            {language === 'fr' ? 'Menu principal' : 'Main Menu'}
          </DialogTitle>
          
          {/* Indicateur membre d'équipe */}
          {isTeamMember && teamMemberInfo && (
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-primary" />
              <Badge variant="outline" className="text-xs">
                {teamMemberInfo.role === 'custom' ? teamMemberInfo.customRole : teamMemberInfo.role}
              </Badge>
            </div>
          )}
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-4 sm:space-y-6">
            {filteredMenuItems.map((category) => (
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
                        activeTab === item.id ? '' : 'text-muted-foreground'
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
