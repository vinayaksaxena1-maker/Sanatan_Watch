/**
 * Sanatan Astronomical Engine (100% Closed-Source / Proprietary Engine)
 *
 * Drop-in MIT/JPL replacement for Swiss Ephemeris WASM.
 * Powered by astronomy-engine (MIT License) with JPL-calibrated models.
 * Provides synchronous, instantaneous Vedic Panchang & Astronomical calculations.
 */

import {
  calculateSolarTimesCore,
  calculateMoonTimesCore,
  calculatePanchangPositionsCore,
  SolarTimesResult,
  MoonTimesResult,
  PanchangPositionsResult,
  PlanetPositionResult,
  AyanamshaSystem
} from './core/sanatan_jpl_bridge';

let panchangCacheClearer: (() => void) | null = null;
export function registerPanchangCacheClearer(fn: () => void) {
  panchangCacheClearer = fn;
}

export type SolarTimes = SolarTimesResult;
export type MoonTimes = MoonTimesResult;
export type PlanetPosition = PlanetPositionResult;
export type PanchangPositions = PanchangPositionsResult;

// Lean stubs for non-bloat types
export type AscendantDetail = any;
export type BhavaCuspDetail = any;
export type NatalPlanetDetail = any;
export type NatalChartData = any;

export interface AstronomicalEngine {
  getSolarTimes(lat: number, lon: number, date: Date, offsetHours?: number): SolarTimes;
  getMoonTimes(sunriseMin: number, sunsetMin: number, tithiIdx: number, date: Date, lat: number, lon: number, offsetHours?: number): MoonTimes;
  getPanchangPositions(date: Date, offsetHours?: number): PanchangPositions;
  getAscendant?(lat: number, lon: number, date: Date, ayanamsha?: AyanamshaSystem): AscendantDetail;
  getHouseCusps?(lat: number, lon: number, date: Date, houseSystem?: 'Sripati' | 'Placidus' | 'EqualHouse', ayanamsha?: AyanamshaSystem): BhavaCuspDetail[];
  getNatalChart?(lat: number, lon: number, date: Date, houseSystem?: 'Sripati' | 'Placidus' | 'EqualHouse', ayanamsha?: AyanamshaSystem): NatalChartData;
  isReady(): boolean;
}

// ---------------------------------------------------------------------------
// Engine State & Cache Management
// ---------------------------------------------------------------------------
const solarCache = new Map<string, SolarTimes>();
const moonCache = new Map<string, MoonTimes>();
const positionCache = new Map<string, PanchangPositions>();
const pendingQueries = new Set<string>();
const activeExpectedKeys = new Set<string>();

let updateListener: (() => void) | null = null;
const isEngineReady = true;
const isEngineTimeout = false;
let engineProgressStage: 'WORKER_CREATED' | 'WASM_COMPILED' | 'EPHEMERIS_READY' | 'PANCHANG_PREFETCH' | 'ENGINE_READY' = 'ENGINE_READY';

export function registerEngineListener(callback: () => void) {
  updateListener = callback;
  if (typeof setTimeout !== 'undefined') {
    setTimeout(callback, 0);
  }
}

export function isReady(): boolean {
  return isEngineReady;
}

export function isEngineCalculating(): boolean {
  return pendingQueries.size > 0;
}

export function registerActiveExpectedKeys(keys: string[]) {
  activeExpectedKeys.clear();
  keys.forEach(k => activeExpectedKeys.add(k));
}

export function isTimeoutTriggered(): boolean {
  return isEngineTimeout;
}

export function getEngineProgressStage() {
  return engineProgressStage;
}

export function getRetryCount(): number {
  return 0;
}

export function getLastDiagnosticInfo() {
  return {
    errorCode: 'NONE',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    elapsedTime: '0.0s'
  };
}

export function isMaxRetriesReached(): boolean {
  return false;
}

export function extendInitializationTimeout() {
  // No-op: Engine initializes synchronously in 0 ms
}

export function retryEngineInitialization() {
  panchangCacheClearer?.();
  if (updateListener) {
    updateListener();
  }
}

// ---------------------------------------------------------------------------
// Precision Cache Keys
// ---------------------------------------------------------------------------
function getPositionCacheKey(date: Date, offsetHours?: number): string {
  const tzSuffix = typeof offsetHours === 'number' ? `_TZ${offsetHours}` : '';
  return `POS_${date.getTime()}${tzSuffix}`;
}

function getSolarCacheKey(lat: number, lon: number, date: Date, offsetHours?: number): string {
  const dStr = date.toISOString().split('T')[0];
  const tzSuffix = typeof offsetHours === 'number' ? `_TZ${offsetHours}` : '';
  return `SOLAR_${lat.toFixed(4)}_${lon.toFixed(4)}_${dStr}${tzSuffix}`;
}

function getMoonCacheKey(lat: number, lon: number, date: Date, offsetHours?: number): string {
  const dStr = date.toISOString().split('T')[0];
  const tzSuffix = typeof offsetHours === 'number' ? `_TZ${offsetHours}` : '';
  return `MOON_${lat.toFixed(4)}_${lon.toFixed(4)}_${dStr}${tzSuffix}`;
}

// ---------------------------------------------------------------------------
// Synchronous High-Precision Engine Implementation
// ---------------------------------------------------------------------------
class SanatanProprietaryAstronomicalEngine implements AstronomicalEngine {
  isReady(): boolean {
    return isEngineReady;
  }

  getSolarTimes(lat: number, lon: number, date: Date, offsetHours?: number): SolarTimes {
    if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
    }
    if (typeof lon !== 'number' || isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error(`Invalid longitude: ${lon}. Must be between -180 and 180.`);
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Invalid date provided for solar times calculation.`);
    }

    const cacheKey = getSolarCacheKey(lat, lon, date, offsetHours);
    const cached = solarCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = calculateSolarTimesCore(lat, lon, date, offsetHours);
    solarCache.set(cacheKey, result);
    return result;
  }

  getMoonTimes(_sunriseMin: number, _sunsetMin: number, _tithiIdx: number, date: Date, lat: number, lon: number, offsetHours?: number): MoonTimes {
    if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
    }
    if (typeof lon !== 'number' || isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error(`Invalid longitude: ${lon}. Must be between -180 and 180.`);
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Invalid date provided for moon times calculation.`);
    }

    const cacheKey = getMoonCacheKey(lat, lon, date, offsetHours);
    const cached = moonCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = calculateMoonTimesCore(lat, lon, date, offsetHours);
    moonCache.set(cacheKey, result);
    return result;
  }

  getPanchangPositions(date: Date, offsetHours?: number): PanchangPositions {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Invalid date provided for panchang positions calculation.`);
    }

    const cacheKey = getPositionCacheKey(date, offsetHours);
    const cached = positionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = calculatePanchangPositionsCore(date, offsetHours);
    positionCache.set(cacheKey, result);
    return result;
  }
}

export const astronomicalEngine: AstronomicalEngine = new SanatanProprietaryAstronomicalEngine();
