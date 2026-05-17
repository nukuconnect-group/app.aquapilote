import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, KeyRound, RefreshCw } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { ProductionUnit } from '@/contexts/ProductionUnitsContext';
import { DASHBOARD_ROLE_DEFINITIONS, DashboardRole } from '@/lib/dashboardRoles';

interface UnitPermissions {
  unitId: string;
  unitName: string;
  permissions: Record<string, boolean>;
}

interface InviteData {
  name: string;
  email: string;
  password: string;
  role: string;
  customRole: string;
  department: string;
  permissions: Record<string, boolean>;
  unitPermissions: UnitPermissions[];
  dashboardRoles?: DashboardRole[];
}

interface ModulePermission {
  id: string;
  label: string;
  description: string;
}

interface RoleOption {
  key: string;
  label: string;
}

interface DeptOption {
  key: string;
  label: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteData: InviteData;
  setInviteData: React.Dispatch<React.SetStateAction<InviteData>>;
  units: ProductionUnit[];
  selectedUnitsForInvite: Set<string>;
  setSelectedUnitsForInvite: React.Dispatch<React.SetStateAction<Set<string>>>;
  roles: RoleOption[];
  departments: DeptOption[];
  modulePermissions: ModulePermission[];
  isSubmitting: boolean;
  onProceedToSummary: () => void;
  onToggleUnitSelection: (unitId: string) => void;
  onRemoveUnit: (unitId: string) => void;
  onToggleUnitPermission: (unitId: string, permissionId: string) => void;
  onToggleInvitePermission: (permissionId: string) => void;
}

const generateStrongPassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const nums = '23456789';
  const sp = '!@#$%&*';
  const all = upper + lower + nums + sp;
  let pw =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    nums[Math.floor(Math.random() * nums.length)] +
    sp[Math.floor(Math.random() * sp.length)];
  for (let i = 0; i < 8; i++) pw += all[Math.floor(Math.random() * all.length)];
  return pw.split('').sort(() => Math.random() - 0.5).join('');
};

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  inviteData,
  setInviteData,
  units,
  selectedUnitsForInvite,
  roles,
  departments,
  isSubmitting,
  onProceedToSummary,
  onToggleUnitSelection,
}) => {
  const { t } = useSettings();

  const toggleDashboardRole = (roleKey: DashboardRole) => {
    setInviteData((prev) => {
      const current = new Set(prev.dashboardRoles ?? []);
      if (current.has(roleKey)) current.delete(roleKey);
      else current.add(roleKey);
      return { ...prev, dashboardRoles: Array.from(current) as DashboardRole[] };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('add_new_member') || 'Ajouter un membre'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* 1. Tableaux de bord (rôle principal) */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <Label className="block mb-2 font-semibold">Tableaux de bord assignés *</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Choisissez un ou les deux tableaux. Les modules accessibles s'ajusteront automatiquement.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(DASHBOARD_ROLE_DEFINITIONS) as DashboardRole[]).map((roleKey) => {
                const def = DASHBOARD_ROLE_DEFINITIONS[roleKey];
                const checked = inviteData.dashboardRoles?.includes(roleKey) ?? false;
                return (
                  <label
                    key={roleKey}
                    htmlFor={`dashboard-role-${roleKey}`}
                    className={`flex gap-2 p-3 rounded-md border cursor-pointer transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      id={`dashboard-role-${roleKey}`}
                      checked={checked}
                      onCheckedChange={() => toggleDashboardRole(roleKey)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{def.label}</div>
                      <p className="text-xs text-muted-foreground mt-1">{def.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Identité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('full_name') || 'Nom complet'} *</Label>
              <Input
                value={inviteData.name}
                onChange={(e) => setInviteData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <Label>{t('email_login') || 'Email (identifiant)'} *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          {/* 3. Mot de passe */}
          <div>
            <Label className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Mot de passe initial
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="text"
                value={inviteData.password}
                onChange={(e) => setInviteData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Laissez vide pour générer automatiquement"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setInviteData((prev) => ({ ...prev, password: generateStrongPassword() }))
                }
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Générer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Le membre pourra changer son mot de passe après sa première connexion.
            </p>
          </div>

          {/* 4. Rôle / département (informatif) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('role') || 'Poste'}</Label>
              <Input
                value={inviteData.role}
                onChange={(e) => setInviteData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="Ex : Responsable production"
              />
            </div>
            <div>
              <Label>{t('department') || 'Département'} *</Label>
              <Input
                value={inviteData.department}
                onChange={(e) => setInviteData((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="Ex : Production, Comptabilité..."
              />
            </div>
          </div>

          {/* 5. Unités (portée des données) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Unités de production accessibles *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allSelected = selectedUnitsForInvite.size === units.length;
                  if (allSelected) {
                    units.forEach((u) => {
                      if (selectedUnitsForInvite.has(u.id)) onToggleUnitSelection(u.id);
                    });
                  } else {
                    units.forEach((u) => {
                      if (!selectedUnitsForInvite.has(u.id)) onToggleUnitSelection(u.id);
                    });
                  }
                }}
              >
                {selectedUnitsForInvite.size === units.length
                  ? 'Désélectionner tout'
                  : 'Sélectionner tout'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Le membre n'accédera qu'aux données des unités cochées.
            </p>
            <div className="border rounded-lg p-3">
              {units.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Aucune unité disponible. Créez d'abord une unité de production.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {units.map((unit) => (
                    <div key={unit.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`select-unit-${unit.id}`}
                        checked={selectedUnitsForInvite.has(unit.id)}
                        onCheckedChange={() => onToggleUnitSelection(unit.id)}
                      />
                      <label
                        htmlFor={`select-unit-${unit.id}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4 text-primary" />
                        {unit.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel') || 'Annuler'}
          </Button>
          <Button onClick={onProceedToSummary} disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : 'Créer le membre'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;