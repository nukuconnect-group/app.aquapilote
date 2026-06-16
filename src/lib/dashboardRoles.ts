// RBAC unifié : un seul tableau de bord pour tous les utilisateurs, l'affichage
// des modules est piloté par les rôles attribués au membre (multi-rôles).
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

export const TEAM_ROLE_DEFINITIONS: Record<
  TeamRole,
  { label: string; description: string; modules: string[] }
> = {
  admin: {
    label: 'Administrateur',
    description: 'Accès complet à tous les modules et paramètres.',
    modules: ['*'],
  },
  manager: {
    label: 'Gestionnaire de ferme',
    description: 'Supervise toutes les opérations de la ferme.',
    modules: [
      'dashboard','iot','environment','infrastructure','livestock','feeding','health',
      'production','accounting','sales','purchases','suppliers','hr','reports',
      'analytics','planning','aqua-assistant','support','settings',
    ],
  },
  production_lead: {
    label: 'Responsable production',
    description: 'Pilote la production, le cheptel et l’alimentation.',
    modules: ['dashboard','iot','environment','infrastructure','livestock','feeding','health','production','planning','reports','support'],
  },
  technician: {
    label: 'Technicien(ne)',
    description: 'Saisie quotidienne terrain : IoT, alimentation, santé.',
    modules: ['dashboard','iot','environment','infrastructure','livestock','feeding','health','support'],
  },
  consultant: {
    label: 'Consultant',
    description: 'Lecture des données et accès aux rapports/AquaAssistant.',
    modules: ['dashboard','reports','analytics','aqua-assistant','iot','environment','support'],
  },
  investor: {
    label: 'Investisseur',
    description: 'Vue financière et performance globale.',
    modules: ['dashboard','reports','analytics','accounting','support'],
  },
  accountant: {
    label: 'Comptable',
    description: 'Comptabilité, achats, ventes et fournisseurs.',
    modules: ['dashboard','accounting','sales','purchases','suppliers','reports','support'],
  },
  cashier: {
    label: 'Caissier',
    description: 'Encaissement des ventes et reçus.',
    modules: ['dashboard','sales','support'],
  },
  sales_lead: {
    label: 'Responsable des ventes',
    description: 'Ventes, clients, factures et rapports commerciaux.',
    modules: ['dashboard','sales','purchases','suppliers','reports','support'],
  },
  observer: {
    label: 'Observateur',
    description: 'Lecture seule du tableau de bord.',
    modules: ['dashboard','support'],
  },
};

// Alias rétro-compatible pour les imports existants.
export const DASHBOARD_ROLE_DEFINITIONS = TEAM_ROLE_DEFINITIONS;

const ALL_MODULES = [
  'dashboard','iot','environment','infrastructure','livestock','feeding','health',
  'reproduction','production','accounting','economics','sales','purchases','suppliers',
  'hr','reports','analytics','planning','aqua-assistant','support','settings','team',
];

// Calcule l'union des modules autorisés pour un ensemble de rôles.
export const computeAllowedModulesFromDashboards = (
  roles: TeamRole[] | null | undefined,
): Set<string> => {
  const modules = new Set<string>(['dashboard', 'support']);
  (roles ?? []).forEach((role) => {
    const def = TEAM_ROLE_DEFINITIONS[role];
    if (!def) return;
    if (def.modules.includes('*')) {
      ALL_MODULES.forEach((m) => modules.add(m));
    } else {
      def.modules.forEach((m) => modules.add(m));
    }
  });
  return modules;
};

export const computeAllowedModulesFromRoles = computeAllowedModulesFromDashboards;

export const isValidDashboardRole = (value: unknown): value is TeamRole =>
  typeof value === 'string' && value in TEAM_ROLE_DEFINITIONS;
