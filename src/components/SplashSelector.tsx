import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Info,
  Eye
} from 'lucide-react';
import { SettingsState, SplashStyle } from '../types';

interface SplashSelectorProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  onPushToast: (title: string, body: string) => void;
  onLaunchPreview: (style: SplashStyle) => void;
}

export function SplashSelector({ settings, setSettings, onPushToast, onLaunchPreview }: SplashSelectorProps) {
  const currentSelected = settings.splashStyle || 'saffron';
  const [activeSample, setActiveSample] = useState<SplashStyle>(currentSelected);

  const samples = [
    {
      id: 'saffron' as const,
      name: 'सनातनी केसरिया उदय (Saffron Dawn)',
      subtitle: '॥ हरि ॐ तत्सत् ॥',
      symbol: 'ॐ',
      grade: 'Sample 1 - default',
      description: 'सूर्योदय की पावन वेला का प्रतीक। समृद्ध केसरिया-नारंगी आभा, चमकती किरणें और सूर्य सिद्धांत ऊर्जा का प्रभाव देता है।',
      pills: ['केसरिया ग्रैडियंट', 'अभिजीत आभा', 'उज्जवल स्वर'],
      colors: 'from-[#FF9015] via-[#FF5500] to-[#B33600]',
      themeMatch: 'Light Theme (श्वेत/सौम्य दिन-विधि)'
    },
    {
      id: 'golden' as const,
      name: 'स्वर्ण मंडला शांति (Golden Shanti)',
      subtitle: '॥ धर्मो रक्षति रक्षितः ॥',
      symbol: 'ॐ',
      grade: 'Sample 2 - meditative',
      description: 'गहन अध्यात्मिक शांति का प्रतीक। गहरे ब्राह्मणी ब्लैक-गोल्डन स्पेस, घूमते हुए जादुई मंडला और स्वर्ण रत्नों से परिपूर्ण।',
      pills: ['ब्लैक-गोल्ड', 'जादुई मंडला चक्र', 'शांत वातावरण'],
      colors: 'from-[#2E2015] via-[#1F140C] to-[#110D0A]',
      themeMatch: 'Dark Theme (गहन साधना रात्रि-विधि)'
    },
    {
      id: 'crimson' as const,
      name: 'मंदिर लालित्य सौम्य (Temple Light)',
      subtitle: '॥ शुभम करोति कल्याणम ॥',
      symbol: 'ॐ',
      grade: 'Sample 3 - recommended',
      description: 'पवित्र मंदिर की पावन भावना। ऐप के मुख्य प्रकाश विषय से प्रेरित शुद्ध श्वेत (Cream White) एवं शुभ भगवा (Saffron) का अनुपम संगम।',
      pills: ['श्वेत-भगवा योग', 'सुवर्ण मेहराब', 'अत्यंत सादगी'],
      colors: 'from-[#FFFDF9] via-[#FFF8EE] to-[#FFE8CC]',
      themeMatch: 'All Themes (सार्वभौमिक लालित्य)'
    },
    {
      id: 'sanatan-video' as const,
      name: 'सनातनी वीडियो घड़ी (Sanatan Video)',
      subtitle: '॥ धर्मो रक्षति रक्षितः ॥',
      symbol: 'ॐ',
      grade: 'Sample 4 - premium video',
      description: 'परम सनातनी वीडियो स्प्लैश। पतित पावनी गंगा किनारे, सूर्यास्त की पावन स्वर्ण वेला पर लहराता भगवा ध्वज और रीयल-टाइम घूमती सनातनी घड़ी।',
      pills: ['गंगा सूर्यास्त वीडियो', 'सनातनी तरंगें', 'उच्च आध्यात्मिक अनुभव'],
      colors: 'from-[#110D0A] via-[#2E2015] to-[#110D0A]',
      themeMatch: 'All Themes (परम स्वर्ण दिव्य)'
    }
  ];

  const handleSelectDefault = (styleId: SplashStyle) => {
    setSettings(prev => ({
      ...prev,
      splashStyle: styleId
    }));
    
    let hindiName = 'सनातनी केसरिया उदय';
    if (styleId === 'golden') hindiName = 'स्वर्ण मंडला शांति';
    if (styleId === 'crimson') hindiName = 'मंदिर लालित्य सौम्य';
    if (styleId === 'sanatan-video') hindiName = 'सनातनी वीडियो घड़ी';

    onPushToast(
      '✨ स्प्लैश स्क्रीन डिफ़ॉल्ट सेट की गई',
      `अब ऐप खुलते समय "${hindiName}" स्प्लैश स्क्रीन प्रदर्शित होगी।`
    );
  };

  return (
    <div id="splash_selector_container" className="space-y-6 text-left font-sans">
      
      {/* Introduction Card */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 border-l-4 border-orange-500">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-orange-600 animate-pulse" />
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 font-serif">स्प्लैश स्क्रीन चयन सैंडबॉक्स (Samples)</h2>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          हरि ओम! आपके अनुरोध के अनुसार हमने <strong>४ सुंदर स्प्लैश स्क्रीन विकल्प (एक लाइव वीडियो सहित)</strong> बनाए हैं। नीचे सूची देखकर किसी भी विकल्प को चुनें, उसका लाइव एनिमेटेड प्रीव्यू चलाएं और फाइनल विकल्प को ऐप का मुख्य स्टार्टअप स्प्लैश घोषित करें।
        </p>
      </div>

      {/* Grid of the 4 Samples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {samples.map((sample) => {
          const isActive = sample.id === currentSelected;
          return (
            <div 
              key={sample.id} 
              className={`glass-card-light dark:glass-card-dark p-4 rounded-3xl flex flex-col justify-between transition-all border-2 relative h-full cursor-pointer hover:shadow-md ${
                isActive 
                  ? 'border-orange-500 ring-2 ring-orange-500/10' 
                  : 'border-slate-200/55 dark:border-zinc-800'
              }`}
              onClick={() => setActiveSample(sample.id)}
            >
              <div>
                {/* Active selection badge */}
                {isActive && (
                  <span className="absolute top-3 right-3 bg-orange-600 text-white text-[8px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> डिफ़ॉल्ट
                  </span>
                )}

                <span className="text-[8px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest font-mono block">
                  {sample.grade}
                </span>

                {/* Inline mini thumbnail illustration preview of the splash */}
                <div className={`w-full h-28 rounded-2xl bg-gradient-to-b ${sample.colors} mt-3 mb-3.5 flex flex-col justify-center items-center relative overflow-hidden border border-slate-200/60 dark:border-zinc-800 shadow-xs`}>
                  <span className={`text-3xl font-black font-serif filter drop-shadow-md select-none animate-pulse ${
                    sample.id === 'crimson' ? 'text-orange-600' : 'text-amber-100/90'
                  }`}>
                    {sample.symbol}
                  </span>
                  <span className={`text-[8.5px] font-bold tracking-widest uppercase font-mono mt-1 ${
                    sample.id === 'crimson' ? 'text-orange-950/60' : 'text-white/50'
                  }`}>
                    {sample.subtitle}
                  </span>
                </div>

                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  {sample.name}
                </h3>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-1 min-h-[56px]">
                  {sample.description}
                </p>

                {/* Pills */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {sample.pills.map((pill, pIdx) => (
                    <span key={pIdx} className="bg-orange-500/5 dark:bg-orange-500/10 text-orange-950 dark:text-orange-400 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border border-orange-500/10">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons inside Card */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex gap-2">
                {/* Full screen test button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchPreview(sample.id);
                  }}
                  className="flex-1 py-2 bg-slate-500/10 hover:bg-slate-500/15 border border-slate-900/10 text-slate-800 dark:text-slate-200 text-[10px] font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                  title="Check the full screen animated version"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  प्रीव्यू देखें
                </button>

                {/* Default selected button */}
                {isActive ? (
                  <div className="px-2.5 py-2 bg-orange-100/80 dark:bg-orange-950/40 text-orange-950 dark:text-orange-350 text-[10px] font-extrabold rounded-xl border border-orange-200/50 flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />
                    सक्रिय
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDefault(sample.id);
                    }}
                    className="px-2.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black rounded-xl cursor-pointer shadow-xs transition-all flex-none flex items-center gap-1"
                  >
                    चुनें
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instruction manual of Splash on Startup */}
      <div className="bg-orange-500/5 dark:bg-orange-950/10 p-4 rounded-2xl border border-orange-100/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-left space-y-1">
          <h4 className="text-xs font-bold text-slate-850 dark:text-amber-100 font-serif">स्प्लैश स्क्रीन क्या होती है? (Information)</h4>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
            जब कोई उपयोगकर्ता आज का धर्मिक समय मोबाइल या वेब ऐप को लोड करता है, तो १.५ से ३ सेकंड के लिए यह ध्यान केंद्रित आध्यात्मिक स्वागत एनीमेशन (स्प्लैश स्क्रीन) सामने आता है। यह वैदिक गणना की प्राचीन पवित्रता का आभास देता है। आप इन चारों में से जो भी फाइनल करना चाहते हैं, उसे डिफ़ॉल्ट सेट करके लागू कर सकते हैं।
          </p>
        </div>
      </div>

    </div>
  );
}
