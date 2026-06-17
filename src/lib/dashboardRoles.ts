// RBAC unifié : un seul tableau de bord pour tous les utilisateurs.
// Les rôles identifient uniquement la fonction; les modules attribués pilotent l'accès réel.
// L'ancien type "DashboardRole" est conservé comme alias pour ne pas casser
// les imports existants — la colonne DB `dashboard_roles` stocke désormais
// des clés de rôle RBAC (voir TEAM_ROLE_DEFINITIONS ci-dessous).

export type TeamRole =
  | 'admin'
  | 'manager'
  | 'production_lead'
  | 'technician'
  | 'consultant'
  | 'investor'
  | 'accountant'
  | 'cashier'
  | 'sales_lead'
  | 'observer';

export type DashboardRole = TeamRole; // alias rétro-compatible

export const TEAM_ROLE_DEFINITIONS: Record<TeamRole, { label: string; description: string }> = {
  admin: {
    label: 'Administrateur',
    description: 'Responsable global de la ferme. Les accès restent définis par modules cochés.',
  },
  manager: {
    label: 'Gestionnaire de ferme',
    description: 'Supervise les opérations. Les modules doivent être attribués explicitement.',
  },
  production_lead: {
    label: 'Responsable production',
    description: 'Pilote la production, le cheptel et l’alimentation selon les modules autorisés.',
  },
  technician: {
    label: 'Technicien(ne)',
    description: 'Saisie quotidienne terrain selon les modules autorisés.',
  },
  consultant: {
    label: 'Consultant',
    description: 'Conseil et lecture des données autorisées.',
  },
  investor: {
    label: 'Investisseur',
    description: 'Suivi stratégique et financier selon les modules autorisés.',
  },
  accountant: {
    label: 'Comptable',
    description: 'Comptabilité, achats, ventes et fournisseurs selon autorisations.',
  },
  cashier: {
    label: 'Caissier',
    description: 'Encaissement des ventes et reçus selon autorisations.',
  },
  sales_lead: {
    label: 'Responsable des ventes',
    description: 'Ventes, clients, factures et rapports commerciaux selon autorisations.',
  },
  observer: {
    label: 'Observateur',
    description: 'Consultation limitée aux modules explicitement attribués.',
  },
};

// Alias rétro-compatible pour les imports existants.
export const DASHBOARD_ROLE_DEFINITIONS = TEAM_ROLE_DEFINITIONS;

const ALL_MODULES = [
  'dashboard','performance-alerts','iot','units','environment','infrastructure','livestock','feeding','health',
  'reproduction','production','accounting','economics','sales','purchases','suppliers',
  'hr','reports','analytics','planning','aqua-assistant','support','settings','team',
];

// Compatibilité historique : les rôles ne donnent plus de modules automatiquement.
export const computeAllowedModulesFromDashboards = (
  roles: TeamRole[] | null | undefined,
): Set<string> => {
  return new Set<string>();
};

export const computeAllowedModulesFromRoles = computeAllowedModulesFromDashboards;

export const isValidDashboardRole = (value: unknown): value is TeamRole =>
  typeof value === 'string' && value in TEAM_ROLE_DEFINITIONS;
