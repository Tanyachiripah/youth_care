# API Contract

All endpoints are prefixed with `/api`. JSON is used for request and response bodies. Session cookies authenticate protected routes.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Create user |
| POST | `/auth/login` | No | Start session |
| POST | `/auth/logout` | Yes | End session |
| GET | `/auth/me` | Yes | Current user |
| GET | `/organisations` | No | Verified organisations |
| GET | `/organisations?includeDemo=true` | No | Verified + demo listings |
| GET | `/resources` | No | Published resources |
| GET | `/opportunities` | No | Published opportunities |
| POST | `/referrals` | Yes | Consent-based referral request |
| GET | `/referrals/mine` | Yes | Current user's requests |
| POST | `/ai/chat` | Yes + rate limit | AI support response |
| GET | `/admin/overview` | Admin | Aggregate counts |
| POST | `/admin/organisations` | Admin | Create listing |
| PATCH | `/admin/organisations/:id` | Admin | Update status/description |
| POST | `/admin/resources` | Admin | Create resource |
| POST | `/admin/opportunities` | Admin | Create opportunity |

Errors use `{ "error": "Readable explanation" }`. Successful auth returns a minimal user object, never a password hash.
