import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs', 'umd'],
      name: 'ziMuTracker',
      fileName: 'ziMuTracker',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },
});
