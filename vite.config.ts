import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';

// Simple plugin to copy manifest file
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      try {
        mkdirSync('dist', { recursive: true });

        // Check environment variable or default to chromium
        const browser = process.env.BROWSER || 'chromium';
        const manifestPath = `${browser}/manifest.json`;

        copyFileSync(manifestPath, 'dist/manifest.json');
        console.log(`Manifest copied successfully for ${browser}`);
      } catch (error) {
        console.error('Error copying manifest:', error);
      }
    }
  };
};

export default defineConfig({
  plugins: [react(), copyManifest()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        options: path.resolve(__dirname, 'src/pages/Options/options.html'),
        background: path.resolve(__dirname, 'src/pages/Background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
