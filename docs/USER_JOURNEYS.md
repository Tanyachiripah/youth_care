# User Journeys

Journeys below describe the current demonstration and call out missing steps; they are not claims that a production service is available.

## Registration and sign-in

1. A visitor opens registration and submits a name, email, and password.
2. The API validates the input, hashes the password, creates a `user` account, and starts a server-side session.
3. The user reaches a basic dashboard and can sign out.

**Current limits:** no email verification, password recovery, profile editing, or registration/login rate limiting.

## AI support interaction

1. An authenticated user opens the companion and sees its non-clinical and emergency-service limits.
2. The user submits a message; the API limits message size and request frequency.
3. A narrow keyword check returns an immediate safety signpost for recognized crisis phrases. Otherwise, a configured OpenAI service generates an informational response; without a key, a labelled fallback is returned.
4. The conversation remains in browser state and is not stored by the API.

**Current limits:** keyword detection is incomplete, no professional moderation or human escalation is integrated, and AI responses are not clinically validated.

## Finding an organisation

1. A visitor opens the directory and searches loaded results by name, service text, or location.
2. The API returns verified listings only by default.
3. A signed-in user can continue to the referral form.

**Current limits:** search is client-side and only searches returned records. The seed contains demo entries, which are excluded from the default directory. Do not mark an organisation verified without direct verification.

## Requesting a referral

1. A signed-in user selects a verified organisation and enters a short reason.
2. The form explains that the details entered will be shared for the referral and requires an explicit consent checkbox.
3. The API rechecks authentication, consent, and provider verification before recording the request.
4. The user can view their own requests and their stored status.

**Current limits:** there is no provider handoff, status-management workflow, or follow-up messaging; status values do not imply that a provider received or acted on a request.

## Accessing educational content

1. A visitor opens the resources page.
2. Published resources are displayed with category, summary, and expandable body text.

**Current limits:** there is no dedicated editorial review or content-source workflow in the application. Material should be professionally reviewed before public use and clearly identified as educational rather than diagnosis or treatment.

## Finding opportunities

1. A visitor opens the opportunities page.
2. Published opportunities show their provider, category, location, and description.
3. An application link is shown only when one is stored.

**Current limits:** listing freshness and provider legitimacy are not independently validated by the software.

## Administrator workflow

1. An administrator account is provisioned out-of-band through the seed configuration.
2. The admin page shows aggregate counts and can submit a new organisation listing.
3. Server-side middleware protects admin API endpoints; newly created organisations default to pending unless explicitly changed.

**Current limits:** user/role management, referral review/status updates, editing/removal for all content, and a complete admin UI are not implemented. Do not give admin credentials to ordinary users.
