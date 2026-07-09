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

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export function HelpModal({ isOpen, onClose, theme }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<'intro' | 'features' | 'faqs'>('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
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
  ];

  const filteredFaqs = faqs.filter(
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
            : 'bg-[#181411] text-amber-50 border-orange-950/40'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-5 flex justify-between items-center border-b ${
          theme === 'light' ? 'bg-orange-50/40 border-orange-100' : 'bg-orange-950/20 border-orange-950/20'
        }`}>
          <div className="flex items-center gap-2 text-left">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-black text-orange-900 dark:text-amber-100 leading-tight">
                मार्गदर्शिका और सहायता 
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 block mt-0.5 font-semibold font-sans">
                एप का प्रभावी ढंग से उपयोग करने के लिए सभी जानकारी यहाँ पढ़ें।
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 cursor-pointer transition-colors`}
            title="बंद करें"
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
              activeTab === 'intro' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>विशेषता परिचय</span>
            {activeTab === 'intro' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-3 text-xs font-black relative flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'features' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>स्क्रीन उपयोग निर्देश</span>
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-3 text-xs font-black relative flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'faqs' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>अक्सर पूछे जाने वाले प्रश्न (FAQ)</span>
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
                  <h3 className="font-serif text-sm font-bold text-orange-600 dark:text-orange-400">॥ आज का धर्मिक समय एप का उद्देश्य ॥</h3>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-350 font-sans">
                    यह एक वैदिक खगोलीय उपकरण है, जो हिंदू धार्मिक जीवन को अनुशासित और संस्कारित बनाने के लिए आपके वर्तमान स्थान के अनुसार सूर्योदय, पंचांग, और शुभ चौघड़िया की सटीक जानकारी प्रस्तुत करता है।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-950/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    विस्तृत तिथि प्रोग्रेस (Gauge)
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-sans">
                    होम स्क्रीन पर तिथि के साथ घूमता हुआ प्रोग्रेस इंडिकेटर है, जो यह दर्शाता है कि वर्तमान तिथि कितनी बची है और कब खत्म होगी।
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-950/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    स्थान आधारित सटीक गणना
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-sans">
                    सूर्योदय और सूर्यास्त का सटीक समय सीधे आपके स्थान के अनुसार निकाला जाता है, जिससे आपके शहर का पंचांग सबसे सटीक बनता है।
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-950/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    लाइव चौघड़िया घड़ी
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-sans">
                    दिन and रात के मुहूर्तों की रीयल-टाइम स्थिति, जिससे आप हर काम सही शुभ काल में प्रारंभ कर सकते हैं।
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-[#FCFAF2] border-orange-100/50' : 'bg-[#1C1814] border-orange-950/40'
                }`}>
                  <h4 className="text-2xs font-bold text-orange-600 flex items-center gap-1.5 mb-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    सुविधाएं और अनुकूलन
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-sans">
                    थीम सेटिंग, डार्क थीम, एनालॉग और डिजिटल घड़ी मोड, पोस्टर मेकर, और गृह विजेट सिम्युलेटर जैसी आधुनिक सुविधाएं।
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
                स्क्रीन द्वारा आसान उपयोग निर्देश:
              </h3>
              
              <div className="space-y-3">
                {/* Home */}
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-755 dark:text-amber-100 leading-none">१. मुख्य स्क्रीन (Home Feed):</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                      यहीं पर आज का दिन, तिथि, लाइव नक्षत्र की प्रोग्रेस दिखेगी। 'लाइव मुहूर्त वॉच' पर बने रंगीन बिंदु तुरंत बताते हैं कि इस समय कौन-सा चौघड़िया काल सक्रिय है और वह शुभ है या अशुभ।
                    </p>
                  </div>
                </div>

                {/* Panchang */}
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-755 dark:text-amber-100 leading-none">२. पंचांग (Panchang Screen):</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1 leading-normal">
                      इसमें तिथि, नक्षत्र, योग और करण का पूरा ब्यौरा है। साथ ही सूर्योदय, सूर्यास्त और चंद्रोदय का सटीक समय तथा वर्तमान चंद्र कला (Moon Phase) का सुंदर प्रदर्शन मिलता है।
                    </p>
                  </div>
                </div>

                {/* Muhurat */}
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-755 dark:text-amber-100 leading-none">३. मुहूर्त (Muhurat Screen):</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                      इस स्क्रीन पर शुभ मुहूर्त (जैसे अभिजीत मुहूर्त, अमृत काळ) के साथ अशुभ समय (जैसे राहुकाल, यमगंड) सूची शामिल है, जिससे आप विघ्न रहित यात्रा और कार्य संपन्न कर सकेंगे।
                    </p>
                  </div>
                </div>

                {/* Festivals */}
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-755 dark:text-amber-100 leading-none">४. व्रत और त्योहार (Festival Screen):</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                      सप्ताह और महीने के महत्वपूर्ण त्योहारों की समय सूची। जैसे एकादशी, पूर्णिमा, प्रदोष व्रत और उनकी आध्यात्मिक महिमा और व्रत विधि।
                    </p>
                  </div>
                </div>

                {/* Nakshatra */}
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-755 dark:text-amber-100 leading-none">५. नक्षत्र ब्यौरा (Nakshatra Detail):</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                      २७ नक्षत्रों में से वर्तमान सक्रिय नक्षत्र, उसके स्वामी ग्रह (Ruler Node), नक्षत्र देवता, प्रभाव और वर्ण के साथ आत्म-साधना दिशा तय करें।
                    </p>
                  </div>
                </div>

                {/* Settings / Tools */}
                <div className="flex gap-3">
                  <div className="p-1 rounded-lg bg-orange-500/10 text-orange-600 h-fit">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-755 dark:text-amber-100 leading-none">६. सेटिंग्स और सुविधाएं (Features & Tools):</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-1 leading-normal">
                      प्रीमियम सिमुलेशन ऑन करें। सुंदर पंचांग पोस्टर बनाकर व्हाट्सएप पर साझा करें, या होम स्क्रीन पर लगाने के लिए पंचांग विजेट जोड़ें। डार्क और लाइट थीम बदलें।
                    </p>
                  </div>
                </div>
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
                  placeholder="क्या आप कुछ खोजना चाहते हैं? (उदा. मुहूर्त, स्थान)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs font-medium px-4 py-3 pl-9 rounded-xl border outline-none transition-all ${
                    theme === 'light' 
                      ? 'bg-slate-50 border-orange-100 focus:border-orange-400 focus:bg-[#FFF]' 
                      : 'bg-stone-900/40 border-orange-950/30 focus:border-orange-500 focus:bg-stone-950/80 text-amber-50'
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
                          <span className={`${isOpen ? 'text-orange-600 dark:text-orange-400' : 'text-slate-750 dark:text-slate-300'}`}>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-orange-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>
                        
                        {isOpen && (
                          <div className={`px-4 pb-4 pt-1 font-sans text-[10px] sm:text-[11.5px] leading-relaxed border-t border-dashed ${
                            theme === 'light' ? 'text-slate-600 border-orange-100/30 bg-white/70' : 'text-slate-350 border-orange-950/20 bg-stone-950/40'
                          }`}>
                            <p className="whitespace-pre-line">{faq.a}</p>
                            
                            {/* Tags */}
                            <div className="flex gap-1.5 mt-3 self-start flex-wrap">
                              {faq.tags.map((tag, tagIdx) => (
                                <span 
                                  key={tagIdx} 
                                  className="text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400"
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
                  कोई परिणाम नहीं मिला। कृपया कुछ और शब्द खोजें।
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer branding/acknowledgement */}
        <div className={`px-5 py-3 border-t flex justify-between items-center text-[9px] font-mono font-bold ${
          theme === 'light' ? 'bg-orange-50/30 border-orange-100 text-slate-500' : 'bg-orange-950/10 border-orange-950/20 text-slate-400'
        }`}>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            सूर्य सिद्धांत गणित
          </span>
          <span>© धर्मज्ञान और साधना मार्गदर्शिका</span>
        </div>
      </div>
    </div>
  );
}
