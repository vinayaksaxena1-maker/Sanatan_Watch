/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, AlertTriangle, Info, Calendar, RefreshCw } from 'lucide-react';
import { calculateFutureTransits, TransitItem } from '../utils/transitEngine';
import { Language } from '../utils/translations';

interface TransitScreenProps {
  language: Language;
  theme: 'light' | 'dark';
}

export function TransitScreen({ language, theme }: TransitScreenProps) {
  const [transits, setTransits] = useState<TransitItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlanet, setSelectedPlanet] = useState<string>('All');

  const planetsList = ['All', 'Sun', 'Mars', 'Mercury', 'Venus', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

  const planetTranslation: Record<string, string> = {
    'All': language === 'Hindi' ? 'सभी' : 'All',
    'Sun': language === 'Hindi' ? 'सूर्य' : 'Sun',
    'Mars': language === 'Hindi' ? 'मंगल' : 'Mars',
    'Mercury': language === 'Hindi' ? 'बुध' : 'Mercury',
    'Venus': language === 'Hindi' ? 'शुक्र' : 'Venus',
    'Jupiter': language === 'Hindi' ? 'गुरु' : 'Jupiter',
    'Saturn': language === 'Hindi' ? 'शनि' : 'Saturn',
    'Rahu': language === 'Hindi' ? 'राहु' : 'Rahu',
    'Ketu': language === 'Hindi' ? 'केतु' : 'Ketu'
  };

  useEffect(() => {
    let active = true;
    setLoading(true);

    calculateFutureTransits(new Date(), 180).then((result) => {
      if (active) {
        // Sort transits chronologically
        const sorted = [...result].sort((a, b) => a.date.getTime() - b.date.getTime());
        setTransits(sorted);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredTransits = selectedPlanet === 'All'
    ? transits
    : transits.filter(t => t.planetName === selectedPlanet);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="text-left space-y-1 select-none">
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
          {language === 'Hindi' ? '॥ भावी गोचर चक्र ॥' : '|| FUTURE TRANSIT MAP ||'}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-800 dark:text-amber-100 flex items-center gap-2">
          <Compass className="w-6 h-6 text-orange-500 animate-spin-slow" />
          {language === 'Hindi' ? 'ग्रह गोचर एवं भविष्यफल' : 'Planetary Transits & Predictions'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {language === 'Hindi' 
            ? 'आगामी ६ महीनों में होने वाले ग्रहों के राशि परिवर्तन की सटीक तिथियां और ज्योतिषीय प्रभाव।'
            : 'Precise transit dates and Vedic astrological predictions for the next 6 months.'}
        </p>
      </div>

      {/* Planet Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap select-none border-b border-orange-100/30 dark:border-zinc-800/40">
        {planetsList.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPlanet(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0 transition-all duration-300 ${
              selectedPlanet === p
                ? 'bg-orange-500 text-white shadow-md scale-105'
                : 'bg-white/50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400 hover:bg-orange-500/10 hover:text-orange-655 border border-orange-100/10 dark:border-zinc-800/30'
            }`}
          >
            {planetTranslation[p]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {language === 'Hindi' ? 'गोचर सारणी की गणना की जा रही है...' : 'Calculating transit mappings...'}
          </span>
        </div>
      ) : filteredTransits.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-zinc-900/10 border border-orange-100/20 dark:border-zinc-800/30 rounded-3xl p-6">
          <span className="text-2xl block mb-2">🔭</span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block">
            {language === 'Hindi' ? 'इस अवधि में कोई मुख्य गोचर नहीं है।' : 'No major transits found in this period.'}
          </span>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredTransits.map((item) => {
            // Auspiciousness styles
            let cardBg = 'bg-white/50 dark:bg-zinc-900/20 border-orange-100/40 dark:border-zinc-800/30';
            let iconBox = 'bg-blue-100/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450';
            let statusIcon = <Info className="w-4 h-4" />;
            let qualityLabel = language === 'Hindi' ? 'सामान्य' : 'Neutral';

            if (item.type === 'auspicious') {
              cardBg = 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-200/50 dark:border-emerald-950/20';
              iconBox = 'bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450';
              statusIcon = <Sparkles className="w-4 h-4" />;
              qualityLabel = language === 'Hindi' ? 'शुभ' : 'Auspicious';
            } else if (item.type === 'inauspicious') {
              cardBg = 'bg-rose-50/20 dark:bg-rose-950/5 border-rose-200/50 dark:border-rose-950/20';
              iconBox = 'bg-rose-100/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450';
              statusIcon = <AlertTriangle className="w-4 h-4" />;
              qualityLabel = language === 'Hindi' ? 'अशुभ' : 'Inauspicious';
            }

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={`flex flex-col p-4 sm:p-5 rounded-3xl border ${cardBg} shadow-2xs relative overflow-hidden`}
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  item.type === 'auspicious' ? 'bg-emerald-500' : item.type === 'inauspicious' ? 'bg-rose-500' : 'bg-blue-500'
                }`} />

                <div className="pl-2 space-y-3.5 text-left">
                  {/* Top line: Planet and Date */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Planet Transit</span>
                      <h4 className="text-base font-black text-slate-800 dark:text-orange-100 font-serif leading-tight">
                        {language === 'Hindi' ? item.planetHindi : item.planetName}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        {item.dateStr}
                      </span>
                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md border mt-1 shadow-3xs uppercase tracking-wide flex items-center gap-0.5 ${
                        item.type === 'auspicious' 
                          ? 'bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                          : item.type === 'inauspicious' 
                            ? 'bg-rose-100/60 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300' 
                            : 'bg-blue-100/60 dark:bg-zinc-800/40 border-blue-200 text-blue-800 dark:text-blue-300'
                      }`}>
                        {statusIcon}
                        {qualityLabel}
                      </span>
                    </div>
                  </div>

                  {/* Transition path */}
                  <div className="flex items-center gap-2 bg-white/45 dark:bg-zinc-900/40 p-2 rounded-xl border border-orange-100/10 dark:border-zinc-800/20 select-none">
                    <div className="min-w-0 pr-1">
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-mono">From (से)</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block font-serif truncate">
                        {language === 'Hindi' ? item.fromSignHindi : item.fromSign}
                      </span>
                    </div>
                    <span className="text-orange-500 font-bold shrink-0">➔</span>
                    <div className="min-w-0 pl-1">
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-mono">To (में)</span>
                      <span className="text-xs font-black text-orange-700 dark:text-orange-300 block font-serif truncate">
                        {language === 'Hindi' ? item.toSignHindi : item.toSign}
                      </span>
                    </div>
                  </div>

                  {/* Predictive text */}
                  <div className="text-xs sm:text-[12.5px] leading-relaxed text-slate-650 dark:text-slate-350">
                    <p className="font-serif">
                      {language === 'Hindi' ? item.predictionHindi : item.prediction}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
