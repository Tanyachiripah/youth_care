# YouthCare

A responsive youth-support web application starter based on the YouthCare investor pitch deck.

## What is included

- React + TypeScript + Vite frontend
- Express + TypeScript API
- MongoDB Atlas persistence through Mongoose
- Password authentication with bcrypt and server-side MongoDB sessions
- Role-based admin protection
- Organisation directory with verification status
- Educational resources and opportunities
- Consent-aware referral request creation and user referral history
- AI companion endpoint using the OpenAI API when configured
- Demo seed data
- Health endpoint and deployment notes

## Important scope and safety notice

This is a **demonstration MVP**, not a clinically validated or production-ready mental-health service. The AI companion is not a therapist, does not diagnose, and does not replace emergency or professional care. Its crisis response is a conservative signposting message, not a monitored escalation service. Do not imply that a human response team is available unless one has actually been staffed and tested.

Seed organisations are clearly marked as demo/unverified. Do not publish them as real referral providers. Only list real organisations after direct verification of services, eligibility, availability, referral procedures and safeguarding arrangements. Do not use real sensitive user data in a demo.

Before real deployment:
- Obtain professional review of safeguarding and crisis protocols.
- Complete a privacy/data-protection review for Zimbabwe and all intended operating jurisdictions.
- Establish retention, deletion, access and incident-response policies.
- Configure HTTPS, secure cookies, backups, monitoring and secrets management.
- Add CSRF protection and a production-grade email/password recovery flow.
- Have security and accessibility testing performed.
- Configure a real, staffed human escalation process before claiming one exists.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB Atlas URI or local MongoDB
- Optional OpenAI API key

## Quick start

1. Copy the server environment template:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

2. Edit `server/.env` and set `MONGODB_URI`, `SESSION_SECRET`, and optionally `OPENAI_API_KEY`.

3. Install dependencies from the repository root:

   ```powershell
   npm install
   ```

4. Seed demonstration content:

   ```powershell
   npm run seed
   ```

5. Start both applications:

   ```powershell
   npm run dev
   ```

6. Open:
   - Frontend: http://localhost:5173
   - API health: http://localhost:5000/api/health

The seed script creates an admin account only when `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set. Set those values before running the seed script. Never use the demo password in production.

## Demo admin

Set in `server/.env` before `npm run seed`:

```env
SEED_ADMIN_EMAIL=admin@example.test
SEED_ADMIN_PASSWORD=ChangeThis-Demo-Password-2026!
```

The seed script will hash the password. Remove these variables after seeding.

## Build

```powershell
npm run build
```

The API build outputs to `server/dist`. The frontend build outputs to `client/dist`.

## Production serving

The Express server serves the built frontend when `NODE_ENV=production` and `client/dist` exists. Build the app before starting the server:

```powershell
npm run build
npm start
```

Set `CLIENT_URL` to the deployed origin. Configure the host to provide `PORT`.

## API overview

| Method | Path | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/organisations` | Public, verified only by default |
| GET | `/api/resources` | Public |
| GET | `/api/opportunities` | Public |
| POST | `/api/referrals` | Authenticated + explicit consent |
| GET | `/api/referrals/mine` | Authenticated |
| POST | `/api/ai/chat` | Authenticated, rate limited |
| GET | `/api/admin/overview` | Admin |
| POST | `/api/admin/organisations` | Admin |
| PATCH | `/api/admin/organisations/:id` | Admin |
| POST | `/api/admin/resources` | Admin |
| POST | `/api/admin/opportunities` | Admin |

## Repository structure

```text
client/     React frontend
server/     Express API, models, middleware and seed script
docs/       Requirements, architecture, data model, API and security notes
```

Product, architecture, safeguarding, setup, and demo documentation:

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [User journeys](docs/USER_JOURNEYS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE_DESIGN.md)
- [Security and safeguarding](docs/SECURITY_AND_SAFEGUARDING.md)
- [AI behaviour and safety](docs/AI_BEHAVIOUR_AND_SAFETY.md)
- [Implementation roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Setup and installation](docs/SETUP_AND_INSTALLATION.md)
- [Demo guide](docs/DEMO_GUIDE.md)
- [Feature status](docs/FEATURE_STATUS.md)

## Client handover

Transfer repository ownership, hosting, database and AI provider accounts to the client. Rotate all secrets and ensure the client controls billing and recovery methods. This codebase does not transfer third-party accounts or confirm partner relationships.
# youth_care
