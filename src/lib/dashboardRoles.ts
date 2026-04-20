// Source de vérité unique des 2 tableaux de bord spécialisés assignables
// aux membres d'équipe.

export type DashboardRole = 'production' | 'administration';

export const DASHBOARD_ROLE_DEFINITIONS: Record<
  DashboardRole,
  { label: string; description: string; modules: string[] }
> = {
  production: {
    label: 'Production / Terrain',
    description:
      'Centre IoT, infrastructures, cheptel, alimentation, santé et production. Permet la saisie quotidienne des données terrain.',
    modules: [
      'dashboard',
      'iot',
      'environment',
      'infrastructure',
      'livestock',
      'feeding',
      'health',
      'production',
      'support',
      'settings',
    ],
  },
  administration: {
    label: 'Administration / Finance',
    description:
      'Comptabilité, ventes, achats, fournisseurs, RH & paie, AquaAssistant, rapports et planification.',
    modules: [
      'dashboard',
      'accounting',
      'sales',
      'purchases',
      'suppliers',
      'hr',
      'aqua-assistant',
      'reports',
      'analytics',
      'planning',
      'support',
      'settings',
    ],
  },
};

// Calcule l'union des modules autorisés pour un ensemble de rôles dashboard.
export const computeAllowedModulesFromDashboards = (
  roles: DashboardRole[] | null | undefined,
): Set<string> => {
  const modules = new Set<string>(['dashboard', 'settings', 'support']);
  (roles ?? []).forEach((role) => {
    DASHBOARD_ROLE_DEFINITIONS[role]?.modules.forEach((m) => modules.add(m));
  });
  return modules;
};

export const isValidDashboardRole = (value: unknown): value is DashboardRole =>
  value === 'production' || value === 'administration';
