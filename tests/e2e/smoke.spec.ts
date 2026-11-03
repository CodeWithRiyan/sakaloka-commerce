import { expect, test } from '@playwright/test';

test('home page renders the Bootstrap layout in brand red', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const primary = page.locator('.btn-primary').first();
  await expect(primary).toHaveCSS('background-color', 'rgb(218, 77, 77)');
});

test('health endpoint reports the local database and disk storage', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    status: 'ok',
    database: { kind: 'sqlite-file', ok: true },
    storage: { driver: 'disk' },
  });
});
