/**
 * Sanatan Web (सनातन घड़ी)
 * Utility: timeHindiFormat
 * Converts English time strings, numerals, and Panchang tags into pure Hindi Devanagari
 */

const HINDI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const YOGA_HINDI_NAMES: Record<string, string> = {
  'vishkumbha': 'विष्कुम्भ योग',
  'preeti': 'प्रीति योग',
  'ayushman': 'आयुष्मान योग',
  'saubhagya': 'सौभाग्य योग',
  'shobhana': 'शोभन योग',
  'atiganda': 'अतिगण्ड योग',
  'sukarma': 'सुकर्मा योग',
  'dhriti': 'धृति योग',
  'shoola': 'शूल योग',
  'ganda': 'गण्ड योग',
  'vriddhi': 'वृद्धि योग',
  'dhruva': 'ध्रुव योग',
  'vyaghata': 'व्याघात योग',
  'harshana': 'हर्षण योग',
  'vajra': 'वज्र योग',
  'siddhi': 'सिद्धि योग',
  'vyatipata': 'व्यतीपात योग',
  'variyan': 'वरीयान योग',
  'parigha': 'परिघ योग',
  'shiva': 'शिव योग',
  'siddha': 'सिद्ध योग',
  'sadhya': 'साध्य योग',
  'shubha': 'शुभ योग',
  'shukla': 'शुक्ल योग',
  'brahma': 'ब्रह्म योग',
  'indra': 'इन्द्र योग',
  'vaidhriti': 'वैधृति योग',
};

/**
 * Converts any number or numeric string to Hindi Devanagari numerals
 */
export function toHindiDigits(input: number | string): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, (digit) => HINDI_DIGITS[parseInt(digit, 10)] || digit);
}

/**
 * Formats a single time string like "06:14 AM" or "06:41 PM" into pure Hindi
 * Respects user numeral preferences ('devanagari' vs 'international')
 * @param timeStr e.g. "06:14 AM"
 * @param format 'praatah_saayam' (प्रातः / सायं) | 'poorvaahn_aparaahn' (पूर्वाह्न / अपराह्न)
 * @param numeralsStyle 'devanagari' | 'international'
 */
export function formatTimeToHindi(
  timeStr?: string,
  format: 'praatah_saayam' | 'poorvaahn_aparaahn' = 'poorvaahn_aparaahn',
  numeralsStyle?: 'devanagari' | 'international'
): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  const isPM = /pm/i.test(trimmed);
  const isAM = /am/i.test(trimmed);

  const style: 'devanagari' | 'international' = numeralsStyle ?? (
    typeof window !== 'undefined'
      ? (localStorage.getItem('sanatan_numerals_pref') as 'devanagari' | 'international') || 'devanagari'
      : 'devanagari'
  );

  // Extract raw time digits and separators
  const cleanDigits = trimmed.replace(/am|pm/gi, '').trim();
  const formattedDigits = style === 'international'
    ? cleanDigits.replace(/[०-९]/g, (d) => String(HINDI_DIGITS.indexOf(d)))
    : toHindiDigits(cleanDigits);

  if (format === 'praatah_saayam') {
    if (isPM) return `${formattedDigits} सायं`;
    if (isAM) return `${formattedDigits} प्रातः`;
    return formattedDigits;
  }

  if (isPM) return `${formattedDigits} अपराह्न`;
  if (isAM) return `${formattedDigits} पूर्वाह्न`;
  return formattedDigits;
}

/**
 * Formats a time range string like "07:30 AM – 09:00 AM" into pure Hindi
 */
export function formatTimeRangeToHindi(
  startStr?: string,
  endStr?: string,
  numeralsStyle?: 'devanagari' | 'international'
): string {
  if (!startStr && !endStr) return '';
  if (startStr && !endStr) {
    if (startStr.includes('-') || startStr.includes('–')) {
      const [s, e] = startStr.split(/[-–]/).map(t => t.trim());
      return `${formatTimeToHindi(s, 'poorvaahn_aparaahn', numeralsStyle)} – ${formatTimeToHindi(e, 'poorvaahn_aparaahn', numeralsStyle)}`;
    }
    return formatTimeToHindi(startStr, 'poorvaahn_aparaahn', numeralsStyle);
  }
  return `${formatTimeToHindi(startStr, 'poorvaahn_aparaahn', numeralsStyle)} – ${formatTimeToHindi(endStr, 'poorvaahn_aparaahn', numeralsStyle)}`;
}

/**
 * Strips English parenthetical tags like "(Shubh)", "(Labh)" from Choghadiya or Muhurat names
 */
export function cleanHindiName(rawName?: string): string {
  if (!rawName) return '';
  return rawName
    .replace(/\s*\([a-zA-Z\s]+\)/g, '')
    .replace(/[a-zA-Z]/g, '')
    .trim();
}

/**
 * Converts English or raw Yoga names (e.g. "Shiva (Auspicious)") to pure Hindi
 */
export function toHindiYogaName(rawYoga?: string): string {
  if (!rawYoga) return 'हर्षण योग';
  const clean = cleanHindiName(rawYoga);
  if (/[\u0900-\u097F]/.test(clean) && !/[a-zA-Z]/.test(clean)) {
    return clean.includes('योग') ? clean : `${clean} योग`;
  }
  const cleanKey = rawYoga.split(/[\s(]/)[0].toLowerCase().trim();
  return YOGA_HINDI_NAMES[cleanKey] || `${clean} योग` || 'शुभ योग';
}

/**
 * Maps raw Ritu names to pure Hindi
 */
export function getRituHindi(rawRitu?: string): string {
  if (!rawRitu) return 'शरद ऋतु';
  const l = rawRitu.toLowerCase();
  if (l.includes('sharad') || l.includes('autumn')) return 'शरद ऋतु';
  if (l.includes('vasant') || l.includes('spring')) return 'वसन्त ऋतु';
  if (l.includes('grishma') || l.includes('summer')) return 'ग्रीष्म ऋतु';
  if (l.includes('varsha') || l.includes('monsoon') || l.includes('rain')) return 'वर्षा ऋतु';
  if (l.includes('hemant') || l.includes('pre-winter')) return 'हेमन्त ऋतु';
  if (l.includes('shishir') || l.includes('winter')) return 'शिशिर ऋतु';
  return rawRitu.includes('ऋतु') ? rawRitu : `${rawRitu} ऋतु`;
}

/**
 * Maps raw Ayana names to pure Hindi
 */
export function getAyanaHindi(rawAyana?: string): string {
  if (!rawAyana) return 'दक्षिणायन';
  const l = rawAyana.toLowerCase();
  if (l.includes('dakshin')) return 'दक्षिणायन';
  if (l.includes('uttar')) return 'उत्तरायण';
  return rawAyana;
}

/**
 * Returns Classical Parashari Tithi Classification (नन्दा, भद्रा, जया, रिक्ता, पूर्णा)
 */
export function getTithiNatureHindi(tithiNum?: number): string {
  if (!tithiNum) return 'शुभ फलदायी';
  const mod = tithiNum % 5;
  switch (mod) {
    case 1:
      return 'शुभ (नन्दा)';
    case 2:
      return 'शुभ (भद्रा)';
    case 3:
      return 'शुभ (जया)';
    case 4:
      return 'वर्ज्य (रिक्ता)';
    case 0:
      return 'श्रेष्ठ (पूर्णा)';
    default:
      return 'शुभ फलदायी';
  }
}

/**
 * Maps Nakshatras to classical 7 Sanatan Ganas/Natures
 */
export function getNakshatraNatureHindi(nakshatraName?: string, rawNature?: string): string {
  if (rawNature && /[\u0900-\u097F]/.test(rawNature)) return rawNature;
  const n = (nakshatraName || '').toLowerCase();
  if (n.includes('आर्द्रा') || n.includes('ardra') || n.includes('ज्येष्ठा') || n.includes('jyeshtha') || n.includes('मूल') || n.includes('moola') || n.includes('आश्लेषा') || n.includes('ashlesha')) {
    return 'तीक्ष्ण संज्ञक';
  }
  if (n.includes('रोहिणी') || n.includes('rohini') || n.includes('उत्तरा') || n.includes('uttara')) {
    return 'ध्रुव (स्थिर) संज्ञक';
  }
  if (n.includes('चित्रा') || n.includes('chitra') || n.includes('अनुराधा') || n.includes('anuradha') || n.includes('मृगशिरा') || n.includes('mrigashirsha') || n.includes('रेवती') || n.includes('revati')) {
    return 'मृदु संज्ञक';
  }
  if (n.includes('अश्विनी') || n.includes('ashwini') || n.includes('पुष्य') || n.includes('pushya') || n.includes('हस्त') || n.includes('hasta')) {
    return 'लघु (क्षिप्र) संज्ञक';
  }
  if (n.includes('पुनर्वसु') || n.includes('punarvasu') || n.includes('स्वाति') || n.includes('swati') || n.includes('श्रवण') || n.includes('shravana') || n.includes('धनिष्ठा') || n.includes('dhanishta') || n.includes('शतभिषा') || n.includes('shatabhisha')) {
    return 'चर (गतिशील) संज्ञक';
  }
  if (n.includes('भरणी') || n.includes('bharani') || n.includes('मघा') || n.includes('magha') || n.includes('पूर्वा') || n.includes('purva')) {
    return 'उग्र (क्रूर) संज्ञक';
  }
  return 'मिश्र संज्ञक';
}

/**
 * Maps ruling planet name to pure Hindi
 */
export function getPlanetLordHindi(lord?: string): string {
  if (!lord) return 'ग्रह स्वामी';
  const l = lord.toLowerCase();
  if (l.includes('sun') || l.includes('सूर्य')) return 'सूर्य देव';
  if (l.includes('moon') || l.includes('चन्द्र') || l.includes('चंद्र')) return 'चंद्र देव';
  if (l.includes('mars') || l.includes('मंगल')) return 'मंगल देव';
  if (l.includes('mercury') || l.includes('बुध')) return 'बुध देव';
  if (l.includes('jupiter') || l.includes('बृहस्पति') || l.includes('गुरु')) return 'देवगुरु बृहस्पति';
  if (l.includes('venus') || l.includes('शुक्र')) return 'शुक्र देव';
  if (l.includes('saturn') || l.includes('शनि')) return 'शनि देव';
  if (l.includes('rahu') || l.includes('राहु')) return 'राहु देव';
  if (l.includes('ketu') || l.includes('केतु')) return 'केतु देव';
  return lord;
}

