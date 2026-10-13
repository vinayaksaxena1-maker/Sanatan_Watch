import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function findExactPanchang() {
  const swe = new SwissEph();
  const wasmBuffer = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');
  await swe.initSwissEph({
    wasmBinary: wasmBuffer,
    getPreloadedPackage: () => new ArrayBuffer(0)
  });
  swe.set_sid_mode(1, 0, 0); // Lahiri

  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const tithis = [
    "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami", "Shukla Shashti", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami", "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
    "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami", "Krishna Shashti", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami", "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
  ];
  const yogas = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
  ];
  const karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti (Bhadra)", "Shakuni", "Chatuspada", "Naga", "Kimstughna"];

  // Search hourly across 2024 - 2026
  const start = new Date('2024-01-01T00:00:00Z');
  for (let i = 0; i < 365 * 3 * 24; i += 6) {
    const d = new Date(start.getTime() + i * 3600000);
    const jdQuery = (d.getTime() / 86400000) + 2440587.5;
    const sunPos = swe.calc_ut(jdQuery, 0, 2 | 256);
    const moonPos = swe.calc_ut(jdQuery, 1, 2 | 256);
    const ayanamsa = swe.get_ayanamsa(jdQuery);
    const sunSidereal = (sunPos[0] - ayanamsa + 360) % 360;
    const moonSidereal = (moonPos[0] - ayanamsa + 360) % 360;
    const diffNorm = (moonSidereal - sunSidereal + 360) % 360;
    const tithiIdx = Math.floor(diffNorm / 12);
    const naksIdx = Math.floor(moonSidereal / 13.333333333333334);
    const yogaLon = (moonSidereal + sunSidereal) % 360;
    const yogaIdx = Math.floor(yogaLon / 13.333333333333334);
    
    let karanaTotalSec = Math.floor(diffNorm / 6);
    let karanaVal = 0;
    if (karanaTotalSec === 0) karanaVal = 10; // Kimstughna
    else if (karanaTotalSec >= 57) karanaVal = karanaTotalSec === 57 ? 7 : (karanaTotalSec === 58 ? 8 : 9);
    else karanaVal = ((karanaTotalSec - 1) % 7);

    const sunNaksIdx = Math.floor(sunSidereal / 13.333333333333334);

    if (
      nakshatras[naksIdx] === "Uttara Bhadrapada" &&
      tithis[tithiIdx] === "Shukla Pratipada"
    ) {
      console.log(`\n>>> MATCH AT DATE: ${d.toISOString()} <<<`);
      console.log(`Tithi: ${tithis[tithiIdx]}`);
      console.log(`Moon Nakshatra: ${nakshatras[naksIdx]}`);
      console.log(`Sun Nakshatra: ${nakshatras[sunNaksIdx]}`);
      console.log(`Yoga: ${yogas[yogaIdx]}`);
      console.log(`Karana: ${karanas[karanaVal]}`);
      console.log(`Sun Sidereal Deg: ${sunSidereal.toFixed(2)}°`);
    }
  }
}

findExactPanchang();
