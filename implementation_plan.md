# Master Implementation Plan: Swiss Ephemeris Offline Web Migration

This document serves as the master implementation guide for the high-precision astronomical engine upgrade. The goal is to establish a 100% offline, browser-compatible Swiss Ephemeris engine with Drik Panchang-level accuracy, keeping existing UI components and TSX/CSS layers fully unchanged.

---

## Mandatory Implementation Rules
1. **Strict Phase-by-Phase Execution**: Never combine or skip phases. Do not write code or install dependencies for a future phase.
2. **No Unrelated Code Changes**: Refactoring outside the scope of the current phase is strictly prohibited.
3. **Backward Compatibility**: Existing TS/TSX props, exported interfaces, and Panchang data object structures must remain identical.
4. **Offline Preservation**: No internet calls, no GitHub access, no external CDNs. All assets must load locally.
5. **Compilation Verification**: The codebase must build cleanly (`npm run build` / `npm run dev`) at the end of every phase.
6. **Explicit Approvals**: Stop at every phase's designated STOP POINT. Do not proceed until reviewed and approved.

---

## Phase 0: Swiss Ephemeris Verification Spike & AGPL Isolation Design

### Objective
Verify that Swiss Ephemeris WebAssembly compiles and initializes, and that ephemeris files load correctly from local static assets offline. Propose Web Worker isolation to prevent main thread blocking, and verify license compliance.

### AGPL v3 Licensing & Two-Tier Architectural Strategy
> [!IMPORTANT]
> To comply with the GNU Affero General Public License (AGPL) v3 while keeping the main application proprietary (closed-source), the system utilizes a **Two-Tier Isolated Micro-Engine Model**:
> 1. **Part A (Commercial Main App - Closed Source)**: Contains all UI, Business Logic, Kundali Matching, Dasha calculations, and app shells. This layer has zero Swiss Ephemeris code dependencies or imports.
> 2. **Part B (Astro Micro-Engine - AGPL Open Source)**: A standalone, minimal Web Worker module. Its sole responsibility is returning raw planetary coordinates (Longitude, Speed, Degrees) and rise/set Julian Days. This component is published under AGPL v3 to comply with the license.
> 3. **Non-Linking Boundary**: Both modules strictly communicate asynchronously via serializable JSON messages (`postMessage` API). There is no static code linking, preserving the proprietary status of the main application.

### Files to Add
- `public/ephe/sepl_18.se1`: Bundled planetary ephemeris (1800 AD - 2400 AD, ~1.4 MB). Required for Sun coordinates.
- `public/ephe/semo_18.se1`: Bundled lunar ephemeris (1800 AD - 2400 AD, ~1.4 MB). Required for Moon coordinates.
- `src/utils/testSwissEphemeris.ts`: Standalone POC validation script containing test calculations.

### Files to Modify
- `package.json`: Add `sweph-wasm` as a dependency.
- `vite.config.ts`: Configure static asset packaging rules.
- `src/App.tsx`: Temporary test import of the POC module.

### Files that MUST NOT be modified
- `src/utils/panchangCalc.ts`
- All TSX screens/components (e.g., `MuhuratScreen.tsx`, `PanchangScreen.tsx`)
- All CSS files

### Implementation Steps
1. Add `sweph-wasm` to dependencies in `package.json` and download files into the local workspace.
2. Store `sepl_18.se1` and `semo_18.se1` in `public/ephe/`.
3. Configure `vite.config.ts` to ensure ephemeris binary assets are bundled as static files.
4. In `testSwissEphemeris.ts`, implement a function triggered by URL parameter `?poc=true` to:
   - Load and compile `sweph-wasm`.
   - Write ephemeris binary buffers fetched locally via ArrayBuffer to Emscripten FS.
   - Call `swe_set_ephe_path("/ephe")`.
   - Call `swe_set_sid_mode(1, 0, 0)`.
   - Compute apparent geocentric longitude for Sun & Moon, Lahiri Ayanamsa, and sunrise/sunset/moonrise/moonset times.
5. Import `testSwissEphemeris.ts` at the top of `src/App.tsx`.

### Expected Output
Clean WebAssembly compilation. Opening `http://localhost:3000/?poc=true` prints detailed calculations to the browser console.

### Acceptance Criteria
- [ ] Browser DevTools Network tab confirms every Swiss Ephemeris asset is loaded only from bundled local assets.
- [ ] No Swiss Ephemeris asset is ever requested from an external origin.
- [ ] Panchang calculations continue working after clearing browser cache and performing a fresh reload when the application is correctly installed/bundled for offline use.
- [ ] Browser DevTools confirms WASM loads offline in Airplane/Offline mode.
- [ ] App compiles with zero TypeScript errors.

### Manual Verification Steps
1. Start local dev server (`npm run dev`) and visit `http://localhost:3000/?poc=true`.
2. Open DevTools Console and verify Sun/Moon coordinates, Lahiri Ayanamsa, and rise/set times are printed.
3. Toggle "Offline" in DevTools Network tab, perform a hard refresh, and confirm calculations execute successfully without network requests.

### Developer Checklist
- [ ] Add `sweph-wasm` to `package.json`.
- [ ] Copy `.se1` files to `public/ephe/`.
- [ ] Implement `src/utils/testSwissEphemeris.ts` sandboxed script.
- [ ] Integrate test import in `App.tsx`.

### Rollback Strategy
- Remove `sweph-wasm` dependency.
- Delete `public/ephe/` and `src/utils/testSwissEphemeris.ts`.
- Revert `vite.config.ts` and `App.tsx` edits.

### Risk Assessment
- *Risk*: WASM asset loading blocked by strict MIME type server configuration.
- *Mitigation*: Ensure Vite is configured to serve `.se1` files as binary streams.

### Audit Checklist
- [ ] Console shows zero WASM load exceptions.
- [ ] Ephemeris path successfully established.
- [ ] Web Worker context asset fetching uses absolute URLs, and Vite serves `.se1` binary streams with the correct `application/octet-stream` headers (zero CORS/path errors).

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Phase 1: Decoupling & Mock Interface Abstraction

### Objective
Create a clean interface `AstronomicalEngine` to isolate core calculations, decoupling `panchangCalc.ts` from direct formula implementations.

### Files to Add
- `src/utils/astronomicalEngine.ts`: Declares abstraction interface and provides a temporary mock implementation using old algorithms.

### Files to Modify
- `src/utils/panchangCalc.ts`: Refactor Tithi, Nakshatra, Yoga, Karana, and Sunrise/Sunset functions to query `AstronomicalEngine`.

### Files that MUST NOT be modified
- UI/TSX components.
- CSS files.

### Implementation Steps
1. Define the `AstronomicalEngine` interface inside `astronomicalEngine.ts`.
2. Add a fallback implementation inside `astronomicalEngine.ts` that redirects queries to the old mathematical approximation algorithms.
3. Replace all inline calculations inside `panchangCalc.ts` with calls to `AstronomicalEngine`.

### Expected Output
Clean compile of the application. The system operates on the mock engine, displaying identical output.

### Acceptance Criteria
- [ ] Complete codebase builds cleanly (`npm run build`).
- [ ] App rendering outputs are identical to baseline data.

### Manual Verification Steps
1. Navigate the app across all screens (Home, Panchang, Muhurat) and confirm all numbers and times are displayed correctly.

### Developer Checklist
- [ ] Create `astronomicalEngine.ts` interface.
- [ ] Decouple `panchangCalc.ts`.

### Rollback Strategy
Restore original `panchangCalc.ts` and delete `astronomicalEngine.ts`.

### Risk Assessment
- *Risk*: Typos during refactoring causing broken calculations.
- *Mitigation*: Run unit tests on old and new calculations to ensure bit-perfect outputs.

### Audit Checklist
- [ ] No inline coordinates calculations remain in `panchangCalc.ts`.

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Phase 2A: Swiss Ephemeris Core Integration (Part B: Isolated Web Worker)

### Objective
Integrate the verified Swiss Ephemeris engine into the `AstronomicalEngine` abstraction, running computations inside an isolated Web Worker thread (Part B). Enforce communication strictly through serializable JSON messages via `postMessage` (no static imports) to fulfill AGPL v3 isolation compliance.

### Files to Modify
- `src/utils/astronomicalEngine.ts`: Swap mock logic with real Swiss Ephemeris WASM calculations via asynchronous worker messaging.
- `src/App.tsx`: Clean up the temporary Phase 0 test import.

### Files that MUST NOT be modified
- `src/utils/panchangCalc.ts` (Tithi, Nakshatra, Yoga, Karana, Month, Samvat calculation code must NOT be modified in this phase).
- UI/TSX components.
- CSS files.

### Implementation Steps
1. Configure a standalone Web Worker script (representing **Part B - AGPL Astro Micro-Engine**) that loads the Swiss Ephemeris WASM instance and ephemeris MEMFS binary mounting.
2. In `astronomicalEngine.ts` (**Part A**), implement asynchronous message passing to communicate with the Web Worker strictly using:
   - Input Payload: `{ year, month, day, hour, lat, lon }`
   - Output Payload: `{ sun_longitude, moon_longitude, planet_speeds, rise_set_data }`
3. Maintain an explicit `isInitialized` loading state in the `AstronomicalEngine` / UI wrapper layer. Suppress or block calculation requests until the Web Worker compiles and broadcasts `postMessage({ status: 'READY' })`. While initial WASM RAM allocation (~2.8 MB) mounts, display a temporary "Engine Initializing..." skeleton loader state.
4. Implement out-of-range date check inside the worker's coordinate calculations:
   - Since the bundled ephemeris files (`sepl_18.se1` and `semo_18.se1`) only cover years 1800 AD to 2400 AD, check the requested date.
   - If the input year is `< 1800` or `> 2400`, automatically append the `SEFLG_MOSEPH` (Moshier Analytical Ephemeris) fallback flag to `swe_calc_ut`.
   - Wrap Swiss Ephemeris file access and coordinate calculation operations in a try-catch block. On any missing-file or mounting exception, catch the error gracefully and automatically fallback to Moshier analytical engine results instead of throwing null-pointer crashes.
5. In the worker script, replace Sunrise, Sunset, Moonrise, and Moonset calculations with official Swiss Ephemeris rise/set routines (`swe_rise_trans`):
   - Enforce upper-limb horizontal contact checks (omitting `SE_BIT_DISC_CENTER` to match standard Drik Panchang).
   - Configure standard atmospheric refraction inputs (pressure: 1013.25 mbar, temperature: 15°C).
   - Implement strict exception handling (null checks) for polar coordinates and high latitudes where events may return "No Event" status (e.g., continuous day/night or no moonrise) to prevent solver loops.
6. Enforce UTC internal calculations and convert coordinates only for final display timezone offset conversion.
7. Correct lunar parallax dynamically on location change by calling `swe_set_topo(lat, lon, alt)` and passing the `SEFLG_TOPOCTR` flag to `swe_calc_ut`.
8. Initialize the local memory cache inside the Web Worker to keep coordinates lookups fast.

### Expected Output
High-precision coordinate calculations returning correct Sun and Moon longitudes, Lahiri Ayanamsa, and rise/set times without blocking the UI main thread.

### Acceptance Criteria
- [ ] Sun Longitude verified.
- [ ] Moon Longitude verified.
- [ ] Sunrise verified.
- [ ] Sunset verified.
- [ ] Moonrise verified.
- [ ] Moonset verified.
- [ ] UTC handling verified.
- [ ] Offline verified.
- [ ] Thread isolation: Main thread remains free from memory spikes or frame drops during file mounting.
- [ ] Legal isolation: Zero static linking or imports from Swiss Ephemeris inside the main application code (Part A).
- [ ] Boot state verified: Engine correctly exposes initialization status, preventing queries before worker reports `READY`.
- [ ] Fallback safety verified: Out-of-range dates (< 1800 AD or > 2400 AD) successfully fallback to Moshier Calculations without engine crashes or errors.

### Manual Verification Steps
1. Compare computed sunrise/sunset times with reference databases.
2. Confirm there is no lag or UI freezing on location or date switches.
3. Query coordinates for year 1750 and year 2500, verifying that calculations proceed gracefully using the Moshier analytical model.

### Developer Checklist
- [ ] Replace mock engine with WASM calls in the Web Worker.
- [ ] Implement out-of-range date Moshier fallback checks.
- [ ] Verify UTC coordinate output pipeline.

### Rollback Strategy
Revert `astronomicalEngine.ts` changes to use mock formulas.

### Risk Assessment
- *Risk*: Initial compilation loading latency.
- *Mitigation*: Load WASM module asynchronously inside the Web Worker when the app boots.

### Audit Checklist
- [ ] Verify that no modifications were made to the Panchang engine logic in `panchangCalc.ts`.

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Phase 2B: Panchang Engine Migration

### Objective
Replace the Panchang calculations inside `panchangCalc.ts` using the precise astronomical coordinates already provided by `AstronomicalEngine`.

### Files to Modify
- `src/utils/panchangCalc.ts`: Update Tithi, Nakshatra, Yoga, Karana, Paksha, Hindu Month, and Samvat calculation methods.

### Files that MUST NOT be modified
- `src/utils/astronomicalEngine.ts` (WASM loading, ephemeris path, and coordinate calculations must NOT be altered in this phase).
- UI/TSX components.
- CSS files.

### Implementation Steps
1. Update Tithi boundary calculation: `Normalize(Moon Longitude - Sun Longitude) / 12`.
2. Update Nakshatra calculation: `(Moon Longitude - Lahiri Ayanamsa) / (360 / 27)`.
3. Update Yoga calculation: `Normalize(Moon Sidereal + Sun Sidereal) / (13.333333)`.
4. Update Karana, Paksha, Month, and Samvat calculations to derive values astronomically rather than using linear epoch approximations.

### Expected Output
High-precision calendar values aligning with standard traditional astronomical rules.

### Acceptance Criteria
- [ ] Tithi matches reference.
- [ ] Nakshatra matches reference.
- [ ] Yoga matches reference.
- [ ] Karana matches reference.
- [ ] Month verified.
- [ ] Samvat verified.
- [ ] Existing UI unchanged.
- [ ] Existing object structure unchanged.

### Manual Verification Steps
1. Query key dates (e.g. eclipses, lunar transitions) and verify all calendar indexes match trusted sources.

### Developer Checklist
- [ ] Update calculations in `panchangCalc.ts`.
- [ ] Keep object structures backward-compatible.

### Rollback Strategy
Restore original `panchangCalc.ts` from Phase 2A backup.

### Risk Assessment
- *Risk*: Transition offsets.
- *Mitigation*: Set up a comparison validation check.

### Audit Checklist
- [ ] Object schema matches exactly with no TypeScript type compiler changes.

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Phase 3: High-Performance Secant-Based Boundary Transition Solver

### Objective
Implement a high-performance iterative solver using the Secant/Newton-Raphson method combined with Swiss Ephemeris speed vectors (`SEFLG_SPEED` / `result.longitude_speed`) to find exact boundary crossing times (Tithi, Nakshatra, Yoga, Karana transition) with accuracy under 1 minute.

### Files to Add
- `src/utils/solver.ts`: Precise boundary crossing solver.

### Files to Modify
- `src/utils/panchangCalc.ts`: Integrate the solver to calculate Tithi, Nakshatra, Yoga, and Karana transition times.

### Files that MUST NOT be modified
- UI/TSX screens.
- CSS files.

### Implementation Steps
1. Write the iterative solver inside `solver.ts` using the Secant Method combined with instantaneous orbital speed vectors from Swiss Ephemeris (`result.longitude_speed`) to ensure rapid convergence in 2-3 iterations, minimizing JS-to-WASM bridge overhead.
2. Configure the search space (24-hour windows) and set loop termination constraints to prevent execution freezes.
3. Update `panchangCalc.ts` to call the solver for calculating transition durations instead of linear estimates.

### Expected Output
Exact minutes of transit crossovers calculated efficiently.

### Acceptance Criteria
- [ ] Solver converges within a maximum of 3-4 iterations due to speed vector estimation.
- [ ] Discrepancy in transition times is under 60 seconds.

### Manual Verification Steps
1. Query future date transits and confirm exact timings match verified calendars.

### Developer Checklist
- [ ] Implement `solver.ts`.
- [ ] Integrate solver in `panchangCalc.ts`.

### Rollback Strategy
Restore old linear interpolation logic in `panchangCalc.ts`.

### Risk Assessment
- *Risk*: CPU bottleneck due to multiple nested solver iterations.
- *Mitigation*: Limit query searches to single-day boundaries and apply loop caps.

### Audit Checklist
- [ ] No infinite loops observed during boundary calculations.

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Phase 4: Automated Bulk Validation Suite

### Objective
Create a test framework comparing calculated metrics for 500+ random dates spanning multiple years (2026-2030) against verified references.

### Files to Add
- `src/utils/validateEngine.ts`: Automated test script.

### Files that MUST NOT be modified
- App production code files (unless tests reveal bugs in calculation logic).

### Implementation Steps
1. Write `validateEngine.ts` to test Sunrise, Sunset, Moonrise, Moonset, Tithi, Nakshatra, Yoga, Karana, Month, Samvat, and transit times.
2. Compile and run validation tests.

### Expected Output
A validation report demonstrating zero Tithi/Nakshatra errors and average transition boundary discrepancies under 1 minute.

### Acceptance Criteria
- [ ] 100% of test cases check out without discrepancies.

### Manual Verification Steps
1. Execute the validation script locally and inspect the output log file.

### Developer Checklist
- [ ] Write `validateEngine.ts`.
- [ ] Run validation suite.

### Rollback Strategy
None required (validation is non-intrusive).

### Audit Checklist
- [ ] Discrepancy report shows zero errors.

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Phase 5: Production Verification & Play Store Readiness

### Objective
Ensure full backward compatibility, compile the final optimized production-ready offline web client, and add store compliance assets (Privacy Policy and AGPL licensing disclosures).

### Files to Add
- `public/privacy-policy.html`: Local privacy policy document required for mobile/web store hosting. Contains location, date, and time permission disclosures.
- `public/astro-worker-engine/LICENSE`: AGPL-v3 license copy for the standalone micro-engine module.
- `public/astro-worker-engine/README.md`: Readme file explaining how the standalone worker module operates and how to build it.

### Files to Modify
- `src/components/SettingsScreen.tsx`: Add dynamic/static UI licensing attribution to the "About Us" or "Licenses" screen segment.

### Files that MUST NOT be modified
- Core calculations engine files (unless minor bug fixes are required).
- Main app layouts.

### Implementation Steps
1. Create `public/privacy-policy.html` containing the app's privacy statement. This will be bundled into static files, making it readily publishable via GitHub Pages (e.g., `https://yourusername.github.io/privacy-policy`).
2. Package the isolated Web Worker code into `public/astro-worker-engine/` folder structure alongside the AGPL-v3 LICENSE and a readme file, preparing it for deployment as an independent open-source repository.
3. Update `SettingsScreen.tsx` (About segment) to add the attribution string: "Astronomical calculation engine is powered by open-source Swiss Ephemeris under AGPL v3. Source code for the worker module is available on GitHub [Repo Link]."
4. Run clean production compilation: `npm run build`.
5. Launch the local build preview: `npm run preview`.
6. Verify visual layouts, setting controls, and dynamic clock rings.

### Expected Output
A fully compiled and optimized production client bundle operating completely offline, with local privacy assets and licensing attributions bundled.

### Acceptance Criteria
- [ ] Production build (`npm run build`) builds cleanly.
- [ ] Visual look and feel remains unchanged.
- [ ] Offline status verified using browser tools.
- [ ] Local privacy-policy.html successfully bundled.
- [ ] Standalone worker bundle (`astro-worker-engine/` folder) packaged with AGPL-v3 license and readme files.
- [ ] About screen contains the required Swiss Ephemeris / AGPL license attribution statement.

### Manual Verification Steps
1. Run application in Airplane Mode. Verify that all clocks and calendars update successfully on reload.
2. Verify that `/privacy-policy.html` renders correctly when queried locally.
3. Open Settings -> About screen and confirm that the Swiss Ephemeris attribution text displays correctly.

### Developer Checklist
- [ ] Create `public/privacy-policy.html`.
- [ ] Package standalone worker source in `public/astro-worker-engine/`.
- [ ] Edit `SettingsScreen.tsx` for attribution.
- [ ] Compile production build and verify compliance.

### STOP POINT
Stop implementation here. Do not continue to the next phase until this phase has been reviewed and approved.

---

## Platform Independence Requirement

The `AstronomicalEngine` must remain completely platform-independent.

It must never directly depend on browser-specific APIs (such as `fetch`, `window`, browser storage, or browser lifecycle events) or native platform APIs.

All platform-specific responsibilities—including asset loading, permissions, file access, platform initialization, and runtime-specific behaviors—must be implemented through dedicated adapter layers.

Examples include:
- Web Adapter
- Android Adapter
- iOS Adapter
- Future Platform Adapters

The `AstronomicalEngine` must communicate only through abstract interfaces and must never contain platform-specific implementation details.

This ensures that the astronomical calculation engine can be reused across:
- Web
- Progressive Web App (PWA)
- Android
- iOS
- Future platforms

without changing the Panchang Engine, calculation logic, UI architecture, object structures, or business rules.

---

## Future Roadmap (Post Production)

The modules and features listed below are NOT part of the current migration. They are future extensions made possible by the Swiss Ephemeris architecture. The current implementation ends after Phase 5. No future feature should affect the current migration schedule.

### Future Modules
After the Swiss Ephemeris migration has been completed successfully, the architecture should support future expansion for:

1. **Kundli (Birth Chart)**
   - Lagna
   - Bhava
   - Planetary Positions
   - Divisional Charts (future)
   - Planet Strength

2. **Vimshottari Dasha**
   - Mahadasha
   - Antardasha
   - Pratyantardasha
   - Timeline calculations

3. **Gochar (Transit)**
   - Current planetary transit
   - House transit
   - Transit aspects
   - Daily transit updates

4. **Eclipse Engine**
   - Solar Eclipse
   - Lunar Eclipse
   - Eclipse visibility
   - Eclipse timings
   - Eclipse notifications

5. **Festival Engine**
   - Automatic Hindu festival calculations
   - Rule-based festival determination
   - Regional festival support
   - Festival calendar generation

6. **Muhurat Engine**
   - Marriage Muhurat
   - Griha Pravesh
   - Vehicle Purchase
   - Business Muhurat
   - Daily Shubh Muhurat
   - Personalized Muhurat

### Architecture Requirements
The current `AstronomicalEngine` abstraction is designed so these future modules can be added WITHOUT:
- Changing UI architecture.
- Changing Panchang object structures.
- Rewriting Swiss Ephemeris integration.
- Changing existing APIs.
- Breaking backward compatibility.

### Final Statement
The Swiss Ephemeris migration creates the long-term astronomical foundation for all future astrology and Panchang modules while keeping the current implementation focused only on the production Panchang engine.
