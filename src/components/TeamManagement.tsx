import React, { useState } from 'react';
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
import { Users, UserPlus, Settings, Star, Award, MessageSquare, Trash2, Edit, Loader2 } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers, TeamMember, NewTeamMember } from '@/hooks/useTeamMembers';

const TeamManagement = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();
  const { teamMembers, isLoading, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inviteData, setInviteData] = useState<{
    name: string;
    email: string;
    role: string;
    department: string;
    permissions: Record<string, boolean>;
  }>({
    name: '',
    email: '',
    role: '',
    department: '',
    permissions: {}
  });

  const roles = [
    'Directeur',
    'Responsable de production',
    'Responsable Écloserie',
    'Responsable Grossissement',
    'Technicien Aquacole',
    'Ouvrier Aquacole',
    'Comptable',
    'Stagiaire'
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

  const handleInviteMember = async () => {
    if (!inviteData.name || !inviteData.email || !inviteData.department) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast({
        title: "Erreur",
        description: "Format d'email invalide",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const newMember: NewTeamMember = {
      member_name: inviteData.name,
      member_email: inviteData.email,
      role: inviteData.role || 'Membre',
      department: inviteData.department,
      permissions: inviteData.permissions
    };

    const result = await addTeamMember(newMember);
    
    if (result.success) {
      addLog('Membre invité', 'Équipe', `${inviteData.name} invité dans le département ${inviteData.department}`, 'success');
      
      toast({
        title: "Membre ajouté",
        description: `${inviteData.name} a été ajouté à votre équipe`
      });

      setInviteData({
        name: '',
        email: '',
        role: '',
        department: '',
        permissions: {}
      });
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
      department: selectedMember.department
    });
    
    if (result.success) {
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
            <p className="text-blue-100">Ajoutez des membres et gérez leurs permissions par module</p>
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
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
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
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
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
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberDetails(true);
                          }}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
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

            <div>
              <Label className="mb-3 block">Permissions par module</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
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
              <p className="text-xs text-muted-foreground mt-2">
                {Object.values(inviteData.permissions).filter(Boolean).length} module(s) sélectionné(s)
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowInviteForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleInviteMember} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter le membre
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails du membre */}
      <Dialog open={showMemberDetails} onOpenChange={setShowMemberDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les permissions - {selectedMember?.member_name}</DialogTitle>
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
                    value={selectedMember.role} 
                    onValueChange={(value) => setSelectedMember({...selectedMember, role: value})}
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

              <div>
                <Label className="mb-3 block">Permissions par module</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
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
                <p className="text-xs text-muted-foreground mt-2">
                  {getPermissionCount(selectedMember.permissions)} module(s) autorisé(s)
                </p>
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
    </div>
  );
};

export default TeamManagement;
