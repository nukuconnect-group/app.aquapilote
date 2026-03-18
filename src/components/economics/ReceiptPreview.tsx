import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, FileText } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { generateCompanyHeaderHTML } from '@/lib/companyHeaderUtils';

export interface ReceiptItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  id?: string;
  type: 'receipt' | 'quote' | 'invoice';
  number: string;
  date: string;
  clientName: string;
  clientContact?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  taxRate?: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
  companyName?: string;
  companyAddress?: string;
  companyContact?: string;
}

interface ReceiptPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  open,
  onOpenChange,
  data,
  onConfirm,
  showConfirmButton = false
}) => {
  const { formatCurrency, companyInfo } = useSettings();
  
  // Utiliser les infos entreprise du contexte si non fournies dans data
  const displayCompanyName = data.companyName || companyInfo.name;
  const displayCompanyAddress = data.companyAddress || companyInfo.address;
  const displayCompanyContact = data.companyContact || (companyInfo.phone ? `Tél: ${companyInfo.phone}${companyInfo.email ? ` | Email: ${companyInfo.email}` : ''}` : companyInfo.email);
  const displayCompanyLogo = companyInfo.logoUrl;

  const getDocumentTitle = () => {
    switch (data.type) {
      case 'quote': return 'DEVIS';
      case 'invoice': return 'FACTURE';
      case 'receipt': return 'REÇU DE VENTE';
      default: return 'DOCUMENT';
    }
  };

  // Générer l'en-tête entreprise pour l'impression
  const companyHeader = generateCompanyHeaderHTML({
    name: displayCompanyName,
    address: displayCompanyAddress,
    phone: companyInfo.phone,
    email: companyInfo.email,
    logoUrl: displayCompanyLogo,
    registrationNumber: companyInfo.registrationNumber,
    taxId: companyInfo.taxId
  });

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${getDocumentTitle()} ${data.number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              background: white;
              color: #333;
            }
            .receipt-container { 
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border: 2px solid #e5e7eb;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .header h1 {
              color: #2563eb;
              font-size: 32px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .header .doc-number {
              font-size: 18px;
              color: #64748b;
              font-weight: 600;
            }
            .company-info {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .company-info h3 {
              color: #1e293b;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .company-info p {
              color: #64748b;
              line-height: 1.6;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 20px;
            }
            .info-box {
              flex: 1;
              padding: 20px;
              background: #f1f5f9;
              border-radius: 8px;
            }
            .info-box h3 {
              color: #1e293b;
              margin-bottom: 12px;
              font-size: 16px;
              font-weight: 600;
            }
            .info-box p {
              color: #475569;
              line-height: 1.8;
              font-size: 14px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .items-table thead {
              background: #2563eb;
              color: white;
            }
            .items-table th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            .items-table td {
              padding: 15px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
            }
            .items-table tbody tr:hover {
              background: #f8fafc;
            }
            .items-table .text-right {
              text-align: right;
            }
            .totals-section {
              margin-top: 30px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 350px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 14px;
            }
            .total-row.subtotal {
              color: #64748b;
              border-bottom: 1px solid #cbd5e1;
            }
            .total-row.tax {
              color: #64748b;
              border-bottom: 1px solid #cbd5e1;
            }
            .total-row.grand-total {
              font-size: 20px;
              font-weight: bold;
              color: #2563eb;
              margin-top: 10px;
              padding-top: 15px;
              border-top: 2px solid #2563eb;
            }
            .notes-section {
              margin-top: 40px;
              padding: 20px;
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .notes-section h4 {
              color: #92400e;
              margin-bottom: 10px;
              font-size: 14px;
              font-weight: 600;
            }
            .notes-section p {
              color: #78350f;
              line-height: 1.6;
              font-size: 13px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${companyHeader || `
              <div class="header">
                <h1>${getDocumentTitle()}</h1>
                <div class="doc-number">${data.number}</div>
              </div>
            `}
            
            ${companyHeader ? `
              <div class="header" style="border-bottom: none; margin-bottom: 20px;">
                <h1>${getDocumentTitle()}</h1>
                <div class="doc-number">${data.number}</div>
              </div>
            ` : ''}

            <div class="info-section">
              <div class="info-box">
                <h3>Informations Client</h3>
                <p><strong>Nom:</strong> ${data.clientName}</p>
                ${data.clientContact ? `<p><strong>Contact:</strong> ${data.clientContact}</p>` : ''}
              </div>
              <div class="info-box">
                <h3>Informations Document</h3>
                <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('fr-FR')}</p>
                ${data.paymentMethod ? `<p><strong>Mode de paiement:</strong> ${data.paymentMethod}</p>` : ''}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Quantité</th>
                  <th class="text-right">Prix unitaire</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong>
                      ${item.description ? `<br><small style="color: #64748b;">${item.description}</small>` : ''}
                    </td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="totals-box">
                <div class="total-row subtotal">
                  <span>Sous-total:</span>
                  <span>${formatCurrency(data.subtotal)}</span>
                </div>
                ${data.tax ? `
                  <div class="total-row tax">
                    <span>TVA (${data.taxRate || 20}%):</span>
                    <span>${formatCurrency(data.tax)}</span>
                  </div>
                ` : ''}
                <div class="total-row grand-total">
                  <span>TOTAL:</span>
                  <span>${formatCurrency(data.total)}</span>
                </div>
              </div>
            </div>

            ${data.notes ? `
              <div class="notes-section">
                <h4>Notes / Conditions</h4>
                <p>${data.notes}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
              <p>Merci pour votre confiance</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownload = () => {
    const html = generateReceiptHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getDocumentTitle()}_${data.number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateReceiptHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Prévisualisation du {getDocumentTitle()}
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-6">
            <CardTitle className="text-center text-lg sm:text-2xl">{getDocumentTitle()}</CardTitle>
            <p className="text-center text-blue-100 text-sm sm:text-lg">{data.number}</p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {/* Company Info */}
            {displayCompanyName && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted rounded-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  {displayCompanyLogo && (
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-background p-2 sm:h-20 sm:w-20">
                      <img
                        src={displayCompanyLogo}
                        alt={`Logo ${displayCompanyName}`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 break-words">{displayCompanyName}</h3>
                    {displayCompanyAddress && <p className="text-xs sm:text-sm text-muted-foreground break-words">{displayCompanyAddress}</p>}
                    {displayCompanyContact && <p className="text-xs sm:text-sm text-muted-foreground break-words">{displayCompanyContact}</p>}
                    {companyInfo.registrationNumber && <p className="text-xs text-muted-foreground">N° Reg: {companyInfo.registrationNumber}</p>}
                    {companyInfo.taxId && <p className="text-xs text-muted-foreground">ID Fiscal: {companyInfo.taxId}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Client and Date Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Informations Client</h3>
                <p className="text-xs sm:text-sm"><strong>Nom:</strong> <span className="break-words">{data.clientName}</span></p>
                {data.clientContact && <p className="text-xs sm:text-sm"><strong>Contact:</strong> <span className="break-words">{data.clientContact}</span></p>}
              </div>
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Informations Document</h3>
                <p className="text-xs sm:text-sm"><strong>Date:</strong> {new Date(data.date).toLocaleDateString('fr-FR')}</p>
                {data.paymentMethod && <p className="text-xs sm:text-sm"><strong>Paiement:</strong> {data.paymentMethod}</p>}
              </div>
            </div>

            <Separator className="my-3 sm:my-4" />

            {/* Items Table */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <h3 className="font-semibold text-sm sm:text-base">Détails des produits</h3>
              {data.items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-start p-2 sm:p-3 bg-muted/50 rounded gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base break-words">{item.name}</p>
                    {item.description && <p className="text-xs sm:text-sm text-muted-foreground break-words">{item.description}</p>}
                  </div>
                  <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="font-semibold text-sm sm:text-base">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-3 sm:my-4" />

            {/* Totals */}
            <div className="space-y-2 max-w-full sm:max-w-sm sm:ml-auto bg-muted/30 p-3 rounded-lg">
              <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
                <span>Sous-total:</span>
                <span className="font-medium">{formatCurrency(data.subtotal)}</span>
              </div>
              {data.tax && (
                <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
                  <span>TVA ({data.taxRate || 20}%):</span>
                  <span className="font-medium">{formatCurrency(data.tax)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base sm:text-xl font-bold text-blue-600">
                <span>TOTAL:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 text-yellow-900">Notes / Conditions</h4>
                <p className="text-xs sm:text-sm text-yellow-800 break-words">{data.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2 justify-end mt-3 sm:mt-4">
          <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Télécharger
          </Button>
          <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto text-sm">
            <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Imprimer
          </Button>
          {showConfirmButton && onConfirm && (
            <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm">
              Confirmer et enregistrer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreview;
