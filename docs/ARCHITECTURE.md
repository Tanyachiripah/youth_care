# Architecture

## Repository and runtime

The repository is an npm-workspaces application:

- `client/`: React, TypeScript, Vite, React Router, Axios, and Tailwind CSS.
- `server/`: Node.js, Express, TypeScript, Mongoose, and REST endpoints.
- `docs/`: requirements, operational guidance, and design notes.

The browser calls `/api` through Axios in development using the Vite proxy. In production, Vercel hosts the client and proxies `/api/*` to the Render Express API using the request-time `RENDER_API_URL` setting; the browser remains on the Vercel origin.

## Server startup and environment

`server/src/config/env.ts` loads `server/.env` using a path derived from its own module location, independent of the command's working directory. Both `server.ts` and `seed.ts` use the same loader and required-variable validation. The compiled server uses the same relative layout under `server/dist`.

The API connects to MongoDB through `server/src/config/db.ts`; Mongoose models are in `server/src/models/index.ts`. The server uses Express sessions stored in MongoDB via `connect-mongo`. Passwords are hashed with bcryptjs. Authorization is enforced by server middleware, not client-side route visibility.

## Request and trust flow

`Browser -> Vite/Express -> Express middleware -> REST route -> Mongoose -> MongoDB`

The AI request follows the authenticated, rate-limited `/api/ai/chat` route. The OpenAI key is read only by the server. Browser input, AI output, and public data are untrusted; API authorization and validation must remain server-side.

## Data and AI

MongoDB stores users, organisations, resources, opportunities, referrals, audit-log records, and sessions. Chat transcripts are not persisted by the API. Referral reasons are sensitive and need a retention and deletion policy before production use.

The AI endpoint uses OpenAI Chat Completions when configured and otherwise returns a demo fallback. It is not a diagnosis, clinical triage, or emergency system. See [AI_BEHAVIOUR_AND_SAFETY.md](./AI_BEHAVIOUR_AND_SAFETY.md).

## Deployment

Vercel uses `client/` as the project root, `npm run build` as the build command, and `dist` as the output directory. Its SPA rewrite sends nested application paths to `index.html`. Render uses the repository root, `npm ci --include=dev && npm run build -w server` as the build command, `npm run start -w server` as the start command, and `/api/health` as the health check. Render supplies `PORT`.

The Vercel API-first external route keeps browser requests on one origin; set Vercel `RENDER_API_URL` to the actual Render API origin and Render `CLIENT_URL` to the exact Vercel origin. `VITE_API_URL` stays unset for this setup. Store backend secrets only in Render's environment settings. The route is configured locally but has not been preview-tested or deployed. See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).
