import React, { useState } from 'react';
import { Eye, Smartphone, Layout, Minimize2, Sparkles, AlertCircle } from 'lucide-react';
import { PanchangInfo, MuhuratItem } from '../types';

interface WidgetSimulatorProps {
  panchang: PanchangInfo;
  muhurats: MuhuratItem[];
  city: string;
}

export function WidgetSimulator({ panchang, muhurats, city }: WidgetSimulatorProps) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | 'lockscreen'>('medium');
  const [homeWallpaper, setHomeWallpaper] = useState<'cosmic' | 'marigold' | 'nature'>('cosmic');

  const currMuhurat = muhurats.find(m => m.id === 'abhijit') || muhurats[0];
  const activeTithi = panchang.hinduDate.tithi.hindiName.split(' ')[0];
  const activeNakshatra = panchang.hinduDate.nakshatra.hindiName;

  const wallGradients = {
    cosmic: 'from-[#0B1528] via-[#102A45] to-[#1D1B26]',
    marigold: 'from-[#FFF1E3] via-[#FFE2C8] to-[#FFF6EC]',
    nature: 'from-[#112F24] via-[#184E37] to-[#1B321D]'
  };

  return (
    <div id="widget_simulator_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2 font-serif">
            <Layout className="w-5 h-5 text-orange-600" />
            होम स्क्रीन विजेट प्रीव्यू
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            हमारे प्रीमियम iOS और एंड्रॉइड विजेट का अनुभव करें। अपने मोबाइल पर देखने के लिए विजेट का आकार चुनें।
          </p>
        </div>

        {/* Home Screen Wallpapers Selector */}
        <div className="flex items-center gap-1.5 bg-orange-500/5 dark:bg-orange-950/20 p-1.5 rounded-xl border border-orange-100/30">
          <span className="text-[10px] text-orange-850 dark:text-orange-400 font-bold uppercase px-2 font-mono">वॉलपेपर:</span>
          <button
            onClick={() => setHomeWallpaper('cosmic')}
            className={`w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0F172A] to-slate-700 border border-white dark:border-zinc-850 text-xs cursor-pointer ${
              homeWallpaper === 'cosmic' ? 'ring-2 ring-orange-500 font-bold' : 'opacity-70'
            }`}
            title="Cosmic Dark"
          />
          <button
            onClick={() => setHomeWallpaper('marigold')}
            className={`w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-100 to-orange-200 border border-white dark:border-zinc-850 text-xs cursor-pointer ${
              homeWallpaper === 'marigold' ? 'ring-2 ring-orange-500 font-bold' : 'opacity-70'
            }`}
            title="Marigold Light"
          />
          <button
            onClick={() => setHomeWallpaper('nature')}
            className={`w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-950 to-[#1e293b] border border-white dark:border-zinc-850 text-xs cursor-pointer ${
              homeWallpaper === 'nature' ? 'ring-2 ring-orange-500 font-bold' : 'opacity-70'
            }`}
            title="Temple Forest"
          />
        </div>
      </div>

      {/* Grid: Selecting Sizes to Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-5">
        <button
          onClick={() => setSelectedSize('small')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold text-2xs sm:text-xs cursor-pointer transition-all ${
            selectedSize === 'small'
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-white/70 dark:bg-zinc-900/40 hover:bg-slate-100/50 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Minimize2 className="w-3.5 h-3.5" />
          छोटा विजेट (२x२)
        </button>

        <button
          onClick={() => setSelectedSize('medium')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold text-2xs sm:text-xs cursor-pointer transition-all ${
            selectedSize === 'medium'
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-white/70 dark:bg-zinc-900/40 hover:bg-slate-100/50 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          मध्यम विजेट (४x२)
        </button>

        <button
          onClick={() => setSelectedSize('large')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold text-2xs sm:text-xs cursor-pointer transition-all ${
            selectedSize === 'large'
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-white/70 dark:bg-zinc-900/40 hover:bg-slate-100/50 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          बड़ा विजेट (४x४)
        </button>

        <button
          onClick={() => setSelectedSize('lockscreen')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold text-2xs sm:text-xs cursor-pointer transition-all ${
            selectedSize === 'lockscreen'
              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
              : 'bg-white/70 dark:bg-zinc-900/40 hover:bg-slate-100/50 dark:hover:bg-zinc-800 border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          लॉक स्क्रीन
        </button>
      </div>

      {/* Simulator Device Layout Container */}
      <div className="flex justify-center items-center p-4 sm:p-5 rounded-3xl bg-zinc-950/80 border border-zinc-900">
        <div className={`w-full max-w-[420px] aspect-[9/16] rounded-[42px] bg-gradient-to-b ${wallGradients[homeWallpaper]} p-4 relative border-8 border-zinc-800 dark:border-[#1E293B] shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-700`}>
          {/* Phone Top Notch Speaker */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-3.5 bg-slate-800 rounded-full flex items-center justify-center z-10 px-4">
            <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-auto border border-slate-700"></div>
          </div>

          {/* Simulated Time and status symbols */}
          <div className="flex justify-between items-center px-4 pt-1 z-10">
            <span className={`text-[10px] font-bold ${homeWallpaper === 'marigold' ? 'text-slate-800' : 'text-white'}`}>09:41</span>
            <div className={`flex gap-1 items-center text-[10px] font-bold ${homeWallpaper === 'marigold' ? 'text-slate-800' : 'text-white'}`}>
              <span>5G</span>
              <span>📶</span>
              <span>🔋 100%</span>
            </div>
          </div>

          {/* Widget preview region */}
          <div className="my-auto flex items-center justify-center p-3 w-full h-full">
            {/* RENDER SELECTED WIDGET SIZE */}
            {selectedSize === 'small' && (
              <div className="w-32 h-32 rounded-[22px] bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EB] border border-orange-100 p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-800">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-extrabold text-orange-600 block uppercase font-serif tracking-normal leading-3">ॐ पंचक</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-[9px] font-bold text-slate-400 block leading-3">सक्रिय समय:</h3>
                  <span className="text-xs font-black text-slate-800 block mt-0.5 truncate leading-tight">{currMuhurat.name.split(' ')[0]}</span>
                  <span className="text-[9.5px] text-green-700 font-extrabold block leading-none mt-1">{currMuhurat.startTime} - {currMuhurat.endTime}</span>
                </div>
                <div className="border-t border-orange-100/70 pt-1.5 flex justify-between items-center text-[8.5px] text-slate-500 font-medium">
                  <span>{activeTithi}</span>
                  <span className="text-orange-900 font-extrabold">📍 {city}</span>
                </div>
              </div>
            )}

            {selectedSize === 'medium' && (
              <div className="w-full max-w-[280px] h-32 rounded-[22px] bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EB] border border-orange-100 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-800">
                {/* Decorative Marigold Background Ring */}
                <div className="absolute right-[-15px] top-[-15px] w-20 h-20 rounded-full bg-orange-100/30 border-2 border-dashed border-orange-200 pointer-events-none"></div>

                <div className="flex justify-between items-center border-b border-orange-100/70 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-orange-900 font-serif">ॐ आज का धर्मिक समय</span>
                  </div>
                  <span className="text-[8px] font-black text-orange-600 uppercase bg-orange-100/60 px-1.5 py-0.5 rounded">
                    📍 {city}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block">आज की तिथि</span>
                    <span className="text-xs font-bold text-slate-850 block mt-0.5 leading-tight truncate">{panchang.hinduDate.tithi.hindiName.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 block">देवता: {panchang.hinduDate.tithi.lord}</span>
                  </div>
                  <div className="border-l border-orange-100 pl-2">
                    <span className="text-[9px] font-bold text-slate-400 block">सक्रिय चौघड़िया</span>
                    <span className="text-xs font-bold text-slate-850 block mt-0.5 leading-tight truncate">{currMuhurat.name.replace(' Choghadiya','')}</span>
                    <span className="text-[9px] font-extrabold text-[#27AE60] block">{currMuhurat.startTime} - {currMuhurat.endTime}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8.5px] text-slate-500 border-t border-orange-100/40 pt-1">
                  <span>नक्षत्र: {activeNakshatra.split(' ')[0]}</span>
                  <span className="text-orange-700 font-bold">अगला: अभिजीत</span>
                </div>
              </div>
            )}

            {selectedSize === 'large' && (
              <div className="w-full max-w-[280px] h-64 rounded-[28px] bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EB] border border-orange-100 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-800">
                <div className="flex justify-between items-center border-b border-orange-100/70 pb-1.5">
                  <span className="text-[11px] font-black text-orange-900 font-serif flex items-center gap-1">ॐ आज का पंचांग <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" /></span>
                  <span className="text-[8px] font-black text-white bg-orange-600 px-1.5 py-0.5 rounded-full">📍 {city}</span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 mt-1.5 my-auto">
                  <div className="p-1 rounded-xl bg-orange-500/5 border border-orange-100/50 text-left">
                    <span className="text-[8.5px] font-bold text-slate-450 block">आज की तिथि</span>
                    <span className="text-[10.5px] font-bold text-slate-800 truncate block mt-0.5">{panchang.hinduDate.tithi.hindiName.split(' ')[0]}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-orange-500/5 border border-orange-100/50 text-left">
                    <span className="text-[8.5px] font-bold text-slate-450 block">आज का नक्षत्र</span>
                    <span className="text-[10.5px] font-bold text-slate-800 truncate block mt-0.5">{activeNakshatra.split(' ')[0]}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-orange-500/5 border border-orange-100/50 text-left">
                    <span className="text-[8.5px] font-bold text-slate-455 block">आज का योग</span>
                    <span className="text-[10.5px] font-bold text-slate-800 truncate block mt-0.5">{panchang.hinduDate.yoga.name}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-orange-500/5 border border-orange-100/50 text-left">
                    <span className="text-[8.5px] font-bold text-slate-455 block">वर्तमान पक्ष</span>
                    <span className="text-[10.5px] font-bold text-slate-800 truncate block mt-0.5">{panchang.hinduDate.paksha === 'Shukla' || (panchang.hinduDate.paksha as string) === 'शुक्ल' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-amber-50 border border-amber-200/50 text-left">
                    <span className="text-[8.5px] font-bold text-amber-900 block">सूर्योदय (Sunrise)</span>
                    <span className="text-[10.5px] font-bold text-amber-950 block mt-0.5">{panchang.sunrise}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-amber-50 border border-amber-200/50 text-left">
                    <span className="text-[8.5px] font-bold text-amber-900 block">सूर्यास्त (Sunset)</span>
                    <span className="text-[10.5px] font-bold text-amber-950 block mt-0.5">{panchang.sunset}</span>
                  </div>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-orange-100-0 flex flex-col gap-1 text-left bg-orange-500/5 p-1.5 rounded-xl border border-orange-100/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold text-orange-950">🚩 राहु काल चक्र</span>
                    <span className="text-[7.5px] text-red-600 font-bold bg-red-100 px-1 py-0.2 rounded font-mono">वर्जित समय</span>
                  </div>
                  <span className="text-[9px] text-slate-650">इस समय शुभ कार्य वर्जित है: <strong>{panchang.rahuKaal.start} - {panchang.rahuKaal.end}</strong></span>
                </div>

                <div className="text-[8px] text-slate-500 flex justify-between items-center font-mono mt-1.5 pt-1.5 border-t border-orange-100/40 font-medium">
                  <span>संवत: {panchang.hinduDate.samvatVikram}</span>
                  <span className="text-orange-900 font-bold">|| धर्मो रक्षति रक्षितः ||</span>
                </div>
              </div>
            )}

            {selectedSize === 'lockscreen' && (
              <div className="h-40 w-full max-w-[250px] p-3.5 rounded-3xl bg-black/35 backdrop-blur-md border border-white/20 text-white flex flex-col justify-between text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wide">आज का धर्मिक समय</span>
                  </div>
                  <span className="text-[8px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">📍 {city}</span>
                </div>
                
                <div>
                  <span className="text-[8.5px] text-[#F39C12] font-bold uppercase tracking-wider block">शुभ चौघड़िया मुहूर्त:</span>
                  <h3 className="text-sm font-bold text-slate-50 block tracking-tight leading-normal drop-shadow-xs truncate">
                    {currMuhurat.name.replace(' Choghadiya','')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded">
                      {currMuhurat.startTime} - {currMuhurat.endTime}
                    </span>
                    <span className="text-[8.5px] text-white/60">शेष: २४ मि.</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-1 flex justify-between items-center text-[8.5px] text-white/40 font-medium">
                  <span>तिथि: {activeTithi}</span>
                  <span>नक्षत्र: {activeNakshatra.split(' ')[0]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Notification indicator or device swipe line */}
          <div className="w-24 h-1 bg-slate-600/50 rounded-full mx-auto bottom-1.5 text-center absolute left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"></div>
        </div>
      </div>

      {/* Widget Manual Instruction Info */}
      <div className="mt-4 flex gap-2 p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 text-left">
        <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-sky-950 dark:text-sky-200 leading-relaxed">
          <strong>विजेट जोड़ने का तरीका:</strong> अपने फोन की होम स्क्रीन पर खाली जगह को कुछ देर दबाकर रखें। '+' बटन दबाएं, "आज का धर्मिक समय" खोजें और विजेट जोड़ें। स्थान सटीक रूप से पंचांग की गणना स्वतः करता रहेगा।
        </p>
      </div>
    </div>
  );
}
