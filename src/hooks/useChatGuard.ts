import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAT_MAX_PER_WINDOW,
  MAX_CHAT_ATTEMPTS,
  chatRetryDelayMs,
  createChatRateLimiter,
  currentRoute,
  newRequestId,
  rateLimitMessage,
  type ChatError,
  type ChatErrorCause,
} from '@/lib/chatErrors';

/**
 * Garde-fou partagé par les deux surfaces de chat (assistant flottant et module
 * plein écran) : validation, identifiant de requête, limite de débit client,
 * backoff progressif et arrêt après MAX_CHAT_ATTEMPTS tentatives.
 */
export const useChatGuard = () => {
  const [chatError, setChatError] = useState<ChatError | null>(null);
  const [lastAttempt, setLastAttempt] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [retryIn, setRetryIn] = useState(0);
  const limiter = useRef(createChatRateLimiter());
  const retryAt = useRef<number>(0);
  const requestId = useRef<string>('');

  useEffect(() => {
    if (!chatError) {
      setRetryIn(0);
      return;
    }
    const tick = () => setRetryIn(Math.max(0, Math.ceil((retryAt.current - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [chatError]);

  const fail = useCallback((cause: ChatErrorCause, message: string, retryable: boolean, attemptNo: number) => {
    const exhausted = attemptNo >= MAX_CHAT_ATTEMPTS;
    retryAt.current = Date.now() + (retryable && !exhausted ? chatRetryDelayMs(attemptNo) : 0);
    setChatError({
      cause,
      message: exhausted
        ? `${message} — Nombre maximum de tentatives atteint (${MAX_CHAT_ATTEMPTS}). Modifiez votre message ou réessayez plus tard.`
        : message,
      retryable: retryable && !exhausted,
      requestId: requestId.current || undefined,
      route: currentRoute(),
      attempt: attemptNo,
    });
  }, []);

  /**
   * À appeler avant chaque envoi. Retourne null si l'envoi doit être bloqué,
   * sinon le contexte de la tentative.
   */
  const beginAttempt = useCallback(
    (text: string, isRetry: boolean): { requestId: string; attempt: number } | null => {
      const trimmed = text.trim();
      if (!trimmed) {
        requestId.current = '';
        fail('validation', "Votre message est vide. Écrivez une question avant d'envoyer.", false, 0);
        return null;
      }
      if (trimmed.length > 10000) {
        fail('validation', 'Message trop long (maximum 10 000 caractères).', false, 0);
        return null;
      }

      const nextAttempt = isRetry ? attempt + 1 : 1;
      if (nextAttempt > MAX_CHAT_ATTEMPTS) {
        fail('request', 'Trop de tentatives consécutives.', false, nextAttempt);
        return null;
      }

      const verdict = limiter.current.check();
      if (!verdict.allowed) {
        requestId.current = newRequestId();
        fail('rate_limit', rateLimitMessage(verdict), true, nextAttempt - 1 || 1);
        retryAt.current = Date.now() + verdict.retryAfterMs;
        return null;
      }

      limiter.current.record();
      requestId.current = newRequestId();
      setAttempt(nextAttempt);
      setLastAttempt(trimmed);
      setChatError(null);
      return { requestId: requestId.current, attempt: nextAttempt };
    },
    [attempt, fail],
  );

  const succeed = useCallback(() => {
    setAttempt(0);
    setChatError(null);
  }, []);

  /** Classe une erreur réseau/serveur et applique le backoff. */
  const failFromError = useCallback(
    (error: unknown, attemptNo: number) => {
      const status = (error as { status?: number })?.status;
      const raw = error instanceof Error ? error.message : String(error);
      let cause: ChatErrorCause = 'network';
      if (status === 401 || status === 403) cause = 'auth';
      else if (status === 429) cause = 'rate_limit';
      else if (status === 402) cause = 'credits';
      else if (status === 400) cause = 'request';
      else if (/timeout|abort/i.test(raw)) cause = 'timeout';
      else if (/row-level security|RLS|permission/i.test(raw)) cause = 'rls';
      // Une erreur de validation serveur ne se corrige pas en réessayant à l'identique.
      fail(cause, raw, cause !== 'request', attemptNo);
    },
    [fail],
  );

  const clearError = useCallback(() => setChatError(null), []);

  return {
    chatError,
    setChatError,
    lastAttempt,
    attempt,
    retryIn,
    canRetryNow: retryIn <= 0,
    maxAttempts: MAX_CHAT_ATTEMPTS,
    maxPerMinute: CHAT_MAX_PER_WINDOW,
    beginAttempt,
    succeed,
    failFromError,
    fail,
    clearError,
  };
};
