/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Check,
  Sparkles,
  Bell,
  Type
} from 'lucide-react';
import { SettingsState } from '../types';
import { getTranslation } from '../utils/translations';

interface SettingsScreenProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  onPushToast: (title: string, body: string) => void;
}

export function SettingsScreen({ settings, setSettings, onPushToast }: SettingsScreenProps) {
  const language = settings.language || 'English';

  const handleChangeTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
    
    let title = language === 'Hindi' ? '☀️ लाइट मोड सक्रिय' : '☀️ Light Mode Active';
    let body = language === 'Hindi' ? 'रोशनी के अनुकूल लाइट थीम सक्रिय की गई।' : 'Light theme optimized for daylight active.';
    if (theme === 'dark') {
      title = language === 'Hindi' ? '🌙 डार्क मोड सक्रिय' : '🌙 Dark Mode Active';
      body = language === 'Hindi' ? 'आँखों की थकान कम करने के लिए डार्क थीम सक्रिय की गई।' : 'Dark theme active to reduce eye fatigue.';
    }
    
    onPushToast(title, body);
  };

  const handleChangeLanguage = (lang: 'English' | 'Hindi') => {
    setSettings(prev => ({
      ...prev,
      language: lang
    }));
    onPushToast(
      lang === 'Hindi' ? '🌐 भाषा बदली गई' : '🌐 Language Changed',
      lang === 'Hindi' ? 'ऐप की भाषा को सफलतापूर्वक बदल दिया गया है।' : 'App language has been changed successfully.'
    );
  };

  const handleChangeFontSize = (size: 'small' | 'medium' | 'large') => {
    setSettings(prev => ({
      ...prev,
      fontSize: size
    }));
    onPushToast(
      language === 'Hindi' ? '🔍 फ़ॉन्ट आकार बदला गया' : '🔍 Font Size Changed',
      language === 'Hindi' ? 'टेक्स्ट का आकार सफलतापूर्वक बदल दिया गया है।' : 'Text size has been changed successfully.'
    );
  };

  const handleToggleNotification = (key: keyof SettingsState['notifications']) => {
    setSettings(prev => {
      const nextNotifs = {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      };
      return {
        ...prev,
        notifications: nextNotifs
      };
    });
    
    const friendlyNames: Record<keyof SettingsState['notifications'], string> = {
      morningPanchang: language === 'Hindi' ? 'सूर्योदय पंचांग सूचना' : 'Morning Panchang Info',
      festivalReminder: language === 'Hindi' ? 'त्यौहार अलर्ट' : 'Festival Reminder',
      ekadashiReminder: language === 'Hindi' ? 'एकादशी अनुस्मारक' : 'Ekadashi Reminder',
      purnimaReminder: language === 'Hindi' ? 'पूर्णिमा अनुस्मारक' : 'Purnima Reminder',
      muhuratReminder: language === 'Hindi' ? 'शुभ मुहूर्त अलार्म' : 'Muhurat Reminder'
    };
    
    const stateActive = !settings.notifications[key];
    onPushToast(
      stateActive 
        ? (language === 'Hindi' ? '🔔 अलार्म सक्रिय' : '🔔 Alarm Activated') 
        : (language === 'Hindi' ? '🔕 अलार्म निष्क्रिय' : '🔕 Alarm Deactivated'),
      `${friendlyNames[key]} ${language === 'Hindi' ? 'सफलतापूर्वक कॉन्फ़िगर किया गया।' : 'configured successfully.'}`
    );
  };

  return (
    <div id="settings_screen_root" className="space-y-6 text-left">
      
      {/* Settings Panel Header */}
      <div className="glass-card-light dark:glass-card-dark p-5">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-orange-600" />
          <h2 className="text-sm font-black text-slate-400 dark:text-amber-500 uppercase tracking-widest font-mono">
            {getTranslation(language, 'appSettings')}
          </h2>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {language === 'Hindi' 
            ? "पंचांग गणना, और यूजर इंटरफेस (UI) को अनुकूलित करें।" 
            : "Customize panchang calculations and user interface (UI)."}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Visual & Localization block */}
        <div className="glass-card-light dark:glass-card-dark p-5 space-y-5">
          <h3 className="text-xs font-black text-slate-700 dark:text-amber-100 uppercase tracking-wider border-b border-orange-100/35 pb-2">
            {language === 'Hindi' ? "दृश्य और भाषा" : "Visuals & Language"}
          </h3>
          
          {/* Theme switcher */}
          <div className="space-y-3 pb-1 border-b border-dashed border-orange-100/35 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse animate-spin-slow" />
              <div>
                <span className="text-2xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  {getTranslation(language, 'colorTheme')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {language === 'Hindi' 
                    ? "अपने आध्यात्मिक डिजिटल अनुभव के अनुसार ऐप की थीम चुनें।" 
                    : "Select app theme according to your spiritual experience."}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 pt-1.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeTheme('light')}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    settings.theme === 'light'
                      ? 'bg-orange-100 border-orange-400 text-orange-950 font-black shadow-2xs'
                      : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 border-orange-100/25 text-slate-600 dark:text-slate-350'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${settings.theme === 'light' ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span>{getTranslation(language, 'themeLight')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTheme('dark')}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    settings.theme === 'dark'
                      ? 'bg-orange-500 text-white border-orange-400 font-black shadow-2xs'
                      : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 border-orange-100/25 text-slate-600 dark:text-slate-350'
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 ${settings.theme === 'dark' ? 'text-white' : 'text-slate-400'}`} />
                  <span>{getTranslation(language, 'themeDark')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary Language */}
          <div className="space-y-2 pt-1 border-t border-dashed border-orange-100/35 pt-4">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> {getTranslation(language, 'languagePreference')}
            </label>
            <div className="flex gap-2">
              {(['English', 'Hindi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleChangeLanguage(lang)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    settings.language === lang
                      ? 'bg-orange-100 border-orange-400 text-orange-950 font-black'
                      : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 border-orange-100/35 text-slate-600 dark:text-slate-350'
                  }`}
                >
                  {settings.language === lang && <Check className="w-3 h-3 text-orange-600 shrink-0" />}
                  {lang === 'Hindi' ? 'हिन्दी (Hindi)' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Settings */}
          <div className="space-y-2 pt-1 border-t border-dashed border-orange-100/35 pt-4">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-slate-400" /> {language === 'Hindi' ? 'फ़ॉन्ट आकार' : 'Font Size Preference'}
            </label>
            <div className="flex gap-2">
              {[
                { id: 'small', labelHindi: 'छोटा', labelEng: 'Small' },
                { id: 'medium', labelHindi: 'मध्यम', labelEng: 'Medium' },
                { id: 'large', labelHindi: 'बड़ा', labelEng: 'Large' }
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleChangeFontSize(size.id as 'small' | 'medium' | 'large')}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    (settings.fontSize || 'medium') === size.id
                      ? 'bg-orange-100 border-orange-400 text-orange-950 font-black'
                      : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 border-orange-100/35 text-slate-600 dark:text-slate-350'
                  }`}
                >
                  {(settings.fontSize || 'medium') === size.id && <Check className="w-3 h-3 text-orange-600 shrink-0" />}
                  {language === 'Hindi' ? size.labelHindi : size.labelEng}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Astro computation engine metrics */}
      <div className="glass-card-light dark:glass-card-dark p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center font-bold text-orange-600">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-serif">पंचांग गणना इंजन विवरण</h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-400 leading-tight mt-0.5">
                अक्षांश और ग्रहों की सटीक गणना के लिए <strong>Swiss Ephemeris WebAssembly (AGPL-v3)</strong> इंजन का उपयोग।
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-right text-[10px] font-mono shrink-0">
            <div>
              <span className="text-slate-400 block">इंजन:</span>
              <span className="font-extrabold text-[#A64B00] dark:text-[#FFB366]">Swiss Ephemeris</span>
            </div>
            <div>
              <span className="text-slate-400 block">ऑफसेट:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200">Local WASM Worker</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-orange-100/35 pt-3 text-[9px] text-slate-400 leading-relaxed flex flex-col gap-2">
          <p>
            Astronomical calculation engine is powered by open-source Swiss Ephemeris under AGPL v3. Source code for the standalone calculation worker module (Part B) is available on GitHub:{' '}
            <a 
              href="https://github.com/vinayaksaxena1-maker/Sanatan_Watch_AstroEngine" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-650 dark:text-orange-400 underline font-mono font-bold"
            >
              View Worker Source Code on GitHub
            </a>
          </p>
          <div className="border-t border-dashed border-orange-100/20 pt-2 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Legal & Privacy</span>
            <a 
              href="/privacy-policy.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-650 dark:text-orange-400 underline font-bold text-[10px]"
            >
              Privacy Policy
            </a>
          </div>

          <div className="border-t border-dashed border-orange-100/20 pt-2.5 flex flex-col gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
            <div className="flex justify-between items-center">
              <span>{language === 'Hindi' ? 'कंपनी / संगठन:' : 'Company / Organization:'}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">Innovix Solutions</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{language === 'Hindi' ? 'एप्लीकेशन संस्करण:' : 'App Version:'}</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">v1.0.0 (First Edition)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{language === 'Hindi' ? 'पहल / निर्माण:' : 'Initiative:'}</span>
              <span className="font-bold text-orange-600 dark:text-amber-400 flex items-center gap-1">
                🇮🇳 Proudly Made in India | Make for India
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
