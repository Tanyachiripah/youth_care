# Production Smoke Test

Status: **NOT RUN**. No YouthCare deployment exists, the Atlas database was not contacted, and no test account or user data was created.

Run only after deployment configuration is approved. Use synthetic data; never seed production or record cookie, CSRF-token, or secret values.

## Availability

- [ ] Vercel root and nested routes load; refreshing a nested route works.
- [ ] Public `/api/health` returns `200` with only the non-sensitive readiness status.
- [ ] Render starts and logs a successful MongoDB connection without credentials.
- [ ] An unavailable Atlas connection prevents readiness and returns no internal details.

## Browser and API Security

- [ ] Browser API calls use the Vercel `/api` path; confirm the proxy forwards requests to Render.
- [ ] Allowed Origin succeeds; untrusted Origin is rejected.
- [ ] CSRF preflight works as needed; missing and invalid tokens are rejected; a valid token succeeds.
- [ ] Production cookie is Secure, HttpOnly, host-only, SameSite=Lax, and sent on same-origin requests.
- [ ] Registration, login, reload/session persistence, protected reads, logout, and access after logout work in a real browser.
- [ ] 401/403/429/5xx errors and data-load failures show useful UI states; check browser console and failed network requests.

## Authorization and Limits

- [ ] Anonymous protected API access is rejected.
- [ ] A non-admin account cannot access admin endpoints.
- [ ] Registration/login rate limits return 429 with `Retry-After` on synthetic test traffic.
- [ ] Referral history is scoped to the synthetic account; never use participant data.

## Operations

- [ ] Observe a free Render spin-down/wake-up and confirm the delay is acceptable for the intended use.
- [ ] Verify Atlas backup/restore in an isolated database before onboarding real users.
- [ ] Confirm free-tier usage and suspension behavior; no paid upgrades or trials.