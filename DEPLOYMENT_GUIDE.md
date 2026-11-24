# YouthCare Deployment Guide

This guide details the complete deployment architecture, execution sequence, environment configuration, and operational instructions for deploying YouthCare using free-tier services.

---

## 1. System Architecture

```text
+--------------------------------------------------------------------+
|                         Client Browser                             |
+--------------------------------------------------------------------+
          |                                        |
          | 1. Static Assets & SPA Navigation      | 2. API Calls (/api/*)
          v                                        v
+------------------------+             +------------------------+
|     Vercel (Free)      |             |     Vercel Rewrite     |
|   Vite React SPA Host  |             |  Same-Origin Reverse   |
|   (client/dist)        |             |  Proxy (/api/*)        |
+------------------------+             +------------------------+
                                                   |
                                                   | 3. Upstream HTTP Forward
                                                   v
                                       +------------------------+
                                       |      Render (Free)     |
                                       |  Node.js / Express API |
                                       |  (Port: 5000 / $PORT)  |
                                       +------------------------+
                                                   |
                                                   | 4. Mongoose SCRAM (TLS)
                                                   v
                                       +------------------------+
                                       |   MongoDB Atlas (M0)   |
                                       |  Database: youthcare   |
                                       |  User: readWrite@...   |
                                       +------------------------+
```

### Cookie & Same-Origin Strategy
Direct cross-site requests between `*.vercel.app` and `*.onrender.com` fail with modern browser third-party cookie restrictions under `SameSite=Lax`. To maintain high security without purchasing custom domains, Vercel routes `/api/*` requests through an external reverse proxy to Render using `${RENDER_API_URL}`. To the user's browser, API calls remain same-origin, preserving HttpOnly, Secure, SameSite=Lax session cookies.

---

## 2. Deployment Sequence

Deployment must proceed in this precise order:

1. **Step 1: Push Code to GitHub**
   Ensure all changes and deployment configurations (`render.yaml`, `vercel.json`) are committed to `main`.
2. **Step 2: Deploy Backend to Render**
   Create the Web Service using the Free plan, configure the environment variables, and verify `/api/health`.
3. **Step 3: Restrict MongoDB Atlas Network Access**
   Retrieve the assigned Render outbound IP/CIDR ranges and add them to Atlas Network Access, then remove `0.0.0.0/0`.
4. **Step 4: Deploy Frontend to Vercel**
   Import the repository, set `RENDER_API_URL` to the live Render backend URL, and deploy.
5. **Step 5: Configure Render CORS / CLIENT_URL**
   Set `CLIENT_URL` in Render to the live Vercel URL and trigger a service redeployment.
6. **Step 6: End-to-End Production Verification**
   Execute authentication, session persistence, and referral flows in a real browser.

---

## 3. Environment Variables

### Backend (Render Web Service)

| Variable Name | Required | Description / Value Guidance |
|---|---|---|
| `NODE_ENV` | Yes | Must be set to `production`. |
| `PORT` | Auto | Provided automatically by Render (defaults locally to `5000`). |
| `MONGODB_URI` | Yes | Full MongoDB connection string for the `readWrite@youthcare` user (e.g., `mongodb+srv://<user>:<password>@cluster0.../youthcare?retryWrites=true&w=majority`). |
| `SESSION_SECRET` | Yes | Cryptographically random string (at least 32 characters). Automatically generated if deploying via `render.yaml`. |
| `CLIENT_URL` | Yes | The exact HTTPS URL of the Vercel frontend (e.g., `https://youthcare.vercel.app`), without trailing slashes. |
| `ALLOWED_ORIGINS` | Optional | Comma-separated list of additional exact HTTPS origins (e.g. preview deployment origins). |
| `OPENAI_API_KEY` | Optional | OpenAI API key for AI assistant features. |
| `OPENAI_MODEL` | Optional | Defaults in codebase to `gpt-4o-mini`. |

*Note: Never set `SEED_ADMIN_EMAIL` or `SEED_ADMIN_PASSWORD` in production.*

### Frontend (Vercel Project)

| Variable Name | Required | Description / Value Guidance |
|---|---|---|
| `RENDER_API_URL` | Yes | The exact HTTPS URL of the Render backend (e.g., `https://youthcare-api.onrender.com`), without `/api` or trailing slashes. |
| `VITE_API_URL` | No | Keep unset so the frontend defaults to `/api` relative requests via the Vercel reverse proxy. |

---

## 4. Provider Configuration Details

### Render Free Web Service Setup

1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service** (or use Blueprint with `render.yaml`).
3. Select your GitHub repository: `Tanyachiripah/youth_care`.
4. Fill in service details:
   - **Name:** `youthcare-api`
   - **Region:** Frankfurt (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank for repository root)*
   - **Runtime:** `Node`
   - **Build Command:** `npm ci --include=dev && npm run build -w server`
   - **Start Command:** `npm run start -w server`
   - **Instance Type:** **Free ($0/month)** *(Crucial: Ensure Free is selected; do not use the $7/mo default)*
5. Under **Advanced**, add **Health Check Path**: `/api/health`.
6. Add the environment variables listed in Section 3 above. Enter your secret `MONGODB_URI` directly in the Render dashboard field.
7. Click **Create Web Service**.

### Vercel Frontend Setup

1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select `Tanyachiripah/youth_care`.
4. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client` (click Edit and select `client`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In **Environment Variables**:
   - Key: `RENDER_API_URL`
   - Value: `https://<your-render-service-name>.onrender.com`
6. Click **Deploy**.

---

## 5. Redeployment Instructions

- **Automatic Deployments:** Pushing commits to `main` triggers automatic builds on both Render and Vercel.
- **Manual Redeployment:**
  - On Render: Navigate to the `youthcare-api` service and click **Manual Deploy** -> **Deploy latest commit** (or **Clear build cache & deploy**).
  - On Vercel: Navigate to the `youthcare` project -> **Deployments** -> select latest deployment -> **Redeploy**.

---

## 6. Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| `/api/health` returns 503 | MongoDB not connected | Check `MONGODB_URI` credentials in Render environment variables; verify user exists and password has no unencoded special characters. |
| CORS error / 403 `ORIGIN_NOT_ALLOWED` | `CLIENT_URL` mismatch | Ensure `CLIENT_URL` in Render exactly matches the frontend origin (`https://<project>.vercel.app`) with no trailing slash. |
| User logged out on refresh | Cookie blocked or SameSite failure | Confirm frontend makes requests to relative `/api` (proxied by Vercel) and not directly to `onrender.com`. |
| Render instance spin-down delay | Free tier cold starts | Render Free instances sleep after 15 minutes of inactivity. Initial request takes 30-50 seconds to boot. |
