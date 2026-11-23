/**
 * Sanatan Web (सनातन घड़ी)
 * Utility: sandboxDateUtils.ts
 * Robust Auto-Detect Parser for Sandbox Date & Time inputs:
 * Handles DD-MM-YYYY, YYYY-MM-DD, 12H (AM/PM), and 24H formats.
 * Guarantees zero crashing and bulletproof normalization across all browsers.
 * Strict < 300 lines modular standard
 */

export interface NormalizedDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  isoDate: string; // YYYY-MM-DD
  time24: string;  // HH:MM
}

export function parseSandboxDateTime(dateStr: string, timeStr: string): NormalizedDateTime {
  // 1. Parse Date
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();

  if (dateStr && typeof dateStr === 'string') {
    const parts = dateStr
      .trim()
      .split(/[-/.]/)
      .map((p) => parseInt(p, 10))
      .filter((n) => !isNaN(n));

    if (parts.length === 3) {
      if (parts[0] > 1000) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2] > 1000) {
        // DD-MM-YYYY
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else if (parts[0] > 31) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1];
        year = parts[2] < 100 ? 1900 + parts[2] : parts[2];
      }
    }
  }

  // Safety clamps
  if (month < 1) month = 1;
  if (month > 12) month = 12;
  if (day < 1) day = 1;
  if (day > 31) day = 31;
  if (year < 1800) year = 1984;
  if (year > 2100) year = 2026;

  // 2. Parse Time
  let hour = 12;
  let minute = 0;
  let second = 0;

  if (timeStr && typeof timeStr === 'string') {
    const cleanTime = timeStr.trim().toUpperCase();
    const isPm = cleanTime.includes('PM');
    const isAm = cleanTime.includes('AM');
    const digitsOnly = cleanTime.replace(/[^0-9:]/g, '');
    const timeParts = digitsOnly
      .split(':')
      .map((p) => parseInt(p, 10))
      .filter((n) => !isNaN(n));

    if (timeParts.length >= 1) {
      hour = timeParts[0];
      minute = timeParts.length >= 2 ? timeParts[1] : 0;
      second = timeParts.length >= 3 ? timeParts[2] : 0;

      if (isPm && hour < 12) {
        hour += 12;
      } else if (isAm && hour === 12) {
        hour = 0;
      }
    }
  }

  if (hour < 0) hour = 0;
  if (hour > 23) hour = 23;
  if (minute < 0) minute = 0;
  if (minute > 59) minute = 59;
  if (second < 0) second = 0;
  if (second > 59) second = 59;

  const yStr = String(year).padStart(4, '0');
  const mStr = String(month).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  const hStr = String(hour).padStart(2, '0');
  const mnStr = String(minute).padStart(2, '0');

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    isoDate: `${yStr}-${mStr}-${dStr}`,
    time24: `${hStr}:${mnStr}`,
  };
}
