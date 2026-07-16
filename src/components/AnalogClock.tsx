import React from 'react';
import { ChaughadiyaRing } from './ChaughadiyaRing';
import { HoraRing } from './HoraRing';
import { ChoghadiyaInterval, HoraInterval } from '../types';

interface AnalogClockProps {
  time: Date;
  size?: number; // Size in pixels
  theme?: string;
  choghadiyaList?: ChoghadiyaInterval[];
  activeChoghadiyaIndex?: number;
  activeHora?: HoraInterval | null;
  horaList?: HoraInterval[];
  sunriseTimeStr?: string;
  sunsetTimeStr?: string;
}

export function AnalogClock({
  time,
  size = 340,
  theme = 'temple',
  choghadiyaList = [],
  activeChoghadiyaIndex = -1,
  activeHora = null,
  horaList = [],
  sunriseTimeStr = '',
  sunsetTimeStr = ''
}: AnalogClockProps) {
  const currentTime = time;
  const activeIndex = activeChoghadiyaIndex;

  const isDaytime = activeIndex !== -1 && choghadiyaList && choghadiyaList[activeIndex]
    ? choghadiyaList[activeIndex].isDay
    : (currentTime.getHours() >= 6 && currentTime.getHours() < 18);

  return (
    <div 
      id="header_analog_clock"
      className="relative flex items-center justify-center select-none w-full h-full"
      title={`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`}
    >
      <svg id="vedic-analog-clock-svg" viewBox="-190 -190 780 780" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Rolex Bezel Metallic Gold Gradients */}
          <linearGradient id="diamondGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF5C3" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F3E5AB" />
            <stop offset="70%" stopColor="#AA7C11" />
            <stop offset="100%" stopColor="#FFF5C3" />
          </linearGradient>
          
          <linearGradient id="brightHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFECB3" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>

          {/* Sapphire Crystal Glass Highlight Reflection Gradient */}
          <linearGradient id="glassReflectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Premium 3-Stop Choghadiya Gradients */}
          <linearGradient id="choghadiya-grad-Amrit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6B23E" />
            <stop offset="50%" stopColor="#D98A15" />
            <stop offset="100%" stopColor="#9A5C09" />
          </linearGradient>
          <linearGradient id="choghadiya-grad-Labh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="50%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="choghadiya-grad-Shubh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="50%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="choghadiya-grad-Chal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5DA8FF" />
            <stop offset="50%" stopColor="#2E73D8" />
            <stop offset="100%" stopColor="#1C4FA6" />
          </linearGradient>
          <linearGradient id="choghadiya-grad-Kaal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#444444" />
            <stop offset="50%" stopColor="#232323" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
          <linearGradient id="choghadiya-grad-Rog" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E95A4A" />
            <stop offset="50%" stopColor="#B53025" />
            <stop offset="100%" stopColor="#7F1712" />
          </linearGradient>
          <linearGradient id="choghadiya-grad-Udveg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E95A4A" />
            <stop offset="50%" stopColor="#B53025" />
            <stop offset="100%" stopColor="#7F1712" />
          </linearGradient>

          {/* Premium 3-Stop Vedic Hora Planetary Lord Metallic Gradients */}
          <linearGradient id="hora-grad-Sun" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6B23E" />
            <stop offset="50%" stopColor="#D98A15" />
            <stop offset="100%" stopColor="#9A5C09" />
          </linearGradient>
          <linearGradient id="hora-grad-Moon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="hora-grad-Mars" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E95A4A" />
            <stop offset="50%" stopColor="#B53025" />
            <stop offset="100%" stopColor="#7F1712" />
          </linearGradient>
          <linearGradient id="hora-grad-Mercury" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="50%" stopColor="#2E7D32" />
            <stop offset="100%" stopColor="#1B5E20" />
          </linearGradient>
          <linearGradient id="hora-grad-Jupiter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
          <linearGradient id="hora-grad-Venus" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5DA8FF" />
            <stop offset="50%" stopColor="#2E73D8" />
            <stop offset="100%" stopColor="#1C4FA6" />
          </linearGradient>
          <linearGradient id="hora-grad-Saturn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#581C87" />
          </linearGradient>

          <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF5C3" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6508" />
          </linearGradient>
          <radialGradient id="capBronze" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#9C7753" />
            <stop offset="60%" stopColor="#6B4E2E" />
            <stop offset="100%" stopColor="#4A341E" />
          </radialGradient>
          <radialGradient id="capGold" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C7715" />
          </radialGradient>
          
          <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.8" />
          </filter>
          <clipPath id="main-watch-dial-clip">
            <circle cx="200" cy="200" r="200" />
          </clipPath>
          <radialGradient id="textBackShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          
          {/* Rich dark mahogany dial background gradient */}
          <linearGradient id="dialBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C120C" />
            <stop offset="100%" stopColor="#080503" />
          </linearGradient>

          {/* Invisible arc paths for the simple outer ring curved text (Top, Left, Right) */}
          <path id="outerTextPathTop" d="M -168 200 A 368 368 0 0 1 568 200" fill="none" />
          <path id="outerTextPathLeft" d="M 200 568 A 368 368 0 0 1 200 -168" fill="none" />
          <path id="outerTextPathRight" d="M 200 -168 A 368 368 0 0 1 200 568" fill="none" />
          <path id="outerTextPathBottom" d="M -182 200 A 382 382 0 0 0 582 200" fill="none" />
        </defs>
        
        {/* Solid Dial Background Circle */}
        <circle cx="200" cy="200" r="320" fill="url(#dialBgGrad)" />

        {/* Inner Gold Divider Ring between clock face and Choghadiya segments */}
        <circle cx="200" cy="200" r="116" fill="none" stroke="#D4AF37" strokeWidth="2.5" opacity="0.85" />

        {/* Outer Gold Divider Ring separating Hora and Choghadiya rings */}
        <circle cx="200" cy="200" r="211" fill="none" stroke="#D4AF37" strokeWidth="5.0" opacity="0.8" />

        {/* Vedic Hora Inner Complication Ring */}
        <HoraRing
          horaList={horaList}
          activeHora={activeHora}
          currentTime={currentTime}
        />

        {/* Luxury Outer Brass Ring Assembly (Double Ring + 12 Rivets) */}
        {/* Inner thin gold ring */}
        <circle cx="200" cy="200" r="320" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.85" />
        {/* Main thick brass ring with metallic gradient */}
        <circle cx="200" cy="200" r="326" fill="none" stroke="url(#diamondGoldGrad)" strokeWidth="10.5" opacity="0.95" />
        {/* Outer thin gold ring */}
        <circle cx="200" cy="200" r="332" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.85" />

        {/* 12 Antique Brass Rivets placed at 30-degree intervals */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const rx = 200 + 326 * Math.cos(angle);
          const ry = 200 + 326 * Math.sin(angle);
          return (
            <circle
              key={`rivet-${i}`}
              cx={rx}
              cy={ry}
              r="2.2"
              fill="#2C1A0F"
              stroke="#D4AF37"
              strokeWidth="0.85"
              style={{ filter: "drop-shadow(0px 0.5px 1px rgba(0,0,0,0.5))" }}
            />
          );
        })}

        {/* Chaughadiya Ring Complication Root (Outer Ring) */}
        <ChaughadiyaRing
          choghadiyaList={choghadiyaList}
          activeIndex={activeIndex}
          displayStartTime=""
          displayEndTime=""
          currentTime={currentTime}
        />

        {/* Simple Outer Information Ring Complication with 16px Gap */}
        <g id="simple_outer_info_ring">
          {/* Single Thin Gold Border */}
          <circle cx="200" cy="200" r="356" fill="none" stroke="#D4AF37" strokeWidth="10" opacity="0.8" />

          {/* 12 Outer Antique Brass Rivets placed at 30-degree intervals inside the outer ring */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const rx = 200 + 356 * Math.cos(angle);
            const ry = 200 + 356 * Math.sin(angle);
            return (
              <circle
                key={`outer-rivet-${i}`}
                cx={rx}
                cy={ry}
                r="2.2"
                fill="#2C1A0F"
                stroke="#D4AF37"
                strokeWidth="0.85"
                style={{ filter: "drop-shadow(0px 0.5px 1px rgba(0,0,0,0.5))" }}
              />
            );
          })}

          {/* Curved Text showing active Choghadiya period */}
          <text fill="#3B2314" fontSize="24" fontWeight="bold" letterSpacing="0.1em" className="select-none">
            <textPath href="#outerTextPathTop" startOffset="50%" textAnchor="middle">
              {isDaytime ? "☀️ दिन की चौघड़िया (Day Choghadiya)" : "🌙 रात की चौघड़िया (Night Choghadiya)"}
            </textPath>
          </text>

          {/* Sunset (Left Side) */}
          <text fill="#3B2314" fontSize="24" fontWeight="bold" letterSpacing="0.05em" className="select-none">
            <textPath href="#outerTextPathLeft" startOffset="50%" textAnchor="middle">
              🌇 सूर्यास्त (Sunset): {sunsetTimeStr}
            </textPath>
          </text>

          {/* Sunrise (Right Side) */}
          <text fill="#3B2314" fontSize="24" fontWeight="bold" letterSpacing="0.05em" className="select-none">
            <textPath href="#outerTextPathRight" startOffset="50%" textAnchor="middle">
              🌅 सूर्योदय (Sunrise): {sunriseTimeStr}
            </textPath>
          </text>

          {/* Current Hora (Bottom Side) */}
          <text fill="#3B2314" fontSize="24" fontWeight="bold" letterSpacing="0.1em" className="select-none">
            <textPath href="#outerTextPathBottom" startOffset="50%" textAnchor="middle">
              {activeHora ? `⌛ सक्रिय होरा: ${activeHora.lordHindi} (${activeHora.startTime} - ${activeHora.endTime})` : "⌛ सक्रिय होरा"}
            </textPath>
          </text>
        </g>

        {/* Scale Roman Numerals and Clock Hands to fit inside the new 159 radius inner clock face */}
        <g transform="scale(0.78)" transformOrigin="200 200">
          {/* Sapphire Crystal Glass Highlight Reflection Overlay */}
          <circle cx="200" cy="200" r="148" fill="url(#glassReflectionGrad)" pointerEvents="none" />

          {/* Premium Roman Numerals mathematically positioned at radius 128 (2% inward) with optical adjustments */}
          {[
            { val: 'XII', ox: 0, oy: 2 },
            { val: 'I', ox: -1, oy: 1 },
            { val: 'II', ox: -1, oy: 1 },
            { val: 'III', ox: -3, oy: 0 },
            { val: 'IV', ox: -2, oy: -1 },
            { val: 'V', ox: -1, oy: -1 },
            { val: 'VI', ox: 0, oy: -2 },
            { val: 'VII', ox: 1, oy: -1 },
            { val: 'VIII', ox: 2, oy: -1 },
            { val: 'IX', ox: 3, oy: 0 },
            { val: 'X', ox: 1, oy: 1 },
            { val: 'XI', ox: 1, oy: 1 }
          ].map((item, i) => {
            const angleRad = ((i * 30 - 90) * Math.PI) / 180.0;
            const x = 200 + 128 * Math.cos(angleRad) + item.ox;
            const y = 200 + 128 * Math.sin(angleRad) + item.oy;
            return (
              <text
                key={item.val}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#D4AF37"
                className="font-serif font-bold select-none"
                style={{
                  fontFamily: "'Georgia', 'Garamond', 'Times New Roman', serif",
                  fontSize: '22px',
                  fontWeight: 'bold'
                }}
              >
                {item.val}
              </text>
            );
          })}

          {/* Hour Hand (Spade shape with gold outline, dark bronze body, hollow cutout) */}
          {(() => {
            const angle = ((currentTime.getHours() % 12) * 30) + (currentTime.getMinutes() * 0.5);
            return (
              <g transform={`rotate(${angle} 200 200)`} filter="url(#shadowFilter)">
                {/* Gold Outline */}
                <path
                  d="M 200 200 L 196 200 L 196 160 C 191 157, 185 145, 200 125 C 215 145, 209 157, 204 160 L 204 200 Z"
                  fill="#D4AF37"
                />
                {/* Main Body & Cutout */}
                <path
                  d="M 200 199 L 197 199 L 197 161 C 193 158, 187 147, 200 128 C 213 147, 207 158, 203 161 L 203 199 Z M 200 137 C 202 144, 202 149, 200 151 C 198 149, 198 144, 200 137 Z"
                  fill="#3B2A1E"
                  fillRule="evenodd"
                />
              </g>
            );
          })()}

          {/* Minute Hand (Lance/diamond shape with gold outline, dark bronze body, hollow cutout) */}
          {(() => {
            const angle = (currentTime.getMinutes() * 6) + (currentTime.getSeconds() * 0.1);
            return (
              <g transform={`rotate(${angle} 200 200)`} filter="url(#shadowFilter)">
                {/* Gold Outline */}
                <path
                  d="M 200 200 L 197 200 L 197 160 L 192 145 L 200 95 L 208 145 L 203 160 L 203 200 Z"
                  fill="#D4AF37"
                />
                {/* Main Body & Cutout */}
                <path
                  d="M 200 199 L 198 199 L 198 161 L 193 146 L 200 98 L 207 146 L 202 161 L 202 199 Z M 200 108 L 203 141 L 200 147 L 197 141 Z"
                  fill="#3B2A1E"
                  fillRule="evenodd"
                />
              </g>
            );
          })()}

          {/* Second Hand (Thin dark bronze needle with circular tail counterweight) */}
          {(() => {
            const angle = currentTime.getSeconds() * 6;
            return (
              <g transform={`rotate(${angle} 200 200)`}>
                {/* Needle shaft */}
                <line x1="200" y1="230" x2="200" y2="75" stroke="#3B2A1E" strokeWidth="1.5" />
                {/* Circular counterweight near the tail */}
                <circle cx="200" cy="216" r="6.5" fill="none" stroke="#3B2A1E" strokeWidth="1.5" />
                <circle cx="200" cy="216" r="2.5" fill="#3B2A1E" />
              </g>
            );
          })()}
        </g>

        {/* Center Circle Pin (3-Layer Premium Vintage Cap) */}
        <circle cx="200" cy="200" r="8.5" fill="url(#capBronze)" stroke="#4A341E" strokeWidth="0.75" filter="url(#shadowFilter)" />
        <circle cx="200" cy="200" r="4.5" fill="url(#capGold)" />
        <circle cx="200" cy="200" r="1.5" fill="#111111" />
      </svg>
    </div>
  );
}
