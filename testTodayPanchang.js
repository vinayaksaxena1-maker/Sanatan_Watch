import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function testTodayPanchang() {
  const swe = new SwissEph();
  const wasmBuffer = fs.readFileSync('./node_modules/swisseph-wasm/wasm/swisseph.wasm');
  await swe.initSwissEph({
    wasmBinary: wasmBuffer,
    getPreloadedPackage: () => new ArrayBuffer(0)
  });
  swe.set_sid_mode(1, 0, 0);

  // Date: July 22, 2026
  const testDate = new Date('2026-07-22T05:30:00+05:30');
  const lat = 28.6139;
  const lon = 77.2090;

  const parsedDate = testDate;
  const jdQuery = (parsedDate.getTime() / 86400000) + 2440587.5;

  const sunPos = swe.calc_ut(jdQuery, 0, 2 | 256);
  const moonPos = swe.calc_ut(jdQuery, 1, 2 | 256);
  const ayanamsa = swe.get_ayanamsa(jdQuery);

  const sunSidereal = (sunPos[0] - ayanamsa + 360) % 360;
  const moonSidereal = (moonPos[0] - ayanamsa + 360) % 360;

  const diffNorm = (moonSidereal - sunSidereal + 360) % 360;
  let tithiIdx = Math.floor(diffNorm / 12);
  let naksIdx = Math.floor(moonSidereal / 13.333333333333334);
  let yogaLon = (moonSidereal + sunSidereal) % 360;
  let yogaIdx = Math.floor(yogaLon / 13.333333333333334);

  let karanaTotalSec = Math.floor((diffNorm / 6));
  let karanaVal = 0;
  if (karanaTotalSec === 0) {
    karanaVal = 10;
  } else if (karanaTotalSec >= 57) {
    if (karanaTotalSec === 57) karanaVal = 7;
    else if (karanaTotalSec === 58) karanaVal = 8;
    else karanaVal = 9;
  } else {
    karanaVal = ((karanaTotalSec - 1) % 7);
  }

  const nakshatras = ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वाभाद्रपद", "उत्तराभाद्रपद", "रेवती"];
  const tithis = ["शुक्ल प्रतिपदा", "शुक्ल द्वितीया", "शुक्ल तृतीया", "शुक्ल चतुर्थी", "शुक्ल पंचमी", "शुक्ल षष्ठी", "शुक्ल सप्तमी", "शुक्ल अष्टमी", "शुक्ल नवमी", "शुक्ल दशमी", "शुक्ल एकादशी", "शुक्ल द्वादशी", "शुक्ल त्रयोदशी", "शुक्ल चतुर्दशी", "पूर्णिमा", "कृष्ण प्रतिपदा", "कृष्ण द्वितीया", "कृष्ण तृतीया", "कृष्ण चतुर्थी", "कृष्ण पंचमी", "कृष्ण षष्ठी", "कृष्ण सप्तमी", "कृष्ण अष्टमी", "कृष्ण नवमी", "कृष्ण दशमी", "कृष्ण एकादशी", "कृष्ण द्वादशी", "कृष्ण त्रयोदशी", "कृष्ण चतुर्दशी", "अमावस्या"];
  const yogas = ["विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "ऐन्द्र", "वैधृति"];
  const karanas = ["बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि (भद्रा)", "शकुनि", "चतुष्पद", "नाग", "किंस्तुघ्न"];
  const rashis = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

  const sunRashiIdx = Math.floor(sunSidereal / 30);
  const moonRashiIdx = Math.floor(moonSidereal / 30);

  console.log("=== TODAY SWISS EPHEMERIS PANCHANG (22 JULY 2026) ===");
  console.log("दिनांक (Date): 22 जुलाई 2026 (बुधवार)");
  console.log("स्थान (Location): नई दिल्ली");
  console.log("विक्रम संवत:", 2083);
  console.log("मास (Month): श्रावण (Sravana)");
  console.log("तिथि (Tithi):", tithis[tithiIdx], `(Idx: ${tithiIdx})`);
  console.log("पक्ष (Paksha):", tithiIdx < 15 ? "शुक्ल पक्ष" : "कृष्ण पक्ष");
  console.log("नक्षत्र (Nakshatra):", nakshatras[naksIdx], `(Idx: ${naksIdx})`);
  console.log("योग (Yoga):", yogas[yogaIdx], `(Idx: ${yogaIdx})`);
  console.log("करण (Karana):", karanas[karanaVal], `(Val: ${karanaVal})`);
  console.log("सूर्य राशि (Sun Sign):", rashis[sunRashiIdx], `(${sunSidereal.toFixed(2)}°)`);
  console.log("चंद्र राशि (Moon Sign):", rashis[moonRashiIdx], `(${moonSidereal.toFixed(2)}°)`);
  console.log("अयनांश (Ayanamsa):", ayanamsa.toFixed(2) + "° (Lahiri)");
}

testTodayPanchang();
