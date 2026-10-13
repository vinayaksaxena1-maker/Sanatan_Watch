# Custom Rules for Samay Ghadi Workspace

## 1. Hinglish Format Requirement
- Implementation plans, explanations, and walkthroughs must be presented in Hinglish.
- Audit reports must be written in Hinglish.

## 2. Audit Report Format
Every audit report must contain ONLY the following four sections:
1. Overall Score
2. Final Verdict
3. Risk Review
4. Approval Decision

Do not include any other sections in the audit report.

## 3. Astronomical Engine Lock (STRICT)
- The astronomical engine files `src/utils/astronomicalEngine.ts`, `src/utils/astroWorker.ts`, `src/utils/engineLogger.ts`, and `src/components/DiagnosticLogsModal.tsx` are strictly LOCKED.
- No modifications, refactoring, or adjustments can be made to these files without explicit, written user approval in the chat.

## 4. Chaughadiya Ring Component Lock (STRICT)
- The Choghadiya Ring component file `src/components/ChaughadiyaRing.tsx` is strictly LOCKED.
- No modifications, refactoring, or adjustments can be made to this file without explicit, written user approval in the chat.

## 5. Hora Ring Component Lock (STRICT)
- The Hora Ring component file `src/components/HoraRing.tsx` is strictly LOCKED.
- No modifications, refactoring, or adjustments can be made to this file without explicit, written user approval in the chat.

## 6. Analog Clock Face Component Lock (STRICT)
- The Analog Clock Face component file `src/components/AnalogClock.tsx` is strictly LOCKED.
- No modifications, refactoring, or adjustments can be made to this file without explicit, written user approval in the chat.

## 7. Active UI Integration Plan
- The active, user-approved plan for the 35-point Panchang UI integration is located in the workspace root at [PANCHANG_UI_PLAN.md](file:///c:/Users/user/Desktop/Samay%20Ghadi/PANCHANG_UI_PLAN.md).
- Any agent working on this task must read and strictly follow the step-by-step phases defined in [PANCHANG_UI_PLAN.md](file:///c:/Users/user/Desktop/Samay%20Ghadi/PANCHANG_UI_PLAN.md). No coding can start unless explicitly approved by the user.

## 8. Home Page UI Lock (STRICT)
- The Home Page UI components and layouts in `src/App.tsx` are strictly LOCKED.
- No modifications, refactoring, styling adjustments, or layout changes can be made to the Home Page UI without explicit, written user approval in the chat.

## 9. Panchang Calculation Lock (STRICT)
- The Panchang calculation file `src/utils/panchangCalc.ts` is strictly LOCKED.
- No modifications, refactoring, or adjustments can be made to this file without explicit, written user approval in the chat.

## 10. Panchang Page UI Lock (STRICT)
- The Panchang Page UI components and layouts in `src/components/PanchangScreen.tsx` are strictly LOCKED.
- No modifications, refactoring, styling adjustments, or layout changes can be made to the Panchang Page UI without explicit, written user approval in the chat.
## 11. Festival Screen UI Lock (STRICT)
- The Festival Screen UI component and layouts in `src/components/FestivalScreen.tsx` are strictly LOCKED.
- No modifications, refactoring, styling adjustments, or layout changes can be made to the Festival Screen UI without explicit, written user approval in the chat.

## 12. Muhurat Screen UI Lock (STRICT)
- The Muhurat Screen UI component and layouts in `src/components/MuhuratScreen.tsx` are strictly LOCKED.
- No modifications, refactoring, styling adjustments, or layout changes can be made to the Muhurat Screen UI without explicit, written user approval in the chat.

## 14. Swiss Ephemeris Architecture & Dual Licensing (CRITICAL)
- The astronomical calculations run 100% inside a dedicated WebWorker thread `src/utils/astroWorker.ts` using C-WASM compiled `swisseph-wasm`.
- `src/utils/astronomicalEngine.ts` acts as the PostMessage bridge between the main UI thread and `astroWorker.ts`.
- The WebWorker engine is isolated for GPL v2/v3 licensing compliance, while the main application UI remains proprietary and private.
- **WASM Package Fetching Fix**: To prevent Android Capacitor WebView (`https://localhost`) 404 network fetch errors on 12MB `swisseph.data`, `astroWorker.ts` uses `getPreloadedPackage: () => new ArrayBuffer(0)`.
- **Julian Day Timezone Fix**: `astroWorker.ts` uses local Unix timestamp `(parsedDate.getTime() / 86400000) + 2440587.5` for exact IST (+5:30) Julian Day conversion.

## 15. Special Engines & Festival Rules (CRITICAL)
- **28 Anandadi Yogas Engine**: Implemented in `src/utils/panchangCalc.ts` based on Weekday + Nakshatra alignment (*Anand, Aadal Yoga, Amrita, Siddhi, etc.*).
- **100+ Hindu Festival Rules**: Implemented in `src/utils/festivalEngine.ts` for all 12 monthly Vrats (*Masik Durgashtami, Masik Shivaratri, Kalashtami, Sankashti, Vinayaka, Pradosh, Ekadashi, Purnima, Amavasya*) and major annual festivals (*Parvati Jayanti, Raksha Bandhan, Janmashtami, Diwali, etc.*).


