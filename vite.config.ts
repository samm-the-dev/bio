import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';
import { execSync } from 'child_process';

function contentHmr(): Plugin {
  return {
    name: 'content-hmr',
    configureServer(server) {
      server.watcher.add(path.resolve(__dirname, 'content.jsonc'));
      server.watcher.on('change', (file) => {
        if (file.endsWith('content.jsonc')) {
          execSync('node scripts/inject-content.mjs', { cwd: __dirname, stdio: 'inherit' });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), mkcert(), contentHmr()],
  // Base path: Update for GitHub Pages or other deployments
  // '/<repo-name>/' for GitHub Pages, '/' for local dev
  base: command === 'build' ? '/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
}));
