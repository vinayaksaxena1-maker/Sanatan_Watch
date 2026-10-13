import React, { useMemo } from 'react';
import { HoraInterval } from '../types';

interface HoraRingProps {
  horaList: HoraInterval[];
  activeHora: HoraInterval | null | undefined;
  currentTime: Date;
}

export function HoraRing({ horaList, activeHora, currentTime }: HoraRingProps) {

  const getPlanetSolidColor = (lord: string): string => {
    return '#3B2314'; // Solid Dark Walnut Brown
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    try {
      if (!timeStr) return 0;
      const parts = timeStr.split(' ');
      if (parts.length < 2) return 0;
      const [time, ampm] = parts;
      let [hrs, mins] = time.split(':').map(Number);
      if (isNaN(hrs) || isNaN(mins)) return 0;
      if (ampm === 'PM' && hrs !== 12) hrs += 12;
      if (ampm === 'AM' && hrs === 12) hrs = 0;
      return hrs * 60 + mins;
    } catch {
      return 0;
    }
  };

  const getPlanetLordInfo = (lord: string) => {
    const map: Record<string, { label: string; color: string }> = {
      'Sun': { label: 'सूर्य', color: '#FDBA74' }, // Orange-gold
      'Moon': { label: 'चन्द्र', color: '#E2E8F0' }, // Silver-white
      'Mars': { label: 'मंगल', color: '#FCA5A5' }, // Soft Red
      'Mercury': { label: 'बुध', color: '#86EFAC' }, // Soft Green
      'Jupiter': { label: 'गुरु', color: '#FDE047' }, // Soft Yellow
      'Venus': { label: 'शुक्र', color: '#93C5FD' }, // Soft Cyan-blue
      'Saturn': { label: 'शनि', color: '#C084FC' }  // Muted Purple
    };
    return map[lord] || { label: lord.substring(0, 1), color: '#94A3B8' };
  };

  const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
  const activeNumber = activeHora?.number ?? -1;

  const activeIndex = useMemo(() => {
    return horaList.findIndex(h => h.number === activeNumber);
  }, [horaList, activeNumber]);

  const isDaytime = useMemo(() => {
    const activeSegment = activeIndex !== -1 ? horaList[activeIndex] : null;
    return activeSegment ? activeSegment.isDay : (currentTime.getHours() >= 6 && currentTime.getHours() < 18);
  }, [horaList, activeIndex, currentTime]);

  const consecutiveSegments = useMemo(() => {
    const baseIdx = activeIndex !== -1 ? activeIndex : 0;
    const list: { segment: HoraInterval; originalIndex: number }[] = [];
    for (let offset = 0; offset < horaList.length; offset++) {
      const idx = (baseIdx + offset) % horaList.length;
      list.push({
        segment: horaList[idx],
        originalIndex: idx
      });
    }
    return list;
  }, [horaList, activeIndex]);

  // Helper to compute visible start and end angles for a segment using 12-hour minute grid
  const getVisibleAngles = (segment: HoraInterval, currentOffset: number, minWidthDegrees: number) => {
    const startMin = parseTimeToMinutes(segment.startTime);
    const endMin = parseTimeToMinutes(segment.endTime);
    
    // Initialize 720-minute dial representation
    const dial = new Array(720).fill(false);
    const start = startMin % 720;
    const end = endMin % 720;
    
    if (end < start) {
      for (let m = start; m < 720; m++) dial[m] = true;
      for (let m = 0; m < end; m++) dial[m] = true;
    } else {
      for (let m = start; m < end; m++) dial[m] = true;
    }

    // Clip against all preceding segments in the chronological rolling window
    for (let prevOffset = 0; prevOffset < currentOffset; prevOffset++) {
      const prevSeg = consecutiveSegments[prevOffset].segment;
      const pStartMin = parseTimeToMinutes(prevSeg.startTime);
      const pEndMin = parseTimeToMinutes(prevSeg.endTime);
      let pStart = pStartMin % 720;
      let pEnd = pEndMin % 720;
      if (pEnd < pStart) {
        for (let m = pStart; m < 720; m++) dial[m] = false;
        for (let m = 0; m < pEnd; m++) dial[m] = false;
      } else {
        for (let m = pStart; m < pEnd; m++) dial[m] = false;
      }
    }

    // Find the longest contiguous run of true in the 720-minute dial (with wrap-around)
    const doubleDial = dial.concat(dial);
    let maxLen = 0;
    let maxStart = -1;
    let currentLen = 0;
    let currentStart = -1;

    for (let k = 0; k < doubleDial.length; k++) {
      if (doubleDial[k]) {
        if (currentStart === -1) currentStart = k;
        currentLen++;
        if (currentLen > maxLen) {
          maxLen = currentLen;
          maxStart = currentStart;
        }
      } else {
        currentLen = 0;
        currentStart = -1;
      }
    }

    // Cap the length to 720 minutes
    if (maxLen > 720) maxLen = 720;

    const widthDegrees = maxLen * 0.5;
    if (widthDegrees < minWidthDegrees) {
      return null;
    }

    const runStart = maxStart % 720;
    const runEnd = (maxStart + maxLen) % 720;

    const visibleStartAngle = runStart * 0.5 - 90;
    let visibleEndAngle = runEnd * 0.5 - 90;
    if (visibleEndAngle <= visibleStartAngle) {
      visibleEndAngle += 360;
    }

    return { visibleStartAngle, visibleEndAngle, visibleDuration: maxLen };
  };

  const renderHora = (h: HoraInterval, originalIndex: number) => {
    if (originalIndex === activeIndex) return null;

    const currentOffset = consecutiveSegments.findIndex(cs => cs.originalIndex === originalIndex);
    if (currentOffset === -1) return null;

    const angles = getVisibleAngles(h, currentOffset, 0.5);
    if (!angles) return null;
    const { visibleStartAngle, visibleEndAngle } = angles;

    const startRad = (visibleStartAngle * Math.PI) / 180;
    const endRad = (visibleEndAngle * Math.PI) / 180;
    const strokeWidth = 93;
    const R = 117 + strokeWidth / 2; // = 163.5
    const x1 = 200 + R * Math.cos(startRad);
    const y1 = 200 + R * Math.sin(startRad);
    const x2 = 200 + R * Math.cos(endRad);
    const y2 = 200 + R * Math.sin(endRad);
    const pathD = `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;

    const r_in = 117;
    const r_out = 210;
    const x1_in = 200 + r_in * Math.cos(startRad);
    const y1_in = 200 + r_in * Math.sin(startRad);
    const x2_in = 200 + r_in * Math.cos(endRad);
    const y2_in = 200 + r_in * Math.sin(endRad);
    
    const x1_out = 200 + r_out * Math.cos(startRad);
    const y1_out = 200 + r_out * Math.sin(startRad);
    const x2_out = 200 + r_out * Math.cos(endRad);
    const y2_out = 200 + r_out * Math.sin(endRad);
    
    const pathInnerBorder = `M ${x1_in} ${y1_in} A ${r_in} ${r_in} 0 0 1 ${x2_in} ${y2_in}`;
    const pathOuterBorder = `M ${x1_out} ${y1_out} A ${r_out} ${r_out} 0 0 1 ${x2_out} ${y2_out}`;

    return (
      <g key={h.number}>
        {/* Main Segment Fill using solid block colors */}
        <path
          d={pathD}
          fill="none"
          stroke={getPlanetSolidColor(h.lord)}
          strokeWidth={strokeWidth.toString()}
          strokeLinecap="butt"
          opacity="1.0"
          shapeRendering="geometricPrecision"
        />
        {/* 2px Gold borders */}
        <path
          d={pathInnerBorder}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          opacity="0.8"
          shapeRendering="geometricPrecision"
        />
        <path
          d={pathOuterBorder}
          fill="none"
          stroke="#A87400"
          strokeWidth="1.5"
          opacity="0.8"
          shapeRendering="geometricPrecision"
        />
        {/* Engraved Brass Divider at start angle */}
        <g>
          {/* Shadow */}
          <line x1={x1_in} y1={y1_in} x2={x1_out} y2={y1_out} stroke="#1A1008" strokeWidth="3.5" opacity="0.6" />
          {/* Highlight */}
          <line x1={x1_in + 0.5} y1={y1_in + 0.5} x2={x1_out + 0.5} y2={y1_out + 0.5} stroke="#FFFFFF" strokeWidth="2.0" opacity="0.45" />
          {/* Gold Core */}
          <line x1={x1_in} y1={y1_in} x2={x1_out} y2={y1_out} stroke="#8B6A2B" strokeWidth="2.2" opacity="0.9" />
        </g>
        {/* Engraved Brass Divider at end angle */}
        <g>
          {/* Shadow */}
          <line x1={x2_in} y1={y2_in} x2={x2_out} y2={y2_out} stroke="#1A1008" strokeWidth="3.5" opacity="0.6" />
          {/* Highlight */}
          <line x1={x2_in + 0.5} y1={y2_in + 0.5} x2={x2_out + 0.5} y2={y2_out + 0.5} stroke="#FFFFFF" strokeWidth="2.0" opacity="0.45" />
          {/* Gold Core */}
          <line x1={x2_in} y1={y2_in} x2={x2_out} y2={y2_out} stroke="#8B6A2B" strokeWidth="2.2" opacity="0.9" />
        </g>
      </g>
    );
  };

  const renderLabel = (h: HoraInterval, originalIndex: number) => {
    const currentOffset = consecutiveSegments.findIndex(cs => cs.originalIndex === originalIndex);
    if (currentOffset === -1) return null;

    const angles = getVisibleAngles(h, currentOffset, 0.5);
    if (!angles) return null;
    const { visibleStartAngle, visibleEndAngle, visibleDuration } = angles;

    const duration = visibleDuration ?? 0;

    // Stage 1 (Duration <= 10 Minutes): Labels completely hidden
    if (duration <= 10) {
      return null;
    }

    const centerAngle = visibleStartAngle + (visibleEndAngle - visibleStartAngle) / 2;
    const rad = (centerAngle * Math.PI) / 180;
    const R = 163.5; // Center of 117 - 210
    const x = 200 + R * Math.cos(rad);
    const y = 200 + R * Math.sin(rad);

    const info = getPlanetLordInfo(h.lord);
    const isActive = originalIndex === activeIndex;

    const formatTimeRange = (startStr: string, endStr: string): string => {
      if (!startStr || !endStr) return "";
      const [startTime, startAmpm] = startStr.split(' ');
      const [endTime, endAmpm] = endStr.split(' ');
      if (!startTime || !endTime) return "";
      
      const s = startTime.replace(/^0/, '');
      const e = endTime.replace(/^0/, '');
      
      if (startAmpm === endAmpm) {
        return `${s}-${e} ${startAmpm}`;
      } else {
        return `${s} ${startAmpm}-${e} ${endAmpm}`;
      }
    };

    const timeRange = formatTimeRange(h.startTime, h.endTime);

    // Stage 2 (Duration 11 to 30 Minutes): Render only Hindi Name with dy="0"
    if (duration >= 11 && duration <= 30) {
      return (
        <g key={`hora_label_group_${h.number}`}>
          <text
            id={`hora_label_${h.number}`}
            x={x}
            y={y}
            dy="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={isActive ? "24" : "18"}
            fontWeight="600"
            fill={isActive ? "#FFFFFF" : "#FF9933"}
            fontFamily="'Noto Sans Devanagari', 'Inter', sans-serif"
            className="select-none"
            letterSpacing="0.05em"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.75))" }}
          >
            {info.label}
          </text>
        </g>
      );
    }

    // Stage 3 (Duration >= 31 Minutes): Render Name and Time Range
    return (
      <g key={`hora_label_group_${h.number}`}>
        {/* Planet Lord Name */}
        <text
          id={`hora_label_${h.number}`}
          x={x}
          y={y}
          dy={isActive ? "-10" : "-8"}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isActive ? "24" : "18"}
          fontWeight="600"
          fill={isActive ? "#FFFFFF" : "#FF9933"}
          fontFamily="'Noto Sans Devanagari', 'Inter', sans-serif"
          className="select-none"
          letterSpacing="0.05em"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.75))" }}
        >
          {info.label}
        </text>
        {/* Hora Time Range */}
        <text
          x={x}
          y={y}
          dy={isActive ? "18" : "14"}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isActive ? "13" : "11"}
          fontWeight={isActive ? "600" : "normal"}
          fill={isActive ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 153, 51, 0.45)"}
          fontFamily="'Inter', sans-serif"
          className="select-none"
          letterSpacing="0.01em"
          style={{ filter: "drop-shadow(0px 0.5px 1px rgba(0, 0, 0, 0.6))" }}
        >
          {timeRange}
        </text>
      </g>
    );
  };

  return (
    <g id="hora_ring_root">
      <g id="hora_segments_group">
        {/* Pass 1a: Render inactive segments of other period first */}
        {horaList.map((h, i) => {
          if (h.isDay === isDaytime) return null;
          return renderHora(h, i);
        })}
        {/* Pass 1b: Render inactive segments of current period second */}
        {horaList.map((h, i) => {
          if (h.isDay !== isDaytime) return null;
          return renderHora(h, i);
        })}

        {/* Pass 2: Render active segment on top of everything */}
        {activeIndex !== -1 && (() => {
          const h = horaList[activeIndex];
          const startMin = parseTimeToMinutes(h.startTime);
          const endMin = parseTimeToMinutes(h.endTime);

          const startAngle = (startMin % 720) * 0.5 - 90;
          let endAngle = (endMin % 720) * 0.5 - 90;
          if (endAngle <= startAngle) endAngle += 360;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const strokeWidth = 93;
          
          const R_in = 117;
          const R_mid1 = 120;
          const R_mid2 = 207;
          const R_out = 210;

          const getPt = (rads: number, r: number) => ({
            x: 200 + r * Math.cos(rads),
            y: 200 + r * Math.sin(rads)
          });
          
          const p1_in = getPt(startRad, R_in);
          const p2_in = getPt(endRad, R_in);
          const p1_out = getPt(startRad, R_out);
          const p2_out = getPt(endRad, R_out);
          
          const p1_m1 = getPt(startRad, R_mid1);
          const p2_m1 = getPt(endRad, R_mid1);
          const p1_m2 = getPt(startRad, R_mid2);
          const p2_m2 = getPt(endRad, R_mid2);

          const R = 117 + strokeWidth / 2;
          const x1 = 200 + R * Math.cos(startRad);
          const y1 = 200 + R * Math.sin(startRad);
          const x2 = 200 + R * Math.cos(endRad);
          const y2 = 200 + R * Math.sin(endRad);
          const pathD = `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;

          const bezelOuterD = `M ${p1_in.x} ${p1_in.y} A ${R_in} ${R_in} 0 0 1 ${p2_in.x} ${p2_in.y} L ${p2_out.x} ${p2_out.y} A ${R_out} ${R_out} 0 0 0 ${p1_out.x} ${p1_out.y} Z`;
          const bezelInnerD = `M ${p1_m1.x} ${p1_m1.y} A ${R_mid1} ${R_mid1} 0 0 1 ${p2_m1.x} ${p2_m1.y} L ${p2_m2.x} ${p2_m2.y} A ${R_mid2} ${R_mid2} 0 0 0 ${p1_m2.x} ${p1_m2.y} Z`;

          return (
            <g key={h.number + activeIndex}>
              {/* Luxury Diamond Cut Gold Bezel */}
              <g id={`hora_bezel_${h.number}`} className="select-none pointer-events-none">
                <path
                  d={bezelOuterD}
                  fill="url(#diamondGoldGrad)"
                  opacity="0.12"
                  style={{ filter: "drop-shadow(0px 0px 8px rgba(255, 213, 79, 0.4))" }}
                />
                <path
                  d={bezelOuterD}
                  fill="none"
                  stroke="#4A341E"
                  strokeWidth="13"
                  opacity="0.45"
                />
                <path
                  d={bezelOuterD}
                  fill="none"
                  stroke="url(#diamondGoldGrad)"
                  strokeWidth="15.5"
                  opacity="0.95"
                  shapeRendering="geometricPrecision"
                />
                <path
                  d={bezelInnerD}
                  fill="none"
                  stroke="url(#brightHighlightGrad)"
                  strokeWidth="2.0"
                  opacity="0.95"
                  shapeRendering="geometricPrecision"
                />
                <path
                  d={bezelOuterD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="animate-active-bezel-shine"
                  shapeRendering="geometricPrecision"
                />
                {[p1_in, p1_out, p2_in, p2_out].map((pt, idx) => (
                  <circle
                    key={`highlight_${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="6.5"
                    fill="#FFFFFF"
                    opacity="0.95"
                    style={{ filter: "drop-shadow(0px 0px 3px #FFFFFF)" }}
                  />
                ))}
              </g>

              {/* Main Segment Fill */}
              <path
                d={pathD}
                fill="none"
                stroke={getPlanetSolidColor(h.lord)}
                strokeWidth={strokeWidth.toString()}
                strokeLinecap="butt"
                opacity="1.0"
                shapeRendering="geometricPrecision"
              />

              {/* Active Gold Glow On Top of the Segment */}
              <path
                d={pathD}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="130"
                strokeLinecap="butt"
                className="animate-active-segment-glow-subtle"
                style={{ filter: "blur(6px)" }}
                shapeRendering="geometricPrecision"
              />
            </g>
          );
        })()}
      </g>
      <g id="hora_labels_group">
        {/* Pass 1a: Render labels of other period first */}
        {horaList.map((h, i) => {
          if (h.isDay === isDaytime) return null;
          return renderLabel(h, i);
        })}
        {/* Pass 1b: Render labels of current period second */}
        {horaList.map((h, i) => {
          if (h.isDay !== isDaytime) return null;
          return renderLabel(h, i);
        })}
      </g>
    </g>
  );
}
