import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Home,
  Landmark,
  Clock,
  Calendar,
  Map,
  Settings,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Info,
  CheckCircle,
  TrendingUp,
  Sliders,
  Tv
} from 'lucide-react';
import { getTranslation, Language } from '../utils/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  language?: Language;
}

interface FaqItem {
  q: string;
  a: string;
  tags: string[];
}

const FAQS: Record<Language, FaqItem[]> = {
  English: [
    {
      q: "How does the Panchang calculation work in this app?",
      a: "All astronomical calculations in this app are based on the ancient 'Surya Siddhanta' and precise Rishikesh Panchang rules. It computes the actual sunrise and sunset times according to your selected coordinates (latitude/longitude), giving you the most accurate Muhurat timings for your specific city.",
      tags: ["Panchang", "Accuracy"]
    },
    {
      q: "What does the circular gauge on the home screen represent?",
      a: "This is a Tithi Progress Gauge. It shows the proportion of the current Tithi that has already elapsed (in percentage). You can see the start and end times below the gauge, making it easy to determine the exact timings for fasts and parana.",
      tags: ["Tithi", "Home"]
    },
    {
      q: "What are Choghadiya and live Muhurats, and what do the colors mean?",
      a: "Choghadiya represents the 8 daytime and 8 nighttime planetary hour divisions. \n🟢 Shubh (Green), Amrit, and Chachal are auspicious for beginning new work or travel. \n🔴 Rog, Udveg, and Kaal (Red) are inauspicious periods, which should be avoided for starting auspicious tasks. \n🟡 Chachal and Samanya are neutral or medium/average periods.",
      tags: ["Muhurat", "Choghadiya"]
    },
    {
      q: "Can I view the Panchang for a different city?",
      a: "Yes! Click the location indicator or pin icon 📍 in the header. From there, you can choose from popular Indian cities (e.g., Delhi, Varanasi, Mumbai, Pune). The app will immediately update all Panchang parameters using the coordinates of the selected city.",
      tags: ["Location", "Panchang"]
    },
    {
      q: "What is the significance of Nakshatra, Yoga, and Karana in Panchang?",
      a: "According to Vedic sages, these are the 5 limbs (Panchang) of time:\n1. Tithi: For auspicious actions, fasts, and festivals.\n2. Vaar: For planetary strength.\n3. Nakshatra: For determining behavior, thought process, and auspicious travel directions.\n4. Yoga: For health and favorable activities.\n5. Karana: For success in everyday tasks.",
      tags: ["Panchang", "Astrology"]
    },
    {
      q: "How do I switch between the Digital and Analog clock face?",
      a: "Simply tap anywhere on the header clock or go to Settings to change the 'Header Clock Type'. This allows you to toggle between a beautiful classical rotating-hand analog face and a modern digital layout.",
      tags: ["Clock", "Design"]
    }
  ],
  Hindi: [
    {
      q: "इस एप में पंचांग की गणना कैसे होती है?",
      a: "एप में सभी खगोलीय गणनाएं प्राचीन 'सूर्य सिद्धांत' और सटीक ऋषिकेशीय पंचांग नियमों पर आधारित हैं। इसमें आपके चयनित स्थान (अक्षांश/रेखांश) के अनुसार वास्तविक सूर्योदय और सूर्यास्त का समय निकाला जाता है, जिससे आपके शहर का बिल्कुल सटीक मुहूर्त समय दिखाई देता है।",
      tags: ["पंचांग", "सटीकता"]
    },
    {
      q: "मुख्य स्क्रीन पर दिख रही 'वर्तमान तिथि' गोल डायल क्या दर्शाता है?",
      a: "यह एक विजुअल प्रोग्रेस गेज (Tithi Gauge) है। यह दर्शाता है कि वर्तमान तिथि का कितना भाग (प्रतिशत में) बीत चुका है। आप इसके नीचे तिथि आरंभ और समाप्ति का सही समय देख सकते हैं, जिससे व्रत या व्रत खोलने के समय का निर्धारण आसान हो जाता है।",
      tags: ["तिथि", "होम"]
    },
    {
      q: "चौघड़िया और लाइव मुहूर्त क्या है, और इसके रंगों का क्या मतलब है?",
      a: "चौघड़िया दिन और रात के 8-8 समय विभागों का चक्र है।\n🟢 शुभ (हरा), अमृत और चंचल अनुकूल काम या यात्रा के लिए श्रेष्ठ हैं।\n🔴 रोग, उद्वेग और काल (लाल) प्रतिकूल समय हैं, जिसमें शुभ कार्य शुरू करने से बचना चाहिए।\n🟡 चंचल और सामान्य समय मध्यम फलदाई होते हैं।",
      tags: ["मुहूर्त", "चौघड़िया"]
    },
    {
      q: "क्या मैं दूसरे शहर का पंचांग देख सकता हूँ?",
      a: "हाँ! हेडर में दिख रहे 'स्थान वाले बटन' या पिन आइकॉन 📍 पर क्लिक करें। वहां से आप भारत के लोकप्रिय शहरों (जैसे दिल्ली, वाराणसी, मुंबई, पुणे) में से किसी एक को चुन सकते हैं। एप तुरंत उस शहर के अक्षांश के अनुसार पंचांग को अपडेट कर देगा।",
      tags: ["स्थान", "पंचांग"]
    },
    {
      q: "पंचांग में नक्षत्र, योग और करण का क्या महत्व है?",
      a: "ऋषियों के अनुसार पंचांग के ये ५ अंग हैं:\n१. तिथि: शुभ कार्यों, व्रत और उत्सवों के लिए।\n२. वार: ग्रहों के बल के लिए।\n३. नक्षत्र: जातक के व्यवहार, विचार और शुभ दिशा के निर्णय के लिए।\n४. योग: स्वास्थ्य और अनुकूल कार्यों के लिए।\n५. करण: दैनिक कर्मों की सिद्धि के लिए।",
      tags: ["पंचांग", "ज्योतिष"]
    },
    {
      q: "डिजिटल और एनालॉग घड़ी के बीच कैसे बदलें?",
      a: "हेडर में घड़ी पर कहीं भी टैप (Tap) करें या सेटिंग्स मेनू में जाकर 'हेडर घड़ी का प्रकार' बदलें। इससे आप उत्कृष्ट घूमती सुई वाली एनालॉग घड़ी या मॉडर्न डिजिटल घड़ी मोड के बीच स्विच कर पाएंगे।",
      tags: ["घड़ी", "डिजाइन"]
    }
  ]
};

const INTRO_SECTIONS: Record<Language, { title: string; desc: string; gaugeTitle: string; gaugeDesc: string; locationTitle: string; locationDesc: string; clockTitle: string; clockDesc: string; customTitle: string; customDesc: string; }> = {
  English: {
    title: "|| PURPOSE OF TODAY'S DHARMIC TIME APP ||",
    desc: "This is a Vedic astronomical tool designed to align daily life with cosmic patterns. By computing precise sunrise, sunset, Panchang, and Choghadiya parameters based on your location, it helps you perform spiritual duties and daily tasks in auspicious times.",
    gaugeTitle: "Detailed Tithi Progress (Gauge)",
    gaugeDesc: "The circular progress indicator shows how much of the current Tithi remains, indicating exactly when it ends.",
    locationTitle: "Location-Based Calculations",
    locationDesc: "All sunrise and sunset events are calculated using your GPS coordinates, providing exact city-specific Panchang data.",
    clockTitle: "Live Choghadiya Watch",
    clockDesc: "Real-time visual display of daytime and nighttime planetary hours, enabling you to act in favorable periods.",
    customTitle: "Simulations & Customization",
    customDesc: "Modern features including themes, analog/digital clock designs, poster generator, and home widget simulators."
  },
  Hindi: {
    title: "॥ आज का धर्मिक समय एप का उद्देश्य ॥",
    desc: "यह एक वैदिक खगोलीय उपकरण है, जो हिंदू धार्मिक जीवन को अनुशासित और संस्कारित बनाने के लिए आपके वर्तमान स्थान के अनुसार सूर्योदय, पंचांग, और शुभ चौघड़िया की सटीक जानकारी प्रस्तुत करता है।",
    gaugeTitle: "विस्तृत तिथि प्रोग्रेस (Gauge)",
    gaugeDesc: "होम स्क्रीन पर तिथि के साथ घूमता हुआ प्रोग्रेस इंडिकेटर है, जो यह दर्शाता है कि वर्तमान तिथि कितनी बची है और कब खत्म होगी।",
    locationTitle: "स्थान आधारित सटीक गणना",
    locationDesc: "सूर्योदय और सूर्यास्त का सटीक समय सीधे आपके स्थान के अनुसार निकाला जाता है, जिससे आपके शहर का पंचांग सबसे सटीक बनता है।",
    clockTitle: "लाइव चौघड़िया घड़ी",
    clockDesc: "दिन और रात के मुहूर्तों की रीयल-टाइम स्थिति, जिससे आप हर काम सही शुभ काल में प्रारंभ कर सकते हैं।",
    customTitle: "सुविधाएं और अनुकूलन",
    customDesc: "थीम सेटिंग, डार्क थीम, एनालॉग और डिजिटल घड़ी मोड, पोस्टर मेकर, और गृह विजेट सिम्युलेटर जैसी आधुनिक सुविधाएं।"
  }
};

const HELP_TABS: Record<Language, { intro: string; features: string; faqs: string; }> = {
  English: {
    intro: "Overview",
    features: "Screen Guide",
    faqs: "FAQs"
  },
  Hindi: {
    intro: "विशेषता परिचय",
    features: "स्क्रीन उपयोग निर्देश",
    faqs: "अक्सर पूछे जाने वाले प्रश्न (FAQ)"
  }
};

const SCREEN_GUIDES: Record<Language, { title: string; desc: string; }[]> = {
  English: [
    {
      title: "1. Main Screen (Home Feed):",
      desc: "Displays today's weekday, current active Tithi, and Nakshatra progress. The colored indicators on the 'Live Muhurat Watch' show the active planetary hour and its auspiciousness."
    },
    {
      title: "2. Panchang Screen:",
      desc: "Complete breakdown of Tithi, Nakshatra, Yoga, and Karana. Includes exact astronomical sunrise, sunset, moonrise, and a visual representation of the current Moon Phase."
    },
    {
      title: "3. Muhurat Screen:",
      desc: "Detailed lists of auspicious periods (e.g. Abhijit Muhurat, Amrit Kaal) and adverse periods (e.g. Rahukaal, Yamaganda) to help you plan obstacle-free tasks and travels."
    },
    {
      title: "4. Festivals Screen:",
      desc: "Chronological schedule of key fasts and festivals (e.g. Ekadashi, Purnima, Pradosh Vrat) along with their spiritual significance and ritual guidelines."
    },
    {
      title: "5. Nakshatra Details:",
      desc: "Comprehensive insights into the 27 Nakshatras: current ruler planet, ruling deity, symbolic representations, and recommended activities."
    },
    {
      title: "6. Settings & Custom Tools:",
      desc: "Simulate premium modes. Generate high-quality Panchang posters to share on social media, configure home screen widgets, switch themes, and adjust settings."
    }
  ],
  Hindi: [
    {
      title: "१. मुख्य स्क्रीन (Home Feed):",
      desc: "यहीं पर आज का दिन, तिथि, लाइव नक्षत्र की प्रोग्रेस दिखेगी। 'लाइव मुहूर्त वॉच' पर बने रंगीन बिंदु तुरंत बताते हैं कि इस समय कौन-सा चौघड़िया काल सक्रिय है और वह शुभ है या अशुभ।"
    },
    {
      title: "२. पंचांग (Panchang Screen):",
      desc: "इसमें तिथि, नक्षत्र, योग और करण का पूरा ब्यौरा है। साथ ही सूर्योदय, सूर्यास्त और चंद्रोदय का सटीक समय तथा वर्तमान चंद्र कला (Moon Phase) का सुंदर प्रदर्शन मिलता है।"
    },
    {
      title: "३. मुहूर्त (Muhurat Screen):",
      desc: "इस स्क्रीन पर शुभ मुहूर्त (जैसे अभिजीत मुहूर्त, अमृत काळ) के साथ अशुभ समय (जैसे राहुकाल, यमगंड) सूची शामिल है, जिससे आप विघ्न रहित यात्रा और कार्य संपन्न कर सकेंगे।"
    },
    {
      title: "४. व्रत और त्योहार (Festival Screen):",
      desc: "सप्ताह और महीने के महत्वपूर्ण त्योहारों की समय सूची। जैसे एकादशी, पूर्णिमा, प्रदोष व्रत और उनकी आध्यात्मिक महिमा और व्रत विधि।"
    },
    {
      title: "५. नक्षत्र ब्यौरा (Nakshatra Detail):",
      desc: "२७ नक्षत्रों में से वर्तमान सक्रिय नक्षत्र, उसके स्वामी ग्रह (Ruler Node), नक्षत्र देवता, प्रभाव और वर्ण के साथ आत्म-साधना दिशा तय करें।"
    },
    {
      title: "६. सेटिंग्स और सुविधाएं (Features & Tools):",
      desc: "प्रीमियम सिमुलेशन ऑन करें। सुंदर पंचांग पोस्टर बनाकर व्हाट्सएप पर साझा करें, या होम स्क्रीन पर लगाने के लिए पंचांग विजेट जोड़ें। डार्क और लाइट थीम बदलें।"
    }
  ]
};

export function HelpModal({ isOpen, onClose, theme, language = 'English' }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'intro' | 'features' | 'faqs'>('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentFaqs = FAQS[language];
  const currentIntro = INTRO_SECTIONS[language];
  const currentTabs = HELP_TABS[language];
  const currentGuides = SCREEN_GUIDES[language];

  const filteredFaqs = currentFaqs.filter(
    faq => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
      <div 
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transition-all duration-300 md:border scale-100 ${
          theme === 'light' 
            ? 'bg-[#FFFBF7] text-slate-800 border-orange-100' 
            : 'bg-[#181411] text-amber-550 border-orange-950/40'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-5 flex justify-between items-center border-b ${
          theme === 'light' ? 'bg-orange-50/40 border-orange-100' : 'bg-orange-950/20 border-orange-950/20'
        }`}>
          <div className="flex items-center gap-2 text-left">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-dark-accent">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-black text-orange-900 dark:text-dark-text-pri leading-tight">
                {getTranslation(language, 'helpTitle')}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-450 block mt-0.5 font-semibold font-sans">
                {getTranslation(language, 'helpIntro')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 cursor-pointer transition-colors`}
            title={language === 'Hindi' ? "बंद करें" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className={`flex border-b px-4 ${
          theme === 'light' ? 'border-orange-100 bg-[#FFF]' : 'border-orange-950/20 bg-[#16120E]'
        }`}>
          <button
            onClick={() => setActiveTab('intro')}
            className={`px-4 py-3 text-xs font-black relative flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'intro' ? 'text-orange-600 dark:text-dark-accent' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{currentTabs.intro}</span>
            {activeTab === 'intro' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-3 text-xs font-black relative flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'features' ? 'text-orange-600 dark:text-dark-accent' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{currentTabs.features}</span>
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-3 text-xs font-black relative flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'faqs' ? 'text-orange-600 dark:text-dark-accent' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{currentTabs.faqs}</span>
            {activeTab === 'faqs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Content Box */}
        <div className="overflow-y-auto p-5 flex-1 select-text scrollbar-hide text-left space-y-5">
          
          {/* TAB 1: INTRO */}
          {activeTab === 'intro' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl p-4 bg-orange-500/5 border border-orange-500/10 flex gap-3.5">
                <span className="text-xl">🕉️</span>
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-orange-600 dark:text-dark-accent">
                    {currentIntro.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-350 font-sans">
                    {currentIntro.desc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-955/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {currentIntro.gaugeTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-dark-text-mut leading-normal font-sans">
                    {currentIntro.gaugeDesc}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-955/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    {currentIntro.locationTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-dark-text-mut leading-normal font-sans">
                    {currentIntro.locationDesc}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-955/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {currentIntro.clockTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-dark-text-mut leading-normal font-sans">
                    {currentIntro.clockDesc}
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-955/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    {currentIntro.customTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-dark-text-mut leading-normal font-sans">
                    {currentIntro.customDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-4 animate-fade-in font-sans">
              <h3 className="text-2xs uppercase font-extrabold text-orange-600 tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-orange-500" />
                {language === 'Hindi' ? "स्क्रीन द्वारा आसान उपयोग निर्देश:" : "Navigation Screen Instructions:"}
              </h3>
              
              <div className="space-y-3">
                {currentGuides.map((guide, idx) => {
                  let Icon = Sliders;
                  if (idx === 0) Icon = Home;
                  else if (idx === 1) Icon = Landmark;
                  else if (idx === 2) Icon = Clock;
                  else if (idx === 3) Icon = Calendar;
                  else if (idx === 4) Icon = Map;
                  else Icon = Settings;

                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-755 dark:text-dark-text-pri leading-none">{guide.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1 leading-normal">
                          {guide.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-3 animate-fade-in font-sans">
              {/* Search FAQ */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'Hindi' ? "क्या आप कुछ खोजना चाहते हैं? (उदा. मुहूर्त, स्थान)" : "Search FAQ (e.g. Muhurat, Location)"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs font-medium px-4 py-3 pl-9 rounded-xl border outline-none transition-all ${
                    theme === 'light' 
                      ? 'bg-slate-50 border-orange-100 focus:border-orange-400 focus:bg-[#FFF]' 
                      : 'bg-stone-900/40 border-orange-955/30 focus:border-orange-500 focus:bg-stone-955/80 text-amber-50'
                  }`}
                />
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              </div>

              {/* FAQs Listing */}
              {filteredFaqs.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {filteredFaqs.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div 
                        key={idx}
                        className={`rounded-xl border overflow-hidden transition-all duration-250 ${
                          theme === 'light' 
                            ? 'border-orange-100/40 bg-orange-50/10 hover:bg-orange-50/30' 
                            : 'border-orange-950/20 bg-stone-900/20 hover:bg-stone-900/30'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                          className="w-full text-left px-4 py-3.5 font-bold text-xs flex justify-between items-center gap-2 cursor-pointer"
                        >
                          <span className={`${isOpen ? 'text-orange-600 dark:text-dark-accent' : 'text-slate-750 dark:text-dark-text-pri'}`}>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-orange-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>
                        
                        {isOpen && (
                          <div className={`px-4 pb-4 pt-1 font-sans text-[10px] sm:text-[11.5px] leading-relaxed border-t border-dashed ${
                            theme === 'light' ? 'text-slate-650 border-orange-100/30 bg-white/70' : 'text-slate-350 border-orange-950/20 bg-stone-955/40'
                          }`}>
                            <p className="whitespace-pre-line">{faq.a}</p>
                            
                            {/* Tags */}
                            <div className="flex gap-1.5 mt-3 self-start flex-wrap">
                              {faq.tags.map((tag, tagIdx) => (
                                <span 
                                  key={tagIdx} 
                                  className="text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-dark-accent"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 font-sans text-xs">
                  {language === 'Hindi' ? "कोई परिणाम नहीं मिला। कृपया कुछ और शब्द खोजें।" : "No matches found. Please try searching for other terms."}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer branding/acknowledgement */}
        <div className={`px-5 py-3 border-t flex justify-between items-center text-[9px] font-mono font-bold ${
          theme === 'light' ? 'bg-orange-50/30 border-orange-100 text-slate-500' : 'bg-orange-950/10 border-orange-950/20 text-slate-450'
        }`}>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            {language === 'Hindi' ? "सूर्य सिद्धांत गणित" : "Surya Siddhanta Astronomical Engine"}
          </span>
          <span>
            {language === 'Hindi' ? "© धर्मज्ञान और साधना मार्गदर्शिका" : "© Vedic Knowledge & Sadhana Guide"}
          </span>
        </div>
      </div>
    </div>
  );
}
