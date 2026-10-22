import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Clock, Volume2, ShieldAlert, ChevronDown, ChevronUp, Bell, BellOff, Sun, Sparkles, Flame, AlertTriangle, Check } from 'lucide-react';
import { AppNotification } from '../types';
import { getMuhuratsForPanchang } from '../utils/panchangCalc';
import { toggleQuickAlarm, isAlarmActive, formatTimeWithOffset } from '../utils/alarmUtils';
import { Language } from '../utils/translations';

interface NotificationSimulatorProps {
  notificationsList: AppNotification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  onPushToast: (title: string, body: string) => void;
  panchangInfo?: any;
  language?: Language;
}

export function NotificationSimulator({ notificationsList, setNotificationsList, onPushToast, panchangInfo, language = 'Hindi' }: NotificationSimulatorProps) {
  const isHin = language !== 'English';

  // Custom Alarm form states
  const [isCustomOpen, setIsCustomOpen] = useState(false);
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

  // Modals state for Shubh/Ashubh quick pickers
  const [showAdverseModal, setShowAdverseModal] = useState(false);
  const [showAuspiciousModal, setShowAuspiciousModal] = useState(false);

  // Register JS bridge callback for Custom Ringtone picking
  useEffect(() => {
    window.onRingtonePicked = (alarmId, uri, title) => {
      setRingtoneUri(uri);
      setRingtoneTitle(title);
      onPushToast(isHin ? "🎵 टोन सेट की गई" : "🎵 Tone Set", isHin ? `${title} को अलार्म टोन सेट किया गया!` : `${title} has been set as alarm tone!`);
    };
    return () => {
      window.onRingtonePicked = undefined;
    };
  }, [onPushToast, isHin]);

  const handleSelectCustomRingtone = () => {
    if (window.AndroidAlarm) {
      window.AndroidAlarm.selectRingtone("custom_reminder_id");
    } else {
      onPushToast(isHin ? "⚠️ सुविधा अनुपलब्ध" : "⚠️ Feature Unavailable", isHin ? "कस्टम टोन केवल एंड्रॉइड मोबाइल ऐप पर चुना जा सकता है।" : "Custom tone can only be selected on Android mobile app.");
    }
  };

  // Compute Core Muhurats from panchangInfo
  const muhurats = useMemo(() => {
    if (!panchangInfo) return [];
    try {
      return getMuhuratsForPanchang(panchangInfo);
    } catch (e) {
      console.error("Error computing muhurats for presets", e);
      return [];
    }
  }, [panchangInfo]);

  const brahma = muhurats.find(m => m.id === 'brahma');
  const abhijit = muhurats.find(m => m.id === 'abhijit');
  const godhuli = muhurats.find(m => m.id === 'godhuli');

  // 4 Nitya Vedic Preset Alarms
  const presetAlarms = useMemo(() => {
    const rahuStart = panchangInfo?.rahuKaal?.start || '01:30 PM';
    const rahuEnd = panchangInfo?.rahuKaal?.end || '02:55 PM';
    const rahuWarningTime = formatTimeWithOffset(rahuStart, -5);

    return [
      {
        id: 'alert_brahma',
        title: isHin ? 'ब्रह्म मुहूर्त साधना' : 'Brahma Muhurat Sadhana',
        subtitle: isHin ? 'प्रातः ध्यान, योग व विद्याध्ययन हेतु' : 'For morning meditation, yoga & studies',
        time: brahma?.startTime || '04:43 AM',
        endTime: brahma?.endTime || '05:34 AM',
        displayTime: `${brahma?.startTime || '04:43 AM'} - ${brahma?.endTime || '05:34 AM'}`,
        body: isHin ? 'ईश्वर स्मरण, योग, साधना व अध्ययन हेतु ब्रह्म मुहूर्त प्रारंभ हो चुका है।' : 'Brahma Muhurat has commenced for prayer, meditation & study.',
        icon: '☀️',
        colorKey: 'amber' as const,
        offsetMinutes: 0
      },
      {
        id: 'alert_abhijit',
        title: isHin ? 'अभिजित मुहूर्त' : 'Abhijit Muhurat',
        subtitle: isHin ? 'दिन का सर्वश्रेष्ठ शुभ समय प्रारंभ' : 'Best auspicious timing of the day',
        time: abhijit?.startTime || '11:42 AM',
        endTime: abhijit?.endTime || '12:27 PM',
        displayTime: `${abhijit?.startTime || '11:42 AM'} - ${abhijit?.endTime || '12:27 PM'}`,
        body: isHin ? 'सर्वकार्य सिद्धि हेतु अभिजीत मुहूर्त प्रारंभ हो चुका है।' : 'Abhijit Muhurat has started for success in all endeavors.',
        icon: '✨',
        colorKey: 'emerald' as const,
        offsetMinutes: 0
      },
      {
        id: 'alert_sandhya',
        title: isHin ? 'सांध्य वंदन / आरती' : 'Sandhya Vandana / Aarti',
        subtitle: isHin ? 'गोधूलि वेला दीप प्रज्वलन व पूजा स्मरण' : 'Twilight lamp lighting & evening prayers',
        time: godhuli?.startTime || panchangInfo?.sunset || '05:44 PM',
        endTime: godhuli?.endTime || '06:08 PM',
        displayTime: `${godhuli?.startTime || panchangInfo?.sunset || '05:44 PM'} - ${godhuli?.endTime || '06:08 PM'}`,
        body: isHin ? 'गोधूलि वेला में दीप प्रज्वलन व सांध्य आरती का पावन समय।' : 'Auspicious twilight time for lighting evening lamps and Aarti.',
        icon: '🪔',
        colorKey: 'orange' as const,
        offsetMinutes: 0
      },
      {
        id: 'alert_rahukaal',
        title: isHin ? 'राहुकाल पूर्व चेतावनी' : 'Rahukaal Warning Alert',
        subtitle: isHin ? 'राहुकाल प्रारंभ से 5 मिनट पूर्व सावधानी संदेश' : 'Warning alert 5 minutes before Rahukaal starts',
        time: rahuStart,
        endTime: rahuEnd,
        displayTime: isHin ? `${rahuWarningTime} (शुरू: ${rahuStart})` : `${rahuWarningTime} (Starts: ${rahuStart})`,
        body: isHin ? `राहुकाल ${rahuStart} से प्रारंभ होने वाला है। शुभ कार्य टालें।` : `Rahukaal begins at ${rahuStart}. Avoid vital new beginnings.`,
        icon: '⚠️',
        colorKey: 'rose' as const,
        offsetMinutes: -5
      }
    ];
  }, [panchangInfo, brahma, abhijit, godhuli, isHin]);

  // 1-Tap Toggle for Preset Alarms (Two-Way Reactivity)
  const handleTogglePreset = (preset: typeof presetAlarms[0]) => {
    const result = toggleQuickAlarm(notificationsList, {
      id: preset.id,
      title: preset.title,
      body: preset.body,
      time: preset.time,
      endTime: preset.endTime,
      type: 'muhurat',
      offsetMinutes: preset.offsetMinutes || 0
    });
    setNotificationsList(result.updatedList);
    onPushToast(result.toastTitle, result.toastBody);
  };

  // Direct 1-Tap Schedule from Modals
  const handleDirectScheduleFromModal = (item: { name: string; time: string; start: string; end: string; desc: string }, isAdverse: boolean = false) => {
    const safeId = `alert_${item.name.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')}_${item.start.replace(/[^a-zA-Z0-9]/g, '')}`;
    const result = toggleQuickAlarm(notificationsList, {
      id: safeId,
      title: `${item.name} ${isAdverse ? (isHin ? 'चेतावनी' : 'Warning') : (isHin ? 'प्रारंभ' : 'Starts')}`,
      body: `${item.name} (${item.time}). ${item.desc}`,
      time: item.start,
      endTime: item.end,
      type: 'muhurat'
    });
    setNotificationsList(result.updatedList);
    onPushToast(result.toastTitle, result.toastBody);
  };

  // Cancel alarm from active list
  const handleDeleteAlert = (id: string) => {
    if (window.AndroidAlarm && typeof window.AndroidAlarm.cancelAlarm === 'function') {
      window.AndroidAlarm.cancelAlarm(id);
    }
    setNotificationsList(prev => prev.filter(alert => alert.id !== id));
    onPushToast(isHin ? "🗑️ अलार्म हटाया गया" : "🗑️ Alarm Cancelled", isHin ? "अलार्म सफलतापूर्वक रद्द कर दिया गया है।" : "Alarm successfully cancelled.");
  };

  const parseTimeToMs = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const cleanStr = timeStr.trim().toUpperCase();
    const match = cleanStr.match(/^(\d{1,2})\s*:\s*(\d{2})(?:\s*:\s*\d{2})?(?:\s*(AM|PM))?$/);
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
    const alert = notificationsList.find(a => a.id === id);
    if (!alert) return;

    const isCurrentlyEnabled = alert.enabled !== false;
    const nextEnabled = !isCurrentlyEnabled;

    if (nextEnabled) {
      const triggerTimeMs = parseTimeToMs(alert.time);
      if (!triggerTimeMs) {
        onPushToast(isHin ? "⚠️ अमान्य समय" : "⚠️ Invalid Time", isHin ? `"${alert.title}" का समय अमान्य है, कृपया इसे पुनः सेट करें।` : `"${alert.title}" time is invalid, please reset.`);
        return;
      }
      if (window.AndroidAlarm && typeof window.AndroidAlarm.scheduleAlarm === 'function') {
        window.AndroidAlarm.scheduleAlarm(
          alert.id,
          alert.title,
          triggerTimeMs,
          alert.vibrate !== false,
          alert.snoozeMinutes || 2,
          alert.ringtoneUri || ''
        );
      }
      onPushToast(isHin ? "🔔 अलार्म सक्रिय" : "🔔 Alarm Enabled", isHin ? `"${alert.title}" अलार्म चालू कर दिया गया है।` : `"${alert.title}" alarm turned on.`);
    } else {
      if (window.AndroidAlarm && typeof window.AndroidAlarm.cancelAlarm === 'function') {
        window.AndroidAlarm.cancelAlarm(alert.id);
      }
      onPushToast(isHin ? "🔕 अलार्म बंद" : "🔕 Alarm Disabled", isHin ? `"${alert.title}" अलार्म बंद कर दिया गया है।` : `"${alert.title}" alarm turned off.`);
    }

    setNotificationsList(prev => prev.map(a => a.id === id ? { ...a, enabled: nextEnabled } : a));
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customBody) return;

    const triggerTimeMs = parseTimeToMs(customTime);
    if (!triggerTimeMs) {
      onPushToast(isHin ? "⚠️ अमान्य समय प्रारूप" : "⚠️ Invalid Time Format", isHin ? "कृपया सही समय लिखें, जैसे 06:45 AM या 18:45" : "Please enter a valid time, e.g. 06:45 AM or 18:45");
      return;
    }

    const detailsSuffix = isHin 
      ? ` (कंपन: ${customVibrate ? 'हाँ' : 'नहीं'}, स्नूज़: ${customSnooze} मिनट)`
      : ` (Vibrate: ${customVibrate ? 'Yes' : 'No'}, Snooze: ${customSnooze}m)`;

    let finalUri = '';
    let selectedRingtoneTitle = isHin ? 'डिफ़ॉल्ट टोन (Flute)' : 'Default Tone (Flute)';
    if (ringtoneType === 'system') {
      finalUri = 'SYSTEM_DEFAULT';
      selectedRingtoneTitle = isHin ? 'सिस्टम अलार्म टोन' : 'System Alarm Tone';
    } else if (ringtoneType === 'custom') {
      finalUri = ringtoneUri;
      selectedRingtoneTitle = ringtoneTitle || (isHin ? 'कस्टम टोन' : 'Custom Tone');
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

    if (window.AndroidAlarm && typeof window.AndroidAlarm.scheduleAlarm === 'function') {
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
    setIsCustomOpen(false); // Collapse form after success
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
        name: isHin ? 'राहुकाल' : 'Rahukaal',
        time: `${panchangInfo.rahuKaal.start} - ${panchangInfo.rahuKaal.end}`,
        start: panchangInfo.rahuKaal.start,
        end: panchangInfo.rahuKaal.end,
        desc: isHin ? 'राहुकाल के दौरान कोई भी नया या मांगलिक कार्य शुरू करना वर्जित है।' : 'Avoid starting new endeavors or auspicious actions during Rahukaal.'
      });
    }

    // 2. Yamagandam
    if (panchangInfo.yamagandam) {
      list.push({
        name: isHin ? 'यमगण्ड काल' : 'Yamaganda Kaal',
        time: `${panchangInfo.yamagandam.start} - ${panchangInfo.yamagandam.end}`,
        start: panchangInfo.yamagandam.start,
        end: panchangInfo.yamagandam.end,
        desc: isHin ? 'यमगण्डम में मांगलिक कार्य करने पर अशुभ परिणाम प्राप्त होते हैं।' : 'Auspicious work performed during Yamagandam yields adverse results.'
      });
    }

    // 3. Gulik Kaal
    if (panchangInfo.gulikKaal) {
      list.push({
        name: isHin ? 'गुलिक काल' : 'Gulika Kaal',
        time: `${panchangInfo.gulikKaal.start} - ${panchangInfo.gulikKaal.end}`,
        start: panchangInfo.gulikKaal.start,
        end: panchangInfo.gulikKaal.end,
        desc: isHin ? 'गुलिक काल के प्रभाव में शुभ और संचय कार्य टालना चाहिए।' : 'Auspicious accumulation tasks should be avoided during Gulika Kaal.'
      });
    }

    // 4. Durmuhurat
    if (panchangInfo.durmuhurat && panchangInfo.durmuhurat.length > 0) {
      panchangInfo.durmuhurat.forEach((dm: any, idx: number) => {
        list.push({
          name: `${isHin ? 'दुर्मुहूर्त' : 'Durmuhurat'} ${idx + 1}`,
          time: `${dm.start} - ${dm.end}`,
          start: dm.start,
          end: dm.end,
          desc: isHin ? 'दुर्मुहूर्त काल ज्योतिषीय दृष्टि से प्रतिकूल समय माना जाता है।' : 'Durmuhurat is considered unfavorable in Vedic astrology.'
        });
      });
    }

    // 5. Varjyam
    if (panchangInfo.varjyam && panchangInfo.varjyam.length > 0) {
      panchangInfo.varjyam.forEach((vj: any, idx: number) => {
        list.push({
          name: `${isHin ? 'वर्ज्यम काल' : 'Varjyam Period'} ${idx + 1}`,
          time: `${vj.start} - ${vj.end}`,
          start: vj.start,
          end: vj.end,
          desc: isHin ? 'वर्ज्यम काल में यात्रा, शुभ कार्य और गृह प्रवेश वर्जित हैं।' : 'Travel, celebrations and ceremonies are prohibited during Varjyam.'
        });
      });
    }

    // 6. Inauspicious Choghadiyas
    if (panchangInfo.choghadiya) {
      panchangInfo.choghadiya.forEach((chog: any) => {
        if (chog.type === 'Kaal' || chog.type === 'Rog' || chog.type === 'Udveg') {
          const typeMap: Record<string, string> = { 'Kaal': 'काल', 'Rog': 'रोग', 'Udveg': 'उद्वेग' };
          const name = isHin ? `${typeMap[chog.type]} चौघड़िया (${chog.isDay ? 'दिन' : 'रात्रि'})` : `${chog.type} Choghadiya (${chog.isDay ? 'Day' : 'Night'})`;
          list.push({
            name,
            time: `${chog.startTime} - ${chog.endTime}`,
            start: chog.startTime,
            end: chog.endTime,
            desc: isHin ? `${chog.type === 'Rog' ? 'स्वास्थ्य हानि' : chog.type === 'Kaal' ? 'कलह' : 'चिंता'} कारक चौघड़िया मुहूर्त।` : `Inauspicious Choghadiya (${chog.type}) unfavorable for vital tasks.`
          });
        }
      });
    }

    // 7. Bhadra Kaal Warning
    if (panchangInfo.bhadra && (panchangInfo.bhadra.active || panchangInfo.bhadra.startTime)) {
      list.push({
        name: isHin ? 'भद्रा काल चेतावनी' : 'Bhadra Kaal Warning',
        time: `${panchangInfo.bhadra.startTime || panchangInfo.sunrise} - ${panchangInfo.bhadra.endTime || panchangInfo.sunset}`,
        start: panchangInfo.bhadra.startTime || panchangInfo.sunrise,
        end: panchangInfo.bhadra.endTime || panchangInfo.sunset,
        desc: isHin ? `भद्रा काल (${panchangInfo.bhadra.vasHindi || 'पाताल'}) के दौरान रक्षासूत्र, विवाह व शुभ कार्य वर्जित हैं।` : 'Auspicious rites, marriages and sacred threads are prohibited during Bhadra Kaal.'
      });
    }

    // Return all adverse periods so user can set alarms anytime (auto-scheduled for next day if passed)
    return list;
  };

  // Extract Auspicious periods list
  const getAuspiciousTimesList = () => {
    if (!panchangInfo) return [];
    const list: { name: string; time: string; start: string; end: string; desc: string }[] = [];

    // 1. Core Muhurats
    try {
      const activeM = getMuhuratsForPanchang(panchangInfo);
      activeM.forEach(muh => {
        if (muh.type === 'Amrit' || muh.type === 'Shubh') {
          list.push({
            name: isHin ? (muh.hindiName || muh.name) : (muh.name || muh.hindiName),
            time: `${muh.startTime} - ${muh.endTime}`,
            start: muh.startTime,
            end: muh.endTime,
            desc: isHin ? (muh.description || 'मांगलिक कार्यों और नवीन शुरुआत के लिए अत्यंत शुभ काल।') : 'Highly auspicious period for new beginnings and ceremonies.'
          });
        }
      });
    } catch (e) {
      console.error("Error fetching muhurats", e);
    }

    // 2. Solar & Lunar Milestones
    if (panchangInfo.sunrise) {
      list.push({
        name: isHin ? 'सूर्योदय (प्रातः संध्या समय)' : 'Sunrise (Morning Prayers Time)',
        time: panchangInfo.sunrise,
        start: panchangInfo.sunrise,
        end: panchangInfo.sunrise,
        desc: isHin ? 'प्रातः सूर्य आराधना, गायत्री जाप एवं सूर्य देव को जल अर्पित करने का पावन समय।' : 'Sacred time for morning Surya worship, Gayatri chanting and offering water.'
      });
    }
    if (panchangInfo.sunset) {
      list.push({
        name: isHin ? 'सूर्यास्त (सायं संध्या आरती)' : 'Sunset (Evening Aarti Time)',
        time: panchangInfo.sunset,
        start: panchangInfo.sunset,
        end: panchangInfo.sunset,
        desc: isHin ? 'सायंकाल मंदिर दर्शन, गृह दीप प्रज्वलन एवं संध्या आरती का पवित्र समय।' : 'Sacred evening time for temple visits, lamp lighting and Aarti.'
      });
    }
    if (panchangInfo.moonrise && panchangInfo.moonrise !== '---') {
      list.push({
        name: isHin ? 'चन्द्रोदय (चन्द्र अर्घ्य समय)' : 'Moonrise (Chandra Arghya Time)',
        time: panchangInfo.moonrise,
        start: panchangInfo.moonrise,
        end: panchangInfo.moonrise,
        desc: isHin ? 'संकष्टी चतुर्थी, करवा चौथ व पूर्णिमा व्रत पारण हेतु चन्द्र दर्शन समय।' : 'Moon sighting and offering time for fasting rituals.'
      });
    }

    // 3. Auspicious Choghadiyas
    if (panchangInfo.choghadiya) {
      panchangInfo.choghadiya.forEach((chog: any) => {
        if (chog.type === 'Shubh' || chog.type === 'Amrit' || chog.type === 'Labh') {
          const typeMap: Record<string, string> = { 'Shubh': 'शुभ', 'Amrit': 'अमृत', 'Labh': 'लाभ' };
          const name = isHin ? `${typeMap[chog.type]} चौघड़िया (${chog.isDay ? 'दिन' : 'रात्रि'})` : `${chog.type} Choghadiya (${chog.isDay ? 'Day' : 'Night'})`;
          list.push({
            name,
            time: `${chog.startTime} - ${chog.endTime}`,
            start: chog.startTime,
            end: chog.endTime,
            desc: isHin ? 'उन्नति, समृद्धि और शुभ कार्यों के संपादन के लिए सर्वोत्तम समय।' : 'Best timing for prosperity, success and auspicious endeavors.'
          });
        }
      });
    }

    // 4. Auspicious Planetary Horas
    if (panchangInfo.hora) {
      panchangInfo.hora.forEach((h: any) => {
        if (h.quality === 'Auspicious') {
          list.push({
            name: isHin ? `${h.lordHindi} होरा (${h.isDay ? 'दिन' : 'रात्रि'})` : `${h.lord} Hora (${h.isDay ? 'Day' : 'Night'})`,
            time: `${h.startTime} - ${h.endTime}`,
            start: h.startTime,
            end: h.endTime,
            desc: isHin ? (h.benefits || 'शुभ ग्रह होरा काल कार्य सिद्धि एवं शुभ खरीदारी के लिए उत्तम।') : 'Auspicious planetary Hora optimal for success and important purchases.'
          });
        }
      });
    }

    // Return all adverse periods so user can set alarms anytime (auto-scheduled for next day if passed)
    return list;
  };

  return (
    <div id="notification_simulator_root" className="text-left font-sans relative space-y-4 sm:space-y-5">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-linear-to-r from-orange-500/10 via-amber-500/10 to-transparent border !border-[#FF9933]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-amber-100 flex items-center gap-1.5">
            <span>॥</span> {isHin ? 'धार्मिक एवं नित्य साधना अलार्म' : 'Religious & Daily Sadhana Alarms'} <span>॥</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isHin ? 'सूर्योदय-सूर्यास्त अनुसार स्वचालित समय • 1-टैप में सक्रिय करें' : 'Auto-calculated by Sunrise & Sunset • Activate in 1-Tap'}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-orange-600 dark:text-amber-400 bg-orange-500/10 dark:bg-orange-950/40 px-2.5 py-1 rounded-full border border-orange-500/25 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>{notificationsList.filter(a => a.enabled !== false).length} {isHin ? 'सक्रिय' : 'Active'}</span>
        </div>
      </div>

      {/* 2. SECTION: NITYA VEDIC ALARMS (4 READY-TO-USE PRESET CARDS) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11.5px] sm:text-xs font-bold text-slate-700 dark:text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <span>✨</span> {isHin ? 'नित्य वैदिक अलार्म्स (दैनिक साधना व सावधानी)' : 'Daily Vedic Alarms (Routines & Caution)'}
          </span>
          <span className="text-[10px] text-slate-400 font-sans">
            {isHin ? 'स्वचालित लाइव गणना' : 'Live Auto Calculation'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {presetAlarms.map((preset) => {
            const isActive = isAlarmActive(notificationsList, preset.id);

            const colorClasses = {
              amber: {
                border: isActive ? 'border-amber-500 dark:border-amber-400' : 'border-amber-500/25 dark:border-amber-500/20',
                bg: isActive ? 'bg-amber-500/10 dark:bg-amber-950/30' : 'bg-amber-500/5 dark:bg-zinc-950/40',
                badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
                switchBg: 'bg-amber-500 border-amber-600'
              },
              emerald: {
                border: isActive ? 'border-emerald-500 dark:border-emerald-400' : 'border-emerald-500/25 dark:border-emerald-500/20',
                bg: isActive ? 'bg-emerald-500/10 dark:bg-emerald-950/30' : 'bg-emerald-500/5 dark:bg-zinc-950/40',
                badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
                switchBg: 'bg-emerald-600 border-emerald-500'
              },
              orange: {
                border: isActive ? 'border-orange-500 dark:border-orange-400' : 'border-orange-500/25 dark:border-orange-500/20',
                bg: isActive ? 'bg-orange-500/10 dark:bg-orange-950/30' : 'bg-orange-500/5 dark:bg-zinc-950/40',
                badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
                switchBg: 'bg-orange-600 border-orange-500'
              },
              rose: {
                border: isActive ? 'border-rose-500 dark:border-rose-400' : 'border-rose-500/25 dark:border-rose-500/20',
                bg: isActive ? 'bg-rose-500/10 dark:bg-rose-950/30' : 'bg-rose-500/5 dark:bg-zinc-950/40',
                badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
                switchBg: 'bg-rose-600 border-rose-500'
              }
            }[preset.colorKey];

            return (
              <div
                key={preset.id}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 shadow-2xs relative overflow-hidden ${colorClasses.border} ${colorClasses.bg}`}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${colorClasses.switchBg}`} />
                )}

                {/* Top Row: Icon, Title & Toggle Switch */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl sm:text-2xl shrink-0">{preset.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-900 dark:text-amber-100 font-serif truncate">
                          {preset.title}
                        </h4>
                        {isActive && (
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {isHin ? 'सक्रिय' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-tight mt-0.5">
                        {preset.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* 1-Tap Toggle Button */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label={isHin ? `${preset.title} अलार्म ${isActive ? 'बंद करें' : 'चालू करें'}` : `${isActive ? 'Turn off' : 'Turn on'} ${preset.title} alarm`}
                    onClick={() => handleTogglePreset(preset)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer p-1 rounded-xl transition-all shrink-0"
                    title={isActive ? (isHin ? "अलार्म बंद करें" : "Disable alarm") : (isHin ? "अलार्म चालू करें" : "Enable alarm")}
                  >
                    <div className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center p-0.5 border ${
                      isActive 
                        ? colorClasses.switchBg + ' justify-end shadow-xs' 
                        : 'bg-zinc-300 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-700 justify-start'
                    }`}>
                      <span className="w-4 h-4 rounded-full bg-white shadow-xs transition-transform" />
                    </div>
                  </button>
                </div>

                {/* Bottom Row: Time Pill & Status Note */}
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-500/10 dark:border-zinc-800/60 flex-wrap">
                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg border flex items-center gap-1 shrink-0 ${colorClasses.badge}`}>
                    <Clock className="w-3 h-3" />
                    {preset.displayTime}
                  </span>

                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans truncate">
                    {preset.id === 'alert_rahukaal' ? (isHin ? '5 मिनट पूर्व चेतावनी' : '5-min prior warning') : (isHin ? 'दैनिक स्वतः शेड्यूल्ड' : 'Daily auto-scheduled')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION: QUICK PICKERS (2 WIDE ACTION BUTTONS) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider block px-0.5">
          🎯 {isHin ? 'अन्य ज्योतिषीय काल एवं चौघड़िया से त्वरित चयन:' : 'Quick Selection from Astrological Timings:'}
        </span>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setShowAuspiciousModal(true)}
            className="p-2.5 sm:p-3 min-h-[44px] rounded-xl bg-emerald-950/15 dark:bg-emerald-950/30 hover:bg-emerald-950/25 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs text-center"
          >
            <span>🟢</span>
            <span>{isHin ? 'शुभ काल व चौघड़िया ▾' : 'Auspicious Timings & Choghadiya ▾'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdverseModal(true)}
            className="p-2.5 sm:p-3 min-h-[44px] rounded-xl bg-rose-950/15 dark:bg-rose-950/30 hover:bg-rose-950/25 border border-rose-500/35 text-rose-700 dark:text-rose-300 text-xs sm:text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs text-center"
          >
            <span>🔴</span>
            <span>{isHin ? 'वर्जित काल (यमगण्ड, गुलिक) ▾' : 'Inauspicious Timings (Yamaganda, Gulika) ▾'}</span>
          </button>
        </div>
      </div>

      {/* 4. SECTION: ACCORDION CUSTOM ALARM CREATOR */}
      <div className="rounded-2xl border !border-[#FF9933]/35 dark:!border-[#FF9933]/25 bg-slate-500/5 dark:bg-zinc-900/30 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className="w-full p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-orange-500/5 dark:hover:bg-zinc-900/60 transition-all text-left"
          aria-expanded={isCustomOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform ${
              isCustomOpen 
                ? 'bg-orange-500 text-white border-orange-600 rotate-45' 
                : 'bg-orange-500/10 text-orange-600 dark:text-amber-400 border-orange-500/30'
            }`}>
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-[13.5px] font-bold text-slate-800 dark:text-amber-200 block font-serif">
                {isHin ? 'अपना कस्टम अलार्म बनाएं (व्यक्तिगत पाठ व अनुष्ठान)' : 'Create Custom Alarm (Personal Prayers & Rituals)'}
              </span>
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                {isHin ? 'विशेष व्यक्तिगत समय, स्नूज़ व कस्टम रिंगटोन सेट करने हेतु टैप करें' : 'Tap to set custom time, snooze & personalized ringtones'}
              </span>
            </div>
          </div>
          <div className="text-slate-400 p-1">
            {isCustomOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isCustomOpen && (
          <div className="p-3.5 sm:p-4 pt-1 border-t border-slate-500/15 dark:border-zinc-800">
            <form onSubmit={handleCreateCustom} className="space-y-3 font-sans">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                  {isHin ? 'रिमाइंडर का शीर्षक' : 'Reminder Title'}
                </label>
                <input
                  type="text"
                  placeholder={isHin ? "जैसे: श्री सुंदरकांड पाठ या सायंकालीन आरती" : "e.g., Sundarkand Path or Evening Aarti"}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                  {isHin ? 'विवरण (जानकारी / निर्देश)' : 'Description (Details / Notes)'}
                </label>
                <textarea
                  placeholder={isHin ? "जैसे: घी का दीपक प्रज्वलित करें एवं हनुमान चालीसा का पाठ करें।" : "e.g., Light a lamp and chant Hanuman Chalisa."}
                  value={customBody}
                  rows={2}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                    {isHin ? 'समय सेट करें' : 'Set Time'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHin ? "जैसे: 06:45 PM" : "e.g., 06:45 PM"}
                    value={customTime}
                    onChange={(e) => {
                      setCustomTime(e.target.value);
                      setCustomEndTime('');
                    }}
                    className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                    {isHin ? 'स्नूज़ अवधि' : 'Snooze Duration'}
                  </label>
                  <select
                    value={customSnooze}
                    onChange={(e) => setCustomSnooze(parseInt(e.target.value, 10))}
                    className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    <option value={1}>1 {isHin ? 'मिनट' : 'minute'}</option>
                    <option value={2}>2 {isHin ? 'मिनट (मानक)' : 'minutes (Standard)'}</option>
                    <option value={3}>3 {isHin ? 'मिनट' : 'minutes'}</option>
                    <option value={5}>5 {isHin ? 'मिनट' : 'minutes'}</option>
                    <option value={10}>10 {isHin ? 'मिनट' : 'minutes'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-500/5 dark:bg-zinc-900/50 rounded-xl px-3 border !border-[#FF9933]/20">
                <span className="text-[11.5px] font-bold text-slate-700 dark:text-slate-300">
                  {isHin ? 'अलार्म कंपन (Vibrate on alert)' : 'Vibrate on Alert'}
                </span>
                <input
                  type="checkbox"
                  checked={customVibrate}
                  onChange={(e) => setCustomVibrate(e.target.checked)}
                  className="w-9 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 checked:bg-orange-600 appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all checked:after:translate-x-4 border border-slate-300 dark:border-zinc-700 checked:border-orange-600 shrink-0"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                  {isHin ? 'अलार्म रिंगटोन' : 'Alarm Ringtone'}
                </label>
                <select
                  value={ringtoneType}
                  onChange={(e) => setRingtoneType(e.target.value as any)}
                  className="w-full text-xs sm:text-[13px] p-2.5 rounded-xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-slate-800 dark:text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
                >
                  <option value="default">{isHin ? 'ऐप डिफ़ॉल्ट टोन (Flute Melody)' : 'App Default Tone (Flute Melody)'}</option>
                  <option value="system">{isHin ? 'सिस्टम अलार्म टोन' : 'System Alarm Tone'}</option>
                  <option value="custom">{isHin ? 'फ़ोन स्टोरेज से टोन चुनें...' : 'Choose from phone storage...'}</option>
                </select>
              </div>

              {ringtoneType === 'custom' && (
                <div className="p-2.5 bg-orange-500/5 dark:bg-orange-950/20 rounded-xl border !border-[#FF9933]/30 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">{isHin ? 'चुनी हुई टोन:' : 'Selected Tone:'}</span>
                    <span className="font-bold text-orange-900 dark:text-orange-400 truncate max-w-[150px] font-mono">
                      {ringtoneTitle || (isHin ? 'कोई नहीं' : 'None')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectCustomRingtone}
                    className="p-2 min-h-[44px] bg-orange-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-orange-700 transition-all border border-orange-500/40 flex items-center justify-center"
                  >
                    {isHin ? 'फ़ोन से टोन फ़ाइल चुनें' : 'Choose tone file from phone'}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl shadow-xs text-xs sm:text-[13px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border !border-[#FF9933]"
              >
                <Plus className="w-4 h-4" />
                {isHin ? 'कस्टम रिमाइंडर शेड्यूल करें' : 'Schedule Custom Reminder'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 5. SECTION: ACTIVE SCHEDULED ALARMS MANAGER */}
      <div className="bg-slate-500/5 dark:bg-zinc-900/30 rounded-2xl border !border-[#FF9933]/35 dark:!border-[#FF9933]/25 p-3.5 sm:p-4 space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-amber-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-500" />
            {isHin ? 'सक्रिय अलार्म सूची (Active Scheduled Alarms)' : 'Active Scheduled Alarms'}
          </h3>
          {notificationsList.length > 0 && (
            <span className="text-[10.5px] font-bold bg-orange-500/10 text-orange-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-mono border !border-[#FF9933]/25">
              {notificationsList.length} {isHin ? 'सेट हैं' : 'Set'}
            </span>
          )}
        </div>

        {/* List of active scheduled alarms */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {notificationsList.length === 0 ? (
            <div className="text-center py-8 sm:py-10 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-500/20 dark:border-zinc-800 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-slate-350 dark:text-zinc-700" />
              <span className="text-xs text-slate-500 dark:text-zinc-400 italic">
                {isHin ? 'अभी कोई अलार्म सक्रिय नहीं है।' : 'No active alarms scheduled yet.'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs text-center">
                {isHin ? 'ऊपर दिए 4 नित्य वैदिक कार्ड्स या शुभ/अशुभ काल से 1-टैप में अलार्म चालू करें।' : 'Enable alarms in 1-tap using the 4 Daily Vedic Cards or Auspicious/Inauspicious pickers above.'}
              </span>
            </div>
          ) : (
            notificationsList.map((alert) => {
              const isEnabled = alert.enabled !== false;

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-2xl bg-white dark:bg-zinc-950 border !border-[#FF9933]/30 dark:!border-[#FF9933]/20 text-left flex justify-between items-center gap-2 shadow-xs relative overflow-hidden transition-opacity ${
                    !isEnabled ? 'opacity-65' : ''
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isEnabled ? 'bg-orange-500' : 'bg-zinc-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0 pl-1.5 space-y-1">
                    <div className="flex justify-between items-start gap-1 flex-wrap">
                      <span className="text-[14px] sm:text-[15px] font-black text-slate-800 dark:text-amber-100 font-serif">
                        {alert.title}
                      </span>
                      
                      {/* Alarm Time duration details */}
                      <span className="text-[11px] font-bold text-orange-600 dark:text-amber-400 font-mono bg-orange-500/5 dark:bg-orange-950/30 px-2.5 py-0.5 rounded-lg border !border-[#FF9933]/20 shrink-0">
                        {alert.time}
                        {alert.endTime ? (isHin ? ` से ${alert.endTime}` : ` to ${alert.endTime}`) : ''}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-2">
                      {alert.body}
                    </p>
                    
                    {/* Sub-config display */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 font-mono pt-0.5 flex-wrap">
                      <span className="flex items-center gap-0.5">
                        <Volume2 className="w-3 h-3" />
                        {alert.ringtoneTitle || (isHin ? 'डिफ़ॉल्ट टोन' : 'Default Tone')}
                      </span>
                      <span>•</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        isEnabled 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                          : 'text-zinc-500 dark:text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                      }`}>
                        {isEnabled ? (isHin ? 'सक्रिय' : 'Active') : (isHin ? 'निष्क्रिय' : 'Disabled')}
                      </span>
                      {alert.vibrate !== false && (
                        <>
                          <span>•</span>
                          <span>{isHin ? 'कंपन चालू' : 'Vibration On'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Active On/Off toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={isHin ? `${alert.title} अलार्म ${isEnabled ? 'बंद करें' : 'चालू करें'}` : `${isEnabled ? 'Turn off' : 'Turn on'} ${alert.title} alarm`}
                      onClick={() => handleToggleAlert(alert.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer p-1 rounded-xl hover:bg-orange-500/5 transition-all"
                      title={isEnabled ? (isHin ? "अलार्म बंद करें" : "Turn off alarm") : (isHin ? "अलार्म चालू करें" : "Turn on alarm")}
                    >
                      <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 border ${
                        isEnabled 
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
                      title={isHin ? "अलार्म हटाएं" : "Remove alarm"}
                      aria-label={isHin ? "अलार्म हटाएं" : "Remove alarm"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Adverse Times (1-Tap Direct Schedule) */}
      {showAdverseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-[#1C1714] border !border-[#FF9933]/45 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[82vh] flex flex-col">
            <div className="flex justify-between items-center border-b !border-[#FF9933]/20 pb-2.5 mb-2.5">
              <h3 className="text-[14.5px] sm:text-[15.5px] font-bold text-red-400 font-serif flex items-center gap-1.5">
                <span>🔴</span> {isHin ? 'आज के अशुभ काल एवं वर्जित समय' : "Today's Inauspicious & Prohibited Timings"}
              </h3>
              <button 
                onClick={() => setShowAdverseModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-base min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
                aria-label={isHin ? "बंद करें" : "Close"}
              >
                ✕
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-2">
              {isHin ? 'किसी भी समय का अलार्म सक्रिय करने हेतु सीधे "अलार्म सेट करें" दबाएं:' : 'Tap "Set Alarm" to enable an alert for any timing:'}
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {getAdverseTimesList().length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  {isHin ? 'आज के शेष समय में कोई अशुभ काल उपलब्ध नहीं है।' : 'No inauspicious timings remaining today.'}
                </div>
              ) : (
                getAdverseTimesList().map((item, idx) => {
                  const safeId = `alert_${item.name.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')}_${item.start.replace(/[^a-zA-Z0-9]/g, '')}`;
                  const isItemActive = isAlarmActive(notificationsList, safeId);
                  const isPassed = isTimePassed(item.end || item.start);

                  return (
                    <div key={idx} className="p-3 bg-red-950/20 hover:bg-red-950/30 border !border-[#FF9933]/25 rounded-2xl flex justify-between items-center gap-3">
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[13px] font-bold text-red-300 truncate font-serif">{item.name}</span>
                          <span className="text-[11px] font-mono text-slate-300 bg-red-950/60 px-2 py-0.5 rounded-full shrink-0 border border-red-500/20">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDirectScheduleFromModal(item, true)}
                        className={`px-3 py-1.5 min-h-[44px] min-w-[78px] text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center flex-shrink-0 border ${
                          isItemActive
                            ? 'bg-rose-700 text-white border-rose-500 shadow-xs'
                            : 'bg-red-950/60 hover:bg-red-900 active:bg-red-800 text-red-200 border-red-500/30'
                        }`}
                      >
                        {isItemActive ? (isHin ? 'सक्रिय ✓' : 'Active ✓') : isPassed ? (isHin ? 'अलार्म (कल)' : 'Alarm (Tom)') : (isHin ? 'अलार्म सेट' : 'Set Alarm')}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Auspicious Times (1-Tap Direct Schedule) */}
      {showAuspiciousModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-[#1C1714] border !border-[#FF9933]/45 rounded-3xl w-full max-w-md p-4 sm:p-5 shadow-2xl max-h-[82vh] flex flex-col">
            <div className="flex justify-between items-center border-b !border-[#FF9933]/20 pb-2.5 mb-2.5">
              <h3 className="text-[14.5px] sm:text-[15.5px] font-bold text-emerald-400 font-serif flex items-center gap-1.5">
                <span>🟢</span> {isHin ? 'आज के शुभ काल एवं चौघड़िया' : "Today's Auspicious Timings & Choghadiya"}
              </h3>
              <button 
                onClick={() => setShowAuspiciousModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-base min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
                aria-label={isHin ? "बंद करें" : "Close"}
              >
                ✕
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-2">
              {isHin ? 'किसी भी शुभ मुहूर्त का अलार्म सीधे 1-टैप में चालू करें:' : 'Enable an alarm for any auspicious muhurat in 1-tap:'}
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {getAuspiciousTimesList().length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  {isHin ? 'आज के शेष समय में कोई शुभ काल उपलब्ध नहीं है।' : 'No auspicious timings remaining today.'}
                </div>
              ) : (
                getAuspiciousTimesList().map((item, idx) => {
                  const safeId = `alert_${item.name.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')}_${item.start.replace(/[^a-zA-Z0-9]/g, '')}`;
                  const isItemActive = isAlarmActive(notificationsList, safeId);
                  const isPassed = isTimePassed(item.end || item.start);

                  return (
                    <div key={idx} className="p-3 bg-emerald-950/20 hover:bg-emerald-950/30 border !border-[#FF9933]/25 rounded-2xl flex justify-between items-center gap-3">
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[13px] font-bold text-emerald-300 truncate font-serif">{item.name}</span>
                          <span className="text-[11px] font-mono text-slate-300 bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0 border border-emerald-500/20">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDirectScheduleFromModal(item, false)}
                        className={`px-3 py-1.5 min-h-[44px] min-w-[78px] text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center flex-shrink-0 border ${
                          isItemActive
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-200 border-emerald-500/30'
                        }`}
                      >
                        {isItemActive ? (isHin ? 'सक्रिय ✓' : 'Active ✓') : isPassed ? (isHin ? 'अलार्म (कल)' : 'Alarm (Tom)') : (isHin ? 'अलार्म सेट' : 'Set Alarm')}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
