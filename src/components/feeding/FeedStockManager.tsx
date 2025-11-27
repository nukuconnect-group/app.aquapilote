
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
  Trash2,
  BarChart3,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFeedStocks } from '@/hooks/useFeedStocks';

interface FeedStockManagerProps {
  unitId: string;
  onStockUpdate?: (stocks: any[]) => void;
}

const FeedStockManager = ({ unitId, onStockUpdate }: FeedStockManagerProps) => {
  const { stocks, loading, createStock, updateStock, deleteStock } = useFeedStocks(unitId);

  const [customFeedTypes, setCustomFeedTypes] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<any | null>(null);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customFeedTypeName, setCustomFeedTypeName] = useState('');

  const [newStock, setNewStock] = useState({
    custom_name: '',
    feed_type: '',
    quantity: 0,
    unit: 'kg',
    expiration_date: '',
    supplier: '',
    cost: 0,
    protein_content: 0,
    fat_content: 0,
    notes: '',
    min_threshold: 50
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
      setNewStock(prev => ({ ...prev, feed_type: customFeedTypeName.trim() }));
      setCustomFeedTypeName('');
      setShowCustomTypeInput(false);
    }
  };

  const handleFeedTypeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomTypeInput(true);
    } else {
      setNewStock(prev => ({ ...prev, feed_type: value }));
      setShowCustomTypeInput(false);
    }
  };

  const handleSaveStock = async () => {
    try {
      const stockData = {
        unit_id: unitId,
        custom_name: newStock.custom_name,
        feed_type: newStock.feed_type,
        quantity: newStock.quantity,
        unit: newStock.unit,
        expiration_date: newStock.expiration_date || undefined,
        supplier: newStock.supplier || undefined,
        cost: newStock.cost || undefined,
        protein_content: newStock.protein_content || undefined,
        fat_content: newStock.fat_content || undefined,
        notes: newStock.notes || undefined,
        min_threshold: newStock.min_threshold || 50
      };

      if (editingStock) {
        await updateStock(editingStock.id, stockData);
      } else {
        await createStock(stockData);
      }

      if (onStockUpdate) {
        onStockUpdate(stocks);
      }
      
      setNewStock({
        custom_name: '',
        feed_type: '',
        quantity: 0,
        unit: 'kg',
        expiration_date: '',
        supplier: '',
        cost: 0,
        protein_content: 0,
        fat_content: 0,
        notes: '',
        min_threshold: 50
      });
      setEditingStock(null);
      setShowDialog(false);
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const handleEditStock = (stock: any) => {
    setEditingStock(stock);
    setNewStock({
      custom_name: stock.custom_name || '',
      feed_type: stock.feed_type,
      quantity: stock.quantity,
      unit: stock.unit,
      expiration_date: stock.expiration_date || '',
      supplier: stock.supplier || '',
      cost: stock.cost || 0,
      protein_content: stock.protein_content || 0,
      fat_content: stock.fat_content || 0,
      notes: stock.notes || '',
      min_threshold: stock.min_threshold || 50
    });
    setShowDialog(true);
  };

  const handleDeleteStock = async (stockId: string) => {
    try {
      await deleteStock(stockId);
      if (onStockUpdate) {
        onStockUpdate(stocks);
      }
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const getLowStockItems = () => stocks.filter(stock => stock.quantity <= (stock.min_threshold || 50));
  const getExpiringItems = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return stocks.filter(stock => stock.expiration_date && new Date(stock.expiration_date) <= thirtyDaysFromNow);
  };

  const getTotalValue = () => stocks.reduce((total, stock) => total + (stock.quantity * (stock.cost || 0)), 0);

  // Données pour le graphique d'évolution (simulé avec dates créées)
  const stockEvolutionData = stocks
    .slice()
    .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
    .map(stock => ({
      date: new Date(stock.created_at || '').toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      quantite: stock.quantity,
      nom: stock.custom_name || stock.feed_type
    }));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Chargement des stocks...</span>
        </CardContent>
      </Card>
    );
  }

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
                      value={newStock.custom_name}
                      onChange={(e) => setNewStock(prev => ({ ...prev, custom_name: e.target.value }))}
                      placeholder="Ex: Granulés Premium Tilapia"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Type d'aliment</Label>
                    <Select value={newStock.feed_type} onValueChange={handleFeedTypeChange}>
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
                      value={newStock.expiration_date}
                      onChange={(e) => setNewStock(prev => ({ ...prev, expiration_date: e.target.value }))}
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
                      value={newStock.min_threshold}
                      onChange={(e) => setNewStock(prev => ({ ...prev, min_threshold: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Taux de protéines (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={newStock.protein_content}
                      onChange={(e) => setNewStock(prev => ({ ...prev, protein_content: parseFloat(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Taux de matières grasses (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={newStock.fat_content}
                      onChange={(e) => setNewStock(prev => ({ ...prev, fat_content: parseFloat(e.target.value) || 0 }))}
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
                  custom_name: '',
                  feed_type: '',
                  quantity: 0,
                  unit: 'kg',
                  expiration_date: '',
                  supplier: '',
                  cost: 0,
                  protein_content: 0,
                  fat_content: 0,
                  notes: '',
                  min_threshold: 50
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
                      <strong>{item.custom_name || item.feed_type}</strong>: {item.quantity} {item.unit}
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
                      <strong>{item.custom_name || item.feed_type}</strong>: {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Graphique d'évolution des stocks */}
      {stocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5" />
              Évolution des Stocks d'Aliment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: 'Quantité (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                  <Tooltip 
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: any, name: string) => [
                      `${value} kg`,
                      'Quantité'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line 
                    type="monotone" 
                    dataKey="quantite" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    name="Stock"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des stocks */}
      <div className="grid gap-4">
        {stocks.map(stock => (
          <Card key={stock.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{stock.custom_name || stock.feed_type}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {predefinedFeedTypes.find(t => t.value === stock.feed_type)?.label || stock.feed_type}
                    </Badge>
                    <Badge className={stock.quantity <= (stock.min_threshold || 50) ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
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
                  <span className="ml-1 font-medium">
                    {stock.expiration_date ? new Date(stock.expiration_date).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Coût:</span>
                  <span className="ml-1 font-medium">{stock.cost || 0}€/{stock.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Protéines:</span>
                  <span className="ml-1 font-medium">{stock.protein_content || 0}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Fournisseur:</span>
                  <span className="ml-1 font-medium">{stock.supplier || 'N/A'}</span>
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
