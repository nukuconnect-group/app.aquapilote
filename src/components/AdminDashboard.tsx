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
import { Users, UserPlus, UserCheck, TrendingUp, Activity, Search, Filter, Edit, Trash2, Key, Eye, BarChart3, Calendar } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  subscriptionPlan?: string;
  subscriptionDuration?: number;
  status: 'active' | 'inactive';
  registrationDate: string;
  lastActivity?: string;
  password?: string;
}

const AdminDashboard = () => {
  const { t } = useSettings();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubscription, setFilterSubscription] = useState<string>('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'manager' | 'operator',
    subscriptionPlan: 'trial',
    subscriptionDuration: 30,
    status: 'active' as 'active' | 'inactive'
  });

  // Charger les utilisateurs depuis localStorage
  useEffect(() => {
    const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
    const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
    
    // Ajouter l'utilisateur démo
    const demoUser: User = {
      id: 'demo-1',
      name: 'Utilisateur Démo',
      email: 'demo@aquapilot.com',
      role: 'operator',
      subscriptionPlan: 'trial',
      subscriptionDuration: 30,
      status: 'active',
      registrationDate: '2024-01-01',
      lastActivity: new Date().toISOString()
    };

    const allUsers = [demoUser, ...registeredUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      subscriptionPlan: u.subscriptionPlan || 'trial',
      subscriptionDuration: u.subscriptionDuration || 30,
      status: u.status || 'active',
      registrationDate: u.registrationDate || new Date().toISOString().split('T')[0],
      lastActivity: u.lastLogin || new Date().toISOString(),
      password: u.password
    }))];

    setUsers(allUsers);
    setFilteredUsers(allUsers);
  }, []);

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    if (filterSubscription !== 'all') {
      filtered = filtered.filter(user => user.subscriptionPlan === filterSubscription);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, filterStatus, filterSubscription, users]);

  const handleAddUser = () => {
    const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
    const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];

    const emailExists = registeredUsers.some((u: any) => u.email === newUser.email);
    if (emailExists) {
      toast({
        title: t('error'),
        description: 'Un utilisateur avec cet email existe déjà',
        variant: 'destructive'
      });
      return;
    }

    const userToAdd = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      subscriptionPlan: newUser.subscriptionPlan,
      subscriptionDuration: newUser.subscriptionDuration,
      status: newUser.status,
      registrationDate: new Date().toISOString().split('T')[0],
      notifications: {
        email: true,
        desktop: true,
        sms: false
      }
    };

    registeredUsers.push(userToAdd);
    localStorage.setItem('aqua_pilot_registered_users', JSON.stringify(registeredUsers));

    setUsers(prev => [...prev, { ...userToAdd, lastActivity: new Date().toISOString() }]);
    setIsAddUserDialogOpen(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'operator',
      subscriptionPlan: 'trial',
      subscriptionDuration: 30,
      status: 'active'
    });

    toast({
      title: t('success'),
      description: t('user_created_success')
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'demo-1') {
      toast({
        title: t('warning'),
        description: 'Impossible de supprimer l\'utilisateur démo',
        variant: 'destructive'
      });
      return;
    }

    const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
    const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
    const updatedUsers = registeredUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('aqua_pilot_registered_users', JSON.stringify(updatedUsers));

    setUsers(prev => prev.filter(u => u.id !== userId));

    toast({
      title: t('success'),
      description: t('user_deleted_success')
    });
  };

  const handleToggleStatus = (userId: string) => {
    const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
    const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
    
    const userIndex = registeredUsers.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      registeredUsers[userIndex].status = registeredUsers[userIndex].status === 'active' ? 'inactive' : 'active';
      localStorage.setItem('aqua_pilot_registered_users', JSON.stringify(registeredUsers));
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));

    toast({
      title: t('success'),
      description: users.find(u => u.id === userId)?.status === 'active' 
        ? t('user_deactivated_success') 
        : t('user_activated_success')
    });
  };

  const handleResetPassword = (userId: string) => {
    const newPassword = 'Reset123!';
    const registeredUsersJson = localStorage.getItem('aqua_pilot_registered_users');
    const registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
    
    const userIndex = registeredUsers.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword;
      localStorage.setItem('aqua_pilot_registered_users', JSON.stringify(registeredUsers));
    }

    toast({
      title: t('success'),
      description: `${t('password_reset_success')} : ${newPassword}`
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getSubscriptionBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'pro': return 'default';
      case 'basic': return 'secondary';
      default: return 'outline';
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    newSubscriptions: users.filter(u => {
      const regDate = new Date(u.registrationDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return regDate > monthAgo;
    }).length,
    activeSubscriptions: users.filter(u => u.status === 'active' && u.subscriptionPlan).length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('admin_dashboard')}</h2>
            <p className="text-blue-100 text-sm sm:text-base">
              {t('user_management')} & {t('subscription_management')}
            </p>
          </div>
          <Users className="w-8 h-8 text-blue-100" />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('total_users')}</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('active_users')}</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('new_subscriptions')}</p>
                <p className="text-2xl font-bold">{stats.newSubscriptions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('active_subscriptions')}</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>{t('user_management')}</CardTitle>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('add_user')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('add_new_user')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input 
                      id="name" 
                      value={newUser.name} 
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newUser.email} 
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={newUser.password} 
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">{t('role')}</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">{t('operator_role')}</SelectItem>
                        <SelectItem value="manager">{t('manager_role')}</SelectItem>
                        <SelectItem value="admin">{t('admin_role')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subscription">{t('subscription_plan')}</Label>
                    <Select value={newUser.subscriptionPlan} onValueChange={(value) => setNewUser({ ...newUser, subscriptionPlan: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">{t('trial_plan')}</SelectItem>
                        <SelectItem value="basic">{t('basic_plan')}</SelectItem>
                        <SelectItem value="pro">{t('pro_plan')}</SelectItem>
                        <SelectItem value="enterprise">{t('enterprise_plan')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">{t('subscription_duration')} ({t('days')})</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      value={newUser.subscriptionDuration} 
                      onChange={(e) => setNewUser({ ...newUser, subscriptionDuration: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddUser}>{t('add')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder={t('search_users')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter_by_role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_roles')}</SelectItem>
                  <SelectItem value="admin">{t('admin_role')}</SelectItem>
                  <SelectItem value="manager">{t('manager_role')}</SelectItem>
                  <SelectItem value="operator">{t('operator_role')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSubscription} onValueChange={setFilterSubscription}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter_by_subscription')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_subscriptions')}</SelectItem>
                  <SelectItem value="trial">{t('trial_plan')}</SelectItem>
                  <SelectItem value="basic">{t('basic_plan')}</SelectItem>
                  <SelectItem value="pro">{t('pro_plan')}</SelectItem>
                  <SelectItem value="enterprise">{t('enterprise_plan')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('subscription_type')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('registration_date')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {t(`${user.role}_role`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSubscriptionBadgeVariant(user.subscriptionPlan || 'trial')}>
                        {t(`${user.subscriptionPlan || 'trial'}_plan`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {t(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? t('deactivate') : t('activate')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;