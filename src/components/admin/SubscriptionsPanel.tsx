import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Plus, Pause, Play, Ban, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, addYears } from 'date-fns';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: string;
  status: 'active' | 'suspended' | 'cancelled' | 'expired' | string;
  start_date: string;
  end_date: string;
  price: number | null;
  currency: string | null;
  notes: string | null;
  created_at: string;
}

interface UserLite {
  id: string;
  email: string;
  full_name: string;
}

interface SubscriptionsPanelProps {
  users: UserLite[];
}

const PLANS = [
  { value: 'annual_basic', label: 'Annuel - Basic' },
  { value: 'annual_pro', label: 'Annuel - Pro' },
  { value: 'annual_enterprise', label: 'Annuel - Enterprise' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-400',
  suspended: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400',
  expired: 'bg-muted text-muted-foreground',
};

const SubscriptionsPanel: React.FC<SubscriptionsPanelProps> = ({ users }) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    plan: 'annual_basic',
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    price: '',
    notes: '',
  });

  const usersById = useMemo(() => {
    const m = new Map<string, UserLite>();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setSubs((data as SubscriptionRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      userId: '',
      plan: 'annual_basic',
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
      price: '',
      notes: '',
    });
  };

  const handleCreate = async () => {
    if (!form.userId) {
      toast({ title: 'Sélectionnez un utilisateur', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('subscriptions').insert({
      user_id: form.userId,
      plan: form.plan,
      status: 'active',
      start_date: form.start,
      end_date: form.end,
      price: form.price ? Number(form.price) : null,
      currency: 'XOF',
      notes: form.notes || null,
      created_by: currentUser?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Abonnement attribué', description: 'Le client a été abonné avec succès.' });
    setDialogOpen(false);
    resetForm();
    load();
  };

  const updateStatus = async (id: string, status: SubscriptionRow['status'], blockUserId?: string) => {
    const { error } = await supabase.from('subscriptions').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    // Optionally suspend/unsuspend the linked profile to block app access
    if (blockUserId) {
      const suspend = status === 'suspended' || status === 'cancelled';
      await supabase
        .from('profiles')
        .update({
          is_suspended: suspend,
          suspension_reason: suspend ? 'Abonnement ' + status : null,
          suspended_at: suspend ? new Date().toISOString() : null,
        })
        .eq('id', blockUserId);
    }
    toast({ title: 'Statut mis à jour' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet abonnement ?')) return;
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Abonnement supprimé' });
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5 text-primary" /> Abonnements entreprises
          </CardTitle>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Attribuer un abonnement
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement...
            </div>
          ) : subs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Aucun abonnement attribué pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise / Utilisateur</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((s) => {
                    const u = usersById.get(s.user_id);
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{u?.full_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{u?.email || s.user_id.slice(0, 8)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{PLANS.find((p) => p.value === s.plan)?.label || s.plan}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(s.start_date), 'dd/MM/yyyy')}
                          <br />→ {format(new Date(s.end_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {s.price ? `${s.price.toLocaleString('fr-FR')} ${s.currency || 'XOF'}` : '—'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[s.status] || ''}`}>
                            {s.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {s.status === 'active' ? (
                            <Button size="icon" variant="ghost" title="Suspendre" onClick={() => updateStatus(s.id, 'suspended', s.user_id)}>
                              <Pause className="w-4 h-4 text-orange-500" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" title="Réactiver" onClick={() => updateStatus(s.id, 'active', s.user_id)}>
                              <Play className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Bloquer (annuler)" onClick={() => updateStatus(s.id, 'cancelled', s.user_id)}>
                            <Ban className="w-4 h-4 text-red-500" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Supprimer" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Nouvel abonnement annuel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Utilisateur / Entreprise</Label>
              <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name} — {u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Début</Label>
                <Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </div>
              <div>
                <Label>Fin</Label>
                <Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Prix (XOF)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="120000" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsPanel;