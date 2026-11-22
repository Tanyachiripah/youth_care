# AI Behaviour and Safety

## Intended responsibilities

The companion may provide general educational information, empathetic reflection, low-risk coping suggestions, and signposting to resources already present on the platform. It should not diagnose, prescribe, claim confidentiality, invent services, or imply that a person has been notified.

## Current implementation

- `/api/ai/chat` requires authentication and is rate limited.
- Messages are limited to 2,000 characters.
- A phrase-based crisis check returns a conservative immediate-safety signpost.
- If `OPENAI_API_KEY` is absent, the API returns a clearly labelled demo response.
- When configured, the server sends the message to OpenAI with a system instruction defining the assistant's limits.
- The API does not store transcripts.

## Important limitations

Phrase matching can miss risk, misunderstand context, or produce false positives. A model instruction is not a safety guarantee. There is no professional moderation, clinically validated screening, human escalation, or monitoring service. Do not describe this feature as therapy, crisis intervention, or a substitute for human help.

## Safe operating requirements

- For statements suggesting immediate danger, prioritize urgent human support and a trusted person; do not rely on an ordinary AI response.
- Never invent emergency numbers, providers, availability, referrals, or successful outcomes. Only use independently verified sources.
- Do not request identifying information or encourage users to share it.
- Keep sensitive conversation content out of logs, analytics, and persistent storage unless a reviewed purpose and retention policy are established.
- Review prompts, model behavior, moderation, escalation procedures, and provider terms with qualified safeguarding and clinical professionals before launch.
- Test safety behavior across direct, indirect, ambiguous, and multilingual expressions relevant to intended users; this testing does not make the feature a clinical risk assessment.

## Human escalation

The demonstration has no monitored human escalation service. Do not promise follow-up, monitoring, notification, or response. A real escalation pathway requires a staffed team, local protocols, contact verification, operational hours, privacy notice, and testing before it can be represented in the product.
