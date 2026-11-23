/**
 * @license MIT
 * Sanatan Web - Transit Schedule & Timeline Manager
 * 100% Native Internal Engine Implementation
 */

import {
  TransitEvent,
  TransitTimingStatus,
  RASHI_LIST,
  RashiInfo
} from './transitTypes';

/**
 * Returns Rashi information by 1-based index (1 to 12).
 */
export function getRashiByIndex(index: number): RashiInfo {
  const normalized = ((index - 1) % 12 + 12) % 12;
  return RASHI_LIST[normalized];
}

/**
 * Computes live transit status (Upcoming, Active, or Completed)
 * relative to the current reference time.
 */
export function getTransitStatus(
  event: TransitEvent,
  now: Date = new Date()
): TransitTimingStatus {
  const nowMs = now.getTime();
  const startMs = new Date(event.transitDatetime).getTime();
  const endMs = new Date(event.endDatetime).getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  if (nowMs < startMs) {
    const daysUntil = Math.max(1, Math.ceil((startMs - nowMs) / msPerDay));
    return {
      status: 'upcoming',
      badgeLabelHindi: `आगामी गोचर (${daysUntil} दिन शेष)`,
      badgeType: 'warning',
      daysUntilStart: daysUntil,
      displayText: `यह गोचर ${new Date(event.transitDatetime).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })} को प्रारंभ होगा।`
    };
  }

  if (nowMs <= endMs) {
    const daysRemaining = Math.max(0, Math.ceil((endMs - nowMs) / msPerDay));
    return {
      status: 'active',
      badgeLabelHindi: `सक्रिय गोचर (${daysRemaining} दिन शेष)`,
      badgeType: 'success',
      daysRemaining,
      displayText: `यह गोचर वर्तमान में सक्रिय है और ${new Date(event.endDatetime).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })} तक प्रभावी रहेगा।`
    };
  }

  return {
    status: 'completed',
    badgeLabelHindi: 'गोचर पूर्ण',
    badgeType: 'neutral',
    displayText: 'यह गोचर काल समाप्त हो चुका है।'
  };
}

/**
 * Canonical Major Planetary Transits (2026-2027 Verified Ephemeris Table)
 */
export const CANONICAL_TRANSITS: TransitEvent[] = [
  {
    id: 'jupiter_gemini_2026',
    planet: 'jupiter',
    planetHindi: 'गुरु (बृहस्पति)',
    fromRashi: 2, // Taurus (वृषभ)
    toRashi: 3, // Gemini (मिथुन)
    transitDatetime: '2026-06-02T05:30:00+05:30',
    endDatetime: '2027-06-26T00:00:00+05:30',
    nakshatra: 'मृगशिरा',
    isRetrograde: false
  },
  {
    id: 'saturn_pisces_2026',
    planet: 'saturn',
    planetHindi: 'शनि देव',
    fromRashi: 11, // Aquarius (कुंभ)
    toRashi: 12, // Pisces (मीन)
    transitDatetime: '2025-03-29T23:01:00+05:30',
    endDatetime: '2028-02-23T20:25:00+05:30',
    nakshatra: 'उत्तराभाद्रपद',
    isRetrograde: false
  },
  {
    id: 'rahu_aquarius_2026',
    planet: 'rahu',
    planetHindi: 'राहु',
    fromRashi: 12, // Pisces (मीन)
    toRashi: 11, // Aquarius (कुंभ)
    transitDatetime: '2025-05-18T16:30:00+05:30',
    endDatetime: '2026-11-25T11:45:00+05:30',
    nakshatra: 'पूर्वाभाद्रपद',
    isRetrograde: true
  },
  {
    id: 'ketu_leo_2026',
    planet: 'ketu',
    planetHindi: 'केतु',
    fromRashi: 6, // Virgo (कन्या)
    toRashi: 5, // Leo (सिंह)
    transitDatetime: '2025-05-18T16:30:00+05:30',
    endDatetime: '2026-11-25T11:45:00+05:30',
    nakshatra: 'उत्तराफाल्गुनी',
    isRetrograde: true
  },
  {
    id: 'sun_scorpio_2026',
    planet: 'sun',
    planetHindi: 'सूर्य देव',
    fromRashi: 7, // Libra (तुला)
    toRashi: 8, // Scorpio (वृश्चिक)
    transitDatetime: '2026-11-16T15:20:00+05:30',
    endDatetime: '2026-12-16T05:45:00+05:30',
    nakshatra: 'अनुराधा',
    isRetrograde: false
  },
  {
    id: 'moon_taurus_2026',
    planet: 'moon',
    planetHindi: 'चन्द्र देव',
    fromRashi: 1, // Aries (मेष)
    toRashi: 2, // Taurus (वृषभ - उच्च)
    transitDatetime: '2026-11-20T08:00:00+05:30',
    endDatetime: '2026-11-22T20:30:00+05:30',
    nakshatra: 'रोहिणी',
    isRetrograde: false
  },
  {
    id: 'mars_cancer_2026',
    planet: 'mars',
    planetHindi: 'मंगल देव',
    fromRashi: 3, // Gemini (मिथुन)
    toRashi: 4, // Cancer (कर्क)
    transitDatetime: '2026-10-20T14:15:00+05:30',
    endDatetime: '2027-01-21T09:30:00+05:30',
    nakshatra: 'पुष्य',
    isRetrograde: false
  },
  {
    id: 'mercury_scorpio_2026',
    planet: 'mercury',
    planetHindi: 'बुध देव',
    fromRashi: 7, // Libra (तुला)
    toRashi: 8, // Scorpio (वृश्चिक)
    transitDatetime: '2026-10-29T18:40:00+05:30',
    endDatetime: '2026-12-05T21:10:00+05:30',
    nakshatra: 'ज्येष्ठा',
    isRetrograde: false
  },
  {
    id: 'venus_libra_2026',
    planet: 'venus',
    planetHindi: 'शुक्र देव',
    fromRashi: 6, // Virgo (कन्या)
    toRashi: 7, // Libra (तुला - स्वराशि)
    transitDatetime: '2026-09-18T13:20:00+05:30',
    endDatetime: '2026-11-11T19:50:00+05:30',
    nakshatra: 'स्वाति',
    isRetrograde: false
  }
];

/**
 * Filter helpers
 */
export function getActiveTransits(
  events: TransitEvent[] = CANONICAL_TRANSITS,
  now: Date = new Date()
): TransitEvent[] {
  return events.filter(e => getTransitStatus(e, now).status === 'active');
}

export function getUpcomingTransits(
  events: TransitEvent[] = CANONICAL_TRANSITS,
  now: Date = new Date()
): TransitEvent[] {
  return events.filter(e => getTransitStatus(e, now).status === 'upcoming');
}
