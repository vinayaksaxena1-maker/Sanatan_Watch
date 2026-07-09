import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
  BookMarked
} from 'lucide-react';

interface StotraItem {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'Chalisa' | 'Stotram' | 'Aarti' | 'Sanskrit_Path';
  categoryHindi: string;
  deity: string;
  recommendedDay: number; // 0 to 6 (Sunday to Saturday)
  recommendedDayName: string;
  recommendedPrahar: 'Pratah' | 'Madhyahna' | 'Sandhya' | 'Ratri' | 'All';
  recommendedPraharName: string;
  verses: string[];
  meaning: string;
}

const STOTRAS: StotraItem[] = [
  {
    id: 'shiv_tandav',
    title: 'Shiva Tandava Stotram',
    hindiTitle: 'श्री शिवताण्डवस्तोत्रम्',
    category: 'Stotram',
    categoryHindi: 'स्तोत्रम',
    deity: 'भगवान शिव (Lord Shiva)',
    recommendedDay: 1, // Monday
    recommendedDayName: 'सोमवार (Monday)',
    recommendedPrahar: 'All',
    recommendedPraharName: 'सर्वकाल (Anytime)',
    verses: [
      "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ।\nडमड्डमड्डमड्डमन्निनादवड्डमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥१॥",
      "जटाकटा हसम्भ्रमभ्रमन्निलिम्पनिर्झरी-विलोलवीचिवल्लरीविराजमानमूर्धनि ।\nधगद्धगद्धगज्ज्वलल्ललाटपट्टपावके किशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम ॥२॥",
      "धराधरेन्द्रनन्दिनीविलासबन्धुबन्धुर-स्फुरद्दिगन्तसन्ततिप्रमोदमानमानसे ।\nकृपाकटाक्षधोरणीनिरुद्धदुर्धरापदि क्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि ॥३॥",
      "जटाभुजङ्गपिङ्गलस्फुरत्फणामणिप्रभा-कदम्बकुङ्कुमद्रवप्रलिप्तदिग्वधूमुखे ।\nमदान्धसिन्धुरस्फुरत्वगुत्तरीयमेदुरे मनो विनोदद्भुतं बिभर्तु भूतभर्तरि ॥४॥"
    ],
    meaning: 'राक्षसराज रावण द्वारा रचित यह अत्यंत शक्तिशाली स्तोत्र भगवान शिव के दिव्य और तांडव नृत्य स्वरूप का गुणगान करता है। इसका पाठ साहस, भयमुक्ति और आध्यात्मिक शक्ति प्रदान करता है।'
  },
  {
    id: 'hanuman_chalisa',
    title: 'Shri Hanuman Chalisa',
    hindiTitle: 'श्री हनुमान चालीसा',
    category: 'Chalisa',
    categoryHindi: 'चालीसा',
    deity: 'श्री हनुमान जी (Hanuman Ji)',
    recommendedDay: 2, // Tuesday
    recommendedDayName: 'मंगलवार (Tuesday)',
    recommendedPrahar: 'Sandhya',
    recommendedPraharName: 'सायंकालीन प्रहर (Evening)',
    verses: [
      "श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि ।\nबरनऊ रघुबर बिमल जसु जो दायकु फल चारि ॥\nबुद्धिहीन तनु जानिके सुमिरौ पवन कुमार ।\nबल बुधि बिद्या देहु मोहि हरहु कलेस बिकार ॥",
      "जय हनुमान ज्ञान गुन सागर । जय कपीस तिहुं लोक उजागर ॥\nराम दूत अतुलित बल धामा । अंजनि पुत्र पवनसुत नामा ॥\nमहाबीर बिक्रम बजरंगी । कुमति निवार सुमति के संगी ॥\nकंचन बरन बिराज सुबेसा । कानन कुंडल कुंचित केसा ॥",
      "हाथ बज्र औ ध्वजा बिराजै । कांधे मूंज जनेऊ साजै ॥\nशंकर सुवन केसरी नंदन । तेज प्रताप महा जग बंदन ॥\nबिद्यावान गुनी अति चातुर । राम काज करिबे को आतुर ॥\nप्रभु चरित्र सुनिबे को रसिया । राम लखन सीता मन बसिया ॥",
      "संकट कटै मिटै सब पीरा । जो सुमिरै हनुमत बल बीरा ॥\nजय जय जय हनुमान गोसाईं । कृपा करहु गुरुदेव की नांई ॥"
    ],
    meaning: 'गोस्वामी तुलसीदास कृत हनुमान चालीसा का नित्य पाठ भूत-प्रेत बाधा, भय, मानसिक चिंताओं और कुंडली के क्रूर ग्रहों के कुप्रभावों का नाश करता है।'
  },
  {
    id: 'sankat_naslan_ganesh',
    title: 'Sankat Nashan Ganesh Stotram',
    hindiTitle: 'श्री संकटनाशन गणेश स्तोत्रम्',
    category: 'Stotram',
    categoryHindi: 'स्तोत्रम',
    deity: 'श्री गणेश जी (Lord Ganesha)',
    recommendedDay: 3, // Wednesday
    recommendedDayName: 'बुधवार (Wednesday)',
    recommendedPrahar: 'Pratah',
    recommendedPraharName: 'प्रातःकाल (Morning)',
    verses: [
      "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम् ।\nभक्तावासं स्मरेन्नित्यं आयुःकामार्थसिद्धये ॥१॥",
      "प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम् ।\nतृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम् ॥२॥",
      "लम्बोदरं पञ्चमं च षष्ठं विकटमेव च ।\nसप्तमं विघ्नराजं च धूम्रवर्णं तथाष्टमम् ॥३॥",
      "नवमं भालचन्द्रं च दशमं तु विनायकम् ।\nएकादशं गणपतिं द्वादशं तु गजाननम् ॥४॥",
      "द्वादशैतानि नामानि त्रिसन्ध्यं यः पठेन्नरः ।\nन च विघ्नभयं तस्य सर्वसिद्धिकरं परम् ॥५॥"
    ],
    meaning: 'नारद पुराण से प्रेरित यह स्तोत्र भगवान गणेश के १२ नामों का स्मरण कराता है। तीन संध्याओं में इसका पाठ करने से समस्त सांसारिक विघ्न-बाधाएं सदा के लिए शांत हो जाती हैं।'
  },
  {
    id: 'aditya_hrudaya',
    title: 'Aditya Hrudaya Stotra',
    hindiTitle: 'श्रीमद् आदित्य हृदय स्तोत्र',
    category: 'Sanskrit_Path',
    categoryHindi: 'संस्कृत पाठ',
    deity: 'सूर्य देव (Lord Surya)',
    recommendedDay: 0, // Sunday
    recommendedDayName: 'रविवार (Sunday)',
    recommendedPrahar: 'Pratah',
    recommendedPraharName: 'प्रभात / प्रातः प्रहर (Sunrise)',
    verses: [
      "ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।\nरावणञ्चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥१॥",
      "दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम् ।\nउपागम्याब्रवीद्राममगरस्त्यो भगवांस्तदा ॥२॥",
      "राम राम महाबाहो शृणु गुह्यं सनातनम् ।\nयेन सर्वानरीन् वत्स समरे विजयिष्यसि ॥३॥",
      "आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् ।\nजयावहं जपेन्नित्यमक्षय्यं परमं शिवम् ॥४॥"
    ],
    meaning: 'रामायणकालीन युद्ध में जब प्रभु श्री राम चिंतित थे, तब अगस्त्य मुनि ने उन्हें सूर्य देव की आराधना रूपी यह गोपनीय स्तोत्र प्रदान किया था। इसके पाठ से प्रशासनिक यश, आरोग्य और शत्रुओं पर पूर्ण विजय मिलती है।'
  },
  {
    id: 'pratah_smaran',
    title: 'Daily Pratah Smaran Stuti',
    hindiTitle: 'दैनिक वैदिक प्रातः स्मरण श्लोक',
    category: 'Sanskrit_Path',
    categoryHindi: 'दैनिक पाठ',
    deity: 'त्रिमूर्ति व आदि शक्ति (Universal Deities)',
    recommendedDay: 7, // Any day
    recommendedDayName: 'दैनिक (Daily)',
    recommendedPrahar: 'Pratah',
    recommendedPraharName: 'ब्राह्ममुहूर्त व प्रातः (Pratahkal)',
    verses: [
      "कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती ।\nकरमूले तु गोविन्दः प्रभाते करदर्शनम् ॥१॥",
      "समुद्रवसने देवि पर्वतस्तनमण्डले ।\nविष्णुपत्नि नमस्तुभ्यं पादस्पर्शं क्षमस्वमे ॥२॥",
      "ब्रह्मामुरारित्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च ।\nगुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम ॥३॥"
    ],
    meaning: 'शय्या से उठते ही हथेलियों का दर्शन करने, पृथ्वी माता से स्पर्श की क्षमा मांगने और नवग्रहों से मंगल प्रभात की कामना करने वाले वैदिक श्लोक।'
  },
  {
    id: 'durga_aarti',
    title: 'Maa Durga Aarti',
    hindiTitle: 'श्री दुर्गा जी की आरती',
    category: 'Aarti',
    categoryHindi: 'आरती',
    deity: 'माँ दुर्गा / शक्ति (Maa Durga)',
    recommendedDay: 5, // Friday
    recommendedDayName: 'शुक्रवार (Friday)',
    recommendedPrahar: 'Sandhya',
    recommendedPraharName: 'संध्याकालीन प्रहर (Sunset)',
    verses: [
      "जय अम्बे गौरी, मैया जय श्यामा गौरी ।\nतुमको निसदिन ध्यावत, हरि ब्रह्मा शिवरी ॥ जय अम्बे गौरी...",
      "मांग सिन्दूर बिराजत, टीको मृगमद को ।\nउज्जवल से दोउ नैना, चन्द्रबदन नीको ॥ जय अम्बे गौरी...",
      "कनक समान कलेवर, रक्ताम्बर साजे ।\nरक्तपुष्प गल माला, कण्ठहार साजे ॥ जय अम्बे गौरी...",
      "सज्जन जी के संकट, क्षण में दूर करे ।\nजो कोई आरती गावे, प्रेम सहित ध्यावे ॥ जय अम्बे गौरी..."
    ],
    meaning: 'शक्ति स्वरूपा माँ जगदम्बा की आरती। इसके पाठ से गृह कलह दूर होती है, सुख-शांति एवं ऐश्वर्य प्राप्त होता है।'
  },
  {
    id: 'vishnu_stotram',
    title: 'Shri Vishnu Stotram',
    hindiTitle: 'श्री हरि विष्णु शान्ताकारम् स्तोत्र',
    category: 'Stotram',
    categoryHindi: 'स्तोत्रम',
    deity: 'भगवान विष्णु (Lord Vishnu)',
    recommendedDay: 4, // Thursday
    recommendedDayName: 'गुरुवार (Thursday)',
    recommendedPrahar: 'Madhyahna',
    recommendedPraharName: 'मध्याह्न प्रहर (Midday)',
    verses: [
      "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं\nविश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं\nवन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥१॥",
      "सशङ्खचक्रं सकिरीटकुण्डलं सपीतवस्त्रं सरसीरुहेक्षणम् ।\nसहारवक्षःस्थलशोभिकौस्तुभं नमामि विष्णुं शिरसा चतुर्भुजम् ॥२॥"
    ],
    meaning: 'महाप्रभु विष्णु के शांत, दयालु और ब्रह्मांड-रक्षक चतुर्भुज स्वरूप की आराधना। यह मन को गहन स्थिरता तथा भौतिक सुरक्षा प्रदान करता है।'
  }
];

export function StotraSangrah() {
  const [selectedStotra, setSelectedStotra] = useState<StotraItem>(STOTRAS[0]);
  const [fontSize, setFontSize] = useState<number>(15); // 12 to 24px
  const [currentPrahar, setCurrentPrahar] = useState<'Pratah' | 'Madhyahna' | 'Sandhya' | 'Ratri'>('Pratah');
  const [currentDay, setCurrentDay] = useState<number>(new Date().getDay());

  // Determine current Prahar based on hours
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 4 && hours < 11) {
      setCurrentPrahar('Pratah');
    } else if (hours >= 11 && hours < 16) {
      setCurrentPrahar('Madhyahna');
    } else if (hours >= 16 && hours < 21) {
      setCurrentPrahar('Sandhya');
    } else {
      setCurrentPrahar('Ratri');
    }
    setCurrentDay(new Date().getDay());
  }, []);

  // Filter recommendations based on Day and Prahar
  const dailyRecommendation = STOTRAS.find(s => s.recommendedDay === currentDay) || STOTRAS[4];
  const praharRecommendation = STOTRAS.find(s => s.recommendedPrahar === currentPrahar) || STOTRAS[4];

  return (
    <div id="stotra_sangrah_root" className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* Dynamic Recommendation Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recommended by Day of Week */}
        <div 
          onClick={() => setSelectedStotra(dailyRecommendation)}
          className="cursor-pointer p-4 rounded-2xl border border-orange-100/35 bg-orange-50/20 dark:bg-orange-950/10 hover:border-orange-500 hover:ring-2 hover:ring-orange-500/10 dark:hover:border-orange-900 transition-all flex justify-between items-center"
        >
          <div className="space-y-1.5 text-left">
            <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              आज का सिद्ध वार सुझाव (Day's recommendation)
            </span>
            <h4 className="text-sm font-serif font-black text-slate-800 dark:text-orange-50">
              {dailyRecommendation.hindiTitle}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block leading-none">
              वार: {dailyRecommendation.recommendedDayName} | देव: {dailyRecommendation.deity}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-500" />
        </div>

        {/* Recommended by Time Prahar */}
        <div 
          onClick={() => setSelectedStotra(praharRecommendation)}
          className="cursor-pointer p-4 rounded-2xl border border-orange-100/35 bg-orange-50/20 dark:bg-orange-950/10 hover:border-orange-500 hover:ring-2 hover:ring-orange-500/10 dark:hover:border-orange-900 transition-all flex justify-between items-center"
        >
          <div className="space-y-1.5 text-left">
            <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-[#FF9933] dark:text-amber-500 flex items-center gap-1">
              {currentPrahar === 'Pratah' || currentPrahar === 'Madhyahna' ? <Sun className="w-3.5 h-3.5 text-amber-550" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              वर्तमान प्रहर ई-साधना (Prahar Devotion)
            </span>
            <h4 className="text-sm font-serif font-black text-slate-800 dark:text-orange-50">
              {praharRecommendation.hindiTitle}
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block leading-none">
              प्रहर: {currentPrahar === 'Pratah' ? '🌅 प्रातःकालीन' : currentPrahar === 'Madhyahna' ? '🌞 मध्याह्न' : currentPrahar === 'Sandhya' ? '🌇 सायंकालीन (संध्या)' : '🌃 रात्रिकालीन'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-500" />
        </div>

      </div>

      {/* Main split display: Stotras list (left) vs Reader (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Stotras Collection List */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-zinc-500 block mb-2">
            संपूर्ण स्तोत्र व आरती संग्रह (Collection)
          </span>

          {STOTRAS.map((s) => {
            const isSelected = selectedStotra.id === s.id;
            return (
              <div 
                key={s.id}
                onClick={() => setSelectedStotra(s)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected 
                    ? 'bg-orange-500/10 border-orange-500' 
                    : 'bg-white dark:bg-zinc-950/15 border-slate-100 dark:border-zinc-900 hover:border-orange-100'
                }`}
              >
                <div className="flex justify-between items-center gap-1.5">
                  <h4 className="text-xs font-serif font-black text-slate-800 dark:text-slate-200">
                    {s.hindiTitle}
                  </h4>
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-100/55 dark:bg-zinc-900 text-orange-655 dark:text-amber-500 font-mono flex items-center shrink-0">
                    {s.categoryHindi}
                  </span>
                </div>
                
                <p className="text-[9.5px] text-slate-400 dark:text-zinc-500 font-medium font-sans mt-1">
                  देव: {s.deity}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Side: Epic sacred text reader */}
        <div className="md:col-span-2 bg-linear-to-b from-orange-50/15 to-orange-50/5 dark:from-zinc-950/20 dark:to-zinc-950/5 border border-orange-100/50 dark:border-zinc-900/45 p-5 rounded-3xl shadow-xs text-center flex flex-col justify-between items-stretch">
          
          <div className="w-full text-left flex justify-between items-center pb-3 border-b border-orange-100/35">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-orange-600 dark:text-amber-500 block">॥ श्री देव पूजनम् पाठ ॥</span>
              <h3 className="text-base sm:text-lg font-serif font-black text-slate-800 dark:text-orange-50 flex items-center gap-1.5">
                <BookMarked className="w-5 h-5 text-orange-550 shrink-0" />
                {selectedStotra.hindiTitle}
              </h3>
            </div>

            {/* Font Sizing Panel */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-1 rounded-xl border border-slate-250/30">
              <button 
                onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                className="w-6 h-6 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 font-black cursor-pointer text-xs"
                title="अक्षर घटाएं (Decrease font)"
              >
                अ-
              </button>
              <span className="text-[9px] font-bold text-slate-505 dark:text-zinc-400 font-mono w-4 text-center">{fontSize}</span>
              <button 
                onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
                className="w-6 h-6 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-505 font-black cursor-pointer text-xs"
                title="अक्षर बढ़ाएं (Increase font)"
              >
                अ+
              </button>
            </div>
          </div>

          {/* Verses reader area (Simulates ancient holy scriptures manuscripts scroll design style) */}
          <div className="relative overflow-hidden bg-orange-50/8 dark:bg-zinc-950/40 border border-orange-150/20 dark:border-zinc-900/30 rounded-2xl p-4 sm:p-6 my-4 max-h-[380px] overflow-y-auto leading-relaxed select-text shadow-3xs">
            
            {/* Ancient design marks */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 border-r border-dashed border-orange-500/20"></div>
            <div className="absolute right-2 top-0 bottom-0 w-0.5 border-l border-dashed border-orange-500/20"></div>

            <div className="space-y-6 text-center px-2 py-2">
              {selectedStotra.verses.map((verse, idx) => (
                <div key={idx} className="space-y-2">
                  <p 
                    style={{ fontSize: `${fontSize}px` }} 
                    className="font-serif font-black text-slate-850 dark:text-orange-50 whitespace-pre-wrap leading-loose tracking-wide select-all"
                  >
                    {verse}
                  </p>
                  
                  {/* Decorative floral spacer between verses */}
                  {idx < selectedStotra.verses.length - 1 && (
                    <div className="flex justify-center items-center gap-1 text-orange-500/40 text-[10px]">
                      <span>❈</span>
                      <span className="w-12 h-px bg-orange-500/10"></span>
                      <span>❈</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Meaning / Translation */}
          <div className="border-t border-dashed border-orange-100/60 dark:border-zinc-800/60 pt-3.5 text-left bg-orange-50/10 dark:bg-zinc-950/10 p-3 rounded-xl border border-slate-100 dark:border-zinc-900/30">
            <span className="text-[10px] font-black text-[#FF9933] uppercase tracking-widest block mb-1 font-mono">
              स्तोत्र महात्म्य व भावार्थ (Sacred Meaning):
            </span>
            <p className="text-[11.5px] text-slate-650 dark:text-zinc-400 font-medium leading-relaxed font-serif">
              {selectedStotra.meaning}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
