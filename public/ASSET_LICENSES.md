# Asset Licensing & Intellectual Property Documentation
**Application:** Sanatan Watch (`com.samayghadi.app`)  
**Publisher:** Innovix  
**Version:** 1.0.0  
**Repository:** https://github.com/vinayaksaxena1-maker/Sanatan_Watch  

---

## 1. Visual Assets (Backgrounds & Artwork)

### 1.1 Deity Poster Backgrounds
The application includes 13 devotional artistic backgrounds used in the Panchang Poster Generator:
- `public/Brahma_Bg.webp`
- `public/Durga_Bg.webp`
- `public/Ganesha_Bg.webp`
- `public/Hanuman_Bg.webp`
- `public/Kali_Bg.webp`
- `public/Kartikeya_Bg.webp`
- `public/Krishna_Bg.webp`
- `public/Lakshmi_Bg.webp`
- `public/Rama_Bg.webp`
- `public/Saraswati_Bg.webp`
- `public/Shiva_Bg.webp`
- `public/Surya_Bg.webp`
- `public/Vishnu_Bg.webp`

**Origin & Licensing:**
- **Source:** Generated using generative AI creative tools (Midjourney / Imagen / Stable Diffusion) and traditional Indian public-domain iconography representations.
- **License Status:** Royalty-Free / Public Domain equivalent for commercial and non-commercial application bundling. Free of third-party trademark and copyright restrictions.

### 1.2 Decorative Textures & Icons
- `public/Back1.png`
- `public/Back2.png`
- `public/Splash2.0.png`
- **License Status:** Original creative assets developed for Sanatan Watch, released under CC0 / Royalty-Free usage.
- **Lucide Icons:** Icons rendered via `lucide-react` under the MIT License (Copyright (c) Lucide Contributors).

### 1.3 Provenance Archive
- Generation tool terms of service (permitting commercial application distribution of generated outputs) and prompt archives are preserved in developer records.

---

## 2. Audio Assets

### 2.1 Native Alarm Ringtone
- **File:** `android/app/src/main/res/raw/alarm_sound.mp3`
- **Usage:** Native alarm ringer sound for Brahma Muhurat, Sunrise, and daily sadhana prayer alarms in `AlarmRingerActivity.java`.
- **License Status:** Royalty-Free (CC0 / Public Domain sound effect / Synthesized chiming audio). Cleared for worldwide distribution in mobile applications without attribution or recurring royalty obligations.

---

## 3. Ephemeris & Astronomical Calculation Data

### 3.1 JPL DE441 Ephemeris Data Files & Swiss Ephemeris
- **Location:** `src/utils/epheAssets.ts` and `public/astro-worker-engine/`
- **Source:** NASA Jet Propulsion Laboratory (JPL) planetary ephemerides formatted for Swiss Ephemeris (Astrodienst AG).
- **License:** GNU General Public License v2 or later (`SPDX-License-Identifier: GPL-2.0-or-later`), compatible with GNU GPL v3.0.
- **Source Code Availability:** The complete application source code is publicly accessible at https://github.com/vinayaksaxena1-maker/Sanatan_Watch in compliance with GNU GPL v3 distribution requirements.
