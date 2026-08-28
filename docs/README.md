# ASEMS Documentation

This folder is the single source of truth for the ASEMS (Aarya Site Expense Management System) project — read this before writing any backend code or pushing to GitHub.

## Reading order

1. [01-project-overview.md](01-project-overview.md) — what ASEMS is, the 4 roles, current status, recommended tech stack
2. [02-git-workflow.md](02-git-workflow.md) — GitHub repo setup and branching strategy for the 4-person team, start to finish
3. [03-frontend-status.md](03-frontend-status.md) — honest audit of what's built, what's broken, what's missing in the existing React frontend
4. [04-backend-plan.md](04-backend-plan.md) — how to start the backend from zero, folder structure, phased build order, API endpoint list
5. [05-database-schema.md](05-database-schema.md) — proposed PostgreSQL schema (tables, fields, relationships)
6. [06-security.md](06-security.md) — auth, RBAC, file-upload safety, secrets, OWASP checklist
7. [07-aws-deployment.md](07-aws-deployment.md) — proposed AWS architecture and environments
8. [08-future-roadmap.md](08-future-roadmap.md) — phased plan for everything after the first working version

## How to keep this folder useful

- When a decision in here changes (e.g. you pick a different DB, or the branch model changes), edit the doc — don't leave it stale.
- Anything genuinely new and non-obvious (a workaround, an incident, a "we tried X, it didn't work") belongs in a doc, not just in someone's head or a Slack thread.
- These docs describe the plan and the current state as of **2026-08-28**. Update the date at the top of a doc when you materially change it.
