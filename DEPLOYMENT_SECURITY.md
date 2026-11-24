# YouthCare Deployment Security Documentation

This document specifies the security controls, authentication mechanisms, network boundaries, and remaining operational risks for the deployed YouthCare platform.

---

## 1. Database Permissions (MongoDB Atlas)

- **Dedicated Least-Privilege Account:** The application connects exclusively through a dedicated application user (`readWrite@youthcare`).
- **Role Scoping:** Granted `readWrite` permissions strictly on the `youthcare` database.
- **Administrative Account Protection:** The primary `atlasAdmin` account is not used by the application, is not stored in environment variables, and remains untouched.
- **Authentication:** Enforces SCRAM-SHA-256 over TLS/SSL encryption for all database wire communications.

---

## 2. Network Access Configuration & IP Restrictions

- **Current Atlas Access Rule:** `0.0.0.0/0` (Allow access from anywhere).
- **Security Assessment:**
  - On Render Free Web Services, outgoing traffic is routed through shared egress proxies.
  - Render publishes shared region-specific outbound CIDR blocks in the service dashboard (**Connect** -> **Outbound**).
- **Target Restricted Configuration:**
  1. Inspect the assigned Render region (e.g. Frankfurt / `fra-1`).
  2. Add Render's exact regional outbound IP/CIDR ranges to the Atlas Network Access list.
  3. Verify connection health via `/api/health`.
  4. Delete the broad `0.0.0.0/0` rule.
- **Risk Mitigation:** Even while IP restriction is broad, connection requires valid database credentials, SCRAM-SHA authentication, and TLS encryption.

---

## 3. Secret Management

- **Zero Secrets in Source Control:** No passwords, connection URIs, API keys, or session secrets exist in repository files or git history.
- **Environment Separation:**
  - Local development relies on `server/.env` (gitignored).
  - Production secrets (`MONGODB_URI`, `SESSION_SECRET`, `OPENAI_API_KEY`) are managed exclusively through Render's encrypted environment variables dashboard.
- **Session Secret Robustness:** `server/src/config/env.ts` enforces a minimum 32-character requirement and rejects placeholder strings.

---

## 4. Cross-Origin Resource Sharing (CORS) & CSRF Protection

- **Strict CORS Origin Validation:**
  - The API rejects unknown or wild-carded origins with HTTP 403 (`ORIGIN_NOT_ALLOWED`).
  - Production requires `CLIENT_URL` to be explicitly defined with an HTTPS scheme.
- **CSRF Token Verification:**
  - State-changing HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) require a valid `X-CSRF-Token` header.
  - CSRF tokens are cryptographically generated, bound to the user's session, and compared using constant-time comparison.
  - Safe methods (`GET`, `HEAD`) bypass CSRF checks.

---

## 5. Session & Cookie Security

- **Cookie Flags:**
  - `httpOnly: true` (prevents client-side JavaScript access / XSS theft).
  - `secure: true` in production (enforces HTTPS transmission).
  - `sameSite: "lax"` (mitigates cross-site request forgery while permitting safe top-level navigations).
  - `name: "youthcare.sid"` (obfuscates underlying framework).
  - `maxAge: 28800000` (8-hour automatic session expiration).
- **Session Storage:** Backed by MongoDB (`connect-mongo` in `sessions` collection) with native TTL expiration.
- **Session Fixation Prevention:** Sessions are regenerated on authentication (`/auth/register`, `/auth/login`) and explicitly destroyed on logout.
- **HTTP Cache Control:** API routes return `Cache-Control: private, no-store` to prevent caching of sensitive data by intermediary proxies or browsers.

---

## 6. Rate Limiting & Denial of Service Defense

- **Distributed Rate Limiting:** Backed by MongoDB collection with automated TTL index expiration.
- **Endpoint Limits:**
  - Registration: 5 attempts per 15 minutes.
  - Login: 10 attempts per 15 minutes.
  - AI Assistant: 12 requests per minute.
- **Response Format:** Returns HTTP 429 (`RATE_LIMITED`) with standard `Retry-After` header.

---

## 7. Remaining Security Risks & Operational Considerations

1. **Free-Tier Inactivity Sleep:**
   Render Free instances sleep after 15 minutes of inactivity. Cold boot times (30-50s) may trigger client timeouts if requests are not retried.
2. **Atlas Free Backup Limitations:**
   Atlas M0 Free Tier does not include point-in-time recovery or automated cloud backups. Important referral records should have scheduled offline export procedures established before production use.
3. **Safeguarding and Clinical Disclaimer:**
   YouthCare is an informational platform and does not provide emergency, crisis, or direct clinical medical services. Clear disclaimers and emergency hotline contacts are surfaced throughout the UI.
