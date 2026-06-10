import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Plus, Trash2, Tag } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { useSettings } from '@/contexts/SettingsContext';

interface LabelItem {
  id: string;
  name: string;
  code: string;
  price: number;
  copies: number;
}

const makeId = () => Math.random().toString(36).slice(2, 10);
const sanitizeCode = (raw: string) =>
  (raw || '').toString().replace(/[^0-9A-Za-z\-]/g, '').slice(0, 32) || makeId().toUpperCase();

const BarcodeLabelGenerator: React.FC = () => {
  const { companyInfo, formatCurrency } = useSettings();
  const [items, setItems] = useState<LabelItem[]>([
    { id: makeId(), name: 'Tilapia 500g', code: 'AQP-' + makeId().toUpperCase(), price: 2500, copies: 4 },
  ]);
  const containerRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(
    () =>
      items.flatMap((it) =>
        Array.from({ length: Math.max(1, Math.min(50, it.copies || 1)) }, (_, i) => ({
          ...it,
          uid: `${it.id}-${i}`,
        })),
      ),
    [items],
  );

  useEffect(() => {
    labels.forEach((label) => {
      const el = document.getElementById(`bc-${label.uid}`);
      if (!el) return;
      try {
        JsBarcode(el, sanitizeCode(label.code), {
          format: 'CODE128',
          width: 1.6,
          height: 44,
          displayValue: true,
          fontSize: 11,
          margin: 4,
        });
      } catch (err) {
        console.error('Barcode error', err);
      }
    });
  }, [labels]);

  const update = (id: string, patch: Partial<LabelItem>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const add = () =>
    setItems((prev) => [
      ...prev,
      { id: makeId(), name: '', code: 'AQP-' + makeId().toUpperCase(), price: 0, copies: 1 },
    ]);

  const handlePrint = () => {
    const html = containerRef.current?.innerHTML;
    if (!html) return;
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>Étiquettes</title>
      <style>
        body{margin:0;padding:8mm;font-family:system-ui,sans-serif;color:#111}
        .labels{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
        .label{border:1px dashed #999;padding:4mm;border-radius:4px;text-align:center;page-break-inside:avoid}
        .label .n{font-weight:600;font-size:12px;margin-bottom:2px}
        .label .p{font-size:11px;color:#444;margin-top:2px}
        .label svg{max-width:100%;height:auto}
        @media print { body{padding:4mm} .no-print{display:none} }
      </style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="w-4 h-4 text-primary" /> Générateur d'étiquettes code-barres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border-b border-border pb-3">
              <div className="sm:col-span-4">
                <Label className="text-xs">Produit</Label>
                <Input value={it.name} onChange={(e) => update(it.id, { name: e.target.value })} placeholder="Nom" />
              </div>
              <div className="sm:col-span-3">
                <Label className="text-xs">Code</Label>
                <Input value={it.code} onChange={(e) => update(it.id, { code: e.target.value })} placeholder="EAN/SKU" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Prix</Label>
                <Input type="number" min={0} value={it.price} onChange={(e) => update(it.id, { price: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Copies</Label>
                <Input type="number" min={1} max={50} value={it.copies} onChange={(e) => update(it.id, { copies: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-1">
                <Button variant="ghost" size="icon" onClick={() => remove(it.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={add}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" /> Imprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef}>
            <div className="labels grid grid-cols-2 sm:grid-cols-3 gap-3">
              {labels.map((label) => (
                <div key={label.uid} className="label border border-dashed border-border rounded p-2 text-center bg-white text-black">
                  {companyInfo.name && <div className="text-[10px] uppercase tracking-wide text-gray-500">{companyInfo.name}</div>}
                  <div className="n font-semibold text-sm truncate" title={label.name}>{label.name || '—'}</div>
                  <svg id={`bc-${label.uid}`} />
                  <div className="p text-xs text-gray-700">{label.price > 0 ? formatCurrency(label.price) : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeLabelGenerator;