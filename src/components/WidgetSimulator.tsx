import React, { useState, useEffect } from 'react';
import { Layout, Sparkles, AlertCircle, Info, Smartphone } from 'lucide-react';
import { PanchangInfo, MuhuratItem } from '../types';
import { getDishaShoolForDay } from '../utils/alarmUtils';

interface WidgetSimulatorProps {
  panchang: PanchangInfo;
  muhurats: MuhuratItem[];
  city: string;
  language?: 'English' | 'Hindi';
}

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [time, ampm] = timeStr.split(' ');
  if (!time || !ampm) return 0;
  let [hrs, mins] = time.split(':').map(Number);
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const getChoghadiyaAdvice = (name: string): string => {
  if (!name) return 'ईश्वर स्मरण व दैनिक कार्य';
  const n = name.trim();
  if (n.includes('अमृत')) return 'साधना, पूजा व शुभ कार्य हेतु सर्वोत्तम';
  if (n.includes('लाभ')) return 'व्यापार, नए सौदे व निवेश हेतु उत्तम';
  if (n.includes('शुभ')) return 'मांगलिक कार्य, मिलन व यात्रा हेतु शुभ';
  if (n.includes('चल') || n.includes('चर')) return 'यात्रा, आवागमन व सामान्य कार्य अनुकूल';
  if (n.includes('रोग')) return 'नया कार्य टालें, स्वास्थ्य का ध्यान रखें';
  if (n.includes('काल')) return 'धन हानि का भय, नए सौदे स्थगित रखें';
  if (n.includes('उद्वेग')) return 'तनाव व विवाद से बचें, शांति बनाए रखें';
  return 'ईश्वर स्मरण व दैनिक कार्य';
};

export function WidgetSimulator({ panchang, muhurats, city, language = 'Hindi' }: WidgetSimulatorProps) {
  const isHindi = language === 'Hindi';
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'lockscreen'>('medium');
  const [wallpaperBase64, setWallpaperBase64] = useState<string>('');

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

  if (!panchang || !panchang.hinduDate) {
    return (
      <div className="flex justify-center p-8 text-slate-400 font-bold bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl">
        {isHindi ? "विजेट्स लोड हो रहे हैं..." : "Loading widgets..."}
      </div>
    );
  }

  // Calculate live values
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find active Choghadiya
  let activeChog = panchang.choghadiya?.find((c) => {
    const s = parseTimeToMinutes(c.startTime);
    const e = parseTimeToMinutes(c.endTime);
    if (s <= e) {
      return currentMinutes >= s && currentMinutes < e;
    } else {
      return currentMinutes >= s || currentMinutes < e;
    }
  }) || (panchang.choghadiya && panchang.choghadiya.length > 0 ? panchang.choghadiya[0] : null);

  let choghadiyaType: 'shubh' | 'madhyam' | 'ashubh' = 'shubh';
  let remainingMin = 35;

  if (activeChog) {
    const q = (activeChog.quality || '').toLowerCase();
    const t = (activeChog.type || '').toLowerCase();
    if (q === 'excellent' || q === 'good' || t === 'shubh' || t === 'amrit' || t === 'labh') {
      choghadiyaType = 'shubh';
    } else if (q === 'inauspicious' || q === 'bad' || t === 'kaal' || t === 'rog' || t === 'udveg') {
      choghadiyaType = 'ashubh';
    } else {
      choghadiyaType = 'madhyam';
    }

    const endMin = parseTimeToMinutes(activeChog.endTime);
    remainingMin = endMin >= currentMinutes ? (endMin - currentMinutes) : (endMin + 1440 - currentMinutes);
  }

  const chogName = activeChog ? (activeChog.hindiName || activeChog.name) : 'लाभ';
  const chogTime = activeChog ? `${activeChog.startTime} - ${activeChog.endTime}` : '12:05 AM - 01:40 AM';
  const advice = getChoghadiyaAdvice(chogName);

  // Colors & badges
  let dot = '🟢';
  let badgeColor = 'text-[#4ADE80]';
  let qualityText = 'शुभ समय';
  let qualityShort = 'शुभ';

  if (choghadiyaType === 'ashubh') {
    dot = '🔴';
    badgeColor = 'text-[#F87171]';
    qualityText = 'अशुभ समय';
    qualityShort = 'अशुभ';
  } else if (choghadiyaType === 'madhyam') {
    dot = '🟡';
    badgeColor = 'text-[#FACC15]';
    qualityText = 'मध्यम समय';
    qualityShort = 'मध्यम';
  }

  // Tithi & Nakshatra
  const activeTithi = panchang.hinduDate.tithi?.hindiName
    ? panchang.hinduDate.tithi.hindiName.split('(')[0].trim()
    : (panchang.hinduDate.tithi?.name || 'शुक्ल एकादशी');

  const activeNakshatra = panchang.hinduDate.nakshatra?.hindiName
    ? panchang.hinduDate.nakshatra.hindiName.split('(')[0].trim()
    : (panchang.hinduDate.nakshatra?.name || 'शतभिषा');

  // Muhurats: Abhijit & Rahu Kaal
  const abhijit = (muhurats && muhurats.length > 0)
    ? (muhurats.find(m => m?.id === 'abhijit') || null)
    : null;
  const abhijitStr = abhijit ? `${abhijit.startTime} - ${abhijit.endTime}` : '11:42 AM - 12:27 PM';
  const rahuKaalStr = panchang.rahuKaal ? `${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}` : '01:30 PM - 02:55 PM';

  // Disha Shool
  const dishaRaw = getDishaShoolForDay(now.getDay());
  const dishaStr = dishaRaw.includes('(') ? dishaRaw.split('(')[0].trim() : dishaRaw;

  // Date formatted
  const monthNamesHindi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्तूबर', 'नवंबर', 'दिसंबर'];
  const formattedToday = `${now.getDate()} ${monthNamesHindi[now.getMonth()].slice(0, 4)}`;

  return (
    <div id="widget_simulator_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2 font-serif">
            <Layout className="w-5 h-5 text-orange-600" />
            {isHindi ? "होम स्क्रीन विजेट प्रीव्यू (Android Native Widgets)" : "Home Screen Native Widget Preview"}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            {isHindi 
              ? "आपके फोन की होम स्क्रीन पर दिखने वाले असली 2x2 व 4x2 वैदिक विजेट्स का लाइव दृश्य।" 
              : "Live visual mirror of the real 2x2 and 4x2 Vedic widgets on your phone's home screen."}
          </p>
        </div>
      </div>

      {/* Size Selector Switcher */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mb-5 text-[11px] font-bold">
        {[
          { id: 'small', label: isHindi ? 'छोटा विजेट (२x२)' : 'Small (2x2)' },
          { id: 'medium', label: isHindi ? 'मध्यम विजेट (४x२)' : 'Medium (4x2)' },
          { id: 'lockscreen', label: isHindi ? 'लॉक स्क्रीन' : 'Lock Screen' }
        ].map((size, index, arr) => (
          <React.Fragment key={size.id}>
            <button
              type="button"
              onClick={() => setSelectedSize(size.id as any)}
              className={`cursor-pointer transition-all hover:underline ${
                selectedSize === size.id
                  ? 'text-orange-600 font-extrabold dark:text-amber-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {size.label}
            </button>
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

          {/* Widget Preview Region */}
          <div className="my-auto flex items-center justify-center p-3 w-full h-full z-10">
            
            {/* 1. SMALL 2x2 WIDGET (100% Native Mirror of widget_small.xml) */}
            {selectedSize === 'small' && (
              <div 
                className="w-36 h-36 rounded-[18px] bg-[#1C1714] border border-[#FF9933]/30 p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none"
                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.85)' }}
              >
                {/* Header: Title & City */}
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[10px] font-bold text-[#FF9933] font-serif tracking-tight">
                    ॐ सनातन घड़ी
                  </span>
                  <span className="text-[8.5px] text-slate-300 font-medium">
                    📍 {city || 'सनातन'}
                  </span>
                </div>

                {/* Hairline Divider */}
                <div className="w-full h-[0.5px] bg-[#FF9933]/25 my-0.5"></div>

                {/* Live Choghadiya Center */}
                <div className="flex flex-col gap-0.5 my-auto">
                  <div className={`text-[12px] font-black truncate leading-tight ${badgeColor}`}>
                    {dot} {chogName} चौघड़िया
                  </div>
                  <div className="text-[9.5px] text-[#E0E0E0] font-mono leading-tight">
                    {chogTime}
                  </div>
                  <div className="text-[9.5px] font-extrabold text-[#FACC15] leading-tight">
                    ⏳ {remainingMin} मिनट शेष ({qualityShort})
                  </div>
                </div>

                {/* Bottom Hairline Divider */}
                <div className="w-full h-[0.5px] bg-[#FF9933]/20 my-0.5"></div>

                {/* Footer: Tithi & Nakshatra */}
                <div className="text-[8.5px] text-[#BDBDBD] truncate font-medium">
                  📅 {activeTithi} • {activeNakshatra}
                </div>
              </div>
            )}

            {/* 2. MEDIUM 4x2 WIDGET (100% Native Mirror of widget_layout.xml) */}
            {selectedSize === 'medium' && (
              <div 
                className="w-full max-w-[320px] rounded-[18px] bg-[#1C1714] border border-[#FF9933]/30 p-3 shadow-2xl flex flex-col justify-between select-none"
                style={{ boxShadow: '0 10px 35px rgba(0,0,0,0.85)' }}
              >
                {/* Header Row: Title & City/Date */}
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[11px] font-bold text-[#FF9933] font-serif">
                    ॐ सनातन घड़ी पंचांग
                  </span>
                  <span className="text-[9px] text-slate-300 font-medium">
                    📍 {city || 'सनातन'} • {formattedToday}
                  </span>
                </div>

                {/* Divider Line */}
                <div className="w-full h-[0.5px] bg-[#FF9933]/25 my-1"></div>

                {/* 2-Column Balanced Body */}
                <div className="grid grid-cols-2 gap-2 my-1">
                  
                  {/* Left Column: Live Choghadiya Status & Advice */}
                  <div className="rounded-[10px] bg-[#241E1A] border border-[#FF9933]/15 p-2 flex flex-col justify-between">
                    <div>
                      <div className={`text-[10px] font-black truncate leading-tight ${badgeColor}`}>
                        {dot} अभी: {chogName} ({qualityShort})
                      </div>
                      <div className="text-[9px] text-[#E0E0E0] font-mono leading-tight mt-0.5">
                        {chogTime}
                      </div>
                      <div className="text-[9px] font-bold text-[#FACC15] leading-tight mt-1">
                        ⏳ {remainingMin} मिनट शेष
                      </div>
                    </div>
                    <div className="text-[8px] text-[#FFE082] leading-tight mt-1.5 truncate border-t border-[#FF9933]/10 pt-1">
                      💡 {advice}
                    </div>
                  </div>

                  {/* Right Column: 4 Vedic Pillars */}
                  <div className="rounded-[10px] bg-[#241E1A] border border-[#FF9933]/15 p-2 flex flex-col justify-between">
                    <div className="text-[9.5px] font-bold text-white truncate leading-tight">
                      📿 तिथि: {activeTithi}
                    </div>
                    <div className="text-[8.5px] text-[#81C784] font-medium truncate leading-tight mt-0.5">
                      ✨ अभिजीत: {abhijitStr}
                    </div>
                    <div className="text-[8.5px] text-[#FF8A80] font-medium truncate leading-tight mt-0.5">
                      ⚠️ राहुकाल: {rahuKaalStr}
                    </div>
                    <div className="text-[8px] text-[#E0E0E0] truncate leading-tight mt-1 border-t border-[#FF9933]/10 pt-1">
                      🚫 दिशा शूल: {dishaStr}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3. LOCK SCREEN WIDGET */}
            {selectedSize === 'lockscreen' && (
              <div className="w-full max-w-[240px] p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg text-white text-center select-none">
                <span className="text-[10px] font-black tracking-wide block uppercase text-amber-300 font-serif">
                  ॐ सनातन संवत्सर मुहूर्त
                </span>
                <span className="text-sm font-black block mt-1">
                  {dot} {chogName} चौघड़िया ({qualityShort})
                </span>
                <span className="text-[10px] font-bold block opacity-95 mt-0.5 font-mono">
                  {chogTime} • ⏳ {remainingMin} मि. शेष
                </span>
                <div className="border-t border-white/15 mt-2 pt-1.5 flex justify-around text-[9px] opacity-90">
                  <span>तिथि: {activeTithi}</span>
                  <span>•</span>
                  <span>अभिजीत: {abhijitStr.split('-')[0].trim()}</span>
                </div>
              </div>
            )}

          </div>

          {/* Simulated Lock Screen Time/Date representation when Lockscreen is selected */}
          {selectedSize === 'lockscreen' && (
            <div className="absolute top-12 left-0 right-0 text-center z-10 drop-shadow-lg text-white pointer-events-none">
              <span className="text-3xl font-light font-sans block leading-none">09:41</span>
              <span className="text-[9px] font-medium tracking-wide uppercase mt-1 block">
                {now.toLocaleDateString('hi-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}

          {/* Phone Bottom Home Swipe Bar */}
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full z-10"></div>
        </div>
      </div>

      {/* Step-by-Step Android Home Screen Setup Instructions (Pure Hindi) */}
      <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-left">
        <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-orange-600 dark:text-amber-400" />
          {isHindi ? "फोन की होम स्क्रीन पर विजेट कैसे लगाएं?" : "How to add this widget to your Android Home Screen?"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11.5px] text-slate-700 dark:text-slate-300 mt-2">
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-amber-200/50 dark:border-zinc-800">
            <span className="font-bold text-orange-600 dark:text-amber-400 mr-1.5">१.</span>
            <strong>दबाकर रखें:</strong> फोन की होम स्क्रीन पर खाली जगह पर २ सेकंड तक उंगली दबाए रखें (Long Press)।
          </div>
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-amber-200/50 dark:border-zinc-800">
            <span className="font-bold text-orange-600 dark:text-amber-400 mr-1.5">२.</span>
            <strong>विजेट्स चुनें:</strong> नीचे स्क्रीन पर आए <strong>'Widgets' (विजेट्स)</strong> विकल्प पर टैप करें।
          </div>
          <div className="p-2.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-amber-200/50 dark:border-zinc-800">
            <span className="font-bold text-orange-600 dark:text-amber-400 mr-1.5">३.</span>
            <strong>सनातन घड़ी जोड़ें:</strong> सूची में <strong>'सनातन घड़ी'</strong> खोजें और २x२ या ४x२ विजेट को होम स्क्रीन पर खींचें।
          </div>
        </div>
      </div>
    </div>
  );
}
