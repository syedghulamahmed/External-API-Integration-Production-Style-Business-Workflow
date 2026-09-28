import { Resend } from "resend";
import { config } from "../config";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /429|timeout|timed out|5\\d\\d|network|fetch/i.test(message);
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("email provider timeout")), timeoutMs))
  ]);
}

export async function sendTransactionalEmail(input: EmailInput) {
  if (!config.resendApiKey) {
    console.warn("[email] RESEND_API_KEY missing; notification skipped");
    return { sent: false };
  }

  const resend = new Resend(config.resendApiKey);
  for (let attempt = 1; attempt <= config.emailMaxRetries; attempt += 1) {
    try {
      const result = await withTimeout(
        resend.emails.send(
          { from: config.emailFrom, to: [input.to], subject: input.subject, html: input.html },
          { idempotencyKey: input.idempotencyKey }
        ),
        config.emailTimeoutMs
      );
      if (result.error) throw new Error(result.error.message);
      return { sent: true, id: result.data?.id };
    } catch (error) {
      console.error("[email] attempt " + attempt + " failed", error);
      if (attempt === config.emailMaxRetries || !isRetryable(error)) return { sent: false };
      await sleep(250 * Math.pow(2, attempt - 1));
    }
  }
  return { sent: false };
}

export const sendApplicationConfirmationEmail = (to: string, id: string, title: string) =>
  sendTransactionalEmail({
    to,
    subject: "Application received: " + title,
    html: "<h2>Application received</h2><p>Your application for <strong>" + title + "</strong> was submitted successfully.</p><p>Application ID: " + id + "</p>",
    idempotencyKey: "application-confirmation/" + id
  });

export const sendApplicationStatusEmail = (to: string, id: string, title: string, status: string) =>
  sendTransactionalEmail({
    to,
    subject: "Application update: " + title,
    html: "<h2>Application status updated</h2><p>Your application for <strong>" + title + "</strong> is now <strong>" + status + "</strong>.</p><p>Application ID: " + id + "</p>",
    idempotencyKey: "application-status/" + id + "/" + status
  });
