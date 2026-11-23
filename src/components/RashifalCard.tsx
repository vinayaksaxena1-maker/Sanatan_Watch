/**
 * Sanatan Watch (सनातन घड़ी)
 * Component: RashifalCard.tsx
 * Option A: Home Page Card - Dual-Mode Daily Rashifal (दैनिक राशिफल) + Live Planetary Transit (ग्रह गोचर)
 * Authentic Vedic Rashi Icons, Classical Moon Transit Invariants, 100% Offline MIT Engine
 */

import React, { useState, useMemo } from 'react';
import { VedicRashiGoldIcon } from './VedicRashiGoldIcon';
import { calculateTransitHouse } from '../engine/transit/transitMath';
import {
  CANONICAL_TRANSITS,
  getRashiByIndex,
} from '../engine/transit/transitSchedule';
import { generateCompleteTransitPost } from '../engine/transit/rules';
import { drik_julday, drik_calc_ut, SE_MOON, SEFLG_SIDEREAL } from '../engine/core/sanatan_jpl_bridge';

export interface RashifalCardProps {
  selectedDate?: Date;
  language?: string;
  className?: string;
}

export const RASHIS = [
  { id: 0, name: 'मेष', key: 'mesh', english: 'Aries', lord: 'मंगल' },
  { id: 1, name: 'वृषभ', key: 'vrishabh', english: 'Taurus', lord: 'शुक्र' },
  { id: 2, name: 'मिथुन', key: 'mithun', english: 'Gemini', lord: 'बुध' },
  { id: 3, name: 'कर्क', key: 'kark', english: 'Cancer', lord: 'चन्द्र' },
  { id: 4, name: 'सिंह', key: 'singh', english: 'Leo', lord: 'सूर्य' },
  { id: 5, name: 'कन्या', key: 'kanya', english: 'Virgo', lord: 'बुध' },
  { id: 6, name: 'तुला', key: 'tula', english: 'Libra', lord: 'शुक्र' },
  { id: 7, name: 'वृश्चिक', key: 'vrishchik', english: 'Scorpio', lord: 'मंगल' },
  { id: 8, name: 'धनु', key: 'dhanu', english: 'Sagittarius', lord: 'बृहस्पति' },
  { id: 9, name: 'मकर', key: 'makar', english: 'Capricorn', lord: 'शनि' },
  { id: 10, name: 'कुंभ', key: 'kumbh', english: 'Aquarius', lord: 'शनि' },
  { id: 11, name: 'मीन', key: 'meen', english: 'Pisces', lord: 'बृहस्पति' },
];

const HOUSE_EFFECTS: Record<
  number,
  { prediction: string; caution: string; status: string; color: string; num: number }
> = {
  1: { prediction: 'शारीरिक ऊर्जा एवं आत्मबल में वृद्धि होगी। नवीन कार्यों के शुभारंभ हेतु अनुकूल योग बन रहे हैं।', caution: 'अति-उत्साह में बिना सोचे-समझें निर्णय लेने से बचें।', status: 'उत्तम', color: 'लाल', num: 9 },
  2: { prediction: 'आर्थिक स्थिति में सुधार होगा तथा परिवार में मांगलिक वातावरण रहेगा। वाणी का प्रभाव बढ़ेगा।', caution: 'कटु वाणी एवं अनावश्यक धन व्यय से दूर रहें।', status: 'शुभ', color: 'सफेद', num: 6 },
  3: { prediction: 'पराक्रम एवं पुरुषार्थ में वृद्धि होगी। सहोदरों का पूर्ण सहयोग प्राप्त होगा तथा यात्राएं फलदायी होंगी।', caution: 'आलस्य का त्याग करें एवं एकाग्रता बनाए रखें।', status: 'उत्तम', color: 'हरा', num: 5 },
  4: { prediction: 'माता के स्वास्थ्य का ध्यान रखें। गृह व वाहन संबंधी सुखों में वृद्धि होगी किन्तु मन में चंचलता रहेगी।', caution: 'घरेलू कलह अथवा विवाद से दूरी बनाकर रखें।', status: 'मध्यम', color: 'दूधिया', num: 2 },
  5: { prediction: 'विद्या, बुद्धि एवं संतान पक्ष से शुभ समाचार प्राप्त होंगे। रचनात्मक कार्यों में विशेष सफलता मिलेगी।', caution: 'भावनाओं में बहकर कोई बड़ा निर्णय न लें।', status: 'उत्तम', color: 'पीला', num: 1 },
  6: { prediction: 'प्रतिस्पर्धा एवं विरोधियों पर विजय प्राप्त होगी। पुराने रोगों एवं ऋणों से मुक्ति के मार्ग प्रशस्त होंगे।', caution: 'व्यर्थ के वाद-विवाद एवं गुप्त शत्रुओं से सावधान रहें।', status: 'शुभ', color: 'ग्रे', num: 7 },
  7: { prediction: 'दाम्पत्य जीवन में मधुरता आएगी तथा साझेदारी के व्यापार में लाभ के योग हैं। जनसंपर्क बढ़ेगा।', caution: 'जीवनसाथी के विचारों का अनादर न करें।', status: 'शुभ', color: 'गुलाबी', num: 6 },
  8: { prediction: 'चन्द्राष्टम स्थिति के कारण मानसिक उद्विग्नता रह सकती है। आध्यात्मिक कार्यों में रुचि बढ़ेगी।', caution: 'जोखिम भरे निवेश एवं वाहन चलाने में विशेष सतर्कता बरतें।', status: 'सतर्क', color: 'नारंगी', num: 8 },
  9: { prediction: 'भाग्योदय के प्रबल अवसर बनेंगे। धर्म-कर्म एवं तीर्थ यात्रा के योग हैं। गुरुजनों का आशीर्वाद मिलेगा।', caution: 'अहंकार को अपने विवेक पर हावी न होने दें।', status: 'उत्तम', color: 'सुनहरा', num: 3 },
  10: { prediction: 'कार्यक्षेत्र में पदोन्नति एवं मान-सम्मान में वृद्धि होगी। उच्चाधिकारियों का सहयोग प्राप्त होगा।', caution: 'कार्यस्थल की राजनीति से स्वयं को दूर रखें।', status: 'उत्तम', color: 'नीला', num: 8 },
  11: { prediction: 'आय के नवीन स्रोत बनेंगे तथा बहुप्रतीक्षित इच्छाएं पूर्ण होंगी। मित्रों से लाभ प्राप्त होगा।', caution: 'जल्दबाजी में अनुचित मार्ग का चयन न करें।', status: 'उत्तम', color: 'बैंगनी', num: 4 },
  12: { prediction: 'दूरस्थ यात्राओं एवं मांगलिक कार्यों में व्यय होगा। आध्यात्मिक शांति की अनुभूति होगी।', caution: 'अनावश्यक खर्चों पर नियंत्रण रखें एवं सेहत का ध्यान दें।', status: 'मध्यम', color: 'आसमानी', num: 3 },
};

export const RashifalCard: React.FC<RashifalCardProps> = ({
  selectedDate = new Date(),
  language = 'Hindi',
  className = '',
}) => {
  const isHin = language === 'Hindi';
  const [selectedRashiIdx, setSelectedRashiIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'daily' | 'gochar'>('daily');

  // Compute live Moon Rashi Index for the selected date
  const moonRashiIdx = useMemo(() => {
    try {
      const d = selectedDate;
      const jd = drik_julday(
        d.getUTCFullYear(),
        d.getUTCMonth() + 1,
        d.getUTCDate(),
        d.getUTCHours() + d.getUTCMinutes() / 60
      );
      const res = drik_calc_ut(jd, SE_MOON, SEFLG_SIDEREAL);
      if (res && res[0] !== undefined) {
        return Math.floor(res[0] / 30) % 12;
      }
    } catch {
      // safe fallback
    }
    return 1;
  }, [selectedDate]);

  // Selected Rashi Daily Forecast
  const selectedRashiEffect = useMemo(() => {
    const houseFromMoon = ((selectedRashiIdx - moonRashiIdx + 12) % 12) + 1;
    const effect = HOUSE_EFFECTS[houseFromMoon] || HOUSE_EFFECTS[1];
    const rashiMeta = RASHIS[selectedRashiIdx];
    const isChandrashtama = houseFromMoon === 8;
    return {
      ...rashiMeta,
      ...effect,
      houseFromMoon,
      isChandrashtama,
    };
  }, [selectedRashiIdx, moonRashiIdx]);

  // Selected Rashi Major Planetary Transits (Gochar)
  const gocharData = useMemo(() => {
    const rashiNum = selectedRashiIdx + 1; // 1 to 12

    // Primary Featured Transits: Guru & Shani & Rahu
    const jupiter = CANONICAL_TRANSITS.find((t) => t.planet === 'jupiter') || CANONICAL_TRANSITS[0];
    const saturn = CANONICAL_TRANSITS.find((t) => t.planet === 'saturn') || CANONICAL_TRANSITS[1];
    const rahu = CANONICAL_TRANSITS.find((t) => t.planet === 'rahu') || CANONICAL_TRANSITS[2];

    const jupHouse = calculateTransitHouse(rashiNum, jupiter.toRashi);
    const satHouse = calculateTransitHouse(rashiNum, saturn.toRashi);
    const rahuHouse = calculateTransitHouse(rashiNum, rahu.toRashi);

    const jupPost = generateCompleteTransitPost(jupiter, rashiNum);

    // Saturn Sade Sati / Dhaiya status
    let satLabel = `${satHouse}वां भाव`;
    if (satHouse === 12) satLabel = '१२H (साढ़े साती १)';
    else if (satHouse === 1) satLabel = '१H (शिखर साढ़े साती)';
    else if (satHouse === 2) satLabel = '२H (अस्त साढ़े साती)';
    else if (satHouse === 4) satLabel = '४H (कंटक ढैया)';
    else if (satHouse === 8) satLabel = '८H (अष्टम ढैया)';

    return {
      jupHouse,
      jupStatus: jupPost.evaluation.statusLabelHindi,
      jupOverall: jupPost.evaluation.overallStatus,
      jupSummary: jupPost.rule.summary,
      jupToRashi: getRashiByIndex(jupiter.toRashi).nameHi,
      satHouse,
      satLabel,
      satToRashi: getRashiByIndex(saturn.toRashi).nameHi,
      rahuHouse,
      rahuToRashi: getRashiByIndex(rahu.toRashi).nameHi,
    };
  }, [selectedRashiIdx]);

  return (
    <div
      id="home_card_rashifal_gochar"
      className={`glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left border border-orange-200/60 dark:border-orange-950/30 rounded-3xl space-y-3 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* 1. Header with Mode Selector Switch */}
      <div className="flex flex-col items-center justify-center text-center border-b border-orange-100/30 dark:border-orange-950/20 pb-2.5 w-full">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex items-center gap-2">
            <img
              src="/assets/icons/feature/rashifal.webp"
              alt=""
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full shadow-2xs shrink-0"
              onError={(e) => {
                // fallback to emoji
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <h3 className="text-[17px] sm:text-[18.5px] font-black text-[#9A3412] dark:text-amber-400 leading-tight font-serif">
              {activeTab === 'daily'
                ? isHin ? "॥ आज का दैनिक राशिफल ॥" : "॥ Daily Horoscope ॥"
                : isHin ? "॥ मुख्य ग्रह गोचर संचरण ॥" : "॥ Planetary Transits ॥"}
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
            {isHin ? `चंद्र: ${RASHIS[moonRashiIdx].name}` : `Moon: ${RASHIS[moonRashiIdx].english}`}
          </span>
        </div>

        {/* Ornamental Divider with Center Alankar */}
        <div className="flex items-center justify-center gap-2 w-full h-[10px] leading-none opacity-80 my-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-900/25 to-amber-900/50 dark:via-amber-400/30 dark:to-amber-400/50" />
          <div className="flex items-center gap-1 px-1.5 text-amber-800 dark:text-amber-400 select-none leading-none">
            <span className="text-[7.5px] opacity-70">✦</span>
            <span className="text-[9px]">❖</span>
            <span className="text-[7.5px] opacity-70">✦</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-900/25 to-amber-900/50 dark:via-amber-400/30 dark:to-amber-400/50" />
        </div>

        {/* Dual Tab Switcher: दैनिक राशिफल vs ग्रह गोचर */}
        <div className="flex items-center justify-center gap-1 p-0.5 bg-orange-500/10 dark:bg-stone-900/80 rounded-xl border border-orange-200/50 dark:border-amber-900/40 w-full mt-1 max-w-[280px]">
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-200'
            }`}
          >
            {isHin ? "दैनिक राशिफल" : "Daily Horoscope"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gochar')}
            className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'gochar'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-200'
            }`}
          >
            <span>🪐</span>
            <span>{isHin ? "ग्रह गोचर" : "Transits"}</span>
          </button>
        </div>
      </div>

      {/* 2. 12 Rashis Selector Grid */}
      <div className="space-y-1">
        <span className="text-[11.5px] font-bold text-amber-900/80 dark:text-amber-400/80 tracking-wide font-serif block">
          {isHin ? "अपनी राशि चुनें:" : "Select Your Zodiac Sign:"}
        </span>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
          {RASHIS.map((rashi) => {
            const isSelected = selectedRashiIdx === rashi.id;
            const isCurrentMoon = moonRashiIdx === rashi.id;
            return (
              <button
                key={rashi.id}
                type="button"
                onClick={() => setSelectedRashiIdx(rashi.id)}
                className={`py-1.5 px-0.5 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-500/20 to-amber-500/30 dark:from-orange-950/60 dark:to-amber-950/40 text-[#9A3412] dark:text-amber-300 font-bold border border-orange-400 dark:border-amber-600 shadow-xs'
                    : 'bg-orange-500/5 hover:bg-orange-500/10 text-slate-700 dark:bg-stone-900/40 dark:hover:bg-stone-800 dark:text-slate-200 border border-transparent'
                }`}
                title={`${rashi.name} (${rashi.english})`}
              >
                {isCurrentMoon && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-900"
                    title={isHin ? "वर्तमान गोचर चंद्र" : "Current Moon Sign"}
                  />
                )}
                <VedicRashiGoldIcon
                  rashi={rashi.key}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
                <span className="text-[11px] sm:text-[12px] font-serif leading-none mt-0.5">
                  {isHin ? rashi.name : rashi.english.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Result Panel: Tab 1 (Daily) OR Tab 2 (Gochar) */}
      {activeTab === 'daily' ? (
        /* Daily Forecast Basin */
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 space-y-2">
          {/* Header row with icon, name, status, color & number */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <VedicRashiGoldIcon
                rashi={selectedRashiEffect.key}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 drop-shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#382012] dark:text-amber-100 text-[15.5px] sm:text-[17px] font-serif leading-tight">
                    {selectedRashiEffect.name} राशि
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                      selectedRashiEffect.isChandrashtama
                        ? 'bg-rose-600 text-white'
                        : selectedRashiEffect.status === 'उत्तम'
                        ? 'bg-emerald-600 text-white'
                        : selectedRashiEffect.status === 'शुभ'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {selectedRashiEffect.isChandrashtama ? '⚠️ चन्द्राष्टम' : selectedRashiEffect.status}
                  </span>
                </div>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-sans block">
                  {isHin ? `स्वामी: ${selectedRashiEffect.lord} • गोचर चंद्र से ${selectedRashiEffect.houseFromMoon}वां भाव` : `Lord: ${selectedRashiEffect.lord}`}
                </span>
              </div>
            </div>

            <div className="text-xs sm:text-[12.5px] text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2 bg-amber-100/70 dark:bg-stone-800/80 px-2.5 py-1 rounded-xl border border-amber-300/40 dark:border-amber-900/30">
              <span>
                {isHin ? "रंग: " : "Color: "}
                <strong className="text-amber-900 dark:text-amber-200 font-black">{selectedRashiEffect.color}</strong>
              </span>
              <span className="text-amber-900/30 select-none">•</span>
              <span>
                {isHin ? "अंक: " : "Num: "}
                <strong className="text-amber-900 dark:text-amber-200 font-black">{selectedRashiEffect.num}</strong>
              </span>
            </div>
          </div>

          {/* Chandrashtama Alert if 8th House */}
          {selectedRashiEffect.isChandrashtama && (
            <div className="p-2 px-2.5 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>
                {isHin
                  ? "आज आपकी राशि से आठवें भाव में चंद्र संचरण (चन्द्राष्टम) है। महत्वपूर्ण अनुबंध, वाद-विवाद व त्वरित निर्णयों में धैर्य रखें।"
                  : "Chandrashtama in effect today. Exercise caution in major decisions and travel."}
              </span>
            </div>
          )}

          {/* Detailed Prediction */}
          <p className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-stone-200 leading-relaxed font-sans">
            {selectedRashiEffect.prediction}
          </p>

          {/* Caution Note */}
          <div className="pt-1.5 border-t border-amber-900/10 dark:border-amber-500/15 text-xs sm:text-[12.5px] text-slate-700 dark:text-stone-300 font-medium flex items-start gap-1">
            <span className="font-bold text-amber-900 dark:text-amber-400 shrink-0 font-serif">
              {isHin ? "सावधानी:" : "Caution:"}
            </span>
            <span className="leading-normal">{selectedRashiEffect.caution}</span>
          </div>
        </div>
      ) : (
        /* Gochar Transit Basin */
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 space-y-2">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <VedicRashiGoldIcon
                rashi={selectedRashiEffect.key}
                className="w-7 h-7 object-contain shrink-0 drop-shadow-xs"
              />
              <span className="font-bold font-serif text-[#382012] dark:text-amber-100 text-sm sm:text-[14.5px]">
                {selectedRashiEffect.name} {isHin ? "राशि पर मुख्य गोचर स्थिति:" : "Major Transits:"}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
              {isHin ? "दीर्घकालिक संचरण" : "Long-Term"}
            </span>
          </div>

          {/* 3 Major Transits Chips */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-sans">
            <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-stone-800/80 border border-amber-200/60 dark:border-stone-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                गुरु ({gocharData.jupToRashi})
              </span>
              <strong className="text-amber-950 dark:text-amber-200 text-xs sm:text-[13px] block mt-0.5 font-serif font-black">
                {gocharData.jupHouse}वां भाव
              </strong>
              <span
                className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-bold inline-block mt-1 ${
                  gocharData.jupOverall === 'shubh'
                    ? 'text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {gocharData.jupStatus}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-stone-800/80 border border-amber-200/60 dark:border-stone-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                शनि ({gocharData.satToRashi})
              </span>
              <strong className="text-amber-950 dark:text-amber-200 text-xs sm:text-[13px] block mt-0.5 font-serif font-black">
                {gocharData.satHouse}वां भाव
              </strong>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-md font-bold inline-block mt-1 text-slate-700 bg-slate-100 dark:bg-stone-700 dark:text-stone-300 truncate max-w-full">
                {gocharData.satLabel}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-stone-800/80 border border-amber-200/60 dark:border-stone-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                राहु ({gocharData.rahuToRashi})
              </span>
              <strong className="text-amber-950 dark:text-amber-200 text-xs sm:text-[13px] block mt-0.5 font-serif font-black">
                {gocharData.rahuHouse}वां भाव
              </strong>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-md font-bold inline-block mt-1 text-purple-800 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300">
                संचरणशील
              </span>
            </div>
          </div>

          {/* 1-Line Classical Summary */}
          <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed font-sans pt-0.5">
            {gocharData.jupSummary}
          </p>
        </div>
      )}
    </div>
  );
};

export default RashifalCard;
