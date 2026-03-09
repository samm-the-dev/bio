import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { exec } from 'child_process';
import path from 'path';

function contentHmr(): Plugin {
  return {
    name: 'content-hmr',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(path.resolve(__dirname, 'content'));
      let debounce: ReturnType<typeof setTimeout>;
      server.watcher.on('all', (_event, file) => {
        if (!file.includes(path.resolve(__dirname, 'content'))) return;
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          server.config.logger.info('content changed, rebuilding…', { timestamp: true });
          exec('node scripts/fetch-content.mjs --drafts', (err) => {
            if (err) server.config.logger.error(`content build failed: ${err.message}`);
          });
        }, 300);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), mkcert(), contentHmr()],
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
