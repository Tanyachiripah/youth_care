# Setup and Installation

## Prerequisites

- Node.js 20 or newer and npm 10 or newer.
- A MongoDB Atlas cluster or reachable MongoDB instance.
- Optional: an OpenAI API key for live model responses.

## Install

From the repository root in PowerShell:

```powershell
npm install
Copy-Item server\.env.example server\.env
```

Edit `server/.env` locally. Set a valid `MONGODB_URI` and a random `SESSION_SECRET` of at least 32 characters. Do not commit the file or place real credentials in `.env.example`.

`server/.env.example` documents the purpose of each server variable. `MONGODB_URI` and `SESSION_SECRET` are required. `CLIENT_URL` is required in production and must be an HTTPS origin; `ALLOWED_ORIGINS` is an optional comma-separated list of additional exact HTTPS origins. `PORT` defaults locally and is supplied by Render. `OPENAI_API_KEY` and `OPENAI_MODEL` are optional. `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are only for an explicitly controlled one-time local/demo seed; do not set them on the production web service.

For local development, leave `VITE_API_URL` unset in `client/.env`; Vite proxies `/api` to port 5000. For the proposed Vercel deployment, leave it unset so the browser uses the same-origin `/api` proxy. Set Vercel `RENDER_API_URL` to the actual Render API origin only (no `/api` or trailing slash), and set Render `CLIENT_URL` to the exact Vercel origin. `RENDER_API_URL` is non-secret routing configuration; no backend secret belongs in Vite variables. The proxy must be preview-tested before relying on cookie forwarding.

The server and seed command load `server/.env` through the same explicit path. If required configuration is missing or malformed, startup fails without printing its value.

## Seed and run

```powershell
npm run seed
npm run dev
```

The root `seed` script invokes the server workspace. Seeding adds demonstration content only when the corresponding collections are empty; it does not overwrite existing records. Demo organisations are unverified and are not real referral providers. Never run the seed script against production.

The client runs at `http://localhost:5173`; the API health endpoint is `http://localhost:5000/api/health`.

## Build and production

```powershell
npm ci --include=dev
npm test
npm run build
```

The build outputs `client/dist` and `server/dist`. To run locally, configure `server/.env` and use `npm start`. Production uses Vercel for `client` and Render for `server`; Render should use `npm ci --include=dev && npm run build -w server` and `npm run start -w server` from the repository root.

The same-origin Vercel proxy is intended to keep the host-only, Secure, HttpOnly, SameSite=Lax session cookie first-party without purchasing a domain. Direct requests from default Vercel domains to Render are cross-site and are not reliable with SameSite=Lax. Do not claim browser authentication works until the proxy, cookie forwarding, and authentication flow have been tested after deployment.

See [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) for Atlas, Render, Vercel, browser, backup, and recovery steps.

## Dependency script approval

The installed dependency tree uses esbuild through Vite and tsx. The root package explicitly approves only the two installed esbuild versions (`allowScripts`); no blanket approval is configured. If npm reports them as pending after a dependency or npm change, review the package source and approve only that package if appropriate:

```powershell
npm approve-scripts esbuild
```

Do not approve every pending script automatically. The project currently needs separate esbuild versions for Vite and tsx; do not force them to one version without confirming upstream compatibility.

## Troubleshooting

- **`MONGODB_URI is required`:** copy `server/.env.example` to `server/.env` and set a valid URI, or provide the variable in the process environment.
- **MongoDB connection fails:** verify URI encoding, cluster network access, and database credentials in MongoDB. Never paste the URI into logs or issue reports.
- **Missing AI response:** the companion uses its labelled fallback unless `OPENAI_API_KEY` is configured.
- **Install-script warning:** review the named package and use the approval command above only when trusted.
- **Audit findings:** run `npm audit`; do not use `npm audit fix --force` without reviewing breaking changes and running the checks.
