# Demo Guide

## Start the application

1. Follow [SETUP_AND_INSTALLATION.md](./SETUP_AND_INSTALLATION.md) and configure a reachable MongoDB database in `server/.env`.
2. Optionally set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then run `npm run seed`.
3. Run `npm run dev`.
4. Open the Vite URL at `http://localhost:5173`; check API health at `http://localhost:5000/api/health`.

No demo credentials are committed. Create an admin only with private local seed values; never publish or reuse the credentials.

## Suggested walkthrough

1. Browse the public landing page, resources, and opportunities.
2. Register a normal account and inspect the dashboard.
3. Open the AI companion. Without an OpenAI key, expect a demo fallback; with a key, responses are model-generated and not clinically validated.
4. Inspect the organisation directory. The default listing contains only verified providers; seed demonstration organisations do not appear as real providers.
5. Review the referral form and explicit consent step. Do not submit real sensitive information in a demo.
6. If an admin was privately seeded, review the overview and create a pending organisation listing.

## Expected results and limits

- Public registration creates a normal user.
- Admin routes require a server-side admin session.
- Referral creation requires authentication, a verified organisation, and explicit consent.
- The demo has no provider handoff, monitored crisis response, email recovery, or complete admin workflows.
- Seed entries and opportunity content are illustrative only; they are not confirmed services or active programmes.
