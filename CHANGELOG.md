# Changelog — Samay Ghadi Astronomical Engine

All notable changes to the Swiss Ephemeris WASM Astronomical Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-19

### Added
- **High-Precision Swiss Ephemeris WASM Engine**: Offline calculation engine for Sun, Moon, Navagraha planet positions, Panchang indices (Tithi, Nakshatra, Yoga, Karana, Month), and Sunrise/Sunset/Moonrise/Moonset times.
- **Adaptive Newton Boundary Solver**: Upgraded `findBoundaryCrossing` to 10 max iterations with dynamic per-iteration ayanamsa computation and 0.00001 precision threshold (~0.0000s timing drift).
- **Polar Latitude Protection**: Safe circumpolar rise/set handling in `astroWorker.ts` for latitudes |lat| > 65°, returning `isPolar: true` without throwing uncaught worker exceptions.
- **Planetary Sign Transit Coverage**: Added 12-Rashi sign transit assertions in `validateEngineV2.ts` with 100% sign matching across test suites.
- **Splash Screen Engine Loading Guard**: Splash screen waits for `astronomicalEngine.isReady()` before rendering Panchang UI to ensure WASM initialization completes without falling back to mock data.

### Fixed
- **Permanent Mock Lockout Bug**: Removed `isUsingMockFallback = true` from worker `type: 'ERROR'` handler in `astronomicalEngine.ts`. A single query error no longer locks the app into Mock Engine permanently.
- **`pendingQueries` Memory Leak**: Added `pendingQueries.delete(key)` in `type: 'ERROR'` handler to ensure failed queries are cleaned up and retried properly.
- **Case ID 43638 Equinox Boundary Flip**: Resolved 17 arcsecond Moon longitude boundary difference at New Delhi Autumnal Equinox 2029 (`333.33063002°`, Nakshatra Index 24 - Purva Bhadrapada).

### Optimized
- **Static Array Hoisting**: Hoisted `Grahas` and `zodiacSigns` arrays to top-level constants in `astroWorker.ts`, reducing object creation memory churn during calculation loops.
- **Calculation Execution Speed**: Achieved **1.82 ms average calculation time** per query in warm benchmark, well within the 15 ms limit.
