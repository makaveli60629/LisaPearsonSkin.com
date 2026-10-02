# LPS Project Studio — Master Project Manifest
Updated: 2026-09-30

## Purpose
LPS Project Studio is the umbrella presentation and project-management hub for the active portfolio. Each project keeps its own identity, files, roadmap and eventual infrastructure while remaining discoverable from one professional project profile.

## Management order
1. LPS Project Studio presentation and portfolio quality.
2. PROPERTYBridge Network MVP, real-estate workflow and future live data.
3. SVR Poker VR stability and gameplay presentation.
4. Thy Kingdom Come public identity, governance and program materials.
5. Custom-page capability and future projects.

## Portfolio

### LPS Project Studio / Lisa Pearson Skin
- Hub: https://lisapearsonskin.com/
- Studio archive: https://lisapearsonskin.com/studio/
- Brief: https://lisapearsonskin.com/projects/lisa/
- Role: umbrella project profile, portfolio, presentation layer, custom-page showcase.
- Current priority: preserve the approved One Vision / Multiple Projects master presentation, mobile parity, and clean project navigation.

### PROPERTYBridge Network
- Working MVP: https://lisapearsonskin.com/propertybridge/
- Brief: https://lisapearsonskin.com/projects/propertybridge/
- Partner preview: https://lisapearsonskin.com/propertybridge/partner/
- Role: seller/buyer/investor CRM, Property DNA, deal scoring, financing-path logic and property matching.
- Current priority: MVP acquisition workflow is active; next focus is shared database/authentication, live property data, public-record layers, and automated Property DNA.
- Rule: material property, loan, title, tax, zoning and financing facts must be verified before use in a transaction.

### SVR Poker
- Main site: https://svrpoker.com/
- Brief: https://lisapearsonskin.com/projects/svr/
- Role: browser, WebXR, Meta Quest and mobile poker platform.
- Current priority: VR scene readability, lighting, stable table/dealer experience, watch/hand presentation, performance and non-regression.
- Rule: preserve known-good baselines while improving the VR runtime.

### Thy Kingdom Come
- Project site: https://lisapearsonskin.com/kingdom/
- Blueprint: https://lisapearsonskin.com/projects/kingdom/
- Original logo asset: `/assets/thy-kingdom-come-logo.webp`
- Dedicated manifest: `/projects/kingdom/MANIFEST.md`
- Primary ministry: **Thy Kingdom Come Community Church** — planned non-denominational church for worship, prayer, spiritual care, fellowship and volunteer service.
- Separate service nonprofit: **Kingdom Community Restoration Foundation** — planned charitable organization for grants, community programs, partnerships and measurable service outcomes.
- Future program identity: **The Keeper's House Chicago** — planned supportive-housing / restart program.
- Future campus concept: a phased rural community-service campus that may include a chapel, community center, caretaker housing, legally approved RV sites, laundry/showers, gardens/hydroponics, food access and workforce activity.
- Core population: people rebuilding after homelessness, rehabilitation, illness, family disruption, financial hardship or other major life transitions.
- Structural rule: church funds, service-nonprofit funds, family/private trust assets and commercial operating revenue remain separately governed, banked, booked and documented.
- Formation sequence: mission/board/bylaws → state/entity filings → EINs → separate banking/accounting → tax/charitable compliance → public fundraising readiness → pilot programs → property/campus due diligence → phased expansion.
- Funding architecture: church giving and donors; foundation/community grants; eligible USDA Community Facilities resources; eligible FSA/NRCS agriculture/conservation support; CDFI/community-lender financing; qualifying commercial financing for revenue operations; local government, hospital, workforce, housing and service partnerships.
- Property rule: no acquisition is treated as approved or a good deal until zoning, RV/multiple-unit rules, title/liens, utilities, septic/water, access, environmental/flood issues, construction cost, financing, cash flow, exit strategy and downside risk are verified.
- Current priority: governance, formation readiness, grant-ready documentation, public mission presentation, funding calendar and program architecture.
- Status rule: do not imply active federal tax-exempt recognition, charitable registration, grants, housing licenses, zoning approvals, treatment services, public funding or campus operations before they are formally established and verified.

## Shared presentation standards
- Clear logo and project name above the fold.
- Consistent button language: Project Brief / Open Project / Working Preview.
- Mobile-first layout.
- Status label on each project: LIVE, MVP, ACTIVE BUILD, PLANNING.
- No fake activity counters or invented customer claims on public pages.
- Demo or estimated data must be labeled.
- Preserve old working versions before major replacements.
- Each project keeps a briefing page, a working/main page and a written manifest.

## Infrastructure policy
- GitHub Pages is acceptable for presentation and static prototypes.
- Browser localStorage is acceptable for demonstration data only.
- Private multi-user records require authentication and a shared secured database.
- Production systems can later move to AWS, PostgreSQL, Supabase or VPS infrastructure based on cost and workload.
- Do not expose secrets, API keys or private customer data in a public repository.

## Current next actions
- Keep the approved One Vision / Multiple Projects presentation as the LPS visual baseline.
- Finish mobile parity and preserve the master artwork as the presentation reference.
- Move PROPERTYBridge from browser-only MVP to shared secured data and live property sources.
- Continue SVR Poker VR with non-destructive visual/runtime improvements only.
- Continue Thy Kingdom Come formation work: governance package, state-selection research, EIN/banking sequence, grant calendar, donor/partner materials and land/campus due diligence framework.


## September 30 refinement — current scope
- User instruction: SVR Poker is excluded. No SVR repository, game, project page or shared SVR stylesheet is changed.
- LPS home and /launch/ use matching responsive navy/gold layouts with new conceptual brand artwork at assets/one-vision-banner-v2.webp. The old reference asset is corrupt; the printed reference has not been recovered, so exact visual parity is unverified.
- Fixed church destination to /kingdom/; project cards link to distinct briefs; custom services offers a downloadable project brief.
- PROPERTYBridge retains demo examples as explicitly fictional. Manual leads support source ad URLs and exact-property photo URLs or local image uploads, with linked photos, fallback display, safe text rendering, saved-example filter and JSON backup restoration. No verified listing feed has been connected, and no real ads/photos have been supplied.
- /account/ contains login, registration and recovery flows. They remain disabled until an owner-controlled Supabase Auth service is configured; see account/SETUP.md. No production accounts, shared database or private cloud record storage is claimed.
- Concept banner prompt: premium panoramic blue-hour Midwestern waterfront transitioning to chapel/gardens, navy and antique gold, calm central space, no text or logos. Generated with the built-in image tool; this is branding only, never a property listing image.


## September 30 — Thy Kingdom Come expansion
- Restored the original Thy Kingdom Come Community Church angel-wing/sword/chapel logo as a web asset and used it throughout the project.
- Expanded /kingdom/ into a full public-facing mission site with ministry, restoration, community, stewardship, organization design, future programs, startup roadmap, funding architecture and status disclosures.
- Expanded /projects/kingdom/ into a detailed project blueprint covering entity separation, formation, banking, charitable compliance, grant readiness, property due diligence, program families and funding logic.
- Replaced the generic church icon on the LPS portfolio with the original church logo.
- Corrected Thy Kingdom Come navigation to return to the public LPS root instead of treating /launch/ as a separate public destination.
- The church/nonprofit plan remains planning-stage; public pages intentionally avoid claims that filings, exemptions, grants, licenses, housing programs or development approvals are already active.

## October 2, 2026 — Professional completion status

### Production deployment
- GitHub Pages production deployment is automatic on every push to `main`.
- Production deploy now has a required validation stage before release.
- The validator checks required public entry points, sitemap XML, robots sitemap declaration, public-page titles/descriptions/canonicals, accidental public `noindex`, and broken local references.
- Deployment is blocked if validation fails.
- Superseded runs may be cancelled automatically by concurrency control; the newest validated commit is the production candidate.

### Current product status
- **LPS Project Studio home:** redesigned and deployed; responsive project portfolio, services hierarchy, SEO foundation and public navigation are in place.
- **Custom Websites / LPS Services:** major redesign complete; visual device mockups, starter systems, add-on modules, storefront presentation, interactive build planner and project-brief workflow are live.
- **Template Studio:** public catalog foundation exists; next production pass is visual previews, useful category/filter behavior, more complete starter systems and stronger conversion paths.
- **LPS Marketplace:** storefront foundation exists; next production pass is collection population, approved affiliate-link architecture, product disclosure handling and stronger browsing/filtering.
- **Brand & Launch Studio:** service page and offer structure exist; next production pass is richer portfolio examples, package presentation and project intake handoff.
- **PROPERTYBridge:** functional browser-based MVP exists with Property Watch, deal board, analyzer, CRM, financing paths, source URLs, exact-property photos/uploads and JSON backup/restore. It is not yet a production multi-user application. Production completion requires shared authentication/database, licensed/live property data, public-record integrations, server-side storage and stronger compliance controls.
- **Thy Kingdom Come:** public mission site and project blueprint are built and search-ready. Formation, grants, land acquisition and program operations remain planning-stage and must not be presented as completed approvals.
- **Member Access:** interface exists but production account functionality remains dependent on an owner-controlled authentication/backend service.
- **SVR Poker:** remains a separate project and is not modified by LPS site completion work unless specifically authorized.

### Professional completion gates
1. Finish Template Studio presentation and starter catalog.
2. Finish Marketplace browsing and approved affiliate/product architecture.
3. Finish Brand & Launch portfolio/package presentation.
4. Productionize PROPERTYBridge backend, authentication and data-source layer.
5. Connect production forms/intake to an owner-controlled destination.
6. Run mobile QA, accessibility checks, metadata/schema review and broken-link validation across every public page.
7. Connect Search Console/analytics and monitor real indexing/performance after launch.

## October 2, 2026 — Studio completion update

### Completed production passes
- **Template Studio:** upgraded to a searchable/filterable visual catalog with six starter systems, visual previews, modal detail views, feature badges and direct customization/build-planner paths.
- **LPS Marketplace:** upgraded to a professional curated-storefront experience with featured collection ads, category filtering, campaign presentation, partner-ready architecture and explicit separation between storefront design and approved merchant product data.
- **Brand & Launch Studio:** upgraded with portfolio examples, scoped package structures, interactive launch planner, coordinated creative capabilities and a clearer brand-to-launch workflow.
- All three latest production passes completed the automated validation stage and deployed successfully through the GitHub Pages production workflow.

### Remaining high-priority production work
1. PROPERTYBridge shared backend/authentication and real data-source integration.
2. Owner-controlled production form/intake destination.
3. Member Access backend activation.
4. Cross-site accessibility/mobile regression QA and final schema/metadata review.
5. Search Console / analytics connection and post-launch indexing monitoring.

