import { createClient, SetOptions } from "redis";
const { REDIS_CLIENT_URL, NODE_ENV } = process.env;

const cache = createClient({
  url: NODE_ENV === "production" ? REDIS_CLIENT_URL : undefined,
});

cache.on("error", function (err) {
  throw err;
});

await cache.connect();

/**
 * Set cache value
 * @param key - cache key
 * @param value - cache value
 * @returns {Promise<void>}
 */
async function set<T>(key: string, value: T, opts?: SetOptions): Promise<void> {
  const cacheEx = 18600;
  const cacheOpts = { EX: cacheEx, ...opts } as SetOptions;
  try {
    await cache.set(key, JSON.stringify(value), cacheOpts);
  } catch (error) {
    throw error;
  }
}

/**
 * Get cache value
 * @param key - cache key
 * @returns {Promise<T | null>}
 */
async function get<T>(key: string): Promise<T | null> {
  try {
    const value = (await cache.get(key)) as string;
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if key exists in cache
 * @param key - cache key
 * @returns {Promise<boolean>}
 */
async function has(key: string): Promise<boolean> {
  try {
    return !!(await cache.get(key));
  } catch (error) {
    throw error;
  }
}

export class Cache {
  static set = set;
  static get = get;
  static has = has;
}
