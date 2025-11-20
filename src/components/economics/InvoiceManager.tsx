
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Eye, Plus, Printer } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

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
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  transactionId?: string;
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
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Restaurant Les Saveurs',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          id: '1',
          description: 'Carpes matures - 50kg',
          quantity: 50,
          unitPrice: 15,
          total: 750
        }
      ],
      subtotal: 750,
      tax: 150,
      total: 900,
      status: 'sent',
      transactionId: 'trans-001'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Aquarium Municipal',
      date: '2024-01-18',
      dueDate: '2024-02-18',
      items: [
        {
          id: '1',
          description: 'Alevins carpe - 200 unités',
          quantity: 200,
          unitPrice: 2.5,
          total: 500
        }
      ],
      subtotal: 500,
      tax: 100,
      total: 600,
      status: 'draft'
    }
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return t('draft');
      case 'sent': return t('sent');
      case 'paid': return t('paid');
      case 'overdue': return t('overdue');
      default: return status;
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulation du téléchargement
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
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Sous-total: ${formatCurrency(invoice.subtotal)}</p>
            <p>TVA (20%): ${formatCurrency(invoice.tax)}</p>
            <p class="total-row">Total: ${formatCurrency(invoice.total)}</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('invoiceManagement')}
        </h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('newInvoice')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {invoices.filter(i => i.status === 'draft').length}
              </p>
              <p className="text-sm text-gray-600">{t('drafts')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {invoices.filter(i => i.status === 'sent').length}
              </p>
              <p className="text-sm text-gray-600">{t('pending')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
              <p className="text-sm text-gray-600">{t('paidInvoices')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(i => i.status === 'overdue').length}
              </p>
              <p className="text-sm text-gray-600">{t('overdueInvoices')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('invoiceList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoiceNumber')}</TableHead>
                <TableHead>{t('client')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('dueDate')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
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
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintInvoice(invoice)}
                      >
                        <Printer className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('invoicePreview')} {selectedInvoice.invoiceNumber}
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                {t('close')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>{t('client')}:</strong> {selectedInvoice.clientName}</p>
                  <p><strong>{t('date')}:</strong> {selectedInvoice.date}</p>
                </div>
                <div>
                  <p><strong>{t('dueDate')}:</strong> {selectedInvoice.dueDate}</p>
                  <p><strong>{t('status')}:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusLabel(selectedInvoice.status)}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('quantity')}</TableHead>
                    <TableHead>{t('unitPrice')}</TableHead>
                    <TableHead>{t('total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="text-right space-y-1">
                <p>{t('subtotal')}: {formatCurrency(selectedInvoice.subtotal)}</p>
                <p>{t('vat')} (20%): {formatCurrency(selectedInvoice.tax)}</p>
                <p className="text-lg font-bold">{t('total')}: {formatCurrency(selectedInvoice.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceManager;
