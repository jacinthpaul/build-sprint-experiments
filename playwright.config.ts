import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', workers: 1, reporter: 'list', use: { baseURL: process.env.KOSH_TEST_URL || 'http://127.0.0.1:5173', channel: 'msedge', headless: true, actionTimeout: 15000 }, outputDir: 'verification/test-results' });
