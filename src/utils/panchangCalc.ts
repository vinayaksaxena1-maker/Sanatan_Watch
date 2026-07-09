/**

 * @license

 * SPDX-License-Identifier: Apache-2.0

 */



import { Coords, PanchangInfo, HinduDate, Tithi, Nakshatra, Yoga, Karana, ChoghadiyaInterval, HoraInterval, MuhuratItem, MuhuratType, Festival, ChoghadiyaPresentationData } from '../types';

import { astronomicalEngine } from './astronomicalEngine';



/**

 * @license

 * SPDX-License-Identifier: Apache-2.0

 */

export const INDIAN_CITIES = [

  { city: "New Delhi", state: "Delhi", latitude: 28.6139, longitude: 77.209 },

  { city: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },

  { city: "Varanasi", state: "Uttar Pradesh", latitude: 25.3176, longitude: 82.9739 },

  { city: "Haridwar", state: "Uttarakhand", latitude: 29.9457, longitude: 78.1642 },

  { city: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },

  { city: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },

  { city: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },

  { city: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },

  { city: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },

  { city: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },

  { city: "Ujjain", state: "Madhya Pradesh", latitude: 23.176, longitude: 75.7885 },

  { city: "Patna", state: "Bihar", latitude: 25.5941, longitude: 85.1376 },

  { city: "Ayodhya", state: "Uttar Pradesh", latitude: 26.7956, longitude: 82.1944 },

  { city: "Guwahati", state: "Assam", latitude: 26.1158, longitude: 91.7086 },

  { city: "Srinagar", state: "Jammu & Kashmir", latitude: 34.0837, longitude: 74.7973 }

];

export const TITHI_DETAILS = [

  { name: "Pratipada", hindiName: "प्रतिपदा (1)", lord: "Agni", deity: "Agni" },

  { name: "Dwitiya", hindiName: "द्वितीया (2)", lord: "Brahma", deity: "Brahma" },

  { name: "Tritiya", hindiName: "तृतीया (3)", lord: "Gauri", deity: "Gauri" },

  { name: "Chaturthi", hindiName: "चतुर्थी (4)", lord: "Ganesha", deity: "Ganesha" },

  { name: "Panchami", hindiName: "पंचमी (5)", lord: "Lalita/Naga", deity: "Serpents" },

  { name: "Shashti", hindiName: "षष्ठी (6)", lord: "Kartikeya", deity: "Kartikeya" },

  { name: "Saptami", hindiName: "सप्तमी (7)", lord: "Surya", deity: "Surya" },

  { name: "Ashtami", hindiName: "अष्टमी (8)", lord: "Shiva", deity: "Durga/Rudras" },

  { name: "Navami", hindiName: "नवमी (9)", lord: "Durga", deity: "Durga" },

  { name: "Dashami", hindiName: "दशमी (10)", lord: "Yama", deity: "Ten Directions" },

  { name: "Ekadashi", hindiName: "एकादशी (11)", lord: "Vishnu", deity: "Kubera" },

  { name: "Dwadashi", hindiName: "द्वादशी (12)", lord: "Sun", deity: "Vishnu" },

  { name: "Trayodashi", hindiName: "त्रयोदशी (13)", lord: "Kama", deity: "Kama/Dharma" },

  { name: "Chaturdashi", hindiName: "चतुर्दशी (14)", lord: "Shiva", deity: "Shiva" },

  { name: "Purnima / Amavasya", hindiName: "पूर्णिमा / अमावस्या (15)", lord: "Moon", deity: "Moon/Pitrus" }

];

export const NAKSHATRA_DETAILS = [

  {

    name: "Ashwini",

    hindiName: "अश्विनी",

    lord: "Ketu",

    deity: "Ashwini Kumars (Prana)",

    symbol: "Horse Head",

    nature: "Light & Swift (Kshipra)",

    description: "First Nakshatra. Fast, active, representing initiation, healing, and quick movement.",

    suitableActivities: ["Starting medicine", "Travel", "Learning new skills", "Wearing jewelry", "Starting business"],

    avoidActivities: ["Ending contracts", "Marriages", "Completing long jobs"]

  },

  {

    name: "Bharani",

    hindiName: "भरणी",

    lord: "Venus",

    deity: "Yama (Justice)",

    symbol: "Yoni (Creativity)",

    nature: "Fierce (Ugra)",

    description: "Brings struggle but gives self-control, spiritual purification, and high resolve.",

    suitableActivities: ["Surgical acts", "Farming", "Demolition", "Laying fires", "Legal actions"],

    avoidActivities: ["Travel", "New business", "Financial transactions", "Peaceful ceremonies"]

  },

  {

    name: "Krittika",

    hindiName: "कृत्तिका",

    lord: "Sun",

    deity: "Agni (Fire)",

    symbol: "Knife/Razor",

    nature: "Mixed (Mridu-Teekshna)",

    description: "Represents fire, sharp speech, cooking, and purity. Highly intellectual and direct.",

    suitableActivities: ["Cooking", "Using fire or tools", "Debates", "Giving up bad habits", "Haircut"],

    avoidActivities: ["Water sports", "Travel", "Signing partnership agreements"]

  },

  {

    name: "Rohini",

    hindiName: "रोहिणी",

    lord: "Moon",

    deity: "Brahma (Creator)",

    symbol: "Cart/Chariot",

    nature: "Fixed (Dhruva)",

    description: "Most loved by the Moon. Represents beauty, culture, high artistic growth, and stable wealth.",

    suitableActivities: ["Marriage", "Agricultural works", "Construction", "Entering a new home", "Investments"],

    avoidActivities: ["Demolition", "Lending money", "Fierce challenges"]

  },

  {

    name: "Mrigashirsha",

    hindiName: "मृगशिरा",

    lord: "Mars",

    deity: "Soma (Moon God)",

    symbol: "Deer Head",

    nature: "Soft (Mridu)",

    description: "The searching Nakshatra. Represents curiosity, travel, beautiful clothing, and pure mind.",

    suitableActivities: ["Creative work", "Music", "Travel", "Beginning secondary studies", "Making friendship"],

    avoidActivities: ["Fierce operations", "Confrontation", "Legal suits"]

  },

  {

    name: "Ardra",

    hindiName: "आर्द्रा",

    lord: "Rahu",

    deity: "Rudra (Storm God)",

    symbol: "Tear-drop",

    nature: "Sharp (Teekshna)",

    description: "Represents moisture, tears, transformation, and finding calm after a devastating storm.",

    suitableActivities: ["Fasting", "Overcoming obstacles", "Repairs", "Deep cleaning", "Spiritual research"],

    avoidActivities: ["Marriage", "Journeys", "Opening a shop/Business"]

  },

  {

    name: "Punarvasu",

    hindiName: "पुनर्वसु",

    lord: "Jupiter",

    deity: "Aditi (Mother of Gods)",

    symbol: "Bow & Quiver",

    nature: "Movable (Chara)",

    description: "The return of the light. Bestows freedom, safety, recurrence of wealth, and safety.",

    suitableActivities: ["Starting studies", "Travel", "Purchasing cars", "Constructing gardens", "Medication"],

    avoidActivities: ["Lending cash", "Fierce debates", "Signing loans/debts"]

  },

  {

    name: "Pushya",

    hindiName: "पुष्य",

    lord: "Saturn",

    deity: "Brihaspati (Teacher)",

    symbol: "Flower/Cow Udder",

    nature: "Light & Swift (Kshipra)",

    description: "King of Nakshatras. Nourishing, giving luck, wisdom, spiritual prosperity. Extremely auspicious.",

    suitableActivities: ["Financial trading", "Gold purchase", "Signing business deals", "Treating chronic illness", "Prayers"],

    avoidActivities: ["Marriages (strictly avoided in Pushya due to old curse)"]

  },

  {

    name: "Ashlesha",

    hindiName: "अश्लेषा",

    lord: "Mercury",

    deity: "Sarpas (Nagas)",

    symbol: "Coiled Snake",

    nature: "Sharp (Teekshna)",

    description: "Deep intuition, secretive, great dynamic energy, but easily misunderstood and crafty.",

    suitableActivities: ["Yoga", "Filing law suits", "Pest control", "Leaving bad relationships", "Research"],

    avoidActivities: ["Starting new journeys", "Commercial partnerships", "Auspicious initiations"]

  },

  {

    name: "Magha",

    hindiName: "मघा",

    lord: "Ketu",

    deity: "Pitrus (Ancestors)",

    symbol: "Royal Throne",

    nature: "Fierce (Ugra)",

    description: "Represents royalty, power, family legacy, leadership, and deep connection with ancestors.",

    suitableActivities: ["Ancestral prayers", "Political power deeds", "Assuming leadership", "Donating items to poor"],

    avoidActivities: ["Lending money", "Starting modern contracts", "Marriage ceremonies"]

  },

  {

    name: "Purva Phalguni",

    hindiName: "पूर्वाफाल्गुनी",

    lord: "Venus",

    deity: "Bhaga (Fortune)",

    symbol: "Front Legs of Bed",

    nature: "Fierce (Ugra)",

    description: "Relaxation, love, marital bliss, music, fine drama, and fine luxuries of life.",

    suitableActivities: ["Art exhibitions", "Creative acts", "Proposals", "Amusement", "Going out on dates"],

    avoidActivities: ["Spiritual meditation", "Long diets", "Treating chronic sickness"]

  },

  {

    name: "Uttara Phalguni",

    hindiName: "उत्तराफाल्गुनी",

    lord: "Sun",

    deity: "Aryaman (Friendship)",

    symbol: "Back Legs of Bed",

    nature: "Fixed (Dhruva)",

    description: "Represent loyalty, marriage contracts, establishing permanent status, and social charity.",

    suitableActivities: ["Marriages", "Laying foundation", "Entering new organizations", "Starting public projects"],

    avoidActivities: ["Aggressive debates", "Lending items", "Ending ties"]

  },

  {

    name: "Hasta",

    hindiName: "हस्त",

    lord: "Moon",

    deity: "Savitr (Sun God)",

    symbol: "Clenched Fist",

    nature: "Light & Swift (Kshipra)",

    description: "Represents hand skill, tricks, dynamic crafts, intelligence, and playful learning.",

    suitableActivities: ["Crafts", "Painting", "Commerce", "Opening accounts", "Starting light exercise"],

    avoidActivities: ["Major rest or vacation", "Spiritual detachment sessions"]

  },

  {

    name: "Chitra",

    hindiName: "चित्रा",

    lord: "Mars",

    deity: "Vishwakarma (Architect)",

    symbol: "Bright Pearl/Gem",

    nature: "Soft (Mridu)",

    description: "The jewel of heaven. Artistic, structural creation, visual beauty, and architectural mastery.",

    suitableActivities: ["Architecture design", "Buying jewelry", "Music release", "Gardening", "Decorating room"],

    avoidActivities: ["Investigating crimes", "Legal debates"]

  },

  {

    name: "Swati",

    hindiName: "स्वाति",

    lord: "Rahu",

    deity: "Vayu (Wind God)",

    symbol: "Shoot of Plant/Sword",

    nature: "Movable (Chara)",

    description: "Brings independence, business savvy, versatility, and the soft movement of fresh breeze.",

    suitableActivities: ["Business launches", "Trading", "Public speaking", "Purchasing cars", "Seed sowing"],

    avoidActivities: ["Fixed construction", "Long-term investments"]

  },

  {

    name: "Vishakha",

    hindiName: "विशाखा",

    lord: "Jupiter",

    deity: "Indra-Agni (Alliance)",

    symbol: "Triumphal Arch",

    nature: "Mixed (Mridu-Teekshna)",

    description: "Goal-oriented, ambitious, single-minded focus. Brings late success after intense focus.",

    suitableActivities: ["Exam study", "Competitive activities", "Target setups", "Inaugurating buildings"],

    avoidActivities: ["Marriage rituals", "Routine travel", "Confronting family members"]

  },

  {

    name: "Anuradha",

    hindiName: "अनुराधा",

    lord: "Saturn",

    deity: "Mitra (Universal Friend)",

    symbol: "Lotus Flower",

    nature: "Soft (Mridu)",

    description: "Brings success in foreign lands, spiritual groups, loyalty, and loving connections.",

    suitableActivities: ["Sufi or spiritual singing", "Foreign journeys", "Social work", "Tying friendship bands"],

    avoidActivities: ["Opening law files", "Attacking enemies"]

  },

  {

    name: "Jyeshtha",

    hindiName: "ज्येष्ठा",

    lord: "Mercury",

    deity: "Indra (King of Gods)",

    symbol: "Umbrella/Round Amulet",

    nature: "Sharp (Teekshna)",

    description: "Seniority, protective power, magical abilities, family lordship, and mental strength.",

    suitableActivities: ["Filing applications", "Self defense studies", "Secret projects", "Engineering designs"],

    avoidActivities: ["Marriage contracts", "Warm familial events"]

  },

  {

    name: "Mula",

    hindiName: "मूल",

    lord: "Ketu",

    deity: "Nirriti (Dissolution)",

    symbol: "Tied Bunch of Roots",

    nature: "Sharp (Teekshna)",

    description: "Going to the root. Represents herbal discovery, researchers, high spiritual renunciation, and truth.",

    suitableActivities: ["Gardening", "Deep research", "Starting intense treatment", "Meditation", "Breaking habits"],

    avoidActivities: ["Financial loans", "Entering new properties"]

  },

  {

    name: "Purva Ashadha",

    hindiName: "पूर्वाषाढ़ा",

    lord: "Venus",

    deity: "Apah (Water Goddess)",

    symbol: "Winnowing Basket",

    nature: "Fierce (Ugra)",

    description: "Invulnerable success. Representing water flow, declaring victory, and constant exploration.",

    suitableActivities: ["Legal defense", "Water channels creation", "Voyages", "Filing trials", "Symphonies"],

    avoidActivities: ["Soil cultivation", "Signing peaceful treaties"]

  },

  {

    name: "Uttara Ashadha",

    hindiName: "उत्तराषाढ़ा",

    lord: "Sun",

    deity: "Visvadevas (All Gods)",

    symbol: "Elephant Tusk",

    nature: "Fixed (Dhruva)",

    description: "Durable victory, social responsibility, highest integrity, and massive organizational power.",

    suitableActivities: ["Signing land properties", "Political oath", "Constructing homes", "Establishing institutions"],

    avoidActivities: ["Criminal investigations", "Initiating quick gambles"]

  },

  {

    name: "Shravana",

    hindiName: "श्रवण",

    lord: "Moon",

    deity: "Vishnu (Preserver)",

    symbol: "Three Footprints",

    nature: "Movable (Chara)",

    description: "The listening star. Represents wisdom, speech, public relations, and universal learning.",

    suitableActivities: ["Learning languages", "Music auditions", "Travel", "Opening bank accounts", "Curing illnesses"],

    avoidActivities: ["Inaugurating heavy machines", "Combative operations"]

  },

  {

    name: "Dhanishta",

    hindiName: "धनिष्ठा",

    lord: "Mars",

    deity: "Eight Vasus (Abundance)",

    symbol: "Drum/Flute",

    nature: "Movable (Chara)",

    description: "Star of music and great wealth. Generosity, musical rhythm, and massive social influence.",

    suitableActivities: ["Releasing music track", "Public rallies", "Moving properties", "Starting a vehicle drive"],

    avoidActivities: ["New partnership splits", "Lending expensive objects"]

  },

  {

    name: "Shatabhisha",

    hindiName: "शतभिषा",

    lord: "Rahu",

    deity: "Varuna (Ocean Lord)",

    symbol: "Empty Circle/100 Stars",

    nature: "Movable (Chara)",

    description: "The star of 100 physicians. Mysticism, health healing, high secrecy, and deep astronomy.",

    suitableActivities: ["Taking herbal medicines", "Medical diagnosis", "Astrology studies", "Research", "Spa therapy"],

    avoidActivities: ["Marriage rituals", "Heavy home construction"]

  },

  {

    name: "Purva Bhadrapada",

    hindiName: "पूर्वाभाद्रपद",

    lord: "Jupiter",

    deity: "Aja Ekapada (Fire Dragon)",

    symbol: "Two-Faced Man",

    nature: "Fierce (Ugra)",

    description: "Passionate and fiery. Bestows huge occult experiences, heavy resolution, and deep charisma.",

    suitableActivities: ["Occult practices", "Fasting", "Spiritual deep dives", "Aggressive tasks"],

    avoidActivities: ["Marriages", "Buying brand new cars", "Long travels"]

  },

  {

    name: "Uttara Bhadrapada",

    hindiName: "उत्तराभाद्रपद",

    lord: "Saturn",

    deity: "Ahir Budhnya (Abyss Serpent)",

    symbol: "Twins in Back of Bed",

    nature: "Fixed (Dhruva)",

    description: "Serene wisdom, yoga mastery, deep containment, and unconditional love.",

    suitableActivities: ["Home construction", "Paving roads", "Investments", "Vows taking", "Starting meditation"],

    avoidActivities: ["Quick speculations", "Aggressive law-suits"]

  },

  {

    name: "Revati",

    hindiName: "रेवती",

    lord: "Mercury",

    deity: "Pushan (Protector of Animals)",

    symbol: "Fish/Drum",

    nature: "Soft (Mridu)",

    description: "Safe journeys, love for pets, highest pure beauty, sweet speech, and cosmic finality.",

    suitableActivities: ["Travel starts", "Adopting companion animals", "Designing clothes", "Treatments", "Weddings"],

    avoidActivities: ["Long term storage of items", "Fierce defense preparations"]

  }

];

export const YOGA_DETAILS = [

  "Vishkumbha (Pre-eminent)",

  "Preeti (Loving)",

  "Ayushman (Long-lived)",

  "Saubhagya (Good Fortune)",

  "Shobhana (Beautiful)",

  "Atiganda (Great Obstacle)",

  "Sukarma (Virtuous Creator)",

  "Dhriti (Patience)",

  "Shoola (Spear/Pain)",

  "Ganda (Knot/Obstacle)",

  "Vriddhi (Growth)",

  "Dhruva (Constant)",

  "Vyaghata (Smiter)",

  "Harshana (Joyous)",

  "Vajra (Thunderbolt)",

  "Siddhi (Success)",

  "Vyatipata (Calamity)",

  "Variyan (Excellent)",

  "Parigha (Obstacle/Gate)",

  "Shiva (Auspicious)",

  "Siddha (Perfected)",

  "Sadhya (Feasible)",

  "Shubha (Auspicious)",

  "Shukla (White/Bright)",

  "Brahma (Creator)",

  "Indra (Ruler)",

  "Vaidhriti (Dividing)"

];

export const KARANA_DETAILS = [

  "Bava",

  "Balava",

  "Kaulava",

  "Taitila",

  "Garija",

  "Vanija",

  "Vishti (Bhadra)",

  "Shakuni",

  "Chatuspada",

  "Naga",

  "Kimstughna"

];

export const MONTHS_ENGLISH_HINDI = [

  { eng: "Chaitra", hin: "चैत्र", ritu: "Vasanta (Spring)" },

  { eng: "Vaisakha", hin: "वैशाख", ritu: "Vasanta (Spring)" },

  { eng: "Jyeshtha", hin: "ज्येष्ठ", ritu: "Grishma (Summer)" },

  { eng: "Ashadha", hin: "आषाढ़", ritu: "Grishma (Summer)" },

  { eng: "Shravana", hin: "श्रावण", ritu: "Varsha (Monsoon)" },

  { eng: "Bhadrapada", hin: "भाद्रपद", ritu: "Varsha (Monsoon)" },

  { eng: "Ashwin", hin: "आश्विन", ritu: "Sharad (Autumn)" },

  { eng: "Kartik", hin: "कार्तिक", ritu: "Sharad (Autumn)" },

  { eng: "Margashirsha", hin: "मार्गशीर्ष", ritu: "Hemant (Winter-pre)" },

  { eng: "Pausha", hin: "पौष", ritu: "Hemant (Winter-pre)" },

  { eng: "Maagha", hin: "माघ", ritu: "Shishir (Winter-peak)" },

  { eng: "Phalguna", hin: "फाल्गुन", ritu: "Shishir (Winter-peak)" }

];

export function calculateSolarTimes(lat: number, lon: number, date: Date) {

  return astronomicalEngine.getSolarTimes(lat, lon, date);

}

export function getPanchangForDate(lat: number, lon: number, date: Date): PanchangInfo {

  const solarTimes = calculateSolarTimes(lat, lon, date);

  const positions = astronomicalEngine.getPanchangPositions(date);

  

  const tithiIdx = positions.tithiIdx;

  const paksha: 'Shukla' | 'Krishna' = tithiIdx < 15 ? "Shukla" : "Krishna";

  const displayTithiIdx = tithiIdx % 15;

  const baseTithiObj = TITHI_DETAILS[displayTithiIdx];

  const fullTithiName = `${paksha} ${baseTithiObj.name}`;

  const fullTithiNameHindi = `${paksha === "Shukla" ? "शुक्ल" : "कृष्ण"} ${baseTithiObj.hindiName.split(" ")[0]}`;

  

  const tithiEndTime = subHoursToTimeStr(date, positions.tithiRemainingHours);

  const tithiStartTime = subHoursToTimeStr(date, -positions.tithiPassedHours);

  

  const tithi: Tithi = {

    name: fullTithiName,

    hindiName: fullTithiNameHindi,

    value: tithiIdx + 1,

    startTime: tithiStartTime,

    endTime: tithiEndTime,

    percentPassed: positions.tithiPercent,

    lord: baseTithiObj.lord,

    deity: baseTithiObj.deity

  };



  const naksIdx = positions.naksIdx;

  const baseNaksObj = NAKSHATRA_DETAILS[naksIdx];

  const naksEndTime = subHoursToTimeStr(date, positions.naksRemainingHours);

  const nakshatra: Nakshatra = {

    ...baseNaksObj,

    endTime: naksEndTime,

    value: naksIdx + 1

  };



  const yogaIdx = positions.yogaIdx;

  const yogaEndTime = subHoursToTimeStr(date, positions.yogaRemainingHours);

  const yogaString = YOGA_DETAILS[yogaIdx];

  const yogaNameEng = yogaString.split(" ")[0];

  const yogaMeaning = yogaString.includes("(") ? yogaString.slice(yogaString.indexOf("(") + 1, -1) : "Peaceful";

  const yoga: Yoga = {

    name: yogaNameEng,

    hindiName: yogaString,

    value: yogaIdx + 1,

    endTime: yogaEndTime,

    meaning: yogaMeaning

  };



  const karanaVal = positions.karanaVal;

  const karanaEndTime = subHoursToTimeStr(date, positions.karanaRemainingHours);

  const karanaName = KARANA_DETAILS[karanaVal];

  const karana: Karana = {

    name: karanaName,

    hindiName: karanaName,

    value: karanaVal + 1,

    endTime: karanaEndTime,

    type: karanaVal < 7 ? "Movable" : "Fixed"

  };



  const monthIdx = (positions.monthsSinceEpoch % 12 + 12) % 12;

  const monthInfo = MONTHS_ENGLISH_HINDI[monthIdx];

  const baseYear = date.getFullYear();

  let samvatVikram = baseYear + 57;

  let samvatShaka = baseYear - 78;

  const currentYearEpochStart = new Date(`${baseYear}-03-18T00:00:00`);

  if (date < currentYearEpochStart) {

    samvatVikram--;

    samvatShaka--;

  }



  const hinduDate: HinduDate = {
    tithi,
    nakshatra,
    yoga,
    karana,
    paksha,
    month: monthInfo.eng,
    monthHindi: monthInfo.hin,
    ritu: monthInfo.ritu,
    samvatVikram,
    samvatShaka
  };

  const day = date.getDay();
  const sunriseMin = solarTimes.sunriseRaw;
  const sunsetMin = solarTimes.sunsetRaw;
  const dayLength = sunsetMin - sunriseMin;
  const partLength = dayLength / 8;
  const rahuPartIndexMap = [8, 2, 7, 5, 6, 4, 3];
  const rahuPart = rahuPartIndexMap[day];
  const rahuStartMin = sunriseMin + (rahuPart - 1) * partLength;
  const rahuEndMin = sunriseMin + rahuPart * partLength;
  const gulikPartIndexMap = [7, 6, 5, 4, 3, 2, 1];
  const gulikPart = gulikPartIndexMap[day];
  const gulikStartMin = sunriseMin + (gulikPart - 1) * partLength;
  const gulikEndMin = sunriseMin + gulikPart * partLength;
  const yamaPartIndexMap = [6, 5, 4, 3, 2, 1, 7];
  const yamaPart = yamaPartIndexMap[day];
  const yamaStartMin = sunriseMin + (yamaPart - 1) * partLength;
  const yamaEndMin = sunriseMin + yamaPart * partLength;

  const formatRawMin = (m: number) => {
    let hrs = Math.floor(m / 60);
    let mins = Math.floor(m % 60);
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12;
    if (hrs === 0) hrs = 12;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${ampm}`;
  };
  const rahuKaal = { start: formatRawMin(rahuStartMin), end: formatRawMin(rahuEndMin) };

  const gulikKaal = { start: formatRawMin(gulikStartMin), end: formatRawMin(gulikEndMin) };

  const yamagandam = { start: formatRawMin(yamaStartMin), end: formatRawMin(yamaEndMin) };

  const choghadiyaDaySeqs = [

    ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],

    ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"],

    ["Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],

    ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh"],

    ["Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh"],

    ["Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal"],

    ["Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal"]

  ];

  const choghadiyaNightSeqs = [

    ["Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"],

    ["Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal"],

    ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog"],

    ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal"],

    ["Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh"],

    ["Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg"],

    ["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh"]

  ];

  const daySeq = choghadiyaDaySeqs[day];

  const nightSeq = choghadiyaNightSeqs[day];

  const nightPartLength = (1440 - dayLength) / 8;

  const getQualityAndName = (type: string) => {

    switch (type) {

      case "Amrit":

        return { name: "Amrit (Nectar)", hindiName: "अमृत", type: "Amrit" as const, quality: "Excellent" as const };

      case "Shubh":

        return { name: "Shubh (Auspicious)", hindiName: "शुभ", type: "Shubh" as const, quality: "Good" as const };

      case "Labh":

        return { name: "Labh (Gain)", hindiName: "लाभ", type: "Labh" as const, quality: "Excellent" as const };

      case "Chal":

        return { name: "Chal (Neutral)", hindiName: "चल", type: "Chal" as const, quality: "Neutral" as const };

      case "Kaal":

        return { name: "Kaal (Loss)", hindiName: "काल", type: "Kaal" as const, quality: "Bad" as const };

      case "Rog":

        return { name: "Rog (Disease)", hindiName: "रोग", type: "Rog" as const, quality: "Inauspicious" as const };

      default:

        return { name: "Udveg (Anxiety)", hindiName: "उद्वेग", type: "Udveg" as const, quality: "Inauspicious" as const };

    }

  };

  const choghadiya: ChoghadiyaInterval[] = [];

  for (let i = 0; i < 8; i++) {

    const startM = sunriseMin + i * partLength;

    const endM = sunriseMin + (i + 1) * partLength;

    const item = getQualityAndName(daySeq[i]);

    choghadiya.push({

      name: item.name,

      hindiName: item.hindiName,

      type: item.type,

      quality: item.quality,

      startTime: formatRawMin(startM),

      endTime: formatRawMin(endM),

      isDay: true

    });

  }

  for (let i = 0; i < 8; i++) {

    const startM = (sunsetMin + i * nightPartLength) % 1440;

    const endM = (sunsetMin + (i + 1) * nightPartLength) % 1440;

    const item = getQualityAndName(nightSeq[i]);

    choghadiya.push({

      name: item.name,

      hindiName: item.hindiName,

      type: item.type,

      quality: item.quality,

      startTime: formatRawMin(startM),

      endTime: formatRawMin(endM),

      isDay: false

    });

  }

  const moonTimes = astronomicalEngine.getMoonTimes(solarTimes.sunriseRaw, solarTimes.sunsetRaw, tithiIdx, date, lat, lon);

  const moonriseRaw = moonTimes.moonriseRaw;

  const moonsetRaw = moonTimes.moonsetRaw;

  

  const dayHoraLength = (sunsetMin - sunriseMin) / 12;

  const nightHoraLength = (sunriseMin + 1440 - sunsetMin) / 12;

  const HORA_LORDS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

  const weekdayToHoraStart = [0, 3, 6, 2, 5, 1, 4];

  const startIdx = weekdayToHoraStart[day];

  const HORA_INFO_MAP = {

    "Sun": {

      hindi: "सूर्य (Surya)",

      quality: "Neutral" as const,

      qualityHindi: "सामान्य / मध्यम",

      color: "text-orange-650 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/15 border-orange-200/50 dark:border-orange-950/30",

      benefits: "प्रशासनिक कार्य, सरकारी काम, नौकरी, राजनीति और पदभार ग्रहण।"

    },

    "Venus": {

      hindi: "शुक्र (Shukra)",

      quality: "Auspicious" as const,

      qualityHindi: "अत्यंत शुभ / अमृत",

      color: "text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-950/15 border-pink-200/50 dark:border-pink-950/30",

      benefits: "कला, संगीत, यात्रा, आभूषण व वस्त्र क्रय, सौंदर्य प्रसाधन, विवाह चर्चा।"

    },

    "Mercury": {

      hindi: "बुध (Budh)",

      quality: "Auspicious" as const,

      qualityHindi: "शुभ",

      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200/50 dark:border-emerald-950/30",

      benefits: "व्यापार, लेखन, शिक्षण, बैंक कार्य, नया निवेश और गणितीय कार्य।"

    },

    "Moon": {

      hindi: "चंद्र (Chandra)",

      quality: "Auspicious" as const,

      qualityHindi: "शुभ",

      color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/15 border-cyan-200/50 dark:border-cyan-950/30",

      benefits: "यात्रा, गृह प्रवेश, जल/तरल व्यवसाय, नवीन योजनाएँ और संगीत।"

    },

    "Saturn": {

      hindi: "शनि (Shani)",

      quality: "Inauspicious" as const,

      qualityHindi: "अशुभ",

      color: "text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-zinc-900/30 border-slate-200/50 dark:border-slate-800/30",

      benefits: "लोहा, तेल, भूमि, निर्माण कार्य और पुरानी मशीनरी का लेन-देन।"

    },

    "Jupiter": {

      hindi: "गुरु (Guru)",

      quality: "Auspicious" as const,

      qualityHindi: "अत्यंत शुभ / अमृत",

      color: "text-amber-500 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/15 border-amber-200/50 dark:border-amber-950/30",

      benefits: "धार्मिक कार्य, पूजा-अनुष्ठान, शिक्षा, गुरु दीक्षा, धन निवेश।"

    },

    "Mars": {

      hindi: "मंगल (Mangal)",

      quality: "Inauspicious" as const,

      qualityHindi: "अशु्भ",

      color: "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/15 border-rose-200/50 dark:border-rose-950/30",

      benefits: "शारीरिक गतिविधि, साहस, भूमि या पराक्रम कार्य। गृह प्रवेश या विवाह वर्जित।"

    }

  };

  const horaList: HoraInterval[] = [];

  for (let i = 0; i < 12; i++) {

    const startM = sunriseMin + i * dayHoraLength;

    const endM = sunriseMin + (i + 1) * dayHoraLength;

    const lordIdx = (startIdx + i) % 7;

    const lordName = HORA_LORDS[lordIdx];

    const info = HORA_INFO_MAP[lordName as keyof typeof HORA_INFO_MAP];

    horaList.push({

      number: i + 1,

      lord: lordName,

      lordHindi: info.hindi,

      startTime: formatRawMin(startM),

      endTime: formatRawMin(endM),

      isDay: true,

      quality: info.quality,

      qualityHindi: info.qualityHindi,

      colorClass: info.color,

      benefits: info.benefits

    });

  }

  for (let i = 0; i < 12; i++) {

    const startM = (sunsetMin + i * nightHoraLength) % 1440;

    const endM = (sunsetMin + (i + 1) * nightHoraLength) % 1440;

    const lordIdx = (startIdx + 12 + i) % 7;

    const lordName = HORA_LORDS[lordIdx];

    const info = HORA_INFO_MAP[lordName as keyof typeof HORA_INFO_MAP];

    horaList.push({

      number: i + 13,

      lord: lordName,

      lordHindi: info.hindi,

      startTime: formatRawMin(startM),

      endTime: formatRawMin(endM),

      isDay: false,

      quality: info.quality,

      qualityHindi: info.qualityHindi,

      colorClass: info.color,

      benefits: info.benefits

    });

  }

  return {

    date: date.toISOString().split("T")[0],

    hinduDate,

    sunrise: solarTimes.sunrise,

    sunset: solarTimes.sunset,

    moonrise: moonTimes.moonrise,

    moonset: moonTimes.moonset,

    rahuKaal,

    gulikKaal,

    yamagandam,

    choghadiya,

    hora: horaList

  };

}

function subHoursToTimeStr(date: Date, hours: number): string {

  const futureDate = new Date(date.getTime() + hours * 36e5);

  let hrs = futureDate.getHours();

  const mins = futureDate.getMinutes();

  const ampm = hrs >= 12 ? "PM" : "AM";

  hrs = hrs % 12;

  if (hrs === 0) hrs = 12;

  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${ampm}`;

}

export function getMuhuratsForPanchang(panchang: PanchangInfo): MuhuratItem[] {

  const parseMin = (str: string) => {

    const [time, ampm] = str.split(" ");

    let [hrs, mins] = time.split(":").map(Number);

    if (ampm === "PM" && hrs !== 12) hrs += 12;

    if (ampm === "AM" && hrs === 12) hrs = 0;

    return hrs * 60 + mins;

  };

  const sMin = parseMin(panchang.sunrise);

  const eMin = parseMin(panchang.sunset);

  const dayLength = eMin - sMin;

  const part15 = dayLength / 15;

  const nightLength = 1440 - dayLength;

  const nightPart15 = nightLength / 15;

  const abhijitStart = sMin + 7 * part15;

  const abhijitEnd = sMin + 8 * part15;

  const formatMinStr = (m: number) => {

    let hrs = Math.floor(m / 60);

    let mins = Math.floor(m % 60);

    const ampm = hrs >= 12 ? "PM" : "AM";

    hrs = hrs % 12;

    if (hrs === 0) hrs = 12;

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${ampm}`;

  };

  const brahmaStart = (sMin - 2 * nightPart15 + 1440) % 1440;

  const brahmaEnd = (sMin - nightPart15 + 1440) % 1440;

  const godhuliStart = (eMin - 1 + 1440) % 1440;

  const godhuliEnd = (eMin + 19) % 1440;

  const rahuStart = parseMin(panchang.rahuKaal.start);

  const rahuEnd = parseMin(panchang.rahuKaal.end);

  const amritChog = panchang.choghadiya.find((c) => c.isDay && c.type === "Amrit");

  const shubhChog = panchang.choghadiya.find((c) => c.isDay && c.type === "Shubh");

  return [

    {

      id: "brahma",

      name: "Brahma Muhurat",

      hindiName: "ब्रह्म मुहूर्त",

      startTime: formatMinStr(brahmaStart),

      endTime: formatMinStr(brahmaEnd),

      type: "Amrit" as MuhuratType,

      description: "Ideal for yoga, meditation, Vedic recitation, or initiating intellectual endeavors.",

      suitability: "Highly auspicious for spiritual and mental awakenings."

    },

    {

      id: "abhijit",

      name: "Abhijit Muhurat",

      hindiName: "अभिजीत मुहूर्त",

      startTime: formatMinStr(abhijitStart),

      endTime: formatMinStr(abhijitEnd),

      type: "Shubh" as MuhuratType,

      description: "The mid-day winner of all blocks. Destroys multiple planetary blockages instantly.",

      suitability: "Auspicious for launching business, starting trips, or financial deposits."

    },

    {

      id: "godhuli",

      name: "Godhuli Muhurat",

      hindiName: "गोधूलि मुहूर्त",

      startTime: formatMinStr(godhuliStart),

      endTime: formatMinStr(godhuliEnd),

      type: "Shubh" as MuhuratType,

      description: "Evening threshold. Peaceful, divine energy associated with Lord Krishna.",

      suitability: "Excellent for house contracts, marriage vows, or devotional singing."

    },

    {

      id: "rahu_kaal",

      name: "Rahu Kaal (Avoid)",

      hindiName: "राहुकाल (वर्जित)",

      startTime: panchang.rahuKaal.start,

      endTime: panchang.rahuKaal.end,

      type: "Ashubh" as MuhuratType,

      description: "Period under Rahu influence. Leads to delays, arguments, or bad outcomes.",

      suitability: "Strictly avoid starting any new venture, transaction, or ceremony."

    },

    {

      id: "amrit_chog",

      name: "Amrit Choghadiya",

      hindiName: "अमृत चौघड़िया",

      startTime: amritChog ? amritChog.startTime : "08:30 AM",

      endTime: amritChog ? amritChog.endTime : "10:00 AM",

      type: "Amrit" as MuhuratType,

      description: "Daytime nectar period. Blessed by divine planetary alignments.",

      suitability: "Highly suitable for buying precious gold, metals, and education initiations."

    },

    {

      id: "shubh_chog",

      name: "Shubh Choghadiya",

      hindiName: "शुभ चौघड़िया",

      startTime: shubhChog ? shubhChog.startTime : "11:30 AM",

      endTime: shubhChog ? shubhChog.endTime : "01:00 PM",

      type: "Shubh" as MuhuratType,

      description: "Daytime auspicious period, suitable for ongoing prosperity.",

      suitability: "Best for travel, social gatherings, signing agreements."

    }

  ];

}

export const FESTVALS_PRESETS = [

  {

    id: "f1",

    name: "Maha Shivratri",

    hindiName: "महाशिवरात्रि",

    date: "2026-02-15",

    month: "Phalguna",

    tithi: "Krishna Chaturdashi",

    description: "Devotees fast, meditate and offer prayers to Lord Shiva on this grand night of divine communion.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f2",

    name: "Holi (Dhulandi)",

    hindiName: "होली",

    date: "2026-03-04",

    month: "Phalguna",

    tithi: "Purnima",

    description: "The ancient festival of colors, celebrating the victory of good over evil, the arrival of spring, and loving play.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f3",

    name: "Rama Navami",

    hindiName: "राम नवमी",

    date: "2026-03-27",

    month: "Chaitra",

    tithi: "Shukla Navami",

    description: "Birth celebration of Lord Rama, the Seventh Avatar of Vishnu, practicing righteousness (Dharmic discipline).",

    type: "Jayanti",

    isAuspicious: true

  },

  {

    id: "f4",

    name: "Kamada Ekadashi",

    hindiName: "कामदा एकादशी",

    date: "2026-03-29",

    month: "Chaitra",

    tithi: "Shukla Ekadashi",

    description: "Fast to fulfill worldly wishes and purify karmic blocks on the day of Vishnu.",

    type: "Ekadashi",

    isAuspicious: true

  },

  {

    id: "f5",

    name: "Chaitra Purnima Yogi Fast",

    hindiName: "चैत्र पूर्णिमा",

    date: "2026-04-02",

    month: "Chaitra",

    tithi: "Purnima",

    description: "Beautiful full moon day associated with Hanuman Jayanti prayers and sacred baths.",

    type: "Purnima",

    isAuspicious: true

  },

  {

    id: "f6",

    name: "Akshaya Tritiya",

    hindiName: "अक्षय तृतीया",

    date: "2026-04-19",

    month: "Vaisakha",

    tithi: "Shukla Tritiya",

    description: "Day of eternal prosperity. Any gold purchase or asset investment today continuously grows forever.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f7",

    name: "Mohini Ekadashi",

    hindiName: "मोहिनी एकादशी",

    date: "2026-04-27",

    month: "Vaisakha",

    tithi: "Shukla Ekadashi",

    description: "Fasting dedicated to Mohini, the female dynamic avatar of Lord Vishnu to overcome attachments.",

    type: "Ekadashi",

    isAuspicious: true

  },

  {

    id: "f8",

    name: "Buddha Purnima",

    hindiName: "बुद्ध पूर्णिमा / बुद्ध जयंती",

    date: "2026-05-01",

    month: "Vaisakha",

    tithi: "Purnima",

    description: "Gautam Buddha Jayanti celebrating birth, enlightenment and final Mahaparinirvana.",

    type: "Jayanti",

    isAuspicious: true

  },

  {

    id: "f9",

    name: "Nirjala Ekadashi",

    hindiName: "निर्जला एकादशी",

    date: "2026-05-26",

    month: "Jyeshtha",

    tithi: "Shukla Ekadashi",

    description: "The toughest of 24 Ekadashis. Fasted strictly without drinking a single drop of water to secure maximum merit.",

    type: "Ekadashi",

    isAuspicious: true

  },

  {

    id: "f10",

    name: "Jyeshtha Purnima Snan",

    hindiName: "ज्येष्ठ पूर्णिमा",

    date: "2026-05-31",

    month: "Jyeshtha",

    tithi: "Purnima",

    description: "Sacred river baths and fasting for high spiritual clarity, dedicating vows of marital fidelity.",

    type: "Purnima",

    isAuspicious: true

  },

  {

    id: "f11",

    name: "Guru Purnima",

    hindiName: "गुरु पूर्णिमा",

    date: "2026-06-29",

    month: "Ashadha",

    tithi: "Purnima",

    description: "Festival honoring spiritual and academic teachers, historically associated with Sage Vyasa.",

    type: "Purnima",

    isAuspicious: true

  },

  {

    id: "f12",

    name: "Raksha Bandhan",

    hindiName: "रक्षा बंधन",

    date: "2026-08-28",

    month: "Shravana",

    tithi: "Purnima",

    description: "Celebrated bond of protection where sisters knot a sacred thread (rakhi) on their brothers wrist.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f13",

    name: "Krishna Janmashtami",

    hindiName: "कृष्ण जन्माष्टमी",

    date: "2026-09-04",

    month: "Bhadrapada",

    tithi: "Krishna Ashtami",

    description: "Birth of Lord Krishna with mid-night devotional bhajans, rocking the cradle, and grand delicious feasting.",

    type: "Jayanti",

    isAuspicious: true

  },

  {

    id: "f14",

    name: "Ganesh Chaturthi",

    hindiName: "गणेश चतुर्थी",

    date: "2026-09-15",

    month: "Bhadrapada",

    tithi: "Shukla Chaturthi",

    description: "Grand home-welcoming of Lord Vigneshwara, the destroyer of all obstacles, enjoying sweet Modaks.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f15",

    name: "Shardiya Navratri Begin",

    hindiName: "शारदीय नवरात्रि प्रारंभ",

    date: "2026-10-12",

    month: "Ashwin",

    tithi: "Shukla Pratipada",

    description: "Dandiya dances and clay pot garba, marking nine sacred nights of Goddess Durga armor and power.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f16",

    name: "Dussehra (Vijayadashami)",

    hindiName: "दशहरा / विजयादशमी",

    date: "2026-10-21",

    month: "Ashwin",

    tithi: "Shukla Dashami",

    description: "Effigy burning of demon Ravana to symbolize victory of Lord Ram, expressing ultimate universal truth.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f17",

    name: "Dhanteras Puja",

    hindiName: "धनतेरस",

    date: "2026-11-06",

    month: "Kartik",

    tithi: "Krishna Trayodashi",

    description: "Welcoming Goddess Lakshmi and Lord Dhanvantari (God of health) with fresh metal utensils or silver coins.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f18",

    name: "Diwali (Deepawali)",

    hindiName: "दीपावली",

    date: "2026-11-08",

    month: "Kartik",

    tithi: "Amavasya",

    description: "Festival of Lights, welcoming Rama back to Ayodhya. Rows of clay diyas, dynamic sweets, Lakshmi Puja.",

    type: "Major",

    isAuspicious: true

  },

  {

    id: "f19",

    name: "Dev Utthana Ekadashi",

    hindiName: "देवोत्थान एकादशी",

    date: "2026-11-20",

    month: "Kartik",

    tithi: "Shukla Ekadashi",

    description: "God Vishnu wakes up from four months of cosmic sleep, starting the auspicious Hindu marriage season.",

    type: "Ekadashi",

    isAuspicious: true

  },

  {

    id: "f20",

    name: "Kartik Purnima (Dev Deepawali)",

    hindiName: "कार्तिक पूर्णिमा (देव दीपावली)",

    date: "2026-11-24",

    month: "Kartik",

    tithi: "Purnima",

    description: "The gods celebrate Diwali in Varanasi. Sacred illuminated ghats are covered with millions of lamps.",

    type: "Purnima",

    isAuspicious: true

  }

];

export function getChoghadiyaPresentationData(panchang: PanchangInfo, currentTime: Date): ChoghadiyaPresentationData {

  const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();

  const parseTimeToMinutes = (timeStr: string) => {

    const [time, ampm] = timeStr.split(" ");

    if (!time || !ampm) return 0;

    let [hrs, mins] = time.split(":").map(Number);

    if (ampm === "PM" && hrs !== 12) hrs += 12;

    if (ampm === "AM" && hrs === 12) hrs = 0;

    return hrs * 60 + mins;

  };

  const isTimeInInterval = (currMin: number, startStr: string, endStr: string) => {

    const start = parseTimeToMinutes(startStr);

    const end = parseTimeToMinutes(endStr);

    if (start <= end) {

      return currMin >= start && currMin < end;

    } else {

      return currMin >= start || currMin < end;

    }

  };

  const sunriseMin = parseTimeToMinutes(panchang.sunrise);

  const sunsetMin = parseTimeToMinutes(panchang.sunset);

  let isDaytime = true;

  if (sunriseMin <= sunsetMin) {

    isDaytime = currentMin >= sunriseMin && currentMin < sunsetMin;

  } else {

    isDaytime = currentMin >= sunriseMin || currentMin < sunsetMin;

  }

  const getChoghadiyaColor = (type: string) => {

    switch (type) {

      case "Amrit":

        return "#10B981";

      case "Shubh":

        return "#059669";

      case "Labh":

        return "#34D399";

      case "Char":

      case "Chal":

        return "#E6DFD3";

      case "Udveg":

        return "#D97706";

      case "Kaal":

        return "#DC2626";

      case "Rog":

        return "#B91C1C";

      default:

        return "#C9A66B";

    }

  };

  const choghadiyaList = (panchang.choghadiya || []).map((ch) => ({

    ...ch,

    color: getChoghadiyaColor(ch.type)

  }));

  const activeChoghadiya = (panchang.choghadiya || []).find(

    (ch) => isTimeInInterval(currentMin, ch.startTime, ch.endTime)

  );

  const activeIndex = activeChoghadiya ? choghadiyaList.findIndex((ch) => ch.name === activeChoghadiya.name && ch.startTime === activeChoghadiya.startTime) : -1;

  const displayStartTime = activeChoghadiya?.startTime || "";

  const displayEndTime = activeChoghadiya?.endTime || "";

  return {

    choghadiyaList,

    activeIndex,

    displayStartTime,

    displayEndTime

  };

}

