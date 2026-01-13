import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserPlus, Settings, Star, Award, MessageSquare, Trash2, Edit, Loader2, Building2, Plus, X, Copy, Link, CheckCircle, Mail, AlertCircle, Key } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers, TeamMember, NewTeamMember } from '@/hooks/useTeamMembers';
import { useTeamMemberUnits, TeamMemberUnit, NewTeamMemberUnit } from '@/hooks/useTeamMemberUnits';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { supabase } from '@/integrations/supabase/client';

interface UnitPermissions {
  unitId: string;
  unitName: string;
  permissions: Record<string, boolean>;
}

interface CreatedCredentials {
  email: string;
  password: string;
  loginUrl: string;
  memberName: string;
  emailSent: boolean;
  emailError?: string | null;
}

const TeamManagement = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();
  const { teamMembers, isLoading, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
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
    'Directeur',
    'Responsable de production',
    'Responsable Écloserie',
    'Responsable Grossissement',
    'Technicien Aquacole',
    'Ouvrier Aquacole',
    'Comptable',
    'Stagiaire',
    'Personnalisé'
  ];

  const departments = [
    'Direction',
    'Production',
    'Comptabilité',
    'Commercial',
    'Maintenance',
    'Qualité'
  ];

  const modulePermissions = [
    { id: 'dashboard', label: 'Tableau de bord', description: 'Accès au tableau de bord principal' },
    { id: 'production', label: 'Production', description: 'Gestion des cycles de production' },
    { id: 'feeding', label: 'Alimentation', description: 'Gestion de l\'alimentation' },
    { id: 'livestock', label: 'Cheptel', description: 'Gestion du cheptel' },
    { id: 'health', label: 'Prophylaxie', description: 'Suivi sanitaire' },
    { id: 'reproduction', label: 'Reproduction', description: 'Gestion de la reproduction' },
    { id: 'infrastructure', label: 'Infrastructure', description: 'Gestion des infrastructures' },
    { id: 'environment', label: 'Environnement', description: 'Monitoring environnemental' },
    { id: 'iot', label: 'IoT', description: 'Capteurs et contrôle IoT' },
    { id: 'accounting', label: 'Comptabilité', description: 'Gestion financière' },
    { id: 'economics', label: 'Économie', description: 'Analyse économique' },
    { id: 'sales', label: 'Ventes', description: 'Gestion des ventes' },
    { id: 'purchases', label: 'Achats', description: 'Gestion des achats' },
    { id: 'suppliers', label: 'Fournisseurs', description: 'Gestion des fournisseurs' },
    { id: 'planning', label: 'Planification', description: 'Planification des tâches' },
    { id: 'reports', label: 'Rapports', description: 'Génération de rapports' },
    { id: 'settings', label: 'Paramètres', description: 'Configuration de l\'application' }
  ];

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
        // Remove from unitPermissions
        setInviteData(prevData => ({
          ...prevData,
          unitPermissions: prevData.unitPermissions.filter(up => up.unitId !== unitId)
        }));
      } else {
        newSet.add(unitId);
        // Add to unitPermissions
        setInviteData(prevData => ({
          ...prevData,
          unitPermissions: [...prevData.unitPermissions, {
            unitId: unit.id,
            unitName: unit.name,
            permissions: {}
          }]
        }));
      }
      return newSet;
    });
  };

  const addUnitToInvite = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit || inviteData.unitPermissions.some(up => up.unitId === unitId)) return;

    setInviteData(prev => ({
      ...prev,
      unitPermissions: [...prev.unitPermissions, {
        unitId: unit.id,
        unitName: unit.name,
        permissions: {}
      }]
    }));
    setSelectedUnitsForInvite(prev => new Set(prev).add(unitId));
  };

  const removeUnitFromInvite = (unitId: string) => {
    setInviteData(prev => ({
      ...prev,
      unitPermissions: prev.unitPermissions.filter(up => up.unitId !== unitId)
    }));
    setSelectedUnitsForInvite(prev => {
      const newSet = new Set(prev);
      newSet.delete(unitId);
      return newSet;
    });
  };

  const toggleUnitPermission = (unitId: string, permissionId: string) => {
    setInviteData(prev => ({
      ...prev,
      unitPermissions: prev.unitPermissions.map(up => 
        up.unitId === unitId ? {
          ...up,
          permissions: {
            ...up.permissions,
            [permissionId]: !up.permissions[permissionId]
          }
        } : up
      )
    }));
  };

  // Helper to generate password client-side for preview
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

  const handleProceedToSummary = () => {
    if (!inviteData.name || !inviteData.email || !inviteData.department) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (inviteData.unitPermissions.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez assigner au moins une unité de production",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast({
        title: "Erreur",
        description: "Format d'email invalide",
        variant: "destructive"
      });
      return;
    }

    // Generate password if not provided
    const finalPassword = inviteData.password || generatePasswordLocal();
    setGeneratedPassword(finalPassword);
    setInviteData(prev => ({ ...prev, password: finalPassword }));
    setShowSummaryStep(true);
  };

  const handleConfirmAndCreate = async (sendEmail: boolean) => {
    setIsSubmitting(true);
    
    const finalRole = inviteData.role === 'Personnalisé' ? inviteData.customRole : inviteData.role;
    
    const newMember: NewTeamMember = {
      member_name: inviteData.name,
      member_email: inviteData.email,
      role: finalRole || 'Membre',
      custom_role: inviteData.role === 'Personnalisé' ? inviteData.customRole : undefined,
      department: inviteData.department,
      permissions: inviteData.permissions
    };

    const result = await addTeamMember(newMember);
    
    if (result.success && result.data) {
      // Add unit associations
      for (const unitPerm of inviteData.unitPermissions) {
        await supabase.from('team_member_units').insert({
          team_member_id: result.data.id,
          unit_id: unitPerm.unitId,
          unit_name: unitPerm.unitName,
          permissions: unitPerm.permissions
        });
      }

      // Create user account
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const response = await supabase.functions.invoke('create-team-member-account', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: {
            email: inviteData.email,
            full_name: inviteData.name,
            team_member_id: result.data.id,
            password: generatedPassword,
            sendEmail: sendEmail
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const loginUrl = `${window.location.origin}/auth`;
        
        if (response.data?.credentials) {
          setCreatedCredentials({
            email: response.data.credentials.email,
            password: response.data.credentials.password || generatedPassword,
            loginUrl: response.data.credentials.loginUrl || loginUrl,
            memberName: inviteData.name,
            emailSent: response.data.emailSent || false,
            emailError: response.data.emailError
          });
          setShowCredentialsDialog(true);
        } else {
          // If no credentials in response, use local data
          setCreatedCredentials({
            email: inviteData.email,
            password: generatedPassword,
            loginUrl: loginUrl,
            memberName: inviteData.name,
            emailSent: sendEmail && response.data?.emailSent,
            emailError: response.data?.emailError
          });
          setShowCredentialsDialog(true);
        }

        const emailStatus = response.data?.emailSent 
          ? 'Email envoyé automatiquement' 
          : 'Compte créé (email non envoyé)';
        
        addLog('Membre invité', 'Équipe', `${inviteData.name} invité avec compte créé - ${emailStatus}`, 'success');
        
        toast({
          title: response.data?.emailSent ? "Membre ajouté et email envoyé" : "Membre ajouté",
          description: response.data?.emailSent 
            ? `Un email avec les identifiants a été envoyé à ${inviteData.email}`
            : `Un compte a été créé pour ${inviteData.name}`
        });
      } catch (error: any) {
        console.error('Error creating user account:', error);
        addLog('Membre invité (sans compte)', 'Équipe', `${inviteData.name} ajouté sans compte utilisateur`, 'warning');
        
        toast({
          title: "Membre ajouté",
          description: `${inviteData.name} a été ajouté mais le compte n'a pas pu être créé: ${error.message}`,
          variant: "destructive"
        });
      }

      setInviteData({
        name: '',
        email: '',
        password: '',
        role: '',
        customRole: '',
        department: '',
        permissions: {},
        unitPermissions: []
      });
      setSelectedUnitsForInvite(new Set());
      setGeneratedPassword('');
      setShowSummaryStep(false);
      setShowInviteForm(false);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible d'ajouter le membre",
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  const handleUpdateMemberPermissions = async () => {
    if (!selectedMember) return;
    
    setIsSubmitting(true);
    
    const result = await updateTeamMember(selectedMember.id, {
      permissions: selectedMember.permissions,
      role: selectedMember.role,
      custom_role: selectedMember.custom_role,
      department: selectedMember.department
    });
    
    if (result.success) {
      // Update unit permissions
      await supabase.from('team_member_units')
        .delete()
        .eq('team_member_id', selectedMember.id);

      for (const unitPerm of selectedMemberUnits) {
        await supabase.from('team_member_units').insert({
          team_member_id: selectedMember.id,
          unit_id: unitPerm.unit_id,
          unit_name: unitPerm.unit_name,
          permissions: unitPerm.permissions
        });
      }

      toast({
        title: "Permissions mises à jour",
        description: `Les permissions de ${selectedMember.member_name} ont été mises à jour`
      });
      setShowMemberDetails(false);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de mettre à jour les permissions",
        variant: "destructive"
      });
    }
    setIsSubmitting(false);
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${member.member_name} de votre équipe ?`)) return;
    
    const result = await deleteTeamMember(member.id);
    
    if (result.success) {
      addLog('Membre retiré', 'Équipe', `${member.member_name} retiré de l'équipe`, 'info');
      toast({
        title: "Membre retiré",
        description: `${member.member_name} a été retiré de votre équipe`
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de retirer le membre",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    const result = await updateTeamMember(member.id, { status: newStatus });
    
    if (result.success) {
      toast({
        title: "Statut mis à jour",
        description: `${member.member_name} est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}`
      });
    }
  };

  const handleResetPassword = async (member: TeamMember, sendEmail: boolean) => {
    setIsResettingPassword(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const response = await supabase.functions.invoke('reset-team-member-password', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          email: member.member_email,
          member_name: member.member_name,
          sendEmail
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        setResetPasswordResult({
          password: response.data.newPassword,
          loginUrl: response.data.loginUrl,
          emailSent: response.data.emailSent
        });

        addLog('Mot de passe réinitialisé', 'Équipe', `Mot de passe de ${member.member_name} réinitialisé`, 'info');
        
        toast({
          title: response.data.emailSent ? "Mot de passe réinitialisé et email envoyé" : "Mot de passe réinitialisé",
          description: response.data.emailSent 
            ? `Un email avec le nouveau mot de passe a été envoyé à ${member.member_email}`
            : `Le mot de passe de ${member.member_name} a été réinitialisé`
        });
      } else {
        throw new Error(response.data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser le mot de passe",
        variant: "destructive"
      });
      setShowResetPasswordDialog(false);
    }
    
    setIsResettingPassword(false);
  };

  const openResetPasswordDialog = (member: TeamMember) => {
    setResetPasswordMember(member);
    setResetPasswordResult(null);
    setShowResetPasswordDialog(true);
  };

  const toggleInvitePermission = (permissionId: string) => {
    setInviteData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: !prev.permissions[permissionId]
      }
    }));
  };

  const toggleMemberPermission = (permissionId: string) => {
    if (!selectedMember) return;
    setSelectedMember(prev => prev ? {
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: !prev.permissions[permissionId]
      }
    } : null);
  };

  const addUnitToMember = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit || selectedMemberUnits.some(mu => mu.unit_id === unitId)) return;

    setSelectedMemberUnits(prev => [...prev, {
      id: `temp-${Date.now()}`,
      team_member_id: selectedMember?.id || '',
      unit_id: unit.id,
      unit_name: unit.name,
      permissions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);
  };

  const removeUnitFromMember = (unitId: string) => {
    setSelectedMemberUnits(prev => prev.filter(mu => mu.unit_id !== unitId));
  };

  const toggleMemberUnitPermission = (unitId: string, permissionId: string) => {
    setSelectedMemberUnits(prev => prev.map(mu => 
      mu.unit_id === unitId ? {
        ...mu,
        permissions: {
          ...mu.permissions,
          [permissionId]: !mu.permissions[permissionId]
        }
      } : mu
    ));
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
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getPermissionCount = (permissions: Record<string, boolean>) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const openMemberDetails = async (member: TeamMember) => {
    setSelectedMember(member);
    await loadMemberUnits(member.id);
    setShowMemberDetails(true);
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
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestion d'Équipe</h2>
            <p className="text-blue-100">Ajoutez des membres et gérez leurs permissions par unité et module</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30" 
            onClick={() => setShowInviteForm(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un membre
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Membres total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{units.length}</p>
                <p className="text-sm text-muted-foreground">Unités</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{modulePermissions.length}</p>
                <p className="text-sm text-muted-foreground">Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="members">Membres de l'équipe</TabsTrigger>
          <TabsTrigger value="permissions">Permissions par module</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Membres de l'équipe ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun membre dans votre équipe</p>
                  <p className="text-sm">Cliquez sur "Ajouter un membre" pour commencer</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {member.member_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{member.member_name}</h4>
                          <p className="text-sm text-muted-foreground">{member.member_email}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {member.custom_role || member.role}
                            </Badge>
                            {member.department && (
                              <Badge variant="secondary" className="text-xs">{member.department}</Badge>
                            )}
                            <Badge className={getStatusColor(member.status)}>
                              {getStatusLabel(member.status)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getPermissionCount(member.permissions)} permissions
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-muted-foreground hidden sm:block">
                          <p>Ajouté le {new Date(member.invited_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMemberDetails(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(member)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetPasswordDialog(member)}
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMember(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions disponibles par module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modulePermissions.map((module) => {
                  const membersWithAccess = teamMembers.filter(m => m.permissions[module.id]);
                  return (
                    <div key={module.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{module.label}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      <Badge variant="secondary">
                        {membersWithAccess.length} membre{membersWithAccess.length !== 1 ? 's' : ''} avec accès
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Ajouter un membre */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nom complet *</Label>
                <Input
                  value={inviteData.name}
                  onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                  placeholder="Nom du membre"
                />
              </div>
              <div>
                <Label>Email (identifiant de connexion) *</Label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>

            <div>
              <Label>Mot de passe (optionnel)</Label>
              <Input
                type="password"
                value={inviteData.password}
                onChange={(e) => setInviteData({...inviteData, password: e.target.value})}
                placeholder="Laisser vide pour générer automatiquement"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min. 8 caractères avec majuscule, minuscule et chiffre. Si vide, un mot de passe sécurisé sera généré.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Rôle</Label>
                <Select value={inviteData.role} onValueChange={(value) => setInviteData({...inviteData, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {inviteData.role === 'Personnalisé' && (
                <div>
                  <Label>Rôle personnalisé *</Label>
                  <Input
                    value={inviteData.customRole}
                    onChange={(e) => setInviteData({...inviteData, customRole: e.target.value})}
                    placeholder="Ex: Responsable logistique"
                  />
                </div>
              )}
              <div>
                <Label>Département *</Label>
                <Select value={inviteData.department} onValueChange={(value) => setInviteData({...inviteData, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sélection des unités avec checkboxes */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Unités de production assignées * (sélectionnez plusieurs)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedUnitsForInvite.size === units.length) {
                      // Désélectionner tout
                      setSelectedUnitsForInvite(new Set());
                      setInviteData(prev => ({ ...prev, unitPermissions: [] }));
                    } else {
                      // Sélectionner tout
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
                        onCheckedChange={() => toggleUnitSelection(unit.id)}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnitFromInvite(unitPerm.unitId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {modulePermissions.map((module) => (
                          <div key={module.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`unit-${unitPerm.unitId}-${module.id}`}
                              checked={unitPerm.permissions[module.id] || false}
                              onCheckedChange={() => toggleUnitPermission(unitPerm.unitId, module.id)}
                            />
                            <label 
                              htmlFor={`unit-${unitPerm.unitId}-${module.id}`} 
                              className="text-xs cursor-pointer"
                            >
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

            {/* Permissions globales */}
            <div>
              <Label className="mb-3 block">Permissions globales (toutes unités)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-lg p-3">
                {modulePermissions.map((module) => (
                  <div key={module.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`invite-${module.id}`}
                      checked={inviteData.permissions[module.id] || false}
                      onCheckedChange={() => toggleInvitePermission(module.id)}
                    />
                    <label 
                      htmlFor={`invite-${module.id}`} 
                      className="text-sm cursor-pointer flex-1"
                    >
                      {module.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowInviteForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleProceedToSummary} disabled={isSubmitting}>
              Continuer vers le résumé
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Résumé avant création */}
      <Dialog open={showSummaryStep} onOpenChange={(open) => {
        if (!open) setShowSummaryStep(false);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Résumé du compte à créer
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nom</span>
                <span className="font-medium">{inviteData.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rôle</span>
                <Badge variant="secondary">
                  {inviteData.role === 'Personnalisé' ? inviteData.customRole : inviteData.role || 'Membre'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Département</span>
                <span>{inviteData.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unités assignées</span>
                <span>{inviteData.unitPermissions.length} unité(s)</span>
              </div>
            </div>

            {/* Identifiants de connexion */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Identifiants de connexion
              </h4>
              
              <div>
                <Label className="text-muted-foreground text-xs">Email (identifiant)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={inviteData.email} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteData.email);
                      toast({ title: "Email copié" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Mot de passe</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    type="text"
                    value={generatedPassword}
                    onChange={(e) => {
                      setGeneratedPassword(e.target.value);
                      setInviteData(prev => ({ ...prev, password: e.target.value }));
                    }}
                    className="font-mono text-sm"
                    placeholder="Mot de passe"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      toast({ title: "Mot de passe copié" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newPass = generatePasswordLocal();
                      setGeneratedPassword(newPass);
                      setInviteData(prev => ({ ...prev, password: newPass }));
                      toast({ title: "Nouveau mot de passe généré" });
                    }}
                    title="Générer un nouveau mot de passe"
                  >
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mot de passe visible et modifiable. Cliquez sur l'icône clé pour en générer un nouveau.
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Lien de connexion</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={`${window.location.origin}/auth`} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/auth`);
                      toast({ title: "Lien copié" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      window.open(`${window.location.origin}/auth`, '_blank');
                    }}
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Copy all button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const message = `Bonjour ${inviteData.name},\n\nVotre compte AquaPilote a été créé.\n\nLien de connexion: ${window.location.origin}/auth\nEmail: ${inviteData.email}\nMot de passe: ${generatedPassword}\n\nVeuillez changer votre mot de passe après votre première connexion.`;
                navigator.clipboard.writeText(message);
                toast({ title: "Message complet copié", description: "Vous pouvez le coller dans un email ou message" });
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier tous les identifiants
            </Button>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button 
              onClick={() => handleConfirmAndCreate(true)} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Mail className="w-4 h-4 mr-2" />
              Créer et envoyer par email
            </Button>
            <Button 
              variant="secondary"
              onClick={() => handleConfirmAndCreate(false)} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer sans envoyer d'email
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSummaryStep(false)}
              disabled={isSubmitting}
              className="w-full"
            >
              Retour
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails du membre */}
      <Dialog open={showMemberDetails} onOpenChange={setShowMemberDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier - {selectedMember?.member_name}</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={selectedMember.member_email} disabled />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getStatusColor(selectedMember.status)}>
                    {getStatusLabel(selectedMember.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Rôle</Label>
                  <Select 
                    value={selectedMember.custom_role ? 'Personnalisé' : selectedMember.role} 
                    onValueChange={(value) => {
                      if (value === 'Personnalisé') {
                        setSelectedMember({...selectedMember, role: value});
                      } else {
                        setSelectedMember({...selectedMember, role: value, custom_role: null});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(selectedMember.role === 'Personnalisé' || selectedMember.custom_role) && (
                  <div>
                    <Label>Rôle personnalisé</Label>
                    <Input
                      value={selectedMember.custom_role || ''}
                      onChange={(e) => setSelectedMember({...selectedMember, custom_role: e.target.value})}
                      placeholder="Ex: Responsable logistique"
                    />
                  </div>
                )}
                <div>
                  <Label>Département</Label>
                  <Select 
                    value={selectedMember.department || ''} 
                    onValueChange={(value) => setSelectedMember({...selectedMember, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Unités assignées */}
              <div>
                <Label className="mb-3 block">Unités de production assignées</Label>
                {isLoadingUnits ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-3">
                      <Select onValueChange={addUnitToMember}>
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
                      <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                        Aucune unité assignée
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {selectedMemberUnits.map((memberUnit) => (
                          <div key={memberUnit.unit_id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                <span className="font-medium">{memberUnit.unit_name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeUnitFromMember(memberUnit.unit_id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {modulePermissions.map((module) => (
                                <div key={module.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`member-unit-${memberUnit.unit_id}-${module.id}`}
                                    checked={memberUnit.permissions[module.id] || false}
                                    onCheckedChange={() => toggleMemberUnitPermission(memberUnit.unit_id, module.id)}
                                  />
                                  <label 
                                    htmlFor={`member-unit-${memberUnit.unit_id}-${module.id}`} 
                                    className="text-xs cursor-pointer"
                                  >
                                    {module.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Permissions globales */}
              <div>
                <Label className="mb-3 block">Permissions globales</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-lg p-3">
                  {modulePermissions.map((module) => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`member-${module.id}`}
                        checked={selectedMember.permissions[module.id] || false}
                        onCheckedChange={() => toggleMemberPermission(module.id)}
                      />
                      <label 
                        htmlFor={`member-${module.id}`} 
                        className="text-sm cursor-pointer flex-1"
                      >
                        {module.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowMemberDetails(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateMemberPermissions} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Credentials du nouveau membre */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Compte créé avec succès
            </DialogTitle>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4">
              {createdCredentials.emailSent ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Email envoyé avec succès!</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Un email avec les identifiants de connexion a été envoyé à <strong>{createdCredentials.email}</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">Email non envoyé</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Le compte a été créé mais l'email n'a pas pu être envoyé{createdCredentials.emailError ? `: ${createdCredentials.emailError}` : ''}.
                    Envoyez manuellement les informations ci-dessous à <strong>{createdCredentials.memberName}</strong>.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Lien de connexion</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={createdCredentials.loginUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.loginUrl);
                        toast({ title: "Lien copié" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={createdCredentials.email} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.email);
                        toast({ title: "Email copié" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Mot de passe temporaire</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="text"
                      value={createdCredentials.password} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.password);
                        toast({ title: "Mot de passe copié" });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le mot de passe est visible. Communiquez-le de manière sécurisée au membre.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    const message = `Bonjour ${createdCredentials.memberName},\n\nVotre compte AquaPilote a été créé.\n\nLien de connexion: ${createdCredentials.loginUrl}\nEmail: ${createdCredentials.email}\nMot de passe: ${createdCredentials.password}\n\nVeuillez changer votre mot de passe après votre première connexion.`;
                    navigator.clipboard.writeText(message);
                    toast({ title: "Message complet copié", description: "Vous pouvez le coller dans un email ou message" });
                  }}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Copier tout le message d'invitation
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Conseil: Demandez au membre de changer son mot de passe après la première connexion.
              </p>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowCredentialsDialog(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Réinitialisation mot de passe */}
      <Dialog open={showResetPasswordDialog} onOpenChange={(open) => {
        if (!open) {
          setShowResetPasswordDialog(false);
          setResetPasswordResult(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Réinitialiser le mot de passe
            </DialogTitle>
          </DialogHeader>
          
          {resetPasswordMember && (
            <div className="space-y-4">
              {!resetPasswordResult ? (
                <>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">
                      Vous allez réinitialiser le mot de passe de <strong>{resetPasswordMember.member_name}</strong> ({resetPasswordMember.member_email}).
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Un nouveau mot de passe sécurisé sera généré.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => handleResetPassword(resetPasswordMember, true)} 
                      disabled={isResettingPassword}
                      className="w-full"
                    >
                      {isResettingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Mail className="w-4 h-4 mr-2" />
                      Réinitialiser et envoyer par email
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => handleResetPassword(resetPasswordMember, false)} 
                      disabled={isResettingPassword}
                      className="w-full"
                    >
                      {isResettingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Réinitialiser sans envoyer d'email
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowResetPasswordDialog(false)}
                      disabled={isResettingPassword}
                      className="w-full"
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {resetPasswordResult.emailSent ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">Email envoyé avec succès!</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Le nouveau mot de passe a été envoyé à <strong>{resetPasswordMember.member_email}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-800 dark:text-amber-200">Mot de passe réinitialisé</span>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Partagez manuellement les informations ci-dessous à <strong>{resetPasswordMember.member_name}</strong>.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground text-xs">Nouveau mot de passe</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={resetPasswordResult.password} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(resetPasswordResult.password);
                            toast({ title: "Mot de passe copié" });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-xs">Lien de connexion</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={resetPasswordResult.loginUrl} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(resetPasswordResult.loginUrl);
                            toast({ title: "Lien copié" });
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const message = `Bonjour ${resetPasswordMember.member_name},\n\nVotre mot de passe AquaPilote a été réinitialisé.\n\nLien de connexion: ${resetPasswordResult.loginUrl}\nEmail: ${resetPasswordMember.member_email}\nNouveau mot de passe: ${resetPasswordResult.password}\n\nVeuillez changer votre mot de passe après votre connexion.`;
                      navigator.clipboard.writeText(message);
                      toast({ title: "Message complet copié" });
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier tous les identifiants
                  </Button>

                  <div className="flex justify-end">
                    <Button onClick={() => {
                      setShowResetPasswordDialog(false);
                      setResetPasswordResult(null);
                    }}>
                      Fermer
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
