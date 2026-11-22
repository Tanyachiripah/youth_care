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

Optional values are `OPENAI_API_KEY`, `OPENAI_MODEL`, `CLIENT_URL`, `PORT`, `NODE_ENV`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD`. Keep the admin seed password private and remove the seed variables after creating the account.

The server and seed command load `server/.env` through the same explicit path. If a required value is missing, the process reports the variable and the expected file without printing its value.

## Seed and run

```powershell
npm run seed
npm run dev
```

The root `seed` script invokes the server workspace. Seeding adds demonstration content only when the corresponding collections are empty; it does not overwrite existing records. Demo organisations are unverified and are not real referral providers.

The client runs at `http://localhost:5173`; the API health endpoint is `http://localhost:5000/api/health`.

## Build and production

```powershell
npm run build
npm start
```

The build outputs `client/dist` and `server/dist`. In production, set `NODE_ENV=production`, `CLIENT_URL` to the deployed origin, a strong `SESSION_SECRET`, and `MONGODB_URI`; deploy behind HTTPS.

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
