/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';
import { PanchangInfo, ChoghadiyaInterval, HoraInterval } from '../types';

interface SanatanTimeWheelProps {
  panchang: PanchangInfo;
  currentTime: Date;
}

export function SanatanTimeWheel({ panchang, currentTime }: SanatanTimeWheelProps) {
  const [pulseScale, setPulseScale] = useState(1);

  // Simple scale pulse animation for active elements
  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setPulseScale(prev => {
        if (prev >= 1.05) direction = -1;
        if (prev <= 0.95) direction = 1;
        return prev + 0.01 * direction;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Helper to convert time string (e.g. "05:45 AM") to absolute minutes of the day
  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      const [timePart, ampmPart] = timeStr.split(' ');
      if (!timePart || !ampmPart) return 0;
      let [hrs, mins] = timePart.split(':').map(Number);
      if (ampmPart === 'PM' && hrs !== 12) hrs += 12;
      if (ampmPart === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    } catch {
      return 0;
    }
  };

  const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

  const isTimeInInterval = (currMin: number, startStr: string, endStr: string): boolean => {
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    if (start <= end) {
      return currMin >= start && currMin < end;
    } else {
      return currMin >= start || currMin < end;
    }
  };

  // 1. Determine active Choghadiya and active Hora
  const activeChoghadiya = useMemo(() => {
    return panchang.choghadiya.find(ch => isTimeInInterval(currentMin, ch.startTime, ch.endTime));
  }, [panchang.choghadiya, currentMin]);

  const activeHora = useMemo(() => {
    return panchang.hora?.find(h => isTimeInInterval(currentMin, h.startTime, h.endTime));
  }, [panchang.hora, currentMin]);

  // Determine if it is currently daytime
  const isDaytime = useMemo(() => {
    const sunriseMin = parseTimeToMinutes(panchang.sunrise);
    const sunsetMin = parseTimeToMinutes(panchang.sunset);
    if (sunriseMin <= sunsetMin) {
      return currentMin >= sunriseMin && currentMin < sunsetMin;
    } else {
      return currentMin >= sunriseMin || currentMin < sunsetMin;
    }
  }, [panchang.sunrise, panchang.sunset, currentMin]);

  // Filter 8 Choghadiyas for the current period (Day vs Night)
  const currentChoghadiyas = useMemo(() => {
    return panchang.choghadiya.filter(ch => ch.isDay === isDaytime).slice(0, 8);
  }, [panchang.choghadiya, isDaytime]);

  // Filter 12 Horas for the current period
  const currentHoras = useMemo(() => {
    return (panchang.hora || []).filter(h => h.isDay === isDaytime).slice(0, 12);
  }, [panchang.hora, isDaytime]);

  // Coordinate geometry helpers
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const getArcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  // Choghadiya colors mapping
  const getChoghadiyaColor = (type: string) => {
    switch (type) {
      case 'Amrit':
      case 'Labh':
      case 'Shubh':
        return '#10B981'; // Auspicious Green
      case 'Chal':
        return '#F59E0B'; // Neutral Amber
      case 'Kaal':
      case 'Rog':
      case 'Udveg':
      default:
        return '#EF4444'; // Inauspicious Red
    }
  };

  // Planetary Lord abbreviations and colors mapping for Horas
  const getPlanetLordInfo = (lord: string) => {
    const map: Record<string, { label: string; color: string }> = {
      'Sun': { label: 'सू', color: '#FDBA74' }, // Orange-gold
      'Moon': { label: 'च', color: '#E2E8F0' }, // Silver-white
      'Mars': { label: 'मं', color: '#FCA5A5' }, // Soft Red
      'Mercury': { label: 'बु', color: '#86EFAC' }, // Soft Green
      'Jupiter': { label: 'गु', color: '#FDE047' }, // Soft Yellow
      'Venus': { label: 'शु', color: '#93C5FD' }, // Soft Cyan-blue
      'Saturn': { label: 'श', color: '#C084FC' }  // Muted Purple
    };
    return map[lord] || { label: lord.substring(0, 1), color: '#94A3B8' };
  };



  // Digital clock formatting
  const hours = currentTime.getHours();
  const minsStr = currentTime.getMinutes().toString().padStart(2, '0');
  const secsStr = currentTime.getSeconds().toString().padStart(2, '0');
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';


  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 select-none">
      
      {/* Interactive Title Frame */}
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <span className="text-[10px] sm:text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
          <Sun className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '20s' }} />
          कालचक्रम्: {isDaytime ? '🌞 दिवा कालखण्ड' : '🌙 रात्रि कालखण्ड'}
        </span>
        {activeChoghadiya && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
            सक्रिय: {activeChoghadiya.hindiName || activeChoghadiya.name}
          </span>
        )}
      </div>

      {/* Main Vector Embodiment */}
      <div className="relative w-full aspect-square flex items-center justify-center p-2">
        
        {/* Soft Glassmorphic Panel Wrapper */}
        <div className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#1E150F] via-[#0E0705] to-[#120B08] border border-orange-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:10px_10px]" />
        </div>

        <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 drop-shadow-2xl">
          <defs>
            {/* Elegant Golden Radial Glow for dial outer bevel */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF5C3" />
              <stop offset="30%" stopColor="#F4B400" />
              <stop offset="70%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#7A5802" />
            </linearGradient>
            
            <linearGradient id="templeStoneBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E140F" />
              <stop offset="100%" stopColor="#080402" />
            </linearGradient>

            <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* ================= LAYER 2: CHAUGHADIYA RING (8 SEGMENTS) ================= */}
          {currentChoghadiyas.map((ch, idx) => {
            const startMin = parseTimeToMinutes(ch.startTime);
            const endMin = parseTimeToMinutes(ch.endTime);
            const startAngle = (startMin % 720) * 0.5;
            let endAngle = (endMin % 720) * 0.5;
            if (endAngle <= startAngle) {
              endAngle += 360;
            }
            const isSelfActive = activeChoghadiya?.name === ch.name && activeChoghadiya?.startTime === ch.startTime;
            const color = getChoghadiyaColor(ch.type);
            const path = getArcPath(200, 200, 168, startAngle + 0.8, endAngle - 0.8);
            const labelPos = polarToCartesian(200, 200, 168, startAngle + (endAngle - startAngle) / 2);

            return (
              <g key={ch.name + idx}>
                {/* Golden active frame behind the segment */}
                {isSelfActive && (
                  <path
                    d={path}
                    fill="none"
                    stroke="#FFD54F" // Golden frame color peeking out
                    strokeWidth="17" // Wider than 12 to show a border on both sides
                    strokeLinecap="round"
                    opacity="0.9"
                    filter="url(#activeGlow)"
                    style={{ transformOrigin: '200px 200px', transform: `scale(${pulseScale})` }}
                    className="transition-all duration-300"
                  />
                )}

                {/* Arc path segment */}
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity={isSelfActive ? 0.95 : 0.4}
                  filter={isSelfActive ? 'url(#activeGlow)' : undefined}
                  style={isSelfActive ? { transformOrigin: '200px 200px', transform: `scale(${pulseScale})` } : undefined}
                  className="transition-all duration-300"
                />
                
                {/* Tiny Devanagari Hindi initial of the Choghadiya name */}
                <text
                  x={labelPos.x}
                  y={labelPos.y + 3}
                  textAnchor="middle"
                  fill="#FFF"
                  className="font-serif font-black text-[7.5px]"
                  style={{ pointerEvents: 'none' }}
                >
                  {ch.hindiName ? ch.hindiName.substring(0, 2) : ch.name.substring(0, 2)}
                </text>
              </g>
            );
          })}

          {/* ================= LAYER 5: CENTER DIGITAL TIME CORE ================= */}
          {/* Dark Glass Ring overlay */}
          <circle cx="200" cy="200" r="44" fill="#0C0806" opacity="0.9" stroke="#503525" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="42" fill="none" stroke="#FFD54F" strokeWidth="0.5" opacity="0.25" />

          {/* Digital Time text displays inside center core */}
          <text
            x="200"
            y="190"
            textAnchor="middle"
            fill="#FFA726"
            className="font-mono font-black text-[13px] tracking-tight"
          >
            {displayHours}:{minsStr}
          </text>
          <text
            x="200"
            y="204"
            textAnchor="middle"
            fill="#EF5350"
            className="font-mono font-bold text-[8.5px]"
          >
            {secsStr}
          </text>
          <text
            x="200"
            y="218"
            textAnchor="middle"
            fill="#FFF"
            opacity="0.6"
            className="font-serif font-black text-[7.5px]"
          >
            {ampm}
          </text>
        </svg>
      </div>

      {/* Dial Metadata details display card */}
      <div className="w-full mt-3 p-3 bg-orange-950/15 border border-orange-900/30 rounded-2xl text-left">
        <div className="flex justify-between items-center gap-2 mb-1.5 pb-1 border-b border-orange-900/20">
          <span className="text-[10px] font-black uppercase text-amber-400 font-mono">वैदिक गणना विवरण</span>
          <span className="text-[9px] text-slate-400 dark:text-brand-text-mut font-mono">सूर्य उदय: {panchang.sunrise}</span>
        </div>
        <p className="text-[10.5px] text-slate-400 dark:text-brand-text-mut leading-normal italic">
          {activeChoghadiya ? `चक्र पर बाहरी हरा/पीला/लाल वलय वर्तमान चौघड़िया “${activeChoghadiya.hindiName || activeChoghadiya.name}” को दर्शा रहा है।` : 'कालचक्र की बाहरी वृत्त चौघड़िया एवं भीतरी वृत्त होरा काल को प्रदर्शित करती है।'}
        </p>
      </div>
    </div>
  );
}
