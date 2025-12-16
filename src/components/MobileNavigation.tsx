import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Factory, Wifi, Menu } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useTeamMemberAccess } from '@/hooks/useTeamMemberAccess';
import MobileMenuModal from './MobileMenuModal';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const { t } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isTeamMember, teamMemberInfo } = useTeamMemberAccess();
  
  // Filtrer les items selon les permissions du membre d'équipe
  const getAllowedTabs = () => {
    if (!isTeamMember || !teamMemberInfo) return null;
    
    const allowedTabs = new Set<string>(['dashboard']);
    
    teamMemberInfo.assignedUnits.forEach(unit => {
      const perms = unit.permissions;
      if (perms.canView) {
        allowedTabs.add('units');
      }
    });
    
    return allowedTabs;
  };

  const allowedTabs = getAllowedTabs();
  
  const allMainItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'iot-control', label: t('iot-control'), icon: Wifi },
    { id: 'units', label: t('units'), icon: Factory },
  ];

  const mainItems = allMainItems.filter(item => {
    if (!allowedTabs) return true;
    return allowedTabs.has(item.id);
  });

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-1 py-1 z-50 md:hidden shadow-lg backdrop-blur-sm">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {mainItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-1.5 px-1 h-auto text-xs min-w-0 flex-1 min-h-[44px] ${
                activeTab === item.id 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={`w-4 h-4 mb-0.5 ${
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <span className="text-xs leading-tight truncate max-w-full font-medium">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center py-1.5 px-1 h-auto text-xs min-w-0 flex-1 min-h-[44px] text-muted-foreground"
            onClick={handleMenuClick}
          >
            <Menu className="w-4 h-4 mb-0.5 text-muted-foreground" />
            <span className="text-xs leading-tight truncate max-w-full font-medium">Plus</span>
          </Button>
        </div>
      </div>

      <MobileMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </>
  );
};

export default MobileNavigation;
