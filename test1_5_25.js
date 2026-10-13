import SwissEph from './node_modules/swisseph-wasm/src/swisseph.js';
import fs from 'fs';

async function test1_5_25() {
  console.log("new Date('1-5-25'):", new Date('1-5-25').toISOString());
  console.log("new Date('01-05-2025'):", new Date('01-05-2025').toISOString());
  console.log("new Date('2025-05-01'):", new Date('2025-05-01').toISOString());
  console.log("new Date('2025-01-05'):", new Date('2025-01-05').toISOString());

  // Test what Date(y, m-1, d) does if inputs are parsed from "1-5-25"
  const parts = "1-5-25".split('-').map(Number);
  console.log("parts:", parts);
  const d1 = new Date(parts[0], parts[1]-1, parts[2]); // year 1, month 4 (May), day 25 -> 0001-05-25 AD!
  const d2 = new Date(parts[2], parts[1]-1, parts[0]); // year 25 (1925), month 4 (May), day 1 -> 1925-05-01 AD!
  const d3 = new Date(parts[2], parts[0]-1, parts[1]); // year 25 (1925), month 0 (Jan), day 5 -> 1925-01-05 AD!

  console.log("d1 (year 1):", d1.toISOString());
  console.log("d2 (year 1925):", d2.toISOString());
  console.log("d3 (year 1925):", d3.toISOString());
}

test1_5_25();
