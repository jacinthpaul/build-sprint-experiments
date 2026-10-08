import { test, expect } from '@playwright/test';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInvitation, requestInvitation, approveInvitation } from './share-invitation';

// Opt in because this test uses paid models. All accounts and policy facts are fictional.
if (process.env.KOSH_TEST_VOICE_WAV) test.use({ launchOptions: { args: [
  '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
  `--use-file-for-fake-audio-capture=${process.env.KOSH_TEST_VOICE_WAV}`,
] } });
const url = readFileSync('.env.local', 'utf8').match(/^CONVEX_URL=(.+)$/m)![1].trim();
async function signup(page: any, email: string) {
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('Kosh-demo-password-2026');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
}
async function clientFor(page: any) {
  const token = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(k => k.startsWith('__convexAuthJWT'));
    return key ? localStorage.getItem(key) : null;
  });
  expect(token).toBeTruthy();
  const client = new ConvexHttpClient(url); client.setAuth(token!); return client;
}

test('shared family AI cites current sources, translates, drafts, and keeps the conversation private', async ({ page, browser }) => {
  test.skip(process.env.KOSH_TEST_AI !== 'true', 'Set KOSH_TEST_AI=true to check live AI.');
  test.setTimeout(420000);
  const stamp = Date.now(), errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Start with one policy', exact: true }).click();
  await page.getByLabel('Policy number', { exact: true }).fill('DEMO-AI-001');
  await page.getByLabel('Where the hard or soft copy is kept', { exact: true }).fill('Blue folder in the study');
  await page.getByLabel('Coverage amount', { exact: false }).fill('2500000');
  await page.getByRole('button', { name: 'Share policy', exact: true }).click();
  await page.getByRole('button', { name: 'Create private link', exact: true }).click();
  await signup(page, `kosh-ai-owner-${stamp}@example.com`);
  await expect(page.getByRole('button', { name: 'Create family invitation', exact: true })).toBeVisible({ timeout: 30000 });
  const policyId = new URLSearchParams(new URL(page.url()).hash.slice(1)).get('id')! as any;
  const ctx = await browser.newContext({ baseURL: new URL(page.url()).origin, viewport: { width: 390, height: 844 }, permissions: ['microphone'] });
  const family = await ctx.newPage(); family.on('pageerror', e => errors.push(e.message));
  await family.goto('/#screen=family');
  await family.getByRole('button', { name: 'New to Kosh? Create account' }).click();
  await signup(family, `kosh-ai-family-${stamp}@example.com`);
  await expect(family.getByRole('heading', { name: 'Information shared with you', exact: true })).toBeVisible({ timeout: 30000 });
  const invitation = await createInvitation(page, 'AI Test Family');
  await requestInvitation(family, invitation);
  await approveInvitation(page, `kosh-ai-family-${stamp}@example.com`);
  const link = await page.getByLabel('Policy link', { exact: true }).inputValue();
  await family.goto(link);
  await expect(family.getByRole('button', { name: 'Ask Kosh', exact: true })).toBeEnabled({ timeout: 30000 });
  const entry = await family.getByRole('button', { name: 'Ask Kosh', exact: true }).boundingBox();
  expect(entry!.y + entry!.height).toBeLessThan(844);
  await family.screenshot({ path: 'verification/family-ai-entry-mobile.png' });
  await family.setViewportSize({ width: 1440, height: 900 });
  await family.screenshot({ path: 'verification/family-ai-entry-desktop.png' });
  await family.setViewportSize({ width: 390, height: 844 });
  await expect(family.getByRole('button', { name: 'What should I do first?', exact: true })).toBeEnabled({ timeout: 30000 });
  await family.getByRole('button', { name: 'Translate answer', exact: true }).click();
  await family.getByLabel('Insurer name', { exact: false }).fill('LIC');
  await family.getByLabel('What happened?', { exact: false }).selectOption('Death');
  const client = await clientFor(family), owner = await clientFor(page);
  const conversation = () => client.query(api.familyAiData.messages, { policyId });
  await expect(family.getByRole('button', { name: 'What should I do first?', exact: true })).toBeEnabled({ timeout: 30000 });
  console.log('Checking real sourced claim guidance...');
  await family.getByRole('button', { name: 'Ask Kosh', exact: true }).click();
  await expect.poll(async () => { const h = await conversation(); return !h?.busy ? h?.messages.filter(m => m.role === 'assistant').length : 0; }, { timeout: 120000 }).toBe(1);
  const first = (await conversation())!.messages.find(m => m.role === 'assistant')!;
  expect(first.text.length).toBeGreaterThan(50); expect(first.searched).toBe(true);
  expect(first.text).toContain('DEMO-AI-001');
  expect(first.sources.some(s => new URL(s.url).hostname.endsWith('licindia.in'))).toBe(true);
  expect(first.checkedAt).toBeGreaterThan(Date.now() - 180000);
  await expect(family.getByText('Web sources checked', { exact: false })).toBeVisible();
  expect((await owner.query(api.familyAiData.messages, { policyId }))!.messages).toEqual([]);
  await family.reload();
  await expect(family.locator('.ai-message.assistant')).toHaveCount(1);
  // Translate known facts; keeping policy identifiers and amounts matters more than a word-for-word snapshot.
  console.log('Checking Telugu translation preserves policy facts...');
  const translated = await client.action(api.familyAi.ask, { policyId, question: 'Translate this saved policy summary into Telugu: policy DEMO-AI-001; coverage amount INR 2500000; hard copy in Blue folder in the study. Coverage and payout are unconfirmed. Preserve the exact policy identifier and amount.', mode: 'translate', insurer: 'LIC', country: 'India', situation: 'Death', language: 'Telugu' });
  expect(translated.ok).toBe(true);
  const translation = (await conversation())!.messages.filter(m => m.role === 'assistant').at(-1)!;
  expect(translation.text).toMatch(/[\u0c00-\u0c7f]/); expect(translation.text).toContain('DEMO-AI-001');
  expect(translation.text.replace(/[,\s]/g, '')).toContain('2500000'); expect(translation.searched).toBe(false);
  console.log('Checking escalation draft uses missing-fact placeholders...');
  await family.getByLabel('Insurer name', { exact: false }).fill('LIC');
  await family.getByLabel('Your question', { exact: true }).fill('Draft a polite escalation asking for the status of my claim. I have not supplied any dates, claim reference or prior contacts. Use placeholders for missing facts. Do not send it.');
  await family.getByRole('button', { name: 'Draft an escalation', exact: true }).click();
  await expect.poll(async () => { const h = await conversation(); return !h?.busy ? h?.messages.filter(m => m.role === 'assistant').length : 0; }, { timeout: 120000 }).toBe(3);
  const draft = (await conversation())!.messages.filter(m => m.role === 'assistant').at(-1)!;
  expect(draft.text).toMatch(/subject/i);
  // AI can leave the requested history field unbracketed; unknown events must still stay unknown.
  expect(draft.text).toMatch(/\[[^\]]*(reference|date)[^\]]*\]|Describe the issue and any steps you have taken, with dates/i);
  expect(draft.text).toMatch(/\[Your name\]/i); expect(draft.text).not.toContain('This answer was cut short.');
  expect(draft.text).not.toMatch(/I (?:have |had )?(?:submitted|sent|contacted|called)|have not received|haven.t (?:received|heard)/i);
  await expect(family.getByRole('alert')).toHaveCount(0);
  writeFileSync('verification/live-ai-answers.json', JSON.stringify(await conversation(), null, 2));
  if (process.env.KOSH_TEST_VOICE_WAV) {
    console.log('Checking browser voice recording and real transcription...');
    // Hold microphone permission until the UI has shown an honest starting state.
    await family.evaluate(() => {
      const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async constraints => {
        await new Promise<void>(resolve => { (window as any).startTestMicrophone = resolve; });
        return getUserMedia(constraints);
      };
    });
    await family.getByRole('button', { name: 'Speak your question', exact: true }).click();
    await expect(family.getByRole('button', { name: 'Starting microphone…', exact: true })).toBeDisabled();
    await expect(family.getByRole('button', { name: 'Stop recording', exact: true })).toHaveCount(0);
    await family.evaluate(() => (window as any).startTestMicrophone());
    await expect(family.getByRole('button', { name: 'Stop recording', exact: true })).toBeVisible();
    // Let the synthetic microphone finish its single short sentence.
    await family.waitForTimeout(4500);
    await family.getByRole('button', { name: 'Stop recording', exact: true }).click();
    await expect(family.getByLabel('Your question', { exact: true })).toHaveValue(/where.*policy.*doc/i, { timeout: 90000 });
    expect((await conversation())!.messages.filter(m => m.role === 'assistant')).toHaveLength(3);
    await expect(family.getByRole('button', { name: 'Send question', exact: true })).toBeEnabled();
  }
  expect(await family.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await family.screenshot({ path: 'verification/live-ai-mobile.png', fullPage: true });
  await family.setViewportSize({ width: 1440, height: 900 });
  await family.screenshot({ path: 'verification/live-ai-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Remove access for AI Test Family', exact: true }).click();
  await page.getByRole('button', { name: 'Remove access', exact: true }).click();
  await expect(family.getByRole('heading', { name: 'This policy isn’t shared with your account.' })).toBeVisible();
  expect(await conversation()).toBeNull();
  expect(errors).toEqual([]); await ctx.close();
});

test('stopping read aloud does not show a playback error', async ({ page }) => {
  await page.goto('/#screen=demo');
  await page.getByRole('button', { name: 'See first-step example', exact: true }).click();
  await page.getByRole('button', { name: 'Read aloud', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.speechSynthesis.speaking)).toBe(true);
  await page.getByRole('button', { name: 'Stop reading', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.speechSynthesis.speaking)).toBe(false);
  await expect(page.getByRole('button', { name: 'Read aloud', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
