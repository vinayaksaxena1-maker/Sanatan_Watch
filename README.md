# Samay Ghadi - Sanatan Watch 📿

Samay Ghadi is a modern React-Vite web application that visualizes traditional Vedic Panchang, real-time Hora, and active Choghadiya cycles. Featuring an interactive analog/digital spiritual smartwatch simulator, a modular bento-grid dashboard, a daily shlok widget, and canvas-based poster sharing, it bridges ancient wisdom with modern UI.

## Features

- **Swiss Ephemeris C-WASM Engine**: Real-time high-precision astronomical engine powered by `swisseph-wasm` running 100% offline inside an isolated WebWorker thread (`astroWorker.ts`).
- **28 Anandadi Yogas Engine**: Automated calculation of 28 Anandadi & daily Nakshatra Yogas (*Anand, Aadal Yoga, Amrita Siddhi, Dhwanksha, Mitra, etc.*).
- **100+ Hindu Festivals & Vrats**: Dynamic astronomical rule engine for all 12 monthly Vrats (*Masik Durgashtami, Masik Shivaratri, Kalashtami, Sankashti, Vinayaka, Pradosh, Ekadashi, Purnima, Amavasya*) and major annual festivals (*Parvati Jayanti, Raksha Bandhan, Janmashtami, Diwali, etc.*).
- **Sanatan Smartwatch**: An interactive circular analog/digital clock displaying active Muhurats, Choghadiya, and Hora rings in real time.
- **Vedic Panchang**: Detailed elements including Tithi, Vara, Nakshatra, Yoga, Karana, Bhadra Alert, and full Day/Night Choghadiya & Hora tables.
- **Muhurat & Astro Metrics**: Complete list of auspicious (Abhijit, Brahma Muhurat) and adverse (Rahu Kaal, Yamaganda, Gulik Kaal) timings.
- **Daily Wisdom**: Real-time devotional Shloks and spiritual insights.
- **Sadhana Corner**: Integrated Mantra Japa counter, Live Lagna Kundali, and Stotra Sangrah.
- **Poster Generator**: Generates beautiful saffron daily Panchang posters for social media sharing.

## Engine Architecture & Dual-Licensing

- **Isolated WebWorker**: Heavy C-WASM Ephemeris math runs exclusively inside `src/utils/astroWorker.ts` (GPL v2/v3 compliant open-source engine) to maintain 0% UI lag at 60 FPS.
- **Main UI App**: React TSX frontend (`App.tsx`) communicates with the WebWorker via standard `postMessage` API bridge (`astronomicalEngine.ts`), keeping the main application UI private and proprietary.
- **WASM Preload Optimization**: Emscripten preloader uses `getPreloadedPackage: () => new ArrayBuffer(0)` to prevent 404 network fetch errors on Android Capacitor WebView (`https://localhost`).

## Tech Stack

- **Core Engine**: Swiss Ephemeris C-WASM (`swisseph-wasm`), Dedicated WebWorkers
- **Frontend**: React (v19), TypeScript, Tailwind CSS
- **Bundler**: Vite
- **Mobile Runtime**: Capacitor (Android)
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Visualization**: D3, Recharts

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Locally**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

