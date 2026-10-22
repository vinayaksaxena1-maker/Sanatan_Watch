/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Search, Sparkles, X, Flame, Moon, Clock, Utensils, ChevronRight } from 'lucide-react';
import { Festival } from '../types';
import { getFestivalsForYear } from '../utils/festivalEngine';
import { translateSanskritMonthName, translateTithiString, translateFestivalTiming } from '../utils/translations';

interface FestivalScreenProps {
  lat: number;
  lon: number;
  year: number;
  language?: 'English' | 'Hindi';
}

const GREGORIAN_MONTHS_HINDI = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const GREGORIAN_MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS_HINDI_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const WEEKDAYS_HINDI_FULL = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

const WEEKDAYS_EN_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_EN_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type CategoryFilter = 'all' | 'major' | 'ekadashi' | 'pradosh_shiv' | 'purnima_sankranti';

export function FestivalScreen({ lat, lon, year, language = 'Hindi' }: FestivalScreenProps) {
  const isHindi = language === 'Hindi';
  const [selectedYear, setSelectedYear] = useState<number>(() => year || 2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Compute all festivals for selected year (automatically deduplicated by engine)
  const allYearFestivals = useMemo(() => {
    return getFestivalsForYear(selectedYear, lat, lon);
  }, [selectedYear, lat, lon]);

  // Helper to categorize festivals
  const getFestivalCategory = (fest: Festival): 'major' | 'ekadashi' | 'pradosh_shiv' | 'purnima_sankranti' | 'general' => {
    const idLower = (fest.id || '').toLowerCase();
    const nameLower = (fest.name || '').toLowerCase();
    const hin = fest.hindiName || '';

    if (fest.type === 'Ekadashi' || idLower.includes('ekadashi') || hin.includes('एकादशी')) {
      return 'ekadashi';
    }
    if (
      idLower.includes('pradosh') ||
      idLower.includes('shivratri') ||
      idLower.includes('shivaratri') ||
      hin.includes('प्रदोष') ||
      hin.includes('शिवरात्रि')
    ) {
      return 'pradosh_shiv';
    }
    if (
      fest.type === 'Purnima' ||
      fest.type === 'Amavasya' ||
      idLower.includes('purnima') ||
      idLower.includes('amavasya') ||
      idLower.includes('sankranti') ||
      hin.includes('पूर्णिमा') ||
      hin.includes('अमावस्या') ||
      hin.includes('संक्रान्ति')
    ) {
      return 'purnima_sankranti';
    }
    if (
      idLower.includes('diwali') ||
      idLower.includes('holi') ||
      idLower.includes('karwa_chauth') ||
      idLower.includes('navratri') ||
      idLower.includes('dussehra') ||
      idLower.includes('janmashtami') ||
      idLower.includes('rama_navami') ||
      idLower.includes('ganesh_chaturthi') ||
      idLower.includes('gudi_padwa') ||
      idLower.includes('bhai_dooj') ||
      idLower.includes('govardhan') ||
      fest.type === 'Major'
    ) {
      return 'major';
    }
    return 'general';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'major':
        return { 
          label: isHindi ? '🌸 प्रमुख महापर्व' : '🌸 Major Festival', 
          bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' 
        };
      case 'ekadashi':
        return { 
          label: isHindi ? '📿 एकादशी व्रत' : '📿 Ekadashi Vrat', 
          bg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' 
        };
      case 'pradosh_shiv':
        return { 
          label: isHindi ? '🔱 शिव आराधना / प्रदोष' : '🔱 Shiva / Pradosh', 
          bg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' 
        };
      case 'purnima_sankranti':
        return { 
          label: isHindi ? '🌕 पूर्णिमा / संक्रान्ति' : '🌕 Purnima / Sankranti', 
          bg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' 
        };
      default:
        return { 
          label: isHindi ? '✨ पावन व्रत व पर्व' : '✨ Sacred Vrat / Parva', 
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
        };
    }
  };

  // Find next upcoming major / ekadashi festival for Hero Banner
  const upcomingHeroFestival = useMemo(() => {
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Look for upcoming festivals from today onwards
    const upcoming = allYearFestivals
      .filter(f => f.date >= todayDateStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Prioritize Major or Ekadashi
    const majorOrEkadashi = upcoming.find(f => {
      const cat = getFestivalCategory(f);
      return cat === 'major' || cat === 'ekadashi';
    });

    return majorOrEkadashi || upcoming[0] || null;
  }, [allYearFestivals]);

  // Days in selected month & starting weekday
  const { daysInMonth, firstDayWeekday } = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday
    return { daysInMonth: totalDays, firstDayWeekday: firstDay };
  }, [selectedYear, selectedMonth]);

  // Map of festivals by day of month (YYYY-MM-DD to Festival[])
  const festivalsByDay = useMemo(() => {
    const map = new Map<number, Festival[]>();
    allYearFestivals.forEach(f => {
      const [y, m, d] = f.date.split('-').map(Number);
      if (y === selectedYear && m - 1 === selectedMonth) {
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(f);
      }
      if (f.secondaryDate) {
        const secDay = parseInt(f.secondaryDate, 10);
        if (!isNaN(secDay) && secDay >= 1 && secDay <= 31) {
          if (!map.has(secDay)) map.set(secDay, []);
          if (!map.get(secDay)!.includes(f)) map.get(secDay)!.push(f);
        }
      }
    });
    return map;
  }, [allYearFestivals, selectedYear, selectedMonth]);

  // Filter festivals based on search, category, and selectedDay
  const displayedFestivals = useMemo(() => {
    let list = [...allYearFestivals];

    // If searching, search across the entire year (or month)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(f =>
        (f.hindiName && f.hindiName.toLowerCase().includes(query)) ||
        (f.name && f.name.toLowerCase().includes(query)) ||
        (f.tithi && f.tithi.toLowerCase().includes(query)) ||
        (f.description && f.description.toLowerCase().includes(query))
      );
    } else {
      // If not searching, filter by selected month
      list = list.filter(f => {
        const [y, m] = f.date.split('-').map(Number);
        return y === selectedYear && m - 1 === selectedMonth;
      });
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      list = list.filter(f => getFestivalCategory(f) === categoryFilter);
    }

    // Filter by clicked calendar day
    if (selectedDay !== null && !query) {
      list = list.filter(f => {
        const [, , d] = f.date.split('-').map(Number);
        if (d === selectedDay) return true;
        if (f.secondaryDate) {
          const secDay = parseInt(f.secondaryDate, 10);
          if (secDay === selectedDay) return true;
        }
        return false;
      });
    }

    // Sort chronologically
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [allYearFestivals, selectedYear, selectedMonth, selectedDay, searchQuery, categoryFilter]);

  const formatFestivalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isHindi) {
      const weekday = WEEKDAYS_HINDI_FULL[dateObj.getDay()];
      const month = GREGORIAN_MONTHS_HINDI[m - 1];
      return `${d} ${month} ${y}, ${weekday}`;
    } else {
      const weekday = WEEKDAYS_EN_FULL[dateObj.getDay()];
      const month = GREGORIAN_MONTHS_EN[m - 1];
      return `${weekday}, ${month} ${d}, ${y}`;
    }
  };

  const calculateDaysRemaining = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return isHindi ? '🟢 आज है!' : '🟢 Today!';
    if (diffDays === 1) return isHindi ? '⏳ केवल 1 दिन शेष (कल)' : '⏳ 1 Day Left (Tomorrow)';
    if (diffDays > 1) return isHindi ? `⏳ केवल ${diffDays} दिन शेष` : `⏳ ${diffDays} Days Left`;
    return isHindi ? 'समाप्त' : 'Passed';
  };

  const isToday = (dayNum: number) => {
    const now = new Date();
    return (
      now.getDate() === dayNum &&
      now.getMonth() === selectedMonth &&
      now.getFullYear() === selectedYear
    );
  };

  return (
    <div id="festival_screen_root" className="space-y-4 sm:space-y-5 text-left font-sans max-w-4xl mx-auto pb-12 select-none">
      
      {/* 1. TOP HEADER & MONTH/YEAR PICKER */}
      <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 rounded-3xl border border-orange-200/60 dark:border-orange-950/40 shadow-xs flex flex-col gap-3">
        
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <div>
              <h2 className="text-[17px] sm:text-[19px] font-black font-serif text-[#9A3412] dark:text-amber-300 leading-tight">
                {isHindi ? "सनातन पर्व एवं व्रत पंचांग" : "Sanatan Festivals & Vrat Calendar"}
              </h2>
              <p className="text-[11.5px] text-slate-500 dark:text-stone-400 font-medium">
                {isHindi ? "समस्त 12 माह के व्रत, एकादशी, पूर्णिमा व प्रमुख हिंदू त्योहार" : "Complete 12-month Vrats, Ekadashi, Purnima & major Hindu festivals"}
              </p>
            </div>
          </div>

          {/* Month & Year Selectors */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSelectedDay(null);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 dark:bg-zinc-900 border border-orange-300/60 dark:border-amber-500/30 text-xs sm:text-[13px] font-bold text-slate-800 dark:text-amber-200 focus:outline-none cursor-pointer"
            >
              {(isHindi ? GREGORIAN_MONTHS_HINDI : GREGORIAN_MONTHS_EN).map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedDay(null);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 dark:bg-zinc-900 border border-orange-300/60 dark:border-amber-500/30 text-xs sm:text-[13px] font-bold text-slate-800 dark:text-amber-200 focus:outline-none cursor-pointer font-mono"
            >
              {[2025, 2026, 2027, 2028].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. INSTANT SEARCH BAR */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 dark:text-amber-400 pointer-events-none" />
          <input
            type="text"
            placeholder={isHindi ? "पर्व या व्रत खोजें (उदा. एकादशी, करवा चौथ, शिवरात्रि, होली)..." : "Search festivals or vrats (e.g. Ekadashi, Karwa Chauth, Shivratri)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-2xl bg-white dark:bg-zinc-900/80 border border-orange-200/80 dark:border-zinc-800 text-xs sm:text-[13px] text-slate-800 dark:text-amber-100 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-orange-500 font-sans shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 p-1 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. CATEGORY FILTER CHIPS (HORIZONTAL SCROLL) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {(isHindi ? [
            { id: 'all', label: '✨ सभी पर्व' },
            { id: 'major', label: '🌸 प्रमुख महापर्व' },
            { id: 'ekadashi', label: '📿 एकादशी व्रत' },
            { id: 'pradosh_shiv', label: '🔱 प्रदोष व शिवरात्रि' },
            { id: 'purnima_sankranti', label: '🌕 पूर्णिमा व संक्रान्ति' }
          ] : [
            { id: 'all', label: '✨ All Festivals' },
            { id: 'major', label: '🌸 Major Festivals' },
            { id: 'ekadashi', label: '📿 Ekadashi Vrats' },
            { id: 'pradosh_shiv', label: '🔱 Pradosh & Shivratri' },
            { id: 'purnima_sankranti', label: '🌕 Purnima & Sankranti' }
          ]).map(chip => {
            const isActive = categoryFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setCategoryFilter(chip.id as CategoryFilter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border leading-none ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-orange-500/10 text-slate-700 dark:text-stone-300 hover:bg-orange-500/15 border-orange-300/40 dark:border-white/10'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. UPCOMING FESTIVAL HERO BANNER (COUNTDOWN CARD) */}
      {upcomingHeroFestival && !searchQuery && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-[#2A180E] dark:via-[#1E110A] dark:to-[#2A180E] border border-orange-400/50 dark:border-amber-500/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-orange-700 dark:text-amber-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-300/40 dark:border-amber-500/30">
              {isHindi ? "🔔 अगला पावन महापर्व" : "🔔 Upcoming Sacred Festival"}
            </span>
            <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {calculateDaysRemaining(upcomingHeroFestival.date)}
            </span>
          </div>

          <div className="mt-2">
            <h3 className="text-lg sm:text-xl font-black font-serif text-[#9A3412] dark:text-amber-200 leading-tight">
              {isHindi ? (upcomingHeroFestival.hindiName || upcomingHeroFestival.name) : upcomingHeroFestival.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-stone-300 mt-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>{formatFestivalDate(upcomingHeroFestival.date)}</span>
              <span>•</span>
              <span className="font-serif text-orange-800 dark:text-amber-300">
                {isHindi ? translateSanskritMonthName(upcomingHeroFestival.month, 'Hindi') : upcomingHeroFestival.month} {isHindi ? translateTithiString(upcomingHeroFestival.tithi, 'Hindi') : upcomingHeroFestival.tithi}
              </span>
            </div>
          </div>

          <p className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-stone-300 mt-2 leading-relaxed font-normal">
            {isHindi ? upcomingHeroFestival.description : (upcomingHeroFestival.descriptionEnglish || upcomingHeroFestival.description)}
          </p>

          {(upcomingHeroFestival.pujaMuhurat || upcomingHeroFestival.paranTime || upcomingHeroFestival.moonriseTime) && (
            <div className="flex items-center gap-2 flex-wrap mt-2.5 pt-2 border-t border-orange-200/40 dark:border-white/10 text-xs">
              {upcomingHeroFestival.pujaMuhurat && (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/25 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{isHindi ? "पूजा:" : "Puja:"} {translateFestivalTiming(upcomingHeroFestival.pujaMuhurat, language)}</span>
                </span>
              )}
              {upcomingHeroFestival.paranTime && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/25 flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  <span>{isHindi ? "पारण:" : "Paran:"} {translateFestivalTiming(upcomingHeroFestival.paranTime, language)}</span>
                </span>
              )}
              {upcomingHeroFestival.moonriseTime && (
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 font-bold border border-sky-500/25 flex items-center gap-1">
                  <Moon className="w-3 h-3" />
                  <span>{isHindi ? "चंद्रोदय:" : "Moonrise:"} {translateFestivalTiming(upcomingHeroFestival.moonriseTime, language)}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. INTERACTIVE MONTHLY CALENDAR GRID */}
      {!searchQuery && (
        <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 rounded-3xl border border-orange-200/60 dark:border-orange-950/40 shadow-xs">
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-orange-100/50 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📅</span>
              <span className="text-xs sm:text-sm font-bold font-serif text-slate-800 dark:text-amber-200">
                {isHindi ? GREGORIAN_MONTHS_HINDI[selectedMonth] : GREGORIAN_MONTHS_EN[selectedMonth]} {selectedYear} {isHindi ? "कैलेंडर" : "Calendar"}
              </span>
            </div>
            {selectedDay !== null && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-[11px] font-bold text-orange-700 dark:text-amber-400 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-0.5 border border-orange-300/40 dark:border-amber-500/30"
              >
                <span>{isHindi ? `चयनित: ${selectedDay} ${GREGORIAN_MONTHS_HINDI[selectedMonth]}` : `Selected: ${GREGORIAN_MONTHS_EN[selectedMonth]} ${selectedDay}`}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {(isHindi ? WEEKDAYS_HINDI_SHORT : WEEKDAYS_EN_SHORT).map((wd, idx) => (
              <span
                key={idx}
                className={`text-[11px] sm:text-xs font-bold py-1 ${
                  idx === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-stone-400'
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty offset padding */}
            {Array.from({ length: firstDayWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-9 sm:h-10 rounded-xl" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasFest = festivalsByDay.has(dayNum);
              const isSelected = selectedDay === dayNum;
              const isTodayDay = isToday(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => {
                    setSelectedDay(selectedDay === dayNum ? null : dayNum);
                  }}
                  className={`h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer font-mono ${
                    isSelected
                      ? 'bg-amber-500 text-white font-black shadow-xs ring-2 ring-orange-600'
                      : isTodayDay
                      ? 'bg-orange-500/20 text-orange-900 dark:text-amber-300 font-black border border-orange-400/50'
                      : 'hover:bg-orange-500/10 text-slate-800 dark:text-stone-200'
                  }`}
                >
                  <span className="text-xs sm:text-[13px] leading-none">{dayNum}</span>
                  {hasFest && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? 'bg-white' : 'bg-orange-500 dark:bg-amber-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-[10.5px] text-slate-500 dark:text-stone-400 pt-2.5 mt-2 border-t border-orange-100/40 dark:border-white/5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>{isHindi ? "पर्व / व्रत का दिन (टैप करें)" : "Festival / Vrat Day (Tap)"}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-orange-400 bg-orange-500/20" />
              <span>{isHindi ? "आज का दिन" : "Today"}</span>
            </span>
          </div>

        </div>
      )}

      {/* 6. DEDUPLICATED FESTIVALS LIST */}
      <div className="space-y-3">
        
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-[15px] font-black font-serif text-slate-800 dark:text-amber-200">
            {searchQuery
              ? (isHindi ? `खोज परिणाम (${displayedFestivals.length} मिले)` : `Search Results (${displayedFestivals.length} found)`)
              : selectedDay !== null
              ? (isHindi ? `${selectedDay} ${GREGORIAN_MONTHS_HINDI[selectedMonth]} के पर्व` : `Festivals on ${GREGORIAN_MONTHS_EN[selectedMonth]} ${selectedDay}`)
              : (isHindi ? `${GREGORIAN_MONTHS_HINDI[selectedMonth]} ${selectedYear} के पर्व एवं व्रत (${displayedFestivals.length})` : `Festivals & Vrats of ${GREGORIAN_MONTHS_EN[selectedMonth]} ${selectedYear} (${displayedFestivals.length})`)}
          </h3>
          {(selectedDay !== null || searchQuery || categoryFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSelectedDay(null);
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="text-[11px] font-bold text-orange-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filter"}
            </button>
          )}
        </div>

        {displayedFestivals.length === 0 ? (
          <div className="p-8 text-center glass-card-light dark:glass-card-dark rounded-3xl border border-orange-200/60 dark:border-orange-950/40 text-slate-500 dark:text-stone-400 space-y-2">
            <p className="text-sm font-medium">{isHindi ? "चयनित फ़िल्टर के अनुसार कोई पर्व या व्रत नहीं मिला।" : "No festivals or vrats found matching the selected filter."}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDay(null);
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold cursor-pointer hover:bg-orange-600 transition-all"
            >
              {isHindi ? "सभी पर्व देखें" : "View All Festivals"}
            </button>
          </div>
        ) : (
          displayedFestivals.map((fest) => {
            const cat = getFestivalCategory(fest);
            const badge = getCategoryBadge(cat);

            return (
              <div
                key={fest.id}
                className="p-3.5 sm:p-4 rounded-3xl glass-card-light dark:glass-card-dark border border-orange-200/60 dark:border-orange-950/40 shadow-xs space-y-2 hover:border-orange-400/60 transition-colors"
              >
                {/* Header: Category Badge + Tithi Info */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[10.5px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11.5px] font-serif font-bold text-slate-500 dark:text-stone-400">
                    {isHindi ? translateSanskritMonthName(fest.month, 'Hindi') : fest.month} • {isHindi ? translateTithiString(fest.tithi, 'Hindi') : fest.tithi}
                  </span>
                </div>

                {/* Festival Name & Formatted Date */}
                <div>
                  <h4 className="text-[16px] sm:text-[17.5px] font-black font-serif text-[#9A3412] dark:text-amber-200 leading-tight">
                    {isHindi ? (fest.hindiName || fest.name) : fest.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-stone-300 mt-1 font-medium flex-wrap">
                    <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{formatFestivalDate(fest.date)}</span>
                    {fest.secondaryDate && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-amber-300 border border-orange-300/40 dark:border-amber-500/30 font-bold">
                        {isHindi ? "विस्तार:" : "Extended:"} {translateFestivalTiming(fest.secondaryDate, language)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-stone-300 leading-relaxed font-normal">
                  {isHindi ? fest.description : (fest.descriptionEnglish || fest.description)}
                </p>

                {/* Actionable Puja / Paran / Moonrise timings */}
                {(fest.pujaMuhurat || fest.paranTime || fest.moonriseTime) && (
                  <div className="pt-2 border-t border-orange-100/50 dark:border-white/10 flex items-center gap-2 flex-wrap text-xs">
                    {fest.pujaMuhurat && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/25 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{isHindi ? "पूजा:" : "Puja:"} {translateFestivalTiming(fest.pujaMuhurat, language)}</span>
                      </span>
                    )}
                    {fest.paranTime && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/25 flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        <span>{isHindi ? "पारण:" : "Paran:"} {translateFestivalTiming(fest.paranTime, language)}</span>
                      </span>
                    )}
                    {fest.moonriseTime && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 font-bold border border-sky-500/25 flex items-center gap-1">
                        <Moon className="w-3 h-3" />
                        <span>{isHindi ? "चंद्रोदय:" : "Moonrise:"} {translateFestivalTiming(fest.moonriseTime, language)}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
