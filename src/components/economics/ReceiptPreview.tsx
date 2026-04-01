import React, { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, FileText, CheckCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

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
  isPaid?: boolean;
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
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  
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

  const generatePDF = useCallback(async (action: 'download' | 'print') => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      toast({ title: "Génération en cours...", description: "Veuillez patienter" });

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const filename = `${getDocumentTitle()}_${data.number}.pdf`;

      if (action === 'download') {
        pdf.save(filename);
        toast({ title: "PDF téléchargé", description: filename });
      } else {
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        if (printWindow) {
          printWindow.onload = () => printWindow.print();
        }
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      toast({ title: "Erreur", description: "Impossible de générer le PDF", variant: "destructive" });
    }
  }, [data, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Prévisualisation du {getDocumentTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Printable receipt content */}
        <div ref={receiptRef} className="bg-white text-black p-4 sm:p-8 rounded-lg border relative">
          {/* PAID stamp */}
          {data.isPaid && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] pointer-events-none z-10">
              <div className="border-[6px] border-green-600 rounded-xl px-8 py-4 opacity-30">
                <span className="text-green-600 font-extrabold text-6xl sm:text-8xl tracking-widest">PAYÉ</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-[3px] border-blue-600">
            {displayCompanyLogo && (
              <div className="flex justify-center mb-3">
                <img
                  src={displayCompanyLogo}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            )}
            {displayCompanyName && (
              <h2 className="text-xl font-bold text-gray-900 mb-1">{displayCompanyName}</h2>
            )}
            {displayCompanyAddress && (
              <p className="text-sm text-gray-500">{displayCompanyAddress}</p>
            )}
            {displayCompanyContact && (
              <p className="text-sm text-gray-500">{displayCompanyContact}</p>
            )}
            {companyInfo.registrationNumber && (
              <p className="text-xs text-gray-400 mt-1">N° Reg: {companyInfo.registrationNumber}</p>
            )}
            {companyInfo.taxId && (
              <p className="text-xs text-gray-400">ID Fiscal: {companyInfo.taxId}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-4">{getDocumentTitle()}</h1>
            <p className="text-lg text-gray-500 font-semibold">{data.number}</p>
          </div>

          {/* Client and Document Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Informations Client</h3>
              <p className="text-sm text-gray-700"><strong>Nom:</strong> {data.clientName}</p>
              {data.clientContact && <p className="text-sm text-gray-700"><strong>Contact:</strong> {data.clientContact}</p>}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Informations Document</h3>
              <p className="text-sm text-gray-700"><strong>Date:</strong> {new Date(data.date).toLocaleDateString('fr-FR')}</p>
              {data.paymentMethod && <p className="text-sm text-gray-700"><strong>Paiement:</strong> {data.paymentMethod}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-blue-600">
                <th className="text-left p-3 text-white font-semibold">Description</th>
                <th className="text-right p-3 text-white font-semibold">Qté</th>
                <th className="text-right p-3 text-white font-semibold">Prix unit.</th>
                <th className="text-right p-3 text-white font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td className="p-3 text-gray-900 font-medium">{item.name}</td>
                  <td className="p-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="p-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-3 text-right text-gray-900 font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-80 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                <span>Sous-total:</span>
                <span className="font-medium">{formatCurrency(data.subtotal)}</span>
              </div>
              {data.tax ? (
                <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                  <span>TVA ({data.taxRate || 20}%):</span>
                  <span className="font-medium">{formatCurrency(data.tax)}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-3 text-xl font-bold text-blue-600 border-t-2 border-blue-600 mt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-6">
              <h4 className="font-semibold text-sm text-yellow-900 mb-1">Notes / Conditions</h4>
              <p className="text-sm text-yellow-800">{data.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t-2 border-gray-200 text-gray-400 text-xs">
            <p>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
            <p>Merci pour votre confiance</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end mt-3 sm:mt-4">
          <Button variant="outline" onClick={() => generatePDF('download')} className="w-full sm:w-auto text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button variant="outline" onClick={() => generatePDF('print')} className="w-full sm:w-auto text-sm">
            <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Imprimer
          </Button>
          {showConfirmButton && onConfirm && (
            <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Confirmer et enregistrer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreview;
