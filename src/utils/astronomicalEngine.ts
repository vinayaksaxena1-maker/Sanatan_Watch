/**
 * Sanatan Astro Engine v2.0 - Drop-in Backward-Compatible Adapter
 *
 * 100% MIT Licensed / Clean-Room NASA JPL Bridge (`astronomy-engine`).
 * Zero GPL Swiss Ephemeris dependency, zero Web Worker serialization overhead.
 * Provides instantaneous, synchronous high-precision Vedic calculations.
 */

import {
  astronomicalEngine as coreEngine,
  SolarTimes as CoreSolarTimes,
  MoonTimes as CoreMoonTimes,
  PlanetPosition as CorePlanetPosition,
  PanchangPositions as CorePanchangPositions,
  AstronomicalEngine as CoreAstronomicalEngine
} from '../engine/astronomicalEngine';
import { EngineLogger } from './engineLogger';

// ---------------------------------------------------------------------------
// Exported Types & Interfaces (100% Identical to Previous Swiss API)
// ---------------------------------------------------------------------------
export type SolarTimes = CoreSolarTimes;
export type MoonTimes = CoreMoonTimes;
export type PlanetPosition = CorePlanetPosition;
export type PanchangPositions = CorePanchangPositions;

export interface AstronomicalEngine {
  getSolarTimes(lat: number, lon: number, date: Date, offsetHours?: number): SolarTimes;
  getMoonTimes(sunriseMin: number, sunsetMin: number, tithiIdx: number, date: Date, lat: number, lon: number, offsetHours?: number): MoonTimes;
  getPanchangPositions(date: Date, offsetHours?: number): PanchangPositions;
  isReady(): boolean;
  pendingQueries?: Set<string>;
}

// ---------------------------------------------------------------------------
// Versioned Cache-Buster & Migration Purge
// ---------------------------------------------------------------------------
export const ENGINE_CACHE_VERSION = 'v2.0.0_SANATAN_JPL_MIT';

if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const currentVer = localStorage.getItem('sanatan_astro_cache_ver');
    if (currentVer !== ENGINE_CACHE_VERSION) {
      localStorage.setItem('sanatan_astro_cache_ver', ENGINE_CACHE_VERSION);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('SWISS_') || k.startsWith('PANCHANG_') || k.startsWith('EPHE_') || k.startsWith('ASTRO_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch {
    // Ignore storage quota / security sandbox errors in WebViews
  }
}

// ---------------------------------------------------------------------------
// Panchang Cache Clearer Registration
// ---------------------------------------------------------------------------
let panchangCacheClearer: (() => void) | null = null;
export function registerPanchangCacheClearer(fn: () => void) {
  panchangCacheClearer = fn;
  // Trigger immediate cache purge on registration to bust stale entries
  try {
    fn();
  } catch {
    // Ignore initial invocation errors
  }
}

// ---------------------------------------------------------------------------
// Engine State & Lifecycle Mock/Adapter
// ---------------------------------------------------------------------------
const pendingQueries = new Set<string>();
const activeExpectedKeys = new Set<string>();

let updateListener: (() => void) | null = null;
const isEngineReady = true;
const isEngineTimeout = false;
const engineProgressStage: 'WORKER_CREATED' | 'WASM_COMPILED' | 'EPHEMERIS_READY' | 'PANCHANG_PREFETCH' | 'ENGINE_READY' = 'ENGINE_READY';

// Log successful initialization into EngineLogger
try {
  EngineLogger.pushLog('INFO', 'Sanatan Astro Engine v2.0 (MIT/JPL) initialized ready in 0ms');
} catch {
  // Ignore initial log setup errors
}

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
  return false;
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
// Synchronous Drop-in Adapter Instance
// ---------------------------------------------------------------------------
class SanatanEngineAdapter implements AstronomicalEngine {
  public pendingQueries = pendingQueries;

  isReady(): boolean {
    return isEngineReady;
  }

  getSolarTimes(lat: number, lon: number, date: Date, offsetHours?: number): SolarTimes {
    return coreEngine.getSolarTimes(lat, lon, date, offsetHours);
  }

  getMoonTimes(sunriseMin: number, sunsetMin: number, tithiIdx: number, date: Date, lat: number, lon: number, offsetHours?: number): MoonTimes {
    return coreEngine.getMoonTimes(sunriseMin, sunsetMin, tithiIdx, date, lat, lon, offsetHours);
  }

  getPanchangPositions(date: Date, offsetHours?: number): PanchangPositions {
    return coreEngine.getPanchangPositions(date, offsetHours);
  }
}

export const astronomicalEngine: AstronomicalEngine = new SanatanEngineAdapter();
