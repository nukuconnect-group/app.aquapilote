import { test, expect } from '@playwright/test';
const FAKE_SESSION = { access_token:'e2e', refresh_token:'r', token_type:'bearer', expires_in:3600, expires_at: Math.floor(Date.now()/1000)+3600, user:{id:'demo-user',email:'d@e.com',aud:'authenticated',role:'authenticated'} };
test('dbg', async ({ page }) => {
  await page.route('**/functions/v1/aqua-assistant', r => r.fulfill({ status:500, contentType:'application/json', body: JSON.stringify({error:'Service indisponible'}) }));
  await page.addInitScript(([k,s]) => localStorage.setItem(k as string, s as string), ['aqua-pilot-auth', JSON.stringify(FAKE_SESSION)] as const);
  await page.goto('/dashboard?e2eDemo=1&module=aqua-assistant');
  await page.locator('[data-chat-input]').first().fill('Test');
  await page.locator('[data-chat-send]').first().click();
  const panel = page.locator('[data-chat-error]').first();
  await expect(panel).toBeVisible({timeout:15000});
  for (let i=0;i<6;i++){
    await page.waitForTimeout(1500);
    console.log('T'+i, (await panel.innerText()).replace(/\n/g,' | '));
  }
});
