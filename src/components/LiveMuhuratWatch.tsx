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

const getChoghadiyaUpyuktKarya = (type: string) => {
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
  
  const effectiveViewMode = viewModeOverride || viewMode;

  const brahmaMuh = muhurats.find(m => m.id === 'brahma');
  const abhijitMuh = muhurats.find(m => m.id === 'abhijit');
  const godhuliMuh = muhurats.find(m => m.id === 'godhuli');

  const currentChoghadiya = choghadiyaList && activeChoghadiyaIndex !== undefined && activeChoghadiyaIndex >= 0 && activeChoghadiyaIndex < choghadiyaList.length
    ? choghadiyaList[activeChoghadiyaIndex]
    : null;

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
              <text transform="translate(14,200) rotate(-90)" textAnchor="middle" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="monospace" fontWeight="900">।। 🌇 सूर्यास्त {sunsetTimeStr} ।।</text>
              {/* Right - Sunrise */}
              <text transform="translate(386,200) rotate(90)" textAnchor="middle" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="monospace" fontWeight="900">।। 🌅 सूर्योदय {sunriseTimeStr} ।।</text>
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
                    <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 dark:text-brand-text-mut font-bold tracking-wider uppercase leading-none mb-0.5">वर्तमान तिथि</span>
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
                    <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 dark:text-brand-text-mut font-bold tracking-wider uppercase leading-none mb-0.5">सक्रिय नक्षत्र</span>
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
    <div id="live_muhurat_watch_container" className="relative flex flex-col items-center justify-between px-3 py-5 sm:p-8 md:p-10 glass-card-light dark:glass-card-dark w-full h-full shadow-xl">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-orange-600 animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-orange-950 dark:text-orange-300 uppercase">सनातन वॉच</span>
        </div>
      </div>

      {/* VIEW MODE TOGGLE */}
      {!hideSelectors && (
        <div className="flex items-center gap-1 p-0.5 bg-orange-950/10 dark:bg-brand-card border border-orange-200 dark:border-brand-border/30 rounded-lg self-start mb-3">
          <button
            type="button"
            onClick={() => setViewMode('smartwatch')}
            className={`px-3 py-1 text-[9.5px] font-black rounded-md transition-all cursor-pointer ${
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
            className={`px-3 py-1 text-[9.5px] font-black rounded-md transition-all cursor-pointer ${
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
          <text x="50" y="14" textAnchor="start" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="serif" fontWeight="900">
            {activeHora ? 'होरा - ' + activeHora.lordHindi : 'होरा - -'}
          </text>
          <text x="200" y="14" textAnchor="middle" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="serif" fontWeight="900" letterSpacing="1">
            ।। सनातन कालखण्ड ।।
          </text>
          <text x="350" y="14" textAnchor="end" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="serif" fontWeight="900">
            {currentChoghadiya ? 'चौघड़िया - ' + (currentChoghadiya.hindiName || currentChoghadiya.name) : 'चौघड़िया - -'}
          </text>
          {/* Bottom Label */}
          <text x="200" y="386" textAnchor="middle" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="serif" fontWeight="900" letterSpacing="1">।। वैदिक समय दिखाने वाला यंत्र ।।</text>
          {/* Left - Sunset */}
          <text transform="translate(14,200) rotate(-90)" textAnchor="middle" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="monospace" fontWeight="900">।। 🌇 सूर्यास्त {sunsetTimeStr} ।।</text>
          {/* Right - Sunrise */}
          <text transform="translate(386,200) rotate(90)" textAnchor="middle" dominantBaseline="central" className="fill-[#C2410C] dark:fill-brand-accent" fontSize="11" fontFamily="monospace" fontWeight="900">।। 🌅 सूर्योदय {sunriseTimeStr} ।।</text>
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
                <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 dark:text-brand-text-mut font-bold tracking-wider uppercase leading-none mb-0.5">वर्तमान तिथि</span>
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
                    <span className="text-[7.5px] sm:text-[8.5px] font-black text-slate-400 dark:text-brand-text-mut uppercase font-mono">{ampm}</span>
                    <span className="text-[9px] sm:text-[10px] text-orange-400/80 font-mono font-bold">{secs}</span>
                  </div>
                </div>
                
                {/* Watch info bar */}
                <p className="text-[7.5px] sm:text-[8.5px] text-stone-500 dark:text-brand-text-mut font-mono tracking-wide uppercase leading-none mt-1 whitespace-nowrap">
                  📍 {sunriseTimeStr ? 'वैदिक काल' : 'सनातन समय'} • {hindiDayOfWeek} • {hindiDateStr}
                </p>
              </div>

              {/* Right Complication: Nakshatra */}
              <div className="flex flex-col items-end justify-center text-right w-[27%] shrink-0">
                <span className="text-[6.5px] sm:text-[7.5px] text-stone-500 dark:text-brand-text-mut font-bold tracking-wider uppercase leading-none mb-0.5">नक्षत्र</span>
                <span className="text-[10px] sm:text-[12px] font-black text-amber-300 font-serif leading-tight truncate w-full" title={nakshatraHindiName}>
                  {nakshatraHindiName}
                </span>
              </div>
            </div>

            {/* CENTRAL SACRED MUHURAT DISPLAY DIODE ROW (Hora | Muhurat | Choghadiya) */}
            <div className="w-full grid grid-cols-3 gap-1 px-1 relative z-10 max-w-[94%] mx-auto mb-2 select-none">
              {/* Left Box: Hora */}
              <div className="flex flex-col items-center justify-between p-1 py-1.5 bg-orange-950/30 border border-orange-900/40 rounded-lg min-h-[52px] text-center shadow-inner relative overflow-hidden">
                <span className="text-[7.5px] sm:text-[8.5px] text-stone-500 dark:text-brand-text-mut font-bold uppercase tracking-wider leading-none">होरा</span>
                <span className="text-[9.5px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight truncate w-full mt-0.5">
                  {activeHora ? activeHora.lordHindi : '-'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] font-mono text-stone-400 leading-none mt-1">
                  {activeHora ? `${activeHora.startTime}-${activeHora.endTime}` : '-'}
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
                <span className="text-[6px] sm:text-[7px] text-stone-500 dark:text-brand-text-mut font-bold uppercase tracking-wider leading-none">चौघड़िया</span>
                <span className="text-[9.5px] sm:text-[11px] font-black text-amber-300 font-serif leading-tight truncate w-full mt-0.5">
                  {currentChoghadiya ? (currentChoghadiya.hindiName || currentChoghadiya.name) : '-'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] font-mono text-stone-400 leading-none mt-1">
                  {currentChoghadiya ? `${currentChoghadiya.startTime}-${currentChoghadiya.endTime}` : '-'}
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
                <span className="text-[6.5px] sm:text-[7.5px] text-slate-400 dark:text-brand-text-mut font-bold uppercase leading-none mt-0.5">मुहूर्त</span>
              </div>

              {/* Abhijit Muhurat */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-black text-amber-400 leading-none">अभिजीत</span>
                <span className="text-[10px] sm:text-[11px] text-amber-500/90 font-serif font-black my-0.5 leading-none">卐</span>
                <span className="text-[8px] sm:text-[9px] font-mono font-black text-amber-400 leading-none">
                  {abhijitMuh ? abhijitMuh.startTime.replace(' AM', '').replace(' PM', '') : '11:48'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] text-slate-400 dark:text-brand-text-mut font-bold uppercase leading-none mt-0.5">मुहूर्त</span>
              </div>

              {/* Godhuli Muhurat */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] sm:text-[9px] font-black text-rose-400 leading-none">गोधूलि</span>
                <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-500 my-0.5" />
                <span className="text-[8px] sm:text-[9px] font-mono font-black text-slate-200 leading-none">
                  {godhuliMuh ? godhuliMuh.startTime.replace(' AM', '').replace(' PM', '') : '18:40'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] text-slate-400 dark:text-brand-text-mut font-bold uppercase leading-none mt-0.5">मुहूर्त</span>
              </div>
            </div>

          </div>
        </div>

        </>
        )}
      </div>

      {/* BRIEF DESCRIPTION DETAILS */}
      <div className="w-full mt-4 text-center">
        <p className="text-[11.5px] text-slate-400 dark:text-brand-text-pri max-w-xs mx-auto leading-normal italic font-medium">
          "{currentMuhurat ? currentMuhurat.description : 'दैनिक गृह गोचर स्थिति के अनुसार पवित्र कार्य सफल सिद्ध होते हैं।'}"
        </p>
        <div className="mt-2.5 px-3 py-1 bg-orange-100/50 dark:bg-brand-card inline-flex items-center gap-1.5 text-orange-900 dark:text-amber-200 border border-orange-200/50 dark:border-brand-border rounded-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 dark:text-amber-300">शुभता:</span>
          <span className="text-[10px] text-slate-700 dark:text-brand-text-pri font-black font-sans">
            {currentMuhurat ? currentMuhurat.suitability : 'दैनिक शुभ चौघड़िया अनुसार सामान्य है।'}
          </span>
        </div>
      </div>

      {/* TWO DETAILED CARDS: HORA & CHOGHADIYA */}
      <div className="w-full mt-4 border-t border-orange-100 dark:border-brand-border pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
          {/* Card 1: Current Hora */}
          <div className="p-3.5 rounded-2xl border border-orange-200/40 dark:border-brand-border bg-orange-50/10 dark:bg-[#1E1713]/80 backdrop-blur-xs flex flex-col justify-between space-y-2 text-left shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-600 dark:text-brand-accent uppercase tracking-widest font-mono">सक्रिय होरा</span>
              <span className="text-[11px] font-black text-slate-850 dark:text-brand-text-pri font-serif">
                {activeHora ? `${activeHora.lordHindi} की होरा` : '-'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-amber-200 font-mono">
              <span>समय:</span>
              <span>{activeHora ? `${activeHora.startTime} से ${activeHora.endTime}` : '-'}</span>
            </div>
            
            <div className="border-t border-orange-100/30 dark:border-brand-border pt-1.5">
              <span className="text-[9px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">उपयुक्त कार्य:</span>
              <p className="text-[11px] text-slate-700 dark:text-brand-text-pri font-medium leading-relaxed">
                {activeHora ? activeHora.benefits : '-'}
              </p>
            </div>
            
            <div className="border-t border-orange-100/30 dark:border-brand-border pt-1.5">
              <span className="text-[9px] font-black text-slate-650 dark:text-brand-text-pri uppercase tracking-widest block mb-0.5 font-mono">वैदिक परामर्श:</span>
              <p className="text-[11px] text-slate-700 dark:text-brand-text-pri font-medium leading-relaxed">
                {activeHora ? getHoraAdvice(activeHora.quality) : '-'}
              </p>
            </div>
          </div>

          {/* Card 2: Current Choghadiya */}
          <div className="p-3.5 rounded-2xl border border-orange-200/40 dark:border-brand-border bg-orange-50/10 dark:bg-[#1E1713]/80 backdrop-blur-xs flex flex-col justify-between space-y-2 text-left shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-600 dark:text-brand-accent uppercase tracking-widest font-mono">सक्रिय चौघड़िया</span>
              <span className="text-[11px] font-black text-slate-850 dark:text-brand-text-pri font-serif">
                {currentChoghadiya ? `${currentChoghadiya.hindiName || currentChoghadiya.name} चौघड़िया` : '-'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-amber-200 font-mono">
              <span>समय:</span>
              <span>{currentChoghadiya ? `${currentChoghadiya.startTime} से ${currentChoghadiya.endTime}` : '-'}</span>
            </div>
            
            <div className="border-t border-orange-100/30 dark:border-brand-border pt-1.5">
              <span className="text-[9px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">उपयुक्त कार्य:</span>
              <p className="text-[11px] text-slate-700 dark:text-brand-text-pri font-medium leading-relaxed">
                {currentChoghadiya ? getChoghadiyaUpyuktKarya(currentChoghadiya.type) : '-'}
              </p>
            </div>
            
            <div className="border-t border-orange-100/30 dark:border-brand-border pt-1.5">
              <span className="text-[9px] font-black text-slate-655 dark:text-brand-text-pri uppercase tracking-widest block mb-0.5 font-mono">वैदिक परामर्श:</span>
              <p className="text-[11px] text-slate-700 dark:text-brand-text-pri font-medium leading-relaxed">
                {currentChoghadiya ? getChoghadiyaAdvice(currentChoghadiya.type) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
