/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, Terminal } from 'lucide-react';
import { PanchangInfo } from '../types';
import { DiagnosticLogsModal } from './DiagnosticLogsModal';

interface HeaderClockProps {
  selectedDate: Date;
  panchangInfo: PanchangInfo;
  language: string;
}

const parseTimeToMinutes = (timeStr: string): number => {
  const [time, ampm] = timeStr.split(' ');
  if (!time || !ampm) return 0;
  let [hrs, mins] = time.split(':').map(Number);
  if (ampm === 'PM' && hrs !== 12) hrs += 12;
  if (ampm === 'AM' && hrs === 12) hrs = 0;
  return hrs * 60 + mins;
};

const isTimeInInterval = (currMin: number, startStr: string, endStr: string): boolean => {
  const start = parseTimeToMinutes(startStr);
  const end = parseTimeToMinutes(endStr);
  if (start <= end) {
    return currMin >= start && currMin < end;
  } else {
    return currMin >= start || currMin < end;
  }
};

export const HeaderClock: React.FC<HeaderClockProps> = React.memo(({ selectedDate, panchangInfo, language }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Find current active Choghadiya based on actual currentTime (today) using passed panchangInfo
  const getActiveChoghadiya = () => {
    try {
      if (!panchangInfo || !panchangInfo.choghadiya) return undefined;
      const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

      return panchangInfo.choghadiya.find(ch => 
        isTimeInInterval(currentMin, ch.startTime, ch.endTime)
      );
    } catch {
      return undefined;
    }
  };

  const activeChoghadiya = getActiveChoghadiya();

  const getChoghadiyaTrendInfo = () => {
    if (!activeChoghadiya) {
      return {
        icon: null,
        colorClass: '',
        tooltip: 'Click to toggle digital/analog format'
      };
    }
    
    const { quality, hindiName, name } = activeChoghadiya;
    const label = hindiName || name;
    
    if (quality === 'Excellent' || quality === 'Good') {
      return {
        icon: <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        colorClass: 'border-emerald-200/50 dark:border-emerald-950/40 bg-emerald-50/65 dark:bg-emerald-950/25 text-emerald-800 dark:text-emerald-300',
        tooltip: `शुभ चौघड़िया: ${label} (उत्तम/शुभ समय) - Click to toggle format`
      };
    } else if (quality === 'Inauspicious' || quality === 'Bad') {
      return {
        icon: <TrendingDown className="w-3 h-3 text-rose-600 dark:text-rose-455 shrink-0" />,
        colorClass: 'border-rose-200/50 dark:border-rose-950/40 bg-rose-50/65 dark:bg-rose-950/25 text-rose-855 dark:text-rose-355',
        tooltip: `अशुभ चौघड़िया: ${label} (वर्जित/अशुभ समय) - Click to toggle format`
      };
    } else {
      return {
        icon: <Minus className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />,
        colorClass: 'border-blue-100/50 dark:border-brand-border bg-blue-50/40 dark:bg-brand-card text-blue-600 dark:text-blue-300',
        tooltip: `मध्यम चौघड़िया: ${label} (सामान्य/चल समय) - Click to toggle format`
      };
    }
  };

  const trendInfo = getChoghadiyaTrendInfo();

  return (
    <>
      <div 
        id="header_clock_wrapper"
        className="flex items-center justify-between w-full rounded-full px-4 py-2 bg-slate-50/50 dark:bg-stone-900/60 border-2 border-slate-200/60 dark:border-brand-border shadow-3xs"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-orange-500 transition-colors drop-shadow-3xs" />
          <span 
            className="text-xs sm:text-sm font-black text-slate-900 dark:text-brand-text-pri tracking-tight font-mono whitespace-nowrap leading-none [text-shadow:0_1px_1px_rgba(0,0,0,0.12)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.45)]"
          >
            {selectedDate.toLocaleDateString(language === 'Hindi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} • {currentTime.toLocaleTimeString(language === 'Hindi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
        {trendInfo.icon && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-black leading-none shadow-3xs hover:shadow-2xs transition-shadow duration-300 ${trendInfo.colorClass}`}>
            {trendInfo.icon}
            <span className="font-serif [text-shadow:0_0.5px_1px_rgba(255,255,255,0.45)] dark:[text-shadow:0_0.5px_1px_rgba(0,0,0,0.35)]">{activeChoghadiya?.hindiName}</span>
          </span>
        )}
      </div>

      <DiagnosticLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </>
  );
});

HeaderClock.displayName = 'HeaderClock';
