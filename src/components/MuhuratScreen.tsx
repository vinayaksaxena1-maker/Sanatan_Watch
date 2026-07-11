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

interface MuhuratScreenProps {
  panchang: PanchangInfo;
  onViewAstrologyChart?: () => void;
  currentTime?: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function MuhuratScreen({ 
  panchang, 
  onViewAstrologyChart, 
  currentTime,
  selectedDate,
  onDateChange
}: MuhuratScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const allMuhurats = getMuhuratsForPanchang(panchang);
  
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

  const getDynamicLagna = (baseIdx: number) => {
    const idx = (baseIdx + dayOfYear) % 12;
    return `${rashis[idx]} लग्न`;
  };

  // Render lists of Muhurats with dynamic computations
  const muhuratCategories = [
    {
      id: 'marriage',
      name: 'Vivah (Marriage)',
      hindiName: 'विवाह मुहूर्त',
      desc: 'गुरु और शुक्र के आशीर्वाद से विवाह के पवित्र बंधन के लिए।',
      icon: <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />,
      rating: isKrishnaAshtamiOrChauth ? 3 : 5,
      slots: [
        { 
          time: `${formatMinStr(sMin + 75)} - ${formatMinStr(sMin + 270)}`, 
          lagna: getDynamicLagna(2), // Mithuna base
          suitability: 'अत्यंत शुभ (उत्तम)', 
          advice: 'विवाह के लिए सर्वोत्तम स्थिति।' 
        },
        { 
          time: `${formatMinStr(eMin - 165)} - ${formatMinStr(eMin + 60)}`, 
          lagna: getDynamicLagna(6), // Tula base
          suitability: 'अच्छा (लाभ)', 
          advice: 'सामाजिक आयोजनों के लिए उपयुक्त।' 
        },
      ]
    },
    {
      id: 'house',
      name: 'Griha Pravesh',
      hindiName: 'गृह प्रवेश मुहूर्त',
      desc: 'नए घर या संपत्ति में प्रवेश और निर्माण के लिए।',
      icon: <Key className="w-5 h-5 text-amber-500 animate-pulse" />,
      rating: tithiValue % 2 === 0 ? 4 : 5,
      slots: [
        { 
          time: `${formatMinStr(sMin + 165)} - ${formatMinStr(sMin + 330)}`, 
          lagna: getDynamicLagna(1), // Vrishabha base
          suitability: 'शुभ (उत्तम)', 
          advice: 'स्थिर लग्न, गृह प्रवेश के लिए शुभ।' 
        },
        { 
          time: `${formatMinStr(sMin + 345)} - ${formatMinStr(sMin + 395)}`, 
          lagna: getDynamicLagna(3), // Karka base
          suitability: 'सर्वोत्तम (अमृत)', 
          advice: 'अभिजीत मुहूर्त के साथ अत्यधिक शुभ।' 
        }
      ]
    },
    {
      id: 'naming',
      name: 'Naamkaran',
      hindiName: 'नामकरण मुहूर्त',
      desc: 'नामकरण संस्कार के लिए मुहूर्त।',
      icon: <Feather className="w-5 h-5 text-orange-500" />,
      rating: 5,
      slots: [
        { 
          time: `${formatMinStr(sMin + 180)} - ${formatMinStr(sMin + 360)}`, 
          lagna: getDynamicLagna(4), // Simha base
          suitability: 'शुभ (उत्तम)', 
          advice: 'बुद्धिमत्ता के लिए अत्यंत शुभ।' 
        },
        { 
          time: `${formatMinStr(sMin + 480)} - ${formatMinStr(sMin + 570)}`, 
          lagna: getDynamicLagna(5), // Kanya base
          suitability: 'शुभ (लाभ)', 
          advice: 'स्वर्ण आभूषण आदि पहनाने के लिए।' 
        }
      ]
    },
    {
      id: 'vehicle',
      name: 'Vehicle Purchase',
      hindiName: 'वाहन क्रय मुहूर्त',
      desc: 'वाहन, मोटर या व्यावसायिक वाहन की खरीद के लिए मुहूर्त।',
      icon: <Truck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      rating: tithiValue === 14 || tithiValue === 30 ? 2 : 4,
      slots: [
        { 
          time: `${formatMinStr(sMin + 270)} - ${formatMinStr(sMin + 450)}`, 
          lagna: getDynamicLagna(10), // Kumbha base
          suitability: isKrishnaAshtamiOrChauth ? 'मध्यम (सामान्य)' : 'अत्यंत शुभ (शुभ)', 
          advice: 'धातु से जुड़ी वस्तुओं के लिए सर्वोत्तम।' 
        },
        { 
          time: `${formatMinStr(eMin - 210)} - ${formatMinStr(eMin - 120)}`, 
          lagna: getDynamicLagna(0), // Mesha base
          suitability: 'शुभ (चल)', 
          advice: 'वाहन आदि के लिए बढ़िया मुहूर्त।' 
        }
      ]
    },
    {
      id: 'business',
      name: 'Business Opening',
      hindiName: 'व्यापार आरंभ',
      desc: 'नया व्यवसाय, दुकान या कार्यालय शुरू करने का मुहूर्त।',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      rating: tithiValue % 5 === 0 ? 3 : 5,
      slots: [
        { 
          time: `${formatMinStr(sMin + 345)} - ${formatMinStr(sMin + 435)}`, 
          lagna: 'अभिजीत मुहूर्त', 
          suitability: 'अत्यंत शुभ (अमृत)', 
          advice: 'व्यवसाय में वृद्धि और लाभ के लिए सर्वोत्तम मुहूर्त।' 
        },
        { 
          time: `${formatMinStr(eMin - 120)} - ${formatMinStr(eMin - 30)}`, 
          lagna: getDynamicLagna(8), // Dhanu base
          suitability: 'अच्छा (लाभ)', 
          advice: 'डिजाइन, तकनीक और संचार कार्यों के लिए।' 
        }
      ]
    },
    {
      id: 'land',
      name: 'Bhoomi Pujan',
      hindiName: 'भूमि पूजन मुहूर्त',
      desc: 'संपत्ति, भूमि पूजन और निर्माण कार्य के लिए शुभ शुरुआत।',
      icon: <Building className="w-5 h-5 text-teal-600 dark:text-teal-450" />,
      rating: 4,
      slots: [
        { 
          time: `${formatMinStr(sMin + 30)} - ${formatMinStr(sMin + 150)}`, 
          lagna: getDynamicLagna(7), // Vrischika base
          suitability: 'शुभ (शुभ)', 
          advice: 'प्रातःकाल भूमि पूजन के लिए उपयुक्त।' 
        },
        { 
          time: `${formatMinStr(sMin + 225)} - ${formatMinStr(sMin + 330)}`, 
          lagna: getDynamicLagna(9), // Makara base
          suitability: 'उत्तम (अतिशुभ)', 
          advice: 'नींव रखने के लिए सबसे उत्तम समय।' 
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
        className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white/5 dark:bg-[#120B08]/30 p-4 rounded-2xl border border-white/10 dark:border-white/5 text-left cursor-pointer"
      >
        <div>
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-amber-100 font-serif">शुभ मुहूर्त तिथि चयनकर्ता</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">आगे आने वाले या पिछले दिनों के मुहूर्त जानने के लिए तिथि चुनें।</p>
        </div>
        <div className="relative min-w-[220px] flex items-center gap-2 bg-white/75 dark:bg-zinc-900/60 p-2 px-3 rounded-xl border border-orange-100 dark:border-orange-950/40 shadow-xs">
          <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
          <div className="min-w-0 pr-1 text-left flex-grow">
            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wider block">मुहूर्त तिथि</span>
            <span className="text-2xs font-extrabold text-[#9A3412] dark:text-orange-200 font-sans block truncate leading-none mt-0.5">
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
        <div className="glass-card-light dark:glass-card-dark p-5 text-left rounded-3xl border border-emerald-100/50 dark:border-emerald-950/20 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-100/60 dark:border-zinc-800/40">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">✨</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">शुभ मुहूर्त व योग (Siddhi Yogas)</h3>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1 uppercase tracking-widest font-mono">Auspicious Timings</span>
              </div>
            </div>

            {/* Timings */}
            <div className="space-y-2 text-xs">
              {allMuhurats.filter(m => m.type !== 'Ashubh').map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-slate-800/10">
                  <span className="text-slate-400 font-medium">{m.hindiName || m.name}:</span>
                  <span className="font-bold text-slate-855 dark:text-emerald-350 font-mono">{m.startTime} - {m.endTime}</span>
                </div>
              ))}
            </div>
            {/* Shubh Yogas List */}
            {((panchang.shubhYogas && panchang.shubhYogas.length > 0) || (panchang.pushkarYog && panchang.pushkarYog.active)) && (
              <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/30 space-y-2">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block font-mono">आज के विशेष योग (Auspicious Yogas):</span>
                <div className="flex flex-wrap gap-1.5">
                  {panchang.pushkarYog && panchang.pushkarYog.active && (
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-350 border border-amber-300/40 animate-pulse font-serif">
                      🌟 {panchang.pushkarYog.hindiName} ({panchang.pushkarYog.type})
                    </span>
                  )}
                  {panchang.shubhYogas && panchang.shubhYogas.map((y, idx) => (
                    <span key={idx} className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-350 border border-emerald-250/30 font-serif">
                      ✨ {y.hindiName} ({y.start} - {y.end})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: वर्जित समय चक्र */}
        <div className="glass-card-light dark:glass-card-dark p-5 text-left rounded-3xl border border-red-150 dark:border-red-950/20 hover:border-red-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-red-100/60 dark:border-zinc-800/40">
              <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">⚠️</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">वर्जित समय चक्र (Adverse Periods)</h3>
                <span className="text-[9px] text-red-600 dark:text-red-405 block mt-1 uppercase tracking-widest font-mono">Inauspicious Timings</span>
              </div>
            </div>

            {/* Inauspicious Timings */}
            <div className="space-y-2 text-xs">
              {allMuhurats.filter(m => m.type === 'Ashubh').map((m, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-slate-800/10">
                  <span className="text-slate-400 font-medium">{m.hindiName || m.name}:</span>
                  <span className="font-bold text-red-655 dark:text-rose-400 font-mono">{m.startTime} - {m.endTime}</span>
                </div>
              ))}

              {/* Durmuhurat & Varjyam */}
              {panchang.durmuhurat && panchang.durmuhurat.length > 0 && panchang.durmuhurat.map((d, idx) => (
                <div key={`dur-${idx}`} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-slate-800/10">
                  <span className="text-slate-400 font-medium">दुर्मुहूर्त (Durmuhurat):</span>
                  <span className="font-bold text-red-655 dark:text-rose-400 font-mono">{d.start} - {d.end}</span>
                </div>
              ))}
              {panchang.varjyam && panchang.varjyam.length > 0 && panchang.varjyam.map((v, idx) => (
                <div key={`var-${idx}`} className="flex justify-between items-center py-1.5 border-b border-slate-100/40 dark:border-slate-800/10">
                  <span className="text-slate-400 font-medium">वर्ज्यम (Varjyam):</span>
                  <span className="font-bold text-red-655 dark:text-rose-400 font-mono">{v.start} - {v.end}</span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {((panchang.dagdaTithi && panchang.dagdaTithi.isDagda) || (panchang.bhadra && panchang.bhadra.active)) && (
              <div className="mt-3 pt-2.5 border-t border-slate-100/50 dark:border-slate-800/30 space-y-1 text-[10px]">
                {panchang.dagdaTithi && panchang.dagdaTithi.isDagda && (
                  <div className="text-red-700 dark:text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/15 font-serif">
                    🚨 आज **दग्ध तिथि** है! महत्वपूर्ण कार्य टालें।
                  </div>
                )}
                {panchang.bhadra && panchang.bhadra.active && (
                  <div className="text-red-700 dark:text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/15 font-serif">
                    🚨 भद्रा काल सक्रिय है ({panchang.bhadra.startTime} से {panchang.bhadra.endTime} तक)।
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: शिववास व अग्निवास */}
        <div className="glass-card-light dark:glass-card-dark p-5 text-left rounded-3xl border border-orange-150 dark:border-orange-950/20 hover:border-orange-500/30 transition-all duration-300 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-orange-100/60 dark:border-zinc-800/40">
              <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">🔥</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">अग्निवास व शिववास (Ritual Muhurats)</h3>
                <span className="text-[9px] text-orange-600 dark:text-orange-400 block mt-1 uppercase tracking-widest font-mono">Ritual Auspiciousness</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Shiva Vaas */}
              {panchang.shivaVaas && (
                <div className="p-3 rounded-2xl bg-white/5 dark:bg-white/2 border border-white/10 dark:border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-serif">शिववास (रुद्राभिषेक):</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      panchang.shivaVaas.isAuspicious
                        ? 'bg-emerald-100 border-emerald-250 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-rose-100 border-rose-250 text-rose-800 dark:bg-rose-950/30 dark:text-rose-455'
                    }`}>
                      {panchang.shivaVaas.isAuspicious ? 'शुभ (Auspicious)' : 'अशुभ (Avoid)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">
                    <strong>वास स्थान:</strong> {panchang.shivaVaas.residenceHindi || panchang.shivaVaas.residence} - {panchang.shivaVaas.description}
                  </p>
                </div>
              )}

              {/* Agni Vaas */}
              {panchang.agniVaas && (
                <div className="p-3 rounded-2xl bg-white/5 dark:bg-white/2 border border-white/10 dark:border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-serif">अग्निवास (यज्ञ/हवन):</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                      panchang.agniVaas.isAuspicious
                        ? 'bg-emerald-100 border-emerald-250 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-rose-100 border-rose-250 text-rose-800 dark:bg-rose-950/30 dark:text-rose-455'
                    }`}>
                      {panchang.agniVaas.isAuspicious ? 'शुभ (Auspicious)' : 'अशुभ (Avoid)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">
                    <strong>वास स्थान:</strong> {panchang.agniVaas.residenceHindi || panchang.agniVaas.residence} - {panchang.agniVaas.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Active Muhurats Section */}
      {activeSlots.length > 0 && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-md text-left relative overflow-hidden border border-emerald-500/20">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-36 h-36 bg-emerald-500/8 dark:bg-emerald-600/8 blur-2xl rounded-full pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-2 border-b border-emerald-100/40 dark:border-zinc-800/60">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center gap-1.5 leading-none mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                लाइव सक्रिय मुहूर्त संसूचक
              </span>
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-800 dark:text-amber-100 font-serif leading-none">
                अभी सक्रिय शुभ मुहूर्त
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSlots.map((slot, idx) => (
              <div key={idx} className="bg-emerald-50/20 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-500/20 flex gap-3 items-start">
                <div className="p-2 rounded-xl bg-emerald-100/40 dark:bg-emerald-950/30 shrink-0">
                  {slot.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-serif font-black text-slate-850 dark:text-orange-50">
                      {slot.categoryHindiName}
                    </span>
                    <span className="text-[8.5px] font-black tracking-widest bg-emerald-500 text-white dark:bg-emerald-600 uppercase px-1.5 py-0.5 rounded shadow-3xs">
                      {slot.suitability}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-450 mt-1 font-mono">
                    समय: {slot.time}
                  </div>
                  <div className="text-[10px] text-slate-655 dark:text-zinc-400 mt-1">
                    <span className="font-bold text-orange-950 dark:text-orange-200">लग्न: {slot.lagna}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 italic mt-1 leading-normal font-sans">
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
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-850 border-orange-100 dark:border-orange-950/45 text-slate-700 dark:text-slate-300'
          }`}
        >
          सभी मुहूर्त
        </button>
        {muhuratCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-850 border-orange-100/50 dark:border-orange-950/30 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat.icon}
            {cat.hindiName}
          </button>
        ))}
      </div>

      {/* Warning regarding Rahu Kaal or special adverse timing if any */}
      <div className="bg-amber-500/5 dark:bg-amber-500/2 rounded-2xl border border-amber-500/20 [box-shadow:0_0_15px_rgba(245,158,11,0.1)] p-3.5 sm:p-4 text-left flex gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 font-serif">ज्योतिषीय दिशानिर्देश (राहुकाल)</h4>
          <p className="text-[10px] sm:text-2xs text-amber-900/90 dark:text-amber-300/80 leading-normal mt-0.5 font-sans">
            कृपया सुनिश्चित करें कि चुना गया समय सक्रिय <strong>राहुकाल ({panchang.rahuKaal.start} - {panchang.rahuKaal.end})</strong> से मेल नहीं खाता है, क्योंकि राहुकाल के दौरान कोई नया काम शुरू करना शुभ नहीं माना जाता है।
          </p>
        </div>
      </div>

      {/* Render matching category grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {categoriesFiltered.map((cat) => (
          <div key={cat.id} className="bg-white/5 dark:bg-[#120B08]/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 dark:border-white/5 hover:border-orange-500/30 hover:scale-[1.01] hover:translate-y-[-2px] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col justify-between text-left">
            <div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-50/50 dark:bg-orange-950/20">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-orange-950 dark:text-amber-100 font-serif leading-none">{cat.hindiName}</h3>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-1">{cat.name}</span>
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

              <p className="text-[10px] sm:text-2xs text-slate-600 dark:text-slate-400 mt-3 border-b border-white/10 dark:border-white/5 pb-3 leading-relaxed">
                {cat.desc}
              </p>

              {/* Slots Timelines list */}
              <div className="space-y-2.5 mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">आज के शुभ मुहूर्त</span>
                {cat.slots.map((sl, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/5 dark:bg-white/2 border border-white/10 dark:border-white/5 hover:border-orange-500/20 transition-all duration-300 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="text-2xs sm:text-xs font-black text-slate-850 dark:text-slate-100 font-mono tracking-tight">{sl.time}</span>
                      <span className="text-[9px] font-extrabold bg-[#e8f5e9]/70 dark:bg-green-950/25 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-mono">
                        {sl.suitability}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-2xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="text-slate-400 dark:text-slate-500 text-3xs uppercase font-mono">लग्न:</span>
                      <span className="text-orange-950 dark:text-orange-200 font-bold bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.2 rounded font-sans">{sl.lagna}</span>
                    </div>

                    <div className="text-[9px] sm:text-3xs text-slate-500 italic mt-1 leading-normal font-sans">
                      🌿 नोट: {sl.advice}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom advice footer */}
            <div className="mt-4 pt-3 border-t border-white/10 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>संवत् {panchang.hinduDate.samvatVikram} स्थितियां</span>
              <span 
                onClick={onViewAstrologyChart}
                className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer font-sans"
              >
                ज्योतिष चार्ट देखें →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
