import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import { exec } from 'child_process';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

function gifInfo(): Plugin {
  return {
    name: 'gif-info',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__gif-info', async (req, res) => {
        const sharp = require('sharp');
        const url = new URL(req.url!, 'http://localhost');
        const src = url.searchParams.get('src');
        if (!src || src.includes('..')) {
          res.statusCode = 400;
          res.end('invalid src');
          return;
        }
        const localPath = path.join(__dirname, 'public', src.replace(/^\/+/, ''));
        try {
          const meta = await sharp(localPath, { animated: true }).metadata();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ frameCount: meta.pages ?? 1 }));
        } catch {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ frameCount: 1 }));
        }
      });
    },
  };
}

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
          exec('npm run content:drafts -- --local', (err) => {
            if (err) server.config.logger.error(`content build failed: ${err.message}`);
          });
        }, 300);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), mkcert(), contentHmr(), gifInfo()],
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
