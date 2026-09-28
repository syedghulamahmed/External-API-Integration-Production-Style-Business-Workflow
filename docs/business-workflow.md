# Business workflow

Application lifecycle:
SUBMITTED -> UNDER_REVIEW -> ACCEPTED or REJECTED.

Accepted, rejected, and withdrawn are terminal states in this implementation.

Server-side rules:
- application_deadline must be in the future when a posting is created.
- expired active postings are lazily closed on relevant reads and writes.
- POST /applications returns 409 after the deadline.
- a company cannot exceed MAX_ACTIVE_POSTINGS.
- a student can submit only one application per internship.
- only the posting owner or an admin can change application status.
- status changes trigger a best-effort student notification.
- email failures never undo a committed application/status change.
