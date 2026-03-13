import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers, TeamMember, NewTeamMember } from '@/hooks/useTeamMembers';
import { useTeamMemberUnits, TeamMemberUnit } from '@/hooks/useTeamMemberUnits';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';

// Sub-components
import TeamStats from './team/TeamStats';
import TeamMemberList from './team/TeamMemberList';
import PermissionsOverview from './team/PermissionsOverview';
import AddMemberDialog from './team/AddMemberDialog';
import SummaryDialog from './team/SummaryDialog';
import MemberDetailsDialog from './team/MemberDetailsDialog';
import CredentialsDialog from './team/CredentialsDialog';
import ResetPasswordDialog from './team/ResetPasswordDialog';
import ViewCredentialsDialog from './team/ViewCredentialsDialog';

interface UnitPermissions {
  unitId: string;
  unitName: string;
  permissions: Record<string, boolean>;
}

interface CreatedCredentials {
  email: string;
  password?: string | null;
  loginUrl: string;
  memberName: string;
  emailSent: boolean;
  emailError?: string | null;
  existingUser?: boolean;
}

const TeamManagement = () => {
  const { t } = useSettings();
  const { addLog } = useLogs();
  const { toast } = useToast();
  const { teamMembers, isLoading, addTeamMember, updateTeamMember, deleteTeamMember, refetch } = useTeamMembers();
  const { units } = useProductionUnits();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showSummaryStep, setShowSummaryStep] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedMemberUnits, setSelectedMemberUnits] = useState<TeamMemberUnit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [selectedUnitsForInvite, setSelectedUnitsForInvite] = useState<Set<string>>(new Set());
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordMember, setResetPasswordMember] = useState<TeamMember | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ password: string; loginUrl: string; emailSent: boolean } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showMemberCredentials, setShowMemberCredentials] = useState(false);
  const [viewMemberCredentials, setViewMemberCredentials] = useState<{ member: TeamMember; loginUrl: string } | null>(null);

  const [inviteData, setInviteData] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    customRole: string;
    department: string;
    permissions: Record<string, boolean>;
    unitPermissions: UnitPermissions[];
  }>({
    name: '',
    email: '',
    password: '',
    role: '',
    customRole: '',
    department: '',
    permissions: {},
    unitPermissions: []
  });

  const roles = [
    { key: 'role_director', label: t('role_director') },
    { key: 'role_production_manager', label: t('role_production_manager') },
    { key: 'role_hatchery_manager', label: t('role_hatchery_manager') },
    { key: 'role_fattening_manager', label: t('role_fattening_manager') },
    { key: 'role_aquaculture_technician', label: t('role_aquaculture_technician') },
    { key: 'role_aquaculture_worker', label: t('role_aquaculture_worker') },
    { key: 'role_accountant', label: t('role_accountant') },
    { key: 'role_trainee', label: t('role_trainee') },
    { key: 'role_custom', label: t('role_custom') }
  ];

  const departments = [
    { key: 'dept_management', label: t('dept_management') },
    { key: 'dept_production', label: t('dept_production') },
    { key: 'dept_accounting', label: t('dept_accounting') },
    { key: 'dept_commercial', label: t('dept_commercial') },
    { key: 'dept_maintenance', label: t('dept_maintenance') },
    { key: 'dept_quality', label: t('dept_quality') }
  ];

  const modulePermissions = [
    { id: 'dashboard', label: t('module_dashboard'), description: t('module_dashboard_desc') },
    { id: 'production', label: t('module_production'), description: t('module_production_desc') },
    { id: 'feeding', label: t('module_feeding'), description: t('module_feeding_desc') },
    { id: 'livestock', label: t('module_livestock'), description: t('module_livestock_desc') },
    { id: 'health', label: t('module_health'), description: t('module_health_desc') },
    { id: 'reproduction', label: t('module_reproduction'), description: t('module_reproduction_desc') },
    { id: 'infrastructure', label: t('module_infrastructure'), description: t('module_infrastructure_desc') },
    { id: 'environment', label: t('module_environment'), description: t('module_environment_desc') },
    { id: 'iot', label: t('module_iot'), description: t('module_iot_desc') },
    { id: 'accounting', label: t('module_accounting'), description: t('module_accounting_desc') },
    { id: 'economics', label: t('module_economics'), description: t('module_economics_desc') },
    { id: 'sales', label: t('module_sales'), description: t('module_sales_desc') },
    { id: 'purchases', label: t('module_purchases'), description: t('module_purchases_desc') },
    { id: 'suppliers', label: t('module_suppliers'), description: t('module_suppliers_desc') },
    { id: 'planning', label: t('module_planning'), description: t('module_planning_desc') },
    { id: 'reports', label: t('module_reports'), description: t('module_reports_desc') },
    { id: 'settings', label: t('module_settings'), description: t('module_settings_desc') }
  ];

  // --- Helpers ---
  const generatePasswordLocal = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%&*';
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('status_active');
      case 'inactive': return t('status_inactive');
      case 'pending': return t('status_pending');
      default: return status;
    }
  };

  // --- Unit management ---
  const loadMemberUnits = async (memberId: string) => {
    setIsLoadingUnits(true);
    try {
      const { data, error } = await supabase
        .from('team_member_units')
        .select('*')
        .eq('team_member_id', memberId);
      if (error) throw error;
      setSelectedMemberUnits((data || []).map(item => ({
        ...item,
        permissions: item.permissions as Record<string, boolean>
      })));
    } catch (error) {
      console.error('Error loading member units:', error);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const toggleUnitSelection = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;
    setSelectedUnitsForInvite(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
        setInviteData(prevData => ({ ...prevData, unitPermissions: prevData.unitPermissions.filter(up => up.unitId !== unitId) }));
      } else {
        newSet.add(unitId);
        setInviteData(prevData => ({ ...prevData, unitPermissions: [...prevData.unitPermissions, { unitId: unit.id, unitName: unit.name, permissions: {} }] }));
      }
      return newSet;
    });
  };

  const removeUnitFromInvite = (unitId: string) => {
    setInviteData(prev => ({ ...prev, unitPermissions: prev.unitPermissions.filter(up => up.unitId !== unitId) }));
    setSelectedUnitsForInvite(prev => { const s = new Set(prev); s.delete(unitId); return s; });
  };

  const toggleUnitPermission = (unitId: string, permissionId: string) => {
    setInviteData(prev => ({
      ...prev,
      unitPermissions: prev.unitPermissions.map(up =>
        up.unitId === unitId ? { ...up, permissions: { ...up.permissions, [permissionId]: !up.permissions[permissionId] } } : up
      )
    }));
  };

  const toggleInvitePermission = (permissionId: string) => {
    setInviteData(prev => ({ ...prev, permissions: { ...prev.permissions, [permissionId]: !prev.permissions[permissionId] } }));
  };

  const toggleMemberPermission = (permissionId: string) => {
    if (!selectedMember) return;
    setSelectedMember(prev => prev ? { ...prev, permissions: { ...prev.permissions, [permissionId]: !prev.permissions[permissionId] } } : null);
  };

  const addUnitToMember = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit || selectedMemberUnits.some(mu => mu.unit_id === unitId)) return;
    setSelectedMemberUnits(prev => [...prev, {
      id: `temp-${Date.now()}`, team_member_id: selectedMember?.id || '', unit_id: unit.id,
      unit_name: unit.name, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }]);
  };

  const removeUnitFromMember = (unitId: string) => {
    setSelectedMemberUnits(prev => prev.filter(mu => mu.unit_id !== unitId));
  };

  const toggleMemberUnitPermission = (unitId: string, permissionId: string) => {
    setSelectedMemberUnits(prev => prev.map(mu =>
      mu.unit_id === unitId ? { ...mu, permissions: { ...mu.permissions, [permissionId]: !mu.permissions[permissionId] } } : mu
    ));
  };

  // --- Handlers ---
  const handleProceedToSummary = () => {
    if (!inviteData.name || !inviteData.email || !inviteData.department) {
      toast({ title: t('error'), description: t('fill_required_fields'), variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast({ title: t('error'), description: t('invalid_email_format'), variant: "destructive" });
      return;
    }
    if (inviteData.unitPermissions.length === 0) {
      toast({ title: t('error'), description: t('assign_at_least_one_unit'), variant: "destructive" });
      return;
    }
    const finalPassword = inviteData.password || generatePasswordLocal();
    setGeneratedPassword(finalPassword);
    setInviteData(prev => ({ ...prev, password: finalPassword }));
    setShowSummaryStep(true);
  };

  const handleConfirmAndCreate = async (sendEmail: boolean) => {
    setIsSubmitting(true);
    const finalRole = inviteData.role === 'Personnalisé' ? inviteData.customRole : inviteData.role;
    const newMember: NewTeamMember = {
      member_name: inviteData.name, member_email: inviteData.email,
      role: finalRole || 'Membre', custom_role: inviteData.role === 'Personnalisé' ? inviteData.customRole : undefined,
      department: inviteData.department, permissions: inviteData.permissions
    };

    const result = await addTeamMember(newMember);
    if (result.success && result.data) {
      for (const unitPerm of inviteData.unitPermissions) {
        await supabase.from('team_member_units').insert({
          team_member_id: result.data.id, unit_id: unitPerm.unitId, unit_name: unitPerm.unitName, permissions: unitPerm.permissions
        });
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Session expirée.');
        const passwordToUse = inviteData.password || generatedPassword;
        const response = await supabase.functions.invoke('create-team-member-account', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { email: inviteData.email, full_name: inviteData.name, team_member_id: result.data.id, password: passwordToUse, sendEmail }
        });
        if (response.error) throw new Error(response.error.message);

        const loginUrl = `${window.location.origin}/auth`;
        if (response.data?.existingUser || response.data?.alreadyLinked) {
          setCreatedCredentials({ email: inviteData.email, password: null, loginUrl, memberName: inviteData.name, emailSent: false, existingUser: true });
          setShowCredentialsDialog(true);
          addLog('Compte lié (utilisateur existant)', 'Équipe', `${inviteData.name} : compte existant lié`, 'info');
          toast({ title: t('existing_account'), description: t('reset_password_if_needed') });
          await refetch();
        } else if (response.data?.credentials) {
          setCreatedCredentials({
            email: response.data.credentials.email, password: response.data.credentials.password,
            loginUrl: response.data.credentials.loginUrl || loginUrl, memberName: inviteData.name,
            emailSent: response.data.emailSent || false, emailError: response.data.emailError, existingUser: false
          });
          setShowCredentialsDialog(true);
          addLog('Membre invité', 'Équipe', `${inviteData.name} invité avec compte créé`, 'success');
          toast({ title: response.data?.emailSent ? t('member_added_email_sent') : t('member_added'), description: `${t('account_created_for')} ${inviteData.name}` });
          await refetch();
        } else {
          setCreatedCredentials({ email: inviteData.email, password: passwordToUse, loginUrl, memberName: inviteData.name, emailSent: false, emailError: response.data?.emailError, existingUser: false });
          setShowCredentialsDialog(true);
          toast({ title: t('member_added'), description: `${t('account_created_for')} ${inviteData.name}.` });
          await refetch();
        }
      } catch (error: any) {
        console.error('Error creating user account:', error);
        addLog('Membre invité (sans compte)', 'Équipe', `${inviteData.name} ajouté sans compte`, 'warning');
        toast({ title: t('member_added'), description: `${inviteData.name} - ${t('account_not_created')}: ${error.message}`, variant: "destructive" });
      }

      setInviteData({ name: '', email: '', password: '', role: '', customRole: '', department: '', permissions: {}, unitPermissions: [] });
      setSelectedUnitsForInvite(new Set());
      setGeneratedPassword('');
      setShowSummaryStep(false);
      setShowInviteForm(false);
    } else {
      toast({ title: t('error'), description: result.error || t('unable_to_add_member'), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleUpdateMemberPermissions = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    const result = await updateTeamMember(selectedMember.id, {
      member_name: selectedMember.member_name, member_email: selectedMember.member_email,
      permissions: selectedMember.permissions, role: selectedMember.role, custom_role: selectedMember.custom_role,
      department: selectedMember.department, status: selectedMember.status
    });
    if (result.success) {
      await supabase.from('team_member_units').delete().eq('team_member_id', selectedMember.id);
      for (const unitPerm of selectedMemberUnits) {
        await supabase.from('team_member_units').insert({
          team_member_id: selectedMember.id, unit_id: unitPerm.unit_id, unit_name: unitPerm.unit_name, permissions: unitPerm.permissions
        });
      }
      toast({ title: "Membre mis à jour", description: `Les informations de ${selectedMember.member_name} ont été mises à jour` });
      setShowMemberDetails(false);
    } else {
      toast({ title: t('error'), description: result.error || t('unable_to_update'), variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${member.member_name} de votre équipe ?`)) return;
    const result = await deleteTeamMember(member.id);
    if (result.success) {
      addLog('Membre retiré', 'Équipe', `${member.member_name} retiré de l'équipe`, 'info');
      toast({ title: "Membre retiré", description: `${member.member_name} a été retiré de votre équipe` });
    } else {
      toast({ title: "Erreur", description: result.error || "Impossible de retirer le membre", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    const result = await updateTeamMember(member.id, { status: newStatus });
    if (result.success) {
      toast({ title: "Statut mis à jour", description: `${member.member_name} est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}` });
    }
  };

  const handleResetPassword = async (member: TeamMember, sendEmail: boolean) => {
    setIsResettingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expirée.');
      const response = await supabase.functions.invoke('reset-team-member-password', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { email: member.member_email, member_name: member.member_name, sendEmail }
      });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.success) {
        setResetPasswordResult({ password: response.data.newPassword, loginUrl: response.data.loginUrl, emailSent: response.data.emailSent });
        addLog('Mot de passe réinitialisé', 'Équipe', `Mot de passe de ${member.member_name} réinitialisé`, 'info');
        toast({ title: response.data.emailSent ? "Mot de passe réinitialisé et email envoyé" : "Mot de passe réinitialisé" });
      } else {
        throw new Error(response.data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({ title: "Erreur", description: error.message || "Impossible de réinitialiser", variant: "destructive" });
      setShowResetPasswordDialog(false);
    }
    setIsResettingPassword(false);
  };

  const handleCreateAccountForMember = async (member: TeamMember) => {
    if (member.user_id) {
      toast({ title: "Compte existant", description: "Ce membre a déjà un compte.", variant: "destructive" });
      return;
    }
    setIsCreatingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expirée.');
      const password = generatePasswordLocal();
      const response = await supabase.functions.invoke('create-team-member-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { email: member.member_email, full_name: member.member_name, team_member_id: member.id, password, sendEmail: true }
      });
      if (response.error) throw new Error(response.error.message);

      const loginUrl = `${window.location.origin}/auth`;
      if (response.data?.existingUser || response.data?.alreadyLinked) {
        setCreatedCredentials({ email: member.member_email, password: null, loginUrl, memberName: member.member_name, emailSent: false, existingUser: true });
        setShowCredentialsDialog(true);
        toast({ title: "Compte lié", description: "Utilisez \"Réinitialiser mot de passe\" si besoin." });
        await refetch();
      } else if (response.data?.success) {
        setCreatedCredentials({
          email: member.member_email, password: response.data.credentials?.password || password,
          loginUrl: response.data.credentials?.loginUrl || loginUrl, memberName: member.member_name,
          emailSent: response.data.emailSent || false, emailError: response.data.emailError
        });
        setShowCredentialsDialog(true);
        addLog('Compte créé', 'Équipe', `Compte créé pour ${member.member_name}`, 'success');
        toast({ title: response.data.emailSent ? "Compte créé et email envoyé" : "Compte créé" });
        await refetch();
      } else {
        throw new Error(response.data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({ title: "Erreur", description: error.message || "Impossible de créer le compte", variant: "destructive" });
    }
    setIsCreatingAccount(false);
  };

  const openMemberDetails = async (member: TeamMember) => {
    setSelectedMember(member);
    await loadMemberUnits(member.id);
    setShowMemberDetails(true);
  };

  const openResetPasswordDialog = (member: TeamMember) => {
    setResetPasswordMember(member);
    setResetPasswordResult(null);
    setShowResetPasswordDialog(true);
  };

  const openMemberCredentialsView = (member: TeamMember) => {
    const loginUrl = `${window.location.origin}/auth`;
    setViewMemberCredentials({ member, loginUrl });
    setShowMemberCredentials(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/90 to-primary/60 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('team_header_title')}</h2>
            <p className="text-primary-foreground/80">{t('team_header_subtitle')}</p>
          </div>
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={() => setShowInviteForm(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t('add_member_btn')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TeamStats
        totalMembers={teamMembers.length}
        activeMembers={teamMembers.filter(m => m.status === 'active').length}
        totalUnits={units.length}
        totalModules={modulePermissions.length}
      />

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="members">{t('team_members_tab')}</TabsTrigger>
          <TabsTrigger value="permissions">{t('permissions_tab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMemberList
            members={teamMembers}
            isCreatingAccount={isCreatingAccount}
            onCreateAccount={handleCreateAccountForMember}
            onViewCredentials={openMemberCredentialsView}
            onEdit={openMemberDetails}
            onToggleStatus={handleToggleStatus}
            onResetPassword={openResetPasswordDialog}
            onDelete={handleDeleteMember}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsOverview modulePermissions={modulePermissions} teamMembers={teamMembers} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddMemberDialog
        open={showInviteForm}
        onOpenChange={setShowInviteForm}
        inviteData={inviteData}
        setInviteData={setInviteData}
        units={units}
        selectedUnitsForInvite={selectedUnitsForInvite}
        setSelectedUnitsForInvite={setSelectedUnitsForInvite}
        roles={roles}
        departments={departments}
        modulePermissions={modulePermissions}
        isSubmitting={isSubmitting}
        onProceedToSummary={handleProceedToSummary}
        onToggleUnitSelection={toggleUnitSelection}
        onRemoveUnit={removeUnitFromInvite}
        onToggleUnitPermission={toggleUnitPermission}
        onToggleInvitePermission={toggleInvitePermission}
      />

      <SummaryDialog
        open={showSummaryStep}
        onOpenChange={setShowSummaryStep}
        inviteData={inviteData}
        generatedPassword={generatedPassword}
        setGeneratedPassword={setGeneratedPassword}
        setInviteDataPassword={(pw) => setInviteData(prev => ({ ...prev, password: pw }))}
        generatePasswordLocal={generatePasswordLocal}
        isSubmitting={isSubmitting}
        onConfirmAndCreate={handleConfirmAndCreate}
      />

      <MemberDetailsDialog
        open={showMemberDetails}
        onOpenChange={setShowMemberDetails}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        selectedMemberUnits={selectedMemberUnits}
        isLoadingUnits={isLoadingUnits}
        isSubmitting={isSubmitting}
        units={units}
        roles={roles}
        departments={departments}
        modulePermissions={modulePermissions}
        onSave={handleUpdateMemberPermissions}
        onResetPassword={openResetPasswordDialog}
        onAddUnit={addUnitToMember}
        onRemoveUnit={removeUnitFromMember}
        onToggleUnitPermission={toggleMemberUnitPermission}
        onToggleMemberPermission={toggleMemberPermission}
      />

      <CredentialsDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        credentials={createdCredentials}
      />

      <ResetPasswordDialog
        open={showResetPasswordDialog}
        onOpenChange={setShowResetPasswordDialog}
        member={resetPasswordMember}
        result={resetPasswordResult}
        isResetting={isResettingPassword}
        onReset={handleResetPassword}
        onClearResult={() => setResetPasswordResult(null)}
      />

      <ViewCredentialsDialog
        open={showMemberCredentials}
        onOpenChange={setShowMemberCredentials}
        member={viewMemberCredentials?.member || null}
        loginUrl={viewMemberCredentials?.loginUrl || ''}
        onResetPassword={openResetPasswordDialog}
        onEdit={openMemberDetails}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
      />
    </div>
  );
};

export default TeamManagement;
