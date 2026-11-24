# Deployment Changelog

## 2026-11-23

- Atlas application user `user` was configured with SCRAM `readWrite` access scoped to `youthcare`; the existing administrator account was not changed. The `0.0.0.0/0` network rule remains until actual Render egress CIDRs are known. No password was exposed or copied.
- Rechecked local repository on `main`; `HEAD` remains `2535c33`, matching `origin/main`.
- Re-ran dependency validation, production dependency audit, 17 automated tests, both production builds, and Git whitespace checks; all passed.
- Reused authenticated provider pages for read-only inspection. Render is Hobby with no card on file and has no YouthCare service in the inspected project. Vercel dashboard shows no YouthCare project and an import suggestion. Atlas project `Youthcare` has Free cluster `Cluster0` in AWS Cape Town on MongoDB `8.0.39`.
- Confirmed Atlas has an active `0.0.0.0/0` rule and the existing administrator has `atlasAdmin` with all-resource scope. The application user is separately scoped to `readWrite` on `youthcare`. The Free-cluster backup screen offered upgrades and did not show an enabled backup.
- Configured the local Vercel source file with an API-first external route driven by `RENDER_API_URL`, followed by the SPA fallback. It has not been tested on Vercel or deployed.
- Added `private, no-store` headers for backend API responses and a test assertion.
- Added deployment status, environment, smoke-test, free-tier limitation, architecture, and changelog documentation; updated the existing checklist and README links.
- The Atlas application user's role was changed as recorded above. No Atlas connection, data query, collection change, network-list change, hosting configuration, environment-variable change, plan change, or deployment was performed. No password was read, printed, or copied. No commit or push was made.