# Git & GitHub Collaboration Workflow

_Last updated: 2026-08-28_

This is the start-to-end process for running ASEMS as one collaborative GitHub repo with 4 developers.

## 1. One-time repo setup (owner/Admin does this once)

1. Create a new **private** GitHub repository, e.g. `aarya-innovtech/asems`.
2. Push the existing local repo (it already has one commit, "Initial commit of unified ASEMS project") to it:
   ```
   cd ASEMS
   git remote add origin https://github.com/<org-or-user>/asems.git
   git branch -M main
   git push -u origin main
   ```
3. GitHub → **Settings → Collaborators** (or set up a Team if using an Organization) → invite the other 3 developers.
4. GitHub → **Settings → Branches** → add a protection rule for `main`:
   - Require a pull request before merging
   - Require at least 1 approval
   - Require status checks to pass (add once CI/lint is wired up)
   - Disallow force pushes and branch deletion
5. Create a `develop` branch off `main` and apply the same protection rule to it:
   ```
   git checkout -b develop
   git push -u origin develop
   ```
   `develop` is where everyone merges day-to-day work; `main` is always production-ready and deployed.
6. Add `.env` and `.env.*` to `.gitignore` now (it's currently missing this) so nobody accidentally commits secrets once the backend introduces real environment variables.
7. Turn on **GitHub Issues** and a **GitHub Projects** board (columns: Backlog / In Progress / In Review / Done). File the cleanup items from [03-frontend-status.md](03-frontend-status.md) as the first issues.

## 2. Branch model

```
main        → always production-ready, deployed
develop     → integration branch — everyone merges here first
feature/*   → one branch per task or person
fix/*       → bug fixes
```

Naming convention: `feature/<owner-prefix>-<short-task>`, e.g. `feature/backend-auth-login`, `feature/accounts-settlement-tab-wireup`, `fix/supervisor-upload-bills-persistence`.

## 3. Suggested ownership split (4 people)

The codebase is already organized by role, so splitting ownership along those lines minimizes merge conflicts:

| Person | Owns |
|---|---|
| Dev 1 | `src/modules/Admin/**` + the shared root shell (`src/App.jsx`) |
| Dev 2 | `src/modules/Operations/**` |
| Dev 3 | `src/modules/Accountant/**` |
| Dev 4 | `src/modules/SiteSupervisor/**` |

Backend work (`server/`, once it exists — see [04-backend-plan.md](04-backend-plan.md)) is shared across all 4, split by resource (auth, projects, expenses, payments) rather than by person. Rotate who touches shared files (`src/App.jsx`, `docs/`, the DB schema) so no single person becomes a bottleneck or single point of failure.

## 4. Daily workflow (every developer, every task)

```
git checkout develop
git pull origin develop
git checkout -b feature/<your-prefix>-<short-task-name>

# ...make your changes...

git status                     # always check before adding
git add <specific files>       # avoid `git add -A` / `git add .` blindly
git commit -m "feat(supervisor): add category filter to daily expenses"
git push -u origin feature/<your-prefix>-<short-task-name>
```
Then open a Pull Request on GitHub **into `develop`** — never straight into `main`.

## 5. Commit message convention

```
<type>(<scope>): <short summary>
```
- **type**: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`
- **scope**: `admin`, `operations`, `accounts`, `supervisor`, `backend`, `docs`, `infra`

Examples:
- `feat(backend): add POST /auth/login endpoint`
- `fix(supervisor): stop UploadBills losing data on refresh`
- `refactor(operations): merge duplicated dashboard logic with admin`
- `docs: add database schema`

## 6. Pull Request checklist

- [ ] PR targets `develop`, not `main`
- [ ] Title follows the commit convention
- [ ] Description explains what changed and why (link the GitHub Issue, if any)
- [ ] At least one teammate has reviewed and approved
- [ ] No `node_modules`, `dist`, `.env`, or personal `localStorage` dumps committed
- [ ] `npm run lint` passes
- [ ] Merge using **Squash and merge** — keeps `develop`'s history one commit per feature and readable

## 7. Releasing to production

When `develop` is stable and demo/production-ready, open a PR from `develop` into `main` (same review rules apply) and merge it. Then tag the release:
```
git checkout main
git pull origin main
git tag v0.1.0
git push --tags
```

## 8. First priority: resolve the Admin/Operations duplication

[03-frontend-status.md](03-frontend-status.md) found that the Admin and Operations dashboards are diverged forks of the same original code, and both currently write to the **same `localStorage` keys** (`asems_v2_projects`, `asems_v2_supervisors`, etc.), so using both in one browser session silently corrupts each other's data. Put this on the board as the **first issue**, before piling more feature work on top:

> "Decide and implement: merge Admin's and Operations' project/expense management into one shared component set (with role-based feature flags), or explicitly separate their data with distinct keys/tables."

Whoever picks this up should read the relevant section of [03-frontend-status.md](03-frontend-status.md) first — the two versions have already diverged in features, not just styling.

## 9. Merge conflict etiquette

- Merge `develop` into your feature branch before opening a PR (`git merge develop`) — don't leave conflict discovery for the reviewer.
- If two people need to touch the same file, say so before starting, not after both branches exist.
- Never resolve a conflict in `package-lock.json` by picking a side — delete it and run `npm install` again.
