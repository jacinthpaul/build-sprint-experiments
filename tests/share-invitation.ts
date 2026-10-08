import { expect, type Page } from '@playwright/test';

export async function createInvitation(page: Page, name: string) {
  if (!await page.getByLabel('Recipient name', { exact: true }).isVisible()) {
    await page.getByText('Invite another family member', { exact: true }).click();
  }
  await page.getByLabel('Recipient name', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Create family invitation', exact: true }).click();
  const invitation = page.getByRole('region', { name: `Invitation for ${name}`, exact: true });
  await expect(invitation.getByLabel('Invitation link', { exact: true })).not.toHaveValue('', { timeout: 30000 });
  return invitation.getByLabel('Invitation link', { exact: true }).inputValue();
}
export async function requestInvitation(page: Page, link: string) {
  await page.goto(link);
  await page.getByRole('button', { name: 'Request access', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Waiting for confirmation', exact: true })).toBeVisible();
}
export async function approveInvitation(page: Page, email: string) {
  await page.getByRole('button', { name: `Approve access for ${email}`, exact: true }).click();
  await expect(page.getByRole('status')).toContainText('can now access');
}
