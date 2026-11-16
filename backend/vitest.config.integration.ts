import { defineConfig } from 'vitest/config';
import { integrationEnvironment } from './test/support/test-database.js';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.int-spec.ts', 'test/**/*.int-spec.ts'],
    env: integrationEnvironment(),
    globalSetup: ['./test/support/integration-global-setup.ts'],
    // Os arquivos compartilham o mesmo banco: rodam um de cada vez.
    fileParallelism: false,
    hookTimeout: 60_000,
  },
});
