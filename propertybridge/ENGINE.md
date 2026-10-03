# PROPERTYBridge Public Data Engine

This engine automates permitted public-data research while keeping source facts separate from estimates and transaction due diligence.

## Live lanes
- HUD FHA REO ArcGIS layer: nationwide government REO discovery.
- City of Chicago Building Violations: historical/informational address enrichment.
- City of Chicago Building Permits: address enrichment for permit-history research.

## Deliberate limits
- No CAPTCHA bypassing, credential bypassing, anti-bot evasion or paywall circumvention.
- Zillow, Homes.com and similar listing portals remain source links/manual-review inputs unless an authorized or licensed feed is connected.
- Automated feed records do not prove asking price, mortgage balance, interest rate, assumability, clear title, legal unit count, repair scope, ARV or profitability.

## Refresh
GitHub Actions runs the public-data refresh daily and supports manual dispatch. The generated artifact is `propertybridge/data/auto-feed.json`.

## Next production layer
Move private CRM records and authenticated users to an owner-controlled backend, then add licensed listing/property data and server-side deduplication.
