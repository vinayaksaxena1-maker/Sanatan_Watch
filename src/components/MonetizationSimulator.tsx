import React, { useState } from 'react';
import {
  Check,
  Flame,
  Star,
  ShieldCheck,
  CreditCard,
  Ban
} from 'lucide-react';
import { SettingsState } from '../types';

interface MonetizationSimulatorProps {
  settings: SettingsState;
  onToggleSubscription: (premiumActive: boolean) => void;
  onPushToast: (title: string, body: string) => void;
}

export function MonetizationSimulator({ settings, onToggleSubscription, onPushToast }: MonetizationSimulatorProps) {
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const simulateCheckout = (planName: string, chargeAmount: string, enablePremium: boolean) => {
    setProcessingPlan(planName);
    onPushToast('💳 पेमेंट गेटवे प्रारंभ किया जा रहा है...', 'सुरक्षित गेटवे परीक्षण (सैंडबॉक्स) कनेक्शन स्थापित किया जा रहा है।');
    
    setTimeout(() => {
      onToggleSubscription(enablePremium);
      setProcessingPlan(null);
      if (enablePremium) {
        onPushToast(
          '✨ स्वर्ण प्रीमियम सक्रिय हो गया!',
          `हरि ओम! आपका प्रीमियम खाता सफलतापूर्वक उन्नत कर दिया गया है। मुख्य विज्ञापन अब हटा दिए गए हैं।`
        );
      } else {
        onPushToast(
          '🍃 निःशुल्क योजना पर वापस लाया गया',
          `विज्ञापन बैनर और मूल सीमाएं फिर से लागू हो गई हैं।`
        );
      }
    }, 2000);
  };

  return (
    <div id="monetization_simulator_root" className="space-y-6 text-left font-sans">
      
      {/* Intro details */}
      <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 font-serif">धार्मिक समय प्रीमियम कार्यक्रम (Premium)</h2>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          सटीक पंचांग गणनाओं के लिए सर्वर रखरखाव खर्च में साझा सहयोग करें। विज्ञापन हटाने और शुभ मुहूर्त के त्वरित अलार्म पाने के लिए प्रीमियम सदस्य बनें।
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        
        {/* FREE TIER CARD */}
        <div className={`glass-card-light dark:glass-card-dark p-5 flex flex-col justify-between text-left h-full transition-all border ${
          !settings.monetizationUnlock ? 'ring-2 ring-orange-500/30' : 'opacity-85'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono block">साधक श्रेणी (Sadhaka)</span>
            <h3 className="text-lg font-black font-serif text-slate-800 dark:text-slate-100 mt-1">मूल पंचांग योजना (Standard)</h3>
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 mt-2 block">₹0 / हमेशा के लिए निःशुल्क</span>

            <ul className="space-y-2.5 mt-5 text-[11px] text-slate-650 dark:text-slate-350">
              <li className="flex gap-2 items-start leading-relaxed">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                दैनिक चंद्र तिथि और नक्षत्र का विवरण
              </li>
              <li className="flex gap-2 items-start leading-relaxed">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                सूर्यास्त और सूर्योदय की सटीक गणनाएं
              </li>
              <li className="flex gap-2 items-start leading-relaxed text-slate-400 dark:text-slate-500 line-through">
                <Ban className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                100% विज्ञापन-मुक्त अनुभव
              </li>
              <li className="flex gap-2 items-start leading-relaxed text-slate-400 dark:text-slate-500 line-through">
                <Ban className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                शुभ मुहूर्त एवं गोचर के त्वरित मोबाइल अलार्म
              </li>
              <li className="flex gap-2 items-start leading-relaxed text-slate-400 dark:text-slate-500 line-through">
                <Ban className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                हाई-डेफिनिशन पंचांग पोस्टर डाउनलोड सुविधा
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-orange-100/30 dark:border-zinc-800/40">
            {settings.monetizationUnlock ? (
              <button
                disabled={processingPlan !== null}
                onClick={() => simulateCheckout('Free Plan', '₹0', false)}
                className="w-full py-2.5 rounded-2xl bg-slate-500/10 hover:bg-slate-500/15 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {processingPlan === 'Free Plan' ? 'प्रसंस्करण हो रहा है...' : 'निःशुल्क योजना पर वापस जाएं'}
              </button>
            ) : (
              <div className="text-center py-2.5 text-xs font-bold text-green-700 bg-green-500/10 rounded-xl border border-green-500/20 uppercase tracking-wider">
                वर्तमान में सक्रिय योजना
              </div>
            )}
          </div>
        </div>

        {/* PREMIUM GOLD TIER CARD */}
        <div className={`glass-card-light dark:glass-card-dark p-5 flex flex-col justify-between text-left h-full transition-all relative overflow-hidden border-2 ${
          settings.monetizationUnlock 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
            : 'border-orange-500 bg-linear-to-b from-amber-500/5 to-orange-500/5'
        }`}>
          {/* Accent Ribbon */}
          <div className="absolute right-[-30px] top-[14px] rotate-45 bg-[#FF9933] text-white text-[8px] font-black uppercase tracking-wider py-1 px-8 shadow-sm">
            सर्वश्रेष्ठ विकल्प
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-amber-600 block uppercase tracking-widest">आचार्य श्रेणी (Acharya)</span>
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
            </div>
            
            <h3 className="text-lg font-black font-serif text-slate-800 dark:text-amber-100 mt-1 flex items-center gap-1.5 animate-pulse">
              स्वर्ण प्रीमियम सदस्यता
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md px-1.5 py-0.5 text-[8.5px] tracking-wide uppercase font-black shrink-0">
                विज्ञापन-मुक्त
              </span>
            </h3>
            
            <span className="text-xs font-bold text-[#A64B00] dark:text-[#FFB366] mt-2 block">
              ₹149 <span className="text-slate-400 font-normal">/ प्रति महीना (सहयोग शुल्क)</span>
            </span>

            <ul className="space-y-2.5 mt-5 text-[11px] text-slate-650 dark:text-slate-350">
              <li className="flex gap-2 items-start leading-relaxed font-extrabold text-slate-800 dark:text-amber-100">
                <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                100% विज्ञापन-मुक्त अनुभव
              </li>
              <li className="flex gap-2 items-start leading-relaxed">
                <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                हाई-डेफिनिशन पंचांग पोस्टर डाउनलोड सुविधा
              </li>
              <li className="flex gap-2 items-start leading-relaxed">
                <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                सभी आकार के होम स्क्रीन विजेट का पूर्ण उपयोग
              </li>
              <li className="flex gap-2 items-start leading-relaxed">
                <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                सच्चे सूर्य सिद्धांत सूक्ष्म गणनाओं तक सीधी पहुंच
              </li>
              <li className="flex gap-2 items-start leading-relaxed">
                <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                असीमित शुभ पंचांग गोचर और एकादशी व्रत अलार्म
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-orange-100/30 dark:border-zinc-800/40">
            {settings.monetizationUnlock ? (
              <div className="text-center py-2.5 text-xs font-bold text-amber-800 bg-amber-500/10 rounded-xl border border-amber-520 uppercase tracking-normal flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                स्वर्ण प्रीमियम अलार्म चालू है
              </div>
            ) : (
              <button
                disabled={processingPlan !== null}
                onClick={() => simulateCheckout('Gold Premium', '₹149', true)}
                className="w-full py-2.5 rounded-2xl bg-linear-to-r from-orange-600 via-orange-500 to-[#FF9933] hover:from-orange-700 hover:to-[#FF8800] text-white text-xs font-black border-b-2 border-orange-700 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                {processingPlan === 'Gold Premium' ? 'पेमेंट गेटवे प्रारंभ किया जा रहा है...' : 'प्रीमियम सदस्य बनें (सुरक्षित परीक्षण)'}
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
