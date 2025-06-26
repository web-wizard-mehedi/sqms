import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
  },
  // 🛠️ Runs after build: copy _redirects into dist/
  closeBundle: () => {
    try {
      copyFileSync('./_redirects', './dist/_redirects');
      console.log('✅ Copied _redirects to dist/');
    } catch (err: any) {
      console.warn('⚠️ Failed to copy _redirects:', err.message);
    }
  },
});
