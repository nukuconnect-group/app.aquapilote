import { describe, expect, it } from 'vitest';
import { computeAllowedModulesFromDashboards } from '@/lib/dashboardRoles';

describe('dashboardRoles access', () => {
  it('autorise ventes et achats pour le tableau administration', () => {
    const modules = computeAllowedModulesFromDashboards(['administration']);
    expect(modules.has('sales')).toBe(true);
    expect(modules.has('purchases')).toBe(true);
    expect(modules.has('accounting')).toBe(true);
    expect(modules.has('livestock')).toBe(false);
  });

  it('autorise seulement les modules terrain pour le tableau production', () => {
    const modules = computeAllowedModulesFromDashboards(['production']);
    expect(modules.has('livestock')).toBe(true);
    expect(modules.has('feeding')).toBe(true);
    expect(modules.has('sales')).toBe(false);
    expect(modules.has('accounting')).toBe(false);
  });

  it('fusionne correctement les deux tableaux de bord', () => {
    const modules = computeAllowedModulesFromDashboards(['production', 'administration']);
    expect(modules.has('livestock')).toBe(true);
    expect(modules.has('sales')).toBe(true);
    expect(modules.has('accounting')).toBe(true);
  });
});