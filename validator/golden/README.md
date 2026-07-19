# Golden Regression Dataset Provenance - v1

This directory holds the versioned golden baseline datasets for validateEngineV2 regression tests.

## Provenance Details
- **Swiss Ephemeris Version**: swisseph-wasm v0.0.5 (using Swiss Ephemeris v2.08)
- **Ayanamsa Mode**: Lahiri (SE_SIDM_LAHIRI = 1, set via `swe.set_sid_mode(1, 0, 0)`)
- **Ephemeris Files**:
  - `sepl_18.se1` (semi-precision planetary ephemeris, 1800 AD to 2400 AD)
  - `semo_18.se1` (semi-precision lunar ephemeris, 1800 AD to 2400 AD)
- **Dataset Generation Date**: 2026-07-19
- **Dataset Generation Script**: Embedded in `validator/validateEngineV2.ts` (run with `--generate-golden`)
- **Dataset Generation Seed**: `0x7C0DE123` (used for Mulberry32 deterministic case selections)
- **Baseline Tolerances**:
  - Planets: Longitude diff <= 0.0001°, Speed diff <= 0.00001
  - Panchang: Exact index matches
  - Sunrise/Sunset/Moonrise/Moonset: Crossover times diff <= 1 second (0.00027778 hours)
