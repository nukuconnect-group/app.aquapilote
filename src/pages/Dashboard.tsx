import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import MobileNavigation from '@/components/MobileNavigation';
import MobileMenuModal from '@/components/MobileMenuModal';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OfflineDataManager from '@/components/OfflineDataManager';
import IntelligentDashboard from '@/components/IntelligentDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import IoTControlCenter from '@/components/IoTControlCenter';
import ProductionUnitsManagement from '@/components/ProductionUnitsManagement';
import InfrastructureManagement from '@/components/InfrastructureManagement';
import LivestockManagement from '@/components/LivestockManagement';
import FeedingManagement from '@/components/FeedingManagement';
import ProphylaxieManagement from '@/components/ProphylaxieManagement';
import TransformationManagement from '@/components/TransformationManagement';
import ProductionManagement from '@/components/ProductionManagement';
import AccountingManagement from '@/components/AccountingManagement';
import SuppliersManagement from '@/components/SuppliersManagement';
import HRManagement from '@/components/HRManagement';
import SalesManagement from '@/components/SalesManagement';
import PurchasesManagement from '@/components/PurchasesManagement';
import PlanningManagement from '@/components/PlanningManagement';
import WeatherDashboard from '@/components/WeatherDashboard';
import TeamManagement from '@/components/TeamManagement';
import ReportsManagement from '@/components/ReportsManagement';
import SettingsManagement from '@/components/SettingsManagement';
import AquaAssistant from '@/components/AquaAssistant';
import { useTeamMemberAccess } from '@/hooks/useTeamMemberAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Building2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Page principale du dashboard
 * Accessible uniquement aux utilisateurs authentifiés
 * Les membres d'équipe ont un accès restreint selon leurs permissions
 */
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isTeamMember, teamMemberInfo, isLoading: isLoadingAccess } = useTeamMemberAccess();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
  };

  // Vérifier si le membre d'équipe a accès à l'onglet actuel
  useEffect(() => {
    if (isTeamMember && teamMemberInfo && !isLoadingAccess) {
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

      // Si l'onglet actuel n'est pas autorisé, rediriger vers dashboard
      if (!allowedTabs.has(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [isTeamMember, teamMemberInfo, activeTab, isLoadingAccess]);

  const renderTeamMemberWelcome = () => {
    if (!isTeamMember || !teamMemberInfo) return null;

    return (
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Bienvenue, {teamMemberInfo.memberName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {teamMemberInfo.role === 'custom' ? teamMemberInfo.customRole : teamMemberInfo.role}
              </Badge>
              {teamMemberInfo.department && (
                <Badge variant="secondary">{teamMemberInfo.department}</Badge>
              )}
            </div>
            
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Vous avez accès aux unités de production assignées par votre responsable.
              </span>
            </div>

            {teamMemberInfo.assignedUnits.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Unités assignées :</p>
                <div className="flex flex-wrap gap-2">
                  {teamMemberInfo.assignedUnits.map(unit => (
                    <Badge key={unit.unitId} variant="default" className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {unit.unitName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {renderTeamMemberWelcome()}
            <IntelligentDashboard />
          </>
        );
      case 'iot-control':
        return <IoTControlCenter />;
      case 'units':
        return <ProductionUnitsManagement />;
      case 'infrastructures':
        return <InfrastructureManagement />;
      case 'livestock':
        return <LivestockManagement />;
      case 'feeding':
        return <FeedingManagement />;
      case 'health':
        return <ProphylaxieManagement />;
      case 'transformation':
        return <TransformationManagement />;
      case 'production':
        return <ProductionManagement />;
      case 'accounting':
        return <AccountingManagement />;
      case 'hr':
        return <HRManagement />;
      case 'purchases':
        return <PurchasesManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'suppliers':
        return <SuppliersManagement />;
      case 'planning':
        return <PlanningManagement />;
      case 'weather':
        return <WeatherDashboard />;
      case 'team':
        return <TeamManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'offline':
        return <OfflineDataManager />;
      case 'settings':
        return <SettingsManagement />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <>
            {renderTeamMemberWelcome()}
            <IntelligentDashboard />
          </>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        {/* Sidebar Navigation - masqué sur mobile */}
        <div className="hidden md:flex">
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Conteneur principal avec header et contenu */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header fixe en haut sans marges sur mobile */}
          <div className="sticky top-0 z-40 flex items-center border-b border-border bg-background w-full">
            <div className="hidden md:block">
              <SidebarTrigger className="ml-2" />
            </div>
            <div className="flex-1 w-full">
              <Header onNavigate={setActiveTab} />
            </div>
          </div>
          
          {/* Main Content avec scroll */}
          <main className="flex-1 overflow-y-auto px-0 py-2 sm:p-4 lg:p-6 pb-20 md:pb-6">
            <div className="w-full max-w-none">
              {renderContent()}
            </div>
          </main>
        </div>

        {/* Navigation mobile en bas */}
        <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        {/* Modal menu mobile */}
        <MobileMenuModal 
          isOpen={showMobileMenu} 
          onClose={() => setShowMobileMenu(false)} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Assistant IA AquaAssistant */}
        <AquaAssistant />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
