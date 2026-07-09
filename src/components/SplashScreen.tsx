import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, RefreshCw } from 'lucide-react';
import { SacredLogoIcon } from './LogoSelector';

export type SplashStyle = 'saffron' | 'golden' | 'crimson' | 'sanatan-video';

interface SplashScreenProps {
  onComplete?: () => void;
  selectedStyle?: SplashStyle;
  isDemoMode?: boolean;
  customSplash?: string;
}

export function SplashScreen({ onComplete, selectedStyle = 'saffron', isDemoMode = false, customSplash }: SplashScreenProps) {
  const [style, setStyle] = useState<SplashStyle>(selectedStyle);
  const [dots, setDots] = useState<Array<{ id: number; left: number; top: number; delay: number; duration: number }>>([]);
  const [key, setKey] = useState(0); // To force replay of animations
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const isVideoSplash = customSplash && (
    customSplash.startsWith('data:video/') || 
    customSplash.endsWith('.mp4') || 
    customSplash.includes('video/mp4') ||
    customSplash.startsWith('blob:video/')
  );

  // Re-sync if prop style changes in parent
  useEffect(() => {
    setStyle(selectedStyle);
  }, [selectedStyle]);

  // Force autoplay for background video when selected
  useEffect(() => {
    if (style === 'sanatan-video' && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => {
        console.warn("Muted video autoplay blocked: ", err);
      });
    }
  }, [style, key]);

  // Generate randomized sparkling dots for the background
  useEffect(() => {
    const list = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
    }));
    setDots(list);
  }, [style, key]);

  // Store onComplete in a ref to avoid resetting the timer if parent component re-renders (e.g. on clock tick)
  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Handle auto-timeout for non-demo mode
  useEffect(() => {
    if (isDemoMode) return;
    const duration = isVideoSplash ? 8500 : 5000;
    const timer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [isDemoMode, isVideoSplash]);

  const handleReplay = () => {
    setKey(prev => prev + 1);
  };

  // Config mapping for titles and visuals
  const themeDetails = {
    saffron: {
      bg: 'bg-linear-to-b from-[#FFF2E0] via-[#FF8008] to-[#D54300]',
      cardBg: 'bg-linear-to-b from-[#FF9015] to-[#B33600]',
      titleColor: 'text-[#FFEBD0]',
      accentColor: 'text-[#FFE4C4]',
      mantra: '॥ हरि ॐ तत्सत् ॥',
      vibeName: 'सनातनी केसरिया उदय (Sample 1)',
      desc: 'Saffron Dawn Aura: Rich traditional morning colors with sunburst highlights and traditional spiritual energy.'
    },
    golden: {
      bg: 'bg-linear-to-b from-[#1C1713] via-[#2F2117] to-[#110D0A]',
      cardBg: 'bg-linear-to-b from-[#2E2015] to-[#1A110B]',
      titleColor: 'text-[#F6C453]',
      accentColor: 'text-[#E5B53C]',
      mantra: '॥ धर्मो रक्षति रक्षितः ॥',
      vibeName: 'स्वर्ण मंडला शांति (Sample 2)',
      desc: 'Golden Mandala Shanti: Meditative dark luxury space with soft gold-tint rotators and cosmic tranquility.'
    },
    crimson: {
      bg: 'bg-linear-to-b from-[#FFFDF9] via-[#FFF8EE] to-[#FFE8CC]',
      cardBg: 'bg-linear-to-b from-[#FFFDF9] to-[#FFE8CC]',
      titleColor: 'text-slate-900',
      accentColor: 'text-[#D54300]',
      mantra: '॥ शुभम करोति कल्याणम ॥',
      vibeName: 'मंदिर लालित्य सौम्य (Sample 3 - भगवा उदय)',
      desc: 'Temple White & Saffron: Pure white and light saffron background with delicate gold mandir arches, warm orange accents, and blissful serenity.'
    },
    'sanatan-video': {
      bg: 'bg-linear-to-b from-[#110D0A] via-[#251A12] to-[#110D0A]',
      cardBg: 'bg-linear-to-b from-[#2E2015] to-[#110D0A]',
      titleColor: 'text-amber-300',
      accentColor: 'text-[#F59E0B]',
      mantra: '॥ धर्मो रक्षति रक्षितः ॥',
      vibeName: 'सनातनी वीडियो घड़ी (Premium Video)',
      desc: 'Sanatani Video Ghadi: Immersive living sunset reflection on the sacred Ganges river with waving saffron flags and real-time rotating dial.'
    }
  };


  return (
    <div 
      onClick={() => {
        if (!isDemoMode && onComplete) {
          onComplete();
        }
      }}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center overflow-hidden p-6 select-none transition-all duration-700 ${
        customSplash ? (isVideoSplash ? 'bg-black cursor-pointer' : 'cursor-pointer') : themeDetails[style].bg
      }`}
      style={{
        backgroundImage: (customSplash && !isVideoSplash) ? `url(${customSplash})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Decorative floating sparkling spiritual stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Custom Video Splash Screen background */}
        {isVideoSplash && (
          <video
            autoPlay
            loop={isDemoMode}
            muted
            playsInline
            onEnded={() => {
              if (!isDemoMode && onCompleteRef.current) {
                onCompleteRef.current();
              }
            }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 z-0 select-none"
          >
            <source src={customSplash} />
          </video>
        )}

        {/* Absolute background video for live spiritual ambiance */}
        {!isVideoSplash && style === 'sanatan-video' && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-55 z-0 select-none"
          >
            <source 
              src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054273b9e4a3c1039c5d011efab3216&profile_id=139&oauth2_token_id=57447761" 
              type="video/mp4" 
            />
          </video>
        )}

        {!isVideoSplash && dots.map((dot) => (
          <motion.div
            key={`${dot.id}-${key}`}
            className="absolute rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              width: Math.random() * 3 + 2,
              height: Math.random() * 3 + 2,
              left: `${dot.left}%`,
              top: `${dot.top}%`,
            }}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.6, 1.2, 0.6],
              y: [0, -30, 0]
            }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Rotating subtle geometric mandala behind OM for Sample 2 */}
        {!isVideoSplash && style === 'golden' && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border border-amber-500/10 pointer-events-none flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-[85%] h-[85%] rounded-full border border-dashed border-amber-500/10 flex items-center justify-center">
              <div className="w-[80%] h-[80%] rounded-full border border-amber-500/10 flex items-center justify-center">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="absolute w-[95%] h-[95%] border border-[#F6C453]/5 rounded-sm"
                    style={{ transform: `rotate(${idx * 45}deg)` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sunburst background glow for Sample 1 */}
        {!isVideoSplash && style === 'saffron' && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 blur-3xl rounded-full"
            animate={{ scale: [0.95, 1.1, 0.95] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Decorative Mandir arch for Sample 3 */}
        {!isVideoSplash && style === 'crimson' && (
          <div className="absolute inset-4 sm:inset-6 border border-orange-500/20 rounded-2xl pointer-events-none">
            <div className="absolute inset-1 border-2 border-orange-500/15 rounded-xl"></div>
            {/* Arch template dome at top */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-10 border-b border-orange-200 bg-linear-to-b from-orange-500/5 to-transparent rounded-b-full"></div>
          </div>
        )}
      </div>

      {/* TOP REGION: DEMO CONTROLS (Only visible in Demo Mode inside the tools tab) */}
      {!isVideoSplash && (
        isDemoMode ? (
          <div className="w-full max-w-lg bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-3 sm:p-4 z-20 shadow-xl flex flex-col md:flex-row justify-between items-center gap-3 mt-4 text-left">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">स्प्लैश स्क्रीन सैंडबॉक्स</span>
              <h4 className="text-xs font-black text-white leading-5 truncate">{themeDetails[style].vibeName}</h4>
              <p className="text-[9.5px] text-slate-300 leading-normal line-clamp-2 mt-0.5">{themeDetails[style].desc}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay();
                }}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer text-2xs transition-all flex items-center gap-1.5 focus:ring-1 focus:ring-orange-500"
                title="Replay entry animations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                पुनः चलाएँ (Replay)
              </button>
            </div>
          </div>
        ) : (
          <div className="h-10"></div> // Placeholder layout spacer
        )
      )}

      {/* CENTER REGION: THE SACRED OM EMBLEM AND DETAILS */}
      {!isVideoSplash && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${style}-${key}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center z-10 text-center"
          >
            {/* Waving temple flag for 'sanatan-video' option */}
            {style === 'sanatan-video' && (
              <motion.div 
                className="relative flex flex-col items-center -mb-4 z-20 gap-0.5"
                animate={{ y: [0, -2, 2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-0.5 h-10 bg-amber-600 rounded-t-full shadow-md relative">
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-gradient-to-b from-[#FFE8A1] to-amber-50 rounded-full border border-amber-300"></div>
                </div>
                <motion.svg 
                  viewBox="0 0 100 60" 
                  className="absolute top-1 left-0.5 w-12 h-8 origin-left"
                  animate={{
                    skewY: [-3, 3, -3],
                    scaleY: [0.97, 1.03, 0.97]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <path 
                    d="M 0 0 C 30 4, 70 -4, 100 8 L 100 28 C 70 20, 30 28, 0 20 Z" 
                    fill="#FF7F0F" 
                    className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  />
                  <text x="25" y="19" fill="#FFF2E0" fontSize="11" fontWeight="black" fontFamily="serif">ॐ</text>
                </motion.svg>
              </motion.div>
            )}

            {/* Pulsing Sacred Ring around OM */}
            <motion.div 
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center relative shadow-2xl border-4 ${
                style === 'saffron'
                  ? 'bg-linear-to-tr from-amber-400 to-[#FF9900] border-amber-100/90'
                  : style === 'golden'
                  ? 'bg-linear-to-tr from-amber-500/20 to-[#E5B53C]/10 border-[#F6C453]/60'
                  : style === 'sanatan-video'
                  ? 'bg-gradient-to-tr from-amber-550/10 via-orange-600/20 to-amber-400/20 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.55)]'
                  : 'bg-linear-to-tr from-[#FFF2E0] via-white to-[#FFEBD0] border-orange-550/60 shadow-lg'
              }`}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(246, 196, 83, 0.2)",
                  style === 'crimson' ? "0 0 45px rgba(239, 68, 68, 0.25)" : style === 'sanatan-video' ? "0 0 55px rgba(245, 158, 11, 0.6)" : "0 0 45px rgba(246, 196, 83, 0.55)",
                  "0 0 20px rgba(246, 196, 83, 0.2)"
                ]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Center Om Word/Character - Custom Sanatan Ghadi Logo */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
                className="w-24 h-24 sm:w-28 sm:h-28 z-10 flex items-center justify-center p-1.5"
              >
                <SacredLogoIcon style="om" size="xl" />
              </motion.div>

              {/* Glowing spinning orbits or aura lights */}
              <motion.div 
                className="absolute inset-[-12px] border border-dashed border-white/20 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />

              {/* Clock ticks and hands for sanatan-video */}
              {style === 'sanatan-video' && (
                <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute inset-0 flex justify-center pointer-events-none"
                      style={{ transform: `rotate(${i * 30}deg)` }}
                    >
                      <div className="w-[1.5px] h-1.5 bg-gradient-to-b from-[#FFE8A1] to-amber-50 rounded-full mt-1.5" />
                    </div>
                  ))}
                  {/* Minute Hand */}
                  <motion.div 
                    className="absolute bottom-1/2 left-1/2 -ml-[0.75px] w-[1.5px] h-11 bg-amber-200 origin-bottom rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Hour Hand */}
                  <motion.div 
                    className="absolute bottom-1/2 left-1/2 -ml-[1px] w-[2px] h-8 bg-amber-400 origin-bottom rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 360, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute top-1/2 left-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full bg-amber-300 border border-amber-600" />
                </div>
              )}
            </motion.div>

            {/* Subtitles & Sacred Mantra text */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 space-y-2"
            >
              <h1 className={`font-serif text-2xl sm:text-3xl font-black tracking-tight ${
                style === 'saffron' ? 'text-white' : style === 'crimson' ? 'text-slate-800' : 'text-amber-100'
              }`}>
                {style === 'sanatan-video' ? 'सनातनी घड़ी' : 'आज का धर्मिक समय'}
              </h1>
              
              <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block font-mono ${
                style === 'saffron' ? 'text-orange-100' : style === 'crimson' ? 'text-orange-600' : 'text-[#FFE8A1]'
              }`}>
                {themeDetails[style].mantra}
              </p>

              <div className="flex items-center justify-center gap-1 pt-1">
                <Sparkles className={`w-3.5 h-3.5 ${style === 'crimson' ? 'text-orange-500' : 'text-amber-400'}`} />
                <span className={`text-[9.5px] font-black tracking-widest font-mono uppercase ${
                  style === 'saffron' ? 'text-orange-200' : style === 'crimson' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Panchang • Choghadiya • Astro-Alarms
                </span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* 4 Sacred Indicators from Video (Visible for sanatan-video) */}
      {!isVideoSplash && style === 'sanatan-video' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center items-center gap-4 sm:gap-6 w-full max-w-sm mb-1 mt-2 border-t border-b border-amber-500/10 py-2 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs shadow-inner">
              📅
            </div>
            <span className="text-[9px] font-black tracking-wider text-amber-200 font-serif">पंचांग</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs shadow-inner">
              🔔
            </div>
            <span className="text-[9px] font-black tracking-wider text-amber-200 font-serif">अलार्म</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs shadow-inner">
              🕌
            </div>
            <span className="text-[9px] font-black tracking-wider text-amber-200 font-serif">तीर्थ दर्शन</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs shadow-inner">
              ☀️
            </div>
            <span className="text-[9px] font-black tracking-wider text-amber-200 font-serif">सूर्योदय</span>
          </div>
        </motion.div>
      )}

      {/* BOTTOM REGION: INTERACTIVE SELECTORS OR VIDEO ENTER PILL */}
      {isVideoSplash ? (
        <div className="w-full flex justify-center py-6 z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onComplete) onComplete();
            }}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-600 via-yellow-550 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-black text-xs sm:text-sm tracking-widest rounded-full shadow-[0_4px_25px_rgba(245,158,11,0.5)] border border-amber-200/40 transition-all cursor-pointer select-none uppercase"
          >
            सनातन घड़ी में प्रवेश करें (Enter App)
            <Play className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
          </motion.button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-3 z-20">
          {isDemoMode ? (
            <div className="space-y-3 w-full max-w-md mb-2">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block text-center font-mono">
                सभी ४ विकल्पों का लाइव परीक्षण करें (Try Samples Below)
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStyle('saffron');
                  }}
                  className={`py-2 px-1 rounded-xl font-bold text-[9px] border transition-all cursor-pointer text-center text-white ${
                    style === 'saffron'
                      ? 'bg-[#FF8008] border-white shadow-md scale-102 font-black shadow-orange-500/45'
                      : 'bg-black/20 border-white/10 hover:bg-black/30'
                  }`}
                >
                  🔥 केसरिया
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStyle('golden');
                  }}
                  className={`py-2 px-1 rounded-xl font-bold text-[9px] border transition-all cursor-pointer text-center text-white ${
                    style === 'golden'
                      ? 'bg-[#E5B53C]/40 border-amber-400 shadow-md scale-102 font-black shadow-amber-500/40'
                      : 'bg-black/20 border-white/10 hover:bg-black/30'
                  }`}
                >
                  ✨ स्वर्ण
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStyle('crimson');
                  }}
                  className={`py-2 px-1 rounded-xl font-bold text-[9px] border transition-all cursor-pointer text-center ${
                    style === 'crimson'
                      ? 'bg-orange-600/20 border-orange-400 text-orange-950 shadow-md scale-102 font-black'
                      : 'bg-black/20 border-white/10 hover:bg-black/30 text-white'
                  }`}
                >
                  ⛩️ सौम्य
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStyle('sanatan-video');
                  }}
                  className={`py-2 px-1 rounded-xl font-bold text-[9px] border transition-all cursor-pointer text-center text-white ${
                    style === 'sanatan-video'
                      ? 'bg-orange-600 border-amber-400 shadow-md scale-102 font-black shadow-orange-550/40'
                      : 'bg-black/20 border-white/10 hover:bg-black/30'
                  }`}
                >
                  🎬 वीडियो घड़ी
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 mb-4 pointer-events-none animate-pulse">
              <div className={`flex items-center gap-2 text-2xs font-bold font-mono tracking-widest uppercase ${
                style === 'crimson' ? 'text-slate-500' : 'text-amber-100/75'
              }`}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>पंचांग गणना लोड हो रही है...</span>
              </div>
            </div>
          )}

          {/* Spiritual footer quote line */}
          <p className={`text-[9.5px] uppercase font-mono tracking-widest block text-center font-semibold mb-1 ${
            style === 'crimson' ? 'text-orange-950/40' : 'text-[#FFE1B1]/40'
          }`}>
            ॥ धर्मो रक्षति रक्षितः - Precise Vedic Calculations ॥
          </p>
        </div>
      )}
    </div>
  );
}
