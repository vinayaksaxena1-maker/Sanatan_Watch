/**
 * Sanatan Web (सनातन घड़ी)
 * Service: batch5NationalObservancesResolver.ts
 * Resolves 30+ Canonical National Days & Great Personalities' Jayantis for any year
 * Strict < 300 lines modular standard
 */

import {
  BATCH_5_NATIONAL_OBSERVANCES_REGISTRY,
  NationalObservanceDefinition,
} from '../data/batch5NationalObservancesRegistry';
import type { UnifiedVrataItem } from '../unifiedVrataRegistryService';

const WEEKDAYS_HINDI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export function resolveBatch5NationalObservancesForYear(year: number): UnifiedVrataItem[] {
  const items: UnifiedVrataItem[] = [];

  for (const obs of BATCH_5_NATIONAL_OBSERVANCES_REGISTRY) {
    const dateStr = `${year}-${obs.monthDay}`;
    const dateObj = new Date(`${dateStr}T12:00:00+05:30`);
    const dayOfWeekHindi = WEEKDAYS_HINDI[dateObj.getDay()] || '';

    items.push({
      id: obs.id,
      nameHindi: obs.nameHindi,
      nameEnglish: obs.nameEnglish,
      category: 'national_observance',
      categoryHindi: obs.categoryHindi,
      zone: 'National',
      dateStr,
      dayOfWeekHindi,
      lunarMasaHindi: 'सौर राष्ट्रीय मास',
      pakshaHindi: 'सौर',
      tithiOrEventHindi: 'राष्ट्रीय दिवस',
      vyaptiHindi: obs.descriptionHindi,
      deityHindi: obs.deityHindi,
      canonicalScripture: obs.canonicalScripture,
    });
  }

  return items;
}
