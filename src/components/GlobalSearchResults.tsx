import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { APP_MODULE_PERMISSIONS } from '@/lib/moduleAccess';

interface GlobalSearchResultsProps {
  onNavigate: (tabId: string) => void;
  canAccessTab?: (tabId: string) => boolean;
}

/**
 * Overlay global déclenché par l'événement `app:search` dispatché depuis
 * le champ de recherche du Header. Filtre la liste des modules et
 * permet une navigation rapide.
 */
const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ onNavigate, canAccessTab }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const q = String((e as CustomEvent<string>).detail ?? '').trim();
      setQuery(q);
      setOpen(q.length > 0);
    };
    window.addEventListener('app:search', handler as EventListener);
    return () => window.removeEventListener('app:search', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        window.dispatchEvent(new CustomEvent('app:search:close'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const normalized = query.toLowerCase();
  const results = useMemo(() => {
    if (!normalized) return [];
    return APP_MODULE_PERMISSIONS
      .filter((m) => {
        const haystack = `${m.label} ${m.description} ${m.id} ${m.tabIds.join(' ')}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .filter((m) => (canAccessTab ? canAccessTab(m.tabIds[0]) : true))
      .slice(0, 12);
  }, [normalized, canAccessTab]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('app:search:close'));
  };

  const go = (tabId: string) => {
    onNavigate(tabId);
    close();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1100] flex items-start justify-center bg-black/40 backdrop-blur-sm px-3 pt-16 sm:pt-24"
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 text-sm">
            <span className="text-muted-foreground">Résultats pour&nbsp;:</span>{' '}
            <span className="font-semibold text-foreground">{query}</span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Aucun module ne correspond à «&nbsp;{query}&nbsp;».
              <div className="mt-2 text-xs">
                Essayez : <em>tableau, ventes, alimentation, IoT, rapports, équipe…</em>
              </div>
            </div>
          ) : (
            <ul className="py-2">
              {results.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => go(m.tabIds[0])}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{m.label}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Astuce&nbsp;: Échap pour fermer</span>
          <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default GlobalSearchResults;