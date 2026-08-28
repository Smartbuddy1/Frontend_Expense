# Frontend Status — What's Done, What's Left

_Last updated: 2026-08-28. Based on a full read-through of `src/` on this date — re-verify before trusting this if it's been a while._

## Headline

The UI is genuinely far along for 3 of the 4 dashboards. What's **completely missing** is the same across all of them: real authentication, a backend, a database, and file storage. Nothing here is "start from scratch" — it's "connect what exists to something real, and clean up the duplication first."

| Module | UI completeness | Biggest problem |
|---|---|---|
| Site Supervisor | ~85% | `UploadBills` page is disconnected from the wallet; wallet debits instantly instead of holding pending amounts |
| Admin | ~90% (most complete module) | Duplicated with Operations; some tabs use hardcoded data instead of the shared data file |
| Operations | ~70% | Diverged fork of Admin sharing the same `localStorage` keys → data collision |
| Accountant | ~75% | Zero persistence (resets to seed data on every refresh); two full features (Budget Management, Settlement) are built but not wired into any route |

**Cross-cutting, affects everything:** no real login (see below), no backend, no database, no file storage, i18n library installed but unused.

## Root shell & auth (`src/App.jsx`)

- There **is** a shared entry point: `src/App.jsx` reads the URL path and renders one of the 4 module apps, or a login page (`GlobalLogin`, defined inline in the same file) if the path doesn't match any module.
- `GlobalLogin` is **not real auth**: it accepts any password, guesses your role by looking for substrings like `admin`/`accountant`/`supervisor`/`operations` in whatever you typed as a username, and stores a hardcoded fake token (`dummy-token-12345`) in `localStorage`.
- Each module's own `context/AuthContext.jsx` is byte-identical across all 4 modules, already has a `login()` function that calls `POST {VITE_API_BASE_URL}/auth/login`, and correctly sets the axios Authorization header from a stored token — but **this function is never called from anywhere**. It's ready-made scaffolding for the real backend, just not wired to `GlobalLogin` yet.
- Routes are **not actually access-controlled**: every module defines a `ProtectedRoute` inline but never applies it to a `<Route>`. Anyone typing `/admin/dashboard` directly gets in without ever logging in.
- `components/ProtectedRoute.jsx` (present, unused, identical in all 4 modules) references roles (`Field_Tech`, `Maintenance_Head`) that don't belong to ASEMS at all — leftover boilerplate from whatever template this was bootstrapped from. Safe to delete once real auth is built.

## Site Supervisor module

| Page | Status |
|---|---|
| `Dashboard.jsx` | Done — wallet stat cards, quick-action modals, recent expenses |
| `DailyExpensesNew.jsx` | Done, and is the one actually routed |
| `DailyExpenses.jsx` | **Dead file** — superseded by `DailyExpensesNew.jsx`, not referenced by any route. Delete it. |
| `AssignedProjects.jsx` | UI done, but data is 3 hardcoded projects, not persisted; "Download Work Order Blueprint" is a fake `alert()` |
| `RequestAdvance.jsx` | Form + history UI done; history list is **not persisted** (lost on refresh) even though the running total is; no approval workflow simulated |
| `UploadBills.jsx` | UI done but **disconnected** — its own local list, never touches `WalletContext`, so bills uploaded here never show up in Daily Expenses or Balance Settlement, and vanish on refresh |
| `BalanceSettlement.jsx` | Done — read-only ledger derived from the wallet, PDF/Excel export |
| `PublicExpenseForm.jsx` | **The most complete, most polished screen in the entire app.** No-login field form with GPS auto-detect + reverse geocoding, camera capture, bilingual (English/Marathi) with a working language toggle, confetti success screen. This is the reference quality bar for the rest of the app. |

`context/WalletContext.jsx` models one global wallet (balance, total advance, expense list), persisted to `localStorage`. **Business-logic gap**: `recordExpense` deducts the wallet balance immediately, with no distinction between "pending approval" and "approved" — that needs fixing once a real approval workflow exists on the backend.

## Admin module

- `pages/Dashboard.jsx` is a **dead leftover** from the generic Vite template (fake "Total Users / Revenue / Bounce Rate" cards) — not even imported. Delete it.
- The real app is `pages/OperationsDashboard.jsx` plus everything under `components/operations/` — 8 tabs, 12 modals, full CRUD (with toast feedback) for projects, organizations, supervisors, team members, accountants, operational heads, and expense approval. This is the single most feature-complete surface in the app.
- Two tabs (`AlertsTab`, `ReconciliationTab`) use their own hardcoded local state instead of the shared data file, and aren't persisted — inconsistent with the rest of the dashboard.
- `SitePhotoGalleryModal` is entirely fake — hardcoded stock photo URLs with made-up metadata. There is no real photo upload/storage behind it yet (this is expected; that's what S3 is for — see [07-aws-deployment.md](07-aws-deployment.md)).
- Persists to `localStorage` under `asems_v2_*` keys.

## Operations module

- `pages/OperationsDashboard.jsx` was forked from Admin's version and has diverged significantly since — it adds a "forward expense to Accounts" action Admin's version lacks, but drops Organizations/Accountants/Operational-Heads management and the photo gallery.
- **Critical bug**: it reads/writes the **exact same `localStorage` keys** as Admin's dashboard (`asems_v2_projects`, `asems_v2_supervisors`, etc.). Using both dashboards in the same browser corrupts shared data. This must be resolved (see [02-git-workflow.md](02-git-workflow.md) §8) before backend integration, because the backend can't cleanly model "two different definitions of a project."
- Its own `data/operationsData.js` is a stale, smaller subset of Admin's — same 3 projects but with slightly different expense amounts/descriptions under the *same* expense IDs.

## Accountant module

- `pages/AccountsDashboard.jsx` is just a re-export of `pages/Dashboard.jsx` — the real page, 7 tabs (overview, verification, wallets, advances, ledger, analytics, reports), all fully built and polished.
- **No persistence at all** — unlike Admin/Operations, this module uses plain `useState` with zero `localStorage` writes. Every refresh resets everything to seed data. This is actually the *cleanest* module to migrate to a real backend, since there's no localStorage habit to unlearn.
- Two fully-built features are **not wired into any route or nav item**: `BudgetManagementTab.jsx` and `SettlementReconcileTab.jsx` (+ its `SettlementModal.jsx`). Settlement *data* shows up read-only elsewhere, but there's no reachable UI to actually perform a settlement. Someone should either wire these in or confirm they're intentionally deferred.
- Uses its own expense/advance/project data model (`data/accountsMockData.js`) with a **different ID scheme and field set** than Admin/Operations' `operationsData.js` — see [05-database-schema.md](05-database-schema.md) for how these get reconciled into one schema.

## Cross-cutting dead code / cleanup list

File an issue for each of these before or during backend integration:

- [ ] Delete `SiteSupervisor/pages/DailyExpenses.jsx` (superseded by `DailyExpensesNew.jsx`)
- [ ] Delete `Admin/pages/Dashboard.jsx` and `Operations/pages/Dashboard.jsx` (unused template leftovers)
- [ ] Delete all 4 modules' `components/ProtectedRoute.jsx` and unused `context/AuthContext.login()` scaffolding once real auth replaces them (or repurpose the `login()` calls directly)
- [ ] Delete all 4 modules' `components/diagnostics/IODashboard.jsx`, `IOItem.jsx`, `diagnostics.css` — leftover from an unrelated industrial/IoT template, calls endpoints ASEMS doesn't have
- [ ] Delete all 4 modules' `components/InstallationsMap.jsx` — unused hardcoded site list
- [ ] Resolve the Admin/Operations `localStorage` key collision (see above)
- [ ] Wire up or explicitly shelve `BudgetManagementTab` / `SettlementReconcileTab` in Accountant
- [ ] Connect `UploadBills.jsx` to `WalletContext` (Site Supervisor)
- [ ] Fix `WalletContext.recordExpense` to hold pending amounts separately from approved/paid ones
- [ ] `i18next`/`react-i18next` are installed but completely unused — either adopt them (replacing the 3 different hand-rolled `LanguageContext.jsx` implementations) or remove the dependency
- [ ] Each module has its own divergent `utils/exportUtils.js` (PDF/Excel export) with different function signatures — worth consolidating into one shared util once the modules share a codebase location
- [ ] No `.env` file exists yet; `VITE_API_BASE_URL` is referenced but unset — add one when backend work starts, and confirm `.gitignore` covers it (see [02-git-workflow.md](02-git-workflow.md))

## What's simply not built yet (expected — not a bug)

- Any backend, database, or real API — this is by design at this stage, see [04-backend-plan.md](04-backend-plan.md)
- Real file upload/storage for bills, receipts, and site photos — currently either fake or `localStorage`-only
- Notifications (SMS/email/push) for approvals, disbursals, low wallet balance
- Automated tests — no test framework is configured at all
