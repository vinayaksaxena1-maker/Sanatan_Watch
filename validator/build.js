/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerMockPath = path.resolve(__dirname, 'workerMock.ts');

console.log('[Build] Starting validation engine compilation...');

esbuild.build({
  entryPoints: [path.resolve(__dirname, 'validateEngineV2.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: path.resolve(__dirname, 'validateEngineV2.js'),
  external: ['swisseph-wasm'],
  plugins: [{
    name: 'worker-alias',
    setup(build) {
      // Intercept the browser worker bundle query and map it to Node mock file
      build.onResolve({ filter: /astroWorker\?worker&inline$/ }, () => {
        return { path: workerMockPath };
      });
    }
  }]
}).then(() => {
  console.log('[Build] Compilation complete. Output: validator/validateEngineV2.js');
}).catch((e) => {
  console.error('[Build] Compilation failed:', e);
  process.exit(1);
});
