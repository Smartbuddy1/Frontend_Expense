# Backend Plan — Starting From Zero

_Last updated: 2026-08-28_

There is currently **no backend at all**. This doc is the step-by-step for building one that the existing frontend can actually plug into with minimal frontend rework, since `AuthContext.jsx` and a few other files already assume a specific API shape.

## 1. Repo layout

Keep the backend in the **same repo**, as a sibling to `src/`, so the 4-person team works out of one place and PRs can touch frontend+backend together when a feature needs both:

```
ASEMS/
  src/            (existing frontend, unchanged)
  server/         (new — backend lives here)
    src/
      routes/
      controllers/
      services/
      middleware/     (auth, error handling, validation)
      prisma/         (schema.prisma, migrations/)
      utils/
    .env.example
    package.json
  docs/
```

## 2. Stack (see [01-project-overview.md](01-project-overview.md) for the "why")

Node.js + Express + Prisma + PostgreSQL + JWT. Validate request bodies with `zod`. Use `bcrypt` for password hashing.

## 3. Phased build order

Build in this order — each phase should be its own set of PRs, and each phase should be demoable before moving to the next.

### Phase 0 — Project setup
- `server/` scaffold, Express app, `.env.example`, connect to a local PostgreSQL instance, health-check route (`GET /health`)
- Prisma init, first migration with just a `users` table
- CORS configured to allow the Vite dev server origin only

### Phase 1 — Auth & users
- `POST /auth/login` — accepts `{ mobile, password }` (matches what `AuthContext.jsx` already sends), returns `{ token, refreshToken, user }`
- `POST /auth/refresh`, `POST /auth/logout`
- `GET /auth/me` — returns the logged-in user from the token
- Auth middleware that verifies the JWT and attaches `req.user`
- Role-guard middleware (`requireRole('admin', 'operations')` etc.) — see [06-security.md](06-security.md)
- User CRUD is admin-only: `POST /users` (create supervisor/accountant/operational-head/team-member — this replaces the password fields already being collected client-side in Admin's `Create*Modal` components, which currently go nowhere)
- **Frontend work in this phase**: wire the real `GlobalLogin` (in `src/App.jsx`) and each module's already-written `AuthContext.login()` to this endpoint, replacing the fake keyword-guessing login. Turn on the `ProtectedRoute`s that already exist but are currently unused.

### Phase 2 — Organizations, projects, teams (Admin + Operations)
- `GET/POST/PATCH /organizations`
- `GET/POST/PATCH /projects`, `GET /projects/:id`
- `GET/POST/PATCH /team-members`, `GET/POST/PATCH /supervisors`, `GET/POST/PATCH /operational-heads`
- `POST /projects/:id/assign-team`
- **Important**: before this phase starts, the Admin/Operations `localStorage` key collision and diverged data models (flagged in [03-frontend-status.md](03-frontend-status.md)) must be resolved — the API can only expose one definition of "project," not two.

### Phase 3 — Expenses & the supervisor wallet
- `POST /expenses` (supervisor submits), `GET /expenses?project=&supervisor=&status=&from=&to=` (paginated — see note on data volume below)
- `PATCH /expenses/:id/approve`, `PATCH /expenses/:id/reject`, `PATCH /expenses/:id/forward` (Operations forwarding to Accounts, matching the existing `handleForwardExpense` behavior in the Operations module)
- `GET /wallet/:supervisorId`, `POST /advances` (request), `PATCH /advances/:id/approve`
- Fix the pending-vs-approved balance gap noted in [03-frontend-status.md](03-frontend-status.md): a submitted expense should not debit the wallet until approved

### Phase 4 — Accounts / finance
- `PATCH /expenses/:id/verify` (Accounts' GST/bill check), `PATCH /expenses/:id/request-correction`
- `POST /advances/:id/disburse` (payment details, matches `RecordPaymentModal`)
- `POST /fund-releases` (matches `FundReleaseModal`)
- `GET /payments-ledger`
- `POST /settlements`, `PATCH /settlements/:id` (this finally gives the built-but-unwired `SettlementReconcileTab` a backend to call once someone wires it into the frontend)

### Phase 5 — File uploads
- `POST /uploads` → uploads to S3, returns a stored key/URL (see [07-aws-deployment.md](07-aws-deployment.md))
- Wire this into: bill/receipt upload (Supervisor's Daily Expenses, Upload Bills, Public Expense Form), site photo gallery (Admin), receipt viewing (Accountant's `ReceiptViewerModal`)

### Phase 6 — Reports & analytics
- Endpoints backing Accountant's `FinancialReportsTab` (project-wise, category-wise, supervisor-wise, budget-vs-actual, payment-disbursal) — these can mostly be SQL aggregation queries once Phases 2–4 are in place
- Consider a read replica or materialized views if report queries start getting slow — not needed on day one

### Phase 7 — Notifications (future — see [08-future-roadmap.md](08-future-roadmap.md))

## 4. Data-volume-aware API design

Since site supervisors add expenses **daily**, every list-style endpoint (`GET /expenses`, `GET /site-logs`, `GET /payments-ledger`) must support pagination (`?page=&pageSize=`) and filtering by date range from day one — don't add this later as a retrofit. Corresponding DB indexes are covered in [05-database-schema.md](05-database-schema.md).

## 5. Testing

No test framework exists yet anywhere in the repo. For the backend, add `vitest` or `jest` from Phase 0 — at minimum, cover auth (login success/failure, role guard) and the expense approval state machine, since those are the two places a silent bug directly costs money or leaks data.
