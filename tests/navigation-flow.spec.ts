import { expect, test } from '@playwright/test';

const modules = [
  { id: 'units', text: /unités|production/i },
  { id: 'infrastructures', text: /infrastructure/i },
  { id: 'livestock', text: /cheptel|lot/i },
  { id: 'aquafeed', text: /aqua ?feed|aliment/i },
  { id: 'dashboard', text: /tableau de bord|dashboard/i },
];

test.describe('navigation résiliente', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (error) => {
      if (error.message.includes('removeChild')) throw error;
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('removeChild')) {
        throw new Error(msg.text());
      }
    });
  });

  test('chaque module demandé par URL affiche son contenu sans écran figé', async ({ page }) => {
    for (const mod of modules) {
      await page.goto(`/dashboard${mod.id === 'dashboard' ? '' : `?module=${mod.id}`}`);
      await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', mod.id);
      await expect(page.locator('body')).toContainText(mod.text);
    }
  });

  test('parcours unité → infrastructure → lot puis navigation sans removeChild', async ({ page }) => {
    await page.goto('/dashboard?module=units');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'units');

    await page.goto('/dashboard?module=infrastructures');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'infrastructures');

    await page.goto('/dashboard?module=livestock');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'livestock');

    await page.goto('/dashboard?module=aquafeed');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'aquafeed');
    await expect(page.locator('body')).not.toContainText('Failed to execute');
  });
});