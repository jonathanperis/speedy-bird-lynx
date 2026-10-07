import { withLynxConfig } from '@lynx-js/react/testing-library/rstest-config';
import { defineConfig } from '@rstest/core';

// jsdom, which the Lynx testing environment builds on, does not run on Bun.
if (process.versions.bun) {
  throw new Error('Run the tests with Node.js >= 22.12; `node` currently resolves to Bun on PATH.');
}

// Reuses lynx.config.ts so tests compile main-thread functions and shared modules the
// same way the app bundle does.
export default defineConfig({
  extends: withLynxConfig(),
  include: ['tests/**/*.test.{ts,tsx}'],
});
