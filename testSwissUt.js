import SwissEph from 'swisseph-wasm';
import WasmSwissEph from './node_modules/swisseph-wasm/wasm/swisseph.js';
import fs from 'fs';

async function test() {
  const swe = new SwissEph();
  const moduleFactory = typeof WasmSwissEph === 'function' ? WasmSwissEph : (WasmSwissEph).default || WasmSwissEph;

  const wasmBinary = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');

  swe.SweModule = await new Promise((resolve) => {
    const config = {
      wasmBinary,
      getPreloadedPackage: () => new ArrayBuffer(0),
      onRuntimeInitialized: function() {
        resolve(this);
      }
    };
    moduleFactory(config);
  });

  swe.SweModule.HEAP32 = new Int32Array(swe.SweModule.HEAPF64.buffer);
  swe.set_sid_mode(1, 0, 0);

  const jd = 2461243.28125; // 22 July 2026 IST
  console.log("calc_ut WITHOUT ephemeris files (flags = 2 | 256):");
  try {
    const sunPos = swe.calc_ut(jd, 0, 2 | 256);
    console.log("Sun Pos (flags=2):", sunPos);
  } catch (e) {
    console.error("Error with flags=2:", e.message);
  }

  console.log("\ncalc_ut WITH Moshier fallback (flags = 4 | 256):");
  try {
    const sunPosM = swe.calc_ut(jd, 0, 4 | 256);
    console.log("Sun Pos (flags=4):", sunPosM);
    const ayanamsa = swe.get_ayanamsa(jd);
    console.log("Ayanamsa:", ayanamsa);
  } catch (e) {
    console.error("Error with flags=4:", e.message);
  }
}

test();
