import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Plus, TrendingUp, Calendar, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface Purchase {
  id: string;
  date: string;
  supplier: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'delivered' | 'paid';
}

const ResponsivePurchases = () => {
  const { toast } = useToast();
  const { formatCurrency, t } = useSettings();
  const isMobile = useIsMobile();

  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: '1',
      date: '2024-12-20',
      supplier: 'Alimentation Aqua Pro',
      category: 'Alimentation',
      description: 'Granulés haute qualité pour grossissement',
      quantity: 500,
      unitPrice: 1.2,
      totalAmount: 600,
      status: 'delivered'
    },
    {
      id: '2',
      date: '2024-12-18',
      supplier: 'Équipement Piscicole Plus',
      category: 'Équipement',
      description: 'Pompe à oxygène 50L/min',
      quantity: 1,
      unitPrice: 450,
      totalAmount: 450,
      status: 'pending'
    },
    {
      id: '3',
      date: '2024-12-15',
      supplier: 'Matériel Aquatique Pro',
      category: 'Maintenance',
      description: 'Filtres biologiques et accessoires',
      quantity: 10,
      unitPrice: 25,
      totalAmount: 250,
      status: 'paid'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    category: '',
    description: '',
    quantity: 0,
    unitPrice: 0
  });

  const categories = [
    'Alimentation',
    'Équipement',
    'Maintenance',
    'Produits chimiques',
    'Matériel de mesure',
    'Autres'
  ];

  // Calculer les KPI
  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length;
  const monthlyPurchases = purchases
    .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.totalAmount, 0);
  const activeSuppliersCount = new Set(purchases.map(p => p.supplier)).size;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'delivered': return 'outline';
      case 'paid': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'delivered': return 'Livré';
      case 'paid': return 'Payé';
      default: return status;
    }
  };

  const handleAddPurchase = () => {
    if (!formData.supplier || !formData.category || !formData.description || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs avec des valeurs valides",
        variant: "destructive"
      });
      return;
    }

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      supplier: formData.supplier,
      category: formData.category,
      description: formData.description,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount: formData.quantity * formData.unitPrice,
      status: 'pending'
    };

    setPurchases([newPurchase, ...purchases]);
    setFormData({
      supplier: '',
      category: '',
      description: '',
      quantity: 0,
      unitPrice: 0
    });
    setIsDialogOpen(false);

    toast({
      title: "Achat ajouté",
      description: "Le nouvel achat a été ajouté avec succès"
    });
  };

  const PurchaseCard = ({ purchase }: { purchase: Purchase }) => (
    <Card className="card-responsive-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-responsive-small font-semibold truncate">{purchase.supplier}</h3>
            <p className="text-responsive-caption text-muted-foreground">{purchase.category}</p>
          </div>
          <Badge variant={getStatusColor(purchase.status)} className="text-responsive-caption ml-2 flex-shrink-0">
            {getStatusLabel(purchase.status)}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-responsive-caption">{purchase.description}</p>
          <div className="flex justify-between text-responsive-caption text-muted-foreground">
            <span>Qté: {purchase.quantity}</span>
            <span>Prix: {formatCurrency(purchase.unitPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-responsive-caption text-muted-foreground">{purchase.date}</span>
            <span className="text-responsive-small font-bold">{formatCurrency(purchase.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-responsive">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-responsive-title">Gestion des achats</h1>
          <p className="text-responsive text-muted-foreground">Gérez vos commandes et fournisseurs</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="btn-responsive w-full sm:w-auto">
          <Plus className="icon-responsive mr-2" />
          Nouvel achat
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid-responsive-4 gap-responsive">
        <Card className="card-responsive-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-caption text-muted-foreground">Total achats</p>
                <p className="text-responsive-subtitle font-bold">{formatCurrency(totalPurchases)}</p>
              </div>
              <ShoppingCart className="icon-responsive-lg text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-responsive-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-caption text-muted-foreground">En attente</p>
                <p className="text-responsive-subtitle font-bold">{pendingPurchases}</p>
              </div>
              <Calendar className="icon-responsive-lg text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-responsive-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-caption text-muted-foreground">Ce mois</p>
                <p className="text-responsive-subtitle font-bold">{formatCurrency(monthlyPurchases)}</p>
              </div>
              <TrendingUp className="icon-responsive-lg text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-responsive-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-responsive-caption text-muted-foreground">Fournisseurs actifs</p>
                <p className="text-responsive-subtitle font-bold">{activeSuppliersCount}</p>
              </div>
              <Package className="icon-responsive-lg text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases List */}
      <Card className="card-responsive">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-responsive-subtitle">Liste des achats</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isMobile ? (
            <div className="space-y-2 p-4">
              {purchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            <div className="mobile-friendly-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-responsive-small">Date</TableHead>
                    <TableHead className="text-responsive-small">Fournisseur</TableHead>
                    <TableHead className="text-responsive-small">Catégorie</TableHead>
                    <TableHead className="text-responsive-small">Description</TableHead>
                    <TableHead className="text-responsive-small text-right">Quantité</TableHead>
                    <TableHead className="text-responsive-small text-right">Prix unitaire</TableHead>
                    <TableHead className="text-responsive-small text-right">Total</TableHead>
                    <TableHead className="text-responsive-small">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="text-responsive-small">{purchase.date}</TableCell>
                      <TableCell className="text-responsive-small font-medium">{purchase.supplier}</TableCell>
                      <TableCell className="text-responsive-small">{purchase.category}</TableCell>
                      <TableCell className="text-responsive-small">{purchase.description}</TableCell>
                      <TableCell className="text-responsive-small text-right">{purchase.quantity}</TableCell>
                      <TableCell className="text-responsive-small text-right">{formatCurrency(purchase.unitPrice)}</TableCell>
                      <TableCell className="text-responsive-small text-right font-medium">{formatCurrency(purchase.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(purchase.status)} className="text-responsive-caption">
                          {getStatusLabel(purchase.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Purchase Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mobile-friendly-modal w-full max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-responsive-subtitle">Nouvel achat</DialogTitle>
          </DialogHeader>
          <div className="space-y-responsive">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-responsive-small">Fournisseur</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Nom du fournisseur"
                className="text-responsive"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-responsive-small">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="text-responsive">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-responsive">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-responsive-small">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'achat"
                className="text-responsive"
              />
            </div>

            <div className="grid-responsive-2 gap-responsive">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-responsive-small">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="0"
                  className="text-responsive"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="text-responsive-small">Prix unitaire</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  placeholder="0.00"
                  className="text-responsive"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="btn-responsive-sm order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddPurchase}
                className="btn-responsive-sm order-1 sm:order-2"
              >
                <Plus className="icon-responsive mr-2" />
                Ajouter l'achat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResponsivePurchases;