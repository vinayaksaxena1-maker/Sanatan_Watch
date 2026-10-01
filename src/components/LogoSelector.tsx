import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Info, Flame } from 'lucide-react';
import { SettingsState, LogoStyle } from '../types';

interface LogoSelectorProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  onPushToast: (title: string, body: string) => void;
}

// Highly polished, crafted component to render any select spiritual logo
export function SacredLogoIcon({ style, size = 'md', customLogo }: { style: LogoStyle; size?: 'sm' | 'md' | 'lg' | 'xl'; customLogo?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm rounded-xl',
    md: 'w-10 h-10 text-lg rounded-2xl',
    lg: 'w-14 h-14 text-2xl rounded-2xl',
    xl: 'w-24 h-24 text-4xl rounded-3xl'
  };

  const ringSizes = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5',
    xl: 'p-3'
  };

  if (customLogo) {
    const roundedClass = size === 'sm' ? 'rounded-xl' : size === 'md' ? 'rounded-2xl' : size === 'lg' ? 'rounded-2xl' : 'rounded-3xl';
    return (
      <div 
        className={`relative flex items-center justify-center font-bold font-serif select-none border transition-all duration-300 ${sizeClasses[size]} bg-white dark:bg-stone-900 border-orange-200/40`}
      >
        <img src={customLogo} alt="Custom Logo" className={`w-full h-full object-cover ${roundedClass}`} referrerPolicy="no-referrer" />
        <div className="absolute inset-[-4px] border border-orange-500/10 rounded-full pointer-events-none scale-105" />
      </div>
    );
  }

  // Gradients and backgrounds for each sacred symbol
  const themeMap = {
    om: {
      bg: 'bg-linear-to-tr from-amber-600 to-[#FF9900]',
      shadow: 'shadow-[0_0_15px_rgba(255,153,0,0.35)]',
      border: 'border-amber-200/40',
      text: 'text-white'
    },
    swastika: {
      bg: 'bg-linear-to-tr from-red-600 to-amber-500',
      shadow: 'shadow-[0_0_15px_rgba(220,38,38,0.35)]',
      border: 'border-red-200/40',
      text: 'text-white'
    },
    trishul: {
      bg: 'bg-linear-to-tr from-[#1E1916] via-[#4A3B32] to-[#8C7662]',
      shadow: 'shadow-[0_0_15px_rgba(74,59,50,0.35)]',
      border: 'border-[#D9CFC1]/40',
      text: 'text-amber-100'
    },
    kalash: {
      bg: 'bg-linear-to-tr from-emerald-600 via-teal-500 to-amber-400',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
      border: 'border-emerald-200/40',
      text: 'text-white'
    },
    diya: {
      bg: 'bg-linear-to-tr from-[#120D24] via-[#2D164D] to-[#E35D14]',
      shadow: 'shadow-[0_0_15px_rgba(227,93,20,0.35)]',
      border: 'border-[#F6C453]/40',
      text: 'text-white'
    }
  };

  const currentTheme = themeMap[style] || themeMap.om;

  return (
    <div 
      className={`relative flex items-center justify-center font-bold font-serif select-none border transition-all duration-300 ${sizeClasses[size]} ${currentTheme.bg} ${currentTheme.border} ${currentTheme.shadow}`}
    >
      {/* Dynamic Render of Sacred Symbol/SVG */}
      {style === 'om' && (
        <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Metallic Golden gradients for high-end 3D reliefs */}
            <linearGradient id="gold-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFEE3" />
              <stop offset="25%" stopColor="#F9C846" />
              <stop offset="50%" stopColor="#D58000" />
              <stop offset="75%" stopColor="#F9C846" />
              <stop offset="100%" stopColor="#874C00" />
            </linearGradient>

            <linearGradient id="gold-light" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#E09F1E" />
              <stop offset="50%" stopColor="#FFF2B2" />
              <stop offset="100%" stopColor="#FFFDF0" />
            </linearGradient>

            <linearGradient id="saffron-flag" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FF4D00" />
              <stop offset="40%" stopColor="#FF7A00" />
              <stop offset="85%" stopColor="#FFAA00" />
            </linearGradient>

            <radialGradient id="dark-plate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E1207" />
              <stop offset="75%" stopColor="#080502" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>

            <filter id="gold-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComponentTransfer in="blur" result="glow1">
                <feFuncA type="linear" slope="0.75" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Gold Medallion Rim with Multi-layered Shadows */}
          <circle cx="250" cy="250" r="236" fill="#000000" />
          <circle cx="250" cy="250" r="232" fill="url(#gold-primary)" />
          <circle cx="250" cy="250" r="222" fill="#0A0601" />
          <circle cx="250" cy="250" r="220" fill="url(#dark-plate)" />

          {/* Inner Golden Concentric Accents */}
          <circle cx="250" cy="250" r="208" fill="none" stroke="url(#gold-primary)" strokeWidth="1.5" opacity="0.3" />
          <circle cx="250" cy="250" r="198" fill="none" stroke="url(#gold-primary)" strokeWidth="3" opacity="0.8" />
          <circle cx="250" cy="250" r="192" fill="none" stroke="url(#gold-primary)" strokeWidth="1" strokeDasharray="4, 3" opacity="0.45" />

          {/* Temple Shikhara Profiles in background (Subtle, elegant opacity) */}
          <g opacity="0.14" transform="translate(45, 120)">
            <path d="M40 180 L55 130 L60 130 L65 90 L70 90 L75 50 L80 50 L85 20 Q87 10 90 20 L95 50 L100 50 L105 90 L110 90 L115 130 L120 130 L135 180 Z" fill="url(#gold-light)" />
            <path d="M40 180 H135" stroke="url(#gold-light)" strokeWidth="2" />
            <line x1="90" y1="20" x2="90" y2="2" stroke="url(#gold-light)" strokeWidth="1" />
            <path d="M90 2 L100 7 L90 12 Z" fill="#F05A00" />
          </g>
          
          <g opacity="0.14" transform="translate(230, 120)">
            <path d="M40 180 L55 130 L60 130 L65 90 L70 90 L75 50 L80 50 L85 20 Q87 10 90 20 L95 50 L100 50 L105 90 L110 90 L115 130 L120 130 L135 180 Z" fill="url(#gold-light)" />
            <path d="M40 180 H135" stroke="url(#gold-light)" strokeWidth="2" />
            <line x1="90" y1="20" x2="90" y2="2" stroke="url(#gold-light)" strokeWidth="1" />
            <path d="M90 2 L100 7 L90 12 Z" fill="#F05A00" />
          </g>

          {/* Clock Dial Circle Grid & Numerals Ticks */}
          <circle cx="250" cy="250" r="145" fill="none" stroke="url(#gold-primary)" strokeWidth="2" opacity="0.7" />
          {(() => {
            const lines = [];
            for (let i = 0; i < 12; i++) {
              const angle = i * 30;
              const isMajor = i % 3 === 0;
              const r1 = 132;
              const r2 = 144;
              const x1 = 250 + r1 * Math.sin((angle * Math.PI) / 180);
              const y1 = 250 - r1 * Math.cos((angle * Math.PI) / 180);
              const x2 = 250 + r2 * Math.sin((angle * Math.PI) / 180);
              const y2 = 250 - r2 * Math.cos((angle * Math.PI) / 180);
              lines.push(
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#gold-primary)"
                  strokeWidth={isMajor ? 4.5 : 2.5}
                  strokeLinecap="round"
                  opacity={isMajor ? 0.95 : 0.65}
                />
              );
            }
            return lines;
          })()}

          {/* Saffron Waving Flag (Bhagwa Dhwaj) at 12 o'clock */}
          <g>
            <line x1="250" y1="135" x2="250" y2="40" stroke="url(#gold-primary)" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="250" cy="40" r="4.5" fill="url(#gold-primary)" />
            
            <path
              d="M 250 48 C 285 36, 315 65, 345 42 C 365 28, 385 45, 405 38 Q 360 62, 332 62 L 395 86 C 370 80, 350 98, 335 88 C 305 68, 280 94, 250 82 Z"
              fill="url(#saffron-flag)"
              filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.45))"
            />
            
            <text
              x="285"
              y="71"
              fill="url(#gold-light)"
              fontSize="17"
              fontWeight="950"
              fontFamily="'Georgia', serif"
              filter="drop-shadow(0 1px 1.5px rgba(0,0,0,0.5))"
            >
              ॐ
            </text>
          </g>

          {/* Majestic Clock Hands rotated beautifully */}
          <g transform="rotate(-36 250 250)">
            <path
              d="M 250 250 L 245 250 L 242 195 L 250 162 L 258 195 L 255 250 Z"
              fill="url(#gold-primary)"
              filter="drop-shadow(0 3px 4px rgba(0,0,0,0.55))"
            />
          </g>

          <g transform="rotate(42 250 250)">
            <path
              d="M 250 250 L 246 250 L 243 155 L 250 115 L 257 155 L 254 250 Z"
              fill="url(#gold-primary)"
              filter="drop-shadow(0 3px 5px rgba(0,0,0,0.55))"
            />
          </g>

          <circle cx="250" cy="250" r="10.5" fill="url(#gold-primary)" stroke="#110802" strokeWidth="2" />
          <circle cx="250" cy="250" r="4.5" fill="#FFFCE6" />

          {/* Trishul stem pointing up */}
          <path d="M 250 238 L 250 180 L 246 185 L 250 172 L 254 185 Z" fill="url(#gold-primary)" opacity="0.85" />

          {/* "सनातन" (Sanatan) Devanagari Relief Text */}
          <g filter="url(#gold-glow)">
            <text
              x="250"
              y="336"
              textAnchor="middle"
              fill="url(#gold-light)"
              fontSize="88"
              fontWeight="950"
              fontFamily="'Yatra One', 'Georgia', serif"
              letterSpacing="-0.5"
              filter="drop-shadow(0px 5px 8px rgba(0,0,0,0.98))"
            >
              सनातन
            </text>
          </g>

          {/* Golden Horizontal Bar (Shirorekha outline) */}
          <line
            x1="110"
            y1="262"
            x2="390"
            y2="262"
            stroke="url(#gold-primary)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.7))"
          />
          <circle cx="110" cy="262" r="3.5" fill="url(#gold-primary)" />
          <circle cx="390" cy="262" r="3.5" fill="url(#gold-primary)" />

          {/* "घड़ी" (Ghadi) Devanagari Relief Text */}
          <g filter="url(#gold-glow)">
            <text
              x="250"
              y="402"
              textAnchor="middle"
              fill="url(#gold-light)"
              fontSize="58"
              fontWeight="900"
              fontFamily="'Yatra One', 'Georgia', serif"
              letterSpacing="2.5"
              filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.95))"
            >
              घड़ी
            </text>
          </g>

          {/* Symmetrical Bottom flourish with sacred "ॐ" */}
          <g>
            <path
              d="M 125 458 Q 195 458 218 458"
              fill="none"
              stroke="url(#gold-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
            />
            <circle cx="218" cy="458" r="3.5" fill="url(#gold-primary)" />
            <path d="M 100 458 L 114 454 L 126 458 L 114 462 Z" fill="url(#gold-primary)" />

            <text
              x="250"
              y="472"
              textAnchor="middle"
              fill="url(#gold-primary)"
              fontSize="42"
              fontWeight="bold"
              fontFamily="'Georgia', serif"
              filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.85))"
            >
              ॐ
            </text>

            <path
              d="M 375 458 Q 305 458 282 458"
              fill="none"
              stroke="url(#gold-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
            />
            <circle cx="282" cy="458" r="3.5" fill="url(#gold-primary)" />
            <path d="M 400 458 L 386 454 L 374 458 L 386 462 Z" fill="url(#gold-primary)" />
          </g>
        </svg>
      )}

      {style === 'swastika' && (
        <span className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] text-xl sm:text-2xl mt-0.5 leading-none">卐</span>
      )}

      {style === 'trishul' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[60%] h-[60%] stroke-[2.2] animate-pulse">
          {/* Trishul custom SVG paths */}
          <path d="M12 2v20" strokeLinecap="round" />
          <path d="M7 6c0 4 3 6 5 6s5-2 5-6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 16h4" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        </svg>
      )}

      {style === 'kalash' && (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%] filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.15)]">
          {/* Custom polished Kalash silhouette */}
          <path d="M7 11c0-1.5 1-3 2-3h6c1 0 2 1.5 2 3v1c0 2-1 4-3 4.5l-.5 3h1.5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h1.5l-.5-3c-2-.5-3-2.5-3-4.5v-1Z" />
          <path d="M12 5.5c-1-1.5-.5-3 0-4.5.5 1.5 1 3 0 4.5Z" fill="#F1C40F" />
          <path d="M10 8c-.8-1-2-.5-2.5 0-.5.5-.5 1.5 0 2 .5.5 1.5.5 2-.5" fill="#2ECC71" />
          <path d="M14 8c.8-1 2-.5 2.5 0 .5.5.5 1.5 0 2-.5.5-1.5.5-2-.5" fill="#2ECC71" />
        </svg>
      )}

      {style === 'diya' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[50%] h-[50%] mt-1 text-[#F6C453]">
            {/* Earthen base of lamp */}
            <path d="M3 13c0 4.4 3.6 8 8 8s8-3.6 8-8H3Z" />
          </svg>
          <motion.div 
            className="absolute top-2 text-[#FF9900]"
            animate={{ 
              scale: [1, 1.25, 1],
              y: [0, -2, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Flame className="w-5 h-5 fill-current text-orange-400 stroke-amber-100" />
          </motion.div>
        </div>
      )}

      {/* Decorative Outer Halo Ring */}
      <div className="absolute inset-[-4px] border border-orange-500/10 rounded-full pointer-events-none scale-105" />
    </div>
  );
}

export function LogoSelector({ settings, setSettings, onPushToast }: LogoSelectorProps) {
  const currentSelected = settings.logoStyle || 'om';
  const [activeLogo, setActiveLogo] = useState<LogoStyle>(currentSelected);

  const logoSamples = [
    {
      id: 'om' as const,
      name: 'सनातन घड़ी आधिकारिक लोगो (Sanatan Ghadi)',
      subtitle: '॥ सनातन घड़ी कल्याणकारी पंचांग ॥',
      accentColor: 'text-amber-500 font-extrabold',
      description: 'हमेशा के लिए स्थापित अधिकारिक दिव्य "सनातन घड़ी" प्रतीक चिह्न। भव्य स्वर्ण चक्र, भगवा सनातन ध्वज और मंगलमयी देववाणी अक्षरों से अलंकृत।',
      pills: ['भगवा ध्वज', 'स्वर्ण कालचक्र', 'सनातन पंचांग'],
      colors: 'from-amber-600 via-yellow-550 to-orange-600'
    },
    {
      id: 'swastika' as const,
      name: 'स्वस्तिक मंगल चिह्न (Swastika)',
      subtitle: '॥ स्वस्ति न इंद्रो वृद्धश्रवाः ॥',
      accentColor: 'text-red-600',
      description: 'मंगल एवं शुभता का सनातन महा-उत्सव। चारों दिशाओं से मंगलकारी शुभ विचारों और सौभाग्य को आकर्षित करने वाला पावन चिह्न।',
      pills: ['सिन्दूर लालित्य', 'शुभ-लाभ', 'ऋद्धि-सिद्धि'],
      colors: 'from-red-600 to-orange-500'
    },
    {
      id: 'trishul' as const,
      name: 'त्रिशूल शिव शक्ति (Trishul Shield)',
      subtitle: '॥ नमः शिवाय ॥',
      accentColor: 'text-[#8C7662]',
      description: 'महाकाल शिव का परम आयुध। तीनों तापों (आध्यात्मिक, आधिभौतिक, आधिदैविक) का शमन कर आत्मशक्ति जाग्रत करने वाला अभय प्रतीक।',
      pills: ['रुद्राक्ष आभा', 'कालविजयी', 'अभय मुद्रा'],
      colors: 'from-stone-850 to-[#8C7662]'
    },
    {
      id: 'kalash' as const,
      name: 'मंगल कलश सिद्धि (Sacred Holy Pot)',
      subtitle: '॥ कलशस्य मुखे विष्णुः ॥',
      accentColor: 'text-emerald-600',
      description: 'पंचदेवों का वास और सृजनात्मक अमृत। नारियल, आम्रपल्लव और सौभाग्य जल से पूर्ण मंदिर प्रवेश की परम कल्याणमयी ऊर्जा।',
      pills: ['अमृत कुम्भ', 'समृद्धि वास', 'नवदुर्गा तेज'],
      colors: 'from-emerald-600 to-amber-500'
    },
    {
      id: 'diya' as const,
      name: 'पंचमहाभूत दीपक (Glowing Diya)',
      subtitle: '॥ तमसो मा ज्योतिर्गमय ॥',
      accentColor: 'text-orange-500',
      description: 'अज्ञान के तिमिर का नाश करने वाली ब्रह्म-ज्योति। देव वेदी पर जलने वाला पवित्र घी का दीपक, जो दिव्य चैतन्य का प्रकाश फैलाता है।',
      pills: ['स्वर्ण ज्योति', 'ज्ञान उदय', 'अंधकार हरण'],
      colors: 'from-[#120D24] to-[#E35D14]'
    }
  ];

  const handleSelectLogo = (logoId: LogoStyle) => {
    setSettings(prev => ({
      ...prev,
      logoStyle: logoId
    }));
    
    let hindiName = 'ॐकार दिव्य प्रतीक';
    if (logoId === 'swastika') hindiName = 'स्वस्तिक मंगल चिह्न';
    if (logoId === 'trishul') hindiName = 'त्रिशूल शिव शक्ति';
    if (logoId === 'kalash') hindiName = 'मंगल कलश सिद्धि';
    if (logoId === 'diya') hindiName = 'पंचमहाभूत दीपक';

    onPushToast(
      '✨ नया ऐप लोगो सेट किया गया',
      `सफलतापूर्वक "${hindiName}" को मुख्य ऐप लोगो और हेडर प्रतीक के रूप में चुना गया।`
    );
  };

  return (
    <div id="logo_selector_container" className="space-y-6 text-left font-sans">
      
      {/* Introduction Card */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 border-l-4 border-yellow-500">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-yellow-600 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-dark-text-pri font-serif">मुख्य ऐप लोगो और प्रतीक चयन (Sacred Logos)</h2>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-dark-text-mut leading-relaxed">
          हरि ओम! "आज का धर्मिक समय" के पंचांग अनुभव को अलंकृत करने के लिए हमने <strong>५ वैदिक शुभ प्रतीक लोगो (App Icon Samples)</strong> बनाए हैं। आप इनमें से किसी भी दिव्य चिह्न को चुनकर उसे अपना अधिकारिक ऐप आइकन घोषित कर सकते हैं। यह चुनिंदा लोगो वास्तविक समय में आपके ऐप हेडर में अपडेट हो जाएगा।
        </p>
      </div>

      {/* Grid of Logo Choices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {logoSamples.map((sample) => {
          const isActive = sample.id === currentSelected;
          return (
            <div 
              key={sample.id} 
              className={`glass-card-light dark:glass-card-dark p-4 rounded-3xl flex flex-row items-center gap-4 transition-all border-2 relative cursor-pointer hover:shadow-md ${
                isActive 
                  ? 'border-yellow-500 ring-2 ring-yellow-500/10 bg-yellow-500/5' 
                  : 'border-slate-200/55 dark:border-zinc-805'
              }`}
              onClick={() => handleSelectLogo(sample.id)}
            >
              {/* Dynamic Interactive Emblem Avatar */}
              <div className="shrink-0">
                <SacredLogoIcon style={sample.id} size="xl" />
              </div>

              {/* Info Block */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black truncate block ${sample.accentColor} font-serif`}>
                    {sample.name}
                  </span>
                  {isActive && (
                    <span className="bg-yellow-650 text-yellow-950 font-bold px-1.5 py-0.5 rounded-md text-[7px] tracking-wider uppercase block">
                      सक्रिय
                    </span>
                  )}
                </div>

                <p className="text-[9.5px] text-slate-400 dark:text-dark-text-mut italic block leading-none">
                  {sample.subtitle}
                </p>

                <p className="text-[10px] text-slate-500 dark:text-dark-text-mut leading-normal line-clamp-3">
                  {sample.description}
                </p>

                {/* Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {sample.pills.map((pill, pIdx) => (
                    <span key={pIdx} className="bg-yellow-500/5 dark:bg-yellow-500/10 text-yellow-950 dark:text-yellow-400 text-[8.5px] font-bold px-1.5 py-0.2 rounded border border-yellow-500/10">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Circle selection indicator */}
              <div className="absolute top-3 right-3 h-4 w-4 rounded-full border flex items-center justify-center transition-all">
                {isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-zinc-800" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Startup Launcher Simulation Display Box */}
      <div className="bg-[#FFFDF9] dark:bg-dark-card border border-yellow-500/15 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-6">
        
        {/* Device Icon Launcher Preview */}
        <div className="flex-none flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-[26px] bg-linear-to-b from-white to-[#FFF2E0] shadow-xl border border-orange-200/50 flex items-center justify-center relative p-3">
            <SacredLogoIcon style={currentSelected} size="lg" />
            <div className="absolute right-2 bottom-2 bg-orange-600 w-2.5 h-2.5 rounded-full shadow-xs border border-white" />
          </div>
          <span className="text-[9.5px] font-black tracking-wide text-slate-500 uppercase font-mono">मोवाइल होमस्क्रीन</span>
        </div>

        {/* Branding details */}
        <div className="text-left space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-orange-500/10 text-orange-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-orange-200">
              लॉन्चर आइकन सिमुलेटर (App Launcher)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[9px] font-bold text-slate-400">Live Device Asset</span>
          </div>
          
          <h3 className="text-xs font-black text-slate-800 dark:text-dark-text-pri font-serif">
            सौम्य संपादन एवं वैदिक परिपक्वता (Icon Design Architecture)
          </h3>
          
          <p className="text-[10px] text-slate-500 dark:text-dark-text-mut leading-relaxed">
            जब आपका ऐप Google Play Store या Apple App Store में सूची बद्ध होगा, तो यह चुना गया आइकन दिव्य आभा के साथ स्मार्टफोन लांचर पर प्रदर्शित होगा। आपका वर्तमान चयन <strong>"{logoSamples.find(l => l.id === currentSelected)?.name}"</strong> है। हर सुबह ऐप खोलते समय यह पवित्र ऊर्जा आपका मार्गदर्शन करेगी।
          </p>
        </div>
      </div>

    </div>
  );
}
