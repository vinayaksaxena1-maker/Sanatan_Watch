/**
 * Sanatan Web (सनातन घड़ी)
 * Data Registry: Batch 2 - 12 Solar Sankrantis & Punya Kaal
 * Based on Dharmasindhu & Nirnayasindhu Classical Canons
 *
 * 12 Solar Ingresses (Surya Sankrantis):
 * 1. Mesha (Aries) - Maha Vishuva / Solar New Year / Baisakhi / Vishu
 * 2. Vrishabha (Taurus) - Vrishabha Sankranti
 * 3. Mithuna (Gemini) - Raja Parba / Mithuna Sankranti
 * 4. Karka (Cancer) - Dakshinayana Ingress / Karka Sankranti
 * 5. Simha (Leo) - Simha Sankranti
 * 6. Kanya (Virgo) - Kanya Sankranti / Vishwakarma Puja
 * 7. Tula (Libra) - Jala Vishuva / Tula Sankranti
 * 8. Vrishchika (Scorpio) - Vrishchika Sankranti
 * 9. Dhanu (Sagittarius) - Kharmas / Dhanurmas Ingress
 * 10. Makara (Capricorn) - Uttarayana Ingress / Maghi / Pongal
 * 11. Kumbha (Aquarius) - Kumbha Sankranti
 * 12. Meena (Pisces) - Meena Sankranti
 *
 * Strict < 300 lines modular standard
 */

export type SankrantiClass =
  | 'Ayana'       // Makara (Uttarayana) & Karka (Dakshinayana) - 40/30 Ghati
  | 'Vishuva'     // Mesha & Tula (Equinoxes - Day & Night equal) - 15 Ghati before & after
  | 'Shadashiti'  // Mithuna, Kanya, Dhanu, Meena - Dual signs - 60 Ghati
  | 'Dvisvabhava';// Vrishabha, Simha, Vrishchika, Kumbha - Fixed signs - 16 Ghati

export interface SankrantiDefinition {
  id: string;
  solarSignName: string;
  solarSignHindi: string;
  nameHindi: string;
  nameEnglish: string;
  targetDegree: number;        // 0°, 30°, 60°, 90°, ..., 330° Nirayana
  sankrantiClass: SankrantiClass;
  classHindi: string;
  punyaKaalHours: number;      // Canonical Punya Kaal span in hours
  mahaPunyaKaalHours: number;  // Maha Punya Kaal span in hours
  traditionalFestivalsHindi: string;
  descriptionHindi: string;
}

export const BATCH_2_SANKRANTI_REGISTRY: SankrantiDefinition[] = [
  {
    id: 'sankranti_mesha',
    solarSignName: 'Aries',
    solarSignHindi: 'मेष',
    nameHindi: 'मेष संक्रांति (महाविषुव पर्व)',
    nameEnglish: 'Mesha Sankranti',
    targetDegree: 0,
    sankrantiClass: 'Vishuva',
    classHindi: 'महाविषुव संक्रांति (सौर नववर्ष)',
    punyaKaalHours: 6.4,      // 16 Ghati
    mahaPunyaKaalHours: 1.6,  // 4 Ghati
    traditionalFestivalsHindi: 'बैसाखी, विशु (केरल), सत्तू संक्रांति, पोइला बैसाख, बिहू',
    descriptionHindi: 'सूर्य का मेष राशि में प्रवेश। दिन और रात बराबर। महाविषुव पुण्यकाल में सत्तू, जलकुंभ व तिल दान।',
  },
  {
    id: 'sankranti_vrishabha',
    solarSignName: 'Taurus',
    solarSignHindi: 'वृषभ',
    nameHindi: 'वृषभ संक्रांति',
    nameEnglish: 'Vrishabha Sankranti',
    targetDegree: 30,
    sankrantiClass: 'Dvisvabhava',
    classHindi: 'विष्णुपदी संक्रांति (स्थिर राशि)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'वृषभ व्रत, रोहिणी पूजन',
    descriptionHindi: 'सूर्य का वृषभ राशि में प्रवेश। विष्णुपदी संक्रांति में १६ घटी पूर्व पुण्यकाल माना जाता है।',
  },
  {
    id: 'sankranti_mithuna',
    solarSignName: 'Gemini',
    solarSignHindi: 'मिथुन',
    nameHindi: 'मिथुन संक्रांति (राजा पर्ब)',
    nameEnglish: 'Mithuna Sankranti',
    targetDegree: 60,
    sankrantiClass: 'Shadashiti',
    classHindi: 'षडशीतिमुख संक्रांति (द्विस्वभाव)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'राजा पर्ब (ओडिशा), मिथुन व्रत',
    descriptionHindi: 'सूर्य का मिथुन राशि में प्रवेश। षडशीतिमुख पुण्यकाल में वस्त्र व फल दान का विशेष फल।',
  },
  {
    id: 'sankranti_karka',
    solarSignName: 'Cancer',
    solarSignHindi: 'कर्क',
    nameHindi: 'कर्क संक्रांति (दक्षिणायन प्रारंभ)',
    nameEnglish: 'Karka Sankranti',
    targetDegree: 90,
    sankrantiClass: 'Ayana',
    classHindi: 'अयन संक्रांति (दक्षिणायन)',
    punyaKaalHours: 12.0,     // 30 Ghati
    mahaPunyaKaalHours: 2.0,
    traditionalFestivalsHindi: 'दक्षिणायन पुण्यकाल स्नान, कामदा संक्रांति',
    descriptionHindi: 'सूर्य का कर्क राशि में प्रवेश एवं उत्तरायण समाप्त होकर दक्षिणायन प्रारंभ। ३० घटी पूर्व पुण्यकाल।',
  },
  {
    id: 'sankranti_simha',
    solarSignName: 'Leo',
    solarSignHindi: 'सिंह',
    nameHindi: 'सिंह संक्रांति (ओणम संक्रांति)',
    nameEnglish: 'Simha Sankranti',
    targetDegree: 120,
    sankrantiClass: 'Dvisvabhava',
    classHindi: 'विष्णुपदी संक्रांति (स्थिर राशि)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'सिंह संक्रांति, घृत संक्रांति (उत्तराखंड)',
    descriptionHindi: 'सूर्य का अपनी स्वराशि सिंह में प्रवेश। विष्णुपदी पुण्यकाल में घी व दुग्ध नैवेद्य अर्पण।',
  },
  {
    id: 'sankranti_kanya',
    solarSignName: 'Virgo',
    solarSignHindi: 'कन्या',
    nameHindi: 'कन्या संक्रांति (विश्वकर्मा जयंती)',
    nameEnglish: 'Kanya Sankranti',
    targetDegree: 150,
    sankrantiClass: 'Shadashiti',
    classHindi: 'षडशीतिमुख संक्रांति (द्विस्वभाव)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'विश्वकर्मा पूजा (शिल्पकार दिवस), कन्या संक्रांति',
    descriptionHindi: 'सूर्य का कन्या राशि में प्रवेश। देव शिल्पी विश्वकर्मा पूजन एवं यंत्र-वाहन आराधना।',
  },
  {
    id: 'sankranti_tula',
    solarSignName: 'Libra',
    solarSignHindi: 'तुला',
    nameHindi: 'तुला संक्रांति (जलविषुव पर्व)',
    nameEnglish: 'Tula Sankranti',
    targetDegree: 180,
    sankrantiClass: 'Vishuva',
    classHindi: 'जलविषुव संक्रांति',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'तुला संक्रांति, कावेरी संक्रमण (कर्नाटक)',
    descriptionHindi: 'सूर्य का तुला राशि में प्रवेश। दिन और रात समान। पवित्र कावेरी नदी में तीर्थ स्नान का महापर्व।',
  },
  {
    id: 'sankranti_vrishchika',
    solarSignName: 'Scorpio',
    solarSignHindi: 'वृश्चिक',
    nameHindi: 'वृश्चिक संक्रांति',
    nameEnglish: 'Vrishchika Sankranti',
    targetDegree: 210,
    sankrantiClass: 'Dvisvabhava',
    classHindi: 'विष्णुपदी संक्रांति (स्थिर राशि)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'वृश्चिक व्रत, कार्तिक स्नान संक्रांति',
    descriptionHindi: 'सूर्य का वृश्चिक राशि में प्रवेश। विष्णुपदी संक्रांति में सूर्य आराधना व दीपदान।',
  },
  {
    id: 'sankranti_dhanu',
    solarSignName: 'Sagittarius',
    solarSignHindi: 'धनु',
    nameHindi: 'धनु संक्रांति (धनुर्मास / खरमास प्रारंभ)',
    nameEnglish: 'Dhanu Sankranti',
    targetDegree: 240,
    sankrantiClass: 'Shadashiti',
    classHindi: 'षडशीतिमुख संक्रांति (द्विस्वभाव)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'धनुर्मास प्रारंभ (दक्षिण भारत), खरमास (मांगलिक कार्य विराम)',
    descriptionHindi: 'सूर्य का देवगुरु बृहस्पति की धनु राशि में प्रवेश। खरमास प्रारंभ, जप-तप एवं भगवत आराधना काल।',
  },
  {
    id: 'sankranti_makara',
    solarSignName: 'Capricorn',
    solarSignHindi: 'मकर',
    nameHindi: 'मकर संक्रांति (उत्तरायण महापर्व)',
    nameEnglish: 'Makara Sankranti',
    targetDegree: 270,
    sankrantiClass: 'Ayana',
    classHindi: 'अयन संक्रांति (उत्तरायण प्रारंभ)',
    punyaKaalHours: 16.0,     // 40 Ghati Mahapunya Kaal
    mahaPunyaKaalHours: 3.2,  // 8 Ghati
    traditionalFestivalsHindi: 'पोंगल (तमिलनाडु), माघी (पंजाब), खिचड़ी पर्व (UP/बिहार), उत्तरायण',
    descriptionHindi: 'सूर्य का मकर राशि में प्रवेश एवं उत्तरायण प्रारंभ। देवताओं का दिन आरंभ। ४० घटी महापुण्यकाल।',
  },
  {
    id: 'sankranti_kumbha',
    solarSignName: 'Aquarius',
    solarSignHindi: 'कुंभ',
    nameHindi: 'कुंभ संक्रांति',
    nameEnglish: 'Kumbha Sankranti',
    targetDegree: 300,
    sankrantiClass: 'Dvisvabhava',
    classHindi: 'विष्णुपदी संक्रांति (स्थिर राशि)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'कुंभ स्नान पर्व (हरिद्वार/प्रयाग), फाल्गुन पूर्व स्नान',
    descriptionHindi: 'सूर्य का शनिदेव की कुंभ राशि में प्रवेश। विष्णुपदी पुण्यकाल में पवित्र संगम स्नान व दान।',
  },
  {
    id: 'sankranti_meena',
    solarSignName: 'Pisces',
    solarSignHindi: 'मीन',
    nameHindi: 'मीन संक्रांति (मलमास प्रारंभ)',
    nameEnglish: 'Meena Sankranti',
    targetDegree: 330,
    sankrantiClass: 'Shadashiti',
    classHindi: 'षडशीतिमुख संक्रांति (द्विस्वभाव)',
    punyaKaalHours: 6.4,
    mahaPunyaKaalHours: 1.6,
    traditionalFestivalsHindi: 'मीन खरमास प्रारंभ, सौर संक्रांति',
    descriptionHindi: 'सूर्य का गुरुदेव की मीन राशि में प्रवेश। सौर वर्ष का अंतिम पड़ाव एवं खरमास की अवधि।',
  },
];
