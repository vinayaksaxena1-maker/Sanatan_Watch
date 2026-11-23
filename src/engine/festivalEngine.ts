/**
 * AstroEngine v2.0 (AstroEngine_v_2.0)
 * Module: festivalEngine.ts
 * Master Unified Hindu Festivals & Vratas Engine Adapter
 * 100% Backed by the 972 Verified Unified Festivals Registry (Batches 1-4)
 * Strict < 300 Lines Modular Architecture
 */

import type { PanchangInfo, Festival } from './types';
import {
  getUnifiedFestivalsForYear,
  getUnifiedFestivalsForDate,
  getUnifiedFestivalsForMonth as getUnifiedMonthFestivals,
  type UnifiedVrataItem,
} from '../services/unifiedVrataRegistryService';

function toLegacyFestival(u: UnifiedVrataItem): Festival {
  let fType: Festival['type'] = 'Festival';
  if (u.category === 'national_major') {
    fType = 'Major';
  } else if (u.nameHindi.includes('एकादशी')) {
    fType = 'Ekadashi';
  } else if (u.nameHindi.includes('पूर्णिमा')) {
    fType = 'Purnima';
  } else if (u.nameHindi.includes('अमावस्या')) {
    fType = 'Amavasya';
  } else if (u.nameHindi.includes('चतुर्थी') || u.nameHindi.includes('संकष्टी')) {
    fType = 'Sankashti';
  } else if (u.nameHindi.includes('जयंती') || u.category === 'national_observance') {
    fType = 'Jayanti';
  } else if (u.category === 'sankranti') {
    fType = 'Sankranti';
  } else if (u.category === 'recurring_monthly') {
    fType = 'Vrat';
  }

  return {
    id: u.id,
    name: u.nameEnglish,
    hindiName: u.nameHindi,
    date: u.dateStr,
    month: u.lunarMasaHindi || 'Chaitra',
    tithi: u.tithiOrEventHindi || '',
    description: `अधिष्ठाता: ${u.deityHindi || 'ईष्ट देव'} · ${u.categoryHindi} · ${u.vyaptiHindi || ''}`,
    type: fType,
    isAuspicious: true,
  };
}

/**
 * Returns all verified festivals for a specific Panchang day
 */
export function getFestivalsForDay(panchang: PanchangInfo | Date | string): Festival[] {
  let dateStr = '';
  if (typeof panchang === 'string') {
    dateStr = panchang;
  } else if (panchang instanceof Date) {
    const y = panchang.getFullYear();
    const m = String(panchang.getMonth() + 1).padStart(2, '0');
    const d = String(panchang.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  } else if (panchang && panchang.date) {
    dateStr = panchang.date;
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  const list = getUnifiedFestivalsForDate(dateStr);
  return list.map(toLegacyFestival);
}

/**
 * Returns all verified festivals for a Gregorian year from the 972 Unified Registry
 */
export function getFestivalsForYear(year: number, _lat?: number, _lon?: number): Festival[] {
  const list = getUnifiedFestivalsForYear(year);
  return list.map(toLegacyFestival);
}

/**
 * Returns all verified festivals for a Gregorian month from the 972 Unified Registry
 */
export function getFestivalsForMonth(
  year: number,
  monthIndex: number,
  _lat?: number,
  _lon?: number
): Festival[] {
  const list = getUnifiedMonthFestivals(year, monthIndex);
  return list.map(toLegacyFestival);
}

/**
 * Helper to produce minimal PanchangInfo for a festival day
 */
export function getPanchangForFestivalDay(date: Date): PanchangInfo {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return {
    date: `${y}-${m}-${d}`,
  } as unknown as PanchangInfo;
}
