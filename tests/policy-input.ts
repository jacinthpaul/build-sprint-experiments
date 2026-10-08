import type { Page } from '@playwright/test';

// Reserved fictional US phone number; tests never make an outbound call.
export async function fillRequiredPolicy(page: Page, insurer = 'Demo Insurance', contact = 'Demo claims team') {
  await page.getByLabel('Insurance company', { exact: true }).fill(insurer);
  await page.getByLabel('Contact name', { exact: true }).fill(contact);
  await page.getByLabel('Contact phone number', { exact: true }).fill('+1 202 555 0123');
}
