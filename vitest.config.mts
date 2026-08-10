import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/web/src/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@laxvaletcare/shared': path.resolve(dirname, 'packages/shared/src/index.ts'),
      '@laxvaletcare/config': path.resolve(dirname, 'packages/config/src/index.ts'),
      '@/lib': path.resolve(dirname, 'apps/web/src/lib'),
    },
  },
});
