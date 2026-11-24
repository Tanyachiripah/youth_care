# Free-Tier Limitations

Verified or documented limitations for the no-cost deployment target. No paid services, trials, or billing methods were activated.

## Render Hobby / Free Compute

- The inspected Render workspace is on Hobby and has no card on file. Current usage counters did not finish loading.
- Render Free web services sleep after 15 minutes without inbound traffic and can take about a minute to wake.
- Free compute has monthly instance-hour, bandwidth, and build-minute limits. Without a payment method, usage beyond the included limits results in service suspension or disabled builds rather than charges.
- Render says Free instances are intended for testing, hobby projects, and previews, not production applications. It may also suspend a Free service with unusually high outbound traffic, including database traffic.
- Regional outbound CIDRs are shared and documented by Render. Exact ranges must be verified for the created service and region in Connect > Outbound. Dedicated outbound IPs are paid and excluded.

## MongoDB Atlas Free

- The existing `Cluster0` is Free. The backup page offered upgrade actions; no backup configuration was visible.
- The current Atlas UI did not expose a configured backup/retention plan for this Free cluster. Production restore assurance is therefore not verified.
- Atlas currently allows `0.0.0.0/0`, which remains a security blocker pending verified Render egress CIDRs. The existing admin account is unchanged; app user `user` is scoped to SCRAM `readWrite` on `youthcare`. Its credential has not been configured in Render.

## Vercel Hobby

- Vercel publicly lists Hobby at $0/month and includes rewrites. The current account plan is not verified; the dashboard offers to import the repository, and no YouthCare project is listed.
- A same-origin external rewrite to Render is configured locally and avoids requiring a purchased domain. It must be verified in a preview, particularly cookie forwarding and API caching.

See [BLOCKED_BY_COST.md](BLOCKED_BY_COST.md) for the current assessed blockers and [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for the evidence snapshot.