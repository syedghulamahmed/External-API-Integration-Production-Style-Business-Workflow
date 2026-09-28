# External API Integration & Production-Style Business Workflow

Week 4 NeuroFive Solutions Full Stack Web Development.

This separate project implements a realistic internship application lifecycle with PostgreSQL, Prisma, Resend transactional email, deadline enforcement, posting limits, status-driven notifications, retries, idempotency, graceful degradation, OpenAPI, and automated business-rule tests.

## Workflow

1. A company creates an internship with an application deadline.
2. The server rejects creation when the company reaches MAX_ACTIVE_POSTINGS.
3. Students can apply only while the posting is active and before the deadline.
4. The application is persisted first; confirmation email is best-effort.
5. Only the owning company or an admin can change application status.
6. Status changes trigger a student notification.
7. Expired postings are lazily marked closed.
8. Email failure is logged and retried without failing the core request.

## Environment

Required backend variables are in backend/.env.example:
DATABASE_URL, JWT_SECRET, RESEND_API_KEY, EMAIL_FROM, EMAIL_TIMEOUT_MS, EMAIL_MAX_RETRIES, MAX_ACTIVE_POSTINGS, CORS_ORIGIN.

A real .env is ignored and must never be committed.

## Setup

cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm test
npm run dev

Frontend:
cd frontend
npm install
npm run dev

## Real sandbox email evidence

Configure a real Resend key and TEST_EMAIL_TO, then run npm run send:test-email from backend. Capture the provider/inbox result in docs/evidence. No fake screenshot is committed.

## Verification limitation

The repository contains the complete integration and proof scripts, but live PostgreSQL and Resend execution requires real local infrastructure and credentials. This repository does not claim a real provider send unless the evidence file is populated after an actual run.

## Provider research

Official references are listed in docs/PROVIDER_RESEARCH.md.
