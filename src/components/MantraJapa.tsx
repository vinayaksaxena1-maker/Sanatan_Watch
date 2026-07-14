import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Timer,
  Activity,
  Award
} from 'lucide-react';
import { getTranslation, Language } from '../utils/translations';

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

interface MantraJapaProps {
  language?: Language;
}

export function MantraJapa({ language = 'English' }: MantraJapaProps) {
  const [sadhanaTab, setSadhanaTab] = useState<'japa' | 'meditation'>('japa');
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS[0]);
  const [count, setCount] = useState<number>(0);
  const [malaCount, setMalaCount] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(108);
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);
  const [isRippling, setIsRippling] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50); // 0 to 100
  const [tunerPitch, setTunerPitch] = useState<'136.1' | '432' | '528'>('136.1');

  // Meditation States
  const [meditationTime, setMeditationTime] = useState<number>(10); // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(600); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [totalMeditationMinutes, setTotalMeditationMinutes] = useState<number>(0);

  // Audio elements references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sanatan_total_meditation_min');
    if (stored) {
      setTotalMeditationMinutes(parseInt(stored, 10));
    }
  }, []);

  // Sync timeLeft when meditationTime changes
  useEffect(() => {
    if (!isTimerRunning) {
      setTimeLeft(meditationTime * 60);
    }
  }, [meditationTime, isTimerRunning]);

  // Meditation Timer Countdown interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      playCompleteChime();
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100, 100, 200]);
      }
      setIsTimerRunning(false);
      stopAmbientSynth();
      const mins = meditationTime;
      setTotalMeditationMinutes(prev => {
        const next = prev + mins;
        localStorage.setItem('sanatan_total_meditation_min', String(next));
        return next;
      });
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, meditationTime]);

  const getFrequencyForPitch = (pitch: string) => {
    switch (pitch) {
      case '432': return { base: 432, baseType: 'sine' as OscillatorType, harm: 864, cutoff: 600 };
      case '528': return { base: 528, baseType: 'sine' as OscillatorType, harm: 1056, cutoff: 700 };
      case '136.1':
      default: return { base: 136.1, baseType: 'sawtooth' as OscillatorType, harm: 272.2, cutoff: 250 };
    }
  };

  // Initialize Audio Synth
  const startAmbientSynth = () => {
    try {
      if (isSynthPlaying) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const pitchParams = getFrequencyForPitch(tunerPitch);
      osc.type = pitchParams.baseType;
      osc.frequency.setValueAtTime(pitchParams.base, ctx.currentTime);

      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(pitchParams.harm, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(pitchParams.cutoff, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gainValue = (volume / 100) * 0.12; 
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 1.2); // Smooth fade in

      osc.connect(filter);
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(0.04, ctx.currentTime);
      oscHarmonic.connect(hGain);
      hGain.connect(filter);

      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscHarmonic.start();

      activeOscillatorsRef.current = [osc, oscHarmonic];
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
          activeOscillatorsRef.current.forEach(node => {
            try {
              node.stop();
            } catch {}
          });
          activeOscillatorsRef.current = [];
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
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime((volume / 100) * 0.12, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Handle active oscillator pitch adjustment dynamically
  useEffect(() => {
    if (isSynthPlaying) {
      stopAmbientSynth();
      setTimeout(() => {
        startAmbientSynth();
      }, 550);
    }
  }, [tunerPitch]);

  useEffect(() => {
    return () => {
      if (isSynthPlaying) {
        stopAmbientSynth();
      }
    };
  }, [isSynthPlaying]);

  const handleTap = () => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 260);

    playBeadDing();

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    setCount(prev => {
      const next = prev + 1;
      if (next >= targetCount) {
        setMalaCount(m => m + 1);
        playCompleteChime();
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        return 0;
      }
      return next;
    });
  };

  const playBeadDing = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      
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
      osc1.frequency.setValueAtTime(528, ctx.currentTime); 
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.3, ctx.currentTime); 

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

  const handleStartTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      stopAmbientSynth();
    } else {
      setIsTimerRunning(true);
      setTimeLeft(prev => (prev > 0 ? prev : meditationTime * 60));
      startAmbientSynth();
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    stopAmbientSynth();
    setTimeLeft(meditationTime * 60);
  };

  const formatTimerStr = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="mantra_japa_root" className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* Sadhana Navigation Tabs */}
      <div className="flex items-center gap-x-2.5 pb-1.5 border-b border-orange-100/50 dark:border-zinc-800/60 mb-1.5 text-[11px] font-bold">
        <span
          onClick={() => {
            setSadhanaTab('japa');
            stopAmbientSynth();
            setIsTimerRunning(false);
          }}
          className={`cursor-pointer transition-all hover:underline ${
            sadhanaTab === 'japa'
              ? 'text-orange-655 font-extrabold dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {getTranslation(language, 'sadhanaTabJapa')}
        </span>
        <span className="text-slate-300 dark:text-zinc-800 select-none">|</span>
        <span
          onClick={() => {
            setSadhanaTab('meditation');
            stopAmbientSynth();
            setIsTimerRunning(false);
          }}
          className={`cursor-pointer transition-all hover:underline ${
            sadhanaTab === 'meditation'
              ? 'text-orange-655 font-extrabold dark:text-amber-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {getTranslation(language, 'sadhanaTabMeditation')}
        </span>
      </div>

      {/* Dynamic Sound Controls Container with Japa Tuner */}
      <div className="bg-linear-to-r from-orange-500/10 to-amber-500/10 rounded-2xl p-4 border border-orange-100 dark:border-zinc-800/60 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 px-2.5 bg-orange-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider font-mono">
              {getTranslation(language, 'cosmicTuner')}
            </span>
            {isSynthPlaying && (
              <span className="text-[10px] text-emerald-500 font-black animate-pulse flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block animate-ping"></span>
                {getTranslation(language, 'activePitch')} ({tunerPitch === '136.1' ? '136.1Hz OM' : tunerPitch === '432' ? '432Hz Cosmic' : '528Hz Miracle'})
              </span>
            )}
          </div>
          <p className="text-xs font-serif font-black text-slate-800 dark:text-orange-50">
            {getTranslation(language, 'tunerDescription')}
          </p>
          
          {/* Tuner Pitch Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[9px] text-slate-400 font-mono uppercase">{getTranslation(language, 'tunerPitchLabel')}</span>
            <button
              onClick={() => setTunerPitch('136.1')}
              className={`text-[9.5px] font-black px-2 py-0.5 rounded border transition-all cursor-pointer ${
                tunerPitch === '136.1'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white/60 dark:bg-zinc-955/20 text-slate-600 dark:text-slate-400 border-slate-200/40'
              }`}
            >
              136.1Hz (OM)
            </button>
            <button
              onClick={() => setTunerPitch('432')}
              className={`text-[9.5px] font-black px-2 py-0.5 rounded border transition-all cursor-pointer ${
                tunerPitch === '432'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white/60 dark:bg-zinc-955/20 text-slate-600 dark:text-slate-400 border-slate-200/40'
              }`}
            >
              432Hz (Cosmic)
            </button>
            <button
              onClick={() => setTunerPitch('528')}
              className={`text-[9.5px] font-black px-2 py-0.5 rounded border transition-all cursor-pointer ${
                tunerPitch === '528'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white/60 dark:bg-zinc-955/20 text-slate-600 dark:text-slate-400 border-slate-200/40'
              }`}
            >
              528Hz (Healing)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto select-none flex-wrap">
          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-white/40 dark:bg-zinc-955/20 px-3 py-1.5 rounded-xl border border-orange-100/20">
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
            <span className="text-[10px] font-bold text-slate-605 dark:text-zinc-400 font-mono w-6">{volume}%</span>
          </div>

          <button
            onClick={isSynthPlaying ? stopAmbientSynth : startAmbientSynth}
            className={`px-4.5 py-2.5 rounded-xl text-3xs font-black shadow-3xs cursor-pointer flex items-center gap-1.5 transition-all ${
              isSynthPlaying 
                ? 'bg-rose-500 text-white border border-rose-600' 
                : 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600'
            }`}
          >
            {isSynthPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> {getTranslation(language, 'soundMute')}
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> {getTranslation(language, 'soundPlay')}
              </>
            )}
          </button>
        </div>
      </div>

      {sadhanaTab === 'japa' ? (
        /* TAB 1: MANTRA JAPA INTERACTIVE PANEL */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Mantra Selector Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-1">
              <h3 className="font-serif font-black text-slate-800 dark:text-amber-100 text-sm sm:text-base">
                {getTranslation(language, 'selectMantra')}
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
                        {language === 'Hindi' ? m.hindiName : m.name}
                      </h4>
                      <span className="text-[9.5px] font-extrabold uppercase bg-orange-100/50 dark:bg-zinc-905 text-orange-655 dark:text-amber-505 px-2.5 py-0.5 rounded-full font-mono">
                        {getTranslation(language, 'targetLabel')} {m.defaultTarget}
                      </span>
                    </div>

                    <p className="text-[12.5px] font-semibold text-orange-800 dark:text-amber-200/90 font-serif border-l-2 border-orange-405 pl-2.5 my-3 py-1 bg-slate-50/50 dark:bg-stone-900/40">
                      {m.text}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-sans mt-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{getTranslation(language, 'meaningLabel')}</span> {language === 'Hindi' ? m.meaning : 'Cosmic vibration chanting for inner peace and concentration.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Japa Bead Card */}
          <div className="bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 p-5 rounded-3xl shadow-xs text-center flex flex-col justify-between items-center relative overflow-hidden min-h-[380px]">
            
            <div className="w-full text-left flex justify-between items-center mb-3">
              <div>
                <span className="text-[10px] tracking-widest text-[#FF9933] font-bold uppercase block font-mono">
                  {getTranslation(language, 'japaMalaTitle')}
                </span>
                <h4 className="text-xs font-serif font-black text-slate-800 dark:text-slate-200">
                  {getTranslation(language, 'japaMalaDesc')}
                </h4>
              </div>
              
              <button 
                onClick={handleReset}
                className="p-1.5 rounded-xl border border-slate-200 hover:border-orange-400 dark:border-zinc-800 text-slate-450 hover:text-orange-500 transition-colors shadow-3xs hover:bg-slate-50 dark:hover:bg-zinc-900/60 cursor-pointer"
                title={language === 'Hindi' ? 'पुनः स्थापित करें' : 'Reset'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Click Area */}
            <div className="relative my-4 flex items-center justify-center select-none">
              <div className={`absolute inset-0 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-xl transition-all duration-305 ${
                isRippling ? 'scale-150 opacity-100' : 'scale-90 opacity-0'
              }`}></div>

              <button 
                onClick={handleTap}
                className={`w-40 h-40 rounded-full border-4 border-amber-500/45 bg-linear-to-br from-orange-400 to-amber-50 hover:from-orange-500 hover:to-amber-600 shadow-md flex flex-col items-center justify-center text-white transition-all transform active:scale-95 z-10 cursor-pointer relative ${
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
                  {getTranslation(language, 'tapBead')}
                </span>

                <div className="absolute bottom-4 flex items-center gap-1 text-[8px] bg-amber-955/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest font-mono text-amber-100 w-auto">
                  {count}/{targetCount} {language === 'Hindi' ? 'जप' : 'Japa'}
                </div>
              </button>
            </div>

            {/* Stats Summary Panel */}
            <div className="w-full bg-slate-50 dark:bg-zinc-900/30 rounded-2xl p-3 border border-slate-100 dark:border-zinc-800/40 grid grid-cols-2 gap-2 mt-2">
              <div className="text-left border-r border-slate-200/50 dark:border-zinc-800/50 pr-2">
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-mono">
                  {getTranslation(language, 'rotations')}:
                </span>
                <span className="text-base font-bold text-orange-655 dark:text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-4 h-4 text-orange-500 animate-spin" style={{ animationDuration: '6s' }} />
                  {malaCount} {getTranslation(language, 'rotationsUnit')}
                </span>
              </div>

              <div className="text-left pl-1">
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-mono">
                  {getTranslation(language, 'beadGoal')}
                </span>
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
      ) : (
        /* TAB 2: MEDITATION TIMER SECTION */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Settings and stats */}
          <div className="md:col-span-2 space-y-5">
            
            {/* Meditation Duration Selection */}
            <div className="bg-white dark:bg-zinc-955/20 border border-slate-100 dark:border-zinc-900/45 p-5 rounded-3xl text-left space-y-4">
              <div>
                <h3 className="font-serif font-black text-slate-850 dark:text-orange-50 text-sm sm:text-base flex items-center gap-1.5">
                  <Timer className="w-5 h-5 text-orange-505" />
                  {getTranslation(language, 'meditationDuration')}
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                  {getTranslation(language, 'meditationIntro')}
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[5, 10, 15, 20, 30, 60].map((t) => (
                  <button
                    key={t}
                    disabled={isTimerRunning}
                    onClick={() => setMeditationTime(t)}
                    className={`p-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer text-center ${
                      meditationTime === t
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white/80 dark:bg-zinc-900/40 text-slate-700 dark:text-slate-355 border-slate-200/40 hover:bg-slate-50 disabled:opacity-40'
                    }`}
                  >
                    {t} {getTranslation(language, 'minutesUnit')}
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics & Achievements Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 p-4 rounded-3xl flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-955/30 text-orange-655 shrink-0">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-mono block">{getTranslation(language, 'totalSadhanaTime')}</span>
                  <span className="text-lg font-black text-slate-800 dark:text-orange-200 font-mono block mt-0.5">
                    {totalMeditationMinutes} {getTranslation(language, 'minutesLongUnit')}
                  </span>
                  <p className="text-[9.5px] text-slate-500 leading-tight mt-1 font-sans">
                    {getTranslation(language, 'dailyPracticeRecord')}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 p-4 rounded-3xl flex gap-3.5 items-start">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-955/30 text-amber-550 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-mono block">{getTranslation(language, 'meditationLevel')}</span>
                  <span className="text-lg font-black text-slate-800 dark:text-orange-200 font-serif block mt-0.5">
                    {totalMeditationMinutes >= 120 ? getTranslation(language, 'meditationLevelSadhak') : totalMeditationMinutes >= 30 ? getTranslation(language, 'meditationLevelSeeker') : getTranslation(language, 'meditationLevelNovice')}
                  </span>
                  <p className="text-[9.5px] text-slate-500 leading-tight mt-1 font-sans">
                    {totalMeditationMinutes >= 120 ? getTranslation(language, 'levelSadhakDesc') : totalMeditationMinutes >= 30 ? getTranslation(language, 'levelSeekerDesc') : getTranslation(language, 'levelNoviceDesc')}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Countdown Card */}
          <div className="bg-white dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-900/45 p-5 rounded-3xl shadow-xs text-center flex flex-col justify-between items-center relative overflow-hidden min-h-[380px]">
            <div className="w-full text-left flex justify-between items-center mb-3">
              <div>
                <span className="text-[10px] tracking-widest text-[#FF9933] font-bold uppercase block font-mono">
                  {getTranslation(language, 'meditationCycle')}
                </span>
                <h4 className="text-xs font-serif font-black text-slate-800 dark:text-slate-200">
                  {getTranslation(language, 'meditationCycleDesc')}
                </h4>
              </div>
              
              <button 
                onClick={handleResetTimer}
                className="p-1.5 rounded-xl border border-slate-200 hover:border-orange-400 dark:border-zinc-800 text-slate-450 hover:text-orange-500 transition-colors shadow-3xs hover:bg-slate-50 dark:hover:bg-zinc-900/60 cursor-pointer"
                title={language === 'Hindi' ? 'रीसेट करें' : 'Reset'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Circular Progress Timer */}
            <div className="relative my-4 flex items-center justify-center select-none">
              <div className={`absolute w-36 h-36 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-xl transition-all duration-700 ${
                isTimerRunning ? 'scale-125 opacity-100' : 'scale-90 opacity-0'
              }`}></div>

              <svg width="160" height="160" className="rotate-[-90deg]">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  className="stroke-slate-100 dark:stroke-zinc-900 fill-none" 
                  strokeWidth="6"
                />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  className="stroke-orange-500 dark:stroke-amber-500 fill-none transition-all duration-1000" 
                  strokeWidth="6"
                  strokeDasharray="439.8"
                  strokeDashoffset={439.8 * (1 - (timeLeft / (meditationTime * 60)))}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-black text-slate-800 dark:text-orange-50 leading-none">
                  {formatTimerStr(timeLeft)}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-405 dark:text-zinc-550 mt-1 font-mono">
                  {getTranslation(language, 'timerRemaining')}
                </span>
              </div>
            </div>

            {/* Start/Stop Button */}
            <button
              onClick={handleStartTimer}
              className={`w-full py-3 rounded-2xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                isTimerRunning 
                  ? 'bg-rose-500 text-white hover:bg-rose-605' 
                  : 'bg-orange-500 dark:bg-orange-655 text-white hover:bg-orange-600'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> {getTranslation(language, 'pauseMeditation')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> {getTranslation(language, 'startMeditation')}
                </>
              )}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
