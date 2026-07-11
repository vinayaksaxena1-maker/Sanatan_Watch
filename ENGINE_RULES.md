# ENGINE_RULES.md

# Samay Ghadi – Engineering Rules

## Purpose

This document defines the permanent engineering rules for the Samay Ghadi project.

These rules are mandatory for every developer, AI assistant, contributor, and future implementation.

No rule in this document may be ignored unless the project owner explicitly approves the change.

---

# Rule 1 — Phase-by-Phase Development

All implementation must follow the approved Master Implementation Plan.

Implementation must:

* Complete only one phase at a time.
* Never combine multiple phases.
* Never skip a phase.
* Never continue automatically.

After every phase:

* Stop.
* Generate an audit report.
* Wait for project owner approval.

---

# Rule 2 — No Unrelated Changes

Never modify code outside the current implementation scope.

Prohibited:

* Unnecessary refactoring
* Variable renaming
* Function renaming
* File renaming
* Folder restructuring
* Performance optimization unrelated to the current phase

---

# Rule 3 — UI Protection

The migration is an astronomical engine upgrade.

The following must remain unchanged unless explicitly approved:

* UI Layout
* Navigation
* Components
* TSX Screens
* CSS
* Icons
* Colors
* Fonts
* User Experience

Users should only notice improved calculation accuracy.

---

# Rule 4 — Backward Compatibility

The following must remain compatible:

* Existing TypeScript interfaces
* Existing exported APIs
* Existing Panchang object structure
* Existing component props
* Existing application behavior

Breaking changes are not permitted.

---

# Rule 5 — Offline First

The application must remain completely offline after installation.

Never introduce:

* Runtime downloads
* External APIs
* Cloud dependencies
* GitHub requests
* CDN dependencies
* Online astronomical services

All astronomical calculations must execute locally.

---

# Rule 6 — Swiss Ephemeris

Swiss Ephemeris is the only astronomical source of truth.

All astronomical calculations must use Swiss Ephemeris after migration.

Approximation algorithms must not remain as the primary calculation engine.

---

# Rule 7 — Platform Independence

The AstronomicalEngine must remain platform-independent.

It must never directly depend on:

* Browser APIs
* Native Android APIs
* Native iOS APIs
* Platform-specific storage
* Platform-specific lifecycle events

Platform-specific functionality must be implemented through adapter layers.

Examples:

* Web Adapter
* Android Adapter
* iOS Adapter

The astronomical engine must remain reusable across future platforms.

---

# Rule 8 — GPS Preservation

Existing GPS functionality must remain operational.

Latitude and Longitude continue to be the source for:

* Sunrise
* Sunset
* Moonrise
* Moonset
* Panchang calculations

GPS workflow must never be removed.

---

# Rule 9 — Existing Object Structure

Existing Panchang data structures must remain unchanged.

Current screens must continue working without modification.

No breaking changes are allowed.

---

# Rule 10 — Build Quality

Every implementation phase must:

* Compile successfully
* Pass TypeScript checks
* Run without runtime errors
* Preserve offline capability

No phase is complete until all checks pass.

---

# Rule 11 — Audit Requirement

Every phase must end with an audit.

The audit must include:

* Files Added
* Files Modified
* Why changes were made
* Risk Assessment
* Rollback Strategy
* Build Status
* Offline Status
* Backward Compatibility
* Acceptance Criteria
* Manual Verification

Implementation must stop after the audit.

---

# Rule 12 — Approval Requirement

No implementation may continue without explicit approval from the project owner.

The AI or developer must never continue automatically.

---

# Rule 13 — Scientific Accuracy

All Panchang calculations must be based on verified astronomical calculations.

Target calculations include:

* Sun Longitude
* Moon Longitude
* Sunrise
* Sunset
* Moonrise
* Moonset
* Tithi
* Nakshatra
* Yoga
* Karana
* Paksha
* Hindu Month
* Samvat

Approximation methods must be eliminated where Swiss Ephemeris provides authoritative calculations.

---

# Rule 14 — Future Expansion

The current architecture must remain capable of supporting future modules without redesign.

Future modules include:

* Kundli
* Vimshottari Dasha
* Gochar
* Eclipse Engine
* Festival Engine
* Muhurat Engine

Future features must not require rewriting the astronomical engine.

---

# Rule 15 — Documentation

Every architectural change must be documented.

Documentation must remain synchronized with implementation.

The following documents are considered official:

* MASTER_IMPLEMENTATION_PLAN.md
* PROJECT_OVERVIEW.md
* ENGINE_RULES.md
* CURRENT_PROJECT_STRUCTURE.md
* PROJECT_HISTORY.md

---

# Rule 16 — Version Control

Every approved phase should be committed separately.

Recommended Git tags:

* phase-0-approved
* phase-1-approved
* phase-2a-approved
* phase-2b-approved
* phase-3-approved
* phase-4-approved
* phase-5-approved
* v1.0-release

---

# Rule 17 — Astronomical Engine Lock (STRICT)

The core astronomical engine files:

* `src/utils/astronomicalEngine.ts`
* `src/utils/astroWorker.ts`

Are strictly LOCKED. No developer or AI assistant is allowed to modify, refactor, optimize, or delete any code within these files without obtaining explicit, written confirmation and approval from the project owner in the active chat session.

---

# Non-Negotiable Rules

The following rules must never be violated:

* No UI redesign.
* No CSS redesign.
* No runtime internet dependency.
* No automatic implementation continuation.
* No phase skipping.
* No breaking changes.
* No loss of offline capability.
* No replacement of Swiss Ephemeris with approximation methods.
* No modification of the approved architecture without project owner approval.
* No modification of locked engine files (`src/utils/astronomicalEngine.ts` and `src/utils/astroWorker.ts`) without explicit project owner approval.

---

# Project Status

Architecture Status:

**ARCHITECTURE LOCKED**

Implementation Status:

**Awaiting Phase 0**

Document Version:

**1.0**
