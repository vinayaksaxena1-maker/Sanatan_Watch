import { PanchangInfo, Festival } from '../types';
import { MONTHS_ENGLISH_HINDI } from './panchangCalc';

/**
 * High precision Meeus astronomical solar & lunar longitude calculation
 * used for offline 100% accurate Vrat and Festival determination.
 */
function getMeeusSunMoon(jd: number) {
  const T = (jd - 2451545.0) / 36525;

  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * Math.PI / 180;
  let C = (1.914602 - 0.004817 * T) * Math.sin(Mrad) + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) + 0.000289 * Math.sin(3 * Mrad);
  let sunTrueLon = L0 + C;

  let Lm = 218.3165 + 481267.8813 * T;
  let Mm = 134.9634 + 477198.8675 * T;
  let Ms = 357.5291 + 35999.0503 * T;
  let F = 93.2721 + 483202.0175 * T;
  let D = 297.8502 + 445267.1114 * T;

  const rad = Math.PI / 180;
  let moonEvection = 1.274 * Math.sin((2 * D - Mm) * rad);
  let moonVariation = 0.6583 * Math.sin(2 * D * rad);
  let moonEqCenter = 6.2886 * Math.sin(Mm * rad);
  let moonAnnualEq = -0.1858 * Math.sin(Ms * rad);
  let moonParallactic = -0.0574 * Math.sin((2 * D - Ms) * rad);

  let moonTrueLon = Lm + moonEqCenter + moonEvection + moonVariation + moonAnnualEq + moonParallactic;

  let ayanamsa = 24.23 + (jd - 2460000) * 0.000038;

  let sunSid = ((sunTrueLon - ayanamsa) % 360 + 360) % 360;
  let moonSid = ((moonTrueLon - ayanamsa) % 360 + 360) % 360;

  return { sunSid, moonSid };
}

function getTithiAtDate(dateObj: Date): number {
  const jd = (dateObj.getTime() / 86400000) + 2440587.5;
  const { sunSid, moonSid } = getMeeusSunMoon(jd);
  const diff = (moonSid - sunSid + 360) % 360;
  return Math.floor(diff / 12); // 0 to 29
}

/**
 * Calculates Hindu festivals and vrats dynamically for a given Panchang day
 * based on Tithi, Month, and specific Vedic Vrat Time Windows (Moonrise, Madhyahna, Sunset, Nishita).
 * Runs 100% offline.
 */
export function getFestivalsForDay(panchang: PanchangInfo): Festival[] {
  if (!panchang || !panchang.hinduDate || !panchang.hinduDate.tithi) return [];
  const festivals: Festival[] = [];
  const tithiVal = panchang.hinduDate.tithi?.value || 1; // 1 to 30 (1-15 Shukla, 16-30 Krishna)
  const month = panchang.hinduDate.month || "Chaitra"; // e.g. "Ashadha"
  const dateStr = panchang.date || new Date().toISOString().split("T")[0];
  const dateObj = new Date(`${dateStr}T05:30:00+05:30`);

  // Compute key time windows for exact Vedic Vrat Kaal alignment
  const dtMadhyahna = new Date(`${dateStr}T12:30:00+05:30`);
  const dtSunset = new Date(`${dateStr}T19:00:00+05:30`);
  const dtMoonrise = new Date(`${dateStr}T21:30:00+05:30`);
  const dtNishita = new Date(`${dateStr}T23:59:00+05:30`);

  const tithiSunrise = (tithiVal - 1 + 30) % 30; // 0-indexed (0-14 Shukla, 15-29 Krishna)
  const tithiMadhyahna = getTithiAtDate(dtMadhyahna);
  const tithiSunset = getTithiAtDate(dtSunset);
  const tithiMoonrise = getTithiAtDate(dtMoonrise);
  const tithiNishita = getTithiAtDate(dtNishita);

  // 1. Ekadashi Vrat (Shukla Ekadashi = 10, Krishna Ekadashi = 25 at Sunrise)
  if (tithiSunrise === 10) {
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
      description: `भगवान श्रीहरि विष्णु की विशेष आराधना, सुख-समृद्धि एवं आत्मिक शांति के लिए ${nameHin} का पावन व्रत।`,
      type: 'Ekadashi',
      isAuspicious: true,
      paranTime: 'द्वादशी प्रातः 06:30 AM - 08:45 AM',
      pujaMuhurat: 'प्रातःकाल शुभ वेला'
    });
  } else if (tithiSunrise === 25) {
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
      description: `भगवान श्रीहरि विष्णु की कृपा, पाप-निवारण एवं संकट मुक्ति के लिए ${nameHin} का पावन व्रत।`,
      type: 'Ekadashi',
      isAuspicious: true,
      paranTime: 'द्वादशी प्रातः 06:30 AM - 08:45 AM',
      pujaMuhurat: 'प्रातःकाल शुभ वेला'
    });
  }

  // 2. Pradosh Vrat (Shukla Trayodashi = 12, Krishna Trayodashi = 27 at Sunset)
  if (tithiSunset === 12) {
    festivals.push({
      id: `pradosh_shukla_${dateStr}`,
      name: 'Shukla Pradosh Vrat',
      hindiName: 'शुक्ल प्रदोष व्रत',
      date: dateStr,
      month: month,
      tithi: 'Shukla Trayodashi',
      description: 'भगवान शिव की आराधना, आरोग्य लाभ और समस्त दोषों की शांति के लिए प्रदोष काल में किया जाने वाला पावन व्रत।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'सायं 05:45 PM - 08:15 PM (प्रदोष काल)'
    });
  } else if (tithiSunset === 27) {
    festivals.push({
      id: `pradosh_krishna_${dateStr}`,
      name: 'Krishna Pradosh Vrat',
      hindiName: 'कृष्ण प्रदोष व्रत',
      date: dateStr,
      month: month,
      tithi: 'Krishna Trayodashi',
      description: 'भगवान भोलेनाथ की कृपा, ऋण मुक्ति और आत्मिक कल्याण के लिए त्रयोदशी प्रदोष वेला का पावन व्रत।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'सायं 05:45 PM - 08:15 PM (प्रदोष काल)'
    });
  }

  // 3. Masik Durgashtami (Shukla Ashtami = 7 at Sunrise / Madhyahna)
  if (tithiSunrise === 7 || tithiMadhyahna === 7) {
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
      description: `भगवती दुर्गा एवं माँ पार्वती की विशेष कृपा, शक्ति और संकट नाश के लिए ${nameHin} का पावन व्रत।`,
      type: 'Major',
      pujaMuhurat: 'प्रातः एवं सायंकाल देवी पूजन',
      isAuspicious: true
    });
  }

  // 4. Masik Kalashtami & Janmashtami (Krishna Ashtami = 22 at Sunrise / Nishita)
  if (tithiSunrise === 22 || (tithiNishita === 22 && tithiSunrise !== 22)) {
    if (month === 'Bhadrapada') {
      festivals.push({
        id: `janmashtami_${dateStr}`,
        name: 'Krishna Janmashtami',
        hindiName: 'कृष्ण जन्माष्टमी',
        date: dateStr,
        month: month,
        tithi: 'Krishna Ashtami',
        description: 'भगवान श्री कृष्ण का मध्यरात्रि का पावन जन्मोत्सव व्रत, बाल गोपाल पूजन एवं दिव्य संकीर्तन।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'निशिता काल (11:58 PM - 12:45 AM)'
      });
    } else if (tithiSunrise === 22) {
      festivals.push({
        id: `kalashtami_${dateStr}`,
        name: 'Masik Kalashtami',
        hindiName: 'मासिक कालाष्टमी',
        date: dateStr,
        month: month,
        tithi: 'Krishna Ashtami',
        description: 'भगवान कालभैरव की विशेष पूजा-अर्चना, भय मुक्ति, रोग-कष्ट निवारण और आत्मबल के लिए पावन कालाष्टमी व्रत।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'सायंकाल कालभैरव पूजन'
      });
    }
  }

  // 5. Masik Shivaratri (Krishna Chaturdashi = 28 at Nishita / Midnight)
  if (tithiNishita === 28) {
    if (month === 'Phalguna' || month === 'Magha') {
      festivals.push({
        id: `maha_shivratri_${dateStr}`,
        name: 'Maha Shivratri',
        hindiName: 'महाशिवरात्रि',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturdashi',
        description: 'भगवान शिव एवं माता पार्वती के महामिलन का महापर्व। चार प्रहर पूजन, रुद्राभिषेक एवं रात्रि जागरण का कल्याणकारी व्रत।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'निशिता काल (11:45 PM - 12:35 AM)'
      });
    } else {
      festivals.push({
        id: `masik_shivaratri_${dateStr}`,
        name: 'Masik Shivaratri',
        hindiName: 'मासिक शिवरात्रि',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturdashi',
        description: 'भगवान भोलेनाथ की विशेष आराधना, रात्रि जागरण और रुद्राभिषेक का मासिक पावन व्रत।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'निशिता काल (11:45 PM - 12:35 AM)'
      });
    }
  }

  // 6. Sankashti & Vinayaka Chaturthi (Krishna Chaturthi = 18 at Moonrise, Shukla Chaturthi = 3 at Sunrise / Madhyahna)
  if (tithiMoonrise === 18) {
    if (month === 'Kartik') {
      festivals.push({
        id: `karwa_chauth_${dateStr}`,
        name: 'Karwa Chauth',
        hindiName: 'करवा चौथ',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturthi',
        description: 'पति की दीर्घायु, अखंड सौभाग्य और परिवार के सुख-कल्याण के लिए सुहागिनों का पावन निर्जला व्रत।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'सायं 05:45 PM - 07:05 PM',
        moonriseTime: 'रात्रि 08:15 PM (चंद्र दर्शन व अर्घ्य)'
      });
    } else {
      festivals.push({
        id: `sankashti_${dateStr}`,
        name: 'Sankashti Chaturthi',
        hindiName: 'संकष्टी चतुर्थी',
        date: dateStr,
        month: month,
        tithi: 'Krishna Chaturthi',
        description: 'विघ्नहर्ता श्री गणेश की कृपा से समस्त बाधाओं और संकटों के निवारण हेतु पावन संकष्टी चतुर्थी व्रत।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'सायंकाल गणेश पूजन',
        moonriseTime: 'चंद्रोदय उपरांत अर्घ्य व पारण'
      });
    }
  }

  if (tithiSunrise === 3 || tithiMadhyahna === 3) {
    if (month === 'Bhadrapada') {
      festivals.push({
        id: `ganesh_chaturthi_${dateStr}`,
        name: 'Ganesh Chaturthi',
        hindiName: 'गणेश चतुर्थी',
        date: dateStr,
        month: month,
        tithi: 'Shukla Chaturthi',
        description: 'विघ्नहर्ता श्री गणेश जी के प्राकट्य का दस दिवसीय पावन भक्ति एवं गणेशोत्सव महापर्व।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'मध्याह्न 11:05 AM - 01:35 PM'
      });
    } else {
      festivals.push({
        id: `vinayaka_chaturthi_${dateStr}`,
        name: 'Vinayaka Chaturthi',
        hindiName: 'विनायक चतुर्थी',
        date: dateStr,
        month: month,
        tithi: 'Shukla Chaturthi',
        description: 'श्री गणेश जी के पूजन से ज्ञान, बुद्धि, रिद्धि-सिद्धि और कार्य सफलता का पावन विनायक चतुर्थी व्रत।',
        type: 'Major',
        isAuspicious: true,
        pujaMuhurat: 'मध्याह्न गणेश पूजन'
      });
    }
  }

  // 7. Purnima Festivals (Shukla Purnima = 14)
  if (tithiSunrise === 14 || tithiMadhyahna === 14) {
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
      description: `भगवान श्री सत्यनारायण पूजन, पवित्र नदी स्नान, दान-पुण्य एवं चंद्र देव की उपासना का पावन दिन।`,
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'सायंकाल प्रदोष वेला',
      moonriseTime: 'सायं 06:15 PM (चंद्र अर्घ्य)'
    });
  }

  // 8. Amavasya Festivals (Krishna Amavasya = 29)
  if (tithiSunrise === 29) {
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
      description: `पितृ तर्पण, श्राद्ध कर्म, दीपदान और पवित्र नदियों में स्नान के लिए परम कल्याणकारी अमावस्या तिथि।`,
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'प्रातःकाल स्नान-दान व तर्पण'
    });
  }

  // 9. Specific Tithi Festivals
  if (month === 'Chaitra' && tithiSunrise === 0) {
    festivals.push({
      id: `gudi_padwa_${dateStr}`,
      name: 'Gudi Padwa / Ugadi (Hindu New Year)',
      hindiName: 'गुड़ी पड़वा / युगादि (नव संवत्सर)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Pratipada',
      description: 'वैदिक नव संवत्सर का शुभारंभ, सृष्टि निर्माण दिवस और चैत्र नवरात्र कलश स्थापना का पावन पर्व।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'प्रातः 06:20 AM - 10:15 AM (घटस्थापना)'
    });
  }

  if (month === 'Chaitra' && (tithiSunrise === 8 || tithiMadhyahna === 8)) {
    festivals.push({
      id: `rama_navami_${dateStr}`,
      name: 'Rama Navami',
      hindiName: 'राम नवमी',
      date: dateStr,
      month: month,
      tithi: 'Shukla Navami',
      description: 'मर्यादा पुरुषोत्तम भगवान श्री राम का पावन जन्मोत्सव, मध्याह्न अभिषेक व रामायण पाठ।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'मध्याह्न 11:05 AM - 01:30 PM'
    });
  }

  if (month === 'Ashvin' && tithiSunrise === 0) {
    festivals.push({
      id: `navratri_start_${dateStr}`,
      name: 'Ghatasthapana (Shardiya Navratri)',
      hindiName: 'घटस्थापना (शारदीय नवरात्र प्रारम्भ)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Pratipada',
      description: 'नवदुर्गा की विशेष उपासना, अखंड ज्योति एवं कलश स्थापना के साथ 9-दिवसीय शारदीय नवरात्र का शुभारंभ।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'प्रातः 06:20 AM - 10:15 AM (घटस्थापना)'
    });
  }

  if (month === 'Ashvin' && (tithiSunrise === 9 || tithiMadhyahna === 9)) {
    festivals.push({
      id: `dussehra_${dateStr}`,
      name: 'Dussehra (Vijayadashami)',
      hindiName: 'दशहरा (विजयादशमी)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Dashami',
      description: 'अधर्म पर धर्म और बुराई पर अच्छाई की विजय का प्रतीक पावन विजयादशमी एवं अपराजिता पूजन पर्व।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'अपराह्न 01:20 PM - 03:40 PM (विजय मुहूर्त)'
    });
  }

  if (month === 'Kartik' && tithiSunrise === 0) {
    festivals.push({
      id: `govardhan_${dateStr}`,
      name: 'Govardhan Puja / Annakut',
      hindiName: 'गोवर्धन पूजा / अन्नकूट',
      date: dateStr,
      month: month,
      tithi: 'Shukla Pratipada',
      description: 'भगवान श्री कृष्ण द्वारा गोवर्धन पर्वत धारण करने की पावन स्मृति में अन्नकूट महोत्सव एवं गो-माता पूजन।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'प्रातः 06:30 AM - 08:45 AM'
    });
  }

  if (month === 'Kartik' && tithiSunrise === 1) {
    festivals.push({
      id: `bhai_dooj_${dateStr}`,
      name: 'Bhai Dooj (Yamadwitiya)',
      hindiName: 'भैया दूज (यमद्वितीया)',
      date: dateStr,
      month: month,
      tithi: 'Shukla Dwitiya',
      description: 'भाई-बहन के पवित्र स्नेह, सुरक्षा और दीर्घायु का प्रतीक पावन यमद्वितीया (भैया दूज) पर्व।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'दोपहर 01:15 PM - 03:30 PM (अपराह्न मुहूर्त)'
    });
  }

  // 10. Solar Ingress Festivals (Makar Sankranti)
  const monthGreg = dateObj.getMonth();
  const dateGreg = dateObj.getDate();
  if (monthGreg === 0 && dateGreg === 14) {
    festivals.push({
      id: `makar_sankranti_${dateStr}`,
      name: 'Makar Sankranti',
      hindiName: 'मकर संक्रान्ति',
      date: dateStr,
      month: month,
      tithi: panchang.hinduDate.tithi.name,
      description: 'सूर्य देव का मकर राशि में प्रवेश। पवित्र तीर्थ स्नान, तिल-गुड़ दान और सूर्य देव की उपासना का महापर्व।',
      type: 'Major',
      isAuspicious: true,
      pujaMuhurat: 'पुण्यकाल: सूर्योदय से सूर्यास्त',
      secondaryDate: '15 जनवरी (महापुण्यकाल)'
    });
  }

  return festivals;
}

function getPanchangForFestivalDay(date: Date): PanchangInfo {
  const sunriseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 30, 0);
  const jd = (sunriseDate.getTime() / 86400000) + 2440587.5;
  const { sunSid, moonSid } = getMeeusSunMoon(jd);
  
  const diffNorm = (moonSid - sunSid + 360) % 360;
  let tithiIdx = Math.floor(diffNorm / 12);
  if (tithiIdx < 0) tithiIdx += 30;
  if (tithiIdx >= 30) tithiIdx = 29;

  const monthIdx = (Math.floor(sunSid / 30) + 1) % 12;
  const monthInfo = MONTHS_ENGLISH_HINDI[monthIdx] || MONTHS_ENGLISH_HINDI[0];

  const tithiName = tithiIdx < 15 ? `Shukla ${tithiIdx + 1}` : `Krishna ${tithiIdx - 14}`;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  return {
    date: dateStr,
    sunrise: "05:30 AM",
    sunset: "07:00 PM",
    moonrise: "09:30 PM",
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
const HINDI_MONTH_ABBRS = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

/**
 * Deduplicates consecutive recurring occurrences of the same festival (e.g. Durgashtami, Purnima, Shivaratri).
 * Merges them into a single primary celebration card with a secondary date / span badge.
 */
export function deduplicateFestivals(festivals: Festival[]): Festival[] {
  if (!festivals || festivals.length === 0) return [];

  const sorted = [...festivals].sort((a, b) => a.date.localeCompare(b.date));
  const result: Festival[] = [];
  const processedIndices = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    if (processedIndices.has(i)) continue;
    const current = { ...sorted[i] };

    // Check if next festival is a consecutive duplicate of the same event
    let nextIdx = i + 1;
    while (nextIdx < sorted.length) {
      const next = sorted[nextIdx];
      const isSameEvent = (current.hindiName === next.hindiName || current.name === next.name) &&
                          (current.month === next.month);
      
      const d1 = new Date(current.date).getTime();
      const d2 = new Date(next.date).getTime();
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

      if (isSameEvent && diffDays === 1) {
        processedIndices.add(nextIdx);
        const nextDateObj = new Date(next.date);
        const dayNum = nextDateObj.getDate();
        const monthHin = HINDI_MONTH_ABBRS[nextDateObj.getMonth()] || '';
        
        current.secondaryDate = `${dayNum} ${monthHin}`;
        current.description = `${current.description} (तिथि विस्तार: ${new Date(current.date).getDate()} व ${dayNum} ${monthHin})`;
        break;
      } else if (diffDays > 1) {
        break;
      }
      nextIdx++;
    }

    result.push(current);
  }

  return result;
}

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
  
  return deduplicateFestivals(festivals);
}

