/**
 * Sanatan Web (सनातन घड़ी)
 * Data Registry: Batch 1 - 108 Recurring Monthly Vratas
 * Based on Dharmasindhu & Nirnayasindhu Classical Canons
 *
 * Structure:
 * 1. 24 Ekadashi Vratas (12 Shukla + 12 Krishna)
 * 2. 24 Pradosha Vratas (12 Shukla + 12 Krishna)
 * 3. 12 Sankashti Chaturthi Vratas (12 Krishna)
 * 4. 12 Vinayaka Chaturthi Vratas (12 Shukla)
 * 5. 12 Masik Shivaratri Vratas (12 Krishna Chaturdashi)
 * 6. 12 Purnima Vratas (12 Shukla Purnima)
 * 7. 12 Amavasya / Pitru Vratas (12 Krishna Amavasya)
 * Total = 108 Vratas
 *
 * Strict < 300 lines modular standard
 */

export type VyaptiType =
  | 'UdayaVyapini'     // Active at sunrise
  | 'Madhyahna'        // Active at solar noon (Madhyahna)
  | 'Pradosha'         // Active at sunset / evening dusk (Pradosha kaal)
  | 'Nishita'          // Active at local midnight (Nishita kaal)
  | 'ChandraDarshan'   // Active at moonrise
  | 'Aparahna';        // Active in post-noon afternoon (Pitru tarpan)

export type LunarMasaName =
  | 'Chaitra'
  | 'Vaishakha'
  | 'Jyeshtha'
  | 'Ashadha'
  | 'Shravana'
  | 'Bhadrapada'
  | 'Ashwina'
  | 'Kartika'
  | 'Margashirsha'
  | 'Pausha'
  | 'Magha'
  | 'Phalguna';

export interface VrataDefinition {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  category: 'ekadashi' | 'pradosha' | 'sankashti' | 'vinayaka' | 'shivaratri' | 'purnima' | 'amavasya';
  deityHindi: string;
  masa: LunarMasaName;
  masaHindi: string;
  paksha: 'Shukla' | 'Krishna';
  pakshaHindi: 'शुक्ल' | 'कृष्ण';
  tithiNumber: number; // 1 to 15 (15=Purnima/Amavasya)
  vyapti: VyaptiType;
  descriptionHindi: string;
}

export const LUNAR_MASAS: { id: LunarMasaName; hindi: string; index: number }[] = [
  { id: 'Chaitra', hindi: 'चैत्र', index: 0 },
  { id: 'Vaishakha', hindi: 'वैशाख', index: 1 },
  { id: 'Jyeshtha', hindi: 'ज्येष्ठ', index: 2 },
  { id: 'Ashadha', hindi: 'आषाढ़', index: 3 },
  { id: 'Shravana', hindi: 'श्रावण', index: 4 },
  { id: 'Bhadrapada', hindi: 'भाद्रपद', index: 5 },
  { id: 'Ashwina', hindi: 'आश्विन', index: 6 },
  { id: 'Kartika', hindi: 'कार्तिक', index: 7 },
  { id: 'Margashirsha', hindi: 'मार्गशीर्ष', index: 8 },
  { id: 'Pausha', hindi: 'पौष', index: 9 },
  { id: 'Magha', hindi: 'माघ', index: 10 },
  { id: 'Phalguna', hindi: 'फाल्गुन', index: 11 },
];

// 1. 24 Classical Ekadashi Names
export const EKADASHI_NAMES: Record<LunarMasaName, { shukla: string; krishna: string }> = {
  Chaitra: { shukla: 'कामदा एकादशी', krishna: 'पापमोचिनी एकादशी' },
  Vaishakha: { shukla: 'मोहिनी एकादशी', krishna: 'वरुथिनी एकादशी' },
  Jyeshtha: { shukla: 'निर्जला एकादशी', krishna: 'अपरा एकादशी' },
  Ashadha: { shukla: 'देवशयनी एकादशी', krishna: 'योगिनी एकादशी' },
  Shravana: { shukla: 'पुत्रदा (पवित्रा) एकादशी', krishna: 'कामिका एकादशी' },
  Bhadrapada: { shukla: 'परिवर्तिनी एकादशी', krishna: 'अजा एकादशी' },
  Ashwina: { shukla: 'पापांकुशा एकादशी', krishna: 'इंदिरा एकादशी' },
  Kartika: { shukla: 'प्रबोधिनी (देवउठनी) एकादशी', krishna: 'रमा एकादशी' },
  Margashirsha: { shukla: 'मोक्षदा एकादशी', krishna: 'उत्पन्ना एकादशी' },
  Pausha: { shukla: 'पौष पुत्रदा एकादशी', krishna: 'सफला एकादशी' },
  Magha: { shukla: 'जया एकादशी', krishna: 'षट्तिला एकादशी' },
  Phalguna: { shukla: 'आमलकी एकादशी', krishna: 'विजया एकादशी' },
};

// 2. 12 Sankashti Names
export const SANKASHTI_NAMES: Record<LunarMasaName, string> = {
  Chaitra: 'विकट संकष्टी चतुर्थी',
  Vaishakha: 'एकदन्त संकष्टी चतुर्थी',
  Jyeshtha: 'कृष्णपिङ्गल संकष्टी चतुर्थी',
  Ashadha: 'गजानन संकष्टी चतुर्थी',
  Shravana: 'हेरम्ब संकष्टी चतुर्थी',
  Bhadrapada: 'विघ्नराज संकष्टी चतुर्थी',
  Ashwina: 'वक्रतुण्ड संकष्टी चतुर्थी',
  Kartika: 'करवा चौथ / संकष्टी चतुर्थी',
  Margashirsha: 'गणाधिप संकष्टी चतुर्थी',
  Pausha: 'अखुरथ संकष्टी चतुर्थी',
  Magha: 'द्विजप्रिय (संकट चौथ) संकष्टी',
  Phalguna: 'भालचन्द्र संकष्टी चतुर्थी',
};

// 3. 12 Purnima Special Titles
export const PURNIMA_TITLES: Record<LunarMasaName, string> = {
  Chaitra: 'चैत्री पूर्णिमा (हनुमान जयंती)',
  Vaishakha: 'वैशाखी पूर्णिमा (बुद्ध पूर्णिमा)',
  Jyeshtha: 'ज्येष्ठ पूर्णिमा (वट सावित्री)',
  Ashadha: 'आषाढ़ी पूर्णिमा (गुरु पूर्णिमा)',
  Shravana: 'श्रावणी पूर्णिमा (रक्षाबंधन)',
  Bhadrapada: 'भाद्रपद पूर्णिमा (उमा महेश्वर)',
  Ashwina: 'शरद पूर्णिमा (कोजागरी)',
  Kartika: 'कार्तिक पूर्णिमा (देव दीपावली)',
  Margashirsha: 'मार्गशीर्ष पूर्णिमा (दत्तात्रेय जयंती)',
  Pausha: 'पौष पूर्णिमा (शाकंभरी जयंती)',
  Magha: 'माघी पूर्णिमा (माघ स्नान पूर्ण)',
  Phalguna: 'फाल्गुनी पूर्णिमा (होलिका दहन)',
};

// 4. 12 Amavasya Special Titles
export const AMAVASYA_TITLES: Record<LunarMasaName, string> = {
  Chaitra: 'चैत्र दर्श अमावस्या',
  Vaishakha: 'वैशाख अमावस्या (शनि जयंती)',
  Jyeshtha: 'ज्येष्ठ अमावस्या (वट सावित्री अमावस्या)',
  Ashadha: 'आषाढ़ अमावस्या (हलहारिणी)',
  Shravana: 'हरियाली अमावस्या',
  Bhadrapada: 'पिठोरी (कुशोत्पाटिनी) अमावस्या',
  Ashwina: 'सर्वपितृ मोक्ष अमावस्या (महालय)',
  Kartika: 'दीपावली (लक्ष्मी पूजन) अमावस्या',
  Margashirsha: 'मार्गशीर्ष दर्श अमावस्या',
  Pausha: 'पौष दर्श अमावस्या',
  Magha: 'मौनी अमावस्या (माघ महाकुंभ पर्व)',
  Phalguna: 'फाल्गुन दर्श अमावस्या',
};

/**
 * Builds the canonical 108 Vratas Registry Array.
 */
export function buildBatch1VrataRegistry(): VrataDefinition[] {
  const registry: VrataDefinition[] = [];

  for (const m of LUNAR_MASAS) {
    // 1. Ekadashi Shukla & Krishna (2 per month = 24)
    registry.push({
      id: `ekadashi_${m.id.toLowerCase()}_shukla`,
      nameHindi: EKADASHI_NAMES[m.id].shukla,
      nameEnglish: `${m.id} Shukla Ekadashi`,
      category: 'ekadashi',
      deityHindi: 'श्री विष्णु',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Shukla',
      pakshaHindi: 'शुक्ल',
      tithiNumber: 11,
      vyapti: 'UdayaVyapini',
      descriptionHindi: 'श्रीहरि विष्णु का पापनाशक व्रत, स्मार्त व वैष्णव अरुणोदयवेध निर्णय।',
    });

    registry.push({
      id: `ekadashi_${m.id.toLowerCase()}_krishna`,
      nameHindi: EKADASHI_NAMES[m.id].krishna,
      nameEnglish: `${m.id} Krishna Ekadashi`,
      category: 'ekadashi',
      deityHindi: 'श्री विष्णु',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Krishna',
      pakshaHindi: 'कृष्ण',
      tithiNumber: 11,
      vyapti: 'UdayaVyapini',
      descriptionHindi: 'श्रीहरि विष्णु का मोक्षप्रद व्रत, द्वादशी पारणा निर्णय।',
    });

    // 2. Pradosha Shukla & Krishna (2 per month = 24)
    registry.push({
      id: `pradosha_${m.id.toLowerCase()}_shukla`,
      nameHindi: `${m.hindi} शुक्ल प्रदोष व्रत`,
      nameEnglish: `${m.id} Shukla Pradosha`,
      category: 'pradosha',
      deityHindi: 'भगवान शिव',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Shukla',
      pakshaHindi: 'शुक्ल',
      tithiNumber: 13,
      vyapti: 'Pradosha',
      descriptionHindi: 'सूर्यास्त के समय त्रयोदशी व्याप्ति में शिव पूजन का फलप्रद व्रत।',
    });

    registry.push({
      id: `pradosha_${m.id.toLowerCase()}_krishna`,
      nameHindi: `${m.hindi} कृष्ण प्रदोष व्रत`,
      nameEnglish: `${m.id} Krishna Pradosha`,
      category: 'pradosha',
      deityHindi: 'भगवान शिव',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Krishna',
      pakshaHindi: 'कृष्ण',
      tithiNumber: 13,
      vyapti: 'Pradosha',
      descriptionHindi: 'प्रदोषकाल व्यापिनी कृष्ण त्रयोदशी में शिव-गौरी आराधना।',
    });

    // 3. Sankashti Chaturthi (1 per month = 12)
    registry.push({
      id: `sankashti_${m.id.toLowerCase()}`,
      nameHindi: SANKASHTI_NAMES[m.id],
      nameEnglish: `${m.id} Sankashti Chaturthi`,
      category: 'sankashti',
      deityHindi: 'श्री गणेश',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Krishna',
      pakshaHindi: 'कृष्ण',
      tithiNumber: 4,
      vyapti: 'ChandraDarshan',
      descriptionHindi: 'संकट नाशक गणेश चतुर्थी, चंद्रोदय समय अर्घ्य एवं पारणा।',
    });

    // 4. Vinayaka Chaturthi (1 per month = 12)
    registry.push({
      id: `vinayaka_${m.id.toLowerCase()}`,
      nameHindi: `${m.hindi} विनायक चतुर्थी`,
      nameEnglish: `${m.id} Vinayaka Chaturthi`,
      category: 'vinayaka',
      deityHindi: 'श्री गणेश',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Shukla',
      pakshaHindi: 'शुक्ल',
      tithiNumber: 4,
      vyapti: 'Madhyahna',
      descriptionHindi: 'मध्याह्न व्यापिनी शुक्ल चतुर्थी में श्री गणेश सिद्धि विनायक पूजन।',
    });

    // 5. Masik Shivaratri (1 per month = 12)
    registry.push({
      id: `shivaratri_${m.id.toLowerCase()}`,
      nameHindi: `${m.hindi} मासिक शिवरात्रि`,
      nameEnglish: `${m.id} Masik Shivaratri`,
      category: 'shivaratri',
      deityHindi: 'भगवान शिव',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Krishna',
      pakshaHindi: 'कृष्ण',
      tithiNumber: 14,
      vyapti: 'Nishita',
      descriptionHindi: 'निशीथकाल (मध्यरात्रि) व्यापिनी कृष्ण चतुर्दशी में महाकाल पूजन।',
    });

    // 6. Purnima Vrata (1 per month = 12)
    registry.push({
      id: `purnima_${m.id.toLowerCase()}`,
      nameHindi: PURNIMA_TITLES[m.id],
      nameEnglish: `${m.id} Purnima`,
      category: 'purnima',
      deityHindi: 'सत्यनारायण / चंद्रदेव',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Shukla',
      pakshaHindi: 'शुक्ल',
      tithiNumber: 15,
      vyapti: 'Pradosha',
      descriptionHindi: 'सत्यनारायण कथा, तीर्थ स्नान, दीपदान एवं लक्ष्मी पूजन।',
    });

    // 7. Amavasya Vrata (1 per month = 12)
    registry.push({
      id: `amavasya_${m.id.toLowerCase()}`,
      nameHindi: AMAVASYA_TITLES[m.id],
      nameEnglish: `${m.id} Amavasya`,
      category: 'amavasya',
      deityHindi: 'पितृदेव / सूर्यदेव',
      masa: m.id,
      masaHindi: m.hindi,
      paksha: 'Krishna',
      pakshaHindi: 'कृष्ण',
      tithiNumber: 15,
      vyapti: 'Aparahna',
      descriptionHindi: 'पितृ तर्पण, श्राद्ध कर्म, दर्श अमावस्या एवं दान-पुण्य पर्व।',
    });
  }

  return registry;
}

export const BATCH_1_REGISTRY = buildBatch1VrataRegistry();
