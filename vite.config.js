import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
  },
  closeBundle: () => {
    try {
      copyFileSync('./_redirects', './dist/_redirects');
      console.log('✅ Copied _redirects to dist/');
    } catch (err) {
      console.warn('⚠️ Failed to copy _redirects:', err.message);
    }
  }
});
