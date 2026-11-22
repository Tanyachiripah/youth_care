# Feature Status

Status is based on code inspection. It does not imply deployment, external provider verification, clinical validation, or production readiness.

| Module / feature | Status | Evidence and limits |
|---|---|---|
| Responsive landing page and navigation | Implemented | `client/src/App.tsx`, `client/src/index.css`; verify target widths and assistive technology before release. |
| Registration, login, logout, sessions | Partially implemented | `server/src/routes.ts`, `server/src/server.ts`; profile editing, recovery, email verification, and login abuse controls are missing. |
| Well-being dashboard | Partially implemented | Basic links and safety notice in `Dashboard`; check-ins, goals, saved items, and summaries are missing. |
| AI companion | Partially implemented | Authenticated, rate-limited endpoint and optional OpenAI response; keyword crisis check is incomplete and no human escalation exists. |
| Organisation directory | Partially implemented | Public endpoint defaults to verified entries; category/contact/referral-procedure fields and provider verification workflow are incomplete. |
| Counselling/referral system | Partially implemented | Explicit consent, verified-provider check, and user-scoped history exist; provider handoff and admin status management are missing. |
| Mental-health education | Partially implemented | Published resources are listed; comprehensive topic coverage and editorial/professional review workflow are missing. |
| Career and employment guidance | Partially implemented | Published opportunity list; no full guidance workflow or freshness verification. |
| Youth Opportunities Hub | Partially implemented | Basic opportunity model/listing; workshops, mentorship, programme-specific eligibility, and application lifecycle are incomplete. |
| Administration dashboard | Partially implemented | Overview and selected create/update API routes; no complete user/role, referral, resource, or opportunity management UI. |
| Seed data | Implemented for demonstration | `server/src/seed.ts`; illustrative content only, not verified services. Requires reachable MongoDB. |
| Dependency audit | Resolved in current lockfile | OpenAI and Zod upgraded; latest local `npm audit` reported zero vulnerabilities. Re-run after dependency changes. |
| esbuild install scripts | Explicitly approved | Only esbuild 0.28.2 (tsx) and 0.25.12 (Vite) are listed in root `allowScripts`. |
| Secure deployment, CSRF, account recovery | Missing | Documented production requirements; no end-to-end deployment review. |
| Minor safeguarding and monitored escalation | Blocked / not implemented | Requires local professional consultation and staffed operating procedures. |
| Partner verification and real service availability | Not included | Must be verified directly before publication. |

Build, dependency audit, and seed/runtime verification results are environment-dependent; see the task handover or run the commands in [SETUP_AND_INSTALLATION.md](./SETUP_AND_INSTALLATION.md).
