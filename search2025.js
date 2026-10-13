import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function searchAll() {
  const swe = new SwissEph();
  const wasmBuffer = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');
  await swe.initSwissEph({
    wasmBinary: wasmBuffer,
    getPreloadedPackage: () => new ArrayBuffer(0)
  });
  swe.set_sid_mode(1, 0, 0);

  const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

  // Search 2024 to 2026
  const start = new Date('2024-01-01T00:00:00Z');
  for (let i = 0; i < 365 * 3; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const jdQuery = (d.getTime() / 86400000) + 2440587.5;
    const sunPos = swe.calc_ut(jdQuery, 0, 2 | 256);
    const moonPos = swe.calc_ut(jdQuery, 1, 2 | 256);
    const ayanamsa = swe.get_ayanamsa(jdQuery);
    const sunSidereal = (sunPos[0] - ayanamsa + 360) % 360;
    const moonSidereal = (moonPos[0] - ayanamsa + 360) % 360;
    const diffNorm = (moonSidereal - sunSidereal + 360) % 360;
    const tithiIdx = Math.floor(diffNorm / 12);
    const naksIdx = Math.floor(moonSidereal / 13.333333333333334);
    const sunNaksIdx = Math.floor(sunSidereal / 13.333333333333334);

    if (tithiIdx === 0 && nakshatras[naksIdx] === "Uttara Bhadrapada") {
      console.log(`FOUND MATCH: ${d.toISOString().split('T')[0]} (Moon: ${nakshatras[naksIdx]}, Sun: ${nakshatras[sunNaksIdx]})`);
    }
  }
}

searchAll();
