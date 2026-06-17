import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Key, X, Loader2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { TeamMember } from '@/hooks/useTeamMembers';
import { TeamMemberUnit } from '@/hooks/useTeamMemberUnits';
import { ProductionUnit } from '@/contexts/ProductionUnitsContext';
import { DASHBOARD_ROLE_DEFINITIONS, DashboardRole } from '@/lib/dashboardRoles';

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

interface MemberDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMember: TeamMember | null;
  setSelectedMember: React.Dispatch<React.SetStateAction<TeamMember | null>>;
  selectedMemberUnits: TeamMemberUnit[];
  isLoadingUnits: boolean;
  isSubmitting: boolean;
  units: ProductionUnit[];
  modulePermissions: ModulePermission[];
  onSave: () => void;
  onResetPassword: (member: TeamMember) => void;
  onAddUnit: (unitId: string) => void;
  onRemoveUnit: (unitId: string) => void;
  onToggleUnitPermission: (unitId: string, permissionId: string) => void;
  onToggleMemberPermission: (permissionId: string) => void;
}

const MemberDetailsDialog: React.FC<MemberDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedMember,
  setSelectedMember,
  selectedMemberUnits,
  isLoadingUnits,
  isSubmitting,
  units,
  modulePermissions,
  onSave,
  onResetPassword,
  onAddUnit,
  onRemoveUnit,
  onToggleUnitPermission,
  onToggleMemberPermission,
}) => {
  const { t } = useSettings();

  if (!selectedMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier - {selectedMember.member_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Credentials section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Identifiants de connexion
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Email (identifiant de connexion)</Label>
                <Input
                  value={selectedMember.member_email}
                  onChange={(e) => setSelectedMember({...selectedMember, member_email: e.target.value})}
                  placeholder="email@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">L'email sert d'identifiant de connexion</p>
              </div>
              <div>
                <Label>Nom complet</Label>
                <Input
                  value={selectedMember.member_name}
                  onChange={(e) => setSelectedMember({...selectedMember, member_name: e.target.value})}
                  placeholder="Nom du membre"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Statut</Label>
              <Select
                value={selectedMember.status}
                onValueChange={(value: 'active' | 'inactive' | 'pending') => setSelectedMember({...selectedMember, status: value})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={() => onResetPassword(selectedMember)} className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Réinitialiser mot de passe
              </Button>
            </div>
          </div>


          {/* Units */}
          <div>
            <Label className="mb-3 block">Unités de production assignées</Label>
            {isLoadingUnits ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <Select onValueChange={onAddUnit}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Ajouter une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.filter(u => !selectedMemberUnits.some(mu => mu.unit_id === u.id)).map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedMemberUnits.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">Aucune unité assignée</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMemberUnits.map((memberUnit) => (
                      <div key={memberUnit.unit_id} className="border rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{memberUnit.unit_name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => onRemoveUnit(memberUnit.unit_id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Rôles RBAC : fonction uniquement */}
          <div>
            <Label className="mb-2 block font-semibold">Rôles attribués *</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Les rôles décrivent la fonction. Les accès réels sont contrôlés par les modules cochés ci-dessous.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {(Object.keys(DASHBOARD_ROLE_DEFINITIONS) as DashboardRole[]).map((roleKey) => {
                const def = DASHBOARD_ROLE_DEFINITIONS[roleKey];
                const current = selectedMember.dashboard_roles ?? [];
                const checked = current.includes(roleKey);
                return (
                  <label
                    key={roleKey}
                    htmlFor={`edit-dashboard-${roleKey}`}
                    className={`flex gap-2 p-2.5 rounded-md border cursor-pointer transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      id={`edit-dashboard-${roleKey}`}
                      checked={checked}
                      onCheckedChange={() => {
                        const next = new Set(current);
                        if (next.has(roleKey)) next.delete(roleKey);
                        else next.add(roleKey);
                        setSelectedMember({ ...selectedMember, dashboard_roles: Array.from(next) as DashboardRole[] });
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{def.label}</div>
                      <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Modules autorisés */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <Label className="block font-semibold">Modules autorisés *</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Un module décoché disparaît du menu et devient inaccessible par URL.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allEnabled = modulePermissions.every((m) => selectedMember.permissions?.[m.id]);
                  setSelectedMember({
                    ...selectedMember,
                    permissions: modulePermissions.reduce<Record<string, boolean>>((acc, module) => {
                      acc[module.id] = !allEnabled;
                      return acc;
                    }, {}),
                  });
                }}
              >
                {modulePermissions.every((m) => selectedMember.permissions?.[m.id]) ? 'Tout retirer' : 'Tout cocher'}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {modulePermissions.map((module) => {
                const checked = Boolean(selectedMember.permissions?.[module.id]);
                return (
                  <label
                    key={module.id}
                    htmlFor={`edit-module-${module.id}`}
                    className={`flex gap-2 p-2.5 rounded-md border cursor-pointer transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      id={`edit-module-${module.id}`}
                      checked={checked}
                      onCheckedChange={() => onToggleMemberPermission(module.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{module.label}</div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{module.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={onSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailsDialog;
