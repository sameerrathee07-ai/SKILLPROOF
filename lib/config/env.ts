/**
 * Application Environment Configuration
 * Centralizes all environment variables and default runtime parameters with validation.
 */

export interface AppConfig {
  nodeEnv: "development" | "production" | "test";
  isProduction: boolean;
  isDevelopment: boolean;
  port: number;
  databaseUrl: string;
  gate: {
    passThreshold: number; // Quality score threshold (default: 6.0)
    minEffortChars: number; // Minimum pitch characters (default: 200)
  };
}

export const env: AppConfig = {
  nodeEnv: (process.env.NODE_ENV as AppConfig["nodeEnv"]) || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  gate: {
    passThreshold: Number(process.env.NEXT_PUBLIC_GATE_THRESHOLD) || 6.0,
    minEffortChars: Number(process.env.GATE_MIN_EFFORT_CHARS) || 200,
  },
};
