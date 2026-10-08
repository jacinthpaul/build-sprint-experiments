import type { Page } from '@playwright/test';

export async function captureViewport(page: Page, file: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.screenshot({ path: `.impeccable/review/${file}.png`, fullPage: true });
}
