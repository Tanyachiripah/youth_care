# YouthCare Product Requirements

## Product purpose and principles

YouthCare helps young people in Zimbabwe discover wellbeing information, practical guidance, verified providers, referrals, and education or employment opportunities. The platform is an information and connection service, not a clinical or emergency service.

- Use empathetic, non-judgmental language without claiming clinical care.
- Make AI limits visible and keep human support central.
- Verify organisations before presenting them as verified.
- Require informed consent before collecting referral details for sharing.
- Minimise sensitive data and make status/availability claims only when verified.
- Design for accessibility and low-friction mobile use.

## Product modules and user stories

### 1. Registration and authentication

**Story:** As a young person, I can create an account, sign in/out, and access a private dashboard.

**Requirements:** validate credentials, hash passwords, maintain a secure server-side session, protect private endpoints, and assign public registrations the user role. Profile editing and account recovery are future work.

**Acceptance:** registration creates a normal user; invalid credentials are rejected; logout ends the session; unauthenticated requests cannot access private routes; clients cannot grant themselves admin access.

### 2. AI Support Companion

**Story:** As a user, I can ask for general information and possible next steps in a respectful conversation.

**Requirements:** provide a clear non-clinical disclaimer; avoid diagnosis and invented services; provide a conservative immediate-safety signpost for crisis indicators; keep transcripts out of server storage; rate-limit requests. Human escalation and robust safety screening require additional work.

**Acceptance:** endpoint requires authentication, validates bounded messages, enforces a rate limit, returns a labelled fallback when unconfigured, and never claims that a person was notified.

### 3. Youth Organisation Directory

**Story:** As a visitor, I can find services by organisation, location, and service description.

**Requirements:** listings include accurate name, description, services, location, contacts, eligibility, referral procedure, and verification state; only directly verified providers appear in the default public results.

**Acceptance:** default endpoint excludes pending/demo/suspended records; search results match displayed verified records; named potential partners are not represented as confirmed or verified without evidence.

### 4. Counselling and Referral System

**Story:** As a signed-in user, I can request help from a verified provider after understanding and consenting to the information shared.

**Requirements:** disclose recipient and purpose, require explicit consent, minimize fields, restrict request history to its owner, and provide understandable status. Admin status management and provider handoff are future work.

**Acceptance:** unauthenticated, non-consensual, or unverified-provider requests are rejected; users cannot read another user's request; a request is not described as an appointment or completed referral.

### 5. Mental Health Education

**Story:** As a visitor, I can read accessible wellbeing information and know it is educational.

**Requirements:** support topics such as stress, anxiety, depression, coping, substance-use awareness, and seeking professional help; label content as education, not diagnosis/treatment; require review before publication.

**Acceptance:** only published content is public; every health-related item is clearly labelled and reviewed through an editorial process before production.

### 6. Career and Employment Guidance

**Story:** As a young person, I can find career, skills, training, education, and employment information.

**Requirements:** show accurate provider, eligibility, location, and application details when known; label missing or unverified information rather than inventing it.

**Acceptance:** public listing shows only published opportunities; external links are present only when supplied and verified.

### 7. Well-being Dashboard

**Story:** As a user, I can optionally organize my goals, check-ins, saved resources, and referrals privately.

**Requirements:** participation is optional; sensitive information is private, access-controlled, and covered by retention/deletion rules.

**Acceptance:** no sensitive dashboard data is public or accessible to another user. Mood check-ins, goals, saved resources, and activity summaries are not implemented in the current MVP.

### 8. Youth Opportunities Hub

**Story:** As a young person, I can discover workshops, mentorship, entrepreneurship, education, and empowerment programmes.

**Requirements:** support eligibility and application information and make listing freshness/verification clear.

**Acceptance:** only published opportunities are shown and expired/unverified items are not represented as currently available. The current implementation is a basic opportunities list, not a complete hub.

### 9. Administration Dashboard

**Story:** As an authorized administrator, I can maintain listings and review platform operations.

**Requirements:** server-side role checks; controlled account/role management; organisation verification; content and opportunity management; referral review; auditability.

**Acceptance:** all admin endpoints reject ordinary users; verification is an explicit action based on evidence; sensitive referral access is limited and auditable. Current admin capabilities are partial.

## Non-functional requirements

- Responsive layouts for 320px, 375px, 768px, 1024px, and 1440px+.
- Semantic controls, keyboard access, labels, screen-reader support, and accessible contrast.
- Safe session and credential handling, input validation, rate limiting, and clear non-sensitive errors.
- Data minimisation, explicit consent, and documented retention/deletion.
- Buildable client and server, with repeatable seed behavior and automated tests for access-control boundaries.

## Demonstration scope exclusions

The current demonstration does not offer diagnosis, treatment, clinical triage, monitored emergency response, verified real-world partner availability, automated referral delivery, email verification/recovery, a full profile, mood tracking, complete admin workflows, or a native mobile app.
