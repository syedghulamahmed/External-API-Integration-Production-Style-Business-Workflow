# Resend provider research

Official sources reviewed before integration:

- https://resend.com/nodejs
- https://resend.com/changelog/api-rate-limit
- https://resend.com/features/email-api
- https://resend.com/pricing

Resend's official Node integration uses the resend package and emails.send. Resend documents a default API rate limit of 10 requests per second and exposes rate-limit headers. Its email API supports idempotency keys, which this project uses for safe retries.

The current pricing page lists a free plan with 3,000 emails/month and 100 emails/day. Provider terms and limits can change, so production deployments should re-check the official pages.
