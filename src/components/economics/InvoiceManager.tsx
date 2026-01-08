import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Download, Eye, Printer, X } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useSales } from '@/hooks/useSales';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const InvoiceManager = () => {
  const { formatCurrency, t } = useSettings();
  const { sales } = useSales(); // déjà filtré par unité active dans le hook
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const invoices = useMemo<Invoice[]>(() => {
    const today = new Date().toISOString().slice(0, 10);

    const computeDueDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const due = new Date(d);
      due.setDate(d.getDate() + 30);
      return due.toISOString().slice(0, 10);
    };

    const baseStatusFromSale = (saleStatus: string): InvoiceStatus => {
      if (saleStatus === 'paid') return 'paid';
      if (saleStatus === 'pending') return 'draft';
      return 'sent'; // confirmed / delivered
    };

    return sales
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((sale) => {
        const dueDate = computeDueDate(sale.date);
        const items: InvoiceItem[] = sale.products.map((p, idx) => ({
          id: `${sale.id}-${idx}`,
          description: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          total: p.total,
        }));

        const subtotal = sale.totalAmount;
        const tax = 0;
        const total = subtotal + tax;

        let status: InvoiceStatus = baseStatusFromSale(sale.status);
        if (status !== 'paid' && dueDate < today) status = 'overdue';

        return {
          id: sale.id,
          invoiceNumber: `INV-${sale.date.split('-').join('')}-${sale.id.slice(0, 6).toUpperCase()}`,
          clientName: sale.clientName,
          date: sale.date,
          dueDate,
          items,
          subtotal,
          tax,
          total,
          status,
        };
      });
  }, [sales]);

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'sent':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200';
      case 'overdue':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return t('draft') || 'Brouillon';
      case 'sent':
        return t('sent') || 'Envoyée';
      case 'paid':
        return t('paid') || 'Payée';
      case 'overdue':
        return t('overdue') || 'En retard';
      default:
        return status;
    }
  };

  const generateInvoiceContent = (invoice: Invoice) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE</h1>
            <h2>${invoice.invoiceNumber}</h2>
          </div>

          <div class="invoice-details">
            <div>
              <strong>Client:</strong><br>
              ${invoice.clientName}
            </div>
            <div>
              <strong>Date:</strong> ${invoice.date}<br>
              <strong>Échéance:</strong> ${invoice.dueDate}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Sous-total: ${formatCurrency(invoice.subtotal)}</p>
            <p>TVA: ${formatCurrency(invoice.tax)}</p>
            <p class="total-row">Total: ${formatCurrency(invoice.total)}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceContent = generateInvoiceContent(invoice);
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const invoiceContent = generateInvoiceContent(invoice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t('invoiceManagement') || 'Factures'}
        </h3>
        <div className="text-sm text-muted-foreground">
          {invoices.length} facture{invoices.length > 1 ? 's' : ''} au total
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-muted">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{invoices.filter((i) => i.status === 'draft').length}</p>
              <p className="text-sm text-muted-foreground">{t('drafts') || 'Brouillons'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sky-600">{invoices.filter((i) => i.status === 'sent').length}</p>
              <p className="text-sm text-muted-foreground">{t('sent') || 'Envoyées'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{invoices.filter((i) => i.status === 'paid').length}</p>
              <p className="text-sm text-muted-foreground">{t('paidInvoices') || 'Payées'}</p>
              <p className="text-xs text-emerald-600 mt-1">
                {formatCurrency(invoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">{invoices.filter((i) => i.status === 'overdue').length}</p>
              <p className="text-sm text-muted-foreground">{t('overdueInvoices') || 'En retard'}</p>
              {invoices.filter((i) => i.status === 'overdue').length > 0 && (
                <p className="text-xs text-rose-600 mt-1">
                  {formatCurrency(invoices.filter((i) => i.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0))}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('invoiceList') || 'Liste des factures'}</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noInvoicesYet') || "Aucune facture: enregistrez d'abord des ventes."}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('invoiceNumber') || 'N°'}</TableHead>
                  <TableHead>{t('client') || 'Client'}</TableHead>
                  <TableHead>{t('date') || 'Date'}</TableHead>
                  <TableHead>{t('dueDate') || 'Échéance'}</TableHead>
                  <TableHead>{t('amount') || 'Montant'}</TableHead>
                  <TableHead>{t('status') || 'Statut'}</TableHead>
                  <TableHead>{t('actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(invoice)}>
                          <Printer className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de prévisualisation de facture */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Facture {selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>
              Prévisualisation de la facture
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* En-tête de facture */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('client') || 'Client'}</p>
                    <p className="font-semibold text-lg">{selectedInvoice.clientName}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <Badge className={`${getStatusColor(selectedInvoice.status)} text-sm`}>
                      {getStatusLabel(selectedInvoice.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Détails de la facture */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-muted-foreground text-xs">{t('invoiceNumber') || 'N° Facture'}</p>
                  <p className="font-medium font-mono">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-muted-foreground text-xs">{t('date') || 'Date'}</p>
                  <p className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-muted-foreground text-xs">{t('dueDate') || 'Échéance'}</p>
                  <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-muted-foreground text-xs">{t('total') || 'Total'}</p>
                  <p className="font-bold text-primary">{formatCurrency(selectedInvoice.total)}</p>
                </div>
              </div>

              {/* Tableau des articles */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>{t('description') || 'Description'}</TableHead>
                      <TableHead className="text-right">{t('quantity') || 'Qté'}</TableHead>
                      <TableHead className="text-right">{t('unitPrice') || 'Prix U.'}</TableHead>
                      <TableHead className="text-right">{t('total') || 'Total'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totaux */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal') || 'Sous-total'}</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('vat') || 'TVA'}</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>{t('total') || 'Total'}</span>
                    <span className="text-primary">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)} className="flex-1 sm:flex-none">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger HTML
                </Button>
                <Button variant="outline" onClick={() => handlePrintInvoice(selectedInvoice)} className="flex-1 sm:flex-none">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline" onClick={() => setSelectedInvoice(null)} className="ml-auto">
                  <X className="w-4 h-4 mr-2" />
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManager;
