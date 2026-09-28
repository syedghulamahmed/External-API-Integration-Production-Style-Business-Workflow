# Manual proof scenarios

Use a seeded/local database and valid access tokens.

## Deadline
1. Create an internship with applicationDeadline in the past, or wait until an existing deadline passes.
2. POST /api/applications as a student.
3. Expected: HTTP 409 with code APPLICATION_DEADLINE_PASSED.
4. GET /api/internships should no longer list the expired posting because lazy expiry marks it inactive.

## Active posting limit
1. Set MAX_ACTIVE_POSTINGS=3.
2. Create three future-dated active postings for one company.
3. Attempt a fourth.
4. Expected: HTTP 409 with code MAX_ACTIVE_POSTINGS_REACHED.

## Ownership
1. Authenticate as company A.
2. Attempt PATCH /api/applications/:id/status for an application belonging to company B.
3. Expected: HTTP 403 FORBIDDEN.
4. Repeat with company B's own application.
5. Expected: status update succeeds and a notification is queued best-effort.

## Graceful email failure
Temporarily use an invalid Resend key or block provider access in a local test environment.
Submit an application.
Expected: the application remains persisted; email failure is logged and does not turn the core request into a failure.
