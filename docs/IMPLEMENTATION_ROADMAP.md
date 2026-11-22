# Implementation Roadmap

Status reflects repository code, not a production-readiness or clinical review. See [FEATURE_STATUS.md](./FEATURE_STATUS.md) for evidence.

## Demonstration MVP present

- React/Vite client and Express/Mongoose API.
- Registration, login, logout, session-backed authentication, and server-side admin checks.
- Public resources and opportunities; verified-only organisation listing.
- Authenticated referral creation with explicit consent and user-specific history.
- Rate-limited AI endpoint with a demo fallback and basic phrase-based crisis signposting.
- Partial administration overview and content-creation APIs.
- Idempotent demonstration seeding for empty collections.
- Consistent `server/.env` loading for application and seed processes.
- OpenAI/Zod audit upgrade; both reported high-severity findings are resolved in the current lockfile.
- Explicit approval of the two esbuild install scripts used by Vite and tsx.

These features need runtime verification against a configured MongoDB instance before they can be described as operational in a deployed environment.

## Near-term technical work

1. Add automated API tests for authentication, role boundaries, consent, verified providers, and seed repeatability.
2. Add login/registration abuse controls, CSRF/origin protection, and robust error monitoring without sensitive-data leakage.
3. Complete profile updates, account recovery, email verification, and session revocation.
4. Complete organisation verification, referral review/status workflows, and user/admin management.

## Safeguarding and product validation

1. Establish the initial age range and consult local safeguarding, clinical, and privacy professionals.
2. Verify each real provider and its services, eligibility, capacity, referral process, contact details, and safeguarding arrangements.
3. Establish an operational human escalation pathway before making any monitoring or response claims.
4. Professionally review educational content and AI behavior; complete privacy, accessibility, and security reviews.
5. Define retention, deletion, consent withdrawal, incident response, and service continuity policies.

## Later product work

- Optional mood check-ins, goals, saved resources, and activity summaries with privacy controls.
- Dedicated opportunity hub and editorial/verification workflows.
- Fully featured administrator dashboard, audit coverage, and referral status updates.
- PWA evaluation and, after web validation, a possible Expo mobile client.

Do not treat a roadmap item as complete until its acceptance criteria are implemented and tested.
