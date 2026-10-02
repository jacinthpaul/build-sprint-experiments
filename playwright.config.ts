import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', workers: 1, reporter: 'list', use: { baseURL: 'http://127.0.0.1:5173', channel: 'msedge', headless: true }, outputDir: 'verification/test-results' });
