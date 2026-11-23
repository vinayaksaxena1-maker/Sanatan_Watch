/**
 * Sanatan Web (सनातन घड़ी)
 * Shared Types: batch4RegionalTypes.ts
 * Type definitions for Batch 4 (800+ Regional Festivals & Vratas)
 * Strict < 300 lines modular standard
 */

export type RegionZone = 'North' | 'West' | 'South' | 'East';

export interface RegionalFestivalDefinition {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  zone: RegionZone;
  statesHindi: string;        // e.g. "उत्तर प्रदेश, बिहार, राजस्थान"
  lunarMasaHindi: string;     // e.g. "कार्तिक", "भाद्रपद"
  pakshaHindi: 'शुक्ल' | 'कृष्ण' | 'सौर' | 'नक्षत्र';
  tithiOrEventHindi: string;  // e.g. "षष्ठी (संध्या अर्घ्य)", "प्रतिपदा"
  vyaptiHindi: string;        // e.g. "सायंकाल सूर्यास्त", "उदय व्यापिनी"
  deityHindi: string;
  canonicalScripture: string; // e.g. "धर्मसिंधु", "निर्णयसिंधु", "TTD पंचांग"
  historicalDates: { [year: number]: string }; // 2021-2025 PAC / Regional Almanac standard
}
