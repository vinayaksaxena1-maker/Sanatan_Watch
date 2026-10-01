/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import * as d3 from 'd3';
import { Moon, Sparkles, RefreshCw, Info, ThumbsUp } from 'lucide-react';
import { PanchangInfo, PakshaType } from '../types';

interface MoonPhaseVisualizerProps {
  panchang: PanchangInfo;
}

interface TithiDetail {
  value: number;
  name: string;
  hindiName: string;
  energy: string;
  deity: string;
  spirituality: string;
}

// 15 Tithis within a single Paksha
const MOON_PAKSHA_DAYS: TithiDetail[] = [
  { value: 1, name: 'Pratipada', hindiName: 'प्रतिपदा (१)', energy: 'नया आरंभ', deity: 'अग्नि देव', spirituality: 'सकारात्मक संकल्प व नए कार्यों की शुरुआत हेतु श्रेष्ठ।' },
  { value: 2, name: 'Dwitiya', hindiName: 'द्वितीया (२)', energy: 'स्थिरता व संचय', deity: 'ब्रह्मा जी', spirituality: 'गृह निर्माण, स्थिरता और स्थायी संपत्तियों के लिए लाभकारी।' },
  { value: 3, name: 'Tritiya', hindiName: 'तृतीया (३)', energy: 'समृद्धि व कला', deity: 'माँ गौरी', spirituality: 'संगीत, कला और मांगलिक उत्सवों के लिए सर्वोत्तम दिन।' },
  { value: 4, name: 'Chaturthi', hindiName: 'चतुर्थी (४)', energy: 'बाधा निवारण', deity: 'श्री गणेश', spirituality: 'श्री गणेश पूजा से विघ्न शांत होते हैं, साधना के लिए तीव्र दिन।' },
  { value: 5, name: 'Panchami', hindiName: 'पंचमी (५)', energy: 'ज्ञान व चेतना', deity: 'नाग देवता', spirituality: 'विद्या आरंभ, आध्यात्मिक प्रगति और नाग आराधना हेतु श्रेष्ठ।' },
  { value: 6, name: 'Shashti', hindiName: 'षष्ठी (६)', energy: 'अनुशासन व ओज', deity: 'कार्तिकेय', spirituality: 'यश, कीर्ति और शत्रुओं पर विजय प्राप्त करने की साधना।' },
  { value: 7, name: 'Saptami', hindiName: 'सप्तमी (७)', energy: 'आरोग्य व तेज', deity: 'सूर्य देव', spirituality: 'आरोग्य लाभ और सूर्य देव की उपासना हेतु विशेष रूप से ऊर्जावान।' },
  { value: 8, name: 'Ashtami', hindiName: 'अष्टमी (८)', energy: 'शक्ति संचय', deity: 'माँ दुर्गा', spirituality: 'मंत्र दीक्षा, ध्यान व दिव्य ऊर्जा की पूजा हेतु पवित्र अर्धचंद्र।' },
  { value: 9, name: 'Navami', hindiName: 'नवमी (९)', energy: 'आत्मबल व मर्यादा', deity: 'माँ दुर्गा/राम', spirituality: 'कठिन संकल्पों और आंतरिक शत्रुओं पर विजय हेतु आत्मबल।' },
  { value: 10, name: 'Dashami', hindiName: 'दशमी (१०)', energy: 'दिग्विजय', deity: 'यमराज', spirituality: 'दशों दिशाओं में कीर्ति और धर्म कार्यों की स्थापना के लिए शुभ।' },
  { value: 11, name: 'Ekadashi', hindiName: 'एकादशी (११)', energy: 'पूर्ण शुद्धि व व्रत', deity: 'श्री विष्णु', spirituality: 'परम मोक्षदायिनी एकादशी। उपवास और विशेष ध्यान के योग्य।' },
  { value: 12, name: 'Dwadashi', hindiName: 'द्वादशी (१२)', energy: 'तप व सेवा', deity: 'सूर्य देव', spirituality: 'साधना के पूर्ण फल की प्राप्ति, दान और पवित्र अनुष्ठान।' },
  { value: 13, name: 'Trayodashi', hindiName: 'त्रयोदशी (१३)', energy: 'शिव शक्ति मिलन', deity: 'कामदेव', spirituality: 'प्रदोष काल व्रत और भगवान शिव की असीम कृपा प्राप्त करने का योग।' },
  { value: 14, name: 'Chaturdashi', hindiName: 'चतुर्दशी (१४)', energy: 'गहन अध्यात्म', deity: 'भगवान शिव', spirituality: 'शिव आराधना व ध्यान के द्वारा मानसिक विकारों की शुद्धि।' },
  { value: 15, name: 'Purnima / Amavasya', hindiName: 'पूर्णिमा / अमावस्या (१५)', energy: 'पूर्णत्व / मौन', deity: 'चंद्रमा / पितृ', spirituality: 'पूर्णिमा: पूर्ण ऊर्जा, ध्यान व संतोष; अमावस्या: मौन, ध्यान व पितृ तर्पण।' }
];

export function MoonPhaseVisualizer({ panchang }: MoonPhaseVisualizerProps) {
  const currentTithiValue = panchang.hinduDate.tithi.value;
  const paksha: PakshaType = panchang.hinduDate.paksha;

  // Convert tithi value (1-30) to Paksha index (1-15)
  // 1-15 is Shukla, 16-30 is Krishna. Map 16 to 1, 30 to 15.
  const todayPakshaDay = useMemo(() => {
    const val = currentTithiValue;
    if (val <= 15) return val;
    const diff = val - 15;
    return diff;
  }, [currentTithiValue]);

  // Set selected/hovered Tithi for interactivity (defaults to today's Paksha day)
  const [selectedDay, setSelectedDay] = useState<number>(todayPakshaDay);

  // Sync state if today's package day changes
  useEffect(() => {
    setSelectedDay(todayPakshaDay);
  }, [todayPakshaDay]);

  const activeTithiInfo = useMemo(() => {
    return MOON_PAKSHA_DAYS.find(d => d.value === selectedDay) || MOON_PAKSHA_DAYS[0];
  }, [selectedDay]);

  // Calculations for simulated Moon phase based on selected selection
  const calculatedIllumination = useMemo(() => {
    // 1 to 15 represents the progression.
    // Day 1 has low illumination, Day 15 is 100% (Purnima) or 0% (Amavasya) depending on Paksha.
    // BUT since we let the user hover, we want to show:
    // - If Shukla: growing from 0% (at day 0) to 100% (at day 15).
    // - If Krishna: shrinking from 100% (at day 0) to 0% (at day 15).
    const fraction = selectedDay / 15;
    if (paksha === 'Shukla') {
      // Shukla: starts thin crescent, reaches full at 15
      return (1 - Math.cos(fraction * Math.PI)) / 2;
    } else {
      // Krishna: starts full-ish, reaches new moon (0%) at 15
      return (1 + Math.cos(fraction * Math.PI)) / 2;
    }
  }, [selectedDay, paksha]);

  // SVG drawing dimensions & coordinates
  const width = 300;
  const height = 240;
  const cx = width / 2;
  const cy = height / 2 + 15;
  const rOrbit = 100;
  const rMoon = 42;

  // D3 scale to map selection values (1 to 15) to angles (in degrees)
  // Let's sweep an arc over the top of the moon: from -165 degrees to -15 degrees
  const angleScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([1, 15])
      .range([-165, -15]);
  }, []);

  // Compute coordinates for each day on the arc
  const orbitPoints = useMemo(() => {
    return MOON_PAKSHA_DAYS.map(day => {
      const angleDeg = angleScale(day.value);
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = cx + rOrbit * Math.cos(angleRad);
      const y = cy + rOrbit * Math.sin(angleRad);
      return {
        day: day.value,
        x,
        y,
        label: day.value.toString()
      };
    });
  }, [cx, cy, rOrbit, angleScale]);

  // Generate path string for the orbit arc using D3 line generator
  const orbitPathStr = useMemo(() => {
    const points: [number, number][] = orbitPoints.map(p => [p.x, p.y]);
    const lineGen = d3.line()
      .curve(d3.curveBasis);
    return lineGen(points) || '';
  }, [orbitPoints]);

  /**
   * Generates the SVG path for the Moon phase illumination.
   * Leverages horizontal mirroring for Krishna paksha to keep math clean and pristine.
   */
  const moonPathStr = useMemo(() => {
    const R = rMoon;
    const I = calculatedIllumination;
    const rx = R * Math.abs(2 * I - 1);
    
    if (I <= 0.5) {
      // Clean crescent path: right boundary arc, then return inner arc reversing direction (sweep 0)
      return `M 0 -${R} A ${R} ${R} 0 0 1 0 ${R} A ${rx} ${R} 0 0 0 0 -${R} Z`;
    } else {
      // Beautiful gibbous path: right boundary arc, then return inner arc extending outward (sweep 1)
      return `M 0 -${R} A ${R} ${R} 0 0 1 0 ${R} A ${rx} ${R} 0 0 1 0 -${R} Z`;
    }
  }, [calculatedIllumination, rMoon]);

  // Highlight color configurations for UI
  const systemColorAccent = paksha === 'Shukla' ? 'text-amber-500' : 'text-[#818CF8]';
  const systemBgAccent = paksha === 'Shukla' ? 'bg-amber-100/50' : 'bg-indigo-100/30';
  const glowShadow = paksha === 'Shukla' 
    ? 'shadow-[0_0_25px_rgba(245,158,11,0.25)] border-amber-200' 
    : 'shadow-[0_0_25px_rgba(129,140,248,0.2)] border-indigo-200';

  return (
    <div id="moon_phase_visualizer_root" className="glass-card-light dark:glass-card-dark p-5 sm:p-6 text-left border border-slate-100 dark:border-dark-border">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-orange-600 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />
            ॥ खगोलीय चंद्र स्थिति ॥
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-850 dark:text-dark-text-pri font-serif mt-0.5 leading-tight">
            पक्ष चंद्र कला एवं तिथि चक्र 
          </h3>
          <p className="text-[10.5px] text-slate-450 dark:text-dark-text-mut mt-1 max-w-lg">
            चंद्रमा के {paksha === 'Shukla' ? 'शुक्ल पक्ष (वैश्विक उदय)' : 'कृष्ण पक्ष (वैश्विक क्षय)'} की गति। चक्र के बिंदुओं पर स्पर्श/माउस ले जाकर अन्य तिथियों का प्रभाव देखें।
          </p>
        </div>

        {selectedDay !== todayPakshaDay && (
          <button
            id="reset_moon_button"
            onClick={() => setSelectedDay(todayPakshaDay)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold text-orange-600 bg-orange-50 dark:bg-dark-card border border-orange-200/50 hover:bg-orange-100 rounded-full transition-all shrink-0 cursor-pointer shadow-3xs"
          >
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
            आज की तिथि ({todayPakshaDay})
          </button>
        )}
      </div>

      {/* Main Dual Design Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Left Side: Interwoven SVG Orbit Board */}
        <div className="lg:col-span-6 flex justify-center bg-slate-50/50 dark:bg-[#1E1914]/65 rounded-2xl p-4 border border-slate-100/40 dark:border-dark-border relative overflow-hidden h-[260px]">
          
          {/* Subtle starry background dots */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-6 left-12 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-16 right-16 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-12 left-1/4 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-28 left-4/5 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>

          <svg 
            id="moon_d3_viewport"
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${width} ${height}`} 
            className="select-none overflow-visible max-w-[305px] sm:max-w-xs"
          >
            {/* Ambient Celestial Glow behind Moon */}
            <defs>
              <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={paksha === 'Shukla' ? '#FFF5E6' : '#EEF2FF'} stopOpacity="0.8" />
                <stop offset="60%" stopColor={paksha === 'Shukla' ? '#FFFBEB' : '#E0E7FF'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={paksha === 'Shukla' ? '#FEF3C7' : '#C7D2FE'} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="moon-surface-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
              </radialGradient>
              <mask id="moon-crater-mask">
                <circle cx="0" cy="0" r={rMoon} fill="#FFF" />
              </mask>
            </defs>

            <circle 
              cx={cx} 
              cy={cy} 
              r={rMoon + 24} 
              fill="url(#sun-glow)" 
              className="pointer-events-none transition-all duration-300"
            />

            {/* Orbit Arc Line generated by D3 */}
            <path
              d={orbitPathStr}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="text-orange-200 dark:text-amber-900/30 transition-all"
            />

            {/* Orbit Endpoint Indicator Text */}
            <text
              x={cx - rOrbit - 15}
              y={cy - 12}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-400 dark:fill-zinc-500 font-serif"
            >
              प्रारंभ
            </text>
            <text
              x={cx + rOrbit + 15}
              y={cy - 12}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-400 dark:fill-zinc-500 font-serif"
            >
              {paksha === 'Shukla' ? 'पूर्णिमा' : 'अमावस्या'}
            </text>

            <g transform={`translate(${cx}, ${cy})`}>
              {/* Moon Base Sphere (Shadowed portion texture) */}
              <circle 
                cx="0" 
                cy="0" 
                r={rMoon} 
                fill="#181512" 
                stroke="#3E2001" 
                strokeWidth="1.5"
                className="transition-all"
              />

              {/* Moon craters on background sphere */}
              <g opacity="0.35" className="fill-stone-800 dark:fill-stone-900 pointer-events-none">
                <circle cx="-16" cy="-10" r="4.5" />
                <circle cx="-8" cy="-22" r="3" />
                <circle cx="12" cy="-15" r="5" />
                <circle cx="22" cy="10" r="6" />
                <circle cx="2" cy="18" r="4" />
                <circle cx="-20" cy="14" r="3" />
                {/* Micro craters */}
                <circle cx="-14" cy="22" r="1.5" />
                <circle cx="8" cy="-28" r="1.5" />
                <circle cx="-28" cy="-8" r="1.5" />
              </g>

              {/* Dynamic Illuminated Phase Overlay */}
              {/* If Krishna paksha, we horizontally flip the waxing shape to show waning! */}
              <g transform={paksha === 'Krishna' ? 'scale(-1, 1)' : undefined}>
                <path
                  d={moonPathStr}
                  fill={paksha === 'Shukla' ? '#FFF3D1' : '#E8EDFF'}
                  className="transition-all duration-300"
                  style={{
                    filter: `drop-shadow(0 0 10px ${paksha === 'Shukla' ? 'rgba(251,191,36,0.5)' : 'rgba(129,140,248,0.4)'})`
                  }}
                />
              </g>

              {/* Glow effects overlap on the crescent/gibbous line */}
              <circle 
                cx="0" 
                cy="0" 
                r={rMoon} 
                fill="url(#moon-surface-glow)" 
                className="pointer-events-none"
              />
            </g>

            {/* Orbit interactive nodes mapped with D3 */}
            {orbitPoints.map((pt) => {
              const isToday = pt.day === todayPakshaDay;
              const isSelected = pt.day === selectedDay;
              
              const nodeFill = isSelected 
                ? (paksha === 'Shukla' ? '#F59E0B' : '#6366F1')
                : isToday
                  ? (paksha === 'Shukla' ? '#FFF3D1' : '#E0E7FF')
                  : 'currentColor';
                  
              const textFill = isSelected
                ? '#FFF'
                : 'currentColor';

              return (
                <g 
                  key={pt.day}
                  className="cursor-pointer transition-all duration-200 group"
                  onClick={() => setSelectedDay(pt.day)}
                  onMouseEnter={() => setSelectedDay(pt.day)}
                >
                  {/* Glowing Outer Indicator Ring for Today or Selected */}
                  {(isToday || isSelected) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isToday ? 11 : 9}
                      fill="none"
                      stroke={isToday ? '#FF9933' : (paksha === 'Shukla' ? '#F59E0B' : '#6366F1')}
                      strokeWidth="1.5"
                      strokeDasharray={isToday && !isSelected ? "2,2" : "none"}
                      className={isToday ? "animate-spin-slow origin-center" : ""}
                      style={{ transformOrigin: `${pt.x}px ${pt.y}px`, animationDuration: '8s' }}
                    />
                  )}

                  {/* Hotspot Hover Target circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="15"
                    fill="transparent"
                    className="hover:scale-110 transition-transform"
                  />

                  {/* Node Dot itself */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6.5 : isToday ? 5.5 : 4}
                    fill={nodeFill}
                    className="text-stone-300 dark:text-stone-700 hover:text-orange-500 transition-all elevation-xs"
                  />

                  {/* Floating Number Label above node */}
                  {isSelected && (
                    <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                      <rect 
                        x="-7.5" 
                        y="-7.5" 
                        width="15" 
                        height="13" 
                        rx="3" 
                        fill={paksha === 'Shukla' ? '#FF9933' : '#4F46E5'} 
                        className="shadow-2xs" 
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="extrabold"
                        fill="#FFF"
                        fontFamily="monospace"
                      >
                        {pt.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Side: Detailed Spiritual Translation Info Column */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-4">
          
          {/* Top Panel: Big Tithi Info Highlight */}
          <div className={`p-4 rounded-2xl border transition-all ${glowShadow} bg-white dark:bg-[#1E1914]/80`}>
            <div className="flex justify-between items-center">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider font-mono ${systemColorAccent} ${systemBgAccent}`}>
                तारीख स्थिति: दिन {selectedDay} / १५ ({paksha === 'Shukla' ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'})
              </span>
              <span className="text-2xs font-extrabold text-slate-400 font-mono">
                चंद्र कला: {Math.round(calculatedIllumination * 100)}%
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-orange-100 flex items-center gap-1.5 mt-2">
              <Moon className={`w-4 h-4 ${systemColorAccent} shrink-0 animate-pulse`} />
              {activeTithiInfo.hindiName}
            </h4>

            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-dark-border">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">ऊर्जा तत्त्व</span>
                <span className="text-[11.5px] font-black text-slate-700 dark:text-dark-text-pri block">{activeTithiInfo.energy}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">अधिपति देवता</span>
                <span className="text-[11.5px] font-black text-slate-700 dark:text-dark-text-pri block">{activeTithiInfo.deity}</span>
              </div>
            </div>
          </div>

          {/* Deep traditional lore text block */}
          <div className="p-4 rounded-xl bg-orange-50/30 dark:bg-[#2A2016]/40 border border-orange-200/20 text-left text-xs text-slate-755 dark:text-slate-305 flex gap-2.5">
            <Info className="w-5 h-5 text-[#FF9933] shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-850 dark:text-dark-text-pri font-bold block mb-1">वैदिक प्रभाव और साधना निर्देश:</strong>
              <p className="leading-relaxed font-sans text-[11px] sm:text-xs">
                {activeTithiInfo.spirituality} इस दिन चंद्र कलाओं का मानसिक शक्तियों पर गहरा सूक्ष्म प्रभाव पड़ता है।
              </p>
            </div>
          </div>

          {/* Prompt action guidelines */}
          <div className="text-[10px] sm:text-[10.5px] text-slate-400 dark:text-dark-text-mut font-sans leading-tight flex items-center gap-1.5 bg-slate-100/30 dark:bg-stone-900/10 p-2 rounded-lg">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {paksha === 'Shukla' 
                ? 'शुक्ल पक्ष में चंद्रमा बढ़ता है, यह नए कार्यों के सृजन, समृद्धि और विकास का समय है।' 
                : 'कृष्ण पक्ष में चंद्रमा घटता है, यह आंतरिक शुद्धि, साधना और तनाव विमुक्ति का समय है।'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
