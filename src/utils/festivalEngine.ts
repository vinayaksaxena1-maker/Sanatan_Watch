import { PanchangInfo, Festival } from '../types';

/**
 * Calculates Hindu festivals and vrats dynamically for a given Panchang day
 * based on Tithi, Month, and astronomical alignments.
 * Runs 100% offline.
 */
export function getFestivalsForDay(panchang: PanchangInfo): Festival[] {
  const festivals: Festival[] = [];
  const tithiVal = panchang.hinduDate.tithi.value; // 1 to 30
  const month = panchang.hinduDate.month; // e.g. "Ashadha"
  const dateStr = panchang.date; // YYYY-MM-DD

  const dateObj = new Date(panchang.date);

  // 1. Ekadashi Vrat (Tithi 11 and 26)
  if (tithiVal === 11) {
    festivals.push({
      id: `ekadashi_shukla_${dateStr}`,
      name: `Shukla Ekadashi Vrat`,
      hindiName: `शुक्ल एकादशी व्रत`,
      date: dateStr,
      month: month,
      tithi: 'Shukla Ekadashi',
      description: `Sacred fast dedicated to Lord Vishnu in the month of ${month}. Brings spiritual elevation.`,
      type: 'Ekadashi',
      isAuspicious: true
    });
  } else if (tithiVal === 26) {
    festivals.push({
      id: `ekadashi_krishna_${dateStr}`,
      name: `Krishna Ekadashi Vrat`,
      hindiName: `कृष्ण एकादशी व्रत`,
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

  // 3. Maha Shivratri (Krishna Chaturdashi of Phalguna Month)
  if (month === 'Phalguna' && tithiVal === 29) {
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
  }

  // 4. Holi (Purnima of Phalguna Month)
  if (month === 'Phalguna' && tithiVal === 15) {
    festivals.push({
      id: `holi_${dateStr}`,
      name: 'Holi (Holika Dahan)',
      hindiName: 'होली / होलिका दहन',
      date: dateStr,
      month: month,
      tithi: 'Shukla Purnima',
      description: 'Spring festival of colors. Celebrated to mark the destruction of demoness Holika.',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 5. Diwali (Amavasya of Kartik Month)
  if (month === 'Kartik' && tithiVal === 30) {
    festivals.push({
      id: `diwali_${dateStr}`,
      name: 'Diwali (Deepawali)',
      hindiName: 'दीपावली',
      date: dateStr,
      month: month,
      tithi: 'Krishna Amavasya',
      description: 'Festival of lights. Commemorates Lord Rama\'s return to Ayodhya. Lakshmi Puja is performed.',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 6. Krishna Janmashtami (Krishna Ashtami of Bhadrapada Month)
  if (month === 'Bhadrapada' && tithiVal === 23) {
    festivals.push({
      id: `janmashtami_${dateStr}`,
      name: 'Krishna Janmashtami',
      hindiName: 'कृष्ण जन्माष्टमी',
      date: dateStr,
      month: month,
      tithi: 'Krishna Ashtami',
      description: 'Celebrating the birth of Lord Krishna at midnight, symbolizing the destruction of evil.',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 7. Ganesh Chaturthi (Shukla Chaturthi of Bhadrapada Month)
  if (month === 'Bhadrapada' && tithiVal === 4) {
    festivals.push({
      id: `ganesh_chaturthi_${dateStr}`,
      name: 'Ganesh Chaturthi',
      hindiName: 'गणेश चतुर्थी',
      date: dateStr,
      month: month,
      tithi: 'Shukla Chaturthi',
      description: 'Ten-day festival celebrating the birth of Lord Ganesha, the remover of obstacles.',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 8. Rama Navami (Shukla Navami of Chaitra Month)
  if (month === 'Chaitra' && tithiVal === 9) {
    festivals.push({
      id: `rama_navami_${dateStr}`,
      name: 'Rama Navami',
      hindiName: 'राम नवमी',
      date: dateStr,
      month: month,
      tithi: 'Shukla Navami',
      description: 'Birth anniversary of Lord Rama, the personification of righteousness (Dharma).',
      type: 'Major',
      isAuspicious: true
    });
  }

  // 9. Makar Sankranti (Occurs around Jan 14/15, when Sun enters Capricorn)
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
      description: 'Harvest festival marks the transition of the Sun into Capricorn (Makara rashi).',
      type: 'Major',
      isAuspicious: true
    });
  }

  return festivals;
}

import { MONTHS_ENGLISH_HINDI } from './panchangCalc';

function getPanchangForFestivalDay(date: Date): PanchangInfo {
  // Reference Epoch (New moon on March 18, 2026 UTC, start of Chaitra Shukla 1)
  const epoch = new Date('2026-03-18T05:30:00Z'); 
  const diffTime = date.getTime() - epoch.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  const lunarCycle = 29.530588853;
  const rawLunarMonthAge = (diffDays) % lunarCycle;
  const lunarMonthAge = rawLunarMonthAge < 0 ? rawLunarMonthAge + lunarCycle : rawLunarMonthAge;

  let tithiIdx = Math.floor((lunarMonthAge / lunarCycle) * 30);
  if (tithiIdx < 0) tithiIdx += 30;
  if (tithiIdx >= 30) tithiIdx = 29;

  const monthsSinceEpoch = Math.floor(diffDays / lunarCycle);
  const monthIdx = (monthsSinceEpoch % 12 + 12) % 12;
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
  
  // Loop day-by-day through the entire year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Create a clean date pointer
  const d = new Date(startDate);
  while (d <= endDate) {
    const panchang = getPanchangForFestivalDay(new Date(d));
    const dayFests = getFestivalsForDay(panchang);
    festivals.push(...dayFests);
    
    // Increment day by 1
    d.setDate(d.getDate() + 1);
  }
  
  return festivals;
}
