import React, { useRef, useState } from 'react';
import {
  Download,
  Check,
  Sparkles,
  Send,
  Facebook,
  FileText,
  Camera
} from 'lucide-react';
import { PanchangInfo } from '../types';

interface PosterGeneratorProps {
  panchang: PanchangInfo;
  city: string;
}

export function PosterGenerator({ panchang, city }: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'saffron' | 'golden' | 'crimson'>('saffron');

  const formattedDate = new Date(panchang.date).toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tithiName = panchang.hinduDate.tithi.hindiName;
  const nakshatraName = panchang.hinduDate.nakshatra.name;
  const nakshatraHindi = panchang.hinduDate.nakshatra.hindiName;
  const hinduMonth = `${panchang.hinduDate.monthHindi} (${panchang.hinduDate.month})`;
  const samvat = `विक्रम संवत ${panchang.hinduDate.samvatVikram}`;

  const currentPaksha = panchang.hinduDate.paksha === 'Shukla' || (panchang.hinduDate.paksha as string) === 'शुक्ल' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

  // Pre-drawn canvas rendering for physical downloads
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = 600;
    canvas.height = 800;

    // Set theme colors
    let bgGradient = ctx.createLinearGradient(0, 0, 0, 800);
    if (selectedTheme === 'saffron') {
      bgGradient.addColorStop(0, '#FF8A00');
      bgGradient.addColorStop(0.5, '#FF6B00');
      bgGradient.addColorStop(1, '#9E2A00');
    } else if (selectedTheme === 'golden') {
      bgGradient.addColorStop(0, '#F5A623');
      bgGradient.addColorStop(0.5, '#D0021B');
      bgGradient.addColorStop(1, '#4A1204');
    } else {
      bgGradient.addColorStop(0, '#8B0000');
      bgGradient.addColorStop(0.6, '#4B0002');
      bgGradient.addColorStop(1, '#1E0001');
    }

    // BG Fill
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 800);

    // Decorative Sunburst / Auror
    ctx.fillStyle = 'rgba(255, 235, 150, 0.08)';
    ctx.beginPath();
    ctx.arc(300, 200, 250, 0, Math.PI * 2);
    ctx.fill();

    // Secondary lighter arc
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.arc(300, 160, 130, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Border Framing
    ctx.strokeStyle = '#F6C453';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 760);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, 544, 744);

    // Mandir Arch/Dome Outline
    ctx.strokeStyle = 'rgba(246, 196, 83, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 700);
    ctx.quadraticCurveTo(60, 150, 300, 120);
    ctx.quadraticCurveTo(540, 150, 540, 700);
    ctx.stroke();

    // App Branding Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ आज का धर्मिक समय ॥', 300, 60);

    ctx.fillStyle = '#F6C453';
    ctx.font = 'normal 13px "Inter", sans-serif';
    ctx.fillText('Universal Vedic Panchang Calendar', 300, 82);

    // Golden Kalash/Sun Icon representation
    ctx.fillStyle = '#F6C453';
    ctx.beginPath();
    ctx.arc(300, 135, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.arc(300, 135, 12, 0, Math.PI * 2);
    ctx.fill();

    // App Logo Banner Symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('ॐ', 300, 142);

    // Main Greetings
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText('सुप्रभातम्', 300, 195);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'normal 14px "Inter", sans-serif';
    ctx.fillText(`स्थान: ${city} | दिनांक: ${formattedDate}`, 300, 222);

    // Beautiful Separator line
    ctx.strokeStyle = 'rgba(246, 196, 83, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 240);
    ctx.lineTo(450, 240);
    ctx.stroke();

    // Tithi Box Frame
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(80, 265, 440, 95);
    ctx.strokeStyle = '#F6C453';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(80, 265, 440, 95);

    // Tithi Title & Detail
    ctx.fillStyle = '#F1C40F';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('आज की तिथि (TITHI)', 300, 295);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillText(tithiName, 300, 335);

    // Panchang stats labels and content
    const stats = [
      { label: 'पक्ष (Paksha)', val: currentPaksha },
      { label: 'मास (Month)', val: hinduMonth },
      { label: 'नक्षत्र (Nakshatra)', val: `${nakshatraHindi} (${nakshatraName})` },
      { label: 'संवत (Samvat)', val: samvat },
      { label: 'सूर्योदय (Sunrise)', val: panchang.sunrise },
      { label: 'सूर्यास्त (Sunset)', val: panchang.sunset }
    ];

    let startY = 395;
    stats.forEach((st, index) => {
      let xOffset = index % 2 === 0 ? 150 : 450;
      let yOffset = startY + Math.floor(index / 2) * 75;

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(index % 2 === 0 ? 60 : 310, yOffset - 15, 230, 60);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'normal 13px "Inter", sans-serif';
      ctx.fillText(st.label, xOffset, yOffset + 10);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px "Inter", sans-serif';
      ctx.fillText(st.val, xOffset, yOffset + 32);
    });

    // Auspicious time highlight
    ctx.fillStyle = 'rgba(39, 174, 96, 0.2)';
    ctx.fillRect(80, 630, 440, 50);
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 630, 440, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('शुभ समय:', 160, 660);
    
    ctx.fillStyle = '#2ECC71';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText(`अमृत काल मुहूर्त: ${panchang.choghadiya.find(e => e.type === 'Amrit')?.startTime ?? '11:45 AM'} to ${panchang.choghadiya.find(e => e.type === 'Amrit')?.endTime ?? '12:35 PM'}`, 330, 660);

    // Footer Branding Text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'italic 12px "Inter", sans-serif';
    ctx.fillText('Generated via Aaj Ka Dharmic Samay App', 300, 725);

    ctx.fillStyle = '#F6C453';
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('|| कर्म ही धर्म है ||', 300, 750);

    // Trigger Download
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Panchang_${city}_${panchang.date}.png`;
    link.href = dataURL;
    link.click();
  };

  // Social Sharing Links Simulation
  const handleShare = (channel: string) => {
    const textMsg = encodeURIComponent(
      `🚩 *आज का धर्मिक समय पंचांग* 🚩\n\n📌 *स्थान:* ${city}\n📅 *दिनांक:* ${formattedDate}\n✨ *तिथि:* ${tithiName}\n🌟 *नक्षत्र:* ${nakshatraHindi}\n🌙 *मास:* ${hinduMonth}\n🔱 *संवत:* ${samvat}\n🌅 *सूर्योदय:* ${panchang.sunrise}\n🌇 *सूर्यास्त:* ${panchang.sunset}\n\nसच्चे और सटीक समय की जानकारी के लिए "आज का धर्मिक समय" ऐप का उपयोग करें!`
    );

    let url = '';
    switch (channel) {
      case 'whatsapp':
        url = `https://wa.me/?text=${textMsg}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=https://dharmicsamay.example.com&text=${textMsg}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=https://dharmicsamay.example.com&quote=${textMsg}`;
        break;
      default:
        // Generic Clipboard copy
        navigator.clipboard.writeText(decodeURIComponent(textMsg));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Visual background gradients mapped for Preview Card
  const gradients = {
    saffron: 'from-[#FF8A00] via-[#FF6B00] to-[#9E2A00]',
    golden: 'from-[#F5A623] via-[#D0021B] to-[#4A1204]',
    crimson: 'from-[#8B0000] via-[#4B0002] to-[#1E0001]',
  };

  return (
    <div id="poster_generator_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2 font-serif">
            <Camera className="w-5 h-5 text-orange-600 animate-pulse" />
            दैनिक पंचांग पोस्टर मेकर
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            अपने मित्रों और परिवार के साथ व्हाट्सएप, फेसबुक और इंस्टाग्राम पर साझा करने के लिए सुंदर दैनिक पंचांग पोस्टर बनाएं।
          </p>
        </div>

        {/* Theme Selectors */}
        <div className="flex items-center gap-2 bg-orange-500/5 dark:bg-orange-950/20 p-1.5 rounded-xl border border-orange-100/30">
          <span className="text-[10px] font-bold text-orange-800 dark:text-orange-400 uppercase px-2">थीम:</span>
          <button
            onClick={() => setSelectedTheme('saffron')}
            className={`w-5 h-5 rounded-full bg-linear-to-tr from-amber-500 to-orange-600 border border-white dark:border-zinc-800 shadow-xs focus:ring-1 focus:ring-orange-500 cursor-pointer ${
              selectedTheme === 'saffron' ? 'scale-115 ring-2 ring-orange-500' : 'opacity-70'
            }`}
            title="Saffron Bhagwa"
          />
          <button
            onClick={() => setSelectedTheme('golden')}
            className={`w-5 h-5 rounded-full bg-linear-to-tr from-yellow-500 to-red-600 border border-white dark:border-zinc-800 shadow-xs focus:ring-1 focus:ring-orange-500 cursor-pointer ${
              selectedTheme === 'golden' ? 'scale-115 ring-2 ring-orange-500' : 'opacity-70'
            }`}
            title="Sindoor Gold"
          />
          <button
            onClick={() => setSelectedTheme('crimson')}
            className={`w-5 h-5 rounded-full bg-linear-to-tr from-red-800 to-stone-900 border border-white dark:border-zinc-800 shadow-xs focus:ring-1 focus:ring-orange-500 cursor-pointer ${
              selectedTheme === 'crimson' ? 'scale-115 ring-2 ring-orange-500' : 'opacity-70'
            }`}
            title="Mandir Crimson"
          />
        </div>
      </div>

      {/* Hidden Render Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Preview Panel (Left) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="spiritual_poster_id"
            className={`w-full max-w-sm aspect-[3/4] p-4 sm:p-5 rounded-3xl bg-linear-to-b ${gradients[selectedTheme]} text-white border-4 border-[#F6C453] relative overflow-hidden shadow-xl flex flex-col justify-between`}
          >
            {/* Visual Temple Dome Watermark inside card */}
            <div className="absolute inset-0 pointer-events-none flex justify-center opacity-10">
              <svg className="w-5/6 h-5/6 mt-12" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50,10 L85,45 L80,50 L75,48 L75,90 L25,90 L25,48 L20,50 L15,45 Z" />
                <circle cx="50" cy="10" r="3" />
                <line x1="50" y1="13" x2="50" y2="45" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            {/* Radiant glowing sun glow background */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Poster Header */}
            <div className="text-center z-10">
              <span className="text-[11px] font-bold tracking-widest text-[#F6C453] uppercase font-serif drop-shadow-sm block">
                ॥ आज का धर्मिक समय ॥
              </span>
              <span className="text-[9px] text-white/70 block mt-0.5 tracking-wider font-mono">
                Vedic Panchang Calendar
              </span>

              <div className="mt-2 mx-auto w-7 h-7 rounded-full bg-[#F6C453]/90 shadow-sm flex items-center justify-center border border-white/20">
                <span className="text-xs font-bold text-orange-900 drop-shadow-sm font-serif">ॐ</span>
              </div>
            </div>

            {/* Poster Body */}
            <div className="my-auto text-center z-10">
              <span className="text-xs sm:text-sm text-white/90 uppercase font-sans tracking-widest block font-medium">
                सुप्रभातम्
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#FCD34D] block mt-1 font-mono tracking-tight font-semibold bg-black/10 rounded-full px-2 py-0.5 max-w-[280px] mx-auto">
                📍 {city} | {formattedDate}
              </span>

              {/* Tithi Container */}
              <div className="mt-3.5 bg-white/10 rounded-2xl border border-[#F6C453]/40 p-3.5 shadow-sm backdrop-blur-xs">
                <span className="text-[9px] font-bold text-[#F1C40F] block tracking-wider uppercase font-mono">
                  आज की तिथि (TITHI)
                </span>
                <span className="text-lg sm:text-xl font-bold block mt-0.5 drop-shadow-md text-amber-50">
                  {tithiName}
                </span>
              </div>

              {/* Grid with Details */}
              <div className="grid grid-cols-2 gap-1.5 mt-3 text-left">
                <div className="bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-white/60 block">पक्ष (Paksha)</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-50">{currentPaksha}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-white/60 block">मास (Month)</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-50 truncate block">{hinduMonth}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-xl border border-white/5 col-span-2">
                  <span className="text-[9px] text-white/60 block">नक्षत्र (Nakshatra)</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-50 truncate block">{nakshatraHindi} ({nakshatraName})</span>
                </div>
              </div>
            </div>

            {/* Poster Footer */}
            <div className="border-t border-white/10 pt-2 text-center mt-2.5 z-10">
              <span className="text-[8px] text-white/40 block italic font-mono">
                Generated via Aaj Ka Dharmic Samay App
              </span>
              <span className="text-[10px] text-[#F39C12] font-semibold mt-0.5 block tracking-wider uppercase">
                ॥ कर्म ही धर्म है ॥
              </span>
            </div>
          </div>
        </div>

        {/* Download & Social Handles Panel (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-amber-500 uppercase tracking-wider font-mono">पोस्टर डाउनलोड विकल्प</h3>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              हाई-रेज़ोल्यूशन पोस्टर डाउनलोड करें
            </button>

            {/* Copy Clipboard Option */}
            <button
              onClick={() => handleShare('copy')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-500/5 dark:bg-zinc-950/20 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 transition-all cursor-pointer text-xs sm:text-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  पंचांग कॉपी हो गया!
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  लिखित पंचांग कॉपी करें
                </>
              )}
            </button>
          </div>

          {/* Social Channels List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-amber-500 uppercase tracking-wider font-mono">सोशल मीडिया पर साझा करें</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-550/20 text-emerald-700 dark:text-emerald-450 rounded-xl font-bold transition-all cursor-pointer text-2xs"
              >
                <span className="font-extrabold text-[#25D366]">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-550/20 text-sky-700 dark:text-sky-450 rounded-xl font-bold transition-all cursor-pointer text-2xs"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Telegram</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-550/20 text-blue-700 dark:text-blue-450 rounded-xl font-bold transition-all cursor-pointer text-2xs"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-500" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-550/20 text-pink-700 dark:text-pink-450 rounded-xl font-bold transition-all cursor-pointer text-2xs"
              >
                <span className="font-extrabold text-[#E1306C]">Instagram</span>
              </button>
            </div>
            
            <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-3 mt-3">
              <div className="flex gap-2 text-left">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-950 dark:text-amber-200 leading-relaxed font-sans">
                  <strong>वैदिक संदेश:</strong> प्रातःकाल अपने मित्रों और परिवार के साथ शुभ तिथि व पंचांग साझा करने से दिन सकारात्मक और शुभ बनता है।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
