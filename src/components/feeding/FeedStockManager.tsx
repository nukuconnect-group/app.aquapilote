
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  TrendingDown,
  Edit,
  Trash2
} from 'lucide-react';

interface FeedStock {
  id: string;
  customName: string;
  feedType: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  supplier: string;
  cost: number;
  proteinContent: number;
  fatContent: number;
  notes: string;
  createdAt: string;
  minThreshold: number;
}

interface FeedStockManagerProps {
  unitId: string;
  onStockUpdate: (stocks: FeedStock[]) => void;
}

const FeedStockManager = ({ unitId, onStockUpdate }: FeedStockManagerProps) => {
  const [stocks, setStocks] = useState<FeedStock[]>([
    {
      id: '1',
      customName: 'Granulés Premium Tilapia',
      feedType: 'granules_flottants',
      quantity: 500,
      unit: 'kg',
      expirationDate: '2024-06-15',
      supplier: 'AquaNutrition SA',
      cost: 2.50,
      proteinContent: 32,
      fatContent: 6,
      notes: 'Aliment haute performance pour croissance',
      createdAt: '2024-01-15',
      minThreshold: 100
    },
    {
      id: '2',
      customName: 'Farine de Poisson Premium',
      feedType: 'farine_poisson',
      quantity: 50,
      unit: 'kg',
      expirationDate: '2024-05-20',
      supplier: 'BioMarine Ltd',
      cost: 4.20,
      proteinContent: 65,
      fatContent: 12,
      notes: 'Source de protéines naturelles',
      createdAt: '2024-01-10',
      minThreshold: 25
    }
  ]);

  const [customFeedTypes, setCustomFeedTypes] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<FeedStock | null>(null);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customFeedTypeName, setCustomFeedTypeName] = useState('');

  const [newStock, setNewStock] = useState({
    customName: '',
    feedType: '',
    quantity: 0,
    unit: 'kg',
    expirationDate: '',
    supplier: '',
    cost: 0,
    proteinContent: 0,
    fatContent: 0,
    notes: '',
    minThreshold: 50
  });

  const predefinedFeedTypes = [
    { value: 'granules_flottants', label: 'Granulés flottants' },
    { value: 'granules_coulants', label: 'Granulés coulants' },
    { value: 'farine_poisson', label: 'Farine de poisson' },
    { value: 'farine_soja', label: 'Farine de soja' },
    { value: 'aliment_starter', label: 'Aliment starter (0.5-1mm)' },
    { value: 'aliment_croissance', label: 'Aliment croissance (2-3mm)' },
    { value: 'aliment_finition', label: 'Aliment finition (4-6mm)' },
    { value: 'aliment_reproducteur', label: 'Aliment reproducteur' },
    { value: 'complement_vitamine', label: 'Complément vitaminé' },
    { value: 'probiotique', label: 'Probiotique' },
    { value: 'custom', label: 'Type personnalisé...' }
  ];

  const allFeedTypes = [
    ...predefinedFeedTypes.filter(t => t.value !== 'custom'),
    ...customFeedTypes.map(type => ({ value: type, label: type })),
    predefinedFeedTypes.find(t => t.value === 'custom')!
  ];

  const handleSaveCustomFeedType = () => {
    if (customFeedTypeName.trim()) {
      setCustomFeedTypes(prev => [...prev, customFeedTypeName.trim()]);
      setNewStock(prev => ({ ...prev, feedType: customFeedTypeName.trim() }));
      setCustomFeedTypeName('');
      setShowCustomTypeInput(false);
    }
  };

  const handleFeedTypeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomTypeInput(true);
    } else {
      setNewStock(prev => ({ ...prev, feedType: value }));
      setShowCustomTypeInput(false);
    }
  };

  const handleSaveStock = () => {
    const stockData: FeedStock = {
      id: editingStock ? editingStock.id : Date.now().toString(),
      ...newStock,
      createdAt: editingStock ? editingStock.createdAt : new Date().toISOString()
    };

    if (editingStock) {
      setStocks(prev => prev.map(s => s.id === editingStock.id ? stockData : s));
    } else {
      setStocks(prev => [...prev, stockData]);
    }

    onStockUpdate(editingStock ? stocks.map(s => s.id === editingStock.id ? stockData : s) : [...stocks, stockData]);
    
    setNewStock({
      customName: '',
      feedType: '',
      quantity: 0,
      unit: 'kg',
      expirationDate: '',
      supplier: '',
      cost: 0,
      proteinContent: 0,
      fatContent: 0,
      notes: '',
      minThreshold: 50
    });
    setEditingStock(null);
    setShowDialog(false);
  };

  const handleEditStock = (stock: FeedStock) => {
    setEditingStock(stock);
    setNewStock({
      customName: stock.customName,
      feedType: stock.feedType,
      quantity: stock.quantity,
      unit: stock.unit,
      expirationDate: stock.expirationDate,
      supplier: stock.supplier,
      cost: stock.cost,
      proteinContent: stock.proteinContent,
      fatContent: stock.fatContent,
      notes: stock.notes,
      minThreshold: stock.minThreshold
    });
    setShowDialog(true);
  };

  const handleDeleteStock = (stockId: string) => {
    const updatedStocks = stocks.filter(s => s.id !== stockId);
    setStocks(updatedStocks);
    onStockUpdate(updatedStocks);
  };

  const getLowStockItems = () => stocks.filter(stock => stock.quantity <= stock.minThreshold);
  const getExpiringItems = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return stocks.filter(stock => new Date(stock.expirationDate) <= thirtyDaysFromNow);
  };

  const getTotalValue = () => stocks.reduce((total, stock) => total + (stock.quantity * stock.cost), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Gestion des Stocks d'Aliment</h3>
          <p className="text-sm text-gray-600">
            Valeur totale: {getTotalValue().toFixed(2)} €
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-3xl mx-2 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStock ? 'Modifier le stock' : 'Ajouter un nouveau stock'}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informations de base</TabsTrigger>
                <TabsTrigger value="advanced">Détails avancés</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Nom personnalisé de l'aliment</Label>
                    <Input 
                      value={newStock.customName}
                      onChange={(e) => setNewStock(prev => ({ ...prev, customName: e.target.value }))}
                      placeholder="Ex: Granulés Premium Tilapia"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Type d'aliment</Label>
                    <Select value={newStock.feedType} onValueChange={handleFeedTypeChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {allFeedTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {showCustomTypeInput && (
                    <div className="sm:col-span-2">
                      <Label className="text-sm">Nom du type personnalisé</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={customFeedTypeName}
                          onChange={(e) => setCustomFeedTypeName(e.target.value)}
                          placeholder="Ex: Granulés bio artisanaux"
                          className="text-sm"
                        />
                        <Button size="sm" onClick={handleSaveCustomFeedType}>
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm">Quantité</Label>
                    <Input 
                      type="number"
                      value={newStock.quantity}
                      onChange={(e) => setNewStock(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Unité</Label>
                    <Select value={newStock.unit} onValueChange={(value) => setNewStock(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="tonnes">tonnes</SelectItem>
                        <SelectItem value="sacs">sacs</SelectItem>
                        <SelectItem value="litres">litres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Date d'expiration</Label>
                    <Input 
                      type="date"
                      value={newStock.expirationDate}
                      onChange={(e) => setNewStock(prev => ({ ...prev, expirationDate: e.target.value }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Fournisseur</Label>
                    <Input 
                      value={newStock.supplier}
                      onChange={(e) => setNewStock(prev => ({ ...prev, supplier: e.target.value }))}
                      placeholder="Nom du fournisseur"
                      className="text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Coût unitaire (€)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={newStock.cost}
                      onChange={(e) => setNewStock(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Seuil minimum</Label>
                    <Input 
                      type="number"
                      value={newStock.minThreshold}
                      onChange={(e) => setNewStock(prev => ({ ...prev, minThreshold: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Taux de protéines (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={newStock.proteinContent}
                      onChange={(e) => setNewStock(prev => ({ ...prev, proteinContent: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Taux de matières grasses (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={newStock.fatContent}
                      onChange={(e) => setNewStock(prev => ({ ...prev, fatContent: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-sm">Notes</Label>
                    <Textarea 
                      value={newStock.notes}
                      onChange={(e) => setNewStock(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Informations complémentaires..."
                      className="text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button onClick={handleSaveStock} className="flex-1">
                {editingStock ? 'Modifier' : 'Ajouter'} le stock
              </Button>
              <Button variant="outline" onClick={() => {
                setShowDialog(false);
                setEditingStock(null);
                setNewStock({
                  customName: '',
                  feedType: '',
                  quantity: 0,
                  unit: 'kg',
                  expirationDate: '',
                  supplier: '',
                  cost: 0,
                  proteinContent: 0,
                  fatContent: 0,
                  notes: '',
                  minThreshold: 50
                });
              }}>
                Annuler
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertes */}
      {(getLowStockItems().length > 0 || getExpiringItems().length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {getLowStockItems().length > 0 && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-yellow-800 text-sm">
                  <TrendingDown className="w-4 h-4" />
                  Stock faible ({getLowStockItems().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {getLowStockItems().map(item => (
                    <div key={item.id} className="text-xs">
                      <strong>{item.customName}</strong>: {item.quantity} {item.unit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {getExpiringItems().length > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-red-800 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Expiration proche ({getExpiringItems().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {getExpiringItems().map(item => (
                    <div key={item.id} className="text-xs">
                      <strong>{item.customName}</strong>: {new Date(item.expirationDate).toLocaleDateString('fr-FR')}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Liste des stocks */}
      <div className="grid gap-4">
        {stocks.map(stock => (
          <Card key={stock.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{stock.customName}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {predefinedFeedTypes.find(t => t.value === stock.feedType)?.label || stock.feedType}
                    </Badge>
                    <Badge className={stock.quantity <= stock.minThreshold ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                      {stock.quantity} {stock.unit}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditStock(stock)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteStock(stock.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Expiration:</span>
                  <span className="ml-1 font-medium">{new Date(stock.expirationDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Coût:</span>
                  <span className="ml-1 font-medium">{stock.cost}€/{stock.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Protéines:</span>
                  <span className="ml-1 font-medium">{stock.proteinContent}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Fournisseur:</span>
                  <span className="ml-1 font-medium">{stock.supplier}</span>
                </div>
              </div>
              {stock.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <strong>Notes:</strong> {stock.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedStockManager;
