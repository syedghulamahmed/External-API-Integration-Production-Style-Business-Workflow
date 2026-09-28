# Week 4 test and verification report

## Automated business-rule tests

Command:
npm test

The test suite explicitly covers:
- deadline violation maps to HTTP 409 / APPLICATION_DEADLINE_PASSED
- active posting limit maps to HTTP 409 / MAX_ACTIVE_POSTINGS_REACHED
- terminal application statuses cannot be reversed

## Static boundary review

Verified in source:
- POST /applications is protected by requireAuth + STUDENT role.
- PATCH /applications/:id/status is protected by requireAuth + COMPANY/ADMIN role.
- updateApplicationStatus checks the internship's company.userId against the authenticated actor.
- createApplication checks applicationDeadline on the server.
- createInternship counts active future-dated postings against MAX_ACTIVE_POSTINGS.
- closeExpiredInternships marks expired postings inactive.
- emailService is the only module that calls Resend.
- controllers/routes do not contain a raw provider API call.
- RESEND_API_KEY exists only as an environment placeholder.
- .env is ignored.
- OpenAPI documents 401, 403, and 409 outcomes.

## Real provider evidence

A real Resend sandbox send requires the evaluator's API key and recipient. The repository includes scripts/send-test-email.ts and docs/evidence/REAL_SANDBOX_EMAIL_EVIDENCE.md for capturing that evidence. No fake evidence is claimed.

## Runtime limitation

This repository was prepared without access to a configured PostgreSQL instance or the user's Resend credentials, so this report does not claim live database/provider execution.
