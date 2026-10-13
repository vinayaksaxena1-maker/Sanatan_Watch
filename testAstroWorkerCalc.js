import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function testAstroWorkerCalc() {
  const swe = new SwissEph();
  const wasmBuffer = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');
  await swe.initSwissEph({
    wasmBinary: wasmBuffer,
    getPreloadedPackage: () => new ArrayBuffer(0)
  });
  swe.set_sid_mode(1, 0, 0);

  const parsedDate = new Date(2026, 6, 22, 0, 15, 0); // 22 July 2026 local time
  const tzOffset = 5.5;

  // Exact formula in astroWorker.ts line 284:
  const jdQuery = (parsedDate.getTime() / 86400000) + 2440587.5;
  const localMs = parsedDate.getTime() + (tzOffset * 3600000);
  const localDate = new Date(localMs);
  const today0hUT = new Date(Date.UTC(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(), 0, 0, 0));
  const today0hMs = today0hUT.getTime() - (tzOffset * 3600000);
  const jdMidnight = (today0hMs / 86400000) + 2440587.5;

  console.log("parsedDate:", parsedDate.toString());
  console.log("jdQuery:", jdQuery);
  console.log("jdMidnight:", jdMidnight);

  const sunPos = swe.calc_ut(jdQuery, 0, 2 | 256);
  const moonPos = swe.calc_ut(jdQuery, 1, 2 | 256);
  const ayanamsa = swe.get_ayanamsa(jdQuery);

  const sunLon = sunPos[0];
  const moonLon = moonPos[0];

  const sunSidereal = (sunLon - ayanamsa + 360) % 360;
  const moonSidereal = (moonLon - ayanamsa + 360) % 360;

  const diffNorm = (moonSidereal - sunSidereal + 360) % 360;
  let tithiIdx = Math.floor(diffNorm / 12);
  let naksIdx = Math.floor(moonSidereal / 13.333333333333334);
  let sunNaksIdx = Math.floor(sunSidereal / 13.333333333333334);

  const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

  console.log("At 00:00:00 local time (midnight):");
  console.log("Tithi index:", tithiIdx);
  console.log("Moon Nakshatra index:", naksIdx, nakshatras[naksIdx]);
  console.log("Sun Nakshatra index:", sunNaksIdx, nakshatras[sunNaksIdx]);

  // Now test at 05:30 AM (Sunrise time):
  const sunriseDate = new Date(2026, 6, 22, 5, 30, 0);
  const jdQuerySunrise = (sunriseDate.getTime() / 86400000) + 2440587.5;
  const sunPosSr = swe.calc_ut(jdQuerySunrise, 0, 2 | 256);
  const moonPosSr = swe.calc_ut(jdQuerySunrise, 1, 2 | 256);
  const ayanamsaSr = swe.get_ayanamsa(jdQuerySunrise);
  const sunSiderealSr = (sunPosSr[0] - ayanamsaSr + 360) % 360;
  const moonSiderealSr = (moonPosSr[0] - ayanamsaSr + 360) % 360;
  const diffNormSr = (moonSiderealSr - sunSiderealSr + 360) % 360;
  let tithiIdxSr = Math.floor(diffNormSr / 12);
  let naksIdxSr = Math.floor(moonSiderealSr / 13.333333333333334);

  console.log("\nAt 05:30:00 local time (Sunrise):");
  console.log("Tithi index:", tithiIdxSr);
  console.log("Moon Nakshatra index:", naksIdxSr, nakshatras[naksIdxSr]);
}

testAstroWorkerCalc();
