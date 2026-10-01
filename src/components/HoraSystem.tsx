import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  CircleCheck,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import { PanchangInfo } from '../types';

interface HoraSystemProps {
  panchang: PanchangInfo;
  currentTime: Date;
}

export function HoraSystem({ panchang, currentTime }: HoraSystemProps) {
  const [filter, setFilter] = useState<'all' | 'day' | 'night'>('all');
  const [showInfo, setShowInfo] = useState(false);

  // Parse time format "HH:MM AM/PM" to minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      const [time, ampm] = timeStr.split(' ');
      if (!time || !ampm) return 0;
      let [hrs, mins] = time.split(':').map(Number);
      if (ampm === 'PM' && hrs !== 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    } catch {
      return 0;
    }
  };

  // Check if current time is inside a specific hora interval
  const isTimeInInterval = (currMin: number, startStr: string, endStr: string): boolean => {
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    if (start <= end) {
      return currMin >= start && currMin < end;
    } else {
      // Over midnight wrap-around
      return currMin >= start || currMin < end;
    }
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Find currently active Hora
  const activeHora = panchang.hora?.find(h => 
    isTimeInInterval(currentMinutes, h.startTime, h.endTime)
  ) || panchang.hora?.[0]; // Fallback to first if undetermined

  // Filter Horas
  const filteredHoras = panchang.hora?.filter(h => {
    if (filter === 'day') return h.isDay;
    if (filter === 'night') return !h.isDay;
    return true;
  }) || [];

  return (
    <div id="hora_system_root" className="space-y-6 text-left font-sans animate-fade-in">
      
      {/* 1. HERO LIVE CODESPAN / ACTIVE HORA CONTAINER */}
      {activeHora && (
        <div className="relative overflow-hidden rounded-3xl p-5 border border-orange-200/50 dark:border-dark-border bg-linear-to-br from-orange-500/8 to-amber-500/5 dark:from-orange-950/20 dark:to-stone-900/40 shadow-sm">
          
          {/* Subtle Decorative Aura */}
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-48 h-48 bg-orange-500/10 dark:bg-orange-600/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-black text-rose-600 dark:text-dark-accent uppercase tracking-widest font-mono">
                  अभी सक्रिय होरा (Current Live Hora)
                </span>
              </div>
              <h2 className="text-2xl font-serif text-slate-800 dark:text-orange-50 font-black leading-tight flex items-center gap-2">
                {activeHora.lordHindi} की होरा
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${activeHora.colorClass.split(' ').slice(2).join(' ')}`}>
                  {activeHora.qualityHindi}
                </span>
              </h2>
              <p className="text-[10.5px] sm:text-xs text-slate-500 dark:text-zinc-550 font-mono mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 
                {activeHora.startTime} से {activeHora.endTime} तक (होरा संख्या: {activeHora.number})
              </p>
            </div>

            {/* Quick summary button / toggle info */}
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="px-3.5 py-1.5 rounded-xl border border-orange-200 hover:border-orange-400 text-orange-655 dark:border-dark-border dark:hover:border-orange-700 bg-white dark:bg-stone-950/70 text-2xs font-extrabold flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              होरा क्या होता है?
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-dark-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/40 dark:bg-dark-card p-3 rounded-2xl border border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-orange-850 dark:text-amber-300 font-serif mb-1">
                <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                इस होरा में उपयुक्त शुभ कार्य:
              </div>
              <p className="text-[11px] sm:text-xs text-slate-650 dark:text-dark-text-mut leading-relaxed font-sans font-medium">
                {activeHora.benefits}
              </p>
            </div>

            <div className="bg-white/40 dark:bg-dark-card p-3 rounded-2xl border border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-700 dark:text-slate-350 font-serif mb-1">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${activeHora.quality === 'Inauspicious' ? 'text-rose-500' : 'text-amber-500'}`} />
                वैदिक परामर्श व मार्गदर्शन:
              </div>
              <p className="text-[11px] sm:text-xs text-slate-650 dark:text-dark-text-mut leading-relaxed font-medium">
                {activeHora.quality === 'Inauspicious' ? (
                  'यह होरा क्रूर या अशुभ मानी जाती है। इसमें नए या मांगलिक कार्यों की शुरुआत टालना ही हितैषी है।'
                ) : activeHora.quality === 'Auspicious' ? (
                  'यह एक अमृत या सौम्य होरा है। इस काल में किए गए प्रयास प्रायः फलदायी और शुभ होते हैं।'
                ) : (
                  'यह सामान्य फल देने वाली होरा है। इसमें दैनिक व सामान्य सांसारिक कार्य आसानी से संपन्न किए जा सकते हैं।'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC EDUCATIONAL ACCORDION */}
      {showInfo && (
        <div className="bg-orange-50/20 dark:bg-dark-card border border-orange-150 dark:border-dark-border p-4 rounded-2xl space-y-3 leading-relaxed text-slate-600 dark:text-dark-text-pri text-xs font-serif animate-slide-in">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-orange-900 dark:text-dark-text-pri flex items-center gap-1">
              <Info className="w-4 h-4 text-orange-500" />
              होरा प्रणाली (The Hora System) को समझें
            </h3>
            <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-500 dark:text-stone-500 dark:hover:text-stone-400 text-2xs uppercase tracking-wider font-mono">छिपाएं [x]</button>
          </div>
          <p className="font-sans text-[11px] leading-relaxed text-slate-600 dark:text-dark-text-mut">
            वैदिक पंचांग में सूर्योदय से अगले सूर्योदय के समय को <strong>24 होरा (वैदिक घंटे)</strong> में बांटा गया है। दिनमान (सूर्योदय से सूर्यास्त) को 12 बराबर भागों में (दिन की होरा) तथा रात्रिमान (सूर्यास्त से अगले सूर्योदय) को 12 बराबर भागों में (रात की होरा) विभाजित किया जाता है।
          </p>
          <p className="font-sans text-[11px] leading-relaxed text-slate-600 dark:text-dark-text-mut">
            प्रत्येक होरा का स्वामी सूर्यमंडल का एक निश्चित ग्रह होता है। दिन की प्रथम होरा का स्वामी <strong>उस दिन के वार का स्वामी</strong> होता है (शुरुआत सूर्योदय पर होती है)। होरा अनुक्रम इस प्रकार चलता है: <strong>सूर्य, शुक्र, बुध, चंद्र, शनि, गुरु, मंगल</strong>।
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-sans text-[11px]">
            <div className="p-2 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl">
              <span className="font-black text-emerald-600 dark:text-emerald-400">🟢 शुभ होरा</span>
              <p className="text-[10px] text-slate-500 dark:text-dark-text-mut">गुरु, शुक्र, बुध और चंद्र</p>
            </div>
            <div className="p-2 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 rounded-xl">
              <span className="font-black text-rose-600 dark:text-rose-400">🔴 अशुभ होरा</span>
              <p className="text-[10px] text-slate-500 dark:text-dark-text-mut">शनि और मंगल</p>
            </div>
            <div className="p-2 bg-orange-500/5 dark:bg-dark-card border border-orange-500/10 rounded-xl col-span-2 sm:col-span-1">
              <span className="font-black text-orange-600 dark:text-dark-accent">🟡 मध्यम होरा</span>
              <p className="text-[10px] text-slate-500 dark:text-dark-text-mut">सूर्य की होरा</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCHEDULE TAB BAR & FILTER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-dark-text-pri font-serif leading-4 uppercase">
            आज की होरा सारिणी (Hourly Schedule)
          </h3>
          <span className="text-[9.5px] text-slate-400 dark:text-dark-text-mut font-semibold tracking-wider font-mono">
            २४ घंटे का संपूर्ण वैदिक काल चक्र
          </span>
        </div>

        {/* Filters */}
        <div className="flex bg-slate-100 dark:bg-dark-card border border-slate-200/50 dark:border-dark-border rounded-2xl p-1 gap-1 w-full sm:w-auto self-stretch sm:self-auto shadow-3xs">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-3xs font-extrabold tracking-tight transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-amber-300 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-dark-text-mut dark:hover:text-zinc-200'
            }`}
          >
            सभी (24)
          </button>
          <button
            onClick={() => setFilter('day')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-3xs font-extrabold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
              filter === 'day'
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-amber-300 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-dark-text-mut dark:hover:text-zinc-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-550" />
            दिन (12)
          </button>
          <button
            onClick={() => setFilter('night')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-3xs font-extrabold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
              filter === 'night'
                ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-amber-300 shadow-3xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-dark-text-mut dark:hover:text-zinc-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-blue-450" />
            रात (12)
          </button>
        </div>
      </div>

      {/* 4. GRID TIMELINE OF HORAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredHoras.map((h, index) => {
          const isCurrentlyActive = activeHora && activeHora.number === h.number;
          const isAuspicious = h.quality === 'Auspicious';
          const isInauspicious = h.quality === 'Inauspicious';

          return (
            <div 
              key={h.number}
              className={`relative rounded-2xl p-4.5 border transition-all duration-300 flex flex-col justify-between ${
                isCurrentlyActive 
                  ? 'bg-orange-50/45 dark:bg-dark-card border-orange-500 dark:border-orange-500 ring-2 ring-orange-500/15 dark:ring-orange-500/25 shadow-xs scale-[1.012]' 
                  : 'bg-white dark:bg-dark-card border-slate-100 dark:border-dark-border hover:border-orange-100 dark:hover:border-orange-950/40'
              }`}
            >
              {/* Timing Delineation / Number Flag */}
              <div className="flex justify-between items-start mb-3">
                <span className="flex items-center gap-1.5 text-3xs font-black tracking-widest text-slate-400 font-mono uppercase bg-slate-100 dark:bg-dark-card px-2.5 py-1 rounded-md">
                  {h.isDay ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                  होरा {h.number}
                </span>

                {isCurrentlyActive ? (
                  <span className="text-[8px] font-black tracking-widest bg-emerald-500 text-white dark:bg-emerald-600 uppercase px-2 py-0.5 rounded-md animate-pulse">
                    LIVE
                  </span>
                ) : (
                  <span className={`text-[8.5px] px-2 py-0.5 rounded-md font-extrabold border ${h.colorClass.split(' ').slice(2).join(' ')}`}>
                    {h.qualityHindi}
                  </span>
                )}
              </div>

              {/* Day info / Lord */}
              <div className="flex flex-col gap-1 text-left mb-3">
                <span className="text-base font-serif font-black text-slate-800 dark:text-orange-50 flex items-center gap-1.5">
                  {h.lordHindi}
                  {h.lord === 'Sun' && <Sparkles className="w-4 h-4 text-orange-500" />}
                </span>
                
                <span className="text-3xs font-black text-slate-500 dark:text-zinc-550 font-mono flex items-center gap-1 leading-none">
                  <Clock className="w-3 h-3" />
                  {h.startTime} - {h.endTime}
                </span>
              </div>

              {/* Benefits */}
              <div className="border-t border-dashed border-slate-100 dark:border-dark-border pt-2.5">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5 font-mono">
                  उपयुक्त कार्य (Suitable Tasks):
                </span>
                <p className="text-[10px] sm:text-[10.5px] text-slate-600 dark:text-dark-text-mut leading-relaxed font-sans font-medium line-clamp-2" title={h.benefits}>
                  {h.benefits}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
