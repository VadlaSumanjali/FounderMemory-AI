import type { NextConfig } from "next";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  HINDSIGHT_API_KEY: z.string().min(1, "HINDSIGHT_API_KEY is required"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
});

// Validate environment variables immediately during config parsing unless bypassed
if (process.env.SKIP_ENV_VALIDATION !== "true") {
  const validationResult = envSchema.safeParse(process.env);
  if (!validationResult.success) {
    console.error("\n❌ Environment configuration validation failed:");
    validationResult.error.issues.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    console.error("\nPlease check your .env file setup before starting the server.\n");
    throw new Error("Missing or invalid environment configuration. Startup aborted.");
  } else {
    console.log("✅ Startup environment configuration successfully validated.");
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
