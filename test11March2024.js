import { getPanchangForDate } from './src/utils/panchangCalc';

const date = new Date(2024, 2, 11); // 11 March 2024
const p = getPanchangForDate(28.6139, 77.2090, date);

console.log("=== 11 MARCH 2024 PANCHANG ===");
console.log("Tithi:", p.hinduDate.tithi.name, p.hinduDate.tithi.hindiName, "End:", p.hinduDate.tithi.endTime);
console.log("Nakshatra:", p.hinduDate.nakshatra.name, p.hinduDate.nakshatra.hindiName, "End:", p.hinduDate.nakshatra.endTime);
console.log("Sunrise:", p.astronomicalTimings.sunrise);
console.log("Sunset:", p.astronomicalTimings.sunset);
console.log("Moonrise:", p.astronomicalTimings.moonrise);
