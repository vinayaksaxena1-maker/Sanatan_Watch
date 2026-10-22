import { AppNotification } from '../types';

export interface QuickAlarmParams {
  id: string;
  title: string;
  body: string;
  time: string;
  endTime?: string;
  type?: 'morning' | 'festival' | 'muhurat' | 'custom';
  offsetMinutes?: number; // e.g. -5 for Rahu Kaal
}

/**
 * Normalizes Hindi period markers or standard 12/24hr format to hours and minutes.
 */
export function extractHoursAndMinutes(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const cleanStr = timeStr.trim().toUpperCase();

  // Check for Hindi time prefixes/suffixes
  // e.g. "11:42 प्रातः", "01:30 दोपहर", "04:43 रात्रि", "06:15 सायं"
  const isAfternoonOrEvening = /दोपहर|सायं|संध्या|PM/i.test(timeStr);
  const isMorningOrNight = /प्रातः|सुबह|भोर|रात्रि|AM/i.test(timeStr);

  const match = cleanStr.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) return null;

  // Handle 12-hour AM/PM / Hindi indicators
  if (isAfternoonOrEvening) {
    if (hours < 12) hours += 12;
  } else if (isMorningOrNight) {
    // If "12:xx AM" or midnight "12:xx रात्रि"
    if (hours === 12 && !/दोपहर/i.test(timeStr)) hours = 0;
  }

  return { hours, minutes };
}

/**
 * Parses time string and applies offset in minutes.
 * If the resulting time has already passed today, schedules for the next day.
 */
export function parseTimeToMs(timeStr: string, offsetMinutes: number = 0): number | null {
  const parsed = extractHoursAndMinutes(timeStr);
  if (!parsed) return null;

  const now = new Date();
  const alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parsed.hours, parsed.minutes, 0, 0);

  if (offsetMinutes !== 0) {
    alarmDate.setMinutes(alarmDate.getMinutes() + offsetMinutes);
  }

  // If already passed for today, schedule for tomorrow
  if (alarmDate.getTime() <= now.getTime()) {
    alarmDate.setDate(alarmDate.getDate() + 1);
  }

  return alarmDate.getTime();
}

/**
 * Formats time with an offset for display (e.g., "01:30 PM" with -5 min => "01:25 PM").
 */
export function formatTimeWithOffset(timeStr: string, offsetMinutes: number = 0): string {
  const parsed = extractHoursAndMinutes(timeStr);
  if (!parsed) return timeStr;

  let totalMinutes = parsed.hours * 60 + parsed.minutes + offsetMinutes;
  if (totalMinutes < 0) totalMinutes += 1440;
  totalMinutes = totalMinutes % 1440;

  const h24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const ampm = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
}

/**
 * Checks if a specific alarm ID is enabled in the notifications list.
 */
export function isAlarmActive(notificationsList: AppNotification[], alarmId: string): boolean {
  if (!notificationsList || !alarmId) return false;
  const alert = notificationsList.find(a => a.id === alarmId);
  return Boolean(alert && alert.enabled !== false);
}

/**
 * Toggles quick alarm on/off with Android native bridge integration.
 */
export function toggleQuickAlarm(
  notificationsList: AppNotification[],
  params: QuickAlarmParams
): {
  updatedList: AppNotification[];
  isEnabled: boolean;
  toastTitle: string;
  toastBody: string;
} {
  const existingAlert = notificationsList.find(a => a.id === params.id);
  const currentlyEnabled = Boolean(existingAlert && existingAlert.enabled !== false);

  if (currentlyEnabled) {
    // Turn alarm OFF
    if (window.AndroidAlarm && typeof window.AndroidAlarm.cancelAlarm === 'function') {
      window.AndroidAlarm.cancelAlarm(params.id);
    }

    const updatedList = notificationsList.map(a =>
      a.id === params.id ? { ...a, enabled: false } : a
    );

    return {
      updatedList,
      isEnabled: false,
      toastTitle: '🔕 अलार्म बंद',
      toastBody: `"${params.title}" अलार्म बंद कर दिया गया है।`
    };
  } else {
    // Turn alarm ON
    const offset = params.offsetMinutes || 0;
    const triggerTimeMs = parseTimeToMs(params.time, offset);

    if (!triggerTimeMs) {
      return {
        updatedList: notificationsList,
        isEnabled: false,
        toastTitle: '⚠️ अमान्य समय',
        toastBody: `"${params.title}" का समय अमान्य है।`
      };
    }

    const effectiveTimeStr = offset !== 0 ? formatTimeWithOffset(params.time, offset) : params.time;

    const newOrUpdatedAlert: AppNotification = {
      id: params.id,
      title: params.title,
      body: params.body + (offset < 0 ? ` (${Math.abs(offset)} मिनट पूर्व चेतावनी)` : ''),
      time: effectiveTimeStr,
      endTime: params.endTime,
      type: params.type || 'muhurat',
      isRead: false,
      enabled: true,
      ringtoneTitle: 'डिफ़ॉल्ट टोन (Flute)',
      ringtoneUri: '',
      vibrate: true,
      snoozeMinutes: 2
    };

    if (window.AndroidAlarm && typeof window.AndroidAlarm.scheduleAlarm === 'function') {
      window.AndroidAlarm.scheduleAlarm(
        newOrUpdatedAlert.id,
        newOrUpdatedAlert.title,
        triggerTimeMs,
        true,
        2,
        ''
      );
    }

    let updatedList: AppNotification[];
    if (existingAlert) {
      updatedList = notificationsList.map(a =>
        a.id === params.id ? newOrUpdatedAlert : a
      );
    } else {
      updatedList = [newOrUpdatedAlert, ...notificationsList];
    }

    let toastBody = `"${params.title}" (${effectiveTimeStr}) का अलार्म सेट हो गया!`;
    if (offset < 0) {
      toastBody = `राहुकाल शुरू होने से ${Math.abs(offset)} मिनट पहले (${effectiveTimeStr}) आपको चेतावनी मिल जाएगी।`;
    }

    return {
      updatedList,
      isEnabled: true,
      toastTitle: offset < 0 ? '⚠️ राहुकाल अलार्म सक्रिय' : '✅ अलार्म सक्रिय',
      toastBody
    };
  }
}
