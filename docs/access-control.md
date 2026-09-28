# Authorization boundary

The same authorization model from the previous task is retained conceptually:

- STUDENT: submit applications and read own applications.
- COMPANY: create/read own postings and update applications belonging to own postings.
- ADMIN: moderation and cross-resource access.

The server derives company ownership from the authenticated user and the application's internship.company.userId. Client-supplied company or student ownership IDs are never trusted for sensitive actions.

A frontend role check is UX only. Every protected route re-checks authentication, role, and resource ownership on the server.
