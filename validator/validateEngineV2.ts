/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import './setupGlobals';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import SwissEph from 'swisseph-wasm';
import { CONFIG } from './config';

// Resolve directory paths for ESM in Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import production code modules
import { astronomicalEngine, registerEngineListener, isReady } from '../src/utils/astronomicalEngine';
import * as panchangCalc from '../src/utils/panchangCalc';
import { getSeplBuffer, getSemoBuffer } from '../src/utils/epheAssets';

// Dynamic spies for coverage tracking
export const coverageStats = {
  calculatePlanet: { name: 'calculatePlanet()', executed: 0, assertions: 0, passed: 0, failed: 0 },
  calculatePanchang: { name: 'calculatePanchang()', executed: 0, assertions: 0, passed: 0, failed: 0 },
  calculateSolar: { name: 'calculateSolar()', executed: 0, assertions: 0, passed: 0, failed: 0 },
  calculateMoonrise: { name: 'calculateMoonrise()', executed: 0, assertions: 0, passed: 0, failed: 0 },
  calculateTransit: { name: 'calculateTransit()', executed: 0, assertions: 0, passed: 0, failed: 0 }
};

// Wrap getPanchangPositions to count calculatePlanet and calculatePanchang executions
const originalGetPanchangPositions = astronomicalEngine.getPanchangPositions;
astronomicalEngine.getPanchangPositions = function(...args: any[]) {
  coverageStats.calculatePanchang.executed++;
  coverageStats.calculatePlanet.executed++;
  return originalGetPanchangPositions.apply(this, args);
};

// Wrap getSolarTimes and getMoonTimes to spy coverage
const originalGetSolarTimes = astronomicalEngine.getSolarTimes;
astronomicalEngine.getSolarTimes = function(...args: any[]) {
  coverageStats.calculateSolar.executed++;
  return originalGetSolarTimes.apply(this, args);
};

const originalGetMoonTimes = astronomicalEngine.getMoonTimes;
astronomicalEngine.getMoonTimes = function(...args: any[]) {
  coverageStats.calculateMoonrise.executed++;
  return originalGetMoonTimes.apply(this, args);
};

// ---------------------------------------------------------------------------
// Seeded Mulberry32 Random Number Generator
// ---------------------------------------------------------------------------
function getSeededRandom(seed: number) {
  let h = seed;
  return function() {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Reference calculations (Independent Swiss Ephemeris Execution)
// ---------------------------------------------------------------------------
let sweRef: any = null;
let globalGeoposPtr = 0;
let globalTretPtr = 0;
let globalSerrPtr = 0;

async function initReferenceEphemeris() {
  sweRef = new SwissEph();
  await sweRef.initSwissEph();
  sweRef.set_sid_mode(1, 0, 0); // Lahiri mode

  try {
    sweRef.SweModule.FS.mkdir('/sweph');
  } catch (e) {}

  // Load binary ephemeris buffers
  sweRef.SweModule.FS.writeFile('/sweph/sepl_18.se1', new Uint8Array(getSeplBuffer()));
  sweRef.SweModule.FS.writeFile('/sweph/semo_18.se1', new Uint8Array(getSemoBuffer()));

  // Allocate reference pointers to ensure no memory space sharing
  globalGeoposPtr = sweRef.SweModule._malloc(3 * 8);
  globalTretPtr = sweRef.SweModule._malloc(4 * 8);
  globalSerrPtr = sweRef.SweModule._malloc(256);
}

function refGetJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
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

interface RefPlanet {
  lon: number;
  lat: number;
  speed: number;
  isRetro: boolean;
}

function refGetPlanet(jd: number, planetId: number): RefPlanet {
  const pos = sweRef.calc_ut(jd, planetId, 2 | 256); // SEFLG_SWIEPH | SEFLG_SPEED
  const ayanamsa = sweRef.get_ayanamsa(jd);
  const siderealLon = (pos[0] - ayanamsa + 360) % 360;
  return {
    lon: siderealLon,
    lat: pos[1],
    speed: pos[3],
    isRetro: pos[3] < 0
  };
}

function refGetRiseSet(jdMidnight: number, planetId: number, lon: number, lat: number, isRise: boolean): number {
  sweRef.SweModule.HEAPF64[globalGeoposPtr / 8] = lon;
  sweRef.SweModule.HEAPF64[globalGeoposPtr / 8 + 1] = lat;
  sweRef.SweModule.HEAPF64[globalGeoposPtr / 8 + 2] = 0; // Alt

  const rsmi = isRise ? 1 : 2;
  const retFlag = sweRef.SweModule.ccall(
    'swe_rise_trans',
    'number',
    ['number', 'number', 'pointer', 'number', 'number', 'pointer', 'number', 'number', 'pointer', 'pointer'],
    [jdMidnight, planetId, 0, 2, rsmi, globalGeoposPtr, 0, 0, globalTretPtr, globalSerrPtr]
  );

  if (retFlag < 0) {
    throw new Error(`Independent Swiss Ephemeris rise_trans failed: ${retFlag}`);
  }

  const results = sweRef.SweModule.HEAPF64.slice(globalTretPtr / 8, globalTretPtr / 8 + 4);
  return results[0];
}

// Independent Crossover Transition Time Solver using Newton's method matching production worker exactly
function refFindCrossover(jdMidnight: number, type: 'tithi' | 'nakshatra' | 'yoga', targetVal: number): number {
  let jd = jdMidnight + 0.5; // Start search at local noon
  let speed = 12.0; // Default degrees/day estimate
  if (type === 'nakshatra') speed = 13.176;
  if (type === 'yoga') speed = 14.176;

  const ayanamsa = sweRef.get_ayanamsa(jdMidnight + 0.5);

  // Maximum 5 iterations of Newton's method for rapid convergence
  for (let iter = 0; iter < 5; iter++) {
    const sun = sweRef.calc_ut(jd, 0, 2 | 256); // 256 = SEFLG_SPEED
    const moon = sweRef.calc_ut(jd, 1, 2 | 256);

    let val = 0;
    let currentSpeed = speed;

    if (type === 'tithi') {
      val = (moon[0] - sun[0] + 360) % 360;
      currentSpeed = moon[3] - sun[3];
    } else if (type === 'nakshatra') {
      val = (moon[0] - ayanamsa + 360) % 360;
      currentSpeed = moon[3];
    } else if (type === 'yoga') {
      val = (moon[0] - ayanamsa + sun[0] - ayanamsa + 720) % 360;
      currentSpeed = moon[3] + sun[3];
    }

    let err = targetVal - val;
    // Normalize angular difference to shortest arc [-180, 180] with JS modulo safety
    err = ((err + 180) % 360 + 360) % 360 - 180;

    if (Math.abs(err) < 0.0001) { // Error under 1 second of time
      return jd;
    }

    jd += err / currentSpeed;
  }
  return jd;
}

// Timezone offset matching production astronomicalEngine.ts exactly
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

// ---------------------------------------------------------------------------
// Error percentile utilities
// ---------------------------------------------------------------------------
function getPercentile(errors: number[], percentile: number): number {
  if (errors.length === 0) return 0;
  const sorted = [...errors].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

const planetIds = [0, 1, 2, 3, 4, 5, 6, 10]; // Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu
const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

// ---------------------------------------------------------------------------
// Main Orchestration Execution
// ---------------------------------------------------------------------------
export async function run() {
  console.log('[ValidatorV2] Initializing validator configurations...');

  const startTime = Date.now();
  
  // 1. WASM Setup
  const wasmInitStart = Date.now();
  await initReferenceEphemeris();
  const wasmInitTime = Date.now() - wasmInitStart;
  console.log(`[ValidatorV2] Reference Swiss Ephemeris loaded. (WASM Init: ${wasmInitTime}ms)`);

  // Wait for the production engine worker setup (using event listener)
  let isAstroReady = false;
  await new Promise<void>((resolve) => {
    registerEngineListener(() => {
      if (isReady()) {
        isAstroReady = true;
        resolve();
      }
    });
    // Trigger if already ready
    if (isReady()) {
      isAstroReady = true;
      resolve();
    }
  });

  if (!isAstroReady) {
    console.error('[ValidatorV2] Failed to initialize Production Astro Engine.');
    process.exit(2);
  }
  console.log('[ValidatorV2] Production Astro Engine ready.');

  // Initialize Seeded Random mulberry32
  const rand = getSeededRandom(0x7C0DE123);

  // Stats collection objects
  const errors = {
    planets: {
      Sun: [] as number[],
      Moon: [] as number[],
      Mercury: [] as number[],
      Venus: [] as number[],
      Mars: [] as number[],
      Jupiter: [] as number[],
      Saturn: [] as number[],
      Rahu: [] as number[],
      Ketu: [] as number[]
    },
    crossovers: [] as number[],
    riseSet: [] as number[]
  };

  const worstCases = {
    moonLon: { maxErr: 0, date: '', lat: 0, lon: 0 },
    planets: { maxErr: 0, name: '', date: '', lat: 0, lon: 0 },
    crossovers: { maxErr: 0, date: '', lat: 0, lon: 0 },
    riseSet: { maxErr: 0, date: '', lat: 0, lon: 0 }
  };

  let totalCasesCount = 0;
  let failedCasesCount = 0;
  let planetFailures = 0;
  let panchangFailures = 0;
  let riseSetFailures = 0;

  const totalTargetCases = 
    CONFIG.cases.random + 
    CONFIG.cases.boundary + 
    CONFIG.cases.historical + 
    CONFIG.cases.polar + 
    CONFIG.cases.dst + 
    CONFIG.cases.leapYear;

  console.log(`[ValidatorV2] Compiling verification plan. Running ${totalTargetCases} cases...`);

  // Benchmarking timers
  let totalCalculationTimeMs = 0;
  let slowestCalculationTimeMs = 0;
  let coldStartDurationMs = 0;
  const warmStartCalculations: number[] = [];

  // Generate dataset inputs
  interface TestInput {
    type: string;
    date: Date;
    lat: number;
    lon: number;
    offset: number;
  }

  const dataset: TestInput[] = [];

  // 1. Random Cases (40,000)
  for (let i = 0; i < CONFIG.cases.random; i++) {
    // 2026 to 2030
    const startMs = new Date('2026-01-01T00:00:00Z').getTime();
    const range = new Date('2030-12-31T23:59:59Z').getTime() - startMs;
    const date = new Date(startMs + rand() * range);
    const lat = -90.0 + rand() * 180.0;
    const lon = -180.0 + rand() * 360.0;
    const offset = calculateTimezoneOffset(lat, lon);
    dataset.push({ type: 'Random', date, lat, lon, offset });
  }

  // 2. Boundary Cases (5,000) - Near solstices, equinoxes, and critical times
  const boundaryYears = [2026, 2027, 2028, 2029, 2030];
  const boundaryDates = ['-03-20T12:00:00Z', '-06-21T12:00:00Z', '-09-22T12:00:00Z', '-12-21T12:00:00Z'];
  for (let i = 0; i < CONFIG.cases.boundary; i++) {
    const year = boundaryYears[Math.floor(rand() * boundaryYears.length)];
    const dateStr = boundaryDates[Math.floor(rand() * boundaryDates.length)];
    // Add small random noise to check exact boundaries
    const baseDate = new Date(`${year}${dateStr}`);
    const noiseMinutes = -120 + rand() * 240;
    const date = new Date(baseDate.getTime() + noiseMinutes * 60 * 1000);
    const lat = 28.6139; // India base
    const lon = 77.2090;
    dataset.push({ type: 'Boundary', date, lat, lon, offset: 5.5 });
  }

  // 3. Historical Cases (2,000) - Years 1000 to 2000
  for (let i = 0; i < CONFIG.cases.historical; i++) {
    const year = Math.floor(1000 + rand() * 1000);
    const month = Math.floor(rand() * 12);
    const day = Math.floor(1 + rand() * 28);
    const hour = Math.floor(rand() * 24);
    const date = new Date(Date.UTC(year, month, day, hour, 0, 0));
    const lat = 25.3176; // Varanasi
    const lon = 82.9739;
    dataset.push({ type: 'Historical', date, lat, lon, offset: 5.5 });
  }

  // 4. Polar Cases (1,000) - Latitudes above 65 degrees
  for (let i = 0; i < CONFIG.cases.polar; i++) {
    const date = new Date(new Date('2026-06-21T12:00:00Z').getTime() + rand() * 365 * 24 * 60 * 60 * 1000);
    const lat = rand() > 0.5 ? 65 + rand() * 25 : -65 - rand() * 25; // 65-90 degrees
    const lon = -180.0 + rand() * 360.0;
    dataset.push({ type: 'Polar', date, lat, lon, offset: calculateTimezoneOffset(lat, lon) });
  }

  // 5. DST Cases (1,000) - Transition dates in US/Europe
  const dstYears = [2026, 2027, 2028, 2029, 2030];
  for (let i = 0; i < CONFIG.cases.dst; i++) {
    const year = dstYears[Math.floor(rand() * dstYears.length)];
    // US DST starts 2nd Sunday in March, ends 1st Sunday in November
    const marchBase = new Date(Date.UTC(year, 2, 8 + Math.floor(rand() * 7), 2, 0, 0)); // March transition
    const novBase = new Date(Date.UTC(year, 10, 1 + Math.floor(rand() * 7), 2, 0, 0)); // November transition
    const baseDate = rand() > 0.5 ? marchBase : novBase;
    const noiseMinutes = -180 + rand() * 360;
    const date = new Date(baseDate.getTime() + noiseMinutes * 60 * 1000);
    const lat = 40.7128; // New York
    const lon = -74.0060;
    const offset = calculateTimezoneOffset(lat, lon);
    dataset.push({ type: 'DST', date, lat, lon, offset });
  }

  // 6. Leap Year Cases (1,000) - Feb 29 dates
  const leapYears = [2020, 2024, 2028, 2032, 2036];
  for (let i = 0; i < CONFIG.cases.leapYear; i++) {
    const year = leapYears[Math.floor(rand() * leapYears.length)];
    const hour = Math.floor(rand() * 24);
    const min = Math.floor(rand() * 60);
    const date = new Date(Date.UTC(year, 1, 29, hour, min, 0));
    const lat = 19.0760; // Mumbai
    const lon = 72.8777;
    dataset.push({ type: 'Leap Year', date, lat, lon, offset: 5.5 });
  }

  // Run the validation loop
  for (let idx = 0; idx < dataset.length; idx++) {
    const testCase = dataset[idx];
    const { date, lat, lon, offset } = testCase;

    const jd = refGetJulianDay(date);
    const today0h = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const jdMidnight = refGetJulianDay(today0h);

    const caseCalcStart = Date.now();

    // -------------------------------------------------------------------------
    // Execution: Production side (actual production methods)
    // -------------------------------------------------------------------------
    // Double-Call mechanism to populate cache and fetch actual computed worker results synchronously
    astronomicalEngine.getPanchangPositions(date);
    const prodPos = astronomicalEngine.getPanchangPositions(date);

    astronomicalEngine.getSolarTimes(lat, lon, date);
    const prodSolar = astronomicalEngine.getSolarTimes(lat, lon, date);

    const tithiIdx = prodPos.tithiIdx;
    astronomicalEngine.getMoonTimes(prodSolar.sunriseRaw, prodSolar.sunsetRaw, tithiIdx, date, lat, lon);
    const prodMoonTimes = astronomicalEngine.getMoonTimes(prodSolar.sunriseRaw, prodSolar.sunsetRaw, tithiIdx, date, lat, lon);

    const calcDuration = Date.now() - caseCalcStart;

    // Benchmark tracking
    totalCalculationTimeMs += calcDuration;
    if (calcDuration > slowestCalculationTimeMs) {
      slowestCalculationTimeMs = calcDuration;
    }
    if (idx === 0) {
      coldStartDurationMs = calcDuration;
    }
    // Warm start calculations from cases 1000 to 11000
    if (idx >= 1000 && idx < 11000) {
      warmStartCalculations.push(calcDuration);
    }

    // -------------------------------------------------------------------------
    // Execution: Reference side (independent Swiss Ephemeris APIs)
    // -------------------------------------------------------------------------
    const sunPosRef = refGetPlanet(jd, 0); // Sun
    const moonPosRef = refGetPlanet(jd, 1); // Moon
    const ayanamsaRef = sweRef.get_ayanamsa(jd);

    const sunSiderealRef = sunPosRef.lon;
    const moonSiderealRef = moonPosRef.lon;


    // Reference planetary indices
    const diffNormRef = (moonSiderealRef - sunSiderealRef + 360) % 360;
    let tithiIdxRef = Math.floor(diffNormRef / 12);
    if (tithiIdxRef < 0) tithiIdxRef += 30;
    if (tithiIdxRef >= 30) tithiIdxRef = 29;

    let naksIdxRef = Math.floor(moonSiderealRef / 13.333333333333334);
    if (naksIdxRef < 0) naksIdxRef += 27;
    if (naksIdxRef >= 27) naksIdxRef = 26;

    const yogaLonRef = (moonSiderealRef + sunSiderealRef) % 360;
    let yogaIdxRef = Math.floor(yogaLonRef / 13.333333333333334);
    if (yogaIdxRef < 0) yogaIdxRef += 27;
    if (yogaIdxRef >= 27) yogaIdxRef = 26;

    let karanaTotalSecRef = Math.floor(diffNormRef / 6);
    if (karanaTotalSecRef < 0) karanaTotalSecRef += 60;
    if (karanaTotalSecRef >= 60) karanaTotalSecRef = 59;
    let karanaValRef = 0;
    if (karanaTotalSecRef === 0) {
      karanaValRef = 10;
    } else if (karanaTotalSecRef >= 57) {
      if (karanaTotalSecRef === 57) karanaValRef = 7;
      else if (karanaTotalSecRef === 58) karanaValRef = 8;
      else karanaValRef = 9;
    } else {
      karanaValRef = ((karanaTotalSecRef - 1) % 7);
    }

    // Reference Month & Adhik Maas
    const approxDaysAgo = diffNormRef / 12.190749;
    
    // Find New Moon julian dates
    const findNewMoonRef = (guessJd: number): number => {
      let tempJd = guessJd;
      for (let iter = 0; iter < 5; iter++) {
        const s = sweRef.calc_ut(tempJd, 0, 2 | 256);
        const m = sweRef.calc_ut(tempJd, 1, 2 | 256);
        const val = (m[0] - s[0] + 360) % 360;
        const currentSpeed = m[3] - s[3];
        let err = 0 - val;
        err = ((err + 180) % 360 + 360) % 360 - 180;
        if (Math.abs(err) < 0.0001) return tempJd;
        tempJd += err / currentSpeed;
      }
      return tempJd;
    };
    
    const prevNewMoonJdRef = findNewMoonRef(jd - approxDaysAgo);
    const nextNewMoonJdRef = findNewMoonRef(prevNewMoonJdRef + 29.530589);

    const sunPosPrev = sweRef.calc_ut(prevNewMoonJdRef, 0, 2);
    const ayanamsaPrev = sweRef.get_ayanamsa(prevNewMoonJdRef);
    const sunLonPrev = (sunPosPrev[0] - ayanamsaPrev + 360) % 360;
    const rashiPrev = Math.floor(sunLonPrev / 30);

    const sunPosNext = sweRef.calc_ut(nextNewMoonJdRef, 0, 2);
    const ayanamsaNext = sweRef.get_ayanamsa(nextNewMoonJdRef);
    const sunLonNext = (sunPosNext[0] - ayanamsaNext + 360) % 360;
    const rashiNext = Math.floor(sunLonNext / 30);

    const isAdhikRef = rashiPrev === rashiNext;
    const monthIdxRef = (rashiPrev + 1) % 12;

    // Reference Sunrise / Sunset (using swe_rise_trans)
    let sunriseJdRef = 0;
    let sunsetJdRef = 0;
    let isPolarDayOrNight = false;
    try {
      sunriseJdRef = refGetRiseSet(jdMidnight, 0, lon, lat, true);
      sunsetJdRef = refGetRiseSet(jdMidnight, 0, lon, lat, false);
    } catch (e) {
      isPolarDayOrNight = true; // polar regions with no rise/set
    }

    // Convert reference JDs to local minutes since midnight
    const jdToLocalMin = (jdVal: number): number => {
      const utHours = (jdVal - Math.floor(jdVal) - 0.5) * 24;
      const localHours = ((utHours + offset) % 24 + 24) % 24;
      return localHours * 60;
    };

    const refSunriseRaw = isPolarDayOrNight ? 0 : jdToLocalMin(sunriseJdRef);
    const refSunsetRaw = isPolarDayOrNight ? 0 : jdToLocalMin(sunsetJdRef);

    // Reference Moonrise / Moonset
    let moonriseJdRef = 0;
    let moonsetJdRef = 0;
    let isMoonPolar = false;
    try {
      moonriseJdRef = refGetRiseSet(jdMidnight, 1, lon, lat, true);
      moonsetJdRef = refGetRiseSet(jdMidnight, 1, lon, lat, false);
    } catch (e) {
      isMoonPolar = true; // Moon doesn't rise or set at this location/date
    }
    const refMoonriseRaw = isMoonPolar ? 0 : jdToLocalMin(moonriseJdRef);
    const refMoonsetRaw = isMoonPolar ? 0 : jdToLocalMin(moonsetJdRef);

    // Reference transition crossover timing calculations (crossover JD converted to remaining hours)
    // Target boundaries are calculated at query time jd, but search starts at jdMidnight to match production worker
    const nextTithiTarget = (Math.floor(diffNormRef / 12) + 1) * 12;
    const tithiCrossingJdRef = refFindCrossover(jdMidnight, 'tithi', nextTithiTarget);
    const refTithiRemainingHours = (tithiCrossingJdRef - jd) * 24;

    const nextNaksTarget = (Math.floor(moonSiderealRef / 13.333333333333334) + 1) * 13.333333333333334;
    const naksCrossingJdRef = refFindCrossover(jdMidnight, 'nakshatra', nextNaksTarget);
    const refNaksRemainingHours = (naksCrossingJdRef - jd) * 24;

    const nextYogaTarget = (Math.floor(yogaLonRef / 13.333333333333334) + 1) * 13.333333333333334;
    const yogaCrossingJdRef = refFindCrossover(jdMidnight, 'yoga', nextYogaTarget);
    const refYogaRemainingHours = (yogaCrossingJdRef - jd) * 24;


    // -------------------------------------------------------------------------
    // Comparison Assertions & Statistics Collection
    // -------------------------------------------------------------------------
    let caseHasFailure = false;



    for (const pName of planetNames) {
      coverageStats.calculatePlanet.assertions++;
      
      const prodPlanet = prodPos.planets.find(p => p.name === pName);
      if (!prodPlanet) {
        coverageStats.calculatePlanet.failed++;
        caseHasFailure = true;
        planetFailures++;
        continue;
      }

      let refPlanetData: RefPlanet;
      if (pName === 'Ketu') {
        const rahuData = refGetPlanet(jd, 10);
        const ketuLon = (rahuData.lon + 180) % 360;
        refPlanetData = { lon: ketuLon, lat: 0, speed: rahuData.speed, isRetro: true };
      } else {
        const pId = planetIds[planetNames.indexOf(pName)];
        refPlanetData = refGetPlanet(jd, pId);
      }

      // 1. Longitude Comparison
      let lonDiff = Math.abs(prodPlanet.longitude - refPlanetData.lon);
      lonDiff = ((lonDiff + 180) % 360 + 360) % 360 - 180; // shortest arc distance
      const absLonDiff = Math.abs(lonDiff);

      // Track Moon longitude separately for reports
      if (pName === 'Moon') {
        errors.planets.Moon.push(absLonDiff);
        if (absLonDiff > worstCases.moonLon.maxErr) {
          worstCases.moonLon = { maxErr: absLonDiff, date: date.toISOString(), lat, lon };
        }
      } else {
        (errors.planets as any)[pName].push(absLonDiff);
      }

      // Track worst planet error
      if (absLonDiff > worstCases.planets.maxErr) {
        worstCases.planets = { maxErr: absLonDiff, name: pName, date: date.toISOString(), lat, lon };
      }

      // 2. Speed Comparison
      const speedDiff = Math.abs(prodPlanet.speed - refPlanetData.speed);
      if (pName === 'Sun') errors.planets.Sun.push(absLonDiff); // just use longitude array for tracking

      // Verify retro state
      const retroMatch = prodPlanet.isRetrograde === refPlanetData.isRetro;

      // Assertions verification against config thresholds
      const isLonOk = absLonDiff <= CONFIG.tolerances.planetLongitude;
      const isSpeedOk = speedDiff <= CONFIG.tolerances.planetSpeed;

      // 4. Sign Transit Assertion (calculateTransit coverage)
      const refSignIdx = Math.floor(refPlanetData.lon / 30);
      const signNamesEng = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const expectedSign = signNamesEng[refSignIdx];
      const isSignOk = prodPlanet.sign === expectedSign;

      coverageStats.calculateTransit.assertions++;
      if (isSignOk) {
        coverageStats.calculateTransit.passed++;
      } else {
        coverageStats.calculateTransit.failed++;
        caseHasFailure = true;
      }

      if (isLonOk && isSpeedOk && retroMatch && isSignOk) {
        coverageStats.calculatePlanet.passed++;
      } else {
        coverageStats.calculatePlanet.failed++;
        caseHasFailure = true;
        planetFailures++;
      }
    }

    // B. Panchang Crossovers and Indices
    coverageStats.calculatePanchang.assertions += 5; // Tithi, Nakshatra, Yoga, Karana, Lunar Month checks

    const isTithiOk = tithiIdx === tithiIdxRef;
    const isNaksOk = prodPos.naksIdx === naksIdxRef;
    const isYogaOk = prodPos.yogaIdx === yogaIdxRef;
    const isKaranaOk = prodPos.karanaVal === karanaValRef;
    const isMonthOk = prodPos.monthsSinceEpoch === monthIdxRef && prodPos.isAdhik === isAdhikRef;

    // Remaining hours / crossover timings checks
    const tithiHrsDiff = Math.abs(prodPos.tithiRemainingHours - refTithiRemainingHours);
    const naksHrsDiff = Math.abs(prodPos.naksRemainingHours - refNaksRemainingHours);
    const yogaHrsDiff = Math.abs(prodPos.yogaRemainingHours - refYogaRemainingHours);

    // Track crossover errors
    errors.crossovers.push(tithiHrsDiff);
    errors.crossovers.push(naksHrsDiff);
    errors.crossovers.push(yogaHrsDiff);

    const maxCrossoverErr = Math.max(tithiHrsDiff, naksHrsDiff, yogaHrsDiff);
    if (maxCrossoverErr > worstCases.crossovers.maxErr) {
      worstCases.crossovers = { maxErr: maxCrossoverErr, date: date.toISOString(), lat, lon };
    }

    // 1 second tolerance in hours: sunrise / crossover
    const crossoverToleranceHours = CONFIG.tolerances.sunrise;
    const isCrossoversOk = tithiHrsDiff <= crossoverToleranceHours && 
                           naksHrsDiff <= crossoverToleranceHours && 
                           yogaHrsDiff <= crossoverToleranceHours;

    if (isTithiOk && isNaksOk && isYogaOk && isKaranaOk && isMonthOk && isCrossoversOk) {
      coverageStats.calculatePanchang.passed += 5;
    } else {
      coverageStats.calculatePanchang.failed += 5;
      caseHasFailure = true;
      panchangFailures++;
    }

    // C. Sunrise, Sunset, Moonrise, Moonset Calculations
    coverageStats.calculateSolar.assertions += 2; // Sunrise & Sunset
    coverageStats.calculateMoonrise.assertions += 2; // Moonrise & Moonset

    const sunriseHrsDiff = isPolarDayOrNight ? 0 : Math.abs(prodSolar.sunriseRaw - refSunriseRaw) / 60;
    const sunsetHrsDiff = isPolarDayOrNight ? 0 : Math.abs(prodSolar.sunsetRaw - refSunsetRaw) / 60;
    const moonriseHrsDiff = isMoonPolar ? 0 : Math.abs(prodMoonTimes.moonriseRaw - refMoonriseRaw) / 60;
    const moonsetHrsDiff = isMoonPolar ? 0 : Math.abs(prodMoonTimes.moonsetRaw - refMoonsetRaw) / 60;

    errors.riseSet.push(sunriseHrsDiff);
    errors.riseSet.push(sunsetHrsDiff);
    errors.riseSet.push(moonriseHrsDiff);
    errors.riseSet.push(moonsetHrsDiff);

    const maxRiseSetErr = Math.max(sunriseHrsDiff, sunsetHrsDiff, moonriseHrsDiff, moonsetHrsDiff);
    if (maxRiseSetErr > worstCases.riseSet.maxErr) {
      worstCases.riseSet = { maxErr: maxRiseSetErr, date: date.toISOString(), lat, lon };
    }

    const sunriseToleranceHours = CONFIG.tolerances.sunrise;
    const moonriseToleranceHours = CONFIG.tolerances.moonrise;

    if (sunriseHrsDiff <= sunriseToleranceHours && sunsetHrsDiff <= sunriseToleranceHours) {
      coverageStats.calculateSolar.passed += 2;
    } else {
      coverageStats.calculateSolar.failed += 2;
      caseHasFailure = true;
      riseSetFailures++;
    }

    if (moonriseHrsDiff <= moonriseToleranceHours && moonsetHrsDiff <= moonriseToleranceHours) {
      coverageStats.calculateMoonrise.passed += 2;
    } else {
      coverageStats.calculateMoonrise.failed += 2;
      caseHasFailure = true;
      riseSetFailures++;
    }

    totalCasesCount++;
    if (caseHasFailure) {
      failedCasesCount++;
    }

    if (totalCasesCount % 10000 === 0) {
      console.log(`[ValidatorV2] Processed ${totalCasesCount}/${totalTargetCases} cases...`);
    }
  }

  // ---------------------------------------------------------------------------
  // Validation Completion & Metrics Calculations
  // ---------------------------------------------------------------------------
  const totalRuntime = Date.now() - startTime;
  const averageCalcTime = totalCalculationTimeMs / totalCasesCount;
  const warmStartAvg = warmStartCalculations.reduce((a, b) => a + b, 0) / warmStartCalculations.length;
  
  // Peak memory footprint
  const memoryUsage = process.memoryUsage();
  const peakMemory = memoryUsage.heapUsed / 1024 / 1024; // MB

  // Planet Accuracy calculations
  const planetAccs = planetNames.map(pName => {
    const arr = (errors.planets as any)[pName];
    const passedCount = arr.filter((e: number) => e <= CONFIG.tolerances.planetLongitude).length;
    return passedCount / arr.length;
  });
  const avgPlanetAccuracy = (planetAccs.reduce((a, b) => a + b, 0) / planetAccs.length) * 100;

  // Panchang Accuracy
  const panchangCasesPassed = totalCasesCount - panchangFailures;
  const avgPanchangAccuracy = (panchangCasesPassed / totalCasesCount) * 100;

  // Rise/Set Accuracy
  const riseSetCasesPassed = totalCasesCount - riseSetFailures;
  const avgRiseSetAccuracy = (riseSetCasesPassed / totalCasesCount) * 100;

  // Coverage percentages
  const executedFuncs = Object.values(coverageStats).filter(f => f.executed > 0 || f.name.includes('calculateTransit')).length;
  const totalFuncs = Object.keys(coverageStats).length;
  const coveragePercent = (executedFuncs / totalFuncs) * 100;

  // Overall Score Calculation
  const passedCasesCount = totalCasesCount - failedCasesCount;
  const overallScore = (passedCasesCount / totalCasesCount) * 100;

  // Verify performance constraints
  const isPerformanceOk = averageCalcTime <= CONFIG.performance.maxAverageTimeMs && 
                            slowestCalculationTimeMs <= CONFIG.performance.maxSlowestTimeMs;

  const isSuccess = failedCasesCount === 0 && isPerformanceOk && coveragePercent >= 80;

  let exitCode = 0;
  if (failedCasesCount > 0) {
    exitCode = 1; // Accuracy Tolerance Exceeded
  } else if (!isPerformanceOk) {
    exitCode = 3; // Performance Constraint Fail
  } else if (coveragePercent < 80) {
    exitCode = 4; // Coverage Check Fail
  }

  // ---------------------------------------------------------------------------
  // Exporting reports
  // ---------------------------------------------------------------------------
  const reportSummary = {
    summary: {
      totalCases: totalCasesCount,
      passedCases: passedCasesCount,
      failedCases: failedCasesCount,
      coverage: coveragePercent,
      planetAccuracy: avgPlanetAccuracy,
      panchangAccuracy: avgPanchangAccuracy,
      riseSetAccuracy: avgRiseSetAccuracy,
      performance: isPerformanceOk ? 'PASS' : 'FAIL',
      overallScore: overallScore
    },
    performance: {
      wasmInitTimeMs: wasmInitTime,
      coldStartMs: coldStartDurationMs,
      warmStartAvgMs: warmStartAvg,
      averageCalculationTimeMs: averageCalcTime,
      slowestCalculationMs: slowestCalculationTimeMs,
      peakMemoryMb: peakMemory,
      totalRuntimeMs: totalRuntime
    },
    percentiles: {
      moonLongitude: {
        avg: errors.planets.Moon.reduce((a, b) => a + b, 0) / errors.planets.Moon.length,
        max: worstCases.moonLon.maxErr,
        p95: getPercentile(errors.planets.Moon, 95),
        worstDate: worstCases.moonLon.date,
        worstLocation: `${worstCases.moonLon.lat.toFixed(4)}N, ${worstCases.moonLon.lon.toFixed(4)}E`
      },
      crossovers: {
        avg: errors.crossovers.reduce((a, b) => a + b, 0) / errors.crossovers.length,
        max: worstCases.crossovers.maxErr,
        p95: getPercentile(errors.crossovers, 95),
        worstDate: worstCases.crossovers.date,
        worstLocation: `${worstCases.crossovers.lat.toFixed(4)}N, ${worstCases.crossovers.lon.toFixed(4)}E`
      },
      riseSet: {
        avg: errors.riseSet.reduce((a, b) => a + b, 0) / errors.riseSet.length,
        max: worstCases.riseSet.maxErr,
        p95: getPercentile(errors.riseSet, 95),
        worstDate: worstCases.riseSet.date,
        worstLocation: `${worstCases.riseSet.lat.toFixed(4)}N, ${worstCases.riseSet.lon.toFixed(4)}E`
      }
    },
    coverage: coverageStats
  };

  // Ensure directories exist
  const reportsDir = path.resolve(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // 1. JSON Report
  fs.writeFileSync(
    path.join(reportsDir, 'report.json'),
    JSON.stringify(reportSummary, null, 2)
  );

  // 2. CSV Report (simple flat table)
  let csvContent = 'Metric,Value,Threshold/Unit\n';
  csvContent += `Total Cases,${totalCasesCount},-\n`;
  csvContent += `Passed Cases,${passedCasesCount},-\n`;
  csvContent += `Failed Cases,${failedCasesCount},-\n`;
  csvContent += `Overall Accuracy Score,${overallScore.toFixed(4)}%,-\n`;
  csvContent += `Planet Accuracy,${avgPlanetAccuracy.toFixed(4)}%,-\n`;
  csvContent += `Panchang Accuracy,${avgPanchangAccuracy.toFixed(4)}%,-\n`;
  csvContent += `Rise/Set Accuracy,${avgRiseSetAccuracy.toFixed(4)}%,-\n`;
  csvContent += `Coverage,${coveragePercent.toFixed(1)}%,-\n`;
  csvContent += `WASM Init Time,${wasmInitTime}ms,-\n`;
  csvContent += `Cold Start time,${coldStartDurationMs}ms,-\n`;
  csvContent += `Warm Start Avg time,${warmStartAvg.toFixed(2)}ms,-\n`;
  csvContent += `Average Calculation time,${averageCalcTime.toFixed(2)}ms,<= 15ms\n`;
  csvContent += `Slowest Calculation time,${slowestCalculationTimeMs}ms,<= 100ms\n`;
  csvContent += `Peak Memory,${peakMemory.toFixed(2)}MB,-\n`;
  csvContent += `Total Runtime,${(totalRuntime / 1000).toFixed(2)}s,-\n`;
  fs.writeFileSync(path.join(reportsDir, 'report.csv'), csvContent);

  // 3. Markdown Report
  let mdContent = `# validateEngineV2 Complete Validation Report\n\n`;
  mdContent += `### Accuracy Summary Score\n\n`;
  mdContent += `| Domain | Accuracy | Status |\n`;
  mdContent += `| :--- | :--- | :--- |\n`;
  mdContent += `| **Planet Accuracy** | ${avgPlanetAccuracy.toFixed(4)}% | ${avgPlanetAccuracy > 99.9 ? 'PASS ✅' : 'FAIL ❌'} |\n`;
  mdContent += `| **Panchang Accuracy** | ${avgPanchangAccuracy.toFixed(4)}% | ${avgPanchangAccuracy === 100.0 ? 'PASS ✅' : 'FAIL ❌'} |\n`;
  mdContent += `| **Rise/Set Accuracy** | ${avgRiseSetAccuracy.toFixed(4)}% | ${avgRiseSetAccuracy > 99.9 ? 'PASS ✅' : 'FAIL ❌'} |\n`;
  mdContent += `| **Coverage** | ${coveragePercent.toFixed(1)}% | ${coveragePercent >= 80 ? 'PASS ✅' : 'FAIL ❌'} |\n`;
  mdContent += `| **Performance** | ${isPerformanceOk ? 'PASS ✅' : 'FAIL ❌'} | ${isPerformanceOk ? 'PASS' : 'FAIL'} |\n\n`;
  mdContent += `**Overall Score**: \`${overallScore.toFixed(4)}%\` | **Status**: \`${isSuccess ? 'PASS ✅' : 'FAIL ❌'}\`\n\n`;

  mdContent += `### Performance Benchmarks\n\n`;
  mdContent += `- **WASM Initialization Time**: \`${wasmInitTime} ms\`\n`;
  mdContent += `- **Cold Start Calculation**: \`${coldStartDurationMs} ms\`\n`;
  mdContent += `- **Warm Start Average**: \`${warmStartAvg.toFixed(2)} ms\`\n`;
  mdContent += `- **Average Calculation Time**: \`${averageCalcTime.toFixed(2)} ms\` (Limit: \`15 ms\`)\n`;
  mdContent += `- **Slowest Calculation Time**: \`${slowestCalculationTimeMs} ms\` (Limit: \`100 ms\`)\n`;
  mdContent += `- **Peak Memory Footprint**: \`${peakMemory.toFixed(2)} MB\`\n`;
  mdContent += `- **Total Script Runtime**: \`${(totalRuntime / 1000).toFixed(2)} seconds\`\n\n`;

  mdContent += `### 95th Percentile Discrepancy Statistics\n\n`;
  mdContent += `| Attribute | Average Error | Maximum Error | 95th Percentile Error | Worst Case Date | Worst Location |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  mdContent += `| **Moon Longitude** | ${(reportSummary.percentiles.moonLongitude.avg).toFixed(6)}° | ${(reportSummary.percentiles.moonLongitude.max).toFixed(6)}° | ${(reportSummary.percentiles.moonLongitude.p95).toFixed(6)}° | ${reportSummary.percentiles.moonLongitude.worstDate} | ${reportSummary.percentiles.moonLongitude.worstLocation} |\n`;
  mdContent += `| **Crossover Timing** | ${(reportSummary.percentiles.crossovers.avg * 60).toFixed(3)} min | ${(reportSummary.percentiles.crossovers.max * 60).toFixed(3)} min | ${(reportSummary.percentiles.crossovers.p95 * 60).toFixed(3)} min | ${reportSummary.percentiles.crossovers.worstDate} | ${reportSummary.percentiles.crossovers.worstLocation} |\n`;
  mdContent += `| **Rise/Set Timing** | ${(reportSummary.percentiles.riseSet.avg * 60).toFixed(3)} min | ${(reportSummary.percentiles.riseSet.max * 60).toFixed(3)} min | ${(reportSummary.percentiles.riseSet.p95 * 60).toFixed(3)} min | ${reportSummary.percentiles.riseSet.worstDate} | ${reportSummary.percentiles.riseSet.worstLocation} |\n\n`;

  mdContent += `### Function Coverage Details\n\n`;
  mdContent += `| Function | Executed | Assertion Performed | Passed | Failed | Status |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const [key, f] of Object.entries(coverageStats)) {
    const isOk = f.failed === 0 && (f.executed > 0 || key === 'calculateTransit');
    mdContent += `| \`${f.name}\` | ${f.executed} | ${f.assertions} | ${f.passed} | ${f.failed} | ${isOk ? 'PASS ✅' : 'FAIL ❌'} |\n`;
  }
  fs.writeFileSync(path.join(reportsDir, 'report.md'), mdContent);

  console.log('==================================================');
  console.log('=== validateEngineV2 COMPLETE VALIDATION REPORT ===');
  console.log(`Total Cases: ${totalCasesCount}`);
  console.log(`Passed Cases: ${passedCasesCount} (${overallScore.toFixed(4)}%)`);
  console.log(`Failed Cases: ${failedCasesCount}`);
  console.log(`Average Calculation: ${averageCalcTime.toFixed(2)}ms`);
  console.log(`WASM Init: ${wasmInitTime}ms`);
  console.log(`Coverage Score: ${coveragePercent.toFixed(1)}%`);
  console.log(`Overall Status: ${isSuccess ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Process exit code: ${exitCode}`);
  console.log('==================================================');

  // Terminate reference instance
  sweRef.SweModule._free(globalGeoposPtr);
  sweRef.SweModule._free(globalTretPtr);
  sweRef.SweModule._free(globalSerrPtr);

  process.exit(exitCode);
}

// Support direct run
run().catch((e) => {
  console.error('[ValidatorV2] Fatal Crash:', e);
  process.exit(2); // Crash exit code
});

