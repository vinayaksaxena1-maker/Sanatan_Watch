import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame
} from 'lucide-react';

interface MantraItem {
  id: string;
  name: string;
  hindiName: string;
  text: string;
  meaning: string;
  defaultTarget: number;
}

const MANTRAS: MantraItem[] = [
  {
    id: 'om',
    name: 'Om Chanting (ॐ)',
    hindiName: 'महा मन्त्र - ॐ (प्रणव ध्वनि)',
    text: 'ॐ ॥ ओम् ॥',
    meaning: 'ब्रह्मांड की अनादि और अनंत आदिशक्ति ध्वनि, जो मन को परम शांति प्रदान करती है।',
    defaultTarget: 108
  },
  {
    id: 'gayatri',
    name: 'Gayatri Mantra',
    hindiName: 'ऋग्वेदोक्त गायत्री महामंत्र',
    text: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥',
    meaning: 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा का ध्यान करें, वह हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।',
    defaultTarget: 108
  },
  {
    id: 'mahamrityunjaya',
    name: 'Mahamrityunjaya Mantra',
    hindiName: 'त्र्यम्बकम महामृत्युंजय मंत्र',
    text: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥',
    meaning: 'हम तीन नेत्रों वाले भगवान शिव की पूजा करते हैं, जो सुगंधित हैं और पोषण करते हैं। जैसे ककड़ी बेल से मुक्त होती है, वैसे ही हम मृत्यु और सांसारिकता से मुक्त हों।',
    defaultTarget: 108
  },
  {
    id: 'shiva',
    name: 'Shiva Panchakshari',
    hindiName: 'शिव पंचाक्षरी मंत्र',
    text: 'ॐ नमः शिवाय ॥',
    meaning: 'भगवान शिव को मेरा कोटि-कोटि प्रणाम। पंचतत्वों (क्षिति, जल, पावक, गगन, समीरा) के रक्षक शिव की आराधना।',
    defaultTarget: 108
  },
  {
    id: 'rama',
    name: 'Taraka Rama Mantra',
    hindiName: 'तारक राम मंत्र',
    text: 'श्री राम जय राम जय जय राम ॥',
    meaning: 'प्रभु श्री राम का आश्रय, जो भवसागर पार कराने वाला और परम मंगलकारी है।',
    defaultTarget: 108
  }
];

export function MantraJapa() {
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS[0]);
  const [count, setCount] = useState<number>(0);
  const [malaCount, setMalaCount] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(108);
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);
  const [isRippling, setIsRippling] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50); // 0 to 100

  // Audio elements references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Audio Synth
  const startAmbientSynth = () => {
    try {
      if (isSynthPlaying) return;

      // Create Audio Context if not present
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create Nodes
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Cosmic OM Pitch: 136.1 Hz (Sadhya frequency, based on Anahata Nada)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(136.1, ctx.currentTime);

      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(272.2, ctx.currentTime); // Second harmonic for warm depth

      // Set Lowpass Filter to make it a warm spiritual drone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      // Volume scaling
      const gainValue = (volume / 100) * 0.12; 
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 1.2); // Smooth fade in

      // Connect everything
      osc.connect(filter);
      if (oscHarmonic) {
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(0.04, ctx.currentTime);
        oscHarmonic.connect(hGain);
        hGain.connect(filter);
      }
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Start oscillators
      osc.start();
      oscHarmonic.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      filterNodeRef.current = filter;

      setIsSynthPlaying(true);
    } catch (err) {
      console.warn("Audio Context init error: ", err);
    }
  };

  const stopAmbientSynth = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); // Smooth fade out
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.stop();
          }
          setIsSynthPlaying(false);
        }, 500);
      } else {
        setIsSynthPlaying(false);
      }
    } catch (err) {
      setIsSynthPlaying(false);
    }
  };

  useEffect(() => {
    // Dynamic volume adjustment of active oscillator
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.12, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Clean ambient audio on unmount
  useEffect(() => {
    return () => {
      if (isSynthPlaying) {
        stopAmbientSynth();
      }
    };
  }, []);

  // Handle click counter increment
  const handleTap = () => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 260);

    // Dynamic beep/harmonic tone on each beads rotation (Web Audio Synth)
    playBeadDing();

    // Haptic Feedback if browser supports vibration
    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    setCount(prev => {
      const next = prev + 1;
      if (next >= targetCount) {
        setMalaCount(m => m + 1);
        playCompleteChime();
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]); // Vibrates twice on Mala completion
        }
        return 0; // Reset count
      }
      return next;
    });
  };

  // Sound generator on each count
  const playBeadDing = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Warm flute-like bell sound (pure sine wave with quick decay)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // Sound in A=432Hz Sacred tuning
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignored
    }
  };

  // Complete chime sound when target (e.g. 108) is met
  const playCompleteChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio 528Hz (Transformation & Miracles)
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.3, ctx.currentTime); // Harmonious Major 3rd (E5)

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      
      osc1.stop(ctx.currentTime + 1.3);
      osc2.stop(ctx.currentTime + 1.3);
    } catch {
      // Ignored
    }
  };

  const handleReset = () => {
    setCount(0);
    setMalaCount(0);
  };

  return (
    <div id="mantra_japa_root" className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* Dynamic Sound Controls Container */}
      <div className="bg-linear-to-r from-orange-500/10 to-amber-500/10 rounded-2xl p-4 border border-orange-100 dark:border-zinc-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-orange-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider font-mono">
              वैदिक ध्यान नाद (Cosmic Synth)
            </span>
            {isSynthPlaying && (
              <span className="text-[10px] text-emerald-500 font-black animate-pulse flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block"></span>
                सक्रिय (Live 136.1Hz OM)
              </span>
            )}
          </div>
          <p className="text-xs font-serif font-black text-slate-800 dark:text-orange-50">
            ॐ उच्चारण और ब्रह्मांडीय ध्वनि (Spiritual Sound Bed)
          </p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium block leading-none">
            ध्यान शांत करने व एकाग्रता हेतु पृष्ठभूमि में ॐ (432Hz Harmonics) बजाएं।
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 select-none">
          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-white/40 dark:bg-zinc-950/20 px-3 py-1.5 rounded-xl border border-orange-100/20">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {volume > 0 ? <Volume2 className="w-4 h-4 text-orange-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))} 
              className="w-16 accent-orange-500 scale-90"
            />
            <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 font-mono w-6">{volume}%</span>
          </div>

          <button
            onClick={isSynthPlaying ? stopAmbientSynth : startAmbientSynth}
            className={`px-4.5 py-2.5 rounded-xl text-3xs font-black shadow-3xs cursor-pointer flex items-center gap-1.5 transition-all ${
              isSynthPlaying 
                ? 'bg-rose-500 text-white border border-rose-600' 
                : 'bg-orange-505 dark:bg-orange-600 text-white hover:bg-orange-600'
            }`}
          >
            {isSynthPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> ध्वनि बंद करें
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> ॐ ध्वनि बजाएं
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Custom Mantras Selector & Active Japa bead screen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Mantra Selector Column (2/3 width on large screens) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-1">
            <h3 className="font-serif font-black text-slate-800 dark:text-amber-100 text-sm sm:text-base">
              जप एवं ध्यान हेतु मंत्र का चयन करें (Select Mantra)
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {MANTRAS.map((m) => {
              const works = selectedMantra.id === m.id;
              return (
                <div 
                  key={m.id}
                  onClick={() => {
                    setSelectedMantra(m);
                    setTargetCount(m.defaultTarget);
                    // play ding feedback of changing mantra
                    playBeadDing();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    works 
                      ? 'bg-orange-50/35 dark:bg-orange-950/15 border-orange-500 ring-2 ring-orange-500/10 dark:ring-orange-500/20' 
                      : 'bg-white dark:bg-zinc-950/10 border-slate-100 dark:border-zinc-900/60 hover:border-orange-100 dark:hover:border-orange-950/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="text-sm font-serif font-black text-slate-850 dark:text-orange-50">
                      {m.hindiName}
                    </h4>
                    <span className="text-[9.5px] font-extrabold uppercase bg-orange-100/50 dark:bg-zinc-900 text-orange-655 dark:text-amber-500 px-2.5 py-0.5 rounded-full font-mono">
                      लक्ष्य: {m.defaultTarget}
                    </span>
                  </div>

                  <p className="text-[12.5px] font-semibold text-orange-800 dark:text-amber-200/90 font-serif border-l-2 border-orange-400 pl-2.5 my-3 py-1 bg-slate-50/50 dark:bg-stone-900/40">
                    {m.text}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-sans mt-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">भावार्थ:</span> {m.meaning}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Giant Japa Counter Bead Card */}
        <div className="bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 p-5 rounded-3xl shadow-xs text-center flex flex-col justify-between items-center relative overflow-hidden min-h-[380px]">
          
          <div className="w-full text-left flex justify-between items-center mb-3">
            <div>
              <span className="text-[10px] tracking-widest text-[#FF9933] font-bold uppercase block font-mono">॥ सिद्ध जप माला ॥</span>
              <h4 className="text-xs font-serif font-black text-slate-800 dark:text-slate-200">ध्यान व गणना चक्र</h4>
            </div>
            
            <button 
              onClick={handleReset}
              className="p-1.5 rounded-xl border border-slate-200 hover:border-orange-400 dark:border-zinc-800 text-slate-400 hover:text-orange-550 transition-colors shadow-3xs hover:bg-slate-50 dark:hover:bg-zinc-900/60 cursor-pointer"
              title="पुनः स्थापित करें (Reset)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Core Interactive Click Area */}
          <div className="relative my-4 flex items-center justify-center select-none">
            
            {/* Big ripple aura on interaction */}
            <div className={`absolute inset-0 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-xl transition-all duration-300 ${
              isRippling ? 'scale-150 opacity-100' : 'scale-90 opacity-0'
            }`}></div>

            <button 
              onClick={handleTap}
              className={`w-40 h-40 rounded-full border-4 border-amber-500/45 bg-linear-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md flex flex-col items-center justify-center text-white transition-all transform active:scale-95 z-10 cursor-pointer relative ${
                isRippling ? 'ring-8 ring-amber-500/20 scale-[1.01]' : ''
              }`}
            >
              <div className="absolute top-4">
                <Flame className={`w-5 h-5 text-amber-100 ${isRippling ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
              
              <span className="text-5xl font-mono font-black tracking-tighter leading-none mt-1">
                {count}
              </span>
              
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-50 font-sans mt-1">
                स्पर्श करें (Tap bead)
              </span>

              {/* Little status subtext */}
              <div className="absolute bottom-4 flex items-center gap-1 text-[8px] bg-amber-950/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest font-mono text-amber-10 w-auto">
                {count}/{targetCount} जप
              </div>
            </button>
          </div>

          {/* Stats Summary Panel */}
          <div className="w-full bg-slate-50 dark:bg-zinc-900/30 rounded-2xl p-3 border border-slate-100 dark:border-zinc-800/40 grid grid-cols-2 gap-2 mt-2">
            <div className="text-left border-r border-slate-200/50 dark:border-zinc-800/50 pr-2">
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-mono">पूर्ण माला (Rotations):</span>
              <span className="text-base font-bold text-orange-655 dark:text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                <Sparkles className="w-4 h-4 text-orange-500 animate-spin" style={{ animationDuration: '6s' }} />
                {malaCount} माला
              </span>
            </div>

            <div className="text-left pl-1">
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-mono">जप लक्ष्य (Mala Bead Goal):</span>
              <div className="flex bg-slate-100 dark:bg-zinc-900 rounded-md p-0.5 mt-1 border border-slate-200/30 gap-1 w-full text-center">
                <button 
                  onClick={() => setTargetCount(27)}
                  className={`flex-1 text-[9px] font-black rounded-sm transition-all cursor-pointer py-0.5 ${
                    targetCount === 27 ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  27
                </button>
                <button 
                  onClick={() => setTargetCount(108)}
                  className={`flex-1 text-[9px] font-black rounded-sm transition-all cursor-pointer py-0.5 ${
                    targetCount === 108 ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  108
                </button>
                <button 
                  onClick={() => setTargetCount(1008)}
                  className={`flex-1 text-[8px] font-black rounded-sm transition-all cursor-pointer py-0.5 ${
                    targetCount === 1008 ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  1008
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
