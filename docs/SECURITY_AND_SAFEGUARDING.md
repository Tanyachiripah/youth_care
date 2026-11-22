# Security and Safeguarding

YouthCare handles account credentials and may receive sensitive referral information. Safeguarding and privacy controls are release requirements, not assurances supplied by this demonstration.

## Implemented controls

- bcryptjs password hashing; registration assigns the `user` role.
- MongoDB-backed server-side sessions; HTTP-only, SameSite=Lax cookies, and `secure` cookies in production.
- Helmet headers, a JSON request-size limit, Zod request validation, and rate limiting on the AI endpoint.
- Server-side `requireAuth` and `requireAdmin` checks.
- Referral endpoints require explicit consent, target verified organisations, and restrict history to the signed-in user.
- AI transcripts are not persisted by the API; provider credentials are server-side.
- `.env` files are ignored by Git; `.env.example` contains placeholders only.

## Required before real users

- Add and test CSRF/origin protection appropriate to the deployment.
- Rate-limit and monitor login and registration; add account recovery and email verification.
- Define session rotation, revocation, secure deployment, secret rotation, backup and restore, incident response, and least-privilege database access.
- Establish retention, deletion, user access, and consent withdrawal procedures for referral data.
- Review admin provisioning and audit-log coverage; the current admin UI and management workflows are incomplete.
- Conduct independent security, privacy, and accessibility reviews. Do not claim legal or regulatory certification without evidence.

## Referrals and privacy

Collect only what is needed for a referral. Explain who will receive it and why before collecting consent. The current API records consent and the submitted reason but does not implement a provider integration or a complete consent lifecycle. Do not send information to a real organisation until the sharing flow, provider, retention, and safeguards are verified.

## AI and crisis safety

The AI is not a therapist, cannot diagnose, and cannot contact emergency services. The current keyword check is not reliable risk detection. The application has no staffed or monitored escalation team. Any immediate-danger guidance must point users to urgent human support without implying that YouthCare has notified anyone.

## Minors

The initial age range, consent model, reporting duties, safeguarding procedures, and suitability of the platform for minors require research and consultation with qualified local professionals. Do not launch to minors until these have been defined, reviewed, and operationally supported.
