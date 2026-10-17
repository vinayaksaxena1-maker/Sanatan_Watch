# Sanatan Watch - Astro Worker Engine

This directory contains the isolated **Vedic Panchang & Astronomical Calculation Web Worker** for the Sanatan Watch project.

## GNU GPL v3 Licensing & Open Source Compliance
To comply with the GNU General Public License (GPL) v3, this calculation engine operates inside a dedicated Web Worker thread powered by `swisseph-wasm`. 

The complete application and this worker module are 100% open-source and publicly hosted on GitHub:
👉 **[https://github.com/vinayaksaxena1-maker/Sanatan_Watch](https://github.com/vinayaksaxena1-maker/Sanatan_Watch)**

## Contents
* `astroWorker.ts`: The standalone Web Worker script performing high-precision Swiss Ephemeris calculations (synchronized with `src/utils/astroWorker.ts`).
* `LICENSE`: The GNU General Public License v3 copy.

## Calculations Covered
1. **Solar Times:** Precise Sunrise and Sunset times using official Swiss Ephemeris horizontal limb and atmospheric refraction standards (`swe_rise_trans`).
2. **Moon Times:** Moonrise and Moonset times (`swe_rise_trans`).
3. **Panchang Coordinates:** High-precision Sun and Moon sidereal coordinates used to derive Tithi, Nakshatra, Yoga, and Karana indices.

## Developer & Copyright Information
* **Developer / Publisher:** Innovix (Vinayak Saxena)
* **Contact:** vinayaksaxena1@gmail.com
* **Core Astronomy Engine:** Swiss Ephemeris (C) Astrodienst AG
