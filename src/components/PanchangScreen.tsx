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

interface PanchangScreenProps {
  panchang: PanchangInfo;
  currentTime?: Date;
  onShare?: () => void;
}

export function PanchangScreen({ panchang, currentTime, onShare }: PanchangScreenProps) {
  const [mainViewMode, setMainViewMode] = useState<'choghadiya' | 'hora'>('choghadiya');
  const hDate = panchang.hinduDate;

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
    { label: 'सूर्योदय', val: panchang.sunrise, desc: 'प्रार्थना के लिए शुभ प्रातःकाल', icon: <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> },
    { label: 'सूर्यास्त', val: panchang.sunset, desc: 'संध्यावंदन का समय', icon: <Sun className="w-5 h-5 text-orange-600" /> },
    { label: 'चन्द्रोदय', val: panchang.moonrise, desc: 'चन्द्रोदय का समय', icon: <Moon className="w-5 h-5 text-indigo-400" /> },
    { label: 'चन्द्रास्त', val: panchang.moonset, desc: 'चन्द्रास्त का समय', icon: <Moon className="w-5 h-5 text-slate-400" /> },
  ];

  const mainPanchangElements = [
    {
      title: 'तिथि',
      fullName: hDate.tithi.hindiName,
      engName: hDate.tithi.name,
      endTime: hDate.tithi.endTime,
      lord: hDate.tithi.lord,
      deity: hDate.tithi.deity,
      description: 'चंद्रमा की 12 डिग्री की कोणीय दूरी को दर्शाने वाला चंद्र-सौर दिन।',
      badgeColor: 'bg-orange-100 border-orange-255 text-orange-850'
    },
    {
      title: 'नक्षत्र',
      fullName: `${hDate.nakshatra.hindiName}`,
      engName: `Lord: ${hDate.nakshatra.lord}`,
      endTime: hDate.nakshatra.endTime,
      lord: hDate.nakshatra.lord,
      deity: hDate.nakshatra.deity,
      description: `चंद्र राशि का भाग (${hDate.nakshatra.symbol})। प्रकृति ${hDate.nakshatra.nature} है।`,
      badgeColor: 'bg-amber-100 border-amber-200 text-amber-800'
    },
    {
      title: 'योग',
      fullName: hDate.yoga.hindiName.split(' ')[0],
      engName: hDate.yoga.name,
      endTime: hDate.yoga.endTime,
      lord: hDate.yoga.meaning,
      deity: 'Sun/Moon Union',
      description: 'सूर्य और चंद्रमा का संयुक्त देशांतर जिसे 27 समान भागों में विभाजित किया गया है।',
      badgeColor: 'bg-emerald-100 border-emerald-250 text-emerald-850'
    },
    {
      title: 'करण',
      fullName: hDate.karana.hindiName,
      engName: hDate.karana.name,
      endTime: hDate.karana.endTime,
      lord: hDate.karana.type === 'Fixed' ? 'स्थिर' : 'चर / गतिशील',
      deity: 'Karan Ruler',
      description: 'एक तिथि का आधा हिस्सा, चंद्र चक्र में एक महत्वपूर्ण घटना का संकेत देता है।',
      badgeColor: 'bg-purple-100 border-purple-250 text-purple-850'
    }
  ];

  return (
    <div id="panchang_screen_root" className="space-y-4 sm:space-y-6">


      {/* COMPACT & INTEGRATED SINGLE PANCHANG CARD - Styled exactly like Welcome Card */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-6 text-left space-y-6">
        
        {/* Header section (Aligns to Name/Grec status card) */}
        <div className="space-y-1 pb-3 border-b border-orange-100/60 dark:border-zinc-800/80">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">॥ संपूर्ण विवरण ॥</span>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-amber-100">वैदिक पंचांग संपूर्ण गणना</h2>
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 dark:text-slate-400">
            सूर्योदय, सूर्यास्त, तिथि, नक्षत्र, योग, करण और संवत् का वैज्ञानिक एवं आध्यात्मिक संयोजन।
          </p>
        </div>

        {/* A. Astronomical Timings Section */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 font-mono">
            🌅 सूर्य और चन्द्रोदय समय (Astronomical Timings)
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            🕉️ मुख्य पंचांग अंग (Five Essential Elements)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mainPanchangElements.map((elem, idx) => {
              let gridClass = "";
              if (idx === 0) gridClass = "md:col-span-2 md:row-span-2"; // Tithi
              else if (idx === 1) gridClass = "md:col-span-2"; // Nakshatra
              else if (idx === 2) gridClass = "md:col-span-1"; // Yoga
              else if (idx === 3) gridClass = "md:col-span-1"; // Karana

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
                    
                    <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 px-2 py-0.5 rounded-md inline-flex text-[9.5px] text-slate-500 mt-1.5 font-mono">
                      <span>समाप्ति:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{elem.endTime}</strong>
                    </div>

                    <p className="text-[11px] text-slate-550 dark:text-slate-400 font-sans mt-2.5 leading-relaxed">
                      {elem.description}
                    </p>

                    {elem.title === 'तिथि' && hDate.tithi.percentPassed !== undefined && (
                      <div className="w-full relative h-[100px] flex flex-col items-center justify-end mt-3 bg-white/5 dark:bg-white/2 rounded-xl p-2.5 border border-white/10 dark:border-white/5">
                        <div className="absolute top-2 w-full px-4 flex justify-between text-[8px] font-mono font-semibold text-slate-500">
                          <div className="text-left leading-tight">आरंभ<br/><span className="text-slate-800 dark:text-slate-300 font-bold">{hDate.tithi.startTime}</span></div>
                          <div className="text-right leading-tight">समाप्ति<br/><span className="text-slate-800 dark:text-slate-300 font-bold">{hDate.tithi.endTime}</span></div>
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
                          <span className="text-[8px] text-slate-400 block mt-0.5 font-sans font-bold uppercase tracking-wider">पूर्ण</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta properties */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100/80 dark:border-slate-800/50 text-[10px]">
                    <div>
                      <span className="text-slate-400 block font-mono">स्वामी / शासक</span>
                      <span className="font-bold text-slate-700 dark:text-amber-300 block mt-0.5 truncate">{elem.lord}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">देवता / आशीर्वाद</span>
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
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-amber-100 font-serif">संवत् प्रणाली विवरण</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">विक्रम और शक संवत् की पारंपरिक प्राचीन वैदिक कैलेंडर प्रणाली।</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
              <div className="p-2 px-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 text-center font-mono min-w-[100px]">
                <span className="text-[9px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">विक्रम संवत्</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-base block mt-0.5">{hDate.samvatVikram}</span>
              </div>
              <div className="p-2 px-3 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 text-center font-mono min-w-[100px]">
                <span className="text-[9px] font-bold text-[#9E2A00] dark:text-[#FF9933] uppercase block tracking-wider font-sans">शक संवत्</span>
                <span className="text-orange-950 dark:text-amber-200 font-extrabold text-base block mt-0.5">{hDate.samvatShaka}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* COMPACT & INTEGRATED CARD SWITCHER - CHOGHADIYA & VEDIC HORA */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-orange-100/60 dark:border-zinc-800/80">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">
              {mainViewMode === 'choghadiya' ? '॥ दैनिक चौघड़िया मुहूर्त ॥' : '॥ लाइव वैदिक होरा संसूचक ॥'}
            </span>
            <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif">
              {mainViewMode === 'choghadiya' ? 'दैनिक चौघड़िया समय' : 'लाइव होरा चक्र (Vedic Horas)'}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {mainViewMode === 'choghadiya' 
                ? 'आपके स्थान समय के आधार पर दिन और रात के अति उत्तम चौघड़िया अंतराल।' 
                : 'ग्रहों की गति और समय चक्र पर आधारित अत्यंत सटीक २४ घंटे की लाइव होरा।'}
            </p>
          </div>

          {/* Toggle Button Switcher */}
          <div className="flex bg-slate-100 dark:bg-zinc-950/50 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800/80 gap-1 self-stretch sm:self-auto shrink-0 mt-1 sm:mt-0 shadow-3xs">
            <button
              onClick={() => setMainViewMode('choghadiya')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-3xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1 ${
                mainViewMode === 'choghadiya'
                  ? 'bg-orange-500 text-white shadow-3xs border-orange-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              चौघड़िया
            </button>
            <button
              onClick={() => setMainViewMode('hora')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-3xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1 ${
                mainViewMode === 'hora'
                  ? 'bg-orange-500 text-white shadow-3xs border-orange-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              लाइव होरा प्रणाली
            </button>
          </div>
        </div>

        {mainViewMode === 'choghadiya' ? (
          /* Grid separating Day and Night Choghadiya for pristine ease of reading */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Day Choghadiya */}
            <div className="space-y-3">
              <h4 className="text-[10px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wider font-serif">
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                दिन का चौघड़िया (Daytime)
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
                        {ch.quality === 'Excellent' ? 'उत्तम' : ch.quality === 'Good' ? 'शुभ' : ch.quality === 'Neutral' ? 'मध्यम' : ch.quality === 'Inauspicious' ? 'अशुभ' : 'वर्जित'}
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
                रात का चौघड़िया (Nighttime)
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
                        {ch.quality === 'Excellent' ? 'उत्तम' : ch.quality === 'Good' ? 'शुभ' : ch.quality === 'Neutral' ? 'मध्यम' : ch.quality === 'Inauspicious' ? 'अशुभ' : 'वर्जित'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="pt-2">
            <HoraSystem panchang={panchang} currentTime={currentTime || new Date()} />
          </div>
        )}
      </div>

      {/* Interactive D3.js Moon Phase & Paksha Orbit representation */}
      <MoonPhaseVisualizer panchang={panchang} />

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
                लाइव वैदिक होरा संसूचक (Live Vedic Hora)
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                अभी सक्रिय होरा (Current Active Hora)
              </h3>
            </div>
            
            {/* Action to view full 24-hour cycle */}
            <button 
              onClick={() => setMainViewMode('hora')}
              className="text-[10px] sm:text-2xs font-extrabold text-orange-655 hover:text-orange-700 transition-colors flex items-center gap-0.5 cursor-pointer whitespace-nowrap bg-orange-50 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-orange-100/50 dark:border-zinc-800/40 shadow-3xs"
            >
              संपूर्ण २४ घंटे की सारिणी <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Active Hora Info Details */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
            <div className="flex-grow space-y-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl sm:text-2xl font-serif font-black text-slate-850 dark:text-orange-50 leading-tight">
                  {activeHora.lordHindi} की होरा
                </span>
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black border ${activeHora.colorClass.split(' ').slice(2).join(' ')} shadow-3xs`}>
                  {activeHora.qualityHindi}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-3xs sm:text-2xs font-bold text-slate-500 dark:text-zinc-450 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>समय: {activeHora.startTime} से {activeHora.endTime} तक (वैदिक घंटा संख्या: {activeHora.number})</span>
              </div>

              {/* Suitable Tasks Box */}
              <div className="bg-orange-50/20 dark:bg-zinc-950/25 p-3 rounded-xl border border-orange-100/30 dark:border-zinc-900/40 mt-1">
                <span className="text-[10px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">
                  अति उपयुक्त कार्य व फल (Recommended Actions):
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
                  वैदिक सुझाव व प्रभाव (Vedic Advice)
                </span>
                <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-zinc-400 font-serif leading-relaxed italic">
                  {activeHora.quality === 'Inauspicious' 
                    ? '“यह होरा क्रूर स्वभाव की मानी जाती है। नए कार्य, बड़े निवेश या मांगलिक कर्म इस अवधि में वर्जित रखना हितकारी होगा।”'
                    : activeHora.quality === 'Auspicious'
                    ? '“यह अत्यंत शुभ और अमृतमय होरा है। इस काल में किए गए प्रयास प्रायः परम फलदायी और सफल सिद्ध होते हैं।”'
                    : '“यह एक संतुलित और मध्यम प्रभाव की होरा है। इसमें सामान्य दैनिक, व्यापारिक व नियमित कार्य आसानी से पूरे किए जा सकते हैं।”'}
                </p>
              </div>
              
              <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-zinc-800/45 flex items-center justify-between">
                <span className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  प्रकार: {activeHora.isDay ? '🌞 दिवा होरा' : '🌙 रात्रि होरा'}
                </span>
                <span className="text-[9.5px] font-extrabold text-orange-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => setMainViewMode('hora')}>
                  पूर्ण सारिणी <ChevronRight className="w-2.5 h-2.5" />
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
                लाइव वैदिक चौघड़िया संसूचक (Live Vedic Choghadiya)
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                अभी सक्रिय चौघड़िया (Current Active Choghadiya)
              </h3>
            </div>
            
            {/* Action to view full Choghadiya grid */}
            <button 
              onClick={() => setMainViewMode('choghadiya')}
              className="text-[10px] sm:text-2xs font-extrabold text-orange-655 hover:text-orange-700 transition-colors flex items-center gap-0.5 cursor-pointer whitespace-nowrap bg-orange-50 dark:bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-orange-100/50 dark:border-zinc-800/40 shadow-3xs"
            >
              संपूर्ण दिन-रात्रि चौघड़िया सारिणी <ChevronRight className="w-3 h-3" />
            </button>
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
                      {activeChoghadiya.hindiName || activeChoghadiya.name} चौघड़िया
                    </span>
                    <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-black border ${styles.badge} shadow-3xs`}>
                      {styles.qualityText}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-3xs sm:text-2xs font-bold text-slate-500 dark:text-zinc-450 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>समय: {activeChoghadiya.startTime} से {activeChoghadiya.endTime} तक</span>
                  </div>

                  {/* Suitable Tasks Box */}
                  <div className="bg-orange-50/20 dark:bg-zinc-950/25 p-3 rounded-xl border border-orange-100/30 dark:border-zinc-900/40 mt-1">
                    <span className="text-[10px] font-black text-orange-850 dark:text-amber-300 uppercase tracking-widest block mb-0.5 font-mono">
                      प्रभाव और महत्व (Influence & Advice):
                    </span>
                    <p className="text-[11px] sm:text-xs text-slate-650 dark:text-zinc-400 font-medium leading-relaxed">
                      {styles.advice}
                    </p>
                  </div>
                </div>
                
                <div className={`md:w-72 bg-gradient-to-br ${styles.bg} p-3.5 rounded-xl border border-slate-100 dark:border-zinc-900/40 flex flex-col justify-between text-left`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block font-mono">
                      वैदिक परामर्श (Vedic Advice)
                    </span>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-zinc-400 font-serif leading-relaxed italic">
                      {activeChoghadiya.type === 'Amrit' || activeChoghadiya.type === 'Labh' || activeChoghadiya.type === 'Shubh'
                        ? '“यह काल किसी भी नवीन उपक्रम, यात्रा, खरीद-फरोख्त और शुभ संस्कारों की शुरुआत के लिए उत्तम और सुरक्षित है।”'
                        : activeChoghadiya.type === 'Chal'
                        ? '“इस सामान्य अवधि में नियमित व्यावसायिक यात्राएं, लेनदेन व सामान्य कार्य बिना किसी बाधा के सम्पन्न किए जा सकते हैं।”'
                        : '“इस अवधि में किसी भी नए प्रोजेक्ट या बड़े निवेश की शुरुआत को स्थगित रखना ही ज्योतिषीय दृष्टि से श्रेयस्कर होगा।”'}
                    </p>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-zinc-800/45 flex items-center justify-between">
                    <span className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      प्रकार: {activeChoghadiya.isDay ? '🌞 दिन का चौघड़िया' : '🌙 रात्रि का चौघड़िया'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
