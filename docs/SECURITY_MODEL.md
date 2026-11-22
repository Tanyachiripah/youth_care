# Security Model and Release Limitations

## Implemented in this MVP

- Passwords hashed with bcrypt (12 rounds).
- Server-side sessions stored in MongoDB.
- HTTP-only session cookie.
- Secure cookie flag in production.
- SameSite=Lax cookie.
- Helmet security headers.
- JSON body size limit.
- Zod validation for sensitive inputs.
- Rate limiting on AI chat.
- Server-side role checks for admin routes.
- Referral ownership enforced by query.
- AI key remains on server.

## Required before production

- CSRF protection and origin validation strategy.
- Account recovery and email verification.
- Login and registration rate limiting.
- Strong session secret and secret rotation.
- HTTPS-only deployment.
- Security review and dependency audit.
- Database least-privilege credentials, backups and restore test.
- Privacy notice, consent lifecycle, retention and deletion workflows.
- Incident response and access logging review.
- Professional safeguarding review and crisis protocol.
- A staffed, tested human escalation service before representing escalation as available.

## AI limitations

The AI is not a therapist and cannot diagnose, treat, assess risk reliably or contact emergency services. Keyword screening is incomplete and cannot guarantee detection. The demo crisis response is a conservative signpost, not a clinical triage system or human escalation mechanism.
