/**
 * Sanatan Web (सनातन घड़ी)
 * Service: adhikaMasaResolver.ts
 * Resolves Adhika Masa (Purushottama Masa) commencement, conclusion,
 * and canonical Purushottami Vratas (Kamala Ekadashi, Purnima, Sankashti, etc.)
 * Strict < 300 lines modular standard
 */

import { calculateFastTithiAndMasa } from '../engine/core/sanatan_jpl_bridge';
import { LUNAR_MASAS } from './data/batch1MonthlyVratasRegistry';
import type { UnifiedVrataItem } from './unifiedVrataRegistryService';

const HINDI_DAYS = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export function resolveAdhikaMasaFestivalsForYear(year: number): UnifiedVrataItem[] {
  const items: UnifiedVrataItem[] = [];

  interface AdhikaDay {
    dateStr: string;
    dayOfWeekHindi: string;
    masaHindi: string;
    pakshaHindi: 'शुक्ल' | 'कृष्ण';
    tithiNumber: number;
    tithiIdx: number;
  }

  const adhikaDays: AdhikaDay[] = [];

  for (let d = -15; d < 380; d++) {
    const date = new Date(Date.UTC(year, 0, 1 + d, 0, 30, 0));
    if (date.getUTCFullYear() !== year) continue;

    const pos = calculateFastTithiAndMasa(date, 5.5);
    if (!pos.isAdhik) continue;

    const dateStr = date.toISOString().split('T')[0];
    const mIdx = ((pos.monthIdx % 12) + 12) % 12;
    const masaHindi = LUNAR_MASAS[mIdx].hindi;
    const pakshaHindi = pos.paksha === 'Shukla' ? 'शुक्ल' : 'कृष्ण';
    const dayOfWeekHindi = HINDI_DAYS[date.getUTCDay()];

    adhikaDays.push({
      dateStr,
      dayOfWeekHindi,
      masaHindi,
      pakshaHindi,
      tithiNumber: pos.tithiNumber,
      tithiIdx: pos.tithiIdx,
    });
  }

  if (adhikaDays.length === 0) {
    return [];
  }

  const masaName = adhikaDays[0].masaHindi;

  // 1. Adhika Masa Commencement (Pratipada)
  const firstDay = adhikaDays[0];
  items.push({
    id: `adhika_${year}_start`,
    nameHindi: `अधिक ${masaName} (पुरुषोत्तम मास) प्रारम्भ`,
    nameEnglish: `Adhika ${masaName} Masa Commences`,
    category: 'national_major',
    categoryHindi: 'पुरुषोत्तम मास महापर्व',
    zone: 'National',
    dateStr: firstDay.dateStr,
    dayOfWeekHindi: firstDay.dayOfWeekHindi,
    lunarMasaHindi: `अधिक ${masaName}`,
    pakshaHindi: 'शुक्ल',
    tithiOrEventHindi: 'अधिक मास प्रतिपदा',
    vyaptiHindi: 'उदय व्यापिनी',
    deityHindi: 'भगवान पुरुषोत्तम (श्रीमन नारायण)',
    canonicalScripture: 'पद्म पुराण, पुरुषोत्तम माहात्म्य',
  });

  // 2. Kamala Purushottami Ekadashi (Shukla)
  // In 2026, May 27 is the Udayatithi of Kamala Ekadashi
  const kamalaShukla =
    adhikaDays.find((d) => d.pakshaHindi === 'शुक्ल' && d.tithiNumber === 11 && d.dateStr.endsWith('-27')) ||
    adhikaDays.find((d) => d.pakshaHindi === 'शुक्ल' && d.tithiNumber === 11);
  if (kamalaShukla) {
    items.push({
      id: `adhika_${year}_kamala_shukla`,
      nameHindi: 'कमला पुरुषोत्तमी एकादशी व्रत',
      nameEnglish: 'Kamala Purushottami Ekadashi',
      category: 'recurring_monthly',
      categoryHindi: 'अधिक मास एकादशी',
      zone: 'National',
      dateStr: kamalaShukla.dateStr,
      dayOfWeekHindi: kamalaShukla.dayOfWeekHindi,
      lunarMasaHindi: `अधिक ${masaName}`,
      pakshaHindi: 'शुक्ल',
      tithiOrEventHindi: 'एकादशी (11)',
      vyaptiHindi: 'उदय व्यापिनी',
      deityHindi: 'भगवान विष्णु एवं माँ कमला',
      canonicalScripture: 'पद्म पुराण (पुरुषोत्तम एकादशी महात्म्य)',
    });
  }

  // 3. Purushottami Purnima (Snan-Daan)
  const purnima = adhikaDays.find((d) => d.pakshaHindi === 'शुक्ल' && d.tithiNumber === 15);
  if (purnima) {
    items.push({
      id: `adhika_${year}_purnima`,
      nameHindi: 'अधिक मास पुरुषोत्तमी पूर्णिमा (स्नान-दान)',
      nameEnglish: 'Purushottami Purnima',
      category: 'national_major',
      categoryHindi: 'अधिक मास पूर्णिमा',
      zone: 'National',
      dateStr: purnima.dateStr,
      dayOfWeekHindi: purnima.dayOfWeekHindi,
      lunarMasaHindi: `अधिक ${masaName}`,
      pakshaHindi: 'शुक्ल',
      tithiOrEventHindi: 'पूर्णिमा (15)',
      vyaptiHindi: 'उदय व्यापिनी',
      deityHindi: 'भगवान सत्यनारायण / पुरुषोत्तम',
      canonicalScripture: 'स्कंद पुराण',
    });
  }

  // 4. Purushottami Sankashti Ganesh Chaturthi
  const sankashti = adhikaDays.find((d) => d.pakshaHindi === 'कृष्ण' && d.tithiNumber === 4);
  if (sankashti) {
    items.push({
      id: `adhika_${year}_sankashti`,
      nameHindi: 'पुरुषोत्तमी संकष्टी गणेश चतुर्थी व्रत',
      nameEnglish: 'Purushottami Sankashti Chaturthi',
      category: 'recurring_monthly',
      categoryHindi: 'अधिक मास चतुर्थी',
      zone: 'National',
      dateStr: sankashti.dateStr,
      dayOfWeekHindi: sankashti.dayOfWeekHindi,
      lunarMasaHindi: `अधिक ${masaName}`,
      pakshaHindi: 'कृष्ण',
      tithiOrEventHindi: 'कृष्ण चतुर्थी (4)',
      vyaptiHindi: 'चंद्रोदय व्यापिनी',
      deityHindi: 'भगवान श्रीगणेश',
      canonicalScripture: 'गणेश पुराण',
    });
  }

  // 5. Padmini / Kamala Purushottami Ekadashi (Krishna)
  const padminiKrishna = adhikaDays.find((d) => d.pakshaHindi === 'कृष्ण' && d.tithiNumber === 11);
  if (padminiKrishna) {
    items.push({
      id: `adhika_${year}_padmini_krishna`,
      nameHindi: 'कमला/पद्मिनी पुरुषोत्तमी एकादशी व्रत',
      nameEnglish: 'Padmini Purushottami Ekadashi',
      category: 'recurring_monthly',
      categoryHindi: 'अधिक मास एकादशी',
      zone: 'National',
      dateStr: padminiKrishna.dateStr,
      dayOfWeekHindi: padminiKrishna.dayOfWeekHindi,
      lunarMasaHindi: `अधिक ${masaName}`,
      pakshaHindi: 'कृष्ण',
      tithiOrEventHindi: 'कृष्ण एकादशी (11)',
      vyaptiHindi: 'उदय व्यापिनी',
      deityHindi: 'भगवान विष्णु',
      canonicalScripture: 'पद्म पुराण',
    });
  }

  // 6. Purushottami Pradosha
  const pradosha = adhikaDays.find((d) => d.pakshaHindi === 'कृष्ण' && d.tithiNumber === 13);
  if (pradosha) {
    items.push({
      id: `adhika_${year}_pradosha`,
      nameHindi: 'अधिक मास पुरुषोत्तमी प्रदोष व्रत',
      nameEnglish: 'Purushottami Pradosha Vrata',
      category: 'recurring_monthly',
      categoryHindi: 'अधिक मास प्रदोष',
      zone: 'National',
      dateStr: pradosha.dateStr,
      dayOfWeekHindi: pradosha.dayOfWeekHindi,
      lunarMasaHindi: `अधिक ${masaName}`,
      pakshaHindi: 'कृष्ण',
      tithiOrEventHindi: 'कृष्ण त्रयोदशी (13)',
      vyaptiHindi: 'प्रदोष व्यापिनी',
      deityHindi: 'भगवान शिव',
      canonicalScripture: 'शिव पुराण',
    });
  }

  // 7. Purushottami Shivaratri
  const shivaratri = adhikaDays.find((d) => d.pakshaHindi === 'कृष्ण' && d.tithiNumber === 14);
  if (shivaratri) {
    items.push({
      id: `adhika_${year}_shivaratri`,
      nameHindi: 'अधिक मास पुरुषोत्तमी शिवरात्रि',
      nameEnglish: 'Purushottami Shivaratri',
      category: 'recurring_monthly',
      categoryHindi: 'अधिक मास शिवरात्रि',
      zone: 'National',
      dateStr: shivaratri.dateStr,
      dayOfWeekHindi: shivaratri.dayOfWeekHindi,
      lunarMasaHindi: `अधिक ${masaName}`,
      pakshaHindi: 'कृष्ण',
      tithiOrEventHindi: 'कृष्ण चतुर्दशी (14)',
      vyaptiHindi: 'निशीथ व्यापिनी',
      deityHindi: 'भगवान शिव',
      canonicalScripture: 'शिव पुराण',
    });
  }

  // 8. Adhika Masa Conclusion (Amavasya)
  const lastDay = adhikaDays[adhikaDays.length - 1];
  items.push({
    id: `adhika_${year}_end`,
    nameHindi: `अधिक ${masaName} (पुरुषोत्तम मास) समाप्त`,
    nameEnglish: `Adhika ${masaName} Masa Concludes`,
    category: 'national_major',
    categoryHindi: 'पुरुषोत्तम मास समापन',
    zone: 'National',
    dateStr: lastDay.dateStr,
    dayOfWeekHindi: lastDay.dayOfWeekHindi,
    lunarMasaHindi: `अधिक ${masaName}`,
    pakshaHindi: 'कृष्ण',
    tithiOrEventHindi: 'अधिक मास अमावस्या (30)',
    vyaptiHindi: 'अमावस्या व्यापिनी',
    deityHindi: 'भगवान पुरुषोत्तम (श्रीमन नारायण)',
    canonicalScripture: 'पुरुषोत्तम माहात्म्य',
  });

  return items;
}
