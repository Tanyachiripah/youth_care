# Security Model and Release Limitations

## Implemented in this MVP

- Passwords hashed with bcrypt (12 rounds).
- Server-side sessions stored in MongoDB.
- HTTP-only, host-only session cookie; Secure in production and SameSite=Lax.
- Helmet security headers.
- JSON body size limit.
- Zod validation for sensitive inputs.
- Session-bound CSRF tokens and exact trusted-Origin checks on state-changing API requests.
- Shared MongoDB-backed rate limits on registration, login, and AI chat; client IPs are HMAC-hashed before storage.
- Centralized structured error responses; server logs exclude request bodies, query strings, cookies, session IDs, and error messages.
- Server-side role checks for admin routes.
- Referral ownership enforced by query.
- AI key remains on server.
- Session rotation after successful login and registration; session destruction on logout.

## Required before production

- Configure HTTPS custom domains under the same registrable domain for the Vercel frontend and Render API (for example `app.example.org` and `api.example.org`). The default `vercel.app`/`onrender.com` domains are cross-site and browser cookie behavior is not reliable.
- Verify browser authentication, session persistence, CSRF rejection/acceptance, expiration, and logout on supported browsers after deployment. These checks are not established by unit tests alone.
- Account recovery and email verification.
- Strong unique production session secret and a rotation procedure.
- HTTPS-only deployment and exact production CORS origin configuration.
- Security review and dependency audit.
- Database least-privilege credentials, backups and restore test.
- Privacy notice, consent lifecycle, retention and deletion workflows.
- Incident response and access logging review.
- Professional safeguarding review and crisis protocol.
- A staffed, tested human escalation service before representing escalation as available.

## AI limitations

The AI is not a therapist and cannot diagnose, treat, assess risk reliably or contact emergency services. Keyword screening is incomplete and cannot guarantee detection. The demo crisis response is a conservative signpost, not a clinical triage system or human escalation mechanism.
