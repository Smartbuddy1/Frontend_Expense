# ASEMS — Project Overview

_Last updated: 2026-08-30_

## What is ASEMS

**ASEMS (Aarya Site Expense Management System)** is an internal tool for tracking money and progress on on-site installation projects (the existing mock data models public/e-toilet installations for municipal and private clients across Maharashtra — adjust this doc if the domain is broader). It replaces manual/paper-based site expense tracking with a role-based digital workflow: a site supervisor logs a daily expense in the field, Operations approves it, Accounts verifies and pays it, and Admin sees everything.

## The 4 roles

| Role | Who | What they do |
|---|---|---|
| **Admin** | Owner / senior management | Full visibility and control: manages organizations (clients), projects, operational heads, supervisors, team members, and accountants; approves/reconciles expenses; views alerts |
| **Operations** | Operations / project managers | Day-to-day project and team management: assigns supervisors and teams to projects, first-pass expense approval (can forward to Accounts), tracks progress and site logs, reconciles supervisor cash floats |
| **Accounts (Accountant)** | Finance team | Second-pass expense verification (bill/GST check), advance disbursal, project fund release, payment ledger, settlements at project close, financial reports and analytics |
| **Site Supervisor** | On-ground staff | Logs daily expenses against a wallet/advance, requests advances, uploads bills, views assigned projects, settles balance. Also has a public, no-login quick-expense form for fast field entry without needing to log in first |

The natural money flow is: **Supervisor submits → Operations approves/forwards → Accounts verifies and pays → Admin has oversight over all of it.**

## Current state (as of 2026-08-28)

The project is a **frontend-only prototype** — a solid one, but with no backend behind it yet:

- React 19 + Vite, built as 4 independent single-page apps under `src/modules/{Admin,Operations,Accountant,SiteSupervisor}`, stitched together by one hand-rolled root page (`src/App.jsx`) that does a fake keyword-based login and redirects by path (`/admin`, `/operations`, `/accountant`, `/supervisor`).
- **No backend, no database.** All data lives in per-module mock JS files and, for some modules, `localStorage`. The Accountant dashboard doesn't even persist to `localStorage` — it resets to seed data on every page refresh.
- **No real authentication.** Login accepts any password and guesses your role from words in the username.
- The 4 modules were not built in sync with each other: Admin and Operations ended up as two diverged forks of the same original code, and the Accountant module's data model uses different field names and a different project ID scheme than Admin/Operations.

The full, file-by-file breakdown of what's genuinely done vs. broken vs. missing is in [03-frontend-status.md](03-frontend-status.md) — read that before estimating any remaining frontend work.

## Where the project is going

1. Put the existing prototype and this documentation into one shared **GitHub repo** the 4-person team works in — process in [02-git-workflow.md](02-git-workflow.md).
2. Build a real **backend + database** — [04-backend-plan.md](04-backend-plan.md), [05-database-schema.md](05-database-schema.md).
3. Wire the 4 existing frontends to it with real **auth and role-based access** — [06-security.md](06-security.md).
4. **Deploy to AWS** — [07-aws-deployment.md](07-aws-deployment.md).
5. Keep growing from there — [08-future-roadmap.md](08-future-roadmap.md).

## Recommended tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite (already built) | Already in place, no reason to change |
| Backend | Node.js + Express | Every module's `AuthContext.jsx` already expects a `POST {API_URL}/auth/login` JSON call with `{mobile, password}` — the scaffolding already assumes a Node-style JSON API. Same language as the frontend also means all 4 people can work on either side |
| ORM | Prisma | Schema-as-code, type-safe, easy migrations — good fit for a small team without a dedicated DBA |
| Database | MySQL | The domain is inherently relational (organizations → projects → expenses → approvals → payments), and the Accounts dashboards already assume real reporting/joins |
| File storage | AWS S3 | Bill photos, receipts, site photos — never store binary files in the database |
| Auth | JWT (access + refresh tokens) | Matches the shape already scaffolded in `AuthContext.jsx` |
| Hosting | AWS (see [07-aws-deployment.md](07-aws-deployment.md)) | Per requirement |

This is a starting recommendation, not a locked decision — raise it with the team before backend work starts if anyone has a strong reason to deviate (e.g. prior experience with a different stack).

## A note on data volume

Site supervisors will be adding expenses **daily**, potentially across many active projects and supervisors at once, each with a photo attachment. This has two concrete design consequences carried through the rest of these docs:
- Files (bill/receipt/site photos) go to **S3**, never into the database — see [05-database-schema.md](05-database-schema.md) and [07-aws-deployment.md](07-aws-deployment.md).
- Expense/log tables need **indexes on `project_id`, `supervisor_id`, and `date`** from day one, and every list API needs pagination — see [05-database-schema.md](05-database-schema.md) and [04-backend-plan.md](04-backend-plan.md).
