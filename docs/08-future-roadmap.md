# Future Roadmap

_Last updated: 2026-08-28_

This is what comes after the core plan in docs 02–07 is working: real auth, real backend, real database, deployed to AWS. Ordered roughly by priority, not by hard deadline — re-prioritize with the team as the first version lands.

## Phase A — Get the current prototype onto real infrastructure
(This is docs 02–07, restated as one line each, for tracking)
1. Shared GitHub repos (frontend + backend) + branch workflow live, 4 collaborators active
2. Backend built through Phase 4 of [04-backend-plan.md](04-backend-plan.md) (auth, projects, expenses, accounts)
3. Frontend's fake login/mock data replaced with real API calls, module by module
4. Deployed to AWS staging, then production

## Phase B — Clean up what the frontend audit found
Don't let this wait indefinitely — it gets more expensive the longer duplicated/dead code lives alongside real backend integration:
- Resolve the Admin/Operations duplication (one shared implementation, or explicitly separate data)
- Delete the dead files listed in [03-frontend-status.md](03-frontend-status.md)
- Wire in or formally drop `BudgetManagementTab`/`SettlementReconcileTab`
- Fix the wallet's pending-vs-approved balance gap
- Consolidate the 4 different `exportUtils.js` implementations into one shared PDF/Excel export util

## Phase C — File storage & real evidence trail
- Real bill/receipt/site-photo upload to S3 (replacing the fake photo gallery and the disconnected `UploadBills` page)
- Signed-URL viewing in `ReceiptViewerModal` and the photo gallery

## Phase D — Notifications
- SMS/WhatsApp/email/push when: an expense is approved/rejected, an advance is disbursed, a supervisor's wallet balance runs low, a settlement is ready
- Given the field-worker audience, SMS/WhatsApp is likely more reliable than email or in-app-only notifications — validate with actual supervisors before building

## Phase E — Offline-friendly field entry
Site conditions likely mean patchy connectivity. Consider a PWA (installable, offline-capable) version of the Site Supervisor module and/or the Public Expense Form, queuing submissions locally and syncing when back online — `PublicExpenseForm.jsx` is already the most self-contained candidate to convert first.

## Phase F — Reporting & analytics growth
- Scheduled report emails (e.g. weekly project spend summary to Admin/Accounts)
- Budget alerts (e.g. notify when a project crosses 80% of budget)
- If report queries get slow as data grows, consider read replicas or materialized views before reaching for a separate analytics database

## Phase G — Compliance & advanced security
- Two-factor authentication for Admin/Accountant roles (highest-value targets)
- GST e-invoicing integration if required by the business
- Exportable audit trail for external audits

## Phase H — Scale considerations (revisit only when metrics justify it)
- Move backend from a single EC2 instance to ECS Fargate / auto-scaling group if load actually requires it
- RDS Multi-AZ / read replicas
- Multi-tenant support if ASEMS is ever sold to multiple independent client organizations rather than run for one

## Ideas parking lot (not scheduled, revisit later)
- Geofencing validation: flag an expense if its GPS location is implausibly far from the project site
- A lightweight "record an expense" WhatsApp bot for supervisors who prefer messaging over an app
- Per-project budget dashboards visible to the client organization itself (a 5th, read-only role)
