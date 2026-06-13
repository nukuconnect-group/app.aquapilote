/**
 * Domain Guard - Protects the app from unauthorized cloning
 * Verifies the app is running on authorized domains only
 */

const AUTHORIZED_DOMAINS = [
  'aqua-pilote.lovable.app',
  'aquapilote.app',
  'www.aquapilote.app',
  'aqua001.lovable.app',
  'localhost',
  '127.0.0.1',
  'id-preview--0fc17be6-2fd0-43fb-ab5d-d4fda8d4767c.lovable.app',
];

// Allow any *.lovable.app preview domain for this specific project + Capacitor
const AUTHORIZED_PATTERNS = [
  /^.*--0fc17be6-2fd0-43fb-ab5d-d4fda8d4767c\.lovable\.app$/,
  /^.*\.lovable\.app$/, // All lovable.app subdomains (published apps)
  /^.*\.netlify\.app$/, // Netlify deployments
  /^.*\.aquapilote\.app$/, // All aquapilote.app subdomains
  /^.*\.vercel\.app$/, // Vercel deployments
];

// Capacitor / native app protocols
const NATIVE_PROTOCOLS = ['capacitor:', 'ionic:', 'file:'];

export const isAuthorizedDomain = (): boolean => {
  // Allow native mobile apps (Capacitor, Ionic, file://)
  if (NATIVE_PROTOCOLS.some(p => window.location.protocol.startsWith(p))) return true;
  
  // Allow empty hostname (native webview)
  if (!window.location.hostname || window.location.hostname === '') return true;

  const hostname = window.location.hostname;
  
  // Check exact matches
  if (AUTHORIZED_DOMAINS.includes(hostname)) return true;
  
  // Check patterns
  if (AUTHORIZED_PATTERNS.some(pattern => pattern.test(hostname))) return true;
  
  return false;
};

export const enforceDomainGuard = () => {
  // Désactivé : accès autorisé sur tous les domaines
  return;
};
