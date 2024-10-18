import { z } from "zod";

/**
 * Define environment variables schema
 * @returns {z.ZodObject<Record<string, z.ZodType<any>>>} - Environment variables schema
 * @throws {Error} If there's an error during the environment variables validation
 */
export const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"] as const),
  COOKIE_DOMAIN: z.string(),
  SECRET: z.string(),
  BASE_URL: z.string(),
  CDN_URL: z.string(),
  RTR_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  IFRAME_URL: z.string(),
  VIDEO_LIBRARY_ID: z.string(),
  GITHUB_OWNER: z.string(),
  GITHUB_TOKEN: z.string(),
  RESEND_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  SANITY_STUDIO_PROJECT_ID: z.string(),
  SANITY_STUDIO_DATASET: z.string(),
  REDIS_CLIENT_URL: z.string(),
  QSTASH_TOKEN: z.string(),
  MANY_APIS_API_KEY: z.string(),
  IPDATA_API_KEY: z.string(),
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

/**
 * Initialize environment variables
 * @returns {void}
 * @throws {Error} If there's an error during the environment variables validation
 * 
 * @example
 * init();
 */
export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    // eslint-disable-next-line no-console
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * Get environment variables
 * @returns {Record<string, string>} - Environment variables
 * 
 * @example
 * const env = getEnv();
 * console.log(env.MODE);
 */
export function getEnv() {
  const { NODE_ENV, CDN_URL, IFRAME_URL, VIDEO_LIBRARY_ID } = process.env;
  const VIDEO_SOURCE_URL = `${IFRAME_URL}/embed/${Number(VIDEO_LIBRARY_ID)}`;
  return {
    CDN_URL,
    MODE: NODE_ENV,
    VIDEO_SOURCE_URL,
  };
}

type ENV = ReturnType<typeof getEnv>;


declare global {
  // eslint-disable-next-line no-var
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
