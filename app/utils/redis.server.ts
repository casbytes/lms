import { createClient, SetOptions } from "redis";

const { REDIS_CLIENT_URL, NODE_ENV } = process.env;
const PROD = NODE_ENV === "production";

/**
 * Create Redis client
 * @returns {RedisClientType} - Redis client
 * @throws {Error} If there's an error during the cache operation
 * 
 * @example
 * const cache = createClient({
 *   url: PROD ? REDIS_CLIENT_URL : undefined,
 * });
 */
const redisClient = createClient({
  url: PROD ? REDIS_CLIENT_URL : undefined,
});

redisClient.on("error", (error) => {
  throw error;
});

/**
 * Connect to Redis cache
 * @returns {Promise<void>}
 */
(async () => {
  await redisClient.connect();
})();

/**
 * Set cache value
 * @param {string} key - cache key  
 * @param {T} value - cache value
 * @param {SetOptions} opts - cache options
 * @returns {Promise<void>}
 * @throws {Error} If there's an error during the cache operation
 * 
 * @example
 * await set("myKey", "myValue");
 * await set("myKey", "myValue", { EX: 10 });
 */
async function set<T>(key: string, value: T, opts?: SetOptions): Promise<void> {
  const cacheEx = 18600;
  const cacheOpts = { EX: cacheEx, ...opts } as SetOptions;
  try {
    await redisClient.set(key, JSON.stringify(value), cacheOpts);
  } catch (error) {
    throw error;
  }
}

/**
 * Get cache value
 * @param {string} key - cache key
 * @returns {Promise<T | null>} - cache value
 * @throws {Error} If there's an error during the cache operation
 * 
 * @example
 * const value = await get("myKey");
 * console.log(value); // Output: "myValue"
 */
async function get<T>(key: string): Promise<T | null> {
  try {
    const value = (await redisClient.get(key)) as string;
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
 * @param {string} channel - channel name
 * @param {string} message - message to publish
 * @returns {Promise<number>} - Number of subscribers who received the message
 * @throws {Error} If there's an error during the cache operation
 * 
 * @example
 * await publish("myChannel", "Hello, Redis!");
 * This will publish the message "Hello, Redis!" to all subscribers of "myChannel"
 */
async function publish(channel: string, message: string): Promise<number> {
  try {
    return await redisClient.publish(channel, message);
  } catch (error) {
    throw error;
  }
}

/**
 * Subscribe to a channel
 * @param {string} channel - channel name
 * @param {function} callback - callback function to handle incoming messages
 * @returns {Promise<void>}
 * @throws {Error} If there's an error during the cache operation
 * 
 * @example
 * await subscribe("myChannel", (message) => {
 *   console.log(`Received message: ${message}`);
 * });
 */
async function subscribe(
  channel: string,
  callback: (message: string) => void
): Promise<void> {
  try {
    await redisClient.subscribe(channel, callback);
  } catch (error) {
    throw error;
  }
}

/**
 * Cache class
 * @class
 * @static
 * @property {function} set - set cache value
 * @property {function} get - get cache value
 * @property {function} publish - publish message to a channel
 * @property {function} subscribe - subscribe to a channel
 * 
 * @example
 * const value = await Cache.get("myKey");
 * console.log(value); // Output: "myValue"
 */
export class Redis {
  static set = set;
  static get = get;
  static publish = publish;
  static subscribe = subscribe;
}
