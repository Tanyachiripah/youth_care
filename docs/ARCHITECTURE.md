# Architecture

## Repository and runtime

The repository is an npm-workspaces application:

- `client/`: React, TypeScript, Vite, React Router, Axios, and Tailwind CSS.
- `server/`: Node.js, Express, TypeScript, Mongoose, and REST endpoints.
- `docs/`: requirements, operational guidance, and design notes.

The browser calls `/api` through Axios. In development, Vite and Express run separately; in production, Express serves the built client and API from one origin.

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

Build both workspaces with `npm run build`; the server output is `server/dist` and Vite output is `client/dist`. For production, configure a single HTTPS origin, a strong session secret, a restricted MongoDB credential, `CLIENT_URL`, and required host variables. No production deployment or external-service credentials are included in this repository.
