import { createClient, SetOptions } from "redis";
const { REDIS_CLIENT_URL, NODE_ENV } = process.env;
const PROD = NODE_ENV === "production";

const cache = createClient({
  url: PROD ? REDIS_CLIENT_URL : undefined,
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

/**
 * Publish message to a channel
 * @param channel - channel name
 * @param message - message
 * @returns {Promise<number>} - Number of subscribers who received the message
 */
async function publish(channel: string, message: string): Promise<number> {
  try {
    return await cache.publish(channel, message);
  } catch (error) {
    throw error;
  }
}

/**
 * Subscribe to a channel
 * @param channel - channel name
 * @param callback - callback function to handle incoming messages
 * @returns {Promise<void>}
 */
async function subscribe(
  channel: string,
  callback: (message: string) => void
): Promise<void> {
  try {
    await cache.subscribe(channel, callback);
  } catch (error) {
    throw error;
  }
}

export class Cache {
  static set = set;
  static get = get;
  static publish = publish;
  static subscribe = subscribe;
}
