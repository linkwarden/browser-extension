import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/pages/Background/index.ts'),
        options: path.resolve(__dirname, 'src/pages/Options/options.html'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
