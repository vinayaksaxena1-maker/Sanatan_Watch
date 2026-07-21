import { MockAstronomicalEngine } from './src/utils/astronomicalEngine';
import { TITHI_DETAILS, NAKSHATRA_DETAILS } from './src/utils/panchangCalc';

const mockEngine = new MockAstronomicalEngine();
const date = new Date(2025, 4, 1);
const pos = mockEngine.getPanchangPositions(date);

console.log("=== MOCK ENGINE POSITIONS FOR 1 MAY 2025 ===");
console.log("tithiIdx:", pos.tithiIdx, "-> Tithi:", TITHI_DETAILS[pos.tithiIdx % 15].name);
console.log("naksIdx:", pos.naksIdx, "-> Nakshatra:", NAKSHATRA_DETAILS[pos.naksIdx].name, NAKSHATRA_DETAILS[pos.naksIdx].hindiName);
console.log("yogaIdx:", pos.yogaIdx);
console.log("karanaVal:", pos.karanaVal);
