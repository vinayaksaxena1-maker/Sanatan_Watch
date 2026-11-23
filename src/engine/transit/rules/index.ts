/**
 * @license MIT
 * Master Transit Rules Registry (108 Rules: 9 Planets × 12 Houses)
 * 100% Native Classical Vedic Implementation
 */

import {
  PlanetKey,
  TransitEvent,
  TransitRule,
  CompleteTransitPost
} from '../transitTypes';
import { evaluateTransitForRashi } from '../transitMath';
import { SUN_RULES } from './sunRules';
import { MOON_RULES } from './moonRules';
import { MARS_RULES } from './marsRules';
import { MERCURY_RULES } from './mercuryRules';
import { JUPITER_RULES } from './jupiterRules';
import { VENUS_RULES } from './venusRules';
import { SATURN_RULES } from './saturnRules';
import { RAHU_RULES, KETU_RULES } from './rahuKetuRules';

export const ALL_TRANSIT_RULES: Record<PlanetKey, readonly TransitRule[]> = {
  sun: SUN_RULES,
  moon: MOON_RULES,
  mars: MARS_RULES,
  mercury: MERCURY_RULES,
  jupiter: JUPITER_RULES,
  venus: VENUS_RULES,
  saturn: SATURN_RULES,
  rahu: RAHU_RULES,
  ketu: KETU_RULES
};

/**
 * Retrieves the specific rule for a (planet, house) pair.
 */
export function getTransitRule(planet: PlanetKey, house: number): TransitRule {
  const planetRules = ALL_TRANSIT_RULES[planet];
  if (!planetRules) {
    throw new Error(`Invalid planet key: ${planet}`);
  }

  const normalizedHouse = Math.max(1, Math.min(12, Math.floor(house)));
  const rule = planetRules.find(r => r.house === normalizedHouse);

  if (!rule) {
    throw new Error(`Rule not found for ${planet} in house ${house}`);
  }

  return rule;
}

/**
 * Generates a complete transit post for a specific Moon sign / Lagna.
 */
export function generateCompleteTransitPost(
  event: TransitEvent,
  moonRashi: number,
  otherPlanetRashis: Partial<Record<PlanetKey, number>> = {}
): CompleteTransitPost {
  const evaluation = evaluateTransitForRashi(
    event.planet,
    event.toRashi,
    moonRashi,
    otherPlanetRashis
  );

  const baseRule = getTransitRule(event.planet, evaluation.house);

  return {
    event,
    moonRashi,
    evaluation,
    rule: baseRule
  };
}

/**
 * Generates all 12 Rashi transit posts for a single planetary transit event.
 */
export function generateAll12RashiTransitPosts(
  event: TransitEvent,
  otherPlanetRashis: Partial<Record<PlanetKey, number>> = {}
): CompleteTransitPost[] {
  const posts: CompleteTransitPost[] = [];
  for (let rashi = 1; rashi <= 12; rashi++) {
    posts.push(generateCompleteTransitPost(event, rashi, otherPlanetRashis));
  }
  return posts;
}
