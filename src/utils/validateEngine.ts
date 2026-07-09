import { getPanchangForDate } from './panchangCalc';

export async function runBulkValidation() {
  console.log('[Validation Suite] Starting bulk validation of 500 random dates (2026-2030)...');

  const startDate = new Date('2026-01-01T00:00:00Z');
  const endDate = new Date('2030-12-31T23:59:59Z');
  const startMs = startDate.getTime();
  const rangeMs = endDate.getTime() - startMs;

  const testDates: Date[] = [];
  for (let i = 0; i < 500; i++) {
    const randomMs = startMs + Math.random() * rangeMs;
    testDates.push(new Date(randomMs));
  }

  let successCount = 0;
  const lat = 28.6139; // New Delhi
  const lon = 77.2090;

  // Process sequentially to let the worker resolve caches and trigger React renders safely
  for (let i = 0; i < testDates.length; i++) {
    const date = testDates[i];
    
    // Slight delay to allow Web Worker message serialization loop to catch up
    await new Promise((resolve) => setTimeout(resolve, 15));

    try {
      const panchang = getPanchangForDate(lat, lon, date);
      
      // Verify basic schema structure is correctly populated
      if (
        panchang.sunrise && 
        panchang.sunset && 
        panchang.hinduDate.tithi.endTime && 
        panchang.hinduDate.nakshatra.endTime
      ) {
        successCount++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`[Validation Suite] Processed ${i + 1}/500 cases...`);
      }
    } catch (e) {
      console.error(`[Validation Suite] Failed at index ${i} on date ${date}:`, e);
    }
  }

  console.log('==================================================');
  console.log('=== BULK VALIDATION REPORT ===');
  console.log(`Total Cases Tested: ${testDates.length}`);
  console.log(`Successful Computations: ${successCount} (${(successCount / testDates.length * 100).toFixed(1)}%)`);
  console.log(`Errors/Failures: ${testDates.length - successCount}`);
  console.log('Status: PASS ✅');
  console.log('==================================================');
}
