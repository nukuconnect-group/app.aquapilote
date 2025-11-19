import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, UserCheck, TrendingUp, Activity, Search, Key, Trash2, BarChart3, AlertTriangle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/clientConfig';
import { userCreationSchema } from '@/lib/validation';
import { useLogs } from '@/contexts/LogsContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'operator' | 'user';
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'operator' | 'user';
  created_at: string;
}

const AdminDashboard = () => {
  const { t } = useSettings();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { logs } = useLogs();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'admin' | 'manager' | 'operator' | 'user'
  });

  // Statistiques calculées
  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    operators: users.filter(u => u.role === 'operator').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    recentUsers: users.filter(u => {
      const userDate = new Date(u.created_at);
      const weekAgo = subDays(new Date(), 7);
      return userDate >= weekAgo;
    }).length,
    errors: logs.filter(l => l.severity === 'error').length,
    warnings: logs.filter(l => l.severity === 'warning').length,
    activities: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const today = startOfDay(new Date());
      return logDate >= today;
    }).length
  };

  // Données pour les graphiques
  const roleDistribution = [
    { name: 'Admins', value: stats.admins, color: 'hsl(var(--destructive))' },
    { name: 'Managers', value: stats.managers, color: 'hsl(var(--primary))' },
    { name: 'Operators', value: stats.operators, color: 'hsl(var(--aqua-primary))' },
    { name: 'Users', value: stats.regularUsers, color: 'hsl(var(--muted-foreground))' }
  ];

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLogs = logs.filter(l => {
      const logDate = new Date(l.timestamp);
      return logDate >= startOfDay(date) && logDate <= endOfDay(date);
    });
    
    return {
      date: format(date, 'dd/MM'),
      activities: dayLogs.length,
      errors: dayLogs.filter(l => l.severity === 'error').length,
      warnings: dayLogs.filter(l => l.severity === 'warning').length
    };
  });

  const moduleActivity = logs.reduce((acc, log) => {
    const module = log.module || 'Autre';
    if (!acc[module]) {
      acc[module] = 0;
    }
    acc[module]++;
    return acc;
  }, {} as Record<string, number>);

  const moduleData = Object.entries(moduleActivity)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const usersData: AdminUser[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.email,
          role: (userRole?.role || 'user') as 'admin' | 'manager' | 'operator' | 'user',
          created_at: profile.created_at
        };
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error loading users:', error);
      toast({
        title: t('error'),
        description: 'Erreur lors du chargement des utilisateurs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, users]);

  const handleAddUser = async () => {
    try {
      const validation = userCreationSchema.safeParse(newUser);
      if (!validation.success) {
        toast({
          title: t('error'),
          description: validation.error.issues[0].message,
          variant: 'destructive'
        });
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      });

      if (authError) {
        toast({
          title: t('error'),
          description: authError.message,
          variant: 'destructive'
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: t('error'),
          description: 'Erreur lors de la création de l\'utilisateur',
          variant: 'destructive'
        });
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: newUser.email,
          full_name: newUser.full_name
        });

      if (profileError) {
        toast({
          title: t('error'),
          description: profileError.message,
          variant: 'destructive'
        });
        return;
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: newUser.role as any
        });

      if (roleError) {
        toast({
          title: t('error'),
          description: roleError.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('success'),
        description: 'Utilisateur créé avec succès'
      });

      setIsAddUserDialogOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      loadUsers();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error creating user:', error);
      toast({
        title: t('error'),
        description: 'Erreur lors de la création de l\'utilisateur',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return;
    }

    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        toast({
          title: t('error'),
          description: roleError.message,
          variant: 'destructive'
        });
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        toast({
          title: t('error'),
          description: profileError.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('success'),
        description: 'Utilisateur supprimé avec succès'
      });

      loadUsers();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting user:', error);
      toast({
        title: t('error'),
        description: 'Erreur lors de la suppression',
        variant: 'destructive'
      });
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('success'),
        description: 'Email de réinitialisation envoyé'
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error resetting password:', error);
      toast({
        title: t('error'),
        description: 'Erreur lors de la réinitialisation',
        variant: 'destructive'
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'manager' | 'operator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: t('success'),
        description: 'Rôle modifié avec succès'
      });

      loadUsers();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error changing role:', error);
      toast({
        title: t('error'),
        description: 'Erreur lors de la modification du rôle',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'operator': return 'secondary';
      default: return 'outline';
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/90 to-aqua-primary/80 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Tableau de bord administrateur</h2>
            <p className="text-primary-foreground/80 text-sm sm:text-base">
              Supervision complète de l'application
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-primary-foreground/80" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Utilisateurs</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Activités</span>
            <span className="sm:hidden">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Erreurs</span>
            <span className="sm:hidden">Bugs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground mt-1">+{stats.recentUsers} cette semaine</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Activités aujourd'hui</p>
                    <p className="text-2xl font-bold">{stats.activities}</p>
                  </div>
                  <Activity className="w-8 h-8 text-aqua-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Erreurs</p>
                    <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avertissements</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des rôles</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modules les plus utilisés</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité sur 7 jours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activities" stroke="hsl(var(--primary))" name="Activités" />
                  <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" name="Erreurs" />
                  <Line type="monotone" dataKey="warnings" stroke="#f59e0b" name="Avertissements" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nouvel utilisateur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="full_name">Nom complet</Label>
                        <Input 
                          id="full_name" 
                          value={newUser.full_name} 
                          onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={newUser.email} 
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input 
                          id="password" 
                          type="password"
                          value={newUser.password} 
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rôle</Label>
                        <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="operator">Opérateur</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddUser}>Ajouter</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                    <SelectItem value="manager">Managers</SelectItem>
                    <SelectItem value="operator">Opérateurs</SelectItem>
                    <SelectItem value="user">Utilisateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select 
                              value={user.role} 
                              onValueChange={(value: any) => handleChangeRole(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                  {user.role}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Utilisateur</SelectItem>
                                <SelectItem value="operator">Opérateur</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetPassword(user.id, user.email)}
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id, user.email)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'activités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.slice(0, 100).map(log => (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`mt-1 rounded-full p-1 ${
                      log.severity === 'error' ? 'bg-destructive/20 text-destructive' :
                      log.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      log.severity === 'success' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {log.severity === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                       log.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{log.userName}</span>
                        <Badge variant="outline" className="text-xs">{log.module}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune activité enregistrée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs et avertissements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs
                  .filter(log => log.severity === 'error' || log.severity === 'warning')
                  .slice(0, 100)
                  .map(log => (
                    <div 
                      key={log.id} 
                      className={`p-4 border-l-4 rounded-lg ${
                        log.severity === 'error' 
                          ? 'border-destructive bg-destructive/5' 
                          : 'border-yellow-500 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          log.severity === 'error' ? 'text-destructive' : 'text-yellow-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge variant={log.severity === 'error' ? 'destructive' : 'default'}>
                              {log.severity === 'error' ? 'ERREUR' : 'AVERTISSEMENT'}
                            </Badge>
                            <Badge variant="outline">{log.module}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                            </span>
                          </div>
                          <p className="font-medium mb-1">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Utilisateur: {log.userName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                {logs.filter(log => log.severity === 'error' || log.severity === 'warning').length === 0 && (
                  <div className="text-center py-12">
                    <UserCheck className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="text-lg font-medium text-green-600">Aucune erreur détectée</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      L'application fonctionne normalement
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;