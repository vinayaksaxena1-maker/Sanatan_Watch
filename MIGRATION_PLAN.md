# 🚀 MIGRATION_PLAN.md
## Sanatan Watch: Swiss Ephemeris (GPL) to Sanatan Astro Engine v2.0 (MIT) Migration

> **Project:** Sanatan Watch (`D:\Sanatan_Watch`)  
> **Source Engine:** Sanatan Web (`Sanatan Astro Engine v2.0` — NASA JPL / `astronomy-engine` MIT)  
> **Target:** 100% Proprietary, Clean-Room MIT Architecture, Zero GPL Copyleft, Zero WASM Bloat  
> **File Name Policy:** Strictly single file `D:\Sanatan_Watch\MIGRATION_PLAN.md` (No duplicates / no `_2.md` versions)  
> **Governance:** Strict Phase-by-Phase In-Phase Remediation & Approval Protocol  

---

## 🛑 STRICT ANTI-HALLUCINATION, ZERO-FREELANCING & IN-PHASE REMEDIATION PROTOCOL
*(Ye niyam sarvopari hain aur har ek step par 100% lagu honge)*

1. **ZERO UNAPPROVED EDITS (No Kalakari):** Current step ke declare kiye gaye scope ke bahar kisi bhi file ko chhoona, badalna ya "improve" karna strictly prohibited hai. UI files (`App.tsx`, `PanchangScreen.tsx`, `FestivalScreen.tsx`, `MuhuratScreen.tsx`), component files (`AnalogClock.tsx`, `ChaughadiyaRing.tsx`, `HoraRing.tsx`), CSS files, `AndroidManifest.xml`, `build.gradle` ko touch nahi kiya jayega.
2. **MANDATORY RAW TERMINAL RECEIPTS:** Har step ke complete hone par agent terminal se `git status --short`, `git diff --stat`, aur `git push` ka **exact unedited terminal output** dikhayega taaki user apni aankhon se verify kar sake.
3. **VERBATIM COPY ONLY IN STEP 3:** Sanatan Web se files port karte waqt logic ko **line-to-line verbatim copy** kiya jayega bina kisi math rewriting ya variable renaming ke. Sirf TypeScript imports (`@/...` to relative paths) adjust honge.
4. **IN-PHASE REMEDIATION & HARD STOP PROTOCOL:**
   * Har step complete hone par AI **turant rukega (Hard Stop)**.
   * User us step ke output, diff aur receipts ko check karega.
   * **In-Phase Fix:** Agar user ko us phase mein koi bhi sudhaar ya badlaav karwana hoga, toh AI **usi phase ke andar** pehle use theek karega aur re-audit receipt dega.
   * Agla step tab tak shuru **NAHI** hoga jab tak user us phase ke sudhaar se 100% santusht hokar agle step ke liye explicit approval (jaise `"PROCEED TO STEP 2"`) na de de.

---

## 🛠️ REQUIRED SKILLS & MCP / TOOLING MAPPING

1. **Primary Domain Skill: `vedic-astronomy-math`**
   * **Role:** Drik Siddhanta, Lahiri (Chitrapaksha) Ayanamsha algorithms, spherical astronomy, solar/lunar horizon rise-set zenith (90°50' refraction + semi-diameter) aur boundary crossing precision verification (Step 3 & Step 5).
2. **Quality & Debugging Skill: `systematic-debugging`**
   * **Role:** Agar Step 5 test suite ya build mein koi mismatch aaye, toh bina guesswork ke root cause isolate karna aur usi phase mein fix karna.
3. **Architecture Skill: `react-clean-modular`**
   * **Role:** Zero circular dependency, clean TypeScript folder structure (`src/engine/` & `src/services/`), aur zero bundle bloat.
4. **Execution & Audit Tools (`run_command` via PowerShell):**
   * Unedited raw terminal receipts (`git push`, `git status --short`, `git diff --stat`, `npm run build`) nikaal kar report karne ke liye.
   * File tools (`read_file`, `write_file`, `edit_file`) strictly declared step blast radius mein rahenge.

---

## 1. Objective & Strategic Drivers

1. **Eliminate GPL v2/v3 Copyleft Risk:** Remove all `swisseph-wasm` and `.se1` dependencies to ensure 100% proprietary code ownership without open-source obligations or Astrodienst commercial fees.
2. **Lean Mobile Footprint:** Shrink application bundle size by removing 12 MB+ of binary WASM and ephemeris files.
3. **Microsecond Startup Speed:** Eliminate WebWorker cold-start compilation overhead (200ms–400ms) with direct in-memory synchronous execution (2ms–5ms).
4. **Preserve Verified Accuracy:** Direct port of 1,902-tested modules from Sanatan Web with zero scratch-math rewrites.

---

## 2. Scope Constraints (Strict YAGNI)

- **Zero UI Changes:** Clock face, rings, panchang screen, CSS, and Android widgets remain 100% untouched.
- **Port ONLY Required Modules:**
  - `sanatan_jpl_bridge.ts`
  - `panchangCalc.ts`
  - `muhuratRules.ts`
  - `festivalEngine.ts`
  - `unifiedVrataRegistryService.ts`
  - `festivalPujaMuhuratService.ts`
  - `dynamicFestivalEngineService.ts`
- **Strictly Excluded (No Kundli Bloat):** Kundli, 16-Vargas (D1–D60), Shadbala, Ashtakavarga, and predictive horoscope files are strictly blocked from being ported.
- **Backward-Compatible Adapter:** `src/utils/astronomicalEngine.ts` maintains exact 1:1 exported function signatures, interfaces, and wraps synchronous calls in `Promise.resolve(...)` where existing callers expect Promises.

---

## 3. Step-by-Step Execution Roadmap

### [ ] Step 1: Two-Stage Git Remote Backup & Governance Unlock
- **Part 1A — Pre-Migration GitHub Remote Backup:**
  - Bina kisi core file ko touch kiye, current working state ka safe commit aur push verify karein: `git push origin task-2`.
  - Terminal se raw push output receipt show karein.
- **Part 1B — Governance Unlock & Plan Commitment:**
  - `ENGINE_RULES.md` ko update karein jisme project owner ki explicit permission document ho (`astronomicalEngine.ts` unlock aur `astroWorker.ts` removal).
  - `MIGRATION_PLAN.md` ko repository mein commit karein.
  - **Active Skills/Tools:** `run_command` (Git commit & push).
  - **Verification:** Run and display raw `git status --short` and `git log -n 2`.
- **HARD STOP:** User review karega. Agar koi sudhaar hoga toh Step 1 mein hi hoga. Agle step ke liye `"PROCEED TO STEP 2"` aane par hi aage badhenge.

### [ ] Step 2: GPL Dependency & Binary Cleanup
- Uninstall `swisseph-wasm` from `package.json` and `node_modules`.
- Install lightweight, MIT-licensed `astronomy-engine` (~100 KB).
- Delete `src/utils/astroWorker.ts` and all `.wasm` / `.se1` binary assets.
- **Active Skills/Tools:** `run_command` (npm uninstall/install, file deletions).
- **Verification:** Run and display raw `git status --short` and `git diff --stat`.
- **HARD STOP:** User review karega. Agar koi sudhaar hoga toh Step 2 mein hi hoga. Approval `"PROCEED TO STEP 3"` milne par hi aage badhenge.

### [ ] Step 3: Port Verified Modules from Sanatan Web (Verbatim Copy)
- Obtain Sanatan Web folder path from user.
- Copy verified core files line-for-line into `src/engine/` and `src/services/`.
- Only resolve import paths (`@/...` to relative paths) for TypeScript compilation.
- **Active Skills/Tools:** `vedic-astronomy-math` (astronomical module structure), `react-clean-modular` (import path resolution).
- **Verification:** Run and display raw `git status --short`.
- **HARD STOP:** User review karega. Agar imports ya files mein koi sudhaar hoga toh Step 3 mein hi hoga. Approval `"PROCEED TO STEP 4"` milne par hi aage badhenge.

### [ ] Step 4: Drop-in Synchronous Adapter Implementation
- Refactor `src/utils/astronomicalEngine.ts` to bridge existing UI calls to the new Sanatan JPL engine.
- Guarantee identical property names (`tithiIdx`, `naksIdx`, `sunriseRaw`, `sunsetRaw`, `moonTimes`, `isRetrograde`, etc.).
- Ensure cache clearance and widget SharedPreferences bridge stability.
- **Active Skills/Tools:** `vedic-astronomy-math` (adapter data types), `react-clean-modular` (backward compatibility).
- **Verification:** Run and display raw `git status --short` and `git diff --stat`.
- **HARD STOP:** User review karega. Koi property ya interface sudhaar hoga toh yahi fix hoga. Approval `"PROCEED TO STEP 5"` milne par hi aage badhenge.

### [ ] Step 5: 50-Date Verification Suite (2026–2027)
- Run automated comparison script on 50 dates across 2026–2027.
- Validate:
  - Tithi, Nakshatra, Yoga, Karana matches.
  - Sunrise & Sunset times.
  - Chaughadiya and Rahu Kaal window accuracy.
  - Festival & Vrat dates.
- **Active Skills/Tools:** `vedic-astronomy-math` (validation logic), `systematic-debugging` (root-cause isolation if any discrepancy occurs).
- **Verification:** Display raw terminal test output and assertions pass rate.
- **HARD STOP:** User verification report check karega. Agar koi calculation mismatch hoga toh Step 5 mein hi resolve hoga. Approval `"PROCEED TO STEP 6"` milne par hi aage badhenge.

### [ ] Step 6: Production Build & Bundle Receipt
- Run `npm run lint` and `npm run build` (`tsc --noEmit` & `vite build`).
- Verify zero TypeScript compiler errors.
- Confirm reduced bundle size and 100% offline readiness.
- **Active Skills/Tools:** `run_command` (`tsc --noEmit`, `vite build`).
- **Verification:** Display raw terminal build output and final git status.
- **Delivery:** Final delivery report.

---

## 4. Risk Mitigation Matrix

| Risk | Impact | Mitigation Strategy |
| :--- | :---: | :--- |
| **Import Path Mismatch** | Build failure | Sanatan Web import aliases (`@/...`) mapped strictly to relative paths without modifying any math. |
| **Async/Sync UI Deadlocks** | Blank screen | Adapter methods wrap synchronous responses in `Promise.resolve(...)` to satisfy any legacy callers. |
| **Stale Cache Collision** | Mismatched data | Add a versioned cache-buster in `astronomicalEngine.ts` to purge obsolete Swiss cache entries on first run. |
