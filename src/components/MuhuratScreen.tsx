import React, { useState, useRef } from 'react';
import {
  Star,
  ShieldCheck,
  Building,
  Key,
  Truck,
  Heart,
  ShoppingBag,
  Feather,
  Calendar
} from 'lucide-react';
import { PanchangInfo } from '../types';
import { getMuhuratsForPanchang } from '../utils/panchangCalc';
import { checkMuhurats } from '../utils/muhuratRules';
import { getTranslation } from '../utils/translations';

interface MuhuratScreenProps {
  panchang: PanchangInfo;
  onViewAstrologyChart?: () => void;
  currentTime?: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  language: "English" | "Hindi";
}

const translateShivaVaasDescHindi = (desc?: string): string => {
  if (!desc) return '';
  return desc
    .replace(/Lord Shiva resides with Goddess Gauri\. Performing Rudrabhishek today is highly auspicious, bringing wealth and domestic happiness\./gi, 'भगवान शिव माता गौरी के साथ विराजमान हैं। आज रुद्राभिषेक करना अत्यंत शुभ फलदायी है, जिससे सुख-समृद्धि की प्राप्ति होती है।')
    .replace(/Lord Shiva resides on Kailash Parvat\. Performing Rudrabhishek today is auspicious, bringing peace and spiritual growth\./gi, 'भगवान शिव कैलाश पर्वत पर विराजमान हैं। आज रुद्राभिषेक करना शुभ है, जो मानसिक शांति प्रदान करता है।')
    .replace(/Lord Shiva resides in Nandi Svarupa \/ Sabha \/ Smashan \/ Bhoomi\. Avoid performing Rudrabhishek today\./gi, 'भगवान शिव सभा या श्मशान पर निवास कर रहे हैं। आज रुद्राभिषेक करने से बचें।')
    .replace(/Lord Shiva resides in Smashan\. Avoid performing Rudrabhishek today\./gi, 'भगवान शिव श्मशान पर निवास कर रहे हैं। आज रुद्राभिषेक टालें।')
    .replace(/Avoid performing Rudrabhishek today\./gi, 'आज रुद्राभिषेक करने से बचें।');
};

const translateAgniVaasDescHindi = (desc?: string): string => {
  if (!desc) return '';
  return desc
    .replace(/Agni \(Fire\) resides on Earth \(Prithvi\)\. Performing Yajna\/Havan today is highly auspicious, bringing prosperity and fulfillment\./gi, 'अग्नि देव पृथ्वी लोक पर निवास कर रहे हैं। आज यज्ञ या हवन करना अत्यंत शुभ है, जिससे सुख-समृद्धि की प्राप्ति होती है।')
    .replace(/Agni resides in Aakash \/ Patala\. Avoid performing Yajna\/Havan today\./gi, 'अग्नि देव आकाश या पाताल लोक में निवास कर रहे हैं। आज यज्ञ या हवन करने से बचें।')
    .replace(/Avoid performing Yajna\/Havan today\./gi, 'आज यज्ञ अथवा हवन करने से बचें।');
};

const translateAdviceHindi = (advice: string): string => {
  if (!advice) return '';
  return advice
    .replace(/Shukla Paksha is favorable\./g, 'शुक्ल पक्ष अत्यंत अनुकूल है।')
    .replace(/Krishna Paksha is generally avoided for entering new homes\./g, 'कृष्ण पक्ष में नए गृह प्रवेश को सामान्यतः वर्जित माना जाता है।')
    .replace(/Highly auspicious wedding Nakshatra: ([^.]+)\./g, 'विवाह हेतु $1 नक्षत्र अत्यंत शुभ एवं मंगलकारी है।')
    .replace(/Nakshatra ([^.]+) is excellent for new home entry\./g, 'गृह प्रवेश हेतु $1 नक्षत्र अति उत्तम है।')
    .replace(/Nakshatra ([^.]+) is favorable for naming ceremonies\./g, 'नामकरण संस्कार के लिए $1 नक्षत्र अनुकूल है।')
    .replace(/Nakshatra ([^.]+) is auspicious for vehicle purchases\./g, 'वाहन क्रय हेतु $1 नक्षत्र शुभ है।')
    .replace(/Nakshatra ([^.]+) is not recommended\./g, '$1 नक्षत्र में गृह प्रवेश टालें।')
    .replace(/Nakshatra ([^.]+) is not preferred\./g, '$1 नक्षत्र विवाह हेतु उत्तम नहीं है।')
    .replace(/Nakshatra ([^.]+) is neutral\./g, '$1 नक्षत्र सामान्य प्रभाव वाला है।')
    .replace(/Tithi ([^.]+) is highly auspicious\./g, 'तिथि $1 अत्यंत शुभ है।')
    .replace(/Tithi ([^.]+) is highly favorable\./g, 'तिथि $1 अत्यंत अनुकूल है।')
    .replace(/Tithi ([^.]+) should be avoided\./g, 'तिथि $1 में यह कार्य वर्जित है।')
    .replace(/Tithi ([^.]+) is inauspicious\./g, 'तिथि $1 अशुभ मानी जाती है।')
    .replace(/Tithi ([^.]+) is supportive\./g, 'तिथि $1 अनुकूल है।')
    .replace(/Tithi ([^.]+) supports major purchases\./g, 'तिथि $1 खरीदारी हेतु शुभ है।')
    .replace(/Avoid vehicle purchases on Tithi ([^.]+)\./g, 'तिथि $1 में वाहन खरीदारी से बचें।')
    .replace(/Avoid naming ceremonies on Tithi ([^.]+)\./g, 'तिथि $1 में नामकरण संस्कार न करें।')
    .replace(/Weekday is favorable\./g, 'वार (दिन) अनुकूल है।')
    .replace(/Weekday is not ideal\./g, 'वार (दिन) उत्तम नहीं है।')
    .replace(/Avoid purchasing vehicles on Tuesday or Saturday\./g, 'मंगलवार या शनिवार को वाहन क्रय करने से बचें।')
    .replace(/Pratipada/g, 'प्रतिपदा').replace(/Dwitiya/g, 'द्वितीया').replace(/Tritiya/g, 'तृतीया').replace(/Chaturthi/g, 'चतुर्थी')
    .replace(/Panchami/g, 'पंचमी').replace(/Shashthi/g, 'षष्ठी').replace(/Saptami/g, 'सप्तमी').replace(/Ashtami/g, 'अष्टमी')
    .replace(/Navami/g, 'नवमी').replace(/Dashami/g, 'दशमी').replace(/Ekadashi/g, 'एकादशी').replace(/Dwadashi/g, 'द्वादशी')
    .replace(/Trayodashi/g, 'त्रयोदशी').replace(/Chaturdashi/g, 'चतुर्दशी').replace(/Purnima/g, 'पूर्णिमा').replace(/Amavasya/g, 'अमावस्या')
    .replace(/Ashwini/g, 'अश्विनी').replace(/Bharani/g, 'भरणी').replace(/Krittika/g, 'कृत्तिका').replace(/Rohini/g, 'रोहिणी')
    .replace(/Mrigashirsha/g, 'मृगशिरा').replace(/Ardra/g, 'आर्द्रा').replace(/Punarvasu/g, 'पुनर्वसु').replace(/Pushya/g, 'पुष्य')
    .replace(/Ashlesha/g, 'आश्लेषा').replace(/Magha/g, 'मघा').replace(/Purvaphalguni/g, 'पूर्वाफाल्गुनी').replace(/Uttaraphalguni/g, 'उत्तराफाल्गुनी')
    .replace(/Hasta/g, 'हस्त').replace(/Chitra/g, 'चित्रा').replace(/Swati/g, 'स्वाति').replace(/Vishakha/g, 'विशाखा')
    .replace(/Anuradha/g, 'अनुराधा').replace(/Jyeshtha/g, 'ज्येष्ठा').replace(/Mula/g, 'मूल').replace(/Purvashadha/g, 'पूर्वाषाढ़ा')
    .replace(/Uttarashadha/g, 'उत्तराषाढ़ा').replace(/Shravana/g, 'श्रवण').replace(/Dhanishta/g, 'धनिष्ठा').replace(/Shatabhisha/g, 'शतभिषा')
    .replace(/Purvabhadrapada/g, 'पूर्वाभाद्रपद').replace(/Uttarabhadrapada/g, 'उत्तराभाद्रपद').replace(/Revati/g, 'रेवती');
};

export function MuhuratScreen({ 
  panchang, 
  onViewAstrologyChart, 
  currentTime,
  selectedDate,
  onDateChange,
  language = 'English'
}: MuhuratScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const allMuhurats = getMuhuratsForPanchang(panchang);
  const ruleMuhurats = checkMuhurats(panchang);
  
  // Custom Muhurat types and auspicious calculation formulas based on current Tithi & Month
  const tithiValue = panchang.hinduDate.tithi.value;
  const isKrishnaAshtamiOrChauth = tithiValue === 4 || tithiValue === 8 || tithiValue === 19 || tithiValue === 23;

  // Helper time parser and formatter
  const parseMin = (str: string) => {
    const parts = str.trim().split(' ');
    if (parts.length < 2) return 360;
    const [time, ampm] = parts;
    let [hrs, mins] = time.split(':').map(Number);
    if (ampm === 'PM' && hrs !== 12) hrs += 12;
    if (ampm === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  const formatMinStr = (m: number) => {
    let hrs = Math.floor(((m % 1440 + 1440) % 1440) / 60);
    let mins = Math.floor(((m % 1440 + 1440) % 1440) % 60);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    if (hrs === 0) hrs = 12;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const sMin = parseMin(panchang.sunrise);
  const eMin = parseMin(panchang.sunset);
  
  const dayOfYear = Math.floor((selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / 86400000);
  const rashis = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
  const rashisEng = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

  const getDynamicLagna = (baseIdx: number) => {
    const idx = (baseIdx + dayOfYear) % 12;
    return language === 'Hindi' ? `${rashis[idx]} लग्न` : `${rashisEng[idx]} Lagna`;
  };

  const vivahRule = ruleMuhurats.find(r => r.type === 'vivah');
  const gpRule = ruleMuhurats.find(r => r.type === 'griha_pravesh');
  const namkaranRule = ruleMuhurats.find(r => r.type === 'namkaran');
  const vahanRule = ruleMuhurats.find(r => r.type === 'vahan_purchase');

  // Render lists of Muhurats with dynamic computations
  const muhuratCategories = [
    {
      id: 'marriage',
      name: 'Vivah (Marriage)',
      hindiName: 'विवाह मुहूर्त',
      desc: language === 'Hindi' ? 'गुरु और शुक्र के आशीर्वाद से विवाह के पवित्र बंधन के लिए।' : 'For the sacred bond of marriage under the blessings of Jupiter and Venus.',
      icon: <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />,
      rating: vivahRule ? Math.max(1, Math.round(vivahRule.score / 20)) : (isKrishnaAshtamiOrChauth ? 3 : 5),
      slots: [
        { 
          time: `${formatMinStr(sMin + 75)} - ${formatMinStr(sMin + 270)}`, 
          lagna: getDynamicLagna(2), // Mithuna base
          suitability: vivahRule ? (vivahRule.isSuitable ? (language === 'Hindi' ? 'शुभ (उत्तम)' : 'Auspicious') : (language === 'Hindi' ? 'मध्यम (सामान्य)' : 'Medium')) : (language === 'Hindi' ? 'अत्यंत शुभ (उत्तम)' : 'Highly Auspicious'), 
          advice: vivahRule ? (language === 'Hindi' ? vivahRule.reasons.join(' ') : 'Planetary aspects are favorable.') : (language === 'Hindi' ? 'विवाह के लिए सर्वोत्तम स्थिति।' : 'Best conditions for marriage.') 
        },
        { 
          time: `${formatMinStr(eMin - 165)} - ${formatMinStr(eMin + 60)}`, 
          lagna: getDynamicLagna(6), // Tula base
          suitability: language === 'Hindi' ? 'अच्छा (लाभ)' : 'Good (Gain)', 
          advice: language === 'Hindi' ? 'सामाजिक आयोजनों के लिए उपयुक्त।' : 'Suitable for social gatherings.' 
        },
      ]
    },
    {
      id: 'house',
      name: 'Griha Pravesh',
      hindiName: 'गृह प्रवेश मुहूर्त',
      desc: language === 'Hindi' ? 'नए घर या संपत्ति में प्रवेश और निर्माण के लिए।' : 'For entering and starting construction on a new home or property.',
      icon: <Key className="w-5 h-5 text-amber-500 animate-pulse" />,
      rating: gpRule ? Math.max(1, Math.round(gpRule.score / 20)) : (tithiValue % 2 === 0 ? 4 : 5),
      slots: [
        { 
          time: `${formatMinStr(sMin + 165)} - ${formatMinStr(sMin + 330)}`, 
          lagna: getDynamicLagna(1), // Vrishabha base
          suitability: gpRule ? (gpRule.isSuitable ? (language === 'Hindi' ? 'शुभ (उत्तम)' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ (टालें)' : 'Inauspicious (Avoid)')) : (language === 'Hindi' ? 'शुभ (उत्तम)' : 'Auspicious'), 
          advice: gpRule ? (language === 'Hindi' ? gpRule.reasons.join(' ') : 'Vedic parameters match.') : (language === 'Hindi' ? 'स्थिर लग्न, गृह प्रवेश के लिए शुभ।' : 'Fixed Lagna, auspicious for entry.') 
        },
        { 
          time: `${formatMinStr(sMin + 345)} - ${formatMinStr(sMin + 395)}`, 
          lagna: getDynamicLagna(3), // Karka base
          suitability: gpRule ? (gpRule.isSuitable ? (language === 'Hindi' ? 'सर्वोत्तम (अमृत)' : 'Best (Amrit)') : (language === 'Hindi' ? 'मध्यम' : 'Medium')) : (language === 'Hindi' ? 'सर्वोत्तम (अमृत)' : 'Best (Amrit)'), 
          advice: gpRule ? (language === 'Hindi' ? (gpRule.reasons[0] || 'अभिजीत मुहूर्त के साथ अत्यधिक शुभ।') : 'Highly auspicious with Abhijit Muhurat.') : (language === 'Hindi' ? 'अभिजीत मुहूर्त के साथ अत्यधिक शुभ।' : 'Highly auspicious with Abhijit.') 
        }
      ]
    },
    {
      id: 'naming',
      name: 'Naamkaran',
      hindiName: 'नामकरण मुहूर्त',
      desc: language === 'Hindi' ? 'नामकरण संस्कार के लिए मुहूर्त।' : 'Muhurat for naming ceremony.',
      icon: <Feather className="w-5 h-5 text-orange-500" />,
      rating: namkaranRule ? Math.max(1, Math.round(namkaranRule.score / 20)) : 5,
      slots: [
        { 
          time: `${formatMinStr(sMin + 180)} - ${formatMinStr(sMin + 360)}`, 
          lagna: getDynamicLagna(4), // Simha base
          suitability: namkaranRule ? (namkaranRule.isSuitable ? (language === 'Hindi' ? 'शुभ (उत्तम)' : 'Auspicious') : (language === 'Hindi' ? 'मध्यम' : 'Medium')) : (language === 'Hindi' ? 'शुभ (उत्तम)' : 'Auspicious'), 
          advice: namkaranRule ? (language === 'Hindi' ? namkaranRule.reasons.join(' ') : 'Intelligent planetary alignments.') : (language === 'Hindi' ? 'बुद्धिमत्ता के लिए अत्यंत शुभ।' : 'Very auspicious for intellect.') 
        },
        { 
          time: `${formatMinStr(sMin + 480)} - ${formatMinStr(sMin + 570)}`, 
          lagna: getDynamicLagna(5), // Kanya base
          suitability: language === 'Hindi' ? 'शुभ (लाभ)' : 'Good (Gain)', 
          advice: language === 'Hindi' ? 'स्वर्ण आभूषण आदि पहनाने के लिए।' : 'For naming and wearing jewelry.' 
        }
      ]
    },
    {
      id: 'vehicle',
      name: 'Vehicle Purchase',
      hindiName: 'वाहन क्रय मुहूर्त',
      desc: language === 'Hindi' ? 'वाहन, मोटर या व्यावसायिक वाहन की खरीद के लिए मुहूर्त।' : 'For purchase of vehicles or commercial transports.',
      icon: <Truck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      rating: vahanRule ? Math.max(1, Math.round(vahanRule.score / 20)) : (tithiValue === 14 || tithiValue === 30 ? 2 : 4),
      slots: [
        { 
          time: `${formatMinStr(sMin + 270)} - ${formatMinStr(sMin + 450)}`, 
          lagna: getDynamicLagna(10), // Kumbha base
          suitability: vahanRule ? (vahanRule.isSuitable ? (language === 'Hindi' ? 'अत्यंत शुभ (शुभ)' : 'Highly Auspicious') : (language === 'Hindi' ? 'मध्यम (सामान्य)' : 'Medium')) : (isKrishnaAshtamiOrChauth ? (language === 'Hindi' ? 'मध्यम (सामान्य)' : 'Medium') : (language === 'Hindi' ? 'अत्यंत शुभ (शुभ)' : 'Highly Auspicious')), 
          advice: vahanRule ? (language === 'Hindi' ? vahanRule.reasons.join(' ') : 'Good metallic aspect scores.') : (language === 'Hindi' ? 'धातु से जुड़ी वस्तुओं के लिए सर्वोत्तम।' : 'Best for purchasing metallic items.') 
        },
        { 
          time: `${formatMinStr(eMin - 210)} - ${formatMinStr(eMin - 120)}`, 
          lagna: getDynamicLagna(0), // Mesha base
          suitability: language === 'Hindi' ? 'शुभ (चल)' : 'Good (Chala)', 
          advice: language === 'Hindi' ? 'वाहन आदि के लिए बढ़िया मुहूर्त।' : 'Good time to bring home the vehicle.' 
        }
      ]
    },
    {
      id: 'business',
      name: 'Business Opening',
      hindiName: 'व्यापार आरंभ',
      desc: language === 'Hindi' ? 'नया व्यवसाय, दुकान या कार्यालय शुरू करने का मुहूर्त।' : 'Muhurat for starting a new business, shop, or office.',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      rating: tithiValue % 5 === 0 ? 3 : 5,
      slots: [
        { 
          time: `${formatMinStr(sMin + 345)} - ${formatMinStr(sMin + 435)}`, 
          lagna: language === 'Hindi' ? 'अभिजीत मुहूर्त' : 'Abhijit Muhurat', 
          suitability: language === 'Hindi' ? 'अत्यंत शुभ (अमृत)' : 'Highly Auspicious (Amrit)', 
          advice: language === 'Hindi' ? 'व्यवसाय में वृद्धि और लाभ के लिए सर्वोत्तम मुहूर्त।' : 'Best time for business growth and profits.' 
        },
        { 
          time: `${formatMinStr(eMin - 120)} - ${formatMinStr(eMin - 30)}`, 
          lagna: getDynamicLagna(8), // Dhanu base
          suitability: language === 'Hindi' ? 'अच्छा (लाभ)' : 'Good (Gain)', 
          advice: language === 'Hindi' ? 'डिजाइन, तकनीक और संचार कार्यों के लिए।' : 'Good for design, tech, and communications.' 
        }
      ]
    },
    {
      id: 'land',
      name: 'Bhoomi Pujan',
      hindiName: 'भूमि पूजन मुहूर्त',
      desc: language === 'Hindi' ? 'संपत्ति, भूमि पूजन और निर्माण कार्य के लिए शुभ शुरुआत।' : 'Auspicious beginning for property, land worship, and construction.',
      icon: <Building className="w-5 h-5 text-teal-600 dark:text-teal-450" />,
      rating: 4,
      slots: [
        { 
          time: `${formatMinStr(sMin + 30)} - ${formatMinStr(sMin + 150)}`, 
          lagna: getDynamicLagna(7), // Vrischika base
          suitability: language === 'Hindi' ? 'शुभ (शुभ)' : 'Auspicious', 
          advice: language === 'Hindi' ? 'प्रातःकाल भूमि पूजन के लिए उपयुक्त।' : 'Suitable for morning Bhoomi Pujan.' 
        },
        { 
          time: `${formatMinStr(sMin + 225)} - ${formatMinStr(sMin + 330)}`, 
          lagna: getDynamicLagna(9), // Makara base
          suitability: language === 'Hindi' ? 'उत्तम (अतिशुभ)' : 'Excellent (Very Auspicious)', 
          advice: language === 'Hindi' ? 'नींव रखने के लिए सबसे उत्तम समय।' : 'Most auspicious time for laying foundation.' 
        }
      ]
    }
  ];

  const getActiveSlots = () => {
    const now = currentTime || new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (timeStr: string): number => {
      const parts = timeStr.trim().split(' ');
      if (parts.length < 2) return 0;
      const [time, ampm] = parts;
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

    const active: Array<{
      categoryName: string;
      categoryHindiName: string;
      icon: React.ReactNode;
      time: string;
      lagna: string;
      suitability: string;
      advice: string;
    }> = [];

    muhuratCategories.forEach(cat => {
      cat.slots.forEach(slot => {
        const [startStr, endStr] = slot.time.split(' - ');
        if (startStr && endStr && isTimeInInterval(currentMin, startStr, endStr)) {
          active.push({
            categoryName: cat.name,
            categoryHindiName: cat.hindiName,
            icon: cat.icon,
            time: slot.time,
            lagna: slot.lagna,
            suitability: slot.suitability,
            advice: slot.advice
          });
        }
      });
    });

    return active;
  };

  const activeSlots = getActiveSlots();

  const categoriesFiltered = selectedCategory === 'all'
    ? muhuratCategories
    : muhuratCategories.filter(m => m.id === selectedCategory);

  return (
    <div id="muhurat_screen_root" className="space-y-4 sm:space-y-6">
      
      {/* Date Selector Row */}
      <div 
        onClick={() => {
          if (dateInputRef.current) {
            try {
              dateInputRef.current.showPicker();
            } catch (err) {
              dateInputRef.current.click();
            }
          }
        }}
        className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white/5 dark:bg-brand-card p-4 rounded-2xl border border-white/10 dark:border-brand-border text-left cursor-pointer"
      >
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-brand-accent font-serif">शुभ मुहूर्त तिथि चयनकर्ता</h3>
          <p className="text-[10px] text-slate-500 dark:text-brand-text-sec mt-0.5">आगे आने वाले या पिछले दिनों के मुहूर्त जानने के लिए तिथि चुनें।</p>
        </div>
        <div className="relative min-w-[220px] flex items-center gap-2 bg-white/75 dark:bg-brand-control p-2 px-3 rounded-xl border border-orange-100 dark:border-brand-border shadow-xs">
          <Calendar className="w-4 h-4 text-orange-600 dark:text-brand-accent shrink-0" />
          <div className="min-w-0 pr-1 text-left flex-grow">
            <span className="text-[8px] text-slate-400 dark:text-brand-text-mut font-mono uppercase tracking-wider block">मुहूर्त तिथि</span>
            <span className="text-2xs font-extrabold text-[#9A3412] dark:text-brand-text-pri font-sans block truncate leading-none mt-0.5">
              {selectedDate.toLocaleDateString('hi-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <input
            type="date"
            ref={dateInputRef}
            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [year, month, day] = e.target.value.split('-').map(Number);
                onDateChange(new Date(year, month - 1, day));
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
            title="मुहूर्त तिथि बदलें"
          />
        </div>
      </div>

      {/* PHASE 14: ASTROLOGICAL DASHBOARD CARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: शुभ मुहूर्त व योग */}
        <div className="glass-card-light dark:bg-brand-card p-5 text-left rounded-3xl border border-emerald-100/50 dark:border-brand-border hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-100/60 dark:border-brand-border">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-brand-control text-emerald-700 dark:text-emerald-400">✨</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-brand-accent font-serif leading-none">
                  {language === 'Hindi' ? "शुभ मुहूर्त व योग" : "Auspicious Siddhi Yogas"}
                </h3>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1 uppercase tracking-widest font-mono">
                  {language === 'Hindi' ? "शुभ समयावधि" : "Auspicious Timings"}
                </span>
              </div>
            </div>

            {/* Timings */}
            <div className="space-y-2 text-xs">
              {allMuhurats.filter(m => m.type !== 'Ashubh').map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-brand-border">
                  <span className="text-slate-400 dark:text-brand-text-sec font-medium">{language === 'Hindi' ? (m.hindiName || m.name) : m.name}:</span>
                  <span className="font-bold text-slate-855 dark:text-brand-text-pri font-mono">{m.startTime} - {m.endTime}</span>
                </div>
              ))}
            </div>
            {/* Shubh Yogas List */}
            {((panchang.shubhYogas && panchang.shubhYogas.length > 0) || (panchang.pushkarYog && panchang.pushkarYog.active)) && (
              <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-brand-border space-y-2">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block font-mono">
                  {language === 'Hindi' ? "आज के विशेष सिद्ध योग:" : "Today's Special Yogas:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {panchang.pushkarYog && panchang.pushkarYog.active && (
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 animate-pulse font-serif">
                      🌟 {language === 'Hindi' ? panchang.pushkarYog.hindiName : panchang.pushkarYog.name} ({panchang.pushkarYog.type})
                    </span>
                  )}
                  {panchang.shubhYogas && panchang.shubhYogas.map((y, idx) => (
                    <span key={idx} className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-250/30 font-serif">
                      ✨ {language === 'Hindi' ? y.hindiName : y.name} ({y.start} - {y.end})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: वर्जित समय चक्र */}
        <div className="glass-card-light dark:bg-brand-card p-5 text-left rounded-3xl border border-red-150 dark:border-brand-border hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-red-100/60 dark:border-brand-border">
              <span className="p-1.5 rounded-lg bg-red-100 dark:bg-brand-control text-red-700 dark:text-rose-400">⚠️</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-brand-accent font-serif leading-none">
                  {language === 'Hindi' ? "वर्जित समय चक्र" : "Adverse Periods (Inauspicious)"}
                </h3>
                <span className="text-[9px] text-red-600 dark:text-rose-400 block mt-1 uppercase tracking-widest font-mono">
                  {language === 'Hindi' ? "अशुभ समयावधि" : "Inauspicious Timings"}
                </span>
              </div>
            </div>

            {/* Inauspicious Timings */}
            <div className="space-y-2 text-xs">
              {allMuhurats.filter(m => m.type === 'Ashubh').map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-brand-border">
                  <span className="text-slate-400 dark:text-brand-text-sec font-medium">{language === 'Hindi' ? (m.hindiName || m.name) : m.name}:</span>
                  <span className="font-bold text-red-655 dark:text-rose-400 font-mono">{m.startTime} - {m.endTime}</span>
                </div>
              ))}

              {/* Durmuhurat & Varjyam */}
              {panchang.durmuhurat && panchang.durmuhurat.length > 0 && panchang.durmuhurat.map((d, idx) => (
                <div key={`dur-${idx}`} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-brand-border">
                  <span className="text-slate-400 dark:text-brand-text-sec font-medium">{language === 'Hindi' ? "दुर्मुहूर्त:" : "Durmuhurat:"}</span>
                  <span className="font-bold text-red-655 dark:text-rose-400 font-mono">{d.start} - {d.end}</span>
                </div>
              ))}
              {panchang.varjyam && panchang.varjyam.length > 0 && panchang.varjyam.map((v, idx) => (
                <div key={`var-${idx}`} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-brand-border">
                  <span className="text-slate-400 dark:text-brand-text-sec font-medium">{language === 'Hindi' ? "वर्ज्यम:" : "Varjyam:"}</span>
                  <span className="font-bold text-red-655 dark:text-rose-400 font-mono">{v.start} - {v.end}</span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {((panchang.dagdaTithi && panchang.dagdaTithi.isDagda) || (panchang.bhadra && panchang.bhadra.active)) && (
              <div className="mt-3 pt-2.5 border-t border-slate-100/50 dark:border-brand-border space-y-1 text-[10px]">
                {panchang.dagdaTithi && panchang.dagdaTithi.isDagda && (
                  <div className="text-red-700 dark:text-rose-300 font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 font-serif">
                    {language === 'Hindi' ? "🚨 आज दग्ध तिथि है! महत्वपूर्ण कार्य टालें।" : "🚨 Today is Dagda Tithi! Avoid starting important activities."}
                  </div>
                )}
                {panchang.bhadra && panchang.bhadra.active && (
                  <div className="text-red-700 dark:text-rose-300 font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 font-serif">
                    {language === 'Hindi'
                      ? `🚨 भद्रा काल सक्रिय है (${panchang.bhadra.startTime} से ${panchang.bhadra.endTime} तक)।`
                      : `🚨 Bhadra period is active (from ${panchang.bhadra.startTime} to ${panchang.bhadra.endTime}).`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: शिववास व अग्निवास */}
        <div className="glass-card-light dark:bg-brand-card p-5 text-left rounded-3xl border border-orange-150 dark:border-brand-border hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-orange-100/60 dark:border-brand-border">
              <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-brand-control text-orange-700 dark:text-brand-accent">🔥</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-brand-accent font-serif leading-none">
                  {language === 'Hindi' ? "अग्निवास व शिववास" : "Ritual Muhurats (Shiva/Agni)"}
                </h3>
                <span className="text-[9px] text-orange-600 dark:text-brand-accent block mt-1 uppercase tracking-widest font-mono">
                  {language === 'Hindi' ? "अनुष्ठान शुभता" : "Ritual Auspiciousness"}
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Shiva Vaas */}
              {panchang.shivaVaas && (
                <div className="p-3 rounded-2xl bg-white/5 dark:bg-brand-control border border-white/10 dark:border-brand-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-text-pri font-serif">
                      {language === 'Hindi' ? "शिववास (रुद्राभिषेक):" : "Shiva Vaas (Rudrabhishek):"}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      panchang.shivaVaas.isAuspicious
                        ? 'bg-emerald-100 border-emerald-250 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30'
                        : 'bg-rose-100 border-rose-250 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30'
                    }`}>
                      {panchang.shivaVaas.isAuspicious ? (language === 'Hindi' ? 'शुभ' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ' : 'Avoid')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-brand-text-sec mt-1 leading-normal font-sans">
                    <strong className="dark:text-brand-text-pri">{language === 'Hindi' ? "वास स्थान:" : "Residence:"}</strong> {language === 'Hindi' ? (panchang.shivaVaas.residenceHindi || panchang.shivaVaas.residence) : panchang.shivaVaas.residence} - {language === 'Hindi' ? translateShivaVaasDescHindi(panchang.shivaVaas.description) : panchang.shivaVaas.description}
                  </p>
                </div>
              )}

              {/* Agni Vaas */}
              {panchang.agniVaas && (
                <div className="p-3 rounded-2xl bg-white/5 dark:bg-brand-control border border-white/10 dark:border-brand-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-brand-text-pri font-serif">
                      {language === 'Hindi' ? "अग्निवास (यज्ञ/हवन):" : "Agni Vaas (Yajna/Havan):"}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      panchang.agniVaas.isAuspicious
                        ? 'bg-emerald-100 border-emerald-250 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30'
                        : 'bg-rose-100 border-rose-250 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30'
                    }`}>
                      {panchang.agniVaas.isAuspicious ? (language === 'Hindi' ? 'शुभ' : 'Auspicious') : (language === 'Hindi' ? 'अशुभ' : 'Avoid')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-brand-text-sec mt-1 leading-normal font-sans">
                    <strong className="dark:text-brand-text-pri">{language === 'Hindi' ? "वास स्थान:" : "Residence:"}</strong> {language === 'Hindi' ? (panchang.agniVaas.residenceHindi || panchang.agniVaas.residence) : panchang.agniVaas.residence} - {language === 'Hindi' ? translateAgniVaasDescHindi(panchang.agniVaas.description) : panchang.agniVaas.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Active Muhurats Section */}
      {activeSlots.length > 0 && (
        <div className="glass-card-light dark:bg-brand-card p-4 sm:p-5 shadow-md text-left relative overflow-hidden border border-emerald-500/20 dark:border-brand-border">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-36 h-36 bg-emerald-500/8 dark:bg-emerald-600/8 blur-2xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-2 border-b border-emerald-100/40 dark:border-brand-border">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-brand-accent flex items-center gap-1.5 leading-none mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {language === 'Hindi' ? "लाइव सक्रिय मुहूर्त संसूचक" : "Live Active Muhurat Detector"}
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-brand-accent font-serif leading-none">
                {getTranslation(language, 'liveMuhurat')}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSlots.map((slot, idx) => (
              <div key={idx} className="bg-emerald-50/20 dark:bg-brand-control p-3.5 rounded-2xl border border-emerald-500/20 dark:border-brand-border flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-emerald-100/40 dark:bg-brand-card shrink-0">
                  {slot.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-serif font-black text-slate-850 dark:text-brand-text-pri">
                      {language === 'Hindi' ? slot.categoryHindiName : slot.categoryName}
                    </span>
                    <span className="text-[8.5px] font-black tracking-widest bg-emerald-500 text-white dark:bg-emerald-600 uppercase px-1.5 py-0.5 rounded shadow-3xs">
                      {slot.suitability}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-brand-text-pri mt-1 font-mono">
                    {language === 'Hindi' ? "समय:" : "Time:"} {slot.time}
                  </div>
                  <div className="text-[10px] text-slate-655 dark:text-brand-text-sec mt-1">
                    <span className="font-bold text-orange-950 dark:text-brand-accent">{language === 'Hindi' ? "लग्न:" : "Lagna:"} {slot.lagna}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-brand-text-sec italic mt-1 leading-normal font-sans">
                    🌿 {slot.advice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search selection menus */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm dark:bg-[#853606] dark:text-white dark:border-[#853606]'
              : 'bg-white/80 dark:bg-brand-card hover:bg-slate-50 dark:hover:bg-brand-control border-orange-100 dark:border-brand-border text-slate-700 dark:text-brand-text-pri'
          }`}
        >
          {getTranslation(language, 'allMuhurats')}
        </button>
        {muhuratCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm dark:bg-[#853606] dark:text-white dark:border-[#853606]'
                : 'bg-white/80 dark:bg-brand-card hover:bg-slate-50 dark:hover:bg-brand-control border-orange-100/50 dark:border-brand-border text-slate-700 dark:text-brand-text-pri'
            }`}
          >
            {cat.icon}
            {language === 'Hindi' ? cat.hindiName : cat.name}
          </button>
        ))}
      </div>

      {/* Warning regarding Rahu Kaal or special adverse timing if any */}
      <div className="bg-amber-500/5 dark:bg-brand-card rounded-2xl border border-amber-500/20 dark:border-brand-border [box-shadow:0_0_15px_rgba(245,158,11,0.1)] p-3.5 sm:p-4 text-left flex gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-brand-accent flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-brand-accent font-serif">
            {language === 'Hindi' ? "ज्योतिषीय दिशानिर्देश (राहुकाल)" : "Astrological Guidelines (Rahu Kaal)"}
          </h4>
          <p className="text-[10px] sm:text-2xs text-amber-900/90 dark:text-brand-text-sec leading-normal mt-0.5 font-sans">
            {language === 'Hindi'
              ? `कृपया सुनिश्चित करें कि चुना गया समय सक्रिय राहुकाल (${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}) से मेल नहीं खाता है, क्योंकि राहुकाल के दौरान कोई नया काम शुरू करना शुभ नहीं माना जाता है।`
              : `Please ensure the selected time does not overlap with active Rahu Kaal (${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}), as starting new work during Rahu Kaal is considered inauspicious.`}
          </p>
        </div>
      </div>

      {/* Render matching category grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {categoriesFiltered.map((cat) => (
          <div key={cat.id} className="bg-white/5 dark:bg-brand-card backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-brand-border hover:border-orange-500/30 hover:scale-[1.01] hover:translate-y-[-2px] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col justify-between text-left">
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-brand-control">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-orange-950 dark:text-brand-accent font-serif leading-none">
                      {language === 'Hindi' ? cat.hindiName : cat.name}
                    </h3>
                    {language !== 'Hindi' && <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-brand-text-mut block mt-1">{cat.name}</span>}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 animate-pulse">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${idx < cat.rating ? 'text-amber-500 fill-amber-500 [filter:drop-shadow(0_0_2px_rgba(245,158,11,0.5))]' : 'text-slate-200 dark:text-zinc-700'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-[10px] sm:text-2xs text-slate-600 dark:text-brand-text-sec mt-3 border-b border-white/10 dark:border-brand-border pb-3 leading-relaxed">
                {cat.desc}
              </p>

              {/* Slots Timelines list */}
              <div className="space-y-2.5 mt-4">
                <span className="text-[10px] font-bold text-slate-400 dark:text-brand-text-sec uppercase font-mono tracking-wider block font-semibold">
                  {language === 'Hindi' ? "आज के शुभ मुहूर्त" : "Auspicious Timings Today"}
                </span>
                {cat.slots.map((sl, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 dark:bg-brand-control border border-white/10 dark:border-brand-border hover:border-orange-500/20 transition-all duration-300 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-2xs sm:text-xs font-black text-slate-850 dark:text-brand-text-pri font-mono tracking-tight">{sl.time}</span>
                      <span className="text-[9px] font-extrabold bg-[#e8f5e9]/70 dark:bg-emerald-950/40 text-green-800 dark:text-emerald-300 border dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                        {sl.suitability}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-2xs text-slate-600 dark:text-brand-text-sec font-medium">
                      <span className="text-slate-400 dark:text-brand-text-mut text-3xs uppercase font-mono">{language === 'Hindi' ? "लग्न:" : "Lagna:"}</span>
                      <span className="text-orange-950 dark:text-brand-text-pri font-bold bg-orange-50 dark:bg-brand-card border dark:border-brand-border px-1.5 py-0.2 rounded font-sans">{sl.lagna}</span>
                    </div>

                    <div className="text-[9px] sm:text-3xs text-slate-500 dark:text-brand-text-sec italic mt-1 leading-normal font-sans">
                      {language === 'Hindi' ? "🌿 नोट:" : "🌿 Note:"} {sl.advice}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom advice footer */}
            <div className="mt-4 pt-3 border-t border-white/10 dark:border-brand-border flex items-center justify-between text-[10px] text-slate-400 dark:text-brand-text-sec font-mono">
              <span>{language === 'Hindi' ? `संवत् ${panchang.hinduDate.samvatVikram} स्थितियां` : `Samvat ${panchang.hinduDate.samvatVikram} Conditions`}</span>
              <span 
                onClick={onViewAstrologyChart}
                className="text-orange-600 dark:text-brand-accent font-bold hover:underline cursor-pointer font-sans"
              >
                {getTranslation(language, 'viewAstrologyChart')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
