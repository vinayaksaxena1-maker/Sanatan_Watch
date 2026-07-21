import { PanchangInfo, Festival } from '../types';

/**
 * Calculates Hindu festivals and vrats dynamically for a given Panchang day
 * based on Tithi, Month, and astronomical alignments.
 * Runs 100% offline.
 */
export function getFestivalsForDay(panchang: PanchangInfo): Festival[] {
  if (!panchang || !panchang.hinduDate || !panchang.hinduDate.tithi) return [];
  const festivals: Festival[] = [];
  const tithiVal = panchang.hinduDate.tithi?.value || 1; // 1 to 30
  const month = panchang.hinduDate.month || "Chaitra"; // e.g. "Ashadha"
  const dateStr = panchang.date || new Date().toISOString().split("T")[0];
  const dateObj = new Date(dateStr);

  // 1. Ekadashi Vrat (Tithi 11 and 26)
  if (tithiVal === 11) {
    let nameEng = 'Shukla Ekadashi Vrat';
    let nameHin = 'शुक्ल एकादशी व्रत';
    if (month === 'Ashadha') { nameEng = 'Devshayani Ekadashi'; nameHin = 'देवशयनी एकादशी'; }
    else if (month === 'Shravana') { nameEng = 'Shravana Putrada Ekadashi'; nameHin = 'श्रावण पुत्रदा एकादशी'; }
    else if (month === 'Bhadrapada') { nameEng = 'Parivartini Ekadashi'; nameHin = 'परिवर्तिनी एकादशी'; }
    else if (month === 'Ashvin') { nameEng = 'Pasankusha Ekadashi'; nameHin = 'पापांकुशा एकादशी'; }
    else if (month === 'Kartik') { nameEng = 'Devutthana Ekadashi'; nameHin = 'देवउठनी एकादशी'; }
    else if (month === 'Margashirsha') { nameEng = 'Mokshada Ekadashi'; nameHin = 'मोक्षदा एकादशी'; }
    else if (month === 'Pausha') { nameEng = 'Pausha Putrada Ekadashi'; nameHin = 'पौष पुत्रदा एकादशी'; }
    else if (month === 'Magha') { nameEng = 'Jaya Ekadashi'; nameHin = 'जया एकादशी'; }
    else if (month === 'Phalguna') { nameEng = 'Amalaki Ekadashi'; nameHin = 'आमलकी एकादशी'; }
    else if (month === 'Chaitra') { nameEng = 'Kamada Ekadashi'; nameHin = 'कामदा एकादशी'; }
    else if (month === 'Vaishakha') { nameEng = 'Mohini Ekadashi'; nameHin = 'मोहिनी एकादशी'; }
    else if (month === 'Jyeshtha') { nameEng = 'Nirjala Ekadashi'; nameHin = 'निर्जला एकादशी'; }

    festivals.push({
      id: `ekadashi_shukla_${dateStr}`,
      name: nameEng,
      hindiName: nameHin,
      date: dateStr,
      month: month,
      tithi: 'Shukla Ekadashi',
      description: `Sacred fast dedicated to Lord Vishnu in the month of ${month}. Brings spiritual liberation.`,
      type: 'Ekadashi',
      isAuspicious: true
    });
  } else if (tithiVal === 26) {
    let nameEng = 'Krishna Ekadashi Vrat';
    let nameHin = 'कृष्ण एकादशी व्रत';
    if (month === 'Ashadha') { nameEng = 'Yogini Ekadashi'; nameHin = 'योगिनी एकादशी'; }
    else if (month === 'Shravana') { nameEng = 'Kamika Ekadashi'; nameHin = 'कामिका एकादशी'; }
    else if (month === 'Bhadrapada') { nameEng = 'Aja Ekadashi'; nameHin = 'अजा एकादशी'; }
    else if (month === 'Ashvin') { nameEng = 'Indira Ekadashi'; nameHin = 'इन्दिरा एकादशी'; }
    else if (month === 'Kartik') { nameEng = 'Rama Ekadashi'; nameHin = 'रमा एकादशी'; }
    else if (month === 'Margashirsha') { nameEng = 'Utpanna Ekadashi'; nameHin = 'उत्पन्ना एकादशी'; }
    else if (month === 'Pausha') { nameEng = 'Shattila Ekadashi'; nameHin = 'षट्तिला एकादशी'; }
    else if (month === 'Magha') { nameEng = 'Shattila Ekadashi'; nameHin = 'षट्तिला एकादशी'; }
    else if (month === 'Phalguna') { nameEng = 'Vijaya Ekadashi'; nameHin = 'विजया एकादशी'; }
    else if (month === 'Chaitra') { nameEng = 'Papmochani Ekadashi'; nameHin = 'पापमोचनी एकादशी'; }
    else if (month === 'Vaishakha') { nameEng = 'Varuthini Ekadashi'; nameHin = 'वरूथिनी एकादशी'; }
    else if (month === 'Jyeshtha') { nameEng = 'Apara Ekadashi'; nameHin = 'अपरा एकादशी'; }

    festivals.push({
      id: `ekadashi_krishna_${dateStr}`,
      name: nameEng,
      hindiName: nameHin,
      date: dateStr,
      month: month,
      tithi: 'Krishna Ekadashi',
      description: `Sacred fast dedicated to Lord Vishnu in the month of ${month}. Mitigates spiritual obstacles.`,
      type: 'Ekadashi',
      isAuspicious: true
    });
  }

  // 2. Pradosh Vrat (Tithi 13 and 28)
  if (tithiVal === 13) {
    festivals.push({
      id: `pradosh_shukla_${dateStr}`,
      name: 'Shukla Pradosh Vrat',
      hindiName: 'शुक्ल प्रदोष व्रत',
      date: dateStr,
      month: month,
      tithi: 'Shukla Trayodashi',
      description: 'Twilight prayer window dedicated to Lord Shiva. Fosters health and release from debts.',
      type: 'Major',
      isAuspicious: true
    });
  } else if (tithiVal === 28) {
    festivals.push({
      id: `pradosh_krishna_${dateStr}`,
      name: 'Krishna Pradosh Vrat',
      hindiName: 'कृष्ण प्रदोष व्रत',
      date: dateStr,
      month: month,
      tithi: 'Krishna Trayodashi',
      description: 'Twilight prayer window dedicated to Lord Shiva. Dissolves karmic blocks.',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 3. Masik Durgashtami & Special Ashtamis (Tithi 8)
  if (tithiVal === 8) {
    let nameEng = 'Masik Durgashtami';
    let nameHin = 'मासिक दुर्गाष्टमी';

    if (month === 'Ashadha') {
      nameEng = 'Parvati Jayanti / Masik Durgashtami';
      nameHin = 'पार्वती जयन्ती / मासिक दुर्गाष्टमी';
    } else if (month === 'Chaitra') {
      nameEng = 'Durga Ashtami (Chaitra Navratri)';
      nameHin = 'दुर्गा अष्टमी (चैत्र नवरात्र)';
    } else if (month === 'Ashvin') {
      nameEng = 'Maha Ashtami (Durga Puja)';
      nameHin = 'महा अष्टमी (दुर्गा पूजा)';
    }

    festivals.push({
      id: `durgashtami_${dateStr}`,
      name: nameEng,
      hindiName: nameHin,
      date: dateStr,
      month: month,
      tithi: 'Shukla Ashtami',
      description: `Sacred fast honoring Goddess Durga on Shukla Ashtami of ${month}. Grants strength and protection.`,
      type: 'Major',
      isAuspicious: true
    });
  }

  // 4. Masik Kalashtami (Tithi 23 - Krishna Ashtami)
  if (tithiVal === 23) {
    if (month === 'Bhadrapada') {
      festivals.push({
        id: `janmashtami_${dateStr}`,
        name: 'Krishna Janmashtami',
        hindiName: 'कृष्ण जन्माष्टमी',
        date: dateStr,
        month: month,
        tithi: 'Krishna Ashtami',
        description: 'Celebrating the birth of Lord Krishna at midnight, symbolizing the victory of righteousness.',
        type: 'Major',
        isAuspicious: true
      });
    } else {
      festivals.push({
        id: `kalashtami_${dateStr}`,
        name: 'Masik Kalashtami',
        hindiName: 'मासिक कालाष्टमी',
        date: dateStr,
        month: month,
        tithi: 'Krishna Ashtami',
        description: 'Dedicated to Lord Bhairava (fierce form of Shiva) for spiritual fortitude.',
        type: 'Major',
        isAuspicious: true
      });
    }
  }

  // 5. Masik Shivaratri (Tithi 29 - Krishna Chaturdashi)
  if (tithiVal === 29) {
    if (month === 'Phalguna' || month === 'Magha') {
      festivals.push({
        id: `maha_shivratri_${dateStr}`,
        name: 'Maha Shivratri',
        hindiName: 'महाशिवरात्रि',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturdashi',
        description: 'The Great Night of Shiva. Celebrates the convergence of Shiva and Shakti.',
        type: 'Major',
        isAuspicious: true
      });
    } else {
      festivals.push({
        id: `masik_shivaratri_${dateStr}`,
        name: 'Masik Shivaratri',
        hindiName: 'मासिक शिवरात्रि',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturdashi',
        description: 'Monthly night vigil dedicated to Lord Shiva for inner transformation.',
        type: 'Major',
        isAuspicious: true
      });
    }
  }

  // 6. Sankashti & Vinayaka Chaturthi (Tithi 19 and Tithi 4)
  if (tithiVal === 19) {
    if (month === 'Kartik') {
      festivals.push({
        id: `karwa_chauth_${dateStr}`,
        name: 'Karwa Chauth',
        hindiName: 'करवा चौथ',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturthi',
        description: 'Fasting day observed by married women for the longevity and prosperity of their husbands.',
        type: 'Major',
        isAuspicious: true
      });
    } else {
      festivals.push({
        id: `sankashti_${dateStr}`,
        name: 'Sankashti Chaturthi',
        hindiName: 'संकष्टी चतुर्थी',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturthi',
        description: 'Sacred fast to Lord Ganesha for overcoming difficulties and hardship.',
        type: 'Major',
        isAuspicious: true
      });
    }
  } else if (tithiVal === 4) {
    if (month === 'Bhadrapada') {
      festivals.push({
        id: `ganesh_chaturthi_${dateStr}`,
        name: 'Ganesh Chaturthi',
        hindiName: 'गणेश चतुर्थी',
        date: dateStr,
        month: month,
        tithi: 'Shukla Chaturthi',
        description: 'Ten-day festival celebrating the divine birth of Lord Ganesha.',
        type: 'Major',
        isAuspicious: true
      });
    } else {
      festivals.push({
        id: `vinayaka_chaturthi_${dateStr}`,
        name: 'Vinayaka Chaturthi',
        hindiName: 'विनायक चतुर्थी',
        date: dateStr,
        month: month,
        tithi: 'Shukla Chaturthi',
        description: 'Monthly fast dedicated to Vinayaka (Ganesha) for wisdom and success.',
        type: 'Major',
        isAuspicious: true
      });
    }
  }

  // 7. Purnima Festivals (Tithi 15)
  if (tithiVal === 15) {
    let nameEng = 'Masik Purnima Vrat';
    let nameHin = 'मासिक पूर्णिमा व्रत';

    if (month === 'Phalguna') { nameEng = 'Holi (Holika Dahan)'; nameHin = 'होली / होलिका दहन'; }
    else if (month === 'Ashadha') { nameEng = 'Guru Purnima / Vyasa Purnima'; nameHin = 'गुरु पूर्णिमा / व्यास पूर्णिमा'; }
    else if (month === 'Shravana') { nameEng = 'Raksha Bandhan / Shravani Purnima'; nameHin = 'रक्षा बन्धन / श्रावणी पूर्णिमा'; }
    else if (month === 'Ashvin') { nameEng = 'Sharad Purnima / Kojagara Vrat'; nameHin = 'शरद पूर्णिमा / कोजागर व्रत'; }
    else if (month === 'Chaitra') { nameEng = 'Hanuman Jayanti / Chaitra Purnima'; nameHin = 'हनुमान जयन्ती / चैत्र पूर्णिमा'; }
    else if (month === 'Vaishakha') { nameEng = 'Buddha Purnima / Kurma Jayanti'; nameHin = 'बुद्ध पूर्णिमा / कूर्म जयन्ती'; }

    festivals.push({
      id: `purnima_${dateStr}`,
      name: nameEng,
      hindiName: nameHin,
      date: dateStr,
      month: month,
      tithi: 'Shukla Purnima',
      description: `Full moon sacred day in ${month}. Ideal for Satyanarayana Vrat and charity.`,
      type: 'Major',
      isAuspicious: true
    });
  }

  // 8. Amavasya Festivals (Tithi 30)
  if (tithiVal === 30) {
    let nameEng = 'Masik Amavasya';
    let nameHin = 'मासिक अमावस्या';

    if (month === 'Kartik') { nameEng = 'Diwali (Deepawali)'; nameHin = 'दीपावली (लक्ष्मी पूजा)'; }
    else if (month === 'Bhadrapada') { nameEng = 'Mahalaya Amavasya (Sarvapitri Amavasya)'; nameHin = 'सर्वपितृ अमावस्या (महालया)'; }

    festivals.push({
      id: `amavasya_${dateStr}`,
      name: nameEng,
      hindiName: nameHin,
      date: dateStr,
      month: month,
      tithi: 'Krishna Amavasya',
      description: `New moon sacred day in ${month}. Auspicious for ancestral rituals and tarpana.`,
      type: 'Major',
      isAuspicious: true
    });
  }

  // 9. Specific Tithi Festivals
  if (month === 'Chaitra' && tithiVal === 1) {
    festivals.push({
      id: `gudi_padwa_${dateStr}`,
      name: 'Gudi Padwa / Ugadi (Hindu New Year)',
      hindiName: 'गुड़ी पड़वा / युगादि (नव संवत्सर)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Pratipada',
      description: 'Vedic New Year. Marks the beginning of Chaitra Navratri.',
      type: 'Major',
      isAuspicious: true
    });
  }

  if (month === 'Chaitra' && tithiVal === 9) {
    festivals.push({
      id: `rama_navami_${dateStr}`,
      name: 'Rama Navami',
      hindiName: 'राम नवमी',
      date: dateStr,
      month: month,
      tithi: 'Shukla Navami',
      description: 'Birth anniversary of Lord Rama, the personification of righteousness.',
      type: 'Major',
      isAuspicious: true
    });
  }

  if (month === 'Ashvin' && tithiVal === 1) {
    festivals.push({
      id: `navratri_start_${dateStr}`,
      name: 'Ghatasthapana (Shardiya Navratri)',
      hindiName: 'घटस्थापना (शारदीय नवरात्र प्रारम्भ)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Pratipada',
      description: 'Commencement of 9-day Shardiya Navratri worship of Divine Mother Durga.',
      type: 'Major',
      isAuspicious: true
    });
  }

  if (month === 'Ashvin' && tithiVal === 10) {
    festivals.push({
      id: `dussehra_${dateStr}`,
      name: 'Dussehra (Vijayadashami)',
      hindiName: 'दशहरा (विजयादशमी)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Dashami',
      description: 'Celebrates Lord Rama\'s victory over Ravana and Goddess Durga\'s victory over Mahishasura.',
      type: 'Major',
      isAuspicious: true
    });
  }

  if (month === 'Kartik' && tithiVal === 1) {
    festivals.push({
      id: `govardhan_${dateStr}`,
      name: 'Govardhan Puja / Annakut',
      hindiName: 'गोवर्धन पूजा / अन्नकूट',
      date: dateStr,
      month: month,
      tithi: 'Shukla Pratipada',
      description: 'Commemorates Lord Krishna lifting the Govardhan Hill to protect Ayodhya villagers.',
      type: 'Major',
      isAuspicious: true
    });
  }

  if (month === 'Kartik' && tithiVal === 2) {
    festivals.push({
      id: `bhai_dooj_${dateStr}`,
      name: 'Bhai Dooj (Yamadwitiya)',
      hindiName: 'भैया दूज (यमद्वितीया)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Dwitiya',
      description: 'Celebrates the bond between brothers and sisters.',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 10. Solar Ingress Festivals (Makar Sankranti)
  const monthGreg = dateObj.getMonth();
  const dateGreg = dateObj.getDate();
  if (monthGreg === 0 && (dateGreg === 14 || dateGreg === 15)) {
    festivals.push({
      id: `makar_sankranti_${dateStr}`,
      name: 'Makar Sankranti',
      hindiName: 'मकर संक्रान्ति',
      date: dateStr,
      month: month,
      tithi: panchang.hinduDate.tithi.name,
      description: 'Harvest festival marking the transition of the Sun into Capricorn (Makara rashi).',
      type: 'Major',
      isAuspicious: true
    });
  }

  return festivals;
}

import { MONTHS_ENGLISH_HINDI } from './panchangCalc';

function getPanchangForFestivalDay(date: Date): PanchangInfo {
  const epoch = new Date('2026-03-18T05:30:00Z'); 
  const diffTime = date.getTime() - epoch.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  const lunarCycle = 29.530588853;
  const rawLunarMonthAge = (diffDays) % lunarCycle;
  const lunarMonthAge = rawLunarMonthAge < 0 ? rawLunarMonthAge + lunarCycle : rawLunarMonthAge;

  let tithiIdx = Math.floor((lunarMonthAge / lunarCycle) * 30);
  if (tithiIdx < 0) tithiIdx += 30;
  if (tithiIdx >= 30) tithiIdx = 29;
  const sunSidereal = (diffDays * 0.9856) % 360;
  const diffNorm = (lunarMonthAge / lunarCycle) * 360;
  const daysSinceNewMoon = diffNorm / 12.190749;
  const sunLonAtNewMoon = (sunSidereal - daysSinceNewMoon + 360) % 360;
  const monthIdx = (Math.floor(sunLonAtNewMoon / 30) + 1) % 12;
  const monthInfo = MONTHS_ENGLISH_HINDI[monthIdx] || MONTHS_ENGLISH_HINDI[0];

  const tithiName = tithiIdx < 15 ? `Shukla ${tithiIdx + 1}` : `Krishna ${tithiIdx - 14}`;

  return {
    date: date.toISOString().split("T")[0],
    sunrise: "06:00 AM",
    sunset: "06:00 PM",
    moonrise: "06:00 PM",
    moonset: "06:00 AM",
    rahuKaal: { start: "0", end: "0" },
    gulikKaal: { start: "0", end: "0" },
    yamagandam: { start: "0", end: "0" },
    choghadiya: [],
    hora: [],
    hinduDate: {
      tithi: {
        name: tithiName,
        hindiName: tithiName,
        value: tithiIdx + 1,
        startTime: "",
        endTime: "",
        percentPassed: 0.5,
        lord: "",
        deity: "",
        isKshaya: false,
        isVriddhi: false
      },
      nakshatra: {
        name: "",
        hindiName: "",
        value: 1,
        endTime: "",
        lord: "",
        deity: "",
        symbol: "",
        nature: "",
        description: "",
        suitableActivities: [],
        avoidActivities: []
      },
      yoga: {
        name: "",
        hindiName: "",
        value: 1,
        endTime: "",
        meaning: "",
        isAuspicious: true,
        type: 'Shubh',
        description: ""
      },
      karana: {
        name: "",
        hindiName: "",
        value: 1,
        endTime: "",
        type: "Movable",
        isAuspicious: true,
        classification: 'Shubh',
        nature: 'Movable',
        natureHindi: 'चर',
        description: ""
      },
      paksha: tithiIdx < 15 ? "Shukla" : "Krishna",
      month: monthInfo.eng,
      monthHindi: monthInfo.hin,
      ritu: monthInfo.ritu,
      samvatVikram: 2083,
      samvatShaka: 1948
    }
  };
}

/**
 * Dynamically computes all major festivals and fasting vrats for a given year
 * by evaluating the astronomical rules day-by-day.
 * Runs 100% offline.
 */
export function getFestivalsForYear(year: number, lat: number, lon: number): Festival[] {
  const festivals: Festival[] = [];
  
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const d = new Date(startDate);
  while (d <= endDate) {
    const panchang = getPanchangForFestivalDay(new Date(d));
    const dayFests = getFestivalsForDay(panchang);
    festivals.push(...dayFests);
    
    d.setDate(d.getDate() + 1);
  }
  
  return festivals;
}
