import { PanchangInfo } from '../types';

export interface MuhuratSuitability {
  type: string;
  name: string;
  hindiName: string;
  isSuitable: boolean;
  score: number; // 0 to 100
  reasons: string[];
}

/**
 * Evaluates auspiciousness score for major life events on a given Panchang day.
 * Implements 100% offline rule matching logic with strict Vedic Jyotish Hard Blockers.
 */
export function checkMuhurats(panchang: PanchangInfo): MuhuratSuitability[] {
  const tithiName = panchang.hinduDate.tithi.name;
  const nakshatraName = panchang.hinduDate.nakshatra.name;
  const paksha = panchang.hinduDate.paksha;
  const tithiValue = panchang.hinduDate.tithi.value;

  // Extract tithi name prefix (e.g. "Panchami")
  const tithiType = tithiName.replace(/(Shukla\s*|Krishna\s*)/, '').trim();

  const dateObj = new Date(panchang.date);
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const suitabilities: MuhuratSuitability[] = [];

  const auspiciousTithis = ['Dwitiya', 'Tritiya', 'Panchami', 'Saptami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi'];
  const avoidTithis = ['Amavasya', 'Chaturthi', 'Navami', 'Chaturdashi', 'Ashtami'];

  // Check Chaturmas (Devshayani Ekadashi to Devutthani Ekadashi)
  const monthStr = panchang.hinduDate.month || '';
  const monthHindiStr = panchang.hinduDate.monthHindi || '';
  const isChaturmasMonth = ['Shravana', 'Bhadrapada', 'Ashvina', 'श्रावण', 'भाद्रपद', 'आश्विन'].some(
    m => monthStr.includes(m) || monthHindiStr.includes(m)
  );
  const isAshadhaChaturmas = (monthStr.includes('Ashadha') || monthHindiStr.includes('आषाढ़')) && paksha === 'Shukla' && tithiValue >= 11;
  const isKartikaChaturmas = (monthStr.includes('Kartika') || monthHindiStr.includes('कार्तिक')) && paksha === 'Shukla' && tithiValue <= 11;
  const isChaturmas = isChaturmasMonth || isAshadhaChaturmas || isKartikaChaturmas;

  // 1. Griha Pravesh Muhurat (Fixed & Friendly Nakshatras only)
  {
    const gpNakshatras = ['Rohini', 'Mrigashirsha', 'Chitra', 'Anuradha', 'Uttaraphalguni', 'Uttarashadha', 'Uttarabhadrapada', 'Revati'];
    const gpDays = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
    const reasons: string[] = [];
    let score = 50;

    if (paksha === 'Shukla') {
      score += 15;
      reasons.push('शुक्ल पक्ष अत्यंत अनुकूल है।');
    } else {
      score -= 10;
      reasons.push('कृष्ण पक्ष में नए गृह प्रवेश को सामान्यतः वर्जित माना जाता है।');
    }

    if (gpNakshatras.includes(nakshatraName)) {
      score += 25;
      reasons.push(`गृह प्रवेश हेतु ${nakshatraName} नक्षत्र अति उत्तम है।`);
    } else {
      // Hard Blocker: Prohibited Nakshatra
      score -= 35;
      reasons.unshift(`${nakshatraName} नक्षत्र में गृह प्रवेश वर्जित है (टालें)।`);
    }

    if (auspiciousTithis.includes(tithiType)) {
      score += 15;
      reasons.push(`तिथि ${tithiType} अत्यंत शुभ है।`);
    } else if (avoidTithis.includes(tithiType)) {
      score -= 25;
      reasons.push(`तिथि ${tithiType} में यह कार्य वर्जित है।`);
    }

    if (gpDays.includes(dayOfWeek)) {
      score += 10;
      reasons.push('वार (दिन) अनुकूल है।');
    } else {
      score -= 10;
      reasons.push('वार (दिन) उत्तम नहीं है।');
    }

    // Hard Blocker enforcement: If nakshatra not suitable, hard cap score at 30
    const isNakshatraValid = gpNakshatras.includes(nakshatraName);
    const finalScore = isNakshatraValid ? Math.max(0, Math.min(100, score)) : Math.min(30, Math.max(10, score));

    suitabilities.push({
      type: 'griha_pravesh',
      name: 'Griha Pravesh',
      hindiName: 'गृह प्रवेश मुहूर्त',
      isSuitable: isNakshatraValid && finalScore >= 65,
      score: finalScore,
      reasons
    });
  }

  // 2. Vivah Muhurat
  {
    const vNakshatras = ['Rohini', 'Mrigashirsha', 'Magha', 'Uttaraphalguni', 'Hasta', 'Swati', 'Anuradha', 'Uttarashadha', 'Uttarabhadrapada', 'Revati'];
    const vDays = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
    const reasons: string[] = [];
    let score = 50;

    if (isChaturmas) {
      score -= 40;
      reasons.unshift('चातुर्मास में विवाह संस्कार सर्वथा वर्जित हैं।');
    }

    if (vNakshatras.includes(nakshatraName)) {
      score += 25;
      reasons.push(`विवाह हेतु ${nakshatraName} नक्षत्र अत्यंत शुभ एवं मंगलकारी है।`);
    } else {
      score -= 30;
      reasons.unshift(`${nakshatraName} नक्षत्र विवाह हेतु उत्तम नहीं है।`);
    }

    if (auspiciousTithis.includes(tithiType)) {
      score += 15;
      reasons.push(`तिथि ${tithiType} अनुकूल है।`);
    } else if (avoidTithis.includes(tithiType)) {
      score -= 30;
      reasons.push(`तिथि ${tithiType} अशुभ मानी जाती है।`);
    }

    if (vDays.includes(dayOfWeek)) {
      score += 10;
    } else {
      score -= 5;
    }

    // Hard Blocker: Chaturmas or Prohibited Nakshatra
    const isVivahAllowed = !isChaturmas && vNakshatras.includes(nakshatraName);
    const finalScore = isVivahAllowed ? Math.max(0, Math.min(100, score)) : Math.min(25, Math.max(10, score));

    suitabilities.push({
      type: 'vivah',
      name: 'Marriage (Vivah)',
      hindiName: 'विवाह मुहूर्त',
      isSuitable: isVivahAllowed && finalScore >= 65,
      score: finalScore,
      reasons
    });
  }

  // 3. Vahan Khareedi
  {
    const vhNakshatras = ['Ashwini', 'Rohini', 'Mrigashirsha', 'Punarvasu', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shatabhisha', 'Revati'];
    const vhDays = [0, 1, 3, 4, 5]; // Sun, Mon, Wed, Thu, Fri
    const reasons: string[] = [];
    let score = 50;

    if (vhNakshatras.includes(nakshatraName)) {
      score += 20;
      reasons.push(`वाहन क्रय हेतु ${nakshatraName} नक्षत्र शुभ है।`);
    } else {
      score -= 15;
      reasons.push(`नक्षत्र ${nakshatraName} सामान्य प्रभाव वाला है।`);
    }

    if (['Tritiya', 'Panchami', 'Ekadashi', 'Trayodashi', 'Purnima'].includes(tithiType)) {
      score += 15;
      reasons.push(`तिथि ${tithiType} खरीदारी हेतु शुभ है।`);
    } else if (avoidTithis.includes(tithiType)) {
      score -= 25;
      reasons.push(`तिथि ${tithiType} में वाहन खरीदारी से बचें।`);
    }

    if (vhDays.includes(dayOfWeek)) {
      score += 10;
      reasons.push('वार (दिन) वाहन क्रय हेतु अनुकूल है।');
    } else {
      score -= 20;
      reasons.push('मंगलवार या शनिवार को वाहन क्रय करने से बचें।');
    }

    suitabilities.push({
      type: 'vahan_purchase',
      name: 'Vehicle Purchase',
      hindiName: 'वाहन क्रय मुहूर्त',
      isSuitable: score >= 60,
      score: Math.max(0, Math.min(100, score)),
      reasons
    });
  }

  // 4. Namkaran
  {
    const nkNakshatras = ['Ashwini', 'Rohini', 'Mrigashirsha', 'Punarvasu', 'Pushya', 'Uttaraphalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttarashadha', 'Uttarabhadrapada', 'Revati'];
    const reasons: string[] = [];
    let score = 50;

    if (nkNakshatras.includes(nakshatraName)) {
      score += 25;
      reasons.push(`नामकरण संस्कार के लिए ${nakshatraName} नक्षत्र अनुकूल है।`);
    } else {
      score -= 10;
      reasons.push(`नक्षत्र ${nakshatraName} सामान्य प्रभाव वाला है।`);
    }

    if (auspiciousTithis.includes(tithiType)) {
      score += 15;
      reasons.push(`तिथि ${tithiType} अनुकूल है।`);
    } else if (avoidTithis.includes(tithiType)) {
      score -= 20;
      reasons.push(`तिथि ${tithiType} में नामकरण संस्कार न करें।`);
    }

    suitabilities.push({
      type: 'namkaran',
      name: 'Naming Ceremony',
      hindiName: 'नामकरण मुहूर्त',
      isSuitable: score >= 60,
      score: Math.max(0, Math.min(100, score)),
      reasons
    });
  }

  // 5. Vyapar Aarambh (Business Opening)
  {
    const bNakshatras = ['Ashwini', 'Rohini', 'Mrigashirsha', 'Pushya', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Revati'];
    const reasons: string[] = [];
    let score = 55;

    if (bNakshatras.includes(nakshatraName)) {
      score += 25;
      reasons.push(`व्यापार आरंभ हेतु ${nakshatraName} नक्षत्र अत्यंत अनुकूल व फलदायी है।`);
    } else {
      score -= 10;
      reasons.push(`नक्षत्र ${nakshatraName} सामान्य है।`);
    }

    if (auspiciousTithis.includes(tithiType)) {
      score += 15;
      reasons.push(`तिथि ${tithiType} व्यवसाय वृद्धि हेतु शुभ है।`);
    } else if (avoidTithis.includes(tithiType)) {
      score -= 20;
      reasons.push(`तिथि ${tithiType} में नया व्यवसाय शुरू करने से बचें।`);
    }

    if ([1, 3, 4, 5].includes(dayOfWeek)) {
      score += 10;
      reasons.push('वार (दिन) व्यापार वृद्धि कारक है।');
    }

    suitabilities.push({
      type: 'business',
      name: 'Business Opening',
      hindiName: 'व्यापार आरंभ',
      isSuitable: score >= 65,
      score: Math.max(0, Math.min(100, score)),
      reasons
    });
  }

  // 6. Bhoomi Pujan & Foundation
  {
    const bpNakshatras = ['Rohini', 'Mrigashirsha', 'Pushya', 'Uttaraphalguni', 'Hasta', 'Chitra', 'Swati', 'Anuradha', 'Uttarashadha', 'Dhanishta', 'Shatabhisha', 'Uttarabhadrapada', 'Revati'];
    const reasons: string[] = [];
    let score = 50;

    if (bpNakshatras.includes(nakshatraName)) {
      score += 25;
      reasons.push(`भूमि पूजन व निर्माण हेतु ${nakshatraName} नक्षत्र उत्तम है।`);
    } else {
      score -= 15;
      reasons.push(`नक्षत्र ${nakshatraName} सामान्य है।`);
    }

    if (auspiciousTithis.includes(tithiType)) {
      score += 15;
      reasons.push(`तिथि ${tithiType} नींव पूजन हेतु शुभ है।`);
    } else if (avoidTithis.includes(tithiType)) {
      score -= 20;
      reasons.push(`तिथि ${tithiType} में भूमि पूजन टालें।`);
    }

    if ([1, 3, 4, 5].includes(dayOfWeek)) {
      score += 10;
      reasons.push('वार (दिन) निर्माण कार्य हेतु अनुकूल है।');
    }

    suitabilities.push({
      type: 'land',
      name: 'Bhoomi Pujan',
      hindiName: 'भूमि पूजन मुहूर्त',
      isSuitable: score >= 65,
      score: Math.max(0, Math.min(100, score)),
      reasons
    });
  }

  return suitabilities;
}
