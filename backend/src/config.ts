import "dotenv/config";

const positiveNumber = (name: string, fallback: number) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid " + name);
  return value;
};

export const config = {
  port: positiveNumber("PORT", 4000),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "TalentBridge <onboarding@resend.dev>",
  emailTimeoutMs: positiveNumber("EMAIL_TIMEOUT_MS", 5000),
  emailMaxRetries: positiveNumber("EMAIL_MAX_RETRIES", 3),
  maxActivePostings: positiveNumber("MAX_ACTIVE_POSTINGS", 3),
  jwtSecret: process.env.JWT_SECRET ?? "development-only-secret",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173"
};
