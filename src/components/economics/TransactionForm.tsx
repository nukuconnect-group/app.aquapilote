
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, X } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'purchase' | 'sale';
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  clientName?: string;
  supplierName?: string;
  date: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm = ({ onAddTransaction, onClose }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    type: 'sale' as 'purchase' | 'sale',
    productName: '',
    quantity: 0,
    unitPrice: 0,
    clientName: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'pending' as 'pending' | 'completed' | 'cancelled'
  });

  const totalAmount = formData.quantity * formData.unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      ...formData,
      totalAmount
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Nouvelle Transaction
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de transaction</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Vente</SelectItem>
                  <SelectItem value="purchase">Achat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="productName">Nom du produit</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="Ex: Alevins carpe, Poissons matures..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Prix unitaire (€)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label>Total</Label>
              <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center">
                <Badge variant="secondary" className="w-full justify-center">
                  €{totalAmount.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>

          {formData.type === 'sale' ? (
            <div>
              <Label htmlFor="clientName">Nom du client</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Nom du client"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="supplierName">Nom du fournisseur</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                placeholder="Nom du fournisseur"
              />
            </div>
          )}

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes / Observations</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
