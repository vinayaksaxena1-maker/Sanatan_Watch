/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  ChevronRight, 
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
import { getPanchangForDate as originalGetPanchangForDate, getMuhuratsForPanchang, getChoghadiyaPresentationData } from './utils/panchangCalc';

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

import { registerEngineListener, isReady } from './utils/astronomicalEngine';



// Subcomponents
import { ChaughadiyaRing } from './components/ChaughadiyaRing';
import { HoraRing } from './components/HoraRing';

import { LiveMuhuratWatch } from './components/LiveMuhuratWatch';
import { PanchangScreen } from './components/PanchangScreen';
import { MuhuratScreen } from './components/MuhuratScreen';
import { FestivalScreen } from './components/FestivalScreen';
import { HoraSystem } from './components/HoraSystem';
import { PosterGenerator } from './components/PosterGenerator';
import { WidgetSimulator } from './components/WidgetSimulator';
import { NotificationSimulator } from './components/NotificationSimulator';
import { CitySelector } from './components/CitySelector';
import { MonetizationSimulator } from './components/MonetizationSimulator';
import { SettingsScreen } from './components/SettingsScreen';
import { SplashScreen, SplashStyle } from './components/SplashScreen';
import { SacredLogoIcon } from './components/LogoSelector';
import { HelpModal } from './components/HelpModal';
import { CitySelectorModal } from './components/CitySelectorModal';
import { SanatanTimeWheel } from './components/SanatanTimeWheel';
import { MoonPhaseVisualizer } from './components/MoonPhaseVisualizer';

// Hindu Dharmik Sacred Additions
import { MantraJapa } from './components/MantraJapa';
import { LiveLagna } from './components/LiveLagna';
import { StotraSangrah } from './components/StotraSangrah';
import dialBg from './components/VintageDialBackground.png';
import { getTranslation } from './utils/translations';
import { getFestivalsForYear } from './utils/festivalEngine';

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
  const [activeTab, setActiveTab ] = useState<'home' | 'panchang' | 'muhurat' | 'festival' | 'nakshatra' | 'sadhana' | 'tools' | 'alerts'>('home');
  const [toolsSubSection, setToolsSubSection] = useState<'picker' | 'widgets' | 'plans' | 'settings'>('widgets');
  const [sadhanaSubSection, setSadhanaSubSection] = useState<'japa' | 'lagna' | 'stotra' | 'hora' | 'poster'>('japa');

  // Splash Screen State
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashAnimationCompleted, setSplashAnimationCompleted] = useState<boolean>(false);
  const [previewSplashStyle, setPreviewSplashStyle] = useState<SplashStyle | null>(null);

  // Core Astro State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [coords, setCoords] = useState<Coords>(DEFAULT_COORDS);
  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [homeTimeCycleTab, setHomeTimeCycleTab] = useState<'choghadiya' | 'hora'>('choghadiya');

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
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);

  // Push Alert Toast States
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // Force update trigger on astronomical calculation changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    registerEngineListener(() => {
      forceUpdate({});
      if (splashAnimationCompleted && isReady()) {
        setIsSplashActive(false);
      }
    });
  }, [splashAnimationCompleted]);

  // Safety timeout to ensure Splash Screen is dismissed even if engine is slow or fails
  useEffect(() => {
    if (isSplashActive) {
      const timer = setTimeout(() => {
        console.warn('[App] Splash screen safety timeout triggered. Force dismissing splash screen.');
        setIsSplashActive(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isSplashActive]);

  // Load from local Cache on Mount
  useEffect(() => {
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
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.classList.remove('temple');
    }
  }, [settings.theme]);

  useEffect(() => {
    try {
      localStorage.setItem('dharmic_samay_alerts', JSON.stringify(notificationsList));
    } catch {}
  }, [notificationsList]);

  // Keep ticking Clock
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Real-time calculated Panchang and Muhurats
  const panchangInfo = getPanchangForDate(coords.latitude, coords.longitude, selectedDate);
  const activeMuhurats = getMuhuratsForPanchang(panchangInfo);

  // Find current active Choghadiya based on actual currentTime (today)
  const getActiveChoghadiya = () => {
    try {
      const todayPanchang = getPanchangForDate(coords.latitude, coords.longitude, new Date());
      const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

      return todayPanchang.choghadiya.find(ch => 
        isTimeInInterval(currentMin, ch.startTime, ch.endTime)
      );
    } catch {
      return undefined;
    }
  };

  const activeChoghadiya = getActiveChoghadiya();

  // Find rolling chronological Hora list and current active Hora
  const getHoraPresentationData = () => {
    try {
      const curDateObj = new Date(currentTime);
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
      const pRef = getPanchangForDate(coords.latitude, coords.longitude, selDateObj);
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
      
      console.log("Calculated rolling Hora list:", rollingList.map(h => `${h.number}: ${h.lordHindi} (${h.startTime} - ${h.endTime})`));

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
  };

  const { rollingHoraList, rollingActiveHora } = getHoraPresentationData();
  const activeHora = rollingActiveHora;

  // Chaughadiya Ring presentation data consumed directly from the Sanatan Engine
  const {
    choghadiyaList,
    activeIndex,
    displayStartTime,
    displayEndTime
  } = getChoghadiyaPresentationData(panchangInfo, currentTime);


  const getChoghadiyaTrendInfo = () => {
    if (!activeChoghadiya) {
      return {
        icon: null,
        colorClass: '',
        tooltip: 'Click to toggle digital/analog format'
      };
    }
    
    const { quality, hindiName, name } = activeChoghadiya;
    const label = hindiName || name;
    
    if (quality === 'Excellent' || quality === 'Good') {
      return {
        icon: <TrendingUp className="w-2 h-2 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        colorClass: 'border-emerald-200/50 dark:border-emerald-950/40 bg-emerald-50/65 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-300',
        tooltip: `शुभ चौघड़िया: ${label} (उत्तम/शुभ समय) - Click to toggle format`
      };
    } else if (quality === 'Inauspicious' || quality === 'Bad') {
      return {
        icon: <TrendingDown className="w-2 h-2 text-rose-600 dark:text-rose-450 shrink-0" />,
        colorClass: 'border-rose-200/50 dark:border-rose-950/40 bg-rose-50/65 dark:bg-rose-950/25 text-rose-850 dark:text-rose-350',
        tooltip: `अशुभ चौघड़िया: ${label} (वर्जित/अशुभ समय) - Click to toggle format`
      };
    } else {
      return {
        icon: <Minus className="w-2 h-2 text-blue-500 dark:text-blue-400 shrink-0" />,
        colorClass: 'border-blue-100/50 dark:border-zinc-800/40 bg-blue-50/40 dark:bg-zinc-900/30 text-blue-600 dark:text-blue-300',
        tooltip: `मध्यम चौघड़िया: ${label} (सामान्य/चल समय) - Click to toggle format`
      };
    }
  };

  const trendInfo = getChoghadiyaTrendInfo();

  // Triggering the visual toast slide-in
  const handlePushNotificationToast = (title: string, body: string) => {
    setToastMessage({ title, body });
    setShowToast(true);
    // Auto-wipe after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
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
    const map: Record<string, string> = {
      'Bava': 'बव',
      'Balava': 'बालव',
      'Kaulava': 'कौलव',
      'Taitila': 'तैतिल',
      'Garija': 'गरिज',
      'Vanija': 'वणिज',
      'Vishti (Bhadra)': 'विष्टि (भद्रा)',
      'Shakuni': 'शकुनि',
      'Chatuspada': 'चतुष्पाद',
      'Naga': 'नाग',
      'Kimstughna': 'किंस्तुघ्न'
    };
    return map[karana] || karana;
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
          directionHindi: 'पश्चिम (West)',
          remedy: 'Eat betel leaf, cardamom, or ghee',
          remedyHindi: 'दलिया, घी या इलायची खाकर प्रस्थान करें'
        };
      case 1:
        return {
          direction: 'East',
          directionHindi: 'पूर्व (East)',
          remedy: 'Look in a mirror or drink milk',
          remedyHindi: 'दर्पण देखकर या दूध पीकर प्रस्थान करें'
        };
      case 2:
        return {
          direction: 'North',
          directionHindi: 'उत्तर (North)',
          remedy: 'Eat jaggery',
          remedyHindi: 'गुड़ खाकर प्रस्थान करें'
        };
      case 3:
        return {
          direction: 'North',
          directionHindi: 'उत्तर (North)',
          remedy: 'Eat coriander or sesame',
          remedyHindi: 'धनिया या तिल खाकर प्रस्थान करें'
        };
      case 4:
        return {
          direction: 'South',
          directionHindi: 'दक्षिण (South)',
          remedy: 'Eat curd or cumin seeds',
          remedyHindi: 'दही या जीरा खाकर प्रस्थान करें'
        };
      case 5:
        return {
          direction: 'West',
          directionHindi: 'पश्चिम (West)',
          remedy: 'Eat barley or curd',
          remedyHindi: 'जौ या राई खाकर प्रस्थान करें'
        };
      case 6:
        return {
          direction: 'East',
          directionHindi: 'पूर्व (East)',
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
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillText('http://localhost:3000', 300, 903);

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

  const formattedClockStr = currentTime.toLocaleTimeString('en-IN', {
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

  if (isSplashActive) {
    return (
      <SplashScreen 
        selectedStyle={settings.splashStyle || 'saffron'} 
        onComplete={() => {
          setSplashAnimationCompleted(true);
          if (isReady()) {
            setIsSplashActive(false);
          }
        }} 
        customSplash={settings.customSplash}
      />
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
        <div className={`overflow-hidden transition-all duration-300 relative flex flex-col min-h-screen w-full flex-grow ${
          settings.theme === 'light'
            ? 'bg-[var(--bg-envelope-light)]'
            : 'bg-[var(--bg-envelope-dark)]'
        }`}>
          
          {/* Subtle Sacred Motif Background Overlay for Spiritual Branding */}
          <div className="absolute inset-0 sacred-motif-overlay pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]"></div>
          
          {/* MAIN BRAND HEADER BANNER */}
          <div className="px-4 pt-4 pb-1 select-none relative z-10">
            <header className={`p-4 sm:p-5 rounded-[28px] border border-orange-100/50 dark:border-orange-950/20 flex flex-col gap-4 shadow-sm ${
              settings.theme === 'light' ? 'bg-orange-50/15' : 'bg-orange-950/5'
            }`}>
              {/* ROW 1: Logo, Title & Tagline + Location */}
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src="/LOGO4.png" 
                    alt="सनातन घड़ी लोगो" 
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-orange-200/50 p-0.5 object-cover drop-shadow-sm"
                  />
                  <div className="flex flex-col text-left">
                    <h1 className="text-base sm:text-lg font-serif font-black text-orange-900 dark:text-amber-100 tracking-wider leading-tight">
                      {getTranslation(settings.language, 'home')}
                    </h1>
                    <span className="text-[9px] sm:text-[10px] font-serif font-bold text-orange-700/80 dark:text-amber-500/80 tracking-wide mt-0.5">
                      {getTranslation(settings.language, 'tagline')}
                    </span>
                  </div>
                </div>

                {/* Location Box (Right aligned in Row 1) */}
                <div 
                  onClick={() => setIsCityModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100/50 dark:bg-zinc-900/40 border border-orange-200/30 dark:border-zinc-800/30 hover:bg-orange-200/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                  title={settings.language === 'Hindi' ? "स्थान बदलें" : "Change Location"}
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                  <span className="text-[9px] font-extrabold text-orange-900 dark:text-amber-100 uppercase font-mono tracking-tight leading-none truncate max-w-[120px]">
                    {coords.city}
                  </span>
                </div>
              </div>

              {/* ROW 2: Precise clock & Choghadiya Trend Badge */}
              <div 
                id="header_clock_wrapper"
                className="flex items-center justify-between w-full rounded-full px-4 py-2 bg-slate-50/50 dark:bg-stone-900/60 border border-slate-200/60 dark:border-zinc-800/40 shadow-3xs"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-orange-500 transition-colors drop-shadow-3xs" />
                  <span 
                    className="text-[9px] font-black text-slate-700 dark:text-slate-300 tracking-tight font-mono whitespace-nowrap leading-none [text-shadow:0_1px_1px_rgba(0,0,0,0.12)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
                  >
                    {selectedDate.toLocaleDateString(settings.language === 'Hindi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} • {currentTime.toLocaleTimeString(settings.language === 'Hindi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>
                {trendInfo.icon && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black leading-none shadow-3xs hover:shadow-2xs transition-shadow duration-300 ${trendInfo.colorClass}`}>
                    {trendInfo.icon}
                    <span className="font-serif [text-shadow:0_0.5px_1px_rgba(255,255,255,0.45)] dark:[text-shadow:0_0.5px_1px_rgba(0,0,0,0.35)]">{activeChoghadiya?.hindiName}</span>
                  </span>
                )}
              </div>
            </header>
          </div>

          {/* MAIN CONTAINER PREVIEW SCREEN */}
          <main className="pt-3 px-4 pb-24 md:pb-4 flex-grow flex-1 min-h-[460px]">
            
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
                    />
                  </div>

                </motion.div>

                {/* 2. WELCOME CARD (Redesigned) */}
                <motion.div 
                  variants={itemVariants}
                  className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left flex flex-col gap-3 relative overflow-hidden border border-orange-100/50 dark:border-orange-950/20 rounded-3xl"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">॥ सनातन पंचांग कल्याणम ॥</span>
                    </div>
                    {/* Header Row: Date & Day */}
                    <div className="flex justify-between items-baseline gap-2 border-b border-orange-100/20 dark:border-orange-950/10 pb-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold font-serif text-slate-800 dark:text-amber-100">
                        {selectedDate.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </h2>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs leading-tight">
                    <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/10 dark:border-zinc-800/10 rounded-2xl justify-center min-h-[52px]">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">अमान्त महीना</span>
                      <span className="font-serif font-bold text-orange-700 dark:text-orange-350 mt-0.5 truncate">
                        {panchangInfo.hinduDate.monthAmantaHindi || panchangInfo.hinduDate.monthHindi}
                        {panchangInfo.hinduDate.isLeapMonth ? ' (अधिमास)' : ''}
                      </span>
                    </div>

                    <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/10 dark:border-zinc-800/10 rounded-2xl justify-center min-h-[52px]">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">पूर्णिमान्त महीना</span>
                      <span className="font-serif font-bold text-orange-700 dark:text-orange-350 mt-0.5 truncate">
                        {panchangInfo.hinduDate.monthPurnimantaHindi || panchangInfo.hinduDate.monthHindi}
                        {panchangInfo.hinduDate.isLeapMonth ? ' (अधिमास)' : ''}
                      </span>
                    </div>

                    <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/10 dark:border-zinc-800/10 rounded-2xl justify-center min-h-[52px]">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">पक्ष व ऋतु</span>
                      <span className="font-serif font-bold text-orange-700 dark:text-orange-350 mt-0.5 truncate">
                        {panchangInfo.hinduDate.paksha === 'Shukla' ? 'शुक्ल' : 'कृष्ण'} पक्ष • {(() => {
                          const r = panchangInfo.hinduDate.ritu;
                          if (r.includes('Vasanta') || r.includes('Spring')) return 'वसन्त';
                          if (r.includes('Grishma') || r.includes('Summer')) return 'ग्रीष्म';
                          if (r.includes('Varsha') || r.includes('Monsoon')) return 'वर्षा';
                          if (r.includes('Sharad') || r.includes('Autumn')) return 'शरद';
                          if (r.includes('Hemant') || r.includes('Winter-pre')) return 'हेमंत';
                          if (r.includes('Shishir') || r.includes('Winter-peak')) return 'शिशिर';
                          return r;
                        })()}
                      </span>
                    </div>

                    <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/10 dark:border-zinc-800/10 rounded-2xl justify-center min-h-[52px]">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">वि. / शक / गु. संवत्</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-350 mt-0.5 text-[10px] sm:text-xs">
                        {panchangInfo.hinduDate.samvatVikram} / {panchangInfo.hinduDate.samvatShaka} / {panchangInfo.hinduDate.samvatGujarati || panchangInfo.hinduDate.samvatVikram - 1}
                      </span>
                    </div>

                    <div className="flex flex-col p-2 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/10 dark:border-zinc-800/10 rounded-2xl justify-center min-h-[52px]">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">सूर्योदय / सूर्यास्त</span>
                      <span className="font-mono font-bold text-orange-700 dark:text-orange-350 mt-0.5">
                        🌅 {panchangInfo.sunrise} • 🌇 {panchangInfo.sunset}
                      </span>
                    </div>
                  </div>

                  {/* Live Ishtakala, Ayana, Moon Sign, Sun Sign, Praviste & Disha Shool Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 select-none">
                    {/* Live Ishtakala */}
                    {panchangInfo.ishtakala && (
                      <div className="flex justify-between items-center bg-orange-50/30 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/10 rounded-2xl p-2 px-3 text-left">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-serif">⏳ सजीव इष्टकाल (Live):</span>
                        <span className="font-serif font-black text-[#ea580c] dark:text-amber-400 text-xs sm:text-sm">{panchangInfo.ishtakala.formatted}</span>
                      </div>
                    )}

                    {/* Ayana */}
                    {panchangInfo.hinduDate.ayana && (
                      <div className="flex justify-between items-center bg-orange-50/30 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/10 rounded-2xl p-2 px-3 text-left">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-serif">🌞 अयन (Ayana):</span>
                        <span className={`text-[10.5px] font-black font-serif ${
                          panchangInfo.hinduDate.ayana === 'Uttarayana' ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {panchangInfo.hinduDate.ayana === 'Uttarayana' ? 'उत्तरायण' : 'दक्षिणायन'}
                        </span>
                      </div>
                    )}

                    {/* Moon Sign */}
                    {panchangInfo.planets?.find(p => p.name === 'Moon') && (() => {
                      const moonPlanet = panchangInfo.planets.find(p => p.name === 'Moon')!;
                      const remTime = getPlanetRemainingTime(moonPlanet);
                      return (
                        <div className="flex justify-between items-center bg-orange-50/30 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/10 rounded-2xl p-2 px-3 text-left">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-serif">🌙 चन्द्र राशि:</span>
                          <div className="flex flex-col items-end">
                            <span className="font-serif font-black text-orange-655 text-xs sm:text-sm">
                              {moonPlanet.signHindi || ''}
                            </span>
                            {remTime && (
                              <span className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">
                                ⏳ {remTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Sun Sign */}
                    {panchangInfo.planets?.find(p => p.name === 'Sun') && (() => {
                      const sunPlanet = panchangInfo.planets.find(p => p.name === 'Sun')!;
                      const remTime = getPlanetRemainingTime(sunPlanet);
                      return (
                        <div className="flex justify-between items-center bg-orange-50/30 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/10 rounded-2xl p-2 px-3 text-left">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-serif">🔆 सूर्य राशि:</span>
                          <div className="flex flex-col items-end">
                            <span className="font-serif font-black text-orange-655 text-xs sm:text-sm">
                              {sunPlanet.signHindi || ''}
                            </span>
                            {remTime && (
                              <span className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">
                                ⏳ {remTime}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Praviste/Gate */}
                    {panchangInfo.hinduDate.praviste !== undefined && (
                      <div className="flex justify-between items-center bg-orange-50/30 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/10 rounded-2xl p-2 px-3 text-left">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold font-serif">📅 प्रविष्टे / गते:</span>
                        <span className="font-serif font-black text-orange-655 text-xs sm:text-sm">
                          {panchangInfo.hinduDate.praviste} प्रविष्टे (गते)
                        </span>
                      </div>
                    )}

                    {/* Disha Shool (Spans full width on desktop) */}
                    {(() => {
                      const dsh = getDishaShoolInfo(selectedDate.getDay());
                      return (
                        <div className="flex items-center bg-rose-50/20 dark:bg-rose-950/5 border border-rose-100/30 dark:border-rose-950/10 rounded-2xl p-2 px-3 text-left gap-2 w-full col-span-1 sm:col-span-2">
                          <span className="text-[10px] text-slate-555 dark:text-slate-400 font-serif leading-relaxed">
                            <strong className="text-slate-700 dark:text-slate-200">🚫 दिशा शूल ({dsh.directionHindi}):</strong> <span className="font-semibold text-rose-600 dark:text-rose-400">निवारण: {dsh.remedyHindi}</span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>

                {/* 3. TODAY'S PANCHANG CARD */}
                <motion.div
                  variants={itemVariants}
                  className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-100/50 dark:border-orange-950/20 rounded-3xl space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center gap-1.5 border-b border-orange-100/20 dark:border-orange-950/10 pb-2">
                    <span className="text-[13px] sm:text-[14px]">📿</span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-amber-100 leading-none font-serif">
                      आज के मुख्य वैदिक अंग
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 select-none">
                    {/* Tithi */}
                    <div className="flex flex-col bg-amber-50/20 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/15 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[96px]">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">तिथि (Tithi)</span>
                      <span className="text-sm sm:text-base font-black font-serif text-orange-655 leading-tight my-1.5 break-words">
                        {panchangInfo.hinduDate.tithi.hindiName}
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 font-sans leading-none">
                        🕒 {panchangInfo.hinduDate.tithi.endTime} तक
                      </span>
                    </div>

                    {/* Nakshatra */}
                    <div className="flex flex-col bg-amber-50/20 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/15 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[96px]">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">नक्षत्र (Nakshatra)</span>
                      <span className="text-sm sm:text-base font-black font-serif text-orange-655 leading-tight my-1.5 break-words">
                        {panchangInfo.hinduDate.nakshatra.hindiName}
                        {panchangInfo.hinduDate.nakshatra.pada ? ` (${panchangInfo.hinduDate.nakshatra.pada} चरण)` : ''}
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 font-sans leading-none">
                        🕒 {panchangInfo.hinduDate.nakshatra.endTime} तक
                      </span>
                    </div>

                    {/* Yoga */}
                    <div className="flex flex-col bg-amber-50/20 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/15 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[96px]">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">योग (Yoga)</span>
                      <span className="text-sm sm:text-base font-black font-serif text-orange-655 leading-tight my-1.5 break-words">
                        {translateYoga(panchangInfo.hinduDate.yoga.hindiName)}
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 font-sans leading-none">
                        🕒 {panchangInfo.hinduDate.yoga.endTime} तक
                      </span>
                    </div>

                    {/* Karana 1 */}
                    <div className="flex flex-col bg-amber-50/20 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/15 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[96px]">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">प्रथम करण</span>
                      <span className="text-sm sm:text-base font-black font-serif text-orange-655 leading-tight my-1.5 break-words">
                        {panchangInfo.hinduDate.karana1 ? translateKarana(panchangInfo.hinduDate.karana1.hindiName) : ''}
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 font-sans leading-none">
                        🕒 {panchangInfo.hinduDate.karana1?.endTime || ''}
                      </span>
                    </div>

                    {/* Karana 2 */}
                    <div className="flex flex-col bg-amber-50/20 dark:bg-orange-950/5 border border-orange-100/30 dark:border-orange-950/15 rounded-2xl p-2.5 sm:p-3 justify-between min-h-[96px] col-span-2 sm:col-span-1">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">द्वितीय करण</span>
                      <span className="text-sm sm:text-base font-black font-serif text-orange-655 leading-tight my-1.5 break-words">
                        {panchangInfo.hinduDate.karana2 ? translateKarana(panchangInfo.hinduDate.karana2.hindiName) : ''}
                      </span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-0.5 font-sans leading-none">
                        🕒 {panchangInfo.hinduDate.karana2?.endTime || ''}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 4. TODAY'S MUHURAT CARD */}
                {(() => {
                  const abhijit = activeMuhurats.find(m => m.id === 'abhijit');
                  const brahma = activeMuhurats.find(m => m.id === 'brahma');

                  return (
                    <motion.div
                      variants={itemVariants}
                      className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-100/50 dark:border-orange-950/20 rounded-3xl space-y-4 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 border-b border-orange-100/20 dark:border-orange-950/10 pb-2">
                        <span className="text-[13px] sm:text-[14px]">⏰</span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-amber-100 leading-none font-serif">
                          आज के मुहूर्त समय (शुभ व वर्जित)
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Shubh Muhurats */}
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1">
                            🟢 शुभ समय (Auspicious)
                          </span>
                          <div className="space-y-1.5">
                            {abhijit && (
                              <div className="flex justify-between items-center bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-2 px-3 text-xs leading-none">
                                <span className="font-serif font-bold text-slate-700 dark:text-slate-300">अभिजीत मुहूर्त</span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-450">{abhijit.startTime} - {abhijit.endTime}</span>
                              </div>
                            )}
                            {brahma && (
                              <div className="flex justify-between items-center bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-2 px-3 text-xs leading-none">
                                <span className="font-serif font-bold text-slate-700 dark:text-slate-300">ब्रह्म मुहूर्त</span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-450">{brahma.startTime} - {brahma.endTime}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Adverse Muhurats */}
                        <div className="space-y-2 text-left">
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest font-mono flex items-center gap-1">
                            🔴 वर्जित समय (Avoid)
                          </span>
                          <div className="space-y-1.5 select-none">
                            <div className="flex justify-between items-center bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 rounded-xl p-2 px-3 text-xs leading-none">
                              <span className="font-serif font-bold text-slate-700 dark:text-slate-300">राहुकाल</span>
                              <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                                {panchangInfo.rahuKaal.start.replace(' AM','').replace(' PM','')}-{panchangInfo.rahuKaal.end.replace(' AM','').replace(' PM','')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-500/5 dark:bg-zinc-950/20 border border-blue-500/10 rounded-xl p-2 px-3 text-xs leading-none">
                              <span className="font-serif font-bold text-slate-700 dark:text-slate-300">यमगण्ड</span>
                              <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                                {panchangInfo.yamagandam?.start.replace(' AM','').replace(' PM','') || ''}-{panchangInfo.yamagandam?.end.replace(' AM','').replace(' PM','') || ''}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-amber-500/5 dark:bg-zinc-950/20 border border-amber-500/10 rounded-xl p-2 px-3 text-xs leading-none">
                              <span className="font-serif font-bold text-slate-700 dark:text-slate-300">गुलिक काल</span>
                              <span className="font-mono font-black text-amber-600 dark:text-amber-450">
                                {panchangInfo.gulikKaal?.start.replace(' AM','').replace(' PM','') || ''}-{panchangInfo.gulikKaal?.end.replace(' AM','').replace(' PM','') || ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}



                {/* 6. FESTIVAL CARD */}
                {(() => {
                  const currentYear = selectedDate.getFullYear();
                  const yearFestivals = getFestivalsForYear(currentYear, coords.latitude, coords.longitude);
                  const todayDateStr = selectedDate.toISOString().split('T')[0];
                  const todayFests = yearFestivals.filter(f => f.date === todayDateStr);

                  const upcomingFest = yearFestivals
                    .filter(f => f.date > todayDateStr)
                    .sort((a, b) => a.date.localeCompare(b.date))[0];

                  const formatFestivalDate = (dateStr: string) => {
                    const d = new Date(dateStr);
                    return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long' });
                  };

                  return (
                    <motion.div
                      variants={itemVariants}
                      className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-100/50 dark:border-orange-950/20 rounded-3xl space-y-4 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 border-b border-orange-100/20 dark:border-orange-950/10 pb-2">
                        <span className="text-[13px] sm:text-[14px]">🎉</span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-amber-100 leading-none font-serif">
                          आज के व्रत एवं त्योहार
                        </h3>
                      </div>

                      {todayFests.length === 0 ? (
                        <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-100/10 rounded-2xl">
                          <span className="text-xl">🪔</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            आज कोई मुख्य व्रत या त्योहार नहीं है।
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {todayFests.map(fest => (
                            <div key={fest.id} className="flex flex-col p-3 bg-amber-500/5 dark:bg-orange-950/10 border border-orange-150/25 dark:border-orange-950/20 rounded-2xl gap-1">
                              <div className="flex justify-between items-center flex-wrap gap-1">
                                <h4 className="text-xs sm:text-sm font-black font-serif text-orange-700 dark:text-orange-350">
                                  {settings.language === 'Hindi' ? fest.hindiName : fest.name}
                                </h4>
                                <span className="text-[8.5px] font-black px-1.5 py-0.5 bg-orange-100 dark:bg-orange-950/40 border border-orange-200 text-orange-850 rounded-md">
                                  {fest.type}
                                </span>
                              </div>
                              {fest.description && (
                                <p className="text-[10.5px] sm:text-[11.5px] leading-normal text-slate-500 dark:text-slate-400 font-sans italic mt-0.5">
                                  {fest.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upcoming Festival */}
                      {upcomingFest && (
                        <div className="border-t border-orange-100/20 dark:border-orange-950/10 pt-3.5 space-y-2">
                          <span className="text-[10px] font-black text-amber-605 dark:text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1">
                            📅 अगला आने वाला व्रत/त्योहार (Upcoming)
                          </span>
                          <div className="flex items-center justify-between p-3 bg-orange-500/5 dark:bg-zinc-950/20 border border-orange-100/10 dark:border-zinc-800/10 rounded-2xl gap-3 text-left">
                            <div className="flex flex-col gap-0.5">
                              <h4 className="text-xs sm:text-sm font-black font-serif text-slate-800 dark:text-orange-200">
                                {settings.language === 'Hindi' ? upcomingFest.hindiName : upcomingFest.name}
                              </h4>
                              <span className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-tight">
                                {upcomingFest.type}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-serif font-black text-orange-655 dark:text-amber-500">
                                {formatFestivalDate(upcomingFest.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })()}

                {/* 7. TODAY'S ALERTS */}
                {(() => {
                  const hasPanchak = panchangInfo.panchak?.active;
                  const hasBhadra = panchangInfo.bhadra?.active;
                  const hasDagda = panchangInfo.dagdaTithi?.isDagda;
                  const hasPushkar = panchangInfo.pushkarYog?.active;
                  const hasAlerts = hasPanchak || hasBhadra || hasDagda || hasPushkar;

                  return (
                    <motion.div
                      variants={itemVariants}
                      className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-100/50 dark:border-orange-950/20 rounded-3xl space-y-3 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 border-b border-orange-100/20 dark:border-orange-950/10 pb-2">
                        <span className="text-[13px] sm:text-[14px]">⚠️</span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-amber-100 leading-none font-serif">
                          आज के ज्योतिषीय अलर्ट
                        </h3>
                      </div>

                      <div className="space-y-2 select-none">
                        {!hasAlerts && (
                          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 dark:border-emerald-900/20 rounded-2xl">
                            <span className="text-xl">🟢</span>
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="text-xs font-serif font-black text-emerald-805 dark:text-emerald-300">
                                कोई प्रतिकूल अलर्ट नहीं
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-sans">
                                आज कोई भद्रा, पंचक या अशुभ तिथि योग सक्रिय नहीं है। दिन सामान्य कार्यों के लिए शुभ है।
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Bhadra Alert */}
                        {hasBhadra && panchangInfo.bhadra && (
                          <div className="flex flex-col p-3 bg-red-500/5 dark:bg-rose-950/10 border border-red-500/20 rounded-2xl gap-1">
                            <span className="text-[10px] font-black text-red-655 dark:text-red-400 uppercase font-mono tracking-wider">भद्रा काल (Bhadra Active)</span>
                            <p className="text-xs font-serif font-black text-slate-800 dark:text-orange-200">
                              भद्रा का निवास: {panchangInfo.bhadra.vasHindi || 'मृत्यु लोक'}
                            </p>
                            <p className="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                              समय सीमा: {panchangInfo.bhadra.startTime} से {panchangInfo.bhadra.endTime} तक। {panchangInfo.bhadra.mukha && `मुख: ${panchangInfo.bhadra.mukha}`} {panchangInfo.bhadra.puchha && `पुच्छ: ${panchangInfo.bhadra.puchha}`}
                            </p>
                          </div>
                        )}

                        {/* Panchak Alert */}
                        {hasPanchak && panchangInfo.panchak && (
                          <div className="flex flex-col p-3 bg-orange-500/5 dark:bg-amber-950/10 border border-orange-500/20 rounded-2xl gap-1">
                            <span className="text-[10px] font-black text-orange-655 dark:text-orange-400 uppercase font-mono tracking-wider">पंचक काल (Panchak Active)</span>
                            <p className="text-xs font-serif font-black text-slate-800 dark:text-orange-200">
                              पंचक का प्रकार: {panchangInfo.panchak.hindiName || 'सामान्य पंचक'}
                            </p>
                            <p className="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                              पंचक काल में शुभ निर्माण कार्य, दक्षिण दिशा यात्रा और कुछ विशिष्ट कार्यों को करने की मनाही होती है।
                            </p>
                          </div>
                        )}

                        {/* Dagda Tithi */}
                        {hasDagda && panchangInfo.dagdaTithi && (
                          <div className="flex flex-col p-3 bg-slate-500/5 dark:bg-zinc-850 border border-slate-500/20 rounded-2xl gap-1">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">दग्ध तिथि योग (Adverse Tithi)</span>
                            <p className="text-xs font-serif font-black text-slate-800 dark:text-orange-200">
                              आज दग्ध तिथि का अशुभ योग है।
                            </p>
                            <p className="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                              महत्वपूर्ण व्यावसायिक सौदों या नए कार्यों के प्रारंभ के लिए इस तिथि को शुभ नहीं माना जाता।
                            </p>
                          </div>
                        )}

                        {/* Pushkar Yoga */}
                        {hasPushkar && panchangInfo.pushkarYog && (
                          <div className="flex flex-col p-3 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl gap-1">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider">पुष्कर योग (Special Auspicious Yoga)</span>
                            <p className="text-xs font-serif font-black text-slate-800 dark:text-orange-200">
                              योग प्रकार: {panchangInfo.pushkarYog.hindiName || 'पुष्कर योग'}
                            </p>
                            <p className="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                              द्विपुष्कर या त्रिपुष्कर योग में किए गए पुण्य, दान और वित्तीय निवेश का प्रभाव बहुगुणित होता है।
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })()}

                {/* 8. MoonPhaseVisualizer */}
                <motion.div variants={itemVariants} className="mt-2">
                  <MoonPhaseVisualizer panchang={panchangInfo} />
                </motion.div>

                

              </motion.div>
            )}

            {/* 2. PANCHANG SCREEN */}
            {activeTab === 'panchang' && (
              <PanchangScreen panchang={panchangInfo} onShare={handleShareDailyPanchang} currentTime={currentTime} language={settings.language} />
            )}

            {/* 3. MUHURAT SCREEN */}
            {activeTab === 'muhurat' && (
              <MuhuratScreen 
                panchang={panchangInfo} 
                onViewAstrologyChart={() => setActiveTab('panchang')} 
                currentTime={currentTime} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                language={settings.language}
              />
            )}

            {/* 4. FESTIVAL SCREEN */}
            {activeTab === 'festival' && (
              <FestivalScreen lat={coords.latitude} lon={coords.longitude} year={selectedDate.getFullYear()} language={settings.language} />
            )}



            {/* 5.5 SADHANA SCREEN */}
            {activeTab === 'sadhana' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Sadhana Header card */}
                <div className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-100/50 dark:border-orange-950/20 rounded-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-orange-655" />
                    <label className="text-xs font-black text-slate-400 dark:text-amber-500 uppercase tracking-widest font-mono">नित्य आराधना व साधना वर्ग</label>
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight font-sans">साधना मार्ग एवं आत्मिक शांति</h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-1 italic">
                    "मन की शुद्धि, मन्त्र एकाग्रता और दिव्य आत्मज्ञान की ओर अग्रसर होने वाले पवित्र साधन।"
                  </p>
                </div>

                {/* Sub-navigation switcher tabs for Sadhana */}
                <div className="grid grid-cols-6 md:grid-cols-5 gap-1.5 sm:gap-2 border-b border-orange-100/35 pb-3">
                  <button
                    onClick={() => setSadhanaSubSection('japa')}
                    className={`col-span-2 md:col-span-1 px-2.5 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                      sadhanaSubSection === 'japa'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>📿</span>
                    <span className="text-center">मन्त्र जाप व ध्यान</span>
                  </button>
                  <button
                    onClick={() => setSadhanaSubSection('lagna')}
                    className={`col-span-2 md:col-span-1 px-2.5 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                      sadhanaSubSection === 'lagna'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🧭</span>
                    <span className="text-center">लाइव लग्न कुंडली</span>
                  </button>
                  <button
                    onClick={() => setSadhanaSubSection('stotra')}
                    className={`col-span-2 md:col-span-1 px-2.5 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                      sadhanaSubSection === 'stotra'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>📖</span>
                    <span className="text-center">आरती व स्तोत्र संग्रह</span>
                  </button>
                  <button
                    onClick={() => setSadhanaSubSection('hora')}
                    className={`col-span-3 md:col-span-1 px-2.5 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                      sadhanaSubSection === 'hora'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>⏰</span>
                    <span className="text-center">लाइव होरा चक्र</span>
                  </button>
                  <button
                    onClick={() => setSadhanaSubSection('poster')}
                    className={`col-span-3 md:col-span-1 px-2.5 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                      sadhanaSubSection === 'poster'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🎨</span>
                    <span className="text-center">पोस्टर मेकर</span>
                  </button>
                </div>

                {/* Sadhana Contents */}
                {sadhanaSubSection === 'japa' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <MantraJapa language={settings.language} />
                  </div>
                )}

                {sadhanaSubSection === 'lagna' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <LiveLagna panchang={panchangInfo} currentTime={currentTime} />
                  </div>
                )}

                {sadhanaSubSection === 'stotra' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <StotraSangrah language={settings.language} />
                  </div>
                )}

                {sadhanaSubSection === 'hora' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <HoraSystem panchang={panchangInfo} currentTime={currentTime} />
                  </div>
                )}

                {sadhanaSubSection === 'poster' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <PosterGenerator panchang={panchangInfo} city={coords.city} />
                  </div>
                )}
              </motion.div>
            )}

            {/* 6. TOOLS & PREVIEWS CONSOLE (WIDGETS, POSTERS, SETTINGS, NOTIFICATIONS) */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                
                {/* Tools sub-navigation switcher tabs (Organized in exactly two clean lines) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-orange-100/35 pb-3">
                  <button
                    onClick={() => setToolsSubSection('widgets')}
                    className={`px-2.5 py-3 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      toolsSubSection === 'widgets'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>📱</span>
                    <span className="text-center font-bold">होम विजेट्स</span>
                  </button>
                  <button
                    onClick={() => setToolsSubSection('picker')}
                    className={`px-2.5 py-3 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      toolsSubSection === 'picker'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>⚙️</span>
                    <span className="text-center font-bold">स्थान व जीपीएस</span>
                  </button>
                  <button
                    onClick={() => setToolsSubSection('plans')}
                    className={`px-2.5 py-3 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      toolsSubSection === 'plans'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>⭐</span>
                    <span className="text-center font-bold">प्रीमियम</span>
                  </button>
                  <button
                    onClick={() => setToolsSubSection('settings')}
                    className={`px-2.5 py-3 rounded-2xl text-[10px] sm:text-[11px] font-black leading-snug transition-all cursor-pointer border flex flex-col items-center justify-center gap-1 ${
                      toolsSubSection === 'settings'
                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-800 border-orange-100 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>⚙️</span>
                    <span className="text-center font-bold">सेटिंग्स</span>
                  </button>
                </div>

                {/* Subsections contents */}
                {toolsSubSection === 'picker' && (
                  <CitySelector
                    currentCoords={coords}
                    onSelectCity={setCoords}
                    gpsActive={gpsActive}
                    setGpsActive={setGpsActive}
                  />
                )}

                {toolsSubSection === 'widgets' && (
                  <WidgetSimulator panchang={panchangInfo} muhurats={activeMuhurats} city={coords.city} />
                )}

                {toolsSubSection === 'plans' && (
                  <MonetizationSimulator
                    settings={settings}
                    onToggleSubscription={handleToggleSubscription}
                    onPushToast={handlePushNotificationToast}
                  />
                )}

                {toolsSubSection === 'settings' && (
                  <SettingsScreen
                    settings={settings}
                    setSettings={setSettings}
                    onPushToast={handlePushNotificationToast}
                  />
                )}

              </div>
            )}

            {/* 7. DEDICATED ALARM & NOTIFICATION SIMULATOR PAGE */}
            {activeTab === 'alerts' && (
              <motion.div
                initial="hidden"
                animate="show"
                variants={itemVariants}
                className="space-y-6"
              >
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-orange-100 flex items-center gap-2">
                      धर्मिक एवं साधना अलार्म (Alarms & Alerts)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    संध्या वंदन, शुभ लग्न, अभिजित मुहूर्त, राहुकाल और चौघड़िया के लिए अनुकूलित अलार्म सेटिंग्स
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                  <NotificationSimulator
                    notificationsList={notificationsList}
                    setNotificationsList={setNotificationsList}
                    onPushToast={handlePushNotificationToast}
                  />
                </div>
              </motion.div>
            )}

          </main>

          {/* BOTTOM PREMIUM TAB BAR NAVIGATION */}
          <footer className={`border-t flex justify-between sm:justify-around items-center py-2 px-1 sm:px-3 fixed bottom-0 left-0 right-0 w-full z-40 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] overflow-x-auto scrollbar-hide flex-nowrap ${
            settings.theme === 'light' 
              ? 'bg-[#FFFBF5]/95 backdrop-blur-md border-orange-100/70' 
              : 'bg-[#1D1713]/95 backdrop-blur-md border-[var(--card-border-dark)]' // using dark card border variables
          }`}>
            
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'home'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Home className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">{getTranslation(settings.language, 'homeTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('panchang')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'panchang'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Landmark className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">{getTranslation(settings.language, 'panchangTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('muhurat')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'muhurat'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Clock className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">{getTranslation(settings.language, 'muhuratTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('festival')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'festival'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Calendar className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">{getTranslation(settings.language, 'festivalTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('sadhana')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'sadhana'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">{getTranslation(settings.language, 'sadhanaTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'alerts'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">{getTranslation(settings.language, 'alarmsTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'tools'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">{getTranslation(settings.language, 'toolsTab')}</span>
            </button>

          </footer>

        </div>

        {/* Outer footer branding */}
        <div className="hidden md:block mt-4 text-center select-none mb-6">
          <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono font-bold">
            आज का धर्मिक समय प्रीमियम v2.4.0
          </p>
          <span className="text-[9px] text-slate-400 mt-0.5 block italic font-sans font-medium">
            प्राचीन सूर्य सिद्धांत और सटीक सौर गणनाओं द्वारा स्थापित।
          </span>
        </div>

      </div>

      
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentCoords={coords}
        onSelectCity={setCoords}
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
