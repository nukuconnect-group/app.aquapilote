
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
import { Users, Plus, UserPlus, Mail, MessageSquare, Settings, Star, Award } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  lastActivity: string;
}

const TeamManagement = () => {
  const { addLog } = useLogs();
  const { toast } = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Marie Dubois',
      email: 'marie.dubois@aqua-ferme.fr',
      role: 'Responsable Écloserie',
      department: 'Production',
      joinDate: '2023-06-01',
      status: 'active',
      permissions: ['view_data', 'edit_fish', 'manage_feeding'],
      lastActivity: '2024-01-18 14:30'
    },
    {
      id: '2',
      name: 'Jean Martin',
      email: 'jean.martin@aqua-ferme.fr',
      role: 'Responsable Grossissement',
      department: 'Production',
      joinDate: '2023-03-15',
      status: 'active',
      permissions: ['view_data', 'edit_fish', 'manage_feeding', 'manage_health'],
      lastActivity: '2024-01-18 16:45'
    },
    {
      id: '3',
      name: 'Pierre Durand',
      email: 'pierre.durand@aqua-ferme.fr',
      role: 'Technicien Aquacole',
      department: 'Production',
      joinDate: '2024-01-10',
      status: 'pending',
      permissions: ['view_data'],
      lastActivity: 'Jamais connecté'
    }
  ]);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    permissions: [] as string[]
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

  const allPermissions = [
    { id: 'view_data', label: 'Consulter les données', category: 'Lecture' },
    { id: 'edit_fish', label: 'Gérer les poissons', category: 'Poissons' },
    { id: 'manage_feeding', label: 'Gérer l\'alimentation', category: 'Alimentation' },
    { id: 'manage_health', label: 'Gérer la prophylaxie', category: 'Santé' },
    { id: 'manage_production', label: 'Gérer la production', category: 'Production' },
    { id: 'manage_equipment', label: 'Gérer les équipements', category: 'Équipements' },
    { id: 'view_accounting', label: 'Consulter la comptabilité', category: 'Comptabilité' },
    { id: 'manage_accounting', label: 'Gérer la comptabilité', category: 'Comptabilité' },
    { id: 'manage_team', label: 'Gérer l\'équipe', category: 'Administration' },
    { id: 'admin_access', label: 'Accès administrateur', category: 'Administration' }
  ];

  const handleInviteMember = () => {
    if (!inviteData.name || !inviteData.email || !inviteData.department) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteData.name,
      email: inviteData.email,
      role: inviteData.role,
      department: inviteData.department,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      permissions: inviteData.permissions,
      lastActivity: 'Jamais connecté'
    };

    setTeamMembers([...teamMembers, newMember]);
    addLog('Membre invité', 'Équipe', `${inviteData.name} invité dans le département ${inviteData.department}`, 'success');
    
    toast({
      title: "Invitation envoyée",
      description: `Une invitation a été envoyée à ${inviteData.email}`
    });

    // Reset form
    setInviteData({
      name: '',
      email: '',
      role: '',
      department: '',
      permissions: []
    });
    setShowInviteForm(false);
  };

  const togglePermission = (permissionId: string) => {
    setInviteData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestion d'Équipe</h2>
            <p className="text-blue-100">Collaboration et gestion des membres de l'équipe</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30" onClick={() => setShowInviteForm(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter un membre
            </Button>
          </div>
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
                <p className="text-sm text-gray-600">Membres total</p>
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
                <p className="text-sm text-gray-600">Actifs</p>
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
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-sm text-gray-600">Départements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="members">Membres de l'équipe</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Membres de l'équipe ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          <Badge variant="secondary" className="text-xs">{member.department}</Badge>
                          <Badge className={getStatusColor(member.status)}>
                            {getStatusLabel(member.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-500">
                        <p>Rejoint le {new Date(member.joinDate).toLocaleDateString('fr-FR')}</p>
                        <p>Dernière activité: {member.lastActivity}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberDetails(true);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-medium mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{permission.label}</p>
                            <p className="text-sm text-gray-600">
                              {teamMembers.filter(m => m.permissions.includes(permission.id)).length} membres ont cette permission
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.filter(m => m.status === 'active').map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{member.lastActivity}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {member.permissions.length} permissions
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Inviter un membre */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inviter un nouveau membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
              <Label>Permissions</Label>
              <div className="mt-2 space-y-4 max-h-60 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category}>
                    <h5 className="font-medium text-sm mb-2">{category}</h5>
                    <div className="grid grid-cols-1 gap-2 ml-4">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inviteData.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded"
                          />
                          <span className="text-sm">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowInviteForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleInviteMember}>
              <Mail className="w-4 h-4 mr-2" />
              Envoyer l'invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails du membre */}
      <Dialog open={showMemberDetails} onOpenChange={setShowMemberDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du membre</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{selectedMember.name}</h3>
                  <p className="text-gray-600">{selectedMember.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedMember.role}</Badge>
                    <Badge variant="secondary">{selectedMember.department}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Date d'arrivée</Label>
                  <p>{new Date(selectedMember.joinDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getStatusColor(selectedMember.status)}>
                    {getStatusLabel(selectedMember.status)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Permissions ({selectedMember.permissions.length})</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedMember.permissions.map(permId => {
                    const perm = allPermissions.find(p => p.id === permId);
                    return perm ? (
                      <Badge key={permId} variant="outline" className="text-xs">
                        {perm.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowMemberDetails(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
