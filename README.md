# ASEMS — Aarya Site Expense Management System

A role-based web app for tracking money and progress on on-site installation projects: a site supervisor logs a daily expense in the field, Operations approves it, Accounts verifies and pays it, and Admin has full oversight.

Full project documentation lives in [`docs/`](docs/README.md) — read that before making any significant change. It covers the current status, the backend plan, database schema, security, AWS deployment, and the future roadmap.

## Roles

| Role | What they do |
|---|---|
| **Admin** | Full control: organizations, projects, all users, high-level approvals, reconciliation |
| **Operations** | Assigns supervisors/teams to projects, first-pass expense approval, progress tracking |
| **Accounts** | Verifies expenses, disburses advances, releases project funds, settlements, financial reports |
| **Site Supervisor** | Logs daily expenses, requests advances, uploads bills; also has a public no-login quick-expense form |

## Tech stack

- **Frontend**: React 19 + Vite, one SPA per role under `src/modules/`
- **Backend**: Node.js + Express (`server/`) — see [docs/04-backend-plan.md](docs/04-backend-plan.md)
- **Database**: MySQL via Prisma — see [docs/05-database-schema.md](docs/05-database-schema.md)
- **Hosting**: AWS — see [docs/07-aws-deployment.md](docs/07-aws-deployment.md)

> Status: the frontend is a working prototype for all 4 roles; the backend/database are just getting started. See [docs/03-frontend-status.md](docs/03-frontend-status.md) for the honest, file-by-file breakdown of what's done vs. left.

## Project structure

```
ASEMS/
  src/
    App.jsx              shared root shell + login, routes to a module by URL path
    modules/
      Admin/              /admin  — Admin dashboard
      Operations/          /operations — Operations dashboard
      Accountant/           /accountant — Accounts dashboard
      SiteSupervisor/        /supervisor — Site Supervisor app + public expense form
  server/                 backend API (Express)
  docs/                   project documentation — start here
```

## Getting started

Full step-by-step (XAMPP, database, env files, seed data) is in [docs/09-local-setup.md](docs/09-local-setup.md) — start there if this is your first time running the project. Short version once that's done:

```
# backend
cd server && npm install && npm run dev     # http://localhost:5000

# frontend, in a second terminal
npm install && npm run dev                  # http://localhost:5173
```
Root path shows the login screen; `/admin`, `/operations`, `/accountant`, `/supervisor` each load their own module after logging in.

## Contributing

This is a 4-person collaborative repo. Branching, commit conventions, and the PR process are in [docs/02-git-workflow.md](docs/02-git-workflow.md) — read it before opening your first PR. Short version: branch off `develop` as `feature/<your-module>-<task>`, open your PR into `develop`, get one review, squash-merge.
