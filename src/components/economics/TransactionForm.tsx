
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, X, AlertCircle } from 'lucide-react';
import { transactionSchema, TransactionInput } from '@/lib/validationSchemas';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { toast } = useToast();
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalAmount = formData.quantity * formData.unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validation des données avec Zod
      const validatedData: TransactionInput = transactionSchema.parse(formData);
      
      onAddTransaction({
        type: validatedData.type,
        productName: validatedData.productName,
        quantity: validatedData.quantity,
        unitPrice: validatedData.unitPrice,
        clientName: validatedData.clientName || '',
        supplierName: validatedData.supplierName || '',
        date: validatedData.date,
        notes: validatedData.notes || '',
        status: validatedData.status,
        totalAmount
      });
      
      toast({
        title: "Transaction créée",
        description: "La transaction a été créée avec succès.",
      });
      
      onClose();
    } catch (error: any) {
      if (error.errors) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
        
        toast({
          title: "Erreur de validation",
          description: "Veuillez corriger les erreurs dans le formulaire.",
          variant: "destructive",
        });
      }
    }
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
        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez corriger les erreurs dans le formulaire avant de soumettre.
            </AlertDescription>
          </Alert>
        )}
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
              className={validationErrors.productName ? 'border-destructive' : ''}
            />
            {validationErrors.productName && (
              <p className="text-sm text-destructive mt-1">{validationErrors.productName}</p>
            )}
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
                max="1000000"
                step="0.01"
                required
                className={validationErrors.quantity ? 'border-destructive' : ''}
              />
              {validationErrors.quantity && (
                <p className="text-sm text-destructive mt-1">{validationErrors.quantity}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unitPrice">Prix unitaire (€)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                min="0"
                max="100000"
                step="0.01"
                required
                className={validationErrors.unitPrice ? 'border-destructive' : ''}
              />
              {validationErrors.unitPrice && (
                <p className="text-sm text-destructive mt-1">{validationErrors.unitPrice}</p>
              )}
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
