/**
 * Master Unified Hindu Festivals & Vratas Bridge Adapter
 *
 * 100% Backed by Sanatan Astro Engine v2.0 & 972 Verified Festivals Registry
 * Bridges `src/engine/festivalEngine.ts` and `src/services/unifiedVrataRegistryService.ts`
 * into the Sanatan Watch application UI.
 */

import { PanchangInfo, Festival } from '../types';
import {
  getFestivalsForDay as coreGetFestivalsForDay,
  getFestivalsForYear as coreGetFestivalsForYear
} from '../engine/festivalEngine';

function mapToWatchFestival(f: any): Festival {
  let fType: Festival['type'] = 'Major';
  const hin = f.hindiName || '';
  const eng = f.name || '';
  const idLower = (f.id || '').toLowerCase();

  if (f.type === 'Ekadashi' || eng.includes('Ekadashi') || hin.includes('एकादशी') || idLower.includes('ekadashi')) {
    fType = 'Ekadashi';
  } else if (f.type === 'Purnima' || eng.includes('Purnima') || hin.includes('पूर्णिमा') || idLower.includes('purnima')) {
    fType = 'Purnima';
  } else if (f.type === 'Amavasya' || eng.includes('Amavasya') || hin.includes('अमावस्या') || idLower.includes('amavasya')) {
    fType = 'Amavasya';
  } else if (f.type === 'Sankashti' || eng.includes('Sankashti') || hin.includes('संकष्टी') || hin.includes('चतुर्थी') || idLower.includes('sankashti')) {
    fType = 'Sankashti';
  } else if (f.type === 'Jayanti' || eng.includes('Jayanti') || hin.includes('जयंती') || idLower.includes('jayanti')) {
    fType = 'Jayanti';
  } else {
    fType = 'Major';
  }

  return {
    id: f.id || `fest_${f.date}_${f.name}`,
    name: f.name || f.hindiName || 'Festival',
    hindiName: f.hindiName || f.name || 'पर्व',
    date: f.date,
    month: f.month || 'Chaitra',
    tithi: f.tithi || '',
    description: f.description || '',
    descriptionEnglish: f.descriptionEnglish,
    type: fType,
    isAuspicious: f.isAuspicious !== false,
    secondaryDate: f.secondaryDate,
    pujaMuhurat: f.pujaMuhurat,
    paranTime: f.paranTime,
    moonriseTime: f.moonriseTime,
  };
}

/**
 * Returns all verified festivals for a specific Panchang day
 */
export function getFestivalsForDay(panchang: PanchangInfo): Festival[] {
  if (!panchang || !panchang.date) return [];
  const rawList = coreGetFestivalsForDay(panchang as any);
  return deduplicateFestivals(rawList.map(mapToWatchFestival));
}

/**
 * Deduplicate festivals by date and Hindi name
 */
export function deduplicateFestivals(festivals: Festival[]): Festival[] {
  const seen = new Set<string>();
  const result: Festival[] = [];

  for (const f of festivals) {
    const key = `${f.date}_${f.hindiName}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(f);
    }
  }

  return result;
}

/**
 * Returns all verified festivals for a Gregorian year from the 972 Unified Registry
 */
export function getFestivalsForYear(year: number, lat?: number, lon?: number): Festival[] {
  const rawList = coreGetFestivalsForYear(year, lat, lon);
  return deduplicateFestivals(rawList.map(mapToWatchFestival));
}
