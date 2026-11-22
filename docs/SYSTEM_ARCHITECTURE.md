# System Architecture

## Overview

The repository is a single deployable web application with separate client and server workspaces.

- Client: React, TypeScript, Vite, React Router.
- Server: Node.js, Express, TypeScript.
- Persistence: MongoDB through Mongoose.
- Authentication: bcrypt password hashing and server-side sessions stored in MongoDB.
- AI: OpenAI Chat Completions API, called only from the server.

## Request flow

Browser -> React application -> same-origin `/api` routes -> Express middleware -> route handler -> Mongoose -> MongoDB.

AI requests pass through the authenticated and rate-limited API route. The API key is never sent to the browser.

## Production

Build the Vite client and TypeScript server. Express serves `client/dist` when `NODE_ENV=production`. Configure a single HTTPS origin and set `CLIENT_URL` to it.

## Trust boundaries

- Browser input is untrusted.
- All authorization is enforced on the server.
- Public registration always assigns the `user` role.
- Admin accounts are provisioned through a controlled seed process.
- Referral data is not exposed to other users.
- AI output is informational and must not be treated as clinical advice.
