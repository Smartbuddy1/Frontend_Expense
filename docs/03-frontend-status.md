# Frontend Status — What's Done, What's Left

_Last updated: 2026-08-30. Based on a full read-through of `src/` on 2026-08-28, with the cleanup pass below applied on 2026-08-30 — re-verify before trusting this if it's been a while._

## Headline

The UI is genuinely far along for 3 of the 4 dashboards. Real backend/auth now exists ([04-backend-plan.md](04-backend-plan.md) Phase 1 is done — see [09-local-setup.md](09-local-setup.md)), and the dead-code/wiring cleanup listed below is done. What's still missing: the rest of the backend (projects, expenses, payments — Phases 2-4), file storage, and the wallet's pending-vs-approved balance gap.

| Module | UI completeness | Biggest remaining problem |
|---|---|---|
| Site Supervisor | ~85% | Wallet debits instantly instead of holding pending amounts until approval (needs the real expense-approval backend first) |
| Admin | ~90% (most complete module) | Still architecturally duplicated with Operations (two forks of the same original code) — the localStorage collision is patched, but the "merge or keep separate" decision is still open |
| Operations | ~70% | Same duplication-with-Admin issue as above |
| Accountant | ~75% | Zero persistence (resets to seed data on every refresh) — needs backend Phase 4 |

**Cross-cutting, still missing:** the rest of the backend (only auth + user creation exist so far), a database-backed expense/project/payment flow, file storage for receipts, i18n library installed but unused.

## Root shell & auth (`src/App.jsx`) — updated 2026-08-30, this is now real

- `src/App.jsx` is the shared entry point: it reads the URL path and renders one of the 4 module apps, or `GlobalLogin` (defined inline) if the path doesn't match any module.
- `GlobalLogin` now calls the real backend (`POST {VITE_API_BASE_URL}/auth/login`, see [04-backend-plan.md](04-backend-plan.md)) and redirects based on the role the backend actually returns, instead of guessing a role from keywords in the username. Verified end-to-end in a browser.
- Each module's `context/AuthContext.jsx` no longer carries the old dead `login()` function (GlobalLogin handles login directly) — it still reads the token/user from `localStorage` on mount and provides `logout()`, both of which are used by `Layout.jsx`.
- Routes **are now access-controlled**: every module's inline `ProtectedRoute` is applied to its `Layout` route and checks both that a user is logged in and that their role matches the module, redirecting to `/` otherwise. Confirmed in a browser that visiting e.g. `/accountant/dashboard` without logging in bounces to the login page.
- The old `components/ProtectedRoute.jsx` (referencing roles that don't belong to ASEMS) has been deleted from all 4 modules.

## Site Supervisor module

| Page | Status |
|---|---|
| `Dashboard.jsx` | Done — wallet stat cards, quick-action modals, recent expenses |
| `DailyExpensesNew.jsx` | Done, and is the one actually routed |
| ~~`DailyExpenses.jsx`~~ | **Deleted 2026-08-30** — was superseded by `DailyExpensesNew.jsx` and unreferenced |
| `AssignedProjects.jsx` | UI done, but data is 3 hardcoded projects, not persisted; "Download Work Order Blueprint" is a fake `alert()` |
| `RequestAdvance.jsx` | Form + history UI done; history list is **not persisted** (lost on refresh) even though the running total is; no approval workflow simulated |
| `UploadBills.jsx` | **Fixed 2026-08-30** — now reads/writes through `WalletContext` like the rest of the module, instead of keeping its own disconnected list |
| `BalanceSettlement.jsx` | Done — read-only ledger derived from the wallet, PDF/Excel export |
| `PublicExpenseForm.jsx` | **The most complete, most polished screen in the entire app.** No-login field form with GPS auto-detect + reverse geocoding, camera capture, bilingual (English/Marathi) with a working language toggle, confetti success screen. This is the reference quality bar for the rest of the app. |

`context/WalletContext.jsx` models one global wallet (balance, total advance, expense list), persisted to `localStorage`. **Business-logic gap**: `recordExpense` deducts the wallet balance immediately, with no distinction between "pending approval" and "approved" — that needs fixing once a real approval workflow exists on the backend.

## Admin module

- ~~`pages/Dashboard.jsx` is a dead leftover from the generic Vite template~~ **Deleted 2026-08-30**.
- The real app is `pages/OperationsDashboard.jsx` plus everything under `components/operations/` — 8 tabs, 12 modals, full CRUD (with toast feedback) for projects, organizations, supervisors, team members, accountants, operational heads, and expense approval. This is the single most feature-complete surface in the app.
- Two tabs (`AlertsTab`, `ReconciliationTab`) use their own hardcoded local state instead of the shared data file, and aren't persisted — inconsistent with the rest of the dashboard.
- `SitePhotoGalleryModal` is entirely fake — hardcoded stock photo URLs with made-up metadata. There is no real photo upload/storage behind it yet (this is expected; that's what S3 is for — see [07-aws-deployment.md](07-aws-deployment.md)).
- Persists to `localStorage` under `asems_v2_*` keys.

## Operations module

- `pages/OperationsDashboard.jsx` was forked from Admin's version and has diverged significantly since — it adds a "forward expense to Accounts" action Admin's version lacks, but drops Organizations/Accountants/Operational-Heads management and the photo gallery.
- **Patched 2026-08-30**: it used to read/write the exact same `localStorage` keys as Admin's dashboard (`asems_v2_projects`, etc.), corrupting shared data when both were used in one browser. Operations now uses `asems_ops_v2_*` keys instead. This only stops the data corruption — the underlying "should these be one module" decision (see [02-git-workflow.md](02-git-workflow.md) §8) is still open and should happen before backend integration, because the backend can't cleanly model "two different definitions of a project."
- Its own `data/operationsData.js` is a stale, smaller subset of Admin's — same 3 projects but with slightly different expense amounts/descriptions under the *same* expense IDs.

## Accountant module

- `pages/AccountsDashboard.jsx` is just a re-export of `pages/Dashboard.jsx` — the real page, 7 tabs (overview, verification, wallets, advances, ledger, analytics, reports), all fully built and polished.
- **No persistence at all** — unlike Admin/Operations, this module uses plain `useState` with zero `localStorage` writes. Every refresh resets everything to seed data. This is actually the *cleanest* module to migrate to a real backend, since there's no localStorage habit to unlearn.
- ~~Two fully-built features are not wired into any route or nav item~~ `BudgetManagementTab.jsx` and `SettlementReconcileTab.jsx` (+ `SettlementModal.jsx`) are now wired in as the **Budget Management** and **Settlements** tabs/nav items (2026-08-30).
- Uses its own expense/advance/project data model (`data/accountsMockData.js`) with a **different ID scheme and field set** than Admin/Operations' `operationsData.js` — see [05-database-schema.md](05-database-schema.md) for how these get reconciled into one schema.

## Cross-cutting dead code / cleanup list

Done as of 2026-08-30:

- [x] Delete `SiteSupervisor/pages/DailyExpenses.jsx` (superseded by `DailyExpensesNew.jsx`)
- [x] Delete `Admin/pages/Dashboard.jsx` and `Operations/pages/Dashboard.jsx` (unused template leftovers)
- [x] Delete all 4 modules' `components/ProtectedRoute.jsx` and unused `context/AuthContext.login()` scaffolding — real auth now exists (root `GlobalLogin` calls the backend), and each module's `App.jsx` now actually applies its inline `ProtectedRoute` (with a role check) to its routes instead of defining it and never using it
- [x] Delete all 4 modules' `components/diagnostics/IODashboard.jsx`, `IOItem.jsx`, `diagnostics.css`
- [x] Delete all 4 modules' `components/InstallationsMap.jsx`
- [x] Resolve the Admin/Operations `localStorage` key collision — Operations now uses `asems_ops_v2_*` keys. This is a stopgap; the underlying "should these be one module" decision in [02-git-workflow.md](02-git-workflow.md) §8 is still open
- [x] Wire up `BudgetManagementTab` / `SettlementReconcileTab` in Accountant (see above)
- [x] Connect `UploadBills.jsx` to `WalletContext` (Site Supervisor) — it now derives its list from `expensesList` instead of keeping a separate, disconnected array

Still open:

- [ ] Fix `WalletContext.recordExpense` to hold pending amounts separately from approved/paid ones — best done together with the real expense-approval backend (Phase 3 in [04-backend-plan.md](04-backend-plan.md)), since a frontend-only patch would just be redone then
- [ ] `i18next`/`react-i18next` are installed but completely unused — either adopt them (replacing the 3 different hand-rolled `LanguageContext.jsx` implementations) or remove the dependency
- [ ] Each module has its own divergent `utils/exportUtils.js` (PDF/Excel export) with different function signatures — worth consolidating into one shared util once the modules share a codebase location

## What's simply not built yet (expected — not a bug)

- Backend Phases 2-4 (projects/teams/orgs, expense approval workflow, accounts/finance) — only Phase 1 (auth + user creation) exists so far, see [04-backend-plan.md](04-backend-plan.md)
- Real file upload/storage for bills, receipts, and site photos — currently either fake or `localStorage`-only
- Notifications (SMS/email/push) for approvals, disbursals, low wallet balance
- Automated tests — no test framework is configured at all
