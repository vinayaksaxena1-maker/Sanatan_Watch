/**
 * Phase 2A: Swiss Ephemeris Core Integration (Part A)
 *
 * Exposes a Worker Proxy interface with isReady() checking
 * to block UI render during Web Worker compilation.
 */

// Dedicated External Web Worker (Part B) via standard Vite ES module worker instantiation
// This avoids Blob URL restrictions and memory crashes in mobile WebViews / Capacitor APK builds.
import { getSeplBuffer, getSemoBuffer } from './epheAssets';
import { EngineLogger } from './engineLogger';

let panchangCacheClearer: (() => void) | null = null;
export function registerPanchangCacheClearer(fn: () => void) {
  panchangCacheClearer = fn;
}

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
let tWorkerCreated = performance.now();
let tInitStart = 0;
let tEngineReady = 0;

let lastErrorCode: string = 'ENG-006';
let failureTimestamp: string = '';

let cachedSeplBuf: ArrayBuffer | null = null;
let cachedSemoBuf: ArrayBuffer | null = null;

let worker: Worker | null = null;
try {
  worker = new Worker(new URL('./astroWorker.ts', import.meta.url), { type: 'module' });
  EngineLogger.pushLog('INFO', 'Dedicated ES Module Worker instantiated successfully');
} catch (e: any) {
  lastErrorCode = 'ENG-001';
  failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  EngineLogger.pushLog('ERROR', 'Failed to instantiate Web Worker', e?.message || e);
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
let isEngineTimeout = false;
let engineProgressStage: 'WORKER_CREATED' | 'WASM_COMPILED' | 'EPHEMERIS_READY' | 'PANCHANG_PREFETCH' | 'ENGINE_READY' = 'WORKER_CREATED';
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;
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

export function isTimeoutTriggered(): boolean {
  return isEngineTimeout;
}

export function getEngineProgressStage() {
  return engineProgressStage;
}

export function getRetryCount(): number {
  return retryCount;
}

export function getLastDiagnosticInfo() {
  const elapsedSec = ((performance.now() - tWorkerCreated) / 1000).toFixed(1);
  return {
    errorCode: lastErrorCode,
    timestamp: failureTimestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
    elapsedTime: `${elapsedSec}s`
  };
}

export function isMaxRetriesReached(): boolean {
  return retryCount >= MAX_RETRIES;
}

export function enableLimitedMode() {
  EngineLogger.logDebug('User selected Limited Mode (Mock Data). Fallback activated.');
  isUsingMockFallback = true;
  isEngineReady = true;
  isInitialLoadComplete = true;
  isEngineTimeout = false;
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
    timeoutTimer = null;
  }
  if (updateListener) {
    updateListener();
  }
}

export function extendInitializationTimeout() {
  EngineLogger.logDebug('Extending initialization timeout window by 30 seconds.');
  isEngineTimeout = false;
  start30SecTimeout();
  if (updateListener) {
    updateListener();
  }
}

export function retryEngineInitialization() {
  if (retryCount >= MAX_RETRIES) {
    lastErrorCode = 'ENG-003';
    failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    EngineLogger.logCriticalFailure('ENG-003', 'Maximum Retry Limit Reached', { retryCount });
    isEngineTimeout = true;
    if (updateListener) {
      updateListener();
    }
    return;
  }

  retryCount += 1;
  EngineLogger.logDebug(`Retry Attempt ${retryCount}`);

  isEngineTimeout = false;
  isEngineReady = false;
  isInitialLoadComplete = false;
  engineProgressStage = 'WORKER_CREATED';
  
  if (worker) {
    try {
      tInitStart = performance.now();
      if (!cachedSeplBuf || !cachedSemoBuf) {
        lastErrorCode = 'ENG-002';
        failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        EngineLogger.logCriticalFailure('ENG-002', 'Retry failed: cached ephemeris buffers unavailable', {});
        if (updateListener) updateListener();
        return;
      }
      const seplBuf = cachedSeplBuf.slice(0);
      const semoBuf = cachedSemoBuf.slice(0);
      worker.postMessage({
        type: 'INIT',
        seplBuf,
        semoBuf,
        appOrigin: window.location.origin
      }, [seplBuf, semoBuf]);
      start30SecTimeout();
    } catch (err: any) {
      lastErrorCode = 'ENG-002';
      failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      EngineLogger.logCriticalFailure('ENG-002', 'Retry init failed', { error: err });
    }
  }
  if (updateListener) {
    updateListener();
  }
}

function start30SecTimeout() {
  if (timeoutTimer) clearTimeout(timeoutTimer);
  timeoutTimer = setTimeout(() => {
    if (!isReady()) {
      lastErrorCode = 'ENG-006';
      failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      EngineLogger.logDebug('30-second initialization timeout reached before application readiness. Prompting user decision.');
      isEngineTimeout = true;
      if (updateListener) {
        updateListener();
      }
    }
  }, 30000);
}

if (typeof window !== 'undefined') {
  if (worker) {
    try {
      tInitStart = performance.now();
      // Cache buffers BEFORE first transfer so retry can reuse them
      cachedSeplBuf = getSeplBuffer().slice(0);
      cachedSemoBuf = getSemoBuffer().slice(0);
      const seplBuf = cachedSeplBuf.slice(0); // transfer a copy, keep cache intact
      const semoBuf = cachedSemoBuf.slice(0);
      
      EngineLogger.pushLog('INFO', `Posting INIT message to Worker (sepl: ${(seplBuf.byteLength/1024).toFixed(0)}KB, semo: ${(semoBuf.byteLength/1024).toFixed(0)}KB)`);
      worker.postMessage({
        type: 'INIT',
        seplBuf,
        semoBuf,
        appOrigin: window.location.origin
      }, [seplBuf, semoBuf]);
    } catch (err: any) {
      lastErrorCode = 'ENG-005';
      failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      EngineLogger.logCriticalFailure('ENG-005', 'Failed to load inline ephemeris buffers', { error: err });
      isEngineTimeout = true;
      if (updateListener) {
        updateListener();
      }
    }

    start30SecTimeout();
  } else {
    lastErrorCode = 'ENG-001';
    failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    EngineLogger.logCriticalFailure('ENG-001', 'Web Worker allocation blocked by browser/environment');
    isEngineTimeout = true;
  }
}

if (worker) {
  worker.onmessage = (event: MessageEvent) => {
    const { type, key, data, message, stage, timings } = event.data;

    if (type === 'PROGRESS') {
      if (stage === 'FETCHING_WASM') {
        EngineLogger.pushLog('INFO', `[Stage] Fetching WASM Binary...`, message);
      } else if (stage === 'WASM_FETCHED') {
        EngineLogger.pushLog('INFO', `[Stage] WASM Downloaded successfully`, message);
      } else if (stage === 'COMPILING_WASM') {
        engineProgressStage = 'WORKER_CREATED';
        EngineLogger.pushLog('INFO', `[Stage] Compiling WebAssembly module...`, message);
      } else if (stage === 'WASM_PRINT') {
        EngineLogger.pushLog('INFO', `[WASM Output] ${message}`);
      } else if (stage === 'WASM_PRINT_ERR') {
        EngineLogger.pushLog('WARN', `[WASM Err] ${message}`);
      } else if (stage === 'WASM_COMPILED') {
        engineProgressStage = 'WASM_COMPILED';
        EngineLogger.pushLog('INFO', `[Stage] WASM Compiled`, message || `${timings?.wasmTime?.toFixed(2) || 0}ms`);
      } else if (stage === 'WRITING_EPHEMERIS') {
        EngineLogger.pushLog('INFO', `[Stage] Writing Ephemeris Files`, message);
      } else if (stage === 'EPHEMERIS_READY') {
        engineProgressStage = 'EPHEMERIS_READY';
        EngineLogger.pushLog('INFO', `[Stage] Ephemeris Files Ready`, message || `${timings?.ephemerisTime?.toFixed(2) || 0}ms`);
      } else if (stage === 'ALLOCATING_POINTERS') {
        EngineLogger.pushLog('INFO', `[Stage] Allocating C Memory Pointers...`, message);
      } else {
        EngineLogger.pushLog('INFO', `[Stage] ${stage}`, message);
      }
      if (updateListener) {
        updateListener();
      }
      return;
    }

    if (type === 'READY') {
      tEngineReady = performance.now();
      isEngineReady = true;
      engineProgressStage = 'PANCHANG_PREFETCH';
      isEngineTimeout = false;
      retryCount = 0;

      const totalDuration = tEngineReady - tWorkerCreated;
      const workerCreationDuration = tInitStart - tWorkerCreated;
      const readyDuration = tEngineReady - tInitStart;

      EngineLogger.logDiagnostics({
        workerCreationTime: workerCreationDuration,
        wasmCompilationTime: timings?.wasmTime,
        ephemerisLoadingTime: timings?.ephemerisTime,
        engineReadyTime: readyDuration,
        totalDuration: totalDuration,
        retryCount: retryCount,
        result: 'SUCCESS'
      });

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
      if (updateListener) {
        updateListener();
      }
      return;
    }

    if (type === 'ERROR') {
      if (message && message.includes('Engine not ready')) {
        EngineLogger.pushLog('INFO', `Worker queued pre-ready query for [${key || 'GENERAL'}]`);
        return;
      }
      lastErrorCode = 'ENG-004';
      failureTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      EngineLogger.logCriticalFailure('ENG-004', `Worker error for key: ${key || 'GENERAL'}`, { message });
      isEngineTimeout = true;
      if (key) {
        pendingQueries.delete(key);
      }
      if (updateListener) {
        updateListener();
      }
      return;
    }

    if (type === 'RESULT') {
      EngineLogger.pushLog('INFO', `Received RESULT for [${key}] -> Saved to Cache & Cleared PanchangCache`);
      if (key.startsWith('SOLAR_')) {
        solarCache.set(key, data);
      } else if (key.startsWith('MOON_')) {
        moonCache.set(key, data);
      } else if (key.startsWith('POS_')) {
        positionCache.set(key, data);
      }
      pendingQueries.delete(key);
      if (panchangCacheClearer) {
        try { panchangCacheClearer(); } catch {}
      }

      // Auto-reset mock fallback whenever real Swiss Ephemeris data arrives
      if (isUsingMockFallback && !isEngineTimeout) {
        isUsingMockFallback = false;
        EngineLogger.pushLog('INFO', 'Swiss Ephemeris calculation result received. Mock fallback auto-reset. Badge hidden.');
      }

      if (initialKeys.has(key)) {
        initialKeys.delete(key);
        if (initialKeys.size === 0) {
          isInitialLoadComplete = true;
          engineProgressStage = 'ENGINE_READY';
          if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
          }
          EngineLogger.logDebug('Initial calculations pre-fetch completed. Application is Ready. Clearing timeout.');
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
      EngineLogger.pushLog('WARN', `Cache MISS [${cacheKey}] -> Sent CALCULATE_SOLAR to worker. Returning Mock Solar fallback temporarily.`);
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
      EngineLogger.pushLog('WARN', `Cache MISS [${cacheKey}] -> Sent CALCULATE_MOON to worker. Returning Mock Moon fallback temporarily.`);
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
      EngineLogger.pushLog('WARN', `Cache MISS [${cacheKey}] -> Sent CALCULATE_COORDINATES to worker. Returning Mock Positions (Sun/Moon: मेष) temporarily.`);
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
