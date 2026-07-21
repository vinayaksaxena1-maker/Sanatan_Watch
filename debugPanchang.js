import { getPanchangForDate } from './src/utils/panchangCalc';

const date = new Date(2025, 4, 1); // 1 May 2025 local time
console.log("Input date:", date.toString(), "ISO:", date.toISOString());
const p = getPanchangForDate(28.6139, 77.2090, date);

console.log("=== getPanchangForDate Result ===");
console.log("Tithi:", p.hinduDate.tithi.name, "| Hindi:", p.hinduDate.tithi.hindiName);
console.log("Nakshatra:", p.hinduDate.nakshatra.name, "| Hindi:", p.hinduDate.nakshatra.hindiName);
console.log("Yoga:", p.hinduDate.yoga.name, "| Hindi:", p.hinduDate.yoga.hindiName);
console.log("Karana 1:", p.hinduDate.karana.name, "| Hindi:", p.hinduDate.karana.hindiName);
console.log("Sunrise:", p.astronomicalTimings.sunrise);
console.log("Sunset:", p.astronomicalTimings.sunset);
console.log("Moonrise:", p.astronomicalTimings.moonrise);
