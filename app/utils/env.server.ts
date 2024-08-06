import { z } from "zod";

export const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  COOKIE_DOMAIN: z.string(),
  SECRET: z.string(),
  DEV_BASE_URL: z.string(),
  BASE_URL: z.string(),
  CDN_URL: z.string(),
  IFRAME_URL: z.string(),
  VIDEO_LIBRARY_ID: z.string(),
  GITHUB_OWNER: z.string(),
  GITHUB_TOKEN: z.string(),
  RESEND_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
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
