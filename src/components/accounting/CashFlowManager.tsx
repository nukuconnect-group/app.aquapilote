
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, AlertTriangle, Calendar, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { useLogs } from '@/contexts/LogsContext';
import { useSettings } from '@/contexts/SettingsContext';

interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash';
  balance: number;
  currency: string;
}

interface Invoice {
  id: string;
  type: 'receivable' | 'payable';
  number: string;
  client?: string;
  supplier?: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  description: string;
  issueDate: string;
}

const CashFlowManager = () => {
  const { addLog } = useLogs();
  const { formatCurrency, t } = useSettings();

  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'cash',
    balance: 0
  });

  const [newInvoice, setNewInvoice] = useState({
    type: 'receivable' as 'receivable' | 'payable',
    number: '',
    client: '',
    supplier: '',
    amount: 0,
    dueDate: '',
    description: ''
  });

  // Données pour les graphiques de flux de trésorerie (vides par défaut)
  const cashFlowData: { month: string; inflow: number; outflow: number; net: number }[] = [];

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const receivables = invoices.filter(inv => inv.type === 'receivable' && inv.status === 'pending');
  const payables = invoices.filter(inv => inv.type === 'payable' && inv.status === 'pending');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

  const totalReceivables = receivables.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPayables = payables.reduce((sum, inv) => sum + inv.amount, 0);

  const handleAddAccount = () => {
    const account: BankAccount = {
      id: Date.now().toString(),
      ...newAccount,
      currency: 'XOF'
    };
    
    setAccounts([...accounts, account]);
    addLog('Compte ajouté', 'Comptabilité', `Nouveau compte: ${account.name}`, 'success');
    
    setShowAccountForm(false);
    setNewAccount({ name: '', type: 'checking', balance: 0 });
  };

  const handleAddInvoice = () => {
    const invoice: Invoice = {
      id: Date.now().toString(),
      ...newInvoice,
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0]
    };
    
    setInvoices([...invoices, invoice]);
    addLog('Facture ajoutée', 'Comptabilité', `Nouvelle facture: ${invoice.number}`, 'success');
    
    setShowInvoiceForm(false);
    setNewInvoice({
      type: 'receivable',
      number: '',
      client: '',
      supplier: '',
      amount: 0,
      dueDate: '',
      description: ''
    });
  };

  const handlePayInvoice = (invoiceId: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv
    ));
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      addLog('Facture payée', 'Comptabilité', `Facture ${invoice.number} marquée comme payée`, 'success');
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const config = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'En retard', className: 'bg-red-100 text-red-800' },
      paid: { label: 'Payée', className: 'bg-green-100 text-green-800' }
    };
    
    return <Badge className={config[status].className}>{config[status].label}</Badge>;
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: 'Compte courant',
      savings: 'Compte épargne',
      cash: 'Caisse'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble trésorerie */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-sm text-gray-600">{t('totalCash') || 'Trésorerie totale'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-5 bg-green-600 rounded-full" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceivables)}</p>
            <p className="text-sm text-gray-600">{t('toReceive') || 'À recevoir'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-5 bg-red-600 rounded-full" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPayables)}</p>
            <p className="text-sm text-gray-600">{t('toPay') || 'À payer'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{overdueInvoices.length}</p>
            <p className="text-sm text-gray-600">{t('overdue')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="cashflow">Flux de trésorerie</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestion des comptes</h3>
            <Button onClick={() => setShowAccountForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau compte
            </Button>
          </div>
          
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun compte bancaire configuré</p>
                <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Nouveau compte" pour ajouter votre premier compte</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <Card key={account.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{account.name}</h4>
                        <p className="text-sm text-muted-foreground">{getAccountTypeLabel(account.type)}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                      <p className="text-sm text-muted-foreground">{account.currency}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestion des factures</h3>
            <Button onClick={() => setShowInvoiceForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </div>
          
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune facture enregistrée</p>
                <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Nouvelle facture" pour ajouter une facture</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={invoice.type === 'receivable' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {invoice.type === 'receivable' ? 'À recevoir' : 'À payer'}
                          </Badge>
                          {getStatusBadge(invoice.status)}
                          <span className="text-sm text-muted-foreground">Échéance: {invoice.dueDate}</span>
                        </div>
                        <h4 className="font-semibold">{invoice.number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {invoice.client || invoice.supplier} • {invoice.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold">{formatCurrency(invoice.amount)}</span>
                        <div className="flex space-x-1">
                          {invoice.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayInvoice(invoice.id)}
                            >
                              Marquer payée
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des flux de trésorerie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inflow" fill="#10b981" name="Entrées" />
                  <Bar dataKey="outflow" fill="#ef4444" name="Sorties" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flux net de trésorerie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} name="Flux net" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {overdueInvoices.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Factures en retard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-gray-600">{invoice.client || invoice.supplier}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(invoice.amount)}</p>
                          <p className="text-sm text-red-500">{t('dueDate')}: {invoice.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {totalBalance < 5000 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Trésorerie faible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700">
                    {t('lowCashWarning') || `Votre trésorerie actuelle (${formatCurrency(totalBalance)}) est inférieure au seuil recommandé de ${formatCurrency(5000)}.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs pour formulaires */}
      <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du compte</Label>
              <Input
                value={newAccount.name}
                onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                placeholder="Ex: Compte courant BNP"
              />
            </div>
            <div>
              <Label>Type de compte</Label>
              <Select
                value={newAccount.type}
                onValueChange={(value) => setNewAccount({...newAccount, type: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Compte courant</SelectItem>
                  <SelectItem value="savings">Compte épargne</SelectItem>
                  <SelectItem value="cash">Caisse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Solde initial (F CFA)</Label>
              <Input
                type="number"
                step="0.01"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAccountForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddAccount}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newInvoice.type}
                  onValueChange={(value) => setNewInvoice({...newInvoice, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receivable">À recevoir (client)</SelectItem>
                    <SelectItem value="payable">À payer (fournisseur)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Numéro de facture</Label>
                <Input
                  value={newInvoice.number}
                  onChange={(e) => setNewInvoice({...newInvoice, number: e.target.value})}
                  placeholder="FAC-2024-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{newInvoice.type === 'receivable' ? 'Client' : 'Fournisseur'}</Label>
                <Input
                  value={newInvoice.type === 'receivable' ? newInvoice.client : newInvoice.supplier}
                  onChange={(e) => setNewInvoice({
                    ...newInvoice,
                    [newInvoice.type === 'receivable' ? 'client' : 'supplier']: e.target.value
                  })}
                  placeholder={newInvoice.type === 'receivable' ? 'Nom du client' : 'Nom du fournisseur'}
                />
              </div>
              <div>
                <Label>Montant (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date d'échéance</Label>
                <Input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  placeholder="Description de la facture"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInvoiceForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddInvoice}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashFlowManager;
