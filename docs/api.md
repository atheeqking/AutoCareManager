# Phase 5 API

- `POST /api/v1/appointments` creates a customer appointment for an owned vehicle with `REQUESTED` status.
- `GET /api/v1/appointments` returns the caller's appointments, or all workshop appointments. Workshop users may filter by `status`.
- `GET /api/v1/appointments/{id}` returns an owned appointment or a workshop appointment.
- `POST /api/v1/appointments/{id}/confirm`, `/cancel`, `/no-show`, and `/check-in` perform controlled lifecycle actions.
- `POST /api/v1/service-cases/walk-ins` creates a checked-in walk-in case for a workshop user.

Only workshop roles can confirm, no-show, check in, or create walk-ins. Check-in creates one `ServiceCase` and, when supplied, one customer-reported `ServiceIssue` in the same transaction.

## Service workflow

`GET /api/v1/service-cases` and `GET /api/v1/service-cases/{id}` provide ownership-scoped case access. Workshop users may update priority and assignment, start/submit diagnosis, approve service, record solution and technician notes, manage service items, and move a case through `CHECKED_IN → DIAGNOSIS → WAITING_FOR_APPROVAL → IN_SERVICE → PAYMENT_PENDING → READY_FOR_PICKUP`. The backend rejects invalid transitions.
