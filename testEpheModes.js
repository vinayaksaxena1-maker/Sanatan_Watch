import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function testEpheModes() {
  const swe = new SwissEph();
  const wasmBuffer = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');
  await swe.initSwissEph({
    wasmBinary: wasmBuffer,
    getPreloadedPackage: () => new ArrayBuffer(0)
  });
  swe.set_sid_mode(1, 0, 0);

  const testDate = new Date('2026-07-21T17:13:00+05:30');
  const jdQuery = (testDate.getTime() / 86400000) + 2440587.5;

  console.log("--- SEFLG_SWIEPH (2 | 256) ---");
  const sun2 = swe.calc_ut(jdQuery, 0, 2 | 256);
  const moon2 = swe.calc_ut(jdQuery, 1, 2 | 256);
  const ayanamsa2 = swe.get_ayanamsa(jdQuery);
  console.log("Sun 2:", sun2[0], "Moon 2:", moon2[0]);

  console.log("\n--- SEFLG_MOSEPH (4 | 256) ---");
  const sun4 = swe.calc_ut(jdQuery, 0, 4 | 256);
  const moon4 = swe.calc_ut(jdQuery, 1, 4 | 256);
  const ayanamsa4 = swe.get_ayanamsa(jdQuery);
  console.log("Sun 4:", sun4[0], "Moon 4:", moon4[0]);

  const sunSid4 = (sun4[0] - ayanamsa4 + 360) % 360;
  const moonSid4 = (moon4[0] - ayanamsa4 + 360) % 360;
  const diff4 = (moonSid4 - sunSid4 + 360) % 360;

  const tithis = ["Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami", "Shukla Shashti", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami", "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima", "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami", "Krishna Shashti", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami", "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"];
  const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

  console.log("\nMoshier Mode Output:");
  console.log("Tithi:", tithis[Math.floor(diff4 / 12)]);
  console.log("Nakshatra:", nakshatras[Math.floor(moonSid4 / 13.333333333333334)]);
}

testEpheModes();
