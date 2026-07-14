import React, { useState } from 'react';
import {
  Search,
  Compass,
  CheckCircle2,
  XCircle,
  Sparkles,
  Star
} from 'lucide-react';
import { NAKSHATRA_DETAILS } from '../utils/panchangCalc';
import { getTranslation, Language } from '../utils/translations';

interface NakshatraScreenProps {
  language?: Language;
}

const translatePlanetNameHindi = (lord: string): string => {
  const map: Record<string, string> = {
    'ketu': 'केतु',
    'venus': 'शुक्र',
    'sun': 'सूर्य',
    'moon': 'चंद्र',
    'mars': 'मंगल',
    'rahu': 'राहु',
    'jupiter': 'गुरु',
    'saturn': 'शनि',
    'mercury': 'बुध'
  };
  return map[lord.toLowerCase()] || lord;
};

export function NakshatraScreen({ language = 'English' }: NakshatraScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNature, setSelectedNature] = useState<string>('all');

  // Filter Nakshatras based on search input and nature
  const filteredNakshatras = NAKSHATRA_DETAILS.filter((nak) => {
    const matchesSearch =
      nak.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nak.hindiName.includes(searchQuery) ||
      nak.lord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nak.deity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesNature = selectedNature === 'all' || nak.nature.toLowerCase().includes(selectedNature.toLowerCase());

    return matchesSearch && matchesNature;
  });

  const getPlanetColor = (lord: string) => {
    switch (lord.toLowerCase()) {
      case 'ketu': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'venus': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'sun': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'moon': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'mars': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'rahu': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'jupiter': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'saturn': return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case 'mercury': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div id="nakshatra_screen_root" className="space-y-4 sm:space-y-6 font-sans">
      
      {/* Intro & Search Filter Header */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-orange-655" />
          <label className="text-xs font-black text-slate-400 dark:text-amber-500 uppercase tracking-widest font-mono">
            {getTranslation(language, 'nakshatraGuide')}
          </label>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-4">
          {getTranslation(language, 'nakshatraIntro')}
        </p>

        {/* Search */}
        <div className="relative flex items-center mb-4">
          <input
            type="text"
            placeholder={getTranslation(language, 'searchNakshatra')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3.5 pl-11 rounded-2xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/60 focus:bg-white dark:focus:bg-zinc-950 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-800 dark:text-slate-100"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
        </div>

        {/* Action Nature Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'all', label: getTranslation(language, 'natureAll') },
            { id: 'kshipra', label: getTranslation(language, 'natureKshipra') },
            { id: 'ugra', label: getTranslation(language, 'natureUgra') },
            { id: 'dhruva', label: getTranslation(language, 'natureDhruva') },
            { id: 'mridu', label: getTranslation(language, 'natureMridu') },
            { id: 'chara', label: getTranslation(language, 'natureChara') },
            { id: 'teekshna', label: getTranslation(language, 'natureTeekshna') }
          ].map((nat) => (
            <button
              key={nat.id}
              onClick={() => setSelectedNature(nat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-2xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                selectedNature === nat.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-white/80 dark:bg-zinc-900/60 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-orange-950/45 text-slate-700 dark:text-slate-300'
              }`}
            >
              {nat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nakshatras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredNakshatras.length === 0 ? (
          <div className="col-span-full glass-card-light dark:glass-card-dark p-10 sm:p-12 text-center h-48 flex flex-col justify-center items-center">
            <Star className="w-8 h-8 text-orange-400 mb-2 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {getTranslation(language, 'nakshatraNotFound')}
            </span>
            <span className="text-3xs text-slate-400 mt-1">
              {getTranslation(language, 'tryAnotherSearch')}
            </span>
          </div>
        ) : (
          filteredNakshatras.map((nak, idx) => (
            <div
              key={nak.name}
              className="glass-card-light dark:glass-card-dark p-4 sm:p-5 flex flex-col justify-between text-left relative overflow-hidden"
            >
              {/* Backing number badge */}
              <div className="absolute right-3 top-2 text-4xl font-mono font-black text-slate-500/5 select-none pointer-events-none">
                #{idx + 1}
              </div>

              <div>
                {/* Heading details */}
                <div className="flex items-center gap-1.5 mb-2 flex-wrap sm:flex-nowrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 font-serif leading-none">
                    {language === 'Hindi' ? nak.hindiName : nak.name}
                  </h3>
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border tracking-wide font-mono uppercase shrink-0 ${getPlanetColor(nak.lord)}`}>
                    {getTranslation(language, 'ruler')}: {language === 'Hindi' ? translatePlanetNameHindi(nak.lord) : nak.lord}
                  </span>
                </div>

                {/* Symbol, Deity, Nature list */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 py-2.5 sm:py-3 border-t border-b border-orange-100/35 dark:border-zinc-800/40 my-2.5 text-[10px]">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight block text-3xs">
                      {getTranslation(language, 'symbol')}:
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-amber-100 mt-0.5 block">{nak.symbol}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight block text-3xs">
                      {getTranslation(language, 'deity')}:
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-amber-100 mt-0.5 block truncate">{nak.deity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tight block text-3xs">
                      {getTranslation(language, 'nature')}:
                    </span>
                    <span className="font-extrabold text-[#7c2d12] dark:text-amber-200 flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
                      {nak.nature}
                    </span>
                  </div>
                </div>

                {/* Detailed Description */}
                <p className="text-[11px] sm:text-3xs text-slate-600 dark:text-slate-350 leading-normal mb-3 font-sans">
                  {nak.description}
                </p>
              </div>

              {/* Action Dos and Don'ts */}
              <div className="space-y-1.5 pt-2 border-t border-dotted border-orange-100/20">
                <div className="flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] sm:text-[9.5px] text-slate-650 dark:text-slate-350 leading-tight">
                    <strong className="text-emerald-700 dark:text-emerald-450 mr-1">
                      {getTranslation(language, 'suitableActs')}:
                    </strong>
                    {nak.suitableActivities.join(', ')}
                  </span>
                </div>
                {nak.avoidActivities && nak.avoidActivities.length > 0 && (
                  <div className="flex items-start gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-[10px] sm:text-[9.5px] text-slate-650 dark:text-slate-350 leading-tight">
                      <strong className="text-rose-700 dark:text-rose-450 mr-1">
                        {getTranslation(language, 'avoidActs')}:
                      </strong>
                      {nak.avoidActivities.join(', ')}
                    </span>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
