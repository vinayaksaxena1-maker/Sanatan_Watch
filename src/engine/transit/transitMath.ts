/**
 * @license MIT
 * Sanatan Web - Vedic Transit Mathematical & Vedha Engine
 * Classical BPHS (Brihat Parashara Hora Shastra) Compliant
 */

import {
  PlanetKey,
  PlanetaryDignity,
  TransitEvaluation,
  TransitOverallStatus,
  VedhaInfo,
  PLANET_INFO
} from './transitTypes';

/**
 * Calculates the Transit House (1 to 12) relative to a reference sign
 * (e.g., Janma Rashi / Moon Sign or Lagna).
 */
export function calculateTransitHouse(
  referenceRashi: number,
  transitRashi: number
): number {
  return (((transitRashi - referenceRashi) % 12 + 12) % 12) + 1;
}

/**
 * Standard Classical Favorable Houses (Shastriya Shubh Bhav) per planet
 * Reference: Brihat Parashara Hora Shastra (Gocharadhyaya) & Phaladeepika.
 */
export const FAVORABLE_HOUSES: Record<PlanetKey, readonly number[]> = {
  sun: [3, 6, 10, 11],
  moon: [1, 3, 6, 7, 10, 11],
  mars: [3, 6, 11],
  mercury: [2, 4, 6, 8, 10, 11],
  jupiter: [2, 5, 7, 9, 11],
  venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  saturn: [3, 6, 11],
  rahu: [3, 6, 10, 11],
  ketu: [3, 6, 10, 11]
} as const;

/**
 * Classical BPHS Vedha Houses (Obstruction Matrix)
 * When a planet transits in a favorable house, an occupant in the
 * corresponding Vedha house obstructs/delays the auspicious fruit.
 */
export const VEDHA_MAP: Record<PlanetKey, Record<number, number>> = {
  sun: {
    3: 9,
    6: 12,
    10: 4,
    11: 5
  },
  moon: {
    1: 5,
    3: 9,
    6: 12,
    7: 2,
    10: 4,
    11: 8
  },
  mars: {
    3: 12,
    6: 9,
    11: 5
  },
  mercury: {
    2: 5,
    4: 3,
    6: 9,
    8: 1,
    10: 7,
    11: 12
  },
  jupiter: {
    2: 12,
    5: 4,
    7: 3,
    9: 10,
    11: 8
  },
  venus: {
    1: 8,
    2: 7,
    3: 1,
    4: 10,
    5: 9,
    8: 5,
    9: 11,
    11: 6,
    12: 3
  },
  saturn: {
    3: 12,
    6: 9,
    11: 5
  },
  rahu: {
    3: 12,
    6: 9,
    10: 4,
    11: 5
  },
  ketu: {
    3: 12,
    6: 9,
    10: 4,
    11: 5
  }
};

/**
 * Checks if a classical exception (Apwaad) prevents Vedha:
 * 1. Sun and Saturn do not cause Vedha to each other (Father & Son relation).
 * 2. Moon and Mercury do not cause Vedha to each other (Father & Son relation).
 */
export function isVedhaException(
  transitPlanet: PlanetKey,
  obstructingPlanet: PlanetKey
): { isException: boolean; reason?: string } {
  if (
    (transitPlanet === 'sun' && obstructingPlanet === 'saturn') ||
    (transitPlanet === 'saturn' && obstructingPlanet === 'sun')
  ) {
    return {
      isException: true,
      reason: 'सूर्य और शनि के बीच शास्त्रीय पिता-पुत्र संबंध के कारण वेध मान्य नहीं होता।'
    };
  }

  if (
    (transitPlanet === 'moon' && obstructingPlanet === 'mercury') ||
    (transitPlanet === 'mercury' && obstructingPlanet === 'moon')
  ) {
    return {
      isException: true,
      reason: 'चन्द्र और बुध के बीच शास्त्रीय संबंध के कारण वेध दोष निष्प्रभावी रहता है।'
    };
  }

  return { isException: false };
}

/**
 * Determines Dignity (उच्च, नीच, स्वराशि) of a planet in a sign (1 to 12).
 */
export function getPlanetaryDignity(
  planet: PlanetKey,
  rashi: number
): { dignity: PlanetaryDignity; labelHindi: string } {
  // Sign map: 1=Mesh, 2=Vrishabh, 3=Mithun, 4=Kark, 5=Singh, 6=Kanya,
  // 7=Tula, 8=Vrishchik, 9=Dhanu, 10=Makar, 11=Kumbh, 12=Meen
  switch (planet) {
    case 'sun':
      if (rashi === 1) return { dignity: 'exalted', labelHindi: 'उच्च राशि (परम बलवान)' };
      if (rashi === 7) return { dignity: 'debilitated', labelHindi: 'नीच राशि (अल्प बल)' };
      if (rashi === 5) return { dignity: 'own_sign', labelHindi: 'स्वराशि (बलवान)' };
      break;
    case 'moon':
      if (rashi === 2) return { dignity: 'exalted', labelHindi: 'उच्च राशि (परम शुभ)' };
      if (rashi === 8) return { dignity: 'debilitated', labelHindi: 'नीच राशि (मानसिक तनाव)' };
      if (rashi === 4) return { dignity: 'own_sign', labelHindi: 'स्वराशि' };
      break;
    case 'mars':
      if (rashi === 10) return { dignity: 'exalted', labelHindi: 'उच्च राशि (कुलदीपक योग)' };
      if (rashi === 4) return { dignity: 'debilitated', labelHindi: 'नीच राशि (सावधानी)' };
      if (rashi === 1 || rashi === 8) return { dignity: 'own_sign', labelHindi: 'स्वराशि' };
      break;
    case 'mercury':
      if (rashi === 6) return { dignity: 'exalted', labelHindi: 'उच्च राशि (तीव्र बुद्धि)' };
      if (rashi === 12) return { dignity: 'debilitated', labelHindi: 'नीच राशि (निर्णय में भ्रम)' };
      if (rashi === 3) return { dignity: 'own_sign', labelHindi: 'स्वराशि' };
      break;
    case 'jupiter':
      if (rashi === 4) return { dignity: 'exalted', labelHindi: 'उच्च राशि (हंस महापुरुष तुल्य)' };
      if (rashi === 10) return { dignity: 'debilitated', labelHindi: 'नीच राशि (परिश्रम उपरांत फल)' };
      if (rashi === 9 || rashi === 12) return { dignity: 'own_sign', labelHindi: 'स्वराशि' };
      break;
    case 'venus':
      if (rashi === 12) return { dignity: 'exalted', labelHindi: 'उच्च राशि (सर्व सुखप्रद)' };
      if (rashi === 6) return { dignity: 'debilitated', labelHindi: 'नीच राशि (सावधानी)' };
      if (rashi === 2 || rashi === 7) return { dignity: 'own_sign', labelHindi: 'स्वराशि' };
      break;
    case 'saturn':
      if (rashi === 7) return { dignity: 'exalted', labelHindi: 'उच्च राशि (शश महापुरुष तुल्य)' };
      if (rashi === 1) return { dignity: 'debilitated', labelHindi: 'नीच राशि (कठिन परीक्षा)' };
      if (rashi === 10 || rashi === 11) return { dignity: 'own_sign', labelHindi: 'स्वराशि' };
      break;
    case 'rahu':
      if (rashi === 2) return { dignity: 'exalted', labelHindi: 'उच्च राशि' };
      if (rashi === 8) return { dignity: 'debilitated', labelHindi: 'नीच राशि' };
      if (rashi === 11) return { dignity: 'own_sign', labelHindi: 'स्वक्षेत्री (कुंभ)' };
      break;
    case 'ketu':
      if (rashi === 8) return { dignity: 'exalted', labelHindi: 'उच्च राशि' };
      if (rashi === 2) return { dignity: 'debilitated', labelHindi: 'नीच राशि' };
      break;
  }

  return { dignity: 'neutral', labelHindi: 'सामान्य राशि' };
}

/**
 * Checks if Vedha (obstruction) is present for a transit house.
 */
export function checkVedha(
  transitPlanet: PlanetKey,
  house: number,
  referenceRashi: number,
  otherPlanetRashis: Partial<Record<PlanetKey, number>> = {}
): VedhaInfo {
  const isFavorable = FAVORABLE_HOUSES[transitPlanet].includes(house);
  if (!isFavorable) {
    return {
      hasVedha: false,
      noteHindi: 'अशुभ भाव में वेध का विचार नहीं होता।'
    };
  }

  const expectedVedhaHouse = VEDHA_MAP[transitPlanet]?.[house];
  if (!expectedVedhaHouse) {
    return {
      hasVedha: false,
      noteHindi: 'इस भाव के लिए कोई वेध भाव नियत नहीं है।'
    };
  }

  // Find if any planet occupies the expectedVedhaHouse from referenceRashi
  for (const [pKey, rashi] of Object.entries(otherPlanetRashis) as [PlanetKey, number][]) {
    if (!rashi || pKey === transitPlanet) continue;

    const pOccupiedHouse = calculateTransitHouse(referenceRashi, rashi);
    if (pOccupiedHouse === expectedVedhaHouse) {
      // Check classical exception
      const exception = isVedhaException(transitPlanet, pKey);
      if (exception.isException) {
        return {
          hasVedha: false,
          vedhaHouse: expectedVedhaHouse,
          obstructingPlanet: pKey,
          obstructingPlanetHindi: PLANET_INFO[pKey]?.nameHi || pKey,
          exceptionApplied: exception.reason,
          noteHindi: `वेध भाव (${expectedVedhaHouse}) में ${PLANET_INFO[pKey]?.nameHi} स्थित हैं, किंतु अपवाद नियम के कारण वेध दोष नहीं लगेगा।`
        };
      }

      return {
        hasVedha: true,
        vedhaHouse: expectedVedhaHouse,
        obstructingPlanet: pKey,
        obstructingPlanetHindi: PLANET_INFO[pKey]?.nameHi || pKey,
        noteHindi: `वेध भाव (${expectedVedhaHouse}) में ${PLANET_INFO[pKey]?.nameHi} के होने से शुभ फल में विलंब अथवा अवरोध संभव है।`
      };
    }
  }

  return {
    hasVedha: false,
    vedhaHouse: expectedVedhaHouse,
    noteHindi: `वेध भाव (${expectedVedhaHouse}) रिक्त है, अतः पूर्ण शुभ फल प्राप्त होगा।`
  };
}

/**
 * Evaluates the complete transit outcome for a specific Moon Sign / Lagna.
 */
export function evaluateTransitForRashi(
  transitPlanet: PlanetKey,
  transitRashi: number,
  moonRashi: number,
  otherPlanetRashis: Partial<Record<PlanetKey, number>> = {}
): TransitEvaluation {
  const house = calculateTransitHouse(moonRashi, transitRashi);
  const isFavorable = FAVORABLE_HOUSES[transitPlanet].includes(house);
  const dignityResult = getPlanetaryDignity(transitPlanet, transitRashi);
  const vedhaResult = checkVedha(transitPlanet, house, moonRashi, otherPlanetRashis);

  let overallStatus: TransitOverallStatus = 'ashubh';
  let statusLabelHindi = 'सावधानी / चुनौती';

  if (isFavorable) {
    if (vedhaResult.hasVedha) {
      overallStatus = 'vilambit_shubh';
      statusLabelHindi = 'वेध बाधित / विलंबित शुभ';
    } else {
      overallStatus = 'shubh';
      statusLabelHindi = 'पूर्ण शुभ एवं फलदायी';
    }
  }

  return {
    moonRashi,
    house,
    isFavorableHouse: isFavorable,
    dignity: dignityResult.dignity,
    dignityLabelHindi: dignityResult.labelHindi,
    vedha: vedhaResult,
    overallStatus,
    statusLabelHindi
  };
}
