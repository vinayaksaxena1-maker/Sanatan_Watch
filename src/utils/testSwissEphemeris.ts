/**
 * Phase 0: Swiss Ephemeris WebAssembly Proof of Concept
 *
 * Trigger: Open http://localhost:3000/?poc=true in browser
 * Expected Output: Sun/Moon coordinates, Lahiri Ayanamsa, and rise/set times printed to browser console.
 *
 * Rules:
 * - This file MUST NOT affect any existing Panchang calculations.
 * - This file will be removed/cleaned up in Phase 2A.
 * - No modifications to panchangCalc.ts or any TSX/CSS files.
 */

// ---------------------------------------------------------------------------
// Helper: Julian Day Number from a JS Date (UT)
// ---------------------------------------------------------------------------
function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return julDayUT(year, month, day, hour);
}

function julDayUT(year: number, month: number, day: number, hour: number): number {
  // Gregorian calendar Julian Day calculation
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5;
}

// ---------------------------------------------------------------------------
// Helper: Convert Julian Day fraction to HH:MM:SS local time string
// ---------------------------------------------------------------------------
function jdToLocalTimeString(jd: number, timezoneOffsetHours: number): string {
  const utHours = (jd - Math.floor(jd) - 0.5) * 24;
  const localHours = ((utHours + timezoneOffsetHours) % 24 + 24) % 24;
  const h = Math.floor(localHours);
  const mm = Math.floor((localHours - h) * 60);
  const s = Math.floor(((localHours - h) * 60 - mm) * 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(mm)}:${pad(s)}`;
}

// ---------------------------------------------------------------------------
// Main POC Function
// ---------------------------------------------------------------------------
export async function runSwissEphemerisPOC(): Promise<void> {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   PHASE 0: Swiss Ephemeris WebAssembly POC                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Use `any` because the package type definitions are incomplete (missing rise_trans, get_ayanamsa_ut)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let swe: any = null;

  try {
    // -----------------------------------------------------------------------
    // Step 1: Load and initialize the Swiss Ephemeris WASM module
    // -----------------------------------------------------------------------
    console.log('[POC] Step 1: Loading Swiss Ephemeris WebAssembly module...');
    const { default: SwissEph } = await import('swisseph-wasm');
    swe = new SwissEph();
    await swe.initSwissEph();
    console.log('[POC] ✅ WASM module initialized successfully.');
    console.log(`[POC]    Swiss Ephemeris version: ${swe.version()}`);

    // -----------------------------------------------------------------------
    // Step 2: Set sidereal mode to Lahiri (SE_SIDM_LAHIRI = 1)
    // -----------------------------------------------------------------------
    console.log('');
    console.log('[POC] Step 2: Setting sidereal mode to Lahiri Ayanamsa...');
    swe.set_sid_mode(1, 0, 0); // 1 = SE_SIDM_LAHIRI
    console.log('[POC] ✅ Sidereal mode: Lahiri (SE_SIDM_LAHIRI = 1)');

    // -----------------------------------------------------------------------
    // Step 3: Compute Julian Day for today at noon UT
    // -----------------------------------------------------------------------
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
    const jd = dateToJulianDay(today);

    console.log('');
    console.log('[POC] Step 3: Test date and Julian Day...');
    console.log(`[POC]    Date (UTC): ${today.toISOString()}`);
    console.log(`[POC]    Julian Day (UT, noon): ${jd.toFixed(6)}`);

    // -----------------------------------------------------------------------
    // Step 4: Compute apparent geocentric longitudes
    // SEFLG_SWIEPH=2 (Swiss Ephemeris .se1 files), SEFLG_MOSEPH=4 (Moshier built-in)
    // Try SWIEPH first; if .se1 files not available, fall back to Moshier
    // -----------------------------------------------------------------------
    console.log('');
    console.log('[POC] Step 4: Computing apparent geocentric coordinates...');

    let ephFlag: number;
    let sunTropical: Float64Array;
    let moonTropical: Float64Array;

    try {
      sunTropical  = swe.calc_ut(jd, 0, 2); // 0=SE_SUN,  2=SEFLG_SWIEPH
      moonTropical = swe.calc_ut(jd, 1, 2); // 1=SE_MOON, 2=SEFLG_SWIEPH
      ephFlag = 2;
      console.log('[POC] ✅ Using Swiss Ephemeris (.se1 data) for calculations.');
    } catch (_sweErr) {
      console.warn('[POC] ⚠️  Swiss Ephemeris .se1 files not found. Falling back to Moshier built-in ephemeris.');
      sunTropical  = swe.calc_ut(jd, 0, 4); // 4=SEFLG_MOSEPH
      moonTropical = swe.calc_ut(jd, 1, 4);
      ephFlag = 4;
      console.log('[POC] ✅ Using Moshier ephemeris (built-in) for calculations.');
    }

    const sunLonTropical  = sunTropical[0];
    const moonLonTropical = moonTropical[0];

    // -----------------------------------------------------------------------
    // Step 5: Compute Lahiri Ayanamsa
    // -----------------------------------------------------------------------
    const lahiriAyanamsa: number = swe.get_ayanamsa(jd);

    // -----------------------------------------------------------------------
    // Step 6: Compute Sidereal (Nirayana) longitudes
    // -----------------------------------------------------------------------
    const sunLonSidereal  = ((sunLonTropical  - lahiriAyanamsa) % 360 + 360) % 360;
    const moonLonSidereal = ((moonLonTropical - lahiriAyanamsa) % 360 + 360) % 360;

    const RASHI_NAMES = [
      'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
      'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)',
      'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
    ];

    const sunRashi  = RASHI_NAMES[Math.floor(sunLonSidereal / 30)];
    const moonRashi = RASHI_NAMES[Math.floor(moonLonSidereal / 30)];

    console.log('');
    console.log('[POC] ─────────────────────────────────────────────────');
    console.log('[POC] 🌞 SUN POSITION:');
    console.log(`[POC]    Tropical  Longitude : ${sunLonTropical.toFixed(6)}°`);
    console.log(`[POC]    Sidereal  Longitude : ${sunLonSidereal.toFixed(6)}°`);
    console.log(`[POC]    Rashi (Zodiac Sign) : ${sunRashi}`);
    console.log('');
    console.log('[POC] 🌙 MOON POSITION:');
    console.log(`[POC]    Tropical  Longitude : ${moonLonTropical.toFixed(6)}°`);
    console.log(`[POC]    Sidereal  Longitude : ${moonLonSidereal.toFixed(6)}°`);
    console.log(`[POC]    Rashi (Zodiac Sign) : ${moonRashi}`);
    console.log('');
    console.log('[POC] 🔭 LAHIRI AYANAMSA:');
    console.log(`[POC]    Ayanamsa Value : ${lahiriAyanamsa.toFixed(6)}°`);
    console.log('[POC] ─────────────────────────────────────────────────');

    // -----------------------------------------------------------------------
    // Step 7: Sunrise, Sunset, Moonrise, Moonset (New Delhi)
    // rise_trans(jd, planet, lon, lat, alt, flags)
    // SE_CALC_RISE=1, SE_CALC_SET=2  (OR'd with ephFlag)
    // -----------------------------------------------------------------------
    console.log('');
    console.log('[POC] Step 5: Computing rise/set times for New Delhi (28.6139°N, 77.2090°E)...');

    const GEO_LAT   = 28.6139;
    const GEO_LON   = 77.2090;
    const GEO_ALT   = 216;
    const IST_OFFSET = 5.5;

    const today0h = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const jdMidnight = dateToJulianDay(today0h);

    const SE_CALC_RISE = 1;
    const SE_CALC_SET  = 2;

    // rise_trans is defined in swisseph.js but missing from the package's type definitions.
    // Cast to bypass TypeScript check for this POC script only.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sweRaw = swe as any;

    const sunriseResult  = sweRaw.rise_trans(jdMidnight, 0, GEO_LON, GEO_LAT, GEO_ALT, SE_CALC_RISE | ephFlag) as Float64Array | null;
    const sunsetResult   = sweRaw.rise_trans(jdMidnight, 0, GEO_LON, GEO_LAT, GEO_ALT, SE_CALC_SET  | ephFlag) as Float64Array | null;
    const moonriseResult = sweRaw.rise_trans(jdMidnight, 1, GEO_LON, GEO_LAT, GEO_ALT, SE_CALC_RISE | ephFlag) as Float64Array | null;
    const moonsetResult  = sweRaw.rise_trans(jdMidnight, 1, GEO_LON, GEO_LAT, GEO_ALT, SE_CALC_SET  | ephFlag) as Float64Array | null;

    const sunriseStr  = sunriseResult  ? jdToLocalTimeString(sunriseResult[0],  IST_OFFSET) : 'N/A';
    const sunsetStr   = sunsetResult   ? jdToLocalTimeString(sunsetResult[0],   IST_OFFSET) : 'N/A';
    const moonriseStr = moonriseResult ? jdToLocalTimeString(moonriseResult[0], IST_OFFSET) : 'N/A';
    const moonsetStr  = moonsetResult  ? jdToLocalTimeString(moonsetResult[0],  IST_OFFSET) : 'N/A';

    console.log('');
    console.log('[POC] ─────────────────────────────────────────────────');
    console.log('[POC] 🌅 RISE / SET TIMES (New Delhi, IST):');
    console.log(`[POC]    Sunrise  : ${sunriseStr}  IST`);
    console.log(`[POC]    Sunset   : ${sunsetStr}  IST`);
    console.log(`[POC]    Moonrise : ${moonriseStr}  IST`);
    console.log(`[POC]    Moonset  : ${moonsetStr}  IST`);
    console.log('[POC] ─────────────────────────────────────────────────');

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------
    console.log('');
    console.log('[POC] ══════════════════════════════════════════════════');
    console.log('[POC] ✅ PHASE 0 POC COMPLETED SUCCESSFULLY');
    console.log('[POC]    [✓] WASM compiled and initialized in browser');
    console.log('[POC]    [✓] Sun longitude computed');
    console.log('[POC]    [✓] Moon longitude computed');
    console.log('[POC]    [✓] Lahiri Ayanamsa computed');
    console.log('[POC]    [✓] Sidereal (Nirayana) longitudes computed');
    console.log('[POC]    [✓] Sunrise / Sunset times computed');
    console.log('[POC]    [✓] Moonrise / Moonset times computed');
    console.log('[POC] ══════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('[POC] ❌ PHASE 0 POC FAILED:', error);
    throw error;
  } finally {
    if (swe) {
      try {
        swe.close();
        console.log('[POC] 🧹 Swiss Ephemeris WASM instance closed.');
      } catch (_e) {
        // Ignore cleanup errors
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Auto-trigger: Run POC when ?poc=true is in URL
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('poc') === 'true') {
    // Defer to allow React to mount first
    setTimeout(() => {
      runSwissEphemerisPOC().catch((err) => {
        console.error('[POC] Fatal error during Phase 0 POC:', err);
      });
    }, 500);
  }
}
