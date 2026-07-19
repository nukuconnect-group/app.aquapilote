type DiagnosticKind =
  | 'console'
  | 'network'
  | 'navigation'
  | 'mutation'
  | 'hook-state'
  | 'watchdog'
  | 'error-boundary'
  | 'overlay-cleanup';

type DiagnosticEntry = {
  id: string;
  at: string;
  kind: DiagnosticKind;
  label: string;
  data?: unknown;
};

declare global {
  interface Window {
    __AQUA_DIAGNOSTICS__?: DiagnosticEntry[];
    __AQUA_DIAGNOSTIC_MODE__?: boolean;
    __AQUA_DIAGNOSTICS_INSTALLED__?: boolean;
  }
}

const MAX_ENTRIES = 250;

const safeData = (data: unknown) => {
  try {
    return JSON.parse(JSON.stringify(data, (_key, value) => {
      if (typeof value === 'string' && value.length > 180) return `${value.slice(0, 180)}…`;
      return value;
    }));
  } catch {
    return String(data);
  }
};

export const isDiagnosticModeEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.__AQUA_DIAGNOSTIC_MODE__ === true || localStorage.getItem('aqua-diagnostic-mode') === 'true';
};

export const recordDiagnostic = (kind: DiagnosticKind, label: string, data?: unknown) => {
  if (typeof window === 'undefined') return;
  const entry: DiagnosticEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    kind,
    label,
    data: safeData(data),
  };
  const entries = window.__AQUA_DIAGNOSTICS__ ?? [];
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  window.__AQUA_DIAGNOSTICS__ = entries;
  window.dispatchEvent(new CustomEvent('aqua:diagnostic-entry', { detail: entry }));
};

export const installDiagnostics = () => {
  if (typeof window === 'undefined' || window.__AQUA_DIAGNOSTICS_INSTALLED__) return;
  window.__AQUA_DIAGNOSTICS_INSTALLED__ = true;
  window.__AQUA_DIAGNOSTICS__ = window.__AQUA_DIAGNOSTICS__ ?? [];

  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') === '1' || params.get('diagnostic') === '1') {
    localStorage.setItem('aqua-diagnostic-mode', 'true');
    window.__AQUA_DIAGNOSTIC_MODE__ = true;
  }

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);
  console.error = (...args: unknown[]) => {
    recordDiagnostic('console', 'console.error', args);
    originalError(...args);
  };
  console.warn = (...args: unknown[]) => {
    recordDiagnostic('console', 'console.warn', args);
    originalWarn(...args);
  };

  window.addEventListener('error', (event) => {
    recordDiagnostic('console', 'window.error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    recordDiagnostic('console', 'unhandledrejection', { reason: event.reason?.message || String(event.reason) });
  });

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const startedAt = performance.now();
    const request = args[0];
    const url = typeof request === 'string' ? request : request instanceof Request ? request.url : String(request);
    try {
      const response = await originalFetch(...args);
      if (!response.ok || isDiagnosticModeEnabled()) {
        recordDiagnostic('network', response.ok ? 'fetch' : 'fetch failed', {
          url,
          status: response.status,
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
      return response;
    } catch (error: any) {
      recordDiagnostic('network', 'fetch exception', { url, message: error?.message || String(error) });
      throw error;
    }
  };

  const wrapHistory = (name: 'pushState' | 'replaceState') => {
    const original = history[name].bind(history);
    history[name] = (...args) => {
      const result = original(...args);
      recordDiagnostic('navigation', name, { url: String(args[2] ?? window.location.href) });
      window.dispatchEvent(new CustomEvent('aqua:navigation', { detail: { type: name, url: window.location.href } }));
      return result;
    };
  };
  wrapHistory('pushState');
  wrapHistory('replaceState');
  window.addEventListener('popstate', () => {
    recordDiagnostic('navigation', 'popstate', { url: window.location.href });
  });
};

export const cleanupBlockingOverlays = (reason = 'manual') => {
  if (typeof document === 'undefined') return 0;
  const body = document.body;
  body.style.pointerEvents = '';
  body.style.overflow = '';
  body.removeAttribute('data-scroll-locked');

  const selectors = [
    '[data-radix-focus-guard]',
    '[data-radix-dismissable-layer]',
    '[data-radix-popper-content-wrapper]',
  ];
  let removed = 0;
  document.querySelectorAll<HTMLElement>(selectors.join(',')).forEach((el) => {
    el.style.display = "none"; el.style.pointerEvents = "none"; el.setAttribute("data-cleaned-up", "true");
    removed += 1;
  });
  if (removed > 0) recordDiagnostic('overlay-cleanup', reason, { removed });
  return removed;
};

export const emitDataMutation = (detail: { table: string; action: 'create' | 'update' | 'delete'; id?: string; module?: string }) => {
  recordDiagnostic('mutation', `${detail.table}:${detail.action}`, detail);
  window.dispatchEvent(new CustomEvent('aqua:data-mutated', { detail }));
  window.dispatchEvent(new CustomEvent('aqua:data-refresh', { detail }));
};

export const requestDataRefresh = (reason: string, tables: string[] = []) => {
  recordDiagnostic('mutation', 'refresh requested', { reason, tables });
  window.dispatchEvent(new CustomEvent('aqua:data-refresh', { detail: { reason, tables } }));
};

export const recordHookState = (hook: string, state: Record<string, unknown>) => {
  if (!isDiagnosticModeEnabled()) return;
  recordDiagnostic('hook-state', hook, state);
};
