import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { generateCompanyHeaderHTML } from '@/lib/companyHeaderUtils';

interface PurchaseInvoiceProps {
  purchase: {
    id: string;
    date: string;
    category: string;
    subcategory?: string;
    description: string;
    supplier: string;
    amount: number;
    currency: string;
    quantity?: number;
    unit?: string;
    paymentMethod: string;
    reference?: string;
    unitId?: string;
    unitName?: string;
    status: string;
    deliveryDate?: string;
    notes?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({ purchase, isOpen, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { currency: displayCurrency } = useProductionUnits();
  const { companyInfo } = useSettings();

  // Générer l'en-tête entreprise
  const companyHeader = generateCompanyHeaderHTML({
    name: companyInfo.name,
    address: companyInfo.address,
    phone: companyInfo.phone,
    email: companyInfo.email,
    logoUrl: companyInfo.logoUrl,
    registrationNumber: companyInfo.registrationNumber,
    taxId: companyInfo.taxId
  });

  const invoiceNumber = `FAC-${new Date(purchase.date).getFullYear()}-${String(purchase.id).slice(-6).toUpperCase()}`;

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'XOF': return 'F CFA';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return curr;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcul automatique du prix unitaire si quantité disponible
  const unitPrice = purchase.quantity && purchase.quantity > 0 
    ? purchase.amount / purchase.quantity 
    : purchase.amount;

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 20px; }
            .header h1 { color: #0891b2; margin: 0; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; color: #0891b2; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .table th { background-color: #f3f4f6; font-weight: 600; }
            .total-row { font-weight: bold; font-size: 1.2em; background-color: #ecfeff; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
            .status-confirmed { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef9c3; color: #854d0e; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${companyHeader || `
              <div class="header">
                <h1>FACTURE D'ACHAT</h1>
                <p style="color: #6b7280;">AquaPilote - Gestion Aquacole</p>
              </div>
            `}
            
            ${companyHeader ? `
              <div class="header" style="text-align: center; margin-bottom: 20px;">
                <h1>FACTURE D'ACHAT</h1>
              </div>
            ` : ''}
            
            <div class="details-grid">
              <div class="section">
                <div class="section-title">Informations Facture</div>
                <p><strong>N° Facture:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(purchase.date).toLocaleDateString('fr-FR')}</p>
                ${purchase.reference ? `<p><strong>Référence:</strong> ${purchase.reference}</p>` : ''}
                <p><strong>Statut:</strong> <span class="status-badge ${purchase.status === 'received' ? 'status-confirmed' : 'status-pending'}">${getStatusLabel(purchase.status)}</span></p>
              </div>
              
              <div class="section">
                <div class="section-title">Fournisseur</div>
                <p><strong>${purchase.supplier}</strong></p>
                ${purchase.unitName ? `<p>Unité: ${purchase.unitName}</p>` : ''}
                <p>Mode de paiement: ${purchase.paymentMethod}</p>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${purchase.description}</td>
                  <td>${purchase.category}${purchase.subcategory ? ` - ${purchase.subcategory}` : ''}</td>
                  <td>${purchase.quantity ? `${purchase.quantity} ${purchase.unit || ''}` : '1'}</td>
                  <td>${unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(purchase.currency)}</td>
                  <td>${purchase.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(purchase.currency)}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">TOTAL</td>
                  <td>${purchase.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${getCurrencySymbol(purchase.currency)}</td>
                </tr>
              </tbody>
            </table>

            ${purchase.notes ? `
              <div class="section">
                <div class="section-title">Notes</div>
                <p>${purchase.notes}</p>
              </div>
            ` : ''}

            ${purchase.deliveryDate ? `
              <div class="section">
                <div class="section-title">Livraison</div>
                <p>Date de livraison prévue: ${new Date(purchase.deliveryDate).toLocaleDateString('fr-FR')}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>Document généré automatiquement par AquaPilote</p>
              <p>Date d'impression: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-primary">Facture d'Achat</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={invoiceRef} className="space-y-6 p-4 bg-white rounded-lg">
          {/* En-tête entreprise */}
          {companyInfo.name && (
            <div className="p-4 bg-muted rounded-lg border-l-4 border-primary">
              <h2 className="text-xl font-bold text-foreground">{companyInfo.name}</h2>
              {companyInfo.address && <p className="text-sm text-muted-foreground">{companyInfo.address}</p>}
              <p className="text-xs text-muted-foreground">
                {companyInfo.phone && `Tél: ${companyInfo.phone}`}
                {companyInfo.phone && companyInfo.email && ' | '}
                {companyInfo.email && `Email: ${companyInfo.email}`}
              </p>
              {(companyInfo.registrationNumber || companyInfo.taxId) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {companyInfo.registrationNumber && `N° Reg: ${companyInfo.registrationNumber}`}
                  {companyInfo.registrationNumber && companyInfo.taxId && ' | '}
                  {companyInfo.taxId && `ID Fiscal: ${companyInfo.taxId}`}
                </p>
              )}
            </div>
          )}
          
          {/* Titre document */}
          <div className="text-center border-b-2 border-primary pb-4">
            <h2 className="text-2xl font-bold text-primary">FACTURE D'ACHAT</h2>
            {!companyInfo.name && <p className="text-muted-foreground">AquaPilote - Gestion Aquacole</p>}
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary mb-3">Informations Facture</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">N° Facture:</span> <strong>{invoiceNumber}</strong></p>
                  <p><span className="text-muted-foreground">Date:</span> {new Date(purchase.date).toLocaleDateString('fr-FR')}</p>
                  {purchase.reference && (
                    <p><span className="text-muted-foreground">Référence:</span> {purchase.reference}</p>
                  )}
                  <p>
                    <span className="text-muted-foreground">Statut:</span>{' '}
                    <Badge className={getStatusColor(purchase.status)}>
                      {getStatusLabel(purchase.status)}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary mb-3">Fournisseur</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-lg">{purchase.supplier}</p>
                  {purchase.unitName && (
                    <p><span className="text-muted-foreground">Unité:</span> {purchase.unitName}</p>
                  )}
                  <p><span className="text-muted-foreground">Paiement:</span> {purchase.paymentMethod}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails de l'achat */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary mb-3">Détails de l'Achat</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 bg-muted">Description</th>
                      <th className="text-left py-2 px-3 bg-muted">Catégorie</th>
                      <th className="text-right py-2 px-3 bg-muted">Quantité</th>
                      <th className="text-right py-2 px-3 bg-muted">Prix Unit.</th>
                      <th className="text-right py-2 px-3 bg-muted">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-3">{purchase.description}</td>
                      <td className="py-3 px-3">
                        {purchase.category}
                        {purchase.subcategory && <span className="text-muted-foreground"> - {purchase.subcategory}</span>}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {purchase.quantity ? `${purchase.quantity} ${purchase.unit || ''}` : '1'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrencySymbol(purchase.currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        {purchase.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrencySymbol(purchase.currency)}
                      </td>
                    </tr>
                    <tr className="bg-primary/5">
                      <td colSpan={4} className="py-3 px-3 text-right font-bold text-lg">TOTAL</td>
                      <td className="py-3 px-3 text-right font-bold text-lg text-primary">
                        {purchase.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrencySymbol(purchase.currency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes et livraison */}
          {(purchase.notes || purchase.deliveryDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchase.notes && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-primary mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{purchase.notes}</p>
                  </CardContent>
                </Card>
              )}
              {purchase.deliveryDate && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-primary mb-2">Livraison</h3>
                    <p className="text-sm">
                      Date prévue: <strong>{new Date(purchase.deliveryDate).toLocaleDateString('fr-FR')}</strong>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Pied de page */}
          <div className="text-center pt-4 border-t text-xs text-muted-foreground">
            <p>Document généré automatiquement par AquaPilote</p>
            <p>Date de génération: {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseInvoice;
