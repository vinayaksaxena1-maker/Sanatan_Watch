/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Star,
  Building,
  Key,
  Truck,
  Heart,
  ShoppingBag,
  Feather,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { PanchangInfo } from '../types';
import { getMuhuratsForPanchang } from '../utils/panchangCalc';
import { checkMuhurats, MuhuratSuitability } from '../utils/muhuratRules';
import { getTranslation, Language } from '../utils/translations';

interface MuhuratScreenProps {
  panchang: PanchangInfo;
  onViewAstrologyChart?: () => void;
  currentTime?: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  language?: Language;
}

const translateShivaVaasDescHindi = (desc?: string): string => {
  if (!desc) return '';
  return desc
    .replace(/Lord Shiva resides on Kailash\..*welfare\./gi, 'भगवान शिव कैलाश पर्वत पर विराजमान हैं। आज रुद्राभिषेक करना अत्यंत शुभ एवं परम कल्याणकारी है।')
    .replace(/Lord Shiva resides with Goddess Gauri\..*happiness\./gi, 'भगवान शिव माता गौरी के साथ विराजमान हैं। आज रुद्राभिषेक करना अत्यंत शुभ फलदायी है, जिससे सुख-समृद्धि की प्राप्ति होती है।')
    .replace(/Lord Shiva is mounted on Nandi.*desires\./gi, 'भगवान शिव नंदी (वृषभ) पर सवार हैं। आज रुद्राभिषेक करना अत्यंत शुभ है और मनोकामनाओं को पूर्ण करता है।')
    .replace(/Lord Shiva is in His Assembly.*sorrow\./gi, 'भगवान शिव अपनी सभा में विराजमान हैं। आज सकाम रुद्राभिषेक करने से बचें।')
    .replace(/Lord Shiva is feeding.*distress\./gi, 'भगवान शिव भोजन कर रहे हैं। आज सकाम रुद्राभिषेक करने से बचें।')
    .replace(/Lord Shiva is playing.*arguments\./gi, 'भगवान शिव क्रीड़ा में लीन हैं। आज सकाम रुद्राभिषेक करने से बचें।')
    .replace(/Lord Shiva resides in the Crematory.*losses\./gi, 'भगवान शिव श्मशान में निवास कर रहे हैं। आज सकाम रुद्राभिषेक टालें।')
    .replace(/Avoid performing Rudrabhishek today\./gi, 'आज रुद्राभिषेक करने से बचें।');
};

const translateAgniVaasDescHindi = (desc?: string): string => {
  if (!desc) return '';
  return desc
    .replace(/Agni resides on Earth \(Prithvi\)\..*success\./gi, 'अग्नि देव पृथ्वी लोक पर निवास कर रहे हैं। आज यज्ञ या हवन करना अत्यंत शुभ है, जिससे सुख, आरोग्य व समृद्धि की प्राप्ति होती है।')
    .replace(/Agni \(Fire\) resides on Earth \(Prithvi\)\..*fulfillment\./gi, 'अग्नि देव पृथ्वी लोक पर निवास कर रहे हैं। आज यज्ञ या हवन करना अत्यंत शुभ है, जिससे सुख-समृद्धि की प्राप्ति होती है।')
    .replace(/Agni resides in the Sky \(Aakash\)\..*expenses\./gi, 'अग्नि देव आकाश लोक में निवास कर रहे हैं। आज यज्ञ अथवा हवन करने से बचें।')
    .replace(/Agni resides in the Netherworld \(Paataal\)\..*disputes\./gi, 'अग्नि देव पाताल लोक में निवास कर रहे हैं। आज यज्ञ अथवा हवन करने से बचें।')
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
    .replace(/Nakshatra ([^.]+) is not recommended for Griha Pravesh\./g, '$1 नक्षत्र में गृह प्रवेश वर्जित है।')
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
    .replace(/Mrigashirsha/gi, 'मृगशिरा').replace(/Ardra/gi, 'आर्द्रा').replace(/Punarvasu/gi, 'पुनर्वसु').replace(/Pushya/gi, 'पुष्य')
    .replace(/Ashlesha/gi, 'आश्लेषा').replace(/Magha/gi, 'मघा')
    .replace(/Purva\s*Phalguni/gi, 'पूर्वाफाल्गुनी').replace(/Purvaphalguni/gi, 'पूर्वाफाल्गुनी')
    .replace(/Uttara\s*Phalguni/gi, 'उत्तराफाल्गुनी').replace(/Uttaraphalguni/gi, 'उत्तराफाल्गुनी')
    .replace(/Hasta/gi, 'हस्त').replace(/Chitra/gi, 'चित्रा').replace(/Swati/gi, 'स्वाति').replace(/Vishakha/gi, 'विशाखा')
    .replace(/Anuradha/gi, 'अनुराधा').replace(/Jyeshtha/gi, 'ज्येष्ठा').replace(/Mula/gi, 'मूल')
    .replace(/Purva\s*Ashadha/gi, 'पूर्वाषाढ़ा').replace(/Purvashadha/gi, 'पूर्वाषाढ़ा')
    .replace(/Uttara\s*Ashadha/gi, 'उत्तराषाढ़ा').replace(/Uttarashadha/gi, 'उत्तराषाढ़ा')
    .replace(/Shravana/gi, 'श्रवण').replace(/Dhanishta/gi, 'धनिष्ठा').replace(/Shatabhisha/gi, 'शतभिषा')
    .replace(/Purva\s*Bhadrapada/gi, 'पूर्वाभाद्रपद').replace(/Purvabhadrapada/gi, 'पूर्वाभाद्रपद')
    .replace(/Uttara\s*Bhadrapada/gi, 'उत्तराभाद्रपद').replace(/Uttarabhadrapada/gi, 'उत्तराभाद्रपद')
    .replace(/Revati/gi, 'रेवती');
};

const translateAdviceEnglish = (advice: string): string => {
  if (!advice) return '';
  return advice
    .replace(/शुक्ल पक्ष अत्यंत अनुकूल है।/g, 'Shukla Paksha is favorable.')
    .replace(/कृष्ण पक्ष में नए गृह प्रवेश को सामान्यतः वर्जित माना जाता है।/g, 'Krishna Paksha is generally avoided for entering new homes.')
    .replace(/गृह प्रवेश हेतु ([^ ]+) नक्षत्र अति उत्तम है।/g, 'Nakshatra $1 is auspicious for Griha Pravesh.')
    .replace(/([^ ]+) नक्षत्र में गृह प्रवेश वर्जित है \(टालें\)।/g, 'Nakshatra $1 is not recommended for Griha Pravesh.')
    .replace(/विवाह हेतु ([^ ]+) नक्षत्र अत्यंत शुभ एवं मंगलकारी है।/g, 'Nakshatra $1 is highly auspicious for wedding.')
    .replace(/([^ ]+) नक्षत्र विवाह हेतु उत्तम नहीं है।/g, 'Nakshatra $1 is not favorable for wedding.')
    .replace(/चातुर्मास में विवाह संस्कार सर्वथा वर्जित हैं।/g, 'Chaturmas is ongoing; wedding ceremonies are deferred.')
    .replace(/वाहन क्रय हेतु ([^ ]+) नक्षत्र शुभ है।/g, 'Nakshatra $1 is favorable for vehicle purchase.')
    .replace(/नक्षत्र ([^ ]+) सामान्य प्रभाव वाला है।/g, 'Nakshatra $1 has moderate effect.')
    .replace(/नक्षत्र (.+) सामान्य है।/g, 'Nakshatra $1 has moderate effect.')
    .replace(/नामकरण संस्कार के लिए ([^ ]+) नक्षत्र अनुकूल है।/g, 'Nakshatra $1 is favorable for naming ceremony.')
    .replace(/व्यापार आरंभ हेतु ([^ ]+) नक्षत्र अत्यंत शुभ है।/g, 'Nakshatra $1 is favorable for business opening.')
    .replace(/व्यापार आरंभ हेतु ([^ ]+) नक्षत्र अत्यंत अनुकूल व फलदायी है।/g, 'Nakshatra $1 is highly favorable for business opening.')
    .replace(/भूमि पूजन हेतु ([^ ]+) नक्षत्र शुभ है।/g, 'Nakshatra $1 is auspicious for foundation laying.')
    .replace(/भूमि पूजन व निर्माण हेतु ([^ ]+) नक्षत्र उत्तम है।/g, 'Nakshatra $1 is auspicious for foundation laying.')
    .replace(/तिथि ([^ ]+) व्यवसाय वृद्धि हेतु शुभ है।/g, 'Tithi $1 is auspicious for business growth.')
    .replace(/तिथि ([^ ]+) में नया व्यवसाय शुरू करने से बचें।/g, 'Avoid starting a new business on Tithi $1.')
    .replace(/वार \(दिन\) व्यापार वृद्धि कारक है।/g, 'Weekday is favorable for business growth.')
    .replace(/तिथि ([^ ]+) नींव पूजन हेतु शुभ है।/g, 'Tithi $1 is auspicious for laying foundation.')
    .replace(/तिथि ([^ ]+) में भूमि पूजन टालें।/g, 'Avoid foundation laying on Tithi $1.')
    .replace(/वार \(दिन\) अनुकूल है।/g, 'Weekday is favorable.')
    .replace(/वार \(दिन\) उत्तम नहीं है।/g, 'Weekday is not ideal.')
    .replace(/वार \(दिन\) वाहन क्रय हेतु अनुकूल है।/g, 'Weekday is favorable for vehicle purchase.')
    .replace(/मंगलवार या शनिवार को वाहन क्रय करने से बचें।/g, 'Avoid purchasing vehicles on Tuesday or Saturday.')
    .replace(/तिथि ([^ ]+) अत्यंत शुभ है।/g, 'Tithi $1 is highly auspicious.')
    .replace(/तिथि ([^ ]+) अनुकूल है।/g, 'Tithi $1 is favorable.')
    .replace(/तिथि ([^ ]+) में यह कार्य वर्जित है।/g, 'Avoid this activity on Tithi $1.')
    .replace(/तिथि ([^ ]+) अशुभ मानी जाती है।/g, 'Tithi $1 is inauspicious.')
    .replace(/तिथि ([^ ]+) खरीदारी हेतु शुभ है।/g, 'Tithi $1 is favorable for major purchases.')
    .replace(/तिथि ([^ ]+) में वाहन खरीदारी से बचें।/g, 'Avoid vehicle purchase on Tithi $1.')
    .replace(/तिथि ([^ ]+) में नामकरण संस्कार न करें।/g, 'Avoid naming ceremonies on Tithi $1.')
    .replace(/अमावस्या या चतुर्दशी को व्यापार आरंभ न करें।/g, 'Avoid starting new business on Amavasya or Chaturdashi.')
    .replace(/अमावस्या को नींव पूजन न करें।/g, 'Avoid laying foundation on Amavasya.')
    .replace(/प्रतिपदा/g, 'Pratipada').replace(/द्वितीया/g, 'Dwitiya').replace(/तृतीया/g, 'Tritiya').replace(/चतुर्थी/g, 'Chaturthi')
    .replace(/पंचमी/g, 'Panchami').replace(/षष्ठी/g, 'Shashthi').replace(/सप्तमी/g, 'Saptami').replace(/अष्टमी/g, 'Ashtami')
    .replace(/नवमी/g, 'Navami').replace(/दशमी/g, 'Dashami').replace(/एकादशी/g, 'Ekadashi').replace(/द्वादशी/g, 'Dwadashi')
    .replace(/त्रयोदशी/g, 'Trayodashi').replace(/चतुर्दशी/g, 'Chaturdashi').replace(/पूर्णिमा/g, 'Purnima').replace(/अमावस्या/g, 'Amavasya')
    .replace(/अश्विनी/g, 'Ashwini').replace(/भरणी/g, 'Bharani').replace(/कृत्तिका/g, 'Krittika').replace(/रोहिणी/g, 'Rohini')
    .replace(/मृगशिरा/g, 'Mrigashirsha').replace(/आर्द्रा/g, 'Ardra').replace(/पुनर्वसु/g, 'Punarvasu').replace(/पुष्य/g, 'Pushya')
    .replace(/आश्लेषा/g, 'Ashlesha').replace(/मघा/g, 'Magha').replace(/पूर्वाफाल्गुनी/g, 'Purvaphalguni').replace(/उत्तराफाल्गुनी/g, 'Uttaraphalguni')
    .replace(/हस्त/g, 'Hasta').replace(/चित्रा/g, 'Chitra').replace(/स्वाति/g, 'Swati').replace(/विशाखा/g, 'Vishakha')
    .replace(/अनुराधा/g, 'Anuradha').replace(/ज्येष्ठा/g, 'Jyeshtha').replace(/मूल/g, 'Mula').replace(/पूर्वाषाढ़ा/g, 'Purvashadha')
    .replace(/उत्तराषाढ़ा/g, 'Uttarashadha').replace(/श्रवण/g, 'Shravana').replace(/धनिष्ठा/g, 'Dhanishta').replace(/शतभिषा/g, 'Shatabhisha')
    .replace(/पूर्वाभाद्रपद/g, 'Purvabhadrapada').replace(/उत्तराभाद्रपद/g, 'Uttarabhadrapada').replace(/रेवती/g, 'Revati');
};

// Helper time parser and formatter
const parseMin = (str: string): number => {
  if (!str) return 360;
  const parts = str.trim().split(' ');
  if (parts.length < 2) return 360;
  const [time, ampm] = parts;
  let [hrs, mins] = time.split(':').map(Number);
  if (isNaN(hrs)) hrs = 6;
  if (isNaN(mins)) mins = 0;
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const formatMinStr = (m: number): string => {
  const norm = ((m % 1440) + 1440) % 1440;
  let hrs = Math.floor(norm / 60);
  const mins = Math.floor(norm % 60);
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

// Exact Minute-based Rahu Kaal trimming math
interface TrimmedSlot {
  timeStr: string;
  isCancelled: boolean;
  warningNote?: string;
}

const trimSlotForRahuKaal = (
  slotStartMin: number,
  slotEndMin: number,
  rahuStartMin: number,
  rahuEndMin: number,
  isHindi: boolean = true
): TrimmedSlot => {
  // If no valid Rahu Kaal interval
  if (rahuStartMin <= 0 || rahuEndMin <= 0 || rahuEndMin <= rahuStartMin) {
    return { timeStr: `${formatMinStr(slotStartMin)} - ${formatMinStr(slotEndMin)}`, isCancelled: false };
  }

  // 1. Entirely inside Rahu Kaal -> Cancelled / Avoided
  if (slotStartMin >= rahuStartMin && slotEndMin <= rahuEndMin) {
    return {
      timeStr: `${formatMinStr(slotStartMin)} - ${formatMinStr(slotEndMin)}`,
      isCancelled: true,
      warningNote: isHindi ? 'राहुकाल व्याप्त होने के कारण त्याज्य' : 'Avoided due to Rahu Kaal overlap'
    };
  }

  // 2. Starts before Rahu Kaal, ends during Rahu Kaal -> Trim end to Rahu Kaal start
  if (slotStartMin < rahuStartMin && slotEndMin > rahuStartMin && slotEndMin <= rahuEndMin) {
    return {
      timeStr: `${formatMinStr(slotStartMin)} - ${formatMinStr(rahuStartMin)}`,
      isCancelled: false,
      warningNote: isHindi 
        ? `${formatMinStr(rahuStartMin)} से राहुकाल प्रारंभ, अतः पूर्व ही संपन्न करें` 
        : `Rahu Kaal begins at ${formatMinStr(rahuStartMin)}, conclude prior`
    };
  }

  // 3. Starts during Rahu Kaal, ends after Rahu Kaal -> Trim start to Rahu Kaal end
  if (slotStartMin >= rahuStartMin && slotStartMin < rahuEndMin && slotEndMin > rahuEndMin) {
    return {
      timeStr: `${formatMinStr(rahuEndMin)} - ${formatMinStr(slotEndMin)}`,
      isCancelled: false,
      warningNote: isHindi 
        ? `${formatMinStr(rahuEndMin)} राहुकाल समाप्ति उपरांत अनुकूल` 
        : `Favorable after Rahu Kaal ends at ${formatMinStr(rahuEndMin)}`
    };
  }

  // 4. Fully encloses Rahu Kaal -> Trim to pre-rahu segment
  if (slotStartMin < rahuStartMin && slotEndMin > rahuEndMin) {
    return {
      timeStr: `${formatMinStr(slotStartMin)} - ${formatMinStr(rahuStartMin)}`,
      isCancelled: false,
      warningNote: isHindi 
        ? `${formatMinStr(rahuStartMin)} से ${formatMinStr(rahuEndMin)} तक राहुकाल का त्याग करें` 
        : `Avoid Rahu Kaal period from ${formatMinStr(rahuStartMin)} to ${formatMinStr(rahuEndMin)}`
    };
  }

  // No overlap
  return {
    timeStr: `${formatMinStr(slotStartMin)} - ${formatMinStr(slotEndMin)}`,
    isCancelled: false
  };
};

export function MuhuratScreen({ 
  panchang, 
  onViewAstrologyChart, 
  currentTime,
  selectedDate,
  onDateChange,
  language = 'Hindi'
}: MuhuratScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const allMuhurats = getMuhuratsForPanchang(panchang);
  const ruleMuhurats = checkMuhurats(panchang);

  const sMin = parseMin(panchang.sunrise);
  const eMin = parseMin(panchang.sunset);

  const rahuStartMin = panchang.rahuKaal?.start ? parseMin(panchang.rahuKaal.start) : 0;
  const rahuEndMin = panchang.rahuKaal?.end ? parseMin(panchang.rahuKaal.end) : 0;
  
  const dayOfYear = Math.floor((selectedDate.getTime() - new Date(selectedDate.getFullYear(), 0, 0).getTime()) / 86400000);
  const rashis = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
  const rashisEng = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

  const getDynamicLagna = (baseIdx: number) => {
    const idx = (baseIdx + dayOfYear) % 12;
    return language === 'Hindi' ? `${rashis[idx]} लग्न` : `${rashisEng[idx]} Lagna`;
  };

  // Date Navigation Helpers
  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = (() => {
    const now = new Date();
    return selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
  })();

  const formattedDateHindi = selectedDate.toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const dateInputVal = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    }
  };

  // Rule Lookups
  const vivahRule = ruleMuhurats.find(r => r.type === 'vivah');
  const gpRule = ruleMuhurats.find(r => r.type === 'griha_pravesh');
  const namkaranRule = ruleMuhurats.find(r => r.type === 'namkaran');
  const vahanRule = ruleMuhurats.find(r => r.type === 'vahan_purchase');
  const vyaparRule = ruleMuhurats.find(r => r.type === 'business');
  const bhoomiRule = ruleMuhurats.find(r => r.type === 'land');

  const isHindi = language === 'Hindi';

  // Categories with Computed Rules and Trimmed Rahu Kaal slots
  const muhuratCategories = [
    {
      id: 'business',
      name: 'Business Opening',
      hindiName: 'व्यापार आरंभ मुहूर्त',
      shortName: 'व्यापार आरंभ',
      shortNameEnglish: 'Business',
      desc: isHindi ? 'नया व्यवसाय, दुकान, प्रतिष्ठान या व्यावसायिक समझौते की शुरुआत के लिए।' : 'For starting a new business, shop, or commercial office.',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      rule: vyaparRule,
      isSuitable: vyaparRule ? vyaparRule.isSuitable : true,
      score: vyaparRule ? vyaparRule.score : 85,
      rating: vyaparRule ? Math.max(1, Math.round(vyaparRule.score / 20)) : 5,
      rawSlots: [
        { 
          startMin: sMin + 345,
          endMin: sMin + 435,
          lagna: `${getDynamicLagna(9)} (${isHindi ? 'स्थिर/शुभ' : 'Fixed/Auspicious'}) • ${isHindi ? 'अभिजीत संयोग' : 'Abhijit'}`,
          suitability: isHindi ? 'सर्वोत्तम (अमृत चौघड़िया)' : 'Best (Amrit Choghadiya)', 
          advice: isHindi 
            ? 'व्यवसाय में निरंतर वृद्धि और ग्राहकों से लाभ के लिए दिन का सर्वश्रेष्ठ समय।' 
            : 'Best time of the day for steady business growth and customer prosperity.'
        },
        { 
          startMin: eMin - 120,
          endMin: eMin - 30,
          lagna: `${getDynamicLagna(8)} (${isHindi ? 'शुभ' : 'Auspicious'})`,
          suitability: isHindi ? 'अच्छा (लाभ चौघड़िया)' : 'Good (Labh Choghadiya)', 
          advice: isHindi 
            ? 'डिजाइन, तकनीक, नवीन सौदों व संपर्क स्थापित करने हेतु शुभ।' 
            : 'Favorable for creative work, technology, new deals, and networking.'
        }
      ]
    },
    {
      id: 'land',
      name: 'Bhoomi Pujan',
      hindiName: 'भूमि पूजन व निर्माण मुहूर्त',
      shortName: 'भूमि पूजन',
      shortNameEnglish: 'Bhoomi Pujan',
      desc: isHindi ? 'भूमि क्रय, शिलान्यास, नींव पूजन और नवीन निर्माण कार्य शुरू करने के लिए।' : 'Auspicious beginning for property, land worship, and foundation laying.',
      icon: <Building className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      rule: bhoomiRule,
      isSuitable: bhoomiRule ? bhoomiRule.isSuitable : true,
      score: bhoomiRule ? bhoomiRule.score : 75,
      rating: bhoomiRule ? Math.max(1, Math.round(bhoomiRule.score / 20)) : 4,
      rawSlots: [
        { 
          startMin: sMin + 30,
          endMin: sMin + 150,
          lagna: `${getDynamicLagna(7)} (${isHindi ? 'स्थिर' : 'Fixed'})`,
          suitability: isHindi ? 'शुभ (शुभ चौघड़िया)' : 'Auspicious (Shubh Choghadiya)', 
          advice: isHindi 
            ? 'प्रातःकाल भूमि का शुद्धिकरण व प्रथम पूजन करने हेतु अनुकूल।' 
            : 'Auspicious for morning land purification and initial worship.'
        },
        { 
          startMin: sMin + 225,
          endMin: sMin + 330,
          lagna: `${getDynamicLagna(9)} (${isHindi ? 'मकर लग्न' : 'Capricorn Lagna'})`,
          suitability: isHindi ? 'उत्तम (स्थिर लग्न)' : 'Excellent (Fixed Lagna)', 
          advice: isHindi 
            ? 'स्थायी नींव रखने और निर्माण कार्य प्रारंभ करने के लिए श्रेष्ठ।' 
            : 'Ideal for laying permanent foundation stones and starting construction.'
        }
      ]
    },
    {
      id: 'naming',
      name: 'Naamkaran',
      hindiName: 'नामकरण संस्कार मुहूर्त',
      shortName: 'नामकरण',
      shortNameEnglish: 'Naming',
      desc: isHindi ? 'नवजात शिशु के नामकरण संस्कार और प्रथम मंगल विधान हेतु।' : 'Muhurat for newborn baby naming ceremony.',
      icon: <Feather className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      rule: namkaranRule,
      isSuitable: namkaranRule ? namkaranRule.isSuitable : true,
      score: namkaranRule ? namkaranRule.score : 65,
      rating: namkaranRule ? Math.max(1, Math.round(namkaranRule.score / 20)) : 3,
      rawSlots: [
        { 
          startMin: sMin + 180,
          endMin: sMin + 360,
          lagna: `${getDynamicLagna(4)} (${isHindi ? 'शुभ' : 'Auspicious'})`,
          suitability: isHindi ? 'शुभ (उत्तम)' : 'Auspicious (Best)', 
          advice: isHindi 
            ? 'शिशु की दीर्घायु, उत्तम स्वास्थ्य व बुद्धिमत्ता हेतु शुभ मुहूर्त।' 
            : 'Auspicious time for infant longevity, health, and wisdom.'
        },
        { 
          startMin: sMin + 480,
          endMin: sMin + 570,
          lagna: `${getDynamicLagna(5)}`,
          suitability: isHindi ? 'शुभ (लाभ)' : 'Auspicious (Labh)', 
          advice: isHindi 
            ? 'स्वर्ण आभूषण धारण कराने व आशीर्वाद प्राप्ति हेतु अनुकूल।' 
            : 'Favorable for gifting gold, sacred blessings, and family celebrations.'
        }
      ]
    },
    {
      id: 'vehicle',
      name: 'Vehicle Purchase',
      hindiName: 'वाहन क्रय मुहूर्त',
      shortName: 'वाहन क्रय',
      shortNameEnglish: 'Vehicle',
      desc: isHindi ? 'कार, बाइक, स्कूटर या व्यावसायिक वाहन की खरीद व घर लाने हेतु।' : 'For purchase and delivery of vehicles or commercial transports.',
      icon: <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      rule: vahanRule,
      isSuitable: vahanRule ? vahanRule.isSuitable : true,
      score: vahanRule ? vahanRule.score : 60,
      rating: vahanRule ? Math.max(1, Math.round(vahanRule.score / 20)) : 3,
      rawSlots: [
        { 
          startMin: sMin + 270,
          endMin: sMin + 450,
          lagna: `${getDynamicLagna(10)} (${isHindi ? 'चर' : 'Movable'})`,
          suitability: isHindi ? 'अत्यंत शुभ (शुभ चौघड़िया)' : 'Highly Auspicious (Shubh Choghadiya)', 
          advice: isHindi 
            ? 'धातु व इलेक्ट्रॉनिक वाहनों की खरीद के लिए शुभ समय।' 
            : 'Auspicious time for purchase of metallic and electronic vehicles.'
        },
        { 
          startMin: eMin - 210,
          endMin: eMin - 120,
          lagna: `${getDynamicLagna(0)} (${isHindi ? 'चर लग्न' : 'Movable Lagna'})`,
          suitability: isHindi ? 'शुभ (चल चौघड़िया)' : 'Auspicious (Chal Choghadiya)', 
          advice: isHindi 
            ? 'वाहन की डिलीवरी लेकर घर में प्रवेश कराने हेतु उपयुक्त।' 
            : 'Suitable for taking delivery and driving the vehicle home.'
        }
      ]
    },
    {
      id: 'house',
      name: 'Griha Pravesh',
      hindiName: 'गृह प्रवेश मुहूर्त',
      shortName: 'गृह प्रवेश',
      shortNameEnglish: 'Griha Pravesh',
      desc: isHindi ? 'नए घर, फ्लैट या संपत्ति में गृह प्रवेश व वास्तु पूजन के लिए।' : 'For entering and starting living in a new home or property.',
      icon: <Key className="w-5 h-5 text-orange-600 dark:text-amber-500" />,
      rule: gpRule,
      isSuitable: gpRule ? gpRule.isSuitable : false,
      score: gpRule ? gpRule.score : 30,
      rating: gpRule ? Math.max(1, Math.round(gpRule.score / 20)) : 1,
      rawSlots: [
        { 
          startMin: sMin + 165,
          endMin: sMin + 330,
          lagna: `${getDynamicLagna(1)} (${isHindi ? 'वृषभ लग्न' : 'Taurus Lagna'})`,
          suitability: isHindi ? 'वैकल्पिक समय' : 'Alternative Time', 
          advice: isHindi 
            ? 'यदि अति आवश्यक हो तो केवल सामान्य घरेलू सामान शिफ्टिंग हेतु उपयोग करें।' 
            : 'Use only for minor household shifting if urgently necessary.'
        },
        { 
          startMin: sMin + 345,
          endMin: sMin + 395,
          lagna: `${getDynamicLagna(3)} (${isHindi ? 'कर्क लग्न' : 'Cancer Lagna'})`,
          suitability: isHindi ? 'वैकल्पिक समय' : 'Alternative Time', 
          advice: isHindi 
            ? 'अभिजीत वेला का सामान्य संयोग। मुख्य गृह प्रवेश मंगल दिवस पर ही करें।' 
            : 'Moderate Abhijit period. Perform primary house warming on a favorable day.'
        }
      ]
    },
    {
      id: 'marriage',
      name: 'Vivah (Marriage)',
      hindiName: 'विवाह मुहूर्त',
      shortName: 'विवाह',
      shortNameEnglish: 'Marriage',
      desc: isHindi ? 'पाणिग्रहण संस्कार, विवाह फेरे व वैवाहिक मंगल विधान के लिए।' : 'For the sacred bond of marriage under the blessings of Vedic deities.',
      icon: <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      rule: vivahRule,
      isSuitable: vivahRule ? vivahRule.isSuitable : false,
      score: vivahRule ? vivahRule.score : 20,
      rating: vivahRule ? Math.max(1, Math.round(vivahRule.score / 20)) : 1,
      rawSlots: [
        { 
          startMin: sMin + 75,
          endMin: sMin + 270,
          lagna: `${getDynamicLagna(2)} (${isHindi ? 'मिथुन लग्न' : 'Gemini Lagna'})`,
          suitability: isHindi ? 'वैकल्पिक समय' : 'Alternative Time', 
          advice: isHindi 
            ? 'वर्तमान में विवाह मुहूर्त शास्त्रसम्मत नहीं है। सगाई या वार्तालाप कर सकते हैं।' 
            : 'Not recommended for wedding vows today. Engagement or talks may proceed.'
        },
        { 
          startMin: eMin - 165,
          endMin: eMin + 60,
          lagna: `${getDynamicLagna(6)} (${isHindi ? 'तुला लग्न' : 'Libra Lagna'})`,
          suitability: isHindi ? 'वैकल्पिक समय' : 'Alternative Time', 
          advice: isHindi 
            ? 'केवल सामान्य पारिवारिक मेल-मिलाप हेतु समय।' 
            : 'Suitable only for general family meetings and gatherings.'
        }
      ]
    }
  ];

  // Process categories with trimmed Rahu Kaal slots
  const processedCategories = muhuratCategories.map(cat => {
    const slots = cat.rawSlots.map(raw => {
      const trimmed = trimSlotForRahuKaal(raw.startMin, raw.endMin, rahuStartMin, rahuEndMin, isHindi);
      return {
        time: trimmed.timeStr,
        isCancelled: trimmed.isCancelled,
        warningNote: trimmed.warningNote,
        lagna: raw.lagna,
        suitability: cat.isSuitable 
          ? raw.suitability
          : (isHindi ? 'वैकल्पिक समय (अति आवश्यक होने पर)' : 'Alternative Time (Urgent Only)'),
        advice: cat.rule && cat.rule.reasons.length > 0
          ? (isHindi ? translateAdviceHindi(cat.rule.reasons[0]) : translateAdviceEnglish(cat.rule.reasons[0]))
          : raw.advice
      };
    });

    return {
      ...cat,
      slots
    };
  });

  // Quick Verdict Categorization
  const shivaIsAuspicious = panchang.shivaVaas?.isAuspicious ?? false;
  const agniIsAuspicious = panchang.agniVaas?.isAuspicious ?? false;

  const quickUttam: Array<{ name: string; id: string; score: number }> = [];
  const quickMadhyam: Array<{ name: string; id: string; score: number }> = [];
  const quickTalen: Array<{ name: string; id: string; reason: string }> = [];

  processedCategories.forEach(cat => {
    const displayName = isHindi ? cat.shortName : cat.shortNameEnglish;
    if (cat.score >= 70) {
      quickUttam.push({ name: displayName, id: cat.id, score: cat.score });
    } else if (cat.score >= 40) {
      quickMadhyam.push({ name: displayName, id: cat.id, score: cat.score });
    } else {
      const reason = isHindi
        ? (cat.id === 'house' ? 'शतभिषा नक्षत्र' : cat.id === 'marriage' ? 'चातुर्मास / नक्षत्र' : 'नक्षत्र प्रतिकूल')
        : (cat.id === 'house' ? 'Shatabhisha Nakshatra' : cat.id === 'marriage' ? 'Chaturmas / Nakshatra' : 'Adverse Nakshatra');
      quickTalen.push({ name: displayName, id: cat.id, reason });
    }
  });

  // Add Rituals to Quick Verdict
  if (shivaIsAuspicious) {
    quickUttam.push({ name: isHindi ? 'रुद्राभिषेक' : 'Rudrabhishek', id: 'rituals', score: 85 });
  } else {
    quickTalen.push({ 
      name: isHindi ? 'रुद्राभिषेक' : 'Rudrabhishek', 
      id: 'rituals', 
      reason: isHindi ? 'शिव सभा/क्रीड़ा में' : (panchang.shivaVaas?.residence ? `Shiva in ${panchang.shivaVaas.residence}` : 'Inauspicious') 
    });
  }

  if (agniIsAuspicious) {
    quickUttam.push({ name: isHindi ? 'हवन/यज्ञ' : 'Havan/Yajna', id: 'rituals', score: 80 });
  } else {
    const agniLoc = panchang.agniVaas?.residenceHindi || 'पाताल';
    const agniLocEng = panchang.agniVaas?.residence || 'Paataal';
    quickTalen.push({ 
      name: isHindi ? 'हवन/यज्ञ' : 'Havan/Yajna', 
      id: 'rituals', 
      reason: isHindi ? `अग्नि ${agniLoc} में` : `Agni in ${agniLocEng}` 
    });
  }

  // Active Slots for Live Indicator
  const getActiveSlots = () => {
    const now = currentTime || new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const active: Array<{
      categoryName: string;
      categoryHindiName: string;
      icon: React.ReactNode;
      time: string;
      lagna: string;
      suitability: string;
      advice: string;
    }> = [];

    processedCategories.forEach(cat => {
      cat.slots.forEach(slot => {
        if (slot.isCancelled) return;
        const [startStr, endStr] = slot.time.split(' - ');
        if (startStr && endStr) {
          const start = parseMin(startStr);
          const end = parseMin(endStr);
          const inRange = start <= end
            ? currentMin >= start && currentMin < end
            : currentMin >= start || currentMin < end;

          if (inRange) {
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
        }
      });
    });

    return active;
  };

  const activeSlots = getActiveSlots();

  const categoriesFiltered = selectedCategory === 'all'
    ? processedCategories
    : selectedCategory === 'rituals'
      ? []
      : processedCategories.filter(m => m.id === selectedCategory);

  return (
    <div id="muhurat_screen_root" className="space-y-3.5 sm:space-y-4.5">
      
      {/* 1. TOP DATE BAR (WebView Safe Input Overlay + Prev/Next Buttons) */}
      <div className="flex items-center justify-between gap-1.5 bg-white/80 dark:bg-[#120B08]/60 p-2 sm:p-2.5 rounded-2xl border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 shadow-xs">
        <button 
          onClick={goToPreviousDay}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-white/5 dark:hover:bg-white/10 text-orange-800 dark:text-orange-200 text-xs font-bold font-sans cursor-pointer transition-colors"
          title={isHindi ? "पिछला दिन" : "Previous Day"}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isHindi ? "पिछला दिन" : "Previous Day"}</span>
        </button>

        {/* WebView-Safe Date Display with Transparent Input Overlay */}
        <div className="relative flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/30 text-orange-950 dark:text-amber-100 font-sans font-bold text-xs sm:text-sm cursor-pointer">
          <Calendar className="w-4 h-4 text-orange-600 dark:text-amber-400 shrink-0 pointer-events-none" />
          <span className="pointer-events-none truncate font-bold">{formattedDateHindi}</span>
          <input
            type="date"
            ref={dateInputRef}
            value={dateInputVal}
            onChange={handleDateChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title={isHindi ? "मुहूर्त तिथि बदलें" : "Change Muhurat Date"}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {!isToday && (
            <button 
              onClick={goToToday}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-500/30 font-sans cursor-pointer transition-colors"
            >
              {isHindi ? "आज" : "Today"}
            </button>
          )}
          <button 
            onClick={goToNextDay}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-white/5 dark:hover:bg-white/10 text-orange-800 dark:text-orange-200 text-xs font-bold font-sans cursor-pointer transition-colors"
            title={isHindi ? "अगला दिन" : "Next Day"}
          >
            <span className="hidden sm:inline">{isHindi ? "अगला दिन" : "Next Day"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CATEGORY FILTER CHIPS (Horizontal Scrollable Chips) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-850 !border-[#FF9933]/45 dark:!border-[#FF9933]/30 text-slate-700 dark:text-slate-300'
          }`}
        >
          {language === 'Hindi' ? "✨ सभी कार्य" : "✨ All Muhurats"}
        </button>
        {processedCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-850 !border-[#FF9933]/45 dark:!border-[#FF9933]/30 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat.icon}
            {language === 'Hindi' ? cat.shortName : cat.name}
          </button>
        ))}
        {/* Rituals Filter Chip */}
        <button
          onClick={() => setSelectedCategory('rituals')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
            selectedCategory === 'rituals'
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-850 !border-[#FF9933]/45 dark:!border-[#FF9933]/30 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-600 dark:text-amber-400" />
          {language === 'Hindi' ? "हवन व रुद्राभिषेक" : "Havan & Rituals"}
        </button>
      </div>

      {/* 3. QUICK VERDICT SUMMARY BANNER (आज की मुहूर्त सारांश तालिका) */}
      <div className="bg-white/85 dark:bg-[#120B08]/70 backdrop-blur-md rounded-3xl border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 p-3 sm:p-4 text-left shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#FF9933]/25 dark:border-[#FF9933]/15 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">📊</span>
            <div>
              <h4 className="text-[14px] sm:text-[15.5px] font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                {language === 'Hindi' ? "आज की मुहूर्त सारांश तालिका" : "Today's Muhurat Verdict"}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                {language === 'Hindi' ? "शास्त्रसम्मत शुभाशुभ निर्णय (3 सेकंड में त्वरित दर्शन)" : "Quick decision summary for all activities"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs font-sans">
          {/* Row 1: आज उत्तम */}
          <div className="flex items-start gap-2 pt-0.5">
            <span className="shrink-0 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-1 min-w-[76px] sm:min-w-[85px] text-[11.5px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {language === 'Hindi' ? "आज उत्तम:" : "Best:"}
            </span>
            <div className="flex flex-wrap gap-1.5 flex-grow">
              {quickUttam.length > 0 ? (
                quickUttam.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(item.id)}
                    className="px-2 py-0.5 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/40 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <span className="text-slate-400 italic text-[11px]">{language === 'Hindi' ? "कोई विशेष उत्तम योग नहीं" : "None"}</span>
              )}
            </div>
          </div>

          {/* Row 2: मध्यम अनुकूल */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-1 min-w-[76px] sm:min-w-[85px] text-[11.5px]">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {language === 'Hindi' ? "मध्यम:" : "Moderate:"}
            </span>
            <div className="flex flex-wrap gap-1.5 flex-grow">
              {quickMadhyam.length > 0 ? (
                quickMadhyam.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(item.id)}
                    className="px-2 py-0.5 rounded-lg bg-amber-100/70 hover:bg-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300/40 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <span className="text-slate-400 italic text-[11px]">{language === 'Hindi' ? "—" : "None"}</span>
              )}
            </div>
          </div>

          {/* Row 3: आज टालें */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-rose-800 dark:text-rose-300 font-extrabold flex items-center gap-1 min-w-[76px] sm:min-w-[85px] text-[11.5px]">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              {language === 'Hindi' ? "आज टालें:" : "Avoid:"}
            </span>
            <div className="flex flex-wrap gap-1.5 flex-grow">
              {quickTalen.length > 0 ? (
                quickTalen.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(item.id)}
                    className="px-2 py-0.5 rounded-lg bg-rose-100/70 hover:bg-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-900 dark:text-rose-200 border border-rose-300/40 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    {item.name} <span className="opacity-75 font-normal text-[10px]">({item.reason})</span>
                  </button>
                ))
              ) : (
                <span className="text-slate-400 italic text-[11px]">{language === 'Hindi' ? "कोई वर्जित कार्य नहीं" : "None"}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE ACTIVE MUHURAT DETECTOR (यदि अभी कोई समय स्लॉट एक्टिव हो) */}
      {activeSlots.length > 0 && selectedCategory !== 'rituals' && (
        <div className="glass-card-light dark:glass-card-dark p-3 sm:p-3.5 shadow-sm text-left relative overflow-hidden border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#FF9933]/25 dark:border-[#FF9933]/15 mb-2">
            <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center gap-1.5 leading-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {language === 'Hindi' ? "लाइव सक्रिय मुहूर्त संसूचक" : "Live Active Muhurat"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isHindi ? "वर्तमान समय अनुकूल" : "Currently Favorable"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeSlots.map((slot, idx) => (
              <div key={idx} className="bg-emerald-50/30 dark:bg-emerald-950/15 p-2.5 rounded-2xl border !border-[#FF9933]/25 dark:!border-[#FF9933]/15 flex gap-2.5 items-start">
                <div className="p-1.5 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/30 shrink-0">
                  {slot.icon}
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13.5px] font-serif font-black text-slate-850 dark:text-orange-50">
                      {language === 'Hindi' ? slot.categoryHindiName : slot.categoryName}
                    </span>
                    <span className="text-[9.5px] font-bold bg-emerald-500 text-white dark:bg-emerald-600 px-1.5 py-0.5 rounded">
                      {slot.suitability}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 mt-0.5 font-mono">
                    {slot.time}
                  </div>
                  <div className="text-[10.5px] text-orange-950 dark:text-orange-200 mt-0.5 font-medium">
                    {slot.lagna}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SPECIFIC MUHURAT CARDS (With Synchronized Stars & Conditional Badges) */}
      {categoriesFiltered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {categoriesFiltered.map((cat) => (
            <div key={cat.id} className="bg-white/85 dark:bg-[#120B08]/70 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 hover:border-[#FF9933]/65 transition-all duration-300 flex flex-col justify-between text-left shadow-xs">
              <div>
                {/* Header: Title + Stars */}
                <div className="flex justify-between items-start pb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/50 dark:border-white/5">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-[16px] sm:text-[17.5px] font-extrabold text-[#9A3412] dark:text-amber-300 font-serif leading-none">
                        {language === 'Hindi' ? cat.hindiName : cat.name}
                      </h3>
                      {language !== 'Hindi' && <span className="text-[10px] text-slate-400 block mt-0.5">{cat.hindiName}</span>}
                    </div>
                  </div>

                  {/* Stars with numeric count */}
                  <div className="flex items-center gap-1 bg-orange-50 dark:bg-white/5 px-2 py-1 rounded-xl border border-orange-200/40 dark:border-white/5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < cat.rating 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 font-mono ml-0.5">
                      ({cat.rating}/5)
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-2 font-sans leading-relaxed">
                  {cat.desc}
                </p>

                {/* Status Callout Banner */}
                <div className={`mt-2 p-2 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 border ${
                  cat.isSuitable 
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 border-emerald-300/40' 
                    : 'bg-rose-50/80 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 border-rose-300/40'
                }`}>
                  {cat.isSuitable ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{language === 'Hindi' ? "आज नक्षत्र व तिथि इस कार्य हेतु अनुकूल हैं।" : "Auspicious alignments today."}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>
                        {language === 'Hindi' 
                          ? (cat.rule?.reasons[0] ? translateAdviceHindi(cat.rule.reasons[0]) : "आज नक्षत्र/तिथि प्रतिकूल है। मुख्य कार्य टालें।") 
                          : (cat.rule?.reasons[0] ? translateAdviceEnglish(cat.rule.reasons[0]) : "Adverse conditions today. Avoid major events.")}
                      </span>
                    </>
                  )}
                </div>

                {/* Slots Timelines list */}
                <div className="space-y-2 mt-3">
                  <span className="text-[12.5px] font-bold text-stone-700 dark:text-stone-300 font-sans block text-left">
                    {cat.isSuitable 
                      ? (language === 'Hindi' ? "आज के श्रेष्ठ समय स्लॉट:" : "Auspicious Time Slots:")
                      : (language === 'Hindi' ? "वैकल्पिक समय (केवल अति आवश्यक होने पर):" : "Alternative Timings (Urgent Only):")
                    }
                  </span>

                  {cat.slots.map((sl, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        sl.isCancelled 
                          ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30 opacity-70'
                          : 'bg-white/60 dark:bg-white/3 border !border-[#FF9933]/30 dark:!border-[#FF9933]/15'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className={`text-xs sm:text-[13px] font-bold font-mono tracking-tight ${
                          sl.isCancelled ? 'line-through text-rose-500' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {sl.time}
                        </span>

                        {sl.isCancelled ? (
                          <span className="text-[9.5px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono">
                            {language === 'Hindi' ? "राहुकाल (त्याज्य)" : "Rahu Kaal"}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans ${
                            cat.isSuitable
                              ? 'bg-[#e8f5e9] dark:bg-green-950/40 text-green-900 dark:text-green-300 border border-green-200 dark:border-green-800/40'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300/40'
                          }`}>
                            {sl.suitability}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-slate-600 dark:text-slate-400">
                        <span className="text-stone-400 text-[10px] uppercase font-mono">{language === 'Hindi' ? "लग्न:" : "Lagna:"}</span>
                        <span className="text-orange-950 dark:text-orange-200 font-bold bg-orange-100/60 dark:bg-orange-950/40 px-1.5 py-0.5 rounded font-sans">{sl.lagna}</span>
                      </div>

                      <div className="text-[12px] text-stone-700 dark:text-stone-300 mt-1 leading-normal font-sans font-normal">
                        🌿 {language === 'Hindi' ? translateAdviceHindi(sl.advice) : translateAdviceEnglish(sl.advice)}
                      </div>

                      {sl.warningNote && !sl.isCancelled && (
                        <div className="mt-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 font-sans flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{sl.warningNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Clear Action Verdict */}
              <div className="mt-3 pt-2.5 border-t border-[#FF9933]/25 dark:border-[#FF9933]/15 flex items-center justify-between text-[11.5px] font-sans">
                <span className={`font-bold ${cat.isSuitable ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {cat.isSuitable 
                    ? (language === 'Hindi' ? "✅ आज यह कार्य करने हेतु शुभ दिन है" : "✅ Favorable day for this activity")
                    : (language === 'Hindi' ? "⚠️ आज मुख्य मुहूर्त नहीं है (केवल वैकल्पिक समय)" : "⚠️ No primary muhurat today")
                  }
                </span>
                <span 
                  onClick={onViewAstrologyChart}
                  className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                >
                  {getTranslation(language, 'viewAstrologyChart')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. RITUALS CARD (शिववास व अग्निवास - Shown on 'all' and 'rituals') */}
      {(selectedCategory === 'all' || selectedCategory === 'rituals') && (
        <div id="rituals_card" className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left rounded-3xl border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#FF9933]/25 dark:border-[#FF9933]/15 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">🔥</span>
              <div>
                <h3 className="text-[15px] sm:text-[17px] font-extrabold text-[#9A3412] dark:text-amber-300 font-serif leading-none">
                  {language === 'Hindi' ? "दैनिक अनुष्ठान, रुद्राभिषेक व हवन विचार" : "Daily Rituals & Havan Guidance"}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5 block">
                  {language === 'Hindi' ? "शिववास व अग्निवास की स्थिति के अनुसार निर्णय" : "Based on Shiva Vaas and Agni Vaas"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Shiva Vaas */}
            {panchang.shivaVaas && (
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/3 border !border-[#FF9933]/25 dark:!border-[#FF9933]/15 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 font-serif">
                    🔱 {language === 'Hindi' ? "शिववास (रुद्राभिषेक):" : "Shiva Vaas (Rudrabhishek):"}
                  </span>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                    panchang.shivaVaas.isAuspicious
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}>
                    {panchang.shivaVaas.isAuspicious ? (language === 'Hindi' ? '✨ शुभ (फलदायी)' : 'Auspicious') : (language === 'Hindi' ? '⚠️ वर्जित (टालें)' : 'Avoid')}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  <strong>{language === 'Hindi' ? "स्थान:" : "Location:"}</strong> {language === 'Hindi' ? (panchang.shivaVaas.residenceHindi || panchang.shivaVaas.residence) : panchang.shivaVaas.residence} — {language === 'Hindi' ? translateShivaVaasDescHindi(panchang.shivaVaas.description) : panchang.shivaVaas.description}
                </p>
              </div>
            )}

            {/* Agni Vaas */}
            {panchang.agniVaas && (
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-white/3 border !border-[#FF9933]/25 dark:!border-[#FF9933]/15 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 font-serif">
                    🔥 {language === 'Hindi' ? "अग्निवास (यज्ञ/हवन):" : "Agni Vaas (Havan/Yajna):"}
                  </span>
                  <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                    panchang.agniVaas.isAuspicious
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}>
                    {panchang.agniVaas.isAuspicious ? (language === 'Hindi' ? '✨ शुभ (फलदायी)' : 'Auspicious') : (language === 'Hindi' ? '⚠️ वर्जित (टालें)' : 'Avoid')}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  <strong>{language === 'Hindi' ? "स्थान:" : "Location:"}</strong> {language === 'Hindi' ? (panchang.agniVaas.residenceHindi || panchang.agniVaas.residence) : panchang.agniVaas.residence} — {language === 'Hindi' ? translateAgniVaasDescHindi(panchang.agniVaas.description) : panchang.agniVaas.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. GENERAL SHUBH & VARJIT SAMAY CHAKRA (Responsive 1-col on mobile, 2-col on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        
        {/* Left Column: शुभ मुहूर्त व योग */}
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left rounded-3xl border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#FF9933]/25 dark:border-[#FF9933]/15">
              <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">✨</span>
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                  {language === 'Hindi' ? "आज के सामान्य शुभ मुहूर्त" : "General Auspicious Muhurats"}
                </h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans mt-0.5 block">
                  {language === 'Hindi' ? "दैनिक कार्यों हेतु शुभ समयावधि" : "Auspicious daily timings"}
                </span>
              </div>
            </div>

            {/* Timings List */}
            <div className="space-y-1.5 text-[13px]">
              {allMuhurats
                .filter(m => m.type !== 'Ashubh')
                .map((m, idx) => {
                  const mStart = parseMin(m.startTime);
                  const mEnd = parseMin(m.endTime);
                  const isRahuOverlap = rahuStartMin > 0 && (
                    (mStart >= rahuStartMin && mEnd <= rahuEndMin) ||
                    (mStart === rahuStartMin && mEnd === rahuEndMin)
                  );

                  return (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100/60 dark:border-slate-800/20">
                      <span className="text-slate-600 dark:text-slate-300 font-medium text-[12.5px] font-sans">
                        {language === 'Hindi' ? (m.hindiName || m.name) : m.name}:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold font-mono text-[12.5px] ${isRahuOverlap ? 'line-through text-rose-500' : 'text-slate-900 dark:text-emerald-300'}`}>
                          {m.startTime} - {m.endTime}
                        </span>
                        {isRahuOverlap && (
                          <span className="text-[9.5px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.2 rounded border border-rose-300/40">
                            {language === 'Hindi' ? "राहुकाल" : "Rahu Kaal"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Shubh Yogas List */}
            {((panchang.shubhYogas && panchang.shubhYogas.length > 0) || (panchang.pushkarYog && panchang.pushkarYog.active)) && (
              <div className="mt-2.5 pt-2 border-t border-[#FF9933]/25 dark:border-[#FF9933]/15 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 font-sans block">
                  {language === 'Hindi' ? "आज के विशेष सिद्ध योग:" : "Today's Special Yogas:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {panchang.pushkarYog && panchang.pushkarYog.active && (
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-300/40 font-sans">
                      🌟 {language === 'Hindi' ? panchang.pushkarYog.hindiName : panchang.pushkarYog.name} ({panchang.pushkarYog.type})
                    </span>
                  )}
                  {panchang.shubhYogas && panchang.shubhYogas.map((y, idx) => (
                    <span key={idx} className="text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300/40 font-sans">
                      ✨ {language === 'Hindi' ? y.hindiName : y.name} ({y.start} - {y.end})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: वर्जित समय चक्र */}
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left rounded-3xl border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#FF9933]/25 dark:border-[#FF9933]/15">
              <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">⚠️</span>
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                  {language === 'Hindi' ? "वर्जित समय चक्र" : "Adverse Periods"}
                </h3>
                <span className="text-[11px] text-rose-700 dark:text-rose-400 font-sans mt-0.5 block">
                  {language === 'Hindi' ? "इस समय नवीन कार्य आरंभ न करें" : "Avoid starting new tasks"}
                </span>
              </div>
            </div>

            {/* Inauspicious Timings List */}
            <div className="space-y-1.5 text-[13px]">
              {allMuhurats.filter(m => m.type === 'Ashubh').map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100/60 dark:border-slate-800/20">
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[12.5px] font-sans">
                    {language === 'Hindi' ? (m.hindiName || m.name) : m.name}:
                  </span>
                  <span className="font-bold text-rose-700 dark:text-rose-400 font-mono text-[12.5px]">
                    {m.startTime} - {m.endTime}
                  </span>
                </div>
              ))}

              {/* Varjyam */}
              {panchang.varjyam && panchang.varjyam.length > 0 && panchang.varjyam.map((v, idx) => (
                <div key={`var-${idx}`} className="flex justify-between items-center py-1.5 border-b border-slate-100/60 dark:border-slate-800/20">
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[12.5px] font-sans">
                    {language === 'Hindi' ? "वर्ज्यम:" : "Varjyam:"}
                  </span>
                  <span className="font-bold text-rose-700 dark:text-rose-400 font-mono text-[12.5px]">
                    {v.start} - {v.end}
                  </span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {((panchang.dagdaTithi && panchang.dagdaTithi.isDagda) || (panchang.bhadra && panchang.bhadra.active)) && (
              <div className="mt-2.5 pt-2 border-t border-[#FF9933]/25 dark:border-[#FF9933]/15 space-y-1.5 text-xs font-sans">
                {panchang.dagdaTithi && panchang.dagdaTithi.isDagda && (
                  <div className="text-rose-800 dark:text-rose-300 font-bold bg-rose-500/10 px-2.5 py-1.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{language === 'Hindi' ? "आज दग्ध तिथि है! महत्वपूर्ण कार्य टालें।" : "Today is Dagda Tithi!"}</span>
                  </div>
                )}
                {panchang.bhadra && panchang.bhadra.active && (
                  <div className="text-rose-800 dark:text-rose-300 font-bold bg-rose-500/10 px-2.5 py-1.5 rounded-xl border border-rose-500/20 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {language === 'Hindi'
                        ? `भद्रा काल सक्रिय (${panchang.bhadra.startTime} से ${panchang.bhadra.endTime}) - शुभ कार्य वर्जित`
                        : `Bhadra active (${panchang.bhadra.startTime} to ${panchang.bhadra.endTime})`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
