/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Heart
} from 'lucide-react';
import { MuhuratItem, HoraInterval, ChoghadiyaInterval } from '../types';
import { AnalogClock } from './AnalogClock';
import { formatHindiTime } from '../utils/translations';

interface LiveMuhuratWatchProps {
  muhurats: MuhuratItem[];
  sunriseTimeStr: string;
  sunsetTimeStr: string;
  tithiHindiName?: string;
  nakshatraHindiName?: string;
  horaList?: HoraInterval[];
  activeHora?: HoraInterval | null;
  choghadiyaList?: ChoghadiyaInterval[];
  activeChoghadiyaIndex?: number;
  displayStartTime?: string;
  displayEndTime?: string;
  viewModeOverride?: 'smartwatch' | 'analog';
  hideSelectors?: boolean;
  minimalMode?: boolean;
}

const translateType = (type: string) => {
  const map: Record<string, string> = {
    'Amrit': 'अमृत (सर्वोत्तम)',
    'Shubh': 'शुभ (लाभकारी)',
    'Ashubh': 'अशुभ (बचें)',
    'Samanya': 'सामान्य',
    'Auspicious': 'शुभ',
    'Inauspicious': 'अशुभ',
    'Neutral': 'सामान्य',
    'Avoid': 'वर्जित'
  };
  return map[type] || type;
};

const translateTimeStr = (timeStr: string) => {
  if (!timeStr) return '';
  return timeStr
    .replace(/\bAM\b/gi, 'पूर्वाह्न')
    .replace(/\bPM\b/gi, 'अपराह्न')
    .replace(' - ', ' से ');
};

const getHoraAdvice = (quality: string) => {
  if (quality === 'Inauspicious') {
    return 'यह होरा क्रूर या अशुभ मानी जाती है। इसमें नए या मांगलिक कार्यों की शुरुआत टालना ही हितैषी है। वाद-विवाद से दूर रहें।';
  } else if (quality === 'Auspicious') {
    return 'यह एक अमृत या सौम्य होरा है। इस काल में किए गए प्रयास प्रायः फलदायी और शुभ होते हैं।';
  } else {
    return 'यह सामान्य फल देने वाली होरा है। इसमें दैनिक व सामान्य सांसारिक कार्य आसानी से संपन्न किए जा सकते हैं।';
  }
};

const getChoghadiyaUpyuktKarya = (type: string, isNight: boolean = false) => {
  if (isNight) {
    const nightMap: Record<string, string> = {
      Amrit: 'आध्यात्मिक साधना, भगवत्-स्मरण, गंभीर पठन-पाठन, मानसिक शांति व विश्राम।',
      Labh: 'डिजिटल कार्य, आगामी दिन की व्यावसायिक योजना (Planning), हिसाब-किताब व रचनात्मक चिंतन।',
      Shubh: 'पारिवारिक सौहार्द, अध्ययन, शुभ संकल्प, शांत निद्रा व विश्राम।',
      Chal: 'यात्रा या सफ़र, आगामी दिन की कार्ययोजना व सामान पैकिंग, सामान्य कार्य।',
      Kaal: 'विश्राम व निद्रा। अनावश्यक सोच-विचार व देर रात तक जागने से बचें।',
      Rog: 'शारीरिक विश्राम व गहरी नींद। स्वास्थ्य लाभ हेतु समय पर शयन करें।',
      Udveg: 'मानसिक शांति हेतु ध्यान व शयन। देर रात वाद-विवाद या भारी तनाव से बचें।'
    };
    return nightMap[type] || 'विश्राम व सामान्य कार्य।';
  }

  const map: Record<string, string> = {
    Amrit: 'धार्मिक, मांगलिक व आध्यात्मिक कार्य, यज्ञ-अनुष्ठान, नया कार्य प्रारंभ।',
    Labh: 'व्यापारिक शुरुआत, नया निवेश, नौकरी प्रारंभ, आर्थिक लेन-देन।',
    Shubh: 'शुभ संस्कार, गृह प्रवेश, विवाह चर्चा, पारिवारिक मंगल कार्य, देव पूजन।',
    Chal: 'यात्रा की शुरुआत, वाहन या गैजेट क्रय, खेलकूद, दैनिक सामान्य कार्य।',
    Kaal: 'मशीनरी कार्य, विवाद निपटाना, कोर्ट-कचहरी (अन्य सभी शुभ कार्य वर्जित)।',
    Rog: 'शारीरिक विश्राम, शल्य चिकित्सा, बीमारी का उपचार (अन्य सभी शुभ व मांगलिक कार्य वर्जित)।',
    Udveg: 'सरकारी या प्रशासनिक कार्य, मुकदमेबाजी, संपत्ति के विवाद।'
  };
  return map[type] || 'दैनिक सामान्य कार्य।';
};

const getHoraPracticalNuance = (lordHindi?: string, lord?: string) => {
  const l = (lord || lordHindi || '').toLowerCase();
  if (l.includes('mangal') || l.includes('mars') || l.includes('मंगल')) {
    return 'मंगल (तेज/ऊर्जावान • साहसिक व तकनीकी कार्यों हेतु ठीक, वाद-विवाद से बचें)';
  }
  if (l.includes('surya') || l.includes('sun') || l.includes('सूर्य')) {
    return 'सूर्य (प्रभावी/नेतृत्व • प्रशासनिक कार्य, प्रतिष्ठा व स्वास्थ्य चिंतन)';
  }
  if (l.includes('chandra') || l.includes('moon') || l.includes('चंद्र')) {
    return 'चंद्र (शांत/सौम्य • रचनात्मक कार्य, जल संबंधी व पारिवारिक सौहार्द)';
  }
  if (l.includes('budh') || l.includes('mercury') || l.includes('बुध')) {
    return 'बुध (बौद्धिक/शुभ • व्यापार, हिसाब-किताब, संवाद व अध्ययन)';
  }
  if (l.includes('guru') || l.includes('jupiter') || l.includes('बृहस्पति') || l.includes('गुरु')) {
    return 'गुरु (अत्यंत शुभ • ज्ञानार्जन, आध्यात्मिक कार्य, निवेश व शुभ संकल्प)';
  }
  if (l.includes('shukra') || l.includes('venus') || l.includes('शुक्र')) {
    return 'शुक्र (सौंदर्य/आनंद • कला, वस्त्र-आभूषण, सौंदर्य व सुख-सुविधा)';
  }
  if (l.includes('shani') || l.includes('saturn') || l.includes('शनि')) {
    return 'शनि (गंभीर/धीमा • धैर्य, श्रम, भूमि-मशीनरी कार्य, जल्दबाजी से बचें)';
  }
  return `${lordHindi || 'ग्रह'} की होरा`;
};

const getChoghadiyaAdvice = (type: string) => {
  const map: Record<string, string> = {
    Amrit: 'यह अत्यंत शुभ और उन्नतिदायक समय है। इस अवधि में किए गए मांगलिक कार्य अत्यंत सफल होते हैं।',
    Labh: 'यह अत्यंत शुभ और धन-लाभदायक समय है। नए उद्यम या व्यापारिक सौदे करने के लिए श्रेष्ठ काल है।',
    Shubh: 'यह एक अत्यंत मंगलकारी समय है। कोई भी पारिवारिक मंगल कार्य या संस्कार करने के लिए यह समय सर्वोत्तम है।',
    Chal: 'यह एक गतिशील और सामान्य समय है। यात्रा शुरू करने या सामान्य कार्य निपटाने के लिए अनुकूल रहता है।',
    Kaal: 'यह राहु के समान प्रभाव वाला अशुभ समय है। नए कार्यों का आरंभ न करें, विवाद और नुकसान की आशंका रहती है।',
    Rog: 'यह अशुभ चौघड़िया माना जाता है। इस अवधि में मांगलिक कार्य या नए कार्य की शुरुआत वर्जित है।',
    Udveg: 'यह उद्वेग कारक समय मानसिक अशांति दे सकता है। विशेष प्रशासनिक कार्यों के अतिरिक्त अन्य शुभ कार्यों को टालें।'
  };
  return map[type] || 'सामान्य काल। नियमित कार्य किए जा सकते हैं।';
};

const translateDescription = (desc: string) => {
  if (!desc) return 'दैनिक गृह गोचर स्थिति के अनुसार पवित्र कार्य सफल सिद्ध होते हैं।';
  const map: Record<string, string> = {
    'Ideal for yoga, meditation, Vedic recitation, or initiating intellectual endeavors.': 'योग, ध्यान, वेद पाठ या बौद्धिक कार्यों के प्रारंभ के लिए सर्वोत्तम काल।',
    'The mid-day winner of all blocks. Destroys multiple planetary blockages instantly.': 'मध्याह्न का सर्वविजयी मुहूर्त। सभी प्रकार के ग्रह दोषों को दूर करता है।',
    'Evening threshold. Peaceful, divine energy associated with Lord Krishna.': 'सायंकाल की शांति व दिव्य ऊर्जा का समय, भगवान श्री कृष्ण को समर्पित।',
    'Period under Rahu influence. Leads to delays, arguments, or bad outcomes.': 'राहु के प्रभाव वाला काल। कार्यों में विघ्न और वाद-विवाद की संभावना रहती है।',
    'Yamaghanta period. Causes obstacles and loss of effort.': 'यमघंट काल। इसमें किए गए कार्यों में बाधा व असफलता का भय रहता है।',
    "Gulika Kaal ruled by Saturn's son. Slower outcomes.": 'गुलिक काल। कार्यों में विलंब व मंदी का कारक।',
    'Daytime nectar period. Blessed by divine planetary alignments.': 'दिन का अमृत काल। दिव्य ग्रह गोचर से परिपूर्ण व सर्वोत्तम।',
    'Daytime auspicious period, suitable for ongoing prosperity.': 'दिन का शुभ काल, निरंतर समृद्धि व उन्नति के लिए अनुकूल।',
    'Inauspicious time of the day based on planetary weekday configuration.': 'वार व ग्रह स्थिति के अनुसार दिन का अशुभ काल।',
    'Standard Muhurtha considerations apply.': 'दैनिक सामान्य मुहूर्त विचार लागू होता है।'
  };
  if (map[desc]) return map[desc];

  let t = desc;
  t = t.replace(/Daytime nectar period/gi, 'दिन का अमृत काल');
  t = t.replace(/Daytime auspicious period/gi, 'दिन का शुभ काल');
  t = t.replace(/Daytime/gi, 'दिन का समय');
  t = t.replace(/Highly auspicious/gi, 'अति शुभ');
  t = t.replace(/Auspicious/gi, 'शुभ');
  t = t.replace(/Inauspicious/gi, 'अशुभ');
  return t;
};

const translateSuitability = (suit: string) => {
  if (!suit) return 'दैनिक शुभ चौघड़िया अनुसार सामान्य है।';
  const map: Record<string, string> = {
    'Highly auspicious for spiritual and mental awakenings.': 'आध्यात्मिक व मानसिक जागरण के लिए अति शुभ।',
    'Auspicious for launching business, starting trips, or financial deposits.': 'व्यापार प्रारंभ, यात्रा और धन निवेश के लिए अत्यंत शुभ व लाभकारी।',
    'Excellent for house contracts, marriage vows, or devotional singing.': 'गृह शांति, मांगलिक संकल्प और भजन-कीर्तन के लिए उत्तम।',
    'Strictly avoid starting any new venture, transaction, or ceremony.': 'किसी भी नए कार्य, लेन-देन या मांगलिक कार्य का आरंभ पूर्णतः वर्जित है।',
    'Strictly avoid starting journeys, financial transactions, or major events.': 'यात्रा, वित्तीय लेन-देन या महत्वपूर्ण कार्यों की शुरुआत से बचें।',
    'Avoid starting any new work; however, normal/routine tasks may continue.': 'नए कार्य प्रारंभ न करें; दैनिक सामान्य कार्य जारी रखे जा सकते हैं।',
    'Highly suitable for buying precious gold, metals, and education initiations.': 'स्वर्ण-आभूषण क्रय, विद्यारंभ और नवीन शुभ कार्यों के लिए सर्वश्रेष्ठ।',
    'Best for travel, social gatherings, signing agreements.': 'यात्रा, सामाजिक उत्सव और शुभ समझौतों के लिए सर्वोत्तम।',
    'Avoid initiating any positive energy works, signing contracts, or traveling.': 'मांगलिक कार्य, अनुबंध पर हस्ताक्षर या यात्रा प्रारंभ करने से बचें।',
    'Standard Muhurtha considerations apply.': 'सामान्य मुहूर्त विचार लागू होता है।'
  };
  if (map[suit]) return map[suit];

  let t = suit;
  t = t.replace(/Highly auspicious/gi, 'अति शुभ');
  t = t.replace(/Auspicious/gi, 'शुभ');
  t = t.replace(/Inauspicious/gi, 'अशुभ');
  t = t.replace(/Daytime/gi, 'दिन का');
  return t;
};

export function LiveMuhuratWatch({ 
  muhurats, 
  sunriseTimeStr, 
  sunsetTimeStr,
  tithiHindiName = 'प्रतिपदा',
  nakshatraHindiName = 'कृत्तिका',
  activeHora,
  choghadiyaList,
  activeChoghadiyaIndex,
  horaList,
  viewModeOverride,
  hideSelectors = false,
  minimalMode = false
}: LiveMuhuratWatchProps) {
  const [time, setTime] = useState(new Date());
  const [currentMuhurat, setCurrentMuhurat] = useState<MuhuratItem | null>(null);
  const [nextMuhurat, setNextMuhurat] = useState<MuhuratItem | null>(null);
  const [timeRemainingStr, setTimeRemainingStr] = useState('');
  const [progressVal, setProgressVal] = useState(0);
  const [dialTheme, setDialTheme] = useState<'amber' | 'gold' | 'emerald'>('amber');
  const [vibrationActive, setVibrationActive] = useState(false);
  const [viewMode, setViewMode] = useState<'smartwatch' | 'analog'>('analog');

  // Selected slot state for dial tap tooltip & table modals
  const [selectedSlot, setSelectedSlot] = useState<{
    type: 'choghadiya' | 'hora';
    name: string;
    startTime: string;
    endTime: string;
    quality?: string;
    desc?: string;
    dot: string;
  } | null>(null);

  const [showChoghadiyaModal, setShowChoghadiyaModal] = useState(false);
  const [showHoraModal, setShowHoraModal] = useState(false);

  const handleSelectChoghadiya = (seg: ChoghadiyaInterval) => {
    const status = getChoghadiyaStatusInfo(seg.type);
    setSelectedSlot({
      type: 'choghadiya',
      name: `${seg.hindiName || seg.name} चौघड़िया`,
      startTime: formatHindiTime(seg.startTime),
      endTime: formatHindiTime(seg.endTime),
      quality: status.label,
      desc: getChoghadiyaAdvice(seg.type),
      dot: status.dot
    });
  };

  const handleSelectHora = (h: HoraInterval) => {
    const isShubh = h.quality === 'Auspicious';
    const isAshubh = h.quality === 'Inauspicious';
    const dot = isShubh ? '🟢' : isAshubh ? '🔴' : '🟡';
    const qualityLabel = isShubh ? 'शुभ होरा' : isAshubh ? 'अशुभ होरा' : 'सामान्य होरा';
    setSelectedSlot({
      type: 'hora',
      name: `${h.lordHindi || h.lord} की होरा`,
      startTime: formatHindiTime(h.startTime),
      endTime: formatHindiTime(h.endTime),
      quality: qualityLabel,
      desc: getHoraPracticalNuance(h.lordHindi, h.lord),
      dot
    });
  };
  
  const effectiveViewMode = viewModeOverride || viewMode;

  const brahmaMuh = muhurats.find(m => m.id === 'brahma');
  const abhijitMuh = muhurats.find(m => m.id === 'abhijit');
  const godhuliMuh = muhurats.find(m => m.id === 'godhuli');

  const currentChoghadiya = choghadiyaList && activeChoghadiyaIndex !== undefined && activeChoghadiyaIndex >= 0 && choghadiyaList.length > 0
    ? choghadiyaList[activeChoghadiyaIndex]
    : null;

  const nextChoghadiyaIndex = choghadiyaList && activeChoghadiyaIndex !== undefined && activeChoghadiyaIndex >= 0 && choghadiyaList.length > 0
    ? (activeChoghadiyaIndex + 1) % choghadiyaList.length
    : undefined;
  const nextChoghadiya = nextChoghadiyaIndex !== undefined && choghadiyaList ? choghadiyaList[nextChoghadiyaIndex] : null;

  const getChoghadiyaStatusInfo = (type?: string) => {
    switch (type) {
      case 'Amrit':
        return { dot: '🟢', label: 'सर्वोत्तम समय', badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'Shubh':
        return { dot: '🟢', label: 'शुभ समय', badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'Labh':
        return { dot: '🟢', label: 'शुभ समय', badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'Chal':
      case 'Char':
        return { dot: '🟡', label: 'सामान्य समय', badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'Rog':
        return { dot: '🔴', label: 'अशुभ समय', badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'Kaal':
        return { dot: '🔴', label: 'अशुभ समय', badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      case 'Udveg':
        return { dot: '🔴', label: 'अशुभ समय', badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
      default:
        return { dot: '🟡', label: 'सामान्य समय', badgeBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30' };
    }
  };

  const getNextPrecaution = (type?: string) => {
    switch (type) {
      case 'Amrit':
      case 'Shubh':
      case 'Labh':
        return 'शुभ कार्य प्रारंभ करें';
      case 'Chal':
      case 'Char':
        return 'दैनिक व सामान्य कार्य निपटाएं';
      case 'Rog':
        return 'मांगलिक कार्य टालें';
      case 'Kaal':
        return 'नया काम टालें';
      case 'Udveg':
        return 'महत्वपूर्ण निर्णय टालें';
      default:
        return 'दैनिक कार्य';
    }
  };

  // Helper to convert time string to absolute minutes of current day
  const timeStrToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(' ');
    if (parts.length < 2) return 0;
    const [hrsStr, minsStr] = parts[0].split(':');
    let hrs = parseInt(hrsStr, 10);
    const mins = parseInt(minsStr, 10);
    const ampm = parts[1].toUpperCase();

    if (ampm === 'PM' && hrs !== 12) hrs += 12;
    if (ampm === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + mins;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currMin = time.getHours() * 60 + time.getMinutes() + time.getSeconds() / 60;

    let foundCurrent: MuhuratItem | null = null;
    let foundNext: MuhuratItem | null = null;
    let minDiffToNext = Infinity;

    muhurats.forEach((m) => {
      const sM = timeStrToMinutes(m.startTime);
      const eM = timeStrToMinutes(m.endTime);

      if (eM < sM) {
        if (currMin >= sM || currMin < eM) {
          foundCurrent = m;
        }
      } else {
        if (currMin >= sM && currMin < eM) {
          foundCurrent = m;
        }
      }

      let diff = sM - currMin;
      if (diff < 0) diff += 1440;
      if (diff > 0 && diff < minDiffToNext && m !== foundCurrent) {
        minDiffToNext = diff;
        foundNext = m;
      }
    });

    if (!foundCurrent && muhurats.length > 0) {
      foundCurrent = {
        id: 'neutral',
        name: 'सामान्य चौघड़िया',
        hindiName: 'सामान्य समय',
        startTime: 'N/A',
        endTime: 'N/A',
        type: 'Samanya',
        description: 'सामान्य समय। इसमें दैनिक कार्य किए जा सकते हैं।',
        suitability: 'शुभता सामान्य है। नियमित कार्य के लिए ठीक है।'
      };
    }

    if (!foundNext && muhurats.length > 0) {
      foundNext = muhurats[0];
    }

    setCurrentMuhurat(foundCurrent);
    setNextMuhurat(foundNext);

    if (foundCurrent && foundCurrent.id !== 'neutral') {
      const eM = timeStrToMinutes(foundCurrent.endTime);
      let diffMin = eM - currMin;
      if (diffMin < 0) diffMin += 1440;

      const totalDuration = (eM - timeStrToMinutes(foundCurrent.startTime) + 1440) % 1440;
      const fraction = totalDuration > 0 ? (totalDuration - diffMin) / totalDuration : 0;
      setProgressVal(Math.min(Math.max(fraction * 100, 0), 100));

      const remHrs = Math.floor(diffMin / 60);
      const remMins = Math.floor(diffMin % 60);
      const remSecs = Math.floor((diffMin * 60) % 65 % 60);

      setTimeRemainingStr(
        `${remHrs > 0 ? remHrs + 'h ' : ''}${remMins}m ${remSecs}s`
      );
    } else {
      if (foundNext) {
        const sM = timeStrToMinutes(foundNext.startTime);
        let diffMin = sM - currMin;
        if (diffMin < 0) diffMin += 1440;

        setProgressVal(50);

        const remHrs = Math.floor(diffMin / 60);
        const remMins = Math.floor(diffMin % 60);
        const remSecs = Math.floor((diffMin * 60) % 65 % 60);

        setTimeRemainingStr(
          `${remHrs > 0 ? remHrs + 'h ' : ''}${remMins}m ${remSecs}s`
        );
      }
    }
  }, [time, muhurats]);

  const triggerVibe = () => {
    setVibrationActive(true);
    setTimeout(() => setVibrationActive(false), 900);
  };

  const statusConfig = {
    Amrit: {
      colorBg: 'from-amber-450/10 to-yellow-500/10 border-amber-500/30 text-amber-500',
      fill: 'text-[#FFD54F]',
      badge: 'bg-[#FFD54F]/20 hover:bg-[#FFD54F]/30 text-[#FFD54F] border-[#FFD54F]/30',
      glow: 'shadow-amber-500/20 bg-[#FFD54F]',
      icon: <Sparkles className="h-5 w-5 text-[#FFD54F] animate-pulse" />
    },
    Shubh: {
      colorBg: 'from-amber-550/10 to-yellow-600/10 border-amber-600/30 text-amber-500',
      fill: 'text-[#F4B400]',
      badge: 'bg-[#F4B400]/20 hover:bg-[#F4B400]/30 text-[#F4B400] border-[#F4B400]/30',
      glow: 'shadow-amber-600/20 bg-[#F4B400]',
      icon: <CheckCircle2 className="h-5 w-5 text-[#F4B400]" />
    },
    Ashubh: {
      colorBg: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-650',
      fill: 'text-[#FF6F00]',
      badge: 'bg-[#FF6F00]/20 hover:bg-[#FF6F00]/30 text-[#FF6F00] border-[#FF6F00]/30',
      glow: 'shadow-orange-500/20 bg-[#FF6F00]',
      icon: <AlertTriangle className="h-5 w-5 text-[#FF6F00]" />
    },
    Samanya: {
      colorBg: 'from-stone-500/10 to-gray-500/10 border-stone-500/30 text-stone-400',
      fill: 'text-stone-400',
      badge: 'bg-stone-500/25 hover:bg-stone-500/35 text-stone-300 border-stone-500/30',
      glow: 'shadow-stone-500/20 bg-stone-550',
      icon: <Clock className="h-5 w-5 text-stone-400" />
    }
  };

  const activeConf = currentMuhurat ? statusConfig[currentMuhurat.type] : statusConfig['Samanya'];

  // Digital states
  const hours = time.getHours();
  const mins = time.getMinutes().toString().padStart(2, '0');
  const secs = time.getSeconds().toString().padStart(2, '0');
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const hindiDayOfWeek = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'][time.getDay()];
  const hindiMonths = [
    'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];
  const hindiDateStr = `${time.getDate()} ${hindiMonths[time.getMonth()]}`;

  const baseYear = time.getFullYear();
  let samvatVikram = baseYear + 57;
  let samvatShaka = baseYear - 78;
  const currentYearEpochStart = new Date(`${baseYear}-03-18T00:00:00`);
  if (time < currentYearEpochStart) {
    samvatVikram--;
    samvatShaka--;
  }

  // Get color skin for dial based on theme state
  const getGlowColorClass = () => {
    return 'text-orange-400';
  };

  const getCircleGlowColorClass = () => {
    if (dialTheme === 'gold') return 'stroke-amber-400';
    if (dialTheme === 'emerald') return 'stroke-emerald-400';
    return 'stroke-orange-500';
  };



  // Render watch dial directly if minimalMode is requested
  if (minimalMode) {
    return (
      <div className="relative flex items-center justify-center w-full h-full aspect-square [&_svg]:overflow-visible">
        {effectiveViewMode === 'analog' ? (
          <div className="w-full h-full flex items-center justify-center">
            <AnalogClock 
              time={time} 
              choghadiyaList={choghadiyaList}
              activeChoghadiyaIndex={activeChoghadiyaIndex}
              activeHora={activeHora}
              horaList={horaList}
              sunriseTimeStr={sunriseTimeStr}
              sunsetTimeStr={sunsetTimeStr}
            />
          </div>
        ) : (
          /* SMARTWATCH MODE */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* SVG OUTER SQUARE INFORMATION FRAME */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 400 400">
              <defs>
                <linearGradient id="widgetGoldenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF5C3" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
              </defs>
              {/* Left - Sunset */}
              <text transform="translate(14,200) rotate(-90)" textAnchor="middle" dominantBaseline="central" fontSize="13" fontFamily="monospace" fontWeight="900" className="fill-[#C2410C] dark:fill-white select-none">।। 🌇 सूर्यास्त {sunsetTimeStr} ।।</text>
              {/* Right - Sunrise */}
              <text transform="translate(386,200) rotate(90)" textAnchor="middle" dominantBaseline="central" fontSize="13" fontFamily="monospace" fontWeight="900" className="fill-[#C2410C] dark:fill-white select-none">।। 🌅 सूर्योदय {sunriseTimeStr} ।।</text>
            </svg>

            {/* Shadow Drop Element representing watch bezel profile */}
            <div className="absolute inset-[8%] rounded-[16px] bg-gradient-to-b from-[#32231A] via-[#1A0F0A] to-[#251710] border-[8px] sm:border-[10px] border-[#3E2D24] flex items-center justify-center">
              
              {/* Bezel Ring outer border representing minutes dial frame */}
              <div className="absolute inset-1 rounded-[12px] border border-orange-500/10 pointer-events-none"></div>

              {/* Interactive Rotary Button on side */}
              <button 
                type="button"
                onClick={() => {
                  triggerVibe();
                  if (dialTheme === 'amber') setDialTheme('gold');
                  else if (dialTheme === 'gold') setDialTheme('emerald');
                  else setDialTheme('amber');
                }}
                className="absolute right-[-11px] top-[48%] -translate-y-1/2 w-4 h-8 rounded-r-lg bg-gradient-to-b from-[#5C4538] to-[#271A12] border-r border-[#6C5548] flex flex-col items-center justify-center p-0.5 cursor-pointer shadow-lg active:scale-95 transition-all select-none gap-0.5 hover:brightness-110"
                title="क्लिक करके वॉच फेस की थीम बदलें"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></div>
              </button>

              {/* WATCH DIAL / SCREEN */}
              <div className="w-[94%] h-[93%] rounded-[12px] bg-black overflow-hidden relative border border-orange-950 flex flex-col items-center justify-between p-4 py-5 text-center">
                
                {/* Subtle digital interface wireframe grid */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08)_0%,transparent_70%)] pointer-events-none" />

                {/* Premium Gold Radial Glow for Center Core */}
                <div 
                  className="absolute inset-0 pointer-events-none z-0" 
                  style={{
                    background: 'radial-gradient(circle, rgba(255,213,79,0.18) 0%, rgba(216,155,0,0.06) 65%, transparent 100%)'
                  }} 
                />

                {/* Top Row: Dial Sacred symbol (OM) with Vikram and Shak Samvat */}
                <div className="flex justify-between items-center w-full px-3 text-orange-400 text-3xs mt-0.5 relative z-10 select-none">
                  <span className="font-serif font-black text-[8px] sm:text-[9.5px] text-[#A67E5D] tracking-wide leading-none">
                    वि.सं. {samvatVikram}
                  </span>
                  <span className="font-serif font-black text-[15px] sm:text-[18px] leading-none hover:rotate-12 transition-transform cursor-pointer" onClick={triggerVibe}>ॐ</span>
                  <span className="font-serif font-black text-[8px] sm:text-[9.5px] text-[#A67E5D] tracking-wide leading-none">
                    श.सं. {samvatShaka}
                  </span>
                </div>

                {/* COMPLICATIONS & TIME ROW */}
                <div className="w-full flex items-center justify-between px-1.5 my-1.5 relative z-10 select-none">
                  {/* Left Complication: Tithi */}
                  <div className="flex flex-col items-start justify-center text-left w-[27%] shrink-0">
                    <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 font-bold tracking-wider uppercase leading-none mb-0.5">वर्तमान तिथि</span>
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight whitespace-pre-line w-[45px] sm:w-[50px] text-center">
                      {tithiHindiName.replace(' ', '\n')}
                    </span>
                  </div>

                  {/* Center Core: Analog style Choghadiya ring */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="44" 
                        fill="none" 
                        className={`transition-all duration-1000 ${getCircleGlowColorClass()}`}
                        strokeWidth="6.5" 
                        strokeDasharray="276.4" 
                        strokeDashoffset={276.4 - (276.4 * progressVal) / 100}
                        strokeLinecap="round"
                        style={{ filter: dialTheme !== 'amber' ? 'drop-shadow(0 0 2px rgba(251,146,60,0.5))' : 'none' }}
                      />
                    </svg>
                    
                    {/* Time display at core */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none mt-1">
                      <span className="text-[11px] sm:text-[13px] font-bold text-white font-mono tracking-tight">
                        {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-extrabold text-[#E2C7A9] font-mono tracking-wide mt-1">
                        {time.toLocaleTimeString('en-IN', { second: '2-digit' })}s
                      </span>
                    </div>
                  </div>

                  {/* Right Complication: Nakshatra */}
                  <div className="flex flex-col items-end justify-center text-right w-[27%] shrink-0">
                    <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 font-bold tracking-wider uppercase leading-none mb-0.5">सक्रिय नक्षत्र</span>
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight whitespace-pre-line w-[45px] sm:w-[50px] text-center">
                      {nakshatraHindiName.replace(' ', '\n')}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Dynamic Muhurat / Choghadiya Label */}
                <div className="w-full flex flex-col items-center gap-0.5 select-none relative z-10 mb-0.5">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-orange-500 animate-spin-slow" />
                    <span className="text-[8px] sm:text-[9.5px] font-black text-orange-400 font-serif uppercase tracking-wider">
                      {currentChoghadiya ? `${currentChoghadiya.hindiName || currentChoghadiya.name} चौघड़िया` : '—'}
                    </span>
                  </div>
                  <div className="text-[8px] sm:text-[9.5px] font-black text-[#27AE60] font-mono leading-none mt-0.5">
                    {timeRemainingStr}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="live_muhurat_watch_container" className="relative flex flex-col items-center justify-between px-3 py-3.5 sm:p-6 md:p-8 glass-card-light dark:glass-card-dark w-full h-full shadow-xl">
      
      {/* VIEW MODE TOGGLE */}
      {!hideSelectors && (
        <div className="flex items-center gap-1 p-0.5 bg-orange-950/10 dark:bg-orange-950/40 border border-orange-200/30 rounded-lg self-center sm:self-start mb-2.5">
          <button
            type="button"
            onClick={() => setViewMode('smartwatch')}
            className={`px-3.5 py-1.5 text-[10.5px] font-black rounded-md transition-all cursor-pointer ${
              viewMode === 'smartwatch'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-orange-950 dark:text-orange-200 opacity-60 hover:opacity-100'
            }`}
          >
            सनातन स्मार्टवॉच
          </button>
          <button
            type="button"
            onClick={() => setViewMode('analog')}
            className={`px-3.5 py-1.5 text-[10.5px] font-black rounded-md transition-all cursor-pointer ${
              viewMode === 'analog'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                : 'text-orange-950 dark:text-orange-200 opacity-60 hover:opacity-100'
            }`}
          >
            एनालॉग वॉच
          </button>
        </div>
      )}



      {/* WATCH AREA: Smartwatch or Analog based on viewMode */}
      <div className="relative flex items-center justify-center w-full max-w-[420px] aspect-square sm:max-w-[440px] md:max-w-[460px] mx-auto my-0">
        
        {effectiveViewMode === 'analog' ? (
          /* ANALOG CLOCK MODE */
          <div className="w-full h-full flex items-center justify-center">
            <AnalogClock 
              time={time} 
              size={340} 
              theme="temple"
              choghadiyaList={choghadiyaList}
              activeChoghadiyaIndex={activeChoghadiyaIndex}
              activeHora={activeHora}
              horaList={horaList}
              sunriseTimeStr={sunriseTimeStr}
              sunsetTimeStr={sunsetTimeStr}
              onSelectChoghadiya={handleSelectChoghadiya}
              onSelectHora={handleSelectHora}
            />
          </div>
        ) : (
        /* SMARTWATCH MODE */
        <>

        {/* SVG OUTER SQUARE INFORMATION FRAME */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="outerFrameGoldSq" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8960C" />
            </linearGradient>
          </defs>
          {/* Outer golden border rect */}
          <rect x="4" y="4" width="392" height="392" rx="16" ry="16" fill="none" stroke="url(#outerFrameGoldSq)" strokeWidth="2.5" />
          {/* Inner golden border rect */}
          <rect x="24" y="24" width="352" height="352" rx="12" ry="12" fill="none" stroke="#D4AF37" strokeWidth="2" />
          {/* Corner Rivets - centered between outer(4) and inner(24) frames */}
          <circle cx="14" cy="14" r="2.8" fill="#C9A227" stroke="#FFD700" strokeWidth="0.5" />
          <circle cx="386" cy="14" r="2.8" fill="#C9A227" stroke="#FFD700" strokeWidth="0.5" />
          <circle cx="14" cy="386" r="2.8" fill="#C9A227" stroke="#FFD700" strokeWidth="0.5" />
          <circle cx="386" cy="386" r="2.8" fill="#C9A227" stroke="#FFD700" strokeWidth="0.5" />
          {/* Top Labels (Left: Hora, Center: Kaalkhand, Right: Choghadiya) */}
          <text x="50" y="14" textAnchor="start" dominantBaseline="central" fontSize="13" fontFamily="serif" fontWeight="900" className="fill-[#C2410C] dark:fill-white select-none">
            {activeHora ? 'होरा - ' + activeHora.lordHindi : 'होरा - -'}
          </text>
          <text x="200" y="14" textAnchor="middle" dominantBaseline="central" fontSize="13" fontFamily="serif" fontWeight="900" letterSpacing="1" className="fill-[#C2410C] dark:fill-white select-none">
            ।। सनातन कालखण्ड ।।
          </text>
          <text x="350" y="14" textAnchor="end" dominantBaseline="central" fontSize="13" fontFamily="serif" fontWeight="900" className="fill-[#C2410C] dark:fill-white select-none">
            {currentChoghadiya ? 'चौघड़िया - ' + (currentChoghadiya.hindiName || currentChoghadiya.name) : 'चौघड़िया - -'}
          </text>
          {/* Bottom Label */}
          <text x="200" y="386" textAnchor="middle" dominantBaseline="central" fontSize="13" fontFamily="serif" fontWeight="900" letterSpacing="1" className="fill-[#C2410C] dark:fill-white select-none">।। वैदिक समय दिखाने वाला यंत्र ।।</text>
          {/* Left - Sunset */}
          <text transform="translate(14,200) rotate(-90)" textAnchor="middle" dominantBaseline="central" fontSize="13" fontFamily="monospace" fontWeight="900" className="fill-[#C2410C] dark:fill-white select-none">।। 🌇 सूर्यास्त {sunsetTimeStr} ।।</text>
          {/* Right - Sunrise */}
          <text transform="translate(386,200) rotate(90)" textAnchor="middle" dominantBaseline="central" fontSize="13" fontFamily="monospace" fontWeight="900" className="fill-[#C2410C] dark:fill-white select-none">।। 🌅 सूर्योदय {sunriseTimeStr} ।।</text>
        </svg>

        {/* Shadow Drop Element representing watch bezel profile */}
        <div className="absolute inset-[8%] rounded-[16px] bg-gradient-to-b from-[#32231A] via-[#1A0F0A] to-[#251710] border-[8px] sm:border-[10px] border-[#3E2D24] flex items-center justify-center">
          
          {/* Bezel Ring outer border representing minutes dial frame */}
          <div className="absolute inset-1 rounded-[12px] border border-orange-500/10 pointer-events-none"></div>

          {/* Interactive Rotary Button on side (Simulates theme scroll click change) */}
          <button 
            type="button"
            onClick={() => {
              triggerVibe();
              if (dialTheme === 'amber') setDialTheme('gold');
              else if (dialTheme === 'gold') setDialTheme('emerald');
              else setDialTheme('amber');
            }}
            className="absolute right-[-11px] top-[48%] -translate-y-1/2 w-4 h-8 rounded-r-lg bg-gradient-to-b from-[#5C4538] to-[#271A12] border-r border-[#6C5548] flex flex-col items-center justify-center p-0.5 cursor-pointer shadow-lg active:scale-95 transition-all select-none gap-0.5 hover:brightness-110"
            title="क्लिक करके वॉच फेस की थीम बदलें"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></div>
          </button>

          {/* WATCH DIAL / SCREEN */}
          <div className="w-[94%] h-[93%] rounded-[12px] bg-black overflow-hidden relative border border-orange-950 flex flex-col items-center justify-between p-4 py-5 text-center">
            
            {/* Subtle digital interface wireframe grid */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08)_0%,transparent_70%)] pointer-events-none" />

            {/* Premium Gold Radial Glow for Center Core */}
            <div 
              className="absolute inset-0 pointer-events-none z-0" 
              style={{
                background: 'radial-gradient(circle, rgba(255,213,79,0.18) 0%, rgba(216,155,0,0.06) 65%, transparent 100%)'
              }} 
            />

            {/* Subtle Mandala Center overlay representing Sacred Geometry */}
            <div className="absolute inset-0 sacred-motif-overlay pointer-events-none z-0 opacity-[0.04]"></div>

            {/* Top Row: Dial Sacred symbol (OM) with Vikram and Shak Samvat */}
            <div className="flex justify-between items-center w-full px-3 text-orange-400 text-3xs mt-0.5 relative z-10 select-none">
              <span className="font-serif font-black text-[8px] sm:text-[9.5px] text-[#A67E5D] tracking-wide leading-none">
                वि.सं. {samvatVikram}
              </span>
              <span className="font-serif font-black text-[15px] sm:text-[18px] leading-none hover:rotate-12 transition-transform cursor-pointer" onClick={triggerVibe}>ॐ</span>
              <span className="font-serif font-black text-[8px] sm:text-[9.5px] text-[#A67E5D] tracking-wide leading-none">
                श.सं. {samvatShaka}
              </span>
            </div>

            {/* COMPLICATIONS & TIME ROW */}
            <div className="w-full flex items-center justify-between px-1.5 my-1.5 relative z-10 select-none">
              {/* Left Complication: Tithi */}
              <div className="flex flex-col items-start justify-center text-left w-[27%] shrink-0">
                <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 font-bold tracking-wider uppercase leading-none mb-0.5">वर्तमान तिथि</span>
                <span className="text-[10px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight whitespace-pre-line w-[45px] sm:w-[50px] text-center" title={tithiHindiName}>
                  {tithiHindiName.replace(' ', '\n')}
                </span>
              </div>

              {/* Center: Digital Time Clock */}
              <div className="flex flex-col items-center justify-center text-center w-[46%] shrink-0">
                <div className="flex items-baseline justify-center tracking-tight relative">
                  <span className={`text-2xl sm:text-3xl md:text-4xl font-black font-mono leading-none tracking-tight ${getGlowColorClass()}`}>{displayHours}</span>
                  <span className={`text-2xl sm:text-3xl md:text-4xl font-black font-mono leading-none mx-0.5 animate-pulse ${getGlowColorClass()}`}>:</span>
                  <span className={`text-2xl sm:text-3xl md:text-4xl font-black font-mono leading-none tracking-tight ${getGlowColorClass()}`}>{mins}</span>
                  <div className="absolute left-[102%] bottom-[2px] flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[7.5px] sm:text-[8.5px] font-black text-slate-400 uppercase font-mono">{ampm}</span>
                    <span className="text-[9px] sm:text-[10px] text-orange-400/80 font-mono font-bold">{secs}</span>
                  </div>
                </div>
                
                {/* Watch info bar */}
                <p className="text-[7.5px] sm:text-[8.5px] text-stone-500 font-mono tracking-wide uppercase leading-none mt-1 whitespace-nowrap">
                  📍 {sunriseTimeStr ? 'वैदिक काल' : 'सनातन समय'} • {hindiDayOfWeek} • {hindiDateStr}
                </p>
              </div>

              {/* Right Complication: Nakshatra */}
              <div className="flex flex-col items-end justify-center text-right w-[27%] shrink-0">
                <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 font-bold tracking-wider uppercase leading-none mb-0.5">नक्षत्र</span>
                <span className="text-[10px] sm:text-[12px] font-black text-amber-300 font-serif leading-tight truncate w-full" title={nakshatraHindiName}>
                  {nakshatraHindiName}
                </span>
              </div>
            </div>

            {/* CENTRAL SACRED MUHURAT DISPLAY DIODE ROW (Hora | Muhurat | Choghadiya) */}
            <div className="w-full grid grid-cols-3 gap-1 px-1 relative z-10 max-w-[94%] mx-auto mb-2 select-none">
              {/* Left Box: Hora */}
              <div className="flex flex-col items-center justify-between p-1 py-1.5 bg-orange-950/30 border border-orange-900/40 rounded-lg min-h-[52px] text-center shadow-inner relative overflow-hidden">
                <span className="text-[7.5px] sm:text-[8.5px] text-stone-500 font-bold uppercase tracking-wider leading-none">होरा</span>
                <span className="text-[9.5px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight truncate w-full mt-0.5">
                  {activeHora ? activeHora.lordHindi : '-'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] font-mono text-stone-400 leading-none mt-1">
                  {activeHora ? `${formatHindiTime(activeHora.startTime)}-${formatHindiTime(activeHora.endTime)}` : '-'}
                </span>
              </div>

              {/* Center Box: Active Muhurat (Kaalkhand) */}
              <div className="flex flex-col items-center justify-between p-1 py-1.5 bg-orange-950/30 border border-orange-900/40 rounded-lg min-h-[52px] text-center shadow-inner relative overflow-hidden">
                <span className="text-[6px] sm:text-[7px] text-amber-500 font-black uppercase tracking-wider leading-none">सक्रीय काल</span>
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-amber-100 font-serif leading-tight whitespace-pre-line w-full mt-0.5">
                  {currentMuhurat ? (currentMuhurat.hindiName || currentMuhurat.name).replace(' ', '\n') : 'सामान्य'}
                </span>
                <div className="flex items-center gap-0.5 mt-1 bg-black/40 px-1 py-0.5 rounded-full border border-orange-900/30 scale-[0.85] origin-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shrink-0" />
                  <span className="text-[8px] font-bold font-mono text-emerald-400 leading-none">
                    {timeRemainingStr}
                  </span>
                </div>
              </div>

              {/* Right Box: Choghadiya */}
              <div className="flex flex-col items-center justify-between p-1 py-1.5 bg-orange-950/30 border border-orange-900/40 rounded-lg min-h-[52px] text-center shadow-inner relative overflow-hidden">
                <span className="text-[6px] sm:text-[7px] text-stone-500 font-bold uppercase tracking-wider leading-none">चौघड़िया</span>
                <span className="text-[9.5px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight truncate w-full mt-0.5">
                  {currentChoghadiya ? (currentChoghadiya.hindiName || currentChoghadiya.name) : '-'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] font-mono text-stone-400 leading-none mt-1">
                  {currentChoghadiya ? `${formatHindiTime(currentChoghadiya.startTime)}-${formatHindiTime(currentChoghadiya.endTime)}` : '-'}
                </span>
              </div>
            </div>

            {/* LOWER STATS GRID REPRESENTATIVE OF SMART WATCH SENSORS */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-center justify-center w-full px-2 relative z-10 mb-1">
              
              {/* Brahma Muhurat */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-black text-orange-400 leading-none">ब्रह्म</span>
                <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-500 my-0.5" />
                <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-200 leading-none">
                  {brahmaMuh ? brahmaMuh.startTime.replace(' AM', '').replace(' PM', '') : '4:24'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] text-slate-400 font-bold uppercase leading-none mt-0.5">मुहूर्त</span>
              </div>

              {/* Abhijit Muhurat */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-black text-amber-400 leading-none">अभिजीत</span>
                <span className="text-[10px] sm:text-[11px] text-amber-500/90 font-serif font-black my-0.5 leading-none">卐</span>
                <span className="text-[8px] sm:text-[9px] font-mono font-black text-amber-400 leading-none">
                  {abhijitMuh ? abhijitMuh.startTime.replace(' AM', '').replace(' PM', '') : '11:48'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] text-slate-400 font-bold uppercase leading-none mt-0.5">मुहूर्त</span>
              </div>

              {/* Godhuli Muhurat */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-black text-rose-400 leading-none">गोधूलि</span>
                <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-500 my-0.5" />
                <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-200 leading-none">
                  {godhuliMuh ? godhuliMuh.startTime.replace(' AM', '').replace(' PM', '') : '18:40'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] text-slate-400 font-bold uppercase leading-none mt-0.5">मुहूर्त</span>
              </div>
            </div>

          </div>
        </div>

        </>
        )}
      </div>

      {/* TAP TOOLTIP FLOATING PILL BADGE */}
      {selectedSlot && (
        <div className="w-full max-w-[420px] mx-auto mt-2 p-3 bg-gradient-to-r from-[#2A1810] via-[#1E120B] to-[#2A1810] border border-[#D4AF37]/80 rounded-2xl shadow-xl flex items-center justify-between gap-2.5 animate-fadeIn z-30">
          <div className="flex items-center gap-2 overflow-hidden text-left">
            <span className="text-xl select-none shrink-0">{selectedSlot.dot}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black font-serif text-amber-200">
                  {selectedSlot.name}
                </span>
                <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedSlot.startTime} – {selectedSlot.endTime}
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11.5px] text-stone-300 truncate font-serif mt-0.5">
                {selectedSlot.quality} • {selectedSlot.desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (selectedSlot.type === 'choghadiya') setShowChoghadiyaModal(true);
                else setShowHoraModal(true);
              }}
              className="text-[10px] sm:text-xs font-bold text-amber-300 hover:text-white bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 px-2.5 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              तालिका 📋
            </button>
            <button
              type="button"
              onClick={() => setSelectedSlot(null)}
              className="text-stone-400 hover:text-white text-base w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all"
              title="बंद करें"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* HINT LINE BELOW DIAL (WHEN NO SLOT SELECTED) */}
      {effectiveViewMode === 'analog' && !selectedSlot && (
        <div className="text-[11px] sm:text-xs text-amber-800/80 dark:text-amber-300/80 font-serif flex items-center justify-center gap-1 mt-1.5 animate-pulse select-none">
          <span>👆 किसी भी चौघड़िया या होरा का समय देखने के लिए उस खाने को छुएं</span>
        </div>
      )}

      {/* 3-COLOR INTUITIVE LEGEND */}
      <div className="w-full mt-2 flex flex-col items-center gap-1 select-none text-center">
        {/* 3-Color Legend: Green = Shubh, Yellow = Chal, Red = Ashubh */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold font-serif flex-wrap pt-0.5">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            🟢 शुभ (अमृत/शुभ/लाभ)
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            🟡 सामान्य (चर)
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            🔴 अशुभ (रोग/काल/उद्वेग)
          </span>
        </div>
      </div>

      {/* UNIFIED SMART LIVE CARD (SINGLE POWERHOUSE CARD) */}
      {(() => {
        const currMinuteVal = time.getHours() * 60 + time.getMinutes() + time.getSeconds() / 60;
        let choghadiyaRemainingMinutes = 0;
        if (currentChoghadiya && currentChoghadiya.endTime) {
          const eM = timeStrToMinutes(currentChoghadiya.endTime);
          let diffMin = eM - currMinuteVal;
          if (diffMin < 0) diffMin += 1440;
          choghadiyaRemainingMinutes = Math.max(0, Math.floor(diffMin));
        }

        const isNightTime = currentChoghadiya ? !currentChoghadiya.isDay : (time.getHours() >= 20 || time.getHours() < 6);
        const statusInfo = getChoghadiyaStatusInfo(currentChoghadiya?.type);
        const nextStatusInfo = getChoghadiyaStatusInfo(nextChoghadiya?.type);

        return (
          <div className="w-full mt-3 p-3.5 sm:p-4 rounded-3xl border border-[#ff9933]/50 bg-orange-50/15 dark:bg-[#1E1713]/90 backdrop-blur-md shadow-md space-y-2 text-left">
            
            {/* Header Row: Current Choghadiya & Live Countdown */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-orange-100/40 dark:border-zinc-800/60 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">{statusInfo.dot}</span>
                <div>
                  <h4 className="text-[14px] sm:text-[15.5px] font-black text-slate-900 dark:text-amber-100 font-serif leading-tight">
                    अभी: {currentChoghadiya ? (currentChoghadiya.hindiName || currentChoghadiya.name) : 'सामान्य'} चौघड़िया ({statusInfo.label})
                  </h4>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    समय: {currentChoghadiya ? `${formatHindiTime(currentChoghadiya.startTime)} - ${formatHindiTime(currentChoghadiya.endTime)}` : '—'}
                  </div>
                </div>
              </div>

              {/* Remaining Countdown Badge */}
              <div className={`px-2.5 py-1 rounded-full border text-[11px] sm:text-xs font-mono font-black shrink-0 ${statusInfo.badgeBg}`}>
                ⏳ {choghadiyaRemainingMinutes > 0 ? `${choghadiyaRemainingMinutes} मिनट शेष` : `${timeRemainingStr} शेष`}
              </div>
            </div>

            {/* Active Hora Status Bar */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-orange-500/5 dark:bg-zinc-900/40 rounded-xl border border-orange-200/25 dark:border-zinc-800/50">
              <span className="font-bold text-slate-600 dark:text-slate-300">सक्रिय होरा:</span>
              <span className="font-bold font-serif text-orange-600 dark:text-amber-400">
                {activeHora ? getHoraPracticalNuance(activeHora.lordHindi, activeHora.lord) : '—'}
              </span>
            </div>

            {/* Practical Advice: क्या करें */}
            {currentChoghadiya && (
              <div className="text-xs space-y-0.5 pt-0.5">
                <span className="font-black text-slate-800 dark:text-slate-200 block">
                  ✅ क्या करें:
                </span>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {getChoghadiyaUpyuktKarya(currentChoghadiya.type, isNightTime)}
                </p>
              </div>
            )}

            {/* Next Upcoming Choghadiya Preview */}
            {nextChoghadiya && (
              <div className="pt-2 border-t border-orange-100/40 dark:border-zinc-800/60 flex items-center justify-between text-xs flex-wrap gap-1">
                <span className="font-bold text-slate-500 dark:text-slate-400">⏭️ अगला चौघड़िया:</span>
                <span className="font-bold font-serif text-slate-800 dark:text-slate-200">
                  {nextStatusInfo.dot} {nextChoghadiya.hindiName || nextChoghadiya.name} चौघड़िया ({formatHindiTime(nextChoghadiya.startTime)} से - {getNextPrecaution(nextChoghadiya.type)})
                </span>
              </div>
            )}

          </div>
        );
      })()}
      {/* CHOGHADIYA TABLE MODAL */}
      {showChoghadiyaModal && choghadiyaList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#120B08] border border-amber-500/30 rounded-3xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
            <button 
              onClick={() => setShowChoghadiyaModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono font-bold text-lg cursor-pointer bg-white/5 w-8 h-8 rounded-full flex items-center justify-center border border-white/5"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/10 mb-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-500 block">
                ॥ दैनिक चौघड़िया मुहूर्त ॥
              </span>
              <h3 className="text-lg font-bold font-serif text-amber-100">
                सम्पूर्ण दिन-रात्रि चौघड़िया तालिका
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Day Choghadiya */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                  ☀️ दिन का चौघड़िया (Daytime)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {choghadiyaList.filter(ch => ch.isDay).map((ch, i) => {
                    const status = getChoghadiyaStatusInfo(ch.type);
                    return (
                      <div key={i} className="p-2.5 rounded-2xl bg-orange-950/20 border border-orange-500/20 flex flex-col justify-between min-h-[76px]">
                        <div>
                          <div className="flex items-center gap-1">
                            <span>{status.dot}</span>
                            <span className="text-xs font-black text-slate-200 font-serif leading-tight">{ch.hindiName || ch.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block leading-none">{formatHindiTime(ch.startTime)} - {formatHindiTime(ch.endTime)}</span>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase text-center py-0.5 rounded-md mt-2 tracking-wider ${status.badgeBg}`}>
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Night Choghadiya */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                  🌙 रात का चौघड़िया (Nighttime)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {choghadiyaList.filter(ch => !ch.isDay).map((ch, i) => {
                    const status = getChoghadiyaStatusInfo(ch.type);
                    return (
                      <div key={i} className="p-2.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-between min-h-[76px]">
                        <div>
                          <div className="flex items-center gap-1">
                            <span>{status.dot}</span>
                            <span className="text-xs font-black text-slate-200 font-serif leading-tight">{ch.hindiName || ch.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block leading-none">{formatHindiTime(ch.startTime)} - {formatHindiTime(ch.endTime)}</span>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase text-center py-0.5 rounded-md mt-2 tracking-wider ${status.badgeBg}`}>
                          {status.label}
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

      {/* HORA TABLE MODAL */}
      {showHoraModal && horaList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#120B08] border border-amber-500/30 rounded-3xl p-5 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
            <button 
              onClick={() => setShowHoraModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono font-bold text-lg cursor-pointer bg-white/5 w-8 h-8 rounded-full flex items-center justify-center border border-white/5"
            >
              ✕
            </button>
            <div className="pb-3 border-b border-orange-100/10 mb-4">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-500 block">
                ॥ दैनिक होरा चक्र ॥
              </span>
              <h3 className="text-lg font-bold font-serif text-amber-100">
                सम्पूर्ण २४ घंटे की होरा स्थिति तालिका
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Day Hora */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                  ☀️ दिन की होरा (Daytime 12 Horas)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {horaList.filter(h => h.isDay).map((h, i) => {
                    const isShubh = h.quality === 'Auspicious';
                    const isAshubh = h.quality === 'Inauspicious';
                    const dot = isShubh ? '🟢' : isAshubh ? '🔴' : '🟡';
                    const badgeClass = isShubh ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : isAshubh ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                    return (
                      <div key={i} className="p-2.5 rounded-2xl bg-orange-950/20 border border-orange-500/20 flex flex-col justify-between min-h-[76px]">
                        <div>
                          <div className="flex items-center gap-1">
                            <span>{dot}</span>
                            <span className="text-xs font-black text-slate-200 font-serif leading-tight">{h.lordHindi || h.lord} की होरा</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block leading-none">{formatHindiTime(h.startTime)} - {formatHindiTime(h.endTime)}</span>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase text-center py-0.5 rounded-md mt-2 tracking-wider ${badgeClass}`}>
                          {isShubh ? 'शुभ' : isAshubh ? 'अशुभ' : 'सामान्य'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Night Hora */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                  🌙 रात की होरा (Nighttime 12 Horas)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {horaList.filter(h => !h.isDay).map((h, i) => {
                    const isShubh = h.quality === 'Auspicious';
                    const isAshubh = h.quality === 'Inauspicious';
                    const dot = isShubh ? '🟢' : isAshubh ? '🔴' : '🟡';
                    const badgeClass = isShubh ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : isAshubh ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
                    return (
                      <div key={i} className="p-2.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-between min-h-[76px]">
                        <div>
                          <div className="flex items-center gap-1">
                            <span>{dot}</span>
                            <span className="text-xs font-black text-slate-200 font-serif leading-tight">{h.lordHindi || h.lord} की होरा</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block leading-none">{formatHindiTime(h.startTime)} - {formatHindiTime(h.endTime)}</span>
                        </div>
                        <span className={`text-[8.5px] font-black uppercase text-center py-0.5 rounded-md mt-2 tracking-wider ${badgeClass}`}>
                          {isShubh ? 'शुभ' : isAshubh ? 'अशुभ' : 'सामान्य'}
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