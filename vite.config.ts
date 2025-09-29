import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync } from 'fs';

// Simple plugin to copy manifest file
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle(options) {
      try {
        // Get browser from environment variable or default to chromium
        const browser = process.env.BROWSER || 'chromium';

        // Determine output directory from Vite's outDir setting
        const outDir = options.dir || 'dist';

        mkdirSync(outDir, { recursive: true });

        const manifestPath = `${browser}/manifest.json`;
        const outputPath = `${outDir}/manifest.json`;

        copyFileSync(manifestPath, outputPath);
        console.log(`Manifest copied successfully for ${browser} to ${outDir}`);
      } catch (error) {
        console.error('Error copying manifest:', error);
      }
    }
  };
};

export default defineConfig(({ command }) => {
  // Get browser from environment variable or default to chromium
  const browser = process.env.BROWSER || 'chromium';

  // Set output directory based on browser
  const outDir = browser === 'firefox' ? 'dist-firefox' :
                 browser === 'chromium' ? 'dist-chromium' :
                 'dist';

  return {
    plugins: [react(), copyManifest()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir,
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
  };
});
