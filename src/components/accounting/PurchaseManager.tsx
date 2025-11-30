
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, Download, Edit, Trash2, Search, ShoppingCart, CheckCircle, Clock, XCircle, Package, DollarSign } from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const PurchaseManager = () => {
  const { addLog } = useLogs();
  const { 
    purchases, 
    units, 
    currency,
    setCurrency,
    addPurchase, 
    updatePurchase, 
    deletePurchase,
    convertCurrency
  } = useProductionUnits();
  
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    unitId: '',
    status: ''
  });

  const [newPurchase, setNewPurchase] = useState({
    category: '',
    subcategory: '',
    description: '',
    supplier: '',
    amount: 0,
    currency: currency,
    quantity: 0,
    unit: '',
    paymentMethod: '',
    reference: '',
    unitId: '',
    deliveryDate: '',
    notes: ''
  });

  const purchaseCategories = {
    'Aliments': ['Granulés flottants', 'Granulés coulants', 'Farine de poisson', 'Aliment croissance', 'Aliment finition', 'Compléments nutritionnels'],
    'Équipements et matériels': ['Pompes', 'Filtres', 'Aérateurs', 'Bassins', 'Filets', 'Outils de mesure', 'Matériel de pêche'],
    'Intrants': ['Engrais organiques', 'Probiotiques', 'Désinfectants', 'Produits de traitement', 'Chaux', 'Sel'],
    'Alevins': ['Tilapia', 'Carpe', 'Truite', 'Bar', 'Dorade', 'Autres espèces'],
    'Formations du personnel': ['Formation technique', 'Formation sécurité', 'Formation gestion', 'Certification', 'Séminaires'],
    'Prestations externes': ['Consultance', 'Maintenance', 'Transport', 'Analyses laboratoire', 'Services vétérinaires'],
    'Prestations internes': ['Main d\'œuvre', 'Services internes', 'Transferts inter-unités'],
    'Matières premières': ['Ciment', 'Bâches', 'Tuyaux', 'Vannes', 'Raccords', 'Électricité'],
    'Kits et autres': ['Kits de test', 'Produits d\'entretien', 'Fournitures bureau', 'Carburant', 'Divers']
  };

  const paymentMethods = [
    'Espèces',
    'Carte bancaire',
    'Virement',
    'Chèque',
    'Prélèvement',
    'Crédit fournisseur',
    'Mobile Money'
  ];

  const currencies = [
    { code: 'XOF', symbol: 'F CFA', name: 'Franc CFA' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar US' }
  ];

  const handleAddPurchase = () => {
    const selectedUnit = units.find(u => u.id === newPurchase.unitId);
    addPurchase({
      date: new Date().toISOString().split('T')[0],
      category: newPurchase.category,
      subcategory: newPurchase.subcategory,
      description: newPurchase.description,
      supplier: newPurchase.supplier,
      amount: Number(newPurchase.amount),
      currency: newPurchase.currency as 'XOF' | 'EUR' | 'USD' | 'MAD',
      quantity: newPurchase.quantity || undefined,
      unit: newPurchase.unit || undefined,
      paymentMethod: newPurchase.paymentMethod,
      reference: newPurchase.reference,
      unitId: newPurchase.unitId || undefined,
      unitName: selectedUnit?.name || undefined,
      status: 'pending',
      deliveryDate: newPurchase.deliveryDate || undefined,
      notes: newPurchase.notes || undefined
    });
    
    addLog('Achat enregistré', 'Achats', `${newPurchase.category}: ${newPurchase.description} - ${newPurchase.amount} ${newPurchase.currency}`, 'success');
    resetForm();
  };

  const handleUpdatePurchase = () => {
    if (!editingPurchase) return;
    
    const selectedUnit = units.find(u => u.id === newPurchase.unitId);
    updatePurchase(editingPurchase.id, {
      category: newPurchase.category,
      subcategory: newPurchase.subcategory,
      description: newPurchase.description,
      supplier: newPurchase.supplier,
      amount: Number(newPurchase.amount),
      currency: newPurchase.currency as 'XOF' | 'EUR' | 'USD' | 'MAD',
      quantity: newPurchase.quantity || undefined,
      unit: newPurchase.unit || undefined,
      paymentMethod: newPurchase.paymentMethod,
      reference: newPurchase.reference,
      unitId: newPurchase.unitId || undefined,
      unitName: selectedUnit?.name || undefined,
      deliveryDate: newPurchase.deliveryDate || undefined,
      notes: newPurchase.notes || undefined
    });
    
    addLog('Achat modifié', 'Achats', `Achat modifié: ${newPurchase.description}`, 'info');
    resetForm();
  };

  const resetForm = () => {
    setNewPurchase({
      category: '',
      subcategory: '',
      description: '',
      supplier: '',
      amount: 0,
      currency: currency,
      quantity: 0,
      unit: '',
      paymentMethod: '',
      reference: '',
      unitId: '',
      deliveryDate: '',
      notes: ''
    });
    setShowPurchaseForm(false);
    setEditingPurchase(null);
  };

  const handleEditPurchase = (purchase: any) => {
    setEditingPurchase(purchase);
    setNewPurchase({
      category: purchase.category,
      subcategory: purchase.subcategory || '',
      description: purchase.description,
      supplier: purchase.supplier,
      amount: purchase.amount,
      currency: purchase.currency,
      quantity: purchase.quantity || 0,
      unit: purchase.unit || '',
      paymentMethod: purchase.paymentMethod,
      reference: purchase.reference || '',
      unitId: purchase.unitId || '',
      deliveryDate: purchase.deliveryDate || '',
      notes: purchase.notes || ''
    });
    setShowPurchaseForm(true);
  };

  const handleStatusChange = (purchaseId: string, newStatus: any) => {
    updatePurchase(purchaseId, { status: newStatus });
    const purchase = purchases.find(p => p.id === purchaseId);
    if (purchase) {
      addLog('Statut achat modifié', 'Achats', `${purchase.description} - Statut: ${getStatusLabel(newStatus)}`, 'info');
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    return (
      (!filters.category || filters.category === 'all' || purchase.category === filters.category) &&
      (!filters.supplier || purchase.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) &&
      (!filters.search || purchase.description.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.dateFrom || purchase.date >= filters.dateFrom) &&
      (!filters.dateTo || purchase.date <= filters.dateTo) &&
      (!filters.unitId || filters.unitId === 'all' || purchase.unitId === filters.unitId) &&
      (!filters.status || filters.status === 'all' || purchase.status === filters.status)
    );
  });

  const exportPurchases = () => {
    const csvContent = [
      ['Date', 'Catégorie', 'Sous-catégorie', 'Description', 'Fournisseur', 'Montant', 'Devise', 'Quantité', 'Unité', 'Mode de paiement', 'Statut'].join(','),
      ...filteredPurchases.map(p => [
        p.date,
        p.category,
        p.subcategory || '',
        p.description,
        p.supplier,
        p.amount,
        p.currency,
        p.quantity || '',
        p.unit || '',
        p.paymentMethod,
        p.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `achats_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    addLog('Export achats', 'Achats', 'Export CSV des achats généré', 'info');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Reçu';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return CheckCircle;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    return currencies.find(c => c.code === currencyCode)?.symbol || currencyCode;
  };

  const totalAmount = filteredPurchases.reduce((sum, p) => 
    sum + convertCurrency(p.amount, p.currency, currency), 0);
  const pendingAmount = filteredPurchases.filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency, currency), 0);
  const receivedAmount = filteredPurchases.filter(p => p.status === 'received')
    .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency, currency), 0);

  const categoryData = Object.keys(purchaseCategories).map(category => ({
    name: category,
    value: filteredPurchases.filter(p => p.category === category)
      .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency, currency), 0)
  })).filter(item => item.value > 0);

  const monthlyData = filteredPurchases.reduce((acc, purchase) => {
    const month = new Date(purchase.date).toLocaleDateString('fr-FR', { month: 'short' });
    const amount = convertCurrency(purchase.amount, purchase.currency, currency);
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += amount;
    } else {
      acc.push({ month, amount });
    }
    return acc;
  }, [] as { month: string; amount: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de devise */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="hidden">
            <h3 className="text-base md:text-lg font-semibold">Gestion des Achats</h3>
            <p className="text-xs md:text-sm text-gray-600">Suivi et catégorisation des dépenses d'exploitation</p>
          </div>
          <Select value={currency} onValueChange={(value) => setCurrency(value as 'XOF' | 'EUR' | 'USD' | 'MAD')}>
            <SelectTrigger className="w-full sm:w-40 text-sm md:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(curr => (
                <SelectItem key={curr.code} value={curr.code} className="text-sm md:text-base">
                  {curr.symbol} {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-red-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-600">Total Dépenses</p>
                <p className="text-base md:text-2xl font-bold text-red-600 truncate">
                  {totalAmount.toLocaleString()} {getCurrencySymbol(currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-600">En Attente</p>
                <p className="text-base md:text-2xl font-bold text-yellow-600 truncate">
                  {pendingAmount.toLocaleString()} {getCurrencySymbol(currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-600">Reçus</p>
                <p className="text-base md:text-2xl font-bold text-green-600 truncate">
                  {receivedAmount.toLocaleString()} {getCurrencySymbol(currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-600">Commandes</p>
                <p className="text-base md:text-2xl font-bold truncate">{filteredPurchases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">Liste des achats</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportPurchases}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={() => setShowPurchaseForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel achat
            </Button>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <div>
                  <Label>Catégorie</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {Object.keys(purchaseCategories).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="received">Reçu</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unité</Label>
                  <Select value={filters.unitId} onValueChange={(value) => setFilters({...filters, unitId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Fournisseur</Label>
                  <Input
                    placeholder="Nom du fournisseur"
                    value={filters.supplier}
                    onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Recherche</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Description..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des achats ({filteredPurchases.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPurchases.map((purchase) => {
                  const StatusIcon = getStatusIcon(purchase.status);
                  return (
                    <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge variant="outline">{purchase.category}</Badge>
                          {purchase.subcategory && (
                            <Badge variant="secondary" className="text-xs">{purchase.subcategory}</Badge>
                          )}
                          <Select
                            value={purchase.status}
                            onValueChange={(value) => handleStatusChange(purchase.id, value)}
                          >
                            <SelectTrigger className="w-32 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="received">Reçu</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-gray-500">{purchase.date}</span>
                        </div>
                        <h4 className="font-medium">{purchase.description}</h4>
                        <p className="text-sm text-gray-600">
                          Fournisseur: {purchase.supplier}
                          {purchase.quantity && ` • Quantité: ${purchase.quantity} ${purchase.unit}`}
                          {purchase.reference && ` • Réf: ${purchase.reference}`}
                          {purchase.unitName && ` • Unité: ${purchase.unitName}`}
                        </p>
                        {purchase.deliveryDate && purchase.status === 'pending' && (
                          <p className="text-xs text-blue-600">Livraison prévue: {purchase.deliveryDate}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-600">
                            {convertCurrency(purchase.amount, purchase.currency, currency).toLocaleString()} {getCurrencySymbol(currency)}
                          </span>
                          {purchase.currency !== currency && (
                            <p className="text-xs text-gray-500">
                              ({purchase.amount.toLocaleString()} {getCurrencySymbol(purchase.currency)})
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPurchase(purchase)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              deletePurchase(purchase.id);
                              addLog('Achat supprimé', 'Achats', `Achat supprimé: ${purchase.description}`, 'warning');
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ${getCurrencySymbol(currency)}`, 'Montant']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} ${getCurrencySymbol(currency)}`, 'Montant']} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPurchase ? 'Modifier l\'achat' : 'Nouvel achat'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie *</Label>
                <Select
                  value={newPurchase.category}
                  onValueChange={(value) => setNewPurchase({...newPurchase, category: value, subcategory: ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(purchaseCategories).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sous-catégorie</Label>
                <Select
                  value={newPurchase.subcategory}
                  onValueChange={(value) => setNewPurchase({...newPurchase, subcategory: value})}
                  disabled={!newPurchase.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {newPurchase.category && purchaseCategories[newPurchase.category as keyof typeof purchaseCategories]?.map(subcat => (
                      <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Input
                value={newPurchase.description}
                onChange={(e) => setNewPurchase({...newPurchase, description: e.target.value})}
                placeholder="Description détaillée de l'achat"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fournisseur *</Label>
                <Input
                  value={newPurchase.supplier}
                  onChange={(e) => setNewPurchase({...newPurchase, supplier: e.target.value})}
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Montant *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPurchase.amount}
                    onChange={(e) => setNewPurchase({...newPurchase, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Devise</Label>
                  <Select
                    value={newPurchase.currency}
                    onValueChange={(value) => setNewPurchase({...newPurchase, currency: value as 'XOF' | 'EUR' | 'USD' | 'MAD'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantité</Label>
                <Input
                  type="number"
                  value={newPurchase.quantity}
                  onChange={(e) => setNewPurchase({...newPurchase, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Unité</Label>
                <Input
                  value={newPurchase.unit}
                  onChange={(e) => setNewPurchase({...newPurchase, unit: e.target.value})}
                  placeholder="kg, L, unités..."
                />
              </div>
              <div>
                <Label>Mode de paiement *</Label>
                <Select
                  value={newPurchase.paymentMethod}
                  onValueChange={(value) => setNewPurchase({...newPurchase, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Référence</Label>
                <Input
                  value={newPurchase.reference}
                  onChange={(e) => setNewPurchase({...newPurchase, reference: e.target.value})}
                  placeholder="Numéro de commande"
                />
              </div>
              <div>
                <Label>Unité d'affectation</Label>
                <Select
                  value={newPurchase.unitId}
                  onValueChange={(value) => setNewPurchase({...newPurchase, unitId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date de livraison prévue</Label>
                <Input
                  type="date"
                  value={newPurchase.deliveryDate}
                  onChange={(e) => setNewPurchase({...newPurchase, deliveryDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={newPurchase.notes}
                onChange={(e) => setNewPurchase({...newPurchase, notes: e.target.value})}
                placeholder="Notes complémentaires..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button onClick={editingPurchase ? handleUpdatePurchase : handleAddPurchase}>
                {editingPurchase ? 'Modifier' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseManager;
