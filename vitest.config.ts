import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/web/src/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@laxvaletcare/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
      '@laxvaletcare/config': path.resolve(__dirname, 'packages/config/src/index.ts'),
      '@/lib': path.resolve(__dirname, 'apps/web/src/lib'),
    },
  },
});
