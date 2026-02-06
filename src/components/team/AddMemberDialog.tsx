import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, X } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { ProductionUnit } from '@/contexts/ProductionUnitsContext';

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

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  inviteData,
  setInviteData,
  units,
  selectedUnitsForInvite,
  setSelectedUnitsForInvite,
  roles,
  departments,
  modulePermissions,
  isSubmitting,
  onProceedToSummary,
  onToggleUnitSelection,
  onRemoveUnit,
  onToggleUnitPermission,
  onToggleInvitePermission,
}) => {
  const { t } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('add_new_member')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('full_name')} *</Label>
              <Input
                value={inviteData.name}
                onChange={(e) => setInviteData(prev => ({...prev, name: e.target.value}))}
                placeholder={t('member_name_placeholder')}
              />
            </div>
            <div>
              <Label>{t('email_login')} *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({...prev, email: e.target.value}))}
                placeholder={t('email_placeholder')}
              />
            </div>
          </div>

          <div>
            <Label>{t('password_optional')}</Label>
            <Input
              type="password"
              value={inviteData.password}
              onChange={(e) => setInviteData(prev => ({...prev, password: e.target.value}))}
              placeholder={t('password_placeholder')}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('password_hint')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('role')}</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({...prev, role: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_role')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.key} value={role.key}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {inviteData.role === 'role_custom' && (
              <div>
                <Label>{t('custom_role')} *</Label>
                <Input
                  value={inviteData.customRole}
                  onChange={(e) => setInviteData(prev => ({...prev, customRole: e.target.value}))}
                  placeholder={t('custom_role_placeholder')}
                />
              </div>
            )}
            <div>
              <Label>{t('department')} *</Label>
              <Select value={inviteData.department} onValueChange={(value) => setInviteData(prev => ({...prev, department: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_department')} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.key} value={dept.key}>{dept.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Unit selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Unités de production assignées * (sélectionnez plusieurs)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedUnitsForInvite.size === units.length) {
                    setSelectedUnitsForInvite(new Set());
                    setInviteData(prev => ({ ...prev, unitPermissions: [] }));
                  } else {
                    const allUnitIds = new Set(units.map(u => u.id));
                    setSelectedUnitsForInvite(allUnitIds);
                    setInviteData(prev => ({
                      ...prev,
                      unitPermissions: units.map(unit => ({
                        unitId: unit.id,
                        unitName: unit.name,
                        permissions: {}
                      }))
                    }));
                  }
                }}
              >
                {selectedUnitsForInvite.size === units.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </Button>
            </div>
            <div className="border rounded-lg p-3 mb-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {units.map(unit => (
                  <div key={unit.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`select-unit-${unit.id}`}
                      checked={selectedUnitsForInvite.has(unit.id)}
                      onCheckedChange={() => onToggleUnitSelection(unit.id)}
                    />
                    <label htmlFor={`select-unit-${unit.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {unit.name}
                    </label>
                  </div>
                ))}
              </div>
              {units.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Aucune unité disponible. Créez d'abord une unité de production.
                </p>
              )}
            </div>

            {inviteData.unitPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/50">
                Cochez les unités ci-dessus pour définir les permissions par unité.
              </p>
            ) : (
              <div className="space-y-4">
                {inviteData.unitPermissions.map((unitPerm) => (
                  <div key={unitPerm.unitId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-medium">{unitPerm.unitName}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onRemoveUnit(unitPerm.unitId)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {modulePermissions.map((module) => (
                        <div key={module.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`unit-${unitPerm.unitId}-${module.id}`}
                            checked={unitPerm.permissions[module.id] || false}
                            onCheckedChange={() => onToggleUnitPermission(unitPerm.unitId, module.id)}
                          />
                          <label htmlFor={`unit-${unitPerm.unitId}-${module.id}`} className="text-xs cursor-pointer">
                            {module.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Global permissions */}
          <div>
            <Label className="mb-3 block">Permissions globales (toutes unités)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-lg p-3">
              {modulePermissions.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`invite-${module.id}`}
                    checked={inviteData.permissions[module.id] || false}
                    onCheckedChange={() => onToggleInvitePermission(module.id)}
                  />
                  <label htmlFor={`invite-${module.id}`} className="text-sm cursor-pointer flex-1">
                    {module.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onProceedToSummary} disabled={isSubmitting}>
            {t('next')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
