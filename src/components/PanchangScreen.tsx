/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Feather,
  Landmark,
  Share2,
  Clock,
  CalendarRange,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PanchangInfo } from '../types';
import { MoonPhaseVisualizer } from './MoonPhaseVisualizer';
import { HoraSystem } from './HoraSystem';
import { getTranslation } from '../utils/translations';
import { getMuhuratsForPanchang } from '../utils/panchangCalc';

const translatePlanetNameHindi = (name: string): string => {
  const map: Record<string, string> = {
    'Sun': 'सूर्य',
    'Moon': 'चन्द्र',
    'Mars': 'मंगल',
    'Mercury': 'बुध',
    'Jupiter': 'गुरु',
    'Venus': 'शुक्र',
    'Saturn': 'शनि',
    'Rahu': 'राहु',
    'Ketu': 'केतु',
  };
  return map[name] || name;
};

const translateSolarMonthHindi = (month: string): string => {
  const map: Record<string, string> = {
    'Mesha': 'मेष',
    'Vrishabha': 'वृषभ',
    'Mithuna': 'मिथुन',
    'Karka': 'कर्क',
    'Simha': 'सिंह',
    'Kanya': 'कन्या',
    'Tula': 'तुला',
    'Vrischika': 'वृश्चिक',
    'Dhanu': 'धनु',
    'Makara': 'मकर',
    'Kumbha': 'कुंभ',
    'Meena': 'मीन',
    'Aries': 'मेष',
    'Taurus': 'वृषभ',
    'Gemini': 'मिथुन',
    'Cancer': 'कर्क',
    'Leo': 'सिंह',
    'Virgo': 'कन्या',
    'Libra': 'तुला',
    'Scorpio': 'वृश्चिक',
    'Sagittarius': 'धनु',
    'Capricorn': 'मकर',
    'Aquarius': 'कुंभ',
    'Pisces': 'मीन'
  };
  return map[month] || month;
};

const translateYogaMeaningHindi = (name: string): string => {
  const map: Record<string, string> = {
    'Vishkumbha': 'विषघड़ा (अशुभ)',
    'Priti': 'प्रेम व संतोष (शुभ)',
    'Ayushman': 'दीर्घायु (शुभ)',
    'Saubhagya': 'सौभाग्य (शुभ)',
    'Shobhana': 'सुन्दर व कांतिमान (शुभ)',
    'Atiganda': 'बड़ी बाधा (अशुभ)',
    'Sukarma': 'सत्कर्म व कल्याण (शुभ)',
    'Dhriti': 'धैर्य व धारणा (शुभ)',
    'Shula': 'शूल/पीड़ा (अशुभ)',
    'Ganda': 'अवरोध व संघर्ष (अशुभ)',
    'Vriddhi': 'उन्नति व विकास (शुभ)',
    'Dhruva': 'स्थिरता व सफलता (शुभ)',
    'Vyaghata': 'घातक प्रहार (अशुभ)',
    'Harshana': 'हर्ष व प्रसन्नता (शुभ)',
    'Vajra': 'कठोर/शक्तिशाली (अशुभ)',
    'Siddhi': 'कार्य सिद्धि (शुभ)',
    'Vyatipata': 'विपत्ति व अनिष्ट (अशुभ)',
    'Variyan': 'श्रेष्ठ व समृद्ध (शुभ)',
    'Parigha': 'अवरोध/बाधा (अशुभ)',
    'Shiva': 'कल्याणकारी (शुभ)',
    'Siddha': 'सफल/सिद्ध (शुभ)',
    'Sadhya': 'साध्य/सुलभ (शुभ)',
    'Shubha': 'शुभ व मंगल (शुभ)',
    'Shukla': 'श्वेत/पवित्र (शुभ)',
    'Brahma': 'ब्रह्मा/सृष्टि (शुभ)',
    'Indra': 'ऐश्वर्य व शक्ति (शुभ)',
    'Vaidhriti': 'परम विघ्न (अशुभ)'
  };
  return map[name] || name;
};

const translateYogaDescriptionHindi = (name: string): string => {
  const map: Record<string, string> = {
    'Vishkumbha': 'विष्कम्भ योग में नए शुभ कार्यों का आरंभ वर्जित है। इस समय विषैली ऊर्जा का प्रभाव रहता है।',
    'Priti': 'प्रीति योग परस्पर प्रेम, मैत्री, और प्रसन्नता का संचार करता है। सामाजिक व वैवाहिक कार्यों हेतु शुभ।',
    'Ayushman': 'आयुष्मान योग स्वास्थ्य, दीर्घायु, और मंगल कार्यों के लिए सर्वोत्तम माना जाता है।',
    'Saubhagya': 'सौभाग्य योग सुख-समृद्धि और वैवाहिक जीवन की खुशहाली को बढ़ाने वाला अत्यंत शुभ योग है।',
    'Shobhana': 'शोभन योग कलात्मक कार्यों, यात्रा, और गृह प्रवेश के लिए शुभ फल प्रदान करता है।',
    'Atiganda': 'अतिगण्ड योग दुर्घटना, विवाद, और विघ्न कारक है। इसमें कोई नया कार्य न करें।',
    'Sukarma': 'सुकर्मा योग सत्कर्मों, नौकरी, व्यापारिक समझौतों और शुभ कार्यों के लिए सर्वश्रेष्ठ है।',
    'Dhriti': 'धृति योग धैर्य, संकल्प शक्ति और नवीन परियोजनाओं की नींव रखने के लिए शुभ है।',
    'Shula': 'शूल योग पीड़ा, रोग और विवादों का जन्मदाता माना जाता है। इस योग में यात्रा टालें।',
    'Ganda': 'गण्ड योग कार्यों में अप्रत्याशित बाधाएं और संकट लाता है। नए काम वर्जित हैं।',
    'Vriddhi': 'वृद्धि योग व्यापारिक सौदों, निवेश, और उन्नति से जुड़े कार्यों के लिए परम फलदायी है।',
    'Dhruva': 'ध्रुव योग स्थिरता लाता है। भूमि पूजन, निर्माण और दीर्घकालिक निवेश के लिए शुभ है।',
    'Vyaghata': 'व्याघात योग विश्वासघात और संकटों का संकेत देता है। महत्वपूर्ण निर्णय टालें।',
    'Harshana': 'हर्षणा योग आनंद, प्रसन्नता और नवीन उत्सवों के आयोजन के लिए सर्वोत्तम है।',
    'Vajra': 'वज्र योग में आर्थिक हानि या शारीरिक पीड़ा की संभावना रहती है। वाहन आदि सावधानी से चलाएं।',
    'Siddhi': 'सिद्धि योग में किए गए प्रयास सफल होते हैं। साधना और विशेष कार्यों के लिए उत्तम है।',
    'Vyatipata': 'व्यतिपात योग अत्यंत अशुभ माना जाता है। इसमें पूजा-पाठ और ध्यान के अतिरिक्त अन्य शुभ कार्य टालें।',
    'Variyan': 'वरीयान योग मान-सम्मान, यश और वित्तीय समृद्धि प्रदान करने वाला शुभ योग है।',
    'Parigha': 'परिघ योग में शत्रुओं का भय रहता है। वाद-विवाद से बचें और नए अनुबंध न करें।',
    'Shiva': 'शिव योग ध्यान, मंत्र दीक्षा और आध्यात्मिक साधना के लिए परम कल्याणकारी और शुभ है।',
    'Siddha': 'सिद्ध योग सभी प्रकार के सांसारिक और भौतिक कार्यों में सफलता प्रदान करता है।',
    'Sadhya': 'साध्य योग कठिन लक्ष्यों को साधना और अभ्यास व विद्या प्राप्ति के लिए अनुकूल है।',
    'Shubha': 'शुभ योग शारीरिक आरोग्यता, मानसिक शांति और नए कार्यों के आरंभ के लिए सर्वोत्तम है।',
    'Shukla': 'शुक्ल योग पवित्रता और स्पष्टता लाता है। धार्मिक अनुष्ठान और विद्यारंभ के लिए शुभ है।',
    'Brahma': 'ब्रह्म योग ज्ञान, शोध और बौद्धिक कार्यों के लिए अत्यधिक अनुकूल और शुभ फलदायी है।',
    'Indra': 'इन्द्र योग नेतृत्व, प्रशासनिक कार्यों और मान-सम्मान की प्राप्ति के लिए परम शुभ है।',
    'Vaidhriti': 'वैधृति योग में तीव्र नकारात्मक ऊर्जा का प्रभाव रहता है। सभी शुभ कार्य पूर्णतः वर्जित हैं।'
  };
  return map[name] || 'सूर्य और चन्द्रमा के देशांतर के संयोग से निर्मित शुभ काल चक्र।';
};

const translateGanaHindi = (gana: string): string => {
  const map: Record<string, string> = {
    'Deva': 'देव',
    'Manushya': 'मनुष्य',
    'Rakshasa': 'राक्षस',
    'देव': 'देव',
    'मनुष्य': 'मनुष्य',
    'राक्षस': 'राक्षस'
  };
  return map[gana] || gana;
};

const translateNadiHindi = (nadi: string): string => {
  const map: Record<string, string> = {
    'Adi': 'आदि',
    'Madhya': 'मध्य',
    'Antya': 'अंत्य',
    'आदि': 'आदि',
    'मध्य': 'मध्य',
    'अंत्य': 'अंत्य'
  };
  return map[nadi] || nadi;
};

const translateYoniHindi = (yoni: string): string => {
  const map: Record<string, string> = {
    'Ashwa': 'अश्व (घोड़ा)',
    'Gaja': 'गज (हाथी)',
    'Mesha': 'मेष (भेड़)',
    'Sarpa': 'सर्प (सांप)',
    'Shwan': 'श्वान (कुत्ता)',
    'Marjar': 'मार्जार (बिल्ली)',
    'Mushak': 'मूषक (चूहा)',
    'Gau': 'गौ (गाय)',
    'Mahisha': 'महिष (भैंस)',
    'Vyaghra': 'व्याघ्र (बाघ)',
    'Mriga': 'मृग (हिरण)',
    'Vanar': 'वानर (बंदर)',
    'Nakula': 'नकुल (नेवला)',
    'Simha': 'सिंह (शेर)'
  };
  return map[yoni] || yoni;
};

const translateSymbolHindi = (symbol: string): string => {
  const map: Record<string, string> = {
    'Horse\'s Head': 'घोड़े का सिर',
    'Yoni': 'योनि',
    'Razor or Knife': 'छुरा या चाकू',
    'Temple or Chariot': 'मंदिर या रथ',
    'Bow or Quiver': 'धनुष या बाण',
    'Weaving Loom': 'करघा',
    'Teardrop or Jewel': 'आँसू या मणि',
    'Earring or Leaf': 'कुंडल या पत्ता',
    'Lotus or Wheel': 'कमल या चक्र',
    'Serpent': 'सर्प',
    'Palanquin or Bed': 'पालकी या शय्या',
    'Hammock or Couch': 'झूला या पलंग',
    'Hand or Fist': 'हाथ या मुट्ठी',
    'Pearl or Coral': 'मोती या मूंगा',
    'Potter\'s Wheel': 'कुम्हार का चाक',
    'Archway or Garland': 'तोरण या माला',
    'Triumphal Arch': 'विजय द्वार',
    'Lotus Flower': 'कमल का फूल',
    'Cow\'s Udder': 'गाय का thन',
    'Bed or Cot': 'शय्या या खाट',
    'Twin Fishes': 'जुड़वां मछलियां',
    'Drum or Clay Pot': 'डमरू या मिट्टी का बर्तन',
    'Sword or Shield': 'तलवार या ढाल',
    'Three Footsteps': 'तीन कदम',
    'Winnowing Basket': 'सूप या टोकरी',
    'Flute or Bamboo': 'बांसुरी या बांस',
    'Circle or Ring': 'वृत्त या वलय',
    'Thunderbolt': 'वज्र'
  };
  return map[symbol] || symbol;
};

const translateLordHindi = (lord: string): string => {
  const map: Record<string, string> = {
    'Agni': 'अग्नि',
    'Brahma': 'ब्रह्मा',
    'Gauri': 'गौरी',
    'Ganesha': 'गणेश',
    'Lalita/Naga': 'ललिता/नाग',
    'Kartikeya': 'कार्तिकेय',
    'Surya': 'सूर्य',
    'Shiva': 'शिव',
    'Durga': 'दुर्गा',
    'Yama': 'यम',
    'Vishnu': 'विष्णु',
    'Sun': 'सूर्य',
    'Kama': 'कामदेव',
    'Moon': 'चन्द्र',
    'Ketu': 'केतु',
    'Venus': 'शुक्र',
    'Sun/Surya': 'सूर्य',
    'Mars': 'मंगल',
    'Rahu': 'राहु',
    'Jupiter': 'गुरु',
    'Saturn': 'शनि',
    'Mercury': 'बुध',
  };
  return map[lord] || lord;
};

const translateDeityHindi = (deity: string): string => {
  const map: Record<string, string> = {
    'Ashwini Kumars (Prana)': 'अश्विनी कुमार',
    'Yama (Justice)': 'यमराज',
    'Agni (Fire)': 'अग्नि देव',
    'Brahma (Creator)': 'ब्रह्मा जी',
    'Soma (Moon God)': 'सोमदेव',
    'Rudra (Storm God)': 'भगवान शिव',
    'Aditi (Mother of Gods)': 'देवमाता अदिति',
    'Brihaspati (Teacher)': 'बृहस्पति देव',
    'Sarpas (Nagas)': 'नाग देव',
    'Pitrus (Ancestors)': 'पितृ देव',
    'Bhaga (Fortune)': 'भग देव',
    'Aryaman (Friendship)': 'अर्यमा देव',
    'Savitr (Sun God)': 'सविता देव',
    'Vishwakarma (Architect)': 'विश्वकर्मा जी',
    'Vayu (Wind God)': 'पवन देव',
    'Indra-Agni (Alliance)': 'इन्द्राग्नि',
    'Mitra (Universal Friend)': 'मित्र देव',
    'Indra (King of Gods)': 'इन्द्र देव',
    'Nirriti (Dissolution)': 'निरृति देवी',
    'Apah (Water Goddess)': 'जल देवी',
    'Visvadevas (All Gods)': 'विश्वेदेव',
    'Vishnu (Preserver)': 'भगवान विष्णु',
    'Eight Vasus (Abundance)': 'अष्ट वसु',
    'Varuna (Ocean Lord)': 'वरुण देव',
    'Aja Ekapada (Fire Dragon)': 'अज एकपाद',
    'Ahir Budhnya (Abyss Serpent)': 'अहिर्बुध्न्य',
    'Pushan (Protector of Animals)': 'पूषा देव',
    'Serpents': 'सर्प देव',
    'Ten Directions': 'दस दिशाएं',
    'Kubera': 'कुबेर देव',
    'Kama/Dharma': 'काम/धर्म',
    'Moon/Pitrus': 'चन्द्र/पितृ',
    'Durga/Rudras': 'दुर्गा/रुद्र',
    'Agni': 'अग्नि देव',
    'Brahma': 'ब्रह्मा जी',
    'Gauri': 'गौरी माता',
    'Ganesha': 'गणेश जी',
    'Kartikeya': 'कार्तिकेय जी',
    'Surya': 'सूर्य देव',
    'Durga': 'दुर्गा माता',
    'Shiva': 'भगवान शिव',
  };
  return map[deity] || deity;
};

const translatePayaDescriptionHindi = (name: 'Gold' | 'Silver' | 'Copper' | 'Iron'): string => {
  const map: Record<string, string> = {
    'Gold': 'स्वर्ण (सोना) पाया समृद्धि, सम्मान, नेतृत्व और एक भाग्यशाली जीवन यात्रा लाता है।',
    'Iron': 'लोहा पाया चुनौतियों और देरी का संकेत देता है, ताकत बनाने के लिए कड़ी मेहनत और दृढ़ता की आवश्यकता होती है।',
    'Silver': 'रजत (चांदी) पाया अत्यंत अनुकूल है, जो भावनात्मक स्थिरता, मानसिक शांति और निरंतर विकास लाता है।',
    'Copper': 'ताम्र (तांबा) पाया मिश्रित फल देता है, जहाँ निरंतर प्रयासों और अनुशासन के माध्यम से सफलता प्राप्त होती है।'
  };
  return map[name] || '';
};

const parseTimeToMinutes = (timeStr: string): number => {
  const [time, ampm] = timeStr.split(' ');
  let [hrsStr, minsStr] = time.split(':');
  let hrs = parseInt(hrsStr, 10);
  const mins = parseInt(minsStr, 10);
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const formatMinutesToTimeStr = (m: number): string => {
  let mins = Math.round(m) % 1440;
  if (mins < 0) mins += 1440;
  let hrs = Math.floor(mins / 60);
  const mm = Math.floor(mins % 60);
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  return `${hrs.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')} ${ampm}`;
};

const getAmritKaal = (panchang: any) => {
  const varj = panchang.varjyam?.[0];
  if (!varj) return null;

  const varjStart = parseTimeToMinutes(varj.start);
  let varjEnd = parseTimeToMinutes(varj.end);
  if (varjEnd < varjStart) varjEnd += 1440;

  const varjDuration = varjEnd - varjStart;
  const ghatiDuration = varjDuration / 4;
  const naksIdx = panchang.hinduDate.nakshatra.value - 1;
  
  const VARJYAM_START_GHATIS = [
    50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30
  ];
  const AMRIT_KAAL_START_GHATIS = [
    42, 48, 54, 52, 38, 35, 54, 44, 56, 54, 44, 54, 44, 56, 44, 38, 38, 48, 56, 44, 54, 34, 44, 38, 38, 52, 52
  ];

  const varjyamGhati = VARJYAM_START_GHATIS[naksIdx] || 30;
  const amritGhati = AMRIT_KAAL_START_GHATIS[naksIdx] || 30;

  const naksStart = varjStart - varjyamGhati * ghatiDuration;
  const amritStart = naksStart + amritGhati * ghatiDuration;
  const amritEnd = amritStart + 4 * ghatiDuration;

  return {
    start: formatMinutesToTimeStr(amritStart),
    end: formatMinutesToTimeStr(amritEnd)
  };
};

const translateKaranaHindi = (name: string): string => {
  const cleanName = name.replace(/\s*\(Bhadra\)/i, '').trim();
  const map: Record<string, string> = {
    'Bava': 'बव',
    'Balava': 'बालव',
    'Kaulava': 'कौलव',
    'Taitila': 'तैतिल',
    'Gara': 'गर',
    'Garija': 'गर',
    'Vanija': 'वणिज',
    'Vishti': 'विष्टि (भद्रा)',
    'Shakuni': 'शकुनि',
    'Chatushpada': 'चतुष्पाद',
    'Chatuspada': 'चतुष्पाद',
    'Naga': 'नाग',
    'Kintughna': 'किंस्तुघ्न',
    'Kimstughna': 'किंस्तुघ्न'
  };
  return map[cleanName] || name;
};

const translateYogaNameHindi = (name: string): string => {
  const cleanName = name.split(' ')[0].split('(')[0].trim();
  const map: Record<string, string> = {
    'Vishkumbha': 'विष्कुम्भ',
    'Priti': 'प्रीति',
    'Preeti': 'प्रीति',
    'Ayushman': 'आयुष्मान',
    'Saubhagya': 'सौभाग्य',
    'Shobhana': 'शोभन',
    'Atiganda': 'अतिगण्ड',
    'Sukarma': 'सुकर्मा',
    'Dhriti': 'धृति',
    'Shula': 'शूल',
    'Shoola': 'शूल',
    'Ganda': 'गण्ड',
    'Vriddhi': 'वृद्धि',
    'Dhruva': 'ध्रुव',
    'Vyaghata': 'व्याघात',
    'Harshana': 'हर्षण',
    'Vajra': 'वज्र',
    'Siddhi': 'सिद्धि',
    'Vyatipata': 'व्यतिपात',
    'Variyan': 'वरीयान',
    'Parigha': 'परिघ',
    'Shiva': 'शिव',
    'Siddha': 'सिद्ध',
    'Sadhya': 'साध्य',
    'Shubha': 'शुभ',
    'Shukla': 'शुक्ल',
    'Brahma': 'ब्रह्म',
    'Indra': 'इन्द्र',
    'Vaidhriti': 'वैधृति'
  };
  return map[cleanName] || name;
};

const getKaranaLordAndDeity = (name: string, lang: 'English' | 'Hindi') => {
  const cleanName = name.replace(/\s*\(Bhadra\)/i, '').trim();
  const lords: Record<string, { en: string, hi: string }> = {
    'Bava': { en: 'Sun', hi: 'सूर्य' },
    'Balava': { en: 'Moon', hi: 'चन्द्र' },
    'Kaulava': { en: 'Mars', hi: 'मंगल' },
    'Taitila': { en: 'Mercury', hi: 'बुध' },
    'Gara': { en: 'Jupiter', hi: 'गुरु' },
    'Garija': { en: 'Jupiter', hi: 'गुरु' },
    'Vanija': { en: 'Venus', hi: 'शुक्र' },
    'Vishti': { en: 'Saturn', hi: 'शनि' },
    'Shakuni': { en: 'Rahu', hi: 'राहु' },
    'Chatushpada': { en: 'Ketu', hi: 'केतु' },
    'Chatuspada': { en: 'Ketu', hi: 'केतु' },
    'Naga': { en: 'Rahu', hi: 'राहु' },
    'Kintughna': { en: 'Ketu', hi: 'केतु' },
    'Kimstughna': { en: 'Ketu', hi: 'केतु' }
  };
  const deities: Record<string, { en: string, hi: string }> = {
    'Bava': { en: 'Indra', hi: 'इन्द्र' },
    'Balava': { en: 'Brahma', hi: 'ब्रह्मा' },
    'Kaulava': { en: 'Mitra', hi: 'मित्र (सूर्य)' },
    'Taitila': { en: 'Aryaman', hi: 'अर्यमा' },
    'Gara': { en: 'Bhaga', hi: 'भग' },
    'Garija': { en: 'Bhaga', hi: 'भग' },
    'Vanija': { en: 'Manibhadra', hi: 'मणिभद्र' },
    'Vishti': { en: 'Yama', hi: 'यम' },
    'Shakuni': { en: 'Kali', hi: 'कलि देव' },
    'Chatushpada': { en: 'Vrishabha', hi: 'वृषभ' },
    'Chatuspada': { en: 'Vrishabha', hi: 'वृषभ' },
    'Naga': { en: 'Ananta', hi: 'अनन्त' },
    'Kintughna': { en: 'Vayu', hi: 'वायु' },
    'Kimstughna': { en: 'Vayu', hi: 'वायु' }
  };
  const lord = lords[cleanName] || { en: 'N/A', hi: 'N/A' };
  const deity = deities[cleanName] || { en: 'N/A', hi: 'N/A' };
  return {
    lord: lang === 'Hindi' ? lord.hi : lord.en,
    deity: lang === 'Hindi' ? deity.hi : deity.en
  };
};

interface PanchangScreenProps {
  panchang: PanchangInfo;
  currentTime?: Date;
  onShare?: () => void;
  language?: 'English' | 'Hindi';
}

export function PanchangScreen({ panchang, currentTime, onShare, language = 'English' }: PanchangScreenProps) {
  const [showHoraModal, setShowHoraModal] = useState(false);
  const [showChoghadiyaModal, setShowChoghadiyaModal] = useState(false);
  const hDate = panchang.hinduDate;

  const getPlanetCombustionState = (planetName: string) => {
    if (!panchang.combustion) return undefined;
    const combustInfo = panchang.combustion.find(c => c.name.toLowerCase() === planetName.toLowerCase());
    if (combustInfo) {
      return combustInfo.isCombust ? (language === 'Hindi' ? "अस्त (Combust)" : "Combust") : (language === 'Hindi' ? "उदित (Rising)" : "Rising");
    }
    return undefined;
  };

  const getActiveHora = () => {
    const todayPanchang = panchang;
    if (!todayPanchang || !todayPanchang.hora) return undefined;
    try {
      const now = currentTime || new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();

      const parseTimeToMinutes = (timeStr: string): number => {
        const [time, ampm] = timeStr.split(' ');
        let [hrsStr, minsStr] = time.split(':');
        let hrs = parseInt(hrsStr, 10);
        const mins = parseInt(minsStr, 10);
        if (ampm === 'PM' && hrs !== 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + mins;
      };

      const isTimeInInterval = (currMin: number, startStr: string, endStr: string): boolean => {
        const start = parseTimeToMinutes(startStr);
        const end = parseTimeToMinutes(endStr);
        if (start <= end) {
          return currMin >= start && currMin < end;
        } else {
          return currMin >= start || currMin < end;
        }
      };

      return todayPanchang.hora.find(h => 
         isTimeInInterval(currentMin, h.startTime, h.endTime)
      );
    } catch {
      return undefined;
    }
  };

  const activeHora = getActiveHora() || panchang.hora?.[0];

  const getActiveChoghadiya = () => {
    const todayPanchang = panchang;
    if (!todayPanchang || !todayPanchang.choghadiya) return undefined;
    try {
      const now = currentTime || new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();

      const parseTimeToMinutes = (timeStr: string): number => {
        const [time, ampm] = timeStr.split(' ');
        if (!time || !ampm) return 0;
        let [hrs, mins] = time.split(':').map(Number);
        if (ampm === 'PM' && hrs !== 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + mins;
      };

      const isTimeInInterval = (currMin: number, startStr: string, endStr: string): boolean => {
        const start = parseTimeToMinutes(startStr);
        const end = parseTimeToMinutes(endStr);
        if (start <= end) {
          return currMin >= start && currMin < end;
        } else {
          return currMin >= start || currMin < end;
        }
      };

      return todayPanchang.choghadiya.find(ch => 
        isTimeInInterval(currentMin, ch.startTime, ch.endTime)
      );
    } catch {
      return undefined;
    }
  };

  const activeChoghadiya = getActiveChoghadiya() || panchang.choghadiya?.[0];

  // Render Tithi gauge
  const passedPct = hDate.tithi.percentPassed !== undefined ? (hDate.tithi.percentPassed * 100) : 0;
  const tithiData = [
    { name: 'Passed', value: passedPct, fill: '#ea580c' }, // orange-600
    { name: 'Remaining', value: 100 - passedPct, fill: '#fbbf24' } // amber-400
  ];

  const solarLunarTrio = [
    { label: getTranslation(language, 'sunrise'), val: panchang.sunrise, desc: language === 'Hindi' ? 'प्रार्थना के लिए शुभ प्रातःकाल' : 'Auspicious morning time', icon: <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> },
    { label: getTranslation(language, 'sunset'), val: panchang.sunset, desc: language === 'Hindi' ? 'संध्यावंदन का समय' : 'Evening prayer time', icon: <Sun className="w-5 h-5 text-orange-600" /> },
    { label: getTranslation(language, 'moonrise'), val: panchang.moonrise, desc: language === 'Hindi' ? 'चन्द्रोदय का समय' : 'Moonrise time', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { label: getTranslation(language, 'moonset'), val: panchang.moonset, desc: language === 'Hindi' ? 'चन्द्रास्त का समय' : 'Moonset time', icon: <Moon className="w-5 h-5 text-slate-400" /> },
    {
      label: language === 'Hindi' ? 'इष्टकाल' : 'Ishtakala',
      val: panchang.ishtakala?.formatted || 'N/A',
      desc: language === 'Hindi' ? 'सूर्योदय से व्यतीत समय (घटी-विघटी)' : 'Time elapsed since sunrise (Ghati-Vighati)',
      icon: <Clock className="w-5 h-5 text-emerald-500" />
    }
  ];

    const mainPanchangElements = [
    {
      title: getTranslation(language, 'tithi'),
      fullName: language === 'Hindi' ? hDate.tithi.hindiName : hDate.tithi.name,
      engName: hDate.tithi.name,
      endTime: hDate.tithi.endTime,
      lord: language === 'Hindi' ? translateLordHindi(hDate.tithi.lord) : hDate.tithi.lord,
      deity: language === 'Hindi' ? translateDeityHindi(hDate.tithi.deity) : hDate.tithi.deity,
      description: language === 'Hindi' ? 'चंद्रमा की 12 डिग्री की कोणीय दूरी को दर्शाने वाला चंद्र-सौर दिन।' : 'Lunar day representing a 12-degree angular displacement of the Moon.',
      badgeColor: 'bg-orange-100 border-orange-255 text-orange-850'
    },
    {
      title: getTranslation(language, 'nakshatra'),
      fullName: language === 'Hindi' 
        ? `${hDate.nakshatra.hindiName}${hDate.nakshatra.pada ? ` (चरण ${hDate.nakshatra.pada})` : ''}`
        : `${hDate.nakshatra.name}${hDate.nakshatra.pada ? ` (Pada ${hDate.nakshatra.pada})` : ''}`,
      engName: language === 'Hindi' ? `स्वामी: ${translateLordHindi(hDate.nakshatra.lord)}` : `Lord: ${hDate.nakshatra.lord}`,
      endTime: hDate.nakshatra.endTime,
      lord: language === 'Hindi' ? translateLordHindi(hDate.nakshatra.lord) : hDate.nakshatra.lord,
      deity: language === 'Hindi' ? translateDeityHindi(hDate.nakshatra.deity) : hDate.nakshatra.deity,
      description: language === 'Hindi'
        ? `चंद्र राशि का भाग (${translateSymbolHindi(hDate.nakshatra.symbol)})। प्रकृति ${hDate.nakshatra.nature === 'Mridu' ? 'मृदु' : hDate.nakshatra.nature === 'Teekshna' ? 'तीक्ष्ण' : hDate.nakshatra.nature} है।` + 
          (hDate.nakshatra.gana ? ` गण: ${translateGanaHindi(hDate.nakshatra.gana)} | योनि: ${translateYoniHindi(hDate.nakshatra.yoni)} | नाड़ी: ${translateNadiHindi(hDate.nakshatra.nadi)}` : '')
        : `Segment of Moon's path (${hDate.nakshatra.symbol}). Nature is ${hDate.nakshatra.nature}.` + 
          (hDate.nakshatra.gana ? ` Gana: ${hDate.nakshatra.gana} | Yoni: ${hDate.nakshatra.yoni} | Nadi: ${hDate.nakshatra.nadi}` : ''),
      badgeColor: 'bg-amber-100 border-amber-200 text-amber-800'
    },
    {
      title: getTranslation(language, 'yoga'),
      fullName: language === 'Hindi' ? translateYogaNameHindi(hDate.yoga.name) : hDate.yoga.name,
      engName: hDate.yoga.name,
      endTime: hDate.yoga.endTime,
      lord: hDate.yoga.type === 'Shubh' ? (language === 'Hindi' ? 'शुभ' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ' : 'Inauspicious'),
      deity: language === 'Hindi' ? translateYogaMeaningHindi(hDate.yoga.name) : hDate.yoga.meaning,
      description: language === 'Hindi'
        ? translateYogaDescriptionHindi(hDate.yoga.name)
        : (hDate.yoga.meaning || 'Combined longitude of Sun and Moon divided into 27 equal parts.'),
      badgeColor: hDate.yoga.type === 'Shubh' 
        ? 'bg-emerald-100 border-emerald-255 text-emerald-850 dark:bg-emerald-950/30 dark:text-emerald-400' 
        : 'bg-rose-100 border-rose-255 text-rose-850 dark:bg-rose-950/30 dark:text-rose-455'
    },
    {
      title: getTranslation(language, 'karana'),
      fullName: language === 'Hindi' ? translateKaranaHindi(hDate.karana.name) : hDate.karana.name,
      engName: hDate.karana.name,
      endTime: hDate.karana.endTime,
      lord: language === 'Hindi' 
        ? (hDate.karana.natureHindi || (hDate.karana.type === 'Fixed' ? 'स्थिर' : 'चर'))
        : (hDate.karana.nature || hDate.karana.type),
      deity: hDate.karana.classification === 'Shubh' ? (language === 'Hindi' ? 'शुभ' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ' : 'Inauspicious'),
      description: language === 'Hindi'
        ? (hDate.karana.description || 'एक तिथि का आधा हिस्सा, चंद्र चक्र में एक महत्वपूर्ण घटना का संकेत देता है।')
        : 'Half of a Tithi, indicating a critical phase in the lunar cycle.',
      badgeColor: hDate.karana.classification === 'Shubh' 
        ? 'bg-purple-100 border-purple-255 text-purple-850 dark:bg-purple-950/30 dark:text-purple-400' 
        : 'bg-red-100 border-red-255 text-red-850 dark:bg-red-950/30 dark:text-red-400'
    }
  ];

  return (
    <div id="panchang_screen_root" className="space-y-4 sm:space-y-6">


      {/* COMPACT & INTEGRATED SINGLE PANCHANG CARD - Styled exactly like Welcome Card */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-6 text-left space-y-6">
        
        {/* Header section (Aligns to Name/Grec status card) */}
        <div className="space-y-1 pb-3 border-b border-orange-100/60 dark:border-zinc-800/80">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
            {language === 'Hindi' ? "॥ संपूर्ण विवरण ॥" : "|| Detailed Breakdown ||"}
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-amber-100">
            {language === 'Hindi' ? "वैदिक पंचांग संपूर्ण गणना" : "Vedic Panchang Complete Calculations"}
          </h2>
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400">
            {language === 'Hindi' 
              ? "सूर्योदय, सूर्यास्त, तिथि, नक्षत्र, योग, करण और संवत् का वैज्ञानिक एवं आध्यात्मिक संयोजन।" 
              : "Scientific and spiritual combination of sunrise, sunset, tithi, nakshatra, yoga, karana, and samvat."}
          </p>
        </div>

        {/* A. Astronomical Timings Section */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-mono">
            {language === 'Hindi' ? "🌅 सूर्य और चन्द्रोदय समय (Astronomical Timings)" : "🌅 Astronomical Timings"}
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {solarLunarTrio.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white/5 dark:bg-white/2 backdrop-blur-xs p-3 rounded-2xl border border-white/10 dark:border-white/5 hover:scale-[1.02] hover:border-orange-500/20 shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] transition-all duration-300 flex items-center gap-3 text-left"
              >
                <div className="p-2 rounded-xl bg-orange-100/40 dark:bg-orange-950/20 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 block font-mono uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-orange-100 font-mono mt-0.5 block">{item.val}</span>
                  <span className="text-[8px] sm:text-[9.5px] text-slate-400 dark:text-slate-500 block truncate">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B. Core Panchang Attributes Grid (Tithi, Nakshatra, Yoga, Karana) */}
        <div className="pt-5 border-t border-slate-100 dark:border-zinc-800/80">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 font-mono">
            {language === 'Hindi' ? "🕉️ मुख्य पंचांग अंग (Five Essential Elements)" : "🕉️ Five Essential Elements (Panchang)"}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {mainPanchangElements.map((elem, idx) => {
              let gridClass = "";
              if (idx === 0) gridClass = "md:col-span-2 md:row-span-2"; // Tithi
              else if (idx === 1) gridClass = "md:col-span-2"; // Nakshatra
              else if (idx === 2) gridClass = "md:col-span-1"; // Yoga
              else if (idx === 3) gridClass = "md:col-span-1"; // Karana

              if (idx === 3) {
                const k1 = hDate.karana1 || hDate.karana;
                const k2 = hDate.karana2;

                const k1Info = getKaranaLordAndDeity(k1.name, language);
                const k2Info = k2 ? getKaranaLordAndDeity(k2.name, language) : null;

                return (
                  <div 
                    key={idx} 
                    className={`${gridClass} bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 hover:scale-[1.01] hover:translate-y-[-2px] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col justify-between text-left`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-serif">{elem.title}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${elem.badgeColor} font-mono uppercase tracking-wide shadow-3xs`}>
                          {elem.title}
                        </span>
                      </div>
                      
                      {/* Prathama Karana */}
                      <div className="mt-3.5 pb-3 border-b border-slate-100/10 dark:border-zinc-800/30">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                          {language === 'Hindi' ? "प्रथम करण (1st)" : "First Karana (1st)"}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-amber-100 mt-1 flex items-center gap-1.5 leading-tight font-serif">
                          <Feather className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                          {language === 'Hindi' ? translateKaranaHindi(k1.name) : k1.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 px-2 py-0.5 rounded-md text-[9.5px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>{language === 'Hindi' ? "समाप्ति:" : "Ends:"}</span>
                            <strong className="text-slate-800 dark:text-slate-200 font-bold">{k1.endTime}</strong>
                          </div>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.25 rounded border font-mono ${
                            k1.classification === 'Shubh'
                              ? 'bg-emerald-100/50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-100/50 border-rose-300 text-rose-800 dark:bg-rose-950/20 dark:text-rose-455'
                          }`}>
                            {language === 'Hindi' 
                              ? (k1.natureHindi || (k1.type === 'Fixed' ? 'स्थिर' : 'चर'))
                              : (k1.nature || k1.type)}
                          </span>
                        </div>
                      </div>

                      {/* Dwitiya Karana */}
                      {k2 && (
                        <div className="mt-3">
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                            {language === 'Hindi' ? "द्वितीय करण (2nd)" : "Second Karana (2nd)"}
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-amber-100 mt-1 flex items-center gap-1.5 leading-tight font-serif">
                            <Feather className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                            {language === 'Hindi' ? translateKaranaHindi(k2.name) : k2.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 px-2 py-0.5 rounded-md text-[9.5px] text-slate-500 dark:text-slate-400 font-mono">
                              <span>{language === 'Hindi' ? "समाप्ति:" : "Ends:"}</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-bold">{k2.endTime}</strong>
                            </div>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.25 rounded border font-mono ${
                              k2.classification === 'Shubh'
                                ? 'bg-emerald-100/50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'bg-rose-100/50 border-rose-300 text-rose-800 dark:bg-rose-950/20 dark:text-rose-455'
                            }`}>
                              {language === 'Hindi' 
                                ? (k2.natureHindi || (k2.type === 'Fixed' ? 'स्थिर' : 'चर'))
                                : (k2.nature || k2.type)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta properties - Actual Lords and Deities */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3.5 pt-3 border-t border-slate-100/10 dark:border-zinc-800/30 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "प्रथम स्वामी" : "1st Lord"}</span>
                        <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{k1Info.lord}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "द्वितीय स्वामी" : "2nd Lord"}</span>
                        <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{k2Info ? k2Info.lord : '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "प्रथम देवता" : "1st Deity"}</span>
                        <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{k1Info.deity}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "द्वितीय देवता" : "2nd Deity"}</span>
                        <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{k2Info ? k2Info.deity : '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={idx} 
                  className={`${gridClass} bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 hover:scale-[1.01] hover:translate-y-[-2px] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col justify-between text-left`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-serif">{elem.title}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${elem.badgeColor} font-mono uppercase tracking-wide shadow-3xs`}>
                        {elem.title}
                      </span>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 mt-2 flex items-center gap-1.5 leading-tight font-serif">
                      <Feather className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                      {elem.fullName}
                    </h3>
                    
                    <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 px-2 py-0.5 rounded-md inline-flex text-[9.5px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                      <span>{language === 'Hindi' ? "समाप्ति:" : "Ends:"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{elem.endTime}</strong>
                    </div>

                    <p className="text-[11px] text-slate-550 dark:text-slate-400 font-sans mt-2.5 leading-relaxed">
                      {elem.description}
                    </p>

                    {elem.title === getTranslation(language, 'tithi') && hDate.tithi.percentPassed !== undefined && (
                      <div className="w-full relative h-[100px] flex flex-col items-center justify-end mt-3 bg-white/5 dark:bg-white/2 rounded-xl p-2.5 border border-white/10 dark:border-white/5">
                        <div className="absolute top-2 w-full px-4 flex justify-between text-[8px] font-mono font-semibold text-slate-500">
                          <div className="text-left leading-tight">{language === 'Hindi' ? "आरंभ" : "Starts"}<br/><span className="text-slate-800 dark:text-slate-300 font-bold">{hDate.tithi.startTime}</span></div>
                          <div className="text-right leading-tight">{language === 'Hindi' ? "समाप्ति" : "Ends"}<br/><span className="text-slate-800 dark:text-slate-300 font-bold">{hDate.tithi.endTime}</span></div>
                        </div>
                        <div className="h-[42px] w-full -mb-1 mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={tithiData}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={30}
                                outerRadius={38}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={3}
                              >
                                {tithiData.map((entry, i) => (
                                  <Cell key={`cell-${i}`} fill={entry.fill} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-center pointer-events-none flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono leading-none tracking-tight">{Math.round(passedPct)}%</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-sans font-bold uppercase tracking-wider">{language === 'Hindi' ? "पूर्ण" : "Completed"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta properties */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100/80 dark:border-slate-800/50 text-[10px]">
                    <div>
                      <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "स्वामी / शासक" : "Ruler / Lord"}</span>
                      <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{elem.lord}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "देवता / आशीर्वाद" : "Deity / Blessing"}</span>
                      <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{elem.deity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. Samvat Timeline Row */}
        <div className="pt-5 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-left bg-white/5 dark:bg-[#120B08]/30 p-4 rounded-2xl border border-white/10 dark:border-white/5">
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/80 to-orange-500/80 flex items-center justify-center font-bold text-xs text-white shadow-3xs shrink-0 font-sans">
                VS
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-amber-100 font-serif">{language === 'Hindi' ? "संवत् प्रणाली विवरण" : "Samvat Calendar Details"}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{language === 'Hindi' ? "विक्रम और शक संवत् की पारंपरिक प्राचीन वैदिक कैलेंडर प्रणाली।" : "Traditional ancient Vedic calendar system of Vikram and Shaka Samvat."}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
              <div className="p-2 px-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 text-center font-mono min-w-[90px]">
                <span className="text-[9px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "विक्रम संवत्" : "Vikram Samvat"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-sm sm:text-base block mt-0.5">{hDate.samvatVikram}</span>
              </div>
              <div className="p-2 px-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 text-center font-mono min-w-[90px]">
                <span className="text-[9px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "शक संवत्" : "Shaka Samvat"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-sm sm:text-base block mt-0.5">{hDate.samvatShaka}</span>
              </div>
              <div className="p-2 px-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 text-center font-mono min-w-[90px]">
                <span className="text-[9px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "गुजरात संवत्" : "Gujarati Samvat"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-sm sm:text-base block mt-0.5">{hDate.samvatGujarati || hDate.samvatVikram - 1}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PHASE 12: DETAILED ASTROLOGICAL ATTRIBUTES CARD */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-6 text-left space-y-6">
        <div className="space-y-1 pb-3 border-b border-orange-100/60 dark:border-zinc-800/80">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">{language === 'Hindi' ? "॥ अयन, ऋतु, पाया व नक्षत्र विशेष ॥" : "|| Ayana, Ritu, Paya & Nakshatra ||"}</span>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-amber-100">{language === 'Hindi' ? "सूक्ष्म ज्योतिषीय विवरण" : "Detailed Astrological Attributes"}</h2>
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400">
            {language === 'Hindi' ? "चन्द्र नक्षत्र के स्वामी, देवता, चरण, ऋतु और पाया का विस्तृत खगोलीय फलादेश।" : "Detailed astronomical reading of Moon Nakshatra, ruling deity, pada, season, and paya."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: अयन व नक्षत्र पाया */}
          <div className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <div>
              <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-serif block">{language === 'Hindi' ? "अयन व पाया" : "Ayana & Paya"}</span>
              
              {/* Ayana Badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-slate-400 text-xs font-mono">{language === 'Hindi' ? "अयन:" : "Ayana:"}</span>
                {hDate.ayana && (
                  <span className={`text-[10.5px] font-black px-3 py-1 rounded-full border ${
                    hDate.ayana === 'Uttarayana'
                      ? 'bg-amber-100 dark:bg-amber-950/45 border-amber-300 text-amber-800 dark:text-amber-350'
                      : 'bg-indigo-100 dark:bg-indigo-950/45 border-indigo-300 text-indigo-850 dark:text-indigo-350'
                  } font-sans uppercase tracking-wider flex items-center gap-1 shadow-3xs`}>
                    {hDate.ayana === 'Uttarayana' ? (language === 'Hindi' ? '🌞 उत्तरायण' : '🌞 Uttarayana') : (language === 'Hindi' ? '🌙 दक्षिणायन' : '🌙 Dakshinayana')}
                  </span>
                )}
              </div>

              {/* Paya Detail */}
              {panchang.paya && (
                <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">{language === 'Hindi' ? "नक्षत्र पाया:" : "Nakshatra Paya:"}</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border font-serif ${
                      panchang.paya.name === 'Gold' ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                      panchang.paya.name === 'Silver' ? 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-900/30 dark:text-slate-355' :
                      panchang.paya.name === 'Copper' ? 'bg-orange-100 border-orange-350 text-orange-850 dark:bg-orange-950/30 dark:text-orange-400' :
                      'bg-zinc-150 border-zinc-300 text-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-400'
                    }`}>
                      {language === 'Hindi' ? panchang.paya.hindiName : `${panchang.paya.name} Paya`}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 dark:text-slate-400 font-sans mt-2 leading-relaxed">
                    {language === 'Hindi' ? translatePayaDescriptionHindi(panchang.paya.name) : panchang.paya.description}
                  </p>
                </div>
              )}
              {/* Surya Nakshatra Detail */}
              {panchang.suryaNakshatra && (
                <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">{language === 'Hindi' ? "सूर्य नक्षत्र:" : "Surya Nakshatra:"}</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-serif">
                      {language === 'Hindi' ? `${panchang.suryaNakshatra.hindiName} (चरण ${panchang.suryaNakshatra.pada})` : `${panchang.suryaNakshatra.name} (Pada ${panchang.suryaNakshatra.pada})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{language === 'Hindi' ? `स्वामी: ${translateLordHindi(panchang.suryaNakshatra.lord)}` : `Lord: ${panchang.suryaNakshatra.lord}`}</span>
                    <span>{language === 'Hindi' ? `देवता: ${translateDeityHindi(panchang.suryaNakshatra.deity)}` : `Deity: ${panchang.suryaNakshatra.deity}`}</span>
                  </div>
                </div>
              )}

              {/* Surya Rashi Detail */}
              <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "सूर्य राशि:" : "Sun Sign (Surya Rashi):"}</span>
                  <span className="font-bold text-orange-655 dark:text-orange-400 font-serif">
                    {(() => {
                      const sunPlanet = panchang.planets?.find(p => p.name === 'Sun');
                      return sunPlanet 
                        ? (language === 'Hindi' ? sunPlanet.signHindi : sunPlanet.sign) 
                        : '—';
                    })()}
                  </span>
                </div>
              </div>

              {/* Solar Month & Leap Month */}
              <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "सौर मास:" : "Solar Month:"}</span>
                  <span className="font-bold text-slate-700 dark:text-amber-255 font-serif">
                    {language === 'Hindi' ? (hDate.solarMonth || 'अप्रकाशित') : (hDate.solarMonth || 'N/A')}
                  </span>
                </div>
                {hDate.isLeapMonth !== undefined && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">{language === 'Hindi' ? "अधिमास स्थिति:" : "Adhimasa Status:"}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      hDate.isLeapMonth
                        ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950/20'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20'
                    }`}>
                      {hDate.isLeapMonth ? (language === 'Hindi' ? '⚠️ अधिमास' : '⚠️ Leap Month') : (language === 'Hindi' ? 'शुद्ध मास' : 'Standard Month')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: चन्द्र नक्षत्र स्वामी, देवता, प्रतीक, पद/चरण, गण, योनि, नाड़ी */}
          <div className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <div>
              <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-serif block">{language === 'Hindi' ? "चन्द्र नक्षत्र सूक्ष्म विवरण" : "Chandra Nakshatra Details"}</span>
              
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र स्वामी:" : "Ruler Planet:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? translateLordHindi(hDate.nakshatra.lord || 'N/A') : (hDate.nakshatra.lord || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र देवता:" : "Nakshatra Deity:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? translateDeityHindi(hDate.nakshatra.deity || 'N/A') : (hDate.nakshatra.deity || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र प्रतीक:" : "Nakshatra Symbol:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? translateSymbolHindi(hDate.nakshatra.symbol || 'N/A') : (hDate.nakshatra.symbol || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र चरण:" : "Nakshatra Pada:"}</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">{language === 'Hindi' ? `चरण ${hDate.nakshatra.pada || 1}` : `Pada ${hDate.nakshatra.pada || 1}`}</span>
                </div>
                {hDate.nakshatra.gana && (
                  <div className="grid grid-cols-3 gap-1 pt-1.5 text-[10px] text-center">
                    <div className="bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-200/30">
                      <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "गण" : "Gana"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? translateGanaHindi(hDate.nakshatra.gana) : hDate.nakshatra.gana}</strong>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-200/30">
                      <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "योनि" : "Yoni"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? translateYoniHindi(hDate.nakshatra.yoni) : hDate.nakshatra.yoni}</strong>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-200/30">
                      <span className="text-slate-400 block font-mono">{language === 'Hindi' ? "नाड़ी" : "Nadi"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? translateNadiHindi(hDate.nakshatra.nadi) : hDate.nakshatra.nadi}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: ऋतु चक्र */}
          <div className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <div>
              <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 font-serif block">{language === 'Hindi' ? "ऋतु चक्र विवरण" : "Vedic Seasons"}</span>
              
              {panchang.rituDetails && (
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                    <span className="text-slate-400 font-mono">{language === 'Hindi' ? "सौर ऋतु:" : "Solar Season:"}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? panchang.rituDetails.solarRituHindi : panchang.rituDetails.solarRitu}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                    <span className="text-slate-400 font-mono">{language === 'Hindi' ? "चन्द्र ऋतु:" : "Lunar Season:"}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-serif">{language === 'Hindi' ? panchang.rituDetails.lunarRituHindi : panchang.rituDetails.lunarRitu}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-550 dark:text-slate-400 font-sans mt-2 leading-relaxed">
                    {language === 'Hindi' 
                      ? (panchang.rituDetails.solarRituHindi ? (
                          panchang.rituDetails.solarRituHindi === 'वसन्त' ? 'वसन्त ऋतु वसंत काल (Spring) का प्रतिनिधित्व करती है, जो खिले हुए फूलों और सुहावने मौसम से पहचानी जाती है। नए कार्यों और उत्सवों के लिए यह काल शुभ है।' :
                          panchang.rituDetails.solarRituHindi === 'ग्रीष्म' ? 'ग्रीष्म ऋतु गर्मी के मौसम (Summer) का प्रतिनिधित्व करती है, जो तीव्र धूप और लंबे दिनों से पहचानी जाती है। सूर्य और मंगल इसके स्वामी हैं।' :
                          panchang.rituDetails.solarRituHindi === 'वर्षा' ? 'वर्षा ऋतु मानसून (Monsoon) का प्रतिनिधित्व करती है, जो हरियाली और बादलों के बरसने से पहचानी जाती है। यह काल नवजीवन और कृषि के लिए अत्यंत महत्वपूर्ण है।' :
                          panchang.rituDetails.solarRituHindi === 'शरद' ? 'शरद ऋतु शरद काल (Autumn) का प्रतिनिधित्व करती है, जो स्वच्छ आकाश और सुखद रातों के लिए जानी जाती है। चन्द्रमा इसके अधिपति हैं।' :
                          panchang.rituDetails.solarRituHindi === 'हेमन्त' ? 'हेमन्त ऋतु शुरुआती सर्दियों (Pre-Winter) का प्रतिनिधित्व करती है, जिसमें मौसम शीतल और स्वास्थ्यवर्धक होने लगता है।' :
                          'शिशिर ऋतु कड़ाके की सर्दियों (Winter) का प्रतिनिधित्व करती है, जो घने कोहरे और ओस की बूंदों के लिए जानी जाती है। ध्यान और तप के लिए यह उत्तम है।'
                        ) : panchang.rituDetails.description)
                      : panchang.rituDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* DAILY MUHURAT & TIME CYCLES CARD */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-6 text-left space-y-4 shadow-sm">
        <div className="space-y-1 pb-3 border-b border-orange-100/60 dark:border-zinc-800/80">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
            {language === 'Hindi' ? "॥ शुभ-अशुभ काल चक्र ॥" : "|| Auspicious & Inauspicious Muhuratas ||"}
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-amber-100">
            {language === 'Hindi' ? "दैनिक समय चक्र और विशिष्ट मुहूर्त" : "Daily Time Cycles & Key Muhuratas"}
          </h2>
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400">
            {language === 'Hindi' ? "दैनिक पंचांग के प्रमुख शुभ मुहूर्त एवं अशुभ (वर्जित) काल खंडों की समयावधि।" : "Time duration of key auspicious muhuratas and taboo (avoid) intervals in the daily panchang."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Abhijit Muhurta */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-serif">
                  {language === 'Hindi' ? "अभिजित मुहूर्त" : "Abhijit Muhurta"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-mono">
                  {language === 'Hindi' ? "अति शुभ" : "Shubh"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {(() => {
                  const m = getMuhuratsForPanchang(panchang).find(x => x.id === 'abhijit');
                  return m ? `${m.startTime} - ${m.endTime}` : '—';
                })()}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "दिन का सर्वश्रेष्ठ समय, सभी शुभ कार्यों के लिए उत्तम।" : "Best time of the day, highly favorable for all auspicious initiations."}
            </p>
          </div>

          {/* 2. Amrit Kaal */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-serif">
                  {language === 'Hindi' ? "अमृत काल" : "Amrit Kaal"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-mono">
                  {language === 'Hindi' ? "अमृतमय" : "Amrit"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {(() => {
                  const k = getAmritKaal(panchang);
                  return k ? `${k.start} - ${k.end}` : '—';
                })()}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "पवित्र एवं देव ऊर्जा काल, धार्मिक व मांगलिक कार्यों हेतु उत्तम।" : "Sacred celestial timing, excellent for spiritual and holy ceremonies."}
            </p>
          </div>

          {/* 3. Rahu Kaal */}
          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-rose-600 dark:text-rose-455 font-serif">
                  {language === 'Hindi' ? "राहुकाल" : "Rahu Kaal"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                  {language === 'Hindi' ? "वर्जित" : "Avoid"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {panchang.rahuKaal ? `${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}` : '—'}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "राहु के प्रभाव का काल। इस समय नए कार्यों का आरंभ न करें।" : "Rahu's negative influence. Avoid starting important actions or purchases."}
            </p>
          </div>

          {/* 4. Gulik Kaal */}
          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-rose-600 dark:text-rose-455 font-serif">
                  {language === 'Hindi' ? "गुलिक काल" : "Gulik Kaal"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                  {language === 'Hindi' ? "वर्जित" : "Avoid"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {panchang.gulikKaal ? `${panchang.gulikKaal.start} - ${panchang.gulikKaal.end}` : '—'}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "शनि के पुत्र गुलिक का प्रभाव, कार्यों में बाधा और विलंब लाता है।" : "Saturn's son Gulik's timing. Normal tasks okay, but avoid new beginnings."}
            </p>
          </div>

          {/* 5. Yamaganda */}
          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-rose-600 dark:text-rose-455 font-serif">
                  {language === 'Hindi' ? "यमगण्ड" : "Yamaganda"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                  {language === 'Hindi' ? "वर्जित" : "Avoid"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {panchang.yamagandam ? `${panchang.yamagandam.start} - ${panchang.yamagandam.end}` : '—'}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "गुरु के पुत्र यमदेव का समय, यात्रा और महत्वपूर्ण वित्तीय लेनदेन वर्जित हैं।" : "Jupiter's son Yamadeva's period. Avoid travels or major financial assets."}
            </p>
          </div>

          {/* 6. Durmuhurta */}
          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-rose-600 dark:text-rose-455 font-serif">
                  {language === 'Hindi' ? "दुर्मुहूर्त" : "Durmuhurta"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                  {language === 'Hindi' ? "वर्जित" : "Avoid"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {panchang.durmuhurat && panchang.durmuhurat.length > 0
                  ? panchang.durmuhurat.map(d => `${d.start} - ${d.end}`).join(', ')
                  : '—'}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "अशुद्ध आकाशीय मुहूर्त, इस काल खंड में मांगलिक कार्य स्थगित रखें।" : "Inauspicious celestial timing. Postpone starting important ceremonies."}
            </p>
          </div>

          {/* 7. Varjyam */}
          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-rose-600 dark:text-rose-455 font-serif">
                  {language === 'Hindi' ? "वर्ज्य काल" : "Varjyam"}
                </span>
                <span className="text-[8.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                  {language === 'Hindi' ? "वर्जित" : "Avoid"}
                </span>
              </div>
              <div className="mt-2 text-base font-black text-slate-800 dark:text-amber-100 font-mono">
                {panchang.varjyam && panchang.varjyam.length > 0
                  ? panchang.varjyam.map(v => `${v.start} - ${v.end}`).join(', ')
                  : '—'}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-555 dark:text-slate-400 mt-2.5 leading-relaxed font-sans">
              {language === 'Hindi' ? "नक्षत्र का विष भाग, इस कालखंड में मांगलिक कार्य सर्वथा वर्जित हैं।" : "Toxic portion of the Nakshatra. Strictly avoid starting new operations."}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Active Live Hora Section Card (Only currently active Hora is shown) */}
      {activeHora && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left relative overflow-hidden mt-4">
          {/* Subtle design aura */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-36 h-36 bg-orange-500/8 dark:bg-orange-600/8 blur-2xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-2 border-b border-orange-100/40 dark:border-zinc-800/60">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center gap-1.5 leading-none mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {language === 'Hindi' ? "लाइव वैदिक होरा संसूचक" : "Live Vedic Hora Indicator"}
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                {language === 'Hindi' ? "अभी सक्रिय होरा" : "Current Active Hora"}
              </h3>
            </div>
          </div>

          {/* Active Hora Info Details */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
            <div className="flex-grow space-y-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-serif font-black text-slate-850 dark:text-orange-50 leading-tight">
                  {language === 'Hindi' ? `${activeHora.lordHindi} की होरा` : `${activeHora.lord}'s Hora`}
                </span>
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black border ${activeHora.colorClass.split(' ').slice(2).join(' ')} shadow-3xs`}>
                  {language === 'Hindi' ? activeHora.qualityHindi : activeHora.quality}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-3xs sm:text-2xs font-bold text-slate-500 dark:text-zinc-450 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'Hindi' ? `समय: ${activeHora.startTime} से ${activeHora.endTime} तक (वैदिक घंटा संख्या: ${activeHora.number})` : `Time: ${activeHora.startTime} to ${activeHora.endTime} (Vedic Hour: ${activeHora.number})`}</span>
              </div>

              {/* Suitable Tasks Box */}
              <div className="bg-orange-50/20 dark:bg-zinc-950/25 p-3 rounded-xl border border-orange-100/30 dark:border-zinc-900/40 mt-1">
                <span className="text-[10px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">
                  {language === 'Hindi' ? "अति उपयुक्त कार्य व फल:" : "Recommended Actions & Fruits:"}
                </span>
                <p className="text-[11px] sm:text-xs text-slate-650 dark:text-zinc-400 font-medium leading-relaxed">
                  {activeHora.benefits}
                </p>
              </div>
            </div>

            {/* Spiritual Guideline details */}
            <div className="md:w-72 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-900/40 flex flex-col justify-between text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block font-mono">
                  {language === 'Hindi' ? "वैदिक सुझाव व प्रभाव" : "Vedic Advice & Influence"}
                </span>
                <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-zinc-400 font-serif leading-relaxed italic">
                  {activeHora.quality === 'Inauspicious' 
                    ? (language === 'Hindi' ? '“यह होरा क्रूर स्वभाव की मानी जाती है। नए कार्य, बड़े निवेश या मांगलिक कर्म इस अवधि में वर्जित रखना हितकारी होगा।”' : '“This Hora is considered inauspicious. It is advisable to avoid starting new ventures, major investments, or auspicious ceremonies during this period.”')
                    : activeHora.quality === 'Auspicious'
                    ? (language === 'Hindi' ? '“यह अत्यंत शुभ और अमृतमय होरा है। इस काल में किए गए प्रयास प्रायः परम फलदायी और सफल सिद्ध होते हैं।”' : '“This is a highly auspicious and positive Hora. Efforts initiated during this time are generally fruitful and successful.”')
                    : (language === 'Hindi' ? '“यह एक संतुलित and मध्यम प्रभाव की होरा है। इसमें सामान्य दैनिक, व्यापारिक व नियमित कार्य आसानी से पूरे किए जा सकते हैं।”' : '“This is a balanced Hora with moderate influence. Routine daily tasks and business operations can be carried out smoothly.”')}
                </p>
              </div>
              
              <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-zinc-800/45 flex items-center justify-between">
                <span className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  {language === 'Hindi' ? `प्रकार: ${activeHora.isDay ? '🌞 दिवा होरा' : '🌙 रात्रि होरा'}` : `Type: ${activeHora.isDay ? '🌞 Day Hora' : '🌙 Night Hora'}`}
                </span>
                <span className="text-[9.5px] font-extrabold text-orange-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => setShowHoraModal(true)}>
                  {language === 'Hindi' ? "पूर्ण सारिणी" : "Full Table"} <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Active Live Choghadiya Section Card (Only currently active Choghadiya is shown) */}
      {activeChoghadiya && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left relative overflow-hidden mt-4">
          {/* Subtle design aura */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-36 h-36 bg-orange-500/8 dark:bg-orange-600/8 blur-2xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-2 border-b border-orange-100/40 dark:border-zinc-800/60">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center gap-1.5 leading-none mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {language === 'Hindi' ? "लाइव वैदिक चौघड़िया संसूचक" : "Live Vedic Choghadiya Indicator"}
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                {language === 'Hindi' ? "अभी सक्रिय चौघड़िया" : "Current Active Choghadiya"}
              </h3>
            </div>
          </div>

          {/* Active Choghadiya Info Details */}
          {(() => {
            const styles = (() => {
              switch (activeChoghadiya.type || activeChoghadiya.name) {
                case 'Amrit':
                case 'Labh':
                  return {
                    bg: 'from-amber-500/5 to-orange-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10',
                    border: 'border-amber-200/50 dark:border-amber-950/30',
                    badge: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-950/40',
                    text: 'text-amber-850 dark:text-amber-200',
                    qualityText: activeChoghadiya.type === 'Amrit' ? 'अमृत (अति शुभ)' : 'लाभ (अति शुभ)',
                    advice: 'यह अत्यंत शुभ और उन्नतिदायक समय है। इस अवधि में किए गए सभी धार्मिक, मांगलिक व व्यापारिक कार्य परम सफलता प्रदान करते हैं।'
                  };
                case 'Shubh':
                  return {
                    bg: 'from-emerald-500/5 to-teal-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10',
                    border: 'border-emerald-200/50 dark:border-emerald-950/30',
                    badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-950/40',
                    text: 'text-emerald-850 dark:text-emerald-200',
                    qualityText: 'शुभ (मंगलकारी)',
                    advice: 'यह एक अत्यंत मंगलकारी समय है। कोई भी शुभ संस्कार, पूजन या पारिवारिक मंगल कार्य करने के लिए यह समय सर्वश्रेष्ठ माना जाता है।'
                  };
                case 'Chal':
                  return {
                    bg: 'from-sky-500/5 to-blue-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10',
                    border: 'border-sky-200/50 dark:border-sky-950/30',
                    badge: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-200/50 dark:border-sky-950/40',
                    text: 'text-sky-850 dark:text-sky-200',
                    qualityText: 'चर (सामान्य/मध्यम)',
                    advice: 'यह एक गतिशील और सामान्य समय है। यात्रा की शुरुआत करने, वाहन क्रय करने या दैनिक कामकाज के लिए यह काल उत्तम और अनुकूल रहता है।'
                  };
                case 'Kaal':
                  return {
                    bg: 'from-slate-500/5 to-zinc-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10',
                    border: 'border-slate-200/50 dark:border-zinc-800/40',
                    badge: 'text-slate-655 dark:text-slate-400 bg-slate-50 dark:bg-zinc-900/30 border-slate-200/50 dark:border-zinc-800/45',
                    text: 'text-slate-800 dark:text-slate-200',
                    qualityText: 'काल (अशुभ - वर्जित)',
                    advice: 'यह काल राहु के समान प्रभाव वाला माना जाता है। इस समय नए कार्यों का आरंभ न करें क्योंकि इससे विवाद, हानि या कार्यों में विलम्ब हो सकता है।'
                  };
                case 'Rog':
                  return {
                    bg: 'from-rose-500/5 to-red-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10',
                    border: 'border-rose-200/50 dark:border-rose-950/30',
                    badge: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-950/40',
                    text: 'text-rose-850 dark:text-rose-200',
                    qualityText: 'रोग (अशुभ - वर्जित)',
                    advice: 'यह रोग चौघड़िया माना जाता है। इस अवधि में किसी भी प्रकार का नया इलाज, वाहन चलाना या मांगलिक कार्य प्रारंभ करना वर्जित रखना चाहिए।'
                  };
                case 'Udveg':
                default:
                  return {
                    bg: 'from-rose-500/5 to-orange-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10',
                    border: 'border-rose-200/50 dark:border-rose-950/30',
                    badge: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-950/40',
                    text: 'text-rose-850 dark:text-rose-200',
                    qualityText: 'उद्वेग (अशुभ - वर्जित)',
                    advice: 'यह सूर्य के प्रभाव वाला उद्वेग काल है जो मानसिक अशांति दे सकता है। सरकारी या प्रशासनिक कार्यों के अतिरिक्त अन्य सभी कार्यों को इस समय टालें।'
                  };
              }
            })();

            return (
              <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
                <div className="flex-grow space-y-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-serif font-black text-slate-850 dark:text-orange-50 leading-tight">
                      {language === 'Hindi' ? `${activeChoghadiya.hindiName || activeChoghadiya.name} चौघड़िया` : `${activeChoghadiya.name} Choghadiya`}
                    </span>
                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black border ${styles.badge} shadow-3xs`}>
                      {styles.qualityText}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-3xs sm:text-2xs font-bold text-slate-500 dark:text-zinc-450 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'Hindi' ? `समय: ${activeChoghadiya.startTime} से ${activeChoghadiya.endTime} तक` : `Time: ${activeChoghadiya.startTime} to ${activeChoghadiya.endTime}`}</span>
                  </div>

                  {/* Suitable Tasks Box */}
                  <div className="bg-orange-50/20 dark:bg-zinc-950/25 p-3 rounded-xl border border-orange-100/30 dark:border-zinc-900/40 mt-1">
                    <span className="text-[10px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">
                      {language === 'Hindi' ? "प्रभाव और महत्व:" : "Influence & Importance:"}
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-650 dark:text-zinc-400 font-medium leading-relaxed">
                      {styles.advice}
                    </p>
                  </div>
                </div>
                
                <div className={`md:w-72 bg-gradient-to-br ${styles.bg} p-3.5 rounded-xl border border-slate-100 dark:border-zinc-900/40 flex flex-col justify-between text-left`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block font-mono">
                      {language === 'Hindi' ? "वैदिक परामर्श" : "Vedic Advice"}
                    </span>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-zinc-400 font-serif leading-relaxed italic">
                      {activeChoghadiya.type === 'Amrit' || activeChoghadiya.type === 'Labh' || activeChoghadiya.type === 'Shubh'
                        ? (language === 'Hindi' ? '“यह काल किसी भी नवीन उपक्रम, यात्रा, खरीद-फरोख्त और शुभ संस्कारों की शुरुआत के लिए उत्तम और सुरक्षित है।”' : '“This period is highly auspicious, making it excellent and safe for starting new ventures, traveling, purchasing, or performing sacred rituals.”')
                        : activeChoghadiya.type === 'Chal'
                        ? (language === 'Hindi' ? '“इस सामान्य अवधि में नियमित व्यावसायिक यात्राएं, लेनदेन व सामान्य कार्य बिना किसी बाधा के सम्पन्न किए जा सकते हैं।”' : '“During this neutral period, routine business travels, transactions, and daily activities can be accomplished without obstacles.”')
                        : (language === 'Hindi' ? '“इस अवधि में किसी भी नए प्रोजेक्ट या बड़े निवेश की शुरुआत को स्थगित रखना ही ज्योतिषीय दृष्टि से श्रेयस्कर होगा।”' : '“It is astrologically recommended to postpone starting new projects or major investments during this inauspicious period.”')}
                    </p>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-zinc-800/45 flex items-center justify-between">
                    <span className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      {language === 'Hindi' ? `प्रकार: ${activeChoghadiya.isDay ? '🌞 दिन का चौघड़िया' : '🌙 रात्रि का चौघड़िया'}` : `Type: ${activeChoghadiya.isDay ? '🌞 Day Choghadiya' : '🌙 Night Choghadiya'}`}
                    </span>
                    <span className="text-[9.5px] font-extrabold text-orange-655 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => setShowChoghadiyaModal(true)}>
                      {language === 'Hindi' ? "पूर्ण सारिणी" : "Full Table"} <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Interactive D3.js Moon Phase & Paksha Orbit representation */}
      <MoonPhaseVisualizer panchang={panchang} />

      {/* Bhadra (Vishti Karana) Engine details card */}
      {panchang.bhadra && panchang.bhadra.active && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 border border-red-200 dark:border-red-950/40 rounded-3xl bg-red-50/20 dark:bg-red-950/5 mt-4 text-left shadow-md">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-red-200/35 dark:border-red-950/20">
            <span className="text-sm">⚠️</span>
            <span className="text-[10px] font-black text-red-650 dark:text-red-400 uppercase tracking-widest font-mono">{language === 'Hindi' ? "भद्रा दोष चेतावनी (Bhadra Alert)" : "Bhadra Alert"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "भद्रा वास" : "Bhadra Residence"}</span>
              <span className="font-extrabold text-red-750 dark:text-red-400 block text-2xs">{language === 'Hindi' ? panchang.bhadra.vasHindi : panchang.bhadra.vas}</span>
              <span className="text-[9.5px] text-slate-500 block mt-0.5">{panchang.bhadra.vas}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "भद्रा समय" : "Bhadra Duration"}</span>
              <span className="font-extrabold text-slate-800 dark:text-orange-200 block text-2xs">{language === 'Hindi' ? `${panchang.bhadra.startTime} से ${panchang.bhadra.endTime} तक` : `${panchang.bhadra.startTime} to ${panchang.bhadra.endTime}`}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "भद्रा मुख" : "Bhadra Mukha"}</span>
              <span className="font-bold text-red-650 dark:text-red-400 block text-2xs">{language === 'Hindi' ? `${panchang.bhadra.mukha} (अशुभतम समय)` : `${panchang.bhadra.mukha} (Most Inauspicious)`}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "भद्रा पुच्छ" : "Bhadra Puchha"}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-2xs">{language === 'Hindi' ? `${panchang.bhadra.puchha} (अपेक्षाकृत अनुकूल)` : `${panchang.bhadra.puchha} (Relatively Favorable)`}</span>
            </div>
          </div>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-serif italic border-t border-red-200/10 pt-1.5">
            {language === 'Hindi' ? "* भद्रा के पृथ्वी लोक (मृत्यु लोक) में वास के दौरान विवाह, गृह प्रवेश, मुंडन, और अन्य सभी मांगलिक कार्य सर्वथा वर्जित हैं।" : "* During Bhadra residence in the earthly realm (Prithvi Loka), marriages, housewarming, shaving ceremonies, and all other auspicious events are strictly prohibited."}
          </p>
        </div>
      )}

      {/* Panchak Alert Card */}
      {panchang.panchak && panchang.panchak.active && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 border border-amber-250 dark:border-amber-950/40 rounded-3xl bg-amber-50/20 dark:bg-amber-950/5 mt-4 text-left shadow-md">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-amber-250/35 dark:border-amber-950/20">
            <span className="text-sm">⚠️</span>
            <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest font-mono">{language === 'Hindi' ? `पंचक विचार अलर्ट (${panchang.panchak.hindiName})` : `Panchak Alert (${panchang.panchak.name})`}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "पंचक प्रकार" : "Panchak Type"}</span>
              <span className="font-extrabold text-amber-750 dark:text-amber-400 block text-2xs">{language === 'Hindi' ? `${panchang.panchak.typeHindi} पंचक` : `${panchang.panchak.type} Panchak`}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "विवरण / फलादेश" : "Description / Effects"}</span>
              <span className="text-slate-650 dark:text-zinc-300 block text-3xs sm:text-2xs leading-relaxed">{panchang.panchak.description}</span>
            </div>
          </div>
        </div>
      )}

      {/* Gand Mool Alert Card */}
      {panchang.gandMool && panchang.gandMool.isGandMool && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 border border-rose-200 dark:border-rose-950/40 rounded-3xl bg-rose-50/20 dark:bg-rose-950/5 mt-4 text-left shadow-md">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-rose-200/35 dark:border-rose-950/20">
            <span className="text-sm">⚠️</span>
            <span className="text-[10px] font-black text-rose-650 dark:text-rose-455 uppercase tracking-widest font-mono">{language === 'Hindi' ? "गण्ड मूल नक्षत्र दोष अलर्ट" : "Gand Mool Nakshatra Dosha Alert"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "दोष युक्त नक्षत्र" : "Affected Nakshatra"}</span>
              <span className="font-extrabold text-rose-750 dark:text-rose-400 block text-2xs">{language === 'Hindi' ? panchang.gandMool.nakshatraHindiName : panchang.gandMool.nakshatraName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[9px] uppercase tracking-wider">{language === 'Hindi' ? "स्वामी ग्रह" : "Ruling Planet"}</span>
              <span className="font-extrabold text-slate-800 dark:text-orange-200 block text-2xs">{language === 'Hindi' ? panchang.gandMool.rulingPlanetHindi : panchang.gandMool.rulingPlanet}</span>
            </div>
          </div>
          <p className="text-[9.5px] text-slate-555 dark:text-slate-455 mt-2.5 leading-relaxed font-sans border-t border-rose-200/10 pt-1.5">
            <strong>{language === 'Hindi' ? "वैदिक प्रभाव" : "Vedic Effect"}:</strong> {panchang.gandMool.description} {language === 'Hindi' ? "शिशु के जन्म के 27वें दिन नक्षत्र शांति पूजा कराना आवश्यक है।" : "Performing a Nakshatra Shanti Pooja on the 27 day after childbirth is highly recommended."}
          </p>
        </div>
      )}

      {/* Navagraha Planetary Degrees details card */}
      {panchang.planets && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 border border-orange-100/50 dark:border-orange-950/20 rounded-3xl mt-4 text-left shadow-md">
          <div className="flex items-center gap-2 mb-3 pb-1.5 border-b border-orange-100/20 dark:border-orange-950/10">
            <Feather className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black text-slate-400 dark:text-amber-500 uppercase tracking-widest font-mono">{language === 'Hindi' ? "नवग्रह स्पष्ट स्थिति" : "Navagraha Planetary Positions"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650 dark:text-zinc-300">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">{language === 'Hindi' ? "ग्रह" : "Planet"}</th>
                  <th className="pb-2">{language === 'Hindi' ? "राशि (Rashi)" : "Zodiac Sign"}</th>
                  <th className="pb-2">{language === 'Hindi' ? "भोग" : "Longitude"}</th>
                  <th className="pb-2">{language === 'Hindi' ? "गति / अवस्था" : "Motion / Speed"}</th>
                  <th className="pb-2">{language === 'Hindi' ? "तारा अस्त/उदय" : "Combustion Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/40 font-mono">
                {panchang.planets.map((p, idx) => {
                  const deg = Math.floor(p.longitude);
                  const minFloat = (p.longitude - deg) * 60;
                  const min = Math.floor(minFloat);
                  const sec = Math.floor((minFloat - min) * 60);
                  const degreeStr = `${deg}° ${min}' ${sec}"`;
                  
                  const isRetro = p.isRetrograde;
                  let stateText = "मार्गी (Direct)";
                  let stateClass = "text-emerald-600 dark:text-emerald-450";
                  if (p.name === 'Sun' || p.name === 'Moon') {
                    stateText = "नित्य मार्गी";
                    stateClass = "text-slate-500";
                  } else if (p.name === 'Rahu' || p.name === 'Ketu') {
                    stateText = "वक्री (Retrograde)";
                    stateClass = "text-orange-600 dark:text-orange-400 font-extrabold";
                  } else if (isRetro) {
                    stateText = "वक्री (Retrograde / Vakri)";
                    stateClass = "text-rose-600 dark:text-rose-450 font-extrabold";
                  }

                  const combustState = getPlanetCombustionState(p.name);
                  const combustClass = combustState?.includes("अस्त")
                    ? "text-rose-600 dark:text-rose-400 font-bold"
                    : "text-emerald-600 dark:text-emerald-450";

                  return (
                    <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-zinc-800/10">
                      <td className="py-2.5 font-bold font-serif text-slate-800 dark:text-orange-100">{language === 'Hindi' ? p.hindiName : p.name}</td>
                      <td className="py-2.5 font-serif">{language === 'Hindi' ? p.signHindi : p.sign}</td>
                      <td className="py-2.5">{degreeStr}</td>
                      <td className={`py-2.5 ${stateClass}`}>{stateText}</td>
                      <td className={`py-2.5 ${combustClass}`}>{combustState || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Hora Table Modal */}
      {showHoraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#120B08] border border-white/10 rounded-3xl p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
            <button 
              onClick={() => setShowHoraModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono font-bold text-lg cursor-pointer bg-white/5 w-8 h-8 rounded-full flex items-center justify-center border border-white/5"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/10 mb-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-500 block">
                {language === 'Hindi' ? "॥ लाइव वैदिक होरा सारणी ॥" : "|| Live Vedic Hora Chart ||"}
              </span>
              <h3 className="text-lg font-bold font-serif text-amber-100">
                {language === 'Hindi' ? "सम्पूर्ण २४ घंटे की होरा स्थिति" : "Full 24-Hour Hora Table"}
              </h3>
            </div>
            <div className="pt-2">
              <HoraSystem panchang={panchang} currentTime={currentTime || new Date()} />
            </div>
          </div>
        </div>
      )}

      {/* Choghadiya Table Modal */}
      {showChoghadiyaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#120B08] border border-white/10 rounded-3xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
            <button 
              onClick={() => setShowChoghadiyaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono font-bold text-lg cursor-pointer bg-white/5 w-8 h-8 rounded-full flex items-center justify-center border border-white/5"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/10 mb-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-500 block">
                {language === 'Hindi' ? "॥ दैनिक चौघड़िया मुहूर्त ॥" : "|| Daily Choghadiya Timings ||"}
              </span>
              <h3 className="text-lg font-bold font-serif text-amber-100">
                {language === 'Hindi' ? "सम्पूर्ण दिन-रात्रि चौघड़िया तालिका" : "Full Day-Night Choghadiya Table"}
              </h3>
            </div>
            
            {/* Grid separating Day and Night Choghadiya for pristine ease of reading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Day Choghadiya */}
              <div className="space-y-3">
                <h4 className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  {language === 'Hindi' ? "दिन का चौघड़िया" : "Daytime Choghadiya"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {panchang.choghadiya.filter(ch => ch.isDay).map((ch, i) => {
                    const chGlowMap = {
                      Excellent: 'bg-amber-500 text-amber-950 border-amber-300',
                      Good: 'bg-green-500 text-green-950 border-green-300',
                      Neutral: 'bg-blue-400 text-white border-blue-200',
                      Inauspicious: 'bg-red-400 text-white border-red-200',
                      Bad: 'bg-zinc-700 text-white border-zinc-500'
                    };
                    return (
                      <div key={i} className="p-2.5 rounded-2xl bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/20 dark:border-zinc-850/45 flex flex-col justify-between min-h-[76px] sm:min-h-[88px]">
                        <div>
                          <span className="text-xs font-black text-slate-850 dark:text-slate-200 font-serif leading-tight block">{ch.hindiName || ch.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block leading-none">{ch.startTime} - {ch.endTime}</span>
                        </div>
                        <span className={`text-[8.5px] sm:text-[9.5px] font-black uppercase text-center py-0.5 rounded-md mt-2 tracking-wider ${chGlowMap[ch.quality] || chGlowMap['Neutral']}`}>
                          {ch.quality === 'Excellent' ? (language === 'Hindi' ? 'उत्तम' : 'Excellent') : 
                           ch.quality === 'Good' ? (language === 'Hindi' ? 'शुभ' : 'Good') : 
                           ch.quality === 'Neutral' ? (language === 'Hindi' ? 'मध्यम' : 'Neutral') : 
                           ch.quality === 'Inauspicious' ? (language === 'Hindi' ? 'अशुभ' : 'Inauspicious') : 
                           (language === 'Hindi' ? 'वर्जित' : 'Bad')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Night Choghadiya */}
              <div className="space-y-3">
                <h4 className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  {language === 'Hindi' ? "रात का चौघड़िया" : "Nighttime Choghadiya"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {panchang.choghadiya.filter(ch => !ch.isDay).map((ch, i) => {
                    const chGlowMap = {
                      Excellent: 'bg-amber-500 text-amber-950 border-amber-300',
                      Good: 'bg-green-500 text-green-950 border-green-300',
                      Neutral: 'bg-blue-400 text-white border-blue-200',
                      Inauspicious: 'bg-red-400 text-white border-red-200',
                      Bad: 'bg-zinc-700 text-white border-zinc-500'
                    };
                    return (
                      <div key={i} className="p-2.5 rounded-2xl bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/20 dark:border-zinc-850/45 flex flex-col justify-between min-h-[76px] sm:min-h-[88px]">
                        <div>
                          <span className="text-xs font-black text-slate-850 dark:text-slate-200 font-serif leading-tight block">{ch.hindiName || ch.name}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block leading-none">{ch.startTime} - {ch.endTime}</span>
                        </div>
                        <span className={`text-[8.5px] sm:text-[9.5px] font-black uppercase text-center py-0.5 rounded-md mt-2 tracking-wider ${chGlowMap[ch.quality] || chGlowMap['Neutral']}`}>
                          {ch.quality === 'Excellent' ? (language === 'Hindi' ? 'उत्तम' : 'Excellent') : 
                           ch.quality === 'Good' ? (language === 'Hindi' ? 'शुभ' : 'Good') : 
                           ch.quality === 'Neutral' ? (language === 'Hindi' ? 'मध्यम' : 'Neutral') : 
                           ch.quality === 'Inauspicious' ? (language === 'Hindi' ? 'अशुभ' : 'Inauspicious') : 
                           (language === 'Hindi' ? 'वर्जित' : 'Bad')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
