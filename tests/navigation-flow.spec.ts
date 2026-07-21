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
      await page.goto(`/dashboard?e2eDemo=1${mod.id === 'dashboard' ? '' : `&module=${mod.id}`}`);
      await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', mod.id);
      await expect(page.locator('body')).toContainText(mod.text);
    }
  });

  test('parcours unité → infrastructure → lot puis navigation sans removeChild', async ({ page }) => {
    await page.goto('/dashboard?e2eDemo=1&module=units');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'units');

    await page.goto('/dashboard?e2eDemo=1&module=infrastructures');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'infrastructures');

    await page.goto('/dashboard?e2eDemo=1&module=livestock');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'livestock');

    await page.goto('/dashboard?e2eDemo=1&module=aquafeed');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'aquafeed');
    await expect(page.locator('body')).not.toContainText('Failed to execute');
  });

  test('le formulaire infrastructure reste ouvert pendant la saisie puis la navigation reste utilisable', async ({ page }) => {
    await page.goto('/dashboard?e2eDemo=1&module=infrastructures');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'infrastructures');

    await page.getByRole('button', { name: /ajouter.*infrastructure|add.*infrastructure/i }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/nom de l'infrastructure|nom.*infrastructure/i).fill('Bassin test navigation');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/nom de l'infrastructure|nom.*infrastructure/i)).toHaveValue('Bassin test navigation');

    await dialog.getByLabel(/capacité/i).fill('1200');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await page.goto('/dashboard?e2eDemo=1&module=livestock');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'livestock');

    await page.goto('/dashboard?e2eDemo=1&module=units');
    await expect(page.locator('[data-module-content]')).toHaveAttribute('data-module-content', 'units');
    await expect(page.locator('body')).not.toContainText('Failed to execute');
  });
});