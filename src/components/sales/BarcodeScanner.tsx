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
  const runningRef = useRef(false);
  const startingRef = useRef(false);

  const safeClear = (scanner: any) => {
    try {
      scanner?.clear?.();
    } catch {
      // html5-qrcode can throw when the camera was already released.
    }
  };

  const safeStopScanner = (scanner: any) => {
    if (!scanner) return;
    const clear = () => {
      runningRef.current = false;
      startingRef.current = false;
      safeClear(scanner);
      if (scannerRef.current === scanner) scannerRef.current = null;
    };

    if (!runningRef.current) {
      // Do not clear while html5-qrcode is still starting. The async setup
      // will observe cancellation and stop itself once start() resolves.
      if (!startingRef.current) clear();
      return;
    }

    try {
      const stopResult = scanner.stop?.();
      if (stopResult && typeof stopResult.then === 'function') {
        stopResult.then(clear).catch(clear);
      } else {
        clear();
      }
    } catch {
      clear();
    }
  };

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
        startingRef.current = true;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText: string) => {
            if (!mountedRef.current) return;
            onScan(decodedText);
            safeStopScanner(scanner);
            onClose();
          },
          () => undefined,
        );
        startingRef.current = false;
        runningRef.current = true;
        if (cancelled || !mountedRef.current) {
          safeStopScanner(scanner);
        }
      } catch (err) {
        startingRef.current = false;
        runningRef.current = false;
        safeClear(scannerRef.current);
        scannerRef.current = null;
        const message = err instanceof Error ? err.message : String(err);
        const isBenignLifecycleError = message.includes('scanner is not running or paused');
        if (mountedRef.current && !isBenignLifecycleError) console.error('Scanner error:', err);
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      const scanner = scannerRef.current;
      if (!startingRef.current) safeStopScanner(scanner);
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