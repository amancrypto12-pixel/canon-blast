import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    assetsDir: 'assets',
    outDir: 'dist'
  },
  server: {
    port: 3000
  }
});
