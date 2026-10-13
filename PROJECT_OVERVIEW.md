# PROJECT_OVERVIEW.md

# Samay Ghadi – Project Overview

## Project Summary

Samay Ghadi is an offline-first Hindu Panchang application designed to provide highly accurate astronomical and Panchang information without requiring an internet connection.

The long-term goal of the project is to build a professional-grade Panchang engine whose astronomical calculations are based on the Swiss Ephemeris while preserving the existing application design, user experience, and data structures.

The application is being developed using a strict phase-by-phase migration strategy to ensure stability and maintainability.

---

# Current Technology Stack

## Core Language

* TypeScript

## User Interface

* React
* TSX Components

## Styling

* Vanilla CSS

## Build Tool

* Vite

## Configuration

* JSON

---

# Current Features

The application currently provides:

* Daily Panchang
* Tithi
* Nakshatra
* Yoga
* Karana
* Paksha
* Sunrise
* Sunset
* Moonrise
* Moonset
* Rahu Kaal
* Choghadiya
* Hora
* Muhurat
* GPS-based location support
* Manual city selection
* Manual date selection
* Offline operation

---

# Current Calculation Engine

The original Panchang engine uses mathematical approximation formulas based on:

* Epoch-based lunar cycle
* Approximate solar calculations
* Approximate lunar cycles
* Mathematical interpolation

These calculations are functional but may produce noticeable errors around Tithi and Nakshatra transition times.

---

# Migration Goal

The project is migrating from approximation-based calculations to Swiss Ephemeris.

The objectives are:

* Replace approximation formulas with professional astronomical calculations.
* Improve Tithi accuracy.
* Improve Nakshatra accuracy.
* Improve Yoga accuracy.
* Improve Karana accuracy.
* Improve Sunrise and Sunset calculations.
* Improve Moonrise and Moonset calculations.
* Preserve all existing application behaviour.

---

# Swiss Ephemeris Migration

The project uses Swiss Ephemeris as the astronomical source of truth.

The migration follows a controlled phase-by-phase process.

Key principles:

* No runtime downloads.
* Official ephemeris files bundled with the application.
* Offline-first architecture.
* Platform-independent astronomical engine.
* Backward compatibility.
* Existing UI remains unchanged.

---

# Offline-First Design

The application is designed to work completely offline after installation.

The application must never depend on:

* Internet APIs
* Cloud services
* Runtime downloads
* GitHub requests
* External astronomical services

All astronomical calculations are performed locally on the user's device.

---

# GPS Support

The application supports:

* GPS location
* Latitude
* Longitude

These values are used for astronomical calculations such as:

* Sunrise
* Sunset
* Moonrise
* Moonset

The GPS workflow must remain unchanged after migration.

---

# User Interface Policy

The Swiss Ephemeris migration is a backend-only upgrade.

The following must remain unchanged:

* UI Design
* Screen Layouts
* Navigation
* Styling
* Existing User Experience

Users should experience improved accuracy without learning a new interface.

---

# Data Compatibility

The migration must preserve:

* Existing Panchang object structures
* Existing TypeScript interfaces
* Existing component props
* Existing screen logic

No breaking API changes are permitted.

---

# Platform Strategy

The astronomical engine is designed to remain platform-independent.

The same calculation engine should be reusable across:

* Web
* Progressive Web App (PWA)
* Android
* iOS
* Future platforms

Platform-specific functionality must be implemented through adapter layers rather than inside the astronomical engine.

---

# Future Roadmap

After the Swiss Ephemeris migration is completed, the architecture should support future modules including:

* Kundli
* Vimshottari Dasha
* Gochar
* Eclipse Engine
* Festival Engine
* Muhurat Engine

These modules are outside the scope of the current migration and will be implemented separately.

---

# Development Philosophy

The project follows the following principles:

* Accuracy before features.
* Offline-first architecture.
* Clean separation of responsibilities.
* Platform independence.
* Phase-by-phase implementation.
* Mandatory audit after every phase.
* Backward compatibility.
* Long-term maintainability.

---

# Current Project Status

Architecture Status:

**ARCHITECTURE LOCKED**

Migration Status:

**Ready for Phase 0 – Swiss Ephemeris Proof of Concept**

Documentation Version:

**1.0**
