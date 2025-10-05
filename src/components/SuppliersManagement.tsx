import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ProductionUnitSelector from './ProductionUnitSelector';
import { 
  Users, 
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Package,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Bell,
  Filter
} from 'lucide-react';
import { useLogs } from '@/contexts/LogsContext';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  products: string[];
  rating: number;
  notes: string;
}

interface Order {
  id: string;
  supplierId: string;
  date: string;
  products: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  deliveryDate: string;
}

const SuppliersManagement = () => {
  const { addLog } = useLogs();
  
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'AquaFeed Solutions',
      contact: 'Jean Dupont',
      email: 'contact@aquafeed.com',
      phone: '+228 90 12 34 56',
      address: 'Zone Industrielle, Lomé',
      status: 'active',
      category: 'Aliments',
      products: ['Granulés flottants', 'Granulés coulants', 'Aliments spéciaux'],
      rating: 4.5,
      notes: 'Fournisseur principal, excellente qualité'
    },
    {
      id: '2',
      name: 'BioVet Togo',
      contact: 'Dr. Marie Martin',
      email: 'info@biovet.tg',
      phone: '+228 91 23 45 67',
      address: 'Avenue de la Paix, Lomé',
      status: 'active',
      category: 'Vétérinaire',
      products: ['Vaccins', 'Antibiotiques', 'Désinfectants'],
      rating: 5.0,
      notes: 'Service vétérinaire de confiance'
    },
    {
      id: '3',
      name: 'TechEquip Aquaculture',
      contact: 'Paul Kofi',
      email: 'sales@techequip.com',
      phone: '+228 92 34 56 78',
      address: 'Quartier des Affaires, Lomé',
      status: 'pending',
      category: 'Équipement',
      products: ['Pompes', 'Aérateurs', 'Filtres', 'Oxygénateurs'],
      rating: 4.0,
      notes: 'En cours de vérification'
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      supplierId: '1',
      date: '2024-03-10',
      products: 'Granulés flottants 25kg',
      quantity: 50,
      amount: 125000,
      status: 'delivered',
      deliveryDate: '2024-03-15'
    },
    {
      id: '2',
      supplierId: '2',
      date: '2024-03-12',
      products: 'Vaccin Anti-Aeromonas',
      quantity: 10,
      amount: 85000,
      status: 'pending',
      deliveryDate: '2024-03-20'
    }
  ]);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    products: '',
    rating: '5',
    notes: ''
  });

  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    products: '',
    quantity: '',
    amount: '',
    deliveryDate: ''
  });

  const handleSaveSupplier = () => {
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => 
        s.id === editingSupplier.id 
          ? {
              ...editingSupplier,
              name: newSupplier.name,
              contact: newSupplier.contact,
              email: newSupplier.email,
              phone: newSupplier.phone,
              address: newSupplier.address,
              category: newSupplier.category,
              products: newSupplier.products.split(',').map(p => p.trim()),
              rating: parseFloat(newSupplier.rating),
              notes: newSupplier.notes
            }
          : s
      ));
      addLog('Fournisseur modifié', 'Fournisseurs', `${newSupplier.name} a été mis à jour`, 'info');
    } else {
      const supplier: Supplier = {
        id: Date.now().toString(),
        name: newSupplier.name,
        contact: newSupplier.contact,
        email: newSupplier.email,
        phone: newSupplier.phone,
        address: newSupplier.address,
        status: 'pending',
        category: newSupplier.category,
        products: newSupplier.products.split(',').map(p => p.trim()),
        rating: parseFloat(newSupplier.rating),
        notes: newSupplier.notes
      };

      setSuppliers(prev => [supplier, ...prev]);
      addLog('Fournisseur ajouté', 'Fournisseurs', `${supplier.name} a été ajouté`, 'success');
    }
    
    setNewSupplier({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      products: '',
      rating: '5',
      notes: ''
    });
    setEditingSupplier(null);
    setShowSupplierDialog(false);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      products: supplier.products.join(', '),
      rating: supplier.rating.toString(),
      notes: supplier.notes
    });
    setShowSupplierDialog(true);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addLog('Fournisseur supprimé', 'Fournisseurs', 'Un fournisseur a été retiré', 'warning');
    setDeletingSupplier(null);
  };

  const handleToggleStatus = (id: string) => {
    setSuppliers(prev => prev.map(s => 
      s.id === id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' as Supplier['status'] }
        : s
    ));
  };

  const handleSaveOrder = () => {
    const order: Order = {
      id: Date.now().toString(),
      supplierId: newOrder.supplierId,
      date: new Date().toISOString().split('T')[0],
      products: newOrder.products,
      quantity: parseInt(newOrder.quantity),
      amount: parseFloat(newOrder.amount),
      status: 'pending',
      deliveryDate: newOrder.deliveryDate
    };

    setOrders(prev => [order, ...prev]);
    addLog('Commande créée', 'Fournisseurs', `Commande pour ${suppliers.find(s => s.id === order.supplierId)?.name}`, 'info');
    
    setNewOrder({
      supplierId: '',
      products: '',
      quantity: '',
      amount: '',
      deliveryDate: ''
    });
    setShowOrderDialog(false);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: Supplier['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusIcon = (status: Supplier['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const categories = [...new Set(suppliers.map(s => s.category))];

  return (
    <div className="space-y-6 p-2 sm:p-0">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl text-white">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestion des Fournisseurs</h2>
              <p className="text-blue-100">Base de données et historique des commandes</p>
            </div>
          <div className="flex gap-2">
            <Dialog open={showSupplierDialog} onOpenChange={(open) => {
              setShowSupplierDialog(open);
              if (!open) {
                setEditingSupplier(null);
                setNewSupplier({
                  name: '',
                  contact: '',
                  email: '',
                  phone: '',
                  address: '',
                  category: '',
                  products: '',
                  rating: '5',
                  notes: ''
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau fournisseur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label>Nom de l'entreprise</Label>
                    <Input 
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom du fournisseur"
                    />
                  </div>
                  <div>
                    <Label>Contact principal</Label>
                    <Input 
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="Nom du contact"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input 
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+228 XX XX XX XX"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Adresse</Label>
                    <Input 
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={newSupplier.category} onValueChange={(value) => setNewSupplier(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aliments">Aliments</SelectItem>
                        <SelectItem value="Vétérinaire">Vétérinaire</SelectItem>
                        <SelectItem value="Équipement">Équipement</SelectItem>
                        <SelectItem value="Alevins">Alevins</SelectItem>
                        <SelectItem value="Matériel">Matériel</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Évaluation (1-5)</Label>
                    <Select value={newSupplier.rating} onValueChange={(value) => setNewSupplier(prev => ({ ...prev, rating: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} ⭐</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Catalogue de produits</Label>
                    <Textarea 
                      value={newSupplier.products}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, products: e.target.value }))}
                      placeholder="Produit 1, Produit 2, Produit 3..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Séparez les produits par des virgules</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={newSupplier.notes}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Informations complémentaires..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveSupplier} className="w-full">
                    {editingSupplier ? 'Mettre à jour' : 'Ajouter le fournisseur'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Package className="w-4 h-4 mr-2" />
                  Nouvelle commande
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Créer une commande</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div>
                    <Label>Fournisseur</Label>
                    <Select value={newOrder.supplierId} onValueChange={(value) => setNewOrder(prev => ({ ...prev, supplierId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.filter(s => s.status === 'active').map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Produits</Label>
                    <Input 
                      value={newOrder.products}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, products: e.target.value }))}
                      placeholder="Description des produits"
                    />
                  </div>
                  <div>
                    <Label>Quantité</Label>
                    <Input 
                      type="number"
                      value={newOrder.quantity}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Montant (FCFA)</Label>
                    <Input 
                      type="number"
                      value={newOrder.amount}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Date de livraison prévue</Label>
                    <Input 
                      type="date"
                      value={newOrder.deliveryDate}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleSaveOrder} className="w-full">
                    Créer la commande
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          </div>
          <ProductionUnitSelector />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total fournisseurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{suppliers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {suppliers.filter(s => s.status === 'active').length} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              Commandes en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              À réceptionner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Livraisons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Montant total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {(orders.reduce((sum, o) => sum + o.amount, 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              FCFA ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un fournisseur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="orders">Historique commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{supplier.name}</h4>
                      <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(supplier.status)}>
                        {getStatusIcon(supplier.status)}
                        <span className="ml-1">
                          {supplier.status === 'active' ? 'Actif' : supplier.status === 'inactive' ? 'Inactif' : 'En attente'}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Badge className="mb-2">{supplier.category}</Badge>
                    <div className="text-sm">
                      <span className="font-medium">Produits: </span>
                      <span className="text-muted-foreground">{supplier.products.join(', ')}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm font-medium">Évaluation: </span>
                      <span className="text-yellow-600">{'⭐'.repeat(Math.floor(supplier.rating))}</span>
                      <span className="text-sm text-muted-foreground ml-1">({supplier.rating})</span>
                    </div>
                  </div>

                  {supplier.notes && (
                    <div className="p-2 bg-muted rounded text-sm mb-3">
                      {supplier.notes}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(supplier.id)}
                      className="flex-1"
                    >
                      {supplier.status === 'active' ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingSupplier(supplier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="space-y-4">
            {orders.map(order => {
              const supplier = suppliers.find(s => s.id === order.supplierId);
              return (
                <Card key={order.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{supplier?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Commande #{order.id} • {new Date(order.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status === 'delivered' ? 'Livré' : order.status === 'pending' ? 'En cours' : 'Annulé'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Produits:</span>
                        <p className="font-medium">{order.products}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantité:</span>
                        <p className="font-medium">{order.quantity}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Montant:</span>
                        <p className="font-medium">{order.amount.toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Livraison:</span>
                        <p className="font-medium">{new Date(order.deliveryDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingSupplier && handleDeleteSupplier(deletingSupplier)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuppliersManagement;