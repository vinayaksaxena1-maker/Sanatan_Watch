import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function testDates() {
  const swe = new SwissEph();
  const wasmBuffer = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');
  await swe.initSwissEph({
    wasmBinary: wasmBuffer,
    getPreloadedPackage: () => new ArrayBuffer(0)
  });
  swe.set_sid_mode(1, 0, 0);

  const datesToTest = [
    { label: "01-05-2025 (1 May 2025)", d: new Date('2025-05-01T05:30:00Z') },
    { label: "05-01-2025 (5 Jan 2025)", d: new Date('2025-01-05T05:30:00Z') },
    { label: "30-03-2025 (30 Mar 2025)", d: new Date('2025-03-30T05:30:00Z') },
    { label: "29-03-2025 (29 Mar 2025)", d: new Date('2025-03-29T05:30:00Z') },
    { label: "1925-05-01 (1 May 1925)", d: new Date('1925-05-01T05:30:00Z') },
    { label: "1925-01-05 (5 Jan 1925)", d: new Date('1925-01-05T05:30:00Z') },
  ];

  for (const item of datesToTest) {
    const jdQuery = (item.d.getTime() / 86400000) + 2440587.5;
    const sunPos = swe.calc_ut(jdQuery, 0, 2 | 256);
    const moonPos = swe.calc_ut(jdQuery, 1, 2 | 256);
    const ayanamsa = swe.get_ayanamsa(jdQuery);
    const sunSidereal = (sunPos[0] - ayanamsa + 360) % 360;
    const moonSidereal = (moonPos[0] - ayanamsa + 360) % 360;
    const diffNorm = (moonSidereal - sunSidereal + 360) % 360;
    const tithiIdx = Math.floor(diffNorm / 12);
    const naksIdx = Math.floor(moonSidereal / 13.333333333333334);
    const sunNaksIdx = Math.floor(sunSidereal / 13.333333333333334);
    
    const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    const tithis = ["Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami", "Shukla Shashti", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami", "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima", "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami", "Krishna Shashti", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami", "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"];

    console.log(`--- ${item.label} ---`);
    console.log(`Tithi: ${tithis[tithiIdx]} (${tithiIdx})`);
    console.log(`Moon Nakshatra: ${nakshatras[naksIdx]}`);
    console.log(`Sun Nakshatra: ${nakshatras[sunNaksIdx]}`);
    console.log(`Sun Sidereal: ${sunSidereal.toFixed(2)}°`);
  }
}

testDates();
