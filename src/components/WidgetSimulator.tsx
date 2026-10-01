import React, { useState, useEffect } from 'react';
import { Eye, Smartphone, Layout, Minimize2, Sparkles, Watch, Clock } from 'lucide-react';
import { PanchangInfo, MuhuratItem } from '../types';
import { AnalogClock } from './AnalogClock';
import { LiveMuhuratWatch } from './LiveMuhuratWatch';

interface WidgetSimulatorProps {
  panchang: PanchangInfo;
  muhurats: MuhuratItem[];
  city: string;
}

export function WidgetSimulator({ panchang, muhurats, city }: WidgetSimulatorProps) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | 'lockscreen' | 'analog'>('medium');
  const [wallpaperBase64, setWallpaperBase64] = useState<string>('');

  if (!panchang || !panchang.hinduDate) {
    return (
      <div className="flex justify-center p-8 text-slate-400 dark:text-brand-text-mut font-bold bg-white dark:bg-brand-card border border-slate-100 dark:border-brand-border rounded-3xl">
        विजेट्स लोड हो रहे हैं...
      </div>
    );
  }

  const currMuhurat = (muhurats && muhurats.length > 0)
    ? (muhurats.find(m => m?.id === 'abhijit') || muhurats[0])
    : null;

  const activeTithi = panchang.hinduDate.tithi?.hindiName
    ? panchang.hinduDate.tithi.hindiName.split(' ')[0]
    : 'तिथि';
  const activeNakshatra = panchang.hinduDate.nakshatra?.hindiName || 'नक्षत्र';

  // Load system wallpaper on android mount
  useEffect(() => {
    if (window.AndroidAlarm && typeof window.AndroidAlarm.getSystemWallpaperBase64 === 'function') {
      try {
        const base64 = window.AndroidAlarm.getSystemWallpaperBase64();
        if (base64) {
          setWallpaperBase64(base64);
        }
      } catch (e) {
        console.error("Failed to load native wallpaper", e);
      }
    }
  }, []);

  return (
    <div id="widget_simulator_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-brand-text-pri flex items-center gap-2 font-serif">
            <Layout className="w-5 h-5 text-orange-600" />
            होम स्क्रीन विजेट प्रीव्यू
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-brand-text-mut mt-1 leading-normal">
            हमारे प्रीमियम मोबाइल विजेट का लाइव अनुभव करें। देखने के लिए प्रारूप का आकार चुनें।
          </p>
        </div>
      </div>

      {/* Selector: Selecting Sizes to Preview */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-5 text-[11px] font-bold">
        {[
          { id: 'small', label: 'छोटा (२x२)' },
          { id: 'medium', label: 'मध्यम (४x२)' },
          { id: 'large', label: 'बड़ा (४x४)' },
          { id: 'lockscreen', label: 'लॉक स्क्रीन' },
          { id: 'analog', label: 'एनालॉग घड़ी' }
        ].map((size, index, arr) => (
          <React.Fragment key={size.id}>
            <span
              onClick={() => setSelectedSize(size.id as any)}
              className={`cursor-pointer transition-all hover:underline ${
                selectedSize === size.id
                  ? 'text-orange-655 font-extrabold dark:text-brand-accent'
                  : 'text-slate-500 hover:text-slate-800 dark:text-brand-text-mut dark:hover:text-slate-200'
              }`}
            >
              {size.label}
            </span>
            {index < arr.length - 1 && (
              <span className="text-slate-300 dark:text-zinc-800 select-none">|</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Simulator Device Layout Container */}
      <div className="flex justify-center items-center p-4 sm:p-5 rounded-3xl bg-zinc-950/80 border border-zinc-900">
        <div 
          className="w-full max-w-[420px] aspect-[9/16] rounded-[42px] p-4 relative border-8 border-zinc-800 dark:border-[#1E293B] shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-700 bg-gradient-to-b from-[#0B1528] via-[#102A45] to-[#1D1B26]"
          style={wallpaperBase64 ? { backgroundImage: `url(${wallpaperBase64})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {/* Subtle dark backdrop to maintain text legibility on custom wallpapers */}
          {wallpaperBase64 && (
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
          )}

          {/* Phone Top Notch Speaker */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-3.5 bg-slate-800 rounded-full flex items-center justify-center z-10 px-4">
            <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ml-auto border border-slate-700"></div>
          </div>

          {/* Simulated Time and status symbols */}
          <div className="flex justify-between items-center px-4 pt-1 z-10 drop-shadow-md">
            <span className="text-[10px] font-bold text-white">09:41</span>
            <div className="flex gap-1 items-center text-[10px] font-bold text-white">
              <span>5G</span>
              <span>📶</span>
              <span>🔋 100%</span>
            </div>
          </div>

          {/* Widget preview region */}
          <div className="my-auto flex items-center justify-center p-3 w-full h-full z-10">
            {/* RENDER SELECTED WIDGET SIZE */}
            {selectedSize === 'small' && (
              <div className="w-32 h-32 rounded-[22px] bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EB] border border-orange-100 dark:border-brand-border p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-800 dark:text-brand-text-pri">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-extrabold text-orange-600 block uppercase font-serif tracking-normal leading-3">ॐ पंचक</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-[9px] font-bold text-slate-400 dark:text-brand-text-mut block leading-3">सक्रिय समय:</h3>
                  <span className="text-xs font-black text-slate-800 dark:text-brand-text-pri block mt-0.5 truncate leading-tight">{currMuhurat.name.split(' ')[0]}</span>
                  <span className="text-[9.5px] text-green-700 font-extrabold block leading-none mt-1">{currMuhurat.startTime} - {currMuhurat.endTime}</span>
                </div>
                <div className="border-t border-orange-100/70 dark:border-brand-border pt-1.5 flex justify-between items-center text-[8.5px] text-slate-500 dark:text-brand-text-sec font-medium">
                  <span>{activeTithi}</span>
                  <span className="text-orange-900 font-extrabold">📍 {city}</span>
                </div>
              </div>
            )}

            {selectedSize === 'medium' && (
              <div className="w-full max-w-[280px] h-32 rounded-[22px] bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EB] border border-orange-100 dark:border-brand-border p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-800 dark:text-brand-text-pri">
                {/* Decorative Marigold Background Ring */}
                <div className="absolute right-[-15px] top-[-15px] w-20 h-20 rounded-full bg-orange-100 dark:bg-brand-control/30 border-2 border-dashed border-orange-200 dark:border-brand-border pointer-events-none"></div>

                <div className="flex justify-between items-center border-b border-orange-100/70 dark:border-brand-border pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-orange-900 font-serif">ॐ आज का धर्मिक समय</span>
                  </div>
                  <span className="text-[8px] font-black text-orange-600 uppercase bg-orange-100 dark:bg-brand-control/60 px-1.5 py-0.5 rounded">
                    📍 {city}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-brand-text-mut block">आज की तिथि</span>
                    <span className="text-xs font-bold text-slate-850 block mt-0.5 leading-tight truncate">{panchang.hinduDate.tithi.hindiName.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-500 dark:text-brand-text-sec block">देवता: {panchang.hinduDate.tithi.lord}</span>
                  </div>
                  <div className="border-l border-orange-100 dark:border-brand-border pl-2">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-brand-text-mut block">सक्रिय चौघड़िया</span>
                    <span className="text-xs font-bold text-slate-850 block mt-0.5 leading-tight truncate">{currMuhurat.name.replace(' Choghadiya','')}</span>
                    <span className="text-[9px] font-extrabold text-[#27AE60] block">{currMuhurat.startTime} - {currMuhurat.endTime}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[8.5px] text-slate-500 dark:text-brand-text-sec border-t border-orange-100/40 dark:border-brand-border pt-1">
                  <span>नक्षत्र: {activeNakshatra.split(' ')[0]}</span>
                  <span className="text-orange-700 font-bold">अगला: अभिजीत</span>
                </div>
              </div>
            )}

            {selectedSize === 'large' && (
              <div className="w-full max-w-[280px] h-64 rounded-[28px] bg-gradient-to-b from-[#FFFDF8] to-[#FFF6EB] border border-orange-100 dark:border-brand-border p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-slate-800 dark:text-brand-text-pri">
                <div className="flex justify-between items-center border-b border-orange-100/70 dark:border-brand-border pb-1.5">
                  <span className="text-[11px] font-black text-orange-900 font-serif flex items-center gap-1">ॐ आज का पंचांग</span>
                  <span className="text-[8px] font-black text-white bg-orange-600 px-1.5 py-0.5 rounded-full">📍 {city}</span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 mt-1.5 my-auto">
                  <div className="p-1 rounded-xl bg-orange-500/5 dark:bg-brand-card border border-orange-100/50 dark:border-brand-border text-left">
                    <span className="text-[8.5px] font-bold text-slate-450 dark:text-brand-text-mut block">आज की तिथि</span>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-brand-text-pri truncate block leading-tight">{activeTithi}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-orange-500/5 dark:bg-brand-card border border-orange-100/50 dark:border-brand-border text-left">
                    <span className="text-[8.5px] font-bold text-slate-450 dark:text-brand-text-mut block">आज का नक्षत्र</span>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-brand-text-pri truncate block leading-tight">{activeNakshatra.split(' ')[0]}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-orange-500/5 dark:bg-brand-card border border-orange-100/50 dark:border-brand-border text-left">
                    <span className="text-[8.5px] font-bold text-slate-450 dark:text-brand-text-mut block">सक्रिय चौघड़िया</span>
                    <span className="text-[10px] font-bold text-slate-850 truncate block leading-tight">{currMuhurat?.name?.replace(' Choghadiya','') || 'अभिजीत'}</span>
                  </div>
                  <div className="p-1 rounded-xl bg-orange-500/5 dark:bg-brand-card border border-orange-100/50 dark:border-brand-border text-left">
                    <span className="text-[8.5px] font-bold text-slate-450 dark:text-brand-text-mut block">राहुकाल</span>
                    <span className="text-[9.5px] font-extrabold text-red-650 block leading-tight">{panchang.rahuKaal?.start || '—'} - {panchang.rahuKaal?.end || '—'}</span>
                  </div>
                </div>

                <div className="border-t border-orange-100/50 dark:border-brand-border pt-2 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-550 font-medium">ब्रह्म मुहूर्त:</span>
                    <span className="text-orange-900 font-extrabold">{muhurats.find(m => m.id === 'brahma')?.startTime || '04:30 AM'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-550 font-medium">अभिजीत मुहूर्त:</span>
                    <span className="text-[#27AE60] font-extrabold">{muhurats.find(m => m.id === 'abhijit')?.startTime || '11:45 AM'}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedSize === 'lockscreen' && (
              <div className="w-full max-w-[240px] p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg text-white text-center">
                <span className="text-[10px] font-black tracking-wide block uppercase text-amber-300">ॐ संवत्सर मुहूर्त</span>
                <span className="text-sm font-black block mt-1">{currMuhurat?.name?.replace(' Choghadiya','') || 'अभिजीत'}</span>
                <span className="text-[10px] font-bold block opacity-95 mt-0.5">{currMuhurat?.startTime || '11:45 AM'} से {currMuhurat?.endTime || '12:35 PM'} तक</span>
                <div className="border-t border-white/10 mt-2 pt-1.5 flex justify-around text-[9px] opacity-80 font-mono">
                  <span>तिथि: {activeTithi}</span>
                  <span>•</span>
                  <span>नक्षत्र: {activeNakshatra.split(' ')[0]}</span>
                </div>
              </div>
            )}

            {selectedSize === 'analog' && (
              <div className="w-52 h-52 rounded-[32px] bg-gradient-to-b from-[#1C1714] to-[#120E0C] border border-orange-950/40 p-1 flex justify-center items-center shadow-2xl relative overflow-hidden">
                <div className="w-[184px] h-[184px] flex items-center justify-center [&_svg]:overflow-visible">
                  <AnalogClock 
                    time={new Date()} 
                    choghadiyaList={panchang.choghadiya || []}
                    activeChoghadiyaIndex={-1}
                    activeHora={panchang.hora?.[0]}
                    horaList={panchang.hora || []}
                    sunriseTimeStr={panchang.sunrise || '06:00 AM'}
                    sunsetTimeStr={panchang.sunset || '06:00 PM'}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Simulated Lock Screen Time/Date representation when Lockscreen is selected */}
          {selectedSize === 'lockscreen' && (
            <div className="absolute top-12 left-0 right-0 text-center z-10 drop-shadow-lg text-white pointer-events-none">
              <span className="text-3xl font-light font-sans block leading-none">09:41</span>
              <span className="text-[9px] font-medium tracking-wide uppercase mt-1 block">Tuesday, July 14</span>
            </div>
          )}

          {/* Phone Bottom Home Swipe Bar */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full z-10"></div>
        </div>
      </div>
    </div>
  );
}
