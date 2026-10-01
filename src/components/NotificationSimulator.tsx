import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Volume2, ShieldAlert, Sparkles, AlertTriangle, Bell, Check, Music } from 'lucide-react';
import { AppNotification } from '../types';
import { getMuhuratsForPanchang, getPanchangForDate } from '../utils/panchangCalc';

interface NotificationSimulatorProps {
  notificationsList: AppNotification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  onPushToast: (title: string, body: string) => void;
  panchangInfo?: any;
}

export interface TimingPeriodItem {
  name: string;
  time: string;
  start: string;
  end: string;
  desc: string;
  status: 'active' | 'upcoming' | 'passed';
  statusLabel: string;
  isPassed: boolean;
}

export function NotificationSimulator({ notificationsList, setNotificationsList, onPushToast, panchangInfo }: NotificationSimulatorProps) {
  // Guaranteed active panchang (fallback to Delhi coordinates if props not ready)
  const activePanchang = panchangInfo || getPanchangForDate(28.6139, 77.2090, new Date());

  // Active Tab: Shubh or Ashubh
  const [activeTab, setActiveTab] = useState<'shubh' | 'ashubh'>('shubh');

  // Filter mode: 'all' or 'upcoming'
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming'>('all');

  // Currently Selected Period for alarm configuration
  const [selectedPeriod, setSelectedPeriod] = useState<TimingPeriodItem | null>(null);

  // Alarm Settings states
  const [customVibrate, setCustomVibrate] = useState(true);
  const [customSnooze, setCustomSnooze] = useState(2); // default 2 minutes
  const [ringtoneType, setRingtoneType] = useState<'default' | 'system' | 'custom'>('default');
  const [ringtoneUri, setRingtoneUri] = useState('');
  const [ringtoneTitle, setRingtoneTitle] = useState('');

  // Register JS bridge callback for Custom Ringtone picking
  useEffect(() => {
    window.onRingtonePicked = (_alarmId, uri, title) => {
      setRingtoneUri(uri);
      setRingtoneTitle(title);
      onPushToast("🎵 टोन सेट की गई", `${title} को अलार्म टोन सेट किया गया!`);
    };
    return () => {
      window.onRingtonePicked = undefined;
    };
  }, [onPushToast]);

  const handleSelectCustomRingtone = () => {
    if (window.AndroidAlarm) {
      window.AndroidAlarm.selectRingtone("custom_reminder_id");
    } else {
      onPushToast("⚠️ सुविधा अनुपलब्ध", "कस्टम टोन केवल एंड्रॉइड मोबाइल ऐप पर चुना जा सकता है।");
    }
  };

  // Cancel alarm from active list
  const handleDeleteAlert = (id: string) => {
    if (window.AndroidAlarm) {
      window.AndroidAlarm.cancelAlarm(id);
    }
    setNotificationsList(prev => prev.filter(alert => alert.id !== id));
    onPushToast("🗑️ अलार्म हटाया गया", "अलार्म सफलतापूर्वक रद्द कर दिया गया है।");
  };

  const parseTimeStringToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const cleanStr = timeStr.trim().toUpperCase();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const getTimeStatus = (startStr: string, endStr: string): { status: 'active' | 'upcoming' | 'passed'; statusLabel: string; isPassed: boolean } => {
    const startMin = parseTimeStringToMinutes(startStr);
    const endMin = parseTimeStringToMinutes(endStr) ?? startMin;

    if (startMin === null) {
      return { status: 'upcoming', statusLabel: 'आज', isPassed: false };
    }

    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    // Standard interval within the same day
    if (endMin !== null && endMin >= startMin) {
      if (currentMin < startMin) {
        return { status: 'upcoming', statusLabel: 'आगामी', isPassed: false };
      } else if (currentMin >= startMin && currentMin <= endMin) {
        return { status: 'active', statusLabel: 'सक्रिय (वर्तमान)', isPassed: false };
      } else {
        return { status: 'passed', statusLabel: 'बीत चुका (कल के लिए)', isPassed: true };
      }
    } else if (endMin !== null && endMin < startMin) {
      // Midnight crossing interval (e.g. 11:30 PM to 01:00 AM)
      if (currentMin >= startMin || currentMin <= endMin) {
        return { status: 'active', statusLabel: 'सक्रिय (वर्तमान)', isPassed: false };
      } else if (currentMin > endMin && currentMin < startMin) {
        return { status: 'passed', statusLabel: 'बीत चुका (कल के लिए)', isPassed: true };
      } else {
        return { status: 'upcoming', statusLabel: 'आगामी', isPassed: false };
      }
    }

    return { status: 'upcoming', statusLabel: 'आगामी', isPassed: false };
  };

  const parseTimeToMs = (timeStr: string): number => {
    const cleanStr = timeStr.trim().toUpperCase();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    const now = new Date();
    
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      if (alarmDate.getTime() <= now.getTime()) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }
      return alarmDate.getTime();
    }
    return now.getTime() + 10000; // fallback 10s
  };

  // Extract Adverse (Ashubh) periods list for current day
  const getAdverseTimesList = (): TimingPeriodItem[] => {
    const rawList: { name: string; time: string; start: string; end: string; desc: string }[] = [];

    // 1. Rahu Kaal
    if (activePanchang.rahuKaal?.start && activePanchang.rahuKaal?.end) {
      rawList.push({
        name: 'राहुकाल',
        time: `${activePanchang.rahuKaal.start} - ${activePanchang.rahuKaal.end}`,
        start: activePanchang.rahuKaal.start,
        end: activePanchang.rahuKaal.end,
        desc: 'राहुकाल में कोई भी नया कार्य, लेन-देन या यात्रा प्रारंभ करना वर्जित माना जाता है।'
      });
    }

    // 2. Yamagandam
    if (activePanchang.yamagandam?.start && activePanchang.yamagandam?.end) {
      rawList.push({
        name: 'यमगण्डम काल',
        time: `${activePanchang.yamagandam.start} - ${activePanchang.yamagandam.end}`,
        start: activePanchang.yamagandam.start,
        end: activePanchang.yamagandam.end,
        desc: 'यमगण्डम में मांगलिक कार्य करने पर विघ्न और बाधाएं आ सकती हैं।'
      });
    }

    // 3. Gulik Kaal
    if (activePanchang.gulikKaal?.start && activePanchang.gulikKaal?.end) {
      rawList.push({
        name: 'गुलिक काल',
        time: `${activePanchang.gulikKaal.start} - ${activePanchang.gulikKaal.end}`,
        start: activePanchang.gulikKaal.start,
        end: activePanchang.gulikKaal.end,
        desc: 'गुलिक काल के प्रभाव में शुभ और संचय कार्य टालना चाहिए।'
      });
    }

    // 4. Durmuhurat
    if (activePanchang.durmuhurat && activePanchang.durmuhurat.length > 0) {
      activePanchang.durmuhurat.forEach((dm: any, idx: number) => {
        rawList.push({
          name: `दुर्मुहूर्त ${idx + 1}`,
          time: `${dm.start} - ${dm.end}`,
          start: dm.start,
          end: dm.end,
          desc: 'दुर्मुहूर्त काल ज्योतिषीय दृष्टि से प्रतिकूल व वर्जित समय माना जाता है।'
        });
      });
    }

    // 5. Varjyam
    if (activePanchang.varjyam && activePanchang.varjyam.length > 0) {
      activePanchang.varjyam.forEach((vj: any, idx: number) => {
        rawList.push({
          name: `वर्ज्यम काल ${idx + 1}`,
          time: `${vj.start} - ${vj.end}`,
          start: vj.start,
          end: vj.end,
          desc: 'वर्ज्यम काल में यात्रा और महत्वपूर्ण कार्य वर्जित माने गए हैं।'
        });
      });
    }

    // 6. Inauspicious Choghadiyas (Kaal, Rog, Udveg - both day & night)
    if (activePanchang.choghadiya && activePanchang.choghadiya.length > 0) {
      activePanchang.choghadiya.forEach((chog: any) => {
        if (chog.type === 'Kaal' || chog.type === 'Rog' || chog.type === 'Udveg') {
          const typeMap: Record<string, string> = { 'Kaal': 'काल', 'Rog': 'रोग', 'Udveg': 'उद्वेग' };
          const name = `${typeMap[chog.type]} चौघड़िया (${chog.isDay ? 'दिन' : 'रात्रि'})`;
          rawList.push({
            name,
            time: `${chog.startTime} - ${chog.endTime}`,
            start: chog.startTime,
            end: chog.endTime,
            desc: `${chog.type === 'Rog' ? 'रोग व व्याधि' : chog.type === 'Kaal' ? 'कलह व संघर्ष' : 'चिंता व उद्वेग'} कारक समय।`
          });
        }
      });
    }

    // 7. Bhadra Warning (if active)
    if (activePanchang.bhadra && (activePanchang.bhadra.active || activePanchang.bhadra.startTime)) {
      rawList.push({
        name: 'भद्रा काल',
        time: `${activePanchang.bhadra.startTime || activePanchang.sunrise} - ${activePanchang.bhadra.endTime || activePanchang.sunset}`,
        start: activePanchang.bhadra.startTime || activePanchang.sunrise,
        end: activePanchang.bhadra.endTime || activePanchang.sunset,
        desc: `भद्रा काल के दौरान रक्षासूत्र, विवाह व मांगलिक कार्य वर्जित हैं।`
      });
    }

    // Deduplicate and decorate with real-time status
    const seen = new Set<string>();
    const formattedList: TimingPeriodItem[] = [];

    for (const item of rawList) {
      const key = `${item.name}-${item.start}`;
      if (!seen.has(key)) {
        seen.add(key);
        const { status, statusLabel, isPassed } = getTimeStatus(item.start, item.end);
        formattedList.push({
          ...item,
          status,
          statusLabel,
          isPassed
        });
      }
    }

    // Sort: Active first, then upcoming, then passed
    return formattedList.sort((a, b) => {
      const order = { active: 0, upcoming: 1, passed: 2 };
      return order[a.status] - order[b.status];
    });
  };

  // Extract Auspicious (Shubh) periods list for current day
  const getAuspiciousTimesList = (): TimingPeriodItem[] => {
    const rawList: { name: string; time: string; start: string; end: string; desc: string }[] = [];

    // 1. Core Muhurats (Brahma, Abhijit, Godhuli, Vijaya, Nishita, Amrit Kaal)
    try {
      const muhurats = getMuhuratsForPanchang(activePanchang);
      muhurats.forEach(muh => {
        if (muh.type === 'Amrit' || muh.type === 'Shubh') {
          rawList.push({
            name: muh.hindiName || muh.name,
            time: `${muh.startTime} - ${muh.endTime}`,
            start: muh.startTime,
            end: muh.endTime,
            desc: muh.description || 'मांगलिक कार्यों और नवीन शुरुआत के लिए अत्यंत शुभ काल।'
          });
        }
      });
    } catch (e) {
      console.error("Error fetching muhurats", e);
    }

    // 2. Solar & Lunar Milestones (सूर्योदय, सूर्यास्त व चन्द्रोदय)
    if (activePanchang.sunrise) {
      rawList.push({
        name: 'सूर्योदय (प्रातः संध्या)',
        time: activePanchang.sunrise,
        start: activePanchang.sunrise,
        end: activePanchang.sunrise,
        desc: 'प्रातः सूर्य आराधना, गायत्री जाप एवं सूर्य देव को जल अर्पित करने का पावन समय।'
      });
    }
    if (activePanchang.sunset) {
      rawList.push({
        name: 'सूर्यास्त (सायं संध्या आरती)',
        time: activePanchang.sunset,
        start: activePanchang.sunset,
        end: activePanchang.sunset,
        desc: 'सायंकाल मंदिर दर्शन, गृह दीप प्रज्वलन एवं संध्या आरती का पवित्र समय।'
      });
    }
    if (activePanchang.moonrise && activePanchang.moonrise !== '---') {
      rawList.push({
        name: 'चन्द्रोदय (चन्द्र अर्घ्य समय)',
        time: activePanchang.moonrise,
        start: activePanchang.moonrise,
        end: activePanchang.moonrise,
        desc: 'संकष्टी चतुर्थी, करवा चौथ व पूर्णिमा व्रत पारण हेतु चन्द्र दर्शन समय।'
      });
    }

    // 3. Special Siddhi Yogas
    if (activePanchang.shubhYogas && activePanchang.shubhYogas.length > 0) {
      activePanchang.shubhYogas.forEach((sy: any) => {
        rawList.push({
          name: sy.hindiName || sy.name,
          time: `${sy.start} - ${sy.end}`,
          start: sy.start,
          end: sy.end,
          desc: 'सिद्धि योग में किए गए सभी कार्यों में निश्चित सफलता प्राप्त होती है।'
        });
      });
    }

    // 4. Auspicious Choghadiyas (अमृत, शुभ, लाभ - both day & night)
    if (activePanchang.choghadiya && activePanchang.choghadiya.length > 0) {
      activePanchang.choghadiya.forEach((chog: any) => {
        if (chog.type === 'Shubh' || chog.type === 'Amrit' || chog.type === 'Labh') {
          const typeMap: Record<string, string> = { 'Shubh': 'शुभ', 'Amrit': 'अमृत', 'Labh': 'लाभ' };
          const name = `${typeMap[chog.type]} चौघड़िया (${chog.isDay ? 'दिन' : 'रात्रि'})`;
          rawList.push({
            name,
            time: `${chog.startTime} - ${chog.endTime}`,
            start: chog.startTime,
            end: chog.endTime,
            desc: 'उन्नति, समृद्धि और शुभ कार्यों के संपादन के लिए सर्वोत्तम समय।'
          });
        }
      });
    }

    // 5. Auspicious Planetary Horas
    if (activePanchang.hora && activePanchang.hora.length > 0) {
      activePanchang.hora.forEach((h: any) => {
        if (h.quality === 'Auspicious') {
          rawList.push({
            name: `${h.lordHindi} होरा (${h.isDay ? 'दिन' : 'रात्रि'})`,
            time: `${h.startTime} - ${h.endTime}`,
            start: h.startTime,
            end: h.endTime,
            desc: h.benefits || 'शुभ ग्रह होरा काल कार्य सिद्धि एवं खरीदारी के लिए उत्तम।'
          });
        }
      });
    }

    // Deduplicate and decorate with real-time status
    const seen = new Set<string>();
    const formattedList: TimingPeriodItem[] = [];

    for (const item of rawList) {
      const key = `${item.name}-${item.start}`;
      if (!seen.has(key)) {
        seen.add(key);
        const { status, statusLabel, isPassed } = getTimeStatus(item.start, item.end);
        formattedList.push({
          ...item,
          status,
          statusLabel,
          isPassed
        });
      }
    }

    // Sort: Active first, then upcoming, then passed
    return formattedList.sort((a, b) => {
      const order = { active: 0, upcoming: 1, passed: 2 };
      return order[a.status] - order[b.status];
    });
  };

  const shubhList = getAuspiciousTimesList();
  const ashubhList = getAdverseTimesList();
  const rawCurrentList = activeTab === 'shubh' ? shubhList : ashubhList;
  const currentList = filterMode === 'upcoming' 
    ? rawCurrentList.filter(item => !item.isPassed) 
    : rawCurrentList;

  // Schedule selected alarm
  const handleScheduleAlarm = () => {
    if (!selectedPeriod) return;

    const isShubh = activeTab === 'shubh';
    const alarmTitle = `${isShubh ? '✨' : '⚠️'} ${selectedPeriod.name}`;
    const alarmBody = `${selectedPeriod.name} का समय (${selectedPeriod.time})। ${selectedPeriod.desc}`;

    const newAlert: AppNotification = {
      id: `alert_${Date.now()}`,
      title: alarmTitle,
      body: alarmBody,
      time: selectedPeriod.start,
      endTime: selectedPeriod.end !== selectedPeriod.start ? selectedPeriod.end : undefined,
      type: 'muhurat',
      isRead: false
    };

    setNotificationsList([newAlert, ...notificationsList]);
    onPushToast(alarmTitle, `[समय: ${selectedPeriod.time}] अलार्म सफलतापूर्वक सेट हो गया!`);

    if (window.AndroidAlarm) {
      const triggerTimeMs = parseTimeToMs(selectedPeriod.start);
      let finalUri = '';
      if (ringtoneType === 'system') {
        finalUri = 'SYSTEM_DEFAULT';
      } else if (ringtoneType === 'custom') {
        finalUri = ringtoneUri;
      }
      
      window.AndroidAlarm.scheduleAlarm(
        newAlert.id,
        alarmTitle,
        triggerTimeMs,
        customVibrate,
        customSnooze,
        finalUri
      );
    }

    setSelectedPeriod(null);
  };

  return (
    <div id="notification_simulator_root" className="glass-card-light dark:bg-brand-card p-4 sm:p-5 shadow-xs text-left font-sans relative border dark:border-brand-border rounded-3xl space-y-6">
      
      {/* 1. TOP TAB SWITCHER: SHUBH SAMAY vs ASHUBH SAMAY */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-brand-accent block mb-1">
          ॥ मुहूर्त व काल अलार्म चयन ॥
        </span>
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-500/5 dark:bg-brand-control rounded-2xl border border-slate-200/50 dark:border-brand-border">
          <button
            type="button"
            onClick={() => {
              setActiveTab('shubh');
              setSelectedPeriod(null);
            }}
            className={`py-3 px-4 rounded-xl font-bold font-serif text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'shubh'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-brand-text-sec hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>शुभ समय ({shubhList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ashubh');
              setSelectedPeriod(null);
            }}
            className={`py-3 px-4 rounded-xl font-bold font-serif text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ashubh'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-brand-text-sec hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>अशुभ समय ({ashubhList.length})</span>
          </button>
        </div>
      </div>

      {/* 2. UPCOMING & ALL TIMES GRID FOR CURRENT DAY */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-brand-text-pri flex items-center gap-1.5">
            {activeTab === 'shubh' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>आज के शुभ मुहूर्त एवं चौघड़िया</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>आज के अशुभ काल एवं चौघड़िया</span>
              </>
            )}
          </h3>

          {/* Filter Toggle: All vs Upcoming */}
          <div className="flex items-center gap-1.5 bg-slate-500/10 dark:bg-brand-control p-1 rounded-xl border border-slate-200/50 dark:border-brand-border self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-brand-card text-slate-900 dark:text-brand-accent shadow-xs'
                  : 'text-slate-500 dark:text-brand-text-mut hover:text-slate-700'
              }`}
            >
              सभी ({rawCurrentList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('upcoming')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                filterMode === 'upcoming'
                  ? 'bg-white dark:bg-brand-card text-slate-900 dark:text-brand-accent shadow-xs'
                  : 'text-slate-500 dark:text-brand-text-mut hover:text-slate-700'
              }`}
            >
              केवल आगामी ({rawCurrentList.filter(i => !i.isPassed).length})
            </button>
          </div>
        </div>

        {currentList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-500/5 dark:bg-brand-control border dark:border-brand-border">
            <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-brand-text-mut mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-brand-text-sec">
              आज के दिन के सभी {activeTab === 'shubh' ? 'शुभ मुहूर्त' : 'अशुभ काल'} समाप्त हो चुके हैं।
            </p>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className="mt-2.5 px-3 py-1.5 bg-orange-600/15 hover:bg-orange-600/25 text-orange-700 dark:text-brand-accent text-xs font-bold rounded-lg cursor-pointer transition-all"
            >
              आज के सभी मुहूर्त देखें (कल के लिए सेट करें)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
            {currentList.map((item, idx) => {
              const isSelected = selectedPeriod?.name === item.name && selectedPeriod?.start === item.start;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPeriod(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-xs ${
                    isSelected
                      ? activeTab === 'shubh'
                        ? 'bg-emerald-500/10 dark:bg-brand-control border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                        : 'bg-rose-500/10 dark:bg-brand-control border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                      : item.status === 'active'
                        ? 'bg-amber-500/5 dark:bg-brand-control border-amber-500/40 dark:border-amber-500/30 shadow-xs'
                        : 'bg-white/60 dark:bg-brand-control border-slate-200/50 dark:border-brand-border hover:border-orange-500/40 dark:hover:border-brand-border'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold font-serif ${
                        activeTab === 'shubh' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                      }`}>
                        {item.name}
                      </span>
                      {item.status === 'active' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          सक्रिय
                        </span>
                      )}
                      {item.status === 'upcoming' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          आगामी
                        </span>
                      )}
                      {item.status === 'passed' && (
                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-md bg-slate-400/15 text-slate-500 dark:text-brand-text-mut border border-slate-400/20">
                          बीत चुका
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-orange-500/10 dark:bg-brand-card border border-orange-500/20 dark:border-brand-border text-orange-700 dark:text-brand-accent shrink-0">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-brand-text-sec line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-brand-border text-[10px]">
                    <span className="text-slate-400 dark:text-brand-text-mut">
                      प्रारंभ: <strong className="text-slate-700 dark:text-brand-text-pri font-mono">{item.start}</strong>
                    </span>
                    <span className={`font-bold flex items-center gap-1 ${
                      isSelected
                        ? activeTab === 'shubh' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-400 dark:text-brand-text-mut'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      {isSelected ? 'चयनित' : 'चुनें'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. ALARM CONFIGURATION & SET BUTTON (Visible when an item is selected) */}
      {selectedPeriod && (
        <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-brand-control border border-orange-500/30 dark:border-brand-border space-y-3.5 animate-fade-in shadow-inner">
          <div className="flex justify-between items-center pb-2 border-b border-orange-500/15 dark:border-brand-border">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-orange-600 dark:text-brand-accent block">
                चयनित काल
              </span>
              <h4 className="text-sm font-bold font-serif text-slate-850 dark:text-brand-text-pri">
                {selectedPeriod.name} ({selectedPeriod.time})
              </h4>
            </div>
            <button
              onClick={() => setSelectedPeriod(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              ✕ रद्द करें
            </button>
          </div>

          {selectedPeriod.isPassed && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                यह समय आज बीत चुका है। अलार्म <strong>कल ({selectedPeriod.start})</strong> के लिए शेड्यूल होगा।
              </span>
            </div>
          )}

          {/* Ringtone and Vibration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ringtone Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-brand-text-sec uppercase font-mono block">
                अलार्म रिंगटोन
              </label>
              <select
                value={ringtoneType}
                onChange={(e) => setRingtoneType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border text-slate-800 dark:text-brand-text-pri outline-none cursor-pointer"
              >
                <option value="default" className="bg-brand-card text-brand-text-pri">ऐप डिफ़ॉल्ट (बांसुरी)</option>
                <option value="system" className="bg-brand-card text-brand-text-pri">फ़ोन सिस्टम अलार्म</option>
                <option value="custom" className="bg-brand-card text-brand-text-pri">फ़ोन स्टोरेज से चुनें...</option>
              </select>
            </div>

            {/* Snooze duration */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-brand-text-sec uppercase font-mono block">
                सूनोज़ अवधि
              </label>
              <select
                value={customSnooze}
                onChange={(e) => setCustomSnooze(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-brand-card border border-slate-200 dark:border-brand-border text-slate-800 dark:text-brand-text-pri outline-none cursor-pointer"
              >
                <option value={1} className="bg-brand-card text-brand-text-pri">1 मिनट</option>
                <option value={2} className="bg-brand-card text-brand-text-pri">2 मिनट</option>
                <option value={3} className="bg-brand-card text-brand-text-pri">3 मिनट</option>
                <option value={5} className="bg-brand-card text-brand-text-pri">5 मिनट</option>
                <option value={10} className="bg-brand-card text-brand-text-pri">10 मिनट</option>
              </select>
            </div>

            {/* Vibrate Toggle */}
            <div className="flex items-center justify-between sm:justify-center gap-3 p-2 bg-white/70 dark:bg-brand-card rounded-xl border border-slate-200 dark:border-brand-border mt-auto h-[42px]">
              <span className="text-xs font-bold text-slate-600 dark:text-brand-text-sec">कंपन (Vibrate)</span>
              <input
                type="checkbox"
                checked={customVibrate}
                onChange={(e) => setCustomVibrate(e.target.checked)}
                className="w-8 h-4 rounded-full bg-slate-300 dark:bg-brand-control checked:bg-orange-600 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-300 dark:border-brand-border checked:border-orange-600 shrink-0"
              />
            </div>
          </div>

          {/* Custom File Button when "custom" is selected */}
          {ringtoneType === 'custom' && (
            <div className="p-2.5 bg-orange-500/10 dark:bg-brand-card rounded-xl border border-orange-200 dark:border-brand-border flex justify-between items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-brand-text-sec truncate">
                टोन: <strong className="text-orange-900 dark:text-brand-accent">{ringtoneTitle || 'कोई नहीं चुनी'}</strong>
              </span>
              <button
                type="button"
                onClick={handleSelectCustomRingtone}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0"
              >
                <Music className="w-3.5 h-3.5" />
                फ़ाइल चुनें
              </button>
            </div>
          )}

          {/* Set Alarm Big Action Button */}
          <button
            type="button"
            onClick={handleScheduleAlarm}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.99] text-white font-bold font-serif text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Bell className="w-4 h-4" />
            <span>{selectedPeriod.name} का अलार्म सेट करें ({selectedPeriod.start})</span>
          </button>
        </div>
      )}

      {/* 4. ACTIVE SCHEDULED ALARMS MANAGER */}
      <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-brand-border">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 dark:text-brand-accent uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-550 dark:text-brand-accent" />
            सक्रिय अलार्म सूची (Active Scheduled Alarms)
          </h3>
          {notificationsList.length > 0 && (
            <span className="text-[10px] font-bold bg-orange-500/10 dark:bg-brand-control border dark:border-brand-border text-orange-600 dark:text-brand-accent px-2 py-0.5 rounded-full font-mono">
              {notificationsList.length} सक्रिय
            </span>
          )}
        </div>

        {notificationsList.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-500/5 dark:bg-brand-control border dark:border-brand-border flex flex-col items-center justify-center gap-1.5">
            <ShieldAlert className="w-7 h-7 text-slate-350 dark:text-brand-text-mut" />
            <span className="text-xs text-slate-455 dark:text-brand-text-sec">अभी कोई अलार्म सक्रिय नहीं है।</span>
            <span className="text-[10px] text-slate-400 dark:text-brand-text-mut">
              ऊपर दिए शुभ या अशुभ समय पर क्लिक करके अलार्म सेट करें।
            </span>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {notificationsList.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-2xl bg-white dark:bg-brand-control border border-slate-200/50 dark:border-brand-border text-left flex justify-between items-start gap-2 shadow-xs relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                
                <div className="flex-1 min-w-0 pl-1.5 space-y-1">
                  <div className="flex justify-between items-start gap-1 flex-wrap">
                    <span className="text-xs font-black text-slate-800 dark:text-brand-text-pri">
                      {alert.title}
                    </span>
                    
                    <span className="text-[10px] font-bold text-orange-600 dark:text-brand-accent font-mono bg-orange-500/5 dark:bg-brand-card border dark:border-brand-border px-2 py-0.5 rounded-lg shrink-0">
                      {alert.time}
                      {alert.endTime ? ` से ${alert.endTime}` : ''}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 dark:text-brand-text-sec line-clamp-1">
                    {alert.body}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 dark:text-brand-text-mut font-mono pt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Volume2 className="w-3 h-3" />
                      {ringtoneTitle || 'डिफ़ॉल्ट टोन'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 dark:bg-emerald-950/40 border dark:border-emerald-500/20 px-1.5 py-0.2 rounded">
                      सक्रिय
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-slate-400 dark:text-brand-text-mut hover:text-red-500 dark:hover:text-rose-400 cursor-pointer p-1.5 rounded-xl hover:bg-red-500/5 transition-all flex-shrink-0"
                  title="अलार्म रद्द करें"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
