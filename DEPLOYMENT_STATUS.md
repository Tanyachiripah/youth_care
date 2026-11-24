# YouthCare Deployment Status

**Last Verification:** 2026-11-24  
**Current Overall Status:** VERIFIED & LIVE IN PRODUCTION  

---

## 1. Verified Live Deployments

| Component | Provider / Tier | Live URL | Operational Status |
|---|---|---|---|
| **Frontend** | Vercel (Hobby Free, $0/mo) | `https://youthcare-two.vercel.app` | **LIVE & VERIFIED** (HTTP 200, assets served, SPA routing active) |
| **Backend API** | Render (Free Tier, $0/mo) | Proxied via Vercel `/api/*` | **LIVE & VERIFIED** (`/api/health` returns `200 OK` `{"status":"ok"}`) |
| **Database** | MongoDB Atlas (M0 Free, Cape Town) | Connected via SCRAM | **LIVE & VERIFIED** (User registration, sessions, and queries persisted) |

---

## 2. Live Smoke-Test Verification Results

| Check / Test Case | Target Endpoint | Live Result | Status |
|---|---|---|---|
| **Frontend Landing Page** | `GET /` | Returns `HTTP 200 OK`, HTML document served | **VERIFIED** |
| **Backend Health Check** | `GET /api/health` | Returns `HTTP 200 OK` `{"status":"ok"}` via proxy | **VERIFIED** |
| **Static Asset Routing** | `GET /assets/*.js` | Serves JavaScript bundles via `handle: filesystem` | **VERIFIED** |
| **CSRF Token Generation** | `GET /api/csrf-token` | Returns `200 OK` with token and `youthcare.sid` cookie | **VERIFIED** |
| **Cookie Security Flags** | `Set-Cookie` header | `HttpOnly; Secure; SameSite=Lax; Path=/` | **VERIFIED** |
| **User Registration** | `POST /api/auth/register` | User created and persisted in Atlas database | **VERIFIED** |
| **User Authentication** | `POST /api/auth/login` | Validates bcrypt hash and issues regenerated session | **VERIFIED** |
| **Session Persistence** | `GET /api/auth/me` | Returns authenticated user profile across requests | **VERIFIED** |
| **Role-Based Access Control** | `POST /api/admin/*` | Regular users rejected with `403 Forbidden` | **VERIFIED** |
| **CSRF Attack Defense** | State-changing POST | Requests without `X-CSRF-Token` rejected with `403` | **VERIFIED** |
| **CORS / Origin Defense** | Malicious Origin header | Untrusted origins rejected with `403 ORIGIN_NOT_ALLOWED` | **VERIFIED** |
| **Unauthenticated Protection** | `GET /api/referrals/mine` | Unauthenticated requests rejected with `401` | **VERIFIED** |

---

## 3. Configuration & Routing Architecture

```text
Browser -> https://youthcare-two.vercel.app
             |
             +-- /assets/*     -> Static bundle assets (handle: filesystem)
             +-- /api/*        -> Dynamic proxy to Render backend (${RENDER_API_URL})
             +-- /* (SPA)      -> Fallback to /index.html
                                         |
                                         v
                             Render API (Node / Express)
                                         |
                                         v
                             MongoDB Atlas (youthcare)
```

- **Vercel Rewrite:** Dynamic route maps `/api/(.*)` to `${RENDER_API_URL}/api/$1`.
- **Same-Origin Cookies:** Cookies (`youthcare.sid`) stay same-origin on `youthcare-two.vercel.app`, avoiding third-party cookie restrictions.
- **Atlas Network Access:** `0.0.0.0/0` retained as an accepted temporary risk per project instruction.
