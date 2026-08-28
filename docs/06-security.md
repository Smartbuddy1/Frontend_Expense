# Security Plan

_Last updated: 2026-08-28_

Right now there is **no real security to speak of** — login accepts any password ([03-frontend-status.md](03-frontend-status.md)) and there's no backend to attack yet. This doc is what needs to be true before real user data (and real money) touches this system.

## 1. Authentication

- Login is `mobile + password`, matching what `AuthContext.jsx` already sends. Hash passwords with **bcrypt** (cost factor ≥ 10) — never store or log plaintext passwords, including the ones currently typed into Admin's `Create*Modal` forms client-side.
- Issue a short-lived **JWT access token** (e.g. 15 min) plus a longer-lived **refresh token** (e.g. 7 days), matching the token/refresh shape most of the frontend scaffolding already half-expects.
- `logout()` (already implemented client-side) should also invalidate the refresh token server-side, not just clear `localStorage`.
- Rate-limit `POST /auth/login` (e.g. 5 attempts / 15 min per mobile number or IP) to block brute-forcing.

## 2. Authorization (RBAC)

- Roles: `admin`, `operations`, `accountant`, `site_supervisor` — one enum column on `users`, not a free-text guess like the current `GlobalLogin`.
- Every backend route declares which role(s) may call it via a `requireRole(...)` middleware. Don't rely on the frontend hiding a button — the API must reject it too.
- **Object-level checks, not just role checks**: a site supervisor's token must only be able to read/write their *own* expenses/wallet/advances, not any supervisor's by guessing an ID (IDOR). A supervisor calling `GET /expenses/:id` for someone else's expense should get 403/404, not the data.
- Admin is not automatically "can do everything" — model each permission explicitly per the actions in [04-backend-plan.md](04-backend-plan.md) rather than assuming a role hierarchy.

## 3. The public expense form is a real attack surface

`PublicExpenseForm.jsx` is deliberately no-login (by design, for fast field entry), which means once it's backed by a real API, its submit endpoint is the **one unauthenticated write path** into the system. Protect it specifically:
- Rate-limit by IP.
- Consider a lightweight bot check (e.g. a honeypot field, or CAPTCHA if abuse shows up) rather than assuming goodwill.
- Server-side validate every field it sends (amount range, category is a real category, project exists) — never trust a public form's payload.
- Flag submissions from this route (`submitted_via = 'public_form'`, already in the schema) so Operations/Accounts can eyeball them with extra scrutiny before approval.

## 4. Input validation

Currently **zero** server-side validation exists (there's no server). Once it does:
- Validate every request body/query param with `zod` (or similar) at the route boundary — reject early, don't let bad data reach the database.
- Enforce sane bounds: expense amounts can't be negative or absurdly large, dates can't be in the future, file sizes/types are checked (below).
- Prisma's parameterized queries already prevent SQL injection as long as raw SQL (`$queryRawUnsafe`) is avoided — don't build queries by string concatenation.

## 5. File uploads (bills, receipts, site photos)

- Restrict to expected types (JPEG/PNG/PDF) and a reasonable size cap (e.g. 10 MB) — check both file extension and actual content type server-side, not just what the browser claims.
- Store in a **private** S3 bucket (no public read), serve via short-lived signed URLs — never a public bucket URL, since receipts often contain personal/financial info.
- Generate the S3 key server-side (e.g. `expenses/{expense_id}/{uuid}.jpg`) — never trust a client-supplied file path.

## 6. Secrets management

- `.env` must never be committed — add it to `.gitignore` now (currently missing, see [02-git-workflow.md](02-git-workflow.md) step 6).
- In AWS, use **Secrets Manager** or **SSM Parameter Store** for DB credentials, JWT signing secret, and any third-party API keys — not hardcoded values or plain EC2 environment variables where avoidable.
- Rotate the JWT signing secret and DB password if either is ever accidentally exposed (e.g. committed, pasted in chat).

## 7. Transport & network

- HTTPS everywhere in production (see [07-aws-deployment.md](07-aws-deployment.md) for ACM/CloudFront setup) — no plain HTTP endpoints once deployed.
- CORS on the backend should allow-list only the actual frontend origin(s), not `*`.
- The database should not be publicly reachable from the internet — RDS in a private subnet, reachable only from the backend's security group.

## 8. Audit logging

Every state-changing financial action (expense approval/rejection, advance disbursal, fund release, settlement) should write to `audit_logs` (already in [05-database-schema.md](05-database-schema.md)): who, what, on what record, when. This is non-negotiable for a system that moves money — when a discrepancy is found weeks later, "who approved this and when" needs to be answerable without guessing.

## 9. Data protection

- Enable encryption-at-rest on RDS and on the S3 bucket (both are simple checkbox-level settings in AWS, no reason to skip them).
- Take automated RDS backups (see [07-aws-deployment.md](07-aws-deployment.md)) — financial records should never depend on a single machine's disk.
- Treat mobile numbers, bank account details (`advances.bank_account_no`/`ifsc`/`upi_id`), and GST numbers as sensitive — don't log them in plaintext application logs.

## 10. Dependency hygiene

- `axios` is currently installed but unused in any reachable code path — it becomes load-bearing once real API calls are wired up; keep it updated.
- `i18next`/`react-i18next` are installed but unused — decide (per [03-frontend-status.md](03-frontend-status.md)) whether to adopt or remove them; an unused dependency isn't a vulnerability by itself, but every dependency is something to keep patched, so don't carry dead weight indefinitely.
- Run `npm audit` periodically once the backend's `package.json` exists too.

## 11. Quick OWASP Top 10 mapping for this app

| Risk | Where it applies here | Mitigation |
|---|---|---|
| Broken access control | Fake login, no route guards today | Real JWT + role + object-level checks (§1–2) |
| Injection | N/A yet (no backend) | Prisma parameterized queries, zod validation |
| Sensitive data exposure | Bank details, mobile numbers, bills | Encryption at rest, private S3, no plaintext logs |
| Insecure design | Public expense form is unauthenticated by necessity | Rate limiting, server-side validation, audit flag (§3) |
| Security misconfiguration | `.env` not gitignored yet, no CORS config yet | Fix in Phase 0 of backend work |
| Vulnerable components | Several unused/outdated deps possible over time | `npm audit`, remove dead deps |
| Auth failures | Current login accepts any password | Real bcrypt + JWT (§1) |
| Software/data integrity | None yet — no CI | Add lint/test checks to PRs ([02-git-workflow.md](02-git-workflow.md)) |
| Logging failures | No audit trail today | `audit_logs` table (§8) |
| SSRF | Not currently applicable | Revisit if any server-side URL fetch (e.g. webhook, geocoding proxy) is added later |
