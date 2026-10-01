import React from 'react';
import { SettingsState } from '../types';

interface MonetizationSimulatorProps {
  settings: SettingsState;
  onToggleSubscription: (premiumActive: boolean) => void;
  onPushToast: (title: string, body: string) => void;
}

export function MonetizationSimulator({ settings, onToggleSubscription, onPushToast }: MonetizationSimulatorProps) {
  const isPremium = !!settings.monetizationUnlock;

  const handleToggle = () => {
    const nextState = !isPremium;
    onToggleSubscription(nextState);
    if (nextState) {
      onPushToast(
        '✨ स्वर्ण प्रीमियम सक्रिय हो गया!',
        'हरि ओम! आपका प्रीमियम खाता उन्नत कर दिया गया है।'
      );
    } else {
      onPushToast(
        '🍃 निःशुल्क योजना पर वापस लाया गया',
        'प्रीमियम सीमाएं फिर से लागू हो गई हैं।'
      );
    }
  };

  return (
    <div id="monetization_simulator_root" className="text-left font-sans">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/5 dark:bg-brand-card border border-orange-100/20 dark:border-brand-border">
        <div className="pr-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-brand-text-pri">
            {isPremium ? 'स्वर्ण प्रीमियम सक्रिय है (Premium Active)' : 'स्वर्ण प्रीमियम निष्क्रिय है (Premium Inactive)'}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-brand-text-mut mt-1">
            {isPremium 
              ? 'आप सभी स्वर्ण पंचांग एवं विशेष मुहूर्त अलार्म का उपयोग कर सकते हैं।' 
              : 'प्रीमियम सुविधाओं (विज्ञापन मुक्त अनुभव, सभी होम विजेट्स) को सक्रिय करें।'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-97 select-none shrink-0 ${
            isPremium
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20'
              : 'bg-linear-to-r from-orange-600 to-[#FF9933] hover:brightness-110 text-white border-transparent'
          }`}
        >
          {isPremium ? 'प्रीमियम हटाएं (Disable)' : 'प्रीमियम सक्रिय करें (Enable)'}
        </button>
      </div>
    </div>
  );
}
