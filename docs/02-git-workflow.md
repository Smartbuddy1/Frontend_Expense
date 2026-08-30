# Git & GitHub Collaboration Workflow

_Last updated: 2026-08-30_

This is the start-to-end process for running ASEMS as two collaborative GitHub repos with 4 developers:

- **Frontend**: https://github.com/Smartbuddy1/Frontend_Expense
- **Backend**: https://github.com/Smartbuddy1/Backend_Expense

Everything below (branch model, commit convention, PR checklist) applies identically to **both** repos — do it in whichever repo your change touches. A change that needs both (e.g. a new API endpoint plus the frontend call that uses it) means one PR in each repo; mention the other PR's link in each description so a reviewer has the full picture.

## 1. One-time repo setup (owner/Admin does this once, per repo)

Already done for both repos — this section is here for reference / for setting up a third repo the same way in future.

1. Create a new **private** GitHub repository.
2. Push the repo's code to it, create a `develop` branch off `main`.
3. GitHub → **Settings → Collaborators** → invite the other 3 developers (do this on **both** repos — access to one doesn't grant access to the other).
4. GitHub → **Settings → Branches** → add a protection rule for `main` (and `develop`): require a PR before merging, require 1 approval, disallow force pushes. Note: on a free personal GitHub plan, branch protection on a **private** repo isn't actually enforced unless you're on GitHub Pro/Team — until then, treat this workflow as the honor system for the 4 of you.
5. Add `.env`/`.env.*` to `.gitignore`.

## 2. Branch model (same in both repos)

```
main        → always production-ready, deployed
develop     → integration branch — everyone merges here first
feature/*   → one branch per task or person
fix/*       → bug fixes
```

Naming convention: `feature/<owner-prefix>-<short-task>`, e.g. `feature/backend-auth-login` (in Backend_Expense), `feature/accounts-settlement-tab-wireup` (in Frontend_Expense).

## 3. Suggested ownership split (4 people)

**Frontend repo** — split by module, since the codebase is already organized that way:

| Person | Owns |
|---|---|
| Dev 1 | `src/modules/Admin/**` + the shared root shell (`src/App.jsx`) |
| Dev 2 | `src/modules/Operations/**` |
| Dev 3 | `src/modules/Accountant/**` |
| Dev 4 | `src/modules/SiteSupervisor/**` |

**Backend repo** — shared across all 4, split by resource/endpoint (auth, projects, expenses, payments — see [04-backend-plan.md](04-backend-plan.md)'s phases) rather than by person, since there's no natural per-module split there. Rotate who touches shared files (`src/index.js`, the Prisma schema) so no single person becomes a bottleneck.

`docs/` (this folder) lives in the **frontend repo** and is the shared reference for both — rotate ownership of it too.

## 4. Daily workflow (every developer, every task, in whichever repo)

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
Then open a Pull Request on GitHub **into `develop`** — never straight into `main`. Make sure you're opening it against the right repo (easy to mix up now that there are two).

## 5. Commit message convention

```
<type>(<scope>): <short summary>
```
- **type**: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`
- **scope**: `admin`, `operations`, `accounts`, `supervisor`, `backend`, `docs`, `infra`

Examples:
- `feat(backend): add POST /auth/login endpoint` (Backend_Expense)
- `fix(supervisor): stop UploadBills losing data on refresh` (Frontend_Expense)
- `docs: add database schema` (Frontend_Expense, since `docs/` lives there)

## 6. Pull Request checklist

- [ ] PR targets `develop`, not `main`, **in the correct repo**
- [ ] Title follows the commit convention
- [ ] Description explains what changed and why — if this PR depends on or pairs with a PR in the other repo, link it
- [ ] At least one teammate has reviewed and approved
- [ ] No `node_modules`, `dist`, `.env`, or personal `localStorage` dumps committed
- [ ] `npm run lint` passes (frontend) / the backend starts cleanly (backend)
- [ ] Merge using **Squash and merge**

## 7. Releasing to production

When a repo's `develop` is stable and demo/production-ready, open a PR from `develop` into `main` in that repo and merge it. Then tag the release:
```
git checkout main
git pull origin main
git tag v0.1.0
git push --tags
```
Frontend and backend releases don't have to happen at the same time, but keep an eye on whether a frontend release depends on a backend change (or vice versa) actually being live first.

## 8. Open architectural decision: Admin/Operations duplication

[03-frontend-status.md](03-frontend-status.md) found that the Admin and Operations dashboards (in Frontend_Expense) are diverged forks of the same original code. A `localStorage`-key collision between them has been patched, but the real decision is still open — put this on the board:

> "Decide and implement: merge Admin's and Operations' project/expense management into one shared component set (with role-based feature flags), or explicitly keep them separate with their own backend models."

Whoever picks this up should read the relevant section of [03-frontend-status.md](03-frontend-status.md) first, since the two versions have diverged in features, not just styling — and the answer affects how the backend's `projects`/`expenses` endpoints ([04-backend-plan.md](04-backend-plan.md)) get consumed by each.

## 9. Merge conflict etiquette

- Merge `develop` into your feature branch before opening a PR (`git merge develop`) — don't leave conflict discovery for the reviewer.
- If two people need to touch the same file, say so before starting, not after both branches exist.
- Never resolve a conflict in `package-lock.json` by picking a side — delete it and run `npm install` again.
