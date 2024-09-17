import { z } from "zod";
import { getVideoSource } from "./helpers.server";

export const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"] as const),
  COOKIE_DOMAIN: z.string(),
  SECRET: z.string(),
  BASE_URL: z.string(),
  CDN_URL: z.string(),
  JAVASCRIPT_CHECKER_URL: z.string(),
  PYTHON_CHECKER_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  IFRAME_URL: z.string(),
  VIDEO_LIBRARY_ID: z.string(),
  GITHUB_OWNER: z.string(),
  GITHUB_TOKEN: z.string(),
  RESEND_API_KEY: z.string(),
  PAYSTACK_SECRET_KEY: z.string(),
  SANITY_STUDIO_PROJECT_ID: z.string(),
  SANITY_STUDIO_DATASET: z.string(),
  REDIS_CLIENT_URL: z.string(),
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

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

export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    CDN_URL: process.env.CDN_URL,
    VIDEO_SOURCE_URL: getVideoSource(),
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
