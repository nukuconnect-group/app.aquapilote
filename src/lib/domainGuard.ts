/**
 * Domain Guard - Protects the app from unauthorized cloning
 * Verifies the app is running on authorized domains only
 */

const AUTHORIZED_DOMAINS = [
  'aqua-pilote.lovable.app',
  'localhost',
  '127.0.0.1',
  'id-preview--0fc17be6-2fd0-43fb-ab5d-d4fda8d4767c.lovable.app',
];

// Allow any *.lovable.app preview domain for this specific project
const AUTHORIZED_PATTERNS = [
  /^.*--0fc17be6-2fd0-43fb-ab5d-d4fda8d4767c\.lovable\.app$/,
];

export const isAuthorizedDomain = (): boolean => {
  const hostname = window.location.hostname;
  
  // Check exact matches
  if (AUTHORIZED_DOMAINS.includes(hostname)) return true;
  
  // Check patterns
  if (AUTHORIZED_PATTERNS.some(pattern => pattern.test(hostname))) return true;
  
  return false;
};

export const enforceDomainGuard = () => {
  if (!isAuthorizedDomain()) {
    console.error('🚫 Domaine non autorisé. Cette application est protégée.');
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:white;font-family:system-ui;text-align:center;padding:2rem;">
        <div>
          <h1 style="font-size:2rem;margin-bottom:1rem;">⚠️ Accès non autorisé</h1>
          <p style="color:#94a3b8;max-width:400px;">Cette application est protégée par des droits d'auteur.<br/>Utilisation sur ce domaine non autorisée.</p>
          <p style="margin-top:2rem;"><a href="https://aqua-pilote.lovable.app" style="color:#22d3ee;">Accéder à Aqua Pilot →</a></p>
        </div>
      </div>
    `;
    throw new Error('Unauthorized domain');
  }
};
