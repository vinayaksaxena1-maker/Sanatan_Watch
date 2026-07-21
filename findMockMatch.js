import { MockAstronomicalEngine } from './src/utils/astronomicalEngine';
import { TITHI_DETAILS, NAKSHATRA_DETAILS } from './src/utils/panchangCalc';

const mockEngine = new MockAstronomicalEngine();

const start = new Date(1900, 0, 1);
for (let y = 1900; y <= 2100; y++) {
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= 31; d++) {
      const dt = new Date(y, m, d);
      if (dt.getMonth() !== m) continue;
      const pos = mockEngine.getPanchangPositions(dt);
      if (pos.tithiIdx === 0 && pos.naksIdx === 25) {
        console.log(`FOUND MOCK MATCH: ${y}-${m+1}-${d}`);
      }
    }
  }
}
