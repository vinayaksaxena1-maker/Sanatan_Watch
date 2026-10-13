import { getPanchangForDate } from './src/utils/panchangCalc';

for (let year = 1900; year <= 2035; year += 1) {
  for (let month = 0; month < 12; month++) {
    for (let day = 1; day <= 31; day++) {
      try {
        const d = new Date(year, month, day);
        if (isNaN(d.getTime())) continue;
        const p = getPanchangForDate(28.6139, 77.2090, d);
        if (
          p.hinduDate.tithi.name.includes("Pratipada") &&
          p.hinduDate.nakshatra.name.includes("Uttara Bhadrapada") &&
          p.hinduDate.yoga.name.includes("Shukla")
        ) {
          console.log(`EXACT MATCH FOUND IN APP: Date = ${year}-${month+1}-${day}`);
          console.log("Tithi:", p.hinduDate.tithi.name);
          console.log("Nakshatra:", p.hinduDate.nakshatra.name);
          console.log("Yoga:", p.hinduDate.yoga.name);
          console.log("Karana:", p.hinduDate.karana.name);
          console.log("Surya Nakshatra:", p.suryaNakshatra.name);
          console.log("Ishtakala:", p.ishtakala.formatted);
          console.log("Moonset:", p.astronomicalTimings.moonset);
        }
      } catch (e) {}
    }
  }
}
