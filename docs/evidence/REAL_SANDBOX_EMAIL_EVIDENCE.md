# Real sandbox email evidence

This file is intentionally a checklist, not fabricated evidence.

To satisfy the evidence requirement:
1. Configure backend/.env with a real Resend API key. Never commit it.
2. Set TEST_EMAIL_TO to the permitted sandbox recipient.
3. Run npm run send:test-email from backend.
4. Capture terminal output showing a provider email ID and the received sandbox message.
5. Save the screenshot locally as docs/evidence/resend-sandbox-success.png.
6. Keep backend/.env ignored.

Expected success log:
{ sent: true, id: "<provider-email-id>" }

A real screenshot cannot be honestly produced without the user's Resend credentials, so this repository does not invent one.
