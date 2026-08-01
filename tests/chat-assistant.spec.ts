import { expect, test, type Page } from '@playwright/test';

const CHAT_URL = '/dashboard?e2eDemo=1&module=aqua-assistant';
const FUNCTION_URL = '**/functions/v1/aqua-assistant';

const sseBody = (text: string) =>
  [
    `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}`,
    '',
    'data: [DONE]',
    '',
  ].join('\n');

// Session Supabase factice : le mode démo E2E n'ouvre pas de session,
// or le chat exige un jeton avant d'appeler l'edge function.
const FAKE_SESSION = {
  access_token: 'e2e-fake-access-token',
  refresh_token: 'e2e-fake-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'demo-user', email: 'demo@aquapilot.com', aud: 'authenticated', role: 'authenticated' },
};

const openChat = async (page: Page) => {
  await page.addInitScript(
    ([key, session]) => window.localStorage.setItem(key as string, session as string),
    ['aqua-pilot-auth', JSON.stringify(FAKE_SESSION)] as const,
  );
  await page.goto(CHAT_URL);
  await expect(page.locator('[data-chat-input]').first()).toBeVisible();
};

const input = (page: Page) => page.locator('[data-chat-input]').first();
const sendButton = (page: Page) => page.locator('[data-chat-send]').first();
const errorPanel = (page: Page) => page.locator('[data-chat-error]').first();

test.describe('Aqua Assistant — robustesse du chat', () => {
  test('un message vide n\u2019est jamais envoyé au serveur', async ({ page }) => {
    let calls = 0;
    await page.route(FUNCTION_URL, async (route) => {
      calls += 1;
      await route.fulfill({ status: 200, body: sseBody('ok') });
    });

    await openChat(page);

    // Bouton cliqué sans saisie
    await sendButton(page).click();
    await expect(errorPanel(page)).toHaveAttribute('data-chat-error', 'validation');
    await expect(errorPanel(page)).toContainText(/vide/i);

    // Uniquement des espaces + touche Entrée
    await input(page).fill('     ');
    await input(page).press('Enter');
    await expect(errorPanel(page)).toHaveAttribute('data-chat-error', 'validation');

    await page.waitForTimeout(500);
    expect(calls).toBe(0);
  });

  test('le panneau d\u2019erreur affiche request_id et route, puis la conversation reprend', async ({ page }) => {
    let calls = 0;
    await page.route(FUNCTION_URL, async (route) => {
      calls += 1;
      if (calls === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Panne simulée du service IA' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: sseBody('Réponse de reprise'),
      });
    });

    await openChat(page);
    await input(page).fill('Combien nourrir mes poissons ?');
    await sendButton(page).click();

    const panel = errorPanel(page);
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await expect(panel).toContainText('Panne simulée du service IA');

    // Diagnostic : identifiant de requête + route
    await expect(panel.locator('[data-chat-request-id]')).toContainText(/^req_/);
    await expect(panel.locator('[data-chat-route]')).toContainText('/dashboard');
    await expect(panel).toContainText(/tentative 1\/4/);

    // Backoff progressif : le bouton est temporairement désactivé
    const retry = panel.getByRole('button', { name: /Réessayer/ });
    await expect(retry).toBeDisabled();
    await expect(retry).toContainText(/Réessayer dans \d+s/);

    // Le backoff détaillé et l'arrêt après MAX_CHAT_ATTEMPTS sont couverts de
    // façon déterministe par src/lib/chatErrors.test.ts.
    expect(calls).toBe(1);
  });

  test('la limite de débit client bloque les envois rapprochés', async ({ page }) => {
    let calls = 0;
    await page.route(FUNCTION_URL, async (route) => {
      calls += 1;
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body: sseBody('ok') });
    });

    await openChat(page);
    await input(page).fill('Premier message');
    await sendButton(page).click();
    await expect(page.locator('body')).toContainText('ok', { timeout: 20_000 });

    await input(page).fill('Deuxième message immédiat');
    await sendButton(page).click();

    await expect(errorPanel(page)).toHaveAttribute('data-chat-error', 'rate_limit');
    await expect(errorPanel(page)).toContainText(/trop rapide|Patientez/i);
    expect(calls).toBe(1);
  });
});
