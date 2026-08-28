# Database Schema (PostgreSQL)

_Last updated: 2026-08-28_

## Why this doesn't exactly match any single mock data file

The frontend audit ([03-frontend-status.md](03-frontend-status.md)) found that Admin/Operations' `operationsData.js` and Accountant's `accountsMockData.js` model the same real-world entities (projects, expenses) with **different field names and incompatible ID schemes** (`PRJ-SGM-01` vs `PRJ-101`), because the 4 modules were built somewhat independently. This schema reconciles both into one canonical model. Expect some frontend field-mapping work when each module switches from its mock data to the real API — that's expected and fine, it's cheaper to do once here than to carry two schemas forever.

## Entity-relationship summary

```
organizations 1──* projects *──1 operational_heads
projects 1──* project_milestones
projects *──* team_members        (via project_team_assignments)
projects 1──1 users(supervisor)   (a project's assigned supervisor)
projects 1──* expenses
projects 1──* site_logs
projects 1──* advances
projects 1──* settlements
users 1──* expenses (submitted_by)
users 1──* wallets (site supervisors only)
wallets 1──* wallet_transactions
expenses 1──* attachments
expenses 1──1 expense_categories
advances 1──* attachments
payments_ledger *──1 company_bank_accounts
audit_logs *──1 users
```

## Tables

### `users`
Every logged-in person, regardless of role.
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| mobile | text, unique | login identifier — matches `AuthContext.jsx`'s existing `{mobile, password}` login shape |
| email | text, nullable | |
| password_hash | text | bcrypt |
| role | enum(`admin`,`operations`,`accountant`,`site_supervisor`) | |
| status | enum(`active`,`inactive`) | |
| created_at, updated_at | timestamptz | |

### `organizations`
Clients / municipal bodies (Admin's "Organizations" tab).
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code, name, short_name | text | |
| type, category | text | |
| contact_person, designation, phone, email | text | |
| address, city, state | text | |
| gst_no | text | |
| status | enum(`active`,`inactive`) | |
| verified_date | date, nullable | |
| created_at | timestamptz | |

### `operational_heads`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users, nullable | if they also log in |
| department, phone, email, location | text | |
| experience, employee_id, specialization | text | |
| joined_date | date | |
| responsibilities | text[] | |
| total_budget_authorisation | numeric | |
| status | enum(`active`,`inactive`) | |

### `projects`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| code | text, unique | human-readable, e.g. `Sangamner-P1` |
| name, site, location, category | text | |
| toilets_count | int, nullable | domain-specific — rename/drop if scope is broader than e-toilet installs |
| organization_id | uuid FK → organizations | |
| operational_head_id | uuid FK → operational_heads, nullable | |
| supervisor_id | uuid FK → users, nullable | the assigned site supervisor |
| budget | numeric | |
| funds_released | numeric | replaces the divergent `spent`/`expenses` naming across modules |
| advance | numeric | |
| start_date, end_date | date | |
| status | enum(`planned`,`active`,`on_hold`,`completed`) | |
| health | enum(`on_track`,`at_risk`,`delayed`) | |
| progress | int (0–100) | |
| description | text | |
| created_at, updated_at | timestamptz | |

Derived values (`balance`, `spent-to-date`) should be computed in queries/views, not stored redundantly, to avoid the drift already seen between modules' mock data.

### `project_milestones`
| id, project_id (FK), title, status, target_date |

### `team_members`
| id, name, role, phone, skills (text[]), status |

### `project_team_assignments` (join table)
| project_id (FK), team_member_id (FK), assigned_at |

### `expense_categories`
Seed from the Accountant module's existing 7-category taxonomy (Purchase/Materials, Labour & Contractors, Transport & Logistics, Lodging & Hotel, Travel & Conveyance, Daily Allowance & Food, Miscellaneous & Emergency).
| id, name, icon, color |

### `expenses`
The core table — models the full submit → approve → verify → pay lifecycle.
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid FK → projects | |
| submitted_by | uuid FK → users | the supervisor |
| category_id | uuid FK → expense_categories | |
| item_description | text | |
| vendor_name, vendor_gstin | text, nullable | |
| bill_number, bill_date | text/date, nullable | |
| amount | numeric | |
| tax_amount | numeric, default 0 | |
| payment_mode | text, nullable | |
| gps_location, gps_address | text, nullable | from `PublicExpenseForm`'s geolocation capture |
| status | enum(`submitted`,`ops_approved`,`ops_rejected`,`forwarded`,`accounts_verified`,`sent_for_correction`,`paid`) | one unified state machine replacing the ad-hoc status strings scattered across modules |
| ops_approved_by, ops_approved_at, ops_remarks | | Operations' approval step |
| accounts_verified_by, accounts_verified_at, payment_ref, accounts_remarks | | Accounts' verification step |
| submitted_via | text | `app` / `public_form` |
| created_at, updated_at | timestamptz | |

Index: `(project_id)`, `(submitted_by)`, `(status)`, `(created_at)` — expenses are the highest-volume table (daily entries per supervisor) and will be filtered by all four constantly.

### `wallets`
One row per site supervisor.
| id, user_id (FK, unique), balance, total_advance, updated_at |

### `wallet_transactions`
Append-only ledger — this is what fixes the "instant debit regardless of approval" gap flagged in [03-frontend-status.md](03-frontend-status.md): a `debit_pending` transaction is created on submit, converted to `debit_confirmed` (or reversed) on approval/rejection.
| id, wallet_id (FK), type (`credit_advance`,`debit_pending`,`debit_confirmed`,`debit_reversed`,`debit_settlement`), amount, reference_type (`expense`/`advance`/`settlement`), reference_id, created_at |

### `advances`
| id, project_id (FK), requested_by (FK users), bank_account_no, ifsc, bank_name, upi_id, requested_amount, approved_amount, purpose, status (`requested`,`ops_approved`,`disbursed`,`rejected`), disbursed_at, payment_mode, ref_number, paid_from_account_id (FK company_bank_accounts), created_at |

### `company_bank_accounts`
| id, name, account_type (`bank`,`petty_cash`), balance |

### `payments_ledger`
| id, type (`advance_disbursal`,`expense_reimbursement`,`fund_release`), project_id (FK), paid_to, amount, payment_mode, ref_number, company_bank_account_id (FK), category, notes, created_at |

### `settlements`
Closes out a project's account with a supervisor.
| id, project_id (FK), supervisor_id (FK), completed_date, total_advance_given, total_approved_expenses, difference, settlement_type (`refund_due`,`additional_payable`), status (`pending`,`settled`), supervisor_remark, accounts_remark, created_at |

### `site_logs`
| id, project_id (FK), supervisor_id (FK), date, title, work_summary, labor_count, issues, status, verified (bool) |

### `attachments`
One table for every uploaded file (bills, receipts, site photos) — always an S3 key, never a blob.
| id, owner_type (`expense`,`advance`,`site_log`), owner_id, s3_key, file_name, content_type, size_bytes, uploaded_by (FK users), created_at |

### `audit_logs`
Formalizes what the Accountant mock already sketches (`AUDIT_LOGS`) — record every state-changing financial action.
| id, user_id (FK), action, target_type, target_id, details (jsonb), created_at |

## Migration approach

Use Prisma migrations from the start (`prisma migrate dev`), one migration per phase in [04-backend-plan.md](04-backend-plan.md) rather than one giant initial migration — makes it far easier for 4 people to add fields without stepping on each other's schema changes.
