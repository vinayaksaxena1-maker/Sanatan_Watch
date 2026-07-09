import React, { useState } from 'react';
import { Bell, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationSimulatorProps {
  notificationsList: AppNotification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  onPushToast: (title: string, body: string) => void;
}

export function NotificationSimulator({ notificationsList, setNotificationsList, onPushToast }: NotificationSimulatorProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customTime, setCustomTime] = useState('06:00 AM');
  
  // Quick preferences state preloaded
  const [prefPanchang, setPrefPanchang] = useState(true);
  const [prefFestival, setPrefFestival] = useState(true);
  const [prefEkadashi, setPrefEkadashi] = useState(true);
  const [prefPurnima, setPrefPurnima] = useState(true);
  const [prefMuhurat, setPrefMuhurat] = useState(true);

  // Clear single or all logs
  const handleClearAll = () => {
    setNotificationsList([]);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customBody) return;

    const newAlert: AppNotification = {
      id: `alert_${Date.now()}`,
      title: customTitle,
      body: customBody,
      time: customTime,
      type: 'custom',
      isRead: false
    };

    setNotificationsList([newAlert, ...notificationsList]);
    onPushToast(customTitle, `[समय: ${customTime}] ${customBody}`);
    
    setCustomTitle('');
    setCustomBody('');
  };

  // Simulates a test immediate push
  const handleTestTrigger = (type: 'morning' | 'festival' | 'ekadashi' | 'muhurat') => {
    let title = '';
    let body = '';
    switch(type) {
      case 'morning':
        title = '🌅 आज का शुभ पंचांग';
        body = 'आज शुक्ल पक्ष की एकादशी है। शुभ समय अभिजीत मुहूर्त दोपहर 11:45 से प्रारंभ होगा। प्रभु स्मरण करें!';
        break;
      case 'festival':
        title = '🚩 आगामी त्योहार अनुस्मारक';
        body = 'कल देवोत्थान एकादशी का पावन पर्व है। व्रत संकल्प की तैयारी करें एवं हरि कथा सुनें।';
        break;
      case 'ekadashi':
        title = '🥛 व्रत एकादशी सूचना';
        body = 'आज निर्जला एकादशी व्रत है! बिना जल ग्रहण किए अन्न त्याग कर ध्यान लगाना उत्तम फलदायी है।';
        break;
      default:
        title = '🔔 शुभ मुहूर्त प्रारंभ';
        body = 'अमृत चौघड़िया मुहूर्त प्रारंभ हो गया है। मांगलिक कार्यों के अनुबंध हेतु समय सर्वोत्तम है!';
        break;
    }

    const testAlert: AppNotification = {
      id: `alert_${Date.now()}`,
      title,
      body,
      time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      type: type === 'ekadashi' ? 'festival' : type,
      isRead: false
    };

    setNotificationsList([testAlert, ...notificationsList]);
    onPushToast(title, body);
  };

  return (
    <div id="notification_simulator_root" className="glass-card-light dark:glass-card-dark p-4 sm:p-5 shadow-xs text-left font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Toggle Notification settings (Left Pane) */}
        <div className="md:col-span-7 space-y-4 sm:space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2 font-serif">
              <Bell className="w-5 h-5 text-orange-600 animate-bounce" />
              भक्ति मय सूचना और अलार्म
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
              शुभ समय, आगामी त्योहारों और महत्वपूर्ण एकादशी व्रत के लिए सूचनाएं (रिमाइंडर) सेट करें और धर्म-कर्म संबधी सूचनाओं से हमेशा जुड़े रहें।
            </p>
          </div>

          {/* Preferences Switches List */}
          <div className="space-y-2.5 bg-orange-500/5 dark:bg-orange-950/10 p-3 sm:p-4 rounded-2xl border border-orange-100/30">
            <h3 className="text-xs font-bold text-orange-900 dark:text-orange-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              अलार्म सेटिंग्स चालू/बंद करें
            </h3>

            {/* Switch Items */}
            <div className="flex items-center justify-between p-1.5 hover:bg-orange-500/5 rounded-xl transition-all">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">प्रातःकाल पंचांग सूचना</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">उदयकाल सूर्योदय के समय दैनिक पंचांग और आज का संदेश पाएं</span>
              </div>
              <input
                type="checkbox"
                checked={prefPanchang}
                onChange={(e) => setPrefPanchang(e.target.checked)}
                className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-650 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-350 dark:border-zinc-700 checked:border-orange-600 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-orange-550/5 rounded-xl transition-all">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">आगामी त्योहार की पूर्व सूचना</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">मुख्य त्योहारों से ३ दिन पहले तैयारी की जानकारी एवं अलार्म</span>
              </div>
              <input
                type="checkbox"
                checked={prefFestival}
                onChange={(e) => setPrefFestival(e.target.checked)}
                className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-655 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-350 dark:border-zinc-700 checked:border-orange-600 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-orange-550/5 rounded-xl transition-all">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">एकादशी व्रत अनुस्मारक</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">हर महीने आने वाली पावन एकादशी व्रत के दिन प्रभु स्मरण सूचना</span>
              </div>
              <input
                type="checkbox"
                checked={prefEkadashi}
                onChange={(e) => setPrefEkadashi(e.target.checked)}
                className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-655 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-350 dark:border-zinc-700 checked:border-orange-600 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-orange-550/5 rounded-xl transition-all">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">पूर्णिमा और अमावस्या तिथि</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">चंद्र चक्र, स्नान-दान पर्व और महत्वपूर्ण हिंदू तिथियों की सूचना</span>
              </div>
              <input
                type="checkbox"
                checked={prefPurnima}
                onChange={(e) => setPrefPurnima(e.target.checked)}
                className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-655 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-350 dark:border-zinc-700 checked:border-orange-600 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between p-1.5 hover:bg-orange-550/5 rounded-xl transition-all">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">शुभ मुहूर्त प्रारंभ अनुस्मारक</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">अभिजीत और अमृत काल चौघड़िया मुहूर्त शुरू होने से १० मिनट पहले सूचना</span>
              </div>
              <input
                type="checkbox"
                checked={prefMuhurat}
                onChange={(e) => setPrefMuhurat(e.target.checked)}
                className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-655 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-350 dark:border-zinc-700 checked:border-orange-600 shrink-0"
              />
            </div>
          </div>

          {/* Quick Sandbox Tools */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-amber-500 uppercase tracking-wider font-mono">टेस्ट नोटिफिकेशन सैंडबॉक्स</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleTestTrigger('morning')}
                className="p-2.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-900 dark:text-orange-400 rounded-xl font-bold cursor-pointer text-2xs transition-all"
              >
                🌄 दैनिक पंचांग भेजें
              </button>
              <button
                onClick={() => handleTestTrigger('festival')}
                className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-950 dark:text-amber-300 rounded-xl font-bold cursor-pointer text-2xs transition-all"
              >
                🚩 कल का त्योहार भेजें
              </button>
              <button
                onClick={() => handleTestTrigger('ekadashi')}
                className="p-2.5 bg-emerald-550/5 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-950 dark:text-emerald-400 rounded-xl font-bold cursor-pointer text-2xs transition-all"
              >
                🥛 एकादशी व्रत भेजें
              </button>
              <button
                onClick={() => handleTestTrigger('muhurat')}
                className="p-2.5 bg-sky-550/5 hover:bg-sky-500/15 border border-sky-500/20 text-sky-950 dark:text-sky-400 rounded-xl font-bold cursor-pointer text-2xs transition-all"
              >
                🔔 मुहूर्त सूचना भेजें
              </button>
            </div>
          </div>
        </div>

        {/* Custom Alarm creator + log display (Right Pane) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-500/5 dark:bg-zinc-900/30 p-4 rounded-2xl border border-slate-250/30 dark:border-zinc-800/80">
            <h3 className="text-xs font-bold text-slate-700 dark:text-amber-500 uppercase tracking-wider mb-3 font-mono">कस्टम रिमाइंडर बनाएं</h3>
            
            <form onSubmit={handleCreateCustom} className="space-y-3 font-sans">
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">रिमाइंडर का शीर्षक</label>
                <input
                  type="text"
                  placeholder="जैसे: संध्या आरती पूजा"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-205/50 dark:border-zinc-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">विवरण (जानकारी)</label>
                <textarea
                  placeholder="जैसे: दीया प्रज्वलित करें एवं हनुमान चालीसा का पाठ करें।"
                  value={customBody}
                  rows={2}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-205/50 dark:border-zinc-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">समय सेट करें</label>
                <input
                  type="text"
                  placeholder="जैसे: 06:45 PM"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-205/50 dark:border-zinc-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-550 outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-orange-650 hover:bg-orange-700 active:bg-orange-800 text-white font-bold rounded-xl shadow-xs text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                रिमाइंडर शेड्यूल करें
              </button>
            </form>
          </div>

          {/* Alarm log history */}
          <div className="bg-slate-500/5 dark:bg-zinc-900/30 rounded-2xl border border-slate-250/30 dark:border-zinc-800/80 p-3.5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 dark:text-amber-500 uppercase tracking-wider font-mono">सूचना इतिहास (लॉग)</h3>
              {notificationsList.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-bold text-red-650 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  साफ़ करें
                </button>
              )}
            </div>

            {/* Listed Logs */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {notificationsList.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-[11px] text-slate-400 italic">अभी तक कोई अलर्ट शुरू नहीं हुआ है। टेस्ट नोटिफिकेशन दबाकर देखें!</span>
                </div>
              ) : (
                notificationsList.map((alert) => (
                  <div key={alert.id} className="p-2.5 rounded-xl bg-white/60 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/80 text-left">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-2xs font-extrabold text-slate-850 dark:text-amber-100 leading-normal">{alert.title}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">{alert.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">{alert.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
