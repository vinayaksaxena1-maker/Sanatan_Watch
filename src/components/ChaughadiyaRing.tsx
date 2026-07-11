import React from 'react';
import { ChoghadiyaInterval } from '../types';

interface ChaughadiyaRingProps {
  choghadiyaList: ChoghadiyaInterval[];
  activeIndex: number;
  displayStartTime: string;
  displayEndTime: string;
  currentTime: Date;
}

export function ChaughadiyaRing({
  choghadiyaList,
  activeIndex,
  displayStartTime,
  displayEndTime,
  currentTime
}: ChaughadiyaRingProps) {
  if (!choghadiyaList || choghadiyaList.length === 0) return null;

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

  const formatMinToTimeStr = (m: number): string => {
    let hrs = Math.floor(m / 60);
    let mins = Math.floor(m % 60);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    if (hrs === 0) hrs = 12;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const getChoghadiyaColor = (type: string) => {
    switch (type) {
      case "Amrit": return "#10B981";
      case "Shubh": return "#059669";
      case "Labh": return "#34D399";
      case "Char":
      case "Chal": return "#E6DFD3";
      case "Udveg": return "#D97706";
      case "Kaal": return "#DC2626";
      default: return "#F59E0B"; // Rog
    }
  };

  // Build extended list containing Tomorrow's first segment to fill the gap at day boundaries
  const extendedList = [...choghadiyaList];
  if (choghadiyaList.length === 16) {
    const lastSeg = choghadiyaList[15];
    const tomorrowSunriseMin = parseTimeToMinutes(lastSeg.endTime);
    
    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);
    const tomorrowDay = nextDay.getDay(); // 0 = Sun, 1 = Mon, etc.
    
    const choghadiyaDaySeqs = [
      "Udveg", "Amrit", "Rog", "Labh", "Shubh", "Chal", "Kaal"
    ];
    const tomorrowType = choghadiyaDaySeqs[tomorrowDay];
    
    const typeMapping: Record<string, { hindiName: string; name: string }> = {
      Amrit: { hindiName: "अमृत", name: "Amrit (Nectar)" },
      Shubh: { hindiName: "शुभ", name: "Shubh (Auspicious)" },
      Labh: { hindiName: "लाभ", name: "Labh (Gain)" },
      Chal: { hindiName: "चल", name: "Chal (Neutral)" },
      Kaal: { hindiName: "काल", name: "Kaal (Loss)" },
      Rog: { hindiName: "रोग", name: "Rog (Disease)" },
      Udveg: { hindiName: "उद्वेग", name: "Udveg (Anxiety)" }
    };
    const tomorrowInfo = typeMapping[tomorrowType] || typeMapping.Udveg;
    
    const dayStart = parseTimeToMinutes(choghadiyaList[0].startTime);
    const dayEnd = parseTimeToMinutes(choghadiyaList[7].endTime);
    const todayDayLength = (dayEnd - dayStart + 1440) % 1440;
    const tomorrowDayPartLength = Math.round(todayDayLength / 8);
    const tomorrowEndMin = (tomorrowSunriseMin + tomorrowDayPartLength) % 1440;
    
    extendedList.push({
      name: tomorrowInfo.name,
      hindiName: tomorrowInfo.hindiName,
      type: tomorrowType as any,
      quality: "Neutral" as any,
      startTime: lastSeg.endTime,
      endTime: formatMinToTimeStr(tomorrowEndMin),
      isDay: true,
      color: getChoghadiyaColor(tomorrowType)
    });
  }

  // Compute active index chronologically
  const activeIdx = activeIndex !== -1 ? activeIndex : extendedList.findIndex(seg => {
    const start = parseTimeToMinutes(seg.startTime);
    const end = parseTimeToMinutes(seg.endTime);
    const cur = currentTime.getHours() * 60 + currentTime.getMinutes();
    if (end < start) {
      return cur >= start || cur < end;
    }
    return cur >= start && cur < end;
  });

  const activeSegment = activeIdx !== -1 ? extendedList[activeIdx] : null;
  const isDaytime = activeSegment ? activeSegment.isDay : (currentTime.getHours() >= 6 && currentTime.getHours() < 18);
  const baseIdx = activeIdx !== -1 ? activeIdx : 0;

  // Build rolling window of all consecutive chronological segments
  const consecutiveSegments: { segment: ChoghadiyaInterval; originalIndex: number }[] = [];
  for (let offset = 0; offset < extendedList.length; offset++) {
    const idx = (baseIdx + offset) % extendedList.length;
    consecutiveSegments.push({
      segment: extendedList[idx],
      originalIndex: idx
    });
  }

  // Helper to compute visible start and end angles for a segment using 12-hour minute grid
  const getVisibleAngles = (segment: ChoghadiyaInterval, currentOffset: number, minWidthDegrees: number) => {
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

    return { visibleStartAngle, visibleEndAngle };
  };

  const renderSegment = (segment: ChoghadiyaInterval, originalIndex: number, currentOffset: number) => {
    if (originalIndex === activeIdx) return null;

    const angles = getVisibleAngles(segment, currentOffset, 0.5);
    if (!angles) return null;
    const { visibleStartAngle, visibleEndAngle } = angles;

    const startRad = (visibleStartAngle * Math.PI) / 180;
    const endRad = (visibleEndAngle * Math.PI) / 180;
    const strokeWidth = 107;
    
    const R = 213 + strokeWidth / 2;
    const x1 = 200 + R * Math.cos(startRad);
    const y1 = 200 + R * Math.sin(startRad);
    const x2 = 200 + R * Math.cos(endRad);
    const y2 = 200 + R * Math.sin(endRad);
    const pathD = `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;

    const r_in = 213;
    const r_out = 320;
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
      <g key={segment.name + originalIndex}>
        {/* Main Segment Fill */}
        <path
          id={`chaughadiya_segment_${originalIndex}`}
          className="inactive-chaughadiya-segment"
          d={pathD}
          fill="none"
          stroke="#3B2314"
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
          strokeWidth="1.75"
          opacity="0.85"
          shapeRendering="geometricPrecision"
        />
        <path
          d={pathOuterBorder}
          fill="none"
          stroke="#A87400"
          strokeWidth="1.75"
          opacity="0.85"
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

  const renderLabel = (segment: ChoghadiyaInterval, originalIndex: number, currentOffset: number) => {
    // Get visible angles with low 0.5 threshold so we can filter durations ourselves
    const angles = getVisibleAngles(segment, currentOffset, 0.5);
    if (!angles) return null;
    const { visibleStartAngle, visibleEndAngle } = angles;

    // Calculate duration of segment in minutes (1 degree = 2 minutes on 12-hour face)
    const durationMinutes = (visibleEndAngle - visibleStartAngle) * 2;

    // Stage 1: If 10 minutes or less, hide the entire label
    if (durationMinutes <= 10) {
      return null;
    }

    const centerAngle = visibleStartAngle + (visibleEndAngle - visibleStartAngle) / 2;
    const rad = (centerAngle * Math.PI) / 180;
    const innerRadius = 213;
    const outerRadius = 320;
    const labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = 200 + labelRadius * Math.cos(rad);
    const y = 200 + labelRadius * Math.sin(rad);
    const isLongLabel = segment.hindiName && segment.hindiName.length > 4;
    const isActive = originalIndex === activeIdx;
    const fontSize = isActive 
      ? (isLongLabel ? "24" : "32")
      : (isLongLabel ? "18" : "24");

    const formatTimeRange = (startStr: string, endStr: string): string => {
      if (!startStr || !endStr) return "";
      const [startTime, startAmpm] = startStr.split(' ');
      const [endTime, endAmpm] = endStr.split(' ');
      return `${startTime.substring(0, 5)}${startAmpm ? startAmpm.toLowerCase() : ''}-${endTime.substring(0, 5)}${endAmpm ? endAmpm.toLowerCase() : ''}`;
    };

    const timeRange = formatTimeRange(segment.startTime, segment.endTime);

    // Stage 2: If 11 to 30 minutes, only show name (centered vertically with dy="0")
    if (durationMinutes <= 30) {
      return (
        <g key={segment.name + "_label_" + originalIndex}>
          <text
            id={`chaughadiya_label_${originalIndex}`}
            x={x}
            y={y}
            dy="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            fontWeight={isActive ? "700" : "600"}
            fill={isActive ? "#FFFFFF" : "#FF9933"}
            fontFamily="'Noto Sans Devanagari', 'Inter', sans-serif"
            className="select-none"
            letterSpacing="0.05em"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.75))" }}
          >
            {segment.hindiName}
          </text>
        </g>
      );
    }

    // Stage 3: If 31 minutes or more, show both name and timing range
    return (
      <g key={segment.name + "_label_" + originalIndex}>
        {/* Choghadiya Hindi Name */}
        <text
          id={`chaughadiya_label_${originalIndex}`}
          x={x}
          y={y}
          dy={isActive ? "-12" : "-10"}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={isActive ? "700" : "600"}
          fill={isActive ? "#FFFFFF" : "#FF9933"}
          fontFamily="'Noto Sans Devanagari', 'Inter', sans-serif"
          className="select-none"
          letterSpacing="0.05em"
          style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.75))" }}
        >
          {segment.hindiName}
        </text>
        {/* Choghadiya Start/End Time Range */}
        <text
          x={x}
          y={y}
          dy={isActive ? "22" : "18"}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isActive ? "14" : "11"}
          fontWeight={isActive ? "650" : "normal"}
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
    <g id="chaughadiya_ring_root">
      <g id="chaughadiya_segments_group">
        {/* Render inactive segments of consecutive rolling window */}
        {consecutiveSegments.map((item, offset) => {
          return renderSegment(item.segment, item.originalIndex, offset);
        })}

        {/* Pass 2: Render active segment on top of everything */}
        {activeIdx !== -1 && (() => {
          const segment = extendedList[activeIdx];
          const startMin = parseTimeToMinutes(segment.startTime);
          const endMin = parseTimeToMinutes(segment.endTime);
          
          // Map segment times to 12-hour clock angles
          const startAngle = (startMin % 720) * 0.5 - 90;
          let endAngle = (endMin % 720) * 0.5 - 90;
          if (endAngle <= startAngle) {
            endAngle += 360;
          }

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const strokeWidth = 107;
          
          const R_in = 213;
          const R_mid1 = 216;
          const R_mid2 = 317;
          const R_out = 320;
          
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

          const R = 213 + strokeWidth / 2;
          const x1 = 200 + R * Math.cos(startRad);
          const y1 = 200 + R * Math.sin(startRad);
          const x2 = 200 + R * Math.cos(endRad);
          const y2 = 200 + R * Math.sin(endRad);
          const pathD = `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;

          const bezelOuterD = `M ${p1_in.x} ${p1_in.y} A ${R_in} ${R_in} 0 0 1 ${p2_in.x} ${p2_in.y} L ${p2_out.x} ${p2_out.y} A ${R_out} ${R_out} 0 0 0 ${p1_out.x} ${p1_out.y} Z`;
          const bezelInnerD = `M ${p1_m1.x} ${p1_m1.y} A ${R_mid1} ${R_mid1} 0 0 1 ${p2_m1.x} ${p2_m1.y} L ${p2_m2.x} ${p2_m2.y} A ${R_mid2} ${R_mid2} 0 0 0 ${p1_m2.x} ${p1_m2.y} Z`;

          return (
            <g key={segment.name + activeIdx}>
              {/* Luxury Diamond Cut Gold Frame */}
              <g id="diamond_cut_bezel" className="select-none pointer-events-none">
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
                <path
                  d={`M ${p1_m1.x} ${p1_m1.y} A ${R_mid1} ${R_mid1} 0 0 1 ${p2_m1.x} ${p2_m1.y}`}
                  fill="none"
                  stroke="#FFF2B2"
                  strokeWidth="0.75"
                  strokeDasharray="2,2"
                  opacity="0.65"
                />
                {Array.from({ length: 11 }).map((_, idx) => {
                  const stepAngle = startAngle + (endAngle - startAngle) * (idx / 10);
                  const stepRad = (stepAngle * Math.PI) / 180;
                  const pin_in = getPt(stepRad, R_in);
                  const pin_out = getPt(stepRad, R_out);
                  return (
                    <line
                      key={idx}
                      x1={pin_in.x}
                      y1={pin_in.y}
                      x2={pin_out.x}
                      y2={pin_out.y}
                      stroke={idx % 2 === 0 ? "#FFFFFF" : "url(#brightHighlightGrad)"}
                      strokeWidth="1"
                      opacity={idx % 2 === 0 ? "0.7" : "0.4"}
                    />
                  );
                })}
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
              <path
                id={`chaughadiya_segment_${activeIdx}`}
                className="active-chaughadiya-segment"
                d={pathD}
                fill="none"
                stroke="#3B2314"
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
      <g id="chaughadiya_labels_group">
        {/* Render labels from consecutiveSegments */}
        {consecutiveSegments.map((item, offset) => {
          return renderLabel(item.segment, item.originalIndex, offset);
        })}
      </g>
    </g>
  );
}
