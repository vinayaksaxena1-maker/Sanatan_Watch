/**
 * @license MIT
 * Sanatan Web - Vedic Transit (Gochar) Engine
 * Strict 100% Native Implementation
 */

export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu';

export interface RashiInfo {
  index: number; // 1 to 12
  nameEn: string;
  nameHi: string;
  lord: PlanetKey;
}

export const RASHI_LIST: readonly RashiInfo[] = [
  { index: 1, nameEn: 'Aries', nameHi: 'मेष', lord: 'mars' },
  { index: 2, nameEn: 'Taurus', nameHi: 'वृषभ', lord: 'venus' },
  { index: 3, nameEn: 'Gemini', nameHi: 'मिथुन', lord: 'mercury' },
  { index: 4, nameEn: 'Cancer', nameHi: 'कर्क', lord: 'moon' },
  { index: 5, nameEn: 'Leo', nameHi: 'सिंह', lord: 'sun' },
  { index: 6, nameEn: 'Virgo', nameHi: 'कन्या', lord: 'mercury' },
  { index: 7, nameEn: 'Libra', nameHi: 'तुला', lord: 'venus' },
  { index: 8, nameEn: 'Scorpio', nameHi: 'वृश्चिक', lord: 'mars' },
  { index: 9, nameEn: 'Sagittarius', nameHi: 'धनु', lord: 'jupiter' },
  { index: 10, nameEn: 'Capricorn', nameHi: 'मकर', lord: 'saturn' },
  { index: 11, nameEn: 'Aquarius', nameHi: 'कुंभ', lord: 'saturn' },
  { index: 12, nameEn: 'Pisces', nameHi: 'मीन', lord: 'jupiter' }
] as const;

export const PLANET_INFO: Record<PlanetKey, { nameEn: string; nameHi: string }> = {
  sun: { nameEn: 'Sun', nameHi: 'सूर्य' },
  moon: { nameEn: 'Moon', nameHi: 'चन्द्र' },
  mars: { nameEn: 'Mars', nameHi: 'मंगल' },
  mercury: { nameEn: 'Mercury', nameHi: 'बुध' },
  jupiter: { nameEn: 'Jupiter', nameHi: 'गुरु (बृहस्पति)' },
  venus: { nameEn: 'Venus', nameHi: 'शुक्र' },
  saturn: { nameEn: 'Saturn', nameHi: 'शनि' },
  rahu: { nameEn: 'Rahu', nameHi: 'राहु' },
  ketu: { nameEn: 'Ketu', nameHi: 'केतु' }
};

export interface TransitEvent {
  id: string;
  planet: PlanetKey;
  planetHindi: string;
  fromRashi: number; // 1 to 12
  toRashi: number; // 1 to 12
  transitDatetime: string; // ISO-8601
  endDatetime: string; // ISO-8601
  nakshatra: string;
  isRetrograde: boolean;
  isCombust?: boolean;
}

export type TransitStatusType = 'upcoming' | 'active' | 'completed';

export interface TransitTimingStatus {
  status: TransitStatusType;
  badgeLabelHindi: string;
  badgeType: 'warning' | 'success' | 'neutral';
  daysUntilStart?: number;
  daysRemaining?: number;
  displayText: string;
}

export type PlanetaryDignity =
  | 'exalted'
  | 'debilitated'
  | 'own_sign'
  | 'neutral';

export type TransitOverallStatus = 'shubh' | 'vilambit_shubh' | 'ashubh';

export interface VedhaInfo {
  hasVedha: boolean;
  vedhaHouse?: number;
  obstructingPlanet?: PlanetKey;
  obstructingPlanetHindi?: string;
  exceptionApplied?: string;
  noteHindi: string;
}

export interface TransitEvaluation {
  moonRashi: number; // 1 to 12
  house: number; // 1 to 12
  isFavorableHouse: boolean;
  dignity: PlanetaryDignity;
  dignityLabelHindi: string;
  vedha: VedhaInfo;
  overallStatus: TransitOverallStatus;
  statusLabelHindi: string;
}

export interface TransitRemedy {
  type: 'mantra' | 'daan' | 'karma' | 'puja';
  titleHindi: string;
  textHindi: string;
}

export interface TransitRule {
  planet: PlanetKey;
  house: number; // 1 to 12
  overallStatus: 'shubh' | 'ashubh';
  summary: string;
  opportunities: string[];
  problems: string[];
  dos: string[];
  donts: string[];
  remedy: TransitRemedy;
}

export interface CompleteTransitPost {
  event: TransitEvent;
  moonRashi: number;
  evaluation: TransitEvaluation;
  rule: TransitRule;
}


