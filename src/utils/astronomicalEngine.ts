/**
 * Phase 2A: Swiss Ephemeris Core Integration (Part A)
 *
 * Exposes a Worker Proxy interface with isReady() checking
 * to block UI render during Web Worker compilation.
 */

import AstroWorker from './astroWorker?worker&inline';
import { getSeplBuffer, getSemoBuffer } from './epheAssets';

export interface SolarTimes {
  sunrise: string;
  sunset: string;
  sunriseRaw: number; // minutes since midnight
  sunsetRaw: number;  // minutes since midnight
}

export interface MoonTimes {
  moonrise: string;
  moonset: string;
  moonriseRaw: number; // minutes since midnight
  moonsetRaw: number;  // minutes since midnight
}

export interface PlanetPosition {
  name: string;
  hindiName: string;
  longitude: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  signHindi: string;
}

export interface PanchangPositions {
  tithiIdx: number;            // 0 to 29
  tithiPercent: number;        // fraction passed (0.0 to 1.0)
  tithiRemainingHours: number;
  tithiPassedHours: number;

  naksIdx: number;             // 0 to 26
  naksPercent: number;         // fraction passed (0.0 to 1.0)
  naksRemainingHours: number;

  yogaIdx: number;             // 0 to 26
  yogaPercent: number;         // fraction passed (0.0 to 1.0)
  yogaRemainingHours: number;

  karanaTotalSec: number;      // 0 to 59
  karanaVal: number;           // 0 to 10
  karanaPercent: number;       // fraction passed (0.0 to 1.0)
  karanaRemainingHours: number;

  monthsSinceEpoch: number;
  diffDays: number;
  isAdhik?: boolean;

  sunSidereal: number;
  moonSidereal: number;
  ayanamsa: number;
  planets: PlanetPosition[];
}

export interface AstronomicalEngine {
  getSolarTimes(lat: number, lon: number, date: Date): SolarTimes;
  getMoonTimes(sunriseMin: number, sunsetMin: number, tithiIdx: number, date: Date, lat: number, lon: number): MoonTimes;
  getPanchangPositions(date: Date): PanchangPositions;
  isReady(): boolean;
}

// ---------------------------------------------------------------------------
// Helper: formatRawMin
// ---------------------------------------------------------------------------
function formatRawMin(m: number): string {
  let hrs = Math.floor(m / 60);
  let mins = Math.floor(m % 60);
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Mock Implementation using original mathematical approximations
// ---------------------------------------------------------------------------
export class MockAstronomicalEngine implements AstronomicalEngine {
  isReady(): boolean {
    return true;
  }

  getSolarTimes(lat: number, lon: number, date: Date): SolarTimes {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Approximate Equation of Time & Solar Declination
    const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + (12 - 12) / 24);
    const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

    // Hour Angle
    const latRad = lat * Math.PI / 180;
    let cosH = (Math.cos(90.833 * Math.PI / 180) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
    
    if (cosH > 1) cosH = 1;
    if (cosH < -1) cosH = -1;
    
    const H = Math.acos(cosH) * 180 / Math.PI; // degrees
    
    // Solar Noon (UTC) = 720 - 4 * Lon - eqTime
    const solarNoonLST = 720 - 4 * lon - eqTime + (5.5 * 60); // In India UTC+5.5
    
    const sunriseMinutes = solarNoonLST - H * 4;
    const sunsetMinutes = solarNoonLST + H * 4;

    return {
      sunrise: formatRawMin(sunriseMinutes),
      sunset: formatRawMin(sunsetMinutes),
      sunriseRaw: sunriseMinutes,
      sunsetRaw: sunsetMinutes
    };
  }

  getMoonTimes(sunriseMin: number, sunsetMin: number, tithiIdx: number, _date: Date, _lat: number, _lon: number): MoonTimes {
    // Moonrise / Moonset approximation based on Tithi index
    // Each Tithi, moonrise delays by roughly 48 minutes
    const moonRefSecs = (tithiIdx * 48);
    const moonriseRaw = (sunriseMin + 360 + moonRefSecs) % 1440;
    const moonsetRaw = (sunsetMin + 360 + moonRefSecs) % 1440;

    return {
      moonrise: formatRawMin(moonriseRaw),
      moonset: formatRawMin(moonsetRaw),
      moonriseRaw,
      moonsetRaw
    };
  }

  getPanchangPositions(date: Date): PanchangPositions {
    // Reference Epoch (New moon on March 18, 2026 UTC, start of Chaitra Shukla 1)
    const epoch = new Date('2026-03-18T05:30:00Z'); 
    const diffTime = date.getTime() - epoch.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Synodic month cycle is roughly 29.53059 days
    const lunarCycle = 29.530588853;
    const rawLunarMonthAge = (diffDays) % lunarCycle;
    const lunarMonthAge = rawLunarMonthAge < 0 ? rawLunarMonthAge + lunarCycle : rawLunarMonthAge;

    // Sidereal moon cycle (Nakshatra) is roughly 27.32166 days
    const siderealCycle = 27.321661;
    const rawNakshatraAge = (diffDays * 1.011 + 6) % siderealCycle; // Offset 6 to start correctly
    const nakshatraAge = rawNakshatraAge < 0 ? rawNakshatraAge + siderealCycle : rawNakshatraAge;

    // Yoga cycle is roughly 27 days base
    const rawYogaAge = (diffDays * 1.055 + 2) % 27;
    const yogaAge = rawYogaAge < 0 ? rawYogaAge + 27 : rawYogaAge;

    // Calculates Tithi Index (1-30)
    let tithiIdx = Math.floor((lunarMonthAge / lunarCycle) * 30);
    if (tithiIdx < 0) tithiIdx += 30;
    if (tithiIdx >= 30) tithiIdx = 29;
    const tithiPercent = (lunarMonthAge / lunarCycle) * 30 - tithiIdx;
    const tithiRemainingHours = (1 - tithiPercent) * 23.6;
    const tithiPassedHours = tithiPercent * 23.6;

    // Calculates Nakshatra (1-27)
    let naksIdx = Math.floor((nakshatraAge / siderealCycle) * 27);
    if (naksIdx < 0) naksIdx += 27;
    if (naksIdx >= 27) naksIdx = 26;
    const naksPercent = (nakshatraAge / siderealCycle) * 27 - naksIdx;
    const naksRemainingHours = (1 - naksPercent) * 24.2;

    // Calculates Yoga (1-27)
    let yogaIdx = Math.floor(yogaAge);
    if (yogaIdx < 0) yogaIdx += 27;
    if (yogaIdx >= 27) yogaIdx = 26;
    const yogaPercent = yogaAge - yogaIdx;
    const yogaRemainingHours = (1 - yogaPercent) * 26.1;

    // Calculates Karana (1-11)
    let karanaTotalSec = Math.floor(((lunarMonthAge / lunarCycle) * 60));
    if (karanaTotalSec < 0) karanaTotalSec += 60;
    if (karanaTotalSec >= 60) karanaTotalSec = 59;
    
    let karanaVal = 0;
    if (karanaTotalSec === 0) {
      karanaVal = 10; // Kimstughna
    } else if (karanaTotalSec >= 57) {
      if (karanaTotalSec === 57) karanaVal = 7; // Shakuni
      else if (karanaTotalSec === 58) karanaVal = 8; // Chatuspada
      else karanaVal = 9; // Naga
    } else {
      karanaVal = ((karanaTotalSec - 1) % 7);
    }
    const karanaPercent = ((lunarMonthAge / lunarCycle) * 60) - karanaTotalSec;
    const karanaRemainingHours = (1 - karanaPercent) * 11.8;
    const sunSidereal = (diffDays * 0.9856) % 360;
    const moonSidereal = (diffDays * 13.176) % 360;
    const ayanamsa = 24.2;

    const diffNorm = (lunarMonthAge / lunarCycle) * 360;
    const daysSinceNewMoon = diffNorm / 12.190749;
    const sunLonAtNewMoon = (sunSidereal - daysSinceNewMoon + 360) % 360;
    const monthsSinceEpoch = (Math.floor(sunLonAtNewMoon / 30) + 1) % 12;
    
    const mockPlanets: PlanetPosition[] = [
      { name: 'Sun', hindiName: 'सूर्य', longitude: sunSidereal, speed: 0.9856, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Moon', hindiName: 'चन्द्र', longitude: moonSidereal, speed: 13.176, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Mars', hindiName: 'मंगल', longitude: (diffDays * 0.524) % 360, speed: 0.524, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Mercury', hindiName: 'बुध', longitude: (diffDays * 1.2) % 360, speed: 1.2, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Jupiter', hindiName: 'गुरु', longitude: (diffDays * 0.083) % 360, speed: 0.083, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Venus', hindiName: 'शुक्र', longitude: (diffDays * 1.6) % 360, speed: 1.6, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Saturn', hindiName: 'शनि', longitude: (diffDays * 0.033) % 360, speed: 0.033, isRetrograde: false, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Rahu', hindiName: 'राहु', longitude: (360 - (diffDays * 0.053)) % 360, speed: -0.053, isRetrograde: true, sign: 'Aries', signHindi: 'मेष' },
      { name: 'Ketu', hindiName: 'केतु', longitude: (180 - (diffDays * 0.053)) % 360, speed: -0.053, isRetrograde: true, sign: 'Aries', signHindi: 'मेष' }
    ];

    return {
      tithiIdx,
      tithiPercent,
      tithiRemainingHours,
      tithiPassedHours,
      naksIdx,
      naksPercent,
      naksRemainingHours,
      yogaIdx,
      yogaPercent,
      yogaRemainingHours,
      karanaTotalSec,
      karanaVal,
      karanaPercent,
      karanaRemainingHours,
      monthsSinceEpoch,
      diffDays,
      isAdhik: false,
      sunSidereal,
      moonSidereal,
      ayanamsa,
      planets: mockPlanets
    };
  }
}

// ---------------------------------------------------------------------------
// Isolated Web Worker Integration (Part B Boundary)
// ---------------------------------------------------------------------------
let worker: Worker | null = null;
try {
  worker = new AstroWorker();
} catch (e) {
  console.error('[AstronomicalEngine] Failed to create Web Worker:', e);
}

const solarCache = new Map<string, SolarTimes>();
const moonCache = new Map<string, MoonTimes>();
const positionCache = new Map<string, PanchangPositions>();
const pendingQueries = new Set<string>();

const mockEngine = new MockAstronomicalEngine();
let updateListener: (() => void) | null = null;
let isEngineReady = false;
let isInitialLoadComplete = false;
let isUsingMockFallback = false;
const initialKeys = new Set<string>();

export function registerEngineListener(callback: () => void) {
  updateListener = callback;
}

export function isReady(): boolean {
  return isEngineReady && isInitialLoadComplete;
}

export function isMockActive(): boolean {
  return isUsingMockFallback;
}

if (typeof window !== 'undefined') {
  if (worker) {
    try {
      // Load local packaged assets instantly from memory to bypass all CORS and HTTP server constraints
      const seplBuf = getSeplBuffer().slice(0); // clone to allow transfer to worker thread
      const semoBuf = getSemoBuffer().slice(0);
      
      worker.postMessage({
        type: 'INIT',
        seplBuf,
        semoBuf
      }, [seplBuf, semoBuf]);
    } catch (err: any) {
      console.error('[AstronomicalEngine] Failed to load inline ephemeris buffers:', err);
      isUsingMockFallback = true;
      isEngineReady = true;
      isInitialLoadComplete = true;
      if (updateListener) {
        updateListener();
      }
    }

    // Timeout of 12 seconds to fall back to Mock Engine if WASM is too slow
    setTimeout(() => {
      if (!isEngineReady) {
        console.warn('[AstronomicalEngine] Worker initialization timed out. Falling back to Mock Engine with warning.');
        isUsingMockFallback = true;
        isEngineReady = true;
        isInitialLoadComplete = true;
        if (updateListener) {
          updateListener();
        }
      }
    }, 12000);
  } else {
    // If worker couldn't be spawned, mark ready immediately to fallback to mock
    isUsingMockFallback = true;
    isEngineReady = true;
    isInitialLoadComplete = true;
  }
}

if (worker) {
  worker.onmessage = (event: MessageEvent) => {
    const { type, key, data, message } = event.data;

    if (type === 'READY') {
      isEngineReady = true;
      console.log('[AstronomicalEngine] Web Worker loaded and Swiss Ephemeris initialized successfully.');
      
      // Pre-fetch default location coordinates to completely avoid initial mock fallbacks
      const today = new Date();
      const lat = 28.6139; // New Delhi
      const lon = 77.2090;

      const cacheKeySolar = `SOLAR_${lat.toFixed(4)}_${lon.toFixed(4)}_${today.toDateString()}`;
      const cacheKeyMoon = `MOON_${lat.toFixed(4)}_${lon.toFixed(4)}_${today.toDateString()}`;
      const cacheKeyPos = `POS_${today.toDateString()}_${today.getHours()}_${today.getMinutes()}`;

      pendingQueries.add(cacheKeySolar);
      pendingQueries.add(cacheKeyMoon);
      pendingQueries.add(cacheKeyPos);

      initialKeys.add(cacheKeySolar);
      initialKeys.add(cacheKeyMoon);
      initialKeys.add(cacheKeyPos);

      if (worker) {
        worker.postMessage({ type: 'CALCULATE_SOLAR', key: cacheKeySolar, lat, lon, date: today.toISOString() });
        worker.postMessage({ type: 'CALCULATE_MOON', key: cacheKeyMoon, lat, lon, date: today.toISOString() });
        worker.postMessage({ type: 'CALCULATE_COORDINATES', key: cacheKeyPos, date: today.toISOString() });
      }
      return;
    }

    if (type === 'ERROR') {
      console.error('[AstronomicalEngine] Worker error for key:', key, message);
      if (key) {
        pendingQueries.delete(key);
        if (initialKeys.has(key)) {
          initialKeys.delete(key);
          if (initialKeys.size === 0) {
            isInitialLoadComplete = true;
            console.log('[AstronomicalEngine] Initial pre-fetch settled after error.');
          }
        }
      }
      if (updateListener) {
        updateListener();
      }
      return;
    }

    if (type === 'RESULT') {
      console.log('[AstronomicalEngine] Received RESULT for key:', key, data);
      if (key.startsWith('SOLAR_')) {
        solarCache.set(key, data);
      } else if (key.startsWith('MOON_')) {
        moonCache.set(key, data);
      } else if (key.startsWith('POS_')) {
        positionCache.set(key, data);
      }
      pendingQueries.delete(key);

      // Track completion of initial pre-fetch queries
      if (initialKeys.has(key)) {
        initialKeys.delete(key);
        if (initialKeys.size === 0) {
          isInitialLoadComplete = true;
          console.log('[AstronomicalEngine] Initial calculations pre-fetch completed. Ready to dismiss splash.');
        }
      }

      if (updateListener) {
        setTimeout(updateListener, 0);
      }
    }
  };
}

function calculateTimezoneOffset(lat: number, lon: number): number {
  // India Bounding Box: Lat 8.0 to 37.0, Lon 68.0 to 97.0
  if (lat >= 8.0 && lat <= 37.0 && lon >= 68.0 && lon <= 97.0) {
    return 5.5; // IST
  }
  // Nepal check: Lat 26.0 to 31.0, Lon 80.0 to 89.0
  if (lat >= 26.0 && lat <= 31.0 && lon >= 80.0 && lon <= 89.0) {
    return 5.75; // Nepal Standard Time
  }
  // General longitude approximation rounded to nearest 0.5 hours
  return Math.round(lon / 15 * 2) / 2;
}

class SwissEphemerisAstronomicalEngine implements AstronomicalEngine {
  isReady(): boolean {
    return isEngineReady;
  }

  getSolarTimes(lat: number, lon: number, date: Date): SolarTimes {
    const cacheKey = `SOLAR_${lat.toFixed(4)}_${lon.toFixed(4)}_${date.toDateString()}`;
    const cached = solarCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    if (!pendingQueries.has(cacheKey)) {
      pendingQueries.add(cacheKey);
      if (worker) {
        worker.postMessage({
          type: 'CALCULATE_SOLAR',
          key: cacheKey,
          lat,
          lon,
          date: date.toISOString(),
          offsetHours: calculateTimezoneOffset(lat, lon)
        });
      }
    }

    return mockEngine.getSolarTimes(lat, lon, date);
  }

  getMoonTimes(sunriseMin: number, sunsetMin: number, tithiIdx: number, date: Date, lat: number, lon: number): MoonTimes {
    const cacheKey = `MOON_${lat.toFixed(4)}_${lon.toFixed(4)}_${date.toDateString()}`;
    const cached = moonCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    if (!pendingQueries.has(cacheKey)) {
      pendingQueries.add(cacheKey);
      if (worker) {
        worker.postMessage({
          type: 'CALCULATE_MOON',
          key: cacheKey,
          lat,
          lon,
          date: date.toISOString(),
          sunriseMin,
          sunsetMin,
          tithiIdx,
          offsetHours: calculateTimezoneOffset(lat, lon)
        });
      }
    }

    return mockEngine.getMoonTimes(sunriseMin, sunsetMin, tithiIdx, date, lat, lon);
  }

  getPanchangPositions(date: Date): PanchangPositions {
    const cacheKey = `POS_${date.toDateString()}_${date.getHours()}_${date.getMinutes()}`;
    const cached = positionCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    if (!pendingQueries.has(cacheKey)) {
      pendingQueries.add(cacheKey);
      if (worker) {
        worker.postMessage({
          type: 'CALCULATE_COORDINATES',
          key: cacheKey,
          date: date.toISOString()
        });
      }
    }

    return mockEngine.getPanchangPositions(date);
  }
}

export const astronomicalEngine: AstronomicalEngine = new SwissEphemerisAstronomicalEngine();
