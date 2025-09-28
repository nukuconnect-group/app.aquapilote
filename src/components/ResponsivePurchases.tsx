import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Plus, TrendingUp, Calendar, FileText, Package, DollarSign } from 'lucide-react';
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
      quantity: 2,
      unitPrice: 450,
      totalAmount: 900,
      status: 'pending'
    }
  ]);

  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseFormData, setPurchaseFormData] = useState({
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
    'Énergie',
    'Transport',
    'Services',
    'Autres'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length;

  const handleAddPurchase = () => {
    if (!purchaseFormData.supplier || !purchaseFormData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      ...purchaseFormData,
      totalAmount: purchaseFormData.quantity * purchaseFormData.unitPrice,
      status: 'pending'
    };

    setPurchases([...purchases, newPurchase]);
    toast({
      title: "Achat ajouté",
      description: "Le nouvel achat a été ajouté avec succès"
    });

    // Reset form
    setPurchaseFormData({
      supplier: '',
      category: '',
      description: '',
      quantity: 0,
      unitPrice: 0
    });
    setShowPurchaseForm(false);
  };

  // Mobile Card Component
  const PurchaseCard = ({ purchase }: { purchase: Purchase }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{purchase.description}</h4>
            <p className="text-xs text-muted-foreground">{purchase.supplier}</p>
          </div>
          <Badge className={`${getStatusColor(purchase.status)} text-xs ml-2`}>
            {getStatusLabel(purchase.status)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Date:</span>
            <p className="font-medium">{new Date(purchase.date).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Catégorie:</span>
            <p className="font-medium">{purchase.category}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Quantité:</span>
            <p className="font-medium">{purchase.quantity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>
            <p className="font-bold text-primary">{formatCurrency(purchase.totalAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 sm:p-6 rounded-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-lg sm:text-2xl">Gestion des Achats</span>
            </h2>
            <p className="text-orange-100 text-sm sm:text-base">Suivi et catégorisation des dépenses d'exploitation</p>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 w-full sm:w-auto text-sm sm:text-base"
            onClick={() => setShowPurchaseForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Achat
          </Button>
        </div>
      </div>

      {/* KPIs - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <div>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalPurchases)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total achats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <div>
                <p className="text-lg sm:text-2xl font-bold">{purchases.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <div>
                <p className="text-lg sm:text-2xl font-bold">{pendingPurchases}</p>
                <p className="text-xs sm:text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <div>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalPurchases / 12)}</p>
                <p className="text-xs sm:text-sm text-gray-600">Moy./mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content - Mobile/Desktop Adaptive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Liste des Achats</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile: Card layout
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          ) : (
            // Desktop: Table layout
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm">Fournisseur</TableHead>
                    <TableHead className="text-xs sm:text-sm">Description</TableHead>
                    <TableHead className="text-xs sm:text-sm">Catégorie</TableHead>
                    <TableHead className="text-xs sm:text-sm">Quantité</TableHead>
                    <TableHead className="text-xs sm:text-sm">Prix unitaire</TableHead>
                    <TableHead className="text-xs sm:text-sm">Total</TableHead>
                    <TableHead className="text-xs sm:text-sm">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(purchase.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium">
                        {purchase.supplier}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {purchase.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {purchase.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {purchase.quantity}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {formatCurrency(purchase.unitPrice)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-bold">
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(purchase.status)} text-xs`}>
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
      <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
        <DialogContent className="w-full max-w-md sm:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Ajouter un nouvel achat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Fournisseur *</Label>
                <Input
                  className="text-sm"
                  value={purchaseFormData.supplier}
                  onChange={(e) => setPurchaseFormData({...purchaseFormData, supplier: e.target.value})}
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div>
                <Label className="text-sm">Catégorie *</Label>
                <Select
                  value={purchaseFormData.category}
                  onValueChange={(value) => setPurchaseFormData({...purchaseFormData, category: value})}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-sm">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Description *</Label>
              <Input
                className="text-sm"
                value={purchaseFormData.description}
                onChange={(e) => setPurchaseFormData({...purchaseFormData, description: e.target.value})}
                placeholder="Description de l'achat"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Quantité</Label>
                <Input
                  className="text-sm"
                  type="number"
                  value={purchaseFormData.quantity}
                  onChange={(e) => setPurchaseFormData({...purchaseFormData, quantity: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-sm">Prix unitaire</Label>
                <Input
                  className="text-sm"
                  type="number"
                  step="0.01"
                  value={purchaseFormData.unitPrice}
                  onChange={(e) => setPurchaseFormData({...purchaseFormData, unitPrice: Number(e.target.value)})}
                  placeholder="0.00"
                />
              </div>
            </div>

            {purchaseFormData.quantity > 0 && purchaseFormData.unitPrice > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Total: {formatCurrency(purchaseFormData.quantity * purchaseFormData.unitPrice)}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPurchaseForm(false)}
                className="flex-1 text-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddPurchase}
                className="flex-1 text-sm"
              >
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