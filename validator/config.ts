/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CONFIG = {
  cases: {
    random: 40000,
    boundary: 5000,
    historical: 2000,
    polar: 1000,
    dst: 1000,
    leapYear: 1000
  },
  tolerances: {
    planetLongitude: 0.0005, // 0.0005°
    planetSpeed: 0.00005,    // 0.00005°/day
    sunrise: 1 / 3600,       // 1 second in hours
    moonrise: 1 / 3600,      // 1 second in hours
    tithi: 'exact',
    nakshatra: 'exact',
    yoga: 'exact',
    karana: 'exact'
  },
  performance: {
    maxAverageTimeMs: 15,    // 15ms limit
    maxSlowestTimeMs: 100    // 100ms limit
  },
  goldenVersion: 'v1'
};
