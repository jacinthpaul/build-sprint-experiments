// Downloads read the same CSS tokens as the screens; PDF sizes use points.
export function themeToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
export function pdfSize(name: string) {
  return Number(themeToken(`--pdf-${name}-size`));
}

export function applyBrowserTheme() {
  const primary = themeToken('--primary');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', primary);
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${primary}"/><path d="M9 7v18m1-8L22 7M10 17l12 8" fill="none" stroke="${themeToken('--surface')}" stroke-width="3"/></svg>`;
  document.querySelector('link[rel="icon"]')?.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(icon)}`);
}
