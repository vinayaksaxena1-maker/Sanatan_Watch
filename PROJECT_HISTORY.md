# PROJECT_HISTORY.md

# Samay Ghadi – Project History

## Purpose

This document records the evolution of the Samay Ghadi project.

It explains why major architectural decisions were made and provides historical context for future development.

This document should be updated only after major project milestones.

---

# Version 0.x

## Initial Panchang Engine

The original application was designed as a lightweight offline Panchang application.

The engine used mathematical approximation formulas based on:

* Solar calculations
* Epoch-based lunar cycles
* Synodic month approximation
* Sidereal month approximation
* Linear interpolation

The application successfully provided:

* Tithi
* Nakshatra
* Yoga
* Karana
* Sunrise
* Sunset
* Hora
* Rahu Kaal
* Choghadiya
* Muhurat

The application remained completely offline.

---

# Problem Identified

Testing against trusted Panchang references revealed that approximation formulas introduced noticeable errors.

Observed issues included:

* Tithi boundary differences
* Nakshatra transition differences
* Yoga timing inaccuracies
* Karana transition inaccuracies

In some cases the differences could reach several hours around transition boundaries.

This level of accuracy was not acceptable for a long-term astronomical Panchang engine.

---

# Engineering Review

A complete technical review was performed.

Several possible approaches were evaluated.

The following options were considered:

* Improve approximation formulas.
* Implement Jean Meeus algorithms.
* Integrate Swiss Ephemeris.

After evaluation, Swiss Ephemeris was selected as the long-term astronomical foundation because it provides professional-grade astronomical calculations and supports future expansion.

---

# Architecture Decision

The project adopted a platform-independent architecture.

Key decisions:

* Swiss Ephemeris becomes the primary astronomical engine.
* Astronomical calculations are separated from Panchang logic.
* Platform-specific code is isolated through adapter layers.
* Existing UI remains unchanged.
* Existing Panchang object structures remain unchanged.
* Existing user experience remains unchanged.

This architecture enables future support for multiple platforms without redesigning the calculation engine.

---

# Migration Strategy

The migration is intentionally performed in small controlled phases.

Reasons:

* Reduce implementation risk.
* Simplify code review.
* Enable safe rollback.
* Preserve application stability.
* Prevent AI context confusion.
* Maintain backward compatibility.

Each phase requires:

* Implementation
* Audit
* Manual verification
* Project owner approval

Only after approval may the next phase begin.

---

# Offline Design Decision

Offline capability is considered a core project requirement.

The application must never depend on:

* Internet APIs
* Cloud services
* Runtime downloads
* External astronomical providers
* GitHub during runtime

Swiss Ephemeris data files are bundled with the application during the build process.

All calculations execute locally on the user's device.

---

# Swiss Ephemeris Adoption

Swiss Ephemeris was selected because it provides:

* High-precision Sun coordinates
* High-precision Moon coordinates
* Lahiri Ayanamsa
* Sunrise
* Sunset
* Moonrise
* Moonset
* Future support for advanced astrology modules

The AstronomicalEngine abstraction ensures that Swiss Ephemeris remains an internal implementation detail and can be replaced or rebuilt without affecting the rest of the application.

---

# Platform Independence

The project is designed so that the astronomical engine can operate across multiple platforms.

Supported target platforms include:

* Web
* Progressive Web App (PWA)
* Android
* iOS

Platform-specific responsibilities are isolated through adapter layers.

---

# Future Vision

The Swiss Ephemeris migration is only the foundation.

Future planned modules include:

* Kundli
* Vimshottari Dasha
* Gochar
* Eclipse Engine
* Festival Engine
* Muhurat Engine

These modules are outside the scope of Version 1.0.

---

# Current Status

Architecture:

**LOCKED**

Implementation Plan:

**APPROVED**

Migration Status:

**Ready for Phase 0**

Offline Strategy:

**APPROVED**

Swiss Ephemeris Strategy:

**APPROVED**

Platform Independence:

**APPROVED**

Future Roadmap:

**DEFINED**

---

# Official Project Documents

The following documents together define the project:

* MASTER_IMPLEMENTATION_PLAN.md
* PROJECT_OVERVIEW.md
* ENGINE_RULES.md
* CURRENT_PROJECT_STRUCTURE.md
* PROJECT_HISTORY.md

These documents are the official engineering reference for the project.

---

# Version History

## Version 0.x

Approximation-based Panchang Engine

Status:

Completed

---

## Version 1.0

Swiss Ephemeris Migration

Status:

Ready for Implementation

---

## Future Versions

Version 2.x

Advanced Astrology Modules

Planned Features:

* Kundli
* Vimshottari Dasha
* Gochar

---

Version 3.x

Advanced Panchang Services

Planned Features:

* Eclipse Engine
* Festival Engine
* Muhurat Engine

---

# Document Status

Document Version:

**1.0**

Project Status:

**READY FOR IMPLEMENTATION**

Architecture Status:

**ARCHITECTURE LOCKED**
