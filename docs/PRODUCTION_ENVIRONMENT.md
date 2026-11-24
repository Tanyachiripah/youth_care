# Production Environment

Never put environment values in source control, Vite variables, documentation, or chat. Configure server-only values through Render's secret/environment settings.

## Render API Variables

| Name | Required | Purpose | Current status |
|---|---|---|---|
| `NODE_ENV` | Yes | Must be `production`. | Not configured; YouthCare service does not exist. |
| `MONGODB_URI` | Yes | Atlas URI for the dedicated application user and intended database. The repository sample indicates `youthcare`; confirm the production target before configuring. | Atlas user `user` is scoped to SCRAM `readWrite` on `youthcare`; its URI is not entered in Render. |
| `SESSION_SECRET` | Yes | Unique random value with at least 32 characters. | Not configured. |
| `CLIENT_URL` | Yes in production | Exact HTTPS frontend origin allowed by CORS/CSRF. | Not configured; Vercel project/domain unavailable. |
| `PORT` | Platform-provided | Render supplies this; local fallback is `5000`. | Not applicable until service creation. |
| `ALLOWED_ORIGINS` | Optional | Additional exact trusted HTTPS origins only. | Not configured. |
| `OPENAI_API_KEY` | Optional | Server-only AI credential. | Not configured/verified. |
| `OPENAI_MODEL` | Optional | Defaults in code to `gpt-4o-mini`. | Not configured/verified. |

Do not set `SEED_ADMIN_EMAIL` or `SEED_ADMIN_PASSWORD` on a production service. Normal startup does not seed data.

## Vercel Client

| Name | Required | Purpose | Current status |
|---|---|---|---|
| `RENDER_API_URL` | Yes for the Vercel API route | Render service origin only, without a trailing slash or `/api`; non-secret request-time routing value. | Not configured; YouthCare Vercel project does not exist. |
| `VITE_API_URL` | No when using the Vercel same-origin route | Leave unset so the browser calls relative `/api`. Never put secrets in `VITE_` variables. | Unset in the local example. |

## API Routing and Cookie Decision

The client uses relative `/api` when `VITE_API_URL` is unset. `client/vercel.json` routes `/api/*` to `${RENDER_API_URL}/api/*` before the SPA fallback. Direct calls from `*.vercel.app` to `*.onrender.com` are cross-site, but the server uses a production `SameSite=Lax` cookie, which is not sent on cross-site XHR/fetch.

Preferred no-domain-cost approach: the API-first Vercel external route is configured locally but not deployed. Once a Render service URL exists, set Vercel `RENDER_API_URL`, keep `VITE_API_URL` unset, and set Render `CLIENT_URL` to the Vercel origin. API responses use `Cache-Control: private, no-store`. Verify cookie and `Set-Cookie` forwarding in a Vercel preview before relying on this setup.

Vercel's official routing documentation supports external-origin rewrites. Do not change cookies to `SameSite=None` merely to make direct cross-site requests appear to work; third-party cookie blocking may still prevent sessions.