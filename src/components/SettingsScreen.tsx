import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Check,
  Sparkles,
  Bell,
  Type,
  ShieldCheck,
  Mail,
  Smartphone,
  Image as ImageIcon,
  ExternalLink,
  Info,
  X
} from 'lucide-react';
import { SettingsState } from '../types';
import { PosterGenerator } from './PosterGenerator';
import { WidgetSimulator } from './WidgetSimulator';

interface SettingsScreenProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  onPushToast: (title: string, body: string) => void;
  panchangInfo?: any;
  city?: string;
  activeMuhurats?: any[];
  notificationEnabled?: boolean;
  setNotificationEnabled?: (val: boolean) => void;
  onOpenLicensing?: () => void;
}

export function SettingsScreen({
  settings,
  setSettings,
  onPushToast,
  panchangInfo,
  city = 'नई दिल्ली',
  activeMuhurats = [],
  notificationEnabled = false,
  setNotificationEnabled,
  onOpenLicensing
}: SettingsScreenProps) {
  const [activeSegment, setActiveSegment] = useState<'settings' | 'tools'>('settings');
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);

  const language = settings.language || 'English';

  const handleChangeTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
    
    const title = language === 'Hindi' ? (theme === 'light' ? '☀️ लाइट मोड सक्रिय' : '🌙 डार्क मोड सक्रिय') : (theme === 'light' ? '☀️ Light Mode Active' : '🌙 Dark Mode Active');
    const body = language === 'Hindi' 
      ? (theme === 'light' ? 'रोशनी के अनुकूल दिन की लाइट थीम सक्रिय की गई।' : 'नेत्रों की सुरक्षा व बैटरी बचत हेतु डार्क थीम सक्रिय की गई।')
      : (theme === 'light' ? 'Light theme optimized for daylight active.' : 'Dark theme active to reduce eye fatigue.');
    
    onPushToast(title, body);
  };

  const handleChangeLanguage = (lang: 'English' | 'Hindi') => {
    setSettings(prev => ({
      ...prev,
      language: lang
    }));
    onPushToast(
      lang === 'Hindi' ? '🌐 भाषा बदली गई' : '🌐 Language Changed',
      lang === 'Hindi' ? 'ऐप की भाषा को सफलतापूर्वक हिन्दी में बदला गया।' : 'App language changed to English.'
    );
  };

  const handleChangeFontSize = (size: 'small' | 'medium' | 'large') => {
    setSettings(prev => ({
      ...prev,
      fontSize: size
    }));
    const sizeNames: Record<string, string> = {
      small: language === 'Hindi' ? 'छोटा (14px)' : 'Small (14px)',
      medium: language === 'Hindi' ? 'मध्यम (16px)' : 'Medium (16px)',
      large: language === 'Hindi' ? 'बड़ा (18px)' : 'Large (18px)'
    };
    onPushToast(
      language === 'Hindi' ? '🔍 फ़ॉन्ट आकार बदला गया' : '🔍 Font Size Changed',
      `${sizeNames[size]} ${language === 'Hindi' ? 'सफलतापूर्वक लागू किया गया।' : 'applied successfully.'}`
    );
  };

  const handleTogglePermanentNotification = (val: boolean) => {
    if (setNotificationEnabled) {
      setNotificationEnabled(val);
    }
    if (window.AndroidAlarm && typeof window.AndroidAlarm.setPermanentNotificationEnabled === 'function') {
      window.AndroidAlarm.setPermanentNotificationEnabled(val);
    }
    onPushToast(
      val ? '🔔 स्थायी नोटिफिकेशन चालू' : '🔕 स्थायी नोटिफिकेशन बंद',
      val 
        ? 'आज का पंचांग व शुभ समय फोन के नोटिफिकेशन बार में हमेशा पिन रहेगा।'
        : 'नोटिफिकेशन बार से स्थायी पंचांग पिन हटा दिया गया है।'
    );
  };

  return (
    <div id="settings_screen_root" className="space-y-4 sm:space-y-5 text-left font-sans">
      
      {/* 1. TOP 2-SEGMENT SWITCHER (SEGMENTED CONTROL) */}
      <div className="flex p-1 bg-stone-200/80 dark:bg-zinc-900/90 rounded-2xl border !border-[#FF9933]/35 dark:!border-[#FF9933]/25 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSegment('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSegment === 'settings'
              ? 'bg-white dark:bg-zinc-950 text-orange-950 dark:text-amber-300 shadow-xs border border-orange-200/60 dark:border-amber-500/30'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Settings className="w-4 h-4 text-orange-600 dark:text-amber-400" />
          <span>⚙️ ऐप सेटिंग्स</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSegment('tools')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSegment === 'tools'
              ? 'bg-white dark:bg-zinc-950 text-orange-950 dark:text-amber-300 shadow-xs border border-orange-200/60 dark:border-amber-500/30'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-orange-600 dark:text-amber-400" />
          <span>🎨 पोस्टर व विजेट्स</span>
        </button>
      </div>

      {activeSegment === 'settings' ? (
        /* =========================================================================
           SEGMENT 1: ⚙️ ऐप सेटिंग्स (APP SETTINGS TAB)
           ========================================================================= */
        <div className="space-y-4 animate-fade-in">
          
          {/* A. दृश्य एवं भाषा प्राथमिकताएं */}
          <div className="p-3.5 sm:p-4.5 rounded-3xl bg-white dark:bg-zinc-950/20 border !border-[#FF9933]/40 dark:!border-[#FF9933]/25 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b !border-[#FF9933]/20 pb-2.5">
              <Sun className="w-4 h-4 text-orange-600 dark:text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-amber-100 font-serif">
                दृश्य एवं भाषा प्राथमिकताएं
              </h3>
            </div>

            {/* 1. Theme Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase">
                  ऐप थीम (रंग शैली)
                </label>
                <span className="text-[11px] text-slate-400">
                  {settings.theme === 'light' ? 'दिन के समय' : 'रात्रि के समय'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleChangeTheme('light')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    settings.theme === 'light'
                      ? 'bg-orange-500/10 border-orange-500 dark:border-amber-400 shadow-xs'
                      : 'bg-slate-500/5 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-amber-100 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ☀️ लाइट मोड
                    </span>
                    {settings.theme === 'light' && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-amber-400" />}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                    दिन के समय स्पष्ट व पारंपरिक वैदिक रूप।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTheme('dark')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    settings.theme === 'dark'
                      ? 'bg-amber-950/20 border-amber-500 shadow-xs'
                      : 'bg-slate-500/5 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-amber-100 flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      🌙 डार्क मोड
                    </span>
                    {settings.theme === 'dark' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                    रात्रि में नेत्रों की सुरक्षा व बैटरी बचत।
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Language Selector */}
            <div className="space-y-2 pt-1 border-t border-slate-500/10 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-orange-500" /> भाषा (Language)
                </label>
                <span className="text-[11px] text-slate-400">
                  {language === 'Hindi' ? 'हिन्दी में' : 'In English'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {(['Hindi', 'English'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleChangeLanguage(lang)}
                    className={`py-2.5 px-3 rounded-xl border text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      language === lang
                        ? 'bg-orange-500/10 border-orange-500 dark:border-amber-400 text-orange-950 dark:text-amber-200 shadow-xs'
                        : 'bg-slate-500/5 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {language === lang && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-amber-400" />}
                    <span>{lang === 'Hindi' ? 'हिन्दी (Hindi)' : 'English'}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                पूरे पंचांग, मुहूर्त, चौघड़िया और त्योहारों के विवरण की भाषा बदलें।
              </p>
            </div>

            {/* 3. Font Size Scaler */}
            <div className="space-y-2 pt-1 border-t border-slate-500/10 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-orange-500" /> अक्षरों का आकार (Font Size)
                </label>
                <span className="text-[11px] font-bold text-orange-600 dark:text-amber-400 font-mono">
                  {settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px (मानक)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'small', label: 'छोटा (14px)', desc: 'अधिक सामग्री' },
                  { id: 'medium', label: 'मध्यम (16px)', desc: 'अनुशंसित' },
                  { id: 'large', label: 'बड़ा (18px)', desc: 'स्पष्ट दृष्टि' }
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => handleChangeFontSize(sz.id as 'small' | 'medium' | 'large')}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      (settings.fontSize || 'medium') === sz.id
                        ? 'bg-orange-500/10 border-orange-500 dark:border-amber-400 text-orange-950 dark:text-amber-200 font-black shadow-xs'
                        : 'bg-slate-500/5 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold">{sz.label}</span>
                    <span className="text-[9.5px] text-slate-400">{sz.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* B. स्थायी पंचांग नोटिफिकेशन कार्ड (NOTIFICATION BAR PIN) */}
          <div className="p-3.5 sm:p-4.5 rounded-3xl bg-white dark:bg-zinc-950/20 border !border-[#FF9933]/40 dark:!border-[#FF9933]/25 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-600 dark:text-amber-400 shrink-0" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-amber-100 font-serif">
                    स्थायी पंचांग नोटिफिकेशन
                  </h4>
                  <span className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                    notificationEnabled
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20'
                  }`}>
                    {notificationEnabled ? '🟢 सक्रिय' : '⚪ बंद'}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-normal">
                  बिना ऐप खोले अपने फोन के नोटिफिकेशन बार में आज की तिथि, शुभ चौघड़िया और राहुकाल समय हमेशा लाइव देखें।
                </p>
              </div>

              {/* Accessible Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={notificationEnabled}
                aria-label="स्थायी पंचांग नोटिफिकेशन टॉगल करें"
                onClick={() => handleTogglePermanentNotification(!notificationEnabled)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer p-1 rounded-xl transition-all shrink-0"
              >
                <div className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 border ${
                  notificationEnabled 
                    ? 'bg-emerald-600 border-emerald-500 justify-end shadow-xs' 
                    : 'bg-zinc-300 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700 justify-start'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </button>
            </div>
          </div>

          {/* C. पंचांग इंजन व प्रामाणिकता (SWISS EPHEMERIS & LEGAL) */}
          <div className="p-3.5 sm:p-4.5 rounded-3xl bg-white dark:bg-zinc-950/20 border !border-[#FF9933]/40 dark:!border-[#FF9933]/25 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b !border-[#FF9933]/20 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-amber-100 font-serif">
                पंचांग गणना की शुद्धता एवं तकनीकी आधार
              </h4>
            </div>

            <p className="text-[12px] text-slate-600 dark:text-slate-350 leading-relaxed">
              इस ऐप में सभी ग्रह स्पष्ट अंश, सूर्योदय-सूर्यास्त और नक्षत्र की गणना नासा (NASA) आधारित विश्व-प्रसिद्ध <strong>Swiss Ephemeris (GNU GPL v2/v3)</strong> शुद्ध गणितीय इंजन द्वारा की जाती है। यह दृक-गणित पर आधारित पूर्णतः वैज्ञानिक व प्रामाणिक पंचांग है।
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <a
                href="https://github.com/vinayaksaxena1-maker/Sanatan_Watch"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 min-h-[40px] rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-950 dark:text-amber-200 border border-orange-500/30 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>GitHub रिपॉजिटरी</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsLicenseModalOpen(true)}
                className="px-3 py-1.5 min-h-[40px] rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>📜 GPL v2/v3 लाइसेंस</span>
              </button>

              <a
                href="/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 min-h-[40px] rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-zinc-700 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>गोपनीयता नीति (Privacy)</span>
              </a>
            </div>

            {/* Disclaimer */}
            <div className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>खगोलीय अस्वीकरण:</strong> भू-स्थानिक ऊंचाई एवं वायुमंडलीय अपवर्तन के कारण विभिन्न स्थानों पर 1 से 2 मिनट का सूक्ष्म समय-अंतर संभव है।
              </span>
            </div>
          </div>

          {/* D. डेवलपर, संपर्क व संस्करण */}
          <div className="text-center py-2 space-y-1.5 text-slate-500 dark:text-slate-400 font-sans">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              सनातन घड़ी v1.0.0 (वैदिक कालचक्र यंत्र)
            </p>
            <p className="text-[11px] text-orange-600 dark:text-amber-400 font-semibold">
              Innovix • Proudly Crafted in India 🇮🇳
            </p>
            <a
              href="mailto:vinayaksaxena1@gmail.com"
              className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-amber-300 underline font-mono pt-1"
            >
              <Mail className="w-3 h-3" />
              <span>सुझाव या सहायता: vinayaksaxena1@gmail.com</span>
            </a>
          </div>

        </div>
      ) : (
        /* =========================================================================
           SEGMENT 2: 🎨 पोस्टर व विजेट टूल्स (TOOLS TAB)
           ========================================================================= */
        <div className="space-y-4 sm:space-y-5 animate-fade-in">
          
          {/* A. दैनिक पंचांग पोस्टर मेकर */}
          <div className="p-3.5 sm:p-4.5 bg-white dark:bg-zinc-950/20 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl shadow-xs text-left">
            <div className="flex items-center justify-center gap-2 mb-3 border-b !border-[#FF9933]/20 pb-2">
              <span className="text-lg">📲</span>
              <h3 className="text-[16px] sm:text-[17px] font-bold font-serif text-slate-800 dark:text-amber-100 text-center">
                सुप्रभात एवं दैनिक पंचांग पोस्टर (WhatsApp / Social Share)
              </h3>
            </div>
            
            <PosterGenerator 
              panchang={panchangInfo} 
              city={city} 
              activeMuhurats={activeMuhurats} 
            />
          </div>

          {/* B. होम स्क्रीन विजेट्स एवं 3-स्टेप गाइड */}
          <div className="p-3.5 sm:p-4.5 bg-white dark:bg-zinc-950/20 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl shadow-xs text-left space-y-3">
            <div className="flex items-center justify-center gap-2 border-b !border-[#FF9933]/20 pb-2">
              <Smartphone className="w-5 h-5 text-orange-600 dark:text-amber-400" />
              <h3 className="text-[16px] sm:text-[17px] font-bold font-serif text-slate-800 dark:text-amber-100 text-center">
                मोबाइल होम स्क्रीन विजेट्स (Android Widgets)
              </h3>
            </div>

            {/* 3-Step Setup Guide Card */}
            <div className="p-3 rounded-2xl bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/25 space-y-2">
              <span className="text-xs font-bold text-orange-900 dark:text-amber-200 block font-serif">
                📖 अपने फोन की होम स्क्रीन पर विजेट कैसे लगाएं:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-350">
                <div className="p-2 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-orange-500/15 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>होम स्क्रीन के खाली स्थान पर उंगली दबाकर रखें (Long Press)।</span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-orange-500/15 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>मेनू से <strong>'Widgets'</strong> चुनें और <strong>'सनातन घड़ी'</strong> खोजें।</span>
                </div>
                <div className="p-2 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-orange-500/15 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>पसंद का साइज (<strong>4x2</strong> या <strong>2x2</strong>) ड्रैग करके स्क्रीन पर लगाएं।</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Widget Preview */}
            <WidgetSimulator 
              panchang={panchangInfo} 
              muhurats={activeMuhurats} 
              city={city} 
            />
          </div>

        </div>
      )}

      {/* MODAL: Swiss Ephemeris GPL Open Source License Viewer */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-[#1C1714] border !border-[#FF9933]/45 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[82vh] flex flex-col">
            <div className="flex justify-between items-center border-b !border-[#FF9933]/20 pb-2.5 mb-2.5">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-amber-200 font-serif flex items-center gap-1.5">
                <span>📜</span> Swiss Ephemeris & GPL License
              </h3>
              <button 
                type="button"
                onClick={() => setIsLicenseModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-base min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
                aria-label="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs text-slate-350 leading-relaxed font-sans">
              <p>
                <strong>Swiss Ephemeris</strong> is a high-precision astronomical computation library published by Astrodienst AG and licensed under the <strong>GNU General Public License (GPL v2/v3)</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] text-amber-100">
                swisseph-wasm: WebAssembly compiled engine<br />
                Architecture: Dedicated WebWorker thread<br />
                Calculation basis: NASA JPL planetary ephemeris
              </div>
              <p>
                In strict compliance with GPL v2/v3 licensing requirements, the complete source code of this application and its astronomical computation routines are publicly available:
              </p>
              <a
                href="https://github.com/vinayaksaxena1-maker/Sanatan_Watch"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono font-bold flex items-center justify-between"
              >
                <span>github.com/vinayaksaxena1-maker/Sanatan_Watch</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[11px] text-slate-400 pt-1">
                You may inspect, review, or verify the exact mathematical algorithms used for Lahiri Ayanamsha, sunrise/sunset, and Shubh Muhurat calculations.
              </p>
            </div>

            <div className="border-t !border-[#FF9933]/20 pt-2.5 mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLicenseModalOpen(false)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                समझ आ गया (बंद करें)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
