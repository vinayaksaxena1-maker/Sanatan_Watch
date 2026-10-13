import { MockAstronomicalEngine } from './src/utils/astronomicalEngine';
import { TITHI_DETAILS, NAKSHATRA_DETAILS } from './src/utils/panchangCalc';

const mockEngine = new MockAstronomicalEngine();
const testDate = new Date('2026-07-21T17:13:00+05:30');
const pos = mockEngine.getPanchangPositions(testDate);

console.log("=== MOCK ENGINE POSITIONS FOR 21 JULY 2026 ===");
console.log("tithiIdx:", pos.tithiIdx, "-> Tithi:", TITHI_DETAILS[pos.tithiIdx % 15].name);
console.log("naksIdx:", pos.naksIdx, "-> Nakshatra:", NAKSHATRA_DETAILS[pos.naksIdx].name, NAKSHATRA_DETAILS[pos.naksIdx].hindiName);
console.log("yogaIdx:", pos.yogaIdx);
console.log("karanaVal:", pos.karanaVal);
