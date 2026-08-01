export type ChatErrorCause =
  | 'validation'
  | 'auth'
  | 'request'
  | 'rls'
  | 'rate_limit'
  | 'credits'
  | 'timeout'
  | 'network';

export interface ChatError {
  cause: ChatErrorCause;
  message: string;
  retryable: boolean;
  /** Identifiant unique de la requête, également envoyé au serveur (en-tête x-request-id). */
  requestId?: string;
  /** Route applicative au moment de l'erreur (ex: /dashboard?module=assistant). */
  route?: string;
  /** Numéro de tentative (1 = premier envoi). */
  attempt?: number;
}

export const CHAT_ERROR_LABEL: Record<ChatErrorCause, string> = {
  validation: 'Message invalide',
  auth: 'Authentification',
  request: 'Requête refusée',
  rls: 'Accès aux données (RLS)',
  rate_limit: 'Trop de requêtes',
  credits: 'Crédits IA épuisés',
  timeout: 'Délai dépassé',
  network: 'Réseau / serveur',
};

/** Nombre maximum de tentatives (envoi initial + réessais). */
export const MAX_CHAT_ATTEMPTS = 4;

/** Backoff exponentiel plafonné : 2s, 4s, 8s (max 15s). */
export const chatRetryDelayMs = (attempt: number) =>
  Math.min(15000, 2000 * Math.pow(2, Math.max(0, attempt - 1)));

export const newRequestId = () => {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `req_${Date.now().toString(36)}_${rnd}`;
};

export const currentRoute = () => {
  if (typeof window === 'undefined') return 'ssr';
  return `${window.location.pathname}${window.location.search}`;
};

/**
 * Limite de débit côté client : évite les envois multiples rapprochés qui
 * provoquent des timeouts ou une consommation inutile de crédits IA.
 * Le serveur applique sa propre limite (voir supabase/functions/aqua-assistant).
 */
export const CHAT_MIN_INTERVAL_MS = 2000;
export const CHAT_WINDOW_MS = 60000;
export const CHAT_MAX_PER_WINDOW = 12;

export type RateLimitVerdict = { allowed: true } | { allowed: false; retryAfterMs: number; reason: 'cooldown' | 'quota' };

export const createChatRateLimiter = () => {
  let sentAt: number[] = [];

  return {
    check(now = Date.now()): RateLimitVerdict {
      sentAt = sentAt.filter((t) => now - t < CHAT_WINDOW_MS);
      const last = sentAt[sentAt.length - 1];
      if (last !== undefined && now - last < CHAT_MIN_INTERVAL_MS) {
        return { allowed: false, retryAfterMs: CHAT_MIN_INTERVAL_MS - (now - last), reason: 'cooldown' };
      }
      if (sentAt.length >= CHAT_MAX_PER_WINDOW) {
        return { allowed: false, retryAfterMs: CHAT_WINDOW_MS - (now - sentAt[0]), reason: 'quota' };
      }
      return { allowed: true };
    },
    record(now = Date.now()) {
      sentAt.push(now);
    },
    reset() {
      sentAt = [];
    },
  };
};

export const rateLimitMessage = (verdict: Extract<RateLimitVerdict, { allowed: false }>) => {
  const seconds = Math.max(1, Math.ceil(verdict.retryAfterMs / 1000));
  return verdict.reason === 'cooldown'
    ? `Envoi trop rapide. Patientez ${seconds} s avant le prochain message.`
    : `Limite de ${CHAT_MAX_PER_WINDOW} messages par minute atteinte. Réessayez dans ${seconds} s.`;
};
