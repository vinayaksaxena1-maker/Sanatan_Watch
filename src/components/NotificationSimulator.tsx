import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Volume2, ShieldAlert } from 'lucide-react';
import { AppNotification } from '../types';
import { getMuhuratsForPanchang } from '../utils/panchangCalc';

interface NotificationSimulatorProps {
  notificationsList: AppNotification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  onPushToast: (title: string, body: string) => void;
  panchangInfo?: any;
}

export function NotificationSimulator({ notificationsList, setNotificationsList, onPushToast, panchangInfo }: NotificationSimulatorProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customTime, setCustomTime] = useState('06:00 AM');
  const [customEndTime, setCustomEndTime] = useState('');
  
  // Custom Alarm Settings states
  const [customVibrate, setCustomVibrate] = useState(true);
  const [customSnooze, setCustomSnooze] = useState(2); // default 2 minutes
  const [ringtoneType, setRingtoneType] = useState<'default' | 'system' | 'custom'>('default');
  const [ringtoneUri, setRingtoneUri] = useState('');
  const [ringtoneTitle, setRingtoneTitle] = useState('');

  // Modals state for Shubh/Ashubh picker
  const [showAdverseModal, setShowAdverseModal] = useState(false);
  const [showAuspiciousModal, setShowAuspiciousModal] = useState(false);

  // Register JS bridge callback for Custom Ringtone picking
  useEffect(() => {
    window.onRingtonePicked = (alarmId, uri, title) => {
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

  const parseTimeToMs = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const cleanStr = timeStr.trim().toUpperCase();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) return null;

    if (ampm) {
      if (hours < 1 || hours > 12) return null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      if (hours < 0 || hours > 23) return null;
    }

    const now = new Date();
    const alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    if (alarmDate.getTime() <= now.getTime()) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }
    return alarmDate.getTime();
  };

  const handleToggleAlert = (id: string) => {
    setNotificationsList(prev => prev.map(alert => {
      if (alert.id === id) {
        const isCurrentlyEnabled = alert.enabled !== false;
        const nextEnabled = !isCurrentlyEnabled;

        if (nextEnabled) {
          if (window.AndroidAlarm) {
            const triggerTimeMs = parseTimeToMs(alert.time);
            if (triggerTimeMs) {
              window.AndroidAlarm.scheduleAlarm(
                alert.id,
                alert.title,
                triggerTimeMs,
                alert.vibrate !== false,
                alert.snoozeMinutes || 2,
                alert.ringtoneUri || ''
              );
            }
          }
          onPushToast("🔔 अलार्म सक्रिय", `"${alert.title}" अलार्म चालू कर दिया गया है।`);
        } else {
          if (window.AndroidAlarm) {
            window.AndroidAlarm.cancelAlarm(alert.id);
          }
          onPushToast("🔕 अलार्म बंद", `"${alert.title}" अलार्म बंद कर दिया गया है।`);
        }

        return { ...alert, enabled: nextEnabled };
      }
      return alert;
    }));
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customBody) return;

    const triggerTimeMs = parseTimeToMs(customTime);
    if (!triggerTimeMs) {
      onPushToast("⚠️ अमान्य समय प्रारूप", "कृपया सही समय लिखें, जैसे 06:45 AM या 18:45");
      return;
    }

    // Vibration and Snooze tags representation for UI
    const detailsSuffix = ` (कंपन: ${customVibrate ? 'हाँ' : 'नहीं'}, स्नूज़: ${customSnooze} मिनट)`;

    let finalUri = '';
    let selectedRingtoneTitle = 'डिफ़ॉल्ट टोन (Flute)';
    if (ringtoneType === 'system') {
      finalUri = 'SYSTEM_DEFAULT';
      selectedRingtoneTitle = 'सिस्टम अलार्म टोन';
    } else if (ringtoneType === 'custom') {
      finalUri = ringtoneUri;
      selectedRingtoneTitle = ringtoneTitle || 'कस्टम टोन';
    }

    const newAlert: AppNotification = {
      id: `alert_${Date.now()}`,
      title: customTitle,
      body: customBody + detailsSuffix,
      time: customTime,
      endTime: customEndTime || undefined,
      type: 'custom',
      isRead: false,
      enabled: true,
      ringtoneTitle: selectedRingtoneTitle,
      ringtoneUri: finalUri,
      vibrate: customVibrate,
      snoozeMinutes: customSnooze
    };

    setNotificationsList([newAlert, ...notificationsList]);
    onPushToast(customTitle, `[समय: ${customTime}] ${customBody}`);

    if (window.AndroidAlarm) {
      window.AndroidAlarm.scheduleAlarm(
        newAlert.id,
        customTitle,
        triggerTimeMs,
        customVibrate,
        customSnooze,
        finalUri
      );
    }
    
    setCustomTitle('');
    setCustomBody('');
    setCustomEndTime('');
  };

  const isTimePassed = (timeStr: string): boolean => {
    if (!timeStr) return false;
    const cleanStr = timeStr.trim().toUpperCase();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return false;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const periodDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    return periodDate.getTime() < now.getTime();
  };

  // Extract Adverse periods list
  const getAdverseTimesList = () => {
    if (!panchangInfo) return [];
    const list: { name: string; time: string; start: string; end: string; desc: string }[] = [];

    // 1. Rahu Kaal
    if (panchangInfo.rahuKaal) {
      list.push({
        name: 'राहुकाल',
        time: `${panchangInfo.rahuKaal.start} - ${panchangInfo.rahuKaal.end}`,
        start: panchangInfo.rahuKaal.start,
        end: panchangInfo.rahuKaal.end,
        desc: 'राहुकाल के दौरान कोई भी नया या मांगलिक कार्य शुरू करना वर्जित है।'
      });
    }

    // 2. Yamagandam
    if (panchangInfo.yamagandam) {
      list.push({
        name: 'यमगण्डम काल',
        time: `${panchangInfo.yamagandam.start} - ${panchangInfo.yamagandam.end}`,
        start: panchangInfo.yamagandam.start,
        end: panchangInfo.yamagandam.end,
        desc: 'यमगण्डम में मांगलिक कार्य करने पर अशुभ परिणाम प्राप्त होते हैं।'
      });
    }

    // 3. Gulik Kaal
    if (panchangInfo.gulikKaal) {
      list.push({
        name: 'गुलिक काल',
        time: `${panchangInfo.gulikKaal.start} - ${panchangInfo.gulikKaal.end}`,
        start: panchangInfo.gulikKaal.start,
        end: panchangInfo.gulikKaal.end,
        desc: 'गुलिक काल के प्रभाव में शुभ और संचय कार्य टालना चाहिए।'
      });
    }

    // 4. Durmuhurat
    if (panchangInfo.durmuhurat && panchangInfo.durmuhurat.length > 0) {
      panchangInfo.durmuhurat.forEach((dm: any, idx: number) => {
        list.push({
          name: `दुर्मुहूर्त ${idx + 1}`,
          time: `${dm.start} - ${dm.end}`,
          start: dm.start,
          end: dm.end,
          desc: 'दुर्मुहूर्त काल ज्योतिषीय दृष्टि से प्रतिकूल समय माना जाता है।'
        });
      });
    }

    // 5. Varjyam
    if (panchangInfo.varjyam && panchangInfo.varjyam.length > 0) {
      panchangInfo.varjyam.forEach((vj: any, idx: number) => {
        list.push({
          name: `वर्ज्यम काल ${idx + 1}`,
          time: `${vj.start} - ${vj.end}`,
          start: vj.start,
          end: vj.end,
          desc: 'वर्ज्यम काल में यात्रा, शुभ कार्य और गृह प्रवेश वर्जित हैं।'
        });
      });
    }

    // 6. Inauspicious Choghadiyas
    if (panchangInfo.choghadiya) {
      panchangInfo.choghadiya.forEach((chog: any) => {
        if (chog.type === 'Kaal' || chog.type === 'Rog' || chog.type === 'Udveg') {
          const typeMap: Record<string, string> = { 'Kaal': 'काल', 'Rog': 'रोग', 'Udveg': 'उद्वेग' };
          const name = `${typeMap[chog.type]} चौघड़िया (${chog.isDay ? 'दिन' : 'रात्रि'})`;
          list.push({
            name,
            time: `${chog.startTime} - ${chog.endTime}`,
            start: chog.startTime,
            end: chog.endTime,
            desc: `${chog.type === 'Rog' ? 'स्वास्थ्य हानि' : chog.type === 'Kaal' ? 'कलह' : 'चिंता'} कारक चौघड़िया मुहूर्त।`
          });
        }
      });
    }

    // 7. Bhadra Kaal Warning
    if (panchangInfo.bhadra && (panchangInfo.bhadra.active || panchangInfo.bhadra.startTime)) {
      list.push({
        name: 'भद्रा काल चेतावनी',
        time: `${panchangInfo.bhadra.startTime || panchangInfo.sunrise} - ${panchangInfo.bhadra.endTime || panchangInfo.sunset}`,
        start: panchangInfo.bhadra.startTime || panchangInfo.sunrise,
        end: panchangInfo.bhadra.endTime || panchangInfo.sunset,
        desc: `भद्रा काल (${panchangInfo.bhadra.vasHindi || 'पाताल'}) के दौरान रक्षासूत्र, विवाह व शुभ कार्य वर्जित हैं।`
      });
    }

    // 8. Panchak Warning
    if (panchangInfo.panchak && panchangInfo.panchak.active) {
      list.push({
        name: `${panchangInfo.panchak.hindiName || 'पंचक'} काल`,
        time: `सूर्योदय से अहोरात्र`,
        start: panchangInfo.sunrise,
        end: panchangInfo.sunset,
        desc: panchangInfo.panchak.description || 'पंचक काल के दौरान दक्षिण दिशा यात्रा, शवदाह व छत ढालना वर्जित है।'
      });
    }

    // Filter out periods that have already passed for today
    return list.filter(item => !isTimePassed(item.end || item.start));
  };

  // Extract Auspicious periods list
  const getAuspiciousTimesList = () => {
    if (!panchangInfo) return [];
    const list: { name: string; time: string; start: string; end: string; desc: string }[] = [];

    // 1. Core Muhurats (Brahma, Abhijit, Godhuli, Vijaya, Nishita) using getMuhuratsForPanchang
    try {
      const muhurats = getMuhuratsForPanchang(panchangInfo);
      muhurats.forEach(muh => {
        if (muh.type === 'Amrit' || muh.type === 'Shubh') {
          list.push({
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
    if (panchangInfo.sunrise) {
      list.push({
        name: 'सूर्योदय (प्रातः संध्या समय)',
        time: panchangInfo.sunrise,
        start: panchangInfo.sunrise,
        end: panchangInfo.sunrise,
        desc: 'प्रातः सूर्य आराधना, गायत्री जाप एवं सूर्य देव को जल अर्पित करने का पावन समय।'
      });
    }
    if (panchangInfo.sunset) {
      list.push({
        name: 'सूर्यास्त (सायं संध्या आरती)',
        time: panchangInfo.sunset,
        start: panchangInfo.sunset,
        end: panchangInfo.sunset,
        desc: 'सायंकाल मंदिर दर्शन, गृह दीप प्रज्वलन एवं संध्या आरती का पवित्र समय।'
      });
    }
    if (panchangInfo.moonrise && panchangInfo.moonrise !== '---') {
      list.push({
        name: 'चन्द्रोदय (चन्द्र अर्घ्य समय)',
        time: panchangInfo.moonrise,
        start: panchangInfo.moonrise,
        end: panchangInfo.moonrise,
        desc: 'संकष्टी चतुर्थी, करवा चौथ व पूर्णिमा व्रत पारण हेतु चन्द्र दर्शन समय।'
      });
    }

    // 3. Special Siddhi & Anandadi Yogas (सर्वार्थ/अमृत सिद्धि व त्रिपुष्कर योग)
    if (panchangInfo.shubhYogas && panchangInfo.shubhYogas.length > 0) {
      panchangInfo.shubhYogas.forEach((sy: any) => {
        list.push({
          name: sy.hindiName || sy.name,
          time: `${sy.start} - ${sy.end}`,
          start: sy.start,
          end: sy.end,
          desc: 'सिद्धि योग में किए गए सभी कार्यों में निश्चित सफलता प्राप्त होती है।'
        });
      });
    }

    if (panchangInfo.pushkarYog && panchangInfo.pushkarYog.active && panchangInfo.pushkarYog.name !== 'None') {
      list.push({
        name: panchangInfo.pushkarYog.hindiName,
        time: `सूर्योदय से अहोरात्र`,
        start: panchangInfo.sunrise,
        end: panchangInfo.sunset,
        desc: panchangInfo.pushkarYog.description || 'पुष्कर योग में किए गए शुभ कार्यों का फल कई गुना बढ़ जाता है।'
      });
    }

    if (panchangInfo.anandadiYoga && panchangInfo.anandadiYoga.isAuspicious) {
      list.push({
        name: `${panchangInfo.anandadiYoga.nameHindi} योग`,
        time: `समाप्ति: ${panchangInfo.anandadiYoga.endTime || panchangInfo.sunset}`,
        start: panchangInfo.sunrise,
        end: panchangInfo.anandadiYoga.endTime || panchangInfo.sunset,
        desc: panchangInfo.anandadiYoga.description || 'आनन्दादि शुभ योग कल्याणकारी माना जाता है।'
      });
    }

    // 4. Auspicious Choghadiyas
    if (panchangInfo.choghadiya) {
      panchangInfo.choghadiya.forEach((chog: any) => {
        if (chog.type === 'Shubh' || chog.type === 'Amrit' || chog.type === 'Labh') {
          const typeMap: Record<string, string> = { 'Shubh': 'शुभ', 'Amrit': 'अमृत', 'Labh': 'लाभ' };
          const name = `${typeMap[chog.type]} चौघड़िया (${chog.isDay ? 'दिन' : 'रात्रि'})`;
          list.push({
            name,
            time: `${chog.startTime} - ${chog.endTime}`,
            start: chog.startTime,
            end: chog.endTime,
            desc: 'उन्नति, समृद्धि और शुभ कार्यों के संपादन के लिए सर्वोत्तम समय।'
          });
        }
      });
    }

    // 5. Auspicious Planetary Horas (गुरु, शुक्र, बुध, सूर्य होरा)
    if (panchangInfo.hora) {
      panchangInfo.hora.forEach((h: any) => {
        if (h.quality === 'Auspicious') {
          list.push({
            name: `${h.lordHindi} होरा (${h.isDay ? 'दिन' : 'रात्रि'})`,
            time: `${h.startTime} - ${h.endTime}`,
            start: h.startTime,
            end: h.endTime,
            desc: h.benefits || 'शुभ ग्रह होरा काल कार्य सिद्धि एवं शुभ खरीदारी के लिए उत्तम।'
          });
        }
      });
    }

    // 6. Purnima or Amavasya tithi check
    if (panchangInfo.hinduDate?.tithi?.hindiName) {
      const tithiHindi = panchangInfo.hinduDate.tithi.hindiName;
      if (tithiHindi.includes("पूर्णिमा") || tithiHindi.includes("अमावस्या")) {
        list.push({
          name: `${tithiHindi} व्रत/स्नान-दान`,
          time: `सूर्योदय: ${panchangInfo.sunrise}`,
          start: panchangInfo.sunrise,
          end: panchangInfo.sunset, // defaults to sunset for duration representation
          desc: `आज पवित्र ${tithiHindi} तिथि है। गंगा स्नान, तर्पण, पूजा और व्रत अनुष्ठान के लिए सर्वोत्तम समय।`
        });
      }
    }

    // Filter out periods that have already passed for today
    return list.filter(item => !isTimePassed(item.end || item.start));
  };

  return (
    <div id="notification_simulator_root" className="text-left font-sans relative">
      
      {/* Adverse Times Modal */}
      {showAdverseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C1714] border !border-[#FF9933]/45 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b !border-[#FF9933]/20 pb-2.5 mb-2.5">
              <h3 className="text-[15px] sm:text-[16px] font-bold text-red-500 font-serif flex items-center gap-1.5">
                <span>🔴</span> आज के अशुभ काल (Adverse Periods)
              </h3>
              <button 
                onClick={() => setShowAdverseModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-base min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
                aria-label="बंद करें"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {getAdverseTimesList().length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  कोई अशुभ काल डेटा उपलब्ध नहीं है।
                </div>
              ) : (
                getAdverseTimesList().map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-950/15 hover:bg-red-950/25 border !border-[#FF9933]/25 rounded-2xl flex justify-between items-center gap-3">
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-bold text-red-400 truncate">{item.name}</span>
                        <span className="text-[11px] font-mono text-slate-300 bg-red-950/40 px-2 py-0.5 rounded-full shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCustomTitle(`${item.name} प्रारंभ`);
                        setCustomBody(`${item.name} प्रारंभ हो रहा है. ${item.desc}`);
                        setCustomTime(item.start);
                        setCustomEndTime(item.end);
                        setShowAdverseModal(false);
                        onPushToast("✍️ समय चयनित", `${item.name} (${item.time}) का विवरण फॉर्म में भर दिया गया है। "रिमाइंडर शेड्यूल करें" पर क्लिक करें।`);
                      }}
                      className="px-3 py-1.5 min-h-[44px] min-w-[70px] bg-red-900/60 hover:bg-red-900 active:bg-red-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center flex-shrink-0 border !border-[#FF9933]/30"
                    >
                      सेट करें
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auspicious Times Modal */}
      {showAuspiciousModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#1C1714] border !border-[#FF9933]/45 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b !border-[#FF9933]/20 pb-2.5 mb-2.5">
              <h3 className="text-[15px] sm:text-[16px] font-bold text-emerald-400 font-serif flex items-center gap-1.5">
                <span>🟢</span> आज के शुभ काल एवं मुहूर्त
              </h3>
              <button 
                onClick={() => setShowAuspiciousModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-base min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
                aria-label="बंद करें"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {getAuspiciousTimesList().length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  कोई शुभ काल डेटा उपलब्ध नहीं है।
                </div>
              ) : (
                getAuspiciousTimesList().map((item, idx) => (
                  <div key={idx} className="p-3 bg-emerald-950/15 hover:bg-emerald-950/25 border !border-[#FF9933]/25 rounded-2xl flex justify-between items-center gap-3">
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-bold text-emerald-400 truncate">{item.name}</span>
                        <span className="text-[11px] font-mono text-slate-300 bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCustomTitle(`${item.name} प्रारंभ`);
                        setCustomBody(`${item.name} प्रारंभ हो रहा है. ${item.desc}`);
                        setCustomTime(item.start);
                        setCustomEndTime(item.end);
                        setShowAuspiciousModal(false);
                        onPushToast("✍️ समय चयनित", `${item.name} (${item.time}) का विवरण फॉर्म में भर दिया गया है। "रिमाइंडर शेड्यूल करें" पर क्लिक करें।`);
                      }}
                      className="px-3 py-1.5 min-h-[44px] min-w-[70px] bg-emerald-900/60 hover:bg-emerald-900 active:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center flex-shrink-0 border !border-[#FF9933]/30"
                    >
                      सेट करें
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* COLUMN 1: Custom Alarm creator (Left Side on Desktop) */}
        <div className="md:col-span-6 space-y-3.5">
          <div className="bg-slate-500/5 dark:bg-zinc-900/30 p-3.5 sm:p-4 rounded-2xl border !border-[#FF9933]/35 dark:!border-[#FF9933]/25 shadow-xs">
            <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
              <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-amber-500 uppercase tracking-wider font-mono">
                कस्टम रिमाइंडर बनाएं
              </h3>
              
              {/* Shubh/Ashubh quick selectors */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAdverseModal(true)}
                  className="px-3 min-h-[44px] bg-red-950/20 hover:bg-red-950/40 text-red-500 text-[11px] font-bold rounded-xl border !border-[#FF9933]/30 cursor-pointer transition-all flex items-center justify-center"
                >
                  🔴 अशुभ काल
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuspiciousModal(true)}
                  className="px-3 min-h-[44px] bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-500 text-[11px] font-bold rounded-xl border !border-[#FF9933]/30 cursor-pointer transition-all flex items-center justify-center"
                >
                  🟢 शुभ काल/मुहूर्त
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateCustom} className="space-y-2.5 font-sans">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">रिमाइंडर का शीर्षक</label>
                <input
                  type="text"
                  placeholder="जैसे: संध्या आरती पूजा"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">विवरण (जानकारी)</label>
                <textarea
                  placeholder="जैसे: दीया प्रज्वलित करें एवं हनुमान चालीसा का पाठ करें।"
                  value={customBody}
                  rows={2}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">समय सेट करें</label>
                  <input
                    type="text"
                    placeholder="जैसे: 06:45 PM"
                    value={customTime}
                    onChange={(e) => {
                      setCustomTime(e.target.value);
                      setCustomEndTime(''); // reset selected end time on manual input
                    }}
                    className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-550 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">स्नूज़ अवधि</label>
                  <select
                    value={customSnooze}
                    onChange={(e) => setCustomSnooze(parseInt(e.target.value, 10))}
                    className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-550 outline-none"
                  >
                    <option value={1}>1 मिनट</option>
                    <option value={2}>2 मिनट</option>
                    <option value={3}>3 मिनट</option>
                    <option value={5}>5 मिनट</option>
                    <option value={10}>10 मिनट</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-500/5 dark:bg-zinc-900/50 rounded-xl px-2.5 border !border-[#FF9933]/20">
                <span className="text-[11px] font-bold text-slate-650 dark:text-slate-300">अलार्म कंपन (Vibrate)</span>
                <input
                  type="checkbox"
                  checked={customVibrate}
                  onChange={(e) => setCustomVibrate(e.target.checked)}
                  className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-600 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-300 dark:border-zinc-700 checked:border-orange-600 shrink-0"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">अलार्म रिंगटोन</label>
                <select
                  value={ringtoneType}
                  onChange={(e) => setRingtoneType(e.target.value as any)}
                  className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-550 outline-none"
                >
                  <option value="default">ऐप डिफ़ॉल्ट टोन (Flute)</option>
                  <option value="system">सिस्टम अलार्म टोन</option>
                  <option value="custom">फ़ोन स्टोरेज से चुनें...</option>
                </select>
              </div>

              {ringtoneType === 'custom' && (
                <div className="p-2.5 bg-orange-500/5 dark:bg-orange-950/10 rounded-xl border !border-[#FF9933]/30 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">चुनी हुई टोन:</span>
                    <span className="font-bold text-orange-900 dark:text-orange-400 truncate max-w-[120px]">{ringtoneTitle || 'कोई नहीं'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectCustomRingtone}
                    className="p-2 min-h-[44px] bg-orange-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-orange-700 transition-all border !border-[#FF9933]/30 flex items-center justify-center"
                  >
                    फ़ोन से टोन फ़ाइल चुनें
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl shadow-xs text-xs sm:text-[13px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border !border-[#FF9933]"
              >
                <Plus className="w-4 h-4" />
                रिमाइंडर शेड्यूल करें
              </button>
            </form>
          </div>
        </div>

        {/* COLUMN 2: Active Scheduled Alarms Manager (Right Side on Desktop) */}
        <div className="md:col-span-6 space-y-3.5">
          
          <div className="bg-slate-500/5 dark:bg-zinc-900/30 rounded-2xl border !border-[#FF9933]/35 dark:!border-[#FF9933]/25 p-3.5 sm:p-4 space-y-2.5 shadow-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-amber-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-550" />
                सक्रिय अलार्म सूची (Active Scheduled Alarms)
              </h3>
              {notificationsList.length > 0 && (
                <span className="text-[10.5px] font-bold bg-orange-500/10 text-orange-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-mono border !border-[#FF9933]/25">
                  {notificationsList.length} सेट हैं
                </span>
              )}
            </div>

            {/* List of active scheduled alarms */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {notificationsList.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                  <ShieldAlert className="w-8 h-8 text-slate-350 dark:text-zinc-700" />
                  <span className="text-xs text-slate-455 italic">अभी कोई अलार्म सक्रिय नहीं है।</span>
                  <span className="text-[11px] text-slate-400">ऊपर दिए फॉर्म से या शुभ/अशुभ काल से नया अलार्म सेट करें।</span>
                </div>
              ) : (
                notificationsList.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-2xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-left flex justify-between items-center gap-2 shadow-xs relative overflow-hidden group ${
                    alert.enabled === false ? 'opacity-75' : ''
                  }`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      alert.enabled !== false ? 'bg-orange-500' : 'bg-zinc-500'
                    }`} />
                    
                    <div className="flex-1 min-w-0 pl-1.5 space-y-1">
                      <div className="flex justify-between items-start gap-1 flex-wrap">
                        <span className="text-[14px] sm:text-[15px] font-black text-slate-800 dark:text-amber-100">{alert.title}</span>
                        
                        {/* Alarm Time duration details */}
                        <span className="text-[11px] font-bold text-orange-600 dark:text-amber-400 font-mono bg-orange-500/5 dark:bg-orange-950/30 px-2.5 py-0.5 rounded-lg border !border-[#FF9933]/20 shrink-0">
                          {alert.time}
                          {alert.endTime ? ` से ${alert.endTime}` : ''}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed">{alert.body}</p>
                      
                      {/* Sub-config display */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-mono pt-1">
                        <span className="flex items-center gap-0.5">
                          <Volume2 className="w-3 h-3" />
                          {alert.ringtoneTitle || 'डिफ़ॉल्ट टोन'}
                        </span>
                        <span>•</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          alert.enabled !== false 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                            : 'text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                        }`}>
                          {alert.enabled !== false ? 'सक्रिय' : 'निष्क्रिय'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Active On/Off toggle switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={alert.enabled !== false}
                        aria-label={alert.enabled !== false ? `${alert.title} अलार्म बंद करें` : `${alert.title} अलार्म चालू करें`}
                        onClick={() => handleToggleAlert(alert.id)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer p-1 rounded-xl hover:bg-orange-500/5 transition-all"
                        title={alert.enabled !== false ? "अलार्म बंद करें" : "अलार्म चालू करें"}
                      >
                        <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 border ${
                          alert.enabled !== false 
                            ? 'bg-orange-600 border-orange-500 justify-end' 
                            : 'bg-zinc-400 dark:bg-zinc-700 border-zinc-500 dark:border-zinc-600 justify-start'
                        }`}>
                          <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
                        </div>
                      </button>

                      {/* Delete Alert Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-red-500/10 transition-all flex-shrink-0"
                        title="अलार्म रद्द करें"
                        aria-label="अलार्म रद्द करें"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
