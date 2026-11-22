# Database Design

MongoDB collections use Mongoose schemas in `server/src/models/index.ts`. Fields below describe the current model, not an approved production retention policy.

## Collections

### users
- name
- email (unique, lowercase)
- passwordHash
- role (`user` or `admin`)
- createdAt

### organisations
- name
- description
- services
- location
- contactEmail
- website
- verificationStatus (`pending`, `verified`, `suspended`, `demo`)
- eligibility
- createdAt

### resources
- title
- category
- summary
- body
- published
- createdAt

### opportunities
- title
- provider
- category
- location
- description
- applicationUrl
- closingDate
- published

### referrals
- user (User reference)
- organisation (Organisation reference)
- reason
- consentToShare
- status (`received`, `reviewing`, `completed`, `closed`)
- createdAt

### auditlogs
- actor
- action
- targetType
- targetId
- createdAt

Audit-log records are defined, but current route coverage is limited to organisation and content creation/update actions.

Session documents are managed by connect-mongo in the `sessions` collection.

## Data minimisation

The MVP does not persist AI chat transcripts. Referral reason text is sensitive and should be retained only under a defined policy. Avoid adding sensitive profile fields without a documented purpose and privacy review.

## Validation and indexes

Mongoose schemas define required fields, enums, defaults, and selected length constraints. API inputs are validated with Zod before writes. `users.email` is unique and normalized to lowercase, which creates the model's unique index. No other explicit query indexes are currently declared; review indexes against measured query patterns before production.

## Relationships and access

- `referrals.user` references a user and `referrals.organisation` references an organisation.
- Referral history queries filter on the authenticated user's ID.
- MongoDB-backed session documents are managed by `connect-mongo`.
- The application has no separate encrypted field-level storage layer. Use TLS and managed database encryption controls, minimize sensitive content, and define retention/deletion before accepting real referrals.
