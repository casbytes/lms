import NodeCache from "node-cache";
import { remember } from "@epic-web/remember";

const stdTTL = 3600 * 24; //24 hours
const checkperiod = 120; // 2 minutes

// export const cache = remember(
//   "cache",
//   () => new NodeCache({ stdTTL, checkperiod })
// );
export const cache = new NodeCache({ stdTTL, checkperiod });

export function getCacheKeys() {
  return cache.keys();
}

export function getCacheStats() {
  return cache.getStats();
}
