import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

// Helper to list all files recursively
function findVideoFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (name.includes('node_modules') || name.includes('.git')) continue;
    if (fs.statSync(name).isDirectory()) {
      findVideoFiles(name, filesList);
    } else {
      filesList.push(name);
    }
  }
  return filesList;
}

const foundVideos = findVideoFiles('.');
console.log('--- ALL WORKSPACE FILES ---', foundVideos);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Phase 0: Include .se1 ephemeris binary files as static assets
    assetsInclude: ['**/*.se1', '**/*.wasm'],
    // Phase 0: Exclude swisseph-wasm from Vite pre-bundling (it handles its own WASM loading)
    optimizeDeps: {
      exclude: ['swisseph-wasm'],
    },
    worker: {
      format: 'iife',
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        // Phase 0: swisseph-wasm internally imports Node.js built-ins (url, path, module)
        // for its Node.js path-resolution branch. In the browser, Vite's browser-external
        // shim handles these safely. The warnings are harmless — suppress them here.
        external: ['url', 'path', 'module'],
        onwarn(warning, defaultHandler) {
          // Suppress "Module externalized for browser compatibility" warnings
          // for the three Node.js built-ins used by swisseph-wasm's Node.js branch.
          if (
            warning.code === 'PLUGIN_WARNING' &&
            warning.plugin === 'vite:resolve' &&
            typeof warning.message === 'string' &&
            (
              warning.message.includes('"url"') ||
              warning.message.includes('"path"') ||
              warning.message.includes('"module"')
            )
          ) {
            return; // Silently discard
          }
          defaultHandler(warning);
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Phase 0: Serve .se1 ephemeris files with correct MIME type
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  };
});
