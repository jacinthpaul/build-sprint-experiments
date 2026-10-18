import { test, expect } from '@playwright/test';
import { ConvexHttpClient } from 'convex/browser';
import { readFileSync } from 'node:fs';
import { api } from '../convex/_generated/api';

// Reuse one fictional account so repeated verification never inflates the total.
const email = 'kosh-keep99-proof@example.com';
const password = 'Kosh-demo-password-2026';
const thanks = 'Thank you. Your request for a payment link has been saved. No payment has been taken.';

test('a signed-in user can tap Keep Kosh twice and is recorded only once', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Keep Kosh for ₹99/year', exact: true })).toBeEnabled();
  await expect(page.getByText('Sign in, then tap to request a payment link. No payment is taken now.')).toBeVisible();
  await page.getByRole('button', { name: 'Keep Kosh for ₹99/year', exact: true }).click();
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('main')).toContainText(/Your saved policies|Sign-in didn’t finish/, { timeout: 30000 });
  if (!await page.getByRole('heading', { name: 'Your saved policies', exact: true }).isVisible()) {
    await page.getByRole('button', { name: 'New to Kosh? Create account', exact: true }).click();
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Your saved policies', exact: true })).toBeVisible({ timeout: 30000 });
  const button = page.getByRole('button', { name: 'Keep Kosh for ₹99/year', exact: true });
  await expect(button).toBeVisible();
  const url = readFileSync('.env.local', 'utf8').match(/^CONVEX_URL=(.+)$/m)![1].trim();
  const token = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(k => k.startsWith('__convexAuthJWT'));
    return key ? localStorage.getItem(key) : null;
  });
  expect(token).toBeTruthy();
  const client = new ConvexHttpClient(url); client.setAuth(token!);
  const account = await client.query(api.insurance.account, {});
  const before = await client.query(api.keepKosh.mine, {});
  const started = Date.now();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByText('Sign in, then tap to request a payment link. No payment is taken now.')).toHaveCount(0);
  await button.click();
  await expect(page.getByRole('status')).toHaveText(thanks);
  const first = await client.query(api.keepKosh.mine, {});
  expect(first?.userId).toBe(account?.id);
  if (!before) expect(first!.tappedAt).toBeGreaterThanOrEqual(started);
  await page.getByRole('button', { name: 'Open my saved policies', exact: true }).click();
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toBeEnabled();
  await expect(page.getByRole('status')).toHaveText(thanks);
  expect(await client.query(api.keepKosh.mine, {})).toEqual(first);
  await page.reload();
  await expect(page.getByRole('status')).toHaveText(thanks);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(thanks);
  const anonymous = new ConvexHttpClient(url);
  await expect(anonymous.mutation(api.keepKosh.tap, {})).rejects.toThrow(/Sign in/);
  expect(await anonymous.query(api.keepKosh.mine, {})).toBeNull();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'verification/keep-kosh-home-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'verification/keep-kosh-home-desktop.png', fullPage: true });
});
