/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { HeaderClock } from './components/HeaderClock';
import { 
  Home, 
  Map, 
  Calendar, 
  Clock, 
  Sparkles, 
  MapPin, 
  Bell, 
  Settings, 
  Landmark, 
  ChevronRight, ChevronDown, ChevronUp, 
  Share2,
  Info,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Compass,
  AlertTriangle
} from 'lucide-react';

import { Coords, SettingsState, AppNotification, ChoghadiyaInterval, HoraInterval } from './types';
import { isAlarmActive, toggleQuickAlarm, QuickAlarmParams } from './utils/alarmUtils';
import { getPanchangForDate as originalGetPanchangForDate, getMuhuratsForPanchang, getChoghadiyaPresentationData, clearPanchangCache } from './utils/panchangCalc';

const getPanchangForDate = (lat: number, lon: number, date: Date) => {
  const info = originalGetPanchangForDate(lat, lon, date);
  if (info && info.hora) {
    const planetMap: Record<string, string> = {
      'Sun': 'सूर्य',
      'Moon': 'चन्द्र',
      'Mars': 'मंगल',
      'Mercury': 'बुध',
      'Jupiter': 'गुरु',
      'Venus': 'शुक्र',
      'Saturn': 'शनि',
    };
    info.hora.forEach(h => {
      if (h.lord && planetMap[h.lord]) {
        h.lordHindi = planetMap[h.lord];
      }
    });
  }
  return info;
};

import { registerEngineListener, isReady, getEngineProgressStage, isTimeoutTriggered, retryEngineInitialization, extendInitializationTimeout, isMaxRetriesReached, getRetryCount, getLastDiagnosticInfo, isEngineCalculating, registerActiveExpectedKeys, astronomicalEngine } from './utils/astronomicalEngine';
import { EngineLogger } from './utils/engineLogger';



// Subcomponents
import { ChaughadiyaRing } from './components/ChaughadiyaRing';
import { HoraRing } from './components/HoraRing';

import { LiveMuhuratWatch } from './components/LiveMuhuratWatch';
import { PanchangScreen } from './components/PanchangScreen';
import { MuhuratScreen } from './components/MuhuratScreen';
import { FestivalScreen } from './components/FestivalScreen';
import { PosterGenerator } from './components/PosterGenerator';
import { WidgetSimulator } from './components/WidgetSimulator';
import { NotificationSimulator } from './components/NotificationSimulator';
import { MonetizationSimulator } from './components/MonetizationSimulator';
import { SettingsScreen } from './components/SettingsScreen';
import { SplashScreen, SplashStyle } from './components/SplashScreen';
import { SacredLogoIcon } from './components/LogoSelector';
import { HelpModal } from './components/HelpModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { SanatanTimeWheel } from './components/SanatanTimeWheel';
import { MoonPhaseVisualizer } from './components/MoonPhaseVisualizer';

// Hindu Dharmik Sacred Additions
import { StotraSangrah } from './components/StotraSangrah';
import dialBg from './components/VintageDialBackground.png';
import { getTranslation, formatHindiTime, translateCityNameToHindi, formatLocalizedTime, translateDishaShool, translatePanchak } from './utils/translations';
import { getFestivalsForYear } from './utils/festivalEngine';
import { getDishaShoolForDay } from './utils/alarmUtils';

const parseTimeToMinutes = (timeStr: string): number => {
  const [time, ampm] = timeStr.split(' ');
  if (!time || !ampm) return 0;
  let [hrs, mins] = time.split(':').map(Number);
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const isTimeInInterval = (currMin: number, startStr: string, endStr: string): boolean => {
  const start = parseTimeToMinutes(startStr);
  const end = parseTimeToMinutes(endStr);
  if (start <= end) {
    return currMin >= start && currMin < end;
  } else {
    return currMin >= start || currMin < end;
  }
};

const NAKSHATRAS_LIST = [
  "Ashwini (अश्विनी)", "Bharani (भरणी)", "Krittika (कृत्तिका)", "Rohini (रोहिणी)", "Mrigashira (मृगशिरा)", "Ardra (आर्द्रा)",
  "Punarvasu (पुनर्वसु)", "Pushya (पुष्य)", "Ashlesha (श्लेषा)", "Magha (मघा)", "Purva Phalguni (पूर्वाफाल्गुनी)", "Uttara Phalguni (उत्तराफाल्गुनी)",
  "Hasta (हस्त)", "Chitra (चित्रा)", "Swati (स्वाती)", "Vishakha (विशाखा)", "Anuradha (अनुराधा)", "Jyeshtha (ज्येष्ठा)",
  "Mula (मूल)", "Purva Ashadha (पूर्वाषाढ़ा)", "Uttara Ashadha (उत्तराषाढ़ा)", "Shravana (श्रवण)", "Dhanishta (धनिष्ठा)",
  "Shatabhisha (शतभिषा)", "Purva Bhadrapada (पूर्वाभाद्रपद)", "Uttara Bhadrapada (उत्तराभाद्रपद)", "Revati (रेवती)"
];

const RASHIS_LIST = [
  { eng: "Aries", hin: "मेष (Aries)" },
  { eng: "Taurus", hin: "वृषभ (Taurus)" },
  { eng: "Gemini", hin: "मिथुन (Gemini)" },
  { eng: "Cancer", hin: "कर्क (Cancer)" },
  { eng: "Leo", hin: "सिंह (Leo)" },
  { eng: "Virgo", hin: "कन्या (Virgo)" },
  { eng: "Libra", hin: "तुला (Libra)" },
  { eng: "Scorpio", hin: "वृश्चिक (Scorpio)" },
  { eng: "Sagittarius", hin: "धनु (Sagittarius)" },
  { eng: "Capricorn", hin: "मकर (Capricorn)" },
  { eng: "Aquarius", hin: "कुम्भ (Aquarius)" },
  { eng: "Pisces", hin: "मीन (Pisces)" }
];



// Default Location (New Delhi, India)
const DEFAULT_COORDS: Coords = {
  latitude: 28.6139,
  longitude: 77.2090,
  city: 'New Delhi',
  state: 'Delhi'
};

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'light',
  language: 'Hindi',
  fontSize: 'large',
  locationMode: 'GPS',
  notifications: {
    morningPanchang: true,
    festivalReminder: true,
    ekadashiReminder: true,
    purnimaReminder: true,
    muhuratReminder: true
  },
  monetizationUnlock: false,
  splashStyle: 'crimson',
  logoStyle: 'om',
  clockMode: 'digital',
  customSplash: '/Splash2.0.png'
};

const translateSanskritMonth = (month: string) => {
  const map: Record<string, string> = {
    'Chaitra': 'चैत्र',
    'Vaisakha': 'वैशाख',
    'Jyeshtha': 'ज्येष्ठ',
    'Ashadha': 'आषाढ़',
    'Shravana': 'श्रावण',
    'Bhadrapada': 'भाद्रपद',
    'Ashwin': 'आश्विन',
    'Kartik': 'कार्तिक',
    'Margashirsha': 'मार्गशीर्ष',
    'Pausha': 'पौष',
    'Maagha': 'माघ',
    'Phalguna': 'फाल्गुन'
  };
  return map[month] || month;
};

const translateSeasons = (ritu: string) => {
  const map: Record<string, string> = {
    'Vasanta (Spring)': 'वसन्त (वसन्त ऋतु)',
    'Grishma (Summer)': 'ग्रीष्म (गर्मी)',
    'Varsha (Monsoon)': 'वर्षा (मानसून)',
    'Sharad (Autumn)': 'शरद (पतझड़)',
    'Hemant (Winter-pre)': 'हेमन्त (शिशिर पूर्व)',
    'Shishir (Winter-peak)': 'शिशिर (पूर्ण शीत)'
  };
  return map[ritu] || ritu;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 110, 
      damping: 16 
    } 
  }
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab ] = useState<'home' | 'panchang' | 'muhurat' | 'festival' | 'nakshatra' | 'tools' | 'alerts'>('home');

  // Splash Screen State
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  console.log('[SPLASH_TRACE] Render - isSplashActive state:', isSplashActive);
  const [splashTimerFinished, setSplashTimerFinished] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(false);
  const [splashAnimationCompleted, setSplashAnimationCompleted] = useState<boolean>(false);
  const [previewSplashStyle, setPreviewSplashStyle] = useState<SplashStyle | null>(null);

  // Enforce 12-second premium splash screen duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashTimerFinished(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);
  
  // Permanent Notification State
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false);
  useEffect(() => {
    if (window.AndroidAlarm && typeof window.AndroidAlarm.isPermanentNotificationEnabled === 'function') {
      try {
        setNotificationEnabled(window.AndroidAlarm.isPermanentNotificationEnabled());
      } catch (e) {
        console.error("Failed to load permanent notification state", e);
      }
    }
  }, []);

  // Handle Quick Action button clicks from Android Permanent Notification
  useEffect(() => {
    window.onNotificationAction = (type: 'tab' | 'action', value: string) => {
      if (type === 'tab') {
        if (value === 'home' || value === 'panchang' || value === 'muhurat' || value === 'festival' || value === 'nakshatra' || value === 'tools' || value === 'alerts') {
          setActiveTab(value as any);
        }
      } else if (type === 'action') {
        if (value === 'share_poster') {
          setActiveTab('tools');
          setTimeout(() => {
            const el = document.getElementById('tools_poster_card');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      }
    };
    return () => {
      delete window.onNotificationAction;
    };
  }, []);

  // Core Astro State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [muhuratSelectedDate, setMuhuratSelectedDate] = useState<Date>(new Date());
  const [panchangSelectedDate, setPanchangSelectedDate] = useState<Date>(new Date());
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [currentMinuteTime, setCurrentMinuteTime] = useState<Date>(new Date());
  const [homeTimeCycleTab, setHomeTimeCycleTab] = useState<'choghadiya' | 'hora'>('choghadiya');
  const [showDeepPanchang, setShowDeepPanchang] = useState<boolean>(false);

  // Birth Details for Personalized Tara Bala / Chandra Bala
  const [birthNakshatraIdx, setBirthNakshatraIdx] = useState<number>(() => {
    const cached = localStorage.getItem('dharmic_birth_naks');
    return cached ? parseInt(cached, 10) : 0;
  });
  const [birthRashiIdx, setBirthRashiIdx] = useState<number>(() => {
    const cached = localStorage.getItem('dharmic_birth_rashi');
    return cached ? parseInt(cached, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('dharmic_birth_naks', birthNakshatraIdx.toString());
  }, [birthNakshatraIdx]);
  useEffect(() => {
    localStorage.setItem('dharmic_birth_rashi', birthRashiIdx.toString());
  }, [birthRashiIdx]);

  // Preferences & Logs
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const cached = localStorage.getItem('dharmic_samay_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.customSplash === '/Splash1.0.png') {
          parsed.customSplash = '/Splash2.0.png';
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to read cached settings:', e);
    }
    return DEFAULT_SETTINGS;
  });
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);

  // Dynamically set root HTML font size for scaling rem units
  useEffect(() => {
    const root = document.documentElement;
    const size = settings.fontSize || 'medium';
    if (size === 'small') {
      root.style.fontSize = '14px';
    } else if (size === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [settings.fontSize]);

  // Push Alert Toast States
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Force update trigger on astronomical calculation changes
  const [updateTrigger, setUpdateTrigger] = useState({});
  useEffect(() => {
    registerEngineListener(() => {
      clearPanchangCache();
      setUpdateTrigger({});
      if (isReady() && !isEngineCalculating()) {
        setIsAppLoading(false);
      }
    });
  }, []);

  // Coordinate splash dismissal once BOTH 12s is over and engine has finished first calculations
  useEffect(() => {
    if (splashTimerFinished && isReady() && !isEngineCalculating()) {
      setIsSplashActive(false);
    }
  }, [splashTimerFinished, updateTrigger]);

  // Date change hone par cache saaf karo — taaki Swiss result ke liye fresh calculation ho
  useEffect(() => {
    setIsAppLoading(true);
    clearPanchangCache();
  }, [selectedDate, panchangSelectedDate, muhuratSelectedDate]);

  // Helper to update city and persist to local storage
  const handleSelectCity = (newCoords: Coords) => {
    setIsAppLoading(true);
    setCoords(newCoords);
    try {
      localStorage.setItem('dharmic_samay_coords', JSON.stringify(newCoords));
    } catch (e) {
      console.warn('Failed to cache coords', e);
    }
  };

  // Load from local Cache on Mount & Auto-Detect GPS for first-time users
  useEffect(() => {
    let hasCache = false;
    try {
      const cachedCoords = localStorage.getItem('dharmic_samay_coords');
      const cachedSettings = localStorage.getItem('dharmic_samay_settings');
      const cachedAlerts = localStorage.getItem('dharmic_samay_alerts');

      if (cachedCoords) {
        setCoords(JSON.parse(cachedCoords));
        setGpsActive(true);
      }
      if (cachedSettings) {
        const parsed = JSON.parse(cachedSettings);
        if (parsed.customSplash === '/Splash1.0.png') {
          parsed.customSplash = '/Splash2.0.png';
        }
        setSettings(parsed);
      }
      if (cachedAlerts) {
        setNotificationsList(JSON.parse(cachedAlerts));
      }
    } catch (e) {
      console.warn('Caching failed or declined in sandbox.', e);
    }
  }, []);

  // Phase 4: Bulk validation check on development spike URL query (?validate=true)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('validate=true')) {
      import('./utils/validateEngine').then(({ runBulkValidation }) => {
        const interval = setInterval(() => {
          if (isReady()) {
            clearInterval(interval);
            runBulkValidation();
          }
        }, 100);
      });
    }
  }, []);

  // Active Keys Registration for Worker Concurrency & Race Condition Protection
  useEffect(() => {
    const qDate = getQueryDate(selectedDate);
    const qPanchang = getQueryDate(panchangSelectedDate);
    const qMuhurat = getQueryDate(muhuratSelectedDate);

    const keyActiveSolar = `SOLAR_${coords.latitude.toFixed(4)}_${coords.longitude.toFixed(4)}_${qDate.toDateString()}`;
    const keyActiveMoon = `MOON_${coords.latitude.toFixed(4)}_${coords.longitude.toFixed(4)}_${qDate.toDateString()}`;
    const keyActivePos = `POS_${qDate.toDateString()}_${qDate.getHours()}_${qDate.getMinutes()}`;

    const keyPanchangPos = `POS_${qPanchang.toDateString()}_${qPanchang.getHours()}_${qPanchang.getMinutes()}`;
    const keyMuhuratPos = `POS_${qMuhurat.toDateString()}_${qMuhurat.getHours()}_${qMuhurat.getMinutes()}`;

    registerActiveExpectedKeys([
      keyActiveSolar,
      keyActiveMoon,
      keyActivePos,
      keyPanchangPos,
      keyMuhuratPos
    ]);
  }, [coords, selectedDate, panchangSelectedDate, muhuratSelectedDate, activeTab]);

  // Automated Midnight Rollover Scheduler (Exactly once per calendar day change)
  useEffect(() => {
    const scheduleNextMidnight = (): ReturnType<typeof setTimeout> => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next 00:00:00 local time
      const msToMidnight = midnight.getTime() - now.getTime();

      return setTimeout(() => {
        setIsAppLoading(true);
        clearPanchangCache();
        
        const newToday = new Date();
        setSelectedDate(newToday);
        setPanchangSelectedDate(newToday);
        setMuhuratSelectedDate(newToday);
        
        setUpdateTrigger({});
        
        // Reschedule for the next day
        timerId = scheduleNextMidnight();
      }, msToMidnight);
    };

    let timerId = scheduleNextMidnight();
    return () => clearTimeout(timerId);
  }, []);

  // Sync to local Cache whenever states mutate
  useEffect(() => {
    try {
      localStorage.setItem('dharmic_samay_coords', JSON.stringify(coords));
    } catch {}
  }, [coords]);

  useEffect(() => {
    try {
      localStorage.setItem('dharmic_samay_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Sync document class with current settings theme for Tailwind dark mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      document.documentElement.classList.remove('temple');
      document.body.classList.remove('temple');
    }
  }, [settings.theme]);

  useEffect(() => {
    try {
      localStorage.setItem('dharmic_samay_alerts', JSON.stringify(notificationsList));
    } catch {}
  }, [notificationsList]);

  // Keep ticking Clock once a minute at the minute boundary
  useEffect(() => {
    const now = new Date();
    const msToNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    
    let intervalId: any;
    const timeoutId = setTimeout(() => {
      setCurrentMinuteTime(new Date());
      intervalId = setInterval(() => {
        setCurrentMinuteTime(new Date());
      }, 60000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Helper to merge live ticking time when date is today
  const getQueryDate = (baseDate: Date) => {
    const now = new Date();
    if (baseDate.toDateString() === now.toDateString()) {
      const query = new Date(baseDate);
      query.setHours(currentMinuteTime.getHours());
      query.setMinutes(currentMinuteTime.getMinutes());
      query.setSeconds(currentMinuteTime.getSeconds());
      return query;
    }
    return baseDate;
  };

  // Real-time calculated Panchang and Muhurats
  const panchangInfo = useMemo(() => {
    const qDate = getQueryDate(selectedDate);
    return getPanchangForDate(coords.latitude, coords.longitude, qDate);
  }, [coords.latitude, coords.longitude, selectedDate, updateTrigger]);

  const muhuratPanchangInfo = useMemo(() => {
    const qDate = getQueryDate(muhuratSelectedDate);
    return getPanchangForDate(coords.latitude, coords.longitude, qDate);
  }, [coords.latitude, coords.longitude, muhuratSelectedDate, updateTrigger]);

  const panchangScreenInfo = useMemo(() => {
    const qDate = getQueryDate(panchangSelectedDate);
    return getPanchangForDate(coords.latitude, coords.longitude, qDate);
  }, [coords.latitude, coords.longitude, panchangSelectedDate, updateTrigger]);

  const activeMuhurats = useMemo(() => getMuhuratsForPanchang(panchangInfo), [panchangInfo]);

  const isPanchangDataReady = Boolean(
    panchangInfo &&
    panchangInfo.planets &&
    panchangInfo.planets.length === 9 &&
    !panchangInfo.planets.every(p => p.sign === 'Aries')
  );

  // Synchronize Widget & Live Permanent Notification Data on Android
  useEffect(() => {
    if (!panchangInfo) return;

    try {
      const tithi = panchangInfo.hinduDate.tithi.hindiName.split(' ')[0];
      const nakshatra = panchangInfo.hinduDate.nakshatra.hindiName;
      
      // Find current active Choghadiya
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const activeChog = panchangInfo.choghadiya?.find((ch: any) => 
        isTimeInInterval(currentMin, ch.startTime, ch.endTime)
      );

      const choghadiyaName = activeChog ? `${activeChog.hindiName || activeChog.name} (${activeChog.isDay ? 'दिन' : 'रात्रि'})` : '—';
      const choghadiyaTime = activeChog ? `${activeChog.startTime} - ${activeChog.endTime}` : '—';
      const rahuKaalStr = panchangInfo.rahuKaal ? `${panchangInfo.rahuKaal.start} - ${panchangInfo.rahuKaal.end}` : '—';

      const abhijit = activeMuhurats.find((m: any) => m.id === 'abhijit');
      const abhijitStr = abhijit ? `${abhijit.startTime} - ${abhijit.endTime}` : '—';
      const brahma = activeMuhurats.find((m: any) => m.id === 'brahma');
      const brahmaStr = brahma ? `${brahma.startTime} - ${brahma.endTime}` : '—';

      // 1. Update Widget Data
      if (window.AndroidAlarm && typeof window.AndroidAlarm.updateWidgetData === 'function') {
        window.AndroidAlarm.updateWidgetData(tithi, nakshatra, choghadiyaName, choghadiyaTime, rahuKaalStr, brahmaStr, abhijitStr, coords.city);
      }

      // 2. Update Live Sticky Panchang Notification (Color-coded live status + remaining minutes + action buttons)
      if (window.AndroidAlarm && typeof window.AndroidAlarm.updatePermanentNotification === 'function') {
        let choghadiyaType = 'madhyam';
        let remainingMin = 0;
        if (activeChog) {
          const q = (activeChog.quality || '').toLowerCase();
          const t = (activeChog.type || '').toLowerCase();
          if (q === 'excellent' || q === 'good' || t === 'shubh' || t === 'amrit' || t === 'labh') {
            choghadiyaType = 'shubh';
          } else if (q === 'inauspicious' || q === 'bad' || t === 'kaal' || t === 'rog' || t === 'udveg') {
            choghadiyaType = 'ashubh';
          } else {
            choghadiyaType = 'madhyam';
          }

          const endMin = parseTimeToMinutes(activeChog.endTime);
          remainingMin = endMin >= currentMin ? (endMin - currentMin) : (endMin + 1440 - currentMin);
        }

        const dishaStr = getDishaShoolForDay(now.getDay());

        window.AndroidAlarm.updatePermanentNotification(
          coords.city || 'नई दिल्ली',
          tithi,
          nakshatra,
          activeChog ? (activeChog.hindiName || activeChog.name) : '—',
          choghadiyaType,
          remainingMin,
          abhijitStr,
          rahuKaalStr,
          dishaStr
        );
      }
    } catch (e) {
      console.error("Failed to sync widget/notification data", e);
    }
  }, [panchangInfo, activeMuhurats, coords.city, notificationEnabled, currentMinuteTime]);

  // Find rolling chronological Hora list and current active Hora
  const { rollingHoraList, rollingActiveHora } = useMemo(() => {
    try {
      const curDateObj = new Date(currentMinuteTime);
      const selDateObj = new Date(selectedDate);
      const currentMin = curDateObj.getHours() * 60 + curDateObj.getMinutes();

      const parseTimeToMinutes = (timeStr: string): number => {
        const [time, ampm] = timeStr.split(' ');
        if (!time || !ampm) return 0;
        let [hrs, mins] = time.split(':').map(Number);
        if (ampm === 'PM' && hrs !== 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + mins;
      };

      // Get sunrise for selectedDate
      const pRef = panchangInfo;
      const sunriseMin = parseTimeToMinutes(pRef.sunrise);

      // Determine active and next Vedic days
      let dateActive: Date;
      let dateNext: Date;
      const refTime = selDateObj.getTime();

      if (currentMin < sunriseMin) {
        dateActive = new Date(refTime - 24 * 60 * 60 * 1000);
        dateNext = new Date(refTime);
      } else {
        dateActive = new Date(refTime);
        dateNext = new Date(refTime + 24 * 60 * 60 * 1000);
      }

      const pActive = getPanchangForDate(coords.latitude, coords.longitude, dateActive);
      const pNext = getPanchangForDate(coords.latitude, coords.longitude, dateNext);

      const combinedHoras: { hora: HoraInterval; startAbs: number; endAbs: number }[] = [];
      const midnightActive = new Date(dateActive);
      midnightActive.setHours(0, 0, 0, 0);
      const midnightNext = new Date(dateNext);
      midnightNext.setHours(0, 0, 0, 0);

      const pActiveSunsetMin = parseTimeToMinutes(pActive.sunset);
      pActive.hora?.forEach((h, idx) => {
        let startM = parseTimeToMinutes(h.startTime);
        let endM = parseTimeToMinutes(h.endTime);
        if (!h.isDay) {
          if (startM < pActiveSunsetMin) startM += 1440;
          if (endM < pActiveSunsetMin) endM += 1440;
        }
        const startAbs = midnightActive.getTime() + startM * 60000;
        const endAbs = midnightActive.getTime() + endM * 60000;
        combinedHoras.push({
          hora: { ...h, number: idx + 1 },
          startAbs,
          endAbs
        });
      });

      const pNextSunsetMin = parseTimeToMinutes(pNext.sunset);
      pNext.hora?.forEach((h, idx) => {
        let startM = parseTimeToMinutes(h.startTime);
        let endM = parseTimeToMinutes(h.endTime);
        if (!h.isDay) {
          if (startM < pNextSunsetMin) startM += 1440;
          if (endM < pNextSunsetMin) endM += 1440;
        }
        const startAbs = midnightNext.getTime() + startM * 60000;
        const endAbs = midnightNext.getTime() + endM * 60000;
        combinedHoras.push({
          hora: { ...h, number: idx + 25 },
          startAbs,
          endAbs
        });
      });

      const virtualCurrentTime = new Date(selDateObj);
      virtualCurrentTime.setHours(curDateObj.getHours());
      virtualCurrentTime.setMinutes(curDateObj.getMinutes());
      virtualCurrentTime.setSeconds(curDateObj.getSeconds());
      virtualCurrentTime.setMilliseconds(curDateObj.getMilliseconds());
      const currentTimeAbs = virtualCurrentTime.getTime();

      const activeItem = combinedHoras.find(item => 
        currentTimeAbs >= item.startAbs && currentTimeAbs < item.endAbs
      ) || combinedHoras[0];

      const windowStart = currentTimeAbs;
      const windowEnd = currentTimeAbs + 720 * 60000;

      const upcomingHoraItems = combinedHoras.filter(item => 
        item.startAbs < windowEnd && item.endAbs > windowStart
      );

      const rollingList = upcomingHoraItems.map(item => item.hora);
      
      return {
        rollingHoraList: rollingList,
        rollingActiveHora: activeItem ? activeItem.hora : (panchangInfo.hora?.[0] || null)
      };
    } catch (e) {
      console.error("Error in getHoraPresentationData:", e);
      return {
        rollingHoraList: panchangInfo.hora || [],
        rollingActiveHora: panchangInfo.hora?.[0] || null
      };
    }
  }, [currentMinuteTime, selectedDate, coords.latitude, coords.longitude, panchangInfo]);
  const activeHora = rollingActiveHora;

  // Choghadiya Ring presentation data consumed directly from the Sanatan Engine
  const {
    choghadiyaList,
    activeIndex,
    displayStartTime,
    displayEndTime
  } = useMemo(() => {
    return getChoghadiyaPresentationData(panchangInfo, currentMinuteTime);
  }, [panchangInfo, currentMinuteTime]);

  // Triggering the visual toast slide-in
  const handlePushNotificationToast = (title: string, body: string) => {
    setToastMessage({ title, body });
    setShowToast(true);
    // Auto-wipe after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  const handleQuickAlarmToggle = (params: QuickAlarmParams) => {
    const result = toggleQuickAlarm(notificationsList, params);
    setNotificationsList(result.updatedList);
    handlePushNotificationToast(result.toastTitle, result.toastBody);
  };

  // Switch Subscriptions in monetization
  const handleToggleSubscription = (premiumActive: boolean) => {
    setSettings(prev => ({
      ...prev,
      monetizationUnlock: premiumActive
    }));
  };

  const translateLord = (lord: string): string => {
    const map: Record<string, string> = {
      'Ketu': 'केतु',
      'Venus': 'शुक्र',
      'Sun': 'सूर्य',
      'Moon': 'चन्द्र',
      'Mars': 'मंगल',
      'Rahu': 'राहु',
      'Jupiter': 'गुरु',
      'Saturn': 'शनि',
      'Mercury': 'बुध',
      'Agni': 'अग्नि',
      'Brahma': 'ब्रह्मा',
      'Gauri': 'गौरी',
      'Ganesha': 'गणेश',
      'Lalita/Naga': 'ललिता/नाग',
      'Kartikeya': 'कार्तिकेय',
      'Surya': 'सूर्य',
      'Shiva': 'शिव',
      'Durga': 'दुर्गा',
      'Yama': 'यम',
      'Vishnu': 'विष्णु',
      'Kama': 'कामदेव'
    };
    return map[lord] || lord;
  };

  const translateKarana = (karana: string): string => {
    const cleanKarana = karana.split(' (')[0].trim();
    const map: Record<string, string> = {
      'Bava': 'बव',
      'Bav': 'बव',
      'Balava': 'बालव',
      'Balav': 'बालव',
      'Kaulava': 'कौलव',
      'Kaulav': 'कौलव',
      'Taitila': 'तैतिल',
      'Taitil': 'तैतिल',
      'Garija': 'गरिज',
      'Garij': 'गरिज',
      'Vanija': 'वणिज',
      'Vanij': 'वणिज',
      'Vishti': 'विष्टि (भद्रा)',
      'Vishti (Bhadra)': 'विष्टि (भद्रा)',
      'Shakuni': 'शकुनि',
      'Chatuspada': 'चतुष्पाद',
      'Chatushpada': 'चतुष्पाद',
      'Naga': 'नाग',
      'Nag': 'नाग',
      'Kimstughna': 'किंस्तुघ्न',
      'Kinstughna': 'किंस्तुघ्न'
    };
    return map[cleanKarana] || map[karana] || karana;
  };

  const translateYoga = (yoga: string): string => {
    const cleanYoga = yoga.split(' (')[0].trim();
    const map: Record<string, string> = {
      'Vishkumbha': 'विष्कुम्भ',
      'Preeti': 'प्रीति',
      'Ayushman': 'आयुष्मान',
      'Saubhagya': 'सौभाग्य',
      'Shobhana': 'शोभन',
      'Atiganda': 'अतिगण्ड',
      'Sukarma': 'सुकर्मा',
      'Dhriti': 'धृति',
      'Shoola': 'शूल',
      'Ganda': 'गण्ड',
      'Vriddhi': 'वृद्धि',
      'Dhruva': 'ध्रुव',
      'Vyaghata': 'व्याघात',
      'Harshana': 'हर्षण',
      'Vajra': 'वज्र',
      'Siddhi': 'सिद्धि',
      'Vyatipata': 'व्यतिपात',
      'Variyan': 'वरीयान',
      'Parigha': 'परिघ',
      'Shiva': 'शिव',
      'Siddha': 'सिद्ध',
      'Sadhya': 'साध्य',
      'Shubha': 'शुभ',
      'Shukla': 'शुक्ल',
      'Brahma': 'ब्रह्म',
      'Indra': 'इन्द्र',
      'Vaidhriti': 'वैधृति'
    };
    return map[cleanYoga] || yoga;
  };

  const getPlanetRemainingTime = (planet: any) => {
    if (!planet || !planet.speed) return '';
    const degInSign = planet.longitude % 30;
    const remDeg = 30 - degInSign;
    const speedPerHour = Math.abs(planet.speed) / 24;
    if (speedPerHour === 0) return '';
    const remHours = remDeg / speedPerHour;
    const hours = Math.floor(remHours);
    const minutes = Math.floor((remHours - hours) * 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const leftHours = hours % 24;
      return `${days} दिन, ${leftHours} घंटे तक`;
    }
    return `${hours} घंटे, ${minutes} मिनट तक`;
  };

  const getDishaShoolInfo = (day: number) => {
    switch (day) {
      case 0:
        return {
          direction: 'West',
          directionHindi: 'पश्चिम',
          remedy: 'Eat betel leaf, cardamom, or ghee',
          remedyHindi: 'दलिया, घी या इलायची खाकर प्रस्थान करें'
        };
      case 1:
        return {
          direction: 'East',
          directionHindi: 'पूर्व',
          remedy: 'Look in a mirror or drink milk',
          remedyHindi: 'दर्पण देखकर या दूध पीकर प्रस्थान करें'
        };
      case 2:
        return {
          direction: 'North',
          directionHindi: 'उत्तर',
          remedy: 'Eat jaggery',
          remedyHindi: 'गुड़ खाकर प्रस्थान करें'
        };
      case 3:
        return {
          direction: 'North',
          directionHindi: 'उत्तर',
          remedy: 'Eat coriander or sesame',
          remedyHindi: 'धनिया या तिल खाकर प्रस्थान करें'
        };
      case 4:
        return {
          direction: 'South',
          directionHindi: 'दक्षिण',
          remedy: 'Eat curd or cumin seeds',
          remedyHindi: 'दही या जीरा खाकर प्रस्थान करें'
        };
      case 5:
        return {
          direction: 'West',
          directionHindi: 'पश्चिम',
          remedy: 'Eat barley or curd',
          remedyHindi: 'जौ या राई खाकर प्रस्थान करें'
        };
      case 6:
        return {
          direction: 'East',
          directionHindi: 'पूर्व',
          remedy: 'Eat ginger or urad dal',
          remedyHindi: 'अदरक या उड़द खाकर प्रस्थान करें'
        };
      default:
        return {
          direction: 'None',
          directionHindi: 'कोई नहीं',
          remedy: '',
          remedyHindi: ''
        };
    }
  };

  // Generate a snapshot sharing image using HTML5 Canvas and Web Share API
  const handleShareDailyPanchang = () => {
    const pakshaHindi = panchangInfo.hinduDate.paksha === 'Shukla' || panchangInfo.hinduDate.paksha.toLowerCase().includes('shukla') ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
    const monthHindi = panchangInfo.hinduDate.monthHindi;
    const tithiHindi = panchangInfo.hinduDate.tithi.hindiName;
    const nakshatraHindi = panchangInfo.hinduDate.nakshatra.hindiName;
    const activeDateStr = selectedDate.toLocaleDateString('hi-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const abhijit = activeMuhurats.find(m => m.id === 'abhijit');
    const brahma = activeMuhurats.find(m => m.id === 'brahma');
    const godhuli = activeMuhurats.find(m => m.id === 'godhuli');

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 940;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      handlePushNotificationToast('साझा करना विफल', 'इमेज बनाने में कोई समस्या आई।');
      return;
    }

    const dsh = getDishaShoolInfo(selectedDate.getDay());

    // 1. Saffron Sacred Gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 940);
    bgGradient.addColorStop(0, '#FF8008'); // Vibrant Saffron
    bgGradient.addColorStop(0.5, '#FF5E36');
    bgGradient.addColorStop(1, '#9E1F00'); // Deep Temple Red
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 940);

    // 2. Sacred Gold & White Borders
      ctx.strokeStyle = '#F6C453'; // Gold border
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 560, 900);

      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; // Thin white border inside
      ctx.lineWidth = 1.5;
      ctx.strokeRect(30, 30, 540, 880);

      // 3. Om Logo Header (Centered)
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = 'bold 38px serif';
      ctx.fillText('ॐ', 300, 80);

      ctx.fillStyle = '#FFEBD0';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.fillText('ॐ श्री गणेशाय नमः 🚩', 300, 120);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('दैनिक हिन्दू पंचांग और शुभ मुहूर्त', 300, 155);

      // Thin separator line
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(50, 178);
      ctx.lineTo(550, 178);
      ctx.stroke();

      // 4. Section 1: Basic Info (Date, Location, Samvat, Month) - Left Aligned
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFF3E3';
      ctx.font = 'bold 15.5px "Inter", sans-serif';

      ctx.fillText(`📅 दिनांक: ${activeDateStr}`, 65, 215);
      ctx.fillText(`📍 स्थान: ${coords.city}, ${coords.state}`, 65, 250);
      ctx.fillText(`🕉️ संवत्: विक्रम संवत ${panchangInfo.hinduDate.samvatVikram}, शक संवत ${panchangInfo.hinduDate.samvatShaka}`, 65, 285);
      ctx.fillText(`🌙 मास व पक्ष: ${monthHindi} मास, ${pakshaHindi}`, 65, 320);

      // Separator line
      ctx.beginPath();
      ctx.moveTo(50, 342);
      ctx.lineTo(550, 342);
      ctx.stroke();

      // 5. Section 2: Panchang Elements - Left Aligned
      ctx.fillText(`📅 तिथि: ${tithiHindi} (समाप्ति: ${panchangInfo.hinduDate.tithi.endTime})`, 65, 380);
      ctx.fillText(`⭐ नक्षत्र: ${nakshatraHindi} (स्वामी: ${translateLord(panchangInfo.hinduDate.nakshatra.lord || 'सूर्य')})`, 65, 415);
      ctx.fillText(`⚡ योग: ${translateYoga(panchangInfo.hinduDate.yoga.hindiName)}`, 65, 450);
      ctx.fillText(`💧 करण: ${translateKarana(panchangInfo.hinduDate.karana.hindiName)}`, 65, 485);
      ctx.fillText(`🧭 दिशा शूल: ${dsh.directionHindi}`, 65, 520);
      ctx.fillText(`🛡️ शूल निवारण: ${dsh.remedyHindi}`, 65, 555);

      // Separator line
      ctx.beginPath();
      ctx.moveTo(50, 578);
      ctx.lineTo(550, 578);
      ctx.stroke();

      // 6. Section 3: Solar Times - Left Aligned
      ctx.fillText(`🌅 सूर्योदय: ${panchangInfo.sunrise}  |  🌇 सूर्यास्त: ${panchangInfo.sunset}`, 65, 615);
      ctx.fillText(`🌙 चन्द्रोदय: ${panchangInfo.moonrise}  |  🌃 चन्द्रास्त: ${panchangInfo.moonset}`, 65, 650);

      // Separator line
      ctx.beginPath();
      ctx.moveTo(50, 672);
      ctx.lineTo(550, 672);
      ctx.stroke();

      // 7. Section 4: Auspicious & Adverse Timings - Left Aligned
      ctx.fillStyle = '#F6C453'; // Gold color for Auspicious header
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText('✨ मुख्य शुभ मुहूर्त (Auspicious Timings):', 65, 708);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'normal 15px "Inter", sans-serif';
      let yPos = 740;
      if (brahma) {
        ctx.fillText(`• ${brahma.hindiName}: ${brahma.startTime} - ${brahma.endTime}`, 80, yPos);
        yPos += 26;
      }
      if (abhijit) {
        ctx.fillText(`• ${abhijit.hindiName}: ${abhijit.startTime} - ${abhijit.endTime}`, 80, yPos);
        yPos += 26;
      }
      if (godhuli) {
        ctx.fillText(`• ${godhuli.hindiName}: ${godhuli.startTime} - ${godhuli.endTime}`, 80, yPos);
        yPos += 26;
      }

      ctx.fillStyle = '#FFC9C9'; // Light red for Adverse header
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText('⚠️ अशुभ काल (Adverse Timings):', 65, yPos + 8);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'normal 15px "Inter", sans-serif';
      ctx.fillText(`• राहुकाल: ${panchangInfo.rahuKaal.start} से ${panchangInfo.rahuKaal.end}`, 80, yPos + 36);

      // 8. Footer Brand
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'italic 12px "Inter", sans-serif';
      ctx.fillText('साझाकर्ता: आज का धार्मिक समय ऐप 📿', 300, 885);
      ctx.font = 'bold 12px "Noto Sans Devanagari", sans-serif';
      ctx.fillText('॥ सनातन धर्मिक समय पंचांग ॥', 300, 903);

      // Convert canvas to Blob and share/download
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handlePushNotificationToast('साझा करना विफल', 'इमेज बनाने में कोई समस्या आई।');
          return;
        }
        const file = new File([blob], `Panchang_${selectedDate.toISOString().split('T')[0]}.png`, { type: 'image/png' });
        const shareData = {
          title: `दैनिक वैदिक पंचांग - ${activeDateStr}`,
          files: [file]
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            handlePushNotificationToast('पंचांग इमेज साझा की गई 🚩', 'सफलतापूर्वक साझा की गई!');
          } catch (error) {
            triggerImageDownload(canvas);
          }
        } else {
          triggerImageDownload(canvas);
        }
      }, 'image/png');
  };

  const triggerImageDownload = (canvas: HTMLCanvasElement) => {
    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `Panchang_${selectedDate.toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      handlePushNotificationToast('पंचांग इमेज डाउनलोड हुई 🖼️', 'पंचांग की सुंदर इमेज गैलरी में सेव हो गई है! आप इसे व्हाट्सएप/फेसबुक स्टेटस पर लगा सकते हैं।');
    } catch (e) {
      handlePushNotificationToast('डाउनलोड विफल', 'कृपया पंचांग का स्क्रीनशॉट लें।');
    }
  };

  const formattedClockStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDateStr = selectedDate.toLocaleDateString('hi-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case 'WORKER_CREATED':
        return 'Initializing Astronomical Engine...';
      case 'WASM_COMPILED':
        return 'Loading Swiss Ephemeris...';
      case 'EPHEMERIS_READY':
        return 'Preparing Panchang...';
      case 'PANCHANG_PREFETCH':
        return 'Preparing Watch...';
      case 'ENGINE_READY':
        return 'Launching App...';
      default:
        return 'Initializing Astronomical Engine...';
    }
  };

  if (isSplashActive) {
    const stage = getEngineProgressStage();
    const statusMsg = getStageMessage(stage);
    const showTimeoutModal = isTimeoutTriggered();
    const diagInfo = getLastDiagnosticInfo();

    return (
      <div className="relative w-full h-full min-h-screen">
        <SplashScreen 
          selectedStyle={settings.splashStyle || 'saffron'} 
          onComplete={() => {
            setSplashAnimationCompleted(true);
            setIsSplashActive(false);
          }} 
          customSplash={settings.customSplash}
          statusMessage={statusMsg}
        />

        {showTimeoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shadow-inner">
                ⚠️
              </div>

              {/* Central Diagnostic Metadata Box for Screenshots */}
              <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-400 text-left space-y-0.5 shadow-inner">
                <div className="flex justify-between"><span>Engine Version:</span> <span className="text-amber-300 font-bold">{(diagInfo as any)?.engineVersion || '1.0.0 (WASM)'}</span></div>
                <div className="flex justify-between"><span>Error Code:</span> <span className="text-rose-400 font-bold">{diagInfo.errorCode}</span></div>
                <div className="flex justify-between"><span>Time:</span> <span className="text-slate-300">{diagInfo.timestamp}</span></div>
                <div className="flex justify-between"><span>Initialization Time:</span> <span className="text-slate-300">{diagInfo.elapsedTime}</span></div>
              </div>
              
              {isMaxRetriesReached() ? (
                <>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-amber-100 font-serif leading-snug">
                      Unable to initialize the Astronomical Engine
                    </h3>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      The Astronomical Engine could not be started after multiple attempts. Please restart the application or start with Limited Features.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full mt-1">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      Restart App
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-amber-100 font-serif leading-snug">
                      Astronomical Engine is taking longer than expected.
                    </h3>
                    <p className="text-[11px] text-slate-300 font-sans">
                      Choose an option:
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full mt-1">
                    <button
                      onClick={() => extendInitializationTimeout()}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      Continue Waiting
                    </button>
                    <button
                      onClick={() => retryEngineInitialization()}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      Retry Initialization ({getRetryCount()}/3)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // If calculations are pending after splash screen or Swiss data is not ready, show spiritual loading state with live diagnostics
  if (!isSplashActive && (!isReady() || !isPanchangDataReady)) {
    const logs = EngineLogger.getLiveLogs().slice(-6);
    const pending = Array.from((astronomicalEngine as any).pendingQueries || []);
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-4 select-none animate-fade-in overflow-y-auto">
        <div className="text-4xl text-amber-500 font-serif animate-pulse mb-3">🕉️</div>
        <h2 className="text-lg font-serif font-black text-amber-500 tracking-wide text-center mb-1">
          सटीक पंचांग तैयार किया जा रहा है...
        </h2>
        <p className="text-xs text-slate-400 font-medium tracking-tight text-center mb-4">
          कृपया कुछ क्षण प्रतीक्षा करें...
        </p>

        {/* ON-SCREEN DIAGNOSTIC LOG BOX */}
        <div className="w-full max-w-md bg-black/90 border border-amber-500/50 rounded-lg p-3 text-left font-mono text-[11px] text-amber-200 shadow-2xl space-y-1.5 mt-2">
          <div className="font-bold text-amber-400 border-b border-amber-500/40 pb-1 flex justify-between items-center">
            <span>🔍 DIAGNOSTIC LOGS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans font-bold animate-pulse">LIVE</span>
          </div>
          <div><strong className="text-slate-400">isSplashActive:</strong> <span className={isSplashActive ? 'text-red-400' : 'text-green-400'}>{String(isSplashActive)}</span></div>
          <div><strong className="text-slate-400">isReady():</strong> <span className={isReady() ? 'text-green-400' : 'text-red-400'}>{String(isReady())}</span></div>
          <div><strong className="text-slate-400">isPanchangDataReady:</strong> <span className={isPanchangDataReady ? 'text-green-400' : 'text-red-400'}>{String(isPanchangDataReady)}</span></div>
          <div><strong className="text-slate-400">panchangInfo:</strong> {panchangInfo ? 'Object Loaded' : 'NULL'}</div>
          <div><strong className="text-slate-400">planetsCount:</strong> {panchangInfo?.planets?.length ?? 0}</div>
          <div><strong className="text-slate-400">firstPlanetSign:</strong> {panchangInfo?.planets?.[0]?.sign ?? 'NONE'}</div>
          <div><strong className="text-slate-400">pendingQueries ({pending.length}):</strong> {pending.length > 0 ? (pending as string[]).join(', ') : 'None'}</div>
          
          <div className="pt-2 border-t border-amber-500/30 text-[10px] text-slate-300 space-y-1">
            <div className="font-semibold text-amber-300">Latest Engine Log Traces:</div>
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">No logs recorded yet</div>
            ) : (
              logs.map((l: any, i: number) => (
                <div key={i} className="truncate text-slate-300">
                  <span className="text-amber-400 font-semibold">[{l.level}]</span> <span className="text-slate-400">{l.timestamp}</span> {l.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (previewSplashStyle !== null) {
    return (
      <SplashScreen 
        selectedStyle={previewSplashStyle} 
        onComplete={() => setPreviewSplashStyle(null)} 
        customSplash={settings.customSplash}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all font-sans antialiased ${
      settings.theme === 'light' 
        ? 'bg-[var(--bg-app-light)] text-slate-850' 
        : 'bg-gradient-to-b from-[var(--bg-app-dark-start)] via-[var(--bg-app-dark-mid)] to-[var(--bg-app-dark-end)] text-slate-200'
    }`}>
      
      {/* NATIVE DEVICE TOAST SIMULATOR */}
      {showToast && toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-sm w-11/12 bg-zinc-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-orange-500/30 backdrop-blur-md z-50 transition-all duration-500 animate-bounce flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0 animate-pulse">
            ॐ
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="text-2xs font-extrabold text-amber-400 tracking-tight leading-3 font-serif truncate">{toastMessage.title}</h4>
            <p className="text-[10px] text-slate-100 font-sans mt-0.5 leading-normal">{toastMessage.body}</p>
          </div>
          <button 
            className="text-xs text-slate-400 hover:text-white font-black cursor-pointer font-sans px-1"
            onClick={() => setShowToast(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* FULL SCREEN WEBVIEW & MOBILE/TABLET COMPATIBLE CONTAINER */}
      <div className="w-full min-h-screen flex flex-col">
        
        {/* Main interactive application container */}
        <div className={`overflow-x-hidden relative flex flex-col min-h-screen w-full flex-grow ${
          settings.theme === 'light'
            ? 'bg-[var(--bg-envelope-light)]'
            : 'bg-[var(--bg-envelope-dark)]'
        }`}>
          
          {/* Subtle Sacred Motif Background Overlay for Spiritual Branding */}
          <div className="absolute inset-0 sacred-motif-overlay pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]"></div>
          
          {/* MAIN BRAND HEADER BANNER */}
          <div className="px-4 pt-[max(env(safe-area-inset-top),16px)] pb-1 select-none relative z-10">
            <header className={`px-3 pt-2.5 pb-0 sm:px-4 sm:pt-3 sm:pb-0 rounded-[26px] border border-orange-100/50 dark:border-orange-950/20 flex flex-col gap-1.5 shadow-sm ${
              settings.theme === 'light' ? 'bg-orange-50/15' : 'bg-orange-950/5'
            }`}>
              {/* ROW 1: Equal-Wing 3-Column Layout (Logo Left, Centered Title/Tagline Middle, Location/Help Right) */}
              <div className="flex items-center justify-between w-full gap-1 min-w-0">
                {/* Left Wing: App Icon (w-[47px] h-[47px]) */}
                <div className="w-[84px] sm:w-[94px] flex items-center justify-start shrink-0">
                  <div className="relative w-[47px] h-[47px] sm:w-[53px] sm:h-[53px] shrink-0 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-300 via-orange-500 to-yellow-200 shadow-[0_0_8px_rgba(245,158,11,0.55)]">
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-zinc-950">
                      <img 
                        src="/App1.png" 
                        alt="सनातन घड़ी लोगो" 
                        className="w-full h-full object-cover object-[50%_67%] scale-[1.08]"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle: Title & Tagline PROPERLY DEAD-CENTERED between Left Wing and Right Wing */}
                <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center min-w-0">
                  <h1 className="text-[20px] sm:text-[23px] font-serif font-black text-orange-950 dark:text-amber-100 tracking-wider leading-none whitespace-nowrap">
                    {getTranslation(settings.language, 'home')}
                  </h1>
                  <span className="text-[11px] sm:text-[13px] font-serif font-extrabold text-orange-850 dark:text-amber-400 tracking-wide leading-none whitespace-nowrap">
                    {getTranslation(settings.language, 'tagline')}
                  </span>
                </div>

                {/* Right Wing: Location Pill & Help Button with exact matching width for perfect optical symmetry */}
                <div className="w-[84px] sm:w-[94px] flex flex-col items-end justify-center gap-1 shrink-0">
                  <div 
                    onClick={() => setIsCityModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-orange-100/50 dark:bg-zinc-900/40 border border-orange-200/40 dark:border-zinc-800/40 hover:bg-orange-200/50 cursor-pointer transition-all duration-300 shrink-0"
                    title={settings.language === 'Hindi' ? "स्थान बदलें" : "Change Location"}
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-600 animate-pulse shrink-0" />
                    <span className="text-[12px] font-extrabold text-orange-950 dark:text-amber-100 font-serif leading-normal whitespace-nowrap">
                      {settings.language === 'Hindi' ? translateCityNameToHindi(coords.city) : coords.city}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="px-2 py-0.5 rounded-full flex items-center justify-center gap-1 bg-orange-100/50 dark:bg-zinc-900/40 border border-orange-200/30 dark:border-zinc-800/30 text-orange-600 dark:text-amber-400 hover:bg-orange-200/50 hover:text-orange-700 dark:hover:text-amber-300 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                    title={settings.language === 'Hindi' ? "पंचांग मार्गदर्शिका व सहायता" : "Help & Guide"}
                    aria-label={settings.language === 'Hindi' ? "पंचांग मार्गदर्शिका व सहायता" : "Help & Guide"}
                  >
                    <HelpCircle className="w-3 h-3 shrink-0" />
                    <span className="text-[10px] font-extrabold text-orange-900 dark:text-amber-100 leading-none whitespace-nowrap">
                      {settings.language === 'Hindi' ? 'सहायता' : 'Help'}
                    </span>
                  </button>
                </div>
              </div>

              {/* ROW 2: Precise clock & Choghadiya Trend Badge */}
              <HeaderClock selectedDate={selectedDate} panchangInfo={panchangInfo} language={settings.language} />
            </header>
          </div>

          {/* MAIN CONTAINER PREVIEW SCREEN */}
          <main className="pt-3 px-4 pb-36 sm:pb-36 md:pb-48 flex-grow flex-1 min-h-[460px]">
            
            {/* 1. HOME SCREEN */}
            {activeTab === 'home' && (
              <motion.div 
                id="home_screen_container" 
                className="space-y-4 sm:space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {/* THE MAJESTIC BENTO GRID */}
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch"
                >
                  
                  {/* Left Column: Live Watch (col-span-12 since Rahu Kaal card is removed) */}
                  <div className="md:col-span-12 flex items-center justify-center">
                    <LiveMuhuratWatch
                      muhurats={activeMuhurats}
                      sunriseTimeStr={panchangInfo.sunrise}
                      sunsetTimeStr={panchangInfo.sunset}
                      tithiHindiName={panchangInfo.hinduDate.tithi.hindiName}
                      nakshatraHindiName={panchangInfo.hinduDate.nakshatra.hindiName}
                      horaList={rollingHoraList}
                      activeHora={activeHora}
                      choghadiyaList={choghadiyaList}
                      activeChoghadiyaIndex={activeIndex}
                      displayStartTime={displayStartTime}
                      displayEndTime={displayEndTime}
                      notificationsList={notificationsList}
                      onToggleAlarm={handleQuickAlarmToggle}
                      language={settings.language}
                    />
                  </div>

                </motion.div>

                {/* =========================================================================
                    FOLD 2: आज की प्लानिंग (DAILY UTILITY: FESTIVALS, TRAVEL & TIMINGS)
                    ========================================================================= */}

                {/* CARD 1: 🎉 आज का पर्व व यात्रा विचार (Festivals, Ekadashi/Vrat, Travel Disha Shool & Alerts) */}
                {(() => {
                  const isHin = settings.language === 'Hindi';
                  const currentYear = selectedDate.getFullYear();
                  const yearFestivals = getFestivalsForYear(currentYear, coords.latitude, coords.longitude);
                  const todayDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                  const todayFests = yearFestivals.filter(f => f.date === todayDateStr);

                  const upcomingFest = yearFestivals
                    .filter(f => f.date > todayDateStr)
                    .sort((a, b) => a.date.localeCompare(b.date))[0];

                  const formatFestivalDate = (dateStr: string) => {
                    const d = new Date(dateStr);
                    return d.toLocaleDateString(isHin ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long' });
                  };

                  const translateFestType = (type?: string) => {
                    if (!type) return isHin ? 'पर्व' : 'Festival';
                    if (!isHin) {
                      switch (type.toLowerCase()) {
                        case 'major': return 'Major Festival';
                        case 'ekadashi': return 'Ekadashi Vrat';
                        case 'jayanti': return 'Jayanti';
                        case 'purnima': return 'Purnima';
                        case 'amavasya': return 'Amavasya';
                        case 'vrat': return 'Sacred Vrat';
                        case 'festival': return 'Festival';
                        case 'shubh': return 'Auspicious Day';
                        case 'movable': return 'Special Event';
                        default: return 'Festival';
                      }
                    }
                    switch (type.toLowerCase()) {
                      case 'major': return 'प्रमुख पर्व';
                      case 'ekadashi': return 'एकादशी व्रत';
                      case 'jayanti': return 'जयंती';
                      case 'purnima': return 'पूर्णिमा';
                      case 'amavasya': return 'अमावस्या';
                      case 'vrat': return 'व्रत';
                      case 'festival': return 'त्योहार';
                      case 'shubh': return 'शुभ दिन';
                      case 'movable': return 'विशेष पर्व';
                      default: return 'पर्व';
                    }
                  };

                  const getFestivalHindiDescription = (fest: any, lang: string = 'Hindi') => {
                    const idLower = (fest.id || '').toLowerCase();
                    const nameLower = (fest.name || '').toLowerCase();
                    const hindiName = fest.hindiName || '';
                    const descLower = (fest.description || '').toLowerCase();

                    if (lang !== 'Hindi') {
                      if (fest.descriptionEnglish) return fest.descriptionEnglish;
                      if (idLower.includes('pradosh') || nameLower.includes('pradosh')) {
                        return 'Sacred twilight fast dedicated to Lord Shiva for good health, relief from ailments, and spiritual well-being.';
                      }
                      if (idLower.includes('ekadashi') || nameLower.includes('ekadashi')) {
                        return 'Sacred fast dedicated to Lord Vishnu for spiritual peace, virtue, and liberation.';
                      }
                      if (idLower.includes('durgashtami') || nameLower.includes('durgashtami')) {
                        return 'Sacred worship of Goddess Durga for protection, courage, and vitality.';
                      }
                      if (idLower.includes('kalashtami') || nameLower.includes('kalashtami')) {
                        return 'Sacred fast dedicated to Lord Kaal Bhairav for inner strength and freedom from fear.';
                      }
                      if (idLower.includes('shivaratri') || nameLower.includes('shivaratri')) {
                        return 'Sacred monthly fast and night vigil dedicated to Lord Shiva for spiritual awakening.';
                      }
                      if (idLower.includes('sankashti') || nameLower.includes('sankashti')) {
                        return 'Sacred fast dedicated to Lord Ganesha for removal of troubles and impediments.';
                      }
                      if (idLower.includes('vinayaka') || nameLower.includes('vinayaka')) {
                        return 'Sacred Chaturthi worship of Lord Ganesha for wisdom and auspicious beginnings.';
                      }
                      if (idLower.includes('purnima') || nameLower.includes('purnima')) {
                        return 'Sacred day for Satyanarayan Katha, holy dip, charity, and honoring the Full Moon.';
                      }
                      if (idLower.includes('amavasya') || nameLower.includes('amavasya')) {
                        return 'Auspicious New Moon day for ancestral prayers, charity, and spiritual reflection.';
                      }
                      if (idLower.includes('karwa_chauth') || nameLower.includes('karwa chauth')) {
                        return 'Sacred fast observed by married women for longevity and prosperity of their spouses.';
                      }
                      if (fest.description && !(/[\u0900-\u097F]/.test(fest.description))) {
                        return fest.description;
                      }
                      return `${fest.name || 'Festival'} is an auspicious Vedic observance for prayers and charity.`;
                    }

                    // Devutthana / Prabodhini Ekadashi
                    if (
                      idLower.includes('devutthana') ||
                      nameLower.includes('devutthana') ||
                      hindiName.includes('देवउठनी') ||
                      hindiName.includes('प्रबोधिनी')
                    ) {
                      return 'भगवान श्रीहरि विष्णु का चातुर्मास शयन से जागरण। तुलसी विवाह, समस्त मांगलिक कार्यों का शुभारंभ एवं व्रत-पूजन हेतु अत्यंत पावन दिन।';
                    }

                    // General Ekadashi
                    if (idLower.includes('ekadashi') || nameLower.includes('ekadashi') || hindiName.includes('एकादशी')) {
                      if (idLower.includes('shukla') || descLower.includes('shukla') || (fest.tithi && fest.tithi.includes('Shukla'))) {
                        return `भगवान श्रीहरि विष्णु की विशेष आराधना, सुख-समृद्धि एवं आध्यात्मिक शांति के लिए ${hindiName || 'एकादशी'} का पावन व्रत।`;
                      }
                      return `भगवान श्रीहरि विष्णु की कृपा, पाप-निवारण एवं संकट मुक्ति के लिए ${hindiName || 'एकादशी'} का पावन व्रत।`;
                    }

                    // Pradosh Vrat
                    if (idLower.includes('pradosh') || nameLower.includes('pradosh') || hindiName.includes('प्रदोष')) {
                      return 'भगवान शिव की आराधना, आरोग्य लाभ और दोष शांति के लिए सायंकाल प्रदोष वेला में किया जाने वाला पावन व्रत।';
                    }

                    // Durgashtami / Ashtami
                    if (idLower.includes('durgashtami') || nameLower.includes('durgashtami') || hindiName.includes('अष्टमी') || hindiName.includes('दुर्गाष्टमी')) {
                      return 'भगवती आद्याशक्ति माँ दुर्गा की विशेष कृपा, आरोग्य और संकट नाश हेतु पावन व्रत व पूजन।';
                    }

                    // Kalashtami
                    if (idLower.includes('kalashtami') || nameLower.includes('kalashtami') || hindiName.includes('कालाष्टमी')) {
                      return 'भगवान कालभैरव की विशेष पूजा-अर्चना, भय मुक्ति एवं आत्मबल की प्राप्ति के लिए पावन कालाष्टमी व्रत।';
                    }

                    // Shivaratri
                    if (idLower.includes('shivaratri') || nameLower.includes('shivaratri') || hindiName.includes('शिवरात्रि')) {
                      return 'भगवान भोलेनाथ की विशेष आराधना, रात्रि जागरण और रुद्राभिषेक हेतु पावन मासिक शिवरात्रि व्रत।';
                    }

                    // Sankashti Chaturthi
                    if (idLower.includes('sankashti') || nameLower.includes('sankashti') || hindiName.includes('संकष्टी')) {
                      return 'विघ्नहर्ता श्री गणेश की कृपा से समस्त संकटों व बाधाओं के निवारण हेतु पावन संकष्टी चतुर्थी व्रत।';
                    }

                    // Vinayaka Chaturthi
                    if (idLower.includes('vinayaka') || nameLower.includes('vinayaka') || hindiName.includes('विनायक')) {
                      return 'श्री गणेश जी के पूजन से ज्ञान, बुद्धि, रिद्धि-सिद्धि और सफलता प्राप्ति हेतु पावन विनायक चतुर्थी व्रत।';
                    }

                    // Purnima
                    if (idLower.includes('purnima') || nameLower.includes('purnima') || hindiName.includes('पूर्णिमा')) {
                      return 'श्री सत्यनारायण कथा, तीर्थ स्नान, दान-पुण्य और चंद्र देव की उपासना के लिए पावन पूर्णिमा तिथि।';
                    }

                    // Amavasya
                    if (idLower.includes('amavasya') || nameLower.includes('amavasya') || hindiName.includes('अमावस्या')) {
                      return 'पितृ तर्पण, श्राद्ध कर्म, दीपदान एवं आत्मशांति हेतु विशेष पुण्य फलदायी अमावस्या तिथि।';
                    }

                    // Karwa Chauth
                    if (idLower.includes('karwa_chauth') || nameLower.includes('karwa chauth') || hindiName.includes('करवा चौथ')) {
                      return 'पति की दीर्घायु, उत्तम स्वास्थ्य और अखंड सौभाग्य की प्राप्ति के लिए सुहागिनों का पावन निर्जला व्रत।';
                    }

                    // Rama Navami
                    if (idLower.includes('rama_navami') || nameLower.includes('rama navami') || hindiName.includes('राम नवमी')) {
                      return 'मर्यादा पुरुषोत्तम भगवान श्री राम का पावन जन्मोत्सव, विशेष व्रत एवं भव्य पूजन।';
                    }

                    // Janmashtami
                    if (idLower.includes('janmashtami') || nameLower.includes('janmashtami') || hindiName.includes('जन्माष्टमी')) {
                      return 'भगवान श्री कृष्ण का पावन प्राकट्योत्सव, रात्रि 12 बजे जन्मोत्सव पूजन, व्रत एवं भजन कीर्तन।';
                    }

                    // Diwali
                    if (idLower.includes('diwali') || nameLower.includes('diwali') || hindiName.includes('दीपावली') || hindiName.includes('दिवाली')) {
                      return 'महालक्ष्मी, भगवान गणेश एवं कुबेर पूजन का महापर्व। सुख, समृद्धि व प्रकाश का पावन उत्सव।';
                    }

                    // Dhanteras
                    if (idLower.includes('dhanteras') || nameLower.includes('dhanteras') || hindiName.includes('धनतेरस')) {
                      return 'भगवान धन्वंतरि जयंती एवं यम दीपदान। नवीन बर्तन, आभूषण व समृद्धिदायक वस्तुओं की खरीदारी श्रेष्ठ।';
                    }

                    // Goverdhan Puja
                    if (idLower.includes('govardhan') || nameLower.includes('govardhan') || hindiName.includes('गोवर्धन')) {
                      return 'भगवान श्री कृष्ण द्वारा गोवर्धन पर्वत धारण की स्मृति में गोवर्धन पूजा, अन्नकूट एवं गौ सेवा।';
                    }

                    // Bhai Dooj
                    if (idLower.includes('bhai_dooj') || nameLower.includes('bhai dooj') || hindiName.includes('भाई दूज')) {
                      return 'भाई-बहन के पवित्र प्रेम और स्नेह का प्रतीक यम द्वितीया पर्व। तिलक व दीर्घायु की मंगलकामना।';
                    }

                    // If description is already in Hindi (contains Devanagari characters)
                    if (fest.description && /[\u0900-\u097F]/.test(fest.description)) {
                      return fest.description;
                    }

                    // Fallback for general festivals if description is in English
                    return `${hindiName || fest.name} का पावन पर्व। विधि-विधान से पूजन, दान एवं सत्कर्म फलदायी हैं।`;
                  };

                  const tithiName = panchangInfo.hinduDate.tithi.hindiName;
                  const isEkadashi = tithiName.includes('एकादशी') || panchangInfo.hinduDate.tithi.index === 11 || panchangInfo.hinduDate.tithi.index === 26;
                  const isPurnima = tithiName.includes('पूर्णिमा') || panchangInfo.hinduDate.tithi.index === 15;
                  const isAmavasya = tithiName.includes('अमावस्या') || panchangInfo.hinduDate.tithi.index === 30;
                  const isPradosh = tithiName.includes('त्रयोदशी');

                  const dsh = getDishaShoolInfo(selectedDate.getDay());
                  const hasPanchak = panchangInfo.panchak?.active;
                  const hasBhadra = panchangInfo.bhadra?.active;

                  return (
                    <motion.div
                      variants={itemVariants}
                      id="home_card_festival_travel"
                      className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left border border-orange-200/60 dark:border-orange-950/30 rounded-3xl space-y-3 shadow-sm relative overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-orange-100/30 dark:border-orange-950/20 pb-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl">🎉</span>
                          <h3 className="text-[17.5px] sm:text-[19px] font-black text-[#9A3412] dark:text-amber-400 leading-tight font-serif">
                            {isHin ? "आज का पर्व व यात्रा विचार" : "Today's Festivals & Travel Guidelines"}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          {selectedDate.toLocaleDateString(isHin ? 'hi-IN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      {/* 1. Today's Festival / Vrat Status */}
                      <div className="space-y-2">
                        <span className="text-[12.5px] font-black text-amber-900 dark:text-amber-300 font-serif flex items-center gap-1.5">
                          🪔 {isHin ? "आज का व्रत एवं त्योहार (उदया तिथि आधारित)" : "Today's Fast & Festivals (Udaya Tithi Based)"}
                        </span>

                        {todayFests.length > 0 ? (
                          <div className="space-y-2">
                            {todayFests.map(fest => (
                              <div key={fest.id} className="flex flex-col p-3 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 rounded-2xl gap-1">
                                <div className="flex justify-between items-center flex-wrap gap-1">
                                  <h4 className="text-[14.5px] sm:text-[15.5px] font-black font-serif text-orange-900 dark:text-amber-300 leading-normal">
                                    {isHin ? (fest.hindiName || fest.name) : (fest.name || fest.hindiName)}
                                  </h4>
                                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-900 text-orange-900 dark:text-orange-200 rounded-md">
                                    {translateFestType(fest.type)}
                                  </span>
                                </div>
                                <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 font-sans mt-0.5">
                                  {getFestivalHindiDescription(fest, settings.language)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : isEkadashi ? (
                          <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/25 rounded-2xl">
                            <span className="text-lg shrink-0 mt-0.5">🌿</span>
                            <div className="flex flex-col gap-1 leading-normal">
                              <span className="text-[14px] sm:text-[15px] font-serif font-black text-amber-950 dark:text-amber-200">
                                {isHin ? `आज ${tithiName} व्याप्त है (${formatHindiTime(panchangInfo.hinduDate.tithi.endTime)} तक)` : `Today is Ekadashi Tithi (until ${panchangInfo.hinduDate.tithi.endTime})`}
                              </span>
                              <span className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                                {isHin ? "श्रीहरि विष्णु पूजन, एकादशी व्रत, सात्विक आहार एवं हरिवासर चिंतन हेतु परम फलदायी दिन।" : "Sacred day for Lord Vishnu worship, fasting, and spiritual reflection."}
                              </span>
                            </div>
                          </div>
                        ) : isPurnima ? (
                          <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/25 rounded-2xl">
                            <span className="text-lg shrink-0 mt-0.5">🌕</span>
                            <div className="flex flex-col gap-1 leading-normal">
                              <span className="text-[14px] sm:text-[15px] font-serif font-black text-amber-900 dark:text-amber-200">
                                {isHin ? `आज पूर्णिमा तिथि है (${formatHindiTime(panchangInfo.hinduDate.tithi.endTime)} तक)` : `Today is Purnima Tithi (until ${panchangInfo.hinduDate.tithi.endTime})`}
                              </span>
                              <span className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                {isHin ? "श्री सत्यनारायण कथा, तीर्थ स्नान, दान व महालक्ष्मी पूजन हेतु अत्यंत पावन दिन।" : "Sacred day for Satyanarayan Katha, holy dip, charity and divine worship."}
                              </span>
                            </div>
                          </div>
                        ) : isAmavasya ? (
                          <div className="flex items-start gap-2.5 p-3 bg-slate-500/10 dark:bg-zinc-800/40 border border-slate-300 dark:border-zinc-700 rounded-2xl">
                            <span className="text-lg shrink-0 mt-0.5">🌑</span>
                            <div className="flex flex-col gap-1 leading-normal">
                              <span className="text-[14px] sm:text-[15px] font-serif font-black text-slate-800 dark:text-slate-200">
                                {isHin ? `आज अमावस्या तिथि है (${formatHindiTime(panchangInfo.hinduDate.tithi.endTime)} तक)` : `Today is Amavasya Tithi (until ${panchangInfo.hinduDate.tithi.endTime})`}
                              </span>
                              <span className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-slate-400 leading-relaxed">
                                {isHin ? "पितृ तर्पण, श्राद्ध कर्म, दीपदान एवं आत्मशांति हेतु विशेष दिन।" : "Auspicious day for ancestral remembrance, charity, and inner peace."}
                              </span>
                            </div>
                          </div>
                        ) : isPradosh ? (
                          <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/25 rounded-2xl">
                            <span className="text-lg shrink-0 mt-0.5">🔱</span>
                            <div className="flex flex-col gap-1 leading-normal">
                              <span className="text-[14px] sm:text-[15px] font-serif font-black text-amber-900 dark:text-amber-200">
                                {isHin ? `आज प्रदोष (त्रयोदशी) तिथि है (${formatHindiTime(panchangInfo.hinduDate.tithi.endTime)} तक)` : `Today is Pradosh Tithi (until ${panchangInfo.hinduDate.tithi.endTime})`}
                              </span>
                              <span className="text-[12.5px] sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                {isHin ? "सायंकाल प्रदोष वेला में भगवान शिव एवं माता पार्वती का रुद्राभिषेक व पूजन श्रेष्ठ।" : "Auspicious for Lord Shiva & Parvati worship during evening twilight."}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/20 dark:border-zinc-800/20 rounded-2xl">
                            <span className="text-base">🪔</span>
                            <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-normal">
                              {isHin ? "आज कोई विशिष्ट वार्षिक व्रत/पर्व नहीं है। दैनिक नित्य कर्म व साधना सामान्य रूप से करें।" : "No specific major annual festival today. Perform daily spiritual practices and routine tasks normally."}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 2. Disha Shool & Travel Remedy */}
                      {(() => {
                        const dshInfo = translateDishaShool(dsh.directionHindi, settings.language);
                        return (
                          <div className="p-3 bg-rose-500/5 dark:bg-rose-950/15 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl space-y-1.5">
                            <div className="flex items-center justify-between text-[13.5px] sm:text-[14px] leading-normal">
                              <span className="font-serif font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                                <strong className="text-rose-600 dark:text-rose-400">🚫 {isHin ? "आज का दिशा शूल:" : "Today's Disha Shool:"}</strong> {dshInfo.direction}
                              </span>
                              <span className="text-[11px] font-sans font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 rounded-md">
                                {isHin ? "यात्रा सावधानी" : "Travel Caution"}
                              </span>
                            </div>
                            <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300 mt-1">
                              <strong className="text-amber-900 dark:text-amber-300">{isHin ? "निवारण उपाय:" : "Remedy:"}</strong> {dshInfo.remedy}
                            </p>
                          </div>
                        );
                      })()}

                      {/* 3. Astrological Alerts (Bhadra & Panchak Clarity) */}
                      <div className="space-y-2 select-none">
                        {hasBhadra && panchangInfo.bhadra ? (
                          <div className="flex items-start gap-2.5 p-2.5 sm:p-3 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 rounded-2xl text-left">
                            <span className="text-base shrink-0 mt-0.5">⚠️</span>
                            <div className="leading-normal space-y-1">
                              <span className="font-serif font-black text-rose-700 dark:text-rose-300 text-[13.5px] sm:text-[14px] block">
                                {isHin 
                                  ? `भद्रा सक्रिय (विष्टि करण): ${formatHindiTime(panchangInfo.bhadra.startTime)} से ${formatHindiTime(panchangInfo.bhadra.endTime)} तक`
                                  : `Bhadra Active (Vishti Karana): ${panchangInfo.bhadra.startTime} to ${panchangInfo.bhadra.endTime}`}
                              </span>
                              <span className="text-[12px] sm:text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed block">
                                {isHin
                                  ? `भद्रा काल (निवास: ${panchangInfo.bhadra.vasHindi || 'मृत्यु लोक'}) में मुंडन, विवाह, गृहप्रवेश व मांगलिक कार्य वर्जित हैं।`
                                  : "Major auspicious ceremonies like marriage or housewarming are avoided during Bhadra."}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {hasPanchak && panchangInfo.panchak ? (() => {
                          const panchakInfoTranslated = translatePanchak(panchangInfo.panchak.hindiName || '', settings.language);
                          return (
                            <div className="flex items-start gap-2.5 p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 rounded-2xl text-left">
                              <span className="text-base shrink-0 mt-0.5">⚠️</span>
                              <div className="leading-normal space-y-1">
                                <span className="font-serif font-black text-amber-900 dark:text-amber-300 text-[13.5px] sm:text-[14px] block">
                                  {panchakInfoTranslated.title}
                                </span>
                                <span className="text-[12px] sm:text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed block">
                                  {panchakInfoTranslated.advice}
                                </span>
                              </div>
                            </div>
                          );
                        })() : null}

                        {!hasBhadra && !hasPanchak && (
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-500/5 dark:bg-emerald-950/15 border border-emerald-500/15 rounded-2xl">
                            <span className="text-sm">🟢</span>
                            <span className="text-[12px] font-semibold text-emerald-800 dark:text-emerald-300 leading-normal">
                              {isHin ? "आज कोई भद्रा या पंचक दोष नहीं है — दिन सामान्य कार्यों व यात्रा के लिए अनुकूल है।" : "No Bhadra or Panchak dosha today — favorable for routine activities and travel."}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 4. Upcoming Festival Teaser */}
                      {upcomingFest && (
                        <div className="flex items-center justify-between p-2.5 px-3 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/20 dark:border-zinc-800/20 rounded-2xl text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📅</span>
                            <span className="text-[12px] sm:text-[13px] font-serif font-bold text-slate-700 dark:text-slate-200">
                              {isHin ? "अगला पर्व:" : "Next Festival:"} {isHin ? (upcomingFest.hindiName || upcomingFest.name) : (upcomingFest.name || upcomingFest.hindiName)}
                            </span>
                          </div>
                          <span className="text-[11.5px] sm:text-[12px] font-serif font-black text-[#ea580c] dark:text-amber-400">
                            {formatFestivalDate(upcomingFest.date)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })()}

                {/* CARD 2: ⏰ आज का शुभ एवं वर्जित समय (Shubh & Varjit Timings with Clear Meaning) */}
                {(() => {
                  const isHin = settings.language === 'Hindi';
                  const abhijit = activeMuhurats.find(m => m.id === 'abhijit');
                  const brahma = activeMuhurats.find(m => m.id === 'brahma');

                  return (
                    <motion.div
                      variants={itemVariants}
                      id="home_card_muhurat_timings"
                      className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left border border-orange-200/60 dark:border-orange-950/30 rounded-3xl space-y-3 shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-orange-100/30 dark:border-orange-950/20 pb-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl">⏰</span>
                          <h3 className="text-[17.5px] sm:text-[19px] font-black text-[#9A3412] dark:text-amber-400 leading-tight font-serif">
                            {isHin ? "आज का शुभ एवं वर्जित समय" : "Today's Auspicious & Inauspicious Timings"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('alerts')}
                          className="group flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-[11.5px] font-serif font-bold text-orange-700 dark:text-amber-400 hover:text-orange-900 dark:hover:text-amber-200 bg-orange-500/10 hover:bg-orange-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-orange-300/40 dark:border-amber-500/30 transition-all cursor-pointer"
                          title={isHin ? "धार्मिक व साधना अलार्म पेज खोलें" : "Open Alarms Page"}
                        >
                          <Bell className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          <span>{isHin ? "सभी अलार्म ➔" : "All Alarms ➔"}</span>
                        </button>
                      </div>

                      {/* 2 Column Layout: Shubh vs Varjit */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Shubh Muhurats */}
                        <div className="space-y-2 text-left">
                          <span className="text-[12px] sm:text-[12.5px] font-black text-emerald-800 dark:text-emerald-400 font-serif flex items-center gap-1.5 mb-0.5">
                            🟢 {isHin ? "शुभ समय (कार्य प्रारंभ हेतु श्रेष्ठ)" : "Auspicious Periods (Best for New Tasks)"}
                          </span>
                          <div className="space-y-2.5">
                            {abhijit ? (() => {
                                const isAbhijitActive = isAlarmActive(notificationsList, 'alert_abhijit');
                                return (
                                  <div className="flex justify-between items-center bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-2.5 sm:p-3 px-3.5 gap-2">
                                    <div className="flex flex-col gap-1 leading-normal">
                                      <span className="font-serif font-black text-[15px] sm:text-[16px] text-slate-900 dark:text-emerald-200">
                                        {isHin ? "अभिजीत मुहूर्त" : "Abhijit Muhurat"}
                                      </span>
                                      <span className="text-[12.5px] sm:text-[13px] text-emerald-800 dark:text-emerald-300 font-sans font-medium">
                                        {isHin ? "सर्वकार्य सिद्धि हेतु" : "For Success in All Undertakings"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-[14.5px] sm:text-[15.5px] text-right">
                                        {formatLocalizedTime(abhijit.startTime, settings.language)} - {formatLocalizedTime(abhijit.endTime, settings.language)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickAlarmToggle({
                                          id: 'alert_abhijit',
                                          title: isHin ? 'अभिजीत मुहूर्त प्रारंभ' : 'Abhijit Muhurat Started',
                                          body: isHin ? 'सर्वकार्य सिद्धि हेतु अभिजीत मुहूर्त प्रारंभ हो चुका है।' : 'Abhijit Muhurat has started. Highly auspicious for all undertakings.',
                                          time: abhijit.startTime,
                                          endTime: abhijit.endTime,
                                          type: 'muhurat'
                                        })}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                                          isAbhijitActive
                                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-105'
                                            : 'text-slate-400 dark:text-stone-400 hover:text-amber-500 hover:bg-emerald-500/15 border-emerald-500/30'
                                        }`}
                                        title={isAbhijitActive ? (isHin ? "अभिजीत मुहूर्त अलार्म बंद करें" : "Turn off Abhijit alarm") : (isHin ? "अभिजीत मुहूर्त का अलार्म सेट करें" : "Set Abhijit Muhurat alarm")}
                                        aria-label={isAbhijitActive ? (isHin ? "अभिजीत मुहूर्त अलार्म बंद करें" : "Turn off Abhijit alarm") : (isHin ? "अभिजीत मुहूर्त का अलार्म सेट करें" : "Set Abhijit Muhurat alarm")}
                                      >
                                        <Bell className={`w-3.5 h-3.5 ${isAbhijitActive ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })() : (
                                <div className="p-2.5 px-3 bg-slate-100 dark:bg-zinc-800/40 rounded-2xl text-[12px] text-slate-500">
                                  {isHin ? "आज अभिजीत मुहूर्त उपलब्ध नहीं है।" : "Abhijit Muhurat is not available today."}
                                </div>
                              )}

                              {brahma ? (() => {
                                const isBrahmaActive = isAlarmActive(notificationsList, 'alert_brahma');
                                return (
                                  <div className="flex justify-between items-center bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-2.5 sm:p-3 px-3.5 gap-2">
                                    <div className="flex flex-col gap-1 leading-normal">
                                      <span className="font-serif font-black text-[15px] sm:text-[16px] text-slate-900 dark:text-emerald-200">
                                        {isHin ? "ब्रह्म मुहूर्त" : "Brahma Muhurat"}
                                      </span>
                                      <span className="text-[12.5px] sm:text-[13px] text-emerald-800 dark:text-emerald-300 font-sans font-medium">
                                        {isHin ? "पूजा व साधना हेतु" : "For Prayer, Meditation & Study"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-[14.5px] sm:text-[15.5px] text-right">
                                        {formatLocalizedTime(brahma.startTime, settings.language)} - {formatLocalizedTime(brahma.endTime, settings.language)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickAlarmToggle({
                                          id: 'alert_brahma',
                                          title: isHin ? 'ब्रह्म मुहूर्त प्रारंभ' : 'Brahma Muhurat Started',
                                          body: isHin ? 'पूजा व साधना हेतु पावन ब्रह्म मुहूर्त प्रारंभ हो चुका है।' : 'Sacred Brahma Muhurat has started. Ideal for meditation & prayers.',
                                          time: brahma.startTime,
                                          endTime: brahma.endTime,
                                          type: 'muhurat'
                                        })}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                                          isBrahmaActive
                                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-105'
                                            : 'text-slate-400 dark:text-stone-400 hover:text-amber-500 hover:bg-emerald-500/15 border-emerald-500/30'
                                        }`}
                                        title={isBrahmaActive ? (isHin ? "ब्रह्म मुहूर्त अलार्म बंद करें" : "Turn off Brahma alarm") : (isHin ? "ब्रह्म मुहूर्त का अलार्म सेट करें" : "Set Brahma Muhurat alarm")}
                                        aria-label={isBrahmaActive ? (isHin ? "ब्रह्म मुहूर्त अलार्म बंद करें" : "Turn off Brahma alarm") : (isHin ? "ब्रह्म मुहूर्त का अलार्म सेट करें" : "Set Brahma Muhurat alarm")}
                                      >
                                        <Bell className={`w-3.5 h-3.5 ${isBrahmaActive ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })() : null}
                          </div>
                        </div>

                        {/* Inauspicious Periods with friendly explanations */}
                        <div className="space-y-2 text-left">
                          <span className="text-[12px] sm:text-[12.5px] font-black text-rose-800 dark:text-rose-400 font-serif flex items-center gap-1.5 mb-0.5">
                            🔴 {isHin ? "वर्जित समय (नया कार्य टालें)" : "Inauspicious Periods (Avoid New Tasks)"}
                          </span>
                          <div className="space-y-2.5 select-none">
                            {/* Rahu Kaal with 5-minute pre-warning */}
                              {(() => {
                                const isRahuActive = isAlarmActive(notificationsList, 'alert_rahukaal');
                                return (
                                  <div className="flex justify-between items-center bg-rose-500/10 dark:bg-rose-950/20 border border-rose-500/20 rounded-2xl p-2.5 sm:p-3 px-3.5 gap-2">
                                    <div className="flex flex-col gap-1 leading-normal">
                                      <span className="font-serif font-black text-[15px] sm:text-[16px] text-slate-900 dark:text-rose-200">
                                        {isHin ? "राहुकाल" : "Rahukaal"}
                                      </span>
                                      <span className="text-[12.5px] sm:text-[13px] text-rose-800 dark:text-rose-300 font-sans font-medium">
                                        {isHin ? "मुख्य वर्जित समय" : "Major Inauspicious Period"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-black text-rose-800 dark:text-rose-300 text-[14.5px] sm:text-[15.5px] text-right">
                                        {formatLocalizedTime(panchangInfo.rahuKaal.start, settings.language)} - {formatLocalizedTime(panchangInfo.rahuKaal.end, settings.language)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickAlarmToggle({
                                          id: 'alert_rahukaal',
                                          title: isHin ? 'राहुकाल पूर्व चेतावनी' : 'Rahukaal Warning (5 min prior)',
                                          body: isHin ? `राहुकाल ${panchangInfo.rahuKaal.start} से प्रारंभ होने वाला है। शुभ कार्य टालें।` : `Rahukaal starts at ${panchangInfo.rahuKaal.start}. Postpone auspicious tasks.`,
                                          time: panchangInfo.rahuKaal.start,
                                          endTime: panchangInfo.rahuKaal.end,
                                          type: 'muhurat',
                                          offsetMinutes: -5
                                        })}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                                          isRahuActive
                                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs scale-105'
                                            : 'text-slate-400 dark:text-stone-400 hover:text-rose-500 hover:bg-rose-500/15 border-rose-500/30'
                                        }`}
                                        title={isRahuActive ? (isHin ? "राहुकाल अलार्म बंद करें" : "Turn off Rahukaal alarm") : (isHin ? "राहुकाल से 5 मिनट पूर्व चेतावनी अलार्म सेट करें" : "Set Rahukaal 5-min warning alarm")}
                                        aria-label={isRahuActive ? (isHin ? "राहुकाल अलार्म बंद करें" : "Turn off Rahukaal alarm") : (isHin ? "राहुकाल से 5 मिनट पूर्व चेतावनी अलार्म सेट करें" : "Set Rahukaal 5-min warning alarm")}
                                      >
                                        <Bell className={`w-3.5 h-3.5 ${isRahuActive ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Yamagandam */}
                              {(() => {
                                const isYamaActive = isAlarmActive(notificationsList, 'alert_yamagand');
                                return (
                                  <div className="flex justify-between items-center bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl p-2.5 sm:p-3 px-3.5 gap-2">
                                    <div className="flex flex-col gap-1 leading-normal">
                                      <span className="font-serif font-black text-[15px] sm:text-[16px] text-slate-900 dark:text-amber-200">
                                        {isHin ? "यमगण्ड" : "Yamaganda"}
                                      </span>
                                      <span className="text-[12.5px] sm:text-[13px] text-amber-800 dark:text-amber-300 font-sans font-medium">
                                        {isHin ? "नया कार्य टालें" : "Avoid New Tasks"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-black text-amber-800 dark:text-amber-300 text-[14.5px] sm:text-[15.5px] text-right">
                                        {formatLocalizedTime(panchangInfo.yamagandam?.start || '', settings.language)} - {formatLocalizedTime(panchangInfo.yamagandam?.end || '', settings.language)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickAlarmToggle({
                                          id: 'alert_yamagand',
                                          title: isHin ? 'यमगण्ड काल प्रारंभ' : 'Yamaganda Started',
                                          body: isHin ? 'यमगण्ड काल प्रारंभ हो चुका है, नवीन मांगलिक कार्य टालें।' : 'Yamaganda period has started. Avoid commencing new undertakings.',
                                          time: panchangInfo.yamagandam?.start || '',
                                          endTime: panchangInfo.yamagandam?.end || '',
                                          type: 'muhurat'
                                        })}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                                          isYamaActive
                                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs scale-105'
                                            : 'text-slate-400 dark:text-stone-400 hover:text-amber-600 hover:bg-amber-500/15 border-amber-500/30'
                                        }`}
                                        title={isYamaActive ? (isHin ? "यमगण्ड अलार्म बंद करें" : "Turn off Yamaganda alarm") : (isHin ? "यमगण्ड का अलार्म सेट करें" : "Set Yamaganda alarm")}
                                        aria-label={isYamaActive ? (isHin ? "यमगण्ड अलार्म बंद करें" : "Turn off Yamaganda alarm") : (isHin ? "यमगण्ड का अलार्म सेट करें" : "Set Yamaganda alarm")}
                                      >
                                        <Bell className={`w-3.5 h-3.5 ${isYamaActive ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Gulik Kaal */}
                              {(() => {
                                const isGulikActive = isAlarmActive(notificationsList, 'alert_gulik');
                                return (
                                  <div className="flex justify-between items-center bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl p-2.5 sm:p-3 px-3.5 gap-2">
                                    <div className="flex flex-col gap-1 leading-normal">
                                      <span className="font-serif font-black text-[15px] sm:text-[16px] text-slate-900 dark:text-amber-200">
                                        {isHin ? "गुलिक काल" : "Gulika Kaal"}
                                      </span>
                                      <span className="text-[12.5px] sm:text-[13px] text-amber-800 dark:text-amber-300 font-sans font-medium">
                                        {isHin ? "नया कार्य टालें" : "Avoid New Tasks"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-mono font-black text-amber-800 dark:text-amber-300 text-[14.5px] sm:text-[15.5px] text-right">
                                        {formatLocalizedTime(panchangInfo.gulikKaal?.start || '', settings.language)} - {formatLocalizedTime(panchangInfo.gulikKaal?.end || '', settings.language)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickAlarmToggle({
                                          id: 'alert_gulik',
                                          title: isHin ? 'गुलिक काल प्रारंभ' : 'Gulika Kaal Started',
                                          body: isHin ? 'गुलिक काल प्रारंभ हो चुका है, संचय व शुभ कार्य टालें।' : 'Gulika Kaal has started. Postpone auspicious beginnings.',
                                          time: panchangInfo.gulikKaal?.start || '',
                                          endTime: panchangInfo.gulikKaal?.end || '',
                                          type: 'muhurat'
                                        })}
                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                                          isGulikActive
                                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs scale-105'
                                            : 'text-slate-400 dark:text-stone-400 hover:text-amber-600 hover:bg-amber-500/15 border-amber-500/30'
                                        }`}
                                        title={isGulikActive ? (isHin ? "गुलिक काल अलार्म बंद करें" : "Turn off Gulika alarm") : (isHin ? "गुलिक काल का अलार्म सेट करें" : "Set Gulika alarm")}
                                        aria-label={isGulikActive ? (isHin ? "गुलिक काल अलार्म बंद करें" : "Turn off Gulika alarm") : (isHin ? "गुलिक काल का अलार्म सेट करें" : "Set Gulika alarm")}
                                      >
                                        <Bell className={`w-3.5 h-3.5 ${isGulikActive ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* =========================================================================
                    FOLD 3: वैदिक पंचांग एवं चंद्र दर्शन (DEEP VEDIC LIMBS & ACCORDION)
                    ========================================================================= */}

                {/* CARD 3: 📿 आज के मुख्य वैदिक अंग (Core Limbs + Expandable Accordion) */}
                <motion.div
                  id="home_card_vedic_limbs"
                  variants={itemVariants}
                  className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left border border-orange-200/60 dark:border-orange-950/30 rounded-3xl space-y-2.5 shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-orange-100/30 dark:border-orange-950/20 pb-2 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl">📿</span>
                      <h3 className="text-[17.5px] sm:text-[19px] font-black text-[#9A3412] dark:text-amber-400 leading-tight font-serif">
                        {settings.language === 'Hindi' ? "आज के मुख्य वैदिक अंग" : "Today's Core Vedic Limbs"}
                      </h3>
                    </div>
                    <span className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {settings.language === 'Hindi' ? "पञ्चाङ्ग" : "Panchang"}
                    </span>
                  </div>

                  {/* 6 Essential Limbs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 select-none">
                    {/* Tithi */}
                    <div className="flex flex-col bg-amber-500/5 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-950/25 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[82px]">
                      <span className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-bold font-serif">{settings.language === 'Hindi' ? "तिथि" : "Tithi"}</span>
                      <span className="text-[15.5px] sm:text-[17px] font-black font-serif text-orange-950 dark:text-orange-200 leading-snug my-1 break-words">
                        {settings.language === 'Hindi' ? panchangInfo.hinduDate.tithi.hindiName : (panchangInfo.hinduDate.tithi.name || panchangInfo.hinduDate.tithi.hindiName)}
                      </span>
                      <span className="text-[13px] sm:text-[13.5px] text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 font-sans">
                        🕒 {settings.language === 'Hindi' ? `${formatHindiTime(panchangInfo.hinduDate.tithi.endTime)} तक` : `until ${panchangInfo.hinduDate.tithi.endTime}`}
                      </span>
                    </div>

                    {/* Nakshatra */}
                    <div className="flex flex-col bg-amber-500/5 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-950/25 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[82px]">
                      <span className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-bold font-serif">{settings.language === 'Hindi' ? "नक्षत्र" : "Nakshatra"}</span>
                      <span className="text-[15.5px] sm:text-[17px] font-black font-serif text-orange-950 dark:text-orange-200 leading-snug my-1 break-words">
                        {settings.language === 'Hindi' ? panchangInfo.hinduDate.nakshatra.hindiName : (panchangInfo.hinduDate.nakshatra.name || panchangInfo.hinduDate.nakshatra.hindiName)}
                        {panchangInfo.hinduDate.nakshatra.pada ? (settings.language === 'Hindi' ? ` (${panchangInfo.hinduDate.nakshatra.pada} चरण)` : ` (Pada ${panchangInfo.hinduDate.nakshatra.pada})`) : ''}
                      </span>
                      <span className="text-[13px] sm:text-[13.5px] text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 font-sans">
                        🕒 {settings.language === 'Hindi' ? `${formatHindiTime(panchangInfo.hinduDate.nakshatra.endTime)} तक` : `until ${panchangInfo.hinduDate.nakshatra.endTime}`}
                      </span>
                    </div>

                    {/* Yoga */}
                    <div className="flex flex-col bg-amber-500/5 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-950/25 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[82px]">
                      <span className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-bold font-serif">{settings.language === 'Hindi' ? "योग" : "Yoga"}</span>
                      <span className="text-[15.5px] sm:text-[17px] font-black font-serif text-orange-950 dark:text-orange-200 leading-snug my-1 break-words">
                        {settings.language === 'Hindi' ? translateYoga(panchangInfo.hinduDate.yoga.hindiName) : (panchangInfo.hinduDate.yoga.name || panchangInfo.hinduDate.yoga.hindiName)}
                      </span>
                      <span className="text-[13px] sm:text-[13.5px] text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 font-sans">
                        🕒 {settings.language === 'Hindi' ? `${formatHindiTime(panchangInfo.hinduDate.yoga.endTime)} तक` : `until ${panchangInfo.hinduDate.yoga.endTime}`}
                      </span>
                    </div>

                    {/* Karana 1 */}
                    <div className="flex flex-col bg-amber-500/5 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-950/25 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[82px]">
                      <span className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-bold font-serif">{settings.language === 'Hindi' ? "प्रथम करण" : "1st Karana"}</span>
                      <span className="text-[15.5px] sm:text-[17px] font-black font-serif text-orange-950 dark:text-orange-200 leading-snug my-1 break-words">
                        {(() => {
                          const kName = panchangInfo.hinduDate.karana1 ? (settings.language === 'Hindi' ? translateKarana(panchangInfo.hinduDate.karana1.hindiName) : (panchangInfo.hinduDate.karana1.name || panchangInfo.hinduDate.karana1.hindiName)) : '';
                          return kName.includes('विष्टि') || kName.toLowerCase().includes('vishti') ? (settings.language === 'Hindi' ? 'विष्टि (भद्रा)' : 'Vishti (Bhadra)') : kName;
                        })()}
                      </span>
                      <span className="text-[13px] sm:text-[13.5px] text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 font-sans">
                        🕒 {settings.language === 'Hindi' ? formatHindiTime(panchangInfo.hinduDate.karana1?.endTime || '') : (panchangInfo.hinduDate.karana1?.endTime || '')}
                      </span>
                    </div>

                    {/* Karana 2 (Clarifying Vishti/Bhadra) */}
                    <div className="flex flex-col bg-amber-500/5 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-950/25 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[82px]">
                      <span className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-bold font-serif">{settings.language === 'Hindi' ? "द्वितीय करण" : "2nd Karana"}</span>
                      <span className="text-[15.5px] sm:text-[17px] font-black font-serif text-orange-950 dark:text-orange-200 leading-snug my-1 break-words">
                        {(() => {
                          const kName = panchangInfo.hinduDate.karana2 ? (settings.language === 'Hindi' ? translateKarana(panchangInfo.hinduDate.karana2.hindiName) : (panchangInfo.hinduDate.karana2.name || panchangInfo.hinduDate.karana2.hindiName)) : '';
                          return kName.includes('विष्टि') || kName.toLowerCase().includes('vishti') ? (settings.language === 'Hindi' ? 'विष्टि (भद्रा - शुभ कार्य टालें)' : 'Vishti (Bhadra - Avoid tasks)') : kName;
                        })()}
                      </span>
                      <span className="text-[13px] sm:text-[13.5px] text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 font-sans">
                        🕒 {settings.language === 'Hindi' ? formatHindiTime(panchangInfo.hinduDate.karana2?.endTime || '') : (panchangInfo.hinduDate.karana2?.endTime || '')}
                      </span>
                    </div>

                    {/* Anandadi Yoga */}
                    <div className="flex flex-col bg-amber-500/5 dark:bg-orange-950/10 border border-orange-200/40 dark:border-orange-950/25 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[82px]">
                      <span className="text-[12px] sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-bold font-serif">{settings.language === 'Hindi' ? "आनन्दादि योग" : "Anandadi Yoga"}</span>
                      <span className="text-[15.5px] sm:text-[17px] font-black font-serif text-orange-950 dark:text-orange-200 leading-snug my-1 break-words">
                        {panchangInfo.anandadiYoga ? (settings.language === 'Hindi' ? panchangInfo.anandadiYoga.nameHindi : (panchangInfo.anandadiYoga.name || panchangInfo.anandadiYoga.nameHindi)) : (settings.language === 'Hindi' ? 'आनन्द' : 'Ananda')}
                      </span>
                      <span className="text-[13px] sm:text-[13.5px] text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 font-sans">
                        🕒 {settings.language === 'Hindi' ? `${formatHindiTime(panchangInfo.anandadiYoga?.endTime || '')} तक` : `until ${panchangInfo.anandadiYoga?.endTime || ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Planetary Signs Summary Row */}
                  <div className="grid grid-cols-2 gap-2 pt-1 select-none">
                    {/* Moon Sign */}
                    {panchangInfo.planets?.find(p => p && p.name === 'Moon') && (() => {
                      const moonPlanet = panchangInfo.planets.find(p => p && p.name === 'Moon')!;
                      const remTime = getPlanetRemainingTime(moonPlanet);
                      return (
                        <div className="flex justify-between items-center bg-orange-500/5 dark:bg-orange-950/10 border border-orange-200/30 dark:border-orange-950/20 rounded-2xl py-2 px-3 text-left leading-normal">
                          <span className="text-[12.5px] sm:text-[13px] text-slate-600 dark:text-slate-300 font-bold font-serif">{settings.language === 'Hindi' ? "🌙 चन्द्र राशि:" : "🌙 Moon Sign:"}</span>
                          <div className="flex flex-col items-end leading-none gap-0.5">
                            <span className="font-serif font-black text-[#ea580c] dark:text-amber-400 text-[15px] sm:text-[17px]">
                              {settings.language === 'Hindi' ? moonPlanet.signHindi : (moonPlanet.sign || moonPlanet.signHindi)}
                            </span>
                            {remTime && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                ⏳ {remTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Sun Sign */}
                    {panchangInfo.planets?.find(p => p && p.name === 'Sun') && (() => {
                      const sunPlanet = panchangInfo.planets.find(p => p && p.name === 'Sun')!;
                      const remTime = getPlanetRemainingTime(sunPlanet);
                      return (
                        <div className="flex justify-between items-center bg-orange-500/5 dark:bg-orange-950/10 border border-orange-200/30 dark:border-orange-950/20 rounded-2xl py-2 px-3 text-left leading-normal">
                          <span className="text-[12.5px] sm:text-[13px] text-slate-600 dark:text-slate-300 font-bold font-serif">{settings.language === 'Hindi' ? "🔆 सूर्य राशि:" : "🔆 Sun Sign:"}</span>
                          <div className="flex flex-col items-end leading-none gap-0.5">
                            <span className="font-serif font-black text-[#ea580c] dark:text-amber-400 text-[15px] sm:text-[17px]">
                              {settings.language === 'Hindi' ? sunPlanet.signHindi : (sunPlanet.sign || sunPlanet.signHindi)}
                            </span>
                            {remTime && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                ⏳ {remTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Expandable Deep Vedic Accordion Button */}
                  <div className="pt-1.5 border-t border-orange-100/30 dark:border-orange-950/20">
                    <button
                      type="button"
                      onClick={() => setShowDeepPanchang(!showDeepPanchang)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-500/10 hover:bg-orange-500/15 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border border-orange-300/40 dark:border-amber-900/30 rounded-2xl text-xs sm:text-[13px] font-serif font-bold text-orange-900 dark:text-amber-300 transition-colors"
                    >
                      <span>
                        {settings.language === 'Hindi'
                          ? (showDeepPanchang ? '▲ संवत, अमान्त, अयन विवरण समेटें' : '▼ संवत, अमान्त, अयन व पंचांग विस्तार देखें')
                          : (showDeepPanchang ? '▲ Collapse Samvat, Amanta, Ayana details' : '▼ View Samvat, Amanta, Ayana & Panchang expansion')}
                      </span>
                    </button>

                    {/* Accordion Content */}
                    {showDeepPanchang && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mt-2 pt-1"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs leading-tight">
                          <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-200/40 dark:border-orange-950/20 rounded-2xl justify-center">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase font-mono">
                              {settings.language === 'Hindi' ? "अमान्त महीना" : "Amanta Month"}
                            </span>
                            <span className="font-serif font-bold text-orange-900 dark:text-orange-200 text-xs mt-0.5 truncate">
                              {settings.language === 'Hindi'
                                ? (translateSanskritMonth(panchangInfo.hinduDate.monthAmantaHindi || panchangInfo.hinduDate.monthHindi).replace(/\s*\([a-zA-Z-]+\)/g, '') + (panchangInfo.hinduDate.isLeapMonth ? ' (अधिमास)' : ''))
                                : ((panchangInfo.hinduDate.monthAmanta || panchangInfo.hinduDate.month || '').replace(/\s*\([^\)]*\)/g, '') + (panchangInfo.hinduDate.isLeapMonth ? ' (Adhik)' : ''))}
                            </span>
                          </div>

                          <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-200/40 dark:border-orange-950/20 rounded-2xl justify-center">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase font-mono">
                              {settings.language === 'Hindi' ? "पूर्णिमान्त महीना" : "Purnimanta Month"}
                            </span>
                            <span className="font-serif font-bold text-orange-900 dark:text-orange-200 text-xs mt-0.5 truncate">
                              {settings.language === 'Hindi'
                                ? (translateSanskritMonth(panchangInfo.hinduDate.monthPurnimantaHindi || panchangInfo.hinduDate.monthHindi).replace(/\s*\([a-zA-Z-]+\)/g, '') + (panchangInfo.hinduDate.isLeapMonth ? ' (अधिमास)' : ''))
                                : ((panchangInfo.hinduDate.monthPurnimanta || panchangInfo.hinduDate.month || '').replace(/\s*\([^\)]*\)/g, '') + (panchangInfo.hinduDate.isLeapMonth ? ' (Adhik)' : ''))}
                            </span>
                          </div>

                          <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-200/40 dark:border-orange-950/20 rounded-2xl justify-center">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase font-mono">
                              {settings.language === 'Hindi' ? "पक्ष व ऋतु" : "Paksha & Season"}
                            </span>
                            <span className="font-serif font-bold text-orange-900 dark:text-orange-200 text-xs mt-0.5 truncate">
                              {settings.language === 'Hindi'
                                ? `${panchangInfo.hinduDate.paksha === 'Shukla' ? 'शुक्ल' : 'कृष्ण'} पक्ष • ${(() => {
                                    const r = panchangInfo.hinduDate.ritu || '';
                                    if (r.includes('Vasanta') || r.includes('Spring')) return 'वसन्त';
                                    if (r.includes('Grishma') || r.includes('Summer')) return 'ग्रीष्म';
                                    if (r.includes('Varsha') || r.includes('Monsoon')) return 'वर्षा';
                                    if (r.includes('Sharad') || r.includes('Autumn')) return 'शरद';
                                    if (r.includes('Hemant') || r.includes('Winter-pre')) return 'हेमंत';
                                    if (r.includes('Shishir') || r.includes('Winter-peak')) return 'शिशिर';
                                    return r.replace(/\s*\([a-zA-Z-]+\)/g, '');
                                  })()}`
                                : `${panchangInfo.hinduDate.paksha} • ${panchangInfo.hinduDate.ritu || 'Sharad'}`}
                            </span>
                          </div>

                          <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-200/40 dark:border-orange-950/20 rounded-2xl justify-center">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase font-mono">
                              {settings.language === 'Hindi' ? "वि. / शक संवत्" : "V. / Sh. Samvat"}
                            </span>
                            <span className="font-serif font-bold text-orange-900 dark:text-orange-200 mt-0.5 text-xs truncate">
                              {panchangInfo.hinduDate.samvatVikram} / {panchangInfo.hinduDate.samvatShaka}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {panchangInfo.hinduDate.ayana && (
                            <div className="flex justify-between items-center bg-orange-500/5 dark:bg-orange-950/10 border border-orange-200/30 rounded-2xl p-2 px-3">
                              <span className="text-[12px] text-slate-600 dark:text-slate-400 font-serif font-bold">
                                {settings.language === 'Hindi' ? "🌞 अयन:" : "🌞 Ayana:"}
                              </span>
                              <span className="font-serif font-black text-orange-800 dark:text-amber-400">
                                {settings.language === 'Hindi'
                                  ? (panchangInfo.hinduDate.ayana === 'Uttarayana' ? 'उत्तरायण' : 'दक्षिणायन')
                                  : panchangInfo.hinduDate.ayana}
                              </span>
                            </div>
                          )}

                          {panchangInfo.hinduDate.praviste !== undefined && (
                            <div className="flex justify-between items-center bg-orange-500/5 dark:bg-orange-950/10 border border-orange-200/30 rounded-2xl p-2 px-3">
                              <span className="text-[12px] text-slate-600 dark:text-slate-400 font-serif font-bold">
                                {settings.language === 'Hindi' ? "📅 प्रविष्टे / गते:" : "📅 Solar Day (Praviste):"}
                              </span>
                              <span className="font-serif font-black text-orange-800 dark:text-amber-400">
                                {settings.language === 'Hindi' ? `${panchangInfo.hinduDate.praviste} प्रविष्टे` : `Day ${panchangInfo.hinduDate.praviste}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Direct link to Full 35-point Panchang Screen */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('panchang');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs sm:text-[13px] font-serif font-bold shadow-sm transition-all"
                        >
                          <span>
                            {settings.language === 'Hindi'
                              ? "📜 संपूर्ण 35-सूत्रीय वैदिक पंचांग विस्तार देखें ➔"
                              : "📜 View Complete 35-Point Vedic Panchang ➔"}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* CARD 4: ✨ खगोलीय चंद्र स्थिति (MoonPhaseVisualizer) */}
                <motion.div id="home_card_moon_phase" variants={itemVariants} className="mt-1">
                  <MoonPhaseVisualizer panchang={panchangInfo} language={settings.language} />
                </motion.div>

                {/* CARD 5: 📲 WhatsApp पंचांग पोस्टर शेयरिंग (Quick Share Banner) */}
                <motion.div
                  id="home_card_share_banner"
                  variants={itemVariants}
                  className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4 text-left border border-emerald-500/30 dark:border-emerald-900/30 rounded-3xl space-y-2.5 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-950/15"
                >
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">📲</span>
                      <h3 className="text-[14.5px] sm:text-[15.5px] font-black tracking-wide text-emerald-800 dark:text-emerald-400 leading-none font-serif">
                        {settings.language === 'Hindi' ? "आज का पंचांग व शुभ समय साझा करें" : "Share Today's Panchang & Auspicious Times"}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md">
                      {settings.language === 'Hindi' ? "दैनिक सेवा" : "Daily Service"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                    {settings.language === 'Hindi'
                      ? "आज की तिथि, नक्षत्र, शुभ अभिजीत मुहूर्त, राहुकाल और चौघड़िया का सुंदर पंचांग पोस्टर अपने प्रियजनों और धार्मिक समूहों में तुरंत शेयर करें।"
                      : "Instantly share today's Tithi, Nakshatra, Abhijit Muhurat, Rahukaal, and Choghadiya auspicious poster with friends, family, and religious groups."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleShareDailyPanchang}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-[13px] font-serif font-black shadow-md transition-all active:scale-[0.98]"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{settings.language === 'Hindi' ? "WhatsApp पर साझा करें" : "Share on WhatsApp"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('tools');
                        setTimeout(() => {
                          const el = document.getElementById('tools_poster_card');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-orange-500/10 hover:bg-orange-500/20 dark:bg-amber-950/30 border border-orange-300 dark:border-amber-900/40 text-orange-900 dark:text-amber-300 rounded-2xl text-xs sm:text-[13px] font-serif font-bold transition-all"
                    >
                      <span>{settings.language === 'Hindi' ? "🖼️ पंचांग पोस्टर मेकर ➔" : "🖼️ Panchang Poster Maker ➔"}</span>
                    </button>
                  </div>
                </motion.div>

                

              </motion.div>
            )}

            {/* 2. PANCHANG SCREEN */}
            {activeTab === 'panchang' && (
              <PanchangScreen 
                panchang={panchangScreenInfo} 
                onShare={handleShareDailyPanchang} 
                currentTime={currentMinuteTime} 
                selectedDate={panchangSelectedDate}
                onDateChange={setPanchangSelectedDate}
                language={settings.language} 
              />
            )}

            {/* 3. MUHURAT SCREEN */}
            {activeTab === 'muhurat' && (
              <MuhuratScreen 
                panchang={muhuratPanchangInfo} 
                onViewAstrologyChart={() => setActiveTab('panchang')} 
                currentTime={currentMinuteTime} 
                selectedDate={muhuratSelectedDate || selectedDate} // Keep fallback if undefined
                onDateChange={setMuhuratSelectedDate}
                language={settings.language}
              />
            )}

            {/* 4. FESTIVAL SCREEN */}
            {activeTab === 'festival' && (
              <FestivalScreen lat={coords.latitude} lon={coords.longitude} year={selectedDate.getFullYear()} language={settings.language} />
            )}





            {/* 6. TOOLS & SETTINGS CONSOLE (2-SEGMENTED: APP SETTINGS | POSTER & WIDGET TOOLS) */}
            {activeTab === 'tools' && (
              <SettingsScreen
                settings={settings}
                setSettings={setSettings}
                onPushToast={handlePushNotificationToast}
                panchangInfo={panchangInfo}
                city={coords.city}
                activeMuhurats={activeMuhurats}
                notificationEnabled={notificationEnabled}
                setNotificationEnabled={setNotificationEnabled}
              />
            )}

            {/* 7. DEDICATED ALARM & NOTIFICATION SIMULATOR PAGE */}
            {activeTab === 'alerts' && (
              <motion.div
                initial="hidden"
                animate="show"
                variants={itemVariants}
                className="space-y-4 sm:space-y-5"
              >
                <div className="glass-card-light dark:glass-card-dark p-3.5 sm:p-4.5 text-center shadow-xs border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl">
                  <span className="text-[12px] sm:text-[13px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block mb-0.5 text-center">
                    {settings.language === 'Hindi' ? "॥ धार्मिक एवं साधना अलार्म ॥" : "॥ Religious & Sadhana Alarms ॥"}
                  </span>
                  <h2 className="text-[17px] sm:text-[19px] font-bold font-serif text-slate-900 dark:text-amber-100 leading-tight text-center flex items-center justify-center gap-2">
                    <span>🔔</span> {settings.language === 'Hindi' ? "धार्मिक एवं साधना अलार्म" : "Religious & Sadhana Alarms"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                    {settings.language === 'Hindi' 
                      ? "संध्या वंदन, शुभ लग्न, अभिजित मुहूर्त, राहुकाल और चौघड़िया के लिए अनुकूलित अलार्म सेटिंग्स" 
                      : "Customized alarm settings for Sandhya Vandana, Shubh Muhurat, Abhijit, Rahukaal, and Choghadiya"}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4.5 bg-white dark:bg-zinc-950/20 border !border-[#FF9933]/45 dark:!border-[#FF9933]/30 rounded-3xl shadow-xs">
                  <NotificationSimulator
                    notificationsList={notificationsList}
                    setNotificationsList={setNotificationsList}
                    onPushToast={handlePushNotificationToast}
                    panchangInfo={panchangInfo}
                    language={settings.language}
                  />
                </div>
              </motion.div>
            )}

          </main>

          {/* BOTTOM PREMIUM TAB BAR NAVIGATION */}
          <footer className={`border-t flex justify-between sm:justify-around items-center pt-2.5 pb-[max(env(safe-area-inset-bottom),26px)] sm:pb-[max(env(safe-area-inset-bottom),26px)] md:pb-[max(env(safe-area-inset-bottom),56px)] px-2 sm:px-4 fixed bottom-0 left-0 right-0 w-full z-40 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] overflow-x-auto scrollbar-hide flex-nowrap ${
            settings.theme === 'light' 
              ? 'bg-[#FFFBF5]/95 backdrop-blur-md border-orange-100/70' 
              : 'bg-[#1D1713]/95 backdrop-blur-md border-[var(--card-border-dark)]' // using dark card border variables
          }`}>
            
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-[52px] sm:w-[68px] transition-all flex-shrink-0 ${
                activeTab === 'home'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Home className="w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]" />
              <span className="text-[10.5px] sm:text-[12px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'homeTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('panchang')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-[52px] sm:w-[68px] transition-all flex-shrink-0 ${
                activeTab === 'panchang'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Landmark className="w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]" />
              <span className="text-[10.5px] sm:text-[12px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'panchangTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('muhurat')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-[52px] sm:w-[68px] transition-all flex-shrink-0 ${
                activeTab === 'muhurat'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Clock className="w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]" />
              <span className="text-[10.5px] sm:text-[12px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'muhuratTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('festival')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-[52px] sm:w-[68px] transition-all flex-shrink-0 ${
                activeTab === 'festival'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Calendar className="w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]" />
              <span className="text-[10.5px] sm:text-[12px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'festivalTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-[52px] sm:w-[68px] transition-all flex-shrink-0 ${
                activeTab === 'alerts'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Bell className="w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]" />
              <span className="text-[10.5px] sm:text-[12px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'alarmsTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-[52px] sm:w-[68px] transition-all flex-shrink-0 ${
                activeTab === 'tools'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Settings className="w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]" />
              <span className="text-[10.5px] sm:text-[12px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'toolsTab')}</span>
            </button>

          </footer>

        </div>

        {/* Outer footer branding */}
        <div className="hidden md:block mt-4 text-center select-none mb-6">
          <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono font-bold">
            आज का धार्मिक समय - Innovix Solutions v1.0.0
          </p>
          <span className="text-[9px] text-slate-400 mt-0.5 block italic font-sans font-medium">
            🇮🇳 Proudly Made in India | Make for India • प्राचीन सूर्य सिद्धांत और सटीक सौर गणनाओं द्वारा स्थापित।
          </span>
        </div>

      </div>

      
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCoords={coords}
        onSelectCity={handleSelectCity}
        gpsActive={gpsActive}
        setGpsActive={setGpsActive}
        theme={settings.theme}
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        theme={settings.theme} 
        language={settings.language}
      />

    </div>
  );
}
