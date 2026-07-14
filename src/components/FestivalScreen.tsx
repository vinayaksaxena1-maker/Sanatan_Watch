/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Smile, Download, ExternalLink } from 'lucide-react';
import { Festival } from '../types';
import { getFestivalsForYear } from '../utils/festivalEngine';
import { generateGoogleCalendarUrl, exportToIcsFile } from '../utils/calendarSync';

interface FestivalScreenProps {
  lat: number;
  lon: number;
  year: number;
  language?: 'English' | 'Hindi';
}

export function FestivalScreen({ lat, lon, year, language = 'English' }: FestivalScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Calculate festivals dynamically based on local rules
  const festivals = useMemo(() => {
    return getFestivalsForYear(year, lat, lon);
  }, [year, lat, lon]);

  const filteredFestivals = festivals.filter((fest) => {
    const matchesSearch =
      fest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fest.hindiName.includes(searchQuery) ||
      fest.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fest.tithi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || fest.type === selectedType;

    return matchesSearch && matchesType;
  });

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
        return 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/20 dark:border-teal-900 dark:text-teal-300';
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

  const handleIcsExport = (fest: Festival) => {
    const sD = new Date(fest.date);
    const eD = new Date(sD);
    eD.setDate(eD.getDate() + 1);

    exportToIcsFile({
      title: language === 'Hindi' ? fest.hindiName : fest.name,
      description: fest.description,
      startDate: fest.date,
      endDate: eD.toISOString().split('T')[0],
      location: 'India'
    });
  };

  const getGoogleUrl = (fest: Festival) => {
    const sD = new Date(fest.date);
    const eD = new Date(sD);
    eD.setDate(eD.getDate() + 1);

    return generateGoogleCalendarUrl({
      title: language === 'Hindi' ? fest.hindiName : fest.name,
      description: fest.description,
      startDate: fest.date,
      endDate: eD.toISOString().split('T')[0],
      location: 'India'
    });
  };

  return (
    <div id="festival_screen_root" className="space-y-4 sm:space-y-6 font-sans">
      
      {/* Search Input and Filters Bar */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left">
        <label className="text-xs font-bold text-slate-400 dark:text-amber-500 uppercase tracking-wider mb-2 font-mono block">
          {language === 'Hindi' ? "त्यौहार और व्रत खोजें" : "Search Festivals & Fasts"}
        </label>
        
        {/* Search Input Box */}
        <div className="relative flex items-center mb-4">
          <input
            type="text"
            placeholder={language === 'Hindi' ? "त्यौहार खोजें जैसे दीवाली, होली, एकादशी..." : "Search festivals e.g. Diwali, Holi, Ekadashi..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3.5 pl-11 rounded-2xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/55 dark:border-zinc-850 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-800 dark:text-slate-100"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
        </div>

        {/* Categories Pills bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'Major', 'Ekadashi', 'Purnima', 'Amavasya', 'Sankashti', 'Jayanti'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 sm:py-2 rounded-xl text-2xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                selectedType === type
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-80 border-orange-100 dark:border-orange-950/45 text-slate-700 dark:text-slate-300'
              }`}
            >
              {getTypeName(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Festivals List */}
      <div className="space-y-3.5 sm:space-y-4">
        {filteredFestivals.length === 0 ? (
          <div className="glass-card-light dark:glass-card-dark p-10 sm:p-12 text-center h-48 flex flex-col justify-center items-center">
            <Smile className="w-8 h-8 text-orange-400 mb-2 animate-bounce" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {language === 'Hindi' ? "आपकी खोज से मेल खाने वाला कोई त्यौहार नहीं मिला।" : "No festivals found matching your search."}
            </span>
            <span className="text-3xs text-slate-400 mt-1">
              {language === 'Hindi' ? "कृपया अपने खोज शब्द बदलें।" : "Please try searching for something else."}
            </span>
          </div>
        ) : (
          filteredFestivals.map((fest) => {
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
                {/* Festival Metas */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${getBadgeStyles(fest.type)} font-mono uppercase tracking-wide`}>
                      {getTypeName(fest.type)}
                    </span>
                    <span className="text-[10px] text-[#A64B00] dark:text-[#FFB366] font-mono font-bold">
                      🌙 {fest.month} • {fest.tithi}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-850 dark:text-amber-100 font-serif leading-snug">
                    {language === 'Hindi' ? fest.hindiName : fest.name}
                  </h3>

                  <p className="text-[11px] sm:text-2xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">
                    {fest.description}
                  </p>
                  
                  {/* Calendar Sync Actions */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getGoogleUrl(fest)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> {language === 'Hindi' ? "गूगल कैलेंडर में जोड़ें" : "Google Calendar"}
                    </a>
                    <button
                      onClick={() => handleIcsExport(fest)}
                      className="flex items-center gap-1 text-[10px] font-bold text-orange-655 hover:underline cursor-pointer bg-transparent border-0"
                    >
                      <Download className="w-3 h-3" /> {language === 'Hindi' ? "कैलेंडर फ़ाइल (.ics)" : "export iCal"}
                    </button>
                  </div>
                </div>

                {/* Calendar timing anchor */}
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
