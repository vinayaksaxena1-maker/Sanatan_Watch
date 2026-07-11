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
  Minus
} from 'lucide-react';

import { Coords, SettingsState, AppNotification, ChoghadiyaInterval, HoraInterval } from './types';
import { getPanchangForDate, getMuhuratsForPanchang, getChoghadiyaPresentationData } from './utils/panchangCalc';

import { registerEngineListener, isReady } from './utils/astronomicalEngine';



// Subcomponents
import { ChaughadiyaRing } from './components/ChaughadiyaRing';
import { HoraRing } from './components/HoraRing';

import { LiveMuhuratWatch } from './components/LiveMuhuratWatch';
import { PanchangScreen } from './components/PanchangScreen';
import { MuhuratScreen } from './components/MuhuratScreen';
import { FestivalScreen } from './components/FestivalScreen';
import { NakshatraScreen } from './components/NakshatraScreen';
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
import { SacredBanner } from './components/SacredBanner';
import { SanatanTimeWheel } from './components/SanatanTimeWheel';
import { MoonPhaseVisualizer } from './components/MoonPhaseVisualizer';

// Hindu Dharmik Sacred Additions
import { MantraJapa } from './components/MantraJapa';
import { LiveLagna } from './components/LiveLagna';
import { StotraSangrah } from './components/StotraSangrah';
import dialBg from './components/VintageDialBackground.png';

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
  language: 'English',
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
  customSplash: '/Splash.01.mp4'
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
        setSettings(JSON.parse(cachedSettings));
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
        document.documentElement.classList.remove('temple');
      } else if (settings.theme === 'temple') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.add('temple');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.remove('temple');
      }
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
        icon: <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        colorClass: 'border-emerald-200/50 dark:border-emerald-950/40 bg-emerald-50/65 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-300',
        tooltip: `शुभ चौघड़िया: ${label} (उत्तम/शुभ समय) - Click to toggle format`
      };
    } else if (quality === 'Inauspicious' || quality === 'Bad') {
      return {
        icon: <TrendingDown className="w-3 h-3 text-rose-600 dark:text-rose-450 shrink-0" />,
        colorClass: 'border-rose-200/50 dark:border-rose-950/40 bg-rose-50/65 dark:bg-rose-950/25 text-rose-850 dark:text-rose-350',
        tooltip: `अशुभ चौघड़िया: ${label} (वर्जित/अशुभ समय) - Click to toggle format`
      };
    } else {
      return {
        icon: <Minus className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />,
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
          <header className={`p-5 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
            settings.theme === 'light' ? 'bg-orange-50/20 border-orange-100' : 'bg-orange-950/10 border-orange-950/20'
          }`}>
            <div className="flex items-center justify-between w-full md:w-auto gap-4 text-left">
              <div className="flex items-center gap-3">
                <SacredLogoIcon style={settings.logoStyle || 'om'} size="md" customLogo={settings.customLogo} />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-black text-orange-900 dark:text-amber-100 tracking-tight font-serif leading-4 uppercase flex items-center gap-1.5">
                      आज का धर्मिक समय
                      <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    </h1>
                    
                    {/* Help Button placed at the right of the H1 Title heading */}
                    <button 
                      id="header_help_button"
                      onClick={() => setIsHelpOpen(true)}
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 bg-[#ea580c] hover:bg-orange-650 text-white cursor-pointer select-none transition-all duration-300 shadow-3xs group shrink-0"
                      title="मदद और मार्गदर्शिका"
                    >
                      <HelpCircle className="w-3 h-3 text-orange-100 group-hover:rotate-12 transition-transform" />
                      <span className="text-[10px] font-black tracking-tight font-sans whitespace-nowrap leading-none">
                        सहायता
                      </span>
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider font-mono">हिन्दू पंचांग और चौघड़िया</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Location and Clock stats */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2.5 items-center w-full md:w-auto justify-between md:justify-end">
              <div 
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 bg-orange-100/50 border border-orange-200/30 hover:bg-orange-200/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none"
                title="स्थान बदलें (Change Location)"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="text-3xs font-extrabold text-orange-900 uppercase font-mono tracking-tight leading-none truncate max-w-[120px]">
                  {coords.city}
                </span></div>

              {/* Precise clock */}
              <div 
                id="header_clock_wrapper"
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-slate-100 dark:bg-stone-900/60 border border-slate-200 dark:border-zinc-800/40 select-none transition-all duration-300 shadow-3xs shrink-0"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500 transition-colors drop-shadow-3xs" />
                <span 
                  className="text-3xs font-black text-slate-700 dark:text-slate-300 tracking-tight font-mono whitespace-nowrap leading-none [text-shadow:0_1px_1px_rgba(0,0,0,0.12)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
                >
                  {formattedClockStr}
                </span>
                {trendInfo.icon && (
                  <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md border text-[9px] font-black leading-none shadow-3xs hover:shadow-2xs transition-shadow duration-300 ${trendInfo.colorClass}`}>
                    {trendInfo.icon}
                    <span className="font-serif [text-shadow:0_0.5px_1px_rgba(255,255,255,0.45)] dark:[text-shadow:0_0.5px_1px_rgba(0,0,0,0.35)]">{activeChoghadiya?.hindiName}</span>
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* MAIN CONTAINER PREVIEW SCREEN */}
          <main className="p-4 flex-grow flex-1 min-h-[460px] pb-24 md:pb-4">
            
            {/* 1. HOME SCREEN */}
            {activeTab === 'home' && (
              <motion.div 
                id="home_screen_container" 
                className="space-y-4 sm:space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {/* Custom Spiritual Smartwatch Banner */}
                <motion.div variants={itemVariants}>
                  <SacredBanner />
                </motion.div>

                {/* Spiritual Welcome Banner card */}
                <motion.div 
                  variants={itemVariants}
                  className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left flex flex-col gap-4 relative"
                >
                  {/* Share Button in Top-Right Corner */}
                  <button
                    onClick={handleShareDailyPanchang}
                    className="absolute top-4 right-4 flex flex-col items-center justify-center gap-0.5 p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-[#ea580c] dark:text-orange-400 border border-orange-500/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-3xs"
                    title="पंचांग साझा करें (Share Daily Panchang)"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                    <span className="text-[9px] font-black tracking-tight leading-none uppercase">साझा करें</span>
                  </button>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 block">॥ नमस्कार ॥</span>
                        {panchangInfo.hinduDate.ayana && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                            panchangInfo.hinduDate.ayana === 'Uttarayana'
                              ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-350'
                              : 'bg-indigo-100 dark:bg-indigo-950/40 border-indigo-300 text-indigo-850 dark:text-indigo-350'
                          } font-sans uppercase tracking-wider flex items-center gap-0.5 shadow-3xs`}>
                            {panchangInfo.hinduDate.ayana === 'Uttarayana' ? '🌞 उत्तरायण' : '🌙 दक्षिणायन'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-amber-100">आध्यात्मिक दिन में आपका स्वागत है</h2>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 max-w-xl">
                        दैनिक ग्रहों की शुभता और सटीक सूर्य सिद्धांत गणनाओं के साथ जुड़ें।
                      </p>
                    </div>
                    
                    {/* Right side container: Today's Date Badge (Static) */}
                    <div className="flex-grow flex items-center gap-2 bg-white/75 dark:bg-zinc-900/60 p-2 px-3 rounded-xl border border-orange-100 dark:border-orange-950/40 shadow-xs relative min-w-0 select-none">
                      <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                      <div className="min-w-0 pr-1 text-left">
                        <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase tracking-wider block">आज की तिथि (Today)</span>
                        <span className="text-3xs sm:text-2xs font-extrabold text-[#9A3412] dark:text-orange-200 font-sans block truncate leading-none mt-0.5 whitespace-nowrap">
                          {formattedDateStr}
                        </span>
                      </div>
                    </div>

                    {/* New Three Part Box: Tithi, Nakshatra, Yoga */}
                    <div className="flex flex-col bg-amber-50/20 dark:bg-orange-950/10 border border-orange-100/60 dark:border-orange-950/25 rounded-xl p-2 sm:p-2.5 text-center w-full select-none gap-2">
                      <div className="flex justify-between items-center px-1 border-b border-orange-100/20 dark:border-orange-950/10 pb-1.5 pl-2">
                        <span className="text-[9.5px] sm:text-[10.5px] font-extrabold text-[#9A3412] dark:text-orange-300 uppercase tracking-wider font-serif flex items-center gap-1.5">
                          📿 आज के वैदिक अंग
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {/* Part 1: Current Tithi */}
                        <div className="flex flex-col items-center justify-between border-r border-orange-100/30 dark:border-orange-950/20 px-1 py-1 min-w-0 min-h-[98px] sm:min-h-[110px]">
                          <span className="text-[9.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider uppercase leading-none">तिथि</span>
                          <span className="text-[12.5px] sm:text-[14.5px] font-black font-serif text-orange-600 dark:text-orange-400 leading-tight my-1 break-words w-full" title={panchangInfo.hinduDate.tithi.hindiName}>
                            {panchangInfo.hinduDate.tithi.hindiName}
                          </span>
                          <span className="text-[9px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight w-full break-words font-medium">
                            {panchangInfo.hinduDate.paksha === 'Shukla' || panchangInfo.hinduDate.paksha.toLowerCase().includes('shukla') ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'}
                          </span>
                        </div>

                        {/* Part 2: Nakshatra */}
                        <div className="flex flex-col items-center justify-between border-r border-orange-100/30 dark:border-orange-950/20 px-1 py-1 min-w-0 min-h-[98px] sm:min-h-[110px]">
                          <span className="text-[9.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider uppercase leading-none">नक्षत्र</span>
                          <span className="text-[12.5px] sm:text-[14.5px] font-black font-serif text-orange-600 dark:text-orange-400 leading-tight my-1 break-words w-full" title={panchangInfo.hinduDate.nakshatra.hindiName}>
                            {panchangInfo.hinduDate.nakshatra.hindiName}
                          </span>
                          <span className="text-[9px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight w-full break-words font-medium">
                            |स्वामी: {translateLord(panchangInfo.hinduDate.nakshatra.lord || 'सूर्य')}
                          </span>
                        </div>

                        {/* Part 3: Yoga */}
                        <div className="flex flex-col items-center justify-between px-1 py-1 min-w-0 min-h-[98px] sm:min-h-[110px]">
                          <span className="text-[9.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-extrabold tracking-wider uppercase leading-none">योग</span>
                          <span className="text-[12.5px] sm:text-[14.5px] font-black font-serif text-orange-600 dark:text-orange-400 leading-tight my-1 break-words w-full" title={panchangInfo.hinduDate.yoga.hindiName}>
                            {translateYoga(panchangInfo.hinduDate.yoga.hindiName)}
                          </span>
                          <span className="text-[9px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight w-full break-words font-medium">
                            |करण: {translateKarana(panchangInfo.hinduDate.karana.hindiName)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* New Additional Metrics: Sunrise & Month Details */}
                    <div className="grid grid-cols-2 gap-2 w-full select-none">
                      {/* Section 1: सूर्योदय (Sunrise & Astro Metrics) */}
                      <div className="flex flex-col bg-orange-50/20 dark:bg-orange-950/5 border border-orange-100/50 dark:border-orange-950/20 rounded-xl p-2.5 sm:p-3 text-left min-h-[142px] sm:min-h-[158px] justify-between">
                        <div className="flex items-center gap-1 mb-1 border-b border-orange-100/30 dark:border-orange-950/10 pb-1">
                          <span className="text-[11px] sm:text-[12px]">🌅</span>
                          <span className="text-[10px] sm:text-[11px] font-black text-orange-955 dark:text-orange-200 uppercase tracking-wider font-serif">सूर्योदय व खगोल</span>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">सूर्योदय:</span>
                            <span className="font-mono font-bold text-orange-700 dark:text-orange-350 break-words text-right">{panchangInfo.sunrise}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">सूर्यास्त:</span>
                            <span className="font-mono font-bold text-orange-700 dark:text-orange-350 break-words text-right">{panchangInfo.sunset}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9.5px] sm:text-[10.5px] gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">राहू काल:</span>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 break-words text-right" title={`${panchangInfo.rahuKaal.start} - ${panchangInfo.rahuKaal.end}`}>
                              {panchangInfo.rahuKaal.start.replace(' AM','').replace(' PM','')}-{panchangInfo.rahuKaal.end.replace(' AM','').replace(' PM','')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[9.5px] sm:text-[10.5px] gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">गुलिक काल:</span>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 break-words text-right">
                              {panchangInfo.gulikKaal?.start.replace(' AM','').replace(' PM','') || ''}-{panchangInfo.gulikKaal?.end.replace(' AM','').replace(' PM','') || ''}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[9.5px] sm:text-[10.5px] gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">यमगण्ड:</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 break-words text-right">
                              {panchangInfo.yamagandam?.start.replace(' AM','').replace(' PM','') || ''}-{panchangInfo.yamagandam?.end.replace(' AM','').replace(' PM','') || ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: हिन्दू मास (Month & Samvat Metrics) */}
                      <div className="flex flex-col bg-orange-50/20 dark:bg-orange-950/5 border border-orange-100/50 dark:border-orange-950/20 rounded-xl p-2.5 sm:p-3 text-left min-h-[142px] sm:min-h-[158px] justify-between">
                        <div className="flex items-center gap-1 mb-1 border-b border-orange-100/30 dark:border-orange-950/10 pb-1">
                          <span className="text-[11px] sm:text-[12px]">🌙</span>
                          <span className="text-[10px] sm:text-[11px] font-black text-orange-955 dark:text-orange-200 uppercase tracking-wider font-serif">हिन्दू मास व संवत्</span>
                        </div>
                        <div className="space-y-1 sm:space-y-1.5 justify-center flex flex-col h-full">
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] min-w-0 gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">मास:</span>
                            <span className="font-serif font-bold text-orange-700 dark:text-orange-350 ml-1 break-words text-right">
                              {panchangInfo.hinduDate.monthHindi}
                              {panchangInfo.hinduDate.isLeapMonth ? ' (अधिमास)' : ''}
                            </span>
                          </div>
                          {panchangInfo.hinduDate.solarMonth && (
                            <div className="flex justify-between items-center text-[10px] sm:text-[11px] min-w-0 gap-1">
                              <span className="text-slate-500 dark:text-slate-400 shrink-0">सौर मास:</span>
                              <span className="font-serif font-bold text-orange-700 dark:text-orange-350 ml-1 break-words text-right">{panchangInfo.hinduDate.solarMonth}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] min-w-0 gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">ऋतु:</span>
                            <span className="font-serif font-bold text-orange-700 dark:text-orange-350 ml-1 break-words text-right">
                              {((): string => {
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
                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] min-w-0 gap-1">
                            <span className="text-slate-500 dark:text-slate-400 shrink-0">वि. संवत्:</span>
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-350 ml-1 break-words text-right">{panchangInfo.hinduDate.samvatVikram}</span>
                          </div>
                          {(() => {
                            const dsh = getDishaShoolInfo(selectedDate.getDay());
                            return (
                              <>
                                <div className="flex justify-between items-center text-[10px] sm:text-[11px] min-w-0 gap-1">
                                  <span className="text-slate-500 dark:text-slate-400 shrink-0">दिशा शूल:</span>
                                  <span className="font-serif font-bold text-red-600 dark:text-red-400 ml-1 break-words text-right">{dsh.directionHindi}</span>
                                </div>
                                <div className="flex justify-between items-start text-[9.5px] sm:text-[10.5px] min-w-0 gap-1 border-t border-dotted border-orange-100/30 pt-1 mt-0.5">
                                  <span className="text-slate-500 dark:text-slate-400 shrink-0">शूल निवारण:</span>
                                  <span className="font-serif font-bold text-emerald-600 dark:text-emerald-400 ml-1 text-right text-[9px] sm:text-[10px] leading-tight max-w-[65%] break-words">{dsh.remedyHindi}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>

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

                {/* Interactive Moon Phase Orbit Visualizer */}
                <motion.div variants={itemVariants} className="mt-2">
                  <MoonPhaseVisualizer panchang={panchangInfo} />
                </motion.div>

                {/* Personalized Muhurat (Tara Bala & Chandra Bala) Card */}
                <motion.div 
                  variants={itemVariants}
                  className="glass-card-light dark:glass-card-dark p-4 sm:p-5 text-left border border-orange-100/50 dark:border-orange-950/20 rounded-3xl space-y-4 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-orange-100/20 dark:border-orange-950/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      <div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-amber-500 uppercase tracking-widest font-mono">व्यक्तिगत मुहूर्त विश्लेषण</span>
                        <h3 className="text-base font-bold text-slate-800 dark:text-amber-100 leading-tight">ताराबल एवं चन्द्रबल (Tara Bala & Chandra Bala)</h3>
                      </div>
                    </div>
                  </div>

                  {/* Input Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">अपना जन्म नक्षत्र चुनें (Birth Nakshatra)</span>
                      <select
                        value={birthNakshatraIdx}
                        onChange={(e) => setBirthNakshatraIdx(parseInt(e.target.value, 10))}
                        className="text-xs p-2.5 rounded-xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/60 text-slate-800 dark:text-slate-100 focus:outline-none"
                      >
                        {NAKSHATRAS_LIST.map((name, idx) => (
                          <option key={idx} value={idx}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">अपनी जन्म राशि चुनें (Birth Moon Sign)</span>
                      <select
                        value={birthRashiIdx}
                        onChange={(e) => setBirthRashiIdx(parseInt(e.target.value, 10))}
                        className="text-xs p-2.5 rounded-xl bg-slate-500/5 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/60 text-slate-800 dark:text-slate-100 focus:outline-none"
                      >
                        {RASHIS_LIST.map((rashi, idx) => (
                          <option key={idx} value={idx}>{rashi.hin}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculation Output Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Tara Bala Result */}
                    {(() => {
                      const currentNaksIdx = panchangInfo.hinduDate.nakshatra.value - 1;
                      const taraBalaIdx = ((currentNaksIdx - birthNakshatraIdx + 9) % 9) + 1;
                      const taraBalaDetails = [
                        { name: "Janma Tara (जन्म)", quality: "Inauspicious / Average", desc: "शारीरिक ऊर्जा के प्रति सचेत रहें। लंबी यात्रा या नए कार्यों को टालें। दान-पुण्य शुभ।", color: "border-rose-250 bg-rose-50/40 text-rose-800 dark:bg-rose-950/10 dark:text-rose-300" },
                        { name: "Sampat Tara (सम्पाद)", quality: "Highly Auspicious", desc: "धन लाभ, व्यवसाय वृद्धि और समृद्धि की दिशा में प्रयास करने का सर्वोत्तम समय।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        { name: "Vipat Tara (विपत्)", quality: "Inauspicious", desc: "कार्यों में विघ्न या हानि का भय। जोखिम भरे कार्यों एवं महत्वपूर्ण यात्रा से बचें।", color: "border-rose-250 bg-rose-50/40 text-rose-800 dark:bg-rose-950/10 dark:text-rose-300" },
                        { name: "Kshema Tara (क्षेम)", quality: "Auspicious", desc: "सुरक्षा, संरक्षण और सुखद यात्राओं के लिए उत्तम समय। घरेलू कार्यों के लिए अनुकूल।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        { name: "Pratyak Tara (प्रत्यरि)", quality: "Inauspicious", desc: "शत्रु बाधा या विवाद की आशंका। आज किसी से बहस या नई साझीदारी न करें।", color: "border-amber-250 bg-amber-50/40 text-amber-800 dark:bg-amber-950/10 dark:text-amber-300" },
                        { name: "Sadhana Tara (साधना)", quality: "Highly Auspicious", desc: "मन्त्र साधना, शिक्षा प्राप्ति, साक्षात्कार और गंभीर योजनाओं के लिए सर्वोत्तम।", color: "border-teal-250 bg-teal-50/40 text-teal-800 dark:bg-teal-950/10 dark:text-teal-300" },
                        { name: "Naidhana Tara (निधन)", quality: "Highly Inauspicious", desc: "गंभीर कष्ट या हानि की चेतावनी। किसी भी प्रकार के नए उद्यम या निवेश को पूरी तरह टालें।", color: "border-red-250 bg-red-50/40 text-red-800 dark:bg-red-950/10 dark:text-red-300" },
                        { name: "Mitra Tara (मित्र)", quality: "Auspicious", desc: "मित्रों से सहयोग, सुखद संवाद और सामाजिक मेलजोल बढ़ाने के लिए उत्कृष्ट दिन।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        { name: "Parama Mitra Tara (परम मित्र)", quality: "Highly Auspicious", desc: "अत्यंत अनुकूल परिणाम। महत्वपूर्ण निर्णयों, सम्मेलनों और सौदों के लिए श्रेष्ठ।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" }
                      ][taraBalaIdx - 1];

                      return (
                        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-1.5 ${taraBalaDetails.color}`}>
                          <div className="flex justify-between items-center border-b border-orange-100/10 pb-1">
                            <span className="text-2xs font-extrabold uppercase font-mono tracking-wider">ताराबल (Tara Bala)</span>
                            <span className="text-[10px] font-black">{taraBalaDetails.quality}</span>
                          </div>
                          <h4 className="text-sm font-black font-serif leading-none mt-1">{taraBalaDetails.name}</h4>
                          <p className="text-[10.5px] leading-snug font-sans opacity-90">{taraBalaDetails.desc}</p>
                        </div>
                      );
                    })()}

                    {/* Chandra Bala Result */}
                    {(() => {
                      const moonPlanet = panchangInfo.planets?.find(p => p.name === 'Moon');
                      const currentMoonRashiIdx = moonPlanet 
                        ? RASHIS_LIST.findIndex(r => r.eng === moonPlanet.sign)
                        : Math.floor((panchangInfo.hinduDate.nakshatra.value - 1) * 27 / 12) % 12;

                      const distance = (currentMoonRashiIdx - birthRashiIdx + 12) % 12 + 1;
                      
                      const chandraBalaDetails = ({
                        1: { quality: "शुभ (Auspicious)", desc: "उत्तम स्वास्थ्य, मानसिक शांति और नए वस्त्र व भोजन का आनंद प्राप्त होता है।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        2: { quality: "मध्यम (Neutral - Worship Shiva)", desc: "वित्तीय लेन-देन में सतर्कता रखें। भगवान शिव की आराधना से बाधाएं टलेंगी।", color: "border-amber-250 bg-amber-50/40 text-amber-800 dark:bg-amber-950/10 dark:text-amber-300" },
                        3: { quality: "शुभ (Auspicious)", desc: "पराक्रम में वृद्धि, शत्रुओं पर विजय और कार्यों में पूर्ण सफलता का योग।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        4: { quality: "वर्जित (Inauspicious)", desc: "पारिवारिक कलह या गृह क्लेश की आशंका। मन अशान्त रहेगा। आज महत्वपूर्ण निर्णय न लें।", color: "border-rose-250 bg-rose-50/40 text-rose-800 dark:bg-rose-950/10 dark:text-rose-300" },
                        5: { quality: "मध्यम (Neutral - Worship Ganesha)", desc: "बौद्धिक कार्यों में रूकावटें आ सकती हैं। गणेश जी को दूर्वा चढ़ाकर कार्य शुरू करें।", color: "border-amber-250 bg-amber-50/40 text-amber-800 dark:bg-amber-950/10 dark:text-amber-300" },
                        6: { quality: "शुभ (Auspicious)", desc: "शारीरिक निरोगिता, विवादों में विजय और कर्ज से मुक्ति मिलने का उत्तम दिन।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        7: { quality: "शुभ (Auspicious)", desc: "साझेदारी में लाभ, जीवनसाथी का भरपूर सहयोग और सुखद यात्रा संभव।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        8: { quality: "वर्जित (Highly Inauspicious)", desc: "चोट-चपेट या आकस्मिक हानि का प्रबल योग। वाहन चलाते समय विशेष सावधानी रखें।", color: "border-red-250 bg-red-50/40 text-red-800 dark:bg-red-950/10 dark:text-red-300" },
                        9: { quality: "मध्यम (Neutral - Worship Vishnu)", desc: "धार्मिक यात्रा या पूजन के लिए अच्छा है। भगवान विष्णु की पूजा से समृद्धि होगी।", color: "border-amber-250 bg-amber-50/40 text-amber-800 dark:bg-amber-950/10 dark:text-amber-300" },
                        10: { quality: "शुभ (Auspicious)", desc: "नौकरी व व्यवसाय में विशेष तरक्की। कार्यों में सरकारी बाधाएं दूर होंगी।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        11: { quality: "शुभ (Auspicious)", desc: "हर ओर से लाभ एवं प्रसन्नता। निवेश से आशातीत रिटर्न और सुखद समाचार प्राप्ति।", color: "border-emerald-250 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-300" },
                        12: { quality: "वर्जित (Inauspicious)", desc: "अत्यधिक अनायास खर्च और मानसिक तनाव। व्यर्थ की यात्राओं में समय नष्ट हो सकता है।", color: "border-rose-250 bg-rose-50/40 text-rose-800 dark:bg-rose-950/10 dark:text-rose-300" }
                      } as Record<number, { quality: string; desc: string; color: string }>)[distance] || { quality: "Neutral", desc: "", color: "" };

                      return (
                        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-1.5 ${chandraBalaDetails.color}`}>
                          <div className="flex justify-between items-center border-b border-orange-100/10 pb-1">
                            <span className="text-2xs font-extrabold uppercase font-mono tracking-wider">चन्द्रबल (Chandra Bala)</span>
                            <span className="text-[10px] font-black">{chandraBalaDetails.quality}</span>
                          </div>
                          <h4 className="text-sm font-black font-serif leading-none mt-1">गोचर में चन्द्र {distance}वें स्थान पर</h4>
                          <p className="text-[10.5px] leading-snug font-sans opacity-90">{chandraBalaDetails.desc}</p>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>

                

              </motion.div>
            )}

            {/* 2. PANCHANG SCREEN */}
            {activeTab === 'panchang' && (
              <PanchangScreen panchang={panchangInfo} onShare={handleShareDailyPanchang} currentTime={currentTime} />
            )}

            {/* 3. MUHURAT SCREEN */}
            {activeTab === 'muhurat' && (
              <MuhuratScreen 
                panchang={panchangInfo} 
                onViewAstrologyChart={() => setActiveTab('panchang')} 
                currentTime={currentTime} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            )}

            {/* 4. FESTIVAL SCREEN */}
            {activeTab === 'festival' && (
              <FestivalScreen lat={coords.latitude} lon={coords.longitude} year={selectedDate.getFullYear()} />
            )}

            {/* 5. NAKSHATRA SCREEN */}
            {activeTab === 'nakshatra' && (
              <NakshatraScreen />
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
                    <MantraJapa />
                  </div>
                )}

                {sadhanaSubSection === 'lagna' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <LiveLagna panchang={panchangInfo} currentTime={currentTime} />
                  </div>
                )}

                {sadhanaSubSection === 'stotra' && (
                  <div className="p-4 bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 rounded-3xl shadow-3xs">
                    <StotraSangrah />
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">मुख्य</span>
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase font-semibold">पंचांग</span>
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">मुहूर्त</span>
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">त्योहार</span>
            </button>

            <button
              onClick={() => setActiveTab('nakshatra')}
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl cursor-pointer w-11 sm:w-14 transition-all flex-shrink-0 ${
                activeTab === 'nakshatra'
                  ? 'text-orange-655 font-extrabold scale-102 bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              <Map className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">नक्षत्र</span>
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">साधना</span>
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">अलार्म</span>
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
              <span className="text-[9px] mt-1 font-mono tracking-tight leading-none uppercase">सुविधाएं</span>
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
      />

    </div>
  );
}
