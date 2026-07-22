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

  // Helper to check if a cell is today
  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  // Sort festivals of the year starting strictly from 1st January
  const sortedYearFestivals = useMemo(() => {
    return [...festivals].sort((a, b) => a.date.localeCompare(b.date));
  }, [festivals]);

  // Format date to DD/MM/YY
  const formatTableDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = String(d).padStart(2, '0');
    const month = String(m).padStart(2, '0');
    const yearTwoDigit = String(y).slice(-2);
    return day + '/' + month + '/' + yearTwoDigit;
  };

  // Translation helpers
  const translateMonthHindi = (monthName: string) => {
    const map: Record<string, string> = {
      Chaitra: 'चैत्र',
      Vaishakha: 'वैशाख',
      Jyeshtha: 'ज्येष्ठ',
      Ashadha: 'आषाढ़',
      Shravana: 'श्रावण',
      Bhadrapada: 'भाद्रपद',
      Ashvina: 'आश्विन',
      Kartik: 'कार्तिक',
      Margashirsha: 'मार्गशीर्ष',
      Pausha: 'पौष',
      Magha: 'माघ',
      Phalguna: 'फाल्गुन'
    };
    return map[monthName] || monthName;
  };

  const translateTithiHindi = (tithiName: string) => {
    let name = tithiName;
    name = name.replace(/Shukla/g, 'शुक्ल').replace(/Krishna/g, 'कृष्ण');
    name = name.replace(/Ekadashi/g, 'एकादशी')
               .replace(/Trayodashi/g, 'त्रयोदशी')
               .replace(/Chaturdashi/g, 'चतुर्दशी')
               .replace(/Purnima/g, 'पूर्णिमा')
               .replace(/Amavasya/g, 'अमावस्या')
               .replace(/Ashtami/g, 'अष्टमी')
               .replace(/Chaturthi/g, 'चतुर्थी')
               .replace(/Navami/g, 'नवमी')
               .replace(/Pratipada/g, 'प्रतिपदा')
               .replace(/Dwitiya/g, 'द्वितीया')
               .replace(/Tritiya/g, 'तृतीया')
               .replace(/Panchami/g, 'पंचमी')
               .replace(/Shashthi/g, 'षष्ठी')
               .replace(/Saptami/g, 'सप्तमी')
               .replace(/Dashami/g, 'दशमी');
    return name;
  };

  const translateDescription = (fest: Festival, lang: 'English' | 'Hindi') => {
    if (lang !== 'Hindi') return fest.description;
    
    const idLower = fest.id.toLowerCase();
    const nameLower = (fest.name || '').toLowerCase();
    const descLower = (fest.description || '').toLowerCase();

    if (idLower.includes('ekadashi') || nameLower.includes('ekadashi')) {
      if (idLower.includes('shukla') || descLower.includes('shukla')) {
        return `भगवान विष्णु की विशेष आराधना, सुख-समृद्धि एवं आध्यात्मिक शांति के लिए ${fest.hindiName || 'एकादशी'} का पावन व्रत।`;
      }
      return `भगवान विष्णु की कृपा, पाप-निवारण एवं संकट मुक्ति के लिए ${fest.hindiName || 'एकादशी'} का पावन व्रत।`;
    }
    if (idLower.includes('pradosh') || nameLower.includes('pradosh')) {
      return `भगवान शिव की आराधना, आरोग्य लाभ और दोष शांति के लिए प्रदोष काल में किया जाने वाला पावन व्रत।`;
    }
    if (idLower.includes('durgashtami') || nameLower.includes('durgashtami') || nameLower.includes('ashtami')) {
      return `भगवती दुर्गा एवं माँ पार्वती की विशेष कृपा, शक्ति और संकट नाश के लिए पावन अष्टमी व्रत।`;
    }
    if (idLower.includes('kalashtami') || nameLower.includes('kalashtami')) {
      return `भगवान कालभैरव की विशेष पूजा-अर्चना, भय मुक्ति और आत्मबल के लिए पावन कालाष्टमी व्रत।`;
    }
    if (idLower.includes('shivaratri') || nameLower.includes('shivaratri')) {
      return `भगवान भोलेनाथ की विशेष आराधना, रात्रि जागरण और रुद्र अभिषेक के लिए पावन शिवरात्रि व्रत।`;
    }
    if (idLower.includes('karwa_chauth') || nameLower.includes('karwa chauth')) {
      return `पति की दीर्घायु, उत्तम स्वास्थ्य और अखंड सौभाग्य की प्राप्ति के लिए सुहागिनों का पावन निर्जला व्रत।`;
    }
    if (idLower.includes('sankashti') || nameLower.includes('sankashti')) {
      return `विघ्नहर्ता श्री गणेश की कृपा से समस्त बाधाओं और कष्टों के निवारण के लिए पावन संकष्टी चतुर्थी व्रत।`;
    }
    if (idLower.includes('vinayaka') || nameLower.includes('vinayaka')) {
      return `श्री गणेश जी के पूजन से ज्ञान, बुद्धि, रिद्धि-सिद्धि और सफलता का पावन विनायक चतुर्थी व्रत।`;
    }
    if (idLower.includes('purnima') || nameLower.includes('purnima')) {
      return `भगवान श्री सत्यनारायण पूजन, स्नान, दान-पुण्य और चंद्र देव की उपासना के लिए पावन पूर्णिमा तिथि।`;
    }
    if (idLower.includes('amavasya') || nameLower.includes('amavasya')) {
      return `पितृ तर्पण, श्राद्ध कर्म, दीपदान और पवित्र नदियों में स्नान के लिए पावन अमावस्या तिथि।`;
    }
    if (idLower.includes('gudi_padwa') || nameLower.includes('gudi padwa')) {
      return `वैदिक नव संवत्सर का शुभारंभ, सृष्टि निर्माण दिवस और चैत्र नवरात्र का पावन पर्व।`;
    }
    if (idLower.includes('rama_navami') || nameLower.includes('rama navami')) {
      return `मर्यादा पुरुषोत्तम भगवान श्री राम का पावन जन्मोत्सव व्रत एवं भव्य पूजन।`;
    }
    if (idLower.includes('navratri') || nameLower.includes('navratri')) {
      return `नवदुर्गा की विशेष उपासना, कलश स्थापना और शक्ति साधना का पावन नवरात्र पर्व।`;
    }
    if (idLower.includes('dussehra') || nameLower.includes('dussehra')) {
      return `अधर्म पर धर्म और बुराई पर अच्छाई की विजय का प्रतीक पावन विजयादशमी (दशहरा) पर्व।`;
    }
    if (idLower.includes('govardhan') || nameLower.includes('govardhan')) {
      return `भगवान श्री कृष्ण द्वारा गोवर्धन पर्वत धारण करने की स्मृति में अन्नकूट एवं गोवर्धन पूजन।`;
    }
    if (idLower.includes('bhai_dooj') || nameLower.includes('bhai dooj')) {
      return `भाई-बहन के पवित्र प्रेम, सुरक्षा और स्नेह का प्रतीक यमद्वितीया (भैया दूज) पर्व।`;
    }
    if (idLower.includes('makar_sankranti') || nameLower.includes('makar sankranti')) {
      return `सूर्य देव का मकर राशि में प्रवेश। पवित्र नदियों में स्नान, तिल-गुड़ दान और सूर्य देव की उपासना।`;
    }
    if (idLower.includes('janmashtami') || nameLower.includes('janmashtami')) {
      return `भगवान श्री कृष्ण का मध्यरात्रि का भव्य जन्मोत्सव व्रत एवं बाल गोपाल पूजन।`;
    }
    if (idLower.includes('ganesh_chaturthi') || nameLower.includes('ganesh chaturthi')) {
      return `विघ्नहर्ता श्री गणेश के जन्मोत्सव का दस दिवसीय पावन भक्ति उत्सव।`;
    }
    if (idLower.includes('holi') || nameLower.includes('holi')) {
      return `रंगों का पारंपरिक वसंत उत्सव और बुराई पर अच्छाई की विजय का पावन पर्व।`;
    }
    if (idLower.includes('diwali') || nameLower.includes('diwali')) {
      return `दीपों का महापर्व। भगवान श्री राम के अयोध्या आगमन पर महालक्ष्मी एवं कुबेर पूजन।`;
    }

    if (descLower.includes('lord vishnu')) {
      return 'भगवान विष्णु की कृपा, भक्ति और आत्मिक शांति के लिए पावन व्रत।';
    }
    if (descLower.includes('lord shiva')) {
      return 'भगवान शिव की विशेष आराधना, आरोग्य और दोष शांति का पावन पर्व।';
    }
    if (descLower.includes('lord ganesha')) {
      return 'श्री गणेश जी की कृपा से बाधा मुक्ति और समृद्धि का पावन व्रत।';
    }
    if (descLower.includes('full moon')) {
      return 'सत्यनारायण व्रत कथा, चंद्र दर्शन एवं दान-पुण्य की पावन पूर्णिमा।';
    }
    if (descLower.includes('new moon')) {
      return 'पितृ शांति, तर्पण एवं पवित्र स्नान की पावन अमावस्या।';
    }

    return fest.description;
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
            className="text-xs p-2 rounded-xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/55 dark:border-zinc-850 text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-serif font-extrabold cursor-pointer animate-fade-in"
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
            className="text-xs p-2 rounded-xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/55 dark:border-zinc-850 text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-mono font-extrabold cursor-pointer animate-fade-in"
          >
            {Array.from({ length: 11 }, (_, i) => year - 5 + i).map((y) => (
              <option key={y} value={y} className="bg-[#120B08] text-slate-100">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. 7x5 Calendar Grid with Centered Date and Saffron Borders */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left space-y-4">
        {/* Weekday Labels (7 Horizontal boxes) */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
          {WEEKDAYS[language === 'Hindi' ? 'Hindi' : 'English'].map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* 35 Grid Cells (7 columns x 5 rows) */}
        <div className="grid grid-cols-7 gap-2">
          {gridCells.map((cell, idx) => {
            if (cell === null) {
              return (
                <div 
                  key={idx} 
                  className="rounded-xl border border-dashed border-orange-500/20 dark:border-orange-500/10 bg-slate-500/2 dark:bg-zinc-950/5 min-h-[58px] sm:min-h-[66px]"
                ></div>
              );
            }

            if (Array.isArray(cell)) {
              // Spillover Combined cell (e.g. 23/30 or 24/31)
              return (
                <div 
                  key={idx} 
                  className="p-1 rounded-2xl bg-white/40 dark:bg-zinc-950/20 border border-orange-500/45 dark:border-orange-500/35 shadow-xs min-h-[58px] sm:min-h-[66px] flex flex-col justify-between hover:scale-102 hover:border-orange-500/60 transition-all duration-300"
                >
                  {cell.map(d => {
                    const dayFests = getFestivalsForDay(d);
                    const isSelected = selectedDay === d;
                    const dIsToday = isToday(d);
                    return (
                      <div 
                        key={d} 
                        onClick={() => setSelectedDay(isSelected ? null : d)}
                        className={"flex justify-center items-center gap-1.5 px-1.5 py-0.5 rounded-lg cursor-pointer text-[9px] font-mono font-black leading-none transition-all " + (
                          isSelected 
                            ? 'bg-orange-500 text-white font-extrabold shadow-sm' 
                            : dIsToday
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/35 shadow-xs'
                              : 'hover:bg-orange-500/10 text-slate-700 dark:text-slate-355'
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
            const cellIsToday = isToday(cell);

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : cell)}
                className={"p-1.5 rounded-2xl border transition-all duration-300 cursor-pointer min-h-[58px] sm:min-h-[66px] flex flex-col justify-between items-center text-center shadow-xs hover:scale-102 hover:border-orange-500/65 " + (
                  isSelected
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-500 shadow-md font-bold scale-102'
                    : cellIsToday
                      ? 'bg-amber-500/10 dark:bg-amber-950/30 border-orange-500 dark:border-orange-500 ring-1 ring-orange-500/40 shadow-sm text-slate-900 dark:text-amber-100 font-extrabold'
                      : 'bg-white/60 dark:bg-zinc-950/30 border-orange-500/45 dark:border-orange-500/35 hover:bg-orange-500/5 dark:hover:bg-zinc-900/30 text-slate-750 dark:text-slate-350'
                )}
              >
                {cellIsToday && (
                  <span className="text-[7px] bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-350 px-1 py-0.5 rounded-md font-bold font-mono">
                    {language === 'Hindi' ? 'आज' : 'TODAY'}
                  </span>
                )}
                
                {/* Centered Date Number */}
                <span className="text-[10px] sm:text-xs font-mono font-black leading-none text-center my-auto">{cell}</span>
                
                {/* Truncated Festival Names underneath the date inside the box */}
                {dayFests.length > 0 && (
                  <div className="flex flex-col gap-0.5 w-full mt-1">
                    {dayFests.slice(0, 1).map((f, fIdx) => {
                      const displayName = language === 'Hindi' ? f.hindiName : f.name;
                      const truncatedName = displayName.length > 8 ? displayName.slice(0, 7) + '..' : displayName;
                      return (
                        <span 
                          key={fIdx} 
                          className={"text-[7px] leading-tight px-1 py-0.5 rounded-md text-center font-bold truncate block " + (
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/5 dark:text-orange-300 border border-orange-500/15'
                          )}
                          title={displayName}
                        >
                          {truncatedName}
                        </span>
                      );
                    })}
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
                          🌙 {language === 'Hindi' ? translateMonthHindi(fest.month) : fest.month} • {language === 'Hindi' ? translateTithiHindi(fest.tithi) : fest.tithi}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-850 dark:text-amber-100 font-serif leading-snug">
                        {language === 'Hindi' ? fest.hindiName : fest.name}
                      </h4>
                      <p className="text-[10px] text-slate-600 dark:text-slate-455 leading-relaxed">
                        {translateDescription(fest, language)}
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
                className="glass-card-light dark:glass-card-dark p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-left shadow-xs rounded-3xl"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={"text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border " + getBadgeStyles(fest.type) + " font-mono uppercase tracking-wide"}>
                      {getTypeName(fest.type)}
                    </span>
                    <span className="text-[10px] text-[#A64B00] dark:text-[#FFB366] font-mono font-bold">
                      🌙 {language === 'Hindi' ? translateMonthHindi(fest.month) : fest.month} • {language === 'Hindi' ? translateTithiHindi(fest.tithi) : fest.tithi}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-850 dark:text-amber-100 font-serif leading-snug">
                    {language === 'Hindi' ? fest.hindiName : fest.name}
                  </h3>

                  <p className="text-[11px] sm:text-2xs text-slate-655 dark:text-slate-400 leading-relaxed font-sans max-w-2xl">
                    {translateDescription(fest, language)}
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

      {/* 5. Annual Festivals Table (Entire selected year list) */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left space-y-4">
        <div>
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
            {language === 'Hindi' 
              ? "वर्ष " + currentYear + " के समस्त व्रत एवं त्यौहार" 
              : "All Festivals of the Year " + currentYear}
          </h3>
          <p className="text-[10px] text-slate-455 dark:text-slate-555 font-sans mt-0.5">
            {language === 'Hindi'
              ? 'वर्षभर के सभी प्रमुख व्रत, एकादशी, पूर्णिमा और राष्ट्रीय त्यौहारों की समय-सारणी।'
              : 'Complete schedule of all major fasts, Ekadashi, Purnima, and national festivals for the year.'}
          </p>
        </div>

        {/* Mobile View: Stacked Card rows (No horizontal scroll, date format DD/MM/YY) */}
        <div className="md:hidden space-y-3">
          {sortedYearFestivals.map((fest) => {
            return (
              <div 
                key={fest.id} 
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/80 border border-orange-100/20 dark:border-orange-500/20 shadow-xs flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                  <span className="text-orange-700 dark:text-orange-300">
                    {formatTableDate(fest.date)}
                  </span>
                  <span className={"px-2 py-0.5 rounded-full border text-[8px] font-extrabold font-mono uppercase " + getBadgeStyles(fest.type)}>
                    {getTypeName(fest.type)}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-serif font-black text-slate-850 dark:text-amber-100">
                    {language === 'Hindi' ? fest.hindiName : fest.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed font-sans mt-0.5">
                    {translateDescription(fest, language)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Traditional Table Layout */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-orange-100/10 dark:border-zinc-850/50">
          <table className="w-full text-left border-collapse text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="bg-orange-500/5 dark:bg-[#120B08]/60 border-b border-orange-100/10 dark:border-zinc-850/50 text-[10px] font-bold text-slate-400 dark:text-amber-400 uppercase tracking-wider font-mono">
                <th className="p-3 whitespace-nowrap">{language === 'Hindi' ? "तिथि" : "Date"}</th>
                <th className="p-3">{language === 'Hindi' ? "त्यौहार" : "Festival"}</th>
                <th className="p-3">{language === 'Hindi' ? "संक्षिप्त विवरण" : "Short Summary"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/5 dark:divide-zinc-850/40 text-2xs sm:text-xs">
              {sortedYearFestivals.map((fest) => {
                return (
                  <tr key={fest.id} className="hover:bg-slate-500/5 dark:hover:bg-zinc-900/40 transition-all duration-200">
                    <td className="p-3 font-mono font-bold whitespace-nowrap text-orange-700 dark:text-orange-300">
                      {formatTableDate(fest.date)}
                    </td>
                    <td className="p-3 font-serif font-black text-slate-850 dark:text-amber-100 whitespace-nowrap">
                      {language === 'Hindi' ? fest.hindiName : fest.name}
                    </td>
                    <td className="p-3 text-[11px] leading-relaxed text-slate-700 dark:text-slate-200 min-w-[200px]">
                      {translateDescription(fest, language)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
