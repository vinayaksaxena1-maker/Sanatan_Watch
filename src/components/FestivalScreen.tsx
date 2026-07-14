/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Smile, Sparkles } from 'lucide-react';
import { Festival } from '../types';
import { getFestivalsForYear } from '../utils/festivalEngine';

interface FestivalScreenProps {
  lat: number;
  lon: number;
  year: number;
  language?: 'English' | 'Hindi';
}

const MONTH_NAMES = {
  English: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  Hindi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
};

const WEEKDAYS = {
  English: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  Hindi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
};

export function FestivalScreen({ lat, lon, year, language = 'English' }: FestivalScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => year);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Calculate festivals dynamically based on local rules
  const festivals = useMemo(() => {
    return getFestivalsForYear(currentYear, lat, lon);
  }, [currentYear, lat, lon]);

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Calendar parameters
  const startDayOffset = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  const totalDays = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const gridCells = useMemo(() => {
    const cells: (number | number[])[] = Array(35).fill(null);
    for (let d = 1; d <= totalDays; d++) {
      const idx = startDayOffset + d - 1;
      if (idx < 35) {
        cells[idx] = d;
      } else {
        const col = idx % 7;
        const existing = cells[col];
        if (existing === null) {
          cells[col] = d;
        } else if (Array.isArray(existing)) {
          cells[col] = [...existing, d];
        } else {
          cells[col] = [existing, d];
        }
      }
    }
    return cells;
  }, [startDayOffset, totalDays]);

  const getFestivalsForDay = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const targetDateStr = currentYear + '-' + monthStr + '-' + dayStr;
    return festivals.filter(f => f.date === targetDateStr);
  };

  const monthlyFestivals = useMemo(() => {
    return festivals.filter(fest => {
      const date = parseLocalDate(fest.date);
      return date.getMonth() === currentMonth;
    });
  }, [festivals, currentMonth]);

  const selectedDayFestivals = useMemo(() => {
    if (selectedDay === null) return [];
    return getFestivalsForDay(selectedDay);
  }, [selectedDay, currentMonth, festivals]);

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'Ekadashi':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300';
      case 'Purnima':
        return 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300';
      case 'Amavasya':
        return 'bg-stone-50 border-stone-255 text-stone-850 dark:bg-stone-900/20 dark:border-stone-800 dark:text-stone-300';
      case 'Sankashti':
        return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300';
      case 'Jayanti':
        return 'bg-teal-550/10 border-teal-200/50 text-teal-800 dark:bg-teal-950/20 dark:border-teal-900 dark:text-teal-300';
      default:
        return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-900 dark:text-orange-300';
    }
  };

  const getTypeName = (type: string) => {
    if (language === 'Hindi') {
      switch (type) {
        case 'all': return 'सभी त्यौहार';
        case 'Major': return 'मुख्य';
        case 'Ekadashi': return 'एकादशी';
        case 'Purnima': return 'पूर्णिमा';
        case 'Amavasya': return 'अमावस्या';
        case 'Sankashti': return 'संकष्टी';
        case 'Jayanti': return 'जयंती';
        default: return type;
      }
    } else {
      switch (type) {
        case 'all': return 'All';
        case 'Major': return 'Major';
        case 'Ekadashi': return 'Ekadashi';
        case 'Purnima': return 'Purnima';
        case 'Amavasya': return 'Amavasya';
        case 'Sankashti': return 'Sankashti';
        case 'Jayanti': return 'Jayanti';
        default: return type;
      }
    }
  };

  return (
    <div id="festival_screen_root" className="space-y-4 sm:space-y-6 font-sans">
      
      {/* 1. Month & Year Select Dropdowns Header Card */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block mb-0.5">
            {language === 'Hindi' ? "॥ मासिक व्रत-त्यौहार कैलेंडर ॥" : "|| Monthly Vedic Calendar ||"}
          </span>
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-800 dark:text-amber-100 leading-tight">
            {language === 'Hindi' ? "कैलेंडर तिथि चुनें" : "Select Calendar Date"}
          </h2>
        </div>

        <div className="flex gap-2">
          {/* Month Selector Dropdown */}
          <select
            value={currentMonth}
            onChange={(e) => {
              setCurrentMonth(Number(e.target.value));
              setSelectedDay(null);
            }}
            className="text-xs p-2 rounded-xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/55 dark:border-zinc-850 text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-serif font-extrabold cursor-pointer"
          >
            {MONTH_NAMES[language === 'Hindi' ? 'Hindi' : 'English'].map((mName, idx) => (
              <option key={idx} value={idx} className="bg-[#120B08] text-slate-100">{mName}</option>
            ))}
          </select>

          {/* Year Selector Dropdown */}
          <select
            value={currentYear}
            onChange={(e) => {
              setCurrentYear(Number(e.target.value));
              setSelectedDay(null);
            }}
            className="text-xs p-2 rounded-xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/55 dark:border-zinc-850 text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-mono font-extrabold cursor-pointer"
          >
            {Array.from({ length: 11 }, (_, i) => year - 5 + i).map((y) => (
              <option key={y} value={y} className="bg-[#120B08] text-slate-100">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. 7x5 Calendar Grid */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left space-y-4">
        {/* Weekday Labels (7 Horizontal boxes) */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
          {WEEKDAYS[language === 'Hindi' ? 'Hindi' : 'English'].map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* 35 Grid Cells (7 columns x 5 rows) */}
        <div className="grid grid-cols-7 gap-1.5">
          {gridCells.map((cell, idx) => {
            if (cell === null) {
              return (
                <div 
                  key={idx} 
                  className="rounded-xl border border-dashed border-orange-100/5 dark:border-zinc-850/20 bg-slate-500/2 dark:bg-zinc-950/5 min-h-[48px] sm:min-h-[56px]"
                ></div>
              );
            }

            if (Array.isArray(cell)) {
              // Spillover Combined cell (e.g. 23/30 or 24/31)
              return (
                <div 
                  key={idx} 
                  className="p-1 rounded-xl bg-white/30 dark:bg-zinc-950/15 border border-orange-100/20 dark:border-zinc-850/60 min-h-[48px] sm:min-h-[56px] flex flex-col justify-between"
                >
                  {cell.map(d => {
                    const dayFests = getFestivalsForDay(d);
                    const isSelected = selectedDay === d;
                    return (
                      <div 
                        key={d} 
                        onClick={() => setSelectedDay(isSelected ? null : d)}
                        className={"flex justify-between items-center px-1.5 py-0.5 rounded-md cursor-pointer text-[9px] font-mono font-bold leading-none transition-all " + (
                          isSelected 
                            ? 'bg-orange-500 text-white font-extrabold shadow-sm' 
                            : 'hover:bg-orange-500/10 text-slate-700 dark:text-slate-350'
                        )}
                      >
                        <span>{d}</span>
                        {dayFests.length > 0 && (
                          <span className={"h-1.5 w-1.5 rounded-full " + (isSelected ? 'bg-white' : 'bg-orange-500') + " animate-pulse"}></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Standard cell
            const dayFests = getFestivalsForDay(cell);
            const isSelected = selectedDay === cell;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : cell)}
                className={"p-1.5 rounded-xl border transition-all cursor-pointer min-h-[48px] sm:min-h-[56px] flex flex-col justify-between text-left " + (
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm scale-102 font-bold'
                    : 'bg-white/40 dark:bg-zinc-950/20 border-orange-100/20 dark:border-zinc-850 hover:bg-orange-50/50 dark:hover:bg-zinc-900/40 text-slate-750 dark:text-slate-300'
                )}
              >
                <span className="text-[10px] sm:text-xs font-mono font-bold leading-none">{cell}</span>
                {dayFests.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-end mt-1">
                    {dayFests.map((f, fIdx) => (
                      <span 
                        key={fIdx} 
                        className={"h-1.5 w-1.5 rounded-full " + (isSelected ? 'bg-white' : 'bg-orange-550 dark:bg-amber-400') + " animate-pulse"}
                        title={language === 'Hindi' ? f.hindiName : f.name}
                      ></span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Day Festivals (Visible when cell is clicked) */}
      {selectedDay !== null && (
        <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-500/20 dark:border-orange-500/10 rounded-3xl bg-orange-500/3 dark:bg-orange-950/5 animate-fade-in space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-orange-500/10">
            <h3 className="text-xs font-black text-orange-655 dark:text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'Hindi' ? selectedDay + ' ' + MONTH_NAMES.Hindi[currentMonth] + ' के त्यौहार' : 'Festivals on ' + selectedDay + ' ' + MONTH_NAMES.English[currentMonth]}
            </h3>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-400 hover:text-slate-655 font-mono cursor-pointer"
            >
              ✕ {language === 'Hindi' ? "बंद करें" : "Close"}
            </button>
          </div>

          <div className="space-y-3">
            {selectedDayFestivals.length === 0 ? (
              <p className="text-2xs text-slate-500 dark:text-slate-400 italic">
                {language === 'Hindi' ? "इस दिन कोई विशेष व्रत या त्यौहार नहीं है।" : "No special fasts or festivals scheduled on this date."}
              </p>
            ) : (
              selectedDayFestivals.map((fest) => {
                return (
                  <div key={fest.id} className="p-3.5 rounded-2xl bg-white/10 dark:bg-[#120B08]/40 border border-orange-100/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={"text-[8px] font-extrabold px-2 py-0.5 rounded-full border " + getBadgeStyles(fest.type) + " font-mono uppercase tracking-wide"}>
                          {getTypeName(fest.type)}
                        </span>
                        <span className="text-[9px] text-[#A64B00] dark:text-[#FFB366] font-mono font-bold">
                          🌙 {fest.month} • {fest.tithi}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-850 dark:text-amber-100 font-serif leading-snug">
                        {language === 'Hindi' ? fest.hindiName : fest.name}
                      </h4>
                      <p className="text-[10px] text-slate-600 dark:text-slate-455 leading-relaxed">
                        {fest.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. Festivals List (Current Month's Festivals) */}
      <div className="space-y-3.5 sm:space-y-4">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono text-left pl-1">
          {language === 'Hindi' 
            ? MONTH_NAMES.Hindi[currentMonth] + ' माह के मुख्य व्रत एवं त्यौहार' 
            : 'Major Festivals in ' + MONTH_NAMES.English[currentMonth]}
        </h3>

        {monthlyFestivals.length === 0 ? (
          <div className="glass-card-light dark:glass-card-dark p-10 sm:p-12 text-center h-48 flex flex-col justify-center items-center">
            <Smile className="w-8 h-8 text-orange-400 mb-2 animate-bounce" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">
              {language === 'Hindi' ? "इस महीने कोई त्यौहार नहीं मिला।" : "No festivals found in this month."}
            </span>
          </div>
        ) : (
          monthlyFestivals.map((fest) => {
            const formattedDateStr = new Date(fest.date).toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={fest.id}
                className="glass-card-light dark:glass-card-dark p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-left"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={"text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border " + getBadgeStyles(fest.type) + " font-mono uppercase tracking-wide"}>
                      {getTypeName(fest.type)}
                    </span>
                    <span className="text-[10px] text-[#A64B00] dark:text-[#FFB366] font-mono font-bold">
                      🌙 {fest.month} • {fest.tithi}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-850 dark:text-amber-100 font-serif leading-snug">
                    {language === 'Hindi' ? fest.hindiName : fest.name}
                  </h3>

                  <p className="text-[11px] sm:text-2xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">
                    {fest.description}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-2.5 md:pt-0 w-full md:w-auto mt-1 md:mt-0 flex-shrink-0">
                  <div className="bg-orange-50/50 dark:bg-orange-950/15 p-2 sm:p-2.5 rounded-2xl border border-orange-100/30 flex items-center gap-2 text-left md:text-right">
                    <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono tracking-widest leading-3">
                        {language === 'Hindi' ? "त्यौहार की तिथि" : "Festival Date"}
                      </span>
                      <span className="text-2xs font-extrabold text-orange-950 dark:text-orange-200 font-sans mt-0.5 block whitespace-nowrap">
                        {formattedDateStr}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
