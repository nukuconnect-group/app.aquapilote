import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home, Bell, Wifi, Building2, Wrench, Beef, Utensils, Heart, Package,
  Calculator, ShoppingCart, ShoppingBag, Truck, UserCheck, Users, BarChart3,
  Calendar, FileText, MessageCircle, Headphones, Database, Settings, Shield, Info,
  type LucideIcon,
} from 'lucide-react';
import { useTeamMemberAccess } from '@/hooks/useTeamMemberAccess';

interface ModuleDef {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const ALL_MODULES: ModuleDef[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Home, description: 'Vue d\'ensemble' },
  { id: 'performance-alerts', label: 'Alertes performance', icon: Bell, description: 'Alertes KPI' },
  { id: 'iot-control', label: 'IoT', icon: Wifi, description: 'Capteurs et surveillance' },
  { id: 'units', label: 'Unités', icon: Building2, description: 'Unités de production' },
  { id: 'infrastructures', label: 'Infrastructures', icon: Wrench, description: 'Bassins et équipements' },
  { id: 'livestock', label: 'Cheptel', icon: Beef, description: 'Lots et géniteurs' },
  { id: 'feeding', label: 'Alimentation', icon: Utensils, description: 'Plans et stocks' },
  { id: 'health', label: 'Santé', icon: Heart, description: 'Prophylaxie' },
  { id: 'production', label: 'Production', icon: Package, description: 'Cycles de production' },
  { id: 'accounting', label: 'Comptabilité', icon: Calculator, description: 'Transactions' },
  { id: 'purchases', label: 'Achats', icon: ShoppingCart, description: 'Bons d\'achat' },
  { id: 'sales', label: 'Ventes', icon: ShoppingBag, description: 'Reçus et factures' },
  { id: 'suppliers', label: 'Fournisseurs', icon: Truck, description: 'Partenaires' },
  { id: 'hr', label: 'RH', icon: UserCheck, description: 'Employés et paie' },
  { id: 'team', label: 'Équipe', icon: Users, description: 'Membres' },
  { id: 'analytics', label: 'Analytique', icon: BarChart3, description: 'Statistiques avancées' },
  { id: 'planning', label: 'Planning', icon: Calendar, description: 'Tâches planifiées' },
  { id: 'reports', label: 'Rapports', icon: FileText, description: 'Exports PDF / Excel' },
  { id: 'aqua-assistant', label: 'AquaAssistant', icon: MessageCircle, description: 'Assistant IA' },
  { id: 'support', label: 'Support', icon: Headphones, description: 'Assistance' },
  { id: 'offline', label: 'Hors ligne', icon: Database, description: 'Données locales' },
  { id: 'settings', label: 'Paramètres', icon: Settings, description: 'Profil et préférences' },
];

interface MemberDashboardProps {
  onNavigate: (tab: string) => void;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({ onNavigate }) => {
  const { teamMemberInfo, allowedModules } = useTeamMemberAccess();

  // Always-available core tabs
  const accessible = ALL_MODULES.filter(
    (m) => m.id === 'dashboard' || m.id === 'settings' || m.id === 'support' || allowedModules.has(m.id),
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Bienvenue, {teamMemberInfo?.memberName || 'Membre'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {teamMemberInfo?.role && (
              <Badge variant="outline">
                {teamMemberInfo.role === 'custom' ? teamMemberInfo.customRole : teamMemberInfo.role}
              </Badge>
            )}
            {teamMemberInfo?.department && (
              <Badge variant="secondary">{teamMemberInfo.department}</Badge>
            )}
            {teamMemberInfo?.dashboardRoles?.map((r) => (
              <Badge key={r} variant="default">{r}</Badge>
            ))}
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Vous avez accès aux modules et unités assignés par votre responsable.
            </span>
          </div>
          {teamMemberInfo && teamMemberInfo.assignedUnits.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Unités assignées :</p>
              <div className="flex flex-wrap gap-2">
                {teamMemberInfo.assignedUnits.map((unit) => (
                  <Badge key={unit.unitId} variant="default" className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {unit.unitName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Mes modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {accessible
            .filter((m) => m.id !== 'dashboard')
            .map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onNavigate(m.id)}
                  className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </button>
              );
            })}
        </div>
        {accessible.length <= 3 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun module supplémentaire ne vous a encore été attribué. Contactez votre responsable.
          </p>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;