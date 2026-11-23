/**
 * Sanatan Astro Engine v2.0 (Core Engine Export Hub)
 * Clean-Room MIT / NASA JPL Architecture (Zero Kundli/Dasha Bloat)
 *
 * @license MIT
 */

export * from './types';
export * from './core/sanatan_jpl_bridge';
export * from './panchangCalc';
export * from './muhuratRules';
export * from './festivalEngine';

import { getPanchangForDate } from './panchangCalc';

/**
 * High-level Vedic Panchang calculation for a specific location and date.
 */
export function calculatePanchang(lat: number, lon: number, date: Date = new Date()) {
  return getPanchangForDate(lat, lon, date);
}
