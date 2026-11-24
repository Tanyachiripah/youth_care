# Deployment Checklist

This checklist is for the Vercel frontend, Render API, and MongoDB Atlas deployment. Complete it in a non-production environment first. Never run the seed script against production or place real credentials in source control.

## Current Verification Snapshot (2026-11-23)

- GitHub: correct repository and `main` branch confirmed. Local remediation is uncommitted; the tracked `client/tsconfig.tsbuildinfo` modification is preserved.
- Render: workspace is Hobby with no card on file. No YouthCare service was found in the inspected project; two suspended services could not be enumerated in the hidden dashboard tab.
- Vercel: the signed-in projects dashboard is accessible and shows no YouthCare project; an import suggestion is present. The current account plan and project environment variables are unverified because no YouthCare project exists.
- Atlas: `Youthcare` / `Cluster0` is Free, AWS Cape Town, MongoDB `8.0.39`. The active IP list contains `0.0.0.0/0`; the existing admin user is unchanged. App user `user` is SCRAM `readWrite` on `youthcare`, inferred from the repository sample URI. The Free-cluster backup page offers upgrade actions and shows no backup configuration.
- Local checks: 17 tests, both production builds, `npm ls --depth=0`, `npm audit --omit=dev`, and `git diff --check` passed. These checks do not verify deployed services or Atlas connectivity.
- One Atlas application-user role was narrowed to the documented database. No production database connection/query, seed, migration, network-list/hosting/environment/plan change, commit, push, or deployment was performed.

## 1. Local checks

From the repository root, install from the committed lockfile and run tests/builds:

```powershell
npm ci --include=dev
npm test
npm run build
```

These commands do not connect to MongoDB or seed data. Test the API locally only with a dedicated non-production database configured in `server/.env`.

## 2. MongoDB Atlas

- Create a dedicated application database user with only the permissions the app requires; do not use an Atlas owner account.
- Add the selected Render service's documented outbound CIDR ranges before removing the current broad entry. Render documents shared, region-specific ranges; obtain the exact ranges from that service's Connect > Outbound page after choosing its region. Verify the deployed backend can connect through the new rule, then remove `0.0.0.0/0`. Do not invent addresses or leave the broad rule as the final configuration. Dedicated outbound IPs are paid and excluded by the current no-cost requirement.
- Store the Atlas URI only in Render's `MONGODB_URI` environment variable. Use URL-encoded credentials where required.
- Enable the backup capability appropriate to the Atlas tier and retention requirements; perform and document a restore test into an isolated database.
- Define retention and deletion procedures for accounts and referral records before collecting real referral information.

## 3. Render API

Create a Web Service from the repository. Set:

- Root Directory: blank (repository root)
- Build Command: `npm ci --include=dev && npm run build -w server`
- Start Command: `npm run start -w server`
- Health Check Path: `/api/health`
- Runtime: Node.js 20 or newer

Set these variables in the Render dashboard; do not put values in this file:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Set to `production` |
| `MONGODB_URI` | Atlas application connection URI |
| `SESSION_SECRET` | Unique random secret, at least 32 characters; never reuse an example or development value |
| `CLIENT_URL` | Exact HTTPS Vercel custom frontend origin, such as `https://app.example.org` |
| `ALLOWED_ORIGINS` | Optional comma-separated list of additional exact HTTPS origins; no wildcards |
| `OPENAI_API_KEY` | Optional server-only AI provider credential |
| `OPENAI_MODEL` | Optional model identifier; defaults in code when omitted |

Render supplies `PORT`. Do not add seed variables to the production Web Service. Confirm startup logs contain no credentials and that `/api/health` returns `200` only when MongoDB is ready.

## 4. Vercel frontend

Create a Vercel project connected to this repository. Set:

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `RENDER_API_URL` set to the Render API origin only (no `/api`, path, query, credentials, or trailing slash). Leave `VITE_API_URL` unset when using the Vercel same-origin route.

The `client/vercel.json` routes `/api/*` to Render using `RENDER_API_URL` and sends remaining SPA paths to `index.html`. Set `RENDER_API_URL` for Production and Preview environments; it is non-secret routing configuration. Never put backend secrets in a `VITE_` variable. Confirm the Vercel project can install using the root npm workspace lockfile during a preview deployment.

## 5. Domains and browser sessions

- Preferred no-domain-cost approach: proxy `/api/*` through Vercel to Render with an external rewrite, keeping browser requests same-origin. Place the API rewrite before the SPA fallback, disable upstream API caching, and verify request-cookie and `Set-Cookie` forwarding in a preview.
- If using direct browser-to-Render calls instead, configure Render `CLIENT_URL` to the exact Vercel origin and only exact trusted HTTPS preview origins in `ALLOWED_ORIGINS`. The default `*.vercel.app` and `*.onrender.com` domains are cross-site; SameSite=Lax cookies will not be sent on cross-site XHR/fetch.
- Keep production cookies Secure, HttpOnly, host-only, and SameSite=Lax when using the same-origin proxy. Do not switch to SameSite=None without real-browser verification; third-party cookie blocking may still prevent sessions.
- In a supported real browser, verify the cookie is set and sent, the user remains signed in across navigation/reload, an unsafe request without a token is rejected, a valid request succeeds, expired sessions return to sign-in, and logout clears the session. Do not record or share cookie or CSRF token values.

## 6. Production smoke checks

- Confirm `GET https://api.example.org/api/health` returns `200` with the non-sensitive health response.
- Confirm a disallowed Origin receives no CORS permission and state-changing requests reject missing, invalid, or untrusted Origin/CSRF tokens.
- Exercise registration, login, protected reads, an authorized mutation, an unauthorized mutation, rate-limit responses, and logout with synthetic accounts only.
- Verify database connection failure prevents the API from becoming healthy and does not print the Atlas URI.
- Check monitoring and logs for error codes/request IDs only; do not log request bodies, referral text, passwords, cookies, session IDs, or provider responses.
- Confirm backup recovery and incident-response contacts before accepting sensitive information.

## 7. Manual organizational requirements

Code does not establish legal compliance or operational safeguarding. Before launch, obtain qualified review of privacy notices, consent and withdrawal, data retention/deletion, account recovery, access reviews, incident response, safeguarding and crisis procedures, and suitability for minors. Keep the application clearly labeled as non-clinical and not an emergency service unless the organization has independently established and staffed those capabilities.