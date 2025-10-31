import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';

    return {
      server: {
        port: 4000,
        host: '0.0.0.0',
        strictPort: false,
      },
      plugins: [
        react(),
        // Bundle analyzer - genera stats.html en el build
        isProduction && visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env['GEMINI_API_KEY']),
        'process.env.GEMINI_API_KEY': JSON.stringify(env['GEMINI_API_KEY']),
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: isProduction ? false : true,
        rollupOptions: {
          output: {
            manualChunks: {
              // Separar vendors grandes en chunks independientes
              'react-vendor': ['react', 'react-dom'],
              'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
              'pdf-export': ['jspdf', 'html2canvas'],
              'pptx-export': ['pptxgenjs'],
            }
          }
        },
        chunkSizeWarningLimit: 1000,
      }
    };
});
