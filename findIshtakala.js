import { getPanchangForDate } from './src/utils/panchangCalc';

for (let y = 1900; y <= 2100; y++) {
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= 31; d++) {
      try {
        const dt = new Date(y, m, d);
        if (isNaN(dt.getTime())) continue;
        const p = getPanchangForDate(28.6139, 77.2090, dt);
        if (p.ishtakala && p.ishtakala.ghati === 48 && p.ishtakala.vighati === 49) {
          console.log(`BINGO! MATCH FOR ISHTAKALA 48 GHATI 49 VIGHATI: Date = ${y}-${m+1}-${d}`);
          console.log("Tithi:", p.hinduDate.tithi.name);
          console.log("Nakshatra:", p.hinduDate.nakshatra.name);
          console.log("Yoga:", p.hinduDate.yoga.name);
          console.log("Karana:", p.hinduDate.karana.name);
          console.log("Surya Nakshatra:", p.suryaNakshatra.name);
        }
      } catch (e) {}
    }
  }
}
