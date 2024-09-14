import { createClient, SetOptions } from "redis";
const { REDIS_CLIENT_URL } = process.env;

const cache = createClient({
  url: process.env.NODE_ENV === "production" ? REDIS_CLIENT_URL : undefined,
});

cache.on("error", (error) => {
  throw error;
});

//to avoid top-level await
(async () => {
  await cache.connect();
})();

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

export class Cache {
  static set = set;
  static get = get;
}
