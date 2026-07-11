import React from 'react';
import {
  Compass,
  MapPin,
  Sun,
  Clock,
  RotateCw
} from 'lucide-react';
import { PanchangInfo } from '../types';

interface LiveLagnaProps {
  panchang: PanchangInfo;
  currentTime: Date;
}

interface LagnaSign {
  id: number; // 1 = Aries, 12 = Pisces
  name: string;
  hindiName: string;
  ruler: string;
  rulerHindi: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  elementHindi: string;
  color: string;
}

const RASHIS: LagnaSign[] = [
  { id: 1, name: 'Aries', hindiName: 'मेष (Mesh)', ruler: 'Mars', rulerHindi: 'मंगल', element: 'Fire', elementHindi: 'अग्नि', color: 'border-rose-500/30 text-rose-600 bg-rose-500/5 dark:bg-rose-950/15' },
  { id: 2, name: 'Taurus', hindiName: 'वृषभ (Vrishabh)', ruler: 'Venus', rulerHindi: 'शुक्र', element: 'Earth', elementHindi: 'पृथ्वी', color: 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5 dark:bg-emerald-950/15' },
  { id: 3, name: 'Gemini', hindiName: 'मिथुन (Mithun)', ruler: 'Mercury', rulerHindi: 'बुध', element: 'Air', elementHindi: 'वायु', color: 'border-sky-505/30 text-sky-600 bg-sky-500/5 dark:bg-sky-950/15' },
  { id: 4, name: 'Cancer', hindiName: 'कर्क (Kark)', ruler: 'Moon', rulerHindi: 'चंद्र', element: 'Water', elementHindi: 'जल', color: 'border-blue-500/30 text-blue-600 bg-blue-500/5 dark:bg-blue-950/15' },
  { id: 5, name: 'Leo', hindiName: 'सिंह (Singh)', ruler: 'Sun', rulerHindi: 'सूर्य', element: 'Fire', elementHindi: 'अग्नि', color: 'border-amber-500/30 text-amber-600 bg-amber-500/5 dark:bg-amber-950/15' },
  { id: 6, name: 'Virgo', hindiName: 'कन्या (Kanya)', ruler: 'Mercury', rulerHindi: 'बुध', element: 'Earth', elementHindi: 'पृथ्वी', color: 'border-teal-500/30 text-teal-600 bg-teal-500/5 dark:bg-teal-950/15' },
  { id: 7, name: 'Libra', hindiName: 'तुला (Tula)', ruler: 'Venus', rulerHindi: 'शुक्र', element: 'Air', elementHindi: 'वायु', color: 'border-pink-500/30 text-pink-600 bg-pink-500/5 dark:bg-pink-950/15' },
  { id: 8, name: 'Scorpio', hindiName: 'वृश्चिक (Vrishchik)', ruler: 'Mars', rulerHindi: 'मंगल', element: 'Water', elementHindi: 'जल', color: 'border-rose-600/30 text-rose-700 bg-rose-600/5 dark:bg-rose-950/15' },
  { id: 9, name: 'Sagittarius', hindiName: 'धनु (Dhanu)', ruler: 'Jupiter', rulerHindi: 'गुरु', element: 'Fire', elementHindi: 'अग्नि', color: 'border-orange-505/30 text-orange-600 bg-orange-500/5 dark:bg-orange-950/15' },
  { id: 10, name: 'Capricorn', hindiName: 'मकर (Makar)', ruler: 'Saturn', rulerHindi: 'शनि', element: 'Earth', elementHindi: 'पृथ्वी', color: 'border-slate-500/30 text-slate-600 bg-slate-500/5 dark:bg-zinc-900/30' },
  { id: 11, name: 'Aquarius', hindiName: 'कुंभ (Kumbh)', ruler: 'Saturn', rulerHindi: 'शनि', element: 'Air', elementHindi: 'वायु', color: 'border-indigo-500/30 text-indigo-650 bg-indigo-500/5 dark:bg-indigo-950/15' },
  { id: 12, name: 'Pisces', hindiName: 'मीन (Meen)', ruler: 'Jupiter', rulerHindi: 'गुरु', element: 'Water', elementHindi: 'जल', color: 'border-purple-500/30 text-purple-600 bg-purple-500/5 dark:bg-purple-950/15' }
];

export function LiveLagna({ panchang, currentTime }: LiveLagnaProps) {
  
  // Calculate Sun Zodiac based on month / day
  const getSunZodiacSign = (dateStr: string): number => {
    const d = new Date(dateStr);
    const m = d.getMonth() + 1; // 1-12
    const day = d.getDate();

    // Vedic Transit Dates (approx Nirayana dates)
    if ((m === 4 && day >= 13) || (m === 5 && day <= 13)) return 1;  // Mesh (Aries)
    if ((m === 5 && day >= 14) || (m === 6 && day <= 14)) return 2;  // Vrish (Taurus)
    if ((m === 6 && day >= 15) || (m === 7 && day <= 15)) return 3;  // Mithun (Gemini)
    if ((m === 7 && day >= 16) || (m === 8 && day <= 16)) return 4;  // Kark (Cancer)
    if ((m === 8 && day >= 17) || (m === 9 && day <= 16)) return 5;  // Simha (Leo)
    if ((m === 9 && day >= 17) || (m === 10 && day <= 16)) return 6; // Kanya (Virgo)
    if ((m === 10 && day >= 17) || (m === 11 && day <= 15)) return 7; // Tula (Libra)
    if ((m === 11 && day >= 16) || (m === 12 && day <= 15)) return 8; // Vrishchik (Scorpio)
    if ((m === 12 && day >= 16) || (m === 1 && day <= 13)) return 9;  // Dhanu (Sagittarius)
    if ((m === 1 && day >= 14) || (m === 2 && day <= 12)) return 10; // Makar (Capricorn)
    if ((m === 2 && day >= 13) || (m === 3 && day <= 13)) return 11; // Kumbha (Aquarius)
    return 12; // Meen (Pisces)
  };

  const sunRashiIdx = getSunZodiacSign(panchang.date) - 1; // 0-11 index

  // Calculate current minutes from midnight
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Helper to convert "HH:MM AM/PM" to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      const [time, ampm] = timeStr.split(' ');
      if (!time || !ampm) return 360; // 6:00 AM fallback
      let [hrs, mins] = time.split(':').map(Number);
      if (ampm === 'PM' && hrs !== 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    } catch {
      return 360;
    }
  };

  const sunriseMin = parseTimeToMinutes(panchang.sunrise);

  // Calculate Lagna idx
  // Lagna changes roughly every 120 minutes. At Sunrise, Lagna = Sun Rashi.
  const calculateLagnaIndex = (): number => {
    let diff = currentMinutes - sunriseMin;
    if (diff < 0) {
      diff += 1440; // wrap around for pre-sunrise period
    }
    const rashiShift = Math.floor(diff / 120);
    return (sunRashiIdx + rashiShift) % 12;
  };

  const lagnaIdx = calculateLagnaIndex();
  const currentLagna = RASHIS[lagnaIdx];

  // Vedic houses numbering for North Indian Kundali style (House 1 is the top middle diamond)
  // Let's calculate the rashi number (1 to 12) for each house. House 1 starts with the Lagna rashi, House 2 next anticlockwise
  const getHouseRashi = (houseNum: number): number => {
    // houseNum is 1-indexed (1 to 12)
    // House 1 = Lagna, House 2 = (Lagna + 1)...
    return ((lagnaIdx + houseNum - 1) % 12) + 1;
  };

  return (
    <div id="live_lagna_root" className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* Dynamic Summary Panel */}
      <div className="relative overflow-hidden rounded-3xl p-5 border border-orange-200/50 dark:border-orange-950/40 bg-linear-to-br from-orange-500/8 to-amber-500/5 dark:from-orange-950/20 dark:to-stone-900/40 shadow-sm">
        
        {/* Decorative Compass Lines */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 opacity-10 dark:opacity-[0.14] pointer-events-none scale-90">
          <Compass className="w-48 h-48 animate-spin" style={{ animationDuration: '40s' }} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-rose-600 dark:text-amber-500 uppercase tracking-widest font-mono">
                लाइव लग्न कुंडली (Live Real-Time Ascendant Chart)
              </span>
            </div>
            <h2 className="text-2xl font-serif text-slate-800 dark:text-orange-50 font-black leading-tight flex items-center gap-2">
              {currentLagna.hindiName} लग्न उदित है
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500 text-white shadow-3xs uppercase tracking-wider">
                तत्व: {currentLagna.elementHindi}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-550 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 
              पूर्वी क्षितिज पर उदित राशि | स्वामी ग्रह: {currentLagna.rulerHindi} ({currentLagna.ruler})
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/50 dark:bg-stone-950/70 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-2xs font-extrabold text-slate-600 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>अक्षांश-रेखांश काल चक्र</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-650 dark:text-zinc-400 font-sans leading-relaxed border-t border-slate-200/50 dark:border-zinc-800/60 pt-3.5">
          <strong>शास्त्रानुसार महत्व:</strong> लग्न उदित चक्र दर्शाता है कि अभी इस समय पृथ्वी पर कौन सी राशि का उदय हो रहा है। यह निरंतर बदलता है (२४ घंटे में १२ राशियां)। शुभ लग्न में किए गए व्यापारिक निर्णय, यात्रा और कर्म अत्यंत कल्याणकारी और सिद्धि-प्रदान करने वाले होते हैं। <strong>{currentLagna.rulerHindi}</strong> का प्रभाव इस समय सर्वोच्च है।
        </p>
      </div>

      {/* Main interactive display - Kundali visualizer & Astrological analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Rising Kundali Chart representation */}
        <div className="bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 p-5 rounded-3xl shadow-3xs text-center flex flex-col justify-between items-center min-h-[350px]">
          
          <div className="w-full text-left pb-2 mb-2 border-b border-orange-100/35">
            <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-orange-600 block">॥ लाइव लग्न कुंडली ॥</span>
            <h4 className="text-sm font-serif font-black text-slate-800 dark:text-orange-50">उदित भाव मानचित्र</h4>
          </div>

          {/* North Indian style Kundali SVG container box */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 my-2 select-none">
            <svg viewBox="0 0 200 200" className="w-full h-full stroke-orange-350 dark:stroke-amber-600/70 fill-none stroke-2">
              {/* Outer Square */}
              <rect x="10" y="10" width="180" height="180" />
              
              {/* Large Diagonals */}
              <line x1="10" y1="10" x2="190" y2="190" />
              <line x1="190" y1="10" x2="10" y2="190" />
              
              {/* Internal Diamonds */}
              <line x1="100" y1="10" x2="10" y2="100" />
              <line x1="10" y1="100" x2="100" y2="190" />
              <line x1="100" y1="190" x2="190" y2="100" />
              <line x1="190" y1="100" x2="100" y2="1" />

              {/* Redraw outer boundary override to cover crop anomalies */}
              <rect x="10" y="10" width="180" height="180" />

              {/* H1 rashi text (Top middle diamond) */}
              <text x="100" y="68" className="text-[12px] font-black fill-rose-650 dark:fill-amber-500 font-mono text-center" textAnchor="middle">{getHouseRashi(1)}</text>
              <text x="100" y="52" className="text-[8px] font-black fill-slate-400 dark:fill-stone-500 uppercase tracking-widest text-center" textAnchor="middle">Lagna</text>

              {/* H4 rashi text (Left diamond) */}
              <text x="50" y="105" className="text-[11px] font-bold fill-slate-700 dark:fill-stone-350 font-mono text-center" textAnchor="middle">{getHouseRashi(4)}</text>
              
              {/* H7 rashi text (Bottom diamond) */}
              <text x="100" y="145" className="text-[11px] font-bold fill-slate-705 dark:fill-stone-350 font-mono text-center" textAnchor="middle">{getHouseRashi(7)}</text>
              
              {/* H10 rashi text (Right diamond) */}
              <text x="150" y="105" className="text-[11px] font-bold fill-slate-705 dark:fill-stone-350 font-mono text-center" textAnchor="middle">{getHouseRashi(10)}</text>

              {/* Corner houses */}
              {/* H2 */}
              <text x="60" y="40" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(2)}</text>
              {/* H3 */}
              <text x="40" y="60" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(3)}</text>
              {/* H5 */}
              <text x="40" y="145" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(5)}</text>
              {/* H6 */}
              <text x="60" y="165" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(6)}</text>
              {/* H8 */}
              <text x="140" y="165" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(8)}</text>
              {/* H9 */}
              <text x="160" y="145" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(9)}</text>
              {/* H11 */}
              <text x="160" y="60" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(11)}</text>
              {/* H12 */}
              <text x="140" y="40" className="text-[10px] font-bold fill-slate-500 dark:fill-stone-400 font-mono text-center" textAnchor="middle">{getHouseRashi(12)}</text>
            </svg>
          </div>

          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-mono mt-2">
            *संख्याएँ राशियों के क्रम को दर्शाती हैं (Mesh=1, Vrish=2...)
          </span>
        </div>

        {/* Dynamic astrological details list */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="bg-orange-50/20 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-950/30 p-4 rounded-2xl">
            <h3 className="font-serif font-black text-slate-800 dark:text-amber-100 text-sm mb-3 flex items-center gap-1.5">
              <Sun className="w-5 h-5 text-amber-550 shrink-0" />
              सूर्य राशि संक्रमण (Sun's Location)
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              वर्तमान में इस तिथि पर सूर्य देव <strong>{RASHIS[sunRashiIdx].hindiName}</strong> राशि में गोचर कर रहे हैं। इसी कारण प्रतिदिन सूर्योदय के समय यही राशि लग्न भाव में उदित होती है।
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-widest font-mono block">
              उदित लग्न के ज्योतिष प्रभाव:
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white dark:bg-zinc-950/15 border border-slate-100 dark:border-zinc-900 rounded-xl">
                <span className="text-[10px] font-black text-slate-450 uppercase font-mono block">तत्व स्वभाव (Element):</span>
                <span className="text-xs font-serif font-black text-[#FF9933] dark:text-amber-400 block mt-0.5">
                  {currentLagna.element} ({currentLagna.elementHindi})
                </span>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-tight mt-1">
                  {currentLagna.element === 'Fire' && 'उत्साह, ऊर्जा व पराक्रम से युक्त कार्य सफल होंगे।'}
                  {currentLagna.element === 'Earth' && 'स्थिर कार्य, भूमि, निवेश व भौतिक संपदा हितैषी है।'}
                  {currentLagna.element === 'Air' && 'संचार, बौद्धिक चर्चा, लेखन व संवाद अनुकूल हैं।'}
                  {currentLagna.element === 'Water' && 'कला, साहित्य, संगीत व भावना पूर्ण कार्य शुभ हैं।'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-950/15 border border-slate-100 dark:border-zinc-900 rounded-xl">
                <span className="text-[10px] font-black text-slate-450 uppercase font-mono block">स्वामी ग्रह (Ruling Planet):</span>
                <span className="text-xs font-serif font-black text-[#FF9933] dark:text-amber-400 block mt-0.5">
                  {currentLagna.rulerHindi} ({currentLagna.ruler})
                </span>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-tight mt-1">
                  इस समय उदित अधिपति <strong>{currentLagna.rulerHindi}</strong> हैं। उनकी प्रसन्नता हेतु प्रार्थना लाभकारी है।
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/75 dark:bg-zinc-900/35 border border-slate-150/45 dark:border-zinc-805/45 rounded-xl text-3xs font-black uppercase text-slate-400 dark:text-zinc-550 font-mono tracking-widest flex items-center justify-between">
            <span>२४ घंटे का पूर्ण २-घंटे लग्न चक्र उदित सुगम संकेत</span>
            <RotateCw className="w-3.5 h-3.5 text-orange-500 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

      </div>

    </div>
  );
}
