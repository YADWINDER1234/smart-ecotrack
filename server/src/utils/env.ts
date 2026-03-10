import { AppError } from "./errors";

export function getEnv(name: string, fallback?: string): string {
  const val = process.env[name] ?? fallback;
  if (!val) {
    throw new AppError(`Missing environment variable: ${name}`, 500, "ENV_MISSING");
  }
  return val;
}

