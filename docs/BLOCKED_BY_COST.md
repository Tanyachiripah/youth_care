# Blocked by Cost and Free-Tier Limits

No paid plan, trial, domain, or service was activated. Provider information was checked on 2026-11-22.

## Render

- The workspace is on Hobby and has no card on file. Usage counters were still loading, so remaining quota is unknown.
- Free web services sleep after 15 minutes without inbound traffic and may take about a minute to wake. They have monthly usage caps; with no card, exceeding included usage suspends services instead of billing. Render explicitly says Free instances are not for production applications.
- Render may suspend a Free web service that initiates unusually high public-internet traffic, including external database access.
- Render documents shared, region-specific outbound CIDR ranges. The exact ranges must be read from a YouthCare service's Connect > Outbound page after choosing its region. Dedicated outbound IPs are paid (public pricing currently lists $100/month per IP set) and are excluded.

## MongoDB Atlas

- Atlas currently allows `0.0.0.0/0`, which remains a security blocker pending verified Render egress CIDRs. The existing admin account is unchanged. App user `user` now has SCRAM `readWrite` scoped to `youthcare`; its credential has not been configured in Render.
## Vercel

- Vercel's signed-in account projects page is accessible and shows no YouthCare project. The dashboard offers an import suggestion. The current account plan cannot be confirmed from the visible project list. Public pricing lists Hobby at $0/month, and external rewrites are included.
- A same-origin external rewrite to Render is configured locally and costs no domain fee. It is not deployed; cookie forwarding and API cache behavior still require preview verification.

## Outcome

Free-tier deployment may be possible as a demonstration, but the inspected Render Free limitations and lack of Atlas backups prevent a production-reliability claim. No Atlas upgrade price is stated because no paid tier was selected or quoted in the dashboard.