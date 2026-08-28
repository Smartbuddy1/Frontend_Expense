# AWS Deployment Plan

_Last updated: 2026-08-28_

Nothing is deployed yet — this is the target architecture for when the backend from [04-backend-plan.md](04-backend-plan.md) exists. Start simple and cheap; scale specific pieces only when they actually need it.

## Proposed architecture

| Concern | Service | Notes |
|---|---|---|
| Frontend hosting | **S3 + CloudFront** (or AWS Amplify Hosting) | The Vite build (`npm run build` → `dist/`) is static — no server needed to serve it |
| Backend API | **EC2** (single instance to start) or **Elastic Beanstalk** | Start simple; migrate to ECS Fargate later only if/when scaling demands it. Don't start with Kubernetes/ECS for a 4-person team's first deploy — it's more operational overhead than the project needs yet |
| Database | **RDS for PostgreSQL** | Single-AZ to start (cheaper); move to Multi-AZ once this is handling real money in production |
| File storage | **S3** (private bucket) | Bills, receipts, site photos — see [06-security.md](06-security.md) for access rules |
| Domain & TLS | **Route 53 + ACM** | Free SSL certificate via ACM, attached to CloudFront/load balancer |
| Secrets | **Secrets Manager** or **SSM Parameter Store** | DB credentials, JWT secret — never in `.env` files on the server |
| Monitoring | **CloudWatch** (logs + basic alarms) | At minimum: alarm on high error rate and on RDS storage/CPU |
| CI/CD | **GitHub Actions** | Build + lint + test on every PR; deploy `main` → prod, `develop` → staging automatically |

## Environments

At minimum, run two:
- **staging** (tracks `develop`) — where the team demos work-in-progress
- **production** (tracks `main`) — what real users touch

Keep them on separate RDS instances and S3 buckets — never point staging at production data.

## Suggested step order

1. Provision an RDS PostgreSQL instance (staging) and point the local Prisma setup at it to confirm migrations run cleanly against real AWS infra early, not at the last minute.
2. Create the S3 bucket (private, versioning on) for attachments.
3. Deploy the backend to a single EC2 instance (or Elastic Beanstalk) behind an Application Load Balancer, TLS via ACM.
4. Deploy the frontend build to S3 + CloudFront, pointed at the ALB for `/api/*`.
5. Wire GitHub Actions: on push to `develop` → deploy to staging; on push to `main` → deploy to production (behind a manual approval step, at least initially).
6. Add CloudWatch alarms once something is actually running in production.

## Cost-consciousness

This is a small team's first production deployment, not a large-scale product yet:
- Start with the smallest reasonable instance sizes (e.g. `t3.micro`/`t3.small` for EC2, `db.t3.micro` for RDS) — resize only when metrics show you need to.
- Use AWS Free Tier where it applies (new account, first 12 months).
- Revisit architecture (ECS/Fargate, RDS read replicas, multi-region) only when actual usage numbers justify it — see [08-future-roadmap.md](08-future-roadmap.md) for when that conversation should happen.

## Designing for daily, growing data volume

Since site supervisors submit expenses every day (with a photo each time), plan for steady, compounding growth from day one:
- Attachments go to S3, never the database — already reflected in [05-database-schema.md](05-database-schema.md).
- Enable **S3 lifecycle rules** if old site photos/receipts should move to cheaper storage (e.g. Glacier) after some retention period — decide a retention policy with the team once real usage patterns are known; don't guess one now.
- RDS storage auto-scaling should be turned on so the database doesn't hit a hard limit unexpectedly.
- The `expenses`, `site_logs`, and `payments_ledger` tables are the ones that will grow fastest — the indexes specified in [05-database-schema.md](05-database-schema.md) matter more for these than for the smaller reference tables (`organizations`, `expense_categories`, etc.).
