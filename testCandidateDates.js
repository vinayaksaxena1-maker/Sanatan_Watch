import { getPanchangForDate } from './src/utils/panchangCalc';

const dates = [
  { name: "30 March 2025", d: new Date(2025, 2, 30) },
  { name: "31 March 2025", d: new Date(2025, 2, 31) },
  { name: "1 May 2025", d: new Date(2025, 4, 1) },
  { name: "5 January 2025", d: new Date(2025, 0, 5) },
  { name: "1 May 1925", d: new Date(1925, 4, 1) },
  { name: "5 January 1925", d: new Date(1925, 0, 5) },
];

for (const item of dates) {
  const p = getPanchangForDate(28.6139, 77.2090, item.d);
  console.log(`=== ${item.name} ===`);
  console.log("Tithi:", p.hinduDate.tithi.name);
  console.log("Nakshatra:", p.hinduDate.nakshatra.name);
  console.log("Yoga:", p.hinduDate.yoga.name);
  console.log("Karana 1:", p.hinduDate.karana.name);
  console.log("Surya Nakshatra:", p.suryaNakshatra.name);
  console.log("Ritu:", p.rituDetails.solarRituHindi);
}
