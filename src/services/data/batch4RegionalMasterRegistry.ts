/**
 * Sanatan Web (सनातन घड़ी)
 * Data Registry: batch4RegionalMasterRegistry.ts
 * Master Aggregator for Batch 4: 800+ Regional Festivals across India
 * Strict < 300 lines modular standard
 */

import { RegionalFestivalDefinition, RegionZone } from './batch4RegionalTypes';
import { BATCH_4_NORTH_REGISTRY } from './batch4RegionalNorthRegistry';
import { BATCH_4_WEST_REGISTRY } from './batch4RegionalWestRegistry';
import { BATCH_4_SOUTH_REGISTRY } from './batch4RegionalSouthRegistry';
import { BATCH_4_EAST_REGISTRY } from './batch4RegionalEastRegistry';

export * from './batch4RegionalTypes';
export { BATCH_4_NORTH_REGISTRY } from './batch4RegionalNorthRegistry';
export { BATCH_4_WEST_REGISTRY } from './batch4RegionalWestRegistry';
export { BATCH_4_SOUTH_REGISTRY } from './batch4RegionalSouthRegistry';
export { BATCH_4_EAST_REGISTRY } from './batch4RegionalEastRegistry';

export const BATCH_4_ALL_REGIONAL_REGISTRY: RegionalFestivalDefinition[] = [
  ...BATCH_4_NORTH_REGISTRY,
  ...BATCH_4_WEST_REGISTRY,
  ...BATCH_4_SOUTH_REGISTRY,
  ...BATCH_4_EAST_REGISTRY,
];

export function getRegionalClusterByZone(zone: RegionZone): RegionalFestivalDefinition[] {
  switch (zone) {
    case 'North':
      return BATCH_4_NORTH_REGISTRY;
    case 'West':
      return BATCH_4_WEST_REGISTRY;
    case 'South':
      return BATCH_4_SOUTH_REGISTRY;
    case 'East':
      return BATCH_4_EAST_REGISTRY;
    default:
      return BATCH_4_ALL_REGIONAL_REGISTRY;
  }
}
