# CURRENT_PROJECT_STRUCTURE.md

# Samay Ghadi – Current Project Structure

## Purpose

This document describes the current project architecture, directory structure, core files, responsibilities, and future expansion points.

It serves as the primary reference for developers and AI assistants before modifying the codebase.

---

# Project Architecture

```
Application
│
├── UI Layer
│
├── Business Logic Layer
│
├── Astronomical Engine
│
├── Platform Adapter Layer
│
└── Swiss Ephemeris Engine
```

The architecture follows strict separation of responsibilities.

---

# Current Directory Structure

```
Project Root
│
├── public/
│   └── ephe/
│       ├── sepl_18.se1
│       └── semo_18.se1
│
├── src/
│   ├── components/
│   │
│   ├── utils/
│   │   ├── panchangCalc.ts
│   │   ├── astronomicalEngine.ts
│   │   ├── solver.ts
│   │   ├── validateEngine.ts
│   │   └── testSwissEphemeris.ts
│   │
│   ├── platform/
│   │   ├── webAdapter.ts
│   │   ├── androidAdapter.ts (Future)
│   │   └── iosAdapter.ts (Future)
│   │
│   ├── App.tsx
│   └── index.css
│
├── docs/
│
├── package.json
│
└── vite.config.ts
```

---

# Core File Responsibilities

## App.tsx

Purpose:

Application entry point.

Responsibilities:

* Initialize application.
* Render screens.
* No astronomical calculations.
* No Panchang calculations.

---

## components/

Purpose:

Contains all UI components.

Responsibilities:

* Display information.
* Receive props.
* No business logic.
* No astronomical calculations.

Rules:

Never move calculations into UI components.

---

## utils/

Purpose:

Contains all calculation engines.

This folder is the heart of the project.

---

## panchangCalc.ts

Responsibilities:

* Tithi
* Nakshatra
* Yoga
* Karana
* Paksha
* Hindu Month
* Samvat
* Panchang object generation

Rules:

* No UI logic.
* No platform logic.
* No browser-specific code.

---

## astronomicalEngine.ts

Responsibilities:

Provide astronomical data to the Panchang engine.

Examples:

* Sun Longitude
* Moon Longitude
* Sunrise
* Sunset
* Moonrise
* Moonset
* Lahiri Ayanamsa

Rules:

* Platform independent.
* No UI.
* No business logic.
* No browser dependencies.

---

## solver.ts

Responsibilities:

High precision iterative calculations.

Examples:

* Tithi transitions
* Nakshatra transitions
* Yoga transitions
* Karana transitions

---

## validateEngine.ts

Responsibilities:

Bulk validation.

Compare:

* Tithi
* Nakshatra
* Yoga
* Karana
* Rise/Set
* Transition times

against trusted astronomical references.

---

## testSwissEphemeris.ts

Purpose:

Development-only verification.

Responsibilities:

* WASM loading
* Ephemeris loading
* Coordinate verification
* Debug output

Rules:

Must not remain active in production.

---

# Platform Layer

## platform/

Purpose:

Separate platform-specific implementation from astronomical logic.

Current Platform:

* Web

Future Platforms:

* Android
* iOS

Responsibilities:

* Asset loading
* File access
* Platform initialization
* Permissions
* Runtime-specific behavior

Rules:

Platform adapters must never contain Panchang logic.

---

# Public Assets

```
public/
└── ephe/
```

Contains bundled Swiss Ephemeris data files.

Rules:

* Bundled during build.
* Never downloaded at runtime.
* Never loaded from external servers.
* Available for complete offline execution.

---

# Documentation

```
docs/
```

Contains official project documentation.

Current documents:

* MASTER_IMPLEMENTATION_PLAN.md
* PROJECT_OVERVIEW.md
* ENGINE_RULES.md
* CURRENT_PROJECT_STRUCTURE.md
* PROJECT_HISTORY.md

These documents are the source of truth for future development.

---

# Data Flow

```
User
        │
        ▼
GPS / City / Date
        │
        ▼
AstronomicalEngine
        │
        ▼
Swiss Ephemeris
        │
        ▼
Astronomical Data
        │
        ▼
Panchang Engine
        │
        ▼
PanchangInfo
        │
        ▼
UI Components
```

---

# Layer Responsibilities

## UI Layer

Responsible for:

* Rendering
* User interaction

Must never perform calculations.

---

## Panchang Layer

Responsible for:

* Calendar logic
* Hindu calendar rules
* Panchang object generation

Must never load assets.

---

## Astronomical Layer

Responsible for:

* Celestial calculations
* Coordinates
* Rise/Set
* Ayanamsa

Must never render UI.

---

## Platform Layer

Responsible for:

* Asset loading
* File access
* Permissions

Must never contain astronomical calculations.

---

# Future Expansion

The architecture is designed to support future modules without structural redesign.

Future modules include:

* Kundli
* Vimshottari Dasha
* Gochar
* Eclipse Engine
* Festival Engine
* Muhurat Engine

These modules must consume data through the existing AstronomicalEngine abstraction.

---

# Project Status

Architecture Status:

**ARCHITECTURE LOCKED**

Current Migration Status:

**Ready for Phase 0**

Structure Version:

**1.0**
