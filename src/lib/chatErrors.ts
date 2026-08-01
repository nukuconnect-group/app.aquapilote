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
