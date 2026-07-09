/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Coords {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
}

export type PakshaType = 'Shukla' | 'Krishna';

export type MuhuratType = 'Shubh' | 'Amrit' | 'Ashubh' | 'Samanya';

export interface Tithi {
  name: string;
  hindiName: string;
  value: number; // 1 to 30 (1-15 Shukla, 16-30 Krishna)
  startTime?: string;
  endTime: string;
  percentPassed?: number;
  lord: string;
  deity: string;
}

export interface Nakshatra {
  name: string;
  hindiName: string;
  value: number; // 1 to 27
  endTime: string;
  lord: string;
  deity: string;
  symbol: string;
  nature: string;
  description: string;
  suitableActivities: string[];
  avoidActivities: string[];
}

export interface Yoga {
  name: string;
  hindiName: string;
  value: number; // 1 to 27
  endTime: string;
  meaning: string;
}

export interface Karana {
  name: string;
  hindiName: string;
  value: number; // 1 to 11
  endTime: string;
  type: string;
}

export interface ChoghadiyaInterval {
  name: string;
  hindiName?: string;
  type: 'Shubh' | 'Amrit' | 'Labh' | 'Chal' | 'Kaal' | 'Rog' | 'Udveg';
  quality: 'Excellent' | 'Good' | 'Neutral' | 'Inauspicious' | 'Bad';
  startTime: string;
  endTime: string;
  isDay: boolean;
  color?: string;
}

export interface HoraInterval {
  number: number; // 1 to 24
  lord: string; // e.g. Sun, Moon, Mars etc
  lordHindi: string; // e.g. सूर्य, चंद्र
  startTime: string; // e.g. "05:45 AM"
  endTime: string; // e.g. "06:33 AM"
  isDay: boolean;
  quality: 'Auspicious' | 'Inauspicious' | 'Neutral';
  qualityHindi: string;
  colorClass: string;
  benefits: string;
}

export interface MuhuratItem {
  id: string;
  name: string;
  hindiName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: MuhuratType;
  description: string;
  suitability: string;
}

export interface HinduDate {
  tithi: Tithi;
  nakshatra: Nakshatra;
  yoga: Yoga;
  karana: Karana;
  paksha: PakshaType;
  month: string;
  monthHindi: string;
  ritu: string;
  samvatVikram: number;
  samvatShaka: number;
}

export interface PanchangInfo {
  date: string;
  hinduDate: HinduDate;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: { start: string; end: string };
  gulikKaal: { start: string; end: string };
  yamagandam: { start: string; end: string };
  choghadiya: ChoghadiyaInterval[];
  hora: HoraInterval[];
}

export interface Festival {
  id: string;
  name: string;
  hindiName: string;
  date: string; // YYYY-MM-DD
  month: string;
  tithi: string;
  description: string;
  type: 'Ekadashi' | 'Purnima' | 'Amavasya' | 'Sankashti' | 'Jayanti' | 'Major';
  isAuspicious: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'morning' | 'festival' | 'muhurat' | 'custom';
  isRead: boolean;
}

export type SplashStyle = 'saffron' | 'golden' | 'crimson' | 'sanatan-video';
export type LogoStyle = 'om' | 'swastika' | 'trishul' | 'kalash' | 'diya';

export interface SettingsState {
  theme: 'light' | 'dark' | 'temple';
  language: 'English' | 'Hindi' | 'Sanskrit';
  locationMode: 'GPS' | 'Manual';
  notifications: {
    morningPanchang: boolean;
    festivalReminder: boolean;
    ekadashiReminder: boolean;
    purnimaReminder: boolean;
    muhuratReminder: boolean;
  };
  monetizationUnlock: boolean;
  splashStyle?: SplashStyle;
  logoStyle?: LogoStyle;
  clockMode?: 'digital' | 'analog';
  customLogo?: string;
  customSplash?: string;
}

export interface ChoghadiyaPresentationData {
  choghadiyaList: ChoghadiyaInterval[];
  activeIndex: number;
  displayStartTime: string;
  displayEndTime: string;
}
