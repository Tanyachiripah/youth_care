# YouthCare Deployment Final Report

**Date:** 2026-11-24  
**Frontend Production URL:** `https://youthcare-two.vercel.app`  
**Backend Host:** Render (Free compute tier, connected via Vercel proxy)  
**Database Host:** MongoDB Atlas (`Cluster0`, AWS Cape Town, M0 Free tier)  
**Repository:** `https://github.com/Tanyachiripah/youth_care`  
**Branch:** `main`  
**Deployment Status:** **LIVE, FULLY VERIFIED, AND OPERATIONAL**  

---

## 1. Executive Summary

The YouthCare application has been successfully deployed to production using 100% free-tier cloud infrastructure:
- **Frontend:** Hosted on Vercel Hobby tier at `https://youthcare-two.vercel.app`.
- **Backend:** Hosted on Render Free tier and reverse-proxied via Vercel `/api/*`.
- **Database:** Hosted on MongoDB Atlas M0 Free cluster with dedicated user `readWrite@youthcare`.
- **Total Incurred Cost:** **$0.00** (Free tiers exclusively).

All smoke tests executed against the live production URL have passed, verifying end-to-end frontend-to-backend communication, database read/write persistence, cookie and session lifecycles, and security boundary defenses.

---

## 2. Live Smoke-Test Evidence & Results

### 1. Frontend & Static Assets
- `GET https://youthcare-two.vercel.app/` -> `HTTP 200 OK` (Vercel edge cache HIT, HTML document served).
- `vercel.json` routing includes `handle: filesystem` so that static assets (`/assets/*.js`, `/assets/*.css`) are served directly, while client-side routes fall back to `/index.html`.

### 2. Backend Health & Database Connectivity
- `GET https://youthcare-two.vercel.app/api/health` -> `HTTP 200 OK`:
  ```json
  {"status":"ok"}
  ```
  Verified response headers: `Server: Vercel`, `X-Render-Origin-Server: Render`, `Rndr-Id: 072fb458-3865-4b9e`.
  Confirmed that Mongoose connection is ready and Atlas database queries succeed.

### 3. Session & Cookie Security
- `GET https://youthcare-two.vercel.app/api/csrf-token` -> `HTTP 200 OK`:
  - `Set-Cookie: youthcare.sid=...; Path=/; Expires=...; HttpOnly; Secure; SameSite=Lax`
  - Returns fresh cryptographically generated CSRF token.
  - Cookies remain same-origin to the browser via the Vercel rewrite proxy, guaranteeing session persistence across navigation and reload.

### 4. User Registration (Live Database Write)
- `POST https://youthcare-two.vercel.app/api/auth/register` -> `HTTP 201 Created`:
  - Successfully registered test user `smoketest_20261124@example.test`.
  - Stored bcrypt password hash and persisted user record in Atlas `youthcare.users` collection.
  - Regenerated session and issued updated CSRF token.

### 5. Authentication & Session Persistence
- `POST https://youthcare-two.vercel.app/api/auth/login` -> `HTTP 200 OK`:
  - Authenticated user with email and password.
- `GET https://youthcare-two.vercel.app/api/auth/me` -> `HTTP 200 OK`:
  - Returned authenticated session profile for `smoketest_20261124@example.test`.

### 6. Role-Based Access Control (RBAC)
- Attempted non-admin user request to `POST /api/admin/organisations`.
- Result: **HTTP 403 Forbidden** (`{"error":{"code":"ADMIN_REQUIRED"}}`).

### 7. CSRF & Origin Attack Mitigation
- State-changing POST without `X-CSRF-Token`: **HTTP 403 Forbidden** (`CSRF_TOKEN_INVALID`).
- Request with untrusted Origin (`https://evil.example.com`): **HTTP 403 Forbidden** (`ORIGIN_NOT_ALLOWED`).

### 8. Unauthenticated Protected Route Defense
- `GET https://youthcare-two.vercel.app/api/referrals/mine` without session cookie:
- Result: **HTTP 401 Unauthorized** (`AUTHENTICATION_REQUIRED`).

---

## 3. Configuration & Routing Summary

```text
Browser Client
   |
   +--> https://youthcare-two.vercel.app/
          |
          +--> /assets/*    ==> Vercel Static CDN (handle: filesystem)
          +--> /api/*       ==> Vercel Edge Proxy ==> Render Free Web Service
          +--> /* (SPA)     ==> index.html (client-side routing)
                                      |
                                      +==> MongoDB Atlas (M0 Free, Cape Town)
```

- **Vercel Config (`vercel.json`):** Dynamic route `{ "src": "/api/(.*)", "dest": "${RENDER_API_URL}/api/$1", "env": ["RENDER_API_URL"] }` followed by `{ "handle": "filesystem" }` and the SPA fallback.
- **Render Config (`render.yaml`):** Explicitly locks compute to `plan: free`, build command `npm ci --include=dev && npm run build -w server`, and start command `npm run start -w server`.
- **Database Config:** SCRAM user `readWrite@youthcare` restricted to `youthcare`. `0.0.0.0/0` rule retained unchanged per instruction.

---

## 4. Environment Variables Summary (Names Only)

### Render (API)
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `SESSION_SECRET`
- `CLIENT_URL`
- `ALLOWED_ORIGINS` (optional)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL`

### Vercel (Client)
- `RENDER_API_URL`
- `VITE_API_URL` (intentionally unset)

---

## 5. Security Status & Outstanding Considerations

1. **Atlas Network Access:** The `0.0.0.0/0` rule remains active per project instruction as an accepted temporary risk for dynamic Render free-tier egress. Database is secured by SCRAM-SHA-256 and TLS.
2. **Render Cold Starts:** Free instances spin down after 15 minutes of inactivity; initial cold boot requires 30–50 seconds.
3. **Atlas M0 Backups:** M0 Free Tier does not include automated continuous backups. Periodic offline exports should be scheduled prior to production real-user onboarding.
4. **Clinical Disclaimer:** YouthCare is strictly an informational signposting platform, not a medical or emergency service.
