# System Architecture

## Overview

The repository is an npm-workspaces monorepo deployed as a Vercel frontend and a Render API, with MongoDB Atlas persistence.

- Client: React, TypeScript, Vite, React Router.
- Server: Node.js, Express, TypeScript.
- Persistence: MongoDB through Mongoose.
- Authentication: bcrypt password hashing and server-side sessions stored in MongoDB.
- AI: OpenAI Chat Completions API, called only from the server.

## Request flow

Browser -> React application -> Axios (`/api`) -> Vite proxy locally or Vercel external rewrite in production -> Express middleware -> route handler -> Mongoose -> MongoDB Atlas.

State-changing requests pass exact-Origin validation and session-bound CSRF validation. Express 4 async route failures reach centralized error middleware. Registration, login, and AI chat limits use a shared MongoDB-backed store with hashed client keys. AI requests are authenticated and rate limited; provider credentials remain server-side.

## Production

Vercel's project root is `client`; its SPA rewrite sends application routes to `index.html`. Render builds and starts the server workspace from the repository root and provides `PORT`. The API listens only after required environment validation, MongoDB connection, and rate-limit index initialization succeed. `/api/health` reports readiness without exposing infrastructure details.

Use HTTPS custom domains under the same registrable domain, for example `app.example.org` on Vercel and `api.example.org` on Render. The API cookie is host-only, Secure, HttpOnly, and SameSite=Lax. The default `*.vercel.app` and `*.onrender.com` domains are cross-site and are not a supported reliable cookie-auth setup; browser third-party cookie restrictions can block sessions. Verify authentication in supported browsers after custom domains and CORS are configured.

See [Setup and Installation](SETUP_AND_INSTALLATION.md) and the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) for exact settings.

## Trust boundaries

- Browser input is untrusted.
- All authorization is enforced on the server.
- Public registration always assigns the `user` role.
- Admin accounts are provisioned through a controlled seed process.
- Referral data is not exposed to other users.
- AI output is informational and must not be treated as clinical advice.
