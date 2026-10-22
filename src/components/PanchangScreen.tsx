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
  Calendar,
  CalendarRange,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PanchangInfo } from '../types';
import { HoraSystem } from './HoraSystem';
import { getTranslation, formatKaranaEndTime } from '../utils/translations';
import { getMuhuratsForPanchang, NAKSHATRA_DETAILS } from '../utils/panchangCalc';

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
  if (!month) return 'अप्रकाशित';
  const map: Record<string, string> = {
    'Mesha': 'मेष', 'Vrishabha': 'वृषभ', 'Mithuna': 'मिथुन', 'Karka': 'कर्क',
    'Simha': 'सिंह', 'Kanya': 'कन्या', 'Tula': 'तुला', 'Vrischika': 'वृश्चिक', 'Vrishchika': 'वृश्चिक',
    'Dhanu': 'धनु', 'Makara': 'मकर', 'Kumbha': 'कुम्भ', 'Meena': 'मीन',
    'Aries': 'मेष', 'Taurus': 'वृषभ', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
    'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
    'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुम्भ', 'Pisces': 'मीन',
    'Chaitra': 'चैत्र', 'Vaishakha': 'वैशाख', 'Jyeshtha': 'ज्येष्ठ', 'Ashadha': 'आषाढ़',
    'Shravana': 'श्रावण', 'Bhadrapada': 'भाद्रपद', 'Ashvina': 'आश्विन', 'Kartika': 'कार्तिक',
    'Margashirsha': 'मार्गशीर्ष', 'Pausha': 'पौष', 'Magha': 'माघ', 'Phalguna': 'फाल्गुन'
  };
  let res = month;
  for (const [k, v] of Object.entries(map)) {
    res = res.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
  }
  return res;
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
    'Simha': 'सिंह (शेर)',
    'Dog (Shvana)': 'श्वान (कुत्ता)',
    'Dog': 'श्वान (कुत्ता)',
    'Horse (Ashwa)': 'अश्व (घोड़ा)',
    'Horse': 'अश्व (घोड़ा)',
    'Elephant (Gaja)': 'गज (हाथी)',
    'Elephant': 'गज (हाथी)',
    'Sheep (Mesha)': 'मेष (भेड़)',
    'Sheep': 'मेष (भेड़)',
    'Serpent (Sarpa)': 'सर्प (सांप)',
    'Serpent': 'सर्प (सांप)',
    'Cat (Marjara)': 'मार्जार (बिल्ली)',
    'Cat': 'मार्जार (बिल्ली)',
    'Rat (Mushaka)': 'मूषक (चूहा)',
    'Rat': 'मूषक (चूहा)',
    'Cow (Gau)': 'गौ (गाय)',
    'Cow': 'गौ (गाय)',
    'Buffalo (Mahisha)': 'महिष (भैंस)',
    'Buffalo': 'महिष (भैंस)',
    'Tiger (Vyaghra)': 'व्याघ्र (बाघ)',
    'Tiger': 'व्याघ्र (बाघ)',
    'Deer (Mriga)': 'मृग (हिरण)',
    'Deer': 'मृग (हिरण)',
    'Monkey (Vanara)': 'वानर (बंदर)',
    'Monkey': 'वानर (बंदर)',
    'Mongoose (Nakula)': 'नकुल (नेवला)',
    'Mongoose': 'नकुल (नेवला)',
    'Lion (Simha)': 'सिंह (शेर)',
    'Lion': 'सिंह (शेर)'
  };
  return map[yoni] || yoni;
};

const translateSymbolHindi = (symbol: string): string => {
  const map: Record<string, string> = {
    // Exact keys from panchangCalc.ts
    'Horse Head': 'घोड़े का सिर',
    'Horse\'s Head': 'घोड़े का सिर',
    'Yoni (Creativity)': 'योनि (सृजन)',
    'Yoni': 'योनि',
    'Knife/Razor': 'छुरा या उस्तरा',
    'Razor or Knife': 'छुरा या चाकू',
    'Cart/Chariot': 'रथ या छकड़ा',
    'Temple or Chariot': 'मंदिर या रथ',
    'Deer Head': 'मृगशीर्ष (हिरन का सिर)',
    'Tear-drop': 'आँसू या मणि',
    'Teardrop or Jewel': 'आँसू या मणि',
    'Bow & Quiver': 'धनुष-बाण',
    'Bow or Quiver': 'धनुष या बाण',
    'Flower/Cow Udder': 'कमल / गाय का थन',
    'Cow\'s Udder': 'गाय का थन',
    'Coiled Snake': 'कुंडलिनी सर्प',
    'Serpent': 'सर्प',
    'Royal Throne': 'राजसिंहासन',
    'Front Legs of Bed': 'शय्या के अग्र पावे',
    'Palanquin or Bed': 'पालकी या शय्या',
    'Back Legs of Bed': 'शय्या के पृष्ठ पावे',
    'Hammock or Couch': 'झूला या पलंग',
    'Clenched Fist': 'मुट्ठी या खुला हाथ',
    'Hand or Fist': 'हाथ या मुट्ठी',
    'Bright Pearl/Gem': 'चमकता मोती या मणि',
    'Pearl or Coral': 'मोती या मूंगा',
    'Shoot of Plant/Sword': 'पौधे का अंकुर या तलवार',
    'Sword or Shield': 'तलवार या ढाल',
    'Triumphal Arch': 'विजय द्वार (तोरण)',
    'Archway or Garland': 'तोरण या माला',
    'Lotus Flower': 'कमल का फूल',
    'Lotus or Wheel': 'कमल या चक्र',
    'Umbrella/Round Amulet': 'छत्र या गोल ताबीज',
    'Circular Amulet or Umbrella': 'छत्र या ताबीज',
    'Umbrella': 'छत्र',
    'Amulet': 'ताबीज',
    'Tied Bunch of Roots': 'जड़ों का बंधा गुच्छा',
    'Elephant Tusk': 'हाथी का दांत',
    'Winnowing Basket': 'सूप (अनाज फटकने का पात्र)',
    'Three Footprints': 'तीन चरण (वामन पग)',
    'Three Footsteps': 'तीन कदम',
    'Drum/Flute': 'डमरू या बांसुरी',
    'Drum or Clay Pot': 'डमरू या मिट्टी का बर्तन',
    'Flute or Bamboo': 'बांसुरी या बांस',
    'Empty Circle/100 Stars': 'सौ तारों का समूह (रिक्त वृत्त)',
    'Empty Circle': 'रिक्त वृत्त',
    '100 Stars': 'सौ तारों का समूह',
    'Two-Faced Man': 'दो मुख वाला मनुष्य',
    'Twins in Back of Bed': 'शय्या के पिछले पावे',
    'Fish/Drum': 'मछली का जोड़ा या मृदंग',
    'Twin Fishes': 'जुड़वां मछलियां',
    'Weaving Loom': 'करघा',
    'Earring or Leaf': 'कुंडल या पत्ता',
    'Potter\'s Wheel': 'कुम्हार का चाक',
    'Bed or Cot': 'शय्या या खाट',
    'Circle or Ring': 'वृत्त या वलय',
    'Thunderbolt': 'वज्र',
    'Movable (Chara)': 'चर (गतिशील)'
  };
  return map[symbol] || symbol;
};

const translateNakshatraNatureHindi = (nature: string): string => {
  if (!nature) return '';
  const clean = nature.toLowerCase();
  if (clean.includes('chara') || clean.includes('movable')) return 'चर (गतिशील)';
  if (clean.includes('dhruva') || clean.includes('fixed')) return 'ध्रुव (स्थिर)';
  if (clean.includes('mridu') || clean.includes('soft')) return 'मृदु (कोमल)';
  if (clean.includes('ugra') || clean.includes('fierce')) return 'उग्र (कठोर)';
  if (clean.includes('laghu') || clean.includes('light') || clean.includes('kshipra')) return 'लघु (क्षिप्र)';
  if (clean.includes('teekshna') || clean.includes('sharp')) return 'तीक्ष्ण (दारुण)';
  if (clean.includes('mishra') || clean.includes('mixed')) return 'मिश्र (साधारण)';
  return nature;
};

const getTithiNatureBadge = (tithiVal: number, lang: 'English' | 'Hindi') => {
  const norm = ((tithiVal - 1) % 15) + 1;
  if (norm === 1 || norm === 6 || norm === 11) {
    return {
      label: lang === 'Hindi' ? 'नन्दा तिथि' : 'Nanda Tithi',
      color: 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-300/70'
    };
  } else if (norm === 2 || norm === 7 || norm === 12) {
    return {
      label: lang === 'Hindi' ? 'भद्रा तिथि' : 'Bhadra Tithi',
      color: 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300/70'
    };
  } else if (norm === 3 || norm === 8 || norm === 13) {
    return {
      label: lang === 'Hindi' ? 'जया तिथि' : 'Jaya Tithi',
      color: 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-300/70'
    };
  } else if (norm === 4 || norm === 9 || norm === 14) {
    return {
      label: lang === 'Hindi' ? 'रिक्ता तिथि' : 'Rikta Tithi',
      color: 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-455 border-rose-300/70'
    };
  } else {
    return {
      label: lang === 'Hindi' ? 'पूर्णा तिथि' : 'Poorna Tithi',
      color: 'bg-orange-100/70 dark:bg-orange-950/40 text-orange-800 dark:text-orange-400 border-orange-300/70'
    };
  }
};

const getTithiSignificanceHindi = (tithiVal: number, name: string): string => {
  const norm = ((tithiVal - 1) % 15) + 1;
  if (tithiVal === 15) {
    return 'पूर्णिमा तिथि मां लक्ष्मी और सत्यनारायण भगवान की कृपा प्राप्ति, दान, जप और तीर्थ स्नान के लिए परम पुण्यदायी है।';
  }
  if (tithiVal === 30) {
    return 'अमावस्या तिथि पितृ तर्पण, श्राद्ध कर्म और आत्म-चिंतन के लिए समर्पित है। इस दिन नए सांसारिक कार्य टालें।';
  }
  switch (norm) {
    case 1: return 'प्रतिपदा तिथि नए संकल्प, नवीन आरंभ और देव पूजन के लिए शुभ फलदायी मानी जाती है।';
    case 2: return 'द्वितीया (दूज) तिथि नवीन कार्य, यात्रा, पारिवारिक मेलजोल व संस्कारों के लिए अत्यंत अनुकूल है।';
    case 3: return 'तृतीया (तीज) तिथि मां गौरी की आराधना, आरोग्य, सौभाग्य वृद्धि और मांगलिक कार्यों हेतु उत्तम है।';
    case 4: return 'चतुर्थी तिथि विघ्नहर्ता भगवान श्री गणेश की उपासना और संकट निवारण के लिए श्रेष्ठ है।';
    case 5: return 'पंचमी तिथि देवी सरस्वती और नाग देव की पूजा तथा विद्यारंभ के लिए परम कल्याणकारी है।';
    case 6: return 'षष्ठी तिथि भगवान कार्तिकेय की आराधना और स्वास्थ्य व ऊर्जा वृद्धि के लिए शुभ है।';
    case 7: return 'सप्तमी तिथि भगवान सूर्य नारायण की उपासना, आरोग्य लाभ और मान-सम्मान प्राप्ति हेतु उत्तम है।';
    case 8: return 'अष्टमी तिथि मां दुर्गा और शिव पूजन के लिए अत्यधिक फलदायी व आध्यात्मिक ऊर्जावान मानी जाती है।';
    case 9: return 'नवमी तिथि मर्यादा पुरुषोत्तम श्री राम और देवी सिद्धिदात्री की कृपा प्राप्ति के लिए विशेष है।';
    case 10: return 'दशमी तिथि विजय, धर्म रक्षा, यात्रा और महत्वपूर्ण कार्यों की सिद्धि के लिए शुभ मानी जाती है।';
    case 11: return 'एकादशी तिथि भगवान विष्णु की उपासना, व्रत, साधना और सात्विक कार्यों के लिए परम शुभ मानी जाती है।';
    case 12: return 'द्वादशी तिथि विष्णु पूजन, तुलसी सेवा, व्रत पारण और सात्विक कर्मों के लिए परम श्रेष्ठ है।';
    case 13: return 'त्रयोदशी तिथि (प्रदोष काल) भगवान शिव की आराधना और सर्व मनोकामना पूर्ति हेतु शुभ है।';
    case 14: return 'चतुर्दशी तिथि भगवान शिव और उग्र साधनाओं के लिए अनुकूल है। नए सांसारिक मांगलिक कार्य टालना श्रेयस्कर है।';
    case 15: return 'पूर्णा तिथि सभी प्रकार के मांगलिक कार्यों, अनुष्ठान और उत्सवों के लिए परिपूर्ण मानी जाती है।';
    default: return 'चंद्रमा और सूर्य की कोणीय दूरी से निर्मित शुभ चंद्र-सौर तिथि।';
  }
};

const getNakshatraNatureBadge = (nature: string, lang: 'English' | 'Hindi') => {
  const clean = nature ? nature.toLowerCase() : '';
  if (clean.includes('chara') || clean.includes('movable')) {
    return {
      label: lang === 'Hindi' ? 'चर (गतिशील)' : 'Chara (Movable)',
      color: 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300/70'
    };
  } else if (clean.includes('dhruva') || clean.includes('fixed')) {
    return {
      label: lang === 'Hindi' ? 'ध्रुव (स्थिर)' : 'Dhruva (Fixed)',
      color: 'bg-blue-100/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border-blue-300/70'
    };
  } else if (clean.includes('mridu') || clean.includes('soft')) {
    return {
      label: lang === 'Hindi' ? 'मृदु (कोमल)' : 'Mridu (Soft)',
      color: 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-300/70'
    };
  } else if (clean.includes('ugra') || clean.includes('fierce')) {
    return {
      label: lang === 'Hindi' ? 'उग्र (कठोर)' : 'Ugra (Fierce)',
      color: 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-455 border-rose-300/70'
    };
  } else if (clean.includes('kshipra') || clean.includes('light') || clean.includes('laghu')) {
    return {
      label: lang === 'Hindi' ? 'लघु (क्षिप्र)' : 'Laghu (Swift)',
      color: 'bg-purple-100/70 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400 border-purple-300/70'
    };
  } else if (clean.includes('teekshna') || clean.includes('sharp')) {
    return {
      label: lang === 'Hindi' ? 'तीक्ष्ण (दारुण)' : 'Teekshna (Sharp)',
      color: 'bg-red-100/70 dark:bg-red-950/40 text-red-800 dark:text-red-455 border-red-300/70'
    };
  } else {
    return {
      label: lang === 'Hindi' ? 'मिश्र (साधारण)' : 'Mishra (Mixed)',
      color: 'bg-slate-100/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-300/70'
    };
  }
};

const getFormattedHeaderDate = (date: Date, lang: 'English' | 'Hindi'): string => {
  const validDate = (date && !isNaN(date.getTime())) ? date : new Date();
  if (lang === 'Hindi') {
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const dayName = days[validDate.getDay()];
    const day = validDate.getDate();
    const monthName = months[validDate.getMonth()];
    const year = validDate.getFullYear();
    return `${dayName}, ${day} ${monthName} ${year}`;
  } else {
    return validDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
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

const translateNatureHindi = (nature: string): string => {
  const cleanNature = nature.toLowerCase();
  if (cleanNature.includes('kshipra') || cleanNature.includes('light')) return 'लघु और क्षिप्र (तेज)';
  if (cleanNature.includes('ugra') || cleanNature.includes('fierce')) return 'उग्र (क्रूर)';
  if (cleanNature.includes('dhruva') || cleanNature.includes('fixed')) return 'स्थिर (ध्रुव)';
  if (cleanNature.includes('mridu') || cleanNature.includes('soft')) return 'मृदु (कोमल)';
  if (cleanNature.includes('chara') || cleanNature.includes('movable')) return 'चर (गतिशील)';
  if (cleanNature.includes('teekshna') || cleanNature.includes('sharp')) return 'तीक्ष्ण (उग्र/दारुण)';
  if (cleanNature.includes('mishra') || cleanNature.includes('mixed')) return 'मिश्र (साधारण)';
  return nature;
};

const getPlanetColor = (lord: string) => {
  switch (lord.toLowerCase()) {
    case 'ketu': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50';
    case 'venus': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-900/50';
    case 'sun': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
    case 'moon': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50';
    case 'mars': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-455 dark:border-rose-900/50';
    case 'rahu': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-850';
    case 'jupiter': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/50';
    case 'saturn': return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-400 dark:border-zinc-800';
    case 'mercury': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
    default: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50';
  }
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

const translateAnandadiYogaDescHindi = (name: string, englishDesc?: string): string => {
  const map: Record<string, string> = {
    'Ananda': 'सभी सकारात्मक एवं मांगलिक कार्यों के आरंभ के लिए अति शुभ योग।',
    'Kaladanda': 'अशुभ योग। महत्वपूर्ण निर्णयों और मांगलिक अनुष्ठानों से बचें।',
    'Dhumra': 'अशुभ योग। कार्यों में भ्रम या रुकावटें आ सकती हैं, सावधानी बरतें।',
    'Prajapati': 'संतान, धार्मिक अनुष्ठान और नए उपक्रमों की शुरुआत के लिए शुभ योग।',
    'Saubhagya': 'अखंड सौभाग्य, दांपत्य सुख और समृद्धि प्रदान करने वाला उत्तम योग।',
    'Dhwanksha / Aadal': 'विशेष दैनिक ज्योतिषीय योग (आदल योग)। सामान्य दिनचर्या रखें।',
    'Dhwaja': 'विजय, प्रतिष्ठा वृद्धि, परीक्षा एवं प्रतियोगिता में सफलता हेतु अनुकूल।',
    'Shrivatsa': 'मां लक्ष्मी की कृपा एवं धन-धान्य की वृद्धि कराने वाला कल्याणकारी योग।',
    'Vajra': 'सावधानी बरतें। लंबी यात्राओं और भारी निवेश से बचना श्रेयस्कर है।',
    'Mudgara': 'अशुभ योग। कार्यों में विलंब या परिश्रम अधिक होने की संभावना।',
    'Chhatra': 'शत्रुओं व विघ्नों से सुरक्षा प्रदान करने वाला और सफलता दायक योग।',
    'Mitra': 'साझेदारी, नवीन मित्रता और समझौते स्थापित करने के लिए सर्वोत्तम।',
    'Manasa': 'मानसिक शांति, स्पष्टता और बौद्धिक कार्यों के लिए अत्यंत फलदायी।',
    'Padma': 'पवित्रता, आध्यात्मिक उन्नति और भौतिक समृद्धि देने वाला शुभ योग।',
    'Lambaka': 'अशुभ योग। यात्रा के दौरान विशेष सावधानी और सतर्कता रखें।',
    'Utpata': 'अचानक बाधाओं का संकेत। बड़े उत्सव व मांगलिक कार्य स्थगित रखें।',
    'Mrityu': 'अति अशुभ योग। किसी भी प्रकार के नवीन व मांगलिक कार्यों से बचें।',
    'Kaana': 'अशुभ योग। महत्वपूर्ण अनुबंधों और नए लेन-देन से बचना उचित है।',
    'Siddhi': 'आरंभ किए गए कार्यों, लक्ष्यों और मनोकामनाओं में सिद्धिदायक योग।',
    'Shubh': 'दैनिक कार्यों, खरीदारी एवं सामान्य गतिविधियों के लिए शुभ योग।',
    'Amrita': 'अमृत तुल्य योग। दीर्घायु, उत्तम स्वास्थ्य एवं सर्वकार्य सिद्धि प्रदान करता है।',
    'Musala': 'अशुभ योग। विवाद, मुकदमेबाजी और वाद-विवाद से दूर रहें।',
    'Gada': 'अशुभ योग। नवीन निर्माण कार्य या भूमि पूजन आरंभ करने से बचें।',
    'Matanga': 'प्रशासनिक सहयोग, नेतृत्व और समाज में मान-सम्मान बढ़ाने वाला योग।',
    'Rakshasa': 'अशुभ योग। मांगलिक घरेलू संस्कारों व शुभ कार्यों को टालें।',
    'Chara': 'वाहन क्रय, यात्रा, गतिशीलता और परिवर्तन के लिए अनुकूल योग।',
    'Sthira': 'स्थायी निवेश, गृह प्रवेश, नींव रखने व संपत्ति क्रय के लिए उत्तम।',
    'Vardhamana': 'निरंतर विकास, विस्तार, व्यापारिक वृद्धि और उन्नति देने वाला योग।',
    'आनन्द': 'सभी सकारात्मक एवं मांगलिक कार्यों के आरंभ के लिए अति शुभ योग।',
    'कालदण्ड': 'अशुभ योग। महत्वपूर्ण निर्णयों और मांगलिक अनुष्ठानों से बचें।',
    'धूम्र': 'अशुभ योग। कार्यों में भ्रम या रुकावटें आ सकती हैं, सावधानी बरतें।',
    'प्रजापति': 'संतान, धार्मिक अनुष्ठान और नए उपक्रमों की शुरुआत के लिए शुभ योग।',
    'सौभाग्य': 'अखंड सौभाग्य, दांपत्य सुख और समृद्धि प्रदान करने वाला उत्तम योग।',
    'ध्वंक्ष / आदल योग': 'विशेष दैनिक ज्योतिषीय योग (आदल योग)। सामान्य दिनचर्या रखें।',
    'ध्वज': 'विजय, प्रतिष्ठा वृद्धि, परीक्षा एवं प्रतियोगिता में सफलता हेतु अनुकूल।',
    'श्रीवत्स': 'मां लक्ष्मी की कृपा एवं धन-धान्य की वृद्धि कराने वाला कल्याणकारी योग।',
    'वज्र': 'सावधानी बरतें। लंबी यात्राओं और भारी निवेश से बचना श्रेयस्कर है।',
    'मुद्गर': 'अशुभ योग। कार्यों में विलंब या परिश्रम अधिक होने की संभावना।',
    'छत्र': 'शत्रुओं व विघ्नों से सुरक्षा प्रदान करने वाला और सफलता दायक योग।',
    'मित्र': 'साझेदारी, नवीन मित्रता और समझौते स्थापित करने के लिए सर्वोत्तम।',
    'मानस': 'मानसिक शांति, स्पष्टता और बौद्धिक कार्यों के लिए अत्यंत फलदायी।',
    'पद्म': 'पवित्रता, आध्यात्मिक उन्नति और भौतिक समृद्धि देने वाला शुभ योग।',
    'लम्बक': 'अशुभ योग। यात्रा के दौरान विशेष सावधानी और सतर्कता रखें।',
    'उत्पात': 'अचानक बाधाओं का संकेत। बड़े उत्सव व मांगलिक कार्य स्थगित रखें।',
    'मृत्यु': 'अति अशुभ योग। किसी भी प्रकार के नवीन व मांगलिक कार्यों से बचें।',
    'काण': 'अशुभ योग। महत्वपूर्ण अनुबंधों और नए लेन-देन से बचना उचित है।',
    'सिद्धि': 'आरंभ किए गए कार्यों, लक्ष्यों और मनोकामनाओं में सिद्धिदायक योग।',
    'शुभ': 'दैनिक कार्यों, खरीदारी एवं सामान्य गतिविधियों के लिए शुभ योग।',
    'अमृत': 'अमृत तुल्य योग। दीर्घायु, उत्तम स्वास्थ्य एवं सर्वकार्य सिद्धि प्रदान करता है।',
    'मुसल': 'अशुभ योग। विवाद, मुकदमेबाजी और वाद-विवाद से दूर रहें।',
    'गदा': 'अशुभ योग। नवीन निर्माण कार्य या भूमि पूजन आरंभ करने से बचें।',
    'मातंग': 'प्रशासनिक सहयोग, नेतृत्व और समाज में मान-सम्मान बढ़ाने वाला योग।',
    'राक्षस': 'अशुभ योग। मांगलिक घरेलू संस्कारों व शुभ कार्यों को टालें।',
    'चर': 'वाहन क्रय, यात्रा, गतिशीलता और परिवर्तन के लिए अनुकूल योग।',
    'स्थिर': 'स्थायी निवेश, गृह प्रवेश, नींव रखने व संपत्ति क्रय के लिए उत्तम।',
    'वर्धमान': 'निरंतर विकास, विस्तार, व्यापारिक वृद्धि और उन्नति देने वाला योग।'
  };
  return map[name] || englishDesc || '';
};

interface PanchangScreenProps {
  panchang: PanchangInfo;
  currentTime?: Date;
  onShare?: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  language?: 'English' | 'Hindi';
}

export function PanchangScreen({ panchang, currentTime, onShare, selectedDate, onDateChange, language = 'English' }: PanchangScreenProps) {
  const [showHoraModal, setShowHoraModal] = useState(false);
  const [showChoghadiyaModal, setShowChoghadiyaModal] = useState(false);
  const [showAllNakshatrasModal, setShowAllNakshatrasModal] = useState(false);
  const [nakshatraModalSearchQuery, setNakshatraModalSearchQuery] = useState('');

  if (!panchang || !panchang.hinduDate || !panchang.hinduDate.tithi || !panchang.hinduDate.nakshatra) {
    return null;
  }

  const hDate = panchang.hinduDate;

  const getPlanetCombustionState = (planetName: string) => {
    if (!panchang.combustion || !planetName) return undefined;
    const combustInfo = panchang.combustion.find(c => c && c.name && c.name.toLowerCase() === planetName.toLowerCase());
    if (combustInfo) {
      return combustInfo.isCombust ? (language === 'Hindi' ? "अस्त" : "Combust") : (language === 'Hindi' ? "उदित" : "Rising");
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
    { label: getTranslation(language, 'sunrise'), val: panchang.sunrise, desc: language === 'Hindi' ? 'प्रातःकालीन शुभ काल' : 'Auspicious morning time', icon: <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> },
    { label: getTranslation(language, 'sunset'), val: panchang.sunset, desc: language === 'Hindi' ? 'संध्यावंदन का समय' : 'Evening prayer time', icon: <Sun className="w-5 h-5 text-orange-600" /> },
    { label: getTranslation(language, 'moonrise'), val: panchang.moonrise, desc: language === 'Hindi' ? 'चन्द्रोदय का समय' : 'Moonrise time', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { label: getTranslation(language, 'moonset'), val: panchang.moonset, desc: language === 'Hindi' ? 'चन्द्रास्त का समय' : 'Moonset time', icon: <Moon className="w-5 h-5 text-slate-400" /> }
  ];

  const tithiBadgeInfo = getTithiNatureBadge(hDate?.tithi?.value || 1, language);
  const nakshatraBadgeInfo = getNakshatraNatureBadge(hDate?.nakshatra?.nature || '', language);

  const mainPanchangElements = [
    {
      title: getTranslation(language, 'tithi'),
      fullName: language === 'Hindi' ? (hDate?.tithi?.hindiName || '') : (hDate?.tithi?.name || ''),
      engName: hDate?.tithi?.name || '',
      endTime: hDate?.tithi?.endTime || '',
      lord: language === 'Hindi' ? translateLordHindi(hDate?.tithi?.lord || '') : (hDate?.tithi?.lord || ''),
      deity: language === 'Hindi' ? translateDeityHindi(hDate?.tithi?.deity || '') : (hDate?.tithi?.deity || ''),
      description: language === 'Hindi'
        ? getTithiSignificanceHindi(hDate?.tithi?.value || 1, hDate?.tithi?.hindiName || '')
        : 'Lunar day representing a 12-degree angular displacement of the Moon.',
      badgeText: tithiBadgeInfo.label,
      badgeColor: tithiBadgeInfo.color
    },
    {
      title: getTranslation(language, 'nakshatra'),
      fullName: language === 'Hindi' 
        ? `${hDate?.nakshatra?.hindiName || ''}${hDate?.nakshatra?.pada ? ` (चरण ${hDate.nakshatra.pada})` : ''}`
        : `${hDate?.nakshatra?.name || ''}${hDate?.nakshatra?.pada ? ` (Pada ${hDate.nakshatra.pada})` : ''}`,
      engName: language === 'Hindi' ? `स्वामी: ${translateLordHindi(hDate?.nakshatra?.lord || '')}` : `Lord: ${hDate?.nakshatra?.lord || ''}`,
      endTime: hDate?.nakshatra?.endTime || '',
      lord: language === 'Hindi' ? translateLordHindi(hDate?.nakshatra?.lord || '') : (hDate?.nakshatra?.lord || ''),
      deity: language === 'Hindi' ? translateDeityHindi(hDate?.nakshatra?.deity || '') : (hDate?.nakshatra?.deity || ''),
      description: language === 'Hindi'
        ? `प्रतीक: ${translateSymbolHindi(hDate?.nakshatra?.symbol || '')} • स्वभाव: ${translateNakshatraNatureHindi(hDate?.nakshatra?.nature || '')}।` + 
          (hDate?.nakshatra?.gana ? ` गण: ${translateGanaHindi(hDate.nakshatra.gana)} | योनि: ${translateYoniHindi(hDate.nakshatra.yoni)} | नाड़ी: ${translateNadiHindi(hDate.nakshatra.nadi)}` : '')
        : `Symbol: ${hDate?.nakshatra?.symbol || ''}. Nature: ${hDate?.nakshatra?.nature || ''}.` + 
          (hDate?.nakshatra?.gana ? ` Gana: ${hDate.nakshatra.gana} | Yoni: ${hDate.nakshatra.yoni} | Nadi: ${hDate.nakshatra.nadi}` : ''),
      badgeText: nakshatraBadgeInfo.label,
      badgeColor: nakshatraBadgeInfo.color
    },
    {
      title: getTranslation(language, 'yoga'),
      fullName: language === 'Hindi' ? translateYogaNameHindi(hDate?.yoga?.name || '') : (hDate?.yoga?.name || ''),
      engName: hDate?.yoga?.name || '',
      endTime: hDate?.yoga?.endTime || '',
      lord: hDate?.yoga?.type === 'Shubh' ? (language === 'Hindi' ? 'शुभ' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ' : 'Inauspicious'),
      deity: language === 'Hindi' ? translateYogaMeaningHindi(hDate?.yoga?.name || '') : (hDate?.yoga?.meaning || ''),
      description: language === 'Hindi'
        ? translateYogaDescriptionHindi(hDate?.yoga?.name || '')
        : (hDate?.yoga?.meaning || 'Combined longitude of Sun and Moon divided into 27 equal parts.'),
      badgeText: hDate?.yoga?.type === 'Shubh' ? (language === 'Hindi' ? 'शुभ योग' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ योग' : 'Inauspicious'),
      badgeColor: hDate?.yoga?.type === 'Shubh' 
        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
        : 'bg-rose-100/70 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455'
    },
    {
      title: getTranslation(language, 'karana'),
      fullName: language === 'Hindi' ? translateKaranaHindi(hDate?.karana?.name || '') : (hDate?.karana?.name || ''),
      engName: hDate?.karana?.name || '',
      endTime: hDate?.karana?.endTime || '',
      lord: language === 'Hindi' 
        ? (hDate?.karana?.natureHindi || (hDate?.karana?.type === 'Fixed' ? 'स्थिर' : 'चर'))
        : (hDate?.karana?.nature || hDate?.karana?.type || ''),
      deity: hDate?.karana?.classification === 'Shubh' ? (language === 'Hindi' ? 'शुभ' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ' : 'Inauspicious'),
      description: language === 'Hindi'
        ? (hDate.karana.description || 'एक तिथि का आधा हिस्सा, चंद्र चक्र में एक महत्वपूर्ण घटना का संकेत देता है।')
        : 'Half of a Tithi, indicating a critical phase in the lunar cycle.',
      badgeText: (hDate.karana1 || hDate.karana)?.classification === 'Shubh' 
        ? (language === 'Hindi' ? 'शुभ करण' : 'Auspicious') 
        : (language === 'Hindi' ? 'विष्टि (भद्रा - वर्जित)' : 'Inauspicious'),
      badgeColor: (hDate.karana1 || hDate.karana)?.classification === 'Shubh' 
        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
        : 'bg-rose-100/70 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455'
    }
  ];

  return (
    <div id="panchang_screen_root" className="space-y-4 sm:space-y-6">
      
      {/* 📅 TOP DATE SELECTOR CARD (1-TAP DAY NAVIGATION) */}
      <div className="glass-card-light dark:glass-card-dark p-3 sm:p-4 border !border-[#FF9933]/50 dark:!border-[#FF9933]/35 rounded-3xl shadow-xs text-center">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
              onDateChange(prev);
            }}
            className="py-1.5 px-2.5 sm:px-3 rounded-xl border border-orange-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 hover:bg-orange-50 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>{language === 'Hindi' ? 'पिछला दिन' : 'Prev'}</span>
          </button>

          <div className="relative cursor-pointer group flex-1 max-w-[260px] mx-1">
            <div className="py-1.5 px-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-300/70 dark:border-amber-500/30 flex items-center justify-center gap-2 shadow-inner">
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="text-[12.5px] sm:text-[14px] font-bold text-slate-850 dark:text-amber-100 font-serif truncate">
                {getFormattedHeaderDate(selectedDate, language)}
              </span>
            </div>
            <input
              type="date"
              value={(() => {
                const validDate = (selectedDate && !isNaN(selectedDate.getTime())) ? selectedDate : new Date();
                const year = validDate.getFullYear();
                const month = String(validDate.getMonth() + 1).padStart(2, '0');
                const day = String(validDate.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              })()}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 1000 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                    const parsed = new Date(y, m - 1, d);
                    if (!isNaN(parsed.getTime())) {
                      onDateChange(parsed);
                    }
                  }
                }
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              title={language === 'Hindi' ? 'तिथि बदलें (कैलेंडर)' : 'Change Date'}
            />
          </div>

          <button
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 1);
              onDateChange(next);
            }}
            className="py-1.5 px-2.5 sm:px-3 rounded-xl border border-orange-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 hover:bg-orange-50 dark:hover:bg-zinc-800 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
          >
            <span>{language === 'Hindi' ? 'अगला दिन' : 'Next'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
          </button>
        </div>

        {/* Go to Today Button */}
        {(() => {
          const today = new Date();
          const d = (selectedDate && !isNaN(selectedDate.getTime())) ? selectedDate : new Date();
          const isToday = today.getFullYear() === d.getFullYear() &&
                          today.getMonth() === d.getMonth() &&
                          today.getDate() === d.getDate();
          if (!isToday) {
            return (
              <div className="mt-2 pt-1.5 border-t border-orange-100/50 dark:border-zinc-800/50 flex justify-center">
                <button
                  onClick={() => onDateChange(new Date())}
                  className="py-0.5 px-3 rounded-full bg-orange-500/15 hover:bg-orange-500/25 text-orange-700 dark:text-orange-400 border border-orange-300/50 dark:border-orange-900/50 text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>🔄</span> {language === 'Hindi' ? 'आज पर जाएं (Today)' : 'Go to Today'}
                </button>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Quick Section Navigation Bar */}
      <div className="glass-card-light dark:glass-card-dark p-2.5 sm:p-3 text-left shadow-xs border !border-[#FF9933]/50 dark:!border-[#FF9933]/35 rounded-3xl">
        <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block mb-1.5 leading-none text-center">
          {language === 'Hindi' ? "॥ त्वरित नेविगेशन ॥" : "|| Quick Navigation ||"}
        </span>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {[
            { id: 'panchang_main_card', labelHindi: 'पंचांग मुख्य अंग', labelEng: 'Panchang Main' },
            { id: 'muhurat_time_cycles_card', labelHindi: 'शुभ-अशुभ मुहूर्त', labelEng: 'Muhurat Cycles' },
            { id: 'anushthan_card', labelHindi: 'अग्नि व शिव वास', labelEng: 'Ritual Guidelines' },
            { id: 'action:hora_modal', labelHindi: 'लाइव होरा सारिणी', labelEng: 'Live Hora Chart' },
            { id: 'action:choghadiya_modal', labelHindi: 'चौघड़िया तालिका', labelEng: 'Choghadiya Table' },
            { id: 'navagraha_positions_card', labelHindi: 'ग्रह स्पष्ट डिग्री', labelEng: 'Navagraha Longitude' },
            { id: 'grah_gochar_phal_card', labelHindi: 'ग्रह गोचर व फल', labelEng: 'Planet Transits' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'action:hora_modal') {
                  setShowHoraModal(true);
                } else if (item.id === 'action:choghadiya_modal') {
                  setShowChoghadiyaModal(true);
                } else {
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className="py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl text-[11px] sm:text-[11.5px] font-bold border transition-all cursor-pointer bg-white/70 hover:bg-orange-50/50 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border-orange-100/60 dark:border-zinc-800/60 text-slate-750 dark:text-slate-350 hover:border-orange-300 shadow-3xs"
            >
              {language === 'Hindi' ? item.labelHindi : item.labelEng}
            </button>
          ))}
        </div>
      </div>

      {/* COMPACT & INTEGRATED SINGLE PANCHANG CARD */}
      <div id="panchang_main_card" className="glass-card-light dark:glass-card-dark p-3.5 sm:p-5 text-left space-y-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl">
        
        {/* Header section */}
        <div className="pb-2 border-b border-orange-100/60 dark:border-zinc-800/80 text-center sm:text-left">
          <span className="text-[12px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
            {language === 'Hindi' ? "॥ संपूर्ण विवरण ॥" : "|| Detailed Breakdown ||"}
          </span>
          <h2 className="text-[18px] sm:text-[20px] font-bold font-serif text-slate-800 dark:text-amber-100 mt-0.5">
            {language === 'Hindi' ? "वैदिक पंचांग संपूर्ण गणना" : "Vedic Panchang Complete Calculations"}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'Hindi' 
              ? "सूर्योदय, सूर्यास्त, तिथि, नक्षत्र, योग, करण और संवत् का शास्त्रीय संयोजन।" 
              : "Classical combination of sunrise, sunset, tithi, nakshatra, yoga, karana, and samvat."}
          </p>
        </div>

        {/* A. Astronomical Timings Section */}
        <div>
          <h4 className="text-[11.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 font-mono">
            {language === 'Hindi' ? "🌅 सूर्य और चन्द्रोदय समय" : "🌅 Astronomical Timings"}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {solarLunarTrio.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white/40 dark:bg-white/2 backdrop-blur-xs p-2.5 sm:p-3 rounded-2xl border border-orange-100/60 dark:border-white/5 hover:border-orange-500/20 shadow-xs transition-all duration-300 flex items-center gap-2.5 text-left"
              >
                <div className="p-1.5 sm:p-2 rounded-xl bg-orange-100/50 dark:bg-orange-950/30 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-mono uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-orange-100 font-mono mt-0.5 block">{item.val}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B. Core Panchang Attributes Grid (Tithi, Nakshatra, Yoga, Karana) */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800/80">
          <h4 className="text-[11.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5 font-mono">
            {language === 'Hindi' ? "🕉️ मुख्य पंचांग अंग" : "🕉️ Five Essential Elements"}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {mainPanchangElements.map((elem, idx) => {
              let gridClass = "";
              if (idx === 0) gridClass = "md:col-span-2 md:row-span-2"; // Tithi
              else if (idx === 1) gridClass = "md:col-span-2"; // Nakshatra
              else if (idx === 2) gridClass = "md:col-span-1"; // Yoga
              else if (idx === 3) gridClass = "md:col-span-1"; // Karana

              if (idx === 3) {
                const k1 = hDate.karana1 || hDate.karana;
                const k2 = hDate.karana2;

                const k1Info = k1 ? getKaranaLordAndDeity(k1.name || '', language) : null;
                const k2Info = k2 ? getKaranaLordAndDeity(k2.name || '', language) : null;

                return (
                  <div 
                    key={idx} 
                    className={`${gridClass} bg-white/50 dark:bg-[#120B08]/40 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-orange-100/70 dark:border-white/5 hover:border-orange-500/30 shadow-xs transition-all duration-300 flex flex-col justify-between text-left`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[14px] font-black text-orange-600 dark:text-orange-400 font-serif">{elem.title}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${elem.badgeColor} font-mono shadow-3xs`}>
                          {elem.badgeText}
                        </span>
                      </div>
                      
                      {/* Prathama Karana */}
                      {k1 && (
                        <div className="mt-2.5 pb-2.5 border-b border-slate-200/50 dark:border-zinc-800/30">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-sans block">
                            {language === 'Hindi' ? "प्रथम करण" : "First Karana"}
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-amber-100 mt-0.5 flex items-center gap-1.5 leading-tight font-serif">
                            <Feather className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                            {language === 'Hindi' ? translateKaranaHindi(k1.name) : k1.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md text-[10.5px] text-slate-600 dark:text-slate-400 font-mono">
                              <span>{language === 'Hindi' ? "समाप्ति:" : "Ends:"}</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatKaranaEndTime(k1.endTime, language)}</strong>
                            </div>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.25 rounded border font-mono ${
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
                      )}

                      {/* Dwitiya Karana */}
                      {k2 && (
                        <div className="mt-2.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-sans block">
                            {language === 'Hindi' ? "द्वितीय करण" : "Second Karana"}
                          </span>
                          <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-amber-100 mt-0.5 flex items-center gap-1.5 leading-tight font-serif">
                            <Feather className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                            {language === 'Hindi' ? translateKaranaHindi(k2.name) : k2.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md text-[10.5px] text-slate-600 dark:text-slate-400 font-mono">
                              <span>{language === 'Hindi' ? "समाप्ति:" : "Ends:"}</span>
                              <strong className="text-slate-800 dark:text-slate-200 font-bold">{formatKaranaEndTime(k2.endTime, language)}</strong>
                            </div>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.25 rounded border font-mono ${
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
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-zinc-800/30 text-[11px]">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-sans">{language === 'Hindi' ? "प्रथम स्वामी" : "1st Lord"}</span>
                        <span className="font-bold text-slate-800 dark:text-amber-200 block mt-0.5 truncate">{k1Info?.lord || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-sans">{language === 'Hindi' ? "द्वितीय स्वामी" : "2nd Lord"}</span>
                        <span className="font-bold text-slate-800 dark:text-amber-200 block mt-0.5 truncate">{k2Info ? k2Info.lord : '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-sans">{language === 'Hindi' ? "प्रथम देवता" : "1st Deity"}</span>
                        <span className="font-bold text-slate-800 dark:text-amber-200 block mt-0.5 truncate">{k1Info?.deity || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-sans">{language === 'Hindi' ? "द्वितीय देवता" : "2nd Deity"}</span>
                        <span className="font-bold text-slate-800 dark:text-amber-200 block mt-0.5 truncate">{k2Info ? k2Info.deity : '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={idx} 
                  className={`${gridClass} bg-white/50 dark:bg-[#120B08]/40 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-orange-100/70 dark:border-white/5 hover:border-orange-500/30 shadow-xs transition-all duration-300 flex flex-col justify-between text-left`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] font-black text-orange-600 dark:text-orange-400 font-serif">{elem.title}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${elem.badgeColor} font-mono shadow-3xs`}>
                        {elem.badgeText}
                      </span>
                    </div>
                    
                    <h3 className="text-[17px] sm:text-[19px] font-black text-slate-800 dark:text-amber-100 mt-1.5 flex items-center gap-1.5 leading-tight font-serif">
                      <Feather className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                      {elem.fullName}
                    </h3>
                    
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md inline-flex text-[10.5px] text-slate-600 dark:text-slate-400 mt-1.5 font-mono">
                      <span>{language === 'Hindi' ? "समाप्ति:" : "Ends:"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{elem.endTime}</strong>
                    </div>

                    <p className="text-[12.5px] sm:text-[13px] text-slate-600 dark:text-slate-350 font-sans mt-2.5 leading-relaxed">
                      {elem.description}
                    </p>

                    {elem.title === getTranslation(language, 'tithi') && hDate.tithi.percentPassed !== undefined && (
                      <div className="w-full relative h-[95px] flex flex-col items-center justify-end mt-2.5 bg-white/30 dark:bg-white/2 rounded-xl p-2 border border-orange-100/50 dark:border-white/5">
                        <div className="absolute top-1.5 w-full px-3.5 flex justify-between text-[8.5px] font-mono font-semibold text-slate-500">
                          <div className="text-left leading-tight">{language === 'Hindi' ? "आरंभ" : "Starts"}<br/><span className="text-slate-800 dark:text-slate-300 font-bold">{hDate.tithi.startTime}</span></div>
                          <div className="text-right leading-tight">{language === 'Hindi' ? "समाप्ति" : "Ends"}<br/><span className="text-slate-800 dark:text-slate-300 font-bold">{hDate.tithi.endTime}</span></div>
                        </div>
                        <div className="h-[40px] min-h-[40px] w-full min-w-0 -mb-1 mt-3">
                          <ResponsiveContainer width="99%" height={40} minWidth={100} minHeight={40} initialDimension={{ width: 100, height: 40 }}>
                            <PieChart>
                              <Pie
                                data={tithiData}
                                cx="50%"
                                cy="100%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={28}
                                outerRadius={36}
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
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center pointer-events-none flex flex-col items-center justify-center">
                          <span className="text-[13px] font-black text-orange-600 dark:text-orange-400 font-mono leading-none tracking-tight">{Math.round(passedPct)}%</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-sans font-bold uppercase tracking-wider">{language === 'Hindi' ? "पूर्ण" : "Completed"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta properties */}
                  <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px]">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-sans">{language === 'Hindi' ? "स्वामी / शासक" : "Ruler / Lord"}</span>
                      <span className="font-bold text-slate-800 dark:text-amber-200 block mt-0.5 truncate">{elem.lord}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block font-sans">{language === 'Hindi' ? "देवता / आशीर्वाद" : "Deity / Blessing"}</span>
                      <span className="font-bold text-slate-800 dark:text-amber-200 block mt-0.5 truncate">{elem.deity}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. Samvat Timeline Row + Ishtakala */}
        <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex flex-col gap-3 text-left bg-white/40 dark:bg-[#120B08]/30 p-3.5 rounded-2xl border border-orange-100/60 dark:border-white/5">
            <div className="flex items-center gap-3 w-full">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xs text-white shadow-3xs shrink-0 font-sans">
                VS
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-amber-100 font-serif">{language === 'Hindi' ? "संवत् व कालमान विवरण" : "Samvat Calendar & Time Metrics"}</h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">{language === 'Hindi' ? "वैदिक संवत्सर और सूर्योदय से व्यतीत पारम्परिक घटी-विघटी।" : "Traditional Vedic calendar years and elapsed ghati-vighati."}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              <div className="p-2 px-3 rounded-xl bg-white/60 dark:bg-black/20 border border-orange-100/60 dark:border-white/5 text-center min-w-[90px]">
                <span className="text-[11px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "विक्रम संवत्" : "Vikram Samvat"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-base sm:text-lg block mt-0.5 font-mono">{hDate.samvatVikram}</span>
              </div>
              <div className="p-2 px-3 rounded-xl bg-white/60 dark:bg-black/20 border border-orange-100/60 dark:border-white/5 text-center min-w-[90px]">
                <span className="text-[11px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "शक संवत्" : "Shaka Samvat"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-base sm:text-lg block mt-0.5 font-mono">{hDate.samvatShaka}</span>
              </div>
              <div className="p-2 px-3 rounded-xl bg-white/60 dark:bg-black/20 border border-orange-100/60 dark:border-white/5 text-center min-w-[90px]">
                <span className="text-[11px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "गुजरात संवत्" : "Gujarati Samvat"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-base sm:text-lg block mt-0.5 font-mono">{hDate.samvatGujarati || hDate.samvatVikram - 1}</span>
              </div>
              <div className="p-2 px-3 rounded-xl bg-white/60 dark:bg-black/20 border border-orange-100/60 dark:border-white/5 text-center min-w-[90px]">
                <span className="text-[11px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">{language === 'Hindi' ? "इष्टकाल" : "Ishtakala"}</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-sm sm:text-base block mt-0.5 font-mono">{panchang.ishtakala?.formatted || '—'}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-sans">{language === 'Hindi' ? "घटी-विघटी" : "Ghati-Vighati"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PHASE 12: DETAILED ASTROLOGICAL ATTRIBUTES CARD */}
      <div id="astro_attributes_card" className="glass-card-light dark:glass-card-dark p-3.5 sm:p-5 text-left space-y-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30">
        <div className="space-y-0.5 pb-2 border-b border-orange-100/60 dark:border-zinc-800/80 text-center">
          <span className="text-[12px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block text-center">{language === 'Hindi' ? "॥ अयन, ऋतु, पाया व नक्षत्र विशेष ॥" : "|| Ayana, Ritu, Paya & Nakshatra ||"}</span>
          <h2 className="text-[17px] sm:text-[19px] font-bold font-serif text-slate-800 dark:text-amber-100 text-center">{language === 'Hindi' ? "सूक्ष्म ज्योतिषीय विवरण" : "Detailed Astrological Attributes"}</h2>
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400 text-center">
            {language === 'Hindi' ? "चन्द्र नक्षत्र के स्वामी, देवता, चरण, ऋतु और पाया का विस्तृत खगोलीय फलादेश।" : "Detailed astronomical reading of Moon Nakshatra, ruling deity, pada, season, and paya."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Card 1: अयन व नक्षत्र पाया */}
          <div className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <div>
              <span className="text-[13px] font-extrabold text-orange-600 dark:text-orange-400 font-serif block">{language === 'Hindi' ? "अयन व पाया" : "Ayana & Paya"}</span>
              
              {/* Ayana Badge */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-slate-400 text-[11px] font-mono">{language === 'Hindi' ? "अयन:" : "Ayana:"}</span>
                {hDate.ayana && (
                  <span className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
                    hDate.ayana === 'Uttarayana'
                      ? 'bg-amber-100 dark:bg-amber-950/45 border-amber-300 text-amber-800 dark:text-amber-350'
                      : 'bg-indigo-100 dark:bg-indigo-950/45 border-indigo-300 text-indigo-850 dark:text-indigo-350'
                  } font-sans uppercase tracking-wider flex items-center gap-1 shadow-3xs`}>
                    {hDate.ayana === 'Uttarayana' ? (language === 'Hindi' ? '🌞 उत्तरायण' : '🌞 Uttarayana') : (language === 'Hindi' ? '🌙 दक्षिणायन' : '🌙 Dakshinayana')}
                  </span>
                )}
              </div>

              {/* Paya Detail */}
              {panchang.paya && panchang.paya.name && (
                <div className="mt-3 pt-2.5 border-t border-slate-100/50 dark:border-slate-800/40">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px] font-mono">{language === 'Hindi' ? "नक्षत्र पाया:" : "Nakshatra Paya:"}</span>
                    <span className={`text-[13px] font-black px-2.5 py-0.5 rounded-md border font-serif ${
                      panchang.paya.name === 'Gold' ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                      panchang.paya.name === 'Silver' ? 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-900/30 dark:text-slate-355' :
                      panchang.paya.name === 'Copper' ? 'bg-orange-100 border-orange-350 text-orange-850 dark:bg-orange-950/30 dark:text-orange-400' :
                      'bg-zinc-150 border-zinc-300 text-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-400'
                    }`}>
                      {language === 'Hindi' ? panchang.paya.hindiName : `${panchang.paya.name} Paya`}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-550 dark:text-slate-400 font-sans mt-1.5 leading-relaxed">
                    {language === 'Hindi' ? translatePayaDescriptionHindi(panchang.paya.name) : panchang.paya.description}
                  </p>
                </div>
              )}
              {/* Surya Nakshatra Detail */}
              {panchang.suryaNakshatra && panchang.suryaNakshatra.name && (
                <div className="mt-3 pt-2.5 border-t border-slate-100/50 dark:border-slate-800/40">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px] font-mono">{language === 'Hindi' ? "सूर्य नक्षत्र:" : "Surya Nakshatra:"}</span>
                    <span className="text-[13px] font-black text-amber-600 dark:text-amber-400 font-serif">
                      {language === 'Hindi' ? `${panchang.suryaNakshatra.hindiName} (चरण ${panchang.suryaNakshatra.pada})` : `${panchang.suryaNakshatra.name} (Pada ${panchang.suryaNakshatra.pada})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>{language === 'Hindi' ? `स्वामी: ${translateLordHindi(panchang.suryaNakshatra.lord)}` : `Lord: ${panchang.suryaNakshatra.lord}`}</span>
                    <span>{language === 'Hindi' ? `देवता: ${translateDeityHindi(panchang.suryaNakshatra.deity)}` : `Deity: ${panchang.suryaNakshatra.deity}`}</span>
                  </div>
                </div>
              )}

              {/* Surya Rashi Detail */}
              <div className="mt-3 pt-2.5 border-t border-slate-100/50 dark:border-slate-800/40">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "सूर्य राशि:" : "Sun Sign:"}</span>
                  <span className="font-bold text-orange-655 dark:text-orange-400 font-serif text-[13px]">
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
              <div className="mt-3 pt-2.5 border-t border-slate-100/50 dark:border-slate-800/40 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "सौर मास:" : "Solar Month:"}</span>
                  <span className="font-bold text-slate-700 dark:text-amber-255 font-serif text-[12.5px]">
                    {language === 'Hindi' ? translateSolarMonthHindi(hDate.solarMonth || '') : (hDate.solarMonth || 'N/A')}
                  </span>
                </div>
                {hDate.isLeapMonth !== undefined && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-mono">{language === 'Hindi' ? "अधिमास स्थिति:" : "Adhimasa Status:"}</span>
                    <span className={`text-[10.5px] font-black px-2 py-0.5 rounded border ${
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
          <div className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <div>
              <span className="text-[13px] font-extrabold text-orange-600 dark:text-orange-400 font-serif block">{language === 'Hindi' ? "चन्द्र नक्षत्र सूक्ष्म विवरण" : "Chandra Nakshatra Details"}</span>
              
              <div className="mt-2.5 space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र स्वामी:" : "Ruler Planet:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-serif text-[12.5px]">{language === 'Hindi' ? translateLordHindi(hDate.nakshatra.lord || 'N/A') : (hDate.nakshatra.lord || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र देवता:" : "Nakshatra Deity:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-serif text-[12.5px]">{language === 'Hindi' ? translateDeityHindi(hDate.nakshatra.deity || 'N/A') : (hDate.nakshatra.deity || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र प्रतीक:" : "Nakshatra Symbol:"}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-serif text-[12.5px]">{language === 'Hindi' ? translateSymbolHindi(hDate.nakshatra.symbol || 'N/A') : (hDate.nakshatra.symbol || 'N/A')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                  <span className="text-slate-400 font-mono">{language === 'Hindi' ? "नक्षत्र चरण:" : "Nakshatra Pada:"}</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 font-mono text-[12.5px]">{language === 'Hindi' ? `चरण ${hDate.nakshatra.pada || 1}` : `Pada ${hDate.nakshatra.pada || 1}`}</span>
                </div>
                {hDate.nakshatra.gana && (
                  <div className="grid grid-cols-3 gap-1 pt-1.5 text-[11px] text-center">
                    <div className="bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-200/30">
                      <span className="text-slate-400 block font-mono text-[9.5px]">{language === 'Hindi' ? "गण" : "Gana"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-serif text-[12px]">{language === 'Hindi' ? translateGanaHindi(hDate.nakshatra.gana) : hDate.nakshatra.gana}</strong>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-200/30">
                      <span className="text-slate-400 block font-mono text-[9.5px]">{language === 'Hindi' ? "योनि" : "Yoni"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-serif text-[12px]">{language === 'Hindi' ? translateYoniHindi(hDate.nakshatra.yoni) : hDate.nakshatra.yoni}</strong>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/40 p-1 rounded-md border border-slate-200/30">
                      <span className="text-slate-400 block font-mono text-[9.5px]">{language === 'Hindi' ? "नाड़ी" : "Nadi"}</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-serif text-[12px]">{language === 'Hindi' ? translateNadiHindi(hDate.nakshatra.nadi) : hDate.nakshatra.nadi}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: ऋतु चक्र */}
          <div className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]">
            <div>
              <span className="text-[13px] font-extrabold text-orange-600 dark:text-orange-400 font-serif block">{language === 'Hindi' ? "ऋतु चक्र विवरण" : "Vedic Seasons"}</span>
              
              {panchang.rituDetails && (
                <div className="mt-2.5 space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                    <span className="text-slate-400 font-mono">{language === 'Hindi' ? "सौर ऋतु:" : "Solar Season:"}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-serif text-[12.5px]">{language === 'Hindi' ? panchang.rituDetails.solarRituHindi : panchang.rituDetails.solarRitu}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100/40 dark:border-slate-800/20">
                    <span className="text-slate-400 font-mono">{language === 'Hindi' ? "चन्द्र ऋतु:" : "Lunar Season:"}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-serif text-[12.5px]">{language === 'Hindi' ? panchang.rituDetails.lunarRituHindi : panchang.rituDetails.lunarRitu}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-550 dark:text-slate-400 font-sans mt-1.5 leading-relaxed">
                    {language === 'Hindi' 
                      ? (panchang.rituDetails.solarRituHindi ? (
                          panchang.rituDetails.solarRituHindi === 'वसन्त' ? 'वसन्त ऋतु वसंत काल का प्रतिनिधित्व करती है, जो खिले हुए फूलों और सुहावने मौसम से पहचानी जाती है। नए कार्यों और उत्सवों के लिए यह काल शुभ है।' :
                          panchang.rituDetails.solarRituHindi === 'ग्रीष्म' ? 'ग्रीष्म ऋतु गर्मी के मौसम का प्रतिनिधित्व करती है, जो तीव्र धूप और लंबे दिनों से पहचानी जाती है। सूर्य और मंगल इसके स्वामी हैं।' :
                          panchang.rituDetails.solarRituHindi === 'वर्षा' ? 'वर्षा ऋतु मानसून काल का प्रतिनिधित्व करती है, जो हरियाली और बादलों के बरसने से पहचानी जाती है। यह काल नवजीवन और कृषि के लिए अत्यंत महत्वपूर्ण है।' :
                          panchang.rituDetails.solarRituHindi === 'शरद' ? 'शरद ऋतु शरद काल का प्रतिनिधित्व करती है, जो स्वच्छ आकाश और सुखद रातों के लिए जानी जाती है। चन्द्रमा इसके अधिपति हैं।' :
                          panchang.rituDetails.solarRituHindi === 'हेमन्त' ? 'हेमन्त ऋतु शुरुआती सर्दियों का प्रतिनिधित्व करती है, जिसमें मौसम शीतल और स्वास्थ्यवर्धक होने लगता है।' :
                          'शिशिर ऋतु कड़ाके की सर्दियों का प्रतिनिधित्व करती है, जो घने कोहरे और ओस की बूंदों के लिए जानी जाती है। ध्यान और तप के लिए यह उत्तम है।'
                        ) : panchang.rituDetails.description)
                      : panchang.rituDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 PHASE 11: DAILY ANUSHTHAN & PUJA CARD (AGNI VAAS & SHIVA VAAS) */}
      <div id="anushthan_card" className="glass-card-light dark:glass-card-dark p-3.5 sm:p-5 text-left space-y-3 shadow-xs border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl mt-4">
        <div className="space-y-0.5 pb-2 border-b border-orange-100/60 dark:border-zinc-800/80 text-center">
          <span className="text-[12px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block text-center">
            {language === 'Hindi' ? "॥ दैनिक अनुष्ठान व साधना विचार ॥" : "|| Daily Ritual & Worship Guidelines ||"}
          </span>
          <h2 className="text-[17px] sm:text-[19px] font-bold font-serif text-slate-800 dark:text-amber-100 text-center">
            {language === 'Hindi' ? "अग्नि वास एवं शिव वास विचार" : "Agni Vaas & Shiva Vaas"}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 text-center">
            {language === 'Hindi'
              ? "हवन, यज्ञ, एवं भगवान शिव के रुद्राभिषेक अनुष्ठान हेतु शास्त्रीय स्थिति।"
              : "Vedic guidelines for performing havan, yagya, and Shiva Rudrabhishek rituals."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Agni Vaas Card */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            panchang.agniVaas?.isAuspicious
              ? 'bg-emerald-500/5 border-emerald-500/25 dark:border-emerald-500/20'
              : 'bg-rose-500/5 border-rose-500/25 dark:border-rose-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-black text-slate-800 dark:text-amber-100 font-serif flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                {language === 'Hindi' ? "अग्नि वास (हवन/यज्ञ विचार)" : "Agni Vaas (Havan Timing)"}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border font-mono ${
                panchang.agniVaas?.isAuspicious
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455 border-rose-300'
              }`}>
                {panchang.agniVaas?.isAuspicious
                  ? (language === 'Hindi' ? "✨ शुभ (फलदायी)" : "Favorable")
                  : (language === 'Hindi' ? "⚠️ वर्जित (टालें)" : "Avoid")}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-sans">{language === 'Hindi' ? "वास स्थान:" : "Residence:"}</span>
              <span className="text-[16px] font-black text-slate-900 dark:text-amber-200 font-serif">
                {language === 'Hindi' ? `${panchang.agniVaas?.residenceHindi || 'पृथ्वी'} पर` : panchang.agniVaas?.residence}
              </span>
            </div>
            <p className="text-[12px] text-slate-650 dark:text-slate-350 mt-1.5 leading-relaxed font-sans">
              {language === 'Hindi'
                ? (panchang.agniVaas?.isAuspicious 
                    ? "आज अग्नि का वास पृथ्वी पर है। हवन व यज्ञ अनुष्ठान करने से मनोवांछित फल व सुख-समृद्धि की प्राप्ति होगी।" 
                    : "आज अग्नि का वास आकाश/पाताल में है। नित्य अग्निहोत्र को छोड़कर काम्य हवन करने से विघ्न हो सकता है।")
                : (panchang.agniVaas?.description || (panchang.agniVaas?.isAuspicious 
                    ? "Agni resides on Earth today. Highly auspicious for performing havan and yagya rituals." 
                    : "Agni does not reside on Earth today. Avoid special havan ceremonies."))}
            </p>
          </div>

          {/* Shiva Vaas Card */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            panchang.shivaVaas?.isAuspicious
              ? 'bg-emerald-500/5 border-emerald-500/25 dark:border-emerald-500/20'
              : 'bg-rose-500/5 border-rose-500/25 dark:border-rose-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-black text-slate-800 dark:text-amber-100 font-serif flex items-center gap-1.5">
                🔱 {language === 'Hindi' ? "शिव वास (रुद्राभिषेक विचार)" : "Shiva Vaas (Rudrabhishek Timing)"}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border font-mono ${
                panchang.shivaVaas?.isAuspicious
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455 border-rose-300'
              }`}>
                {panchang.shivaVaas?.isAuspicious
                  ? (language === 'Hindi' ? "✨ शुभ (अभिषेक करें)" : "Favorable")
                  : (language === 'Hindi' ? "⚠️ वर्जित (अभिषेक टालें)" : "Avoid")}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-sans">{language === 'Hindi' ? "वास स्थान:" : "Residence:"}</span>
              <span className="text-[16px] font-black text-slate-900 dark:text-amber-200 font-serif">
                {language === 'Hindi' ? panchang.shivaVaas?.residenceHindi : panchang.shivaVaas?.residence}
              </span>
            </div>
            <p className="text-[12px] text-slate-650 dark:text-slate-350 mt-1.5 leading-relaxed font-sans">
              {language === 'Hindi'
                ? (panchang.shivaVaas?.isAuspicious
                    ? "भगवान शिव आज अनुकूल स्थिति में विराजमान हैं। आज रुद्राभिषेक, महामृत्युंजय जप व शिव पूजन सर्वकार्य सिद्धि देगा।"
                    : "आज शिव वास अनुकूल नहीं है। रुद्राभिषेक अनुष्ठान टालें, सामान्य दैनिक शिव स्तुति व ॐ नमः शिवाय जप श्रेयस्कर है।")
                : (panchang.shivaVaas?.description || (panchang.shivaVaas?.isAuspicious
                    ? "Lord Shiva resides favorably today. Excellent for Rudrabhishek and Shiva Pooja."
                    : "Shiva Vaas is unfavorable today. Avoid special Rudrabhishek rituals."))}
            </p>
          </div>
        </div>
      </div>

      {/* DAILY MUHURAT & TIME CYCLES CARD */}
      <div id="muhurat_time_cycles_card" className="glass-card-light dark:glass-card-dark p-3.5 sm:p-5 text-left space-y-4 shadow-xs border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl mt-4">
        <div className="space-y-0.5 pb-2 border-b border-orange-100/60 dark:border-zinc-800/80 text-center">
          <span className="text-[12px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block text-center">
            {language === 'Hindi' ? "॥ शुभ-अशुभ काल चक्र ॥" : "|| Auspicious & Inauspicious Muhuratas ||"}
          </span>
          <h2 className="text-[17px] sm:text-[19px] font-bold font-serif text-slate-800 dark:text-amber-100 text-center">
            {language === 'Hindi' ? "दैनिक समय चक्र और विशिष्ट मुहूर्त" : "Daily Time Cycles & Key Muhuratas"}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 text-center">
            {language === 'Hindi' ? "दैनिक पंचांग के प्रमुख शुभ मुहूर्त एवं अशुभ (वर्जित) काल खंडों की समयावधि।" : "Time duration of key auspicious muhuratas and taboo (avoid) intervals in the daily panchang."}
          </p>
        </div>

        {/* 1. Shubh Muhurats Group */}
        <div>
          <h4 className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {language === 'Hindi' ? "🟢 शुभ मुहूर्त (मांगलिक कार्यों हेतु)" : "🟢 Auspicious Timings"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(() => {
              const allMuhurats = getMuhuratsForPanchang(panchang);
              const abhijitM = allMuhurats.find(x => x.id === 'abhijit');
              const brahmaM = allMuhurats.find(x => x.id === 'brahma');
              const godhuliM = allMuhurats.find(x => x.id === 'godhuli');
              const amritK = getAmritKaal(panchang);

              const shubhList = [
                {
                  title: language === 'Hindi' ? "अभिजित मुहूर्त" : "Abhijit Muhurta",
                  badge: language === 'Hindi' ? "अति शुभ" : "Shubh",
                  time: abhijitM ? `${abhijitM.startTime} - ${abhijitM.endTime}` : '—',
                  desc: language === 'Hindi' ? "दिन का सर्वश्रेष्ठ समय, सभी शुभ कार्यों के लिए उत्तम।" : "Best time of the day, highly favorable for all auspicious initiations."
                },
                {
                  title: language === 'Hindi' ? "अमृत काल" : "Amrit Kaal",
                  badge: language === 'Hindi' ? "अमृतमय" : "Amrit",
                  time: amritK ? `${amritK.start} - ${amritK.end}` : '—',
                  desc: language === 'Hindi' ? "पवित्र एवं देव ऊर्जा काल, धार्मिक व मांगलिक कार्यों हेतु उत्तम।" : "Sacred celestial timing, excellent for spiritual and holy ceremonies."
                },
                {
                  title: language === 'Hindi' ? "ब्रह्म मुहूर्त" : "Brahma Muhurat",
                  badge: language === 'Hindi' ? "पावन" : "Divine",
                  time: brahmaM ? `${brahmaM.startTime} - ${brahmaM.endTime}` : '—',
                  desc: language === 'Hindi' ? "सूर्योदय पूर्व का काल, योग, ध्यान व ईश वंदन हेतु सर्वोत्तम।" : "Pre-dawn divine hour, ideal for meditation and prayer."
                },
                {
                  title: language === 'Hindi' ? "गोधूलि मुहूर्त" : "Godhuli Muhurat",
                  badge: language === 'Hindi' ? "शुभ" : "Auspicious",
                  time: godhuliM ? `${godhuliM.startTime} - ${godhuliM.endTime}` : '—',
                  desc: language === 'Hindi' ? "संध्याकाल, शांति, गृह प्रवेश व देव आराधना हेतु कल्याणकारी।" : "Evening twilight period, favorable for peace and prayer."
                }
              ];

              return shubhList.map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13.5px] font-black text-emerald-700 dark:text-emerald-400 font-serif">
                        {m.title}
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-mono">
                        {m.badge}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[16px] sm:text-[17px] font-black text-slate-800 dark:text-amber-100 font-mono">
                      {m.time}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                    {m.desc}
                  </p>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* 2. Varjit Kaal Group */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60">
          <h4 className="text-[12px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            {language === 'Hindi' ? "🔴 वर्जित / अशुभ काल (नवीन कार्य टालें)" : "🔴 Inauspicious Timings"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Rahu Kaal */}
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[13.5px] font-black text-rose-600 dark:text-rose-455 font-serif">
                    {language === 'Hindi' ? "राहुकाल" : "Rahu Kaal"}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                    {language === 'Hindi' ? "वर्जित" : "Avoid"}
                  </span>
                </div>
                <div className="mt-1.5 text-[16px] sm:text-[17px] font-black text-slate-800 dark:text-amber-100 font-mono">
                  {panchang.rahuKaal ? `${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}` : '—'}
                </div>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                {language === 'Hindi' ? "राहु के प्रभाव का काल। इस समय नए कार्यों का आरंभ न करें।" : "Rahu's negative influence. Avoid starting important actions."}
              </p>
            </div>

            {/* Gulik Kaal */}
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[13.5px] font-black text-rose-600 dark:text-rose-455 font-serif">
                    {language === 'Hindi' ? "गुलिक काल" : "Gulik Kaal"}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                    {language === 'Hindi' ? "वर्जित" : "Avoid"}
                  </span>
                </div>
                <div className="mt-1.5 text-[16px] sm:text-[17px] font-black text-slate-800 dark:text-amber-100 font-mono">
                  {panchang.gulikKaal ? `${panchang.gulikKaal.start} - ${panchang.gulikKaal.end}` : '—'}
                </div>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                {language === 'Hindi' ? "शनि के पुत्र गुलिक का प्रभाव, कार्यों में बाधा व विलंब लाता है।" : "Saturn's son Gulik. Avoid new beginnings."}
              </p>
            </div>

            {/* Yamaganda */}
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[13.5px] font-black text-rose-600 dark:text-rose-455 font-serif">
                    {language === 'Hindi' ? "यमगण्ड" : "Yamaganda"}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                    {language === 'Hindi' ? "वर्जित" : "Avoid"}
                  </span>
                </div>
                <div className="mt-1.5 text-[16px] sm:text-[17px] font-black text-slate-800 dark:text-amber-100 font-mono">
                  {panchang.yamagandam ? `${panchang.yamagandam.start} - ${panchang.yamagandam.end}` : '—'}
                </div>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                {language === 'Hindi' ? "गुरु के पुत्र यमदेव का समय, यात्रा व वित्तीय लेनदेन टालें।" : "Jupiter's son Yamadeva's period. Avoid travels or major financial assets."}
              </p>
            </div>

            {/* Durmuhurta */}
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[13.5px] font-black text-rose-600 dark:text-rose-455 font-serif">
                    {language === 'Hindi' ? "दुर्मुहूर्त" : "Durmuhurta"}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.25 font-bold uppercase rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-mono">
                    {language === 'Hindi' ? "वर्जित" : "Avoid"}
                  </span>
                </div>
                <div className="mt-1.5 text-[15px] font-black text-slate-800 dark:text-amber-100 font-mono truncate">
                  {panchang.durmuhurat && panchang.durmuhurat.length > 0
                    ? panchang.durmuhurat.map(d => `${d.start} - ${d.end}`).join(', ')
                    : '—'}
                </div>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                {language === 'Hindi' ? "अशुद्ध आकाशीय मुहूर्त, इस काल में मांगलिक कार्य स्थगित रखें।" : "Inauspicious celestial timing. Postpone starting important ceremonies."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Active Live Hora Section Card */}
      {activeHora && (
        <div id="active_live_hora" className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 shadow-xs text-left relative overflow-hidden mt-3.5 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl">
          {/* Subtle design aura */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-36 h-36 bg-orange-500/8 dark:bg-orange-600/8 blur-2xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col items-center justify-center text-center gap-1 mb-2.5 pb-2 border-b border-orange-100/40 dark:border-zinc-800/60 w-full">
            <span className="text-[12px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center justify-center gap-1.5 leading-none mb-0.5 text-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {language === 'Hindi' ? "लाइव वैदिक होरा संसूचक" : "Live Vedic Hora Indicator"}
            </span>
            <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none text-center">
              {language === 'Hindi' ? "(अभी सक्रिय होरा)" : "(Current Active Hora)"}
            </h3>
          </div>

          {/* Active Hora Info Details */}
          <div className="flex flex-col md:flex-row gap-3.5 items-stretch justify-between">
            <div className="flex-grow space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[21px] sm:text-[25px] font-serif font-black text-slate-850 dark:text-orange-50 leading-tight">
                  {language === 'Hindi' ? `${activeHora.lordHindi} की होरा` : `${activeHora.lord}'s Hora`}
                </span>
                <span className={`text-[11px] sm:text-[12.5px] px-2.5 py-0.5 rounded-full font-black border ${activeHora.colorClass.split(' ').slice(2).join(' ')} shadow-3xs`}>
                  {language === 'Hindi' ? activeHora.qualityHindi : activeHora.quality}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-2xs sm:text-xs font-bold text-slate-500 dark:text-zinc-450 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'Hindi' ? `समय: ${activeHora.startTime} से ${activeHora.endTime} तक (वैदिक घंटा संख्या: ${activeHora.number})` : `Time: ${activeHora.startTime} to ${activeHora.endTime} (Vedic Hour: ${activeHora.number})`}</span>
              </div>

              {/* Suitable Tasks Box */}
              <div className="bg-orange-50/20 dark:bg-zinc-950/25 p-2.5 rounded-xl border border-orange-100/30 dark:border-zinc-900/40 mt-1">
                <span className="text-[10.5px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">
                  {language === 'Hindi' ? "अति उपयुक्त कार्य व फल:" : "Recommended Actions & Fruits:"}
                </span>
                <p className="text-[12px] sm:text-[13px] text-slate-650 dark:text-zinc-400 font-medium leading-relaxed">
                  {activeHora.benefits}
                </p>
              </div>
            </div>

            {/* Spiritual Guideline details */}
            <div className="md:w-72 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-zinc-950/20 dark:to-zinc-950/10 p-3 rounded-xl border border-slate-100 dark:border-zinc-900/40 flex flex-col justify-between text-left">
              <div className="space-y-1">
                <span className="text-[9.5px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block font-mono">
                  {language === 'Hindi' ? "वैदिक सुझाव व प्रभाव" : "Vedic Advice & Influence"}
                </span>
                <p className="text-[11.5px] sm:text-[12px] text-slate-600 dark:text-zinc-400 font-serif leading-relaxed italic">
                  {activeHora.quality === 'Inauspicious' 
                    ? (language === 'Hindi' ? '“यह होरा क्रूर स्वभाव की मानी जाती है। नए कार्य, बड़े निवेश या मांगलिक कर्म इस अवधि में वर्जित रखना हितकारी होगा।”' : '“This Hora is considered inauspicious. It is advisable to avoid starting new ventures, major investments, or auspicious ceremonies during this period.”')
                    : activeHora.quality === 'Auspicious'
                    ? (language === 'Hindi' ? '“यह अत्यंत शुभ और अमृतमय होरा है। इस काल में किए गए प्रयास प्रायः परम फलदायी और सफल सिद्ध होते हैं।”' : '“This is a highly auspicious and positive Hora. Efforts initiated during this time are generally fruitful and successful.”')
                    : (language === 'Hindi' ? '“यह एक संतुलित और मध्यम प्रभाव की होरा है। इसमें सामान्य दैनिक, व्यापारिक व नियमित कार्य आसानी से पूरे किए जा सकते हैं।”' : '“This is a balanced Hora with moderate influence. Routine daily tasks and business operations can be carried out smoothly.”')}
                </p>
              </div>
              
              <div className="mt-2.5 pt-2 border-t border-slate-200/40 dark:border-zinc-800/45 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  {language === 'Hindi' ? `प्रकार: ${activeHora.isDay ? '🌞 दिवा होरा' : '🌙 रात्रि होरा'}` : `Type: ${activeHora.isDay ? '🌞 Day Hora' : '🌙 Night Hora'}`}
                </span>
                <span className="text-[10.5px] font-extrabold text-orange-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => setShowHoraModal(true)}>
                  {language === 'Hindi' ? "पूर्ण सारिणी" : "Full Table"} <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anandadi Yoga Card */}
      {panchang.anandadiYoga && (
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl bg-amber-50/20 dark:bg-amber-950/5 mt-3.5 text-left shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1.5 pb-1 border-b border-amber-200/35 dark:border-amber-950/20 text-center">
            <span className="text-sm">🔮</span>
            <span className="text-[12px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest font-mono text-center">
              {language === 'Hindi' ? "आनन्दादि व दैनिक नक्षत्र योग" : "Anandadi & Daily Nakshatra Yoga"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "योग का नाम:" : "Yoga Name:"}</span>
              <span className="font-extrabold text-amber-800 dark:text-amber-300 block text-[15px] font-serif mt-0.5">
                {language === 'Hindi' ? panchang.anandadiYoga.nameHindi : panchang.anandadiYoga.name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "प्रकृति व स्थिति:" : "Nature & Status:"}</span>
              <span className={`font-black block text-[13px] mt-0.5 ${panchang.anandadiYoga.isAuspicious ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {panchang.anandadiYoga.isAuspicious ? (language === 'Hindi' ? '✨ शुभ फलदायी' : '✨ Auspicious') : (language === 'Hindi' ? '⚠️ ध्यान दें (अशुभ)' : '⚠️ Inauspicious')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-mono">🕒 {panchang.anandadiYoga.endTime} {language === 'Hindi' ? 'तक प्रभावी' : 'till'}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "वैदिक फलित:" : "Vedic Effect:"}</span>
              <span className="text-[12px] text-slate-650 dark:text-slate-300 leading-relaxed block font-sans mt-0.5">
                {language === 'Hindi'
                  ? translateAnandadiYogaDescHindi(panchang.anandadiYoga.name || panchang.anandadiYoga.nameHindi, panchang.anandadiYoga.description)
                  : panchang.anandadiYoga.description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bhadra (Vishti Karana) Engine details card */}
      {panchang.bhadra && panchang.bhadra.active ? (
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl bg-red-50/20 dark:bg-red-950/5 mt-3.5 text-left shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-2 pb-1 border-b border-red-200/35 dark:border-red-950/20 text-center">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="text-[12px] font-black text-red-650 dark:text-red-400 uppercase tracking-widest font-mono text-center">
              {language === 'Hindi' ? "भद्रा दोष चेतावनी" : "Bhadra Alert"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "भद्रा वास:" : "Bhadra Residence:"}</span>
              <span className="font-extrabold text-red-750 dark:text-red-400 block text-[13.5px] mt-0.5">{language === 'Hindi' ? panchang.bhadra.vasHindi : panchang.bhadra.vas}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "भद्रा समय:" : "Bhadra Duration:"}</span>
              <span className="font-extrabold text-slate-800 dark:text-orange-200 block text-[13.5px] font-mono mt-0.5">{language === 'Hindi' ? `${panchang.bhadra.startTime} से ${panchang.bhadra.endTime} तक` : `${panchang.bhadra.startTime} to ${panchang.bhadra.endTime}`}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "भद्रा मुख:" : "Bhadra Mukha:"}</span>
              <span className="font-bold text-red-650 dark:text-red-400 block text-[13px] mt-0.5">{language === 'Hindi' ? `${panchang.bhadra.mukha} (अशुभतम समय)` : `${panchang.bhadra.mukha} (Most Inauspicious)`}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "भद्रा पुच्छ:" : "Bhadra Puchha:"}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[13px] mt-0.5">{language === 'Hindi' ? `${panchang.bhadra.puchha} (अपेक्षाकृत अनुकूल)` : `${panchang.bhadra.puchha} (Relatively Favorable)`}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-serif italic border-t border-red-200/20 pt-1.5">
            {language === 'Hindi' ? "* भद्रा के पृथ्वी लोक (मृत्यु लोक) में वास के दौरान विवाह, गृह प्रवेश, मुंडन, और अन्य सभी मांगलिक कार्य सर्वथा वर्जित हैं।" : "* During Bhadra residence in the earthly realm (Prithvi Loka), marriages, housewarming, shaving ceremonies, and all other auspicious events are strictly prohibited."}
          </p>
        </div>
      ) : (
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-2xl bg-emerald-50/15 dark:bg-emerald-950/5 mt-3.5 text-left shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-mono block">
                {language === 'Hindi' ? "भद्रा दोष स्थिति" : "Bhadra Status"}
              </span>
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 font-serif block mt-0.5">
                {language === 'Hindi' ? "आज भद्रा काल का प्रभाव नहीं है।" : "No Bhadra effect today."}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono italic">
            {language === 'Hindi' ? "अगला: विष्टि करण पर" : "Next: On Vishti Karana"}
          </span>
        </div>
      )}

      {/* Panchak Alert Card */}
      {panchang.panchak && panchang.panchak.active && (
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl bg-amber-50/20 dark:bg-amber-950/5 mt-3.5 text-left shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1.5 pb-1 border-b border-amber-250/35 dark:border-amber-950/20 text-center">
            <span className="text-sm">⚠️</span>
            <span className="text-[12px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest font-mono text-center">
              {language === 'Hindi' ? `पंचक विचार अलर्ट (${panchang.panchak.hindiName})` : `Panchak Alert (${panchang.panchak.name})`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "पंचक प्रकार:" : "Panchak Type:"}</span>
              <span className="font-extrabold text-amber-800 dark:text-amber-400 block text-[13.5px] mt-0.5">
                {language === 'Hindi' 
                  ? ((panchang.panchak.typeHindi || '').includes('पंचक') ? panchang.panchak.typeHindi : `${panchang.panchak.typeHindi} पंचक`) 
                  : `${panchang.panchak.type} Panchak`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px]">{language === 'Hindi' ? "विवरण / फलादेश:" : "Description / Effects:"}</span>
              <span className="text-slate-650 dark:text-zinc-300 block text-[11.5px] leading-relaxed mt-0.5">
                {language === 'Hindi' 
                  ? `${(panchang.panchak.typeHindi || '').includes('पंचक') ? panchang.panchak.typeHindi : `${panchang.panchak.typeHindi} पंचक`} के दौरान विशेष सावधानी बरतनी चाहिए। दक्षिण दिशा की यात्रा, छत डालना, चारपाई बुनना व तृण/लकड़ी संग्रह वर्जित माना जाता है।` 
                  : panchang.panchak.description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gand Mool Alert Card */}
      {panchang.gandMool && panchang.gandMool.isGandMool && (
        <div className="glass-card-light dark:glass-card-dark p-3 sm:p-3.5 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl bg-rose-50/20 dark:bg-rose-950/5 mt-3 text-left shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1.5 pb-1 border-b border-rose-200/35 dark:border-rose-950/20 text-center">
            <span className="text-sm">⚠️</span>
            <span className="text-[12px] font-black text-rose-650 dark:text-rose-455 uppercase tracking-widest font-mono text-center">
              {language === 'Hindi' ? "गण्ड मूल नक्षत्र दोष अलर्ट" : "Gand Mool Nakshatra Dosha Alert"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase tracking-wider">{language === 'Hindi' ? "दोष युक्त नक्षत्र" : "Affected Nakshatra"}</span>
              <span className="font-extrabold text-rose-750 dark:text-rose-400 block text-[13px]">{language === 'Hindi' ? panchang.gandMool.nakshatraHindiName : panchang.gandMool.nakshatraName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono text-[10px] uppercase tracking-wider">{language === 'Hindi' ? "स्वामी ग्रह" : "Ruling Planet"}</span>
              <span className="font-extrabold text-slate-800 dark:text-orange-200 block text-[13px]">{language === 'Hindi' ? panchang.gandMool.rulingPlanetHindi : panchang.gandMool.rulingPlanet}</span>
            </div>
          </div>
          <p className="text-[10.5px] text-slate-555 dark:text-slate-455 mt-2 leading-relaxed font-sans border-t border-rose-200/10 pt-1.5">
            <strong>{language === 'Hindi' ? "वैदिक प्रभाव" : "Vedic Effect"}:</strong> {language === 'Hindi' ? `${panchang.gandMool.nakshatraHindiName} नक्षत्र के स्वामी ${panchang.gandMool.rulingPlanetHindi} हैं। यह संवेदनशील नक्षत्र संधि मानी जाती है।` : panchang.gandMool.description} {language === 'Hindi' ? "शिशु के जन्म के 27वें दिन नक्षत्र शांति पूजा कराना आवश्यक है।" : "Performing a Nakshatra Shanti Pooja on the 27 day after childbirth is highly recommended."}
          </p>
        </div>
      )}

      {/* Navagraha Planetary Degrees details card */}
      {panchang.planets && (
        <div id="navagraha_positions_card" className="glass-card-light dark:glass-card-dark p-3 sm:p-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl mt-3 text-left shadow-md">
          <div className="flex items-center justify-center gap-2 mb-2 pb-1 border-b border-orange-100/20 dark:border-orange-950/10 text-center">
            <Feather className="w-4 h-4 text-orange-500" />
            <span className="text-[13px] font-black text-slate-700 dark:text-amber-500 uppercase tracking-widest font-mono text-center">{language === 'Hindi' ? "नवग्रह स्पष्ट स्थिति" : "Navagraha Planetary Positions"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-650 dark:text-zinc-300">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="pb-1.5">{language === 'Hindi' ? "ग्रह" : "Planet"}</th>
                  <th className="pb-1.5">{language === 'Hindi' ? "राशि" : "Zodiac Sign"}</th>
                  <th className="pb-1.5">{language === 'Hindi' ? "भोग" : "Longitude"}</th>
                  <th className="pb-1.5">{language === 'Hindi' ? "गति / अवस्था" : "Motion / Speed"}</th>
                  <th className="pb-1.5">{language === 'Hindi' ? "तारा अस्त/उदय" : "Combustion Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-zinc-800/40 font-mono">
                {(panchang.planets || []).map((p, idx) => {
                  if (!p) return null;
                  const deg = Math.floor(p.longitude || 0);
                  const minFloat = ((p.longitude || 0) - deg) * 60;
                  const min = Math.floor(minFloat);
                  const sec = Math.floor((minFloat - min) * 60);
                  const degreeStr = `${deg}° ${min}' ${sec}"`;
                  
                  const isRetro = p.isRetrograde;
                  let stateText = language === 'Hindi' ? "मार्गी" : "Direct";
                  let stateClass = "text-emerald-600 dark:text-emerald-450";
                  if (p.name === 'Sun' || p.name === 'Moon') {
                    stateText = language === 'Hindi' ? "नित्य मार्गी" : "Always Direct";
                    stateClass = "text-slate-500";
                  } else if (p.name === 'Rahu' || p.name === 'Ketu') {
                    stateText = language === 'Hindi' ? "वक्री" : "Retrograde";
                    stateClass = "text-orange-600 dark:text-orange-400 font-extrabold";
                  } else if (isRetro) {
                    stateText = language === 'Hindi' ? "वक्री" : "Retrograde";
                    stateClass = "text-rose-600 dark:text-rose-450 font-extrabold";
                  }

                  const combustState = getPlanetCombustionState(p.name);
                  const combustClass = combustState?.includes("अस्त")
                    ? "text-rose-600 dark:text-rose-400 font-bold"
                    : "text-emerald-600 dark:text-emerald-450";

                  return (
                    <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-zinc-800/10">
                      <td className="py-1.5 font-bold font-serif text-[13px] text-slate-800 dark:text-orange-100">{language === 'Hindi' ? (p.hindiName || p.name) : p.name}</td>
                      <td className="py-1.5 font-serif text-[13px]">{language === 'Hindi' ? (p.signHindi || p.sign) : p.sign}</td>
                      <td className="py-1.5 text-[12px]">{degreeStr}</td>
                      <td className={`py-1.5 text-[12px] ${stateClass}`}>{stateText}</td>
                      <td className={`py-1.5 text-[12px] ${combustClass}`}>{combustState || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* PHASE 13: GRAH GOCHAR & BHAVISHYA PHAL CARD */}
      <div id="grah_gochar_phal_card" className="glass-card-light dark:glass-card-dark p-3 sm:p-4 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl mt-3 text-left shadow-md">
        <div className="flex items-center justify-center gap-2 mb-2 pb-1 border-b border-orange-100/20 dark:border-orange-950/10 text-center">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-[13px] font-black text-slate-700 dark:text-amber-500 uppercase tracking-widest font-mono text-center">
            {language === 'Hindi' ? "ग्रह गोचर एवं दैनिक भविष्यफल" : "Planet Transit & Astrological Prediction"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Left Column: Grah Gochar List */}
          <div className="space-y-2">
            <h4 className="text-[13px] font-extrabold text-slate-700 dark:text-amber-100 font-serif flex items-center gap-1">
              {language === 'Hindi' ? "🌌 वर्तमान ग्रह गोचर" : "🌌 Current Planet Transits"}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {(panchang.planets || []).map((p, idx) => (
                <div key={idx} className="p-1.5 rounded-xl bg-white/5 dark:bg-[#120B08]/20 border border-white/5 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-orange-100">{language === 'Hindi' ? (p.hindiName || p.name) : p.name}</span>
                  <span className="text-slate-550 dark:text-slate-400">➔ {language === 'Hindi' ? (p.signHindi || p.sign) : p.sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Bhavishya Phal Reading */}
          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <h4 className="text-[13px] font-extrabold text-slate-700 dark:text-amber-100 font-serif flex items-center gap-1">
                {language === 'Hindi' ? "🔮 आज का भविष्यफल" : "🔮 Daily Astrological Prediction"}
              </h4>
              
              <div className="mt-1.5 p-2.5 rounded-2xl bg-orange-500/5 dark:bg-orange-500/3 border border-orange-150/15 dark:border-orange-950/20 text-[12px] leading-relaxed text-slate-650 dark:text-zinc-355">
                {language === 'Hindi' ? (
                  <p>
                    आज चंद्रमा <strong>{panchang.planets?.find(p => p && p.name === 'Moon')?.signHindi || 'चन्द्र'}</strong> राशि और <strong>{hDate.nakshatra.hindiName}</strong> नक्षत्र में गोचर कर रहे हैं। 
                    {hDate.nakshatra.lord === 'Sun' || hDate.nakshatra.lord === 'Jupiter' || hDate.nakshatra.lord === 'Moon' || hDate.nakshatra.lord === 'Venus' || hDate.nakshatra.lord === 'Mercury' ? (
                      <span> यह एक शुभ और रचनात्मक प्रभाव लेकर आ रहा है। नए कार्यों की शुरुआत, विद्यारंभ, एवं व्यावसायिक लेन-देन के लिए आज का दिन अत्यंत अनुकूल है।</span>
                    ) : (
                      <span> आज के ग्रह-गोचर मध्यम व संवेदनशील प्रभाव दे रहे हैं। किसी भी महत्वपूर्ण निर्णय में जल्दबाजी से बचें, वाणी पर संयम रखें और नियमित कार्यों पर ध्यान दें।</span>
                    )}
                  </p>
                ) : (
                  <p>
                    Today, the Moon transits in <strong>{panchang.planets?.find(p => p && p.name === 'Moon')?.sign || 'Moon sign'}</strong> and <strong>{hDate.nakshatra.name}</strong> Nakshatra. 
                    {hDate.nakshatra.lord === 'Sun' || hDate.nakshatra.lord === 'Jupiter' || hDate.nakshatra.lord === 'Moon' || hDate.nakshatra.lord === 'Venus' || hDate.nakshatra.lord === 'Mercury' ? (
                      <span> This transit brings positive and creative energies. It is a highly favorable day for starting new initiatives, learning, and business activities.</span>
                    ) : (
                      <span> The current planetary transit suggests a moderate and sensitive period. Avoid rushing into major decisions, maintain patience, and focus on routine activities.</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-800 dark:text-emerald-400">
                <span className="font-bold block mb-0.5">{language === 'Hindi' ? "👍 अनुकूल:" : "👍 Favorable:"}</span>
                <span>{language === 'Hindi' ? "लेखन, आध्यात्मिक साधना, सामान्य खरीदारी।" : "Writing, spiritual practice, routine buying."}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-800 dark:text-rose-455">
                <span className="font-bold block mb-0.5">{language === 'Hindi' ? "👎 वर्जित:" : "👎 Avoid:"}</span>
                <span>{language === 'Hindi' ? "नया विवाद, भूमि क्रय, यात्रा आरंभ।" : "New conflicts, land purchases, long travels."}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Full Table text-link in card footer */}
        <div className="mt-3 pt-2.5 border-t border-slate-100/10 dark:border-zinc-850/30 flex justify-between items-center text-[11px]">
          <span className="text-slate-400 dark:text-slate-500 font-mono">
            {language === 'Hindi' ? "* नक्षत्र ज्योतिष गणना पद्धति" : "* Vedic Nakshatra System"}
          </span>
          <span 
            className="font-extrabold text-orange-655 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5 font-sans"
            onClick={() => setShowAllNakshatrasModal(true)}
          >
            {language === 'Hindi' ? "सम्पूर्ण नक्षत्र विवरण" : "Full Nakshatra Details"} <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* All Nakshatras Details Modal */}
      {showAllNakshatrasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#120B08] border border-orange-200/70 dark:border-white/10 rounded-3xl p-4 sm:p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left text-slate-850 dark:text-amber-100">
            <button 
              onClick={() => {
                setShowAllNakshatrasModal(false);
                setNakshatraModalSearchQuery('');
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 font-mono font-bold text-lg cursor-pointer w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/5 transition-colors"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/60 dark:border-orange-100/10 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10.5px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
                  {language === 'Hindi' ? "॥ ज्योतिष शास्त्र नक्षत्र संदर्भ ॥" : "|| Vedic Nakshatra Reference ||"}
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-amber-100">
                  {language === 'Hindi' ? "२७ नक्षत्र सम्पूर्ण विवरण" : "27 Nakshatras Complete Details"}
                </h3>
              </div>
              
              <div className="relative min-w-[200px] w-full sm:w-auto">
                <input
                  type="text"
                  placeholder={language === 'Hindi' ? "नक्षत्र खोजें..." : "Search Nakshatras..."}
                  value={nakshatraModalSearchQuery}
                  onChange={(e) => setNakshatraModalSearchQuery(e.target.value)}
                  className="w-full text-xs p-2 pl-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-orange-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {NAKSHATRA_DETAILS.filter(nak => {
                const query = nakshatraModalSearchQuery.toLowerCase();
                return (
                  nak.name.toLowerCase().includes(query) ||
                  nak.hindiName.includes(query) ||
                  nak.lord.toLowerCase().includes(query) ||
                  nak.deity.toLowerCase().includes(query)
                );
              }).map((nak, idx) => {
                const planetColor = getPlanetColor(nak.lord);
                const lordNameTranslated = language === 'Hindi' ? translateLordHindi(nak.lord) : nak.lord;
                const deityTranslated = language === 'Hindi' ? translateDeityHindi(nak.deity) : nak.deity;
                const symbolTranslated = language === 'Hindi' ? translateSymbolHindi(nak.symbol) : nak.symbol;
                const natureTranslated = language === 'Hindi' ? translateNatureHindi(nak.nature) : nak.nature;

                return (
                  <div key={nak.name} className="p-4 rounded-2xl bg-orange-50/40 dark:bg-orange-950/10 border border-orange-200/50 dark:border-zinc-850/45 flex flex-col justify-between text-left relative overflow-hidden">
                    <div className="absolute right-3 top-2 text-3xl font-mono font-black text-slate-400/10 select-none pointer-events-none">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-amber-100 font-serif leading-none">
                          {language === 'Hindi' ? nak.hindiName : nak.name}
                        </h4>
                        <span className={"text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide font-mono uppercase " + planetColor}>
                          {language === 'Hindi' ? "स्वामी" : "Ruler"}: {lordNameTranslated}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 py-2 border-t border-b border-orange-200/40 dark:border-zinc-800/20 my-2 text-[10.5px]">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight block text-[8px]">{language === 'Hindi' ? "प्रतीक:" : "Symbol:"}</span>
                          <span className="font-extrabold text-slate-850 dark:text-amber-100 mt-0.5 block">{symbolTranslated}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight block text-[8px]">{language === 'Hindi' ? "देवता:" : "Deity:"}</span>
                          <span className="font-extrabold text-slate-850 dark:text-amber-100 mt-0.5 block truncate">{deityTranslated}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight block text-[8px]">{language === 'Hindi' ? "प्रवृत्ति (स्वभाव):" : "Nature:"}</span>
                          <span className="font-extrabold text-[#7c2d12] dark:text-amber-200 flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-orange-500 shrink-0 animate-pulse" />
                            {natureTranslated}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed mb-3 font-sans">
                        {nak.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-dotted border-orange-200/40 dark:border-orange-100/10">
                      <div className="flex items-start gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-slate-650 dark:text-slate-350 leading-tight">
                          <strong className="text-emerald-700 dark:text-emerald-455 mr-1">{language === 'Hindi' ? "अनुकूल कार्य:" : "Suitable Acts:"}</strong>
                          {nak.suitableActivities.join(', ')}
                        </span>
                      </div>
                      {nak.avoidActivities && nak.avoidActivities.length > 0 && (
                        <div className="flex items-start gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="text-[10px] text-slate-650 dark:text-slate-350 leading-tight">
                            <strong className="text-rose-700 dark:text-rose-455 mr-1">{language === 'Hindi' ? "वर्जित कार्य:" : "Avoid Acts:"}</strong>
                            {nak.avoidActivities.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hora Table Modal */}
      {showHoraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#120B08] border border-orange-200/70 dark:border-white/10 rounded-3xl p-4 sm:p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left text-slate-850 dark:text-amber-100">
            <button 
              onClick={() => setShowHoraModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 font-mono font-bold text-lg cursor-pointer w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/5 transition-colors"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/60 dark:border-orange-100/10 mb-4">
              <span className="text-[10.5px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
                {language === 'Hindi' ? "॥ लाइव वैदिक होरा सारणी ॥" : "|| Live Vedic Hora Chart ||"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-amber-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#120B08] border border-orange-200/70 dark:border-white/10 rounded-3xl p-4 sm:p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left text-slate-850 dark:text-amber-100">
            <button 
              onClick={() => setShowChoghadiyaModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 font-mono font-bold text-lg cursor-pointer w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/5 transition-colors"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/60 dark:border-orange-100/10 mb-4">
              <span className="text-[10.5px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
                {language === 'Hindi' ? "॥ दैनिक चौघड़िया मुहूर्त ॥" : "|| Daily Choghadiya Timings ||"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-amber-100">
                {language === 'Hindi' ? "सम्पूर्ण दिन-रात्रि चौघड़िया तालिका" : "Full Day-Night Choghadiya Table"}
              </h3>
            </div>
            
            {/* Grid separating Day and Night Choghadiya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Day Choghadiya */}
              <div className="space-y-3">
                <h4 className="text-[11px] sm:text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
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
                      <div key={i} className="p-2.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-zinc-850/45 flex flex-col justify-between min-h-[76px] sm:min-h-[88px]">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-serif leading-tight block">{ch.hindiName || ch.name}</span>
                          <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block leading-none">{ch.startTime} - {ch.endTime}</span>
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
                <h4 className="text-[11px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
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
                      <div key={i} className="p-2.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/60 dark:border-zinc-850/45 flex flex-col justify-between min-h-[76px] sm:min-h-[88px]">
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-serif leading-tight block">{ch.hindiName || ch.name}</span>
                          <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block leading-none">{ch.startTime} - {ch.endTime}</span>
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

      {/* WhatsApp Share CTA Button */}
      {onShare && (
        <div className="pt-2 pb-6 flex justify-center">
          <button
            onClick={onShare}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>{language === 'Hindi' ? "आज का सम्पूर्ण पंचांग शेयर करें" : "Share Today's Complete Panchang"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
