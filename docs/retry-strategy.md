# Email retry, timeout, idempotency, and graceful degradation

The application treats email as a side effect rather than part of the database transaction.

1. Persist the application/status change first.
2. Trigger email asynchronously and catch all failures.
3. Apply a 5-second timeout by default.
4. Retry transient timeout, network, HTTP 429, and 5xx-style failures.
5. Backoff is 250ms, 500ms, then 1000ms by default.
6. Use a deterministic Resend idempotency key per business event.
7. After retry exhaustion, log the failure. The core business request remains successful.
8. Resend documents a default API limit of 10 requests/second. Production scaling should add a durable queue/rate limiter rather than unbounded concurrency.

This is graceful degradation: notification delivery can be temporarily unavailable without making the application workflow unavailable.
