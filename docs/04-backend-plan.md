# Backend Plan — Starting From Zero

_Last updated: 2026-08-30_

Phase 1 below (auth + user creation) is done — see [09-local-setup.md](09-local-setup.md) to run it. This doc is the step-by-step for the rest, built so the existing frontend can plug into it with minimal frontend rework, since `AuthContext.jsx` and a few other files already assumed a specific API shape before the backend existed.

## 1. Repo layout

The backend lives in its **own repo**, [Backend_Expense](https://github.com/Smartbuddy1/Backend_Expense), cloned as a sibling folder to the frontend repo (see [09-local-setup.md](09-local-setup.md)) — not nested inside it. A PR that needs both a backend change and the frontend code that calls it means one PR in each repo (see [02-git-workflow.md](02-git-workflow.md)).

```
Backend_Expense/
  src/
    routes/
    middleware/     (auth, error handling, validation)
    utils/
    index.js
  prisma/           (schema.prisma, migrations/)
  .env.example
  package.json

Frontend_Expense/
  src/              (unchanged)
  docs/             (this doc and the rest of the shared documentation)
```

## 2. Stack (see [01-project-overview.md](01-project-overview.md) for the "why")

Node.js + Express + Prisma + MySQL + JWT. Validate request bodies with `zod`. Use `bcrypt` for password hashing.

## 3. Phased build order

Build in this order — each phase should be its own set of PRs, and each phase should be demoable before moving to the next.

### Phase 0 — Project setup — **done**
- ~~`server/` scaffold~~ Express app, `.env.example`, MySQL connection, health-check route (`GET /health`) all live in the [Backend_Expense](https://github.com/Smartbuddy1/Backend_Expense) repo
- Prisma set up (pinned to 6.12.0 — see the note in [09-local-setup.md](09-local-setup.md) about why not `latest`), first migration with the `users` table
- CORS configured to allow the Vite dev server origin only

### Phase 1 — Auth & users — **mostly done**
- [x] `POST /auth/login` — accepts `{ mobile, password }`, returns `{ token, user }`, rate-limited (5/15min per IP)
- [x] `GET /auth/me` — returns the logged-in user from the token
- [x] Auth middleware (`requireAuth`) that verifies the JWT and attaches `req.user`
- [x] Role-guard middleware (`requireRole('admin', 'operations')` etc.) — see [06-security.md](06-security.md)
- [x] `POST /users` (admin-only) — create operations/accountant/site_supervisor/admin accounts; `GET /users` lists them
- [x] **Frontend work**: root `GlobalLogin` (in `src/App.jsx`, Frontend_Expense) calls the real endpoint and redirects by the role the backend returns; `ProtectedRoute` is wired into every module's routes with a role check
- [ ] Not built yet: `POST /auth/refresh` / `POST /auth/logout` (tokens are just 7-day JWTs for now, no refresh/revoke flow) — add if session length becomes a real problem
- [ ] Not built yet: an admin-facing "create user" UI wired to `POST /users` — the endpoint exists, but Admin's `Create*Modal` components still don't call it (see [03-frontend-status.md](03-frontend-status.md))

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
