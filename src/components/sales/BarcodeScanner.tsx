import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScanLine, X } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const SCANNER_ELEMENT_ID = 'barcode-scanner-region';

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ open, onClose, onScan }) => {
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    mountedRef.current = true;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        const el = document.getElementById(SCANNER_ELEMENT_ID);
        if (!el) return;
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText: string) => {
            if (!mountedRef.current) return;
            onScan(decodedText);
            scanner.stop().then(() => scanner.clear()).catch(() => undefined);
            onClose();
          },
          () => undefined,
        );
      } catch (err) {
        console.error('Scanner error:', err);
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, [open, onClose, onScan]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" /> Scanner code-barres / QR
          </DialogTitle>
          <DialogDescription>
            Pointez la caméra vers le code. Le produit sera ajouté automatiquement.
          </DialogDescription>
        </DialogHeader>
        <div
          id={SCANNER_ELEMENT_ID}
          className="w-full overflow-hidden rounded-lg border border-border bg-black"
          style={{ minHeight: 280 }}
        />
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;