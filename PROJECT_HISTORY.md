# PROJECT_HISTORY.md

# Samay Ghadi – Project History

## Purpose
This document records the evolution of the Samay Ghadi project, explains why major architectural decisions were made, and provides historical context for future development.

---

# Version 0.x - Initial Panchang Engine
The original application was designed as a lightweight offline Panchang application. It used mathematical approximation formulas based on:
- Solar calculations
- Epoch-based lunar cycles
- Synodic month approximation
- Sidereal month approximation
- Linear interpolation

The application successfully provided Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Hora, Rahu Kaal, Choghadiya, and Muhurat completely offline.

---

# Problem Identified
Testing against trusted Panchang references revealed that approximation formulas introduced noticeable errors:
- Tithi boundary differences
- Nakshatra transition differences
- Yoga timing inaccuracies
- Karana transition inaccuracies

Differences could reach several hours around transition boundaries, which was unacceptable for a professional-grade engine.

---

# Engineering Review
A complete technical review was performed. The following options were considered:
- Improve approximation formulas.
- Implement Jean Meeus algorithms.
- Integrate Swiss Ephemeris.

Swiss Ephemeris was selected as the long-term astronomical foundation because it provides professional-grade astronomical calculations and supports future expansion.

---

# Architecture Decision
The project adopted a platform-independent architecture:
- Swiss Ephemeris becomes the primary astronomical engine.
- Astronomical calculations are separated from Panchang logic.
- Platform-specific code is isolated through adapter layers.
- Existing UI and Panchang object structures remain unchanged.

---

# Offline Design Decision
Offline capability is a core requirement. The application must never depend on Internet APIs, cloud services, or runtime downloads. Swiss Ephemeris data files are bundled with the application during the build process, and all calculations execute locally on the user's device.

---

# Version 1.0 - Swiss Ephemeris Migration & 35-Point Panchang UI Integration
**Status: COMPLETED**

Key Accomplishments:
- **Swiss Ephemeris Integration**: Migrated the core calculations to use the Swiss Ephemeris WebAssembly engine running inside an isolated background Web Worker.
- **35-Point Panchang UI Integration**: Implemented a comprehensive UI matching the approved 35-point plan, including:
  - Detailed Panch-ang parameters (Tithi, Nakshatra, Yoga, Karana, Var).
  - Astronomical parameters (Ayana, Season/Ritu, transit degrees, retrograde/combustion states).
  - Muhurat Screen (Abhijit, Rahu Kaal, Gulik, Yamaganda, Durmuhurats, Varjyam, Dagda Tithis, and Bhadra Vas).
  - Personal Muhurats (Tarabala, Chandrabala).
  - Sadhana Screen (live Kundali SVG, Mantra Japa, Stotra Sangrah, Hora intervals).
  - Pooja/Yagna Muhurats (Agni Vaas, Shiva Vaas).

---

# Version 1.1 - Native Android Mobile App (Capacitor) & Compliance
**Status: COMPLETED (V1.1 RELEASE READY)**

Key Accomplishments:
- **Capacitor Integration**: Configured Capacitor to package the app as a native mobile application (App Name: "Samay Ghadi", ID: "com.samayghadi.app").
- **Asset Protection & build.gradle**: Implemented permanent `noCompress 'se1'` directives in `app/build.gradle` to protect Swiss Ephemeris binary files from packaging compression.
- **Java 17 Gradle Override**: Configured a permanent compatibility override in Gradle to build using JDK 17 to match local environments.
- **Splash Screen Hang Fix**: Debugged and resolved the native webview hanging issue:
  - Moved Swiss Ephemeris binary fetching to the main thread (bypassing worker CORS/protocol blocks).
  - Passed ArrayBuffers to worker initialization via Transferable objects.
  - Implemented Web Worker null-guards, a 4-second timeout mock fallback, and a 7-second splash screen safety dismiss.
- **Attribution & Privacy Compliance**: Updated `SettingsScreen.tsx` to include the exact AGPL v3 disclosure string, a clean link to the worker source code, and a direct clickable mapping to `/privacy-policy.html`.
- **Debug APK Generation**: Rebuilt and verified `app-debug.apk` successfully.

---

# Current Status
- **Architecture**: LOCKED (Swiss Ephemeris Web Worker Proxy Pattern)
- **Migration Status**: Completed & Verified
- **Android Integration**: Capacitor Platform Synced & Rebuilt
- **AGPL Compliance**: Verified & Active
- **Master Baseline Checkpoint**: Established

---

# Official Project Documents
The following documents together define the project master reference:
- `README.md`
- `PROJECT_OVERVIEW.md`
- `ENGINE_RULES.md`
- `CURRENT_PROJECT_STRUCTURE.md`
- `PROJECT_HISTORY.md`
- `REVERSE_ENGINEERING_DOSSIER.md`

---

# Document Status
- **Document Version**: 1.1
- **Project Status**: V1.1 RELEASE READY (MASTER BASELINE CHECKPOINT ESTABLISHED)
- **Architecture Status**: ARCHITECTURE LOCKED
