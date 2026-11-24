# Deployment Architecture

## Intended no-cost topology

```text
Browser
  -> Vercel (React/Vite static SPA)
       /api/* -> external rewrite -> Render (Express API)
       /*     -> SPA index.html
  -> Render API -> MongoDB Atlas (Mongoose)
```

Vercel and Render are separate providers. The preferred cookie-compatible setup is for browser requests to use relative `/api` on the Vercel origin. `client/vercel.json` routes `/api/:path*` to `${RENDER_API_URL}/api/:path*` before the SPA fallback; `RENDER_API_URL` must be set to the actual Render origin in Vercel. The browser keeps a same-origin URL. API responses use `Cache-Control: private, no-store`. Verify that Vercel forwards the request cookie and upstream `Set-Cookie` response.

The client already defaults to `/api` when `VITE_API_URL` is unset. If the external rewrite is not used, `VITE_API_URL` must be the actual Render API origin, and the cross-site cookie behavior must be browser-tested. Do not assume the default `vercel.app` and `onrender.com` hosts work with the current SameSite=Lax cookie.

## Backend requirements

- Render service root: repository root; Node.js runtime.
- Build: `npm ci --include=dev && npm run build -w server`.
- Start: `npm run start -w server`.
- Health path: `/api/health`.
- Render supplies `PORT`; MongoDB connection must be a dedicated application user, not `atlasAdmin`.
- CORS and CSRF must allow only the actual Vercel origin, even when requests arrive through a Vercel rewrite.

## State

The API-first proxy is configured in local source but not deployed. No YouthCare Render service or Vercel project was found. The actual Render URL, Vercel URL, `RENDER_API_URL`, `CLIENT_URL`, Atlas database name, Atlas application user, and service egress ranges remain unconfigured or unverified. See [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md).